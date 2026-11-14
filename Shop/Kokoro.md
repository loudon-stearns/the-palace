---
title: Kokoro
type: specialist
status: alive
medium: sound
tool: kokoro
tool_version: 0.9.4
born: 2026-05
license: Apache-2.0
forward_vector: "I speak text into clean, loudness-correct WAV and report exactly what landed and what missed — and I want to grow an ear for prosody beyond punctuation so the Maker stops hand-tuning my phoneme overrides for every technical word."
links:
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: phoneme-tested-on
  - target: "[[ffmpeg]]"
    type: couples-with
    label: post-chain
  - target: "[[Loudon Live]]"
    type: enables
    label: voices
  - target: "[[Loudon Live Design System]]"
    type: enables
    label: the-lesson-voice
tags: [specialist, shop, sound, narration, tts]
---

# Kokoro

![[Kokoro — hero.png]]

## Charter

I synthesize speech. You give me text, a voice, a tier, and a destination; I deliver a clean WAV at the loudness and sample rate the Maker specifies, with a standards report that tells the Maker what landed and what didn't.

I refuse to negotiate the brief — that is the Maker's work, not mine. I refuse to invent prosody beyond the punctuation in the text I'm given. I refuse to fail silently: if I produce something that misses spec, I say so in the standards report.

**Best used for, so far:** narration; a script read aloud for a lesson or a video. I read the 36 s Kuramoto paragraph at Study tier, −16.1 LUFS, under the Manim sync-arriving scene, and a 13.5 s check in af_bella landed at −16.0 LUFS (2026-11-14). The Radio Play cast its characters with my fixed voices.
**Not yet shown to hold:** the Piece tier and its de-ess; af_bella by ear (rendered 2026-11-14, not yet listened to); RNBO said the way Loudon says it (I spell it R-N-B-O); one narrator's voice across Loudon Live videos; byte-identical output (two runs differed in bytes on 2026-05-30).
**Not my purpose:** singing, emotional acting, or prosody beyond the punctuation I'm given; I won't chunk long input silently or negotiate the brief.
**Run:** From the palace's main checkout, `~/.venvs/kokoro/bin/python "Shop/Kokoro/proofs/2026-11-14-card-check/card-check.py"` reads three sentences in af_bella, loudnorms them in two passes to −16 LUFS and writes an m4a and a report; copy it and change `TEXT` and `VOICE`. If the venv is missing: `python3.12 -m venv ~/.venvs/kokoro && ~/.venvs/kokoro/bin/pip install kokoro soundfile`.
**Speed:** I load in 4.3 s and render 13.5 s of speech in 1.6 s; with both loudnorm passes the run took 8 s (2026-11-14, M-series). My first job took about 25 s for 36 s of speech (2026-05-10).
**Checked by:** A script can check duration, sample rate, mono, integrated LUFS within 0.5, true peak at or below −1 dBTP, and, through Whisper, whether the words came back. Only an ear can judge prosody, the pronunciation of technical words, and how natural the voice sounds.
**Wears:** I am not yet wired to a design system.
**Hands on:** I hand on a 24 kHz mono WAV, loudnormed to −16 LUFS, to ffmpeg for resampling and mixing and to Whisper for a read-back; I need sentence-segmentable text, commas around bare variable letters, and IPA overrides for the words I mis-say.

*Card tried 2026-11-14: Run, Speed and Checked by by running them, and Not yet shown against that run; Best used for, Not my purpose, Wears and Hands on stand on the page and my ledger, not tried this pass.*

## Voice

The shop-floor narrator. Steady, unshowy, technically clean. Doesn't have opinions about whether the script is any good — that's the writer's job. Knows their voices well, knows their phoneme overrides, knows their loudness curve. Will flag when the input text contains a word they can't pronounce well, before rendering. Quiet competence; no flourishes.

## Capabilities

- WAV output at 16 / 24 / 48 kHz, mono
- Eight English voices (`af_*`, `am_*`) with stable per-voice character
- Phoneme overrides in IPA, inline in the text: `[Kuramoto](/kˌuɹəmˈOtO/)` (§ Gotchas)
- Sentence-level chunking with configurable inter-sentence pause (default 250ms)
- Loudness normalization to a target LUFS (default −16 integrated, EBU R128)
- Sample-rate conversion to spec via internal resampler

## Strengths

- CPU-friendly, no GPU required, runs locally with no network call
- Voice consistency across sentences within a single render
- Cleaner prosody than most open-source TTS at the Standard tier
- The phoneme override path works for technical vocabulary: Kuramoto, overridden, came back right through Whisper `base` on 2026-11-14, where unoverridden it had come back "curimodo" on 2026-05-26. Other words are untried

## Limits

- English only at full quality; non-English voices are present but degraded
- No singing, no emotional acting, no performance direction beyond punctuation cues
- Long inputs (>~2000 chars) require pre-chunking; I will not chunk silently
- Voice character is fixed per voice ID; I cannot interpolate between voices

## Tiers

### Sketch
- Parameters: `voice=af_heart`, no normalization, no post, optional 250ms inter-sentence silence
- Time: ~25s wall-clock for ~36s of audio on M-series CPU (steady-state, after first-run model download)
- Output: 24kHz mono, unnormalized
- Use when: the Maker is decoding a brief and needs an audible draft, internal review only
- Sacrifices: prosody quality, voice consistency at edges, narrator presence

### Study *(default)*
- Parameters: `voice=af_bella` (rendered on 2026-11-14 at −16.0 LUFS; not yet judged by ear), EBU R128 two-pass `loudnorm` to −16 LUFS, 250ms inter-sentence pause
- Time: 8 s wall-clock for three sentences, load and loudnorm included (2026-11-14)
- Output: 24kHz mono, −16 LUFS integrated, −1 dBTP true peak
- Use when: most working drafts, in-progress Loudon Live, embedded narration in Manim previews
- Sacrifices: nothing material — this is the working tier

### Piece
- Parameters: 3-take selection by Maker preference, manual phoneme overrides applied per Loudon's pronunciation review, post chain (de-ess + gentle EQ tilt)
- Time: ~30s wall-clock per sentence + Loudon review pass on phoneme overrides
- Output: 48kHz mono, mastered to spec
- Use when: published Loudon Live, public demos, any narration that goes out under the Loudon Live name
- Sacrifices: time and Loudon's attention; do not use for iterative work

## Job Contract

### Input
- `text` (string): UTF-8, sentence-segmentable. Phoneme overrides allowed inline.
- `tier` (sketch | study | piece): determines parameter set
- `voice` (string, optional): voice ID. Defaults per tier
- `out_path` (string): absolute path under the target entry's bundle. Maker manages naming
- `loudness_target` (float, optional): override default LUFS for unusual contexts
- `sample_rate` (int, optional): override default for video sync requirements

### Output
- File at `out_path`
- Standards report (returned inline to Maker):
  - `duration_sec` (float)
  - `sample_rate_hz` (int)
  - `loudness_lufs` (float, integrated)
  - `peak_dbtp` (float)
  - `channels` (int)
  - `voice_used` (string)
  - `tier_used` (string)
  - `gotchas_hit` (list of gotcha IDs encountered during this job)
  - `status` (ok | spec_miss | failure)
  - `notes` (string, optional)

## Iteration Character

Quasi-deterministic. Same text + same voice + same tier = perceptually identical output (Kokoro itself is seeded). Refinement happens by:

1. Editing the input text — punctuation changes prosody
2. Adding phoneme overrides for problem words
3. Switching voice
4. Re-tiering up

I cannot "improve" a take by re-rendering with the same inputs. To get a different reading, change the input.

## Self-Check

Before declaring done, I verify:

- Output file exists and has nonzero duration
- Sample rate matches request
- Loudness lands within ±0.5 LUFS of target
- True peak does not exceed −1 dBTP
- Channel count is 1 (mono)

Any miss appears in the standards report's `gotchas_hit` list and sets `status` to `spec_miss`.

## Resource Footprint

- CPU: 1–2 cores, modest
- RAM: ~500 MB resident (steady-state); ~2 GB during model load
- GPU: not required (CPU path is fast enough at Sketch/Study); MPS-accelerated on Mac arm64 if torch detects it
- Disk: ~330 MB on first run (Kokoro-82M weights via HF hub + `en_core_web_sm` spaCy model + torch wheel), ~3 MB per minute of 24 kHz mono output thereafter
- Network: required on first run (HF model download + spaCy model download); subsequent runs offline
- API keys: none

Safe to run two Kokoro jobs in parallel on a typical laptop. Three pushes the bench.

### Install (host capability)

**macOS arm64 (canonical Loudon machine).** Per-Specialist venv on Python 3.12 (not 3.13 — see gotcha below):

```sh
python3.12 -m venv ~/.venvs/kokoro
~/.venvs/kokoro/bin/pip install kokoro soundfile
```

Dispatch by calling the venv's Python directly: `~/.venvs/kokoro/bin/python <script>.py`. No system deps required beyond Python 3.12 from Homebrew.

**First-run downloads** (~330 MB total): Kokoro-82M from `hexgrad/Kokoro-82M`, spaCy `en_core_web_sm` 3.8.0, torch 2.x wheel. Disk space is not a Sketch-tier concern but watch the first-run latency (~30–60 s of download before any audio renders).

## Gotchas

What narrating with Kokoro has taught, as it stands today. Which job taught each, and what changed because of it, is in [[Kokoro — tuning]].

**Install**
- **Use Python 3.12.** On 3.13 the `blis` build under spaCy fails; 3.12 has prebuilt wheels for the whole tree.

**Calling it**
- **Kokoro is a Python API, not a CLI.** `KPipeline(lang_code='a')(text, voice=..., speed=...)` yields `(graphemes, phonemes, audio)` per chunk. Dispatch a small script, and concatenate the chunks, with any inter-sentence silence, before writing the WAV.
- **Convert the audio defensively.** Some versions yield numpy arrays, others torch tensors: `audio.detach().cpu().numpy() if hasattr(audio, 'detach') else np.asarray(audio)`.
- **Name a real voice.** `af_heart` is the Sketch default; `af_bella`, `af_nicole` and the rest of the 0.9.4 catalog exist; there is no `af_default`. `af_bella` has not yet been heard at Study tier.
- **Output is 24 kHz mono.** For 16 kHz, resample downstream with `ffmpeg -ar 16000`, not inside Kokoro.

**Pronunciation and prosody**
- **Phoneme overrides are IPA, not ARPABET.** misaki reads `[word](/…/)` as IPA-like phonemes (`ə ɹ ʌ ɛ`, stress `ˈ ˌ`, `O` for /oʊ/, `A` for /eɪ/); ARPABET passes through literally and comes out garbled. Kuramoto is `[Kuramoto](/kˌuɹəmˈOtO/)`.
- **To see how I'll say a word, read the phonemes `KPipeline` yields, not a bare `en.G2P()`.** Each chunk comes back as `(graphemes, phonemes, audio)`. A bare `en.G2P()(word)[0]` has no fallback for words outside its lexicon and returns `❓`; it did for Kuramoto. It reads RNBO as `ˌɑɹˌɛnbˌiˈO`, letter by letter.
- **Put commas around a bare variable letter.** "The coupling constant, K, is…" — without the breaks the letter runs into the next word. Fix it in the text, not with overrides.

**Loudness**
- **Normalize with two-pass ffmpeg `loudnorm`, not `pyloudnorm`.** Raw output sits near −25.6 LUFS with a high crest factor, so gain alone hits the −1 dBTP ceiling and stalls near −22 LUFS. Pass 1 measures; pass 2 applies the `measured_*` values with `linear=true` and lands within ~0.1 LUFS. Reference: `Kuramoto Coupling/speech-rhythm-and-groove-narration-study.py`.
- **Trust the Self-Check's `spec_miss` outside ±0.5 LUFS,** and give the true-peak ceiling ~0.1 dB of rounding tolerance so a printed −1.00 dBTP isn't flagged.

## Recipes

**2026-06-19 — Multi-voice cast for scripted dialogue (from [[Radio Play]]).** A Radio Play casts several Kokoro voices as distinct characters, not one narrator — e.g. `af_heart` / `am_michael` / `af_bella` / `af_nicole` as four speakers around a table. Render each character's lines as separate clips with their own fixed voice, then place them on a timeline (ffmpeg `adelay`). This answers the entry's open question: for scripted multi-character pieces, use per-character fixed voice IDs, not one narration voice.

**2026-05-26 — Speech rhythm and groove narration, Study tier re-render** (24 kHz mono, 36.475 s, −16.1 LUFS, −1.0 dBTP). Same text as the 2026-05-10 Sketch, same voice (`af_heart`), with EBU R128 two-pass `loudnorm` post (target I=−16, TP=−1, LRA=11, `linear=true`). Pre-loudness measured −25.58 LUFS; post-loudness −16.10 LUFS — inside ±0.5 LUFS. Self-Check passed `ok`. Replaces the Sketch artifact as the canonical narration for the Manim sync-arriving scene. Source: [Kuramoto Coupling/speech-rhythm-and-groove-narration-study.py](../Kuramoto Coupling/speech-rhythm-and-groove-narration-study.py). Report alongside: `.report.json`.

**2026-05-10 — Speech rhythm and groove narration** (Sketch tier, 24 kHz mono, ~36 s). The first Kokoro job. Reads the *speech rhythm and groove coupling* paragraph from [[Kuramoto Coupling]] with voice `af_heart` at default speed. No phoneme overrides (Sketch tier). Word "Kuramoto" pronounced fluently without override. Source: [Kuramoto Coupling/speech-rhythm-and-groove-narration.py](../Kuramoto Coupling/speech-rhythm-and-groove-narration.py). Output: [Kuramoto Coupling/speech-rhythm-and-groove-narration.wav](../Kuramoto Coupling/speech-rhythm-and-groove-narration.wav). Render time on M-series + Python 3.12: ~25 s wall-clock for ~36 s of audio (first-run total includes ~30 s of model downloads).

## Test Suite

Smoke / Capability Probe / Style Probe / Edge Probe / Speed Bench / Determinism — defined in [Shop/Kokoro/tests/test-plan.md](../Shop/Kokoro/tests/test-plan.md).

Last run: **2026-05-30** — Smoke pass (Phase B narration render: 10.55 s mono @ 24 kHz, −16.77 LUFS within tolerance). **Determinism finding (load-bearing): Kokoro is NOT byte-deterministic** — two runs of the identical `kokoro_render.py` produced byte-different WAVs (SHA256 `3d7d2fc0…` vs `fe06da50…`; integrated loudness drifted -16.71 → -16.77 LUFS). Audible output is the same; bytes are not. Reproducibility artifact is `(text, voice, kokoro_version, LUFS_TARGET)`, NOT the WAV bytes.

## Open Questions

- Does Kokoro pronounce "RNBO" as "rin-bo" or letter-by-letter? Phoneme override TBD on first job.
  — progressed (2026-11-14): letter by letter, `ˌɑɹˌɛnbˌiˈO`, and Whisper `base` heard it as "R&B O". Whether that is how Loudon wants it said is his ear's call; if not, an IPA override.
- Does the de-ess in Piece tier leave a recognizable signature on long-form narration? Verify in first Piece-tier job.
- Should narration for Manim voiceover use a fixed voice ID for consistency across Loudon Live videos, or per-piece selection? Maker's call, but I should declare a preference if asked.
  — progressed (2026-10-24): the multi-character case is settled — per-character fixed voice IDs (§ Recipes, from [[Radio Play]]) — and the [[Maker]]'s narration heuristic sends narration to Kokoro by default, Loudon's own voice when the piece is published as him. One narrator's voice across Loudon Live videos is still open.

## Lost Branches

- A "personality" tier above Piece — discarded; that's the Maker's job to elicit through brief and direction, not mine to manufacture.

## Forward Vector

The first job ran on 2026-05-10, the Kuramoto narration (§ Recipes), and the Study re-render closed the Maker → Specialist round trip. Next: a Piece-tier narration, to time the tier and answer whether its de-ess leaves a signature.
