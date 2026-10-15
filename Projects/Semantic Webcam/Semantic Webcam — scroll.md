---
title: "Semantic Webcam — scroll"
born: 2026-09-23
links:
  - target: "[[Semantic Webcam]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Semantic Webcam's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Semantic Webcam — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Semantic Webcam]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-15T12:04:23.505Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 10 · last ran 2026-10-15 (today)
- **Plan:** none agreed yet — the work leans on the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-15 (today) — Card 08, the Tonal Bench, measures it: picking words by ink makes each line's ink follow your brightness, though cell by cell the effect is faint. (`semantic-webcam-015`)
- **Last commit touching this project:** 2026-10-15 `8edf4a55` — steward(Semantic Webcam): cycle 9 — SPINNING UP. HOME: [Semantic Webcam](obsidian://open?vault=The%20Palace…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Semantic Webcam is a live camera that draws you in typeset words. Brightness picks the character in each cell, and whole words fill your mid-tones. It has grown one facet at a time, and the cards are collected in one deck. Card 05 picks each word by how much ink it carries. Card 07 gives your eyes, mouth and hands their own texts. The page has always carried one question: is language a tonal medium, or did it only feel that way? Last cycle I proposed a short plan. Its first step was to measure that instead of trusting a feeling, and this cycle did it. Card 08 runs card 05's own word-choosing code on a still photo, three ways, and scores how closely the words' weight follows the light. Short…

### Open asks

- `semantic-webcam-014` — proposed plan revision: a first plan for Semantic Webcam · posted 2026-10-15 · options: adopt · keep · STEER

### Answered, not yet consumed

_None._

### Decided

- `semantic-webcam-011` — directional_decision → GRANTED — option_id=EYES-AND-FINGERS (2026-06-25)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="semantic-webcam-015" -->
### 2026-10-15 — cycle 10 — Card 08, the Tonal Bench, measures it: picking words by ink makes each line's ink follow your brightness, though cell by cell the effect is faint.
> shipped · the page's question now has numbers · steward leans raise tone bias to 0.85

What I built: [08-tonal-bench.html](obsidian://open?vault=The%20Palace&file=Projects/Semantic%20Webcam/08-tonal-bench.html) runs without a camera. It takes card 05's word-choosing code unchanged and feeds it a still: the public-domain Grace Hopper portrait, plus a synthetic pattern of soft waves. Each still goes through three versions. Grammar uses the word-pair walk alone. Tonal is the same walk, but among the candidate words it picks the one whose ink best matches the brightness. The control is the tonal walk aimed at a random brightness. It keeps everything tonal does except the link to the actual light, so it rules out the gain coming from word length or some side effect of choosing among candidates. I ran four texts and twelve seeds, so each number is a mean over 48 renders.

What I measured: line match is the correlation between each run of words' mean ink and that run's brightness. Patch match is the same correlation cell by cell after a small blur, which is closer to what the eye sees.

The answer: on the portrait, line match goes from +0.02 (grammar) to +0.49 (tonal), and the control sits at +0.00. The waves give the same pattern (−0.07 / +0.43 / −0.00). So the effect is real, and the light is what causes it. But patch match only rises from +0.04 to +0.17. A word is a wide brush. It can hold the brightness of a line, but not of a few letters. You can see this in the proof image: the grammar and tonal frames look almost the same, because the glyph tiers (dot, dash, word, shade, white tile) do most of the drawing. Words only nudge the mid-tones.

A useful side result: sweeping the tone bias (how hard tonal fit overrides grammar) gives 0 → +0.10, 0.3 → +0.30, 0.6 (cards 05 and 07 today) → +0.49, 0.85 → +0.57, and 1.0 → +0.58. Moving the default from 0.6 to 0.85 gets most of the remaining effect while still leaving grammar a little say.

I also added card 08 to the deck.

**Artifacts:**
- [the bench itself: runs in the page, about two seconds, then shows the frames and tables](Projects/Semantic Webcam/08-tonal-bench.html)
- [the source, grammar, tonal and control frames plus both stills' tables, captured headless](Projects/Semantic Webcam/08-tonal-bench — proof.png)
- [the deck now has card 08](Projects/Semantic Webcam/semantic-webcam-deck.html)

_Grace Hopper portrait · mean of 48 renders (4 texts × 12 seeds) · mid-tones only_
| fit | line match | patch match |
| --- | --- | --- |
| grammar (word pairs alone) | +0.02 | +0.04 |
| tonal (words chosen by ink, bias 0.6) | +0.49 | +0.17 |
| control (tonal, random target) | +0.00 | +0.03 |
| tonal at bias 0.85 | +0.57 | +0.21 |
| tonal at bias 1.0 | +0.58 | +0.21 |

_Left rough:_ I measured the effect, not how it reads to a person. Nobody has looked at a grammar and a tonal frame side by side and said whether the difference shows, and to my eye in the proof image it barely does. Ink is each letter's pixel coverage, which is not the same as perceived darkness. I tested only two stills, neither of them you on a live camera. I did not change the bias default in 05 or 07.

_Next moves named:_ Raise the tone bias default in 05 and 07 from 0.6 to 0.85. The bench shows that roughly doubles what's still to gain, up to near the ceiling. · Try to widen the brush: let tonal fit choose letter weight inside a word (case, or a bold/light font pair), and rerun the bench to see whether patch match rises above +0.17. · Then the next step of the proposed plan: make the words react to the face moving. A blink rewrites the line on the eyes, and an open mouth moves the speech line forward. · Offer the finding to Language as a Tonal Medium through an elder: yes at line scale, faint at letter scale.
<sub>`semantic-webcam-015` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="semantic-webcam-014" -->
### 2026-10-15 — cycle 9 — Semantic Webcam has never had a plan. Adopt this four-step one: measure tonal language, make the words react, then a demo?
> still working · cams 06 and 07 shipped · steward leans adopt

Semantic Webcam draws you in typeset words. Its seventh facet just shipped: the anatomy cam, where your eyes, mouth and hands each get their own text inside the tonal picture. That finishes your June pick of real eyes and fingers. The project has never had an agreed plan, so each cycle has steered by the page's own direction alone. I'd like a short path that ends somewhere. First, settle the question the page carries ('is language a tonal medium?') with a measurement instead of a feeling. Then make the words react to the face moving. Then tune it on your face, and record a short demo for Loudon Live. The cost: the remaining wish-list items (more texts, more facets) wait until after the demo. I'll keep building toward the measurement either way.

**Artifacts:**
- [06-true-features-cam.html](Projects/Semantic Webcam/06-true-features-cam.html)
<sub>`semantic-webcam-014` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="semantic-webcam-013" -->
### 2026-10-15 — cycle 9 — Two new cams: 06 finds your real eyes, mouth and fingertips, and 07 typesets each of those in its own text inside the tonal picture.
> shipped · mesh loads in Chrome, regions render · not yet seen on a real face

Card 06 (True Features Cam) is card 02 rebuilt on MediaPipe's face and hand mesh, which finds the irises, the lip centre and ten fingertips. Each feature pulls its own vocabulary of single words. I fixed one bug before shipping. The landmarks were placed on the raw camera frame, but the picture is cropped and mirrored, so the words would have circled the wrong side of your face. They now go through the same mapping as the picture.

Card 07 (Anatomy Cam) is the bigger move. It starts from card 05, the cam that picks each word by how much ink it carries so it matches the light. Then it marks every cell with the body part it sits on: the nearest tracked feature within a set radius. A run of words now breaks wherever the body part under it changes. Each run walks the word-pair grammar of its own text (seeing, speaking or touching, three short texts I wrote), and the tonal fit still steers it. In the proof frame the eyes read 'I SEE YOU READ… THE IRIS OPENS IN THE DARK', the mouth reads 'CONSONANT… CANNOT SAY… AN OPEN DOOR', and the hand reads 'POINT AT… FEEL THE CUP'. Each region is tinted: cyan for the eyes, rose for the mouth, green for the hand. Keys: a turns the anatomy on and off (for an A/B against card 05), k toggles the tint, m shows the region rings.

The deck now holds seven facets, with 02 relabelled 'guesses' and 06 and 07 added. Its footer points to Enrichment now that the Oblique Enrichment deck has been retired.

How I checked it: I served the folder over http and drove both cams in headless Chrome with a fake camera. Both report 'true features', which means the face and hand models really load and run, and there were no page errors. The fake camera has no face in it, so for the proof frame I froze the picture and placed four features by hand to show the regions rendering.

**Artifacts:**
- [Anatomy cam with four injected features: seeing text on the eyes, speech on the mouth, touch on the hand, ground text everywhere else.](Projects/Semantic Webcam/07-anatomy-cam — proof frame.png)
- [Card 07, the anatomy cam: the tonal picture where the body part under each line picks its text. Serve over http.](Projects/Semantic Webcam/07-anatomy-cam.html)
- [Card 06, the true-features cam: word-boids bound to your real irises, mouth and fingertips (with the crop-and-mirror fix).](Projects/Semantic Webcam/06-true-features-cam.html)
- [The deck, now seven facets, with 06 and 07 added.](Projects/Semantic Webcam/semantic-webcam-deck.html)

_Left rough:_ Nobody has stood in front of either cam yet. The fake camera gives the mesh no face, so whether the region radii feel right on a real face, and whether 07 holds a usable frame rate on your Mac, is still open. Both cams need http; opened from a file they fall back and say so in the corner.

_Next moves named:_ Answer the carried question with evidence: render the same still through grammar-only and tonal-fit, measure which keeps more of the picture, and post the numbers. This needs no camera, so I can do it headless next cycle. · Make the words react to the face moving: blink rewrites the seeing line, and an open mouth advances the speech line (the face mesh can report both). · Tune the region sizes and tint once you've seen 07 on your own face.
<sub>`semantic-webcam-013` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="semantic-webcam-010" -->
### 2026-06-23 — cycle 6 — Shipped: the five facets folded into one iterable deck — semantic-webcam-deck.html.
> DECK-IFY-FACETS landed · one card per cam · all five launch live

The DECK-IFY-FACETS move you greenlit in cycle 4 is on disk. semantic-webcam-deck.html is a single-page deck — Oblique-Enrichment aesthetic, five numbered cards (01 STIGMERGY, 02 Flock parked, 03 Multiply anchor, 04 Grammar-fit, 05 Tonal Word final), each opening its live cam. Card 05 wikilinks to the spawned concept page. The deck closes the loop: the project that started as one oblique facet now ships back into Oblique Enrichment as a deck of its own.

**Artifacts:**
- [the deck — five facets, each card opens the live cam.](Projects/Semantic Webcam/semantic-webcam-deck.html)
<sub>`semantic-webcam-010` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
