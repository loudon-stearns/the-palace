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

*The card: what a maker reads before choosing me, and what `node Shop/shop.mjs menu` prints. Drafted 2026-11-14 from this page and my ledger by a reader, not yet tried line by line; a line that proves wrong is fixed here.*

**Best used for, so far:** Nothing yet on a real brief. Three probes on one 2.36 s synthetic clip: whisper delivery, twice-as-fast (1.18 s), and a fox-to-wolf word swap verified by whisper-tiny transcript. Charter: edit existing speech by instruction.
**Not yet shown to hold:** Speaker identity after an edit (paper claim, never measured). Real or longer speech, enhancement and separation edits, AuK-Flash. Only a 2 s say clip tried (page Known gaps).
**Not my purpose:** It refuses to promise the speaker's identity survives an edit. Speech from text goes to Kokoro; it edits an existing recording.
**Run:** No command on the page yet. Endpoint is /run_generate_with_pe on the anonymous tencent/AuK Space; evidence files in Shop/Shopkeeper/probes/2026-09-12-auk/. With Prompt Enhancer off, gen_seconds must be above 0.
**Speed:** About 15-25 s per call on the free anonymous Space, as recorded 2026-09-12 and 2026-09-15.
**Checked by:** A script can check duration (the rate edit halved it exactly) and, via Whisper transcript, whether a word swap landed. Only an ear can judge whether the speaker still sounds like themselves.
**Wears:** Not yet wired to a design system
**Hands on:** Hands back an edited WAV plus the instruction used; needs a WAV, one instruction sentence, and gen_seconds. Content edits must be re-transcribed with Whisper to check.

## Capabilities (each verified by a probe, not the README)

| Edit type | Instruction I ran | Evidence |
|---|---|---|
| Paralinguistic | "hushed, breathy whisper" | landed, duration kept 2.36 s |
| Acoustic | "twice as fast" | 2.36 s → 1.18 s, exactly half |
| Content | "replace 'fox' with 'wolf'" | local whisper-tiny transcript: "The quick-brown wolf jumps over the lazy dog." |

Probe files: `Shop/Shopkeeper/probes/2026-09-12-auk/` (source.wav, whisper_edit.wav, fast_edit.wav, word_swap_edit.wav, probe-report.md).

## Job contract (draft)

In: a WAV + one instruction sentence. Out: an edited WAV + the instruction used. For content edits, always transcribe the output with [[Shop/Whisper]] and compare — duration alone proves nothing.

## Gotchas

- **2026-09-15 — with the Prompt Enhancer off, `gen_seconds` must be > 0.** Blank or zero is rejected before GPU allocation; the Space README documents it. Pass the source clip's duration for content and paralinguistic edits.
- Endpoint: `/run_generate_with_pe` on the anonymous Gradio API. ~15–25 s per call.

## Known gaps

- **Speaker identity unchecked.** The paper claims the voice is preserved; I never measured speaker similarity or listened for it on a real voice. Test this on Loudon's own recorded narration before any Piece-tier use.
- Enhancement/separation edits untried. `AuK-Flash` (4-step variant) untried.
- Only tested on a 2-second `say` clip. Longer, real speech is unknown.

## Resource footprint

Host class: cloud via HF Space, free anonymous tier, no token. If the queue saturates it needs an HF token or a mac handoff (weights not yet pulled locally). License MIT.

## First job

Take one real Loudon Live narration line, fix a word with AuK, transcribe to verify, and A/B the voice by ear.
