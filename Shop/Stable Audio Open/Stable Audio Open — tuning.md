---
title: "Stable Audio Open — tuning"
born: 2026-11-08
links:
  - target: "[[Stable Audio Open]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Stable Audio Open page's record of what generating sound has taught it: a line for every job, and a numbered item when a job or a re-check taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real render taught."
ledger: tuning
standards:
  for: "what generating sound with Stable Audio taught the Stable Audio Open page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of a model, a route or the model card"
  line: "- run · <date> · <brief or probe>, <model>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece, a monetized use, or a change to the pin"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Stable Audio Open — tuning

What each job taught the Stable Audio Open page. Each item names what the job showed and what changed because of it, if anything did. Newest last. Items 1 to 3 are the page's founding gotchas from the SA3 migration and the first job, the same day; the run line under them is the job the page's `last_tested` recorded. Items 4 to 6 came from outside a job, a Shopkeeper draft that re-checked the model card, landed in `94ac3e88`. All six moved here on 2026-11-08 when the page's Gotchas became present-tense rules. The 2026-05-30 smoke by existing-artifact check is on the page's Test Suite, not here.

## From the SA3 migration and the Kuramoto Round 1 beds — 2026-05-26 — small-music + small-sfx, Sketch

1. **SA3 had shipped ten days earlier, and the Specialist moved from `stable-audio-tools` (SAO 1.0) to `stable-audio-3`.** Loudon noticed the release mid-install and called the pivot. SA3 launched 2026-05-16 with a different library (a git checkout, not on PyPI), a different model family (`small-music`, `small-sfx`, and `medium`, which is CUDA-only), and a two-line API: `StableAudioModel.from_pretrained("small-music")`, then `model.generate(prompt=..., duration=...)`. On Mac, `git clone https://github.com/Stability-AI/stable-audio-3 _tools/stable-audio-3 && cd _tools/stable-audio-3 && uv sync` gave a working `.venv` with the `hf` CLI for HF auth, about 3 GB in all with weights cached at `~/.cache/huggingface/hub/`. On MPS a cold model load took about 75–80 s the first time each model loaded; after that, 0.8 s for a 6 s music clip and 2.1 s for a 20 s SFX clip on M-series. Changed: the page tracks SA3 and keeps its file name, so later Stability versions land on the same Specialist; and it holds the rule that a model family a few days old is checked for a newer one before installing.
2. **`small-music` and `small-sfx` are 433M-parameter siblings trained on different corpora.** small-music handled sustained pads, tonal content and instrumental textures cleanly; small-sfx handled scattered, textural, non-tonal content: ticks, beats, pulses, ambient SFX with structure. Both share the SAME-Small autoencoder, so small-music output could one day feed small-sfx for hybrid texture. `medium` is musically the strongest but needs CUDA. Changed: the Maker's selection heuristic routes melody, chord, pad or mood to small-music and effect, scatter, impact or texture to small-sfx; `medium` is out of scope on the Mac until Stability ships a CoreML variant.
3. **`flash_attn` warnings on Mac were expected, not errors.** Import printed `No module named 'flash_attn'` and `disabling Flash Attention`: the small models taking their non-flash path, which ran cleanly. Changed: ignore them on the small models; only `medium` needs flash-attn, and only on CUDA, from the pre-built wheels the SA3 README links.

- run · 2026-05-26 · Kuramoto Round 1 atmospheric beds and synchronization-arriving, small-music + small-sfx, sketch · taught items 1, 2, 3

## From the Shopkeeper's model-card re-check — 2026-09-25

The card is `stabilityai/stable-audio-3-small-music` on the Hub. Its "a few seconds on a MacBook Pro M4" agreed with the 2026-05-26 timings.

4. **SA3 supports inpainting: targeted edits and continuing a short recording,** exposed in `stable-audio-tools` as `generate_diffusion_cond_inpaint`. Untested by us. Changed: nothing yet; the page lists it as an untested capability.
5. **A second licence layer.** Besides the Stability AI Community License, the T5Gemma text encoder (`google/t5gemma-b-b-ul2`) is redistributed under the Gemma Terms of Use, use restrictions in §3.2 included, accepted at the gated download; commercial use points to https://stability.ai/license. Changed: it sharpened the open question on monetized Loudon Live use, progressed there on 2026-10-24 and still unanswered.
6. **Lighter routes exist:** `stabilityai/stable-audio-3-optimized` (Stability's own), MLX ports (`mlx-community/stable-audio-3-small-music`, `-small-sfx`), `Comfy-Org/stable-audio-3` for ComfyUI, and a community ONNX build (`lsb/stable-audio-3-small-music-onnx`). All were confirmed to exist; none has run here. Changed: nothing on the pin.

## From the Daily Page probe, arc or texture — 2026-11-14 — small-music + small-sfx, probe

Four matched pairs, an arc prompt and a steady twin on one model, seed and length (20 s), plus a practice pair outside the count and one 60 s render; played blind to Loudon and measured. Seeds, prompts and envelopes are in `Stable Audio Open/proofs/2026-11-14-arc-or-texture/report.json`. Four of the eight counted prompts were honored, and his ear matched the actual sound on all eight.

7. **small-sfx often drops an arc it is told about.** Rain asked to build into a heavy downpour came back flat within 0.5 dB (seed 41); pulses asked to pull together and lock into one rhythm, flat within about 3 dB (seed 23). The practice wind asked to grow into a storm did build, about 27 dB, then faded (seed 11), so it can; one seed each, so this is a tendency, not a law. Changed: a gotcha under Choosing a model, to build an arc around the render (crossfade a sparse render into a dense one, or filter and level automation after), and the Self-Check measures the envelope when a brief asks for a shape over time.
8. **small-music gives every clip an ending.** A pad and a drone asked to be static faded 35–40 dB by the end; the arc prompts came back as a swell and a fade; the 60 s render faded only in its last two seconds. Changed: a gotcha, to trim a steady bed before its fade or loop around it, and the Piece tier's post names it.
9. **The ~47 s ceiling was SAO 1.0's; SA3's small models go to 120 s, on CPU or MPS with no GPU.** A 60 s small-music render took 3.1 s warm, held together and, in Loudon's words, "even added a nice change in harmony". The SA3 README gives 120 s max for both small models, and `generate()` defaults to steps 8 and cfg 1.0 (`_tools/stable-audio-3/README.md:19-20`, `stable_audio_3/model.py:82-85`). Changed: the Charter, Capabilities, Limits, Tiers, Job Contract and Resource Footprint lost their SAO 1.0 figures (GPU, 12 GB, ~5 GB, ~50/~100 steps, cfg 6–7, the ~47 s ceiling).
10. **Inpainting and continuation live in SA3's own `generate()` and CLI, not in `stable-audio-tools`.** Item 4 named the old library. Still untested here. Changed: the Untested routes gotcha, and Iteration Character no longer says a generation cannot be extended.
11. **The first render of a session took 334 s**, against 75–80 s for the first load on 2026-05-26; warm renders took 1–3 s for 20 s. The cause of the longer warm-up was not looked into. Changed: the install gotcha budgets minutes for the first render.
12. **The Kuramoto recipe's arc is doubtful but not disproved.** Its nearest sibling here (item 7's pulses) came back flat. Measured the same day, `Kuramoto Coupling/synchronization-arriving.wav` rises about 8–10 dB after its first second and grows somewhat more regular by a rough autocorrelation reading (0.32 to 0.46, first quarter to last); whether it is heard as locking was not checked by ear. Changed: the recipe's note. Not changed: the caption on [[Kuramoto Coupling]]'s rich face, which still says the pulses "pull into a shared rhythm and lock together"; that is another page's.

- run · 2026-11-14 · arc or texture (Daily Page blind probe), small-music + small-sfx, probe · taught items 7–12

## From the Oliveros room comparison — 2026-11-14 — small-sfx, Sketch

Written by the session that made the comparison, not at a review. Loudon, 2026-11-14, on such lines: "flagged and reviewed later when we decide to update the specialist based on the ledger." Reviewed 2026-11-14 with the card check; each item says where it was carried.

13. **Every take came back mono.** Ten 26 s renders on small-sfx (two prompts, five seeds between them) each had left and right identical, correlation 1.00. The page's Capabilities say "WAV at 44.1 kHz stereo". Whether that is small-sfx, these prompts, or the default settings was not looked into. Paid 2026-11-14 in item 18's check: small-sfx mono held, small-music gave stereo; carried to Capabilities, Limits, a gotcha under Choosing a model, and the card.
14. **A count asked for in words was not held.** "One single drop falling into water every second" came back at about 40 to 69 onsets in 26 s over four seeds, by a rough detector that may count a drop and its ring as two. A sibling of item 7: a rate, like an arc, is a shape over time. Paid 2026-11-14: a gotcha under Choosing a model, and the recipe of item 16.
15. **Steady is a seed away, and choosing by measurement is cheap.** Four seeds of one room-tone prompt varied 1.2, 2.3, 5.0 and 9.0 dB across their quarters. The model loaded in 8 s and each render took 1.6 to 3.1 s, against item 11's 334 s first render the same morning. Paid 2026-11-14: a gotcha under Choosing a model (render four, keep the flattest); item 18 found loads of 8 to 9 s and a first render of 2 s, so the install gotcha now calls 334 s a one-off with no cause found.

- run · 2026-11-14 · Oliveros room, hand against Shop (`Shop/Maker/comparisons/2026-11-14-oliveros-room/`), small-sfx, sketch · taught items 13–15, reviewed 2026-11-14
- from Loudon · 2026-11-14 · on the Oliveros room pair: the Stable Audio side, "while not as good by my ear, rings \"truer\" to me and doesn't feel artificially collected"; "perhaps it is choosing to use stable to generate pieces that would be \"sampled\" and by hand for sounds that are clearly \"synthesized\"" · a candidate line for Best used for: sources that would otherwise be sampled, then cut and placed by hand · paid 2026-11-14 in the card's Best used for, Strengths and the recipe of item 16

## From the third Oliveros room — 2026-11-14 — small-sfx, Sketch

Written by the making session; reviewed 2026-11-14 with items 13–15.

16. **One thing at a time, then cut, is the use that held its measurements.** Asked for a single drop, a single call, a single pluck, each in a 4 to 8 s clip, small-sfx gave events that could be cut out and placed by hand: nine drips landed 1.27 s apart where the model alone gave 40 to 69 onsets in 26 s (item 14). Choosing a take by how sharply it starts picked a 0.06 s click for a bell; a ringing thing has to be chosen for its ring. Paid 2026-11-14: § Recipes, "generate one event, cut it, place it by hand", with Loudon's line, and the card's Best used for.
17. **Plain wording held a steady bed where a fuller one did not.** "Steady rain at a constant even intensity" came back within 0.3 to 3.5 dB across quarters over five seeds; "soft steady rain heard through an open window, constant level, no thunder, no change" varied 7 to 17 dB over four. One comparison, so a tendency. Paid 2026-11-14: a gotcha under Choosing a model.

- run · 2026-11-14 · the third Oliveros room, sources cut and placed by hand (`Shop/Maker/comparisons/2026-11-14-oliveros-room/third.py`), small-sfx, sketch · taught items 16–17, reviewed 2026-11-14
- from Loudon · 2026-11-14 · on the third Oliveros room: "This is the best of the group, hum is too loud and we need to see if we can generate variations with stable audio for the repeated sounds, but that is a question for the future, not to solve today." · the generate-one-cut-and-place recipe of item 16 has his ear behind it once; owed: a probe of variations for a repeated sound (other seeds, audio-to-audio, or cutting several events from one take), when he asks for it

## From the card check — 2026-11-14 — small-music + small-sfx, probe

Written by the session that reviewed items 13–17; owed a review.

18. **small-sfx gives mono; small-music gives stereo, and wider when asked.** Four 10 s renders, seed 7: small-music plain, left/right correlation 0.78 (side 9 dB under mid); small-music asked for "very wide stereo, sound moving left and right", 0.26 (side 2.3 dB under mid); small-sfx plain and asked for "wide stereo field, drops on the far left and far right", both 1.00. One seed each. The two models loaded in 9.1 and 7.9 s, and the first render took 2.2 s, so item 11's 334 s did not recur. Changed: Capabilities, Limits, a gotcha under Choosing a model, the install gotcha, and the card (`Stable Audio Open/proofs/2026-11-14-card-check/`).

- run · 2026-11-14 · card check, stereo by model (`proofs/2026-11-14-card-check/card-check.py`), small-music + small-sfx, probe · taught item 18
- run · 2026-11-14 · Hand against Shop — SUBSTRATE's bed and four of its cues (5 jobs: shop-bed, shop-step, shop-glass, shop-ground, shop-grains; `Shop/Maker/comparisons/2026-11-14-substrate-sounds/`), sketch · nothing new · by the bench
- from Loudon · 2026-11-15 · on the SUBSTRATE pairs (`Shop/Maker/comparisons/2026-11-14-substrate-sounds/`), heard on this page's scroll: "Bed, I didn't hear a crossfade in either. Step, the step reads as one(I'd be curious in the future, as we have said before to make 20 step variations and see how we could work with them in a "walk"). Glass reads as glass, OK, not perfect, but OK. The thud works, And the sand works. All the stable audio outputs are noisey and a little lo fidelity, the work you are building by hand is hyper clean and clinical and "fake" so we have an extreme range of "synthesized vs sampled" and over time the two will become closer and closer. I am happy we are doing this work and we can keep pusing forward. Clearly this is a great path as stable audio will keep getting better." · all five generated sounds read as what they are named; the lo-fi noise is the standing fault · a future probe, not owed now: twenty variations of one step, worked into a walk · owed a review
