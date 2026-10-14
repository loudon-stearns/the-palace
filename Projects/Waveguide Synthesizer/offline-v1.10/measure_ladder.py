# Checks the ladder against the sound: for each headless pluck in ladder-probe.json,
# finds each overtone's real peak in the audio (Hann, zero-padded FFT, parabolic
# interpolation, searched within a third of the note around where the ladder says
# it is) and reports how many cents the ladder's bar is off the sound's peak.
import json, numpy as np
SR = 48000
rows = json.load(open('ladder-probe.json')); out = []
for r in rows:
    a = np.fromfile(f"raw/{r['key']}.f32", dtype=np.float32)[int(0.03*SR):int(1.0*SR)]
    w = a * np.hanning(len(a)); NF = 1 << 21
    X = np.abs(np.fft.rfft(w, NF)); hz = np.arange(len(X)) * SR / NF
    f0 = r['freq']; errs = []; meas = []
    for n, fl in enumerate(r['freqs'], 1):
        lo, hi = np.searchsorted(hz, [fl - f0/3, fl + f0/3])
        k = lo + int(np.argmax(X[lo:hi]))
        y0, y1, y2 = np.log(X[k-1:k+2] + 1e-20); d = 0.5*(y0-y2)/(y0-2*y1+y2)
        fm = (k + d) * SR / NF; lvl = 20*np.log10(X[k] / X.max() + 1e-12)
        meas.append(fm)
        if lvl > -50: errs.append(abs(1200*np.log2(fl/fm)))
    m1 = meas[0]
    sharp_meas = {n: round(1200*np.log2(meas[n-1]/(n*m1)), 1) for n in (2, 4, 8, 16) if n <= len(meas)}
    out.append({'key': r['key'], 'ladder_cents': {n: round(r['cents'][n-1], 1) for n in (2,4,8,16)},
                'sound_cents': sharp_meas, 'worst_bar_vs_sound_cents': round(max(errs), 2), 'bars_checked': len(errs),
                'fundamental_hz': round(m1, 2)})
for o in out: print(o['key'], 'ladder', o['ladder_cents'], 'sound', o['sound_cents'], 'worst', o['worst_bar_vs_sound_cents'], 'n', o['bars_checked'], 'f1', o['fundamental_hz'])
json.dump(out, open('ladder-vs-sound.json', 'w'), indent=1)
