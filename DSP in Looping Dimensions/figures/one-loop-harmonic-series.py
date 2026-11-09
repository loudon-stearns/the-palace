# Data for one-loop-harmonic-series.tex: one feedback loop of length T, and the frequencies it can hold.
# The circuit: y = z^-T (x + g y), so H(f) = e^{-j2pi fT} / (1 - g e^{-j2pi fT}) and |H| = 1 / |1 - g e^{-j2pi fT}|.
# Peaks sit where one trip is a whole number of cycles: f = k / T.
# Run from this folder: python3 one-loop-harmonic-series.py
import numpy as np

g = 0.8                      # feedback gain
x = np.linspace(0, 6.5, 6501)  # frequency x T, i.e. f in units of 1/T
mag = 1 / np.abs(1 - g * np.exp(-2j * np.pi * x))

with open('olhs-comb.dat', 'w') as f:
    f.write('fT mag\n')
    for a, b in zip(x[::5], mag[::5]):
        f.write(f'{a:.4f} {b:.4f}\n')

# verify: local maxima of |H| on the fine grid
i = np.where((mag[1:-1] > mag[:-2]) & (mag[1:-1] >= mag[2:]))[0] + 1
print('peaks at f*T =', [round(float(v), 4) for v in x[i]], '(+ DC at 0)')
print('peak height', round(float(mag.max()), 4), '= 1/(1-g) =', round(1 / (1 - g), 4))
print('trough height', round(float(mag.min()), 4), '= 1/(1+g) =', round(1 / (1 + g), 4))
