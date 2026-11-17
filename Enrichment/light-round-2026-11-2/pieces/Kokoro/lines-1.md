# Two commas, one more pause

**Files:** `two-commas.m4a` (11.4 s), with its picture `two-commas-picture.png` (`.svg`).

## Caption

**Punctuation changes how this voice phrases, and two commas show where.** Kokoro reads "The coupling constant K is phrasing density and rhythmic clarity." first without commas, then as the page writes it, "…constant, K, is…". The difference measured here is a pause *before* K. Across 40 takes (four voices, ten seeds each), a quiet stretch of 50 ms or more came before K in 0 of the 40 without commas and in all 40 with them. With commas it lasted 50 to 300 ms, depending on the voice. Both versions already had a pause *after* K, 220 to 360 ms without commas. That is the maker's measurement, not the page's: the page says the bare letter "runs into the next word". Nobody has heard it yet.

## What is real and what is a choice

**Real, from Kokoro.**
- Every sample is Kokoro 0.9.4 (`KPipeline`, speed 1.0), reading the two sentences.
- The word positions are Kokoro's own token timings. They are where it planned each word, not positions measured from the sound.
- The sentence is the last one of the Kuramoto paragraph Kokoro first narrated (2026-05-26). That take is the one Loudon reviewed, and the review is where the comma fix came from (tuning item 7).

**The voices are a choice.** af_heart is the voice of the 2026-05-26 take and is the one drawn and heard. The survey adds af_bella (the page's Study default), am_michael (named in the page's Radio Play recipe) and am_adam (the maker's pick, for a second male voice).

**The seeds count less than the 40 suggests.** A torch seed changes only Kokoro's noise, not its timing:
- Every take of one voice and sentence had the same length across the ten seeds.
- No pause moved by more than 10 ms between seeds.
- One seed run twice gave identical samples.

So the 40 takes are really four voices' worth of evidence, each confirmed ten times.

**The detector is the maker's.**
- The sound is cut into 10 ms frames. Each frame's level is measured in dB below the take's loudest frame.
- "Quiet" means 40 dB down (the dashed line). A pause counts at 50 ms or longer.
- "Before K" is the longest quiet run that ends between the middle of "constant" and K's loudest frame. "After K" is the longest that starts between K's loudest frame and the middle of "is".

How the count moves with the cutoff:
- **At 35 dB down:** the count is the same, 0 and 40.
- **At 45 dB down:** with commas, 32 of 40. am_adam's pause falls to 40 to 50 ms and drops under the line in 8 of its 10 takes.

By voice, with commas, at 40 dB, the pause before K is:
- af_heart 140 ms
- af_bella 300 ms
- am_michael 80 ms
- am_adam 50 to 60 ms

Without commas it was 10 to 30 ms in every voice.

**Some of that quiet is the K itself.** A spoken K starts with the tongue closing off the air, a short silence before the sound. Part of any quiet before K is that closure. am_adam's 50 to 60 ms may be little more than it.

**The takes in the piece were chosen by a rule fixed before rendering:** the af_heart commas take whose pause before K is nearest the median of its ten, and the bare take of the same seed. All ten were 140 ms, so the tie went to the lowest seed, 1.

**The numbers in the picture are from the saved file, not the raw takes.** ffmpeg's two-pass loudnorm ran once, on the joined file, so the two halves kept their level against each other.
- It was asked for `linear=true` but ran in dynamic mode, because reaching −16 LUFS with plain gain would have put the true peak near +2.8 dBTP.
- Dynamic mode lifted the quiet between words. The drawn take's 140 ms pause before K measured 110 ms after loudness. The pause after K went from 260 to 240 ms without commas and from 240 to 230 ms with commas.
- The survey counts are on the raw takes. The picture and its ms labels are from the decoded m4a.

**The house numbers, measured on the m4a.**

| Measure | Value |
|---|---|
| Length | 11.389 s |
| Integrated loudness | −16.1 LUFS |
| Without-commas half | −16.0 LUFS |
| With-commas half | −16.1 LUFS |
| True peak | −1.4 dBTP |
| Sample peak | −1.42 dBFS |
| Format | 24 kHz mono, AAC 64 kbps by afconvert |

24 kHz mono is the house number for narration, not the 48 kHz stereo of a finished mix. The m4a's bytes differ from run to run, but its decoded samples matched across the last two runs.

**A second route, the 2026-05-26 takes from git.** These are commit `a94481f0` (without commas) and `36d1ae66` (with commas, after the review).
- In the first 2 s of the last sentence, the bare take has one quiet run of 50 ms or more (33.51 to 33.66 s). It falls after the start of "k" in that take's own Whisper read.
- The commas take has two (220 and 140 ms). It has no word timings, so the two are counted and not placed against K.
- This agrees with "one more pause". It does not show on its own where the pause falls.

**The page's wording differs, and this is offered to the page, not settled.**
- The gotcha says the bare letter "runs into the next word". Tuning item 7 says the 2026-05-26 read put "K into 'is' without a breath".
- On these takes, the bare K is followed by 220 to 360 ms of quiet and preceded by none of 50 ms or more.
- Loudon's own words, recorded in item 7, ask for "more pause … before the variable name".
- This is one model version, a detector with chosen cutoffs, and no ear. The take Loudon heard in May may have sounded different to an ear than a level meter says.

**What a listener might hear instead.** The commas take is only 25 to 150 ms longer than the bare one, depending on the voice (75 ms for af_heart). A listener may hear a slower or more careful K rather than a new pause. They may also notice the pause after K, which is in both, more than the new one before it.

## Leaking in

[[Kuramoto Coupling]]: the sentence is the last of its *Speech rhythm and groove coupling* paragraph, "The coupling constant K is phrasing density and rhythmic clarity.", which Kokoro narrated for its sync-arriving scene.

## Anchor

"Put commas around a bare variable letter" (§ Gotchas, Pronunciation and prosody).

## Made with

Kokoro (af_heart; the survey also af_bella, am_michael, am_adam) → Sound from Code (the quiet-run detector, the survey, the choice, the join) → ffmpeg (two-pass loudnorm, measures; afconvert writes the AAC) → Drawn SVG.

## Not for the bundle

`make.py`, `jobs.json`, `report.json`, `survey.json` and `provenance.json` stay in the workshop. Only `two-commas.m4a` and `two-commas-picture.png` travel.
