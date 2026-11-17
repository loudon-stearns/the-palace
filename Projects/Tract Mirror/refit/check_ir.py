"""Independent check: FFT peaks of each refit tube's rendered impulse response (lip lowpass ON)
against the state-matrix 'as sung' formants refit.py gated on."""
import json, os, sys
import numpy as np
from scipy.signal import find_peaks
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, "..", "reference")]
import kl_reference as kl
R = json.load(open(os.path.join(HERE, "vowels-refit.json")))["vowels"]
fs = 44100
out = {}
for v, d in R.items():
    A = kl.resample_area(np.array(d["area_cm2"]), kl.n_sections(fs))
    h = kl.tract_impulse_response(A, fs, n=1 << 16, radiation_lowpass=0.75)
    H = 20 * np.log10(np.abs(np.fft.rfft(h)) + 1e-12)
    f = np.fft.rfftfreq(len(h), 1 / fs)
    pk, _ = find_peaks(H, prominence=3)
    pk = [round(float(f[p])) for p in pk if f[p] > 90][:3]
    out[v] = {"fft_peaks_hz": pk, "state_matrix_hz": [round(x) for x in d["formants_measured_44k_hz"]]}
    print(v, out[v])
json.dump(out, open(os.path.join(HERE, "check-ir.json"), "w"), indent=1)
