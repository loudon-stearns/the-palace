#!/usr/bin/env python3
"""Light round 2026-11-2 — every placed piece of this round on one page, read from the rich faces themselves.
Run from this folder: python3 make-page.py  →  all pieces.html
A piece is found by its manifest's `made_in.workshop` pointing into this workshop, so the page shows what the palace
shows today. Pieces still in the workshop and not yet placed are not on it."""
import base64, html, io, json, os, re
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
DS = os.path.join(ROOT, "_ops", "drafting-table", "design-system")
ROUND = "Enrichment/light-round-2026-11-2/"
cands = {c["title"]: c["path"] for c in json.load(open(os.path.join(HERE, "candidates.json")))}


def b64(d): return base64.b64encode(d).decode()


def media(path):
    ext = path.rsplit(".", 1)[-1].lower()
    if ext == "m4a": return f'<audio controls preload="none" src="data:audio/mp4;base64,{b64(open(path, "rb").read())}"></audio>'
    if ext == "svg": return f'<img src="data:image/svg+xml;base64,{b64(open(path, "rb").read())}">'
    if ext == "md": return ""
    im = Image.open(path).convert("RGB")
    if im.width > 2000: im = im.resize((2000, round(im.height * 2000 / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "PNG", optimize=True); return f'<img src="data:image/png;base64,{b64(buf.getvalue())}">'


def prose(s):
    s = html.escape(s); s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s); s = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", s); return re.sub(r"`([^`]+)`", r"<code>\1</code>", s)


def account(path):
    t = open(path).read(); t = re.sub(r"^---.*?---\s*", "", t, flags=re.S)
    out = []
    for block in re.split(r"\n\s*\n", t.strip()):
        lines = block.split("\n")
        if all(l.lstrip().startswith(("- ", "* ")) for l in lines): out.append("<ul>" + "".join(f"<li>{prose(l.lstrip()[2:])}</li>" for l in lines) + "</ul>")
        elif lines[0].startswith("#"): out.append(f"<h4>{prose(lines[0].lstrip('# '))}</h4>" + (f"<p>{prose(' '.join(lines[1:]))}</p>" if lines[1:] else ""))
        else: out.append(f"<p>{prose(' '.join(lines))}</p>")
    return "".join(out)


cards, toc, n, sounds = [], [], 0, 0
order = sorted(os.listdir(os.path.join(HERE, "pieces")), key=lambda p: os.path.getmtime(os.path.join(HERE, "pieces", p, "jobs.json")) if os.path.exists(os.path.join(HERE, "pieces", p, "jobs.json")) else 0)
for page in order:
    if page not in cands: continue
    base = os.path.join(ROOT, cands[page][:-3]); name = os.path.basename(base); mp = os.path.join(base, f"{name} — rich.json")
    if not os.path.exists(mp): continue
    for sec in json.load(open(mp))["sections"]:
        ps = [p for p in sec.get("pieces", []) if ROUND in json.dumps(p.get("made_in", "")) or ROUND in p.get("by", "")]
        if not ps: continue
        n += 1; ch = sec.get("challenge") or {}
        snd = next((p for p in ps if p["file"].endswith(".m4a")), None); pic = next((p for p in ps if p["file"].endswith((".png", ".svg"))), None); acc = next((p for p in ps if p["file"].endswith(".md")), None)
        sounds += bool(snd); head = (snd or pic)
        body = (media(os.path.join(base, pic["file"])) if pic else "") + (media(os.path.join(base, snd["file"])) if snd else "")
        caps = "".join(f'<p class="cap">{prose(p["caption"])}</p>' for p in (pic, snd) if p and p.get("caption"))
        verdicts = "".join(f'<li>{prose(str(v.get("verdict", "")))}{": " + prose(str(v.get("why", v.get("reason", v.get("note", ""))))) if v.get("why") or v.get("reason") or v.get("note") else ""}</li>' for v in ch.get("verdicts", []))
        remade = "".join(f'<li>{prose(str(r.get("what", r.get("kind", r.get("note", "")))))}{"<br><b>Second verdict</b> " + prose(str(r["second_verdict"])) if r.get("second_verdict") else ""}</li>' for r in ch.get("remade", []))
        made = prose(head.get("by", ""))
        cards.append(f'<section class="piece" id="p{n}"><header><span class="num">{n:02d}</span><h2>{html.escape(page)}</h2><span class="state">proposal · {"unheard" if snd else "challenged, remade once, kept"}</span></header>'
                     f'<h3>{html.escape(head["title"])}{" · sound" if snd else ""} <a href="http://localhost:5173/rich/?entry={html.escape(page).replace(" ", "%20")}">open in the palace →</a></h3>'
                     f'<p class="near">beside: “{html.escape(head.get("near", ""))}” — § {html.escape(sec.get("heading", ""))}</p>{body}{caps}'
                     f'<p class="made"><b>Made with</b> {made}</p>'
                     + (f'<details><summary>The challenge: verdicts and what was remade</summary><ul>{verdicts}</ul>{"<p><b>Remade</b></p><ul>" + remade + "</ul>" if remade else ""}</details>' if verdicts or remade else "")
                     + (f'<details><summary>What is real and what is a choice (the maker\'s account, whole)</summary><div class="acc">{account(os.path.join(base, acc["file"]))}</div></details>' if acc else "") + '</section>')
        toc.append(f'<a href="#p{n}">{html.escape(page)}{" ♪" if snd else ""}</a>')

css = open(os.path.join(DS, "colors_and_type.css")).read() + open(os.path.join(DS, "bundle.css")).read(); js = open(os.path.join(DS, "transport.js")).read()
doc = f"""<!doctype html><html lang="en" data-theme="paper"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Light round two — all pieces</title>
<style>{css}
html,body{{margin:0;background:var(--ground-000);color:var(--ink);font-family:var(--font-mono,'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace)}}
html{{scroll-behavior:smooth}}main{{max-width:1000px;margin:0 auto;padding:28px 16px 80px}}
.top{{border:1.5px solid var(--ink);padding:16px 18px;margin-bottom:22px}}.top h1{{font-size:19px;letter-spacing:.22em;margin:0 0 8px;text-transform:uppercase}}
.top p{{margin:0 0 4px;font-size:12.5px;line-height:19px;color:var(--ink-2);max-width:86ch}}
.toc{{display:flex;flex-wrap:wrap;gap:6px 8px;margin:0 0 30px}}.toc a{{font-size:11px;line-height:16px;padding:3px 7px;border:1px solid var(--rule);color:var(--ink-2);text-decoration:none}}.toc a:hover{{border-color:var(--ink);color:var(--ink)}}
.piece{{border-top:1.5px solid var(--ink);padding:14px 0 34px;scroll-margin-top:8px}}.piece header{{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}}
.num{{font-size:12px;color:var(--accent);font-weight:700}}.piece h2{{font-size:16px;margin:0;letter-spacing:.03em}}.state{{font-size:10.5px;margin-left:auto;text-transform:uppercase;letter-spacing:.12em;color:var(--ink-3)}}
.piece h3{{font-size:13px;font-weight:400;color:var(--ink-2);margin:4px 0 4px}}.piece h3 a{{font-size:11px;color:var(--ink-3);margin-left:10px}}
.near{{font-size:11.5px;line-height:17px;color:var(--ink-3);margin:0 0 10px;max-width:86ch}}
.piece img{{display:block;width:100%;height:auto;border:1px solid var(--rule);margin-bottom:6px}}.piece audio{{width:100%;margin:6px 0}}
.cap{{font-size:13px;line-height:21px;margin:10px 0 2px;max-width:78ch}}.made{{font-size:11.5px;line-height:17px;color:var(--ink-3);margin:8px 0 6px;max-width:86ch}}.made b{{color:var(--ink-2)}}
details{{margin:6px 0;font-size:12px;line-height:19px;color:var(--ink-2);max-width:86ch}}summary{{cursor:pointer;color:var(--ink)}}details ul{{padding-left:18px;margin:6px 0}}.acc h4{{font-size:12px;margin:12px 0 2px}}.acc p{{margin:4px 0}}code{{font-size:11px}}
</style></head><body><main>
<div class="top"><h1>Light round two — all pieces</h1>
<p>{n} pieces placed so far, {sounds} of them sounds with a picture. Each was made by its own maker from its own reading of one page, read by its own challenger, remade once, and given a second verdict. Every one is a proposal: none is approved.</p>
<p>No sound here has been heard by anyone. Each was checked by measurement only.</p>
<p>Built from the rich faces as they stand. The round's process is in process.md beside this file; what each group of five taught is in pauses/.</p></div>
<nav class="toc">{''.join(toc)}</nav>
{''.join(cards)}
</main><script>{js}</script></body></html>"""
open(os.path.join(HERE, "all pieces.html"), "w").write(doc)
print("all pieces.html", f"{len(doc)/1e6:.1f} MB", n, "pieces", sounds, "sounds")
