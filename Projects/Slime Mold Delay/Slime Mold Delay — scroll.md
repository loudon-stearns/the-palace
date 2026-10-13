---
title: "Slime Mold Delay — scroll"
born: 2026-09-23
links:
  - target: "[[Slime Mold Delay]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Slime Mold Delay's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Slime Mold Delay — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Slime Mold Delay]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-13T23:08:34.518Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 9 · last ran 2026-10-13 (today)
- **Plan:** none agreed yet — the work leans on the forward vector
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-13 (today) — The dish is live in the browser now. You place food and play into it, and the delay grows its routing on the real mold's flow law while you listen. (`slime-mold-delay-steward-015`)
- **Last commit touching this project:** 2026-10-13 `148794ce` — steward(Slime Mold Delay): cycle 8 — SPINNING UP. HOME: [[Slime Mold Delay]]. Neighborhood loaded. Cycle 8, …
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Slime Mold Delay is a delay effect whose routing is grown rather than designed. Each tube of a slime mold is a delay line: its length sets the echo time, and its thickness sets how much sound it carries. You place food (sound sources) and a listener, and the mold works out the network. Earlier today I rebuilt the growth on the law the real mold follows. Loud food pushes cytoplasm, the listener drains it, and tubes thicken with the flow they carry. Offline, the routing followed the music. This cycle put that engine into a playable browser page. Porting it showed that the law only recovered from a change in the music about two times in three. Two small fixes from the biology bring it to forty…

### Open asks

_None — nothing is waiting on you._

### Answered, not yet consumed

_None._

### Decided

- `slime-mold-delay-steward-011` — directional_steer → GRANTED — option_id=STAGE-4-DYNAMICS (2026-06-25)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="slime-mold-delay-steward-015" -->
### 2026-10-13 — cycle 9 — The dish is live in the browser now. You place food and play into it, and the delay grows its routing on the real mold's flow law while you listen.
> shipped · realtime dish works headless in Chromium · steward leans: tips that branch mid-tube next

**Open [the flow dish](open:Projects/Slime Mold Delay/slime-mold-flow-dish.html) and press THE MUSIC MOVES.** For 15 seconds flakes 1 and 2 play, then flakes 3 and 4 take over, and you watch and hear the network rebuild on the other side. After that the dish is yours. Click bare agar to place a flake (up to six), click a flake to start or stop it, and shift-click to take it away. Keys 1–6 pluck by hand. MIC feeds your microphone into the selected flake, which is the 'play into it' part. The knobs are eat/starve, the tube-length budget, streaming speed (which glides every echo time), a dish clock (0 freezes the routing, 4× is overnight growth), and wet/dry. Dots travel along each tube in the direction of flow, brighter where more is moving. The [strip](open:Projects/Slime Mold Delay/headless/2026-10-13-flow-dish-moves.png) shows one browser run at 12, 21 and 29 seconds.

**What porting taught me.** The engine is a line-for-line port of last cycle's Python, kept in one script block with no audio in it, so [a node check](open:Projects/Slime Mold Delay/headless/flow_dish_check.mjs) can run it against the same scenes. Left and right music behaved as before. But the first browser run of the moving music never found the right side. Run across 40 seeded dishes, the old law recovered in only 26. In the earlier offline render, the first tip happened to land fast. There were two causes.

1. **The old roads kept all their push.** Each reached flake was judged only against the *other reached flakes*. When the music left, the nearly silent left flakes still pushed 100% until a tip found the right. Now a flake's share is judged against all the sounding food in the dish, so the old roads lose their push the moment the music moves.
2. **Stepping stones died before anyone stepped on them.** A tip that landed on a bare spot of agar stopped there. That tube carried no flow, so it pulled back in about a second, and the next tip from that spot built an island the listener couldn't hear. Now a tip that crosses a bare spot keeps growing and leaves a branch point behind, the way a real tip does. As a side effect, roads now bend through branch points, so echoes take multi-hop paths and right-side roads share a trunk before they fork.

A third, smaller fix: the dish is round now, so tips turn back at the glass instead of wandering past the rim. The table has the sweep. The share rule is a dropdown on the page, so you can switch back to the cycle 8 rule and hear the difference.

**Artifacts:**
- [the realtime flow dish: place food, play or use the mic, watch and hear the routing grow. Press THE MUSIC MOVES first.](Projects/Slime Mold Delay/slime-mold-flow-dish.html)
- [one browser run of the demo at 12 s, 21 s and 29 s: left roads, the fork through a branch point, the network moved right (taken just before the round-rim fix, so one tip strays past the edge).](Projects/Slime Mold Delay/headless/2026-10-13-flow-dish-moves.png)
- [runs the page's own engine block in node against last cycle's scenes, plus the 40-dish sweep of four rule variants.](Projects/Slime Mold Delay/headless/flow_dish_check.mjs)
- [the sweep and every scene's events, traces and final networks.](Projects/Slime Mold Delay/headless/2026-10-13-flow-dish-check.json)

_the music moves left → right at 15 s · 40 seeded dishes per rule · node, same engine block as the page_
| rule | ended on the right | reached the right | right roads overtake left (median, after the switch) |
| --- | --- | --- | --- |
| cycle 8 law | 31 / 40 | 35 / 40 | 4.5 s |
| share judged against the whole dish | 37 / 40 | 38 / 40 | 4.5 s |
| tips pass through bare spots | 36 / 40 | 38 / 40 | 3.5 s |
| both — what the page runs | 40 / 40 | 40 / 40 | 3.5 s |

_Left rough:_ I haven't heard it, and the page has only been run in headless Chromium. There I checked that sound comes out (peak about −8 dBFS, nothing non-finite, no errors), that the engine steps at a true 30 per second, and that five of five demos moved right. The mic path has never been run with a real mic. The click-free crossfade on reversals is the same ramp idea as before but unheard. The 'cut' counter runs higher than in the Python because pass-through tips now lay several tubes per trip.

_Next moves named:_ Let a tip sprout from partway along a tube, not only from its ends, so a shared trunk can fork anywhere. That brings the shape closer to the real mold and the Tokyo-subway economy. · Fold the two fixes back into the Python engine and re-render last cycle's five dishes as audio, so the offline renders and the live page agree.
<sub>`slime-mold-delay-steward-015` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="slime-mold-delay-steward-013" -->
### 2026-10-13 — cycle 8 — The mold now grows on the real mold's flow law. Loud food gets fat roads to the listener, and when the music moves, the network follows it.
> shipped · five dishes rendered offline · steward leans: bring this engine into the browser page next

Start with [the figure](open:Projects/Slime Mold Delay/headless/2026-10-13-flow-dishes.png). It has five dishes in rows, each shown at six moments across 30 seconds. Yellow dots are food, and they swell while they're sounding. The red dot is the listener. Thick gold lines are tubes (delay lines). Faint wandering threads are feeler tips, and brown threads are tips that gave up.

**Left music and right music** (rows 1–2). It's the same dish and the same random seed. Only the flakes being played differ. With the two left flakes playing, the mold grows two fat roads from them to the listener. With the two right flakes playing, the roads grow on the right. Listen to [left](open:Projects/Slime Mold Delay/headless/2026-10-13-flow-left.wav) and [right](open:Projects/Slime Mold Delay/headless/2026-10-13-flow-right.wav). The echoes come from where the music is.

**The music moves** (row 3, [listen](open:Projects/Slime Mold Delay/headless/2026-10-13-flow-moves.wav)). This one is the headline. For 15 seconds the left flakes play, then the right ones take over. The first tip reaches the right food 2.3 seconds after the switch. The left roads have thinned to nothing by about 22 seconds, and the network ends on the right. You can hear the delay rebuild itself under the music.

**Feast and famine** (row 4, [listen](open:Projects/Slime Mold Delay/headless/2026-10-13-flow-feast-famine.wav)). All flakes play, and the eat/starve knob from the entry swings every six seconds. Eating sends out tips. Starving thins the tubes faster.

**A tight budget** (row 5, [listen](open:Projects/Slime Mold Delay/headless/2026-10-13-flow-tight-budget.wav)). All five flakes play, but there is only enough tube length for about two roads. The budget refused 15 tips. The mold kept the two left flakes and reached the second one *through* the first, so they share a trunk. That's the economy the Tokyo-subway experiments are famous for, and I didn't write it in.

What changed in the behaviour: in the fed dishes, tubes grown fell from 31 to 15 and tubes cut fell from 31 to 12. The mold explores less once every sounding flake is reached, and more while some sounding flake is still unreached. Because the sink is the colony's home, a starved network can always regrow from the listener. Sound travels both ways down each tube, strongly downstream and weakly upstream, the way the real mold's flow sloshes back and forth. So echoes can circulate around the network. If a tube's flow reverses, its two directions crossfade over a few frames instead of switching.

The code is [physarum_flow.py](open:Projects/Slime Mold Delay/headless/physarum_flow.py). Each dish has a log of every frame and the [summary](open:Projects/Slime Mold Delay/headless/2026-10-13-flow-summary.json) lists every tube grown and cut, with timestamps. One shared gain across all five renders, so their loudness compares.

**Artifacts:**
- [five dishes, rows, at six moments each: left · right · music moves · feast and famine · tight budget.](Projects/Slime Mold Delay/headless/2026-10-13-flow-dishes.png)
- [the headline: the music moves left to right at 15 s and the delay network rebuilds under it.](Projects/Slime Mold Delay/headless/2026-10-13-flow-moves.wav)
- [left flakes playing; roads grow on the left.](Projects/Slime Mold Delay/headless/2026-10-13-flow-left.wav)
- [same dish and seed, right flakes playing; roads grow on the right.](Projects/Slime Mold Delay/headless/2026-10-13-flow-right.wav)
- [all flakes, eat/starve knob swinging every 6 s.](Projects/Slime Mold Delay/headless/2026-10-13-flow-feast-famine.wav)
- [all flakes, room for about two roads; the mold picks, and shares a trunk.](Projects/Slime Mold Delay/headless/2026-10-13-flow-tight-budget.wav)
- [the flow engine: Kirchhoff pressure, flow-driven growth, feeler tips, pull-back, length budget, two-way delay lines.](Projects/Slime Mold Delay/headless/physarum_flow.py)
- [every tube grown and cut, with timestamps, plus counts per dish.](Projects/Slime Mold Delay/headless/2026-10-13-flow-summary.json)
- [frame-by-frame log, left dish.](Projects/Slime Mold Delay/headless/2026-10-13-flow-left-log.csv)
- [frame-by-frame log, right dish.](Projects/Slime Mold Delay/headless/2026-10-13-flow-right-log.csv)
- [frame-by-frame log, moving-music dish.](Projects/Slime Mold Delay/headless/2026-10-13-flow-moves-log.csv)
- [frame-by-frame log, feast-and-famine dish.](Projects/Slime Mold Delay/headless/2026-10-13-flow-feast-famine-log.csv)
- [frame-by-frame log, tight-budget dish.](Projects/Slime Mold Delay/headless/2026-10-13-flow-tight-budget-log.csv)

_five dishes · 30 s each · same seed_
| dish | tubes grown | tubes cut | tips that gave up | tips refused by the budget | where the network ended |
| --- | --- | --- | --- | --- | --- |
| left music | 15 | 12 | 3 | 0 | two fat roads from the left flakes |
| right music | 15 | 12 | 1 | 0 | two fat roads from the right flakes |
| music moves at 15 s | 10 | 8 | 3 | 0 | right roads; left gone by ~22 s |
| feast and famine | 9 | 6 | 3 | 1 | three roads, one shared trunk on the right |
| tight budget | 10 | 9 | 3 | 15 | two left flakes on one shared trunk |
| September draft (for comparison) | 31 | 31 | — | 0 | two thin tubes; never settled |

_Left rough:_ I haven't heard any of it. The music is plain plucks, so whether a growing network *sounds* like thinking is your ear's call. Growth changes are ramped and should be click-free, but my numeric click check can't tell a click from a pluck, because the mold grows exactly when food is sounding. The figure has no labels on its rows (no plotting library on this machine), so the row order is in the caption. The ten bare agar spots are random points, not real branch points mid-tube.

_Next moves named:_ Port this flow law into the browser page (slime-mold-live-growth.html), replacing its stand-in rule, so you can place food, play into it and watch the real growth: the step on the plan after this one, the realtime version. · Let a tip branch from partway along a tube, not only from its ends, so shared trunks can fork wherever they need to, which is closer to the real mold.
<sub>`slime-mold-delay-steward-013` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="slime-mold-delay-steward-011" -->
### 2026-06-23 — cycle 6 — Live-growth engine is up. Where should cycle 7 go — Stage 4 dynamics, the visual dish, or Loudon Live lesson scaffolding?
> still working · cycle 6 shipped · steward leans STAGE-4-DYNAMICS

Caught up: Slime Mold Delay is the grown-routing delay instrument. Cycle 4 shipped a static web-audio bench (click-free 60 ms ramps); cycle 6 just shipped slime-mold-live-growth.html — autonomous spawn/prune at 30 Hz on top of that bench. The forward-vector ladder has three remaining rungs: Stage 4 (full Physarum dynamics — tip-extension probes, ghost-tubes that retract if they reach nothing, total-length budget enforcement), the p5 visual dish (food placement, visible filament growth, audio wired into it — currently the canvas draws bezier proxies, not real growth), or jumping to the Stage 5 Loudon Live lesson scaffolding (the 'watching a delay think' arc). My lean: Stage 4, because tip-extension is the part of the biological metaphor that is currently faked, and the lesson lands harder once that lands. But the visual dish is what makes the instrument *teachable*, so if Loudon Live is the near-term target, that path has a real claim. Non-blocking — if you don't reply I'll take the lean.

**Artifacts:**
- [slime-mold-webaudio-bench.html](Projects/Slime Mold Delay/slime-mold-webaudio-bench.html)
<sub>`slime-mold-delay-steward-011` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="slime-mold-delay-steward-010" -->
### 2026-06-23 — cycle 6 — Cycle 6 ships the autonomous Physarum engine — the dish now grows its own routes while you listen.
> shipped · 30 Hz topology loop on top of cycle-4 bench · no decision needed

Slime Mold Delay is the feedback-delay-as-grown-routing instrument from the Biomechanical Synthesis hub. Cycle 4 shipped a static web-audio bench proving 60 ms feedback ramps stay click-free. Cycle 6 puts the topology engine on top: a ~30 Hz loop that spawns new tubes (DelayNodes) from food sources, reinforces tubes whose diameter is rising (proxy for flow RMS), and prunes starving tubes after a sustained-low window. Eat/starve balance, velocity, tube budget, and feedback ceiling are knobs; the routing is autonomous. Click START AUDIO + GROWTH and let it run for a minute — the audio graph mutates underneath the sound, and the 60 ms ramps from cycle 4 are now the disconnect/reconnect path.

**Artifacts:**
- [live-growing topology engine — open, click START, then PULSE FOOD and listen.](Projects/Slime Mold Delay/slime-mold-live-growth.html)
<sub>`slime-mold-delay-steward-010` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
