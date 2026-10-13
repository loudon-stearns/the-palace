# Watches the bowed string at every 4th sample, late in a steady note, and
# checks it is Helmholtz motion: the string a two-segment shape with one sharp
# corner, the corner tracing a lens between the ends, and the bow point moving
# at bow speed (stick) most of the cycle, then flying back (slip).
import json, os, subprocess, sys, numpy as np
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, '..', 'study-v1.4-bow', 'index.html')
RUNNER = os.path.join(HERE, '..', 'offline-v1', 'run_worklet.mjs')
SR = 48000
speed, force, pos = [float(a) for a in sys.argv[1:4]] if len(sys.argv) > 3 else (0.5, 0.5, 0.88)
F = float(sys.argv[4]) if len(sys.argv) > 4 else 196.0
TAG = sys.argv[5] if len(sys.argv) > 5 else "bow-helmholtz-check"
ev = [{'t': 0, 'msg': {'type': 'params', 'freq': F}},
      {'t': 0.001, 'msg': {'type': 'bow', 'on': True, 'speed': speed, 'force': force, 'position': pos}}]
sc = '/tmp/wg-v14/shape.json'; os.makedirs('/tmp/wg-v14', exist_ok=True)
json.dump({'sampleRate': SR, 'seconds': 1.06, 'events': ev, 'blockSize': 4, 'probeEvery': 4, 'probeSeconds': 1.06}, open(sc, 'w'))
subprocess.run(['node', RUNNER, HTML, sc, '/tmp/wg-v14/shape.f32', '/tmp/wg-v14/vis.f32'], check=True, capture_output=True)
x = np.fromfile('/tmp/wg-v14/shape.f32', np.float32)
V = np.fromfile('/tmp/wg-v14/vis.f32', np.float32).reshape(-1, 180)
P = SR / F; per = P / 4                       # frames per cycle
start = int(1.0 * SR / 4)
cyc = V[start:start + int(3 * per)]
bi = int(round(pos * 179))
vb = np.diff(cyc[:, bi]) / 4                    # bow-point velocity, displacement per sample
fig, ax = plt.subplots(1, 3, figsize=(15, 4.2), facecolor='#0b0d10')
for a in ax:
    a.set_facecolor('#0b0d10'); a.tick_params(colors='#8a929b')
    for s in a.spines.values(): s.set_color('#2a323b')
xs = np.linspace(0, 1, 180)
for k in range(8):
    fr = cyc[int(k * per / 8)]
    ax[0].plot(xs, fr, color=plt.cm.Oranges(0.35 + 0.08 * k), lw=1.4)
ax[0].plot(xs, cyc[:int(per)].max(0), color='#556070', lw=0.8, ls='--')
ax[0].plot(xs, cyc[:int(per)].min(0), color='#556070', lw=0.8, ls='--')
ax[0].axvline(pos, color='#e8e2d4', lw=0.6)
ax[0].set_title('the string at 8 moments of one cycle\n(dashed: the lens the corner traces; line: bow)', color='#cfd3d8', fontsize=10)
t_ms = np.arange(len(vb)) * 4 / SR * 1000
ax[1].plot(t_ms, vb, color='#ff7a3d', lw=1)
vbow = 0.25 * (0.002 + 0.010 * speed) * F / 196
ax[1].axhline(vbow, color='#e8e2d4', lw=0.6, ls=':')
ax[1].set_title('velocity at the bow point, 3 cycles\n(dotted: the bow\'s own speed — stick rides it)', color='#cfd3d8', fontsize=10)
ax[1].set_xlabel('ms', color='#8a929b')
seg = x[int(1.0 * SR):int(1.0 * SR + 3 * P)]
ax[2].plot(np.arange(len(seg)) / SR * 1000, seg, color='#ff7a3d', lw=1)
ax[2].set_title('what you hear: the pickup, 3 cycles', color='#cfd3d8', fontsize=10)
ax[2].set_xlabel('ms', color='#8a929b')
plt.tight_layout()
out = os.path.join(HERE, TAG + ".png")
plt.savefig(out, dpi=110, facecolor='#0b0d10')
stick = np.mean(np.abs(vb - vbow) < 0.25 * vbow)
print(json.dumps({'stick_fraction': round(float(stick), 3), 'expected_stick_fraction': round(pos, 3),
                  'bow_speed': vbow, 'vb_min': float(vb.min()), 'vb_max': float(vb.max()), 'png': out}))
