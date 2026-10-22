---
title: "Particle Synthesis — scroll"
born: 2026-09-23
links:
  - target: "[[Particle Synthesis]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Particle Synthesis's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Particle Synthesis — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Particle Synthesis]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-22T10:29:31.789Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 7 · last ran 2026-10-22 (today)
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-22 (today) — Grains now meet on the GPU: 1024 ice grains from two fountains clack off each other in mid-air, live, with an A/B against passing through. (`particle-synthesis-014`)
- **Last commit touching this project:** 2026-10-22 `ffc0e84a` — steward(Particle Synthesis): cycle 6 — SPINNING UP. HOME: [Particle Synthesis](obsidian://open?vault=The%20Pal…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 2 runs on 1 day, counted from the ledger's run lines
- **Last run:** 2026-10-22 — cycle 7 · taught item 3
- **Owed in the ledger:** nothing
- **Proposed for canon:** 1 — item 2; waiting on Loudon's review, and the page has not changed
- **Latest lesson:** item 3, from cycle 7 — 2026-10-22 — [[Particle Synthesis — tuning]]

### Where this stands

Particle Synthesis treats each grain of a granular synth as a real particle with position, speed and mass, so the sound comes out of physics instead of knobs. Its test is to sound like physics, not like parameter modulation. In September I built a fountain throwing ice onto a stiff plate, where each landing reaches two pickups as a chirp, highs first. Then I aimed two fountains at each other so grains clack in mid-air, but only on the CPU, and with 72 grains. Earlier today I moved the fountain onto the GPU: 1024 particles, each one thread, moved and heard every sample. Then I proposed a plan, which is still waiting on you: your ears on that A/B, then collisions on the GPU, then an instrumen…

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since cycle 4:** Nobody has listened yet. _(in 4 notes, the latest cycle 7)_
- **rough since cycle 4:** I don't know how the live bench runs on your machine's audio. _(in 2 notes, the latest cycle 5)_
- **rough since cycle 6:** I ran the live page only in headless Chrome, with no speakers. _(in 2 notes, the latest cycle 7)_

### Open asks

- `particle-synthesis-012` — proposed plan revision: a first plan for Particle Synthesis · posted 2026-10-22 · options: adopt · keep · STEER

### Answered, not yet consumed

_None._

### Decided

- `particle-synthesis-007` — directional_decision → GRANTED — option_id=REVIVE-TO-SPROUT (2026-09-24)
- `particle-synthesis-004` — directional_decision → GRANTED — option_id=POLYPHONIC-CLOUD; notes: "create an interactive HTML lesson that demonstrates the arc of this project and where it is goin." (2026-06-25)

### Runs

- 2026-10-22 — cycle 7 · taught item 3
- 2026-10-22 — cycle 6 · taught item 1, proposed item 2 for canon

### Owed

_Nothing owed._

### Proposed for canon

_Changes the steward wants in the house, kept in its tuning ledger until Loudon's review. Its cycles work as if they hold; the pages have not changed._

- **2.** 2026-10-22 · [[Particle Synthesis]] · § Particle Fountain: First Build, the paragraph beginning **The physics-as-DSP insight:** — The current paragraph says the particle under gravity is the harmonic oscillator and that the gravity constant is the spring constant. Both are wrong: a thrown particle follows a parabola, and nothing in it is a spring. The new words keep the real insight and say what the build actually does.

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="particle-synthesis-014" -->
### 2026-10-22 — cycle 7 — Grains now meet on the GPU: 1024 ice grains from two fountains clack off each other in mid-air, live, with an A/B against passing through.
> shipped · GPU matches CPU meeting for meeting · steward leans: ears, then a playable instrument

**Start with [the live page](open:Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet.html).** Press start. The side view zooms on the crossing, and a grain flashes gold for the 30 ms its clack is sounding. Slide *aim* from 6° of scatter down to 0.1° and watch the flashes gather at the top of the arch. *Pass through* makes the same throws with collisions off. On this Mac, a block of 1024 grains with collisions costs about 42% of its own playing time.

**Then the A/B.** [A, grains meet](open:Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet-A-meet.wav) and [B, pass through](open:Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet-B-pass.wav) are 16 s each, with 1024 grains, the same 1,544 throws, one shared gain, and the aim tightening from 6° to 0.15°. A has 1,315 meetings in the air: 414 in the first half and 901 in the second. [The figure](open:Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet-AB.png) plots meetings per second against the aim. In its zoom, the clacks are the thin bright verticals reaching 20 kHz among the slanted landings, and B has none.

**How it works on the GPU.** One thread can't see another grain while it walks through 4,096 samples. So a block now runs as 128 short legs of 32 samples. After each leg, a second pass lets every grain check every other grain from a snapshot. Each grain applies only its own half of each bounce, so no thread ever writes another's state. The clack is September's model unchanged: Hertz contact time for two ice spheres, and each grain a tiny loudspeaker pushed along the line of impact. Each grain sings its own half, and the mixer adds the two halves at the mic. That is how the line of impact comes out loud and the side quiet, without anyone writing that pattern in.

**How I know it's right.** The clack the shader sings matches September's exact render of six real meetings at a correlation of 0.987 to 0.999. Against its CPU copy at 64 grains over 6 s, the GPU makes the same 198 throws, the same 454 landings and the same 129 meetings. Recomputed from the logged velocities, every meeting conserves momentum to 3.5e-15, and the energy each loses matches the textbook to 6e-12. With collisions off the sound correlates at 0.9999. With collisions on it is 0.94: every meeting is a yes-or-no event, so tiny rounding differences shift where two grains touch, and the tails of the paths drift apart while the counts stay identical. In a CPU check at 256 grains, nearly every meeting happens at the crossing, about 8 m out and 1.5 m up: 44 of 48 at 3° of aim, 104 of 106 at 1°, all 156 at 0.3°. At tight aim a third of the meetings are a grain's own partner. The rest are deflected grains hitting the next ones through, a busy intersection I didn't plan.

**The bug on the way.** The first run counted 3,282 meetings from 19 landings. Two grains thrown from the same nozzle a few milliseconds apart start out overlapping, then nudge each other hundreds of times at near-zero speed as they fly and bounce together. A real nozzle can't fire two stones through one spot at once. Now a grain joins the collision pass only after 30 ms in the air, and a touch closing slower than 0.1 m/s counts as two grains riding together, not a clack.

**Nobody has listened yet**, to this or to the earlier A/B. I can't do that part. Whether the clacks read as physics is your call, and it's the second move of the plan that's waiting on you.

**Artifacts:**
- [the live page: two fountains, 1024 grains on the GPU, aim, pairs per second, ice stiffness, meet or pass through. Press start.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet.html)
- [A, 16 s: grains meet. Clacks in the air and deflected landings, thickening as the aim tightens 6° → 0.15°.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet-A-meet.wav)
- [B, 16 s: the same 1,544 throws passing through each other. Same gain as A.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet-B-pass.wav)
- [meetings per second against the aim, then spectrograms of A and B with a 0.5 s zoom. The clacks are the bright verticals.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet-AB.png)
- [drives the page in headless Chrome: the clack check, the GPU/CPU check, speed, the A/B renders.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet-harness.mjs)
- [draws the figure from the raw renders (run with /usr/local/bin/python3).](Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet-figure.py)
- [every number from the checks and renders.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet-report.json)

_Grains that meet on the GPU: checks and costs (Apple Metal, headless Chrome)_
| check | result |
| --- | --- |
| shader clack vs September's exact render, 6 meetings | correlation 0.987 – 0.999 |
| GPU vs CPU, 64 grains, 6 s: throws / landings / meetings | 198 / 454 / 129 on both |
| sound correlation, collisions off / on | 0.9999 / 0.94 (meetings shift paths; counts identical) |
| momentum error per meeting / energy-loss error | 3.5e-15 / 6e-12 |
| where meetings happen (256 grains; aim 3° · 1° · 0.3°) | 44/48 · 104/106 · 156/156 at the crossing |
| 16 s A/B, 1024 grains: throws · meetings | 1,544 · 1,315 (414 first half, 901 second) |
| 6 s of sound at 64 / 256 / 1024 grains, with collisions | 0.65 / 1.12 / 1.95 s |
| live, 1024 grains, with collisions and picture | about 42% of playing time (25% without collisions) |

_Left rough:_ Nobody has listened yet. The clacks are thin next to the landings, and I haven't checked their level against September's ratio. Every grain still checks every other grain, so cost grows with the square of the count, and pushing well past 1024 will need a spatial grid. I ran the live page only in headless Chrome, with no speakers.

_Next moves named:_ Make it playable: notes or pads that fire a pair of throws on demand, with aim and throw strength under the hand, so meetings become something you play, not just something that happens. · Put a spatial grid in the collision pass so the cost stops growing with the square of the grain count, then find where the GPU actually runs out past 1024. · For the later Max build, once the patching standards exist: the signal flow is 32-sample legs, then a snapshot, then each grain taking its own half of each bounce. The 30 ms nozzle grace and the 0.1 m/s rest threshold are the two gotchas, and the clack test vector is the check.
<sub>`particle-synthesis-014` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-f050f01ab8" -->
### 2026-10-22 — cycle 7

taught item 3
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="particle-synthesis-012" -->
### 2026-10-22 — cycle 6 — Here's a first plan: GPU fountain (done), your ears on the A/B, collisions on the GPU, then a playable instrument. Adopt it?
> still working · GPU fountain shipped · steward leans adopt

Particle Synthesis turns each grain of a granular synth into a real particle, so the sound comes out of physics instead of knobs. You revived it to sprout in September, but nobody wrote a plan, and you asked me to propose one. Today's build is the first move: a thousand particles on the GPU, each moved and heard at audio rate, checked against a CPU copy, plus an A/B of the same strikes heard through the ice and as ordinary mapped grains. The plan puts your ear check second, because 'does it sound like physics?' is the page's whole test and only you can answer it. I keep building while I wait. After that: collisions on the GPU, then an instrument you can play, then the ceiling past 1024 particles, then a Live spec that waits for the Max standards, then folding what's proven into the page.

**Artifacts:**
- [the first move, shipped: the live GPU fountain.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain.html)
- [the A/B the ear check would listen to.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain-AB.png)
- [2026-09-23-particle-synthesis-lesson.html](Projects/Particle Synthesis/proofs/2026-09-23-particle-synthesis-lesson.html)
- [2026-09-23-grains-that-meet.png](Projects/Particle Synthesis/proofs/2026-09-23-grains-that-meet.png)
- [2026-09-23-grains-05-crossing-collide.wav](Projects/Particle Synthesis/proofs/2026-09-23-grains-05-crossing-collide.wav)
- [2026-09-23-grains-04-crossing-pass-through.wav](Projects/Particle Synthesis/proofs/2026-09-23-grains-04-crossing-pass-through.wav)
- [2026-09-23-fountain-cloud64.png](Projects/Particle Synthesis/proofs/2026-09-23-fountain-cloud64.png)
- [2026-09-23-fountain-03-cloud1000-ice.wav](Projects/Particle Synthesis/proofs/2026-09-23-fountain-03-cloud1000-ice.wav)
- [2026-09-23-fountain-02-cloud64-ice.wav](Projects/Particle Synthesis/proofs/2026-09-23-fountain-02-cloud64-ice.wav)
- [2026-09-23-fountain-01-cloud64-dry.wav](Projects/Particle Synthesis/proofs/2026-09-23-fountain-01-cloud64-dry.wav)
- [2026-09-23-fountain-00-one-particle.wav](Projects/Particle Synthesis/proofs/2026-09-23-fountain-00-one-particle.wav)
<sub>`particle-synthesis-012` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="particle-synthesis-011" -->
### 2026-10-22 — cycle 6 — The fountain runs on the GPU: 1024 particles, each moved and heard 48,000 times a second, with an A/B of physics against mapped grains.
> shipped · GPU matches CPU at 0.99998 · steward leans: ears on the A/B, then collisions on the GPU

**Start with [the live page](open:Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain.html).** Press start. It throws 1024 particles from a fountain you can walk away from the pickups, with sliders for throw strength, ice stiffness and rest between throws, and a switch between *heard through the ice* and *mapped grains*. A side view shows every particle (fresh strikes flash white), and a scrolling spectrogram runs underneath. If the browser has no WebGPU it falls back to the CPU copy at 48 particles.

**Then the A/B.** [A, heard through the ice](open:Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain-A-ice.wav) and [B, mapped grains](open:Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain-B-mapped.wav) are 16 s each. Both use 1024 particles and the same 4,991 throws and 22,666 strikes, with the fountain walking from 3 m to 18 m away. They are matched for loudness. In A every strike travels the plate by the dispersion law, so a far strike sweeps slower than a near one. In B each strike fires a decaying sine whose pitch is set by distance (2 kHz near, 200 Hz far). That is the usual granular mapping: same information, chosen by a rule. [The figure](open:Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain-AB.png) shows the difference before you listen. A is a weather of slanted chirps whose slants lengthen as the fountain recedes. B is a single band of pitch sliding down, which is exactly what parameter modulation looks like.

**How I know the shader is right.** The page carries a CPU copy of the same kernel. At 64 particles over 4 s both make the same 96 throws and the same 349 strikes, and the sound correlates at 0.99998 in both modes, with the largest difference about 1% of the peak. Getting there taught me something. With the CPU's motion in 64-bit floats, the same strikes landed a sample apart after the first second and correlation fell to 0.57. Once the CPU copy steps the motion and the rest timer in 32-bit, as the GPU does, they agree.

**Speed, on this Mac's Metal GPU.** Offline, 6 s of sound takes 0.73 s at 64 particles and 0.79 s at 1024, about an eighth of real time either way. Cost barely grows with particle count. What limits it is each thread walking 4,096 samples in a row, plus copying the result back. Live, with the particle positions also copied out for the picture, a block costs about a quarter of its playing time. There is room for far more particles than 1024.

**Artifacts:**
- [the live fountain on the GPU: 1024 particles, the ice/mapped switch, distance, throw, stiffness, rest. Press start.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain.html)
- [A, 16 s: 1024 particles heard through the ice, fountain walking 3 → 18 m.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain-A-ice.wav)
- [B, 16 s: the same throws and strikes as mapped grains, pitch set by distance. Loudness matched to A.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain-B-mapped.wav)
- [spectrograms of A and B with a 0.6 s zoom: a weather of chirps against one sliding band.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain-AB.png)
- [drives the page in headless Chrome: the GPU/CPU check, the speed runs, the A/B renders.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain-harness.mjs)
- [every number from the checks and renders.](Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain-report.json)
- [draws the figure (run with /usr/local/bin/python3).](Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain-figure.py)

_GPU kernel against its CPU copy, and what it costs (Apple Metal, headless Chrome)_
| check | result |
| --- | --- |
| throws / strikes, 64 particles, 4 s | 96 / 349 on both |
| sound correlation, ice mode (L, R) | 0.99998, 0.99999 |
| sound correlation, mapped mode (L, R) | 0.99998, 0.99998 |
| largest difference ÷ peak | about 1% |
| same check with 64-bit motion on the CPU | 0.57: strikes drift a sample apart |
| 6 s of sound at 64 / 256 / 1024 particles | 0.73 / 0.75 / 0.79 s |
| live, 1024 particles, with the picture | about 25% of playing time |

_Proposed for canon:_ Particle Synthesis (§ Particle Fountain: First Build, the paragraph beginning **The physics-as-DSP insight:**) — The current paragraph says the particle under gravity is the harmonic oscillator and that the gravity constant is the spring constant. Both are wrong: a thrown particle follows a parabola, and nothing in it is a spring. The new words keep the real insight and say what the build actually does.; owed in the tuning ledger until Loudon's review

_Left rough:_ Nobody has listened yet. Whether A reads as physics and B as modulation is the page's whole test, and only your ears can answer it. I ran the live page only in headless Chrome, with no speakers, so the in-browser sound and the feel of the sliders are unverified. Particles still pass through each other on the GPU; September's mid-air clack hasn't moved over yet.

_Next moves named:_ Move the grains-that-meet collisions into the shader with a spatial grid, so a thousand particles can clack off each other in mid-air and aim becomes a playable knob. · Find where the GPU actually runs out: raise the particle ceiling past 1024 and measure whether the ear still gains anything from the extra density.
<sub>`particle-synthesis-011` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-0e54b3fb55" -->
### 2026-10-22 — cycle 6

taught item 1, proposed item 2 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="particle-revival-2026-10-21" -->
### 2026-10-21 — Revived: the page is sprout, on Loudon's grant of 2026-09-24

Loudon met this project through what its steward made while the page slept: the fountain on ice and grains that meet. On 2026-09-24 he granted the revival (`particle-synthesis-007`, REVIVE-TO-SPROUT). Nobody landed it, so the heartbeat kept skipping the page. On his word of 2026-10-21 the page now says sprout, and the revival-probe standing order is gone. There is no plan yet: the work follows the forward vector, and the steward may propose a plan.

**Artifacts:**
- [the entry, stage sprout.](Projects/Particle Synthesis.md)
<sub>`particle-revival-2026-10-21` · revival landed by an elder · granted 2026-09-24 (`resp-muewg7h4-xru35i`)</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="particle-synthesis-009" -->
### 2026-09-23 — cycle 5 — Grains that meet: two fountains aimed at each other, so ice grains clack in mid-air and land somewhere new. A/B renders, figure, live bench.
> shipped · run ends · revive ask 007 still open · steward leans REVIVE-TO-SPROUT

Start with [the lesson, now in seven moves](open:Projects/Particle Synthesis/proofs/2026-09-23-particle-synthesis-lesson.html), section 06. It has a live bench with two nozzles, an aim slider, and a switch between 'grains meet' and 'pass through'. Then play [05, grains meet](open:Projects/Particle Synthesis/proofs/2026-09-23-grains-05-crossing-collide.wav) against [04, pass through](open:Projects/Particle Synthesis/proofs/2026-09-23-grains-04-crossing-pass-through.wav). They use the same launches and the same gain, with the aim tightening from 6° of scatter to 0.15° over seven seconds. In [the figure](open:Projects/Particle Synthesis/proofs/2026-09-23-grains-that-meet.png) every meeting is marked on the crossing arch. The ticks above the spectrogram line up with thin bright verticals, which are the clacks among the slanted chirps.

How a clack is made: two ice balls touch for 75 to 160 millionths of a second (Hertz's law with ice's real stiffness, nothing tuned). A ball that gets shoved pushes on the air like a tiny loudspeaker. The two balls are shoved in opposite directions, so their sounds add along the line of impact and cancel off to the side. On one head-on clack at 5 m: 0 dB on the line, −1.9 dB at 45°, −15 dB at 75°, −49 dB side-on. I didn't write that pattern in. It is just the two balls added together.

What meeting changed: 13 meetings in render 05, 2 in the loose-aim half and 11 in the tight half. 24 of 72 grains met at least once, and there were 2 cascades. In one, a grain bouncing back from the crossing knocked a freshly thrown grain straight up over its nozzle. 119 of the 360 landings came from a grain that had been deflected. The average landing distance barely moved (8.00 against 8.05 m), because the fountains are mirror images and a head-on meeting swaps which side each grain lands on. Sideways drift at landing grew fourfold (0.15 to 0.60 m), which widens the stereo picture. Aim is the knob. In the browser bench, over 12 seconds at 8 shots a second, 6° of scatter gives 12 meetings, 1.5° gives 51, 0.5° gives 78 and 0.15° gives 93 of 96 shots, with cascades rising to 11. Grains a centimetre or two across need aim inside about half a degree to meet reliably. That is a property of the instrument I didn't plan.

Checks: at every collision, momentum is conserved to 2e-15, and the energy lost matches the textbook (1−e²)/2·m·v² to 6e-15. The browser clack matches the exact Python render at a correlation of 0.987 to 0.999 on six real meetings ([the test vector](open:Projects/Particle Synthesis/proofs/2026-09-23-grains-clack-testvector.json)). The bench's physics and audio ran headless at four aim settings with no bad samples. Two bugs were caught on the way: a first clack about 85 dB too quiet, and a variable-name clash in the lesson code that stopped its script from parsing. [The render script](open:Projects/Particle Synthesis/proofs/2026-09-23-grains-that-meet.py) reuses cycle 4's plate model unchanged.

My plain read for the revive question, as your standing order asks: this feels alive. The fountain met the page's core test on this CPU. This cycle answered its collision question with something you can play, and it turned up a real property of the instrument that I didn't plan. An idea that keeps producing surprises is still growing. The call is yours, on the open ask particle-synthesis-007.

**Artifacts:**
- [the lesson, now seven moves. Section 06 is the live grains-that-meet bench: aim, crossing distance, shots per second, meet or pass through.](Projects/Particle Synthesis/proofs/2026-09-23-particle-synthesis-lesson.html)
- [05: grains meet. Clacks in the air, deflected chirps on the ice, thickening as the aim tightens. 7 s.](Projects/Particle Synthesis/proofs/2026-09-23-grains-05-crossing-collide.wav)
- [04: the same launches passing through each other. Rain, no meetings. Same gain as 05.](Projects/Particle Synthesis/proofs/2026-09-23-grains-04-crossing-pass-through.wav)
- [top: every flight in 05 around the crossing, meetings marked. ticks: clack arrivals. bottom: spectrogram of 05.](Projects/Particle Synthesis/proofs/2026-09-23-grains-that-meet.png)
- [the render script: two fountains, grain-on-grain collisions, the two-ball clack in air, and every check quoted here.](Projects/Particle Synthesis/proofs/2026-09-23-grains-that-meet.py)
- [six real clacks rendered exactly, the check the browser bench (and a later Gen~ port) is measured against.](Projects/Particle Synthesis/proofs/2026-09-23-grains-clack-testvector.json)

_04 vs 05 · the same 72 grains, one shared gain · aim tightening 6° → 0.15°_
| measured | 04 pass through | 05 grains meet |
| --- | --- | --- |
| strikes on the ice | 360 | 360 |
| meetings in the air | 0 | 13 (2 loose aim · 11 tight) |
| grains that met at least once | — | 24 of 72 |
| cascades (a grain already hit, hit again) | — | 2 |
| landings by a deflected grain | — | 119 of 360 |
| average sideways drift at landing | 0.15 m | 0.60 m |
| average landing distance | 8.00 m | 8.05 m |

_Left rough:_ I haven't heard any of it. Each clack lasts about a tenth of a millisecond, so it may come across as a small tick more than a clack. The model treats each ball as small next to the sound's wavelength, which a 1.4 cm ball isn't at 10 kHz and above, so the side-on silence would partly fill in for real. The balance between air mics and plate pickups is my taste, and so is firing each shot as two stones of the same size, which I did because drag keeps unequal partners from ever meeting. I don't know how the live bench runs on your machine's audio.

_Next moves named:_ Grains that ring: hollow shells, each carrying its own small resonator, so a meeting has a pitch set by the grain's size. That is the page's first forward direction, a particle with its own differential equation, and it can be built here. · Write the Gen~ voice spec: the chirp oscillator plus the clack as a two-tap difference of the contact force, checked against the events JSON and the clack test vector. Needs the Mac.
<sub>`particle-synthesis-009` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="particle-synthesis-007" -->
### 2026-09-23 — cycle 4 — The fountain on ice makes its sound from physics, not knobs. Revive Particle Synthesis from dormant to sprout?
> still working · fountain renders and lesson shipped · steward leans REVIVE-TO-SPROUT

Particle Synthesis treats each grain as a real particle whose physics makes the sound. It went dormant in January with the idea intact and the instrument unbuilt. Your standing order asked for revival probes and a plain read at the end. This cycle a fountain of particles strikes an ice-like plate. Where each one lands, how hard and how heavy decide its chirp, and 1000 particles render on this CPU. The lesson lets you play it live and switch the ice off to hear the difference. It feels alive to me. For the first time the test the project set itself, sounding like physics, is met by the physics and not by a mapping. The honest limit is that I've measured it but never heard it. Your ears on the lesson or on render 02 are the real check. I'll keep working on colliding grains whichever you pick.

**Artifacts:**
- [the lesson and live fountain: the one click to judge from.](Projects/Particle Synthesis/proofs/2026-09-23-particle-synthesis-lesson.html)
- [render 02: 64 particles on ice, if you would rather just listen.](Projects/Particle Synthesis/proofs/2026-09-23-fountain-02-cloud64-ice.wav)
- [2026-09-23-fountain-cloud64.png](Projects/Particle Synthesis/proofs/2026-09-23-fountain-cloud64.png)
- [2026-09-23-fountain-03-cloud1000-ice.wav](Projects/Particle Synthesis/proofs/2026-09-23-fountain-03-cloud1000-ice.wav)
- [2026-09-23-fountain-01-cloud64-dry.wav](Projects/Particle Synthesis/proofs/2026-09-23-fountain-01-cloud64-dry.wav)
- [2026-09-23-fountain-00-one-particle.wav](Projects/Particle Synthesis/proofs/2026-09-23-fountain-00-one-particle.wav)
- [2026-06-23-dispersion-02-mild.wav](Projects/Particle Synthesis/proofs/2026-06-23-dispersion-02-mild.wav)
- [2026-06-23-dispersion-03-strong.wav](Projects/Particle Synthesis/proofs/2026-06-23-dispersion-03-strong.wav)
- [2026-05-04-particle-grain-cloud.html](Projects/Particle Synthesis/proofs/2026-05-04-particle-grain-cloud.html)
- [2026-06-08-dispersion-laws.png](Projects/Particle Synthesis/proofs/2026-06-08-dispersion-laws.png)
- [2026-06-08-dispersion-prism.html](Projects/Particle Synthesis/proofs/2026-06-08-dispersion-prism.html)
- [2026-06-23-dispersion-01-no-dispersion.wav](Projects/Particle Synthesis/proofs/2026-06-23-dispersion-01-no-dispersion.wav)
- [Particle Synthesis — icon.png](Projects/Particle Synthesis/Particle Synthesis — icon.png)
- [2026-05-04-particle-grain-cloud-v2.html](Projects/Particle Synthesis/proofs/2026-05-04-particle-grain-cloud-v2.html)
<sub>`particle-synthesis-007` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="particle-synthesis-006" -->
### 2026-09-23 — cycle 4 — A fountain on ice: particles fall and skip across a stiff plate, and every strike arrives as a chirp. Renders for 64 and 1000 particles, plus an interactive lesson.
> shipped · 64-cloud audition and lesson done · steward leans COLLISIONS next

Start with [the lesson](open:Projects/Particle Synthesis/proofs/2026-09-23-particle-synthesis-lesson.html). It walks the arc in six moves: the idea, the history, the law under the ice with a strike you can play, a live fountain you can start and walk away from, the offline renders, and where it goes next. In the fountain, switch 'ice' off and the same strikes become clicks. That difference is what dispersion adds.

The physics: bending waves in a stiff plate travel faster at high frequencies, so a strike sorts itself into a sweep on the way to you. Twice the distance means a sweep twice as long. Particles fly under gravity and light air drag and lose a bit more than half their bounce on each hop. That gives the skip-skip-skip rhythm. Heavier particles stay in contact longer, so they strike darker (the Hertz contact law).

The renders come from exact frequency-by-frequency Python, with the fountain walking from 3 m to 18 m away over ten seconds. Listen to [02, 64 particles on ice](open:Projects/Particle Synthesis/proofs/2026-09-23-fountain-02-cloud64-ice.wav) against [01, the same strikes with no dispersion](open:Projects/Particle Synthesis/proofs/2026-09-23-fountain-01-cloud64-dry.wav). [00](open:Projects/Particle Synthesis/proofs/2026-09-23-fountain-00-one-particle.wav) is one particle on its own. [03](open:Projects/Particle Synthesis/proofs/2026-09-23-fountain-03-cloud1000-ice.wav) is the page's own number: 1000 particles and 5,005 strikes, where the chirps turn into weather. In [the figure](open:Projects/Particle Synthesis/proofs/2026-09-23-fountain-cloud64.png), each slanted line in the spectrogram is one strike, and the slant grows as the fountain recedes.

What surprised me: flipped around, the law gives a closed form for the pitch you hear at each instant. So each strike can be a single oscillator following that curve, with no FFT. Against the exact render it matched at 0.997–0.999 correlation on 20 strikes, with equal energy. That's what makes the live browser fountain possible, and it's the shape a Gen~ voice or a GPU kernel would take.

**Artifacts:**
- [the interactive lesson: the arc, the law, a strike bench, a live fountain, the renders, the road ahead. Review layer on.](Projects/Particle Synthesis/proofs/2026-09-23-particle-synthesis-lesson.html)
- [02: the audition. 64 particles on ice.](Projects/Particle Synthesis/proofs/2026-09-23-fountain-02-cloud64-ice.wav)
- [01: the same 320 strikes with no dispersion. Clicks, for comparison.](Projects/Particle Synthesis/proofs/2026-09-23-fountain-01-cloud64-dry.wav)
- [00: one particle skipping five times to rest about 12 m away.](Projects/Particle Synthesis/proofs/2026-09-23-fountain-00-one-particle.wav)
- [03: 1000 particles, 5,005 strikes. The forward vector's number, rendered offline on CPU.](Projects/Particle Synthesis/proofs/2026-09-23-fountain-03-cloud1000-ice.wav)
- [top: every flight path of the 64-cloud. bottom: spectrogram of 02, one slanted line per strike.](Projects/Particle Synthesis/proofs/2026-09-23-fountain-cloud64.png)
- [the render script: particle flight, Hertz contact, exact dispersion by FFT, and the closed-form check.](Projects/Particle Synthesis/proofs/2026-09-23-fountain-on-ice.py)
- [every strike and flight path of the 64-cloud, a test vector for a later Gen~ or GPU port.](Projects/Particle Synthesis/proofs/2026-09-23-fountain-cloud64-events.json)

_the four renders · 48 kHz stereo · fountain walks 3 m → 18 m_
| render | particles | strikes | what to listen for |
| --- | --- | --- | --- |
| 00 one particle | 1 | 5 | the unit: one pew per hop, hops shortening |
| 01 cloud, no dispersion | 64 | 320 | the reference: clicks |
| 02 cloud on ice | 64 | 320 | chirps that stretch and darken as the fountain recedes |
| 03 cloud on ice | 1000 | 5,005 | density turns the chirps into weather (34 s CPU for 12 s) |

_Left rough:_ I haven't heard any of this. There's no audio playback or real browser here, so 'sounds like physics' is checked by numbers and the spectrogram, not by ear. I don't know how many live voices your machine can take; above 60 strikes a second the fountain voices a random share and turns each one up to keep the energy. The audio players may not load the WAVs inside the board's frame. The ice stiffness is the one value I chose by taste.

_Next moves named:_ Grains that meet: let particles collide with each other, not just the plate, so a strike can happen at a moving place (the entry's collision direction). Buildable here in Python and in the lesson. · Write the closed-form chirp as a per-strike oscillator spec for Gen~, with the events JSON as its test vector. The Mac-side build needs the Mac.
<sub>`particle-synthesis-006` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="particle-synthesis-004" -->
### 2026-06-23 — cycle 2 — Dispersion core works as audio. Which direction should the next cycle take it?
> still working · 3 audition seeds shipped to GENERAL · steward leans POLYPHONIC-CLOUD

The single-impulse dispersion render proves the physics out: the chirp is in the seeds (see particle-synthesis-003). The entry's forward vector calls for a thousand particles, not one, and names three plausible next moves: (1) a polyphonic grain cloud where N=64 particles each carry their own dispersion path and superpose into a drone — closest to the GPU-compute vision and the cheapest next render; (2) the Particle Fountain Max/MSP teaching device from the entry's pedagogy section — slower to build, but it makes the physics-as-DSP point legible to a learner; (3) particle collision as a compositional primitive — most exploratory, weakest ear-test. I lean POLYPHONIC-CLOUD because it stays in the rendered-audio modality where the dispersion seeds just landed, and a 64-particle cloud is a single afternoon's render to audition before any Max-side handoff. If you have not had a chance to listen to the seeds yet, ignore this — I will run POLYPHONIC-CLOUD by default next cycle.

**Artifacts:**
- [2026-06-08-dispersion-laws.png](Projects/Particle Synthesis/proofs/2026-06-08-dispersion-laws.png)
- [2026-06-08-dispersion-prism.html](Projects/Particle Synthesis/proofs/2026-06-08-dispersion-prism.html)
<sub>`particle-synthesis-004` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="particle-synthesis-003" -->
### 2026-06-23 — cycle 2 — Dispersion as audio — three rendered seeds, alpha sweeping from zero to strong.

Catch-up: Particle Synthesis reframes granular synthesis as GPU-style particle physics — each grain a particle with state, dispersion an emergent property of the medium rather than a programmed modulation. Cycle 1 (2026-06-06) asked which substrate to extend; you greenlit EXTEND-WEBAUDIO on 2026-06-09 and a visual dispersion prism shipped that day (proofs/2026-06-08-dispersion-prism.html). This cycle takes the next step the prism couldn't: rendering the physics straight to audio so the chirp is in your DAW, not just on screen.

A wideband impulse pushed through omega(k) = c*k + alpha*k^3. Group velocity vg = c + 3*alpha*k^2, so high-k (high-frequency) components travel faster and arrive first; low frequencies trail. The chirp is not modulated in — it falls out of the dispersion relation itself. Three audition seeds at increasing alpha:

**Artifacts:**
- [alpha = 0 — a clean click, no chirp. Reference.](Projects/Particle Synthesis/proofs/2026-06-23-dispersion-01-no-dispersion.wav)
- [alpha = 3e-9 — mild chirp, the attack lengthens, faint metallic shimmer.](Projects/Particle Synthesis/proofs/2026-06-23-dispersion-02-mild.wav)
- [alpha = 3e-8 — strong dispersion. High partials arrive first; the tail is a low descending sweep. The bell-like signature.](Projects/Particle Synthesis/proofs/2026-06-23-dispersion-03-strong.wav)
- [the render script — 60 lines of numpy, FFT phase shift per omega(k).](Projects/Particle Synthesis/proofs/2026-06-23-dispersion-render.py)
<sub>`particle-synthesis-003` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
