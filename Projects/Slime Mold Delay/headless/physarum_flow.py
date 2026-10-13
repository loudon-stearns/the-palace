#!/usr/bin/env python3
"""
Slime Mold Delay — the flow engine. Stage 4 dynamics, headless.
Cycle 8 (2026-10-13). Grant STAGE-4-DYNAMICS: tip-extension probes,
retraction, a total-length budget; no browser, no audio device.

Why a second engine: the September draft (physarum_fdn.py) reinforced each
tube *relative to the mean* tube, so half the network was always starving.
It never settled — 31 spawns, 31 prunes in 24 s, budget never touched.
This one uses the law the real mold follows (Tero, Kobayashi & Nakagaki
2007): every tube is a pipe, the food pushes cytoplasm in, the sink drains
it, and pressure settles by Kirchhoff. A tube thickens with the flow it
actually carries and thins on its own. A network that serves the food well
is a fixed point, so the mold can stop changing its mind.

The audio part: how hard each food node pushes is the loudness of the music
at that node. Loud food grows fat roads to the listener; quiet food's roads
wither. That is "the routing learns the music", made literal.

  pressure     Σ_j (D_ij / L_ij)(p_i − p_j) = I_i        I_food = loudness, I_sink = −Σ
  flow         Q_ij = (D_ij / L_ij)(p_i − p_j)
  growth       dD/dt = k · ( |Q|^γ / (h^γ + |Q|^γ) − μ·D )
  probe        fired from a node with weight ∝ throughput, more often while
               some sounding food is still unreached; drifts toward
               sounding, unconnected food; captures any node within R_CAP
  retraction   D < EPS for TAU ticks → 0.3 s ramp to silence → cut
  budget       Σ L ≤ L_MAX; a probe that would overflow it starves

Audio: each tube is two delay lines (downstream strong, upstream weak — the
mold's shuttle streaming reverses its flow, so sound goes both ways and the
network can recirculate). delay = L / VELOCITY. Gains follow D, ramped
linearly across each 1/30 s block, so growth and retraction are click-free.
"""
import json, math, os, struct, sys, wave, zlib
import numpy as np

SR, TICK_HZ = 48000, 30
BLOCK = SR // TICK_HZ

# --- dish: five oat flakes, one red sink, ten bare spots of agar ------------
FOOD = [(0.10, 0.30), (0.18, 0.76), (0.86, 0.22), (0.92, 0.66), (0.55, 0.90)]
SINK = (0.52, 0.46)
_jr = np.random.default_rng(7)
JUNC = [tuple(np.round(_jr.uniform(0.12, 0.88, 2), 3)) for _ in range(10)]
NODES = FOOD + [SINK] + JUNC
NF, SINK_I = len(FOOD), len(FOOD)
FOOD_HZ = [110.0, 146.83, 196.0, 164.81, 130.81]       # A2 D3 G3 E3 C3

# --- the mold's character ---------------------------------------------------
VELOCITY = 0.9           # dish units / s  → delay = length / velocity
K, GAMMA, H, MU = 2.2, 1.8, 0.35, 1.0
EPS, TAU, RETRACT = 0.06, 18, 9
L_MAX = 2.4
PROBE_RATE, PROBE_MAX, PROBE_LIFE = 1.2, 3, 30     # probes/s at full hunger
PROBE_STEP, R_CAP = 0.024, 0.06
D0 = 0.18                 # a newly captured tube starts thin
G_FWD, G_BACK, G_SELF = 0.62, 0.22, 0.30
DRY = 0.30

def dist(a, b): return math.hypot(a[0]-b[0], a[1]-b[1])

class Line:
    """Delay line whose total latency is `samples`; one block of it is the
    engine's routing latency, so the buffer holds samples − BLOCK."""
    def __init__(self, samples):
        self.buf = np.zeros(max(BLOCK // 4, samples - BLOCK), np.float32); self.w = 0
    def tick(self, x, fb):
        n, N = self.buf.size, x.size
        idx = (self.w + np.arange(N)) % n
        y = self.buf[idx].copy()
        self.buf[idx] = x + fb * y
        self.w = (self.w + N) % n
        return y

class Tube:
    def __init__(self, a, b, D=D0):
        self.a, self.b = a, b
        self.L = dist(NODES[a], NODES[b])
        n = int(max(0.05, self.L / VELOCITY) * SR)
        self.ab, self.ba = Line(n), Line(n)
        self.D, self.Dprev, self.Q = D, 0.0, 0.0
        self.w = self.wprev = 1.0       # +1 flows a→b, −1 b→a; glides, never jumps
        self.starve, self.retract, self.dead = 0, -1, False
        self.born = None

# --- music: which food is sounding when -------------------------------------
def pluck(f, n, rng):
    t = np.arange(n) / SR
    s = np.sin(2*np.pi*f*t) + 0.34*np.sin(2*np.pi*2*f*t) + 0.12*np.sin(2*np.pi*3.01*f*t)
    s += 0.22 * rng.standard_normal(n) * np.exp(-t*110)
    return (s * np.exp(-t*6.0) * 0.42).astype(np.float32)

def score(scene, dur, rng):
    """scene(t) → per-food activity in [0,1]: how often each flake is plucked."""
    total = int(dur * TICK_HZ) * BLOCK
    src = np.zeros((NF, total), np.float32)
    for i in range(NF):
        t = 0.25 + 0.17*i
        while t < dur - 1.2:
            a = scene(t)[i]
            if a > 0.05 and rng.random() < a:
                s = int(t*SR); g = pluck(FOOD_HZ[i], min(int(1.3*SR), total - s), rng)
                src[i, s:s+g.size] += g * (0.6 + 0.4*a)
            t += rng.uniform(0.45, 0.85)
    return src

# --- the engine -------------------------------------------------------------
def run(scene, dur, seed, hunger=lambda t: 1.0, label="", l_max=None):
    budget = L_MAX if l_max is None else l_max
    rng = np.random.default_rng(seed)
    src = score(scene, dur, rng)
    ticks = int(dur * TICK_HZ)
    N = len(NODES)
    tubes = [Tube(0, SINK_I, D=0.5)]                 # the mold starts as one strand
    for t in tubes: t.born = 0
    probes, ghosts = [], []
    env = np.zeros(NF)                               # smoothed loudness per flake
    node_prev = np.zeros((N, BLOCK), np.float32)
    out = np.zeros((2, ticks*BLOCK), np.float32)
    log, frames, events = [], {}, []
    cnt = dict(probes=0, captured=0, starved=0, retracted=0, budget_refused=0)
    snap_at = set(int(x*TICK_HZ) for x in np.linspace(0, dur, 7)[1:]) | {ticks-1}

    for tick in range(ticks):
        tt = tick / TICK_HZ
        s0, s1 = tick*BLOCK, (tick+1)*BLOCK
        # 1. audio through the grown network ------------------------------
        node_in = node_prev.copy()
        node_in[:NF] += src[:, s0:s1]
        node_in = np.tanh(node_in)                    # a node can only carry so much
        node_out = np.zeros_like(node_in)
        sink = np.zeros((2, BLOCK), np.float32)
        for tb in tubes:
            g = np.linspace(tb.Dprev, tb.D, BLOCK, dtype=np.float32)
            w = np.linspace(tb.wprev, tb.w, BLOCK, dtype=np.float32)
            g_ab = G_BACK + (G_FWD - G_BACK) * (1 + w) / 2   # a reversal crossfades
            g_ba = G_BACK + (G_FWD - G_BACK) * (1 - w) / 2
            fb = G_SELF * min(1.0, tb.D)
            y_ab = tb.ab.tick(node_in[tb.a] * g * g_ab, fb)
            y_ba = tb.ba.tick(node_in[tb.b] * g * g_ba, fb)
            for y, to, frm in ((y_ab, tb.b, tb.a), (y_ba, tb.a, tb.b)):
                if to == SINK_I:
                    pan = NODES[frm][0]
                    sink[0] += y * math.sqrt(1-pan); sink[1] += y * math.sqrt(pan)
                else:
                    node_out[to] += y
            tb.Dprev, tb.wprev = tb.D, tb.w
        dry = src[:, s0:s1]
        for i in range(NF):
            pan = FOOD[i][0]
            sink[0] += DRY * dry[i] * math.sqrt(1-pan); sink[1] += DRY * dry[i] * math.sqrt(pan)
        out[:, s0:s1] = sink
        node_prev = node_out

        # 2. what the mold tastes: loudness at each flake -----------------
        rms = np.sqrt(np.mean(src[:, s0:s1]**2, axis=1))
        env = np.maximum(rms, env * math.exp(-1/(TICK_HZ*1.5)))   # 1.5 s memory
        # only food the network actually reaches can push; the sink drains
        # exactly what they push, so Kirchhoff balances without a leak
        comp, stack = {SINK_I}, [SINK_I]
        adj = {}
        for tb in tubes:
            adj.setdefault(tb.a, []).append(tb.b); adj.setdefault(tb.b, []).append(tb.a)
        while stack:
            for nb_ in adj.get(stack.pop(), []):
                if nb_ not in comp: comp.add(nb_); stack.append(nb_)
        I = np.zeros(N)
        fed = [i for i in range(NF) if i in comp]
        tot = sum(env[i] for i in fed)
        if tot > 1e-4:
            for i in fed: I[i] = env[i] / tot
            I[SINK_I] = -1.0

        # 3. pressure and flow (Kirchhoff on the live tubes) --------------
        Lap = np.eye(N) * 1e-4
        for tb in tubes:
            c = tb.D / tb.L
            Lap[tb.a, tb.a] += c; Lap[tb.b, tb.b] += c
            Lap[tb.a, tb.b] -= c; Lap[tb.b, tb.a] -= c
        p = np.linalg.solve(Lap, I)
        hun = hunger(tt)
        mu = MU * (1.6 - 0.6*hun)                     # a starving mold thins faster
        for tb in tubes:
            tb.Q = tb.D / tb.L * (p[tb.a] - p[tb.b])
            if abs(tb.Q) > 1e-4:
                tb.w += float(np.clip(math.copysign(1, tb.Q) - tb.w, -0.15, 0.15))
            q = abs(tb.Q)**GAMMA
            if tb.retract < 0:
                tb.D = max(0.0, tb.D + K/TICK_HZ * (q/(H**GAMMA + q) - mu*tb.D))
                tb.starve = tb.starve + 1 if tb.D < EPS else 0
                if tb.starve >= TAU:
                    tb.retract = RETRACT
                    events.append((round(tt, 2), "retract", tb.a, tb.b))
            elif tb.retract > 0:
                tb.D *= (tb.retract-1)/tb.retract; tb.retract -= 1
            else:
                tb.dead = True
        nb = len(tubes); tubes = [tb for tb in tubes if not tb.dead]
        cnt["retracted"] += nb - len(tubes)
        used = sum(tb.L for tb in tubes)

        # 4. tip extension ------------------------------------------------
        on = {tb.a for tb in tubes} | {tb.b for tb in tubes} | {SINK_I}   # the sink is home
        sounding = [i for i in range(NF) if env[i] > 0.01]
        unmet = sum(1 for i in sounding if i not in comp) / max(1, len(sounding))
        satiety = 0.12 + 0.88*unmet           # a mold that reaches all its food stops exploring
        if len(probes) < PROBE_MAX and rng.random() < PROBE_RATE*hun*satiety/TICK_HZ:
            thru = np.zeros(N)
            for tb in tubes: thru[tb.a] += abs(tb.Q); thru[tb.b] += abs(tb.Q)
            cand = sorted(on); w = thru[cand] + 0.05; w /= w.sum()
            anc = int(rng.choice(cand, p=w)); ang = rng.uniform(0, 2*math.pi)
            probes.append(dict(anchor=anc, pos=list(NODES[anc]), dir=[math.cos(ang), math.sin(ang)],
                               age=0, trail=[NODES[anc]]))
            cnt["probes"] += 1
        keep = []
        for pr in probes:
            hungry = [i for i in range(NF) if i not in on and env[i] > 0.01]
            if hungry:                                # chemotaxis toward sounding food
                tg = min(hungry, key=lambda i: dist(pr["pos"], NODES[i]) / (0.2 + env[i]*8))
                vx, vy = NODES[tg][0]-pr["pos"][0], NODES[tg][1]-pr["pos"][1]
                m = math.hypot(vx, vy) + 1e-9
                pr["dir"][0] = 0.85*pr["dir"][0] + 0.15*vx/m
                pr["dir"][1] = 0.85*pr["dir"][1] + 0.15*vy/m
            pr["dir"][0] += rng.normal(0, 0.12); pr["dir"][1] += rng.normal(0, 0.12)
            m = math.hypot(*pr["dir"]) + 1e-9; pr["dir"] = [pr["dir"][0]/m, pr["dir"][1]/m]
            pr["pos"] = [min(.98, max(.02, pr["pos"][0] + pr["dir"][0]*PROBE_STEP)),
                         min(.98, max(.02, pr["pos"][1] + pr["dir"][1]*PROBE_STEP))]
            pr["trail"].append(tuple(pr["pos"])); pr["age"] += 1
            hit = next((i for i in range(N) if i != pr["anchor"]
                        and dist(pr["pos"], NODES[i]) < R_CAP), None)
            if hit is not None:
                a, b = pr["anchor"], hit
                if not any({tb.a, tb.b} == {a, b} for tb in tubes):
                    if used + dist(NODES[a], NODES[b]) <= budget:
                        nt = Tube(a, b); nt.born = tick; tubes.append(nt)
                        used += nt.L; cnt["captured"] += 1
                        events.append((round(tt, 2), "capture", a, b))
                    else:
                        cnt["budget_refused"] += 1
                        ghosts.append((tick, pr["trail"]))
                continue
            if pr["age"] < PROBE_LIFE: keep.append(pr)
            else:
                cnt["starved"] += 1; ghosts.append((tick, pr["trail"]))
        probes = keep

        # 5. bookkeeping --------------------------------------------------
        left = sum(tb.D for tb in tubes if tb.a in (0, 1) or tb.b in (0, 1))
        right = sum(tb.D for tb in tubes if tb.a in (2, 3) or tb.b in (2, 3))
        log.append((tick, round(tt, 3), len(tubes), len(probes), round(used, 3),
                    round(sum(tb.D for tb in tubes), 3), round(left, 3), round(right, 3),
                    cnt["captured"], cnt["retracted"]))
        if tick in snap_at:
            frames[tick] = ([(tb.a, tb.b, tb.D) for tb in tubes],
                            [list(pr["trail"]) for pr in probes],
                            [tr for (gt, tr) in ghosts if tick - gt < 45], env.copy())

    peak = float(np.abs(out).max())
    return dict(label=label, out=out, peak=peak, log=log, frames=frames,
                events=events, counts=cnt, final=[(tb.a, tb.b, round(tb.D, 3)) for tb in tubes])

# --- the scenes -------------------------------------------------------------
LEFT  = lambda t: [1.0, 0.9, 0.06, 0.06, 0.15]
RIGHT = lambda t: [0.06, 0.06, 0.9, 1.0, 0.15]
def MOVES(t):                                         # left for 15 s, then right
    return LEFT(t) if t < 15 else RIGHT(t)
def FEAST_FAMINE(t):                                  # everyone sounding, the knob does the work
    return [0.7, 0.6, 0.6, 0.7, 0.6]
ALL = lambda t: [0.8, 0.8, 0.8, 0.8, 0.8]
HUNGER = lambda t: 1.0 if (t % 12) < 6 else 0.0       # eat 6 s, starve 6 s

# --- writers (no matplotlib on this machine — the draft's hand PNG writer) --
def write_wav(path, out, gain):
    x = np.tanh(out * gain) * 0.9
    pcm = (np.clip(x.T, -1, 1) * 32767).astype("<i2").tobytes()
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm)

def write_png(path, rgb):
    h, w, _ = rgb.shape
    raw = b"".join(b"\x00" + rgb[y].tobytes() for y in range(h))
    ck = lambda t, d: struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t+d) & 0xffffffff)
    open(path, "wb").write(b"\x89PNG\r\n\x1a\n" + ck(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
                           + ck(b"IDAT", zlib.compress(raw, 9)) + ck(b"IEND", b""))

def draw(runs, path, cols=6):
    PW = PH = 230; PAD = 12
    cv = np.zeros((PH*len(runs), PW*cols, 3), np.float32); cv[:] = (0.05, 0.07, 0.06)
    def splat(ox, oy, x, y, rgb, r, a):
        px, py = ox + PAD + x*(PW-2*PAD), oy + PAD + y*(PH-2*PAD)
        y0, y1 = max(oy, int(py-r-2)), min(oy+PH, int(py+r+3))
        x0, x1 = max(ox, int(px-r-2)), min(ox+PW, int(px+r+3))
        if y0 >= y1 or x0 >= x1: return
        yy, xx = np.mgrid[y0:y1, x0:x1]
        k = a * np.clip(1 - np.hypot(xx-px, yy-py)/(r+1), 0, 1)[..., None]
        cv[y0:y1, x0:x1] = cv[y0:y1, x0:x1]*(1-k) + np.array(rgb)*k
    def line(ox, oy, p, q, rgb, r, a):
        n = max(2, int(dist(p, q)*PW*0.9))
        for i in range(n):
            t = i/(n-1); splat(ox, oy, p[0]+(q[0]-p[0])*t, p[1]+(q[1]-p[1])*t, rgb, r, a)
    for row, R in enumerate(runs):
        oy = row*PH
        for col, tick in enumerate(sorted(R["frames"])[:cols]):
            ox = col*PW
            edges, trails, ghosts, env = R["frames"][tick]
            for tr in ghosts:
                for i in range(1, len(tr)): line(ox, oy, tr[i-1], tr[i], (0.30, 0.22, 0.16), 0.6, 0.5)
            for tr in trails:
                for i in range(1, len(tr)): line(ox, oy, tr[i-1], tr[i], (0.65, 0.60, 0.30), 0.7, 0.8)
            for a, b, D in edges:
                line(ox, oy, NODES[a], NODES[b], (0.95, 0.80, 0.25), 0.6 + 4.2*min(1, D), min(1, 0.35 + D))
            for j in JUNC: splat(ox, oy, j[0], j[1], (0.25, 0.32, 0.27), 1.6, 1)
            for i, f in enumerate(FOOD):
                splat(ox, oy, f[0], f[1], (0.98, 0.88, 0.40), 2.8 + 6*min(1, env[i]*5), 1)
            splat(ox, oy, SINK[0], SINK[1], (0.88, 0.25, 0.25), 5, 1)
            cv[oy, ox:ox+PW] = (0.16, 0.22, 0.18)
            cv[oy:oy+PH, ox] = (0.16, 0.22, 0.18)
    write_png(path, (np.clip(cv, 0, 1)*255).astype(np.uint8))

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    tag = "2026-10-13"
    runs = [run(LEFT, 30, 11, label="left"), run(RIGHT, 30, 11, label="right"),
            run(MOVES, 30, 11, label="moves"), run(FEAST_FAMINE, 30, 11, hunger=HUNGER, label="feast-famine"),
            run(ALL, 30, 11, label="tight-budget", l_max=1.15)]
    gain = 1.0 / max(R["peak"] for R in runs) * 1.4          # one shared gain, so loudness compares
    summary = {}
    for R in runs:
        write_wav(os.path.join(here, f"{tag}-flow-{R['label']}.wav"), R["out"], gain)
        with open(os.path.join(here, f"{tag}-flow-{R['label']}-log.csv"), "w") as f:
            f.write("tick,t,tubes,probes,used_length,total_D,D_left_food,D_right_food,captured,retracted\n")
            for r in R["log"]: f.write(",".join(map(str, r)) + "\n")
        o = R["out"]; d = np.abs(np.diff(o, axis=1)).max()
        summary[R["label"]] = dict(counts=R["counts"], final_tubes=R["final"], peak=R["peak"],
                                   max_step=float(d), finite=bool(np.isfinite(o).all()),
                                   events=R["events"])
        summary[R["label"]]["max_used_length"] = max(r[4] for r in R["log"])
        print(R["label"], R["counts"], "final:", R["final"], "peak %.3f" % R["peak"])
    draw(runs, os.path.join(here, f"{tag}-flow-dishes.png"))
    json.dump(summary, open(os.path.join(here, f"{tag}-flow-summary.json"), "w"), indent=1)
