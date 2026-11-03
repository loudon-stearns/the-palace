---
title: "Talking Keyboard — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Talking Keyboard]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Talking Keyboard's proposed rich face: every piece judged for test, fidelity and walk-up, every offer recomputed through the same front end, and the three blind tests held to whether they could come out the other way, so Loudon reads a face that has already been argued with."
---

# Talking Keyboard — rich — challenge

Challenger, proposal round of Enrichment v2.8, 2026-11-03, on the maker's commit `1edf3a76` in the worktree `enrich/talking-keyboard`. I judged from the page (`Projects/Talking Keyboard.md`), the manifest, the three made pieces, the gathered mockup, the render script and the check, with the maker's commit body as its only account. I did not make this face.

**Verdicts: 1 keep, 3 remake, 0 retire.** Each remake is one sentence or one control. None is taste. In each, the test's conclusion runs a step ahead of its evidence, and always toward the maker's offer. The pieces themselves are good: each walks up, plays the build's own files, and runs clean.

## Why This Instrument First

### Talking Keyboard — rich — 88 keys.html — remake

- **Test or decoration?** A test. It serves "any mapping bug is obvious in the first second of play" (`Projects/Talking Keyboard.md:42`). It plants one of four bugs in the real SFZ map and lets you hunt for it.
- **Faithful?** Yes. It reads `talking_keyboard.sfz` itself (352 regions), plays the tracked samples, and models the group's `ampeg_release=0.05` (`_ops/sample-libraries/talking-keyboard/talking_keyboard.sfz:12`). Where it disagrees with the text, it holds that back as offer 2.
- **Walks up?** Yes: C4 held, then one key's four voices by press height, then all 88, then the test.
- **The planted bug, as a design.** It has a hole. The guess menu names all four bugs (`:127`, `:232`). Octave and semitone show on the first press. Reversed voices show on the first press to anyone who learned the voice order in step 2. So after a few clean presses, **two keys swapped** can be named by elimination without ever being heard. That defeats the ~30-press wait the test exists to show. I hit it headless: five presses, guessed swap, and got *"Right: it was two keys swapped. It never spoke in what you played."* A second, smaller slip: for reversed voices, `firstHit` counts a wrong region (`:168`), so the found text says *"It first spoke on press 1"* and then *"touch every key but never the name"* (`:237`).
- **Remake, exactly:** (1) plant a fifth case, **no bug**, about one time in five, and add it to the menu, so a clean run can't be told from a swap without finding the pair. Or ask a swap guess to name one swapped key. (2) For reversed voices, change "first spoke" to "first played the wrong voice".
- **Runs clean:** yes. Console clean on the rich-server's piece origin, `rich:play` only after a click, and the context goes to `suspended` when the page is hidden. All 353 declared files are tracked. Nothing licensed.

## The Pronunciation Lesson

### Talking Keyboard — rich — three spellings of A.html — remake

- **Test or decoration?** A test. It serves "Only listening caught it" (`:66`). It sets the ear, a vowel meter and the front end's written phonemes against each other on three re-rendered A4s.
- **Faithful?** It quotes `BUILD.md:66` and `build-log.md:40–45` correctly. Its renders are the build's own: all 352 shipped files re-render to within 2 sixteen-bit steps (`renders.json` `verify`).
- **Walks up?** Yes: A4 as shipped, then the spec's A, then pass one, then the seven-spelling audition, then the blind test.
- **The ear against the phonemes, as a design.** The ear half is easy by construction. It is a forced choice among three sounds you have just heard by name, with buttons labelled uh / eye / ay. It shows the bug is audible, which the page already says ("subtle but obvious"). That is fine as a reflecting surface. The real finding is the phoneme half, and there the found text contradicts the piece's own check. The test scores the phonemes with `/^ˈeɪ /` (`:322`): the A word is exactly ˈeɪ, the way the front end writes "A" on its own. Run that over the seven audition spellings and **only eigh passes**: ate → ˈeɪt, ace → ˈeɪs, A. → ˈeɪ. (with a pause), and ay, aye and ey → ˈaɪ. Yet the found text (`:324`) says a phoneme check "could not have" picked among ate, ace, "A." and eigh. That holds only for the looser `/eɪ/` the audition step uses (`:304`).
- **Remake, exactly:** rewrite the found paragraph. A strict phoneme check (the A word equals what the front end writes for "A" alone) would have stopped both bad passes and picked the spelling the ear picked. What it needs first is the convention: someone has to write ˈeɪ down as the target, which is the Phase 2 gate the page says this lesson seeded. What only the ear does is confirm that each voice actually speaks those phonemes. In step 4, show the strict check beside "reach /eɪ/" (the strict check: eigh).
- **Runs clean:** yes. Console clean, sound only on a click, 26 declared files all tracked.

## Future Variants

### Talking Keyboard — rich — the next variant.html — remake

- **Test or decoration?** Steps 1–3 are real tests of the solfège and language lines (`:76–77`). The syllable verdicts come from the front end's own output, and they could have come out the other way. Step 4 is not a test. Its pitch-class arm plays one identical file for every C (`:213`), so naming the octave is chance by construction.
- **Faithful?** Steps 1–3 yes. Step 4's found text (`:209`) says *"the loss is total, not partial"*. The page says only "loses positional verification" (`:78`), and "total" overshoots. A pitch-class keyboard still says the wrong letter for a semitone slip, or for a swap between keys with different letters. What it loses entirely is the octave.
- **Walks up?** Yes: C4 two ways, then one octave of solfège, then three fixes, then which C.
- **The octave word, as a design.** As built, the octave-word test can only come out one way. The voice-pitch table beside it is the real measurement, and it is right (see offer 4).
- **Remake, exactly:** (1) in the found text, change "the loss is total, not partial" to say the octave is lost entirely while the pitch class still verifies. (2) Either call the guessing game a demonstration, not a test, or give it a third arm that can fail: one "C" render retuned by `playbackRate = 2^((m−60)/12)`, as a region with `pitch_keycenter=60` would be. The reader then hears whether pitch could carry the octave the word dropped, and what retuning costs at C1 and C7. That cost is the "tuning verification across the keyboard" the page says this build skipped (`:42`).
- **Runs clean:** yes. Console clean, 43 declared files all tracked.

### proofs/2026-05-04-velocity-language-madlib-v2.html — keep

- A gathered record, not a test, and its caption says so honestly ("kept here as the record of a voice scheme that was sketched and not built"). It belongs beside "Different voice schemes (more layers, different cultural mix…)". It is silent, carries `contract {}`, runs clean and is tracked.
- **Note (caption, not the piece):** "its words are placeholders" is half true. Keys 60–76 (C4–E5) carry real words in all five languages (moon / lune / Mond / tsuki / luna …) (`:116–134`). Only the rest are dashes. Say "seventeen keys carry words in five languages; the rest are blank".

## The offers, recomputed

I re-ran kokoro-onnx 0.5.0's front end (`k.tokenizer.phonemize`, the same call Phoneme Choir's landed face used) in Loudon's TTS venv. I measured the bundle's renders and the shipped samples with my own scripts.

1. **The Pronunciation Lesson — the phonemes are confirmed; "can't choose" is disputed.** A four → ɐ fˈɔːɹ · ay four → ˈaɪ fˈɔːɹ · eigh four → ˈeɪ fˈɔːɹ · A → ˈeɪ. All four match exactly, and A sharp four → ɐ ʃˈɑːɹp too. ay, aye and ey give the same phonemes, and their files are identical sample for sample (same md5). "Only listening caught it" is **true as history** (nothing else was run) and **false as a necessity for detection**: the front end wrote the bug as text before any sound existed. Against the maker, it is **not necessary for the choice either**. A strict check (the A word equals ˈeɪ) passes eigh alone of the seven. The ear's last-gate job is whether the voice speaks the phonemes as written. Suggested rewording: keep the maker's sentence, drop "can't choose among the four", and add that the check needs the target written down first.
2. **Why This Instrument First — confirmed.** For a random order of N distinct keys with k marked, the k marks cut the N−k unmarked keys into k+1 gaps of mean (N−k)/(k+1). So the first mark falls at (N−k)/(k+1) + 1 = (N+1)/(k+1). With N = 88 and k = 2 that is 89/3 = **29.67**; the maker's simulation gives 29.66. Two caveats. It assumes distinct keys pressed at random, and real play clusters near middle C, while the swap can land anywhere (my run's pair was F#7/C7). And the page's own reason ("because you press a key and hear") already reads per press, so the suggested wording mostly makes that reading explicit. The velocity-split case is the offer's stronger half, and it stands.
3. **Future Variants (solfège) — confirmed.** As written: do dˈuː, re ɹˌiː, mi mˈaɪ, fa fˈɑː, sol sˈɑːl, la lˌæ, ti tˈaɪ, so **1/7** (sol → "sahl" is the one judgment call). Respelt: **7/7**. Italian: **7/7**, counting mɪ and sɪ as i, as the piece discloses. French: **6/7**, with do → `(en)dˈuː(fr) kˈatʁ`. The tokenizer hands the model all 18 characters, flags included (`(`, `e`, `n`, `)` are all in the vocabulary). Render lengths from the bundle's files: French C **1216 ms**, the other six 811–896 ms. That the flags are *spoken* is still inferred from the tokens and the +320 ms, not heard.
4. **Future Variants (pitch class) — numbers confirmed; "entirely, not partly" disputed.** With my own autocorrelation over C1–C7 in the shipped files, the voice speaks at 138–245 Hz, ×1.05–1.26 within a layer. The maker got 125–240 Hz and ≤×1.23 with the piece's meter. The method differs; the conclusion is the same. The keys span ×64, and every region's `pitch_keycenter` is its own key. But the page never says the loss is partial, and pitch class still verifies, so "entirely" overshoots: the octave is what goes. **Does Open Question 1 already ask this?** It asks the question ("a student naming notes by ear", `:92`) but not the fact. This finding belongs there as a note, and beside the Four Pillars line "learn note names by ear" (`:87`): the keyboard teaches the names of positions, not pitches. That is a better home than a clause on the variant line.
5. **Stack — confirmed from the source.** `talking_keyboard.sfz:11–12`: a `<group>` with `ampeg_attack=0.001 ampeg_release=0.05` and no `loop_mode`. None of the 352 WAVs has a `smpl` loop chunk, so by the SFZ spec they play `no_loop`, which cuts on key-up after the release. `BUILD.md:114–115` asked for no `loop_mode` ("these are one-shots") and no `ampeg_*`. Line 114 carries the misconception itself: leaving out `loop_mode` does not make a one-shot. Not tried in sforzando.
6. **Talking Keyboard — confirmed.** `generate.py:104` passes `lang="en-us"` for all four voices. "F sharp five" gives en-us ˈɛf ʃˈɑːɹp fˈaɪv against en-gb ˈɛf ʃˈɑːp fˈaɪv, so the only difference on that string is the r.

## Checks run

- `conform.mjs "Talking Keyboard"`: 4 pages, 4 introduced, **0 errors, 10 warnings**. The warnings are 7 sandbox-blocked and 3 play-silent, on the three made pieces: conform's opaque-sandbox browser pass blocks their declared-file fetches by CORS. **Keep with note.** On the rich-server's piece origin all three load and play.
- `fingerprint.mjs "Talking Keyboard"`: all three sections are in step (68d7e16b09fa, 15ad5b405a18, 7bc8d71ed599).
- The maker's `check.mjs`: 52 ok, 0 failed.
- `rich-server.mjs --root <worktree>`, headless Chromium (playwright): four frames, every step of every piece walked. **Console clean, no failed request.** Four `proposal · 2026-11-03` chips. `rich:play` came only after a click. A hidden page took the 88-keys context to `suspended`. The reveal reads ear 0/3 (no guesses), meter 3/3, phonemes 3/3. The which-C table: C1–C7 at 195–240 Hz in af_heart.
- My own runs: the front end on 30-odd strings, render lengths, md5 of the three twins, voice pitch across the C1–C7 shipped samples, a `smpl`-chunk scan of all 352 WAVs, and an en-gb vs en-us phonemize. Scripts in the session scratchpad, not the bundle.
- **Not verified:** what the renders sound like (an agent can't hear them); sforzando's actual key-up behaviour; that the French flags are spoken.

## The face as a whole

It makes the page's idea felt. You play the actual instrument from its actual map, hear the bug the build fixed re-made byte-close to what shipped, and hear the variants before anyone builds them. Each piece walks up honestly and nothing is busy. The one pattern to fix is that all three tests reach their found text a half-step past what they showed, and always in the direction of the maker's offers: a swap you can name without hearing it, a phoneme check said to be unable to do what the piece's own regex does, and an octave loss called total. Fix those three sentences and one menu, and the face is a set of tests that can lose, which is the point of making them.
