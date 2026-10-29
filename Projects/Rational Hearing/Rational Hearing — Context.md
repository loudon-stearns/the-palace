---
title: "Rational Hearing — Context"
born: 2026-10-28
links:
  - target: "[[Rational Hearing]]"
    type: connects-to
    label: context-of
forward_vector: "I hold what the Rational Hearing entry left out: the math table, the section-by-section design, the audio engine, the decisions and their tensions, so the next worker who touches the page starts from the reasons and not only the result, and I grow when the page's shape changes."
---

# Rational Hearing — Context

## Where it came from

A claude.ai session on 2026-10-28. Loudon shared the printed handout, said it is page one of several lectures and a backdrop he talks over, and asked for a highly interactive version. The session could not reach the palace's design files, built on the Drafting Table values it had, published a private artifact, and packaged itself for import. The transcript is verbatim in `import/conversation/transcript.md`; the session's own notes are `import/docs/design-notes.md` and `import/docs/open-items.md`; its draft palace entry was folded into the entry on 2026-10-28 and deleted. The `import/` folder is the workshop record and is not edited.

## The math

The thirteen intervals of the handout, with the just-minus-ET deviation. Cents = 1200 × log₂(ratio); the deviation is that minus 100 × semitones.

| Short | Name | Ratio | Just ¢ | ET ¢ | Deviation | Class |
|---|---|---|---|---|---|---|
| U | unison | 1/1 | 0 | 0 | 0 | perfect |
| -2 | minor 2nd | 16/15 | 111.7 | 100 | +11.7 | dissonant |
| M2 | major 2nd | 9/8 | 203.9 | 200 | +3.9 | dissonant |
| -3 | minor 3rd | 6/5 | 315.6 | 300 | +15.6 | imperfect |
| M3 | major 3rd | 5/4 | 386.3 | 400 | −13.7 | imperfect |
| P4 | perfect 4th | 4/3 | 498.0 | 500 | −2.0 | perfect |
| T.T. | tritone | 64/45 | 609.8 | 600 | +9.8 | (not bracketed) |
| P5 | perfect 5th | 3/2 | 702.0 | 700 | +2.0 | perfect |
| -6 | minor 6th | 8/5 | 813.7 | 800 | +13.7 | imperfect |
| M6 | major 6th | 5/3 | 884.4 | 900 | −15.6 | imperfect |
| -7 | minor 7th | 16/9 | 996.1 | 1000 | −3.9 | dissonant |
| M7 | major 7th | 15/8 | 1088.3 | 1100 | −11.7 | dissonant |
| 0 | octave | 2/1 | 1200 | 1200 | 0 | perfect |

The ladder's edges, as on the sheet: 1–2 `0`, 2–3 `P5`, 3–4 `P4`, 3–5 `M6`, 4–5 `M3`, 5–6 `-3`, 5–8 `-6`, 8–9 `M2`, 8–15 `M7`, 9–16 `-7`, 15–16 `-2`. The 7th, 10th through 14th partials are on the spectrum but not the ladder; 7, 11 and 13 are reported as "beyond this page" if sounded as a pair.

Fundamentals: C2 at 65.41 Hz, whose partials land on the handout's letter names (C C G C E G · C D E · B C), or A2 at 110 Hz. The handout's own worked example uses A 440. The A/B root is C4 261.63 Hz or A3 220 Hz.

## Section by section

**01 The harmonic series.** Node positions echo the handout's drawing. Tap a number to toggle a partial; tap an edge to solo its pair; an edge lights when both ends sound. Three or more partials show as a chord ratio with names for known shapes (4:5:6 major triad, 10:12:15 minor triad, 3:4:5 second inversion). The spectrum's bar heights are 1/√n, which is also the drone's weighting. Climb adds one partial every 0.7 s.

**02 One ratio, two bodies.** Chips for every interval except U and T.T. The string shows modes p and q with nodes marked in accent; the tube shows lengths 1/p and 1/q against a dashed full length, the fill hatched at 45° per the dress, with vertical lines moving like an open pipe's air (most at the ends, none in the middle). Both run at the true ratio slowed so one fundamental cycle is 2.4 s; under `prefers-reduced-motion` the string shows both extremes and nothing moves.

**03 Just against equal.** Columns in the handout's order. Solid bar at the just ratio in DESIGN ink; dashed line at the ET step in DATASHEET blue (read from the piano, not chosen); deviation label under each with a paper halo so it reads across the dashed line. ×5 magnify. Edge keys faded, "can start from any note" kept as a caption. Tapping a column ducks the drone and plays just then tempered on a 7-harmonic saw-ish wave, 1.4 s each.

## The audio engine

Sixteen sine oscillators run from the first click and never stop; gains ease toward (1/√n) ÷ Σ over the active set so the drone's loudness does not jump with count. Master gain 0.32 into a `DynamicsCompressor`. The A/B dyads are separate oscillators on a `PeriodicWave` with 1/i amplitudes to seven harmonics. The `AudioContext` is created only on a user gesture, and the page listens for the rich-face kit's `rich:hush` so the Sound button tells the truth after a hush.

## Design decisions

- **Drafting Table, Paper by default.** Decided by the coordinating session on 2026-10-28. The import's brief said "match the Loudon Live style" and its open item 1 said restyle from `_ops/loudon-live/design-system/`. The palace's rule for which dress ([[Drafting Table Design System]] § Which dress) puts anything the public channel shows in Loudon Live and the work itself in Drafting Table. A lecture sheet Loudon teaches from, printed for his students, is work, not the channel, and its stand-in was already Drafting Table's paper. So this is the real thing replacing the stand-in. **The tension is kept, not hidden:** Loudon's own words in the first session were "Match Loudon Live style", and he has not yet seen it in either dress. If he wants the channel's look, the swap is the token block and the type stack; the layout holds. That question is on the plan.
- **JetBrains Mono everywhere.** The dress's grammar. The handout's hand-lettered subtitle has no analogue in it; the subtitle is set as a plain mono line. If the hand register matters to Loudon, that is a reason to revisit the dress, not to add a font.
- **Tokens inlined, not linked.** A single-file piece opened from Finder or framed on the piece origin cannot resolve a relative link into `_ops/`. The block is copied verbatim with the source path and sync date in a comment, the same departure the VST Template declares.
- **Provenance colours.** The consonance classes map onto the provenance scale because the dress has exactly three named hues and the handout has exactly three brackets; the mapping is a convenience, not a claim that dissonance is "assumed". The ET lines in DATASHEET blue is a real provenance claim: the twelve steps are read off an instrument. Accent stays for what is sounding.
- **Three interactions kept.** The A/B playback was added unrequested in the first session (transcript, 08:46). Kept because the handout's bars-against-keys idea is the page's payoff and hearing the gap closes it, and because cutting is cheaper than rebuilding. The question is open on the plan.
- **Print face.** A ruled right column rather than a blank one, since students write on lines. The controls, status lines and buttons are dropped; the ladder, readout, spectrum, bodies and temper strip stay. Checked by emulating print media only.
- **Projector mode.** A root attribute that scales the ratio numerals, node numbers, edge labels and the temper labels, and hides the ledes. Nothing else changes, so the lecture's anchors stay where Loudon's hand expects them.
- **`piece:net` declared** for Google Fonts; no other need. Storage is not declared, so the theme and projector choices are not kept; both are URL parameters (`?theme=phosphor`, `?present=on`) for a bookmark.

## Open questions

- Does Loudon want this dress, or the channel's? (See the first decision above.)
- The back-row read: are the edge labels and the ×1 gaps legible on a classroom projector?
- Does the print face replace the v1 JPEG as the handout, or sit beside it?
- Keep, cut or move the A/B playback?
- A legend for the notation is on the page now; is it wanted on the sheet students read alone?
- Keyboard and screen-reader behaviour on the SVG controls is wired (`role="button"`, Enter and Space) but not tested with a reader.
- Volume control and a choice of drone timbre, from the import's polish list.
