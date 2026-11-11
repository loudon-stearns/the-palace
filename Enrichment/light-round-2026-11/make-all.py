#!/usr/bin/env python3
"""Light round 2026-11 — every light enrichment on one page, read from the rich faces themselves.
Run from this folder: python3 make-all.py   →  all light enrichments.html
The page is built from each entry's `— rich.json` and the files placed in its bundle, so it shows what a reader of the
palace would meet today (remakes and corrected captions included), not the workshop's roughs."""
import base64, html, io, json, os, re
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
DS = os.path.join(ROOT, "_ops", "drafting-table", "design-system")
batches = [("First forty", json.load(open(os.path.join(HERE, "placements.json")))), ("Third batch", json.load(open(os.path.join(HERE, "placements-3.json"))))]


def b64(d): return base64.b64encode(d).decode()


def media(path):
    ext = path.rsplit(".", 1)[-1].lower()
    if ext in ("m4a", "wav"): return f'<audio controls preload="none" src="data:audio/{"mp4" if ext == "m4a" else "wav"};base64,{b64(open(path, "rb").read())}"></audio>'
    if ext == "svg": return f'<img loading="lazy" src="data:image/svg+xml;base64,{b64(open(path, "rb").read())}">'
    im = Image.open(path).convert("RGB")
    if im.width > 1500: im = im.resize((1500, round(im.height * 1500 / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=80); return f'<img loading="lazy" src="data:image/jpeg;base64,{b64(buf.getvalue())}">'


def prose(s):
    s = html.escape(s); s = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", s)
    return re.sub(r"\s*(<em>(?:What is real and what is a choice|Leaking in):</em>)", r'</p><p class="note">\1', s)


seen, cards, toc, counts = set(), [], [], {"keep": 0, "remade": 0, "reworded": 0, "unchallenged": 0, "sound": 0, "pieces": 0}
for bname, recs in batches:
    for rec in recs:
        page = rec["page"]
        if page in seen: continue
        seen.add(page); base = os.path.join(ROOT, rec["path"][:-3]); name = os.path.basename(base)
        man = json.load(open(os.path.join(base, f"{name} — rich.json")))
        for sec in man["sections"]:
            ps = [p for p in sec.get("pieces", []) if "light round" in (p.get("by") or "")]
            if not ps: continue
            ch = sec.get("challenge") or {}; verdict = {v["file"]: v["verdict"] for v in ch.get("verdicts", [])}; remade = {r["file"]: r.get("kind", "") for r in ch.get("remade", [])}
            i = 0
            while i < len(ps):
                group = [ps[i]]
                if ps[i]["file"].endswith((".m4a", ".wav")) and i + 1 < len(ps) and "picture" in ps[i + 1]["file"]: group.append(ps[i + 1]); i += 1
                i += 1
                files = [g["file"] for g in group]; sound = files[0].endswith((".m4a", ".wav"))
                state = "reworded" if files[0] in remade and all("word" in remade.get(f, "word") and "file was remade" not in remade.get(f, "") for f in files) else "remade" if any(f in remade for f in files) else ("keep" if any(verdict.get(f) for f in files) else "unchallenged")
                counts[state] += 1; counts["pieces"] += 1; counts["sound"] += sound
                title = group[0]["title"]; anchor = f"p{counts['pieces']}"
                pic = next((g for g in group if not g["file"].endswith((".m4a", ".wav"))), None); snd = group[0] if sound else None
                body = (media(os.path.join(base, pic["file"])) if pic else "") + (media(os.path.join(base, snd["file"])) if snd else "")
                caps = "".join(f'<p class="cap">{prose(g["caption"])}</p>' for g in ([pic] if pic else []) + ([snd] if snd else []) if g.get("caption"))
                label = {"keep": "challenged · kept", "remade": "challenged · rebuilt", "reworded": "challenged · words corrected", "unchallenged": "not yet challenged"}[state]
                cards.append(f'<section class="piece" id="{anchor}"><header><span class="num">{counts["pieces"]:02d}</span><h2>{html.escape(page)}</h2>'
                             f'<span class="state {state}">{label}</span></header><h3>{html.escape(title)}{" · sound" if sound else ""} '
                             f'<a href="http://localhost:5173/rich/?entry={html.escape(page).replace(" ", "%20")}">open in the palace →</a></h3>{body}{caps}</section>')
                toc.append(f'<a href="#{anchor}" class="{state}">{html.escape(page)}{" ♪" if sound else ""}</a>')

css = open(os.path.join(DS, "colors_and_type.css")).read() + open(os.path.join(DS, "bundle.css")).read(); js = open(os.path.join(DS, "transport.js")).read()
doc = f"""<!doctype html><html lang="en" data-theme="paper"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>All Light Enrichments</title>
<style>{css}
html,body{{margin:0;background:var(--ground-000);color:var(--ink);font-family:var(--font-mono,'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace)}}
html{{scroll-behavior:smooth}}main{{max-width:1000px;margin:0 auto;padding:28px 16px 80px}}
.top{{border:1.5px solid var(--ink);padding:16px 18px;margin-bottom:22px}}.top h1{{font-size:19px;letter-spacing:.22em;margin:0 0 8px;text-transform:uppercase}}
.top p{{margin:0 0 4px;font-size:12.5px;line-height:19px;color:var(--ink-2);max-width:86ch}}
.toc{{display:flex;flex-wrap:wrap;gap:6px 8px;margin:0 0 30px}}.toc a{{font-size:11px;line-height:16px;padding:3px 7px;border:1px solid var(--rule);color:var(--ink-2);text-decoration:none}}
.toc a:hover{{border-color:var(--ink);color:var(--ink)}}.toc a.remade,.toc a.reworded{{border-color:var(--accent)}}.toc a.unchallenged{{border-style:dashed}}
.piece{{border-top:1.5px solid var(--ink);padding:14px 0 30px;scroll-margin-top:8px}}.piece header{{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}}
.num{{font-size:12px;color:var(--accent);font-weight:700}}.piece h2{{font-size:16px;margin:0;letter-spacing:.03em}}
.state{{font-size:10.5px;margin-left:auto;text-transform:uppercase;letter-spacing:.12em;color:var(--ink-3)}}.state.remade,.state.reworded{{color:var(--accent)}}
.piece h3{{font-size:13px;font-weight:400;color:var(--ink-2);margin:4px 0 10px}}.piece h3 a{{font-size:11px;color:var(--ink-3);margin-left:10px}}
.piece img{{display:block;width:100%;height:auto;border:1px solid var(--rule);margin-bottom:6px}}
.cap{{font-size:13px;line-height:21px;margin:10px 0 2px;max-width:78ch}}.note{{font-size:11.5px;line-height:17px;margin:2px 0 0;color:var(--ink-3);max-width:86ch}}.note em{{font-style:normal;color:var(--ink-2)}}
.key{{font-size:11px;color:var(--ink-3);margin:0 0 10px}}.key span{{display:inline-block;padding:1px 6px;border:1px solid var(--rule);margin-right:6px}}.key .r{{border-color:var(--accent)}}.key .u{{border-style:dashed}}
</style></head><body><main>
<div class="top"><h1>All light enrichments</h1>
<p>{counts["pieces"]} pieces on {len(seen)} pages, {counts["sound"]} of them sounds with a picture. Each is one small thing set beside one sentence of its page. Every one is a proposal: none is approved.</p>
<p>Of the forty a challenger has read, {counts["keep"]} were kept as made, {counts["remade"]} were rebuilt and {counts["reworded"]} had their words corrected. The other {counts["unchallenged"]} have not been challenged yet. No sound here has been listened to by anyone.</p>
<p>Built from the rich faces as they stand, so this is what the palace shows today.</p></div>
<p class="key"><span>kept</span><span class="r">rebuilt or reworded</span><span class="u">not yet challenged</span> ♪ marks a sound</p>
<nav class="toc">{''.join(toc)}</nav>
{''.join(cards)}
</main><script>{js}</script></body></html>"""
open(os.path.join(HERE, "all light enrichments.html"), "w").write(doc)
print("all light enrichments.html", f"{len(doc)/1e6:.1f} MB", counts, len(seen), "pages")
