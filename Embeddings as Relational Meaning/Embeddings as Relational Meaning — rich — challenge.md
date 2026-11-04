---
title: "Embeddings as Relational Meaning — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Embeddings as Relational Meaning]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Embeddings as Relational Meaning's first rich face: one keep and one remake, each with its reason, both headline numbers recomputed from the raw vectors by my own code, and both offers confirmed in their numbers and re-judged in their kind, so the maker's next round and Loudon's approval start from what was checked."
---

# Embeddings as Relational Meaning — rich — challenge

Proposal round, cloud pilot, run 2026-11-04. Challenger: claude-opus-5-5, which did not make this face. Judged against the page as it stands (`Embeddings as Relational Meaning.md`, both made sections in step), the manifest, both pieces' source, `extract.mjs`, `check.mjs`, and the maker's commit body (`2dc7434a`) as its only account. Tuning items 1, 3, 5, 9, 11 and 12 read; item 12 (kind of claim, the text as a leak surface, whose numbers, kind of offer) is the lens for most of what follows.

## Checks run

- `node _ops/rich-face/conform.mjs "Embeddings as Relational Meaning"`: 2 pieces, both pre-contract, errors 0, warnings 0, browser pass at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Embeddings as Relational Meaning"`: the opening (`0f4259787ab4`) and The Geometry of Meaning (`d0f4aaa31b10`) in step, each with one piece.
- `check.mjs` (run on a scratch copy): all checks pass. Every baked count matches the engine; the maker's own float64 scorer agrees.
- `extract.mjs`, run on scratch copies of the pieces against the package and `questions-words.txt`: both rebuilt pieces are byte-identical to the committed ones. 228 quads dropped for holding king, man, woman or queen, confirmed; 3,676 quads in the four sections, 3,448 kept.
- Package provenance read in the package itself: `ACKNOWLEDGEMENT.md` names GloVe pre-trained vectors (PDDL 1.0), `LICENSE` is MIT. The "sg" in the name is not skip-gram here; the maker's "GloVe-derived" is right.
- Rich face through `rich-server.mjs --detach`, headless Chromium (playwright from `_ops/stigmergy/app`), Google Fonts blocked as the cloud blocks them: both frames load and reach their heights once scrolled into view (728 and 790 px); I saw no "reported no height" text in this run. I walked all five steps of each piece and ran both tests in the browser: every count equals Node's. Console: three `ERR_FAILED` (the blocked font requests: the face and the two pieces) and two Permissions-Policy `bluetooth` warnings from the server header. Nothing from a piece's own code. No sound, no timers, no animation loop in either piece, so there is nothing to hush. Server stopped.
- Both pieces still carry a `<link>` to Google Fonts. It fails quietly to the fallback stack here; it is not "fully inline". A note, not a fault: nothing breaks.

## My own recompute

My own script, float64 from the raw package vectors (not the 16-bit store), my own loops, the pool rebuilt the same way:

| reader | pool 3,145 (chance 1 in 3,142) | pool 100,000 |
|---|---|---|
| the arrow, b − a + c | 2,906 / 3,448 = **84.3%** | 2,780 / 3,448 = **80.6%** |
| c alone | 1,530 = 44.4% | 1,236 = 35.8% |
| b + c (ignores a) | 1,298 = 37.6% | 1,183 = 34.3% |
| b alone | 75 = 2.2% | — |
| arrow on real vectors re-dealt to other words (3 seeds) | 0, 0, 1 of 3,448 | — |

Per section at 3,145 the arrow is 482/506, 347/420, 1,087/1,332, 990/1,190, exactly the maker's. The pool is 3,145 words with 3,142 candidates, which is what the piece shows ("the other 3,144"); the commit body and offer 1 say 3,146 and 3,143. A slip in the account, not the piece.

Regions: leave-one-out 35 of 36 (tone → emotions), the same. Real vectors re-dealt to other words, five seeds: 19, 16, 14, 14, 2 of 36. Question two in float64: third 0.222/0.502, fourth 0.233/0.516, fifth 0.224/0.580, sixth 0.215/0.566, seventh 0.254/0.573, ninth 0.271/0.553 (interval names / plain ordinals), the maker's numbers to three places. Page sum: queen 0.770 with the inputs set aside; king 0.836 with them in, and king first over all 341,479 words.

## The brief's three questions about controls

**Is "shuffled vectors" the right control arm?** It is a floor, not a fair control. Permuting each word's own components destroys every shared direction, so any reader on it scores near zero. The fairer null the brief names (real vectors re-dealt to other words) gives the same floor: 0 to 1 of 3,448. Neither makes the real arm look better than it is, because the verdict rule does not lean on them: the arm that decides is c alone. The piece should say so.

**Is the 44.4% c-alone reader a real leak check?** Yes. It is the standard "the answer is a neighbour of c" baseline (Linzen 2016 calls it only-b, in his lettering). I added the other standard baseline, a reader that ignores a and reads b + c: 37.6%, under c alone. So c alone is the strongest of the cheap readers, and the arrow clears it by 40 points at 3,145 and 45 points at 100,000. The page's own quad is out of the test, and step 4 shows it without scoring it. The surrounding text is not a leak surface here: the page names one quad, and every quad holding any of its four words is gone.

**Does the rule history make question two's third rule honest, or chosen after seeing the data?** Both, and the second matters less than it looks. The rule was fixed after the maker had seen fifth's neighbours and two earlier rules, and the piece says so in step 5. So I asked whether the choice of the two centres made the result. Across every pairing of 5 plain ordinals from ten (first, tenth, eleventh, fourteenth, sixteenth, twentieth, thirtieth, fortieth, fiftieth, hundredth) with 6 interval words from twelve (the six names plus chord, pitch, melody, harmony, scale, note), 232,848 pairs, the ordinal sense wins 4 or more of 6 in 232,653: 99.92%. The verdict was not picked; it is there whatever centres you pick. The disclosure is honest and the robustness makes it safe.

## The pieces

### directions.html — Embeddings as Relational Meaning (opening)

1. **Test or decoration?** A test. "Directions … encode semantic relationships, syntactic roles" could have failed: if the arrow only borrowed nearness to c, it would not clear the c-alone reader by 3 SE in each section. It clears by 9.9 to 29.1 SE. Family and capitals are the semantic sections, comparative and plural the syntactic.
2. **Faithful?** Yes. The page's sum is shown, not scored, and step 4 shows king winning when the inputs can answer, calling exclusion what "the analogy literature does". Whose numbers is said twice, in the caption and after the test: GloVe, static, 100 dimensions, not a transformer, and the page's opening speaks of large language models.
3. **Walks up?** Yes: one angle, one word's neighbours, one arrow against others, the page's sum, the test last, with its rule and chance stated before the button.

Verdict: **keep**. Notes: say in the rule that the shuffled arm is a floor and the decision rests on c alone; the account's 3,146 / 3,143 should be 3,145 / 3,142.

### regions.html — The Geometry of Meaning

1. **Test or decoration?** Question one is a test of "categories are regions" (35 of 36 against 12 by chance, 2 to 19 for re-dealt vectors). It is an easy test: three categories this far apart would be hard to miss. Question two is a test of what is in the page's own example region, with a control arm that can refuse a verdict, and on shuffled vectors it does refuse. "Gradients, not walls" cannot fail, and the piece says so.
2. **Faithful?** Mostly. It names its numbers as static GloVe and says it cannot run the transformer claim. One sentence overreaches. Step 4 says fifth's "nearest words are ordinals". The list is sixth, seventh, fourth, eighth, third, ninth, second, first, and six of those eight (second, third, fourth, sixth, seventh, ninth) are interval names too. The list cannot tell the two senses apart. Only question two can, and step 4 states question two's answer before the test reaches it.
3. **Walks up?** Yes: one axis, a map, a walk between regions, one point per word, the test last.

Verdict: **remake**, one sentence. In step 4's note on fifth, say that its nearest words are ordinals and interval names at once, so the list cannot decide, and leave which sense wins to step 5. Drop the same sentence ("Fifth's eight nearest words are all ordinals") from offer 2. Nothing else needs to change.

## The offers

**Offer 1, opening, claim-change: numbers confirmed, kind disputed: no-claim-edit at most.** Every number holds on my recompute: king 0.836 against queen 0.770 with the inputs in, king first over 341,479 words, 84.3% against 44.4% at 3,145 words, 80.6% against 35.8% at 100,000. But read what kind of claim the page makes (tuning 12(a)). "king − man + woman ≈ queen" is the textbook example under the textbook scoring, and that scoring sets the inputs aside. Mikolov's own evaluation does it, and the piece's own step 4 says so. The page never claimed the tip's nearest word, inputs included, is queen. Adding "once the three input words are set aside" spells out a convention; it changes no claim. Naming the example as word2vec's is an attribution, also no claim changed. And the piece cannot measure a large language model, so it has no evidence that the opening's LLM framing is wrong, only that its example comes from static vectors. The third part, that the claim holds at 84.3%, confirms the page and asks nothing. Re-file as `no-claim-edit`: name the example's source, and, if Loudon wants it, the convention. Fix "3,146 words" to 3,145. It is for this page's own text.

**Offer 2, The Geometry of Meaning, claim-change: confirmed, kind stands as an addition, not a correction.** My numbers equal the maker's to three places (ordinals 0.502–0.580, interval names 0.215–0.271, control 9 of 9), and the verdict survives 99.92% of 232,848 other choices of centre. But the page is not wrong. Question one confirms its interval region (35 of 36). The page already allows for the finding: its second paragraph says static vectors give one point per word and context goes further. What the offer adds is a new example, in the page's own domain, of the case it already makes. That adds a claim, so `claim-change` is the right kind, but it should be filed as an addition, not as something the page got wrong. Drop "Fifth's eight nearest words are all ordinals"; six of them are interval names too, and question two is the evidence. It is for this page's own text.

## The face as a whole

It makes the idea felt, not just busy. The directions piece does what the page's forward vector asks for: it takes the relational claim and puts it where it could lose, against a reader who knows c and nothing of the arrow, and it wins by 40 points. A reader leaves knowing how much of the famous trick is nearness (about half the hits) and how much is direction. The regions piece finds the better thing. The page's own example category turns out to hold, in static vectors, the very ambiguity the page says only context can resolve: fifth the interval and fifth the place in a race are one point, and the race is nearer. That is the page's second paragraph proved inside its first. Both pieces say plainly whose numbers they show. What neither can do, and both say, is touch a transformer, which is where the page begins.
