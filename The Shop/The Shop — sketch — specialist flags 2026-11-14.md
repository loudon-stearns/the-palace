---
title: "The Shop — sketch — specialist flags 2026-11-14"
born: 2026-11-14
links:
  - target: "[[The Shop]]"
    type: connects-to
    label: "sketch-for"
  - target: "[[The Shop — baton]]"
    type: connects-to
    label: "evidence-for"
forward_vector: "I hold what the card drafters flagged on each Specialist's page on 2026-11-14, as the work list for fixing up the Shop; each flag is struck by the session that settles it, and when all are settled I go to the Archive."
---

# The Shop — what the card drafters flagged, 2026-11-14

When every Specialist got a card (stage 1 of [[The Shop — sketch — discovery design]]), eight readers read each page and its ledger whole and were asked to flag what a reviewer must know: a page that contradicts its ledger, a command that looks stale, a claim with no run behind it. These are their flags, as returned, with where each card's lines came from. They are readers' reports, not findings: open the file before acting on one.

Loudon, 2026-11-14: "lets make it our goal to fix up the shop as we go through this."

**Worked through the same day** by five sessions, one per group below and one for the Maker's pages (landed as `f77855c6`, `eefdf48b`, `a9958d53`, `cb1e5c73`, `00ea5bfc`). Each checked its flags against the files, tried the Run lines it could, and corrected its pages from evidence. This list is kept as the record of what was flagged, not as open work. What they left open is on each card's dated line, in each ledger's owed items, and gathered in [[The Shop — baton]].

The same pass showed three things that hold across the Shop, for every group:

- **The cards read as work histories.** "Best used for, so far" should open with the need in a few words (Stable Audio Open's does: "sound beds; sounds made to run filters or effects on"), then the evidence.
- **The cards are in mixed voice.** Some say "I", some "it". A Specialist's card is in its own first person.
- **About half the Run lines are not a command.** They say so and point at the nearest working example. A Run line is settled only by running it.

## Sound

### Stable Audio Open

- **Flags:** Page says WAV stereo (line 59); ledger item 13 found ten small-sfx takes mono, unreviewed. Items 13-17 and Loudon's 'sampled sounds' line owed a review. Page says alive. Last run line 2026-11-14 (third Oliveros room). Licence for monetized use unanswered.
- **Run, as drafted:** No make command on the page. Install: git clone https://github.com/Stability-AI/stable-audio-3 _tools/stable-audio-3 && cd _tools/stable-audio-3 && uv sync. Then StableAudioModel.from_pretrained("small-music"), model.generate(prompt=..., duration=...). Example: Kuramoto Coupling/atmospheric-beds-sa3.py.
- **Not yet shown, as drafted:** Arcs asked for in words (probe 2026-11-14, ledger 7, 12), a rate or count asked for in words (item 14), vocals, melody that resolves, inpainting and continuation, medium model, monetized-use licence.
- **Where the card's lines came from:** best: Shop/Stable Audio Open.md:44, 64, 148, tuning items 9, 16; not_yet: page:45, 137, tuning 7, 13-14; not_my: page:46-48; run: page:122-123, 144-150; speed: page:124, tuning 11; wears: page:28-29 frontmatter link only

### Kokoro

- **Flags:** Capabilities line 47 shows ARPABET override example that gotcha line 174 says garbles; page itself warns. Study default af_bella unverified (page:76). Tier timings beyond Sketch unrecorded. Last run line 2026-05-26 (smoke 2026-05-30 on page). Nothing recorded since.
- **Run, as drafted:** No ready command on the page. Install: python3.12 -m venv ~/.venvs/kokoro && ~/.venvs/kokoro/bin/pip install kokoro soundfile. Then run ~/.venvs/kokoro/bin/python <script>.py. Nearest example: Kuramoto Coupling/speech-rhythm-and-groove-narration-study.py.
- **Not yet shown, as drafted:** Piece tier never run. af_bella (Study default) not yet heard. De-ess signature, RNBO pronunciation, and one narrator across videos are open questions. Byte-determinism failed on 2026-05-30.
- **Where the card's lines came from:** best: Shop/Kokoro.md:185-187, ledger items 6-9; not_yet: page:76, 82-87, 193, 197-198; not_my: page:37, 61-64; run: page:151-156, 185; speed: page:70, 187; wears: page:23-25 link only

### Whisper

- **Flags:** Page line 157 gives an ARPABET-style Kokoro override (/k uw r ah.../) that Kokoro's page says garbles; do not copy. Claims of determinism and 0.3-1x GPU speed have no run here. Page says alive. Last run line 2026-05-26; smoke and determinism 2026-05-30 on page.
- **Run, as drafted:** whisper <wav> --model base --language en --word_timestamps True --output_format json (from Shop/Whisper.md recipe). No install command on the page.
- **Not yet shown, as drafted:** Never run on accented, noisy or real recorded speech. Sketch, Piece, large-v3, whisperx and diarization untried. Base mis-heard Kuramoto and entrains (ledger 1-2). Phone-recording and captioning recipes are listed as future.
- **Where the card's lines came from:** best: Shop/Whisper.md:167, ledger items 1-3; not_yet: page:155-157, 169, ledger 1-2; not_my: page:27, 58, 191; run: page:167; speed: page:167

### AuK

- **Flags:** Status is stub, not dispatched on a real brief (AuK.md:23). No tuning ledger exists, so no run line. No script or call code recorded; only endpoint and a quirk. Weights not pulled locally; Space queue could saturate.
- **Run, as drafted:** No command on the page yet. Endpoint is /run_generate_with_pe on the anonymous tencent/AuK Space; evidence files in Shop/Shopkeeper/probes/2026-09-12-auk/. With Prompt Enhancer off, gen_seconds must be above 0.
- **Not yet shown, as drafted:** Speaker identity after an edit (paper claim, never measured). Real or longer speech, enhancement and separation edits, AuK-Flash. Only a 2 s say clip tried (page Known gaps).
- **Where the card's lines came from:** best: Shop/AuK.md:31-37, probe-report.md:11-25; not_yet: AuK.md:50-52; not_my: AuK.md:27; run: AuK.md:45-46; speed: AuK.md:46, probe-report.md:15; host: AuK.md:56

### Ableton Session Writer

- **Flags:** No tuning ledger exists, so no run lines. Last recorded test 2026-10-21; the 2026-10-24 gotcha came from the Splice Instrument Forge. The writer lives under Shop/Shopkeeper/probes, not in the bundle. Page says the library Set is the next first job.
- **Run, as drafted:** From the palace root: node "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" plugin "<plugin folder>" [--recipe "<ride>.json"] [--out "<set>.als"] [--force]; or use library "<folder of .sfz>" in place of plugin.
- **Not yet shown, as drafted:** The library Set is unheard: whether Sampler loops sit where the SFZ said is untested by ear. Drum Rack, AU, macros and library clip recipes are not built. The -12 dB fader fix (2026-10-24) is not in the writer.
- **Where the card's lines came from:** best: Shop/Ableton Session Writer.md:42-43,143; not_yet: :122,126-131; refuses: :32; run: :55-57; speed: tests/test-plan.md:37; host: :139

### VCV Patch Generator

- **Flags:** The only run line is 2026-05-29. Status alive, but nothing recorded since; tuning item 5 is dated 2026-05-29 too. The page's 2026-10-24 note says step (1) happened. A registry or archetype change must land in both the JSON and the embedded copies in PDL Renderer.html. Page lists Node/Rack as needs, with no host-class statement.
- **Run, as drafted:** No make command on the page. Nearest working example: the recipes in Shop/VCV Patch Generator/recipes/, emitted through PDL Renderer.html. To judge candidate PDL: node "Shop/VCV Patch Generator/t6-oracle.js" t6-runs/<input>.candidates.txt
- **Not yet shown, as drafted:** Pads and chords come out monophonic; polyphony is not built. Noise-based hat and noise_hit are withheld. Headless audio render does not exist. Only 10 registry modules are covered. Attenuverter depth was zero on v0.1 (item 2).
- **Where the card's lines came from:** best: VCV Patch Generator.md:159-162, tuning.md:29-33,39, t6-runs/RUN-LOG.txt:9; not_yet: page:147,81,185-187; run: page:170; speed: page:90-91; host: page:131-137

### RNBO codebox~ smith

- **Flags:** Status is stub. No run line. The test plan is a TODO and does not exist. The host classes are my inference from Max being required, not stated on the page.
- **Run, as drafted:** No command on the page yet, and no recipe or proof script exists. The page names the rnbo-codebox skill as the operational core.
- **Not yet shown, as drafted:** Everything: no job, no export, no recipe, no test plan. Export-target divergence gotchas are anticipated but none are recorded. The tuning ledger is empty by its own statement.
- **Where the card's lines came from:** best: RNBO codebox~ smith.md:31,148; not_my_purpose: :37; run: :127,131; host: :113-119; ledger: tuning.md:23

## Interactive and web

### Tone.js

- **Flags:** Page Test Suite says last run 2026-05-30; ledger's only run line is 2026-06-16 (smoke, nothing new). The page also says the ledger's first item resolved an open question, marked on 2026-10-24. No real-job run line since 2026-05-26. Host classes are my inference from 'browser' plus CDN.
- **Run, as drafted:** No make command on the page; it is a CDN script (tone@15.0.4) in an HTML file. Nearest working example: Kuramoto Coupling/two-oscillators-coupling-explorer-audio.html. The page's smoke check is node --experimental-vm-modules Shop/Maker/web-smoke.mjs <html>, run from the palace root.
- **Not yet shown, as drafted:** Mobile audio unlock, iOS Safari, polyphony limits, Transport sequencing and any Piece tier are all marked community wisdom, not yet met on a job. No mobile test is recorded. The base artifact template is deferred.
- **Where the card's lines came from:** best: Shop/Tone.js.md:132, 138, ledger item 2; not_yet: Shop/Tone.js.md:123-128; refuse: :27; run: :132, :138; speed: :64-74; host: :105-112

### p5.js

- **Flags:** Last run line 2026-06-16 (smoke, nothing new). Page's Test Suite says last run 2026-05-30. The Maker routing answers on 2026-10-24 point incidental audio to p5.sound. Host classes are my inference from 'browser' plus CDN.
- **Run, as drafted:** No command on the page; it is a CDN script (p5@1.10.0) in a single HTML file. Nearest working example: Flocking/flocking-p5-expressive.html. Check it with node --experimental-vm-modules Shop/Maker/web-smoke.mjs <html> from the palace root.
- **Not yet shown, as drafted:** No Study or Piece tier has been run. The first canvas under-used its space (item 2, 2026-05-10), flagged for promotion only. Mobile and p5.sound are claimed in the charter, with no run recorded.
- **Where the card's lines came from:** best: Shop/p5.js.md:147-149, ledger items 1-4; not_yet: ledger item 2; refuse: Shop/p5.js.md:43; run: :147-149, :165; wears: :151-161; host: :124-131

### Three.js

- **Flags:** Page's Test Suite says 'Last run: never (stub)' yet status is alive and a 2026-05-31 job ran, so the page contradicts its ledger. Last run line 2026-05-31 (Wavetable Scanner, sketch). Never smoke-tested by the harness. Host classes are my inference.
- **Run, as drafted:** No command on the page; it is raw r128 from CDN in one HTML file (cdnjs three.min.js plus jsDelivr three@0.128.0 OrbitControls). Nearest working example: the Wavetable Scanner bundle in Projects/Wavetable Scanner/.
- **Not yet shown, as drafted:** Not yet met on a job: lost WebGL context on a backgrounded tab, and silent GLSL compile failures. R3F, the Study and Piece tiers, the Waveguide interface and GPU/mobile checks are unrun. No test plan exists.
- **Where the card's lines came from:** best: Shop/Three.js.md:153, ledger run line; not_yet: :147-149, :159, :155; refuse: :47; run: :138-139, :153; wears: :84, :153; host: :124-131

### D3.js

- **Flags:** Last run line 2026-06-16 (smoke, nothing new); ledger says seeded items carry no run lines. Page's Test Suite says last run 2026-05-30. The page says 'runs in any browser; nothing to install', so the sandbox class is my reading.
- **Run, as drafted:** No command on the page; it is d3@7 from CDN in one HTML file. Nearest working example: Flocking/flocking-d3-interactive-control.html. Check it with node --experimental-vm-modules Shop/Maker/web-smoke.mjs <html> from the palace root.
- **Not yet shown, as drafted:** d3-force was used as a tick driver, not for graph relaxation, its real strength. The watch-list gotchas are not yet hit. No Study or Piece (keyboard and ARIA) has run. Item 5's harness note was last checked May 2026.
- **Where the card's lines came from:** best: Shop/D3.js.md:137, ledger items 1-5; not_yet: :127-133, :168; refuse: :32; run: :137, :153; wears: :139-149; host: :114

### Observable Plot

- **Flags:** Last run line 2026-06-16 (smoke on mac), but the page and test plan say the last smoke was 2026-05-30. The Forward Vector lists palace-plot-defaults.js as next, though it already exists. Host classes beyond Mac are not stated on the page.
- **Run, as drafted:** No make command on the page. Nearest working example: open Flocking/flocking-observable-plot-graphite.html. Smoke, from the palace root: node --experimental-vm-modules Shop/Maker/web-smoke.mjs Flocking/flocking-observable-plot-graphite.html
- **Not yet shown, as drafted:** No Study-tier or published Piece job. The 3x N separation/alignment/cohesion grid and the Vicsek run are still hopes. Thin animation by design. Nothing recorded as failed beyond the d3 load-order trap (ledger item 1).
- **Where the card's lines came from:** best: Shop/Observable Plot.md:145-147, Observable Plot/tests/test-plan.md:26-34; not_yet: Shop/Observable Plot.md:176, :61, :130; refuses: :32; run: test-plan.md:18; speed: test-plan.md:53; wears: .md:147-157

### Web Audio Worklet

- **Flags:** Last run line is 2026-05-31 (the Wavetable Scanner). The page's Test Suite names 2026-05-30 and has no test plan (TODO). Status alive, but both runs are Sketch tier with no browser audition recorded. Host classes are my reading: the page says the audio thread cannot run in the sandbox, so make works there but a sound check does not.
- **Run, as drafted:** No command on the page yet. Nearest working example: Projects/Murmuration/Murmuration.html, which is a built HTML file. The page shows a Blob-URL loading pattern, but no make command.
- **Not yet shown, as drafted:** In-browser audible confirmation of Murmuration is left to whoever opens it first. Firefox and Safari, mobile, the voice ceiling, flock-as-distribution and predator-startle are not done. The RNBO crossover test is untried.
- **Where the card's lines came from:** best: Web Audio Worklet.md:148-150, tuning.md:25-42; not_yet: page:150,175; refuses: page:40; run: page:148; host: page:113-120

## Image and 3D

### ComfyUI

- **Flags:** Page header claims tool_version 0.3.x but the install manifest pins 0.22.0. Tier times assume a 24GB GPU and are not measured. Page says 'GPU required' yet the only run was on Apple MPS. The page's Test Suite line was last run 2026-05-30 and the driver's own prerequisite line launches without the MPS flags. Last run line: 2026-05-26.
- **Run, as drafted:** With the server up, from the palace root: python 'Kuramoto Coupling/fireflies-pond-render.py'. Launch the server first: _tools/ComfyUI/venv/bin/python _tools/ComfyUI/main.py --highvram --use-split-cross-attention.
- **Not yet shown, as drafted:** Study and Piece tiers, IP-Adapter, Flux Dev, LoRA use and byte-identical reruns are claimed but have no run. Fireflies-over-water may need ControlNet. Live re-render of 2026-05-30 was deferred.
- **Where the card's lines came from:** best: Shop/ComfyUI.md:191, tuning items 1-3; not_yet: ComfyUI.md:199, 209; not_my: ComfyUI.md:35; run: fireflies-pond-render.py:17-18, local-install.md:38; speed: ComfyUI.md:191, tuning:33; host: ComfyUI.md:155-159

### FLUX (Hugging Face)

- **Flags:** The pin is a generation behind (tuning item 4). 'Free' and 3 s rest on one run. The Space path ignores the seed unless randomize_seed is false. The license is non-commercial. No generic command on the page; the nearest is a fixed-brief driver. No 'run' lines in the ledger (seeded history). Last run line: no run line (last recorded job 2026-05-30).
- **Run, as drafted:** From the palace root, with the kokoro venv and a cached HF token: python 'Shop/Maker/comparisons/2026-05-30-shop-header/render_flux.py'. The prompt, seed and size are fixed in that file; copy it for new briefs.
- **Not yet shown, as drafted:** Byte-identical determinism was never checked. Study and Piece sweeps have no run. FLUX 3 Klein is untested, and Krea-dev has not run since 2026-05-30 (item 4). Stylised registers are untried.
- **Where the card's lines came from:** best: Shop/FLUX (Hugging Face).md:175, tuning item 3; not_yet: FLUX.md:181, tuning item 4; not_my: FLUX.md:37; run: render_flux.py:13-16, 54-65; speed: FLUX.md:175, 55-57; host: FLUX.md:139-157

### Lettering

- **Flags:** No ledger and no run lines. Status says alive, but the page lists no dated runs. Run command is unverified and may need arguments. The Bench path and render_text.py exist; arguments not read. The balloon bench is mentioned but separate. Last run line: no run line.
- **Run, as drafted:** From the page's Bench: <comfy venv>/python render_text.py, run in Projects/BLUELINE/proofs/text-layer/. It re-renders and rebuilds contact-sheet.html. No tier or word argument is documented.
- **Not yet shown, as drafted:** Named recipes are only a hope. Long legible text, a vector letterer, a visual legibility judge and full placement are all future. Placement is proven in one mode only (anchor in Blender, 2026-07-01).
- **Where the card's lines came from:** best: Shop/Lettering.md:9, 42, plates folder; not_yet: Lettering.md:83-89; not_my: Lettering.md:42, 73; run: Lettering.md:81; speed: Lettering.md:77; host: Lettering.md:6-7, 77

### LoRA Trainer

- **Flags:** No ledger and no run lines; the 'first-try' claim rests on prose only. The DINO 0.776 corgi control is an old figure with no date. The recipe is steps, not a command. Page does not state what it refuses. Last run line: no run line.
- **Run, as drafted:** No single command on the page. Recipe is pod, install, train, reap. Nearest examples: Projects/BLUELINE/proofs/track-II-lora/run_flux.sh and run_sdxl.sh, graded with grade_render.py.
- **Not yet shown, as drafted:** The r4ng3r LoRA graded DINO 0.317, below baseline. A rebuilt dataset, the SDXL-to-FLUX base-swap question and whether the Study tier ever beats Piece are all unanswered. No run date is recorded.
- **Where the card's lines came from:** best: Shop/LoRA Trainer.md:34, 75; not_yet: LoRA Trainer.md:73-75, 87-89; not_my: none; run: LoRA Trainer.md:50-52; speed: LoRA Trainer.md:79; host: LoRA Trainer.md:45, 79

### Blender

- **Flags:** Last run line 2026-06-13 (single job; ledger also has a 2026-07-03 item 10 from memory, not a run). Page and test plan say Blender runs on the Mac, and the run command is a Homebrew path. The page has no run command; I took it from test-plan and script header. The toyxyz rig was not acquired; a bespoke script stands in.
- **Run, as drafted:** /opt/homebrew/bin/blender --background --python pose_and_emit.py, run from Shop/Blender/tests/blocking/. It writes rgb, depth, normal, keypoints and a .blend. The draw_passes.py and run_comfy.py steps follow, with no command given.
- **Not yet shown, as drafted:** Offline Cycles Piece render and geometry-nodes math worlds are unexercised. A ControlNet-Union arm is still owed (ledger item 4). Mixamo locomotion, pose blending and environment kits are listed but no run shows them.
- **Where the card's lines came from:** best: Shop/Blender.md:128, ledger 1-9; not_yet: Shop/Blender.md:10, tuning.md:30; not_my: Shop/Blender.md:30,61; run: tests/test-plan.md:24, pose_and_emit.py:6; speed: Shop/Blender.md:149; checked: Shop/Blender.md:102

### Figure Rig

- **Flags:** No tuning ledger exists and no run line. The only dated test is last_tested 2026-06-30. Page line 68 says no finger keypoints, but line 69 and 75 say hands shipped 2026-06-30. The page cites hands_rig.py and others but I did not check the scripts exist. The page does not say where it runs from.
- **Run, as drafted:** No command on the page yet. It names flags (--pose A/B/C, --pose-json, --gender --age --muscle --weight --height) for pose_rig_mpfb_v3.py, but no full line. Scripts are in Projects/BLUELINE/proofs/blender-handdrawn/followups/rig-openpose/.
- **Not yet shown, as drafted:** Face keypoints are synthesized from the head bone, and draw_facepose is not built. Hands-with-objects A/B and the many-people tiers are pending or next. The pose library and a one-pass Blender OpenPose draw are not built.
- **Where the card's lines came from:** best: Shop/Figure Rig.md:45,75; not_yet: Shop/Figure Rig.md:68-77; not_my: Shop/Figure Rig.md:70; run: Shop/Figure Rig.md:43,83; speed: Shop/Figure Rig.md:71

### Image-to-3D Smith

- **Flags:** Status stub; no run line and no ledger. The probe folder was not opened. The table lists Hi3DGen's Blender hand-off as the Study tier but only the probe is recorded. Hunyuan3D-2 output grew from 77K to 135K verts between probes. Anonymous ZeroGPU quota can run out; Piece needs a token or the Mac.
- **Run, as drafted:** No command on the page yet. Nearest working example is the probe folder Shop/Shopkeeper/probes/2026-06-23-image-to-3d-shootout/. The page gives HF Space IDs and TRELLIS.2 API steps, not a command.
- **Not yet shown, as drafted:** No real job has run, so the stub status stands. Texture generation was never run; the Piece chain through Blender and FLUX is unproven. Open questions: the first job and whether TripoSplat gets its own page.
- **Where the card's lines came from:** best: Shop/Image-to-3D Smith.md:23,63; not_yet: :23,90-93; not_my: :69,16; run: :63; speed: :31-33,82-86; host: :69-73,80-86

### Depth Anything

- **Flags:** Status alive, born 2026-06, and the only run line is 2026-06-25 (one job). Install and make commands are absent, only a recipe. The ledger notes it cannot say which gotchas that session hit versus knew beforehand. Last run line: 2026-06-25.
- **Run, as drafted:** No command on the page yet. The Recipe names the pipeline only: transformers, depth-anything/Depth-Anything-V2-Small-hf, on MPS. Resize long edge to ~1024, normalize to 0-255, save PNG. No proof script path is given.
- **Not yet shown, as drafted:** Nothing recorded as failed beyond the three founding gotchas: same-depth objects share a band, no hidden geometry, soft band edges (ledger items 1-3). Only one job so far; photos and renders are claimed, not run.
- **Where the card's lines came from:** best: Shop/Depth Anything.md:35-39, ledger run line :30; not_yet: Shop/Depth Anything.md:41-47, ledger items 1-3; not_my: .md:45-46; run: .md:49-51; speed: .md:27,33; hands_on: .md:29-33

### LaMa

- **Flags:** Status alive, born 2026-06; only run line is 2026-06-25 (one job). No make command beyond a Python snippet; no install line. The page's own link to Pauline Oliveros as a contradiction (fill the silence vs listen to it) has no run behind it. Last run line: 2026-06-25.
- **Run, as drafted:** From the page's Recipe, in Python: from simple_lama_inpainting import SimpleLama; SimpleLama()(image, mask). Mask is the foreground silhouette dilated ~5-10px. No script path or install command is given.
- **Not yet shown, as drafted:** Nothing recorded as failed beyond the founding gotchas: I paint plausible texture, not the true occluded shape; a leaky or tight mask ruins the plate; very large holes drift (ledger items 1-3). Only one job so far.
- **Where the card's lines came from:** best: Shop/LaMa.md:34-37, ledger run line :30; not_yet: Shop/LaMa.md:39-45, ledger items 1-3; not_my: .md:43; run: .md:47-49; speed: .md:32; hands_on: .md:28-31,44

### SAM

- **Flags:** Status alive, born 2026-06; only run line is 2026-06-25 (one session). The ControlNet conversion step the page depends on is not described here, so the full recipe is not a single paste. The ledger says it does not claim which run showed each Gotcha. Last run line: 2026-06-25.
- **Run, as drafted:** No command on the page yet. The Recipe names only ultralytics SAM, with mobile_sam.pt for auto and sam_b.pt for prompted, after converting the drawing to flat cel with a canny ControlNet. No script path is given.
- **Not yet shown, as drafted:** On line art I failed: on BLUELINE shot 02 I never isolated the car and over-segmented into fragments (ledger item 1). Thin or glassy objects and busy auto-mode scenes are claimed to fail on the page; no run is recorded for them.
- **Where the card's lines came from:** best: Shop/SAM.md:33-36, ledger item 2 and run line :30; not_yet: Shop/SAM.md:35,43-44, ledger item 1; not_my: .md:25,35,45; run: .md:47-49; speed: .md:31; hands_on: .md:27-29,45

## Motion, documents and plumbing

### Manim CE

- **Flags:** Sandbox install is impossible (page line 174). Tier time ranges on the page (e.g. Study 2-10 min) disagree with measured 11 s. Run line given for tex-env only; no plain make command stated. Last run line: 2026-06-09 (MathTex probe). Last real render 2026-05-30.
- **Run, as drafted:** Shop/Maker/tex-env.sh manim -ql scene.py Scene (run from the folder holding scene.py; the tex-env.sh wrapper is only needed for MathTex). Bare 'manim -pqm scene.py Scene' is implied by the tier flags, not given as a recipe.
- **Not yet shown, as drafted:** manim-voiceover was never used; narration was muxed instead (item 7). Watch-list claims (Transform artifacts, Whisper drift past 3 min, 3D cameras) are untested. Page Tiers blocks have not taken the measured times in (item 9).
- **Where the card's lines came from:** best: Shop/Manim CE.md:209-221, tuning items 3-9; not_yet: Manim CE.md:198-203, tuning 7, 9; not_mine: Manim CE.md:39; run: Manim CE.md:189; speed: Manim CE.md:195, 231; hosts: Manim CE.md:163-174

### Remotion

- **Flags:** Page Test Suite (2026-05-30) was a smoke by existing-artifact check; no live re-render. Study estimate (about 30 s per second) is far above the measured 25 s for 16 s. Sandbox use not stated. Palette matched the Kuramoto arc, not the design system. Last run line: 2026-05-26. Commercial use needs a paid license.
- **Run, as drafted:** npx remotion render PhenomenaWalk ../phenomena-walk.mp4 --codec h264 --crf 20 (run inside the Remotion project root, Kuramoto Coupling/phenomena-walk/).
- **Not yet shown, as drafted:** Audio sync via Audio and Sequence is untested (the walk had no audio). Piece tier, Lambda, 4K and live byte-determinism were never run (page says determinism is documented, not asserted). Palace navigation walkthrough, the stated first job, has not been done.
- **Where the card's lines came from:** best: Shop/Remotion.md:126-128, tuning items 1-2; not_yet: Remotion.md:128, 132, 146; not_mine: Remotion.md:26; run: Remotion.md:128; speed: Remotion.md:128, 69; hosts: Remotion.md:105-112

### OBS

- **Flags:** Operated, not dispatched; page says Tiers N/A, so no make-on-request. Hosts are my inference (Application Capture of Ableton implies the Mac). Run command not verified: I did not open Projects/LDN RTM/obs/. Last run line: 2026-09-02.
- **Run, as drafted:** No command on the page yet. Nearest working example: the levels script and socket tooling in Projects/LDN RTM/obs/ (named in tuning item 5, not read for this card).
- **Not yet shown, as drafted:** The whole streaming half is read from the protocol, not tried: no broadcast, no dropped-frame sampling, no stream scars. Page says the first real stream is the test. Whether it is motion or plumbing is also unsettled.
- **Where the card's lines came from:** best: Shop/OBS.md:35-41, 103; tuning items 1-5; not_yet: OBS.md:103, 128-131; not_mine: OBS.md:41, 71-73; run: none (tuning item 5 names Projects/LDN RTM/obs/); hosts: inferred from OBS.md:113

### ffmpeg

- **Flags:** Sandbox class is my reading of the page's claim that it runs anywhere a binary will; the only recorded runs are on the Mac. Last ledger run line: 2026-06-16 (harness smoke, nothing new). Page 'last_tested' 2026-05-30 smoke and determinism pass. The speed claims on the page are estimates.
- **Run, as drafted:** ffmpeg -i silent.mp4 -i narration.wav -c:v copy -c:a aac -shortest out.mp4 (the mux template, Shop/ffmpeg.md:214; run where the files are). The reel script is Kuramoto Coupling/round-1-teaching-reel.py.
- **Not yet shown, as drafted:** HEVC re-encode is marked unverified. The community-wisdom list (mismatched concat, aac bitrate cap, fps_mode, hardware encode) has not met a job. No loudnorm or two-pass Piece run is recorded.
- **Where the card's lines came from:** best: Shop/ffmpeg.md:199-201, tuning items 1-3; not_yet: ffmpeg.md:189-195, 209; not_mine: ffmpeg.md:59, 94; run: ffmpeg.md:214; hosts: ffmpeg.md:165-174

### Matplotlib

- **Flags:** Last run line 2026-06-16 (smoke on mac, nothing new). The Forward Vector (Bode plot as first job) is stale; the real first job was motion. Sandbox class is inferred from ledger item 1, not stated as a footprint.
- **Run, as drafted:** No command on the page yet. Nearest examples: the Sketch script Kuramoto Coupling/two-phasors-uncoupled-matplotlib.py, and a savefig smoke snippet in Shop/Matplotlib/tests/test-plan.md lines 17-24. Needs matplotlib installed.
- **Not yet shown, as drafted:** Multi-panel publication chart and standalone phase diagram are marked unverified (test plan, 2026-05-30). No palace.mplstyle wrapper exists. The Bode-plot job the Forward Vector names has not run. Output is flatter than Manim's.
- **Where the card's lines came from:** best: Shop/Matplotlib.md:125, Matplotlib — tuning.md items 1-3; not_yet: .md:131, test-plan.md:35-37; refuses: .md:26; run: test-plan.md:17-24; speed: test-plan.md:58; checked: .md:100, :131; wears: .md:131

### Mermaid

- **Flags:** Last run line 2026-05-26 (the Kuramoto Sketch); the 2026-05-30 npx smoke is on the page, not a run line. Page says mmdc is not globally installed. Forward Vector is stale. Only Mac was exercised.
- **Run, as drafted:** From any folder: npx -y -p @mermaid-js/mermaid-cli mmdc -i diagram.mmd -o diagram.svg. Sketch needs none of this: put a fenced mermaid block in the entry.
- **Not yet shown, as drafted:** No Study or Piece job. The --cssFile house wrapper and base themeVariables object are unbuilt. Determinism was not byte-checked (2026-05-30). The Forward Vector's brief-intake flowchart has not run.
- **Where the card's lines came from:** best: Shop/Mermaid.md:110, Mermaid — tuning.md items 1-2; not_yet: .md:114, :118, :127; refuses: .md:26; run: Mermaid/tests/test-plan.md:19-20; speed: .md:114, test-plan.md:58-59; wears: .md:114

### LaTeX

- **Flags:** Status is stub. Last run line 2026-06-09 (a capability probe, not a brief). The test plan file Shop/LaTeX/tests/test-plan.md is marked TODO and Glob found none. Tested on Mac only.
- **Run, as drafted:** No command on the page yet. For a cutout, run any latex-to-dvisvgm command through Shop/Maker/tex-env.sh from the palace root: Shop/Maker/tex-env.sh <cmd>. The PDF path needs only pdflatex or latexmk.
- **Not yet shown, as drafted:** No palace brief has run; the page is a stub. The fontspec/xelatex Loudon Live stack, SOURCE_DATE_EPOCH determinism, pdf2svg and the palace.sty preamble are all untested. The SVG cutout fails bare (ledger item 1).
- **Where the card's lines came from:** best: Shop/LaTeX.md:140, :146; not_yet: .md:133-135, :146, :150; refuses: .md:35; run: .md:126, :123; speed: .md:62; checked: .md:107; hands_on: .md:57, :87-99

### CAD Drafter

- **Flags:** Status stub; no run line and no ledger. Test plan last run 2026-10-20. The page says a probe does not promote it. The page says tests live in Shop/CAD Drafter/tests, and the run path assumes the venv sits at the worktree root. Sandbox reachability is untested. The probe folder was not opened.
- **Run, as drafted:** ../../../../.venvs/cad/bin/python build.py, run from Shop/Shopkeeper/probes/2026-10-20-cad/. It passes if the last line reads 24/24 checks.
- **Not yet shown, as drafted:** The prismatic mount block is untried. No GD&T, assemblies or bill of materials. No SVG was printed and measured. A fit was never confirmed. Edge cases (zero clearance, overflowing views) are untried. Not dispatched on a real brief.
- **Where the card's lines came from:** best: Shop/CAD Drafter.md:23,37-46; not_yet: :56-60; not_my: :29; run: tests/test-plan.md:16; speed: test-plan.md:38; wears: :46; host: :91

### LightOnOCR-3

- **Flags:** Status is stub, not alive: one real run (2026-11-04), never dispatched on a real brief. No tuning ledger and no '- run ·' line. Capabilities rest on probes of clean renders only. Page's job contract is marked draft. Last run line: no run line (probe 2026-11-04).
- **Run, as drafted:** No command on the page yet. The working runner is Shop/Shopkeeper/probes/lightonocr-3/lightonocr_pod.py, but the page gives no invocation. Recipe and traps are in RunPod GPU Backend — runbook.
- **Not yet shown, as drafted:** Untested: phone photos, skewed scans, low light, handwriting, dense multi-column PDFs, math, non-English, charts and image blocks, and the 4B model. Three rentals failed on 2026-11-04 before the working run.
- **Where the card's lines came from:** best: Shop/LightOnOCR-3.md:21,29-35; not_yet: .md:47-56; not_my: .md:25,39; run: .md:35,43; speed: .md:35,43,60; hands_on: .md:39; host: .md:60

## The Maker and the Shop's own pages

From the walk's reader of the Maker's dispatch ([[The Shop — sketch — discovery walk 2026-11-14]] § The Maker's own dispatch) and the Concierge's gather the same day:

- `Shop/Maker.md` § Selection Heuristics says raw Web Audio is "not a Specialist… considered and rejected" (about line 116) and, ten lines on, routes to [[Web Audio Worklet]], a rostered Specialist.
- The same section sends custom sample-accurate DSP in the browser to the RNBO web export, which it calls unproven, and also to Web Audio Worklet.
- It routes to Graphviz, Plotly and an HTML/React Artifact Smith. None has a page.
- Fourteen Specialists have no route: Depth Anything, Figure Rig, LaMa, Lettering, LoRA Trainer, OBS, SAM, AuK, Image-to-3D Smith, LightOnOCR-3, VCV Patch Generator, and Whisper, ffmpeg and Stable Audio Open, which appear only inside pipelines. "I need a sound effect or a music bed" has no answer.
- The Maker's ledger has no run line; its Test Suite says "Last run: never"; its last Recipe is 2026-06-19.
- `Shop/Maker/Maker — Context.md` says the Maker "has no tuning ledger"; one was seeded 2026-11-07. It also says the test plan is a TODO.
- `Shop/Maker.md` carries a stale comment about a "Phase 2" near line 42.
- `The Shop/The Shop — Context.md` line 50 says a roster of 31; it is 32.
- `Shop/Maker/host-capability.json` still carries the deprecated Midjourney row.
