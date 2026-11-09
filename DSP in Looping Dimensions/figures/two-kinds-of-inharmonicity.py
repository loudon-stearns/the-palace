# Data for two-kinds-of-inharmonicity.tex: lattice inharmonicity (FM at f2/f1 = golden ratio)
# against eigen-inharmonicity (a stiff string, B = 0.0004), both as cents off a harmonic series.
# Run from this folder: python3 two-kinds-of-inharmonicity.py
import math
phi = (1 + 5 ** 0.5) / 2
cents = lambda a, b: 1200 * math.log2(a / b)

# LATTICE · FM, carrier f1 = 1, modulator f2 = phi: lines |1 + k*phi|, sidebands |k| <= 12, sorted.
# Each line is measured against the nearest harmonic of the lowest line (|1 - phi| = 0.618).
lines = sorted(abs(1 + k * phi) for k in range(-12, 13))
f0 = lines[0]
with open('tki-lattice.dat', 'w') as f:
    f.write('rank freq harm cents\n')
    for i, fr in enumerate(lines, 1):
        h = max(1, round(fr / f0))
        f.write(f'{i} {fr:.4f} {h} {cents(fr, h * f0):.2f}\n')

# EIGEN · stiff string: f_n = n f0 sqrt(1 + B n^2), cents above harmonic n
B = 0.0004
with open('tki-eigen.dat', 'w') as f:
    f.write('n cents\n')
    for n in range(1, 31):
        f.write(f'{n} {600 * math.log2(1 + B * n * n):.3f}\n')

lat = [cents(fr, max(1, round(fr / f0)) * f0) for fr in lines]
print(f'lattice: {len(lines)} lines, lowest {f0:.4f}, cents range {min(lat):.1f} .. {max(lat):.1f}')
print(f'eigen: n=1 {600*math.log2(1+B):.3f} c, n=30 {600*math.log2(1+B*900):.1f} c')
