---
title: "Whisper — scroll"
born: 2026-11-15
links:
  - target: "[[Whisper]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Whisper's scroll — the page's front door, opening on where it stands now and the plan it is following, then reading down through what was made from it, newest first. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are Loudon's; my trail only ever grows."
---

# Whisper — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[Whisper]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-15T14:10:02.513Z from the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** alive · **Stage:** — · **Steward:** none — this page has no permanent steward yet
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector
- **Runs:** 3 runs on 3 days, counted from the ledger's run lines
- **Last run:** 2026-11-15 — rare words, base against large-v3-turbo (`proofs/2026-11-15-rare-words/`), probe · taught items 5–6
- **Owed in the ledger:** 1 — item 5; the next run's tail read picks it up first
- **Latest lesson:** item 6, from the test scroll — 2026-11-15 — rare words, base against large-v3-turbo, probe — [[Whisper — tuning]]

### Runs

- 2026-11-15 — rare words, base against large-v3-turbo (`proofs/2026-11-15-rare-words/`), probe · taught items 5–6
- 2026-11-14 — card check, Kokoro's af_bella check read back twice, probe · taught item 4
- 2026-05-26 — Kokoro → Whisper round trip on the Kuramoto narration, study · taught items 1–3

### Owed

- **5.** large-v3-turbo through mlx-whisper heard what `base` did not. On one 13.6 s Kokoro sentence with no overrides, `base` heard "Curimodo" and "Kakoro" (2 of 32 words wrong, 18 s wi…

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this page — never regenerated. A steward, if the page ever has one, reads it every cycle before anything else._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="run-3fe5613e53" -->
### 2026-11-15 — rare words, base against large-v3-turbo (`proofs/2026-11-15-rare-words/`), probe

taught items 5–6
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-list-2026-11-15" -->
### 2026-11-15 — The open tests, written down

My card's "not yet shown to hold" is my list of open tests. All run on this Mac.

1. **Rare words, and a newer model than `base`.** Run today, below.
2. **Real recorded speech, accented or noisy.** Needs about 30 s of Loudon reading a script with the palace's own vocabulary, once in a quiet room and once with noise; each route's transcript against the script.
3. **whisperx, VAD and diarization.** Two speakers, one file; the question is whether the turns are found.
4. **Captions and phone recordings.** SRT from a turbo transcript, checked against the audio by eye in a player.
5. **A faster rival.** parakeet-mlx (`mlx-community/parakeet-tdt-0.6b-v3`) is reported faster than turbo on Apple silicon by one third-party test (https://github.com/anvanvan/mac-whisper-speedtest); not tried today.

<sub>written 2026-11-15 by the session giving the sound Specialists their test scrolls · the zoom-out search is on the ledger with its sources</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-rare-words" -->
### 2026-11-15 — Rare words: base against large-v3-turbo

One 13.6 s sentence read by Kokoro af_bella with no pronunciation overrides, so every rare word is said the way Kokoro says it unaided: "Kuramoto coupling entrains the oscillators until they move as one. Kokoro reads the script aloud, and Whisper writes it back down. The patch is written in RNBO, then exported to a plugin." Read back by the page's `base`, and by `whisper-large-v3-turbo` through mlx-whisper, the newer route found today.

Measured, from the m4a below: `base` heard "Curimodo" and "Kakoro", 2 words wrong in 32, in 18 s with its load. Turbo heard "Kurimoto" and everything else right, 1 in 32, in 8 s with its load. From the uncompressed wav of the same take, turbo got all 32 and `base` the same two wrong. So turbo is better here, and one vowel of Kuramoto sits close enough to the edge that a 64 kbps encode tips it. Today `base` heard RNBO and "entrains" right, both of which it has missed before in other sentences. Nobody has listened to the take.

The question: **when Kokoro says it unaided, do you hear "Kuramoto" or "Kurimoto"?** If the second, the fault is the voice's, and the fix is Kokoro's IPA override, not a bigger Whisper.

**Artifacts:**
- [the sentence, Kokoro af_bella, no overrides](Shop/Whisper/proofs/2026-11-15-rare-words/rare-words.m4a)
- [both transcripts, scored](Shop/Whisper/proofs/2026-11-15-rare-words/report.json)
- [the read-back script](Shop/Whisper/proofs/2026-11-15-rare-words/read-back.py)
- [the script that spoke it](Shop/Whisper/proofs/2026-11-15-rare-words/speak.py)

<sub>test proof, 2026-11-15 · openai-whisper `base` (Homebrew) and mlx-whisper with `mlx-community/whisper-large-v3-turbo` in ~/.venvs/mlx-whisper, English, on the M1 Max · one sentence, one take: a tendency, not a ranking</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-24004be6be" -->
### 2026-11-14 — card check, Kokoro's af_bella check read back twice, probe

taught item 4
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-b59b6f3fd0" -->
### 2026-05-26 — Kokoro → Whisper round trip on the Kuramoto narration, study

taught items 1–3
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
