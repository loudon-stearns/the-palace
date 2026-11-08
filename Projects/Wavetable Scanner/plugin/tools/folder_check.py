"""folder_check.py — do the folder slots play what the files hold?

Builds a folder of tables in five shapes, points the plugin at it ($WTSC_TABLES), and renders
the same passage (two notes two octaves apart, Position swept front to back) from two places
that hold the same frames, through both the engine and the real processBlock. Writes
folder_check.json.

  a_fm_float.wav            the built-in fm chain's raw frames as a float WAV: must match bit for bit
  b_cello.wt                the cello's raw frames as a float Surge .wt: must match bit for bit
  c_fm_ableton.wav          the study page's Ableton export of its FM chain (16-bit): close to e
  d_fm_serum.wav            the study page's Serum / Vital export (CLM, 2048-sample frames): close to e
  e_fm.wt                   the study page's Surge export (float, 1024): the reference for c and d
  f_not_a_table.wav         one 600-sample cycle: not a table, so skipped; slot 6 stays empty

The study page's FM chain is packed in the page and isn't the plugin's built-in one, so the
exports are checked against each other. "Close" means the difference's RMS is 60 dB below the
signal's; the peak is recorded beside it. 16-bit rounding can tip a phase-lock decision on a
quiet harmonic, so the Ableton file's peak lands near -52 dB for a tenth of a second.
"""
import json, os, shutil, struct, subprocess, sys, tempfile
from pathlib import Path
import numpy as np

PLUG = Path(__file__).resolve().parent.parent; BUNDLE = PLUG.parent
H = PLUG / "build/WavetableScannerHarness_artefacts/Release/WavetableScannerHarness"
SR, STEPS = 48000, 48000 * 3
EXP = BUNDLE / "packer/exports"

def wav_f32(path, x):
    x = np.asarray(x, "<f4"); d = x.tobytes()
    path.write_bytes(b"RIFF" + struct.pack("<I", 36 + len(d)) + b"WAVE" + b"fmt " + struct.pack("<IHHIIHH", 16, 3, 1, 44100, 44100 * 4, 4, 32)
                     + b"data" + struct.pack("<I", len(d)) + d)

def wt_f32(path, x, L=1024):
    x = np.asarray(x, "<f4"); path.write_bytes(b"vawt" + struct.pack("<IHH", L, len(x) // L, 0) + x.tobytes())

params = json.loads(subprocess.check_output([str(H), "params"]))["params"]
IDS = [p["id"] for p in params]

def render(mode, table, folder):
    v = np.array([p["default"] for p in params], "f8")
    paths = np.repeat(v[:, None], STEPS, axis=1)
    paths[IDS.index("table")] = table
    paths[IDS.index("position")] = np.linspace(0, 1, STEPS)
    paths[IDS.index("a_release")] = 0.3
    notes = np.array([[0, 1, 48, 100], [0, 1, 72, 100], [STEPS - 9600, 0, 48, 0], [STEPS - 9600, 0, 72, 0]], "f8")
    with tempfile.TemporaryDirectory() as t:
        t = Path(t); paths.astype("<f8").tofile(t / "p.f64"); notes.astype("<f8").tofile(t / "n.f64")
        env = dict(os.environ, WTSC_TABLES=str(folder))
        subprocess.check_call([str(H), mode, str(STEPS), str(SR), str(t / "p.f64"), str(t / "o.bin"), "--notes", str(t / "n.f64")]
                              + (["--block", "256"] if mode == "plugin" else []), env=env)
        b = (t / "o.bin").read_bytes()
    out = np.frombuffer(b[:2 * STEPS * 4], "<f4").reshape(2, STEPS)
    probes = np.frombuffer(b[2 * STEPS * 4:], "<f8").reshape(-1, STEPS)
    return out, probes

def db(x): return round(float(20 * np.log10(max(x, 1e-12))), 1)

folder = Path(tempfile.mkdtemp(prefix="wtsc-folder-"))
ref = PLUG / "reference/tables"
wav_f32(folder / "a_fm_float.wav", np.fromfile(ref / "fm.f32", "<f4"))
wt_f32(folder / "b_cello.wt", np.fromfile(ref / "cello.f32", "<f4"))
shutil.copy(EXP / "akwf_fmsynth_family_chain_ableton.wav", folder / "c_fm_ableton.wav")
shutil.copy(EXP / "akwf_fmsynth_family_chain_serum.wav", folder / "d_fm_serum.wav")
shutil.copy(EXP / "akwf_fmsynth_family_chain.wt", folder / "e_fm.wt")
wav_f32(folder / "f_not_a_table.wav", np.sin(2 * np.pi * np.arange(600) / 600))

rows = []
NAMES = {1: "built-in cello", 2: "built-in fm chain", 7: "folder 5 (e_fm.wt)"}
cases = [("a_fm_float.wav", 2, 3, "bit for bit"), ("b_cello.wt", 1, 4, "bit for bit"),
         ("c_fm_ableton.wav", 7, 5, "close"), ("d_fm_serum.wav", 7, 6, "close"),
         ("f_not_a_table.wav (skipped)", 2, 8, "empty slot plays the fm chain")]
for mode in ("engine", "plugin"):
    base = {t: render(mode, t, folder)[0] for t in (1, 2, 7)}
    for name, builtin, slot, want in cases:
        out, pr = render(mode, slot, folder)
        a = base[builtin]; peak = float(np.abs(a).max()); diff = float(np.abs(out - a).max())
        rms = float(np.sqrt(((out - a) ** 2).mean()) / np.sqrt((a ** 2).mean()))
        rows.append(dict(mode=mode, file=name, slot=f"folder {slot - 2}", against=NAMES[builtin],
                         want=want, max_diff=diff, diff_db_re_peak=db(diff / peak) if diff else "exact",
                         rms_diff_db=db(rms) if diff else "exact",
                         folder_probe=int(pr[2][-1])))
        print(rows[-1])

ok = all(r["max_diff"] == 0 for r in rows if r["want"] != "close") and \
     all(r["rms_diff_db"] == "exact" or r["rms_diff_db"] < -60 for r in rows if r["want"] == "close") and \
     all(r["folder_probe"] == (-1 if "skipped" in r["file"] else 1) for r in rows)
Path(PLUG / "tools/folder_check.json").write_text(json.dumps(dict(ok=ok, folder="(a temporary folder)", rows=rows), indent=1))
shutil.rmtree(folder)
print("ok" if ok else "FAILED")
sys.exit(0 if ok else 1)
