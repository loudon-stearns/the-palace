---
title: "2026-11-14-substrate-sounds — workshop"
born: 2026-11-14
links:
  - target: "[[The Shop]]"
    type: connects-to
    label: "made-through"
forward_vector: "I am a workshop: where one round of making happens, with the Shop's bench already in it, so what is made here says what made it."
---

# 2026-11-14-substrate-sounds

Hand against Shop — SUBSTRATE's bed and four of its cues. The hand's are the ones in the hook; the Shop's follow Loudon's split: what would have been recorded is generated, one thing at a time, then cut by hand.

## The pairs — for Loudon's ear

SUBSTRATE's hook, "born on the floor", makes every sound in the page from code. Loudon on them, as the session that planned the hook reported his words: "they are ok, we need to get better at making interface sounds and environmental sounds, but I have high standards there". These are five of its sounds twice: as the page makes them, and with the material generated. Each Shop sound is cut to the hook's own length and set to its own peak level, so the pair differs only in what the sound is made of.

| | The hand's, as in the hook | Through the Shop | What each is |
|---|---|---|---|
| bed | ![[substrate-sounds — hand — bed.m4a]] | ![[substrate-sounds — shop — bed.m4a]] | The hand: sixteen sine partials on D, looping. The Shop: "the quiet air inside a large empty stone hall", folded into a 16 s loop. |
| step | ![[substrate-sounds — hand — step.m4a]] | ![[substrate-sounds — shop — step.m4a]] | The hand: a sine falling from 120 to 70 Hz, 0.22 s. The Shop: one footstep on stone, cut to 0.22 s. |
| glass | ![[substrate-sounds — hand — glass.m4a]] | ![[substrate-sounds — shop — glass.m4a]] | The hand: a 147 Hz swell with a trace of 880. The Shop: one knock on a pane of glass, 2.2 s. |
| ground | ![[substrate-sounds — hand — ground.m4a]] | ![[substrate-sounds — shop — ground.m4a]] | The hand: 55 Hz with filtered noise. The Shop: one thud on packed earth, 2 s. |
| grains | ![[substrate-sounds — hand — grains.m4a]] | ![[substrate-sounds — shop — grains.m4a]] | The hand: fourteen short high sine clicks. The Shop: sand scattering on a hard floor, 1 s. |

**Left by hand on purpose:** the tuned cues (the eight floor pages as a pentatonic scale, the six stops down the core). Those are notes, plainly synthesized, and their pitches carry the story.

**Heard, 2026-11-15.** Loudon, 2026-11-15: "Bed, I didn't hear a crossfade in either. Step, the step reads as one(I'd be curious in the future, as we have said before to make 20 step variations and see how we could work with them in a "walk"). Glass reads as glass, OK, not perfect, but OK. The thud works, And the sand works. All the stable audio outputs are noisey and a little lo fidelity, the work you are building by hand is hyper clean and clinical and "fake" so we have an extreme range of "synthesized vs sampled" and over time the two will become closer and closer. I am happy we are doing this work and we can keep pusing forward. Clearly this is a great path as stable audio will keep getting better." He listened on Stable Audio Open's scroll in STIGMERGY; the embeds in the table above are from before Obsidian was retired, and `listen.html` beside this file plays the same ten.

**What was measured before he listened:**
- The bed: three of four seeds wandered 18 to 23 dB across the clip; the one kept varies 3.5 dB. The loop's seam is a 4 s crossfade, and whether it can be heard is unknown.
- Each cue was chosen as the take whose start stands furthest above what came before it. That rule once picked a click for a bell, so each wants an ear: is the step a step?
- Every Stable Audio take here is mono (small-sfx).
- Cost: twenty renders, 0.8 to 2.3 s each; each job took about 12 s with the model's load.

**Not done:** none of this is wired into the hook. That is a change to SUBSTRATE's rich face, and waits for a verdict.

**This folder was made through the bench**, the first to be: `jobs.json` holds the ten jobs and their chains, `provenance.json` what made each file, `takes.json` every seed's numbers.

## Before the first file

Choose the tool for each PART of a piece, not for the piece: what would have been recorded or photographed is generated, what is plainly synthesized or a diagram is built by hand, and the two are edited together. Then write the piece's job in `jobs.json`, with its chain, and run it through the bench:

```sh
node Shop/shop.mjs run "Shop/Maker/comparisons/2026-11-14-substrate-sounds/jobs.json" <job>     # from the palace root
node Shop/shop.mjs check "Shop/Maker/comparisons/2026-11-14-substrate-sounds"          # what made each file here, and who has heard it
node Shop/shop.mjs card "<Specialist>"          # one Specialist whole: its command, its speed, what it has not been shown to hold
```

Your own script is welcome. Name it in the chain as `hand: …`, and let a job be one function in it. A brief you hand another maker says what makes the piece, or that the maker chooses from the menu below.

## The menu on 2026-11-14, on this host (mac)

```
SOUND
  Ableton Session Writer — runs here · last ran today
      handing Loudon a made instrument ready to play, a plugin or a sample library, as a Live 12 Set
      he only has to open. He opened my Frustration plugin Set unchanged and played its ride
      (2026-10-21); a Simple Synth Set and the Tear and Heal library Set opened and played in a test
      Live.
      Speed: I write a four-instrument, 240-sample library Set in 0.35 s and check it in 0.12 s
      (2026-11-14); proving one opens in a second Live 12 took about a minute (2026-10-21).
  Kokoro — runs here · last ran today
      narration; a script read aloud for a lesson or a video. I read the 36 s Kuramoto paragraph at
      Study tier, −16.1 LUFS, under the Manim sync-arriving scene, and a 13.5 s check in af_bella
      landed at −16.0 LUFS (2026-11-14). The Radio Play cast its characters with my fixed voices.
      Speed: I load in 4.3 s and render 13.5 s of speech in 1.6 s; with both loudnorm passes the run
      took 8 s (2026-11-14, M-series). My first job took about 25 s for 36 s of speech (2026-05-10).
  Stable Audio Open — runs here · last ran today
      sound beds; sounds made to run filters or effects on; single sounds that would otherwise be
      sampled. My pads and drones hold (a 60 s small-music pad changed harmony on its own,
      2026-11-14), and a drip, a bird call and a far bell, each made one at a time and then cut and
      placed by hand, built the Oliveros room Loudon called the best of its group.
      Speed: Each model loads in 8 to 9 s; warm, I render 10 s in 0.9 to 2.2 s and 60 s in 3.1 s, on
      the M-series Mac (2026-11-14). One morning's first render took 334 s; it has not happened
      again.
  VCV Patch Generator — runs here · last ran 2026-05-29 (168 days)
      turning a patch description into a Rack patch that loads with its keyboard and audio already
      wired, and holds only real modules. Loudon auditioned my kick, warm pad and pluck in Rack
      (2026-05-29); fresh agents writing PDL from English gave 9 of 9 clean candidates across three
      descriptions; Synth Templates calls my emitter from Node for its own patches.
      Speed: I have never been timed. I emit with a Node script over a few kilobytes of JSON; a Rack
      audition takes a person and the app.
  Whisper — runs here · last ran today
      reading synthetic narration back into timed words; checking that a Kokoro line says what the
      script says. Twice on `base`: the 36.5 s Kuramoto narration, whose word timing drove
      manim-voiceover for the sync-arriving scene (2026-05-26), and a 13.5 s af_bella check where I
      heard an IPA-overridden "Kuramoto" right (2026-11-14).
      Speed: `base` on the Mac read 13.5 s of speech in 5.0 to 5.1 s, model load included
      (2026-11-14), and 36.5 s in about 7 s (2026-05-26). Other model sizes are unmeasured here.

IMAGE
  Blender — runs here · last ran 2026-06-13 (153 days)
      One job so far: a posed worm's-eye lunge blocked by hand, six registered conditioning passes
      emitted, then a ComfyUI multi-ControlNet SDXL fill that held the pose against prompt-only
      controls (2026-06-13, Study tier).
      Speed: Pose plus passes about 8 s on the Mac with EEVEE; blocked two-pass ComfyUI fill about 9
      min (555 s) on the Mac (2026-06-13).
  ComfyUI — runs here · last ran 2026-05-26 (171 days)
      One real job: a Sketch-tier SDXL fireflies pond, 1216x832, seed 7 (2026-05-26). Also ran
      3-ControlNet (pose, depth, canny) SDXL on a Mac for Blender's keystone on 2026-06-13.
      Speed: Sketch, first render on MPS: 110 s, mostly model load (2026-05-26). Three-ControlNet
      SDXL: ~15 s/it with the flags, ~50 s/it without (2026-06-13). Warm single-image time not
      recorded.
  FLUX (Hugging Face) — not local: an API call and a token · no run line in its ledger
      One real job: the Shop header banner, 1536x640, seed 30 (2026-05-30). It held the dusk, amber
      light and dust motes that local SDXL flattened.
      Speed: About 3 s for one 1536x640 Sketch (2026-05-30). Page says 24 steps; compare local SDXL
      at about 114 s. Cold start not recorded.
  Figure Rig — runs here · no ledger
      A posed MPFB2 human with a weighted rig, three registered plates (ink, depth, canonical
      OpenPose), and a D2 redraw that held the pose (proven 2026-06-30). Hands shipped the same day
      in an 8-gesture RunPod matrix.
      Speed: Local D2 redraw about 25 min per frame on the Mac's MPS (page, undated). Plate time is
      not recorded.
  Lettering — runs here · no ledger
      Short, high-impact words rendered as imagery, proven on BLUELINE's seven voices (including NO,
      too late, BURNING). Plates for thought, whisper, shout and sfx variants sit in the bundle.
      Speed: About 150-200 s per word on MPS for Study and Piece. Skeleton, sampler and knockout are
      CPU-only and instant. No date given.
  LoRA Trainer — not local: a rented pod, which costs money · no ledger
      Nothing yet on a real brief that held. Two DreamBooth-control LoRAs trained clean first-try
      after hardening. The BLUELINE r4ng3r LoRA was a net negative from a narrow, hooded 8-image
      set. I take 8+ images of one subject and train a LoRA on a rented GPU.
      Speed: A few hours of pod time per LoRA end to end; Piece about 1200 steps, Study about 1500.
      No per-step or dated timing recorded.
  Matplotlib — runs here · last ran 2026-06-16 (150 days)
      One job so far: the Kuramoto two-phasor Sketch (2026-05-10), a rotating-phasor animation
      rendered as Manim's fallback when manimpango would not install in the sandbox. 1272x720,
      30fps, 10 s. Static charts have no recorded real job.
      Speed: Smoke PNG about 80 ms with font-cache miss, under 10 ms warm, on Mac (test plan, run
      dated 2026-05-30). Motion render time not recorded.
  Mermaid — runs here · last ran 2026-05-26 (171 days)
      One job so far: a three-state Kuramoto coupling-regime flowchart (2026-05-26), a Sketch
      embedded inline in Obsidian, in indigo and amber. Reusable for any three-regime diagram.
      Nothing yet at Study or Piece tier.
      Speed: First run about 23 s cold with npx fetch and Chromium; about 1-2 s warm (smoke,
      2026-05-30).

MOTION
  Manim CE — runs here · last ran 2026-06-09 (157 days)
      So far: three Kuramoto teaching clips on the Mac (two phasors at Sketch, Study and Piece;
      sync-arriving at 720p30 with Kokoro narration muxed in). All are math animations with phasors,
      sine traces and LaTeX labels.
      Speed: Same 10 s scene, 2026-05-30, warm: Sketch 5.4 s, Study 11.2 s, Piece 15.9 s. Cold first
      Piece 75-90 s. Sync-arriving: about 50 s for 36.5 s of 720p30.
  OBS — runs here · last ran 2026-09-02 (72 days)
      So far: one recorded rig, the LDN RTM recording setup (Application Capture of Ableton plus a
      camera, with levels checked), built 2026-09-02 and level-checked 2026-09-07. Streaming has no
      run behind it.
  Remotion — runs here · last ran 2026-05-26 (171 days)
      So far: one job, the Kuramoto phenomena walk, a four-card UI-style title walk at 1280x720, 16
      s, with no audio. Nothing else has been run on a real brief.
      Speed: 2026-05-26: about 25 s end to end for the 16 s walk on an M-series Mac, Node 25.9.
      Install under 10 s on a warm npm cache. Study and Piece figures on the page are estimates, not
      recorded runs.

INTERACTIVE
  D3.js — runs here · last ran today
      A custom interactive chart or diagram where I control every mark. One Sketch so far, Reynolds
      boids with an interactive control lens (2026-05-29): 80 boids under d3-force, live rule
      sliders, a polarization readout, and a Cobalt Grid version. My starter drew its points
      headless on 2026-11-14.
      Speed: Measured 2026-11-14 on the Mac: web-smoke 0.1 s, conform --browser 2.1 s for the
      starter at two widths. Making a piece is estimated only: Sketch 1 to 3 h, Study half a day to
      a day.
  Observable Plot — runs here · last ran today
      A quick, honest chart of numbers: lines, bars, histograms, small multiples. One job so far,
      the Flocking analytical view (2026-05-29): R over time, a neighbour histogram and a
      three-panel weight sweep, re-dressed through `palacePlot()`. My starter drew three curves on
      one shared scale headless on 2026-11-14.
      Speed: Measured 2026-11-14 on the Mac: web-smoke 0.1 s, conform --browser 1.8 s for the
      starter at two widths. Making a chart is estimated only: Sketch 15 min to 1 h, Study 2 to 6 h.
  Three.js — runs here · last ran today
      A 3D scene in the browser you can orbit, where the geometry is the data. One Sketch so far,
      the Wavetable Scanner (2026-05-31): each wavetable frame a `BufferGeometry` line, and a cursor
      that runs the worklet's own blend math. My starter drew an orbitable line headless on
      2026-11-14.
      Speed: Measured 2026-11-14 on the Mac: web-smoke 0.1 s, conform --browser 2.4 s for the
      starter at two widths. Making a piece is estimated only: Sketch 1 to 3 h, Study half a day to
      two days.
  Tone.js — runs here · last ran today
      A playable sound in a browser page, built from Tone's ready-made voices. One Study so far, the
      two-oscillator Kuramoto explorer (2026-05-26), where drift, pulling-in and lock were told
      apart by ear at K_c. My one-voice starter played on a click and went quiet on hush in headless
      Chromium on 2026-11-14.
      Speed: Measured 2026-11-14 on the Mac: web-smoke 0.1 s, conform --browser 2.8 s for the
      starter at two widths. Making a piece is estimated only: Sketch 30 min to 2 h, Study half a
      day to a day.
  Web Audio Worklet — runs here · last ran today
      Sound I write sample by sample in the browser, when the DSP itself is the point. Two Sketches:
      Murmuration (2026-05-30), a flock-driven granular engine, and the Wavetable Scanner
      (2026-05-31). Loudon has heard Murmuration's engine only as offline renders, a blind pair on
      2026-10-15. My starter played on a click and rendered 220 Hz headless on 2026-11-14.
      Speed: Measured 2026-11-14 on the Mac: web-smoke 0.1 s, conform --browser 2.3 s for the
      starter at two widths. Making a piece is estimated only: Sketch 1 to 3 h, Study half a day to
      a day.
  p5.js — runs here · last ran today
      A moving picture in the browser that answers the mouse. Two Sketches held: a two-phasor
      Kuramoto explorer (2026-05-10) and an expressive boids flock with fading trails and colour by
      heading (2026-05-29), which also has a Strobe-skinned version. My starter drew its trail
      headless on 2026-11-14.
      Speed: Measured 2026-11-14 on the Mac: web-smoke 0.1 s, conform --browser 1.9 s for the
      starter at two widths. Making a piece is estimated only: Sketch 5 to 30 min, Study 1 to 3 h.

OTHER
  Depth Anything — runs here · last ran 2026-06-25 (141 days)
      So far one job: BLUELINE shot 02, 2026-06-25. I ordered a pen drawing front to back, gave a
      clean figure silhouette, and split it into three usable depth bands (person+street,
      cars+buildings, fire+sky) with no segmentation.
      Speed: Page says 'a few seconds' on MPS; no figure or date is recorded.
  LaMa — runs here · last ran 2026-06-25 (141 days)
      So far one job: BLUELINE shot 02, 2026-06-25. I removed the figure and rebuilt the car, fire
      and street behind him well enough that the eye accepted the clean plate. Loudon rejected the
      classical cv2.inpaint fill as 'horrible'.
      Speed: Page says 'seconds', CPU-fine and faster on MPS/GPU; no figure or date is recorded.
  SAM — runs here · last ran 2026-06-25 (141 days)
      So far one session, 2026-06-25: on photoreal or flat-cel versions of three test scenes I cut
      sharp object masks (30/26/22 regions photoreal, 44/47/25 flat-cel). Flat cel-shaded is my best
      input.
      Speed: Page says seconds for MobileSAM and tens of seconds for ViT-B auto; no figure or date
      is recorded.

PLUMBING
  ffmpeg — runs here · last ran 2026-06-16 (150 days)
      So far: the Kuramoto Round 1 teaching reel (concat of a Manim clip, a Matplotlib title card
      and a narrated clip, loudnorm to -16 LUFS, 49.5 s) and the Radio Play assembly recipe. Also
      the mux of a silent render with narration.

```

Today's menu: `node Shop/shop.mjs menu`.
