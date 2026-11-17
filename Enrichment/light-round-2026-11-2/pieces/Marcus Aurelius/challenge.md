# Challenge — Marcus Aurelius, "Epictetus, on paper"

2026-11-17, one challenger (Opus), brief `challenge-v2.md`. Condensed by the working session from the challenger's report. The challenger read the sources itself on the web the same day.

**Verdict: remake.** The dates are mostly sound and the picture reproduces exactly. The caption's central "why" rests on one date the sources do not give as plainly as the piece says, and the honest line misstates what its primary source says.

**Where the challenger stumbled, reading the picture cold:** the dotted line drops from Arrian's block (about 106) to a label that starts near 107, so for a moment "reach Marcus on paper" sits before Marcus was born; the "c. 11 yrs" bracket floats between the lifelines; about 110 words at 11.5 px, and the subtitle repeats the caption; the plague, war, Meditations and Lyon are a second story (they do tie to the page's own sentences), making it a timeline of a life more than a picture of one sentence.

**Dates checked against sources the challenger read:**
- Epictetus born c. 50s (SEP, IEP); banished c. 89 (SEP "presumably", IEP); dies c. 135 (SEP; IEP only in a heading). Fair as drawn.
- Arrian c. 104–108: IEP's "104–107" verified and called a conjecture. **Misattribution:** SEP's "around the year 108 by Millar's (1965) dating" dates the teaching represented in the Discourses, not Arrian's writing-down. IEP also raises that Epictetus may have written the texts himself.
- Marcus born 121, adopted 138, emperor 161 (IEP, SEP, Livius). Verified.
- **Turns to philosophy at 25, 146/7: the problem.** Fronto, Ad M. Caes. 4.13, has Marcus at twenty-five saying he has "as yet drawn into my soul nothing of sound opinions and purer reasonings" after reading Ariston. It does not say he turns to philosophy; "conversion" is Birley's and Wikipedia's reading. A primary source the maker did not cite, Historia Augusta, Marcus 2.6: "When he was twelve years old he adopted the dress … of a philosopher" (dated April 132). SEP also quotes Meditations 8.1 on not having been a philosopher "since youth". So the sources hold two turns, one at 11 or 12 while Epictetus was alive, one at 25. On the earlier date the "c. 11 yrs" gap goes negative and the caption's "why it was a book" no longer follows from it. The piece draws one turn as fact, in red, and the honest line calls the letter "the primary source" for it.
- Lyon 177 (Eusebius HE 5.1; Livius); dies 180 (Dio 72.33–34); plague from 165/6, outbreaks to 189 (Duncan-Jones, Arctos 52, from the journal PDF; the same chronicle lists mortality peaks 190–2); war c. 166–180 (Livius); Meditations c. 171–175 / last years / 174 (IEP, SEP, Livius). Fair as drawn.
- Arithmetic matches `dates.json`.
- Not re-read: Wikipedia on the Marcomannic Wars and on Rusticus; Birley.

**The central link, Meditations 1.7:** the Greek has him meeting "the Epictetan notes" (hypomnemata), shared from Rusticus's own home; seen via a search snippet and a note, not a critical edition. "Lent" is a fair gloss. The dotted line is owned as the maker's and the identification as unsettled. Stronger ground the maker missed (SEP, verified): Marcus in 1.7 speaks of reading Epictetus's hupomnemata, and Arrian's own preface uses the same word (the preface's Greek seen only quoted; unverified).

**Words and workshop:** the two-source guard is real and fails loudly (the challenger cut a source in a scratch copy and the script refused). But `make.py` hardcodes every printed year, so the guard checks the data, not the printed text. `dates.json` has a stale frame and a stale note; neither ships. `shop check` 2 of 2; a scratch rerun gave a byte-identical SVG and PNG.

**What must change:**
(a) Stop stating "turned to philosophy at 25" as fact. Either draw both turns (132, the philosopher's dress at twelve; 146/7, the Fronto letter), or keep 146/7 labelled as the scholars' reading of the letter and name the other in the honest line. Rest the caption's "why" on what holds under both: the boy in Rome, the teacher in Nicopolis, who died when Marcus was about fourteen. Drop or requalify the "c. 11 yrs" bracket.
(b) Honest line: SEP's 108 dates the teaching; the letter is the primary source for his age, not for a turn.
(c) Optional: ground the dotted link in the shared word hupomnemata.
(d) Cut the words inside the picture; drop the subtitle that repeats the caption; put "year unknown" where it cannot be read as about 107.

**Specialist passed over?** No.

**Page offers:** line 76, "his own teacher Epictetus", is wrong (SEP: Marcus "was never in fact his pupil"), and the maker missed it; "He learned his Stoicism from a book" overstates (Historia Augusta 3.2–3 has him attending Stoic lecturers; Dio 72.35); `People/Epictetus.md` line 82, "learned this philosophy directly from a former slave"; "at night, in a tent" is in no source read; the recommended path names the Enchiridion where Meditations 1.7's notes match the Discourses more nearly.

**To the next maker:** when a date is the hinge of your "why", go back to the primary text and read what it actually says, then look for a second primary source that disagrees. The single tidy number was the summary's, not the source's.

## The maker read the sources before remaking

2026-11-17. The maker read the Fronto letter whole: Marcus gives his age and his poor progress, puts Ariston aside and returns to rhetoric; nothing in it is a turning. It verified Historia Augusta, Marcus 2.6 (Magie's Loeb), and that SEP's 108 dates the teaching. It could not reach the Greek of Arrian's preface. It chose a smaller piece for the one sentence: two lifelines, about 45 words, the second story dropped, the notes' path ending at Marcus's name with "the year is not recorded".

## Second verdict, on the remake (`met-on-paper-2`) — keep, with one fix before placing

Same challenger, reading cold first.

**Cold read:** smaller and cleaner, readable at 1000 px. One stumble: the dotted path runs leftward across the 50–106 stretch of the axis before turning down, and for a moment reads as going back in time; "the year is not recorded" rescues it.

**Checked against the files:** scratch rerun byte-identical SVG, matching PNG; `shop check` 4 of 4; the digit guard is real (a hard "12" in a label made the script refuse); the "turn at 25" and the bracket are gone; SEP's 108 correctly attributed; three SEP quotes, two Wikipedia dates and the Historia Augusta's Latin for his birth verified by fetching the text.

**What still stands:**
1. **"At 12" is wrong against its own primary source. Must change.** The Latin of HA 2.6 is "nam duodecimum annum ingressus habitum philosophi sumpsit": having entered his twelfth year, so eleven. Magie's "when he was twelve years old" is loose; Birley's April 132 is exactly the Latin (born 26 April 121). The maker's own note had found the mismatch. Set the age to 11, or write "in his twelfth year", and the block to 132–133. (The challenger is confident of the idiom and did not read Birley himself.)
2. A misquote in `dates-2.json` and `lines.md`, workshop only: SEP's sentence is "In i.7, Marcus speaks of reading Epictetus' 'hupomnêmata'; Arrian, who wrote down Epictetus' teachings, named them hupomnêmata". So the shared word the maker could not reach in the Greek is stated in the SEP sentence it cites.

**The three questions the session asked:**
- The red cloak does make a claim of its own, more weakly than the dropped one. The source really says it, but it is one late, often unreliable life, and `lines.md` reads it as "Marcus's philosophy began while the teacher lived", which is stronger than a cloak. Recommended, not required: draw it in the grey of the Arrian block, and let the caption name the source ("a late Roman life says…").
- "Both alive" can be read as "could have met", and that reading is not false; no source rules it out. The risk is "met". "Both alive · never his pupil" is sourced, if wanted inside the picture. Optional.
- A first-time reader mostly learns why it was a book, with the caption. The places, "Rome" and "Nicopolis, Greece", are the weakest-weighted words in the picture and carry half the why. Optional: make them stronger.

**To the next maker:** when a source is a translation, check the number in the original before drawing it. "Entering his twelfth year" is eleven.

## The fix and three choices, applied by the maker — 2026-11-17

Seen by the working session at size; no third verdict, as the challenger said none was needed.

1. The maker read the Latin of HA 2.6 on LacusCurtius itself: "duodecimum annum ingressus", eleven. The label is now "at 11, a philosopher's dress", a block at 132–133, the number drawn from the data. `lines.md` says it first followed the English and why it now follows the Latin.
2. The SEP sentence is quoted exactly. The caption leans on the shared word only as far as SEP does.
3. The dress is grey, not red; red now goes to the notes' path and its words, because the notes are the claim.
4. The column reads "both alive, never his pupil".
5. "Rome" and "taught at Nicopolis, Greece" are in full ink.
6. The dotted path is a curve, so it reads as the notes travelling and not as running back along the years. Its tail still crosses the 50–80 stretch; owned as no date.

Not verified by anyone: Birley himself; the Greek of Arrian's preface.
