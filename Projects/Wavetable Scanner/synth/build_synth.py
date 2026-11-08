"""Build wavetable_synth.html (one folder up) from page.html, wt-synth.js and
../packer/packer.js, with three tables baked in so the page plays on open:
the Sketch's five classics, the cello table and the FM family chain (blur 1),
both packed by packer.js, plus the two tables the Synth Templates cards draw
for themselves and the cards' patches (cards.json, from build_cards.py). One file, nothing fetched but the design system's CSS."""
import base64, json, re, struct, sys
from pathlib import Path
import numpy as np
HERE = Path(__file__).parent; BUNDLE = HERE.parent; PACKER = BUNDLE / "packer"

def wav_float(path):
    b = path.read_bytes(); assert b[:4] == b"RIFF"
    i = 12
    while i < len(b):
        cid, n = b[i:i+4], struct.unpack("<I", b[i+4:i+8])[0]
        if cid == b"data": return np.frombuffer(b[i+8:i+8+n], dtype="<f4")
        i += 8 + n + (n & 1)
    sys.exit(f"no data chunk in {path}")

sketch = (BUNDLE / "wavetable_scanner.html").read_text()
m = re.search(r"const TABLES = (\[.*?\]);\n", sketch, re.S)
classics = json.loads(m.group(1))[0]
tables = [{"key": "classics", "label": "Classics — sine → tri → saw → square → bell", "frames": classics["frames"],
           "frameNames": classics["frameNames"], "data": classics["data"]}]
cello = json.loads((PACKER / "demo_cello.json").read_text())
tables.append({"key": "cello", "label": "AKWF_cello — 19 cycles, dull → bright", "frames": cello["frames"], "frameNames": cello["frameNames"],
               "data": base64.b64encode(wav_float(PACKER / "demo_cello.wav").astype("<f4").tobytes()).decode()})
fm = wav_float(PACKER / "browser_export_fmsynth_chain_smooth.wav")
tables.append({"key": "fm", "label": "AKWF_fmsynth — 122 cycles, family chain, blur 1", "frames": len(fm) // 1024, "frameNames": [],
               "int16": True, "data": base64.b64encode(np.round(np.clip(fm, -1, 1) * 32767).astype("<i2").tobytes()).decode()})
assert len(fm) % 1024 == 0
cards = json.loads((HERE / "cards.json").read_text())   # build_cards.py
for k, t in cards["tables"].items(): tables.append({"key": k, **t})

page = (HERE / "page.html").read_text()
for key, val in [("%%PACKER%%", (PACKER / "packer.js").read_text()), ("%%WT_SYNTH%%", (HERE / "wt-synth.js").read_text()),
                 ("%%TABLES%%", json.dumps(tables)), ("%%CARDS%%", json.dumps(cards["cards"]))]:
    if page.count(key) != 1: sys.exit(f"{key} found {page.count(key)}x")
    page = page.replace(key, val)
out = BUNDLE / "wavetable_synth.html"
out.write_text(page)
print(f"{out.name}: {len(page)//1024} KB, tables {[t['frames'] for t in tables]}")
