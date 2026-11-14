---
title: AuK
type: specialist
status: stub
medium: sound
tool: AuK (Tencent) — via the tencent/AuK HF Space
tool_version: "tencent/AuK Space @ 2026-09-15 (arXiv 2609.08936)"
born: 2026-09
license: MIT
forward_vector: "I edit speech that already exists — swap a word, whisper a line, retime a phrase — from one plain instruction, so a narration fix stops meaning a re-record. I want to earn my first real job on a Loudon Live voice-over and find out whether the speaker still sounds like themselves afterward."
links:
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[Shop/Kokoro]]", type: couples-with, label: makes-the-line-I-fix }
  - { target: "[[Shop/Whisper]]", type: couples-with, label: checks-my-word-swaps }
  - { target: "[[Shop/ffmpeg]]", type: couples-with, label: post-chain }
---

# AuK

![[AuK — hero.png]]

**Status: STUB** — drafted by the [[Shopkeeper]] from two probes (2026-09-12 and 09-15). Not yet dispatched on a real brief.

## Charter

I edit existing speech by instruction. Kokoro speaks text; I take a recording and change it: swap words, change delivery (whisper, emotion, accent), change pace or pitch. I refuse to promise the speaker's identity survives an edit — that is unchecked (see Known gaps).

**Best used for, so far:** fixing a word or the delivery in speech that already exists. On probes only, no real brief yet: a whisper, a twice-as-fast that came back exactly half the length, and two word swaps Whisper confirmed, the second on 13.5 s of Kokoro speech (2026-11-14).
**Not yet shown to hold:** whether the speaker still sounds like themselves after an edit, never measured or heard; a real recorded voice; enhancement and separation edits; AuK-Flash; anything longer than 13.5 s.
**Not my purpose:** speech from text, which is Kokoro's; I edit a recording that exists, and I don't promise the voice survives the edit.
**Run:** From the palace's main checkout, `python3 "Shop/AuK/proofs/2026-11-14-card-check/card-check.py"` (Homebrew's python3 has `gradio_client`) makes one word swap on the tencent/AuK Space and has Whisper read it back; copy it and change `SRC` and `INSTRUCTION`. With the Prompt Enhancer off, pass `gen_seconds` as the source's length.
**Speed:** One edit of 13.5 s took 26 s, upload and queue included (2026-11-14); a 2 s clip took 15 to 25 s in 2026-09.
**Checked by:** A script can check the edit's length and, through a Whisper transcript, whether a word swap landed. Only an ear can judge whether the speaker still sounds like themselves.
**Wears:** I am not yet wired to a design system.
**Hands on:** I hand back an edited WAV at the source's length, and the instruction used, to Whisper for a read-back and to ffmpeg for the mix; I need a WAV, one instruction sentence, and `gen_seconds` when the Prompt Enhancer is off.

*Card tried 2026-11-14: Run, Speed and Checked by by one call to the Space, Best used for against that call; Not yet shown, Not my purpose, Wears and Hands on stand on the page and the 2026-09 probes, not tried this pass.*

## Capabilities (each verified by a probe, not the README)

| Edit type | Instruction I ran | Evidence |
|---|---|---|
| Paralinguistic | "hushed, breathy whisper" | landed, duration kept 2.36 s |
| Acoustic | "twice as fast" | 2.36 s → 1.18 s, exactly half |
| Content | "replace 'fox' with 'wolf'" | local whisper-tiny transcript: "The quick-brown wolf jumps over the lazy dog." |
| Content, 13.5 s | "Replace the word 'small' with the word 'large'" on Kokoro's af_bella check (2026-11-14) | Whisper `base`: "…its coupling constant K is large."; length kept, 13.48 s |

Probe files: `Shop/Shopkeeper/probes/2026-09-12-auk/` (source.wav, whisper_edit.wav, fast_edit.wav, word_swap_edit.wav, probe-report.md), and `AuK/proofs/2026-11-14-card-check/` for the 13.5 s swap.

## Job contract (draft)

In: a WAV + one instruction sentence. Out: an edited WAV + the instruction used. For content edits, always transcribe the output with [[Shop/Whisper]] and compare — duration alone proves nothing.

## Gotchas

What calling AuK has taught, as it stands today. Which call taught each is in [[AuK — tuning]], from 2026-11-14 on.

- **2026-09-15 — with the Prompt Enhancer off, `gen_seconds` must be > 0.** Blank or zero is rejected before GPU allocation; the Space README documents it. Pass the source clip's duration for content and paralinguistic edits.
- Endpoint: `/run_generate_with_pe`, taking `use_pe, variant, audio, instruction, gen_seconds, nfe, cfg, seed` (defaults True, "AuK (Base)", —, —, 0, 32, 2.0, 42). ~15–26 s per call.
- **`gradio_client` sends the saved Hugging Face login by default.** On a Mac with `~/.cache/huggingface/token`, a call is not anonymous: it spends that account's free ZeroGPU quota. Whether the Space still answers with no login at all was not checked on 2026-11-14.

## Known gaps

- **Speaker identity unchecked.** The paper claims the voice is preserved; I never measured speaker similarity or listened for it on a real voice. Test this on Loudon's own recorded narration before any Piece-tier use.
- Enhancement/separation edits untried. `AuK-Flash` (4-step variant) untried.
- Tested on a 2-second `say` clip and 13.5 s of Kokoro speech. Real recorded speech, and anything longer, is unknown.

## Resource footprint

Host class: cloud via HF Space (ZeroGPU), free; the 2026-09 probes ran anonymously, and the 2026-11-14 call carried the saved HF login (§ Gotchas). If the queue saturates it needs an HF token or a mac handoff (weights not yet pulled locally). License MIT.

## First job

Take one real Loudon Live narration line, fix a word with AuK, transcribe to verify, and A/B the voice by ear.
