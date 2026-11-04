"""make_tables.py — the plugin's three tables, from the same sources the browser synth bakes in
(synth/build_synth.py): the Sketch's five classics, the cello table and the FM family chain.

Writes, from one read of each source:
  src/Tables.h              the raw frames as float arrays, for Algorithm.h
  reference/tables/<k>.f32  the same floats, for the reference render (ref_render.cjs)
  ui/visualizer.js          the picture, with every frame drawn at 128 points (from visualizer.src.js)

The FM chain goes through int16 on the way, as the page does, so all three homes start
from the same numbers. The morph is not done here: Algorithm.h and the page both run it
on these raw frames at load."""
import base64, json, re, struct, sys
from pathlib import Path
import numpy as np

HERE = Path(__file__).resolve().parent; PLUG = HERE.parent; BUNDLE = PLUG.parent; PACKER = BUNDLE / "packer"
FRAME = 1024

def wav_float(path):
    b = path.read_bytes(); assert b[:4] == b"RIFF"
    i = 12
    while i < len(b):
        cid, n = b[i:i+4], struct.unpack("<I", b[i+4:i+8])[0]
        if cid == b"data": return np.frombuffer(b[i+8:i+8+n], dtype="<f4")
        i += 8 + n + (n & 1)
    sys.exit(f"no data chunk in {path}")

sketch = (BUNDLE / "wavetable_scanner.html").read_text()
classics = json.loads(re.search(r"const TABLES = (\[.*?\]);\n", sketch, re.S).group(1))[0]
fm = wav_float(PACKER / "browser_export_fmsynth_chain_smooth.wav")
tables = [
    ("classics", "classics", np.frombuffer(base64.b64decode(classics["data"]), "<f4")),
    ("cello", "cello", wav_float(PACKER / "demo_cello.wav")),
    ("fm", "fm chain", (np.round(np.clip(fm, -1, 1) * 32767).astype("<i2") / np.float32(32767)).astype("<f4")),
]

(PLUG / "reference" / "tables").mkdir(parents=True, exist_ok=True)
h = ["// Tables.h — written by tools/make_tables.py; don't edit. The raw frames, 1024 samples each,",
     "// before the morph (Algorithm.h runs it at load, as the browser synth does).",
     "#pragma once", "", "namespace wtdata", "{"]
for key, _, x in tables:
    assert len(x) % FRAME == 0
    x = np.ascontiguousarray(x, dtype="<f4")
    x.tofile(PLUG / "reference" / "tables" / f"{key}.f32")
    body = ",".join(f"{float(v):.8e}f" for v in x)
    h.append(f"    inline constexpr int {key}Frames = {len(x) // FRAME};")
    h.append(f"    inline constexpr float {key}[] = {{{body}}};")
h += ["    struct Raw { const float* data; int frames; };",
      "    inline constexpr Raw kRaw[] = { " + ", ".join(f"{{ {k}, {k}Frames }}" for k, _, _ in tables) + " };",
      f"    inline constexpr int kNumTables = {len(tables)};", "}", ""]
(PLUG / "src" / "Tables.h").write_text("\n".join(h))

# the picture's copy: every frame at 128 points, rounded to 1/127
pic = []
for key, label, x in tables:
    fr = x.reshape(-1, FRAME)[:, ::8]
    pic.append({"label": label, "frames": int(fr.shape[0]),
                "data": base64.b64encode(np.round(np.clip(fr, -1, 1) * 127).astype("i1").tobytes()).decode()})
src = (PLUG / "ui" / "visualizer.src.js").read_text()
assert src.count("%%TABLES%%") == 1
(PLUG / "ui" / "visualizer.js").write_text(src.replace("%%TABLES%%", json.dumps(pic)))
print("tables:", [(k, len(x) // FRAME) for k, _, x in tables])
