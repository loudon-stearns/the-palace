---
title: "Cycle 5 Explorer — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Cycle 5 Explorer]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenge of Cycle 5 Explorer's first rich face, the proposal round of 2026-11-03: every piece judged with a reason, the claim recomputed from music theory, and the face checked against what the paused steward holds."
---

# Cycle 5 Explorer — rich — challenge

Challenger, claude-opus-5-5, 2026-11-03, against the maker's commit `bed70660` and nothing else of the maker's. The `.md` is untouched by that commit; it added four files and changed none (`git show --name-status bed70660`).

## Verdicts

Seven pieces: **7 keep, 0 remake, 0 retire.**

### Cycle 5 Explorer (the opening)

**`proofs/2026-10-28-paper.png` — keep.** Decoration of the opening, honestly: it puts the rebuild beside the board. The caption is accurate and I checked it against the image. The image shows C Ionian (the inspector reads "C Ionian, bright, settled, resolved"; the line-of-fifths strip has its window on F to B with C as tonic). It does not show a drag to E♭, as the scroll says twice: in the born entry and in the steward's ask `cycle5-explorer-steward-002`. The grids clip as the caption says: Scale Tones stops at 6, Chord Function cuts its VII column mid-cell, and Chord Tones runs F C G D A E with no B column. Labels stand upright, F♯ reads ♯4 and B♭ reads ♭7, with "from Mixolydian" and the other source modes in the hatched sector. The fonts are the fallback mono, as the steward's left-rough note says. The caption corrects the scroll without touching it, which is right: the trail is the steward's and only grows.

**`proofs/2026-10-28-phosphor.png` — keep.** Decoration, accurately captioned. The image is the same C Ionian state on the dark ground. All three ways in exist in the explorer: the Ground segment, the P shortcut (`cycle5-explorer.html:391`), and `?theme=phosphor` (`:1000`).

### The one idea underneath

**`Cycle 5 Explorer — rich — the window.html` — keep.**
1. *Test or decoration:* a test. Step 5 counts the section's sentence both ways the explorer's header switch allows, and one of those ways comes out differently from the sentence: 84 of 84 steps with no note changed. A piece that can show the text failing is a test.
2. *Faithful:* yes, and careful. It never says the text is wrong. Its verdict reads "Read as notes, the claim is true only with the tonic held; read as degrees, it is true both ways", which is exact (see the recompute below). The arithmetic is the explorer's own: `okTonic` −7..7, `T = L + m`, and setMode holding the window for same notes (`cycle5-explorer.html:456, 649`). So the 84 is the explorer's real range, not a choice the maker made.
3. *Walks up:* yes. The line alone, then a window as a set with no tonic, then a tonic moving inside the held window (the notes-held reading, where the step shows "0 (the tonic moved from C to D)"), then the tonic held while the window slides, then the count and the ear. Each step names the one before. The rail stays open.

It runs clean. No AudioContext exists through steps 1 and 2; one is created only after a click. When I set the page hidden, the context went from running to suspended through the kit. Changing step stops the sound. There are no console errors at 760 px and no horizontal overflow (scrollWidth 760).

A note for a later round, not a remake: step 4's Locrian line is right ("the window would be C♭ Lydian"). Offer 2's parenthetical "C♭ Lydian on C" is garbled; see below.

### What is on the page

**`cycle5-explorer.html` — keep, with a note.** It is the page itself, playing, in the band. The caption's instructions are real: the T key toggle (`:1054`), Borrow one chord, and opening on C Ionian (`:451`). Conform's two errors are `grant-missing` for fonts.googleapis.com and fonts.gstatic.com. The explorer declares those hosts for its stylesheet, and a grants line is Loudon's yes. The page is the steward's and is paused on his review, so the errors stand and are named. Embedding it changes nothing of the steward's.

**`class/still-borrow-in-D.jpg` — keep.** It tests the section's "Every cell plays" / "bigger" claim against what was measured. The still is 1440 × 1000, the rehearsal's viewport (`class/rehearse.mjs:15`). It shows Scale Tones stopping at 6 and Chord Tones at its sixth column, F♯, with C♯ hidden. The caption's widths are the steward's (scroll, cycle 2). The measurement itself is in no committed file, so I re-measured the grids' overflow in headless Chromium:

| width | Scale Tones | Chord Function | Chord Tones |
|---|---|---|---|
| 1024 | 0 | 98 px | 0 |
| 1280 | 69 | 70 | 80 |
| 1440 | 24 | 2 | 33 |
| 1920 | 18 | 0 | 25 |

That agrees with the steward on every width. At 1440, Chord Function is short by only 2 px and looks whole in the still. Fonts may differ from the steward's run.

**`rich-face/page-sound.wav` — keep, with a note.** It is byte-identical to the steward's ignored `review/page-sound.wav` (`cmp`), copied by the README's documented route (§ Media a face plays). The steward's render stays ignored where it is, so this takes nothing from the steward. The caption's −6.5 dBFS matches `review/page-sound.json`; the scroll's −6.6 is the steward's rounding. Note: 4.2 MB in git history for good, and nobody has heard it. The caption says so.

### Open with Loudon

**`review/review-sheet.html` — keep.** It serves the section and does not test it; it is the section's questions on paper. The caption's details are on the sheet: "The page opens on same notes today", the fifths-order tension chips, one tick box per mode. It duplicates the steward's ask rather than competing with it, because it is the steward's own sheet.

## Checks run

- `node _ops/rich-face/conform.mjs "Cycle 5 Explorer"`: 3 pages, browser at 760 and 1130 px. The window piece is introduced with 0 errors and 0 warnings, and so is the review sheet. The explorer has 2 errors (grant-missing, the two font hosts) and 0 warnings. Not clean, and named.
- `node _ops/rich-face/fingerprint.mjs "Cycle 5 Explorer"`: the four made sections are in step (bf8c4042b418, 7216050ae2f8, 302daaee2618, 82bef318c620).
- `node "Projects/Cycle 5 Explorer/workshop/rich-face-checks.mjs"`: 18 of 18 pass.
- The rich face, served from the worktree (`rich-server.mjs --detach`, then `--stop`), opened `?entry=Cycle 5 Explorer` at 1130 px. The console was clean, the piece frames loaded, and there were 7 proposal chips (2 + 1 + 3 + 1).
- The window piece alone at 760 px, walked through five steps: the step-5 verdicts read 90 of 90 (tonic held) and 84 of 84 (notes held). The C♯ row is all "·" with the notes held. There were no errors.
- Hidden hush: playing, then hidden, takes the context from running to suspended.
- The grid overflow measurement in the table above.
- An independent recompute (scratchpad `recompute.mjs`). It works from the seven modes' semitone patterns and pitch classes, not from the line of fifths, so it does not share the piece's engine.

## The music theory, recomputed

**(1) Tonic held.** Lydian 0 2 4 6 7 9 11 → Ionian lowers the 4th degree (♯4 → 4) → Mixolydian lowers 7 → Dorian lowers 3 → Aeolian lowers 6 → Phrygian lowers 2 → Locrian lowers 5. Each step changes one degree by one semitone, and the letter stays the same because the degree number does not change. Over 15 tonics × 6 steps that is **90 of 90**, in the order **♯4, 7, 3, 6, 2, 5**. This is the standard brightness order.

The window picture is right. C Lydian is k = 0..6 (C G D A E B F♯). Each darker step slides the window one place flat: F♯ leaves the sharp end and F enters at the flat end. Then B leaves and B♭ enters, then E/E♭, then A/A♭, then D/D♭, then G/G♭. The note that leaves and the note that enters sit seven places apart: the same letter, a half step apart.

**(2) Notes held.** The pitch-class set is fixed and the darker mode's tonic is the set member a fifth up. C Ionian → G Mixolydian → D Dorian → A Aeolian → E Phrygian → B Locrian, all on the white keys. That makes **84 of 84** steps with the tonic up 7 semitones and no pitch changed. It is 84 because the explorer refuses a tonic past C♯ (`okTonic` and `commit`, `:456, :641`), which removes the C♯ row. Read as degrees against the new tonic, the same one degree reads a half step lower.

**(3) Offer 2.** One key flatward, mode held: **98 of 98** (14 tonics × 7 modes) change exactly one pitch, down a half step. It is the same window slide, with the tonic carried down a fifth. Past Locrian: against major, Locrian's only unlowered degrees are 1 and 4. On the line, C Locrian is k = −6..0, so the next note off the sharp end is C, the tonic itself, and C♭ comes in. The window [−7, −1] is C♭ Lydian. **Confirmed.**

**(4) What the page's sentence does.** It picks neither reading. "Each step darker lowers exactly one note" sits after three bullets. The one just above the switch is "Move the tonic inside the window … change mode", which is the notes-held move, and there no pitch moves. The explorer itself carries both true readings:

- Its Scale Tones grid, in Same tonic, says "Each row changes exactly one note from the row above" (both proofs, and the still).
- Its inspector's "One step darker: 7 → ♭7 (Mixolydian)" is a degree reading, shown while the header is on Same notes (both proofs; `cycle5-explorer.html:754, 765`).

So the sentence is not false on its own instrument. It is under-specified. The maker's proposed wording is **a clarification, not a correction**.

## Offers

**Offer 1 — confirmed, with the framing disputed.** The numbers are right: 90/90 and 84/84, ♯4 7 3 6 2 5. But the offer's "what" says the sentence "is true with the tonic held and not with the notes held". It leaves out the degree reading that the maker's own piece states in step 5 and that the explorer's inspector shows. Read that way, Loudon would take it as an error found in his page. It is not one. A fairer "what" would be: true as pitches with the tonic held, true as degrees both ways; the wording proposed makes the reading explicit. The proposed wording is also improved by keeping the degree half, e.g. "With the notes held, no note moves; home does, and the same degree reads a half step lower."

It does not decide Loudon's first open question (same notes or same tonic as the class default), which is the steward's paused ask. The steward's class plan, part (1), already teaches this sentence with the tonic held, so the offer agrees with the steward and does not step on him. Kind: `claim-change` is defensible because it narrows the sentence's scope. `no-claim-edit` would also be honest, since the claim survives in both readings. Loudon's call.

**Offer 2 — confirmed (98/98; past Locrian the tonic leaves).** One wording fix: "(the window would become C♭ Lydian on C)" should read "(the window would become C♭ Lydian; C is no longer in it)". The piece's own step-4 line already says this correctly. "Why the walk has seven stops" is true, and it is the same fact as seven notes in a window, seen from the held tonic.

## Does the face step on the steward?

No. The steward is paused on `cycle5-explorer-steward-002`, which has no answer on the board, and its last cycle is 2 (`-006`, 2026-10-30). The maker's commit adds four new files and edits none of the steward's: not the page, the scroll, `review/` or `class/`. The wav is a copy by the documented route, and the original stays ignored where it is. Three things to know:

- If the steward re-renders after a page change, the face's copy will not follow until someone copies it again.
- The paper caption contradicts the scroll's "after a drag to E♭". The correction belongs on the trail as a new line, the steward's or Loudon's to write.
- Offer 1 touches the sentence the steward's class plan quotes, and agrees with how the plan uses it.

## The face as a whole

The window piece makes the page's idea felt, not just shown. It builds the window from a strip of named notes and hands you both switches. It also finds a real seam in one sentence: on the same notes nothing moves but home. It reports that as a reading to name, not a mistake to fix. Everything else on the face is gathered, honestly captioned, and mostly evidence: two proofs whose caption catches the scroll naming the wrong state, a still and a measurement of the clipping the steward found, the page's own voice, and the steward's review sheet. It is not busy; the one made piece carries the idea. What it cannot say is how anything sounds, since no one has listened to the page, the render or the ear test. That is the limit the whole project has had since 2026-10-28.
