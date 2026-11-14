---
title: "The Shop — sketch — discovery walk 2026-11-14"
born: 2026-11-14
links:
  - target: "[[The Shop]]"
    type: connects-to
    label: "sketch-for"
  - target: "[[The Shop — baton]]"
    type: connects-to
    label: "evidence-for"
forward_vector: "I hold the eleven readers' reports from the 2026-11-14 walk of where making happens, as evidence for the Shop discovery design; once that design lands and cites what it used, I move to the Archive."
---

# The Shop — discovery walk, 2026-11-14

Eleven read-only Sonnet readers each walked one situation where making happens and answered the same six questions: who chooses the tool and when, what they are reading then, what was made and with what, whether anything wrote back to the Shop, whether the Shop is available there, and what surprised them. The reports are as returned. They are readers' reports, not canon: each cites file and line, and each ends with what it did not read. The digest and the next move are in [[The Shop — baton]].

## Checked afterward by the catching session

- **`_tools/` exists.** Several readers say a glob found nothing there. The folder is gitignored and the glob skips it; `ls` shows `_tools/ComfyUI` and `_tools/stable-audio-3`, and `.venvs` at the root and in the home folder.
- **The Shop does have a LaTeX Specialist.** The Deposit reader says it has none. `Shop/LaTeX.md:33,47` is a stub whose charter covers TikZ and pgfplots. `_ops/Technical Diagram Standard.md` names no Shop page.
- **Commands on Specialist pages.** Six `Shop/*.md` pages carry a code fence (Ableton Session Writer, Kokoro, LaTeX, Lettering, Maker, Manim CE); about twelve carry an inline command somewhere. The reader's "only one page has a command near the top" was not checked page by page.
- Confirmed as quoted: `_ops/The Daily Page.md:100`, `Light Enrichment.md:66` and `:99`, `_ops/orchestrator/prompts/steward.md:150`, and ComfyUI's single run line of 2026-05-26.

## Daily Page roughs

**Daily Page roughs: what the record shows**

1. **Who chooses, and when.** The prep session chooses, at prep step 5 "Find the piece", alone before Loudon arrives (`_ops/The Daily Page.md:109`). The same prep paragraph bars heavy dispatch and says "a Shop making waits for his yes in the sit" (`:100`). A Shop making is therefore gated behind the sit, while a hand-built rough is not. Loudon can redirect in the sit (`:123`). The woken page is asked what it needs, not which tool (`:108`).

2. **What the chooser reads.** Step 5 names the Shop once: "Look to [[The Shop]]'s roster for a tool that shows the idea better than a page can, such as a [[Radio Play]] voiced with [[Kokoro]]" (`:109`). The only worked example is speech. Step 5 also says to read the design manifest first (`:109`). I could not find the Maker, any other Specialist, or a path to `_tools/` in the prep spec. A grep of `_ops/daily-page/` for Shop, Kokoro, Specialist and `_tools` hit only `check-links.py` and `deal.py`, both link-resolver code. `wake.mjs` has no hit. So the dealer brief and the wake prompt are silent on the Shop (inferred from grep, not from reading those files whole). Ledger item 119 says the roster has to be in front of whoever chooses, and that two makers never opened it (`_ops/The Daily Page/The Daily Page — tuning.md:342`). Item 25 added the roster read as v0.3 (`:108`).

3. **What was made.** I could only classify files. I did not read the ledger's per-run narrative for each morning.
   - **Hand-built, sound (Web Audio):**
     - `three-springs-blind.html:140` (11-04 Portamento) builds its own AudioContext.
     - `2026-11-05-sustained/push-back.html:113-146` uses a hand-written ScriptProcessor. This was a workaround for the pane (ledger item 107, `:319`).
   - **Hand-built, image and figure:** `2026-11-05-sustained/figures/*.pdf` and `*-preview.png` come from `gen-*.py` and `.tex` files.
   - **Hand-built, sound (numpy/scipy):** `Harmonicity and Inharmonicity/ride.py:10-29` and `frustration.py:15-59` write wavs with numpy and `scipy.io.wavfile`. This is 10-17, older than two weeks, but it is the clearest case.
   - **Hand-built, text and interaction:** the other recent roughs are HTML pages and markdown. Examples are `caption-court.html`, `dry-run-sidechain-eq.html`, `blind-sort.html` and the Pheromone Trail canvas rough.
   - **Through a Specialist:** one, the 11-14 Stable Audio Open arc-or-texture probe. Its `render.py` and 8 mp3 clips are in `Shop/Stable Audio Open/proofs/2026-11-14-arc-or-texture/`. The ledger says it was built by the prep and then asked for by the woken page (item 116, `:339`).
   - **Cannot tell:** whether any other recent rough called a Specialist off-file. I found no Shop reference inside them.

4. **Write-back.**
   - **11-14, yes.** Stable Audio Open's tuning ledger has a section "From the Daily Page probe" with items 7-12 and a run line (`Shop/Stable Audio Open/Stable Audio Open — tuning.md:41-52`). The Specialist page also links the probe (`Shop/Stable Audio Open.md:156`).
   - **Other mornings, no write-back found.** I found no Shop ledger line from the 10-17 to 11-09 roughs. Their lessons landed in the Daily Page ledger. Examples: items 107 (pane audio, `:319`), 98-99 (Portamento, `:294-295`) and 112-113 (Pheromone Trail, `:327-328`).

5. **Availability.** `_tools/stable-audio-3/README.md` exists. The Stable Audio ledger says SA3 runs on CPU or MPS with no GPU and no network once the weights are down (`Stable Audio Open — tuning.md:47`). A 60 s render took 3.1 s warm, but the first render of a session took 334 s (item 11, `:49`). That is a cost a prep alone could feel. The `_tools/` listing came back empty on a glob, though the README glob succeeded. I did not check `.venvs` or the Kokoro tools.

6. **Surprises.**
   - The only Shop-routed rough was also the morning's page, Stable Audio Open itself. The Shop was used when the page was a Specialist. I did not find it used for any other page.
   - The gate at `:100` is an extra friction. The spec makes the Shop the slower path.
   - Three audio roughs in this window used raw Web Audio or numpy. The pane-snapshot bug (item 107) was a cost of the hand route and went to the Daily Page ledger, not to the Shop.
   - The sit ended with a cold-start baton on The Shop (`:340`).

**Not read:** the diary and scroll (kept off git); individual run narratives for 11-02 to 11-09; the full text of the `roughs/` HTML files; `wake.mjs` and `deal.py` bodies; `Shop/Maker.md`; the Shop's discovery baton; `.venvs`.

## Steward cycles

STEWARD CYCLES — what the record shows (read-only, ~450 words)

1. Who chooses the tool, and when. The steward agent chooses, mid-cycle, with no step or person naming a tool. _ops/orchestrator/prompts/shared.md:316-319 says a steward may use Bash/Edit/Write "to do the actual work this cycle is about — render audio, generate code ... run a Python script". steward.md:141-153 says "Default to making" and "reach for the make". Neither names a tool, a Specialist or a medium.

2. What the chooser reads. The Shop, the Maker and every Specialist are absent from steward.md (grep: 0 hits). In shared.md the only hit is line 326, "the Shopkeeper's reach over `Shop/`". That line is about edit rights, not tool choice. The manifests of the four stewards I checked (_ops/agents/permanent/{blueline,splice-instrument-forge,generative-preset-development,vst-template}/manifest.json) name no Shop page. The one exception is BLUELINE. Its manifest `neighborhood` (blueline/manifest.json:10-11) lists "The Shop" and "Shop/Blender". Its own pages route to Shop/Blender, Shop/ComfyUI, Shop/ffmpeg and Shop/Figure Rig (Projects/BLUELINE/BLUELINE — Context.md:35; Production Pipeline.md:52). _ops/orchestrator has no Shop/Maker/Specialist mention outside shared.md:326. I could not tell from the prompt files whether the cycle runner injects any Shop page. I found no sign it does.

3. What was made.
- Generative Preset Development cycles 11 and 12, 2026-11-14 (scroll.md:93-111, 143-160). These were hand-built: Python scripts (vital/reshape_vital.py, vital_render.py, vital_measure.py) wrote the Vital presets, WAV renders and measurements. No Specialist is named.
- VST Template, 2026-11-14 keys proof (scroll.md:127, 161). phrase.py imports numpy and a local `verify.write_wav`, and wrote phrase.wav. The plugin was ported by hand from a numpy sketch (scroll.md:102). Picture proofs are pngs; I could not tell which tool made them.
- Splice Instrument Forge (scroll.md:119-317). Mostly Splice samples and sketch bounces "outside Live". The tool behind the bounces is not stated. Its workshop README mentions only Shop/Shopkeeper's session templates (workshop/README.md:27), reused as ready-made files.
- BLUELINE (scroll.md:308; Motion and Flow.md:104). This is the one that is Shop-native: Blender via Shop/Figure Rig, with proofs under blender-handdrawn and blender-gallery.

4. Write-back. I found none to the Shop. BLUELINE — tuning.md holds only cycle-1 and cycle-2 items about Ableton clock parsing and frame rounding (lines 27, 37), none about Blender or a Specialist. shared.md:358-367 sends lessons to the project's own tuning ledger as numbered proposals, and the "house" rule at lines 321-356 bars a steward from editing the house, which includes Shop pages. Shop/Matplotlib/Matplotlib — tuning.md:31 holds a single run line, a June "smoke test on mac · nothing new". 24 of the Shop tuning ledgers have 1-2 run lines each (Shopkeeper has 12). These hits are mostly seed or smoke lines. I did not check dates for each.

5. Availability. I found no `_tools/` folder at the palace root (Glob returned nothing). Shop/Maker/host-capability.json exists; I did not read it. The record I read says nothing about .venvs, GPU or network for steward cycles. BLUELINE's render backend implies a RunPod GPU route (render-backend/track-I-report.md:74-79).

6. Surprises.
- The steward prompt pushes hard toward making (steward.md:141-153) and names no tool, so hand-built is the default by silence.
- The steward is told to "Work as if your proposals hold" (shared.md:358), but cannot touch Shop pages. Any Shop lesson would have to ride a `proposed_edits` item into the project's ledger, owed until Loudon's review.
- Measurement-heavy stewards (GPD, VST) keep their own verify/render scripts, which grow in their workshops (vital/*.py, proofs/*/verify). That is a parallel tool shelf outside the Shop.
- BLUELINE shows the Shop used by name, but through its manifest neighborhood and its own pages, not the steward prompt.

Not read: shared.md in full (grepped only), the other ~24 manifests, state.json/history.jsonl beyond the Shopkeeper grep, Splice Forge and VST tuning ledgers in full, host-capability.json, the Maker page body, the scripts' bodies, and any media files.

## Deposit figures

SITUATION: figures made during a Deposit. I read one worked example closely (DSP in Looping Dimensions, D-2026-11-09-DSPLOOP) and checked Auditory Illusions. I did not survey every 2026-10/11 entry.

1. Who chooses the tool, and when.
- The spec leaves it to the depositor at draft time. `_ops/Deposit Ceremony.md:75` ("Can it be seen, heard or played?") says a figure "is canon and goes in the draft" and points only to [[Image Embedding Standard]]. Step 4's map line (`:94`, `:107`) asks whether a figure is needed. No step says how it is made.
- In DSPLOOP the working session chose TikZ/pgfplots "per [[Technical Diagram Standard]]" (`DSP in Looping Dimensions/DSP in Looping Dimensions — Context.md:38`).

2. What the chooser reads.
- The Deposit card never names the Shop, Maker or a Specialist. I checked `:75`, steps 1-8 and the tuning ledger; there are no hits.
- `_ops/Technical Diagram Standard.md:27,39,65-74` makes the tool choice itself: LaTeX/TikZ/pgfplots, rendered through pdflatex and dvisvgm. It names no Shop page. The Shop has no TikZ or LaTeX Specialist. `Shop/Manim CE.md` mentions LaTeX only as its own render pipeline.
- `_ops/Image Embedding Standard.md` names only [[Hero and Avatar Maker]] (`:20,41`).
- `Shop/Maker.md:273` mentions the Deposit only as the place where the roster drift check runs.

3. What was made.
- DSPLOOP: nine SVG figures, dated 2026-11-09 (`DSP in Looping Dimensions — scroll.md:71-79`). All were hand-built in LaTeX plus Python generators.
- The Python generators in `figures/` write TikZ snippets or pgfplots `.dat` files. For example, `figures/gen-loops.py:1-5` writes `torus-mesh.tex`, `torus-path.tex` and `stretch-rings.tex`.
- The bundle holds about 68 source files. No Matplotlib or Manim output appears in it.
- Auditory Illusions: the body embeds only its hero (`Auditory Illusions.md:28`). Its rich face holds 20-plus HTML pieces and two Shepard WAVs in `rich-face/`. The rich face is Enrichment's work, not the Deposit's. The record I read does not say how those pieces or the hero were made.
- Moog curve, heard-rise, LTCSPEED and BBS Design System: I did not trace their figures. The ledger says the heard-rise figure was "drawn" by the working session (`Deposit Ceremony — tuning.md:150`) and gives no tool.

4. Write-back.
- Nothing wrote back to the Shop. The only Matplotlib run line is the 2026-06-16 smoke test (`Shop/Matplotlib/Matplotlib — tuning.md:31`). A search of Shop tuning ledgers and Maker for `Deposit|DSP in Looping|D-2026-11` found only the Maker.md:273 drift note.
- Lessons land in the Deposit ledger. Item 33 (`_ops/Deposit Ceremony/Deposit Ceremony — tuning.md:163`) and the DSPLOOP run line (`:164`) record cold-read counts and say nothing about how the figures were made. The nine-figure workflow lives in DSPLOOP's own Context (`:38`).

5. Is the Shop available?
- The Technical Diagram Standard says the LaTeX toolchain is present Mac-side (`:65`).
- A glob for `_tools/*` at the palace root returned nothing. I did not check `.venvs`, GPU or network.
- Manim CE's page notes LaTeX is already used there (`Shop/Manim CE.md:156,195`). Whether it could draw these figures, I cannot tell from the record.

6. Surprises.
- A figure's maker is set by a second standard (Technical Diagram Standard) that routes to LaTeX and never mentions the Shop. The Deposit's gate delegates the "how" to standards that predate the Shop.
- Figures are canon at the deposit, while sound and play are sent to Enrichment (`Deposit Ceremony.md:75`). So the Deposit's own makers are only figure makers.
- The cold-read rule traces claims to files (item 30/31), so a Specialist's run line could ride on that same trace, but no step asks for one. That is my inference.

NOT READ: Moog, heard-rise, LTCSPEED and BBS entries' figures; Image Embedding Standard in full; DSPLOOP's `.tex` and `.py` bodies beyond `gen-loops.py` lines 1-25; Auditory Illusions' Context and scroll; the Deposit Archive and LOG commit bodies; `.venvs` and GPU state; the Shop roster.

## Loudon Live and the Post-producer

LOUDON LIVE / POST-PRODUCER: what the record shows (read-only; paths relative to the palace root)

1. WHO CHOOSES THE TOOL, AND WHEN
- Post-producer: no one has chosen yet. It has never run on a published post. The Log says "No sessions yet" (Shop/Loudon Live Post-producer/Loudon Live Post-producer — Log.md:41), and the page is still status: stub (Shop/Loudon Live Post-producer.md:4). Its charter says the Post-producer "dispatches through the Maker", meaning it picks Whisper and ffmpeg by name (Shop/Loudon Live Post-producer.md:68, :124).
- Design system work: a working session with Loudon picks the tool. The look session recipe has five steps and none of them is a tool-choice step (_ops/loudon-live/design-system/SKILL.md:21).
- Channel assets: nothing in the record shows a person choosing a tool. Projects/Loudon Live/toolchain/render_starting_soon.py was written as a one-file Python script (docstring :1-15).

2. WHAT THE CHOOSER READS
- Projects/Loudon Live.md has no mention of the Shop, Maker, Specialist or any tool. A grep for them returned nothing. The Shop is silent where the project is described.
- SKILL.md names the Shop only inside one long line (:35). The design-system README lists "The Shop.md · Shop/Maker.md" as "Voice, tone, taste" reading (_ops/loudon-live/design-system/README.md:28). That is a reading list for voice, not a dispatch instruction.
- Palace development/Loudon Live Design System.md:222-245 ("Collaboration with The Shop") does name Matplotlib, Manim, Mermaid, ComfyUI, FLUX, Remotion, p5.js and Tone.js. But it says the wiring is "held until first invocation, by intent" (:230). It is a table of what each Specialist would need. It does not tell a maker to use one.
- Inside the Post-producer page, the Shop is named in the Charter and in § Relationship to the Shop (:47, :124). The baton (Shop/Loudon Live Post-producer/Loudon Live Post-producer — baton.md:13-40) is about rewriting captions, consent and the charter. It does not mention tools.

3. WHAT WAS MADE
- The last Post-producer run was a private 22-minute coaching session: 12 chapters, 3 excerpts and caption pairs (baton:40). The record does not say which tools produced it. The Log has nothing from it, by design.
- Looks (Worn Broadcast, Cyanotype, Night Signal), made 2026-10-25:
  - Looks: hand-written standalone HTML/CSS/JS (SKILL.md:19), built by builder scripts such as build_look_cyanotype.py (tuning.md:39). The Night Signal look's canvas phosphor trails are hand-drawn JS (tuning.md:80).
  - Plates: a Specialist route. They were generated with local ComfyUI/SDXL (Palace development/Loudon Live Design System/workshop/plates/PROVENANCE.md:13-19; tuning.md:63).
- The Logo, Heard (2026-10-14): a hand-built HTML page. It uses raw Web Audio (Projects/Loudon Live/proofs/the-logo-heard.html:196) and no Specialist is named (Projects/Loudon Live/Loudon Live — scroll.md:58).
- starting-soon card: Python writing SVG by hand, then a PNG (toolchain/render_starting_soon.py:71-139). It is a single-file MVP.
- The "trace, heard" .m4a (Projects/Loudon Live/Loudon Live — rich — the trace, heard.m4a): I could not tell how it was made.

4. WRITE-BACK TO THE SHOP
- None found. The ComfyUI plates made 2026-10-25 do not appear in the ComfyUI ledger. Its only run line is "2026-05-26 fireflies pond" (Shop/ComfyUI/ComfyUI — tuning.md). I did not check the other 10-25 sessions or the ComfyUI page's own body.
- No ledger for Remotion, Whisper, ffmpeg, p5.js or Matplotlib has a Loudon Live run line. The newest run lines are 2026-05-26 and 2026-06-16, and several of those are Maker smoke tests.
- Only mentions of Loudon Live in Specialist ledgers: Mermaid (Shop/Mermaid/Mermaid — tuning.md:27) and Stable Audio (tuning.md:38). Both are open questions, not run lines.
- The lessons from this situation land in the Design System's own ledger: Palace development/Loudon Live Design System/Loudon Live Design System — tuning.md. It has 19 items. Items 12-14 are ComfyUI recipes (local SDXL, denoise 0.55, provenance sidecars) that live there, not on Shop/ComfyUI. Its run line is "taught items 1–19" (:84).
- The Design System's own Context says the Per-Specialist rows are written when "paid" (Palace development/Loudon Live Design System/Loudon Live Design System — Context.md:51). None is recorded as paid.

5. IS THE SHOP AVAILABLE?
- Maker.md:227 says the Mac host has everything (Manim, Kokoro, ComfyUI plus Stable Audio, Remotion, ffmpeg, Whisper, Matplotlib). The Design System tuning confirms local ComfyUI ran on the Mac (tuning.md:63).
- Globs for _tools/* and .venvs/* returned nothing in this checkout. I cannot say whether that is a gitignored or worktree artifact. The record does not settle it.

6. SURPRISES
- The Design System's tuning ledger is a working Shop-style ledger sitting beside the Shop. ComfyUI recipes landed there and not on the Specialist's page. The Shop is used, but what it learns does not reach the Shop.
- Both made-by-hand artifacts were built with the Design System at hand. The Design System's collaboration table says to wire in the Specialists later. The one that was wired (ComfyUI) did not get a Shop write-back.
- The Post-producer, the one page that names Whisper and ffmpeg, has made nothing published. The channel's real makings (looks, card, logo) came from the Design System sessions and the Daily Page, which never read the Post-producer.
- The baton asks for a Post-producer rewrite and says nothing of tool dispatch (baton:15, :42-44).
- Student recordings must not enter the palace (baton:34), so the Log cannot carry session lessons, which limits write-back from the Post-producer by design.

NOT READ: the Design System README, Context and workshop README in full; Shop/Maker/host-capability.json; most of Shop/Maker.md; the Whisper, ffmpeg and Remotion Specialist pages; The Shop — Context.md; git log; the remaining files in Projects/Loudon Live/ (rich.json, the launch kit beyond tool mentions, Context); the .m4a and the plate PNGs; the stream-overlay and session-artifact UI kits.

## VST, plugin and project builds

SITUATION: VST/plugin/project builds (Projects/). Read via Grep, not full reads. Findings:

1. WHO CHOOSES. Two patterns.
(a) Spec-first: a steward writes a "spec sheet" that names Specialists per row, but it dispatches nothing. Blood Compressor — spec — sfx-cue-sheet.md:23 says "This is a spec sheet, not a dispatch order"; visuals.md:28 says "No Specialist is invoked here." Per-row choices: sfx-cue-sheet.md:38 onward ("Specialist: Stable Audio Open"), visuals.md:54 onward (p5.js, ComfyUI, Manim CE). Retrospective Delay is the same: stage-1-mockup-imagery.md:52,72,90 (p5.js, Matplotlib, Remotion). Its witness note (stage-1-the-witness.md:219) says "this cycle SPECS the brief, does not dispatch."
(b) No chooser at all: the numpy, Python or Max-codebox build is the default. VST Template says "Sketch in numpy, one sample at a time" (template/README.md:26). The framework-choice proof frames the route as numpy to plugin (proofs/2026-10-20-framework-choice/README.md:43).

2. WHAT THE CHOOSER READS. Only the spec-first projects name Shop/Maker and Specialists; they inherit "house standards" from Maker (sfx-cue-sheet.md:25; visuals.md:47,188,198). Grep for Shop/, The Shop, Specialist, Maker, _tools and .venvs found no matches in the Crystal Synthesizer .md files or the VST Template files. Haptic Handwheel's only "Shop" hits are "Shopkeeper" (scroll.md:161, BENCH.md:12), a different agent. Blood Compressor's scroll mentions only "the Shopkeeper's Live-set writer" (scroll.md:142), also not the Shop.

3. WHAT WAS MADE.
- Crystal Synthesizer: the .wav files are Python-rendered (render_birefringence.py, render_dispersion.py, render_palette.py). render_anisotropic_beryl.py:59,176 uses a hand-written "canonical 16-bit mono PCM WAV writer" that "stands in for scipy.io.wavfile". SVGs are typed out from Python (playable-crystal/draw_sweep.py:46-62, reading the wav with wave.open). Charts are PNGs; I could not tell their tool.
- Haptic Handwheel: feel-lab uses matplotlib directly (plot_turntable.py:3-23) and wavfile (bench scripts). Matplotlib is a Shop Specialist, but these scripts do not go through it as far as the record shows.
- VST Template: editor PNGs are described as "the mock in Chrome" (proofs/2026-11-14-keys/README.md:28). phrase.wav comes from phrase.py, which imports numpy and a local verify module (README.md:29; phrase.py:8-17). All hand-built; no Specialist named.
- Blood Compressor: verify/ and rnbo/ hold hand-built wavs, SVGs and PNGs (threshold-steps.wav, make_patch.py). The scroll calls it "a hand-built compressor" (scroll.md:192,518). I found no rendered audition-seed or SFX files (no *.study.wav in the Glob list). The Stable Audio, Kokoro and ffmpeg briefs appear to be unrun specs. That is an inference from file absence, since the Glob was truncated at 100 of 284 files.
- Retrospective Delay: stage-1/assets has three PNGs and witness-diagram.html. The record I read does not say what made them.

4. WRITE-BACK. For the six projects that link Shop pages (Blood Compressor specs, Wavetable Scanner, Murmuration, Retrospective Delay, BLUELINE, Waveguide/Gallery/2D Torus link only "The Shop"):
- Wavetable Scanner did use Specialists. Its gotchas file says discoveries "were lifted into [[Shop/Web Audio Worklet]] and [[Shop/Three.js]] on the same day" (Wavetable Scanner — gotchas.md:21,78-79). Run lines exist: Web Audio Worklet — tuning.md:42 and Three.js — tuning.md:34 ("run · 2026-05-31 · Wavetable Scanner, sketch"). This is the one clean write-back I found. Note these two are code libraries, not generated-media Specialists.
- Blood Compressor: grep of Shop tuning ledgers for "Blood Compressor" returned no hits, so none of the Stable Audio, Kokoro or ffmpeg run lines exist.
- BLUELINE and Murmuration: the Shop tuning files that mention them are Blender, Depth Anything, LaMa, SAM and Web Audio Worklet (13 hits in total). I did not read the content.
- Everything else lands in the project's own tuning.md (Blood Compressor — tuning.md:37-64; VST Template — tuning.md:33-52), which are steward cycle ledgers about canon changes, and in its scroll.

5. AVAILABILITY. Glob for _tools/* returned nothing, so I could not verify the folder from here. Maker.md:217-240 reads capability from Shop/Maker/host-capability.json. Maker.md:227 says the mac host runs everything, including Stable Audio and Kokoro on the MPS GPU, Matplotlib and ffmpeg. Maker.md:228 says a sandbox runs only web Specialists, Matplotlib and ffmpeg. Maker.md:230 says RunPod (rented GPU) handles ComfyUI and FLUX. The record does not say which host the build sessions ran on.

6. SURPRISES.
- The only places that name Specialists are specs written ahead of making. The doing sessions (VST Template, Crystal, Haptic) never see them.
- The Specialist-naming specs sit unexecuted. Blood Compressor's scroll later pivoted to the plugin and a lesson rework (scroll.md:172,196).
- VST Template and Crystal Synthesizer, the two heaviest builders, have zero Shop links. The VST Template recipe makes numpy the sketch language, so sketches and proof WAVs are numpy by design.
- Specialists were credited only where the build was web-native (Wavetable Scanner).

NOT READ: Shop/Maker.md beyond the grep lines; the Shop Specialist pages and charters; the Shop/Maker/host-capability.json file; full scrolls (Blood Compressor, Crystal, Haptic, VST Template); the tuning ledgers' content for BLUELINE and Murmuration; Waveguide, 2D Torus and Gallery bodies; the 184 files the Glob omitted; the actual image contents.

## The public site, rich faces and the light round

SITUATION: public site / rich faces / light enrichment. Walked: STIGMERGY.md, _ops/stigmergy/app/README.md, welcome.md, _ops/rich-face/README.md, Enrichment.md, Light Enrichment.md, Shop/Hero and Avatar Maker.md and tuning, Enrichment/light-round-2026-11/.

1. WHO CHOOSES, WHEN
- Rich face (Enrichment): step 3, "Make it with the Shop... The [[Maker]] picks the Specialists" (Enrichment.md:82). The chooser is the enriching agent, who reads the spec. Step 0 sends it to Enrichment — tuning first (Enrichment.md:79).
- Light Enrichment: step 4, "Make it with a script that stays" (Light Enrichment.md:66). The maker agent chooses, by writing a script.
- Heroes and icons: a "Regen" request from the Companion (STIGMERGY.md:113), or a batch through make_faces.py (Hero and Avatar Maker — tuning.md:12).

2. WHAT THE CHOOSER READS
- Enrichment names the Shop and the Maker (Enrichment.md:55,82), so a reader of the full ceremony meets them.
- Light Enrichment names them only as a "direction, not a step" (Light Enrichment.md:97-99). The step list itself is silent: the round steps (63-73) never name the Shop. Its forward vector does lean toward the Shop (line 30).
- Line 57 says heroes are "a material, not a target": "reach for it when needed".
- _ops/rich-face/README.md has no mention of Shop, Specialist or Maker as a making route. It names only Shop/Shopkeeper render paths at lines 141 and 154. Its gotchas (lines 261-329) assume a hand-written single HTML piece with worklet DSP. It points to [[Web Audio Worklet]], not to a Specialist.
- _ops/stigmergy/app/README.md: grep for Shop, Specialist and Hero and Avatar found nothing.
- welcome.md (_ops/stigmergy/app/src/public/welcome.md): grep found no mention.

3. WHAT WAS MADE (light round, November 2026)
- Light Enrichment.md:93 says seventy pieces on sixty-eight pages. Line 99 says of the Shop: "The first round did neither."
- Sounds: make-sounds.py:2-4 says "synthesized here from nothing; no samples", using numpy and the wave module. It writes a wav by hand. make-sounds-2.py and make-sounds-3.py exist, and I did not open them.
- Images: lib.py:4 imports PIL (Pillow). The make-figures*.py, make-sheet*.py and make-icon-pieces*.py scripts are the same family. I read only the imports in lib.py. I inferred Pillow for the rest from the file names.
- SVGs and wavs sit untracked in the workshop (git status).
- make-icon-pieces.py:14,31 builds "what survives at 24 pixels" for the Hero and Avatar Maker page, by script.
- Hero and Avatar Maker itself is used. Shop/Hero and Avatar Maker/_renders/ holds hundreds of hero and icon PNGs (the glob listed 416 files). Its tuning ledger has runs dated 2026-11-07 and 2026-11-08 (tuning.md:73-74).
- I did not open the individual pieces' manifests, so I cannot tell which rich-face pieces from the heavier enrichment rounds used other Specialists.

4. WRITE-BACK
- Hero and Avatar Maker: yes. Its tuning ledger carries 28 numbered lessons and run lines, and its page holds gotchas (Hero and Avatar Maker.md:79-87). The ledger says the regen lane writes its own run line (tuning.md:15).
- Light round: no write-back to any Specialist. Lessons land in Light Enrichment.md:75-89 ("What goes wrong") and its Context, per line 93. A glob for a Light Enrichment tuning file found none.
- A grep for "- run ·" lines in Enrichment — tuning.md found none. That file may be at another path, and I did not locate it.

5. IS THE SHOP AVAILABLE
- The record I read does not say, for _tools, .venvs or GPU.
- The Maker's route is FLUX on a RunPod serverless endpoint with a cold start of about 250 s (Hero and Avatar Maker.md:58). Its tuning ledger records endpoint outages and a 900 s queue (tuning.md:53,71).
- Light Enrichment.md:99 gives the cost reason: "It is slower than a script of one's own".

6. SURPRISES
- The hero and icon route is the Maker, and it is used, through the Regen lane and batches. That route is the one place on the public surface where making writes back.
- The light round's own spec says the Shop is slower than a script. The Shop is named in the round only as a direction, not a step.
- Light Enrichment.md:57 tells makers to reach for heroes and icons "just when needed", not by default.
- rich-face/README, the file a piece-maker reads for gotchas, is silent on the Shop.

NOT READ: Shop/Maker.md, The Shop.md, individual Specialist pages, Light Enrichment — Context, the challenge/*.md files, make-sounds-2.py and make-sounds-3.py, make-figures*.py, any rich.json manifest, the Enrichment — tuning file, Projects/ stewards, and _tools/.

## The Maker's own dispatch

MAKER DISPATCH, READ FROM INSIDE (all paths relative to the palace root)

1-2. WHO CHOOSES, READING WHAT. The Maker chooses, at job-spec time, after intake (Shop/Maker.md:63-66). Its reading is its own page: Selection Heuristics at :83-128, the Host Capability Check at :219-246, and the manifest at Shop/Maker/host-capability.json. The page says the Maker "reads this from the manifest" (:223). Nothing says who runs the Maker or who tells a maker to call it. The page's charter is "Anything that isn't text... comes through me" (:51). Whether any session actually goes through it, the record does not say.

3. MOST RECENT ACTUAL DISPATCH. The last Recipe is 2026-06-19, The Unsung Path (:288), with Kokoro, Stable Audio Open, Manim and ffmpeg. Its bundle is `_ops/scratch/weave-video/`, which is scratch. The page says the Recipes close with "Future recipes added as briefs finish" (:290). The Test Suite says "Last run: never" (:296), but host-capability-check.js's own tests ran 2026-05-30 (:246). I did not read test-results.json. The page does not say whether any Recipe was actually dispatched through the Maker rather than hand-run by a session.

4. WRITE-BACK. Shop/Maker/Maker — tuning.md has exactly 2 entries, both seeded 2026-11-07 from old gotchas from 2026-05-10 (:27-28). It has no "- run ·" lines, although its standard sets the line format (frontmatter `line:`). Maker.md:67 says oddities go to the Specialist's ledger "in the job's commit". Whether that happened for the Unsung Path, I did not check.

5. AVAILABILITY. Mac: "Everything" (:227). Sandbox: web specialists, Matplotlib, Mermaid, ffmpeg and Whisper only (:228). The manifest's own note says Sandbox TeX Live is unconfirmed (host-capability.json:22). I did not check _tools/, the .venvs or the GPU.

ROUTES. A "route" here means a Selection Heuristic that sends a need to the Specialist.
Routed: Ableton Session Writer (:97), Blender (:95, :124), CAD Drafter (:95), ComfyUI (:104, :124), D3.js (:100), FLUX (:104), Kokoro (:110), LaTeX (:93), Manim CE (:87, :108), Matplotlib (:91), Mermaid (:89), Observable Plot (:91, :101), p5.js (:102, :118), Remotion (:106), RNBO (:114, :126), Three.js (:120), Tone.js (:113, :126), Web Audio Worklet (:126).
No route, 14 Specialists:
- Depth Anything, Figure Rig, LaMa, Lettering, LoRA Trainer, OBS and SAM.
- AuK, Image-to-3D Smith, LightOnOCR-3 and VCV Patch Generator.
- Whisper, ffmpeg and Stable Audio Open. These appear only inside pipelines or recipes (:66, :108, :157, :284, :288), not as an answer to "I need X".
Maker — Context.md:53 names four of these (Depth Anything, Figure Rig, LoRA Trainer, OBS) and says the heuristics never route to them.

MISSING FROM host-capability.json (6): Depth Anything, Figure Rig, LaMa, Lettering, OBS and SAM. The file has 26 live entries, plus the deprecated Midjourney at :15.

CONTRADICTIONS
- :116 says raw Web Audio is "not a Specialist... considered and rejected". :126 routes to Web Audio Worklet, a rostered Specialist (The Shop.md:130), and host-capability.json:31 calls it "Zero-dependency per-sample DSP".
- :114 sends custom sample-accurate DSP in the browser to RNBO web export, which it calls unproven. :126 sends the same need to Web Audio Worklet.
- Maker — Context.md:25 says the Maker "has no tuning ledger". One exists and is dated 2026-11-07. Context.md:57 also says the test plan is a TODO.
- :89 routes to Graphviz, :91 to Plotly, and :118 to HTML/React Artifact Smith. None has a page, and :271 and Context.md:46 admit it.
- The Roster section (:260) says the Roster is generated, but the page also carries a stale comment about a "Phase 2" (:42).

PATH FROM "I NEED A SOUND" TO A COMMAND. By my reading:
1. Open a ~319-line page.
2. Find the Sound intake questions (:73).
3. Find Narration (:110) or one of the browser-audio routes (:112-126).
4. Run the host check (:246, via host-capability-check.js).
5. Open the Specialist's own page for the actual command.
Plain "make a sound effect or music bed" has no heuristic. Stable Audio Open appears only in :157 and :288, and the Maker's own pages hold no runnable command.

SURPRISES
- The Maker's own ledger has no runs at all.
- The sound routes are almost all for browser audio. Generative or offline sound has no front-door route.
- Six Specialists are missing from the manifest, so the host check cannot clear them.

NOT READ: Shop/Maker/host-capability-check.js, test-results.json, run-tests.mjs, SHOP-BUILD-SESSION-2026-05-30.md, build-roster.mjs, any Specialist page or ledger, _tools/, git log, and The Shop.md outside lines 90-144.

## The Concierge and the pre-making reflexes

SITUATION: Concierge + gatherer index + pre-making reflexes. Short finding: the Shop is not named anywhere in this chain.

1. WHO CHOOSES THE TOOL, AND WHEN. Nothing here chooses a making tool. The Concierge has five postures: gatherer, oracle, scout, curator and moderator (Palace development/Concierge.md:114-133). The routing table (_ops/concierge/README.md:75-82) has no "I am about to make X" row. The only make-adjacent rows are "tidy" and "anything a cheap file-read settles: just read the file". The one make-adjacent address is "precede a write", and that means placement: "fold-or-mint and placement" (README.md:136-137). It does not mean which tool makes the thing. The record does not say who picks the tool; I infer it is the working Claude, with no prompt in this chain involved.

2. WHAT THE CHOOSER READS. Silence. A grep for Shop|Specialist|Maker over _ops/concierge/ returned two hits, both about folder location: oracle-qa.md:34 and curator.md:69 list `Shop/` in "an entry can sit in any folder". Shop/ is a place to find a page there, not a means of making. A grep for the same terms (plus "The Shop"/"Maker") in Concierge — tuning.md, CHILD.md and .claude/skills/concierge/SKILL.md returned zero. Shop/Maker.md contains no "Concierge" or "Search Before" either, so the link is missing in both directions.

3. POSTURE BEHAVIOR ON "where does X live". The gatherer starts from `palace-map.py near "<Entry>"` (gatherer.md:23). It is told to exclude `.venvs/` and `_tools/` as "tooling dirs — knowledge entries only" (gatherer.md:26-28; oracle-qa.md:30-31). So the Concierge looks at Specialists as subject pages only, and is told to skip the places a tool lives. The map returns relation rings and "pages not yet written" (companion.md:64). The map is frontmatter-only, so a Specialist's tiers and recipes would not be in it (companion.md:64). Neither gatherer.md nor oracle-qa.md has a "how would I make this" question type. I found no line that would lead it to answer with a Specialist as a means. A grep of palace-map.py for Shop|Specialist returned no matches.

4. PRE-MAKING REFLEXES.
- Search Before You Build.md:30-50 sends the child to grep `Projects/*/proofs/`, read the owning project's Gotchas, run `git log` on the path, and "address the Concierge" (lines 32, 49). It names no Shop, Maker or Specialist. It is built on a miss in the GenAI Camera, where depth code was written fresh and ComfyUI `lib/comfy.py` was missed (lines 37-41). The prior art it searches is project proofs. A Specialist is not a project proof, so a child following it as written would not look in Shop/.
- Progressive Staging.md is a method for building things that teach. Its examples are Gen~, codebox and Web Audio-style walks (lines 49, 59-69), and it names no Shop or Specialist.
- CHILD.md's list of things to do before building (CHILD.md:15-18 in the system context) names Search Before You Build, Progressive Staging and the design manifests. It does not name the Shop.

5. WHAT WAS MADE. Nothing is made in this situation. Concierge runs produce indexes, answers, maps and reckonings. I did not find a making artifact here. I did not read Concierge — tuning.md in full. Grep only (zero hits for Shop|Maker, so no Shop write-back).

6. WRITE-BACK. None found. Concierge's own ledger is Palace development/Concierge/Concierge — tuning.md and has zero Shop/Maker hits. The curator's `offer` tier (curator.md:30-38) is the only write channel and says nothing about Specialist run lines.

7. IS THE SHOP AVAILABLE. Not answered. Globbing `_tools/*` and `.venvs/*` returned no files. I infer Glob skips ignored or hidden paths, not that the folders are absent. I did not verify with ls.

8. SURPRISES THAT BEAR ON THE GOAL.
- The gatherer and oracle are told to skip `_tools/` and `.venvs/`, the folders where Specialists run (gatherer.md:26-28). That is the opposite of surfacing them.
- Search Before You Build is the reflex "fired on any build X", and it routes to the Concierge when unsure (SBYB:49). That route reaches no Shop page, and Shop/Maker.md does not name the reflex.
- The Concierge's ring-reading (companion.md:64) would find a Specialist page only if the asker named it. A question like "I am about to make a sound" has no home entry in the Shop, so `near` has nothing to anchor on.

DID NOT READ: Shop/Maker.md beyond a grep for Concierge, any Specialist page or ledger, The Shop.md, ELDER.md, SCHEMA, .claude/skills/concierge/SKILL.md body, Concierge — tuning.md body, dial.mjs, return-map.mjs, palace-map.py source (grep only), Return Ceremony tuning, any worktree copies, and any real Concierge transcripts. I did not confirm which tools exist on the host.

## Sessions without the tools

SITUATION: sessions without the tools (worktrees, cloud, unattended). Read-only; ~480 words.

1. WHO CHOOSES, WHEN. Two choosers, neither clearly in force here.
- The Maker, at intake step 4, runs a Host Capability Check before any Specialist runs (Shop/Maker.md:66, :219-246). It reads Shop/Maker/host-capability.json.
- The worktree creator picks a profile (docs/shop/blueline/stigmergy/full) at creation (_ops/worktree/SKILL.md:57-65; _ops/worktree/symlinks.json:6-12). That profile decides whether _tools and .venvs exist at all.
- The record does not say who chooses in a scheduled or cloud run.

2. WHAT THEY READ. The check is real code: Shop/Maker/host-capability-check.js, "last run 2026-05-30 — 8/8 pass" (Maker.md:246). It applies only if the Maker is invoked.
- Worktree Practice.md:45 and SKILL.md:29 name the gap as "missing tooling". Both frame it as GPU/ComfyUI work (`_tools/` "can't run any Shop/BLUELINE GPU work"), not Kokoro or the small tools.
- The `docs` profile symlinks nothing but node_modules (symlinks.json:7, :17), and it is the profile for markdown/canon work. Neither doc says which profile a plain making session should take.
- Neither page tells a maker to open the Maker or the Shop.
- Operator Memory.md has no match for cloud, venv, Shop, worktree or sandbox. MEMORY.md (in my context) points to cloud-session facts, but I did not follow them.

3. WHAT WAS MADE. Not examined. I did not read the runs for this situation. I can't say what recent worktree or cloud runs produced.

4. WRITE-BACK. Not checked for this situation. Maker — tuning.md:27-28 records the 2026-05-10 sandbox failure (Manim has no aarch64 wheel) and says it was "paid in § Host Capability Check". That is the one lesson from this situation that I saw land in the Shop. The Matplotlib forward_vector (Shop/Matplotlib.md:10) says it stands ready as Manim's fallback on a sandboxed host.

5. AVAILABILITY. Host classes (host-capability.json:3-8; Maker.md:225-230):
- mac: everything.
- sandbox: Linux, no sudo, no GPU.
- cloud: API only.
- runpod: rented GPU.

Sorting the Specialists (manifest "hosts"):
- Runs anywhere, sandbox included (pure code or browser): p5.js, D3.js, Observable Plot, Tone.js, Three.js (GPU check is a human step), Web Audio Worklet, Mermaid, Matplotlib, ffmpeg, Whisper (CPU, slow). Their footprints say "API keys: none" and trivial disk (Tone.js.md:105-112, p5.js.md:124-131, Matplotlib.md:102-109). The browser tools need the CDN library or a self-host.
- Needs the Mac's _tools or .venvs:
  - Kokoro: per-Specialist venv `~/.venvs/kokoro`, Python 3.12, about 330 MB first-run download (Kokoro.md:136-158; manifest hosts mac only).
  - Stable Audio Open: local GPU/MPS, about 3 GB, gated HF weights (Stable Audio Open.md:104-110).
  - Manim CE: manimpango, Cairo and LaTeX (host-capability.json:24).
  - Blender, Remotion, LaTeX, VCV, RNBO, Ableton Session Writer, CAD Drafter: mac only (manifest).
  - ComfyUI: _tools holds the venv and weights (symlinks.json:28).
  - Blender has no Resource Footprint section (Glob).
- Needs a GPU pod or network:
  - ComfyUI (mac or runpod) and LoRA Trainer / LightOnOCR-3 (runpod only). RunPod needs the secret config.json, which only the blueline and full profiles link (symlinks.json:9, :11, :39-45).
  - FLUX (Hugging Face): no local GPU, but needs network plus an HF token (FLUX (Hugging Face).md:139-147).
  - Image-to-3D Smith, AuK: anonymous HF Spaces (manifest).

What a plain worktree has: tracked files only. `docs` adds node_modules. The `shop` and `full` profiles add _tools and .venvs, but only as symlinks to absolute paths on Loudon's Mac (SKILL.md:87; symlinks.json:4). A cloud clone has no Mac, so there is nothing to link. It has the sandbox class (the web specialists, Matplotlib, Mermaid, ffmpeg, Whisper) and network-reached FLUX or RunPod only if a token or config reaches it. The record does not say how.

6. SURPRISES.
- host-capability.json says Kokoro is mac only. The Kokoro page says "GPU: not required" and "API keys: none" (Kokoro.md:140-143). The 330 MB download and the venv are what block it. Whether the sandbox could install the Kokoro venv is untested.
- The `.venvs` link note says the venvs are "slow — pip install per Specialist" (symlinks.json:35).
- The default profile is `full` (SKILL.md:55). The Claude-app worktrees under .claude/worktrees/ are handled by hand-linking node_modules only (SKILL.md:192-199). Nothing there links _tools or .venvs.
- CAD Drafter's venv is "made per worktree" (host-capability.json:35). That is the one place the record treats worktrees as able to build their own.

NOT READ: the scheduled-task specs, cloud-session prompts, recent worktree scrolls or proofs, the tuning ledgers' run lines for this situation, MEMORY.md's linked cloud-session notes, host-capability-check.js, new-worktree.mjs, the other worktrees' copies of these pages, and the Resource Footprint sections of Blender and the remaining Specialists.

## The Specialists: stubs and the quiet ones

SITUATION: the Specialists themselves, stubs and the ones gone quiet. Today is 2026-11-14.

HOW I READ. I read the first 60 lines in full for 11 pages: Ableton, AuK, CAD, Figure Rig, Lettering, SAO, Kokoro, Matplotlib, Mermaid, Whisper, Remotion. Manim got lines 24-60 and ffmpeg 40-60. For the other ~20 pages I saw only the Charter opening and grepped for code fences, command lines and speed words. Where I grepped, I say "(grep)". Run-line dates come from grepping every "Shop/<Name>/<Name> — tuning.md" for "- run ·".

KEY STRUCTURAL FACTS
- Charter sits at roughly lines 22-45, so (a) is nearly always yes on the first screen.
- "Job Contract" sits at lines ~78-120 on most pages (Obs Plot 83, Manim 98, Mermaid 72, SAO 81, Kokoro 89, Whisper 85, Remotion 78, ffmpeg 119). A reader's first screen shows no I/O contract.
- Only 5 Specialist pages have a code fence at all (grep for "^```"):
  - Ableton:54 — a real node command.
  - Lettering:50 — a schema, not a command.
  - Manim:165 — an install command.
  - LaTeX:127.
  - Kokoro:151.
- The LaTeX and Kokoro fences are not checked for content.
- So (b), a copy-pasteable make-something command, is yes only for Ableton Session Writer (Shop/Ableton Session Writer.md:54-58). I found none in any page's first 60 lines.

TABLE (a = learn what to call it for on the first screen; b = copy-pasteable make command; c = speed stated early; d = last ledger run line)
- Ableton Session Writer: a yes (:30); b YES (:54-58); c no; d none found.
- AuK (stub): a yes (:27); b no; c yes, "~15–25 s per call" (:46); d none found.
- CAD Drafter (stub): a yes (:27); b no; c yes, "under half a minute" (:53); d none found.
- Figure Rig: a yes (:31); b no, CLI flags are named but no command line (:43); c "25 minutes" is only in the frontmatter (:11); d none found.
- Lettering: a yes (:46); b no; c no; d none found.
- Stable Audio Open: a yes (:42-48); b no; c no. It gives a 120 s render cap, not generation speed. d 2026-11-14 (a probe, :52 of the ledger).
- Kokoro: a yes (:35); b no (fence at :151); c no; d 2026-05-26.
- Matplotlib: a yes (:24); b no; c no; d 2026-06-16 (smoke test, "nothing new").
- Mermaid: a yes (:24); b no; c "seconds" (~:59); d 2026-05-26.
- Whisper: a yes (:25); b no; c no, and it admits real-time is not its strength (:58); d 2026-05-26.
- Remotion: a yes (:24); b no; c vague, "ships fast", "slower than Manim for static" (:30, :55); d 2026-05-26.
- Manim CE: a yes (:37); b no (install fence at :165); c vague, "Slow but exact" (:43); d 2026-06-09.
- ffmpeg: a yes (:57); b no (grep); c not seen; d 2026-06-16.
- FLUX (HF): a yes, "~3 s" in the charter (:35); b no (grep); d none found.
- Depth Anything: a yes; c yes, "a few seconds" (:27); b no; d 2026-06-25.
- SAM (grep): a yes (:25); c "~seconds to tens of seconds" (:31); b no; d 2026-06-25.
- LaMa (grep): a yes (:26); b no; c not seen; d 2026-06-25.
- Blender (grep): a yes (:26); b no; c not seen; d 2026-06-13.
- ComfyUI (grep): a yes (:33); b no; c not seen; d 2026-05-26.
- Three.js (grep): a yes (:45); b no; c not seen; d 2026-05-31.
- Web Audio Worklet (grep): a yes (:38); b no; c not seen; d 2026-05-31.
- Tone.js, p5.js, D3.js, Observable Plot (grep): a yes (:25, :41, :30, :30); b no; c not seen. Last run lines are Tone 2026-06-16, p5 2026-06-16, D3 2026-06-16 and Plot 2026-06-16.
- LaTeX (stub): a yes (:33); b no; c not seen; d 2026-06-09 (probe).
- LightOnOCR-3 (stub): a yes (:25); b no; c not seen; d none found.
- Image-to-3D Smith (stub): a yes (:27); b no; c not seen; d none found.
- RNBO codebox~ smith (stub): a yes (:35); b no; c not seen; d none found.
- VCV Patch Generator: a yes (:47); b no; c not seen; d 2026-05-29.
- LoRA Trainer: a not read (its Charter heading is missing, its first heading is Job Contract at :43); b no; d none found.
- OBS: a yes, and it says it makes nothing unattended (:41); d 2026-09-02.
- Hero and Avatar Maker: a yes (:32); d 2026-11-08 (Shop/Hero and Avatar Maker/Hero and Avatar Maker — tuning.md:74).
  - That ledger line says three shapes FLUX would not draw were "built by hand".

Where a table cell says "none found", no "- run ·" line turned up. I did not confirm whether each ledger file exists.

RECENCY. About 17 of 32 Specialists have a last run line before 2026-07. Only these have one from September or later: SAO (11-14), Hero and Avatar (11-08), OBS (09-02), and the Shopkeeper's own ledger (11-07). The smoke-test lines of 2026-06-16 are all "nothing new". They tested the Specialist, not a making.

DOES ANYONE TEND QUIET SPECIALISTS?
- On paper, yes. Shop/Shopkeeper.md:94-101 gives the Shopkeeper roster currency, periodic test-suite runs, gotcha freshness and house plumbing. It owns "the quiet half" (:96).
- Its cadence is every other morning (:109).
- Its changes are proposals that wait for Loudon's review (:113).
- The Maintenance list says nothing about making a quiet Specialist faster to start, giving it a command, or prompting a first use.
- The Now zone of Shop/Shopkeeper/Shopkeeper — scroll.md:16-31 shows:
  - Plan: "none agreed yet" (:21).
  - Last run 2026-11-07, cycle 15 (:20, :29).
  - Last shipped: LightOnOCR-3 on the Roster and a Runpod runbook (:24).
  - "Left rough" is about LightOnOCR-3, three failed rentals (:41).
  - Nothing there mentions quiet or stale Specialists.
- Its twelve run lines are all 2026-11-03 to 11-07. Its ledger shows no test-suite run since the 2026-06 smoke tests. This is inferred from the "- run ·" lines only, not from the test-plan files.
- Inferred: the steward spent its recent cycles on discovery and Runpod work, not on tending existing Specialists.

SURPRISES
1. Four of the five stubs (AuK, CAD, LightOnOCR-3, Image-to-3D Smith) say "Not yet dispatched on a real brief". Each ends with a "First job" line (AuK:58-60, CAD:23). Nobody has run them. Probes are not recorded as run lines.
2. Ableton Session Writer is the only page with a command near the top. It is also the newest alive Specialist (2026-10-21) and has no run line.
3. Hero and Avatar's 2026-11-08 line records hand-built shapes (see the table above). That is the Shop's known gap, written into a ledger.
4. Many pages' only recent ledger activity is the Shop/Maker/run-tests.mjs smoke test, which is not a making.

NOT READ: the remaining ~20 pages' lines 1-60 in full; Job Contract, Tiers and Resource Footprint sections of most pages; ledger bodies (only the "- run ·" lines); any test-plan; whether each tuning file exists; the Kokoro, LaTeX and Lettering code fences; Frame Designer and the other skipped pages.

## What Loudon sees starting a making session

SITUATION: what Loudon sees when he starts a making session. All paths relative to the palace root.

1. Who chooses the tool, and when
- The Palace's docs name no human-facing moment. Maker.md says the Maker chooses the Specialist after intake and a tier talk: "Brief intake... Tradeoff conversation... Job spec... Execution" (Shop/Maker.md:61-66). It is reached only if Loudon (or an agent) brings the Maker a brief ("Loudon brings the Maker a brief", The Shop.md:65).
- Nothing tells him what words call the Maker up. Maker.md:51 says "Anything that isn't text... comes through me." That is a description, not a trigger phrase.
- In Enrichment, the Shop is invoked by the trigger "enrich [page]" (Enrichment.md:55; Palace Ceremonies.md:100). The agent running that ceremony then picks the tools.

2. What the chooser reads
- README - The Palace Guide.md has no mention of the Shop, the Maker, or making. I searched it, and its only "making" line sends readers to "Loud'n Live... where instruments get built" (README:53). Silence.
- CHILD.md § Ceremony Triggers: no trigger for making or the Shop. The grep for "Shop|Maker" found nothing. The only making-adjacent row is "enrich [page]", which points to Enrichment.
- Palace Ceremonies.md: the only Shop-bearing row is Enrichment (line 100). Light Enrichment has no row. Its frontmatter (Light Enrichment.md:1-31) has no `trigger:`, and its own open question asks "Does this page want a trigger of its own" (Light Enrichment.md:107).
- The Shop.md frontmatter is 57 lines, and the prose begins at line 59. The roster table is at lines 97-138, so it sits about 40 lines down after the prose. The roster has Specialist, Status, Medium and Tool columns. It has no "say this to get X" column. Selection Heuristics live a click further, in Maker.md:83+.
- The app: _ops/stigmergy/app/README.md has zero matches for Shop, Specialist or Maker. A grep of app/src finds "Shop" only in comments (TricksterDeck.jsx:210, RunCount.jsx:4, which refers to the Shopkeeper). There is no Shop surface in the app that I could find.

3. What Loudon would say, and where he would look
- The palace would teach him "enrich [page]" (Enrichment.md:55) or "proposal round". Light Enrichment has no trigger, so he asked for it in free prose (Light Enrichment.md:37, 45, 55, 97).
- To see what the Shop can do today, he would open The Shop.md and scan the roster (32 Specialists, 26 alive, 6 stub, lines 102-138). The Enrichment page's STIGMERGY box shows ceremony runs (Palace Ceremonies.md:105) but not Specialists.

4. How he has asked so far (Light Enrichment.md)
- 2026-11-10: "add an image, diagram or sound here and there" (line 37).
- 2026-11-11: read the page as a first-time reader (line 45).
- 2026-11-11: "We should encourage the light enrichment to use more of the shop, and of our projects" (line 97).
- Light Enrichment.md:99 records that the first round of 70 pieces reached into neither the Shop nor the projects: "The first round did neither." Its stated reason is that it is "slower than a script of one's own."
- Step 4 of the round says "Make it with a script that stays" (line 66). That is a spec step that tells the maker to write its own script. It names no Specialist. The forward_vector (line 30) says "I lean toward making those things with the Shop's Specialists", but the procedure does not.

5. Write-back
- Maker.md:67 says weird findings go to the Specialist's tuning ledger at delivery. For Light Enrichment, the record says lessons land in "Light Enrichment — Context" and the workshop (Light Enrichment.md:93). I did not read a Specialist ledger for any first-round piece. The record I read does not say whether any run line was written.

6. Shop availability (_tools/, .venvs, GPU, network)
- I did not check. The record I read does not say.

7. Surprises
- The Shop's door, the Maker, has no trigger phrase, while the Enrichment ceremony does and uses "the whole Shop". Yet its Light sibling, the one with the most making, has no trigger and a script-first step.
- The Shop.md "Lost Branches" section (line 154) says a hub entry was "found unnecessary because the Maker is the front door already." Meanwhile the root README, CHILD and the app never mention the Maker.
- The roster is generated, and the generated page (about 150 lines) is the first thing a human sees under "The Shop". It is a catalogue, not a menu of asks.

Not read: Shop/*/ tuning ledgers, the Light Enrichment — Context file, the Enrichment.md body beyond its grep hits, the _tools/.venvs/GPU state, Palace Ceremonies.md before line 84, the app's tests and the rest of its README, the Enrichment/light-round-2026-11/ files, Maker.md lines 1-50 and 115+.

## From the light round's own session — condensed by the catching session

The session "Light enrichment proposals" read the design draft and answered six questions on 2026-11-14. It made nothing for this. What follows is a condensation, not its words, except where quoted. Its full answer is in that session's transcript and in the catching session's.

**How the round really went.** No brief per piece existed for the seventy. The session wrote Loudon a list, one line each: page, sentence, and a medium word (sound, diagram, count, loop, sheet). It named a medium, never a tool. The main session made all seventy itself. The tool was fixed "at the first piece of the first ten, by me, without a decision": it opened `make-sounds.py` and wrote numpy, and every later sound inherited the helpers. `make-sounds-2.py` loads from the first, `-3` from the second. "After that the choice was made by import statements."

**Three things fix the tool, in order of force:** a script already in the workshop; the brief's "where the makers are" paragraph, which handed a dispatched maker the function to edit; and the first file a maker opens. The proposal list and the process page "had no force at all". The makers were told to read Light Enrichment whole, which leaned toward the Shop, "and it changed nothing, because the brief's concrete paths beat the page's direction."

**Nobody downstream asked about tools.** Seven challenger batches recomputed numbers. The Concierge placed, converted wav to m4a with afconvert, and never asked what made a piece.

**Where it would still go around the bench.**
- The second edit: after one `shop run`, fixes get made by running the bare script twenty times, and the provenance file then describes a run that did not make the file on disk. It asks for a hash of the output in the provenance, checked by `shop check`.
- A sound and its picture are drawn from the same arrays in one process. Two Specialists would split one act.
- Chains: a generated bed, then cut and shaped by hand. Provenance has to be a short chain, not one tool name.
- Small transformations on the way to the bundle (afconvert, a PIL downscale).
- Makers it spawns itself are plain agents, not the orchestrator's, so an orchestrator-injected menu misses them.
- Thirty "nothing new" lines from one batch: "I would stop using the wrapper for iteration within a day." One line per batch.

**What a jobs file must hold.** The script is the unit and a job is a function in it: page and anchor sentence; Specialist, script path, function, the script's git hash; one seed per piece; kept input data; for a generated source its prompt, seed, duration, model version and kept path; the chain; outputs as one group (wav, picture, trace); house rules and the values measured after saving; a claim line and a what-is-a-choice line; and "heard: by whom, when", empty on all sixteen today.

**What the hand's pages should carry.** For sound: the house numbers and the fade that avoids clicks; "measure the file you saved, not the array you built"; one seed per piece; two identical sources left and right are mono to the ear; a resonant filter boosts; a kept helper set "so the fourth maker doesn't write a fourth kick drum"; and a negative result, that filtered noise with sine blips does not read as a room. For SVG: the Drafting Table tokens as values; minimum text size at band width; escape `&` and `<`; which animation plays in the rich face; parse frontmatter with yaml; a count names its source and date.

**What the design gets wrong, in its view.**
- It aims at the moment before making. A menu at session start would have reached it once, days before it knew what it was making. The bench belongs in the workshop's first script and the brief template: a round's workshop born with a jobs-file skeleton and the menu in its README.
- The proposal stage is the cheapest place to choose. One more word per line, the Specialist, and Loudon would have seen "numpy" thirty times on day one.
- "Verifiability is the real reason I stayed with the hand, more than speed." A challenger can recompute a 440 Hz sine and cannot check a generated bed. Each card could say what can be measured about its output and what only an ear can judge.
- "Heard by" should be as automatic as "made with".
- Renaming the hand as Specialists risks being true on paper: all seventy would count as Shop work. The counts should split hand from not-hand, and comparisons should be planned, a few per round chosen at proposal time, "since a maker who never tried it has no expectation either way."
- `shop run` appending to a trunk ledger is a house write by a child's command. It thinks that is right, as the Regen button does it, and wants it said aloud as an exception.

**Offered as trial ground:** Pauline Oliveros's room, the Dub Lineage and Rick Rubin source material, and Rubin's voice. The hand version of each exists with its seed and picture, so each is a ready comparison.

**Its guesses, marked as such:** whether warm Stable Audio is fast enough inside a thirty-piece loop, whether SMIL plays everywhere in the rich face, and what a dispatched maker would do with a menu in its prompt.
