# F-render — faces for the eight faceless pages (Weave 2026-11-08)

The face-render lane. All sixteen faces are rendered on FLUX.1-dev-fp8 through the palace serverless endpoint and placed in their bundles. The face audit now reads **0 missing**. The endpoint is parked.

## What was written

All sixteen are PNGs at the convention's size: heroes 1280×544, icons 1024×1024.

| Page | Hero | Icon |
|---|---|---|
| FM Synthesis | `FM Synthesis/FM Synthesis — hero.png` | `FM Synthesis/FM Synthesis — icon.png` |
| Cycle 5 Explorer | `Projects/Cycle 5 Explorer/Cycle 5 Explorer — hero.png` | `Projects/Cycle 5 Explorer/Cycle 5 Explorer — icon.png` |
| Rational Hearing | `Projects/Rational Hearing/Rational Hearing — hero.png` | `Projects/Rational Hearing/Rational Hearing — icon.png` |
| Synth Templates | `Projects/Synth Templates/Synth Templates — hero.png` | `Projects/Synth Templates/Synth Templates — icon.png` |
| Resonance and Damping | `Resonance and Damping/Resonance and Damping — hero.png` | `Resonance and Damping/Resonance and Damping — icon.png` |
| Auditory Illusions | `Auditory Illusions/Auditory Illusions — hero.png` | `Auditory Illusions/Auditory Illusions — icon.png` |
| The Gallery | `Projects/The Gallery/The Gallery — hero.png` | `Projects/The Gallery/The Gallery — icon.png` |
| Synthesis Notes (Loudon) | `Synthesis Notes (Loudon)/Synthesis Notes (Loudon) — hero.png` | `Synthesis Notes (Loudon)/Synthesis Notes (Loudon) — icon.png` |

- `Shop/Hero and Avatar Maker/prompts.json`: F's eight entries are added at the end of the list (now 16 entries). Where a prompt changed, the entry holds the prompt that made the placed face, so the record matches the image.
- **No config symlink.** It wasn't needed: `_ops/commons/runpod_config.py` finds the owner checkout's `config.json` through git's common dir, as the runbook says (`RunPod GPU Backend — runbook.md:45`).
- Raw renders, seeds and rejects are in the gitignored `Shop/Hero and Avatar Maker/_renders/` (rejects in `_renders/rejected-2026-11-08/`). **Carry `_renders/` out before this worktree is removed** (Maker gotcha, tuning item 17).

## Not done (outside my brief)

- **Hero embeds and face.json sidecars.** The Maker's `place` step adds `![[<Title> — hero.png]]` after the H1 of each page and writes a `— face.json`. None of the eight pages embeds its hero yet. I copied the PNGs by hand so I would touch only what the brief named. If you want both, this does them and copies the same finals again:
  `python3 "Shop/Hero and Avatar Maker/make_faces.py" place --only fm-synthesis,cycle-5-explorer,rational-hearing,synth-templates,resonance-and-damping,auditory-illusions,the-gallery,synthesis-notes-loudon`
  It will say "no seed on record" for the three heroes I patched (their bytes changed), which is expected.
- **Old sidecars** on Cycle 5 Explorer and Rational Hearing (`— face.json`): not used. **Delete them.** They were never rendered (`seeds: {}`, `rendered_at: null`), and their prompts ask for lettering. Delete them before `place`, if you run it, so the new record's history doesn't carry a dead lettered prompt.

## The test frames and prompt changes

The first test run rendered both sides of the three riskier pages (6 renders). Five of the six missed their shape:

- **Cycle 5 Explorer, hero.** It came back as a handsome Delaunay disc behind a dark ring, but no window showed seven of twelve. **Changed once:** dropped the overlaid window ring. Twelve pie slices instead: seven neighbouring slices bright from yellow to indigo, five flat black and hatched. **Re-test:** a bright fan running yellow, orange, red, pink into greys, black and indigo. It reads as bright-to-dark modes. It has about 18 slices, not twelve, and the split isn't seven to five. **Placed**, with a flag.
- **Cycle 5 Explorer, icon.** The first was six blocks in a nearly closed ring, no wide gap, a pale centre dot. **Changed once:** "an open arc of seven separate blocks … the whole bottom of the circle left completely empty". **Re-test:** nine blocks in a closed ring with a solid centre dot. It is a bold, clean emblem, but it doesn't say seven of twelve. **Placed** (the re-test). FLUX would not leave the gap open in two tries.
- **Rational Hearing, hero.** The first had box, bells, pipes and an old man in profile, but the strings were flat red lines with no loops. **Changed once:** the strings described as doubled standing-wave curves meeting in points, made large in the foreground. The scholar is now "an old woman … her back to us". The art direction's gender rule asks for balance, and this batch otherwise draws only a man and a boy (Resonance and Damping); this is a taste call, flagged. **Re-test:** a single red string rises off the box in humps of different heights, with seven bells. The old woman is in profile, not from behind. No organ pipes: an easel-like stand is there instead. It shows a string sounding in red, not two- and three-loop modes. **Placed**, with a flag.
- **Rational Hearing, icon.** The first was two posts with two beaded chains and a sagging rope. **Changed once** to bands pinched into two and three pointed loops. **Re-test:** two ornate posts with one sagging band, which reads uncomfortably like a letter M. **Placed the first render** for that reason. `prompts.json` keeps F's original icon prompt to match it. Neither shows the loops.
- **Auditory Illusions, hero.** The first was a field of bent lines around a solid black blob, with no ear. **Changed once:** nested bands inside the ear's rim, fold and lobe, curling to a spiral, "no solid black areas". **Re-test:** a large spiral mass of lines rising out of level waves, with the red band behind. It reads as a cochlea-like whorl or a shell more than an ear. **Placed**, with a flag. A faint mark in the bottom-right corner was patched with the clean paper rows above it.
- **Auditory Illusions, icon.** Came out as asked first time: a bold black ear on red. Placed.

## Batch review, after the main run

- **FM Synthesis.** The hero has a broad pink ribbon and a mint ribbon running into a bronze bell, with Memphis dots and triangles. Placed. The icon is a bold bell silhouette, but its handle is a knob rather than a wavy line, and it has no ring lines. Placed.
- **Resonance and Damping.** The hero is a charcoal man by a swing whose repeated seats and child shrink away along the crossbar, a motion study. It is pale, not dark, so no brightening was needed. A pencilled inscription in the bottom-left corner was patched with clean paper from the same rows. The icon, a swing over nested arcs, was right first time. Both placed.
- **The Gallery.** The hero shows the long house, roots, and buried record, case, cassette, guitar, papers, box and second guitar. No recorder appeared. Placed. The **icon was re-rolled once**: the first drew a small seated man on the root, and F's note rules out a figure so that Loudon isn't drawn. I added "Nothing else: no person, no figure". The re-roll is an empty frame with a tree-root through it. Placed.
- **Synth Templates.** The **hero was re-rolled once**: the first came back photographic, a wood table with depth of field and a telescope-like brush. I added "seen flat from directly above … no wood grain", described the cut as a square wave, and dropped the brush. The re-roll is flat and hand-made: a brass plate, then five sheets, with the last blank. But **four** are printed, not three, and the shapes are wavy, not square. A gibberish caption in the bottom-left corner was patched. Placed, with a flag. The **icon was re-rolled once**: the first was a 3D staircase signed "BR9A". The re-roll is a black plate with a zigzag slot cut through it, bold and flat. It could read as a "V" or a lightning bolt. Placed, with a flag.
- **Synthesis Notes (Loudon).** The **hero was re-rolled once**: the first was a photographic red stone wedge on a bench. I made the chalk-study medium stronger ("bare cream paper showing", "no realistic textures") and asked for the wave to rise and fall twice. The re-roll is a sanguine block with a wave curve carved out of it and a mallet beside it. It is closer to drawn, though still painterly. Placed. The icon is a block with a wave on top and a tool beside it. Its chisel reads a little like a brush. Placed.

Three heroes were patched for corner marks: Auditory Illusions, Resonance and Damping, Synth Templates. Each was patched by copying clean paper from inside the same image; sizes are unchanged. The unpatched originals are in `_renders/rejected-2026-11-08/*.untrimmed.png`. I also swept the four corners of all sixteen finals and found no other marks.

## Face audit

```
summary: 0 missing a face, 329 of 329 wear both
```

## Endpoint and spend

- I ran `test_runpod_api.py --live` first: ALL PASS 18/18, endpoint at max 0, no pods.
- There were three `make_faces.py generate` runs: 6, 15 and 4 renders, 25 renders in all, 0 failed. Each acquired workers through `EndpointWorkers` and released them in its `finally`. Afterwards I read back `workers {min 0, max 0, idleTimeout 5}`, health `running 0`, and 0 pods. **Nothing to release.**
- **Spend: not yet visible.** `GET /v2/billing/serverless?serverlessId=<endpoint>` returns no records for today's hours, and today's account total shows only $0.04 of storage. Serverless billing evidently lags (my reading, not verified). Worker time from the render timestamps was roughly 09:16–09:21, 09:28–09:39 and 09:49–09:53 local, including three cold starts: about 25 worker-minutes at most. For scale, the 2026-11-07 day record shows $0.069 of serverless GPU for the STIGMERGY face run. I have no verified dollar figure for this batch. Re-read `/v2/billing/serverless` tomorrow for it.

## What I could not settle

- **FLUX would not draw three of the shapes F named**, in two tries each: seven of twelve as an open arc, strings in two and three loops, and an ear made only of bent lines. The placed faces carry the gist (bright-to-dark modes, a red string sounding, a spiral of hearing) but not the exact claim. If Loudon wants the exact shape, the Maker's own fix is to composite (tuning items 14 and 26). For Cycle 5's icon, cut the seven-of-twelve fan from a hero, or draw the arc procedurally (the Maker's frontmatter names procedural icon paths). For Rational Hearing, draw the two loop strings as an overlay. Offered, not done.
- **Rational Hearing's scholar is now a woman.** I made that change inside the gender-balance rule, not at Loudon's word. It is easy to revert.
- **Synth Templates' icon** may read as a letter V. Worth a glance at 24 px.
- **Housekeeping:** a stray copy overwrote the first Auditory Illusions test hero in `_renders/rejected-2026-11-08/`. Its seed file (seed 417819) survives; the image does not. This is gitignored scratch only.
