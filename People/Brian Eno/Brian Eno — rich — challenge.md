---
title: "Brian Eno — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Brian Eno]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Brian Eno's proposed rich face: both walks judged for test, fidelity and walk-up, every number recomputed by a second route, the 1996 source read again, and the one place each piece says more than its count can carry named, so Loudon reads a face that has already been argued with."
---

# Brian Eno — rich — challenge

Challenger, proposal round of Enrichment v2.8, 2026-11-03, on the maker's commit `d65526e7` in the worktree `enrich/brian-eno`. Judged from the page (`People/Brian Eno.md`), the manifest, the two pieces and their sources, and the maker's check script, with the maker's commit body as its only account. I did not make this face.

**Verdicts: 0 keep, 2 remake, 0 retire.** Both pieces are good walks that test something real. Each has one wrong or clipped thing on its last step, and each verdict says more than its count can carry. All of it can be fixed in one round.

## First, the person-page check

Neither piece reproduces an Eno recording, a lyric or the wording of an Oblique Strategy. I searched both sources for the card texts the page quotes (`People/Brian Eno.md:73`), for "oblique", "strateg", "card", "lyric", and for any `<audio>`, `.wav`, `.mp3`, `.ogg` or `fetch(`. Nothing turned up. The only "splice" hits are the tape splice in prose and JavaScript's `Array.splice`, so nothing came from Splice. Every sound is made by oscillators in the file. The notes on "Eno's three" are D, F♯ and A (`loops of different lengths.html:236`), the piece's own choice, not the record's pitches. The only things taken from Eno are three loop lengths and two short phrases from his 1996 talk, all cited. The maker was right to decline the card: it had nothing to test, and its wording belongs to Eno and Schmidt.

## How his mind moves

### Brian Eno — rich — loops of different lengths.html — remake

**Does it test or decorate?** It tests. The page says *Music for Airports* "is tape loops of different lengths drifting out of phase — he set the lengths, the room made the piece" (`People/Brian Eno.md:73`). The piece asks something the sentence takes for granted: are different lengths enough? It answers with numbers that could have come out the other way. The 8/12/16/24 s set is four different lengths that never drift (48 s). That is a fair [[Latent Error]]-style find.

**Is it faithful?** The exact numbers are right. I recomputed them below. One number on the test step is wrong, though, and it is the one holding up the verdict. The column "times round in an hour, to the ear" is `Math.floor(3600 / te)` (`loops of different lengths.html:423`). That assumes the near-returns keep coming at a steady period, and for the nudged set they don't. At 1/8 s the table shows **74** times an hour. Counted, it is **1**: once at 48.125 s, and never again inside the hour. At 1/4 s it is 2 (48.125 s and 96.25 s). At 1/16 s it is 0. The 24.0625 s loop slides 1/8 s later against the other three on every 48 s cycle: the spread is 0.125, 0.25, 0.375, 0.5 s at turns 1 to 4. The 8, 12 and 16 s loops stay locked at 48 s. So the verdict's "the ear hears the old cycle and the exact number lies" (`:443`) is half true. The ear hears the old cycle once, then hears one loop phase slowly away from it. That is drift, just slow drift. Also, the 48.125 s return sits exactly on the 1/8 s edge (spread 0.125 = ε), so it holds only because the check is ≤. Two smaller things. Step 4 paraphrases the page as "he set the lengths and the piece made itself" (`:166`), but the page says "the room made the piece". And the bold "Different lengths are not enough", then "So the section holds", reads as the page being wrong and then right. The page never says "never comes round".

**Does it walk up?** Yes. One loop, which is a clock. Then two loops on a square where a moment is a point. Then up to seven. The test comes last. Each step has a way back to the one before ("Set B to A's length…"), and the rail stays open.

**Remake, exactly:**
- Compute the per-hour column by counting the near-returns in the hour (`nearReturn` walked up to 3600 s), not with `floor(3600/te)`. The nudged row should read 1, 2 and 0 at 1/8, 1/4 and 1/16 s.
- Rewrite the nudged clause of the verdict. Three loops stay locked at 48 s, and the fourth slides 1/8 s a cycle against them: the old cycle, smearing. Drift, but slow.
- Change the conclusion from "only lengths whose ratios sit far from simple fractions … make the drift" to say that **how close** a ratio sits to a simple one sets how fast the loops drift and how soon anything comes round. Reich's phasing loops are the counterexample to the current wording: nearly equal lengths, a ratio next to 1/1, and the most famous drift there is.
- Use the page's words, "the room made the piece", on step 4.
- Say that the 48.125 s return sits on the tolerance's edge.
- Add a check to `check.mjs` that compares the per-hour column against a count.

## Where he can't see

### Brian Eno — rich — the frame, counted.html — remake

**Does it test or decorate?** It's half a test. With loops alone, "the machine decides 0" is true by construction. The step-3 equation says as much: "There is no term in this for the machine to choose anything" (`the frame, counted.html:132`). Any deterministic machine adds no information to its settings, so that half could not have come out otherwise. The coin is the part that can fail, and it does fail, for Cage's system, which the page already sets apart from Eno's (`People/Brian Eno.md:83`). It is still worth having. Putting a number on "the system did it" is a real move, and the crossing time (6.7 min) is a good thing to feel.

**Is it faithful?** The counting is right (below). The reading goes past it in two places.
- *Decided vs determined.* Step 3 asks "who decided it", and the p = 1 verdict says the machine "decided none of them" and that the reading "holds exactly" (`:384`). The count shows where the bits come from, not who foresaw the chord at 37:12. The page's question is "how much of 'emergence' is really *him*". It names taste and selecting (`:83`), and it holds that question open on purpose: "he half-knows it", "the conversation gets honest". The verdict closes it with a zero that any seeded random generator would also score.
- *"Tape loops have no coin. That is why the section is right about Music for Airports"* (`:387`). Ideal loops have no coin. Real tape does, and the sibling piece says so: "Real tape stretches and wavers, so a real loop's length is never exact" (`loops of different lengths.html:176`). The page's other section also credits "the room". Wow, stretch and the room are unchosen variation that this piece's own currency would count for the system, and the count leaves them out without saying so.

**Does it walk up?** Yes. One length, sized in questions. Then the frame, tallied row by row. Then an hour in which you can press any tick to see where it came from. The coin comes last, and "always sounds" returns you to step 3 exactly.

**It also clips.** In the standalone preview, frames keep their manifest height. No `rich:height` message reached the page for this face or for Kuramoto's, so that is the preview, not the piece. Step 4's content measures **1533 px** at both 760 and 1130 px, in a **1000 px** frame with `overflow: clip`. The hour canvas, the verdict and the note sit below the cut, so the test's result can't be seen there. Steps 1 to 3 fit (721, 795, 865 px). The loops piece fits at every step (969 to 1291 px in 1360).

**Remake, exactly:**
- Raise the manifest `height` to at least 1540, or tighten step 4 to fit under 1000.
- Use "determined" in step 3 and in the p = 1 verdict, and drop "the reading holds exactly" and "the section is right". The piece can say the count shows every start traced to a choice, and that it can't see foresight or taste.
- Change "Tape loops have no coin" to ideal loops, and name tape's wow and the room as unchosen variation the count leaves out.

## Checks run

- `node "People/Brian Eno/Brian Eno — rich — check.mjs"`: all pass. Its table: four even, 48 s at every ε. Nudged, 5.1 h exact, then 2.6 h, 48.13 s and 48.13 s. Eno's three, 27.0 days exact, then 9.8 days, 2.1 days and 7.5 hours. It checks the per-hour column for neither set, which is how the 74 got through.
- `node _ops/rich-face/conform.mjs "Brian Eno"`: 2 pieces, introduced, errors 0, warnings 0. Browser pass at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Brian Eno"`: How his mind moves `7c8b32736e33` and Where he can't see `a317bbb642b5`, both in step.
- `git diff main -- "People/Brian Eno.md"`: empty. The text is untouched.
- Headless Chromium on `rich-server.mjs` at 760 and 1130 px: both frames placed, 2 proposal chips. No AudioContext before a click. All 4 steps of each piece walked. Play, then a step change, ends the take (take→none). Hiding the page took a playing context from running to suspended. Console clean: no errors, no warnings. Frames stayed at manifest heights (above).
- My own arithmetic, in exact fractions (Python `fractions`, independent of both engines):
  - lcm(8, 12, 16, 24) = **48 s**. lcm(8, 12, 16, 385/16) = **18480 s = 5.133 h**.
  - Nudged near-return, spread ≤ ε: 1/16 s → 9215.94 s (2.56 h); 1/8 s → **48.125 s** (spread exactly 0.125); 1/4 s → 48.125 s.
  - Eno's three (47/2, 207/8, 479/16 s): lcm = 2330095.5 s = **26.9687 days**. Near-returns: 1/16 s → 235.12 h; 1/8 s → **50.636 h**; 1/4 s → 7.468 h.
  - The definition matters at 1/16 s. "Every start within ε of a start of the longest loop" gives 50.6 h, where "every start within ε of each other" gives 235.1 h. The piece uses the second, the stricter one, and states it in its equation. Fine, but the "1/8 s" figures are a spread, about ±1/16 s around a moment.
  - Frame: log₂7 + 3(log₂609 + log₂25) + log₂3 = **46.07** questions. Starts in [0, 3600) s: 154 + 140 + 121 = **415**, three of them the shared start at 0. Fair coin: 415 / (415 + 46.07) = **90.0 %**. Start rate 0.11460/s, so the coin passes the frame at **402.0 s = 6.70 min**.
- Source: In Motion Magazine's text of the talk (San Francisco, 8 June 1996, published 7 July 1996), read again. "One of the notes repeats every 23 1/2 seconds", "25 7/8 seconds or something like that", "29 15/16 seconds or something". It is "at least one of the pieces on there", and the cycles are "incommensurable — they are not likely to come back into sync again". Wikipedia's article on the record, citing Eno 1996 and Tannenbaum 1985, says 2/1 and 1/2 both use vocal loops and describes the record as layered tape loops of differing lengths. 2/2 is the ARP 2600 piece, not described as loops.

## Offers

**1. How his mind moves, claim-change: confirmed on the numbers, disputed on the reading.** Every figure holds: 48 s, 5.13 h, 48.125 s, 26.97 days, 50.6 h. The page's sentence isn't wrong, just unquantified. It describes what Eno did, and his loops were chosen to be incommensurable, by his own word. It doesn't state a general law that any different lengths drift. The offer's condition goes too far. A ratio near a simple fraction doesn't stop drift, it slows it: the nudged loop phases 1/8 s per 48 s cycle, and Reich's near-equal loops are drift itself. The offer's support, "an ear hears the old cycle", rests on one return in the hour, not 74. A truer line: "…tape loops of different lengths drifting out of phase: he set the lengths, and how near their ratios sit to simple ones decided how fast it drifts and how soon, if ever, it comes round." Also, Eno gave the lengths with "or something like that". The 26.97 days is an artefact of the precision he quoted, as the piece's own note half-says. The offer should say so too.

**2. How his mind moves, claim-change: source confirmed, proposed wording too narrow.** The page says the record "is tape loops" (`People/Brian Eno.md:73`), and the talk does say "at least one of the pieces on there". But "at least one" is not "one". By the record's usual account, two of the four pieces are vocal loops, and the album is described as built from loops. 2/2 is the exception. "One piece on Music for Airports is tape loops…" would undersell it. Better: "*Music for Airports* is built mostly from tape loops of different lengths…", or keep the record and add "most of". I checked Eno's talk and Wikipedia's secondary account, not the record's credits.

**3. Where he can't see, claim-change: counting confirmed, reading is a reframing.** 46.07 questions, 415 starts, 90.0 %, 6.70 min: all reproduce. What counts as a decision is a yes/no question, measured as log₂ of the menu's size. That is menu-relative, and the piece says so. A start under the coin is H(p) questions. The units match. The reading moves the page's blind spot from taste and foresight to information. "With fixed loops every decision is in the frame; the system adds time, not choices" is true if "decision" means "bit of determination". Read that way it is also true of every deterministic process, so it can't fail for Eno. It closes a question the page holds open on purpose. It also contradicts the sibling section's "the room made the piece" without saying so. And it leaves out the unchosen variation of real tape. A fairer line would keep the count and the open edge: "With fixed loops every start traces back to the frame; the system adds time, not information. What it adds that he didn't foresee — the chord at 37:12, the wow of the tape, the room — is where the argument starts, not where it ends." The coin half ("the moments become the system's, while the room they happen in stays his") is fair as written.

## The face as a whole

It makes the idea felt more than it makes it busy. Two walks with one method: build Eno's machine from nothing, then ask it the page's question in numbers. They point at each other, since the first is about what the lengths do and the second about who chose them. That is the page's own gardener-against-control-freak tension, split across two sections. The fault they share is a closing voice that is surer than its count. The loops piece claims "the ear hears the old cycle" on a column that is wrong. The frame piece claims "the section is right" on a zero that holds by construction. Both are one-round fixes. Fixed, the two pieces would hold the page's contradiction instead of settling it, and that suits a person page that asks the reader to argue with him.
