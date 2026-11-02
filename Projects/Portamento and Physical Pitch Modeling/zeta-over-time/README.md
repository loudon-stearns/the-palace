# ζ over time — Portamento and Physical Pitch Modeling

The page's first open question, rendered: what does a glide sound like when its damping ratio ζ changes
*while it moves*? Seven glides up a fifth (C3 → G3) on one spring (ωₙ = 2π·4 rad/s), pitch in cents from the
target, obeying the home entry's law with ζ made a function of time:

    c'' + 2·ζ(t)·ωₙ·c' + ωₙ²·c = 0

| study | ζ | overshoot | what it teaches |
|---|---|---|---|
| ring | 0.12 throughout | 479 c | the spring left alone |
| clean | 1.0 throughout | 0 | the reference |
| ramp | 0.12 → 1.2 over 0.6 s | 332 c | a hand closing on a ringing knob |
| grab-crest | 0.12, then 3.0 at the first crest | 479 c | arrive sharp, sink onto the note |
| grab-crossing | 0.12, then 3.0 as it first passes the note | 88 c | caught at full speed, it still coasts past |
| loosen-late | 1.5, then 0.05 at 0.15 s | 178 c | let go while moving: momentum becomes a wobble |
| loosen-still | 1.0, then 0.05 at 1.2 s | 0 | sounds identical to clean — damping only acts on motion |

| file | what |
|---|---|
| `render.py` | RK4 integration at 44.1 kHz; writes `audio/*.wav`, `zeta-over-time.png`, `studies.json`. Needs numpy, scipy, matplotlib (`.venvs/kokoro` has them). |
| `build_page.py` + `page_template.html` → `zeta-over-time.html` | standalone listening page (Web Audio, curves embedded at 200 Hz): the seven studies with plots, then a 14-item exercise, "what happened to the damping?" |

Check: the fixed-ζ ring overshoots by 478.8 cents; the home entry's formula gives 700·e^(−πζ/√(1−ζ²)) = 478.8.

Not yet known: whether a listener can tell *grabbed* from *caught gradually* by ear — the exercise will say.
Nobody has listened yet.
