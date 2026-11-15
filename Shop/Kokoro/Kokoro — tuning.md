---
title: "Kokoro — tuning"
born: 2026-11-08
links:
  - target: "[[Kokoro]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Kokoro page's record of what speaking text has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real narration taught."
ledger: tuning
standards:
  for: "what narrating with Kokoro taught the Kokoro page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the tool itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the pinned version"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Kokoro — tuning

What each job taught the Kokoro page. Each item names what the job showed and what changed because of it, if anything did. Newest last. The nine items are the page's dated gotchas, moved here on 2026-11-08 when the page's Gotchas became present-tense rules; seeded history carries no run lines, as FLUX's doesn't, except the 2026-05-26 line, the date the page's `last_tested` kept.

## From the first job — 2026-05-10 — speech rhythm and groove narration, Sketch tier

1. **The install failed on Python 3.13:** Kokoro's transitive deps reach `spacy → thinc → blis`, and the `blis` wheel build fails there with clang errors during the native compile. Python 3.12 has prebuilt wheels for the whole tree. Changed: a per-Specialist venv on Python 3.12 (§ Install).
2. **Voice IDs were checked against the catalog:** `af_heart` (the Sketch default, the README's warm default), `af_bella` (Study; in the catalog, not yet tested at that tier), `af_nicole`, and the rest of the published catalog as of `kokoro` 0.9.4. There is no `af_default`. Changed: the tier defaults name real IDs.
3. **Output is 24 kHz mono natively and is not configurable below.** Changed: when 16 kHz is genuinely needed for video sync, resample with `ffmpeg -ar 16000` in the Maker's delivery pipeline, not inside Kokoro.
4. **The API surface is `KPipeline`, not a CLI.** `KPipeline(lang_code='a')(text, voice=..., speed=...)` is a generator yielding `(graphemes, phonemes, audio)` per chunk. Changed: the Maker dispatches a small Python script that imports `KPipeline` and concatenates the per-chunk audio, with optional inter-sentence silence, before writing the WAV.
5. **Audio comes back as `numpy.ndarray` or `torch.Tensor` depending on the version.** Changed: convert defensively, `audio.detach().cpu().numpy() if hasattr(audio, 'detach') else np.asarray(audio)`; `speech-rhythm-and-groove-narration.py` holds the working pattern.

## From the Study re-render — 2026-05-26 — speech rhythm and groove narration, Study tier

6. **misaki's phoneme overrides are IPA, not ARPABET.** Kokoro 0.9.4 ships the misaki G2P front-end; the page's `[word](/HH AH/)` example reads as ARPABET, but misaki's language is IPA-like (`ə`, `ɹ`, `ʌ`, `ɛ`, stress `ˈ` `ˌ`, plus shorthand `O` for /oʊ/ and `A` for /eɪ/). Passing ARPABET, as in `[word](/K UH R AH M OW T OW/)`, left the string in the phoneme stream literally, and Kokoro tried to voice the spelled-out letters: garbled audio. Changed: pass real IPA. The working Kuramoto override is `[Kuramoto](/kˌuɹəmˈOtO/)`; probe any unfamiliar word with `from misaki import en; en.G2P()(word)[0]`.
7. **A bare variable letter in prose ran into the next word.** "The coupling constant K is phrasing density" read K into "is" without a breath. Loudon, at the first sync-arriving review: *"whenever you have a voiceover that includes a variable like K, more pause is needed before the variable name for it to sound like natural speech."* Changed: commas around the letter ("The coupling constant, K, is…") give misaki a prosody boundary on each side; em-dashes (`-- K --`) work too but read less naturally. The fix lives in the input text, not in phoneme overrides.
8. **`pyloudnorm` alone could not hit the Study spec.** Raw output (af_heart, 24 kHz mono, default speed) lands near −25.6 LUFS with a crest factor high enough that gaining up to −16 LUFS pushes peaks above −1 dBTP; `pyloudnorm` only shifts gain, so its true-peak clamp pulled the result back to ≈−22 LUFS, a `spec_miss`. Changed: two-pass ffmpeg `loudnorm` — pass 1 measures `input_i / input_tp / input_lra / input_thresh / target_offset`, pass 2 applies them as `measured_*` with `linear=true`. Its built-in true-peak limiter lands within ~0.1 LUFS of target while holding TP ≤ −1 dBTP. Reference: `Kuramoto Coupling/speech-rhythm-and-groove-narration-study.py`.
9. **The Self-Check's `spec_miss` outside ±0.5 LUFS was verified for the first time.** The first Study render landed at −22.36 LUFS (single-pass `pyloudnorm` at the TP clamp) and the script returned `status: spec_miss` correctly. Changed: the assertion is verified, and the check gains a ~0.1 dB rounding tolerance on the true-peak ceiling so a delivered TP printed as exactly `-1.00 dBTP` is not flagged when the underlying value sits microscopically above it.
- run · 2026-05-26 · speech rhythm and groove narration, study · taught items 6, 7, 8, 9

## From the card check — 2026-11-14 — af_bella, Study, probe

Written by the session fixing the card; owed a review.

10. **A bare `en.G2P()` is no probe for a rare word.** Item 6's way to get canonical phonemes, `from misaki import en; en.G2P()(word)[0]`, returned `❓` for Kuramoto: without a fallback it has nothing for words outside its lexicon, which are the words an override is for. `KPipeline` yields the phonemes it actually used, per chunk. The same check found RNBO read letter by letter (`ˌɑɹˌɛnbˌiˈO`), and af_bella, the Study default, rendering cleanly to −16.0 LUFS, −1.0 dBTP (not yet heard). Changed: the pronunciation gotcha, the RNBO open question, the Study tier, and the Capabilities example, which was ARPABET (`proofs/2026-11-14-card-check/`).

- run · 2026-11-14 · card check, three sentences in af_bella with RNBO and an overridden Kuramoto, study · taught item 10

## From the test scroll — 2026-11-15 — RNBO three ways, study

Written by the session giving the sound Specialists their test scrolls; owed a review.

11. **Two renders of one sentence in one process are not the same samples.** "The patch is written in RNBO, then exported from RNBO to a plugin" in af_bella, twice: the same length (5.83 s), different samples, the largest difference 0.12 of full scale. The card already says byte-identical output is not shown; this says by how much, inside one process. Whether the difference can be heard was not checked. Changed: nothing on the page yet; the card's test stands, now measured.
12. **A hand-written pronunciation of RNBO takes, both ways.** `[RNBO](/ɹˈɛnbO/)` and `[RNBO](/ɹˈɪnbO/)` came through the pipeline's phonemes exactly as written; left alone, misaki spells it `ˌɑɹˌɛnbˌiˈO`. Which one Loudon says is his ear's; the three takes are on the scroll. Changed: nothing yet.

- run · 2026-11-15 · RNBO three ways and a determinism check (`proofs/2026-11-15-rnbo-three-ways/rnbo.py`), af_bella, study · taught items 11–12 · unheard
- from the zoom-out · 2026-11-15 · no new Kokoro model: v1.0 (2025-01-27) is still the newest on https://huggingface.co/hexgrad/Kokoro-82M; kokoro-onnx 0.5.0 (2026-01-30, per a PyPI mirror) and mlx-audio 0.5.7 (2026-09-28, per a PyPI mirror; https://github.com/Blaizzy/mlx-audio) are other routes to the same model; rivals that run on a Mac through mlx-audio, per two 2026 blog round-ups (murmurtts.com, tryspeakeasy.io): Chatterbox (MIT, voice cloning), Qwen3-TTS (Apache-2.0), Dia 1.6B · not tried · owed a review: a blind pair, Kokoro against one rival, is on the scroll's test list
