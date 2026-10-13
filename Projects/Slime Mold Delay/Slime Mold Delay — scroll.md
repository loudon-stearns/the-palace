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

> _Regenerated 2026-10-13T23:21:09.793Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 10 · last ran 2026-10-13 (today)
- **Plan:** none agreed yet — the work leans on the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-13 (today) — Slime Mold Delay has never had an agreed plan. Here's one: your ears on the dish, then start dense and thin, then Max, then the lesson. (`slime-mold-delay-steward-018`)
- **Last commit touching this project:** 2026-10-13 `25b841e2` — steward(Slime Mold Delay): cycle 9 — SPINNING UP. HOME: [[Slime Mold Delay]]. Neighborhood loaded. Cycle 9, …
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Slime Mold Delay is a delay effect whose routing is grown, not designed. Every tube of a simulated slime mold is a delay line: its length sets the echo time and its thickness sets how much sound it carries. You place food (sound sources) and a listener, and the mold works out the network on the flow law the real mold follows. Loud food pushes, the listener drains, and tubes thicken with the flow they carry. Earlier today that engine went into a playable browser dish, and its routing follows the music when the music moves. This cycle a tip can bud from partway along a tube, and the tube forks where the tip lands. That brings the shape closer to the real mold. I also measured the hope behind…

### Open asks

- `slime-mold-delay-steward-018` — proposed plan revision: a first plan for the grown delay · posted 2026-10-13 · options: adopt · keep

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
<!-- scroll:entry id="slime-mold-delay-steward-018" -->
### 2026-10-13 — cycle 10 — Slime Mold Delay has never had an agreed plan. Here's one: your ears on the dish, then start dense and thin, then Max, then the lesson.
> still working · live dish shipped, buds measured · steward leans adopt

Catch-up: Slime Mold Delay is a delay whose routing is grown by a simulated slime mold. Tubes are delay lines, and they thicken with the flow they carry. Today it went from an offline render to a playable browser dish whose routing follows the music. I've been working from the entry's old five-step ladder (spec, offline prototype, realtime, full mold dynamics, lesson), and no plan has ever been agreed. This cycle showed the ladder's fourth step needs a different shape than the one I was building. Tips that bud mid-tube didn't make networks any leaner (about 1.25–1.7× the shortest network in a clustered dish, with or without buds). The real mold gets lean by starting dense and thinning, not by adding strand by strand. So the plan below puts your ears first, because nothing has been heard yet. Then comes that experiment, then a real instrument in Max, then the lesson. Nothing waits on this. I keep building along the forward vector either way.

**Artifacts:**
- [2026-10-13-flow-dish-moves.png](Projects/Slime Mold Delay/headless/2026-10-13-flow-dish-moves.png)
<sub>`slime-mold-delay-steward-018` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="slime-mold-delay-steward-017" -->
### 2026-10-13 — cycle 10 — Tips can now bud from anywhere along a tube, not just its ends. I measured it: forking alone doesn't make the mold's networks any leaner.
> shipped · buds live in the dish, measured on 320 dishes · steward leans: start dense, then thin

**Open [the flow dish](open:Projects/Slime Mold Delay/slime-mold-flow-dish.html) and press THE MUSIC MOVES.** Now and then a small ring appears partway along a gold tube. That's a bud. If its tip reaches food or a bare spot, the tube is cut in two right there, and a gold dot marks the fork. The two halves keep the old tube's thickness, flow and direction. Their lengths add up to the old one, so the echo time through the old road doesn't change. A bud that gives up leaves its tube whole. A new dropdown, A NEW TIP BUDS FROM, switches back to cycle 9's rule (tips grow only where tubes meet), so you can hear the difference. The [strip](open:Projects/Slime Mold Delay/headless/2026-10-13-flow-dish-buds.png) shows one browser run at 12, 21 and 29 seconds. At 12 s, flake 2's road forks off flake 1's road. At 21 s the dish has let go of the left side and is briefly bare while a tip heads right. At 29 s, two roads run to the right flakes.

**The measurement.** I added two things to [the check](open:Projects/Slime Mold Delay/headless/flow_dish_check.mjs). The first is a second dish where the listener sits at the left rim and four flakes fan out on the right. In that dish a shared trunk saves real tube length. In the first dish the food is spread all around the listener, so separate straight roads are already about the cheapest network, and no trunk could help. The second is a yardstick: the shortest network joining the listener to every flake it hears, using straight roads only. A network that shares trunks through forks can come in under it. Across 40 dishes each, with and without buds, none came in under it. In the clustered dish the mold spends about 1.25 to 1.7 times that much tube either way, and buds move the number by a few percent in either direction (see the table).

Then I tried the obvious dials in throwaway runs (not saved): keep exploring after every flake is fed, a steeper flow law, harsher pruning. The best of them got the clustered dish to about 1.48 times the shortest network. The harshest pruning got close to 1.07, but only by letting the mold lose half its food. So the waste isn't about where tips sprout. It's that once a road exists, it's never forced to compete. Loops where several tubes split the flow each carry enough to survive, and the mold stops exploring as soon as it's fed. Nakagaki's slime mold does it the other way around. It starts by covering the whole dish, then the flow carves that cover down to the roads that matter. Ours starts as one strand and adds. That reversal, start dense and then thin, is what I'd build next.

**What it costs the moving music.** With buds on, all 40 dishes still end on the right, but the right roads overtake the left a median 5.0 s after the switch, against 3.5 s without buds. Some tips now bud mid-tube on the old side instead of setting off from where the old roads meet. I left buds on in the page because the shape is truer to the mold. The dropdown puts the faster rule back if you prefer it by ear.

**Artifacts:**
- [the realtime flow dish, now with tips that bud mid-tube and fork the tube where they land. Press THE MUSIC MOVES first.](Projects/Slime Mold Delay/slime-mold-flow-dish.html)
- [one headless-Chromium run of the demo at 12 s, 21 s and 29 s: a forked left network, a briefly bare dish, two right roads.](Projects/Slime Mold Delay/headless/2026-10-13-flow-dish-buds.png)
- [runs the page's own engine in node: the moving-music sweep with five rule variants, plus the new economy sweep on a round dish and a clustered dish.](Projects/Slime Mold Delay/headless/flow_dish_check.mjs)
- [every number behind both tables, plus per-scene events and final networks.](Projects/Slime Mold Delay/headless/2026-10-13-flow-dish-sprout-check.json)
- [drives the page in headless Chromium: START, the demo, an output tap for level and bad samples, three dish captures.](Projects/Slime Mold Delay/headless/flow_dish_browser_check.mjs)
- [that browser run: peak −6.6 dBFS, no bad samples, no errors, engine at 29.9 steps a second, five forks.](Projects/Slime Mold Delay/headless/2026-10-13-flow-dish-sprout-browser.json)

_40 seeded dishes per row · all flakes sounding · roads = tubes thick enough to carry sound · 1.00 = the shortest straight-road network_
| dish | tips bud from | flakes heard (mean) | road length ÷ shortest network (median) | forks (median) | dishes under the shortest |
| --- | --- | --- | --- | --- | --- |
| round, roomy budget | ends only | 4.50 of 5 | 1.08 | 0 | 2 |
| round, roomy budget | anywhere | 4.35 of 5 | 1.10 | 4 | 3 |
| round, tight budget | ends only | 1.98 of 5 | 1.02 | 0 | 0 |
| round, tight budget | anywhere | 2.00 of 5 | 1.03 | 6 | 0 |
| clustered, roomy budget | ends only | 3.92 of 4 | 1.65 | 0 | 0 |
| clustered, roomy budget | anywhere | 3.90 of 4 | 1.71 | 4 | 0 |
| clustered, tight budget | ends only | 2.88 of 4 | 1.27 | 0 | 0 |
| clustered, tight budget | anywhere | 2.85 of 4 | 1.24 | 4 | 0 |
| music moves (round) | ends only (cycle 9) | 40 / 40 end right | right overtakes left in 3.5 s | 0 | — |
| music moves (round) | anywhere (cycle 10) | 40 / 40 end right | right overtakes left in 5.0 s | 5 | — |

_Left rough:_ I haven't heard it. The browser run proves it plays (peak −6.6 dBFS, no errors, a true 30 steps a second), not that the forks sound good. Splitting a tube routes its sound through a fork point, which has its own soft limiter and a one-third gain, so a forked road is probably quieter and slightly more saturated than the tube it replaced. Unheard and unmeasured. The dial sweeps I described weren't saved. The Python engine still runs the older rule, so offline renders and the live page disagree.

_Next moves named:_ Start dense, then thin: begin a dish with the mold already covering the agar as a mesh, the way the plasmodium starts in Nakagaki's experiments, and let the flow law carve it down. Then check the clustered dish against the shortest-network yardstick to see whether the mold finally comes in under it. · Fold the page engine (whole-dish share, pass-through tips, buds) back into physarum_flow.py and re-render the five dishes as audio, so the offline renders and the live page agree.
<sub>`slime-mold-delay-steward-017` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

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
