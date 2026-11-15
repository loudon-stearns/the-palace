"""Mermaid test, 2026-11-15: two untried families (sequence, state) on two grounds, and
two routes into an html proof.

Run from the palace root:
    python3 "Shop/Mermaid/proofs/2026-11-15-sequence-state-paper/make.py"

What it does, in order:
  1. writes palace-mermaid-paper.json from the design tokens (palace_mermaid_theme.py
     skin-drafting), and a copy pinned to the old dagre layout (Mermaid 12 lays out
     with ELK by default);
  2. renders sequence.mmd and state.mmd with mmdc (npx) on Graphite and on Paper, plus
     the state diagram on Paper under dagre; times each, renders each twice and
     compares the bytes, parses each SVG as XML;
  3. writes two html proofs on the Drafting Table paper ground:
       routes-svg-inline.html  the SVGs inlined (no script, no network but the font)
       routes-client-side.html mermaid 12.3.0 from jsdelivr, pinned with SRI,
                               rendering the same text in the reader's browser;
  3b. if beautiful.mjs has run, its two SVGs join route A for comparison;
  4. runs measure.mjs (headless Chromium from mmdc's own puppeteer) for text overflow,
     the face actually used, and both html routes inside a sandboxed frame.
Everything measured lands in measured.json. Technique is the maker's to better: a maker
who can do this another way does, and leaves the comparison on the scroll.
"""
import base64
import hashlib
import json
import shutil
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
SHOP = HERE.parents[1]                       # Shop/Mermaid
GRAPHITE = SHOP / "palace-mermaid.json"
PAPER = HERE / "palace-mermaid-paper.json"
PAPER_DAGRE = HERE / "palace-mermaid-paper-dagre.json"
MMDC = ["npx", "-y", "-p", "@mermaid-js/mermaid-cli@12.2.0", "mmdc", "-q"]
GROUND = {"graphite": "#0a0a0f", "paper": "#f0eee5"}
CDN = "https://cdn.jsdelivr.net/npm/mermaid@12.3.0/dist/mermaid.min.js"

subprocess.run(["python3", str(SHOP / "palace_mermaid_theme.py"), "skin-drafting", "--out", str(PAPER)], check=True)
cfg = json.loads(PAPER.read_text()); cfg["layout"] = "dagre"
PAPER_DAGRE.write_text(json.dumps(cfg, indent=2) + "\n")


def with_notes(base, out):
    """The house config plus what it leaves out for sequence diagrams: notes in the
    skin's own tokens (Mermaid's yellow otherwise), one face for the measuring, and
    wrap on: a note over two actors is as wide as the span between them, and with
    wrap off a long note's text runs out of its box (first run of this proof)."""
    c = json.loads(base.read_text()); v = c["themeVariables"]
    v.update(noteBkgColor=v["secondaryColor"], noteTextColor=v["primaryTextColor"],
             noteBorderColor=v["primaryBorderColor"],
             stateLabelColor=v["primaryTextColor"])   # state labels read this, not nodeTextColor (#333 otherwise)
    face = v["fontFamily"]
    c["sequence"] = dict(noteFontFamily=face, actorFontFamily=face, messageFontFamily=face, wrap=True)
    out.write_text(json.dumps(c, indent=2) + "\n")
    return out


GRAPHITE_NOTES = with_notes(GRAPHITE, HERE / "palace-mermaid-graphite-notes.json")
PAPER_NOTES = with_notes(PAPER, HERE / "palace-mermaid-paper-notes.json")

JOBS = [  # (out name, source, config, ground)
    ("sequence-graphite", "sequence.mmd", GRAPHITE, "graphite"),
    ("sequence-paper", "sequence.mmd", PAPER, "paper"),
    ("sequence-graphite-notes", "sequence.mmd", GRAPHITE_NOTES, "graphite"),
    ("sequence-paper-notes", "sequence.mmd", PAPER_NOTES, "paper"),
    ("state-graphite", "state.mmd", GRAPHITE, "graphite"),
    ("state-paper", "state.mmd", PAPER, "paper"),
    ("state-paper-dagre", "state.mmd", PAPER_DAGRE, "paper"),
    ("state-graphite-notes", "state.mmd", GRAPHITE_NOTES, "graphite"),
]


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def render(name, src, conf, ground, out):
    t = time.time()
    r = subprocess.run(MMDC + ["-c", str(conf), "-b", GROUND[ground], "-I", name.replace("-", "_"),
                               "-i", str(HERE / src), "-o", str(out)], capture_output=True, text=True)
    return round(time.time() - t, 2), r.returncode, r.stderr.strip()[-400:]


results = {}
tmp = HERE / "_rerun"; tmp.mkdir(exist_ok=True)
for name, src, conf, ground in JOBS:
    out = HERE / f"{name}.svg"
    t1, rc1, err1 = render(name, src, conf, ground, out)
    t2, rc2, err2 = render(name, src, conf, ground, tmp / f"{name}.svg")
    rec = dict(source=src, config=conf.name, ground=GROUND[ground], seconds_first=t1, seconds_second=t2,
               exit=[rc1, rc2], stderr=err1 or err2 or None)
    if out.exists():
        try:
            root = ET.parse(out).getroot()
            rec.update(parses=True, bytes=out.stat().st_size, viewBox=root.get("viewBox"),
                       byte_identical_on_rerun=sha(out) == sha(tmp / f"{name}.svg"),
                       trebuchet_in_style="trebuchet" in out.read_text().lower())
        except ET.ParseError as e:
            rec.update(parses=False, error=str(e))
    results[name] = rec
    print(name, rec.get("seconds_first"), rec.get("byte_identical_on_rerun"))
shutil.rmtree(tmp)

# ── the two html routes, on the Drafting Table paper ground ──────────────────
HEAD = """<!doctype html>
<html lang="en" data-theme="paper"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap">
<style>
:root{{--ground-000:#f0eee5;--ground-100:#e6e3d7;--ink:#1a1916;--ink-2:#3a3a35;--ink-3:#6a6862;--rule:#b8b09a;--accent:#c8261a}}
html{{color-scheme:light}} body{{margin:0;background:var(--ground-000);color:var(--ink);
font:15px/1.5 'JetBrains Mono','IBM Plex Mono',monospace}}
main{{max-width:1100px;margin:0 auto;padding:24px 16px}}
.eyebrow{{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2)}}
h1{{font-size:22px;font-weight:600;margin:4px 0 12px}}
p{{max-width:80ch;color:var(--ink-2);font-size:13px}}
.grid{{display:grid;grid-template-columns:1fr;gap:16px}}
figure{{margin:0;border:1px solid var(--rule);padding:12px}}
figure.dark{{background:#0a0a0f}}
figure svg{{max-width:100%;height:auto;display:block;margin:0 auto}}
figcaption{{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2);margin-top:8px}}
figure.dark figcaption{{color:#8a8aa0}}
.block{{border-top:2px solid var(--ink);margin-top:24px;padding-top:6px;font-size:11px;color:var(--ink-2)}}
</style>
{extra}</head><body><main>
"""
FOOT = """<div class="block">MERMAID · TEST PROOF · 2026-11-15 · STUDY · {route}<br>
source Shop/Mermaid/proofs/2026-11-15-sequence-state-paper/ · made by make.py · nobody has seen this yet</div>
</main></body></html>
"""
CAPTION = {
    "sequence-paper": "sequence · paper config (skin-drafting tokens)",
    "sequence-graphite": "sequence · graphite config (the card's)",
    "state-paper": "state · paper · ELK layout (Mermaid 12 default)",
    "state-paper-dagre": "state · paper · dagre layout (the old default)",
    "state-graphite": "state · graphite · ELK",
    "state-graphite-notes": "state · graphite + stateLabelColor · ELK",
    "sequence-paper-beautiful": "sequence · paper · beautiful-mermaid 1.1.3, no browser (zoom-out try)",
    "state-paper-beautiful": "state · paper · beautiful-mermaid 1.1.3, no browser (zoom-out try)",
    "sequence-paper-notes": "sequence · paper + note tokens and one measuring face",
    "sequence-graphite-notes": "sequence · graphite + note tokens and one measuring face",
}


def strip_xml(svg):
    return svg.split("?>", 1)[1] if svg.startswith("<?xml") else svg


figs = []
for name in ("sequence-paper", "sequence-graphite", "sequence-paper-notes", "sequence-graphite-notes",
             "state-paper", "state-paper-dagre", "state-graphite", "state-graphite-notes",
             "sequence-paper-beautiful", "state-paper-beautiful"):
    if not (HERE / f"{name}.svg").exists():   # the beautiful-mermaid pair, made by beautiful.mjs
        continue
    cls = ' class="dark"' if "graphite" in name else ""
    figs.append(f'<figure{cls} data-name="{name}">{strip_xml((HERE / f"{name}.svg").read_text())}'
                f"<figcaption>{CAPTION[name]}</figcaption></figure>")
(HERE / "routes-svg-inline.html").write_text(
    HEAD.format(title="Mermaid two grounds", extra="")
    + '<div class="eyebrow">Mermaid · route A · SVG made by mmdc, inlined</div>\n'
      "<h1>Sequence and state, on paper and on graphite</h1>\n"
      "<p>Each figure is an SVG rendered ahead of time by mermaid-cli and pasted in. The page runs no "
      "script. Which ground reads better here, does the ELK or the dagre state diagram read better, and do the note-token variants fix the yellow note?</p>\n"
    + '<div class="grid">\n' + "\n".join(figs) + "\n</div>\n" + FOOT.format(route="route A: inline SVG"))

# route B: the same text, rendered in the reader's browser, pinned and hashed
local = next(Path.home().glob(".npm/_npx/*/node_modules/mermaid/dist/mermaid.min.js"), None)
lib = None
if local:
    ver = json.loads((local.parents[1] / "package.json").read_text())["version"]
    lib = dict(local_version=ver, sri="sha384-" + base64.b64encode(hashlib.sha384(local.read_bytes()).digest()).decode())
paper_vars = json.loads(PAPER_NOTES.read_text())
src = {n: (HERE / f"{n}.mmd").read_text() for n in ("sequence", "state")}
blocks = "\n".join(
    f'<figure data-name="client-{n}"><pre class="mermaid">{t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")}</pre>'
    f"<figcaption>{n} · rendered in this browser · paper + note tokens · ELK default</figcaption></figure>"
    for n, t in src.items())
script = (f'<script src="{CDN}" integrity="{lib["sri"] if lib else ""}" crossorigin="anonymous"></script>\n'
          "<script>\n"
          f"const cfg = {json.dumps(paper_vars)};\n"
          "window.__mermaid = {done:false, error:null};\n"
          "mermaid.initialize(Object.assign({startOnLoad:false, securityLevel:'strict'}, cfg));\n"
          "document.fonts.ready.then(() => mermaid.run({querySelector:'pre.mermaid'}))\n"
          "  .then(() => { window.__mermaid.done = true; })\n"
          "  .catch(e => { window.__mermaid.error = String(e); document.body.dataset.err = String(e); });\n"
          "</script>\n")
(HERE / "routes-client-side.html").write_text(
    HEAD.format(title="Mermaid in the browser", extra="")
    + '<div class="eyebrow">Mermaid · route B · text rendered in the reader\'s browser</div>\n'
      "<h1>The same two diagrams, drawn here from their text</h1>\n"
      "<p>This page carries the Mermaid source and loads mermaid 12.3.0 from jsdelivr, pinned by its hash. "
      "It waits for JetBrains Mono before it lays out, so the boxes are measured in the face they show.</p>\n"
    + '<div class="grid">\n' + blocks + "\n</div>\n" + script + FOOT.format(route="route B: client-side, CDN"))

# ── measure in a browser ─────────────────────────────────────────────────────
t = time.time()
m = subprocess.run(["node", str(HERE / "measure.mjs")], capture_output=True, text=True)
browser = json.loads(m.stdout) if m.returncode == 0 and m.stdout.strip() else dict(error=m.stderr[-800:])
browser["seconds"] = round(time.time() - t, 1)

mmdc_v = subprocess.run(MMDC[:-1] + ["--version"], capture_output=True, text=True).stdout.strip()
(HERE / "measured.json").write_text(json.dumps(dict(
    date="2026-11-15", mermaid_cli=mmdc_v, mermaid_lib=lib, cdn=CDN, renders=results,
    html={p.name: dict(bytes=p.stat().st_size) for p in sorted(HERE.glob("routes-*.html"))},
    browser=browser), indent=1) + "\n")
print("wrote measured.json")
