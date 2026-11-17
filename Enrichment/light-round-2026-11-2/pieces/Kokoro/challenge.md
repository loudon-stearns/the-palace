# Challenge — Kokoro, "Two commas, one more pause"

2026-11-17, one challenger (Opus), brief `challenge-v2.md`. Condensed by the working session from the challenger's report. The challenger ran Kokoro itself, in scratch only.

**Verdict: remake, small: words and picture. The sound and the measurements stand.** It turns a one-line gotcha into something a reader can hear and joins it to "punctuation changes prosody".

**Where the challenger stumbled, reading the picture cold:**
- The largest shaded box is the 240 ms quiet after K in the take without commas, while the page sentence beside it says the bare K "runs into the next word". A stranger sees the opposite of the page, with no word about it inside the picture.
- "0 of 40 takes … 40 of 40" in large type reads like forty independent trials; the qualifier is the smallest grey type.
- The picture calls the quiet "a pause" everywhere.

**Recomputed, its own code and detector:**
- The m4a: 11.389 s by ffmpeg's decode (11.375 s of audio; the rest is AAC remainder); sample peak −1.42 dBFS; true peak −1.39 dBTP; −16.1 LUFS; halves −16.0 and −16.1; 24 kHz mono. Meets Sound from Code's house numbers for narration.
- Gaps on the saved file: bare, nothing of 50 ms or more before K, 240 ms after at −40 (255 at −35, 130 at −45); commas, 110 ms before K (140, 105), 230 after. Match the picture.
- The loudnorm claim verified: on a raw seed-1 render the pause before K is 140 ms; dynamic loudnorm shrank it to 110. So the picture's "40 dB" on the saved file is about −45 dB on the raw takes the survey counted. Owned in the honest line, not in the picture.
- The survey: every tally reproduces (0/40 and 40/40 at −35 and −40; 32/40 at −45; per-voice 140, 300, 80, 50–60 ms).
- Independence: true. One set of word timings per voice and text across ten seeds. Its own renders: seed 1 twice identical; seed 1 against seed 7 the same timing but samples differing by about −20 dB RMS, so "only noise" is right about timing and the difference is not tiny.
- Reproduction: scratch rerun gave PNG and SVG byte-identical, m4a decoded samples identical. `shop check` passes.
- The leak sentence is on Kuramoto Coupling.md line 124.

**Where it goes further than the maker:**
1. **The 40/40 is fragile.** The challenger's own detector puts am_adam's commas pause at 45 ms at −40, under the 50 ms line. On that measure it is three of four voices. One voice sits on the threshold.
2. **The closure question, tested by changing the letter** (the challenger's own probe, in its scratch `letters.json`; its numbers, one seed, not checked by a second detector). With X and N, which start on a vowel, commas gave a quiet of 50 ms or more before the letter in only 4 of 16 voice-and-frame cases; what the commas did almost every time was lengthen the quiet after the letter. With K in a second sentence, 2 of 4 voices. Its reading: the comma's boundary shows as silence before K largely because K starts with a voiceless closure. The effect is real against the bare take, and the "pause" is partly the K itself, and the result holds for this sentence and this letter, not for "a bare variable letter" in general.
3. **The May takes, made exact (verified by the challenger).** Re-rendering the 2026-05-26 paragraph with today's Kokoro reproduces both git takes (envelope correlation 1.000 and 0.9996), so Kokoro's own token clock can be laid on the takes Loudon heard. Bare: nothing of 50 ms or more before K, and a 150 ms quiet straddling the K/"is" boundary. Commas: a 205 ms quiet before K. This settles what the maker left open, and is much stronger support for the piece's direction.

**The words:** the direction is handled honestly ("the maker's measurement, not the page's"); it neither hides the difference nor declares the page wrong. No "he", no name. What overclaims: the 40/40 framing; "pause" without the closure; "two commas show where" reading as a general rule.

**What must change:**
(a) The picture's bottom line and the caption's lead: state the evidence as four voices of one sentence, and say one voice is at the line.
(b) Own the closure in the caption, one clause.
(c) Keep the claim to K in this sentence.
(d) In the picture, mark the bare take's 240 ms box as present in both takes, so the stranger's stumble is met inside the picture.
(e) Optional and stronger: use the exact re-render of the May takes as the second route.

**Offered, unverified by the challenger:** reach −16 LUFS with plain gain and a true-peak limiter, so the drawn lanes measure at the survey's threshold; draw K beside X to show the closure.

**What a listener might hear in place of the claim:** a crisper, more deliberate K; the bare take's long gap after K, the biggest silence in the file; a different phrasing overall. **Only an ear can judge** whether 110 ms of quiet, partly closure, is heard as a pause; whether the bare K sounds run into anything; whether the commas take is more natural speech, which was the original criterion.

**Specialist passed over?** No.

**Page offers:** the gotcha's direction and tuning item 7 ("K into 'is' without a breath"), against the exact May reproduction and Loudon's words, pending his ear; "(Kokoro itself is seeded)" is not so, unseeded renders differ and `torch.manual_seed` makes samples identical; tuning item 7's "em-dashes (`-- K --`) work too": in 0.9.4 `--` gave no quiet before K (only `--` tested); the loudnorm gotcha is contradicted by this round's run.

**To the next maker:** when a TTS gives you its own token clock, re-render the take the person actually heard. Before calling a quiet stretch a pause, change the letter: if it only appears before a stop, part of it is the consonant.

## The maker tested the challenger's two findings before remaking

2026-11-17. The May takes: confirmed by the maker's own re-render, and made the second route (without commas, nothing before K and about 150 ms across the end of K into "is"; with commas, 210 ms before K). The closure reading: the maker's own probe (ten letters, two sentences, four voices) found it holds in the challenger's sentence and not in the piece's: commas gave a quiet before the letter in 27 of 40 cases against 9 without; vowel-initial letters got it too (14 of 20 against 7); T, a stop like K, in 1 of 4. So the caption claims only K in this sentence.

## Second verdict, on the remake (`two-commas-picture-2`) — keep

Same challenger, reading the new picture cold first.

**The picture reads clearly.** "In both reads" explains the large box; the red box is "only with commas"; it says "quiet"; the large line states the evidence as four voices of one sentence with one at the line. Figures match the challenger's own decode of the unchanged m4a.

**Checked against the files:** the caption's every point; a scratch rerun of `make2.py` byte-identical for the PNG, SVG and `report-2.json`; `shop check` 5 of 5; the bundle list complete.

**The closure probe: the challenger was wrong in part, and says so.** The maker's counts reproduce from its data. By the challenger's own detector and renders in the piece's sentence: T in 1 of 4 voices, P in 4 of 4, M in 4 of 4, S and F in 3 of 4. A stop like K mostly does not get the quiet and vowel-initial letters mostly do, so "largely because K starts with a voiceless closure" does not hold. Its X and N numbers were right; the interpretation was wrong.

**The May takes:** the maker's numbers match the challenger's. The correlation figures differ because the measures differ (linear amplitude against clipped dB envelopes); both agree on length, lag and where the quiet falls. The difference does not matter.

**Two small things, neither blocking:**
(a) `lines.md` says "In this sentence, N did in 3 of 4 voices and X in 1", but N without commas was also 3 of 4, so the commas added nothing to N's count. Say that, or drop N.
(b) The picture's small last line, "Part of the quiet before K may be the K's own stop", is weakened by the maker's own T result. It could go, or say the stop does not explain it alone.

Also minor: the subtitle's "40 dB down" applies to the saved file, about 45 dB on the raw takes the count came from; `lines.md` says so, the picture does not.

**Only an ear can judge,** unchanged: whether 110 ms before K is heard as a pause or a crisper K; whether the bare K sounds run into anything; whether the commas read is more natural speech. Nobody has heard it.

## The two small fixes, applied by the maker — 2026-11-17

Seen by the working session at size. The m4a is unchanged (sha256 begins `d2b150126b9072fa` before and after).

(a) `lines.md` on N: in the piece's sentence N had a quiet before the letter in 3 of 4 voices with commas and in 3 of 4 without; the commas lengthened it and added nothing to the count. X went from 0 to 1.
(b) The picture's last line now reads "Not just K's own stop: of ten letters tried here, commas gave a quiet before 27 of 40, without 9."
The subtitle now says the 40 dB line is on this file and the counts are on raw takes. The seed fact left the picture to make room and stays in `lines.md`.

One stumble left and owned: "27 of 40" does not say forty of what (letter-and-voice cases); `lines.md` answers it. The working session's own look: that small last line is the densest sentence in the picture.
