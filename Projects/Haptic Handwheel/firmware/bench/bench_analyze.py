"""Haptic Handwheel — turn the knob's bench CSV into the motor's real numbers.

    python3 bench_analyze.py capture.csv --disc-mass 0.040 --disc-radius 0.040
    python3 bench_analyze.py --selftest      # fake a motor with known numbers, recover them

Reads lines "b,<test>,<t>,<angle>,<speed>,<Uq>" streamed by handwheel.ino's BENCH.
Prints the numbers the feel lab guessed, so they can be replaced by measured ones.
"""
import sys, argparse
import numpy as np

def _moving(t, th):
    """Keep the stretch where the knob is still turning (angle short of its final 99.5 %)."""
    t = np.asarray(t) - t[0]; th = np.asarray(th) - th[0]
    m = np.abs(th) < 0.995 * np.abs(th[-1]) if abs(th[-1]) > 1e-3 else np.ones_like(t, bool)
    return t[m], th[m]

def fit_run(t, th, driven=False):
    """Fit the angle trace (the encoder's honest output), not its noisy speed.
    While turning one way the knob obeys dω/dt = A − β·ω with β = damping/J, so
      θ = θ0 + ω0·(1−e^{−βt})/β + A·(t/β − (1−e^{−βt})/β²)
    coasting, A = −τc/J; driven, A = (τ − τc)/J. The first sample is already
    moving, so θ0 and ω0 stay free. θ is linear in θ0, ω0, A once β is fixed:
    search β, solve the rest."""
    t, th = _moving(t, th)
    best = None
    for beta in np.geomspace(0.05, 5e4, 400):
        e = (1 - np.exp(-beta * t)) / beta
        g = t / beta - e / beta
        A = np.column_stack([np.ones_like(t), e, g])
        x, *_ = np.linalg.lstsq(A, th, rcond=None)
        r = np.sum((A @ x - th) ** 2)
        if best is None or r < best[0]: best = (r, beta, x)
    for _ in range(40):  # refine around the best β
        lo, hi = best[1] / 1.03, best[1] * 1.03
        for beta in np.linspace(lo, hi, 9):
            e = (1 - np.exp(-beta * t)) / beta; g = t / beta - e / beta
            A = np.column_stack([np.ones_like(t), e, g]); x, *_ = np.linalg.lstsq(A, th, rcond=None)
            r = np.sum((A @ x - th) ** 2)
            if r < best[0]: best = (r, beta, x)
    _, beta, x = best
    return dict(bJ=beta, A=x[2]) if driven else dict(bJ=beta, w0=x[1], cJ=-x[2])

def analyze(rows, disc_J, R):
    by = {}
    for r in rows: by.setdefault(r[0], []).append(r[1:])
    out = {}
    if 'coast-free' in by and 'coast-brake' in by:
        f = np.array(by['coast-free']); b = np.array(by['coast-brake'])
        out['coast'] = dict(free=fit_run(f[:, 0], f[:, 1]), brake=fit_run(b[:, 0], b[:, 1]))
    if 'accel-bare' in by and 'accel-disc' in by and 'coast' in out:
        a = np.array(by['accel-bare']); d = np.array(by['accel-disc']); u = a[0, 3]
        r1, r2 = fit_run(a[:, 0], a[:, 1], True), fit_run(d[:, 0], d[:, 1], True)
        # A = (τ − τc)/J. Bare and with a disc of known inertia: τ−τc is the same push.
        J = disc_J * r2['A'] / (r1['A'] - r2['A'])
        tc = out['coast']['free']['cJ'] * J
        kt = (J * r1['A'] + tc) * R / u                       # τ = kt·u/R at standstill
        out['accel'] = dict(J=J, kt=kt)
    if 'coast' in out and 'accel' in out:
        J = out['accel']['J']; fr = out['coast']['free']; br = out['coast']['brake']
        out['motor'] = dict(J=J, kt=out['accel']['kt'], b_bearings=fr['bJ'] * J, coulomb=fr['cJ'] * J,
                            b_backemf=(br['bJ'] - fr['bJ']) * J)
    return out

def fake_motor(J=5.2e-5, kt=0.26, R=7.6, b=3e-4, tc=0.004, disc_J=3.2e-5, seed=1):
    """A pretend bench run: a motor with known numbers, an encoder that quantizes and jitters."""
    rng = np.random.default_rng(seed); dt = 5e-4; q = 2 * np.pi / 16384; rows = []
    def run(name, Jt, u, w0, brake, dur):
        th, w, t, last = 0.0, w0, 0.0, 0.0
        while t < dur:
            tau = kt * (u - kt * w) / R if brake else 0.0
            for _ in range(10):  # finer physics than the sample rate
                acc = (tau - b * w - tc * np.tanh(w / 0.05)) / Jt
                w += acc * dt / 10; th += w * dt / 10
            t += dt; thq = np.round(th / q) * q
            rows.append((name, t, thq, (thq - last) / dt + rng.normal(0, 0.3), u)); last = thq
    run('coast-free', J, 0, 20.0, False, 3.0)
    run('coast-brake', J, 0, 20.0, True, 3.0)
    run('accel-bare', J, 2.0, 0.0, True, 0.25)
    run('accel-disc', J + disc_J, 2.0, 0.0, True, 0.25)
    return rows, dict(J=J, kt=kt, b_bearings=b, coulomb=tc, b_backemf=kt * kt / R)

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('csv', nargs='?'); ap.add_argument('--selftest', action='store_true')
    ap.add_argument('--disc-mass', type=float, default=0.040); ap.add_argument('--disc-radius', type=float, default=0.040)
    ap.add_argument('--R', type=float, default=7.6, help='per-phase ohms, measured with a meter (half of lead-to-lead)')
    a = ap.parse_args()
    disc_J = 0.5 * a.disc_mass * a.disc_radius ** 2
    if a.selftest:
        rows, truth = fake_motor(disc_J=disc_J, R=a.R)
    else:
        rows, truth = [], None
        for line in open(a.csv):
            p = line.strip().split(',')
            if len(p) == 6 and p[0] == 'b': rows.append((p[1], *map(float, p[2:])))
    m = analyze(rows, disc_J, a.R).get('motor', {})
    print(f"{'number':<12}{'measured':>12}" + (f"{'true':>12}{'error':>9}" if truth else ''))
    for k, v in m.items():
        line = f"{k:<12}{v:>12.3e}"
        if truth: line += f"{truth[k]:>12.3e}{100 * (v - truth[k]) / truth[k]:>8.1f}%"
        print(line)
