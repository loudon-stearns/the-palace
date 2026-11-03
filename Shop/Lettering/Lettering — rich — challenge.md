---
title: "Lettering — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Lettering]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Lettering's proposed rich face: every piece judged for test, fidelity and walk-up, every number recomputed by a second route, and the blind test checked for what besides the letterform could give the speaker away, so Loudon reads a face that has already been argued with."
---

# Lettering — rich — challenge

This is the challenge for the proposal round of Enrichment v2.8, 2026-11-03, on the maker's commit `a51e1c4f` in the worktree `enrich/lettering`. I judged it from the page (`Shop/Lettering.md`), the manifest, the four made pieces and their source, `plates/make-plates.py` and `measures.json`, the BLUELINE bench at `Projects/BLUELINE/proofs/text-layer/` and its git history. My only account of the maker's reasoning was its commit body. I did not make this face.

**Verdicts: 2 keep, 3 remake, 0 retire.**

## Charter

### Lettering — rich — blind test of the seven voices.html — remake

**Test or decoration?** It is a test, and the right one for the charter. "Substance … means what the word means" (`Lettering.md:46`) is a claim that can fail, and here it can: the rule is fixed before the first trial, and a reader who scores 0–2 is told plainly that it did not carry. I drove it headless to exact scores. 0, 3, 4 and 7 right gave "it did not carry", "can't be told from guessing", "carried · about 1.0 times in 100" and "carried · fewer than 1 time in 1,000". Always picking the first speaker scored 1 of 7, which is the expected result.

**The numbers are right.** For a guesser at p = 1/7: P(≥4 of 7) = 0.01015, about 1 in 100. P(=3) = 0.0551, and P(≥3) = 0.0652. The piece says "a guesser gets 3 or more about 7 times in 100", which is the tail, and the tail is the right figure to quote.

**Is it decodable by anything but the form?** By the usual leaks, no:
- File names are `frag-ink-1…7`, numbered by a fixed permutation (`make-plates.py:108`), not named for the voice.
- Every fragment is 300 × 300.
- The trial order is shuffled on each load, and the order of the choices doesn't follow the file numbers.
- Colour and field belong to the material, which the charter counts as part of the form.
- The only map from number to voice is the `M` object in the page source, which takes devtools to find.

**The real leak is the letter itself.** The seven fragments are E, O, a, O, a, R, a (`make-plates.py:93`). Which letter you are looking at is information about the word, not about the form. Anyone who knows the seven words can use it: the rest of this face shows all seven, and the choices carry "(a title)", "(a sound effect)" and "(a lyric)". From the letter alone, E can only be ASCENSION and R can only be BURNING. The two O's split between NO and THOOM, and the three a's between stay, too late and was it real. A reader who uses only that and matches within each group passes the 4-of-7 bar 7 times in 12 (58%). One who guesses independently within each group passes 2 times in 3 (67%). The rule promises 1 in 100.

**The font round is broken by the reveal before it.** The reveal shows each ink fragment beside its word and full image (`blind test….html:159-167`). Then the font round shows the same seven letters again (`make-plates.py:93-94`). So that round measures memory of which letter went with which word, not what the font carries. Its own reading, "if the fonts score as well as the full pipeline, the feeling was in the font; if lower, diffusion added it" (`:108`), can't be drawn from it.

**A smaller prime.** The opening step's Impact-era *too late* stands on a cream field with dark stripes. The Chalkduster *stay* fragment (`frag-ink-2`) stands on the same kind of field. A reader who learned "cream striped field means grief, too late" in step 1 is steered to the wrong answer on that trial.

**"The older render the test never shows" is true within this piece.** `intro-toolate-impact-ink.webp` is byte-identical (md5 `22b05212`) to `dying-toolate-impact-ink.webp`. That image appears only in the mechanical-font piece, never in a trial.

**Faithful?** Yes, and it follows the bench where the page slips. The piece gives *too late* to "the hero, hollowed → himself" and *stay* to the dying woman, as `text-prompts.json` does. The page says "the dying woman's *too late*" (`Lettering.md:57`), which the bench contradicts. That slip is an offer the maker missed (below). The note that the first round's renders all stand on Chalkduster is accurate (`:109`).

**Walks up?** Yes. One captioned word, then why the word gives it away, then the rule, then the trials, then the second round.

**Remake, exactly:**
1. Run the font round first, or hold both reveals until both rounds are done.
2. In the font round, set the same letter in all seven fonts. Nosifer is caps-only, so choose an uppercase letter all seven fonts carry. Then letter identity carries nothing.
3. In the ink round, either cut patches that hide which letter it is (a stretch of stroke and its edge, not the whole glyph), or add one line to the rule. That line would say that the letter's identity is a second channel, and that a reader who knows the seven words can pass by spelling about 6 times in 10.
4. Open on a render outside the seven, or on the same render with its field cropped away, so step 1 doesn't prime a trial.

## The pipeline (its working wisdom)

### Lettering — rich — one word through the pipeline.html — remake

**Test or decoration?** A test. Two lines of the page can fail here, and partly do: "it cannot spell them away" and "canny still holding the letters on *every* pass" (`Lettering.md:58-59`). The measure does it, and so does the reader's own spells/slips mark, which comes before the agent's reading.

**Faithful?** Mostly, with one false sentence. The step-1 note says the per-voice fonts "exist only as skeleton previews … none has been through diffusion yet" (`one word….html:78`). Nosifer has been through diffusion. `balloon_material.py:42` builds its canny guide with `font="Nosifer"`. The tracked renders `balloons-genai/sweep/cn0.35_end0.4.png`, `cn0.35_end0.7.png`, `cn0.5_end0.4.png` and `cn0.5_end0.7.png` (commit `c48868bd`) are SDXL with a canny lock on a Nosifer TOO LATE inside a balloon. I looked at the guide and at `cn0.5_end0.4`: the dripping Nosifer caps are plain to see. What is true is narrower: none of the seven-voice proofs ran on its named font.

The settings the piece quotes all match the renders' own metadata:

| pass | denoise | lock strength | lock released at | steps |
|---|---|---|---|---|
| photoreal | — | 0.8 | 85% | 36 |
| ink | 0.85 | 0.5 | 45% | 36 |

Both passes use the Canny node at 0.1 / 0.3. "Widens it by 2 px" is MaxFilter(5), which is 2 px each side (`render_text.py:94-99`).

**Walks up?** Yes, cleanly. Font, then edges, then photoreal, grey, ink and void, then all seven.

**Remake, exactly:** change the step-1 note to say the seven proofs all stand on Chalkduster, and that of the named fonts only Nosifer has been through diffusion, once, in the living-balloon sweep (`c48868bd`), not in the suite. Nothing else.

## Gotchas (hard-won)

### Lettering — rich — mechanical font or hand.html — keep

**Test or decoration?** A test, built from the bench's own history, which is a good find. "Mechanical fonts dominate" (`Lettering.md:71`) could have failed if the Impact ink had been redrawn as freely as the Chalkduster ink. It wasn't: 93–100% of the outline kept against 30–45%.

**Faithful?** Yes, and honest about its confound.
- The quote from `d8ddb23b`, "the central font was coming through too strongly", is right.
- The note that the older suite ran *NO* and *too late* at denoise 0.78 is right. Of the Impact-era ink renders at `4e863210`, those two are at 0.78 and the other five at 0.85, all with the lock at 0.85 held to the last step.
- One more variable changed between the eras, and the note could add it. The Impact-era photoreal was locked at 0.85 to 100% (NO to 90%), the Chalkduster one at 0.8 to 85%. So the grey image the ink starts from differs too. That is a note, not a reason to remake.

**Walks up?** Yes. Two fonts, then each era, then the wipe.

### Lettering — rich — the void on a light field.html — remake

**Test or decoration?** A test of "sings only on a light energy field" (`Lettering.md:72`). The reader marks reads or vanishes, then sees the marks against the measured field brightness. The gain step is a demonstration, but it earns its place as the step that isolates "light on the border".

**The test shows its answer first.** On the test step, `draw()` runs on entry (`void….html:170`). It plots all seven words at their measured brightness before any mark (`:156-168`). I checked headless: on reaching the step with no marks, the canvas had 5,858 painted pixels, the words placed along the axis, and "the reading" was still hidden. So the reader marks with the answer already on screen, which undoes the piece's own "mine after yours".

**Faithful?** The numbers reproduce exactly. One caption slip in step 1: it says "the font itself, widened by 2 px" (`:79`), but it shows `whisper-stay-skeleton.webp` inverted, which is not widened.

**Walks up?** Yes. The void alone, then a light field, a dark field, the gain, and the seven.

**Remake, exactly:**
1. Draw the plot only once all seven are marked, or draw unlabelled hollow points until then.
2. Either show the dilated mask in step 1, or drop "widened by 2 px" there.

### /Projects/BLUELINE/proofs/text-layer/out/sfx-thoom_s1111.png (gathered) — keep

**Test or decoration?** A test of "SDXL can't spell free-hand" (`Lettering.md:73`), and the numbers say it plainly. The image itself is a tracked render from `18b2e62b`.

**Faithful?** Yes. The render has no ControlNet in its metadata, seed 1111, and the same positive prompt as the locked THOOM. Under three different measures it keeps no more of the outline than chance:

| measure | kept | chance |
|---|---|---|
| maker's | 17% | 16% |
| maker's measure on kornia's outline | 16% | 16% |
| my position-only measure | 37% | 41% |

The caption's "same prompt and seed" is true of the positive prompt and the seed. The free render's negative prompt is shorter: it predates "repeated text, duplicate word, second line of text, two rows of text, double exposure, ghost text, mirrored text". That is a note; the caption could say "same prompt (an earlier negative)".

## Checks run

- **Conform:** `node _ops/rich-face/conform.mjs "Lettering"` found 4 pieces introduced, 0 errors and 0 warnings. The browser pass ran at 760 and 1130 px.
- **Fingerprint:** `node _ops/rich-face/fingerprint.mjs "Lettering"` shows Charter, The pipeline and Gotchas all in step.
- **Tracked files:** `untracked.mjs` says every file the face names is tracked.
- **The face in a browser:** I served it with `rich-server.mjs --root <worktree> --detach` on 8852, opened `?entry=Lettering` in headless Chromium and scrolled through. All four frames loaded, reporting heights 771, 1055, 763 and 885 (the manifest has 780, 1060, 750 and 890). There were five "proposal · 2026-11-03" chips, and no console messages, page errors or failed requests from the page or any frame. Then `--stop`.
- **Sound:** none of the pieces makes any, so the hush and time-cap rules don't apply. Nothing is licensed: the fonts are OFL from `fonts/lib`, and the plates are cut from tracked proofs.
- **The `.md`** is untouched by `a51e1c4f`.
- **The measures:** I reran `make-plates.py` into the scratchpad (OUT redirected). Its `measures.json` is identical to the committed one.
- **The Canny reproduction:** ComfyUI's Canny node calls `kornia.filters.canny` (`ComfyUI/comfy_extras/nodes_canny.py`). I ran kornia 0.8.2 from the ComfyUI venv on the seven skeletons at 0.1 / 0.3. 99.0–99.9% of the maker's edge pixels lie within 1 px of kornia's, but kornia finds 15–22% more pixels (IoU 0.78–0.87). So the plate is a close but thinner subset of what the node sees. The piece's "a reproduction, not the node's output" is honest.
- **Outline held, by a second route:** I reran the maker's measure on kornia's outline, then ran my own position-only measure: the share of kornia's outline within 3 px of a kornia edge in the image, with chance from 40 random shifts. Results are in the offers below.
- **Tuning ledger:** `Enrichment — tuning.md:60` reads "- run · 2026-11-03 · v2.7 with the proposal-round settings · Lettering · nothing new". It ends per the line format ("nothing new"). Its version field is longer than a bare `v<version>`, matching the two run lines before it. Enrichment.md now stands at `version: "2.8"` (`Enrichment.md:9`).

## Offers

**1 · per-voice fonts never rendered (claim-change) — partly disputed.**
- *Confirmed:* all seven suite proofs stand on Chalkduster. I looked at `skel/` and `skel-preview/`. The script's default skeleton font is Chalkduster (`render_text.py:30`), and it now resolves per-voice fonts (`:170`), so a re-run would change that.
- *Disputed:* "never rendered through diffusion". Nosifer was, in the living-balloon sweep (`c48868bd`, four tracked cells at cn 0.35 and 0.5).
- *Change to the proposed line:* "(picks not yet rendered in the seven-voice suite; Nosifer once, in a balloon)".
- *A second offer the maker missed, a no-claim-edit for Loudon:* the page's "the dying woman's *too late*" (`Lettering.md:57`) gives the line to the wrong speaker. In `text-prompts.json`, *too late* is "the hero, hollowed → the self" and *stay* is the dying woman's. The phrase "Nosifer bleeds 'too late'" comes from `146d47ee`, which names no speaker.

**2 · the lock holds the photoreal, not the ink (claim-change) — confirmed.**

| measure | photoreal | ink | Impact-era ink |
|---|---|---|---|
| maker's | 71–81% (chance 16–23%) | 30–45% (chance 16–20%) | 93–100% |
| maker's, on kornia's outline | 64–75% | 28–43% | 95–100% |
| mine, position only | 82–92% (chance 9–51%) | 56–81% (chance 40–68%) | 99–100% (chance 23–57%) |

- The maker's own numbers reproduce exactly.
- On the true node's outline, every figure drops a few points.
- My position-only measure finds *stay*'s ink at chance (68.5% vs 68.1%).
- The ordering holds under every definition I tried. The chance figure is computed (the outline slid to eight wrong places), not assumed, and 16–23% belongs to the direction-matching definition. A looser definition has a higher floor.
- My eye agrees with the maker's slips: ASGENSION, a 3 for the B, "too lote", the blurred first word of *was it real*, NO's O curling, and the invented rows in the *too late* photoreal. That is still eye against eye.

**3 · ~0.85 vs 0.78 vs ~0.8 (no-claim-edit) — confirmed.**
- All seven ink renders carry denoise 0.85 in their metadata.
- `render_text.py:204` defaults to 0.78.
- `BLUELINE — Text Layer.md:140` says "~0.8".
- Context: the Impact era ran *NO* and *too late* at 0.78, so the default is a leftover from that era.

**4 · "light or mid-grey" (claim-change) — numbers confirmed, the cut is an eye-reading.**
- The field at each void's edge reproduces: 0.705, 0.587 and 0.567 for the light three; 0.283, 0.233, 0.178 and 0.130 for the rest.
- I agree that NO at 0.28 reads.
- My eye also reads THOOM at 0.18, dimly, so the line may sit lower than 0.2. Neither eye is a test.
- A mean of 0.28 is a dark grey, so "mid-grey" is generous.

**5 · OCR is not the judge (claim-change) — confirmed on the ones I reran.**
- `plates/ocr.swift` gave: NO skeleton → "ON"; *was it real* skeleton → "was il | real"; THOOM ink → "THOOM"; *stay* ink → "sca"; NO ink → nothing.
- The void-edge-lit split reproduces: 69–74% against 10–32%.

## The face as a whole

It makes the page's idea felt, and it isn't busy. Each piece walks up from one thing to its test. Two of them find something the page didn't know: the ink pass loosens the spelling the photoreal holds, and the bench's two eras already ran the mechanical-font experiment. The maker read every setting from the renders rather than the script, and that is why offer 3 is so clean. The weak point is the one that matters most to the charter: the blind test hides the word but not the letter. A test of "the letterform carries the state" has to make sure nothing but the form can carry it, and here spelling still can, especially in the second round. Fix that, and stop the void plot showing its answer, and this is a strong Study face.
