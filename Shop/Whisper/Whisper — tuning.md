---
title: "Whisper — tuning"
born: 2026-11-08
links:
  - target: "[[Whisper]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Whisper page's record of what transcribing has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real transcript taught."
ledger: tuning
standards:
  for: "what transcribing speech taught the Whisper page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the model itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change of model"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Whisper — tuning

What each job taught the Whisper page. Each item names what the job showed and what changed because of it, if anything did. Newest last. These are the page's dated gotchas, moved here on 2026-11-08 when its Gotchas became present-tense rules. The page's `last_tested` date, the first round trip, is kept as the first run line.

## From the Kokoro → Whisper round trip — 2026-05-26 — Kuramoto narration, Study, `base`, 36.5 s

1. **"Kuramoto" came back as "curimodo".** The Kokoro narration had no phoneme override, and `base` approximated the technical word by sound, confirming the standing warning. Two fixes: a phoneme override on the Kokoro side (`[Kuramoto](/k uw r ah m oh t oh/)` style) before rendering, or Whisper's `--initial_prompt "Kuramoto coupling, oscillator, theta band"` to bias it toward the project vocabulary. Changed: for round-trip integrity tests the override lives on the Kokoro side, where the pronunciation wants to be correct.
2. **"entrains to it" came back as "in trains to it".** Compound verbs with rare technical use ("entrain", "phase-lock", "couple") fragment into common-word lookalikes. Changed: the same fix path — a project-glossary `initial_prompt`, or a Piece-tier `large-v3` pass.
3. **`base` was enough for clean Kokoro narration sync**, deciding the page's open question on the Study model. On a 24 kHz mono Kokoro WAV (no noise, no accent, no reverb), `base` (~150 MB) gave monotonic word timing, a mean segment avg_logprob of −0.15, and end-of-audio within 1 s of true duration; word timing sat well inside the ±10 ms `manim-voiceover` needs at that length. Changed: `base` for clean text-to-speech round trips, `small` for accented or low-SNR sources, `large-v3` for Piece-tier published work and technical-vocabulary recovery.

- run · 2026-05-26 · Kokoro → Whisper round trip on the Kuramoto narration, study · taught items 1–3
