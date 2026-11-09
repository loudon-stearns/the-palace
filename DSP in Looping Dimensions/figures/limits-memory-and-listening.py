# Data for limits-memory-and-listening.tex. Run from this folder: python3 limits-memory-and-listening.py
#   lml-memory.dat   table size in bytes (float32) for N = 1..6 loops at r = 32, 64, 128, 256 samples per axis
#   lml-listen.dat   share of 100-4000 Hz energy in the loudest tenth of FFT bins, by window length,
#                    for noise and for the tone at 1..6 loops
# Panel (b) is not transcribed: it runs the listen-longer piece's own engine (its <script id="engine">)
# under node, with the exact signals and parameters of the piece and of its checks.mjs
# (fs 48000, f0 220 Hz, 6 s, band 100-4000 Hz, Hann windows of 1024..262144 samples, every whole window averaged).
import json, math, subprocess, os

here = os.path.dirname(os.path.abspath(__file__))
face = os.path.normpath(os.path.join(here, '..'))
piece = os.path.join(face, 'DSP in Looping Dimensions — rich — listen longer.html')

# ---------- (a) memory ----------
RS, NS = [32, 64, 128, 256], range(1, 7)
with open(os.path.join(here, 'lml-memory.dat'), 'w') as f:
    f.write('N ' + ' '.join(f'r{r}' for r in RS) + '\n')
    for N in NS:
        f.write(f'{N} ' + ' '.join(f'{4 * r ** N:.6g}' for r in RS) + '\n')
assert 4 * 256 ** 3 == 64 * 2 ** 20      # three loops at 256: 64 MB (MiB)
assert 4 * 32 ** 6 == 4 * 2 ** 30        # six loops at 32: 4 GB (GiB)
print('memory: N=3 r=256', 4 * 256 ** 3 / 2 ** 20, 'MiB · N=6 r=32', 4 * 32 ** 6 / 2 ** 30, 'GiB · harmonics/loop', [r // 2 for r in RS])

# ---------- (b) listening, on the piece's engine ----------
js = r'''
const { readFileSync } = await import('node:fs');
const s = readFileSync(process.argv[1], 'utf8'), m = s.match(/<script id="engine">([\s\S]*?)<\/script>/);
const E = new Function(`${m[1]}; return { tone, noise, topAt };`)();
const FS = 48000, ns = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144], out = { ns, noise: [] };
const nz = E.noise(6, FS, 5); out.noise = ns.map((n) => E.topAt(nz, FS, n, 100, 4000));
for (let L = 1; L <= 6; L++) { const t = E.tone(L, 220, 6, FS); out['l' + L] = ns.map((n) => E.topAt(t, FS, n, 100, 4000)); }
console.log(JSON.stringify(out));
'''
res = json.loads(subprocess.run(['node', '--input-type=module', '-e', js, piece], capture_output=True, text=True, check=True).stdout)
FS = 48000
with open(os.path.join(here, 'lml-listen.dat'), 'w') as f:
    f.write('win noise l1 l2 l3 l4 l5 l6\n')
    for i, n in enumerate(res['ns']):
        f.write(f'{n / FS:.6f} ' + ' '.join(f'{100 * res[k][i]:.3f}' for k in ['noise', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6']) + '\n')
pc = lambda k: [round(100 * v, 1) for v in res[k]]
print('windows ms', [round(1000 * n / FS) for n in res['ns']])
for k in ['noise', 'l1', 'l2', 'l6']:
    print(k, pc(k))
# the published numbers
nz = pc('noise'); assert (min(nz), max(nz)) == (34.5, 36.2), nz
assert pc('l1')[1] > 99 and pc('l1')[0] < 99            # past 99 % by 43 ms
assert pc('l2')[5] == 99.9 and pc('l2')[4] < 99.9       # 99.9 % by 0.68 s
assert pc('l6')[0] == 40.7 and pc('l6')[-1] == 51.2     # six loops 40.7 -> 51.2 %
print('published numbers reproduced')
