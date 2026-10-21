---
title: "Retrospective Delay — scroll"
born: 2026-09-23
links:
  - target: "[[Retrospective Delay]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Retrospective Delay's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Retrospective Delay — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Retrospective Delay]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-15T01:48:08.877Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 24 · last ran 2026-10-15 (today)
- **Plan:** agreed 2026-09-26 (19 days ago) · 8 made things since · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — The H90 can't run RNBO yet. Should the portal aim at VST/AU, Max for Live and the browser instead, with hardware only if it opens up? (`retrospective-delay-steward-055`)
- **Last commit touching this project:** 2026-10-14 `79fca44c` — steward(Retrospective Delay): cycle 23 — SPINNING UP. HOME: [Retrospective Delay](obsidian://open?vault=The%20Pa…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Retrospective Delay is a one-measure delay that is always listening: a tape holds the last measure you played, and one gain knob decides whether that past comes back as a single ghost. The plan builds it in five moves for Loudon Live. The first four are drafted with working models and unopened patches: the witness (the bare buffer), the séance (silence keeps the past, with your 5 ms input crossfade), the grammar (the same thing as one gen~ codebox), and the face (the Gorey cat reading three facts from the device). This cycle built the last move, the portal: the gen~ codebox ported to RNBO so the instrument can leave Max as a VST/AU, a Max for Live device, or a web page. That makes all five…

### Open asks

- `retrospective-delay-steward-055` — proposed plan revision: the portal's hardware target · posted 2026-10-14 · options: adopt · keep

### Answered, not yet consumed

_None._

### Decided

- `retrospective-delay-steward-044` — directional_decision → GRANTED — option_id=KEEP-SPEC; notes: "When it comes in, make sure there is a little crossfade input, just a few ms to avoid clicks." (2026-10-15)
- `retrospective-delay-steward-041` — directional_decision → GRANTED — option_id=WIRE-NOW (2026-06-25)
- `retrospective-delay-steward-039` — directional_decision → GRANTED — option_id=RENDER-SET (2026-06-23)
- `retrospective-delay-steward-037` — directional_decision → GRANTED — (no option_id); notes: "I see three images here and they are not well created. "triumphant gain0.92" is one of them. I am confused why I am seeing these and how they relate to the options." (2026-06-23)
- `retrospective-delay-steward-035` — directional_decision → GRANTED — option_id=REFINE-INK (2026-06-23)
- `retrospective-delay-steward-033` — directional_decision → GRANTED — option_id=GREENLIGHT (2026-06-22)
- `retrospective-delay-steward-031` — directional_decision → GRANTED — option_id=RENDER-NOW (2026-06-22)
- `retrospective-delay-steward-029` — directional_decision → GRANTED — (no option_id); notes: "the gorey render looks like a small cat to me, go with it." (2026-06-22)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** A one-measure delay that is always listening: a circular buffer holds the last measure of everything you play, and one gain knob decides whether that past comes back. It is built in five moves, and two of them are deliberate migrations (vanilla Max to Gen~, then Gen~ to RNBO) where the friction is the lesson. Any move can happen in public as a [[Loudon Live]] build. The first move is drafted and its patch specified. The character for the fourth move was made early: a séance cat in Gorey-style ink, drawn in three states and, after Loudon said on 2026-06-25 to wire it next, wired to the gain knob in JSUI with a preview rendered.

**The moves ahead**

1. **The witness.** In vanilla Max, a write head and a read head sweep one buffer, one measure apart, wrapped as a Max for Live audio effect. You play and hear your whole phrase come back as a single ghost, not as echoes.
2. **The séance.** Make it performable: the gain knob as the one gesture that summons or silences the past, a choice of lag length, and a crossfade at the loop seam. Silence becomes the most expressive thing the player can do.
3. **The grammar behind the spell.** Port the core to Gen~ and see that the patch was always running at signal rate. Then set it beside the compressor's 11 ms buffer: the same mechanism holding a hundred times less time.
4. **The face.** An animated character in JSUI whose three states (dormant, awakening, triumphant) are the gain knob's meaning made visible. The cat is drawn and wired to the knob; it hasn't yet been played in Max.
5. **The portal.** Port to RNBO and export as a VST/AU and to the Eventide H90, so the instrument lives outside Max. Then ask whether it is still the same instrument.

The April session designs for these moves are archived: [[Retrospective Delay — spec — Loudon Live sessions]].
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
- **Max work is paused until we have Max patching standards** (Loudon, 2026-10-16). Make no new Max patcher, gen~ or RNBO codebox, or Max for Live device, and don't edit the ones already made. Carry the Max moves in other tools meanwhile, and write down what each patch will need. This holds over anything below and over the Plan until Loudon lifts it.

Decided with Loudon when the Loudon Live arc was designed (April 2026), and seeded here once from the retired staging file on 2026-09-25:

- **The environment grows with the moves**: vanilla Max as a Max for Live audio effect for the witness and the séance, a Gen~ subpatcher inside the device for the grammar, a JSUI layer for the face, and RNBO codebox~ out to VST/AU and the H90 for the portal.
- **Two migrations are deliberate friction**: vanilla Max to Gen~ (the grammar) and Gen~ to RNBO (the portal). Both are lessons, not chores.
- **Sessions run about 70% making, 30% framing**, except the two migrations, which run about 50/50 because the shift in thinking needs room.
- **Participants can already build basic Max/MSP patches** (`phasor~`, `buffer~`, `plugin~`/`plugout~`); the Max for Live device format is covered in the witness session's prerequisites.
- **It runs parallel to [[Compressor Design]]**, the same primitive at about 11 ms, with no dependency either way: they reinforce each other rather than scaffold. See [[Curriculum Map]].

**2026-10-21 — make it a product: a VST to play in Ableton.** Your next work is a usable VST prototype built with the [[VST Template]] system, something Loudon can play in Live. Keep the controls in the template's interface. The centre of the face is a "CRT" holding a visualizer of your own: beautiful, 3D welcome, drawn deeply from this effect's metaphor or what is unique about it, never a generic scope. Get playful; make it uniquely weird and stunning. Max work stays set aside: your Max, RNBO and Max for Live files wait, and may come back later as teaching tools; the product comes first. Until the template has its CRT and can build a plugin inside your bundle, port the sound to the template's sketch-and-Algorithm shape in your workshop and sketch the visualizer as a web page there, fed by the values the plugin will stream. Propose the change to your Plan as a plan_revision with what you made. — Loudon: "lets make them products now."
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="retrospective-delay-steward-055" -->
### 2026-10-14 — cycle 24 — The H90 can't run RNBO yet. Should the portal aim at VST/AU, Max for Live and the browser instead, with hardware only if it opens up?
> still working · all five moves drafted · steward leans adopt

Retrospective Delay is the one-measure delay that is always listening, built in five Loudon Live moves. All five are now drafted. The last move, the portal, ports the device to RNBO so it can leave Max. The plan says it goes out as a VST/AU and onto the Eventide H90. As far as I can find, the H90 has no RNBO route. Eventide supports RNBO on the H9000 rack processor, and for the H90 has said only that it's considering it. Crystal Synthesizer's portal hit the same wall. I built the codebox so it would run on an H9000 unchanged: no buffer~, no transport needed. I also added a browser page as a third way out. My knowledge could be stale, so if the H90 has opened up, KEEP and I'll check it. The proposed plan only changes where the portal goes.

**Artifacts:**
- [face-film.mp4](Projects/Retrospective Delay/stage-4-character/face/face-film.mp4)
- [face-moments.png](Projects/Retrospective Delay/stage-4-character/face/face-moments.png)
<sub>`retrospective-delay-steward-055` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-054" -->
### 2026-10-14 — cycle 24 — The séance is now one RNBO codebox. It matches the gen~ version to the last bit, runs in a browser page, and caught a 96 kHz bug on the way out.
> shipped · all five moves now drafted · nothing compiled in Max yet · steward leans export-test next

The plan asks one question of this move: once it lives outside Max, is it still the same instrument? I can now answer it in two halves.

Yes, the arithmetic is the same. [portal.codebox](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-5-portal/portal.codebox) is about 70 lines of rnboscript. [portal_mirror.mjs](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-5-portal/portal_mirror.mjs) runs that file's own text against the face's gen~ model over the whole fifteen-measure performance. All five outlets match: four exactly, and the ghost to 5.6e-17. portal-performance.wav is the codebox's own render.

No, the world around it is different. Leaving Max showed me two things Max for Live had been quietly giving the device:

1. A running transport. The gen~ write head followed a phasor~ locked to Live's transport. When the transport stops, that phasor stops, and the tape writes one slot forever. A plugin host or a hardware box doesn't promise a transport. But the ghost only ever needed the distance between the two heads, not where the bar line is. So the portal's write head counts its own samples, and tempo comes in as a bpm knob.
2. A sample rate the tape was sized for. gen~'s tape held 4 seconds at 48 kHz. At 96 kHz a slow measure doesn't fit, the tape quietly shrinks, and the ghost comes back early. The table shows where. Listen to slow-tempo-gen-tape.wav, then slow-tempo-portal.wav: both run at 96 kHz and 60 BPM with a half-note lag, and the first one lands on beat two instead of beat three. The portal's tape doubles to 384000 slots. This bug is also in the grammar and face codeboxes.

The tape also lives inside the codebox rather than in a buffer~, which matters because the H9000's RNBO target doesn't support buffer~ yet.

Three more pieces shipped. [portal.maxpat](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-5-portal/portal.maxpat) is an rnbo~ holding the codebox, with in~/out~ and the face's three facts sent through outports. portal-web.html runs the codebox's own text in your browser, with a tape ring showing both heads, the knob, the lag and the tempo, and a review layer on it. [The session draft](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-5-portal/stage-5-the-portal.md) shapes all of this into the last Loudon Live session. It runs about half framing, half making, per your standing order for the migrations.

**Artifacts:**
- [the portal in your browser: the codebox's own text, run line for line. Start audio, play a phrase, stop, raise the knob.](Projects/Retrospective Delay/stage-5-portal/portal-web.html)
- [the séance performance rendered by the RNBO codebox; identical to the face's gen~ render.](Projects/Retrospective Delay/stage-5-portal/portal-performance.wav)
- [96 kHz, 60 BPM, the gen~ tape: the ghost comes back a beat early.](Projects/Retrospective Delay/stage-5-portal/slow-tempo-gen-tape.wav)
- [the same through the portal's tape: on beat three, where a half note belongs.](Projects/Retrospective Delay/stage-5-portal/slow-tempo-portal.wav)
- [the RNBO codebox~ source, with its unverified seams at the top.](Projects/Retrospective Delay/stage-5-portal/portal.codebox)
- [an rnbo~ holding the codebox, ready to export; unopened.](Projects/Retrospective Delay/stage-5-portal/portal.maxpat)
- [the session draft for the last move.](Projects/Retrospective Delay/stage-5-portal/stage-5-the-portal.md)
- [the mirror: null test against the face model, the rate/tempo sweep, the renders.](Projects/Retrospective Delay/stage-5-portal/portal_mirror.mjs)
- [the mirror's numbers.](Projects/Retrospective Delay/stage-5-portal/portal_mirror_report.json)
- [dumps the face model's run for the mirror.](Projects/Retrospective Delay/stage-5-portal/face_reference.py)
- [builds portal.maxpat.](Projects/Retrospective Delay/stage-5-portal/build_portal_patch.mjs)
- [builds portal-web.html from the codebox text.](Projects/Retrospective Delay/stage-5-portal/build_portal_web.mjs)

_Where the ghost lands, lag = half a measure (it should be 120 ÷ bpm seconds back)_
| sample rate | bpm | should be | portal tape (384000) | gen~ tape (192000) |
| --- | --- | --- | --- | --- |
| 44.1 kHz | 120 / 90 / 60 | 1.000 / 1.333 / 2.000 s | on time, all three | on time, all three |
| 48 kHz | 120 / 90 / 60 | 1.000 / 1.333 / 2.000 s | on time, all three | on time, all three |
| 96 kHz | 120 | 1.000 s | 1.000 s | 1.000 s |
| 96 kHz | 90 | 1.333 s | 1.333 s | 1.000 s — early |
| 96 kHz | 60 | 2.000 s | 2.000 s | 1.000 s — early |

_Left rough:_ Nothing has been compiled by RNBO, and I haven't played the browser page by ear: I only checked that its scripts parse and its transpiler runs the codebox. A 384000-slot array is far bigger than any RNBO array in the palace so far and may need to become Float32 or a [data] object. The grammar and face gen~ codeboxes still carry the 96 kHz bug.

_Next moves named:_ When you have Max open: compile portal.maxpat, export a VST3, and load it in a second host. That's the first real test of the RNBO codebox~ smith, and whatever breaks becomes its first Gotchas. · Fix the 96 kHz tape in the grammar and face codeboxes and their models (one number each), then re-run the face film to confirm nothing moved. · Propose the entry's own catch-up (its Open Questions about buffer length, the seam crossfade and the platform are now answered by the drafts) as a FLAG for an elder to land.
<sub>`retrospective-delay-steward-054` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-052" -->
### 2026-10-15 — cycle 23 — The séance cat now watches the instrument, not the knob. Its pose, ectoplasm and candle each come from the gen~ device, and there's a film of it.
> shipped · the face is built in model and patch · not opened in Max · steward leans the portal next

**The cat used to say only what the dial said.** Turn the knob and it woke, reached, triumphed. That's charming, and it's redundant. Now [face.genexpr](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-4-character/face/face.genexpr) is the grammar's codebox, unchanged, plus three outlets: the slewed gain (the knob as heard), an envelope on the raw ghost before the knob (is anything on the tape?), and `1 - listen` (is the tape holding?). The model checks that the sound is untouched: the face's output matches the grammar's exactly, difference zero.

**Two frames the knob could never show.** In [face-moments.png](open:Projects/Retrospective Delay/stage-4-character/face/face-moments.png), bottom-left: the cat asleep, pale strands still around it, candle lit. You dismissed the ghost, but the past is still on the tape. Bottom-right: knob all the way up, cat reaching, no strands. The room is empty. Those two frames are the session's whole argument: a face should show what the instrument is doing, not what its controls are set to.

**One thing I caught by looking.** In the first render the ectoplasm was dark ink, the old JSUI's colour, and it disappeared against the plates. 'Summoned' and 'empty room' looked identical. I moved it to pale bone, drawn after the lights-down darkening, so it reads even while the cat sleeps. I also stretched the presence envelope's release to 1 second, so the rests inside a phrase don't flicker as 'empty'.

**The film.** [face-film.mp4](open:Projects/Retrospective Delay/stage-4-character/face/face-film.mp4) is the séance's 15-measure performance with sound, the cat reacting at 30 fps, and a caption and three small meters under it. Watch measures 9 to 12: dismissed, asleep with the past kept, then summoned again, and the same phrase comes back.

**In Max.** [face.maxpat](open:Projects/Retrospective Delay/stage-4-character/face/face.maxpat) is the grammar device with `snapshot~ 33` on the three new outlets feeding a jsui running the rewritten [seance-cat.js](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-4-character/jsui/seance-cat.js). The cat never sees the dial. The [session draft](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-4-character/stage-4-the-face.md) runs about 70% making, as the standing orders set for non-migration moves. The room finds the three facts themselves, each one from an earlier session. Then they build the outlets, wire the cat, and watch the film calling out moments before the captions do. It ends on the bridge to the portal: RNBO has no JSUI, so what happens to the face when the instrument leaves Max?

**Artifacts:**
- [start here: the séance performance with sound, the cat reacting to the instrument, 30 s.](Projects/Retrospective Delay/stage-4-character/face/face-film.mp4)
- [six stills: play, summon, overwrite, dismissed-but-kept, summon again, and the empty room.](Projects/Retrospective Delay/stage-4-character/face/face-moments.png)
- [the face session draft: frame, five build steps, watch it together, reflect.](Projects/Retrospective Delay/stage-4-character/stage-4-the-face.md)
- [the grammar's codebox plus three outlets for the face. Sound unchanged.](Projects/Retrospective Delay/stage-4-character/face/face.genexpr)
- [the gen~ device with the cat in its face, fed only by gen~ outlets. Not opened in Max.](Projects/Retrospective Delay/stage-4-character/face/face.maxpat)
- [writes face.maxpat; header says how to put the plates on Max's search path.](Projects/Retrospective Delay/stage-4-character/face/build_face_patch.py)
- [runs face.genexpr line for line, paints the cat the way the JSUI does, films it.](Projects/Retrospective Delay/stage-4-character/face/face_model.py)
- [the JSUI cat, rewritten: three inputs, pale ectoplasm over the darkening, a candle.](Projects/Retrospective Delay/stage-4-character/jsui/seance-cat.js)
- [the old one-knob preview, now marked superseded.](Projects/Retrospective Delay/stage-4-character/jsui/render_wired_preview.py)

_what the face reads at six moments (face_model.py)_
| moment | knob as heard | on the tape | holding | what you see |
| --- | --- | --- | --- | --- |
| you play, knob down | 0.00 | 1.00 | 0 | asleep, strands faint, candle out |
| summoned | 0.85 | 0.85 | 1 | arms up, strands bright, candle lit |
| playing over it | 0.85 | 0.84 | 0 | arms up, candle out: the tape listens |
| dismissed | 0.00 | 0.57 | 1 | asleep, strands still there: past kept |
| summoned again | 0.85 | 1.00 | 1 | the same past returns |
| empty room | 0.85 | 0.00 | 1 | arms up, nothing there |

_Left rough:_ Nothing has run in Max, and the jsui finding its plates inside a frozen device is the likeliest break. The strands are plain vector curves over hand-inked plates: they read, but they don't match the Gorey line. In the empty room the candle is lit because the tape is 'holding' silence. That's honest, but it may look like a bug.

_Next moves named:_ The portal, the last move: carry seance.genexpr into an RNBO codebox~ through the RNBO codebox~ smith, sizing the tape from the sample rate, and ask what the face becomes once there's no JSUI. · Whenever Live is open: load face.maxpat in a Max Audio Effect, play a phrase with the knob down, and check that the sleeping cat grows strands. · If the face's style matters for the public session: redraw the ectoplasm as inked plates rather than vector strands.
<sub>`retrospective-delay-steward-052` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-050" -->
### 2026-10-15 — cycle 22 — The witness now teaches honestly that it's an echo. Silence-keeps moved to the séance, with a 5 ms crossfade so neither stopping nor coming in clicks.
> shipped · your KEEP-SPEC call carried through all three sessions · steward leans the face next

**The witness tells the truth now.** The [session draft](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-1/stage-1-the-witness.md) used to say a student would fail to rebuild this in Echo. Now the Reveal has them do it: Echo with one half-note tap and no feedback, polarity flipped, summed against the witness. Silence. Then the letdown becomes the lesson. A circular buffer with a fixed lag *is* a delay line, and its length never shows, because the read head gets to each slot long before the write head comes back to overwrite it. The session ends on the question the séance answers: *what would make this something Echo can't do?* I also replaced the April object list with the one the built patch actually uses (one shared clock, `-~ 0.5` then `wrap~`, wave~'s end point set to the measure). I dropped the promised 're-echoes' too, since nothing feeds the ghost back into the buffer. The anchor patch is witness-A-as-specified.maxpat, and both older April docs now open with a note saying what was wrong in them.

**Silence keeps, in the séance, with the crossfade you asked for.** The [séance draft](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-2-seance/stage-2-the-seance.md) now starts from the pure witness and adds silence-keeps first, wired hard so the room hears it tick. Then comes the fix, `rampsmooth~ 240 240`: a straight 5 ms ramp between listening and holding, in both directions. It replaces the old ~10 ms exponential slide. I added the case you named: frozen loop, then you come back in mid-measure. A hard switch splices new sound onto old with a jump of 0.237. With the 5 ms crossfade it's 0.033, which is exactly the size of the pluck's own attack. In the model even 1 ms cleared both clicks. The other 4 ms are margin for low notes I haven't tested. Start with [comein-hard.wav](open:Projects/Retrospective Delay/stage-2-seance/comein-hard.wav), then [comein-crossfaded.wav](open:Projects/Retrospective Delay/stage-2-seance/comein-crossfaded.wav).

**The gen~ version follows.** [seance.genexpr](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-3-grammar/seance.genexpr) now says `lstep = 1 / mstosamps(5)`, which is 5 ms at any sample rate, where the vanilla object counts samples. The grammar session points that out. The gen~ ghost still matches the vanilla séance to 1.7e-16, and every render in both folders was regenerated.

**Artifacts:**
- [start here: a frozen loop, then you come back in mid-measure. Hard switch, listen for the click each pass.](Projects/Retrospective Delay/stage-2-seance/comein-hard.wav)
- [the same with the 5 ms crossfade in. The splice is gone.](Projects/Retrospective Delay/stage-2-seance/comein-crossfaded.wav)
- [going quiet: a held chord stops mid-measure, now with the 5 ms linear crossfade.](Projects/Retrospective Delay/stage-2-seance/seam-smoothed.wav)
- [the 15-measure séance performance, re-rendered with the new crossfade.](Projects/Retrospective Delay/stage-2-seance/seance-performance.wav)
- [re-rendered: re-lag with one head (click).](Projects/Retrospective Delay/stage-2-seance/lagswitch-hard.wav)
- [re-rendered: re-lag with two heads and a 30 ms fade.](Projects/Retrospective Delay/stage-2-seance/lagswitch-crossfade.wav)
- [the séance session: silence keeps arrives here, ticks, then gets its crossfade.](Projects/Retrospective Delay/stage-2-seance/stage-2-the-seance.md)
- [the séance patch with rampsmooth~ 240 240 on the gate. Not opened in Max.](Projects/Retrospective Delay/stage-2-seance/seance.maxpat)
- [writes seance.maxpat.](Projects/Retrospective Delay/stage-2-seance/build_seance_patch.py)
- [the model: linear 5 ms crossfade, plus the new coming-in test.](Projects/Retrospective Delay/stage-2-seance/seance_model.py)
- [the witness session, rewritten: the Echo null test as the honest reveal.](Projects/Retrospective Delay/stage-1/stage-1-the-witness.md)
- [the April patch spec, with a note on what the build corrected.](Projects/Retrospective Delay/stage-1/Retrospective Delay — spec — stage-1-patch.md)
- [the April build notes, with a superseded note naming their faults.](Projects/Retrospective Delay/session-1-implementation.md)
- [notes that A is the witness and B is kept only for the record.](Projects/Retrospective Delay/stage-1/witness/build_witness_patch.py)
- [the gen~ codebox: the crossfade now written as 5 ms.](Projects/Retrospective Delay/stage-3-grammar/seance.genexpr)
- [line-for-line model; still nulls against the séance at 1.7e-16.](Projects/Retrospective Delay/stage-3-grammar/grammar_model.py)
- [gen~ patch rebuilt with the new codebox. Not opened in Max.](Projects/Retrospective Delay/stage-3-grammar/grammar.maxpat)
- [the grammar session: the seam step now reads as rampsmooth~ made explicit.](Projects/Retrospective Delay/stage-3-grammar/stage-3-the-grammar.md)
- [re-rendered through the gen~ code.](Projects/Retrospective Delay/stage-3-grammar/grammar-performance.wav)
- [re-rendered: read before write at lag exactly 1.](Projects/Retrospective Delay/stage-3-grammar/order-read-first.wav)
- [re-rendered: write before read at lag exactly 1.](Projects/Retrospective Delay/stage-3-grammar/order-write-first.wav)
- [re-rendered: phrase, stutter, flutter, tone.](Projects/Retrospective Delay/stage-3-grammar/shrinking-measure.wav)

_biggest jump between samples in the held ghost (a held chord alone is 0.013; the pluck's own attack is 0.033)_
| edge | hard switch | 1 ms ramp | 5 ms ramp (chosen) | 10 ms ramp |
| --- | --- | --- | --- | --- |
| going quiet (you stop) | 0.178 click | 0.011 | 0.011 | 0.011 |
| coming in (you play again mid-measure) | 0.237 click | 0.033 | 0.033 | 0.031 |

_Left rough:_ Nothing has run in Max or Live yet. The Echo null test in the witness Reveal is proven only in the model. In Live it depends on switching off Echo's filter, modulation and noise, so it should be tried before the session. The 5 ms crossfade is tested only on synthetic chords and plucks. A click the player makes (a hard mute mid-note) still gets written into the tape and loops.

_Next moves named:_ The face: play the Gorey séance cat in Max, driven by the gen~ knob value, and draft its session as the fourth move. · Then the portal: carry seance.genexpr into an RNBO codebox~ through the RNBO codebox~ smith, sizing the tape from the sample rate. · Whenever you next have Live open: paste witness-A into a Max Audio Effect and run the Echo null test once. That one check decides whether the witness's reveal works in the room.
<sub>`retrospective-delay-steward-050` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-048" -->
### 2026-10-14 — cycle 21 — The séance now runs as one gen~ codebox, the whole note is exactly 1, and the compressor's 11 ms window turns out to be the same two lines.
> shipped · gen~ port matches the vanilla model exactly · not opened in Max · steward leans SILENCE-KEEPS

**One sample's worth of thought.** [seance.genexpr](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-3-grammar/seance.genexpr) is the whole séance in about thirty lines: the tape, two read heads with the 30 ms handover, the witness's listen-or-hold write, the ~10 ms seam smoothing, and the slewed knob. [grammar.maxpat](open:Projects/Retrospective Delay/stage-3-grammar/grammar.maxpat) puts it in a gen~ object with only the transport clock, the measure length and the two controls outside. The controls now send `gain`, `lag` and `measure` messages instead of driving signal chains. A line-for-line Python copy of the codebox matches the vanilla séance model: the largest difference between the two ghosts is 1.4e-16.

**Why 0.999 can become 1.** In vanilla Max you can't choose whether poke~ or wave~ runs first. In gen~, lines run in the order you write them, so the read can go before the write. The two order renders show what's at stake. With read-first, the ghost while you play is the measure before (correlation 1.000). With write-first, the 'ghost' is just you, louder (correlation 1.000 with the input right now). In silence they sound the same, which is why nobody would catch it by ear in the vanilla patch.

**The same buffer at 11 ms.** [compressor-window.genexpr](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-3-grammar/compressor-window.genexpr) is Compressor Design's 500-sample RMS window. Its middle two lines, `oldest = peek(win, w); poke(win, sq, w);`, are the séance's read-then-write at a whole-note lag. The model checks its running sum against a plain windowed RMS (difference 7.8e-16). Then the shrinking-measure render freezes one phrase into four tape lengths. You hear a phrase, then a stutter, then a flutter, and at the compressor's 500 samples a 96 Hz tone. Time turns into pitch somewhere between 50 ms and 11 ms. That gives the session its closing reveal.

The [session draft](obsidian://open?vault=The%20Palace&file=Projects/Retrospective%20Delay/stage-3-grammar/stage-3-the-grammar.md) runs about half framing and half making, as the standing orders set for the migrations. It opens on last session's 0.999 question, builds the codebox in five listened-to steps, and ends on the shrinking measure. To try the patch, paste grammar.maxpat into a Max Audio Effect, start the transport, play, stop, and raise the knob. Start with [order-read-first.wav](open:Projects/Retrospective Delay/stage-3-grammar/order-read-first.wav) against [order-write-first.wav](open:Projects/Retrospective Delay/stage-3-grammar/order-write-first.wav).

**Artifacts:**
- [start here: lag exactly 1, read before write. While you play you hear the measure before.](Projects/Retrospective Delay/stage-3-grammar/order-read-first.wav)
- [the same patch with write before read. While you play, the 'ghost' is just you, louder.](Projects/Retrospective Delay/stage-3-grammar/order-write-first.wav)
- [one phrase frozen into 2 s, 250 ms, 50 ms and 500-sample tapes: phrase, stutter, flutter, tone.](Projects/Retrospective Delay/stage-3-grammar/shrinking-measure.wav)
- [the séance's 15-measure performance played through the gen~ code, whole note exactly 1.](Projects/Retrospective Delay/stage-3-grammar/grammar-performance.wav)
- [the séance as one gen~ codebox: read first, then write.](Projects/Retrospective Delay/stage-3-grammar/seance.genexpr)
- [Compressor Design's 500-sample RMS window, with the same two lines.](Projects/Retrospective Delay/stage-3-grammar/compressor-window.genexpr)
- [gen~ inside a Max Audio Effect, with the codebox embedded. Not opened in Max yet.](Projects/Retrospective Delay/stage-3-grammar/grammar.maxpat)
- [writes the patcher. Its header has the paste-it-yourself fallback if the embedded gen~ won't load.](Projects/Retrospective Delay/stage-3-grammar/build_grammar_patch.py)
- [line-for-line model of the codebox: null test, order test, shrinking measure, RMS check.](Projects/Retrospective Delay/stage-3-grammar/grammar_model.py)
- [the session draft: frame, make, the same buffer at 11 ms, reflect.](Projects/Retrospective Delay/stage-3-grammar/stage-3-the-grammar.md)

_one buffer, four lengths (shrinking-measure.wav), 48 kHz_
| tape length | loop repeats at | what you hear |
| --- | --- | --- |
| 2 s (a measure at 120 BPM) | 0.5 Hz | the phrase: memory |
| 250 ms | 4 Hz | a stutter: rhythm |
| 50 ms | 20 Hz | a flutter at the edge of pitch |
| 500 samples (the compressor's window) | 96 Hz | a tone: the loop is an oscillator |

_Left rough:_ Nothing has run in Max, and I wrote the embedded gen~ format from memory. The tape is fixed at 4 s, so below 60 BPM a measure clips. At tempos where a measure isn't a whole number of samples, the write slot will sometimes repeat or skip one. At 500 samples the gate's 100 ms release would wipe the tape, so the shrinking render uses a hand freeze instead.

_Next moves named:_ Once the witness question is answered, rewrite the witness session's reveal honestly and make the chosen version the anchor patch. · Then the face: play the wired séance cat in Max, driven by the gen~ knob value, and draft its session. · Then the portal: carry seance.genexpr into an RNBO codebox~ through the RNBO codebox~ smith, sizing the tape from the sample rate.
<sub>`retrospective-delay-steward-048` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-046" -->
### 2026-10-14 — cycle 20 — The séance is built: a Max patch, a model that renders it, and a session draft. The loop's click isn't at the measure line.
> shipped · built on the silence-keeps witness, patch not yet opened in Max · steward leans SILENCE-KEEPS

The séance adds three things to the silence-keeps witness.

**The knob, ramped, on the way out of the buffer.** Turning it down hides the past but doesn't erase it. In the performance render the ghost is turned fully away for a measure, then brought back, and it's still there. The April session notes put the gain on the write side instead. That would make turning it down slowly erase the ghost, which is a different instrument and breaks the witness idea. I went with the read side and said so in the draft.

**A lag choice of 1/4, 1/2 or 1/1, switched with no click.** Moving one read head is a splice. So there are two read heads: the idle one jumps to the new lag, then a 30 ms fade hands over to it. The whole note is sent as 0.999, not 1.0. At exactly 1.0 the read head sits on the write head, and vanilla Max doesn't promise whether poke~ or wave~ runs first. That's a ready-made question to carry into the Gen~ move.

**The seam, which turned out to be somewhere else.** The plan says to crossfade at the loop boundary. The model shows there is no click at the measure line, because the read head never jumps there. The click is where you stopped playing: once the witness switches from listening to holding, the newest sound it heard ends up right next to the oldest. Smoothing that switch over about 10 ms (`slide~ 480 480` after the gate) removes it. Smoothing the gate is the crossfade. That makes a better reveal for the session than the one planned.

To try it: drop a Max Audio Effect on a track in Live, paste in seance.maxpat, start the transport, play a phrase, stop, and raise the knob. Start with the performance render: phrase, summon, re-lag in silence, a new phrase over the ghost, dismiss, a silent measure, then summon again.

**Artifacts:**
- [start here: 15 measures of play, summon, re-lag, overwrite, dismiss, then summon again. The ghost survives the silence.](Projects/Retrospective Delay/stage-2-seance/seance-performance.wav)
- [a held chord stops mid-measure and the loop holds it with a hard gate. Listen for the tick each pass.](Projects/Retrospective Delay/stage-2-seance/seam-hard.wav)
- [the same chord with the gate smoothed over ~10 ms. The tick is gone.](Projects/Retrospective Delay/stage-2-seance/seam-smoothed.wav)
- [the held ghost switched from a whole-note to a quarter-note lag with one read head: a splice.](Projects/Retrospective Delay/stage-2-seance/lagswitch-hard.wav)
- [the same switch with two read heads and a 30 ms fade.](Projects/Retrospective Delay/stage-2-seance/lagswitch-crossfade.wav)
- [the séance as a vanilla Max patcher for a Max Audio Effect: gain dial, lag tab, two heads, smoothed gate. Not opened in Max yet.](Projects/Retrospective Delay/stage-2-seance/seance.maxpat)
- [writes the patcher; its header explains the 0.999 and the seam.](Projects/Retrospective Delay/stage-2-seance/build_seance_patch.py)
- [the model: renders all five WAVs and prints the click measurements.](Projects/Retrospective Delay/stage-2-seance/seance_model.py)
- [the séance session draft: frame, make, performance, reflect, built around the seam finding.](Projects/Retrospective Delay/stage-2-seance/stage-2-the-seance.md)

_biggest jump between neighbouring samples in the ghost (higher = a click). A held chord on its own reads 0.013_
| case | without the fix | with the fix |
| --- | --- | --- |
| loop seam where you stopped playing | 0.178 (hard gate) | 0.011 (gate smoothed ~10 ms) |
| switching the lag mid-loop | 0.084 (one read head) | 0.008 (two heads, 30 ms fade) |
| the measure line itself | 0.011 (no seam there) | n/a |

_Left rough:_ Nothing has run in Max. In a model run, a hard stop leaves about half a second of near-silence in the held measure because of the gate's 100 ms release; that gap and the 0.003 threshold both need your ear on a real instrument. The witness question is still open; if you pick KEEP-SPEC, the séance needs rethinking, since silence wouldn't summon anything.

_Next moves named:_ Once the witness question is answered, rewrite the witness session's reveal honestly and make the chosen version the anchor patch. · Then the Gen~ move: port the séance core into a gen~ subpatcher, starting from why the whole note had to be 0.999, and set it beside the compressor's 11 ms buffer.
<sub>`retrospective-delay-steward-046` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-044" -->
### 2026-10-14 — cycle 19 — As written, the witness is just a half-note echo. Should silence keep the past instead?
> still working · both versions built and rendered · steward leans SILENCE-KEEPS

Catch-up: Retrospective Delay is the one-measure delay that is always listening, and its first move, the witness, is now built as two Max patches. Building it showed that the witness as written plays back exactly what a half-note echo would, sample for sample. So the session's big reveal, 'try this in Echo and you can't', wouldn't hold up. Version B keeps writing on every sample, but in silence it writes down what it already holds, so your last measure keeps coming back until you play again. That's your entry's 'when you play silence, the last phrase repeats'. It costs a quiet level threshold, which softens 'no gate'. A keeps the always-recording rule pure, and the session would then teach the echo comparison honestly instead of claiming a difference. Listen to both, starting with B. I'm continuing on B unless you redirect.

**Artifacts:**
- [B, silence keeps.](Projects/Retrospective Delay/stage-1/witness/witness-B-silence-keeps.wav)
- [A, as written (identical to a half-note echo).](Projects/Retrospective Delay/stage-1/witness/witness-A-as-specified.wav)
- [the dry input both versions hear.](Projects/Retrospective Delay/stage-1/witness/witness-input.wav)
- [wired-preview.png](Projects/Retrospective Delay/stage-4-character/jsui/wired-preview.png)
- [pose-triumphant.png](Projects/Retrospective Delay/stage-4-character/jsui/pose-triumphant.png)
- [pose-awakening.png](Projects/Retrospective Delay/stage-4-character/jsui/pose-awakening.png)
- [pose-dormant.png](Projects/Retrospective Delay/stage-4-character/jsui/pose-dormant.png)
<sub>`retrospective-delay-steward-044` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-043" -->
### 2026-10-14 — cycle 19 — The witness is built: two Max patches plus a model that renders audio. As written, it's exactly a half-note echo. The second version isn't.
> shipped · patches written, not yet opened in Max · steward leans SILENCE-KEEPS

I made two patchers and a reference model that runs the patch sample by sample (48 kHz, 120 BPM, read head half a measure behind). The input is two measures of a phrase, three of silence, one more phrase, then silence.

**A, as specified.** Its output is identical to a plain half-note echo, with zero difference at every sample. It can't be anything else: the read head trails by half a measure, and that slot isn't overwritten until a full measure has passed, so the buffer's length never matters. In silence the ghost plays once and is gone. The Reveal block says a student who tries to rebuild this in Ableton's Echo will find they can't. For A, they can: one tap at a half note with feedback at zero.

**B, silence keeps.** The buffer still writes on every sample. When you aren't playing, though, it writes down what it already holds, so the last measure stays and keeps coming back until you play again. That is the home entry's line, 'when you play silence, the last phrase repeats', and Echo can't do it. The cost is a quiet level threshold, which bends the 'no gate' wording of the always-recording rule a little.

Along the way I fixed four bugs in the April build notes. The `[!- 0.5]` read offset computes 0.5 minus the phase, which runs the read head backwards and gives you a reverse delay; it's also control-rate on a signal. `[* 176400]` should be `*~`. With the 4-second buffer, `wave~` reads the whole thing unless its end point is set to the measure length. And the note's 'the ghost will continue' is only true of B. The patches use `phasor~ 1n @lock 1` for the measure clock and `translate notevalues ms @listen 1` for the measure length, so both follow Live's tempo.

To try one: drop a Max Audio Effect on a track in Live, open the editor, paste in the patcher, start the transport, and turn the gain up.

**Artifacts:**
- [the input: two measures of phrase, three silent, one phrase, two silent.](Projects/Retrospective Delay/stage-1/witness/witness-input.wav)
- [A, the witness as written: the ghost plays once, then silence. Identical to a half-note echo.](Projects/Retrospective Delay/stage-1/witness/witness-A-as-specified.wav)
- [B, silence keeps: the last measure keeps coming back until you play again.](Projects/Retrospective Delay/stage-1/witness/witness-B-silence-keeps.wav)
- [A as a vanilla Max patcher, ready to paste into a Max Audio Effect (not opened in Max yet).](Projects/Retrospective Delay/stage-1/witness/witness-A-as-specified.maxpat)
- [B as a vanilla Max patcher: A plus a write that keeps the past through silence (not opened in Max yet).](Projects/Retrospective Delay/stage-1/witness/witness-B-silence-keeps.maxpat)
- [the model: renders the three WAVs and runs the echo comparison.](Projects/Retrospective Delay/stage-1/witness/witness_model.py)
- [writes both patchers; its header lists the corrections to the older docs.](Projects/Retrospective Delay/stage-1/witness/build_witness_patch.py)

_loudness per measure (RMS), same input into both witnesses_
| measure | input | A as specified | B silence keeps |
| --- | --- | --- | --- |
| 1 (playing) | 0.112 | 0.132 | 0.132 |
| 2 (playing) | 0.104 | 0.139 | 0.139 |
| 3 (silent) | 0.000 | 0.048 | 0.077 |
| 4 (silent) | 0.000 | 0.000 | 0.077 |
| 5 (silent) | 0.000 | 0.000 | 0.077 |
| 6 (playing) | 0.095 | 0.112 | 0.121 |
| 7 (silent) | 0.000 | 0.048 | 0.069 |
| 8 (silent) | 0.000 | 0.000 | 0.069 |

_Left rough:_ Neither patcher has been opened in Max or Live, so both are unverified. I don't know if phasor~ @lock holds or keeps running when the transport stops, B's threshold (0.003) is untested on a real instrument, and the session draft's Reveal claim still needs rewriting whichever version you pick.

_Next moves named:_ Once you've picked a version, make it the anchor patch and draft the corrected Reveal block for the session (the Echo comparison, done honestly). · Then the séance: a choice of lag length and a crossfade at the loop seam, built on the chosen witness.
<sub>`retrospective-delay-steward-043` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-26T09-21-34-04-00" -->
### 2026-09-26 — Plan revised: the moves are builds, not sessions

Loudon, 2026-09-26: Loudon Live is no longer a scaffolded curriculum of staged sessions; it is his whole public self, building slowly, and any move can happen in public as a build. The moves themselves are unchanged. Only the framing that made each move a session was loosened, and the April session designs were archived (still readable at the same link).

The plan it replaced said:

> It is built in five moves that are also five [[Loudon Live]] sessions, and two of them are deliberate migrations (vanilla Max to Gen~, then Gen~ to RNBO) where the friction is the lesson. The first session is drafted and its patch specified.
>
> The session asks whether it is still the same instrument.
>
> Session designs: [[Retrospective Delay — spec — Loudon Live sessions]].
<sub>`plan-2026-09-26T09-21-34-04-00` · plan revised · agreed 2026-09-26T09:21:34-04:00 · written by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-42-23-04-00" -->
### 2026-09-25 — Plan agreed: carried over from the retired staging file

Carried over on 2026-09-25 from the retired staging file, when Loudon asked that every plan fold into its scroll (SCHEMA v1.25). The arc is the one agreed with him in April 2026, unchanged in substance and in order, each stage renamed by what it does. The opening says plainly that the fourth move's character was drawn and wired ahead of the others. Project-wide decisions became Standing Orders; the session designs, with the grammar session's framing decision, became [[Retrospective Delay — spec — Loudon Live sessions]].
<sub>`plan-2026-09-25T20-42-23-04-00` · plan agreed · agreed 2026-09-25T20:42:23-04:00 · carried over by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-040" -->
### 2026-06-22 — cycle 17 — Matched gorey-ink triptych — dormant · awakening · triumphant — all three rendered in the refined wobble/hatching/ink-weight pass.
> shipped · refined set complete · same prompt scaffold, three pose clauses, three openpose rigs

Retrospective Delay is the séance-style delay device — Stage 4 is the JSUI character whose pose maps to the gain knob. Last cycle Loudon greenlit the refined triumphant single (REFINE-INK) and then granted RENDER-SET to commit the matched batch. This cycle rendered dormant + awakening at the same refined quality (Edward-Gorey ink wobble, dense hatching, varied stroke weight) using the existing dormant/awakening openpose rigs and the per-state pose clause swapped into the same style envelope. All three frames now share one visual grammar — they read as the same cat in three states, not three different cats.

**Artifacts:**
- [the matched triptych — dormant (left), awakening (centre), triumphant (right).](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-refined-triptych.png)
- [dormant — curled asleep on a velvet cushion, no ectoplasm yet.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-dormant-refined-openpose.png)
- [awakening — paw lifted, ears perked, first wisps rising.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-awakening-refined-openpose.png)
- [triumphant — arms wide, ectoplasm swirling, stars in eyes (greenlit last cycle).](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-triumphant-refined-openpose.png)

_what's the same across the three frames_
| axis | shared |
| --- | --- |
| style envelope | Gorey ink wobble · dense hatching · varied stroke weight |
| controlnet | openpose rig per pose, same strength/seed/steps |
| palette | black ink on warm cream paper, no colour |
| scene | candelabra + patterned wallpaper, sparse Victorian interior |
<sub>`retrospective-delay-steward-040` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-039" -->
### 2026-06-23 — cycle 16 — With the refined triumphant ink landed, do I render the dormant and awakening states next?
> still working · refined triumphant approved · leaning RENDER-SET

The refined gorey-ink triumphant render is the one I'm taking as the visual target for Stage 4. To make the character actually animate with the gain knob I need at least two more renders in the same style — DORMANT (cat curled, asleep, candle unlit, oval dim) and AWAKENING (cat half-rising, eyes opening, one paw lifting, one candle catching). Same OpenPose-driven pipeline, same gorey-ink LoRA, same border and lantern motifs — only pose and lighting change. Three matched stills are the minimum to design the JSUI interpolation curve from. Tradeoffs: render the matched pair now (one cycle, ~$3 in API), or polish the triumphant pose further first, or pull back and reframe. My lean is RENDER-SET — the triumphant is good enough that locking the style and rendering siblings is the right next move.

**Artifacts:**
- [The triumphant pose I'd treat as the style anchor for the matched siblings.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-triumphant-refined-openpose.png)
<sub>`retrospective-delay-steward-039` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-038" -->
### 2026-06-23 — cycle 16 — Sorry — wrong file last cycle. Here is the actual REFINE-INK render.
> shipping the right artifact · refined gorey-ink triumphant pose

Catch-up: Retrospective Delay is a 1-measure circular-buffer delay; Stage 4 is its animated character interface — a spiritualist cat that wakes as gain rises. We are in the visual-design probe before any JSUI code is written, picking the rendering style. Cycle 14 you greenlit the gorey-ink direction. Cycle 15 you said REFINE-INK on the triumphant pose. Then I posted the wrong image: a three-panel PNG of crude JSUI live-drawing scribbles (dormant/awakening/triumphant) — those were a separate engineering preview of the in-Max drawing fallback, NOT the refined ink. Confusion is on me. The real REFINE-INK deliverable is one image — the refined gorey-ink triumphant cat — attached here. The crude scribbles are unrelated; ignore them.

**Artifacts:**
- [REFINE-INK deliverable — gorey-ink triumphant pose, refined: black cat, striped robe, raised paws, candle-lanterns, starry oval, Edwardian border. THIS is the file the REFINE-INK grant was about.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-triumphant-refined-openpose.png)
<sub>`retrospective-delay-steward-038` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-037" -->
### 2026-06-23 — cycle 15 — Does the refined ink read as Gorey enough to commit to the batch of three?
> audition ready · one pose shipped · I lean BATCH-IT

Catch-up: Retrospective Delay's Stage-4 work is finding the character — a small black cat whose pose shifts as the gain knob turns. You greenlit REFINE-INK last cycle (push the vector toward the gorey-ink sheet — wobble, hatching, weight pass). I refined the prompt along exactly those three axes and re-rendered pose-3 only. The refined render is in the GENERAL post just above this one, sitting next to the prior pose-3 for A/B. The Talking Keyboard 352-file pronunciation incident is the steady reminder: audition one unit before committing the batch. My lean is BATCH-IT — the refined prompt is doing the named work (visible nib texture, denser hatch, line weight varies), and the next cycle would re-render dormant + awakening with the same prompt to get a coherent triptych. But if the wobble is too much, or you want the hatching denser still, say so before I commit three renders worth of cycle time.

**Artifacts:**
- [preview-3panel.png](Projects/Retrospective Delay/stage-4-character/jsui/preview-3panel.png)
<sub>`retrospective-delay-steward-037` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-036" -->
### 2026-06-23 — cycle 15 — Refined gorey-ink pose-3 audition rendered — wobble, hatching, weight pass on the séance cat.
> shipped · one pose · before-batch audition

Loudon greenlit REFINE-INK on the gorey-ink direction last cycle. This is the audition: pose-3 (triumphant) re-rendered with a refined prompt that names the three axes explicitly — *hand-drawn wobbly ink line with visible tremor*, *dense parallel crosshatching and stippled shading*, *varied stroke thickness from hair-fine to bold* — plus a negative prompt that pushes away from smooth digital line, vector clean, and grey wash. Same rig, same seed (42), same ControlNet-openpose strength (0.8). Warm-cache render: 180s. One file before the batch of three — the Talking Keyboard lesson is *audition the unit before mass-producing the set*.

**Artifacts:**
- [REFINED — triumphant pose with wobble/hatching/weight pass.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-triumphant-refined-openpose.png)
- [PRIOR — same rig + seed, original prompt, for A/B.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-pose-3-openpose.png)
<sub>`retrospective-delay-steward-036` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-035" -->
### 2026-06-22 — cycle 14 — JSUI sketch is live — refine the ink, wire it into a Max patch, or add interaction next?
> still working · sketch shipped · lean REFINE-INK

The pose-reads are right; the line quality is plain geometric ink. Three honest next moves: (1) REFINE-INK — push the vector toward the greenlit gorey-ink character sheet with wobble, cross-hatching, and a second ink-weight pass so it looks hand-drawn rather than CAD-clean; this is the move closest to teaching-ready aesthetic. (2) WIRE-INTO-MAX — pause polish and build the surrounding M4L patch (gain knob → JSUI, the actual delay topology) so the character can be auditioned against real audio behavior; the lesson is the loop of knob-turn → sound → character, and right now the character is alone. (3) ADD-INTERACTION — give the JSUI mouse drag so the character itself becomes the knob (drag-to-summon), which is the Playful Interface Design pillar made literal. My lean is REFINE-INK because the greenlit sheet is the reference and the gap between today's preview and that sheet is the next visible quality jump. Not blocking — if you do not answer, I will do REFINE-INK next cycle.

**Artifacts:**
- [gorey-ink-awakening-openpose.png](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-awakening-openpose.png)
- [gorey-ink-dormant-openpose.png](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-dormant-openpose.png)
<sub>`retrospective-delay-steward-035` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-034" -->
### 2026-06-22 — cycle 14 — First JSUI sketch of the séance cat — dormant / awakening / triumphant blending on one gain knob.
> shipped · seance-cat.js + 3-panel preview · greenlit sheet, now in vector

Catch-up: I am the Stage-4 character for the Retrospective Delay teaching arc — a cartoony spiritualist cat whose pose follows the gain knob. Last cycle you greenlit the gorey-ink character sheet ('sheet reads as one character; start vectorizing into JSUI next cycle'). This cycle I did exactly that. **What shipped:** (1) `seance-cat.js` — a Max JSUI script with three vector poses (curled+Zzz, sitting+reaching paw, arms outstretched + stars-in-eyes) cross-blended via smoothstep weights, plus a translucent ectoplasm swirl that animates at ~30fps when gain > 0. One inlet: `set_gain` (0..1). (2) `render_preview.py` — the same primitives in Pillow, so you can see the result without opening Max. Preview attached. The vectors are deliberately rough at this stage — anatomy and pose-reads first, gorey-ink texture (cross-hatching, ink wobble) belongs in a refinement pass.

**Artifacts:**
- [Three-panel preview of the JSUI at gain 0.10 / 0.50 / 0.92. Same primitives the Max JSUI draws.](Projects/Retrospective Delay/stage-4-character/jsui/preview-3panel.png)
- [The JSUI script — drop into [jsui @rect 0 0 240 240], send a float 0..1 to set_gain.](Projects/Retrospective Delay/stage-4-character/jsui/seance-cat.js)
- [Preview renderer (uses the ComfyUI venv's Pillow). Run to regenerate preview-3panel.png after edits.](Projects/Retrospective Delay/stage-4-character/jsui/render_preview.py)
<sub>`retrospective-delay-steward-034` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-033" -->
### 2026-06-22 — cycle 13 — Sheet looks like one character. Greenlight Stage 4 JSUI vectorization next — or hold and pick a different look first?
> still working · 3-state sheet shipped · lean: greenlight

Retrospective Delay's Stage 4 is the JSUI animated face — a cartoon spiritualist-cat whose pose tracks the gain knob. You picked gorey-ink last cycle and said render the sheet; the sheet is up (steward-032). My lean is to start vectorizing these three poses into JSUI drawing code so the knob crossfades pose-to-pose in Max. But this is the kind of look decision that's expensive to undo once I write the JSUI — if anything about the medium-cat reads wrong to you at full sheet scale (proportions, the cape, the eye-stars), now is the moment to redirect. Not blocking — I will start vectorizing the dormant pose by default if you don't reply.

**Artifacts:**
- [pose-awakening-openpose-rig.png](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/pose-awakening-openpose-rig.png)
- [pose-dormant-openpose-rig.png](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/pose-dormant-openpose-rig.png)
<sub>`retrospective-delay-steward-033` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-032" -->
### 2026-06-22 — cycle 13 — Stage 4 séance-cat 3-state sheet — dormant, awakening, triumphant — all rendered gorey-ink + OpenPose.
> shipped · gorey-ink locked · 3 poses on the proven rig

Retrospective Delay is a circular-buffer delay (Max/MSP, heading to RNBO) whose only knob summons the last measure of your playing back. Stage 4 of the teaching arc is the JSUI face — a cartoon medium-cat whose pose tracks the gain knob through three distinct states: **dormant** at 0, **awakening** as the knob rises, **triumphant** at peak summoning. Last cycle you greenlit gorey-ink as the look (cycle 029) and said RENDER-NOW on the 3-state sheet (cycle 031). Here is the sheet — same seed, same model (sd_xl_base 1.0), same OpenPose ControlNet at 0.8, 30 steps, euler/normal, only the rig PNG changes. Each render took 6–10 min on MPS, so this is one cycle's worth of ComfyUI heat. The three look like one character moving, which is the bar for Stage 4 — JSUI animation will key-frame between these poses rather than originate new ones. Next move is to use these as the look-development reference for the JSUI drawing code (vector reconstruction, not raster blit). No fork I need answered to keep going.

**Artifacts:**
- [dormant — gain at 0, the medium is asleep.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-dormant-openpose.png)
- [awakening — gain rising, the ghost is being summoned.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-awakening-openpose.png)
- [triumphant — gain at peak, arms wide, ectoplasm fully present.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-pose-3-openpose.png)
<sub>`retrospective-delay-steward-032` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-031" -->
### 2026-06-22 — cycle 12 — Render dormant + awakening in gorey-ink now (~12 min), or eyeball the rig anatomy first?
> still working · pipeline validated · steward leans RENDER-NOW

Rigs are in. The triumphant render (gorey-ink + openpose, ControlNet 0.8, seed 42) already proved the pipeline on 2026-06-22 — you called the cat. Next move is one of two: kick off the dormant + awakening renders right now and have the full three-state pose sheet on the board for your eyes (~6 min each on this Mac, ~12 min total, identical settings to the validated triumphant), or you eyeball the stick-figure rigs first and confirm the anatomy reads right before I burn the GPU time. My lean is RENDER-NOW — the rigs use the same scale and color palette as the proven one, and a wrong rig only costs the 12 minutes to re-render. But if anything about the dormant slouch or the asymmetric awakening reach looks wrong to your eye, catching it now saves a re-roll.

**Artifacts:**
- [dormant rig — slack arms, bowed head, low knees.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/pose-dormant-openpose-rig.png)
- [awakening rig — asymmetric reach, head up.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/pose-awakening-openpose-rig.png)
- [the validated triumphant render, for tone reference.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-pose-3-openpose.png)
- [cyberpunk-pose-3-openpose.png](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/cyberpunk-pose-3-openpose.png)
- [pose-3-openpose-rig.png](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/pose-3-openpose-rig.png)
<sub>`retrospective-delay-steward-031` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-030" -->
### 2026-06-22 — cycle 12 — Stage-4 character: dormant + awakening rigs shipped; the 3-state OpenPose set is complete.
> verdict caught (gorey small-cat) · pose-3 already proven · rigs ready for the same pipeline

Caught your verdict — *the gorey render looks like a small cat to me, go with it.* The openpose-conditioned gorey-ink pipeline (375 s / render, ControlNet strength 0.8, seed 42) is locked. Stage 4 needs three character states mapped to the gain knob: dormant (gain 0, cat slouched, arms slack), awakening (gain rising, cat reaching up, asymmetric), triumphant (gain peak, arms wide overhead — this is the validated pose-3). I authored the two missing rigs this cycle as BODY_18 OpenPose PNGs using the same palette and bone-widths as `make_openpose_rig.py`, so the downstream ControlNet pass behaves identically. The triumphant rig is unchanged. The full set is sitting in `Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/` ready to feed the proven workflow.

**Artifacts:**
- [DORMANT (gain 0) — head bowed, arms slack at sides, knees bent low. Cat slouched, sleeping.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/pose-dormant-openpose-rig.png)
- [AWAKENING (gain rising) — head raised, arms reaching forward-up asymmetric (left higher, leading). The summoning gesture, mid-arc.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/pose-awakening-openpose-rig.png)
- [TRIUMPHANT (gain peak) — arms wide overhead V. Already validated through gorey-ink + openpose on 2026-06-22.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/pose-3-openpose-rig.png)
<sub>`retrospective-delay-steward-030` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-029" -->
### 2026-06-22 — cycle 11 — The gorey render reads as a robed medium with a cat head, not a small cat — lock that for the sweep, or steer toward a small cat on the floor?
> shipped · pose locked · steward leans ROBED-MEDIUM (it's the more striking character)

The Stage-4 character is the séance metaphor made visible — performer-as-medium, buffer-as-ectoplasm, gain-as-conduit (per the entry's Interface Design section). The OpenPose rig I drew is anthropomorphic-humanoid scale (shoulders/hips/knees), so the gorey result naturally read as a robed Victorian medium WITH a cat head, plus a small black cat at the figure's feet as a Gorey bonus. The cyberpunk result read as a full-body upright neon cat — same rig, very different read. Both feel right for the séance — but the entry's prose describes 'a cartoonish cat or spiritualist guide' (either is on-spec), and we should lock the read before sweeping all seven gain positions. I lean ROBED-MEDIUM — it leans into the spiritualist-medium framing of the entry and the gorey render is striking. Wrong call costs one rig-redraw + one re-run; not expensive.

**Artifacts:**
- [cyberpunk-pose-3-probe.png](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/cyberpunk-pose-3-probe.png)
- [gorey-ink-pose-3-probe.png](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-pose-3-probe.png)
<sub>`retrospective-delay-steward-029` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-028" -->
### 2026-06-22 — cycle 11 — OpenPose ControlNet at 0.8 locked the arms-overhead pose in both styles, first try.
> shipped · two renders + rig + workflow + driver · pose decisively landed

Retrospective Delay is the séance-cat Max for Live delay; Stage 4 needs a character whose pose changes with the gain knob. The 2026-06-07 probe proved the styles read but prompt-only could not force Pose 3 (arms-overhead) — SDXL collapsed to a seated fireplace cat (gorey) and a neon head portrait (cyberpunk). You granted OPENPOSE last cycle. This cycle: drew a programmatic OpenPose-18 rig (arms in overhead V), wired it as ControlNet at strength 0.8, re-ran both styles against the same seed (42) and prompts. Both pose decisively. Style space intact. Strength 0.8 is the right setting.

**Artifacts:**
- [the OpenPose-18 rig — arms-overhead V, black background, color-coded keypoints. ControlNet input.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/pose-3-openpose-rig.png)
- [Gorey-Ink + OpenPose. Robed Victorian medium with cat head, arms in a clear summoning V, crosshatch + candles intact. 376 s cold.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-pose-3-openpose.png)
- [Cyberpunk + OpenPose. Full-body upright neon cat, arms overhead, magenta/electric-blue rim, plasma trails reading as ectoplasm. 134 s warm.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/cyberpunk-pose-3-openpose.png)

_before/after — same seed, same prompts, only ControlNet added_
| render | pose (arms-overhead) | style legible | time |
| --- | --- | --- | --- |
| gorey · prompt-only (2026-06-07) | no — seated by fireplace | yes | 351 s |
| gorey · openpose 0.8 (this cycle) | yes — clear summoning V | yes | 376 s |
| cyberpunk · prompt-only | no — head portrait only | yes | 94 s |
| cyberpunk · openpose 0.8 | yes — full body, arms overhead | yes | 134 s |

_Next moves named:_ Promote the OpenPose-conditioned workflow as the Stage-4 baseline. · Parametrize the rig generator for the other 6 gain positions; run a 7-frame sweep at strength 0.8. · Try IP-Adapter atop OpenPose for character consistency across frames.
<sub>`retrospective-delay-steward-028` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="retrospective-delay-steward-026" -->
### 2026-06-22 — cycle 10 — Séance Cat smoke probe shipped — both styles render cleanly, pose conditioning is the real bottleneck.
> shipped · gorey + cyberpunk renders · pose ✗ both · ControlNet next

Catch-up: Retrospective Delay is the circular-buffer delay device whose Stage-4 layer is an animated character (a séance cat) whose pose tracks the gain knob. Two weeks ago you said *Do both* on the Smoke vs ControlNet fork. ComfyUI was already running when I woke, so I ran both — Gorey-Ink first (cold, 351s) then Cyberpunk (warm, 94s), seed 42, SDXL base, prompt-only.

Honest read: **styles passed, pose failed in both.** Gorey-Ink gave a beautiful Victorian séance room with a small black cat *sitting calmly by a fireplace* — fine crosshatch reads, character legible, but no arms-overhead, no ectoplasm, none of Pose 3. Cyberpunk gave a striking neon head-and-shoulders portrait — magenta/electric-blue rim light, glowing eyes — but no body at all, so no pose to evaluate. SDXL nailed the aesthetic ceiling for both directions; it just ignored the gesture words in the prompt.

This is exactly the diagnostic the dispatch author named as Outcome B: pipeline proven for style, not yet for pose, contingency is ControlNet to lock the pose. Findings file written. I checked `_tools/ComfyUI/models/controlnet/` — **openpose, canny, and depth SDXL ControlNets are all installed; scribble is not.** OpenPose is the obvious next probe — arms-overhead is the canonical gesture it was trained on.

**Artifacts:**
- [Gorey-Ink Pose-3 probe (seed 42, cold render 351s). Style ✅. Pose ✗ — cat is seated by fireplace, no arms overhead.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/gorey-ink-pose-3-probe.png)
- [Cyberpunk Pose-3 probe (seed 42, warm render 94s). Style ✅. Pose ✗ — head-and-shoulders portrait only, no body.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/cyberpunk-pose-3-probe.png)
- [Findings — what the probe proved, the bottleneck, and the next move.](Projects/Retrospective Delay/stage-4-character/probe-2026-06-07/findings.md)

_Smoke probe — both styles, seed 42, prompt-only_
| render | time | style ✓ | character ✓ | pose-3 ✓ |
| --- | --- | --- | --- | --- |
| gorey-ink | 351 s (cold) | yes | yes | no |
| cyberpunk | 94 s (warm) | yes | partial (head only) | no |
<sub>`retrospective-delay-steward-026` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
