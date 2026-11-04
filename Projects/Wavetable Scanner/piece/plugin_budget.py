"""plugin_budget.py — what the real plugin costs, table by table. Runs the template's harness
(plugin/build/.../WavetableScannerHarness) in `plugin` mode, which drives the actual Processor's
processBlock in 128-sample blocks, the way a host does. For each built-in table: eight notes held,
seven unison copies each (56 oscillators), the cutoff envelope on, Position swept front to back.
The harness's own start-up (building every table's morph and band-limits, about a second) is timed
on a 16-sample run and taken off. Writes plugin_budget.json."""
import json, subprocess, tempfile, time, pathlib
import numpy as np
H = pathlib.Path(__file__).parent
EXE = H.parent / 'plugin/build/WavetableScannerHarness_artefacts/Release/WavetableScannerHarness'
spec = json.loads(subprocess.run([str(EXE), 'params'], capture_output=True, text=True, check=True).stdout)
IDS = [p['id'] for p in spec['params']]
SR, SECS, BLOCK = 48000, 10.0, 128

def job(table, unison_idx, steps):
    v = {p['id']: np.full(steps, float(p['default'])) for p in spec['params']}
    v['table'][:] = table; v['unison'][:] = unison_idx; v['detune'][:] = 18; v['cutoff'][:] = 6000
    v['reso'][:] = 0.3; v['env_to_cutoff'][:] = 2; v['position'][:] = np.linspace(0, 1, steps)
    return np.stack([v[k] for k in IDS]).astype('<f8')

def timed(table, unison_idx, secs):
    steps = max(16, int(secs * SR))
    with tempfile.TemporaryDirectory() as d:
        d = pathlib.Path(d); job(table, unison_idx, steps).tofile(d / 'p.f64')
        notes = [[0, 1, n, 100] for n in (48, 52, 55, 59, 62, 64, 67, 71)]
        np.asarray(notes, '<f8').tofile(d / 'n.f64')
        best = 1e9
        for _ in range(3):
            t0 = time.perf_counter()
            subprocess.run([str(EXE), 'plugin', str(steps), str(SR), str(d / 'p.f64'), str(d / 'o.bin'), '--notes', str(d / 'n.f64'), '--block', str(BLOCK)], check=True, capture_output=True)
            best = min(best, time.perf_counter() - t0)
        return best

rows = []
for t, name in enumerate(['classics', 'cello', 'fm chain']):
    base = timed(t, 0, 0)
    r = {'table': name, 'startup_s': round(base, 2)}
    for u in (0, 2, 6):
        dt = timed(t, u, SECS) - base
        r[f'8x{u + 1}_core_pct'] = round(100 * dt / SECS, 2)
    rows.append(r)
out = dict(sr=SR, block=BLOCK, seconds=SECS, method='best of 3 wall-clock runs of the harness, start-up taken off', rows=rows)
(H / 'plugin_budget.json').write_text(json.dumps(out, indent=1)); print(json.dumps(out, indent=1))
