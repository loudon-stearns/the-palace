# Plucks and strikes through v1.3's and v1.4's worklets, same score, and
# compares them: did the bow's changes under the hood (ends that hold at DC,
# double-precision rails, a DC blocker on the output) change the pluck?
import json, os, subprocess, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000
RUNNER = os.path.join(HERE, '..', 'offline-v1', 'run_worklet.mjs')
def run(html, freq, mode, stiff):
    ev = [{'t': 0, 'msg': {'type': 'params', 'freq': freq, 'stiff': stiff}},
          {'t': 0.001, 'msg': {'type': 'pluck', 'position': 0.3, 'mode': mode}}]
    json.dump({'sampleRate': SR, 'seconds': 2.0, 'events': ev}, open('/tmp/wg-v14/p.json', 'w'))
    subprocess.run(['node', RUNNER, html, '/tmp/wg-v14/p.json', '/tmp/wg-v14/p.f32'], check=True, capture_output=True)
    return np.fromfile('/tmp/wg-v14/p.f32', np.float32)
rows = []
for freq, mode, stiff in [(82.41, 'pluck', 0), (196, 'pluck', 0), (196, 'strike', 0), (440, 'pluck', 0), (261.63, 'strike', 1.0)]:
    a = run(os.path.join(HERE, '..', 'study-v1.3-audible', 'index.html'), freq, mode, stiff)
    b = run(os.path.join(HERE, '..', 'study-v1.4-bow', 'index.html'), freq, mode, stiff)
    def spec_peak(x):
        w = x[960:960+24000] * np.hanning(24000); sp = np.abs(np.fft.rfft(w, 1 << 20)); fr = np.fft.rfftfreq(1 << 20, 1/SR)
        lo, hi = np.searchsorted(fr, [freq*0.8, freq*1.2]); return fr[lo + np.argmax(sp[lo:hi])]
    da = 20*np.log10(np.sqrt(np.mean(a**2))); db = 20*np.log10(np.sqrt(np.mean(b**2)))
    diff = 20*np.log10(np.sqrt(np.mean((a-b)**2)) / np.sqrt(np.mean(a**2)))
    def decay(x):   # dB lost from the first half-second to the last
        return 20*np.log10(np.sqrt(np.mean(x[-24000:]**2)) / np.sqrt(np.mean(x[:24000]**2)))
    rows.append([f'{freq:g} Hz {mode}' + (f' stiff {stiff:g}' if stiff else ''), f'{da:.1f}', f'{db:.1f}',
                 f'{decay(a):.1f}', f'{decay(b):.1f}',
                 f'{1200*np.log2(spec_peak(b)/spec_peak(a)):+.2f}', f'{diff:.0f}'])
    print(rows[-1])
json.dump({'columns': ['note', 'v1.3 rms dB', 'v1.4 rms dB', 'v1.3 decay over 1.5 s (dB)', 'v1.4 decay (dB)', 'pitch shift (cents)', 'difference signal vs v1.3 (dB)'], 'rows': rows},
          open(os.path.join(HERE, 'pluck-vs-v1.3.json'), 'w'), indent=1)
