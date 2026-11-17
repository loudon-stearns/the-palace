# Two commas, a quiet before K

**Files:** `two-commas.m4a` (11.4 s), with its picture `two-commas-picture-2.png` (`.svg`).

*Remade once, 2026-11-17, after the challenge (`challenge.md`). The sound did not change; the picture and the words did. The first version's picture and words are kept as `two-commas-picture.png` and `lines-1.md`.*

## Caption

**Punctuation changes how this voice phrases a sentence; here is what two commas did to one.** Kokoro reads "The coupling constant K is phrasing density and rhythmic clarity." first without commas, then as the page writes it, "…constant, K, is…".

- **What changed:** with commas, a quiet stretch came before K. In four voices it was there with commas in all four and without commas in none. One voice sits at the line (50 to 60 ms here; 45 ms by the challenger's detector).
- **What did not:** both reads already had a quiet after K.
- **The takes reviewed in May show the same:** re-rendered so Kokoro's own word timings lie on them, the take without commas had no quiet before K, and the take with commas had 210 ms there.

This holds for K in this sentence. With other letters and in another sentence, where the commas' quiet fell varied.

That the bare K has no quiet before it, and does have one after it, is the maker's measurement; the page says it "runs into the next word". Nobody has heard it yet.

## What is real and what is a choice

**Real, from Kokoro.**
- Every sample is Kokoro 0.9.4 (`KPipeline`, speed 1.0).
- The word positions are Kokoro's own token timings: where it planned each word, not positions measured from the sound.
- The sentence is the last one of the Kuramoto paragraph Kokoro narrated on 2026-05-26. That take was reviewed by Loudon, and the review is where the comma fix came from (tuning item 7).

**The evidence is four voices of one sentence, not forty trials.**
- The four voices are af_heart (heard and drawn), af_bella (the page's Study default), am_michael (named in the page's Radio Play recipe) and am_adam (the maker's pick).
- Each was rendered with ten torch seeds. A seed changes only Kokoro's noise, not its timing: every voice gave one length for each sentence across its ten seeds, and no quiet stretch moved by more than 10 ms.
- With commas, the quiet before K was af_heart 140 ms, af_bella 300, am_michael 80 and am_adam 50 to 60. Without commas it was 10 to 30 ms in every voice.
- am_adam sits on the line: under 50 ms in 8 of its 10 takes at 45 dB down, and 45 ms by the challenger's own detector.

**The detector is the maker's.**
- The sound is cut into 10 ms frames, each measured in dB below the loudest frame of the stretch measured.
- "Quiet" is 40 dB down (the dashed line). A stretch counts at 50 ms or longer.
- "Before K" is the longest quiet stretch ending between the middle of "constant" and K's loudest frame. "After K" is the longest starting between K's loudest frame and the middle of "is".
- "Quiet" is used in the picture rather than "pause". Whether 110 ms of quiet is heard as a pause is for an ear.

**The May takes, made exact.** The two 2026-05-26 files in git are `a94481f0` (without commas) and `36d1ae66` (with commas, after the review).
- Each was re-rendered from its own script's text, voice and chunking: af_heart, with 0.25 s between chunks.
- Each re-render came back the same length to the sample (36.475 and 36.375 s), lined up at zero lag, with a 10 ms envelope correlation of 0.986.
- Kokoro's word timings were then laid on the git files, and the detector ran on those files.
- **Without commas:** no quiet before K. One quiet stretch of about 150 ms (33.52 to 33.66 s) runs across the end of K, which Kokoro times at 33.15 to 33.60, and into "is".
- **With commas:** 210 ms of quiet before K (32.95 to 33.16 s, around Kokoro's first comma at 33.00 to 33.11), and about 100 ms across the end of K into "is".

**Is the quiet before K partly the K? Tested by changing the letter.**
- The probe used ten letters: K, T and P (voiceless stops), B and D (voiced stops), and X, N, M, S and F (said from a vowel).
- They went into two sentences, "The coupling constant, _, is…" and "Then the value, _, grows over time.", with and without commas, in the four voices, at one seed.
- **In this sentence:** commas gave a quiet before the letter in 27 of 40 letter-and-voice cases, against 9 of 40 without. Letters said from a vowel gave it too (14 of 20 with commas, 7 without). T, a stop like K, gave it in only 1 of 4 voices.
- **In the other sentence:** what the commas did most reliably was put a quiet *after* the letter (40 of 40, against 5 without). Before it, 19 of 40 against 11.
- So the K's own stop does not explain the quiet before K on its own. It may still be part of it: a spoken K begins with the tongue stopping the air.
- The result is kept to K in this sentence, and "a bare variable letter" in general is not claimed.
- Kokoro plans each comma as 50 to 163 ms of time. Whether that time comes out as silence depends on the letter and the sentence.
- This disagrees in part with the challenger's probe, which found X and N rarely gave a quiet before. In this sentence, X did in 1 of 4 voices (none without commas). N did in 3 of 4, but also in 3 of 4 without commas, so the commas added nothing to N's count. In the second sentence, the challenger's reading holds. On its second reading the challenger checked this with its own renders and agreed: T in 1 of 4, P and M in 4 of 4, S and F in 3 of 4.

**The takes in the piece** were chosen by a rule fixed before rendering: the af_heart commas take whose quiet before K is nearest the median of its ten, and the bare take of the same seed. All ten were 140 ms, so it went to seed 1.

**Loudness.**
- ffmpeg's two-pass loudnorm ran once, on the joined file, so the two reads kept their level against each other.
- It was asked for `linear=true` and ran in dynamic mode, because −16 LUFS by plain gain would have put the true peak near +2.8 dBTP.
- Dynamic mode lifted the quiet between words. The drawn quiet before K is 140 ms on the raw take and 110 ms on the saved file.
- The survey counts are from the raw takes. The picture and its ms labels are from the decoded m4a. So the picture's "40 dB down" applies to the saved file, about 45 dB down on the raw takes. The picture's subtitle says the counts are on raw takes.
- The picture's small last line gives the letter probe's count for this sentence: with all ten letters, 40 letter-and-voice cases, a quiet before the letter in 27 with commas and 9 without.
- The challenger offered plain gain and a limiter instead, so the file would measure like the raw takes. It was weighed and not taken. The verdict let the sound stand, the claim holds on the saved file as it is, and a 9.8 dB limit on speech changes it more than the claim needs.

**The house numbers, measured on the m4a.**

| Measure | Value |
|---|---|
| Length | 11.389 s |
| Integrated loudness | −16.1 LUFS |
| Without-commas read | −16.0 LUFS |
| With-commas read | −16.1 LUFS |
| True peak | −1.4 dBTP |
| Sample peak | −1.42 dBFS |
| Format | 24 kHz mono, AAC 64 kbps by afconvert |

24 kHz mono is the house number for narration, not the 48 kHz stereo of a finished mix. The m4a's bytes change between runs; its decoded samples matched across runs.

**The page's wording differs, and this is offered to the page, not settled.**
- The gotcha says the bare letter "runs into the next word". Tuning item 7 says the May read put "K into 'is' without a breath".
- In both May takes, measured on the files themselves, there is a short quiet running from K into "is". The commas changed what came before K.
- Loudon's words, recorded in item 7, ask for "more pause … before the variable name".
- This is one model version, a detector with chosen cutoffs, and no ear.

**What a listener might hear instead.** The commas read is 75 ms longer in this voice. A listener may hear a crisper or more deliberate K rather than a new pause, and may notice the quiet after K, which is in both reads and is the longest quiet near K.

## Leaking in

[[Kuramoto Coupling]]: the sentence is the last of its *Speech rhythm and groove coupling* paragraph, "The coupling constant K is phrasing density and rhythmic clarity." (line 124), which Kokoro narrated for its sync-arriving scene.

## Anchor

"Put commas around a bare variable letter" (§ Gotchas, Pronunciation and prosody).

## Made with

Kokoro (af_heart; the survey also af_bella, am_michael, am_adam; the May takes re-rendered; the letter probe) → Sound from Code (the quiet-run detector, the survey, the choice, the join) → ffmpeg (two-pass loudnorm, measures; afconvert writes the AAC) → Drawn SVG.

## Not for the bundle

`make.py`, `make2.py`, `jobs.json`, `report.json`, `report-2.json`, `survey.json`, `provenance.json`, `challenge.md`, `lines-1.md` and the first picture stay in the workshop. Only `two-commas.m4a` and `two-commas-picture-2.png` travel.
