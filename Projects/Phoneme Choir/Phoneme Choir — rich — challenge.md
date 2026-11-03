---
title: "Phoneme Choir — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Phoneme Choir]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Phoneme Choir's proposed rich face: both pieces judged for test, fidelity and walk-up, both offers recomputed by a second route, the lost audition re-rendered a second time, and the trill ruler held to a real trill, so Loudon reads a face that has already been argued with."
---

# Phoneme Choir — rich — challenge

Challenger, proposal round of Enrichment v2.8, 2026-11-03, on the maker's commit `8b9e82af` in the worktree `enrich/phoneme-choir`. I judged from the page (`Projects/Phoneme Choir.md`), the manifest, the two pieces, their check and render script, with the maker's commit body as its only account. I did not make this face.

**Verdicts: 2 keep, 0 remake, 0 retire.** One section, The Two Lessons, two pieces, two offers. Both offers confirmed; one sharpened.

## The Two Lessons

### Phoneme Choir — rich — the spelling is the prompt.html — keep

- **Test or decoration?** A test. It serves "no spelling trick worked" and "the prompt is the spelling" (`Projects/Phoneme Choir.md:78`). Step 4 tries the one door the page says isn't there: phonemes handed straight to the model, with the trill symbol `r`, which is in kokoro-onnx's vocabulary (`config.json` `"r": 60`, `.venv/lib/python3.12/site-packages/kokoro_onnx/config.json:81`). Its found text has a branch for a flutter (`the spelling is the prompt.html`, step 4 `draw`), so it could have come out the other way. It didn't: longest run 1 in all six phoneme renders.
- **Faithful?** Yes. It changes no number the page states and doesn't smooth the page's claim. Where it disagrees with the text — the mechanism is espeak-ng's letter names, and held vowels shrink rather than syllabify — it says so in the found text and holds the change as offer 1, not as a rewrite.
- **Walks up?** Yes. Ruler alone (a modelled flutter on plain *brah*), one spelling read through the front end, six more in a row, then the test. Each step plays and has one thing to hear.
- **Runs clean, sound on click, files.** The AudioContext is made only in `audio()`, from a play click or a row click. Every render it fetches is declared in `piece:files` and tracked (`untracked.mjs`: every file it names is tracked). Synthesised voices only, nothing licensed.
- **Notes for the maker (not a remake):**
  1. Step 1 (`:238`) cites Ladefoged and Maddieson 1996, p. 218 for "two or three taps, sometimes up to five". That matches the Wikipedia *Trill consonant* article, which cites the same page. "Close to 30 a second" is uncited in the piece. It holds: Ladefoged, Cochran and Disner, "Laterals and trills", *JIPA* 7 (1977) 46–54, give a mean trill rate of 26 to 32 Hz across languages (as summarised by Verhoeven, *Taal en Tongval* 46, 1994). Add that citation to the sentence.
  2. The ruler is calibrated only on its own synthetic flutter. I ran it, as the piece has it, on a real one: Wikimedia Commons' `Alveolar_trill.ogg` reads **5 dips in a row at 25.8 a second**, with 12 dips in all. So the ruler can say yes to a real trill, which makes its no on Kokoro worth more. The piece could say that in one line. I didn't copy the file into the bundle and wouldn't without checking its licence.
  3. The lead (`:80`), "The bank was meant to open with a rolled r", says the trill was first in the audition, not first in the bank (the audition was phoneme #35 at MIDI 55, per the first `generate.py`). Taste; "The audition began with a rolled r" is plainer.

### Phoneme Choir — rich — same word, four voices.html — keep

- **Test or decoration?** A test, and it found something. It serves "With it, every key fires immediately into the percussive transient regardless of voice" (`Projects/Phoneme Choir.md:84`) and the pipeline's "so we land on the transient peak" (`:89`). Step 4 shows knock closing from 110 ms apart to 4 ms. Step 5 then shows knock is the exception: over twelve keys the trimmed spread is a median 50 ms, with 2 of 12 within 10 ms. The piece could have confirmed the sentence and partly didn't.
- **Faithful?** Yes. Every number it states matches the page or offsets.json, and it runs the build's own rule (`generate.py:198–226`) on the build's own files. Step 1's "kokoro-onnx already cut away what sat more than 60 dB under the loudest part" is true: `trim.py:157` defaults `top_db=60` with `ref=np.max`, `create()` defaults `trim=True` (`__init__.py:177`), and the build never turns it off (`generate.py:252`). The disagreement with `:84`/`:89` is in the found text and offer 2, where it belongs.
- **Walks up?** Yes: one file and its breath, the onset rule, four voices untrimmed, trim plus ruler, the test. Step 4 brings in two ideas at once (the trim and the loudness ruler). The trim toggle takes you back to step 3, so it holds.
- **Runs clean, sound on click, files.** The context is made on a play click, a pad pointerdown or a number key on step 5 only. All 48 samples and offsets.json are read in place and tracked (352 samples, offsets.json, in `git ls-files`). Nothing copied.
- **Note for the maker (not a remake):** the step-5 found text is fixed at the 10 and 20 dB numbers while the meter follows the slider. That's fine. Just know a reader at 30 dB will see the trimmed spread *rise* again (all 88 keys: 24.2 ms median, against 5.7 at 20 dB), because the ruler then sits near the −30 dBFS onset threshold, and the text doesn't explain why.

## Checks run

- `node "Projects/Phoneme Choir/Phoneme Choir — rich — check.mjs"`: **all pass** (31 lines).
- **Independent recompute** in Python/numpy (soundfile reads; not the piece's engine), over the 352 regions parsed from `phoneme_choir.sfz`: the page's rule matches offsets.json **exactly for 347 of 352**. The other five are within 3 samples (boom/am_michael −1, zap/bf_emma −1, hey/am_fenrir +1, hup/am_adam +3, tut/bf_emma −1). Every SFZ `offset=` equals offsets.json's. Onsets **22.88–217.88 ms, median 54.65**. Knock **137.75 ms in bf_isabella, 31.25 in am_puck**.
- `node _ops/rich-face/conform.mjs "Phoneme Choir"`: **errors 0, warnings 6**. That's 4 sandbox-blocked (CORS from origin `null` on the opaque browser pass) and 2 play-silent that follow from them, the same lines landed 2D Torus faces carry. **Keep with note**: on the piece origin both pieces fetch and play (below).
- `node _ops/rich-face/fingerprint.mjs "Phoneme Choir"`: The Two Lessons `04d52f6e8fe6`, **in step**. The `.md` is untouched by the maker's commit (`git show --stat`).
- `node _ops/rich-face/untracked.mjs "Phoneme Choir"`: every file the face names is tracked.
- **The face, headless** (Chromium via playwright, served by `rich-server.mjs --root <worktree>`, scrolled so both iframes load). Both pieces walked step by step and played every step (the button went to ■ stop where a sound runs). The meters read the numbers above. The proposal chip shows on both figures. **Console: clean** on the walk that loaded both pieces. One renderer `postMessage` origin-mismatch warning (8857 → 8856) appeared once on a first load and didn't recur; it isn't from either piece.
- Not checked: the hidden-page hush and the one-minute cap, which are the kit's (not re-run per piece); Safari and Firefox; what any of it sounds like. An agent can't hear the lag or the trills.

## The offers

**Offer 1 (claim-change, Kokoro syllabifies repeated consonants): confirmed, and extended.**
- **The renders are reproducible.** I ran the maker's render script, unchanged except for its output folder (scratch), with Loudon's TTS venv. All **24 WAVs and renders.json came out byte-identical** to the committed ones. Total 1.0 MB.
- **Kokoro is the page's own tool.** The page's Stack names Kokoro-ONNX in `/Users/loudonstearns/documents/TTS/` (`Projects/Phoneme Choir.md:50`), and the script loads `kokoro-v1.0.onnx` and `voices-v1.0.bin` from there, with the build's call (`create(text, voice, speed=1.0, lang="en-us")`, `generate.py:252`). The build log names the venv but not the kokoro-onnx version (`build-log.md:6`), so "the build's settings" is true of the call and the files. The version at build time is unrecorded.
- **The voices fit.** am_adam and af_bella are two of the four voices that would have voiced phoneme #35 (index 34, `% 3 = 1` → af_sky, af_bella, bm_george, am_adam, the same mapping as tap in the SFZ).
- **The spelling doesn't matter.** The build's own files spell the trill three ways (`brrrahh` in the slug, `brrrrahh` in `generate.py`'s comment, `brrrrahhh` on the page). All three phonemise to the same shape: /bˌiː/ + repeated /ɑːɹɹ/ + /ˈɑː/.
- **Letter names.** brrrrahhh → /bˌiːˌɑːɹɹˌɑːɹɹˈɑːɹɹˈɑː/, and the letters alone give b → /bˈiː/ and r → /ˈɑːɹ/. ssssss → six /ɛs/. ahhh → /ˈɑː/. Confirmed.
- **One nuance for the offer's wording.** uuuuh → /ˈuːuː/, two vowels, not one. So "held vowels shrink" is true, but "become one vowel" is true of ahhh only. uuuuh was phonemised, not rendered.
- **The direct-phoneme door.** Longest run of dips 1 in all six phoneme renders, against 6 (am_adam) and 8 (af_bella) for the modelled 28 Hz flutter. Confirmed.
- **Extended: a stronger door, also shut.** The English voices may never have been trained on `r`, so I asked Kokoro's three Spanish voices (ef_dora, em_alex, em_santa), whose language does trill. I gave them *perro*, *arriba* and *rrrrah* through espeak-ng's `es` front end, and /pˈero/ and /brrrrˈa/ handed in directly. Longest run 2, once (ef_dora *arriba*, two dips 33 ms apart, the shape of a two-tap trill, and what ssssss reaches by chance). So the finding holds past the English voices, with one honest caveat: a natural word-medial trill of two or three taps would read 2 or 3 at best, and the ruler needs 3, so a short real trill might be missed. The piece already says this; the ear decides. These renders are scratch, not committed.

**Offer 2 (claim-change, per-file onset detection): confirmed. The sentence is true of onset and false of loudness, not wrong outright.**
- **Recomputed independently over all 88 keys.** I measured how far apart a key's four voices reach "within D dB of that file's loudest 5 ms", untrimmed → trimmed:
  - 20 dB: **79.7 → 5.7 ms** (53 keys within 10 ms)
  - 10 dB: **99.8 → 59.9 ms**, with **5 keys within 10 ms** (knock, blam, woof, arf, oink)
  - 15 dB: 88.8 → 17.8
  - 30 dB: 61.4 → 24.2
  - On the single loudest sample: 122.6 → 78.4
  - From the trim to the file's loudest 5 ms: a median **98.5 ms** (12 to 245).
- **Judgement.** Line 84's "every key fires immediately into the percussive transient regardless of voice" is true if the transient is where the attack starts. That is exactly what the trim aligns: every file starts 1 ms after its first 5 ms above −30 dBFS, by construction. It is false if the transient is the loud part of the word. That still differs by voice by about 60 ms at 10 dB. The sentence that is actually false is line 89's "so we land on the transient peak": the key starts a median 98.5 ms *before* the file's loudest 5 ms.
- **For the offer.** Name line 89 alongside line 84 when it goes home. The maker's suggested wording ("every key starts its sound at once, whatever the voice; how soon the word gets loud after that still varies by voice") is right.
- **A pointer for the open question (which ruler matches the felt beat).** Speech research calls a syllable's felt moment its perceptual centre, or P-centre (Morton, Marcus and Frankish, *Psychological Review*, 1976). It tends to sit near the vowel's onset rather than the acoustic onset, which would favour a ruler nearer 10 dB than 20. That's from memory, not fetched this run. The ear still decides.

**Gathering or making?** Making, and the manifest says so (`origin: made`). The build's audition files didn't survive, so these are new outputs of the same experiment, with the same tool and the same call. They are not the build's evidence recovered, and the caption and lead say plainly that they are new. **Is 1 MB justified?** Yes. There are 24 files of 23–61 KB, synthesised voices only, well under the 25 MB cap, and they are the whole evidence for the piece's test. The public face can't run Python, so being reproducible from a tracked script doesn't replace tracking them. The README asks that the public face grow "by what a face is worth playing" (`_ops/rich-face/README.md` § Media a face plays), and this is.

## The face as a whole

It makes the page's idea felt, not busy. Both lessons on this page are claims about what you hear: a lag you can't account for, a trill that didn't come. Both pieces turn the claim into something you can play, then measure, and both measurements push back on the text a little. The trim aligns the start of the sound, not the word. And the spelling was a front end reading letter names, with the trill still absent past it. That is the face doing what Enrichment asks: testing the text rather than restating it, and holding what it found as offers. Two pieces for two lessons is the right count. What neither piece can do is the page's own open question, whether this feels like a percussion controller. That wants Loudon at the pads, trim on.
