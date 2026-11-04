# title: Tone.js — challenge — recompute
# born: 2026-11-04
# links: [[Tone.js]] (connects-to · challenge-check) · recomputes the sixty-pushes battery by another route
# forward_vector: I redo the maker's numbers without Web Audio: phase accumulators in numpy, the explorer's tick
#   as written, the equation per sample, and my own meters, so a number that only the piece's engine gives shows up.
# python3 "Shop/Tone.js/Tone.js — challenge — recompute.py"
import numpy as np
SR = 48000; TAU = 2 * np.pi

def pushed(fA, fB, K, T, rate, ramp=0, stall_at=None, stall=0.0):
    """The explorer's tick in its order: f from phases as they stand, phases stepped by f*dt (dt since last
    frame, clamp 0.05), the same f pushed now and held until the next push. Audio = phase accumulator."""
    N = int(round(T * SR)); fa_s = np.full(N, float(fA)); fb_s = np.full(N, float(fB))
    tA = tB = 0.0; w = wprev = 0.0; n = 0; extra = 0.0; stalled = False; events = []
    while w < T:
        dt = min(0.05, w - wprev); wprev = w
        k = K * min(1, w / ramp) if ramp else K
        s = np.sin(tB - tA); fa, fb = fA + k * s, fB - k * s
        tA = (tA + TAU * fa * dt) % TAU; tB = (tB + TAU * fb * dt) % TAU
        events.append((int(round(w * SR)), fa, fb)); n += 1
        if stall_at is not None and not stalled and w >= stall_at: stalled = True; extra += stall - 1 / rate
        w = n / rate + extra
    for i, (i0, fa, fb) in enumerate(events):
        i1 = events[i + 1][0] if i + 1 < len(events) else N
        fa_s[i0:i1] = fa; fb_s[i0:i1] = fb
    pa = np.concatenate([[0], np.cumsum(TAU * fa_s / SR)[:-1]]); pb = np.concatenate([[0], np.cumsum(TAU * fb_s / SR)[:-1]])
    return pa, pb

def per_sample(fA, fB, K, T, ramp=0):
    N = int(round(T * SR)); pa = np.empty(N); pb = np.empty(N); tA = tB = 0.0; dt = 1 / SR
    kk = (K * np.minimum(1, np.arange(N) / (SR * ramp))) if ramp else np.full(N, float(K))
    # scalar loop is slow; vectorise nothing, but N up to 16 s * 48k = 768k: fine in pure python? use chunks
    import math
    s_ = math.sin
    for n in range(N):
        pa[n] = tA; pb[n] = tB; s = s_(tB - tA); k = kk[n]
        tA += TAU * (fA + k * s) * dt; tB += TAU * (fB - k * s) * dt
    return pa, pb

def beat(pa, pb, t0, t1):
    i0, i1 = int(t0 * SR), int(t1 * SR) - 1
    g = pb - pa
    return (g[i1] - g[i0]) / TAU / (t1 - t0)

def whole_beats(pa, pb, t0, t1):
    g = (pb - pa)[int(t0 * SR):int(t1 * SR)] / TAU; c = np.floor(g); idx = np.nonzero(np.diff(c))[0]
    if len(idx) < 2: return (g[-1] - g[0]) / (t1 - t0)
    return (len(idx) - 1) / ((idx[-1] - idx[0]) / SR)

def lock_swing(pa, pb, t0, t1):
    g = np.diff(pb - pa)[int(t0 * SR):int(t1 * SR)] * SR / TAU
    return g.max() - g.min()

def band_db(x, lo, hi, clo, chi):
    N = 1 << 18; seg = x[-N:] * np.hanning(N); P = np.abs(np.fft.rfft(seg)) ** 2; f = np.fft.rfftfreq(N, 1 / SR)
    return 10 * np.log10(P[(f >= lo) & (f <= hi)].sum() / P[(f >= clo) & (f <= chi)].sum() + 1e-30)

def level(x, t0): s = x[int(t0 * SR):]; return 10 * np.log10(np.mean(s * s))

out = []
p = lambda *a: (print(*a, flush=True), out.append(' '.join(map(str, a))))
# 1-2: beats
for K in (0, 0.5, 0.9, 0.99):
    a = pushed(220, 222, K, 16, 60); b = per_sample(220, 222, K, 16)
    adler = np.sqrt(max(0, 4 - 4 * K * K))
    p(f'beat K={K}: pushed {whole_beats(*a, 8, 16):.3f} per-sample {whole_beats(*b, 8, 16):.3f} Adler {adler:.3f}')
# 3: lock K (under one beat in 8 s)
for name, fn in (('pushed', lambda K: pushed(220, 222, K, 16, 60)), ('per-sample', lambda K: per_sample(220, 222, K, 16))):
    for i in range(11):
        K = 0.95 + 0.01 * i
        if abs(beat(*fn(K), 8, 16)) < 0.125: p(f'lock K {name}: {K:.2f}'); break
# 4: locked gap at K 1.5
a = pushed(220, 222, 1.5, 16, 60); b = per_sample(220, 222, 1.5, 16)
g = lambda pa, pb: np.angle(np.mean(np.exp(1j * (pb - pa)[8 * SR:])))
p(f'K=1.5 locked gap: pushed {g(*a):.3f} per-sample {g(*b):.3f} phi* {np.arcsin(2/3):.3f} offset {g(*a)-g(*b):.3f} (2pi*2/60={TAU*2/60:.3f})')
# 5,6: staircase sideband in the sum
for (fA, fB, K) in ((220, 222, 0.9), (220, 232.5, 6)):
    f0 = (fA + fB) / 2; r = {}
    for name, (pa, pb) in (('pushed', pushed(fA, fB, K, 12, 60)), ('per-sample', per_sample(fA, fB, K, 12))):
        x = np.sin(pa) + np.sin(pb)
        r[name] = max(band_db(x, f0 + 45, f0 + 75, f0 - 20, f0 + 20), band_db(x, f0 - 75, f0 - 45, f0 - 20, f0 + 20))
    p(f'staircase df={fB-fA} K={K}: pushed {r["pushed"]:.1f} dB per-sample {r["per-sample"]:.1f} dB')
# 7: swing at K 6
p('swing K=6 at 60/30/20: ' + ' '.join(f'{lock_swing(*pushed(220, 222, 6, 10, r), 5, 10):.2f}' for r in (60, 30, 20)))
# 8: onset
for r in (60, 30, 20):
    pred = np.sqrt((r / TAU) ** 2 + 1); k0 = np.floor((pred - 0.5) * 10) / 10
    for i in range(11):
        K = k0 + 0.1 * i
        if lock_swing(*pushed(220, 222, K, 10, r), 5, 10) > 1: p(f'onset at {r}/s: {K:.1f} (pred {pred:.2f})'); break
# onset at 60/s for the largest gap that can still lock with K<=6 (df 12): is it inside the slider?
p('onset at 60/s, df=12 (K_c=6, the explorer\'s largest lockable gap): pred ' + f'{np.sqrt((60/TAU)**2 + 36):.2f}')
# 9: tones 100 Hz apart, tone A alone
r = {}
for name, (pa, pb) in (('pushed', pushed(120, 220, 6, 12, 60)), ('per-sample', per_sample(120, 220, 6, 12))):
    x = np.sin(pa); r[name] = max(band_db(x, 99, 101, 119, 121), band_db(x, 139, 141, 119, 121))
    r[name + '100'] = band_db(x, 219, 221, 119, 121)
p(f'df=100 K=6, tone A line 20 Hz off: pushed {r["pushed"]:.1f} per-sample {r["per-sample"]:.1f}; line 100 Hz off: pushed {r["pushed100"]:.1f} per-sample {r["per-sample100"]:.1f}')
# 10: open loop, K ramp 0->1.5 over 6 s, sum level in the lock vs per sample
b = per_sample(220, 222, 1.5, 16, ramp=6); L0 = level(np.sin(b[0]) + np.sin(b[1]), 10)
a = pushed(220, 222, 1.5, 16, 60, ramp=6); p(f'open loop on schedule: {level(np.sin(a[0]) + np.sin(a[1]), 10) - L0:.2f} dB')
st = []
for S in (0.06, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5):
    a = pushed(220, 222, 1.5, 16, 60, ramp=6, stall_at=2, stall=S); st.append(level(np.sin(a[0]) + np.sin(a[1]), 10) - L0)
p('one stalled frame 60-500 ms at t=2: ' + ' '.join(f'{v:.1f}' for v in st))
# bound: the best a shifted gap can do
p(f'locked-sum ceiling vs per sample: +{20*np.log10(1/np.cos(np.arcsin(2/3)/2)):.2f} dB; floor: -inf')
