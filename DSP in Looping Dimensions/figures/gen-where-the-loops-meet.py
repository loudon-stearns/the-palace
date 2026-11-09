# Data for where-the-loops-meet.tex: four ways two loops meet, each with what it does to the sound.
# Run from this folder: python3 gen-where-the-loops-meet.py
import math, re
phi = (1 + 5 ** 0.5) / 2

# 1 · one table, read at two phases: lines at m*f1 + n*f2 (f1 = 1, f2 = phi), weight falls with |m| + |n|
with open('wlm-lattice.dat', 'w') as f:
    f.write('freq amp axis\n')
    for m in range(-4, 6):
        for n in range(-4, 5):
            fr = m + n * phi
            if 0.05 < fr < 5.6 and abs(m) + abs(n) <= 5:
                axis = 1 if (m == 0 or n == 0) else 0
                f.write(f'{fr:.4f} {0.62 ** (abs(m) + abs(n) - 1):.4f} {axis}\n')

# 2 · two combs in a row: echoes at j*T1 + k*T2 (T1 = 1, T2 = phi), gains a^j * b^k
with open('wlm-echoes.dat', 'w') as f:
    f.write('time amp\n')
    for j in range(0, 9):
        for k in range(0, 6):
            t = j + k * phi
            if t < 7.6:
                f.write(f'{t:.4f} {0.86 ** j * 0.86 ** k:.4f}\n')

# 3 · one loop, bent: partials n*sqrt(1 + B n^2), exaggerated B so the stretch shows in ten partials
B = 0.004
with open('wlm-stretch.dat', 'w') as f:
    f.write('freq amp\n')
    for n in range(1, 11):
        f.write(f'{n * math.sqrt(1 + B * n * n):.4f} {1 / n ** 0.5:.4f}\n')

# 4 · two loops that push back: the golden pair (220 and 136 Hz), coupling ramped up and back down,
# slips per second counted over 1 s blocks (ramp.mjs 220 135.967 0.34 60)
up, down = [], []
for line in open('../proofs/2026-11-05-sustained/ramp-golden.txt'):
    m = re.match(r'(up|down)\s+c=([\d.]+)\s+A (\d+)\s+B (\d+)\s+slips/s (\d+)', line)
    if m:
        d, c, a, b, s = m.groups()
        (up if d == 'up' else down).append((float(c), int(s)))
up = up[1:]  # the first block still holds the start-up
for name, rows in (('wlm-up.dat', up), ('wlm-down.dat', down)):
    with open(name, 'w') as f:
        f.write('c slips\n')
        for c, s in rows:
            f.write(f'{c:.4f} {min(s, 100)}\n')
print('lattice, echoes, stretch, up', len(up), 'down', len(down))
