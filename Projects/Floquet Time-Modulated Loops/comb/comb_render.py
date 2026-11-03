"""
comb_render.py — the pumped comb, heard. Karplus-Strong with tanh in the loop.

  a  ratio 1, pump depth eps ramps 0 -> 0.10 over 8 s: crack into a self-held buzz
  b  ratio 2, same ramp: two pulse slots per trip; this seed fills them opposite, odd harmonics only
  c  eps 0.2 held, pump rate glides ratio 0.99 -> 1.01 over 8 s: sound only near 1
  d  a plucked string whose LENGTH is pumped at 1.5*f0 (+-0.6 samples), gain unpumped:
     the Floquet ladder lands halfway between the string's harmonics; 2 s plain, then 2 s pumped
Noise floor input 1e-4. Each file is peak-normalised to -1 dBFS after a 5 ms fade.
"""
import numpy as np, json
from scipy.io import wavfile
FS = 48000; L = 218; F0 = FS / (L + 0.5); G0 = 0.98

def run(dur, eps_fn, ratio_fn, len_dev=None, pluck=False, seed=3, noise=1e-4):
    N = int(dur * FS); rng = np.random.default_rng(seed)
    buf = np.zeros(N + L + 4); off = L + 4
    if pluck: buf[off - L - 2: off] = rng.uniform(-1, 1, L + 2)
    nz = noise * rng.uniform(-1, 1, N)
    t = np.arange(N) / FS
    ph = 2 * np.pi * np.cumsum(ratio_fn(t) * F0) / FS
    g = G0 * (1 + eps_fn(t) * np.cos(ph))
    dl = L + (len_dev(t) if len_dev is not None else np.zeros(N))
    out = np.empty(N)
    for n in range(N):
        d = dl[n]; i = int(d); fr = d - i; k = off + n
        a = buf[k - i] * (1 - fr) + buf[k - i - 1] * fr          # y[n-d]
        b = buf[k - i - 1] * (1 - fr) + buf[k - i - 2] * fr      # y[n-d-1]
        y = np.tanh(g[n] * 0.5 * (a + b) + nz[n])
        buf[k] = y; out[n] = y
    return out

def pitch(x):
    x = x * np.hanning(len(x)); X = np.abs(np.fft.rfft(x, 1 << 18)); f = np.fft.rfftfreq(1 << 18, 1 / FS)
    m = (f > 60) & (f < 3000); return float(f[m][np.argmax(X[m])])

def save(name, x):
    fade = int(0.005 * FS); x = x.copy(); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    pk = np.abs(x).max(); x = x / pk * 10 ** (-1 / 20)
    wavfile.write(name, FS, (x * 32767).astype(np.int16)); return float(pk)

ramp = lambda t: 0.10 * t / 8
rep = {"f0": F0}
a = run(8, ramp, lambda t: np.ones_like(t)); rep["a_peak"] = save("comb_a_ratio1_crack.wav", a)
b = run(8, ramp, lambda t: 2 * np.ones_like(t)); rep["b_peak"] = save("comb_b_ratio2_hollow.wav", b)
c = run(8, lambda t: 0.2 * np.ones_like(t), lambda t: 0.99 + 0.02 * t / 8); rep["c_peak"] = save("comb_c_glide_through_lock.wav", c)
d = run(4, lambda t: 0 * t, lambda t: np.ones_like(t), len_dev=lambda t: 0.6 * np.sin(2 * np.pi * 1.5 * F0 * t), pluck=True, noise=0)
d0 = run(4, lambda t: 0 * t, lambda t: np.ones_like(t), len_dev=lambda t: 0 * t, pluck=True, noise=0)
rep["d_peak"] = save("comb_d_length_pumped_pluck.wav", np.concatenate([d0[:2*FS], d[:2*FS]]))

def env_db(x, win=2400):
    r = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, "valid")[::win]); return 20 * np.log10(r + 1e-12)
for nm, x in (("a", a), ("b", b)):
    e = env_db(x); thr = e[: len(e) // 8].max() + 20
    i = np.argmax(e > thr); rep[f"{nm}_crack_s"] = round(i * 2400 / FS, 2); rep[f"{nm}_crack_eps"] = round(0.10 * i * 2400 / FS / 8, 4)
    rep[f"{nm}_floor_dB"] = round(float(np.median(e[: len(e) // 8])), 1); rep[f"{nm}_top_dB"] = round(float(np.median(e[-len(e)//8:])), 1)
    rep[f"{nm}_pitch_end"] = round(pitch(x[-FS:]), 2)
ec = env_db(c); rep["c_loud_window_s"] = [round(float(np.argmax(ec > ec.max() - 20)) * 0.05, 2), round(float(len(ec) - np.argmax(ec[::-1] > ec.max() - 20)) * 0.05, 2)]
rep["c_ratio_at_window"] = [round(0.99 + 0.02 * s / 8, 5) for s in rep["c_loud_window_s"]]
# ladder on the length-pumped pluck
X = np.abs(np.fft.rfft(d[: FS] * np.hanning(FS))); f = np.fft.rfftfreq(FS, 1 / FS); X0 = np.abs(np.fft.rfft(d0[:FS] * np.hanning(FS)))
top = X.max(); top0 = X0.max()
lad = {}
def lvl(S, fr, ref): j = np.argmin(abs(f - fr)); return round(20*np.log10(S[j-3:j+4].max()/ref),1)
for k in (0.5, 1.5, 2.5, 3.5): lad[f"{k}f0_pumped_dB"] = lvl(X, k*F0, top); lad[f"{k}f0_plain_dB"] = lvl(X0, k*F0, top0)
Xb = np.abs(np.fft.rfft(b[-FS:] * np.hanning(FS))); tb = Xb.max()
rep["b_harmonics_dB"] = {f"h{k}": lvl(Xb, k*F0, tb) for k in (1,2,3,4,5,6)}
rep["d_ladder"] = lad
json.dump(rep, open("comb_render.json", "w"), indent=1); print(json.dumps(rep, indent=1))
