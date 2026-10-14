"""Haptic Handwheel — turn the knob's bench CSV into the motor's real numbers.

    python3 bench_analyze.py capture.csv --disc-mass 0.040 --disc-radius 0.040
    python3 bench_analyze.py capture.csv --mic chirp_mic.wav   # + the contact-mic recording of `bench chirp`
    python3 bench_analyze.py --selftest      # fake a motor with known numbers, recover them

Reads lines "b,<test>,<t>,<angle>,<speed>,<Uq>" streamed by handwheel.ino's BENCH.
Prints the numbers the feel lab guessed, so they can be replaced by measured ones.
With a `bench cog` capture it also maps the motor's own bumps and writes
../handwheel/cog_map.h, so the firmware can cancel them. With `bench chirp`
(and, better, the contact mic) it measures how much push survives from 10 to
400 Hz, fits the winding's inductance, and says whether a G can be felt.
"""
import sys, argparse
import numpy as np

COG_PER_TURN = 84          # 12 slots, 14 poles: lcm(12, 14) bumps per turn
CHIRP_F0, CHIRP_RATIO, CHIRP_T = 10.0, 40.0, 8.0   # handwheel.ino: f = 10·40^(t/8), 8 s
CHIRP_A, CHIRP_KSPRING = 1.0, 2.0                    # volts of sine, volts per rad of soft spring

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

# ── the cogging map ───────────────────────────────────────────────────────────
def cog_map(fwd, rev, kt, R, nharm=6):
    """fwd/rev rows: (target, angle, speed, u). Holding still against a stiff spring,
    the volts needed are the motor's bumps plus whatever friction is left over —
    and friction flips sign with the direction of approach. So the bumps are the
    average of the two passes, friction half their gap. Volts → N·m with kt/R."""
    f = np.array(fwd); r = np.array(rev)
    th = np.mod(f[:, 1], 2 * np.pi); thr = np.mod(r[:, 1], 2 * np.pi)
    grid = np.linspace(0, 2 * np.pi, 1680, endpoint=False)
    def onto(th, u):
        o = np.argsort(th)
        return np.interp(grid, th[o], u[o], period=2 * np.pi)
    uf, ur = onto(th, f[:, 3]), onto(thr, r[:, 3])
    cog_u = 0.5 * (uf + ur); fric_u = 0.5 * (uf - ur)
    cog_u -= cog_u.mean()
    # the strongest few harmonics of one turn, for the firmware to cancel
    c = np.fft.rfft(cog_u) / len(grid) * 2
    top = np.argsort(np.abs(c[1:]))[::-1][:nharm] + 1
    harm = [(int(h), float(c[h].real), float(-c[h].imag)) for h in sorted(top)]
    fit = sum(a * np.cos(h * grid) + b * np.sin(h * grid) for h, a, b in harm)
    s = kt / R
    return dict(grid=grid, cog_Nm=cog_u * s, fit_Nm=fit * s, friction_Nm=float(np.median(fric_u) * s),
                peak_Nm=float(0.5 * (cog_u.max() - cog_u.min()) * s),
                main=int(top[0]), harm_volts=harm, left_after_cancel_Nm=float(0.5 * np.ptp(cog_u - fit) * s))

def write_cog_header(harm, path):
    n = len(harm)
    f = lambda xs: ', '.join(f'{float(x):.6e}f' for x in xs)   # always a C float literal, even for 1
    with open(path, 'w') as o:
        o.write('// Written by bench_analyze.py from a `bench cog` capture. The volts that cancel\n'
                '// the motor\'s own bumps: u = Σ A·cos(H·θ) + B·sin(H·θ). Re-run the test to refresh.\n#pragma once\n')
        o.write(f'static const int COG_N = {n};\n')
        o.write(f'static const float COG_H[{n}] = {{{f([h for h, _, _ in harm])}}};\n')
        # cancelling means pushing the other way from the map the motor measured… the
        # map IS the push needed to hold still, so adding it as-is cancels the bumps.
        o.write(f'static const float COG_A[{n}] = {{{f([a for _, a, _ in harm])}}};\n')
        o.write(f'static const float COG_B[{n}] = {{{f([b for _, _, b in harm])}}};\n')

# ── the chirp: how much push survives as the pitch rises ──────────────────────
def chirp_phase(t):
    k = np.log(CHIRP_RATIO) / CHIRP_T
    return 2 * np.pi * CHIRP_F0 * (np.exp(k * t) - 1) / k
def chirp_freq(t):
    return CHIRP_F0 * CHIRP_RATIO ** (t / CHIRP_T)

def lockin(t, x, t_edges):
    """Amplitude of x at the chirp's own frequency, window by window. Works on
    uneven sample times (serial lines) and on the mic's even ones alike."""
    z = x * np.exp(-1j * chirp_phase(t))
    out = []
    for a, b in zip(t_edges[:-1], t_edges[1:]):
        m = (t >= a) & (t < b)
        out.append(2 * np.abs(z[m].mean()) if m.sum() > 8 else np.nan)
    return np.array(out)

def motor_response(f, J, kt, R, L, b):
    """Angle per volt of sine for the chirp's knob: volts drive a winding (R + jωL)
    that turns current into push, the knob's weight resists, the motor's own
    brake damps, and the firmware's soft spring (2 V/rad) holds it near zero."""
    s = 2j * np.pi * f
    return np.abs(kt / ((R + L * s) * (J * s * s + b * s) + kt * kt * s + CHIRP_KSPRING * kt))

def find_mic_start(y, sr):
    """The mic and the knob keep separate clocks. Track the loudest pitch in the
    recording and slide the known sweep along it until they agree."""
    hop, n = int(sr * 0.01), int(sr * 0.08)
    win = np.hanning(n); fr = np.fft.rfftfreq(n, 1 / sr)
    ts, fs = [], []
    for i in range(0, len(y) - n, hop):
        S = np.abs(np.fft.rfft(y[i:i + n] * win)); band = (fr > 8) & (fr < 450)
        if S[band].max() > 4 * np.median(S[band]) + 1e-12:
            ts.append((i + n / 2) / sr); fs.append(fr[band][np.argmax(S[band])])
    ts, fs = np.array(ts), np.array(fs)
    t_expect = CHIRP_T * np.log(fs / CHIRP_F0) / np.log(CHIRP_RATIO)
    t0 = float(np.median(ts - t_expect))
    # refine: the start that makes the lock-in strongest
    best = None
    for d in np.linspace(-0.03, 0.03, 61):
        tt = np.arange(len(y)) / sr - (t0 + d); m = (tt > 0.5) & (tt < CHIRP_T - 0.2)
        e = np.abs((y[m] * np.exp(-1j * chirp_phase(tt[m]))).mean())
        if best is None or e > best[0]: best = (e, t0 + d)
    return best[1]

def chirp_analyze(rows, motor, R, mic=None, rim=0.040, nwin=48):
    """Encoder: angle per volt where the wobble is big enough to count (low end).
    Mic: a piezo on the cap hears acceleration, so dividing by (2πf)² gives the
    angle's shape at every pitch; its scale is set where the encoder and the mic
    both hear well. Then fit the winding inductance L to the whole curve."""
    c = np.array(rows); t = c[:, 0]; th = c[:, 1]; u = c[:, 3]
    edges = np.linspace(0.05, CHIRP_T - 0.05, nwin + 1)
    fc = chirp_freq(0.5 * (edges[:-1] + edges[1:]))
    enc = lockin(t, th - np.polyval(np.polyfit(t, th, 2), t), edges) / CHIRP_A
    q = 2 * np.pi / 16384
    enc[enc < 3 * q / CHIRP_A] = np.nan        # below three encoder counts the encoder is guessing
    J, kt = motor['J'], motor['kt']
    out = dict(f=fc, enc=enc)
    curve = enc.copy()
    if mic is not None:
        y, sr = mic
        t0 = find_mic_start(y, sr)
        tt = np.arange(len(y)) / sr - t0
        acc = lockin(tt, y, edges)
        shape = acc / (2 * np.pi * fc) ** 2
        both = np.isfinite(enc) & (fc > 25) & (fc < 120)
        scale = np.nanmedian(enc[both] / shape[both]) if both.sum() >= 3 else np.nan
        out.update(mic=shape * scale, mic_start=t0)
        curve = np.where(np.isfinite(enc), enc, shape * scale)
    ok = np.isfinite(curve)
    best = None
    for L in np.geomspace(1e-4, 3e-2, 400):
        model = motor_response(fc[ok], J, kt, R, L, motor['b_bearings'])
        err = np.sum(np.log(curve[ok] / model) ** 2)
        if best is None or err < best[0]: best = (err, L)
    L = best[1]
    out.update(L=L, corner_Hz=R / (2 * np.pi * L), curve=curve,
               model=motor_response(fc, J, kt, R, L, motor['b_bearings']))
    # how far the rim moves at G3 (196 Hz) per volt, from the fitted curve
    out['rim_um_per_V_at_196'] = float(motor_response(196.0, J, kt, R, L, motor['b_bearings']) * rim * 1e6)
    return out

def fingertip_threshold_um(f):
    """A rough fingertip detection threshold, µm of skin movement: the slow-touch
    channel's plateau below ~40 Hz, and the vibration channel's U, deepest near
    250 Hz at about 0.1 µm. Shape after Verrillo's classic curves — an
    approximation for planning, not a measurement of Loudon's hand."""
    f = np.asarray(f, float)
    pac = 0.1 * np.where(f < 250, (250 / f) ** 2, (f / 250) ** 2)
    return np.minimum(15.0, pac)

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

def fake_cog(kt=0.26, R=7.6, fric=0.004, seed=2):
    """A pretend `bench cog`: 84 bumps per turn plus their second harmonic, a
    once-per-turn wobble from a rotor slightly off centre, and friction that
    flips with direction. The hold spring is stiff, so the knob sits a little
    off each target; the analyzer has to use the angle it really sat at."""
    rng = np.random.default_rng(seed); N = 1680; k_hold = 40.0 * kt / R
    cog = lambda th: 0.006 * np.sin(84 * th) + 0.002 * np.sin(168 * th + 0.7) + 0.0015 * np.sin(th + 1.1)
    rows = {'cog-fwd': [], 'cog-rev': []}
    for name, order, sgn in (('cog-fwd', range(N), 1), ('cog-rev', range(N - 1, -1, -1), -1)):
        th = 0.0 if sgn > 0 else 2 * np.pi
        for i in order:
            tgt = i * 2 * np.pi / N
            for _ in range(60):   # settle: spring pull against bumps; friction stops it short
                tau = k_hold * (tgt - th) + cog(th)
                if abs(tau) <= fric: break
                th += 0.3 * (tau - np.sign(tau) * fric) / (k_hold + 0.6)
            u = (k_hold * (tgt - th)) * R / kt + rng.normal(0, 0.01)
            rows[name].append((tgt, th, 0.0, u))
    truth = dict(peak_Nm=None, friction_Nm=fric, main=84)
    g = np.linspace(0, 2 * np.pi, 20000); truth['peak_Nm'] = float(0.5 * np.ptp(cog(g)))
    return rows, truth

def fake_chirp(J=5.2e-5 + 3.2e-5, kt=0.26, R=7.6, L=3.0e-3, b=3e-4, rim=0.040, seed=3, mic_delay=1.37):
    """A pretend `bench chirp`: the same knob as fake_motor, with the light cap on
    and a winding inductance L. The encoder reports over serial at ~2 kHz with
    jittery timestamps; a piezo taped to the cap records acceleration into a
    48 kHz interface that started 1.37 s early and hums at 60 Hz."""
    from scipy.signal import lsim, StateSpace
    rng = np.random.default_rng(seed)
    # states θ, ω, i.  u = A·sin(phase) − k·θ
    A = np.array([[0, 1, 0], [0, -b / J, kt / J], [-CHIRP_KSPRING / L, -kt / L, -R / L]])
    B = np.array([[0], [0], [CHIRP_A / L]]); C = np.eye(3); D = np.zeros((3, 1))
    sr = 48000; t = np.arange(0, CHIRP_T, 1 / sr)
    _, y, _ = lsim(StateSpace(A, B, C, D), np.sin(chirp_phase(t)), t)
    th, om, i = y.T
    acc = (kt * i - b * om) / J
    # serial lines: ~2 kHz, timestamps jitter, angle quantized to 14 bits
    ts = np.cumsum(rng.uniform(4e-4, 6e-4, int(CHIRP_T / 5e-4)))
    ts = ts[ts < CHIRP_T - 1e-3]
    q = 2 * np.pi / 16384
    thq = np.round((np.interp(ts, t, th) + rng.normal(0, 0.2 * q, len(ts))) / q) * q
    uq = CHIRP_A * np.sin(chirp_phase(ts)) - CHIRP_KSPRING * thq
    rows = [(a, b_, 0.0, c) for a, b_, c in zip(ts, thq, uq)]
    # the mic: acceleration at the rim, an unknown gain, hum, hiss, early start
    pre = np.zeros(int(mic_delay * sr)); post = np.zeros(sr // 2)
    sig = np.concatenate([pre, acc * rim * 3e-3, post])
    tm = np.arange(len(sig)) / sr
    sig = sig + 2e-4 * np.sin(2 * np.pi * 60 * tm) + rng.normal(0, 2e-4, len(sig))
    truth = dict(L=L, corner_Hz=R / (2 * np.pi * L), mic_start=mic_delay,
                 rim_um_per_V_at_196=float(motor_response(196.0, J, kt, R, L, b) * rim * 1e6))
    return rows, (sig, sr), truth

def read_wav(path):
    from scipy.io import wavfile
    sr, y = wavfile.read(path); y = y.astype(float)
    if y.ndim > 1: y = y[:, 0]
    return y / (np.abs(y).max() + 1e-12), sr

def report(rows_by, a, truth=None, mic=None, header_path=None, plot_path=None):
    disc_J = 0.5 * a.disc_mass * a.disc_radius ** 2
    rows = [(k, *r) for k, v in rows_by.items() for r in v if k in ('coast-free', 'coast-brake', 'accel-bare', 'accel-disc')]
    m = analyze(rows, disc_J, a.R).get('motor', {})
    T = truth or {}
    def line(name, v, true=None, unit=''):
        s = f"{name:<26}{v:>12.4g} {unit:<8}"
        if true is not None: s += f"{true:>12.4g}{100 * (v - true) / true:>8.1f}%"
        print(s)
    print(f"{'number':<26}{'measured':>12} {'':<8}" + (f"{'true':>12}{'error':>9}" if truth else ''))
    for k, v in m.items(): line(k, v, T.get('motor', {}).get(k))
    if m:  # the lines to paste into Max, so the knob stops guessing
        print(f"  send to the knob: set kt {m['kt']:.4g} · then with the turntable selected: "
              f"set ffB {m['b_bearings']:.4g} · set ffC {m['coulomb']:.4g}")
    res = dict(motor=m)
    if m and 'cog-fwd' in rows_by and 'cog-rev' in rows_by:
        cg = cog_map(rows_by['cog-fwd'], rows_by['cog-rev'], m['kt'], a.R)
        tc = T.get('cog', {})
        line('cogging, peak', cg['peak_Nm'], tc.get('peak_Nm'), 'N·m')
        line('cogging, bumps per turn', cg['main'], tc.get('main'))
        line('friction while holding', cg['friction_Nm'], tc.get('friction_Nm'), 'N·m')
        line('left after cancelling', cg['left_after_cancel_Nm'], None, 'N·m')
        print(f"  frets at the default 0.03 N·m are {0.03 / cg['peak_Nm']:.1f}× the raw bumps, "
              f"{0.03 / max(cg['left_after_cancel_Nm'], 1e-9):.0f}× what's left after cancelling")
        if header_path: write_cog_header(cg['harm_volts'], header_path); print(f"  wrote {header_path}")
        res['cog'] = cg
    if m and 'chirp' in rows_by:
        # the chirp runs with the disc on (the mic is taped to it), so it is part of the weight
        ch = chirp_analyze(rows_by['chirp'], dict(m, J=m['J'] + disc_J), a.R, mic=mic)
        tc = T.get('chirp', {})
        line('winding inductance L', ch['L'] * 1e3, tc.get('L', 0) * 1e3 or None, 'mH')
        line('push falls off from', ch['corner_Hz'], tc.get('corner_Hz'), 'Hz')
        if 'mic_start' in ch: line('mic started early by', ch['mic_start'], tc.get('mic_start'), 's')
        line('rim at G3 (196 Hz), per V', ch['rim_um_per_V_at_196'], tc.get('rim_um_per_V_at_196'), 'µm')
        thr = float(fingertip_threshold_um(196.0)); vneed = 10 * thr / ch['rim_um_per_V_at_196']
        print(f"  felt clearly (10× a rough fingertip threshold, {thr:.2f} µm) needs {vneed:.2f} V of sine at 196 Hz")
        res['chirp'] = ch
    if plot_path and ('cog' in res or 'chirp' in res): plot(res, plot_path, ' — a pretend motor' if truth else '')
    return res

def plot(res, path, note=''):
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    ink, dim, acc, acc2 = '#2b2620', '#8a8274', '#c2562a', '#2f6f73'
    fig, ax = plt.subplots(1, 2, figsize=(12, 4.4), facecolor='#f6f1e7')
    for x in ax:
        x.set_facecolor('#f6f1e7'); [x.spines[k].set_visible(False) for k in ('top', 'right')]
        x.tick_params(colors=dim); [x.spines[k].set_color(dim) for k in ('left', 'bottom')]
    if 'cog' in res:
        cg = res['cog']; deg = np.degrees(cg['grid']); m = deg < 60
        ax[0].plot(deg[m], cg['cog_Nm'][m] * 1e3, color=ink, lw=1, label="the motor's own bumps" + (' (pretend)' if note else ' (measured)'))
        ax[0].plot(deg[m], (cg['cog_Nm'] - cg['fit_Nm'])[m] * 1e3, color=acc2, lw=1, label='left after the firmware cancels them')
        fret = -0.03 * np.sin(24 * cg['grid'])
        ax[0].plot(deg[m], fret[m] * 1e3, color=acc, lw=2, alpha=.8, label='a software fret, default 0.03 N·m, 24 per turn')
        ax[0].set_xlabel('knob angle, degrees (first 60° of the turn)', color=ink)
        ax[0].set_ylabel('push, mN·m', color=ink)
        ax[0].set_title('Frets you make vs. frets the magnets made', color=ink, loc='left', fontsize=11)
        ax[0].set_ylim(-58, 36); ax[0].legend(frameon=False, fontsize=8, loc='lower left', labelcolor=ink)
    if 'chirp' in res:
        ch = res['chirp']; f = ch['f']; rim = 0.040 * 1e6; V = 3.0
        ff = np.geomspace(10, 400, 300)
        ax[1].loglog(ff, fingertip_threshold_um(ff), color=dim, ls='--', lw=1.2, label='a rough fingertip threshold')
        ax[1].loglog(f, ch['enc'] * rim * V, 'o', ms=4, color=ink, label='encoder (only where it can count)')
        if 'mic' in ch: ax[1].loglog(f, ch['mic'] * rim * V, 'o', ms=8, mfc='none', mew=1.2, color=acc2, label='contact mic, scaled where both hear')
        ax[1].loglog(f, ch['model'] * rim * V, color=acc, lw=2, label=f"fit: winding L = {ch['L']*1e3:.1f} mH")
        ax[1].axvline(196, color=acc, lw=.6, alpha=.5); ax[1].text(200, ax[1].get_ylim()[1] * 0.5, 'G3', color=acc, fontsize=9)
        ax[1].set_xlabel('pitch of the push, Hz', color=ink); ax[1].set_ylabel('rim movement at 3 V of sine, µm', color=ink)
        ax[1].set_title('Can it carry a G? Movement against what a fingertip feels', color=ink, loc='left', fontsize=11)
        ax[1].legend(frameon=False, fontsize=8, loc='lower left', labelcolor=ink)
    if note: fig.suptitle('What the first bench session will hand back' + note, color=dim, fontsize=10, x=0.01, ha='left')
    fig.tight_layout(); fig.savefig(path, dpi=150, facecolor=fig.get_facecolor())

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('csv', nargs='?'); ap.add_argument('--selftest', action='store_true')
    ap.add_argument('--mic', help='the contact-mic WAV recorded during `bench chirp`')
    ap.add_argument('--plot', help='write a picture of the cog map and the chirp curve here')
    ap.add_argument('--header', default=None, help='where to write cog_map.h (default: ../handwheel/cog_map.h for a real capture)')
    ap.add_argument('--disc-mass', type=float, default=0.040); ap.add_argument('--disc-radius', type=float, default=0.040)
    ap.add_argument('--R', type=float, default=7.6, help='per-phase ohms, measured with a meter (half of lead-to-lead)')
    a = ap.parse_args()
    disc_J = 0.5 * a.disc_mass * a.disc_radius ** 2
    by, truth, mic = {}, None, None
    if a.selftest:
        rows, tm = fake_motor(disc_J=disc_J, R=a.R)
        for r in rows: by.setdefault(r[0], []).append(r[1:])
        cogrows, tc = fake_cog(R=a.R); by.update(cogrows)
        chrows, mic, tch = fake_chirp(R=a.R); by['chirp'] = chrows
        truth = dict(motor=tm, cog=tc, chirp=tch)
    else:
        for line in open(a.csv):
            p = line.strip().split(',')
            if len(p) == 6 and p[0] == 'b': by.setdefault(p[1], []).append(tuple(map(float, p[2:])))
        if a.mic: mic = read_wav(a.mic)
        if a.header is None:
            import os; a.header = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'handwheel', 'cog_map.h')
    report(by, a, truth, mic, a.header, a.plot)
