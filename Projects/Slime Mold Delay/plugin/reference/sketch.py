"""sketch.py — Slime Mold Delay as a plugin: the numpy sketch the C++ is checked against.

The dish. A round agar with one listener near the middle and five oat flakes. Each flake
is a band of the incoming sound (lows to highs), so the music itself decides which food is
sounding. The mold starts by covering the agar as a mesh, then its flow law carves the
mesh down to the roads that carry what is playing (the flow dish's 'compete' law, cycle 11:
thickness grows as flow^gamma, the flakes take turns pushing, the listener drains half).
Tips go out to find food the roads don't reach yet, and the length budget refuses roads
the dish can't afford.

The sound. Every tube is a delay line both ways: its length over the streaming speed is
the echo time, its thickness sets how much passes. Where tubes meet, the sound is summed
and softly saturated (tanh), then sent on down every other tube. Tubes that reach the
listener are panned by where they came from. So each band of your sound reaches the
listener along roads the mold grew for it, and the roads change as the music moves.

Contract with verify.py: render(v, sr, inputs) -> dict(out=(2, steps), probes={...}).
The dish ticks 30 times a second of dish time (Clock scales it); everything it decides
depends only on the input's band levels and the knobs, never on the network's own sound,
so the sketch and the plugin grow the same dish.

Ported from slime-mold-flow-dish.html (SlimeEngine, the 'compete' law), with these plugin
changes: nodes and tubes live in fixed slots, iterated in slot order; flakes are bands of
the input and never move; the per-tube self-feedback loop is gone (sound recirculates
along each tube's two directions instead); a tube's delay is read from its source node's
history, so tubes leaving one node share one buffer.
"""
import math

import numpy as np

# -- the flow law (slime-mold-flow-dish.html, P) -------------------------------------
TICK_HZ = 30.0
K, MU, TAU, RETRACT = 2.2, 1.0, 18, 9
PROBE_RATE, PROBE_MAX, PROBE_LIFE, PROBE_STEP, R_CAP = 1.2, 3, 30, 0.024, 0.06
D0, MID, SATED = 0.18, 0.6, 0.12
MESH_S, MESH_D, POW_G, MESH_GRACE, MESH_ANNEAL = 0.11, 0.3, 1.5, 6, 8
QEPS, LISTEN, PULSE_FLOOR, EAR = 0.015, 0.5, 0.25, 0.02
G_FWD, G_BACK = 0.95, 0.3
SINK_X, SINK_Y = 0.52, 0.46

# -- the plugin's sizes ---------------------------------------------------------------
NMAX, TMAX = 80, 288
HISTBITS = 17
HIST = 1 << HISTBITS
MASK = HIST - 1
NBANDS = 5
BAND_HZ = (120.0, 300.0, 750.0, 1900.0, 4700.0)
BAND_Q = 1.2
FADE_TICKS = 12                  # a cut tube fades for 0.4 s before its slot is free
GROUP = 4                        # tubes per probe group; one group every 128 samples
NGROUPS = TMAX // GROUP
WET_GAIN = 3.0

SINK, FOOD, BRANCH = 0, 1, 2
FREE, LIVE, FADING = 0, 1, 2

PARAM_IDS = ["feed", "flow", "clock", "budget", "dish", "cover", "regen", "dry", "wet"]
PROBES = ([f"lv{k}" for k in range(NBANDS)] + [f"tip{i}{c}" for i in range(PROBE_MAX) for c in "xy"]
          + ["tubes", "used", "group"]
          + [f"g{j}{f}" for j in range(GROUP) for f in ("ax", "ay", "bx", "by", "d", "q")])

FIVE = [(0.10, 0.30), (0.18, 0.76), (0.86, 0.22), (0.92, 0.66), (0.55, 0.90)]

M32 = 0xFFFFFFFF


def imul(a, b):
    return (a * b) & M32


class Rng:
    """mulberry32, as the flow dish uses it."""
    def __init__(self, seed):
        self.s = seed & M32

    def __call__(self):
        self.s = (self.s + 0x6D2B79F5) & M32
        s = self.s
        t = imul(s ^ (s >> 15), 1 | s)
        t = ((t + imul(t ^ (t >> 7), 61 | t)) & M32) ^ t
        return ((t ^ (t >> 14)) & M32) / 4294967296.0

    def normal(self):
        u = self()
        v = self()
        return math.sqrt(-2.0 * math.log(1.0 - u)) * math.cos(2.0 * math.pi * v)


def dist(ax, ay, bx, by):
    dx = ax - bx
    dy = ay - by
    return math.sqrt(dx * dx + dy * dy)


def sgn(x):
    return 1.0 if x > 0 else (-1.0 if x < 0 else 0.0)


class Dish:
    def __init__(self, sr):
        self.sr = sr
        self.hist = np.zeros((NMAX, HIST), dtype=np.float32)
        self.layout = -1

    # ---- nodes and tubes ----------------------------------------------------------
    def clear(self, layout, now):
        self.layout = layout
        self.rng = Rng(11)
        self.nx = [0.0] * NMAX; self.ny = [0.0] * NMAX
        self.kind = [BRANCH] * NMAX; self.alive = [False] * NMAX; self.mesh = [False] * NMAX
        self.env = [0.0] * NMAX; self.fast = [0.0] * NMAX; self.band = [-1] * NMAX
        self.born = [0] * NMAX; self.panL = [0.0] * NMAX; self.panR = [0.0] * NMAX
        self.nhigh = 0
        self.ts = [FREE] * TMAX; self.ta = [0] * TMAX; self.tb = [0] * TMAX
        self.L = [1.0] * TMAX; self.D = [0.0] * TMAX; self.Q = [0.0] * TMAX; self.w = [1.0] * TMAX
        self.starve = [0] * TMAX; self.retract = [-1] * TMAX; self.grace = [-1] * TMAX
        self.serial = [0] * TMAX; self.fade = [0] * TMAX
        self.thigh = 0
        self.nserial = 0
        self.g = np.zeros(2 * TMAX); self.tg = np.zeros(2 * TMAX)
        self.tick = 0
        self.mesh_at = 0
        self.used = 0.0
        self.probes = []            # dicts: anchor (node or -1), tube, serial, f, ax, ay, px, py, dx, dy, age, passed
        self.counts = dict(captured=0, retracted=0, starved=0, refused=0, forks=0, meshed=0)
        self.now_born = now
        self.sink = self.add_node(SINK_X, SINK_Y, SINK)
        rng = self.rng
        if layout == 0:
            pts = [(0.5 + (x - 0.5) * 0.9, 0.5 + (y - 0.5) * 0.9) for x, y in FIVE]
        elif layout == 1:
            pts = [(0.5 + 0.36 * math.cos(-0.5 * math.pi + k * 2.0 * math.pi / NBANDS),
                    0.5 + 0.36 * math.sin(-0.5 * math.pi + k * 2.0 * math.pi / NBANDS)) for k in range(NBANDS)]
        else:
            pts = []
            while len(pts) < NBANDS:
                x = 0.12 + 0.76 * rng()
                y = 0.12 + 0.76 * rng()
                if dist(x, y, 0.5, 0.5) > 0.38 or dist(x, y, SINK_X, SINK_Y) < 0.15:
                    continue
                if any(dist(x, y, px, py) < 0.15 for px, py in pts):
                    continue
                pts.append((x, y))
        for k, (x, y) in enumerate(pts):
            n = self.add_node(x, y, FOOD)
            self.band[n] = k
        self.seed_mesh()

    def add_node(self, x, y, kind, mesh=False):
        for n in range(NMAX):
            if self.alive[n]:
                continue
            if any(self.ts[t] != FREE and (self.ta[t] == n or self.tb[t] == n) for t in range(self.thigh)):
                continue
            self.nx[n] = x; self.ny[n] = y; self.kind[n] = kind; self.alive[n] = True; self.mesh[n] = mesh
            self.env[n] = 0.0; self.fast[n] = 0.0; self.band[n] = -1
            self.born[n] = self.now_born
            u = 0.5 * x * math.pi            # the flow dish pans a road by where it came from: pan = 2x - 1
            self.panL[n] = math.cos(u); self.panR[n] = math.sin(u)
            if n + 1 > self.nhigh:
                self.nhigh = n + 1
            return n
        return -1

    def add_tube(self, a, b, D):
        for t in range(TMAX):
            if self.ts[t] != FREE:
                continue
            self.ts[t] = LIVE; self.ta[t] = a; self.tb[t] = b
            self.L[t] = dist(self.nx[a], self.ny[a], self.nx[b], self.ny[b])
            self.D[t] = D; self.Q[t] = 0.0; self.w[t] = 1.0
            self.starve[t] = 0; self.retract[t] = -1; self.grace[t] = -1
            self.nserial += 1; self.serial[t] = self.nserial; self.fade[t] = 0
            self.g[2 * t] = 0.0; self.g[2 * t + 1] = 0.0; self.tg[2 * t] = 0.0; self.tg[2 * t + 1] = 0.0
            if t + 1 > self.thigh:
                self.thigh = t + 1
            return t
        return -1

    def cut(self, t):
        self.ts[t] = FADING
        self.fade[t] = FADE_TICKS

    def has_tube(self, a, b):
        for t in range(self.thigh):
            if self.ts[t] == LIVE and ((self.ta[t] == a and self.tb[t] == b) or (self.ta[t] == b and self.tb[t] == a)):
                return True
        return False

    def free_tube_slots(self):
        return sum(1 for t in range(TMAX) if self.ts[t] == FREE)

    def split(self, t, f):
        """Cut a tube in two partway along. The halves keep its thickness, flow and
        direction, and their lengths add up to the old one."""
        if self.free_tube_slots() < 2:
            return -1
        a, b = self.ta[t], self.tb[t]
        m = self.add_node(self.nx[a] + (self.nx[b] - self.nx[a]) * f, self.ny[a] + (self.ny[b] - self.ny[a]) * f, BRANCH)
        if m < 0:
            return -1
        D, Q, w = self.D[t], self.Q[t], self.w[t]
        self.cut(t)
        for p, q in ((a, m), (m, b)):
            h = self.add_tube(p, q, D)
            self.Q[h] = Q; self.w[h] = w
        return m

    # ---- start dense, then thin ------------------------------------------------------
    def seed_mesh(self):
        live = [n for n in range(self.nhigh) if self.alive[n]]
        pts = []
        spacing = MESH_S
        dy = spacing * math.sqrt(3.0) / 2.0
        r = 0
        y = 0.5 - 0.44
        full = False
        while y <= 0.94 and not full:
            x = 0.06 + (spacing / 2.0 if r % 2 else 0.0)
            while x <= 0.94:
                if dist(x, y, 0.5, 0.5) <= 0.43 and not any(dist(self.nx[n], self.ny[n], x, y) < spacing * 0.45 for n in live):
                    p = self.add_node(x, y, BRANCH, mesh=True)
                    if p < 0:
                        full = True
                        break
                    pts.append(p)
                x += spacing
            r += 1
            y += dy
        allv = live + pts
        reach = spacing * 1.08
        for i, a in enumerate(allv):
            near = sorted(((dist(self.nx[a], self.ny[a], self.nx[b], self.ny[b]), j) for j, b in enumerate(allv) if j != i),
                          key=lambda e: e[0])
            ends = self.kind[a] == FOOD or self.kind[a] == SINK
            for k, (d, j) in enumerate(near):
                if not (d <= reach or (ends and k < 3)):
                    continue
                b = allv[j]
                if j > i or not self.mesh[b]:
                    if b != a and not self.has_tube(a, b):
                        t = self.add_tube(a, b, MESH_D)
                        if t >= 0:
                            self.grace[t] = self.tick + MESH_GRACE * int(TICK_HZ)
        self.used = sum(self.L[t] for t in range(self.thigh) if self.ts[t] == LIVE)
        self.counts["meshed"] += 1
        self.mesh_at = self.tick

    # ---- one tick of dish time (1/30 s) ----------------------------------------------
    def step(self, levels, hunger, budget):
        rng = self.rng
        N = self.nhigh
        decay = math.exp(-1.0 / (TICK_HZ * 1.5))
        fdecay = math.exp(-1.0 / (TICK_HZ * 0.25))
        for n in range(N):
            if self.alive[n] and self.kind[n] == FOOD:
                lv = levels[self.band[n]]
                self.env[n] = max(lv, self.env[n] * decay)
                self.fast[n] = max(lv, self.fast[n] * fdecay)

        # only food the network reaches can push; the listener drains exactly that
        comp = [False] * NMAX
        comp[self.sink] = True
        stack = [self.sink]
        while stack:
            u = stack.pop()
            for t in range(self.thigh):
                if self.ts[t] != LIVE:
                    continue
                if self.ta[t] == u and not comp[self.tb[t]]:
                    comp[self.tb[t]] = True; stack.append(self.tb[t])
                elif self.tb[t] == u and not comp[self.ta[t]]:
                    comp[self.ta[t]] = True; stack.append(self.ta[t])

        I = [0.0] * NMAX
        foods = [n for n in range(N) if self.alive[n] and self.kind[n] == FOOD]
        fed = [n for n in foods if comp[n]]
        tot = 0.0
        for n in foods:
            tot += PULSE_FLOOR * self.env[n] + self.fast[n]
        if tot > 1e-4:
            drain = 0.0
            for n in fed:
                v = PULSE_FLOOR * self.env[n] + self.fast[n]
                I[n] = v / tot
                drain += v / tot
            I[self.sink] = -drain * LISTEN
            ears = [n for n in fed if self.env[n] > EAR]
            if ears:
                for n in ears:
                    I[n] -= drain * (1.0 - LISTEN) / len(ears)
            else:
                I[self.sink] = -drain

        # pressure and flow: Kirchhoff on the live tubes
        ids = [n for n in range(N) if self.alive[n]]
        idx = [-1] * NMAX
        for i, n in enumerate(ids):
            idx[n] = i
        M = len(ids)
        A = [[0.0] * M for _ in range(M)]
        for i in range(M):
            A[i][i] = 1e-4
        for t in range(self.thigh):
            if self.ts[t] != LIVE:
                continue
            c = self.D[t] / self.L[t]
            a, b = idx[self.ta[t]], idx[self.tb[t]]
            A[a][a] += c; A[b][b] += c; A[a][b] -= c; A[b][a] -= c
        p = solve(A, [I[n] for n in ids])

        mu = MU * (1.6 - 0.6 * hunger)
        age = (self.tick - self.mesh_at) / (TICK_HZ * MESH_ANNEAL)
        gnow = 1.0 + (POW_G - 1.0) * min(1.0, age)
        for t in range(self.thigh):
            if self.ts[t] != LIVE:
                continue
            q = self.D[t] / self.L[t] * (p[idx[self.ta[t]]] - p[idx[self.tb[t]]])
            self.Q[t] = q
            if abs(q) > 1e-4:
                self.w[t] += max(-0.15, min(0.15, sgn(q) - self.w[t]))
            if self.retract[t] < 0:
                grow = math.pow(abs(q), gnow)
                self.D[t] = max(0.0, self.D[t] + K / TICK_HZ * (grow - mu * self.D[t]))
                idle = abs(q) < QEPS
                self.starve[t] = self.starve[t] + 1 if (idle and not (self.grace[t] > self.tick)) else 0
                if self.starve[t] >= TAU:
                    self.retract[t] = RETRACT
            elif self.retract[t] > 0:
                self.D[t] *= (self.retract[t] - 1) / self.retract[t]
                self.retract[t] -= 1
            else:
                self.cut(t)
                self.counts["retracted"] += 1
        on = [False] * NMAX
        on[self.sink] = True
        for t in range(self.thigh):
            if self.ts[t] == LIVE:
                on[self.ta[t]] = True; on[self.tb[t]] = True
        for n in range(N):                       # a branch point with no tubes left dissolves
            if self.alive[n] and self.kind[n] == BRANCH and not on[n]:
                self.alive[n] = False
        self.used = 0.0
        for t in range(self.thigh):
            if self.ts[t] == LIVE:
                self.used += self.L[t]

        # tip extension
        live = [n for n in range(N) if self.alive[n]]
        sounding = [n for n in live if self.kind[n] == FOOD and self.env[n] > 0.01]
        unmet = sum(1 for n in sounding if not comp[n]) / max(1, len(sounding))
        satiety = SATED + (1.0 - SATED) * unmet
        if len(self.probes) < PROBE_MAX and rng() < PROBE_RATE * hunger * satiety / TICK_HZ:
            thru = [0.0] * NMAX
            for t in range(self.thigh):
                if self.ts[t] == LIVE:
                    thru[self.ta[t]] += abs(self.Q[t]); thru[self.tb[t]] += abs(self.Q[t])
            cand = [n for n in range(N) if on[n] and self.alive[n]]
            wts = [thru[n] + 0.05 for n in cand]
            tw = 0.0
            for x in wts:
                tw += x
            r = rng() * tw
            k = 0
            while k < len(cand) - 1:
                r -= wts[k]
                if not r > 0:
                    break
                k += 1
            pr = dict(anchor=cand[k], tube=-1, serial=0, f=0.0, ax=self.nx[cand[k]], ay=self.ny[cand[k]], passed=[])
            busy = [t for t in range(self.thigh) if self.ts[t] == LIVE and self.retract[t] < 0]
            if busy and rng() < MID:
                bw = [(abs(self.Q[t]) + 0.05) * self.L[t] for t in busy]
                s = 0.0
                for x in bw:
                    s += x
                r2 = rng() * s
                j = 0
                while j < len(busy) - 1:
                    r2 -= bw[j]
                    if not r2 > 0:
                        break
                    j += 1
                t = busy[j]
                f = 0.15 + 0.7 * rng()
                a, b = self.ta[t], self.tb[t]
                pr = dict(anchor=-1, tube=t, serial=self.serial[t], f=f,
                          ax=self.nx[a] + (self.nx[b] - self.nx[a]) * f, ay=self.ny[a] + (self.ny[b] - self.ny[a]) * f,
                          passed=[a, b])
            ang = rng() * 2.0 * math.pi
            pr.update(px=pr["ax"], py=pr["ay"], dx=math.cos(ang), dy=math.sin(ang), age=0)
            self.probes.append(pr)
        keep = []
        for pr in self.probes:
            hungry = [n for n in live if self.kind[n] == FOOD and not on[n] and self.env[n] > 0.01]
            # a bud with no unfed food to chase still smells the fed food: a shorter second road
            if not hungry and pr["passed"]:
                hungry = [n for n in sounding if n not in pr["passed"]]
            if hungry:                                       # chemotaxis toward sounding food
                tg = hungry[0]
                for n in hungry[1:]:
                    if (dist(pr["px"], pr["py"], self.nx[n], self.ny[n]) / (0.2 + self.env[n] * 8.0)
                            < dist(pr["px"], pr["py"], self.nx[tg], self.ny[tg]) / (0.2 + self.env[tg] * 8.0)):
                        tg = n
                vx = self.nx[tg] - pr["px"]
                vy = self.ny[tg] - pr["py"]
                m = math.sqrt(vx * vx + vy * vy) + 1e-9
                pr["dx"] = 0.85 * pr["dx"] + 0.15 * vx / m
                pr["dy"] = 0.85 * pr["dy"] + 0.15 * vy / m
            pr["dx"] += 0.12 * rng.normal()
            pr["dy"] += 0.12 * rng.normal()
            m = math.sqrt(pr["dx"] * pr["dx"] + pr["dy"] * pr["dy"]) + 1e-9
            pr["dx"] /= m; pr["dy"] /= m
            pr["px"] += pr["dx"] * PROBE_STEP
            pr["py"] += pr["dy"] * PROBE_STEP
            rx = pr["px"] - 0.5
            ry = pr["py"] - 0.5
            rr = math.sqrt(rx * rx + ry * ry)
            if rr > 0.45:                                    # the dish is round: a tip meets the glass and turns back
                pr["px"] = 0.5 + rx / rr * 0.45
                pr["py"] = 0.5 + ry / rr * 0.45
                d = pr["dx"] * rx / rr + pr["dy"] * ry / rr
                pr["dx"] = pr["dx"] - 2.0 * d * rx / rr
                pr["dy"] = pr["dy"] - 2.0 * d * ry / rr
            pr["age"] += 1
            hit = -1
            for n in live:
                if n != pr["anchor"] and n not in pr["passed"] and dist(pr["px"], pr["py"], self.nx[n], self.ny[n]) < R_CAP:
                    hit = n
                    break
            if hit >= 0:
                anchor = pr["anchor"]
                if anchor < 0:                               # a bud found something: now cut the tube
                    t = pr["tube"]
                    if self.ts[t] != LIVE or self.serial[t] != pr["serial"] or self.retract[t] >= 0:
                        self.counts["starved"] += 1
                        continue
                    if self.used + dist(pr["ax"], pr["ay"], self.nx[hit], self.ny[hit]) <= budget:
                        m = self.split(t, pr["f"])
                        if m >= 0:
                            anchor = m
                            self.counts["forks"] += 1
                if anchor >= 0 and not self.alive[anchor]:   # its anchor dissolved while it was out
                    continue
                if anchor >= 0 and not self.has_tube(anchor, hit):
                    dd = dist(self.nx[anchor], self.ny[anchor], self.nx[hit], self.ny[hit])
                    if self.used + dd <= budget and self.add_tube(anchor, hit, D0) >= 0:
                        self.used += dd
                        self.counts["captured"] += 1
                    else:
                        self.counts["refused"] += 1
                elif anchor < 0:
                    self.counts["refused"] += 1
                continue
            if pr["age"] < PROBE_LIFE:
                keep.append(pr)
            else:
                self.counts["starved"] += 1
        self.probes = keep
        self.tick += 1


def solve(A, b):
    """A x = b in place, Gaussian elimination with partial pivot (the flow dish's solve)."""
    n = len(b)
    for c in range(n):
        piv = c
        for r in range(c + 1, n):
            if abs(A[r][c]) > abs(A[piv][c]):
                piv = r
        A[c], A[piv] = A[piv], A[c]
        b[c], b[piv] = b[piv], b[c]
        for r in range(c + 1, n):
            f = A[r][c] / A[c][c]
            if f == 0.0:
                continue
            Ar, Ac = A[r], A[c]
            for k in range(c, n):
                Ar[k] -= f * Ac[k]
            b[r] -= f * b[c]
    x = [0.0] * n
    for r in range(n - 1, -1, -1):
        s = b[r]
        for k in range(r + 1, n):
            s -= A[r][k] * x[k]
        x[r] = s / A[r][r]
    return x


class Plugin:
    """The per-sample machine around the dish: bands in, the network, the mix out."""
    def __init__(self, sr):
        self.sr = sr
        self.dish = Dish(sr)
        self.svf = []
        for fc in BAND_HZ:
            g = math.tan(math.pi * fc / sr)
            k = 1.0 / BAND_Q
            a1 = 1.0 / (1.0 + g * (g + k))
            a2 = g * a1
            a3 = g * a2
            self.svf.append((k, a1, a2, a3))
        self.ae = 1.0 - math.exp(-1.0 / (0.023 * sr))
        self.cg = 1.0 - math.exp(-1.0 / (sr / TICK_HZ))
        self.cv = 1.0 - math.exp(-1.0 / (0.6 * sr))

    def reset(self, v):
        self.now = 0
        self.ic1 = [0.0] * NBANDS; self.ic2 = [0.0] * NBANDS
        self.bandv = [0.0] * NBANDS; self.e = [0.0] * NBANDS
        self.tick_acc = 0.0; self.clock_acc = 0.0
        self.vs = v["flow"]
        self.cover_was = v["cover"]
        self.dish.hist[:] = 0.0
        self.dish.clear(int(v["dish"]), 0)
        self.nin = np.zeros(NMAX)
        self.sync(v)
        self.pv = np.zeros(len(PROBES))

    def on_tick(self, v):
        d = self.dish
        for t in range(d.thigh):
            if d.ts[t] == FADING:
                d.fade[t] -= 1
                if d.fade[t] <= 0:
                    d.ts[t] = FREE
                    d.g[2 * t] = 0.0; d.g[2 * t + 1] = 0.0
        if v["cover"] >= 0.5 and self.cover_was < 0.5:
            d.now_born = self.now
            d.seed_mesh()
        self.cover_was = v["cover"]
        self.clock_acc += v["clock"]
        levels = [math.sqrt(x) for x in self.e]
        d.now_born = self.now
        while self.clock_acc >= 1.0:
            d.step(levels, v["feed"], v["budget"])
            self.clock_acc -= 1.0
        self.sync(v)

    def sync(self, v):
        """Set each line's target gain from its tube, and list the lines in slot order."""
        d = self.dish
        src, dst, gi, tl = [], [], [], []
        # sound leaves a junction split the way the flow splits there: a line carries its
        # tube's share of what flows out of its source node (forward), or of everything at
        # the node (back, against the flow). A single road passes almost all of it on.
        amp = [0.0] * TMAX
        out = [0.0] * NMAX
        tot = [0.0] * NMAX
        for t in range(d.thigh):
            if d.ts[t] == LIVE:
                amp[t] = math.pow(d.D[t], 1.0 / POW_G)
                a, b = d.ta[t], d.tb[t]
                tot[a] += amp[t]; tot[b] += amp[t]
                if d.w[t] >= 0.0:
                    out[a] += amp[t]
                else:
                    out[b] += amp[t]
        for t in range(d.thigh):
            if d.ts[t] == FREE:
                continue
            a, b = d.ta[t], d.tb[t]
            if d.ts[t] == LIVE:
                fa = amp[t] / out[a] if out[a] > 0.0 else 0.0
                fb = amp[t] / out[b] if out[b] > 0.0 else 0.0
                ka = amp[t] / tot[a] if tot[a] > 0.0 else 0.0
                kb = amp[t] / tot[b] if tot[b] > 0.0 else 0.0
                gab = G_BACK * ka + (G_FWD * fa - G_BACK * ka) * (1.0 + d.w[t]) / 2.0
                gba = G_BACK * kb + (G_FWD * fb - G_BACK * kb) * (1.0 - d.w[t]) / 2.0
                d.tg[2 * t] = min(1.0, gab) * v["regen"]
                d.tg[2 * t + 1] = min(1.0, gba) * v["regen"]
            else:
                d.tg[2 * t] = 0.0; d.tg[2 * t + 1] = 0.0
            a, b = d.ta[t], d.tb[t]
            if a != d.sink:
                src.append(a); dst.append(b); gi.append(2 * t); tl.append(d.L[t])
            if b != d.sink:
                src.append(b); dst.append(a); gi.append(2 * t + 1); tl.append(d.L[t])
        self.lsrc = np.array(src, dtype=np.int64)
        self.ldst = np.array(dst, dtype=np.int64)
        self.lgi = np.array(gi, dtype=np.int64)
        self.lL = np.array(tl, dtype=np.float64)
        self.lsink = self.ldst == d.sink
        self.lborn = np.array([d.born[s] for s in src], dtype=np.int64)
        self.lpanL = np.array([d.panL[s] for s in src])
        self.lpanR = np.array([d.panR[s] for s in src])
        self.food = [(n, d.band[n]) for n in range(d.nhigh) if d.alive[n] and d.kind[n] == FOOD]
        self.nodes_out = np.array([n for n in range(d.nhigh) if n != d.sink], dtype=np.int64)

    def step(self, v, xl, xr):
        d = self.dish
        if int(v["dish"]) != d.layout:
            d.clear(int(v["dish"]), self.now)
            self.sync(v)
        x = 0.5 * (xl + xr)
        for k in range(NBANDS):
            kq, a1, a2, a3 = self.svf[k]
            v3 = x - self.ic2[k]
            v1 = a1 * self.ic1[k] + a2 * v3
            v2 = self.ic2[k] + a2 * self.ic1[k] + a3 * v3
            self.ic1[k] = 2.0 * v1 - self.ic1[k]
            self.ic2[k] = 2.0 * v2 - self.ic2[k]
            bnd = kq * v1
            self.bandv[k] = bnd
            self.e[k] += self.ae * (bnd * bnd - self.e[k])
        self.tick_acc += TICK_HZ / self.sr
        if self.tick_acc >= 1.0:
            self.tick_acc -= 1.0
            self.on_tick(v)
        self.vs += (v["flow"] - self.vs) * self.cv

        # the network: every line reads its source node's history at its tube's delay
        nin = self.nin
        nin[:] = 0.0
        inj = np.zeros(NMAX)
        for n, k in self.food:
            inj[n] = self.bandv[k]
        wl = np.zeros(1); wr = np.zeros(1)
        if len(self.lgi):
            gi = self.lgi
            d.g[gi] += (d.tg[gi] - d.g[gi]) * self.cg
            dl = self.lL / self.vs * self.sr
            dl = np.minimum(np.maximum(dl, 0.05 * self.sr), HIST - 4.0)
            pos = self.now - dl
            i0f = np.floor(pos)
            fr = pos - i0f
            i0 = i0f.astype(np.int64)
            h0 = d.hist[self.lsrc, i0 & MASK].astype(np.float64)
            h1 = d.hist[self.lsrc, (i0 + 1) & MASK].astype(np.float64)
            y = h0 + fr * (h1 - h0)
            y[i0 < self.lborn] = 0.0
            val = y * d.g[gi]
            sk = self.lsink
            np.add.at(nin, self.ldst[~sk], val[~sk])
            np.add.at(wl, np.zeros(int(sk.sum()), dtype=np.int64), val[sk] * self.lpanL[sk])
            np.add.at(wr, np.zeros(int(sk.sum()), dtype=np.int64), val[sk] * self.lpanR[sk])
        no = self.nodes_out
        d.hist[no, self.now & MASK] = np.tanh(inj[no] + nin[no]).astype(np.float32)
        wet_l = math.tanh(WET_GAIN * wl[0]) * 0.8
        wet_r = math.tanh(WET_GAIN * wr[0]) * 0.8
        ol = v["dry"] * xl + v["wet"] * wet_l
        orr = v["dry"] * xr + v["wet"] * wet_r
        self.write_probes()
        self.now += 1
        return ol, orr

    def write_probes(self):
        d = self.dish
        pv = self.pv
        j = 0
        for n in range(d.nhigh):
            if d.alive[n] and d.kind[n] == FOOD:
                pv[d.band[n]] = d.env[n]
        j = NBANDS
        for i in range(PROBE_MAX):
            if i < len(d.probes):
                pv[j] = d.probes[i]["px"]; pv[j + 1] = d.probes[i]["py"]
            else:
                pv[j] = -1.0; pv[j + 1] = -1.0
            j += 2
        live = 0
        for t in range(d.thigh):
            if d.ts[t] == LIVE:
                live += 1
        pv[j] = live; pv[j + 1] = d.used
        grp = (self.now >> 7) % NGROUPS
        pv[j + 2] = grp
        j += 3
        for s in range(GROUP):
            t = grp * GROUP + s
            if d.ts[t] == LIVE:
                a, b = d.ta[t], d.tb[t]
                pv[j] = d.nx[a]; pv[j + 1] = d.ny[a]; pv[j + 2] = d.nx[b]; pv[j + 3] = d.ny[b]
                pv[j + 4] = d.D[t]; pv[j + 5] = d.Q[t]
            else:
                pv[j] = 0.0; pv[j + 1] = 0.0; pv[j + 2] = 0.0; pv[j + 3] = 0.0
                pv[j + 4] = -1.0; pv[j + 5] = 0.0
            j += 6


def render(v, sr, inputs=None, notes=()):
    steps = len(v["feed"])
    pl = Plugin(sr)
    pl.reset({k: float(v[k][0]) for k in PARAM_IDS})
    out = np.zeros((2, steps))
    probes = np.zeros((len(PROBES), steps))
    cols = {k: v[k] for k in PARAM_IDS}
    xl_all, xr_all = inputs[0], inputs[1]
    for i in range(steps):
        vi = {k: float(cols[k][i]) for k in PARAM_IDS}
        out[0, i], out[1, i] = pl.step(vi, float(np.float32(xl_all[i])), float(np.float32(xr_all[i])))
        probes[:, i] = pl.pv
    return dict(out=out, probes={name: probes[j] for j, name in enumerate(PROBES)})
