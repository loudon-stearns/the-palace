---
title: "Playful Interface Design — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Playful Interface Design]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of Playful Interface Design's first rich face, one verdict per piece with its reason and the numbers I recomputed, so the maker's remake and Loudon's approval start from what was checked rather than what was claimed."
---

# Playful Interface Design — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5, which did not make this face. Maker's commit `1d0d1aa6`. Read: Enrichment (v2.8) and its tuning items 1, 3, 5, 9; Progressive Staging; `_ops/rich-face/README.md` § The manifest and § Making pieces; the page whole; the manifest; all three pieces and the maker's `check.mjs`; the nomination record.

**Verdicts: 2 keep, 1 remake, 0 retire.**

## Legible before lovely (made) · Four moves the direction asks for — remake

**Does it test or decorate?** It tests. The section says juice past a middle amount costs meaning and that players like the juiciest look anyway. The piece asks a reader to read the squeeze blind at three amounts, then pick the look they'd rather have, and its verdict can come out *same* or *reverse*, both of which say the section is wrong for that eye. The engine shows the information is still there at every amount (a reader of the narrowest drawn width sorts 8, 8 and 7 of 8), so the outcome turns on the eye, not on a rigged picture.

**Is it faithful?** Yes, with one thing said out loud. "Past the middle" is decorative by construction: the middle is defined as the most juice at which every reaction still means gain, so the piece tests whether beat-keyed motion that shares the gain's width hurts reading. The caption says so. Nothing in the piece changes a number of the text's.

**Does it walk up?** Yes. A bare meter, the same gain as a vessel (one new idea: opening = gain), juice on that vessel, and the test last. One step shows at a time, the rail stays open, and the test's rule sits above the canvas before the first look. I confirmed the order in the DOM: the rule box precedes the stage and is shown on entering step 4, before *Start the test* is pressed.

**Why remake.** Two faults bend the test, both fixable in one round.

1. **A blind answer can be recorded.** After an answer, the piece waits 0.35 s before the next look (`tPhase = 'gap'`), and the answer buttons stay enabled through it (they are disabled only when `tPhase === 'idle'`). A second click in that gap answers the next look before it is drawn. Driven headless: two quick clicks on the first look left the label at *Look 3 of 24* and the meter at *2 of 24 answered*. Fix: enable the answers only while `tPhase` is `look` or `dark`.
2. **The gate tilts the verdict toward the claim.** The verdict speaks only when the middle reads 5 or more of 8. Selecting on the middle makes the middle look better than the levels it is compared with. For an eye that reads all three amounts equally well, given that the verdict speaks:

   | per-look hit rate | the verdict speaks | "past the middle cost you" (claim side) | "the most read better" (reverse) |
   |---|---|---|---|
   | 4 of 8 (p = 0.5) | 36.3% | 26.0% | 0.2% |
   | 5 of 8 (p = 0.625) | 65.1% | 14.7% | 1.0% |
   | 6 of 8 (p = 0.75) | 88.6% | 8.1% | 2.3% |

   The same holds for the top-of-the-U call against none. Fix: gate each comparison on the two levels it compares, pooled: 8 or more of 16 right (a guesser gets there 2.71% of the time, the same as 5 of 8's 2.73%). That gate is symmetric: an even eye then draws the call and the reverse equally, 11.5% each at 4 of 8, 7.2% each at 6 of 8. Then state the even-eye rate per direction, since the rule calls both directions.

**Notes, not reasons.** When no amount reads better than a guess, the reveal still says "Here liking and reading went together"; hold the preference sentence when nothing read above chance. Pressing *Sound on* logs a ScriptProcessorNode deprecation warning; the prototype uses the same node, and swapping the host for a Blob-URL worklet (README § Making pieces) would leave the engine block byte-identical. After a hidden-page hush, the button still reads *Sound off* while silent, so the first click turns it off.

## A vessel narrowing under pressure (gathered, `stage2-vessel-prototype-v3.html`) · The principle — keep

A record, not a test: the vessel the sentence "A vessel narrowing under pressure says 'this is what gain reduction is'" names, playable beside it, on the engine the made piece copies. Something to make felt, and the made piece below is where it gets tested. The caption is honest, including the detail that matters: the prototype's opening is `0.18 + 0.82 × gain` (prototype line 387), so it never closes, and the made piece draws the gain itself. Tracked, runs clean, no licensed audio.

## The organism, as a plugin face (gathered, `blood-compressor-face.html`) · Kinds already made — keep

The section is a catalogue, and a made instance of the organism kind is what it holds. The caption matches the face (rings of wall, muscle bands, the baroreceptor crown) and is straight about its state: the plugin folder waits for its template (`plugin/README.md`), and its one console line outside a host is the JUCE placeholder. The drums are synthesised (`drums()`, line 2394), not Splice. Tracked.

## Checks run

- `check.mjs` (maker's): all PASS.
- **Engine, byte for byte:** extracted the `<script id="dsp">` block from both files with my own awk, `cmp` identical, 4132 bytes each, sha1 `c44ede77e202ba03ace3c14ae62c2f78acf36f03` for both. Confirmed.
- **5 of 8 at p = 1/4:** exact tail 2.73% (4 of 8 would be 11.4%, 6 of 8 0.42%). A reasonable bar: about the conventional one-sided 5%, and reachable by a reader who can see.
- **The 7–10.5%:** exact convolution and a 10⁶-draw simulation agree. The assumption is two amounts read with the same independent per-look hit rate p over 8 looks each, and the event is middle − most ≥ 3 *in one direction*. p = 0.75 (6 of 8 expected) gives 7.20% (sim 7.18%); p = 0.5 (4 of 8) gives 10.51% (sim 10.50%); p = 0.25 also gives 7.20%. Either direction, which is what the rule calls: 14.4% and 21.0%. The maker's numbers are right for what they compute; the text calls them "about one time in ten" without saying they are one-sided, and the gate changes them (above).
- **Decodable by anything but the read?** Not that I found. The trial order and the preference letters are shuffled with `Math.random` inside a closure; no trial id, level or threshold reaches the DOM; the answer buttons are fixed. Loud and soft heartbeats are balanced in every amount × squeeze cell, and the pump's widening depends on the input alone (loud 25.2–25.4%, soft 17.6–17.8%, the same at every squeeze), so the beat's size says nothing about the squeeze. The reaction set does name the juice level at sight (shake means *most*), but the juice level is not what is asked. At *middle* and *most* the baroreceptors light at every squeeze and stay dark at none (in the engine: lit at 3, 7, 13 dB, dark at 0, both inputs), and the wall darkens with the squeeze up to 13 dB: these are gain cues the middle adds on purpose, present at *most* too.
- **Silent:** in step 4 the Sound button is hidden, the processor fills zeros whenever the step is the test, and changing step stops the sound. No AudioContext is made on the test path at all (counted: 0 before any click, 0 after all 24 looks and the reveal, 1 after *Sound on* in step 1).
- **Can it fail:** yes; the verdict function returns *same* and *reverse*, with text that says the section is wrong for that eye.
- **Preference locked:** the reveal is drawn only from a preference click; a second preference click is ignored (`test.pref != null`). Confirmed headless.
- **The offer's numbers**, from my own run of the engine (my own framing loop, not `PidSim`): at 3 dB on the loud heartbeat the gain accounts for 26.9% of the drawn opening's change at the most juice, the same in every five-second window from 5 to 30 s (the beat is periodic); 100% at none and middle; 60.2% at 3 dB soft; 87.8% / 94.1% at 7 dB; 97.6% / 98.7% at 13 dB. The pump widens the narrowest point 17.6% to 25.4%. Thresholds land the deepest squeeze on 0.00, 2.98, 7.02, 13.00 dB at both inputs. All confirmed.
- **Rich server:** the face loads; three frames; three proposal chips. Console on load: one warning, the gathered plugin face's JUCE placeholder. After *Sound on* in the made piece: one more warning, ScriptProcessorNode deprecated. No errors.
- **Hush:** the made piece's running AudioContext was suspended within 1.5 s of its page going hidden (forced visibility in the piece's frame); `check-hidden-hush.mjs` all PASS. The piece leaves hushing to the kit and never names `rich:hush`.
- **conform:** 3 pages, introduced 3, errors 0, warnings 0 (the maker's one warning, the untracked made piece, is gone now it is committed).
- **fingerprint:** the three sections the face uses are in step.
- **Tuning ledger:** the run line is there — `- run · 2026-11-03 · v2.7 with the proposal-round settings · Playful Interface Design · nothing new` — in the ledger's line format, like its siblings that day.

## The offer

**Claim-change, Four moves: confirmed, with one nuance.** The rule "every reaction should mean something about the sound" does pass the pump, because the pump follows the beat's loudness, which is something about the sound, and it moves the same width that means gain. The numbers are real (above). The nuance: the 27% is about the opening's change over time, and it sounds like burial; the narrowest point still sorts 7 of 8, because the pump widens it by a nearly fixed 18–25%. Both are true, and the offer quotes both. The pump is a counterexample built on purpose. That shows the rule has the hole; it does not show how often juice in the wild falls into it. The offer says plainly that no reader has taken the test, and the suggested wording ("mean the thing it appears to show, and no two meanings should share one motion") is a fair repair for Loudon to weigh.

## The skipped piece, and the size of the face

The nominator also proposed the same control drawn three ways (plain knob, vessel, thing with mass), with the reader asked what each wants before touching it. Leaving it out was right. Whatever a reader answers, it agrees with "every interface is understood *as* something", so it could not fail. And a thing with mass drawn on a screen goes against the page's own line that this kind "needs no picture at all; the hand reads it". The maker should have said so in the commit; the body names what was made and is silent on what was declined.

One made piece is the right size for this page. Of its eight sections, only the first move makes a claim an interface can be tested against, and the face spends its one test there. What the face lacks is breadth of kinds, not more tests: all three pieces are the Blood Compressor, so a page whose forward vector is a catalogue of four kinds shows one kind three times. The séance table (`Projects/Retrospective Delay/plugin/proofs/seance-table.html`) and the feel lab (`Projects/Haptic Handwheel/proofs/feel-lab/feel-lab.html`) are tracked and would gather straight into *Kinds already made* in a later round.

## The face as a whole

It makes the idea felt rather than busy, and the reason is restraint: one instrument, one engine, and a question the reader answers with their own eye before any answer is shown. The walk from bare meter to vessel to juice teaches the section's rule before testing it, and the preference pick puts the juice studies' strangest finding, liking what you read worse, into the reader's own hands. It is a test that could embarrass the page, and that is what makes it worth keeping. The two faults are in the scoring and the input, not the idea; fixed, the piece is the best kind of rich face, a page that can be argued with.
