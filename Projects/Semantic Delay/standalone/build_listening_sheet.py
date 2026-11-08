"""
Semantic Delay — the listening sheet
====================================

Both open ear-checks on one page, so they cost one sitting instead of two:

  A. The melody knob, through the helper: the same phrase echoed three times,
     each echo loosening its grip on your melody (locked, half, free).
     From stage4_wander_through_helper.py.
  B. Speed against quality: the same phrase converted at four settings, from
     today's (slowest) to the fastest. From stage15_latency_bench.py.

Every clip is the same 4.5 s phrase (SoulX's example vocal, 14.0-18.5 s), so
the dry phrase at the top is the reference for both. The page stands alone:
each clip is encoded to MP3 and inlined, so it plays inside the board's
sandbox with nothing fetched. It wears Drafting Table's Paper ground, with the
tokens inlined because a sandboxed page cannot link the palace's CSS.

Run (any python3 with ffmpeg on the PATH; no model needed):
  python3 build_listening_sheet.py
"""

from __future__ import annotations

import base64
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEMO = HERE / "demo"
OUT = DEMO / "listening-sheet.html"


def mp3_b64(wav: Path) -> str:
    mp3 = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(wav), "-ac", "1", "-b:a", "96k", "-f", "mp3", "-"],
        check=True, capture_output=True).stdout
    return base64.b64encode(mp3).decode()


def clip(wav: Path, title: str, note: str, tag: str = "") -> str:
    tag_html = f'<span class="tag">{tag}</span>' if tag else ""
    return (f'<div class="clip"><div class="head"><b>{title}</b>{tag_html}</div>'
            f'<audio controls preload="none" src="data:audio/mpeg;base64,{mp3_b64(wav)}"></audio>'
            f'<div class="note">{note}</div></div>')


def main() -> None:
    wander = json.loads((DEMO / "stage4-through-helper/wander-through-helper-report.json").read_text())
    bench = json.loads((DEMO / "stage15-real-daemon/stage15-latency-bench.json").read_text())
    by_k = {e["k"]: e for e in wander["echoes_measured"]}
    rows = {(r["prompt_sec"], r["n_steps"]): r for r in bench["rows"]}

    dry = clip(DEMO / "stage4-through-helper/input-one-phrase-44k.wav",
               "You", "The dry phrase: the reference for everything below.")

    knob = []
    for k, name, what in ((1.0, "Locked", "should sing your melody, in another voice"),
                          (0.5, "Half", "should keep the shape and round off the leaps"),
                          (0.0, "Free", "should keep your words and rhythm, and sing its own line on the scale")):
        e = by_k[k]
        knob.append(clip(DEMO / f"stage4-through-helper/echo-k{k:.1f}.wav", f"{name} (knob {k:g})",
                         f"{what}. Measured: {e['sung_vs_source_st']:.2f} semitones from your melody, "
                         f"{e['rtf']:.1f} s of compute per second sung."))

    speed = []
    for (p, n), name, tag in (((10.7, 32), "Today's settings", ""),
                              ((10.7, 16), "Half the passes", ""),
                              ((5.0, 16), "5 s singer clip, half the passes", "my lean"),
                              ((3.0, 16), "3 s singer clip, half the passes", "fastest")):
        r = rows[(p, n)]
        speed.append(clip(DEMO / "stage15-real-daemon" / r["file"], name,
                          f"{r['rtf']:.2f} s of compute per second sung; an 8 s phrase needs a "
                          f"{r['shortest_live_delay_for_8s_phrase']:.1f} s delay to land on time.", tag))

    html = f"""<!doctype html><html><head><meta charset="utf-8"><title>Semantic Delay — listening sheet</title>
<style>
:root{{--paper:#f0eee5;--ink:#1a1916;--fill:#dcd9ca;--red:#c8261a}}
body{{background:var(--paper);color:var(--ink);font:14px/1.5 "JetBrains Mono",ui-monospace,Menlo,monospace;margin:0;padding:24px;max-width:760px}}
h1{{font-size:18px;margin:0 0 4px}} h2{{font-size:15px;margin:28px 0 6px;border-bottom:1px solid var(--ink)}}
p{{margin:6px 0}} .clip{{border:1px solid var(--ink);padding:10px 12px;margin:10px 0;background:#fff8}}
.head{{display:flex;gap:10px;align-items:baseline}} .tag{{color:var(--red);font-size:12px}}
audio{{width:100%;margin:6px 0 2px;height:32px}} .note{{font-size:12px}}
.ask{{border-left:3px solid var(--red);padding:4px 10px;margin:10px 0}}
</style></head><body>
<h1>Semantic Delay — listening sheet</h1>
<p>Each echo of this delay comes back sung by another voice. The real model now runs behind the helper,
and nobody has heard it yet. Two questions, one phrase. Everything below is the same 4.5 seconds of
SoulX's example singer, re-sung by its example reference voice on the M1 Max.</p>
{dry}
<h2>A · How far should each echo stray from your melody?</h2>
<p>One knob per echo. Here the first repeat is locked to your melody, the second half-follows it, the third
wanders free onto the scale: the dub feedback train, letting go a little more each time.</p>
{''.join(knob)}
<div class="ask">Listen for: does <b>Free</b> sound like singing, or like a robot stepping on scale notes?
Does <b>Locked</b> sound like the same tune?</div>
<h2>B · How fast can an echo be and still sound good?</h2>
<p>Faster settings let the delay be shorter. We planned around an 8-second delay; today's settings need
about 17.5 seconds for an 8-second phrase.</p>
{''.join(speed)}
<div class="ask">Listen for: does halving the passes, or the shorter singer clip, blur or thin the voice?
The card on the Trickster board takes your pick.</div>
</body></html>"""
    OUT.write_text(html)
    print(f"wrote {OUT} ({OUT.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
