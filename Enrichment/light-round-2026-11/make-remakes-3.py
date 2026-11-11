#!/usr/bin/env python3
"""Light round 2026-11 — the second remake pass (the third batch's 22), as one sheet.
Reads remakes-3a.json and remakes-3b.json, written by the two makers, and builds remakes-3.html. python3 make-remakes-3.py"""
import base64, html, io, json, os, subprocess, tempfile
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
DS = os.path.join(ROOT, "_ops", "drafting-table", "design-system")
recs = json.load(open(os.path.join(HERE, "remakes-3a.json"))) + json.load(open(os.path.join(HERE, "remakes-3b.json")))
b64 = lambda d: base64.b64encode(d).decode()
def figure(p):
    if p.endswith(".svg"): return f'<img loading="lazy" src="data:image/svg+xml;base64,{b64(open(p, "rb").read())}">'
    buf = io.BytesIO(); Image.open(p).convert("RGB").save(buf, "JPEG", quality=84); return f'<img loading="lazy" src="data:image/jpeg;base64,{b64(buf.getvalue())}">'
def audio(p):
    with tempfile.TemporaryDirectory() as t:
        o = os.path.join(t, "a.m4a"); subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "128000", p, o], check=True)
        return f'<audio controls preload="none" src="data:audio/mp4;base64,{b64(open(o, "rb").read())}"></audio>'
cards = []
for r in recs:
    for f in r["files"]: assert os.path.exists(os.path.join(HERE, f)), f
    media = "".join((audio if f.endswith(".wav") else figure)(os.path.join(HERE, f)) for f in sorted(r["files"], key=lambda f: f.endswith(".wav")))
    cards.append(f'<section class="piece"><header><h2>{html.escape(r["page"])}</h2><span class="kind">{r["kind"]}</span></header><h3>{html.escape(r["title"])}</h3>'
                 f'<p class="chg">What changed: {html.escape(r["changed"])}</p>{media}<p class="cap">{html.escape(r["caption"])}</p>'
                 + (f'<p class="leak">Leaking in: {html.escape(r["leak"])}</p>' if r.get("leak") else "") + f'<p class="honest">{html.escape(r["honest"])}</p>'
                 + (f'<p class="honest">New anchor: “{html.escape(r["near"])}”</p>' if r.get("near") else "") + '</section>')
css = open(os.path.join(DS, "colors_and_type.css")).read() + open(os.path.join(DS, "bundle.css")).read(); js = open(os.path.join(DS, "transport.js")).read()
page = f"""<!doctype html><html lang="en" data-theme="paper"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Second Remakes</title>
<style>{css}
html,body{{margin:0;background:var(--ground-000);color:var(--ink);font-family:var(--font-mono,'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace)}}
main{{max-width:1160px;margin:0 auto;padding:28px 16px 64px}}.top{{border:1.5px solid var(--ink);padding:14px 16px;margin-bottom:28px}}
.top h1{{font-size:18px;letter-spacing:.22em;margin:0 0 6px;text-transform:uppercase}}.top p{{margin:0;font-size:12px;line-height:18px;color:var(--ink-3)}}
.piece{{border-top:1.5px solid var(--ink);padding:14px 0 26px}}.piece header{{display:flex;align-items:baseline;gap:12px}}.piece h2{{font-size:15px;margin:0}}
.kind{{font-size:11px;color:var(--ink-3);margin-left:auto;text-transform:uppercase;letter-spacing:.12em}}.piece h3{{font-size:13px;font-weight:400;color:var(--ink-2);margin:4px 0 8px}}
.piece img{{display:block;width:100%;height:auto;border:1px solid var(--rule);margin-top:8px}}.chg{{font-size:12px;line-height:19px;margin:0 0 4px;color:var(--accent);max-width:96ch}}
.cap{{font-size:13px;line-height:21px;margin:12px 0 4px;max-width:78ch}}.leak{{font-size:12px;line-height:18px;margin:0 0 2px;color:var(--ink-2);max-width:90ch}}.honest{{font-size:11px;line-height:17px;margin:0;color:var(--ink-3);max-width:96ch}}
</style></head><body><main><div class="top"><h1>The second remakes</h1>
<p>Light round, the third batch's {len(recs)} flagged pieces rebuilt · 2026-11-11 · made by two workshop makers from the challengers' reports. Shown at about the band's width.
The red line under each title says what was wrong. None has been challenged again, and no sound has been heard.</p></div>{''.join(cards)}</main><script>{js}</script></body></html>"""
open(os.path.join(HERE, "remakes-3.html"), "w").write(page); print("remakes-3.html", f"{len(page)/1e6:.1f} MB ·", len(recs), "records")
