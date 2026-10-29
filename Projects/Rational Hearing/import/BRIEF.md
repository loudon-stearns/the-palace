# Rational Hearing: project brief

## What this is
An interactive, single-file web page that rebuilds Loudon's printed handout *Rational Hearing: musical intervals are ratios* (see `reference/rational-hearing-handout-v1.jpeg`). Loudon teaches from it: it stays **up on the projector as the backdrop for a few lectures**, and students get **printed copies to take notes on**. It is not a self-contained lesson. Loudon supplies the explanation out loud, so the page should give him anchors to point at and play, not paragraphs.

## Scope (settled)
- **Page one only: 5-limit harmony** (primes 2, 3, 5). The 7th harmonic, microtonal / raga material, the 64/45 tritone discussion, and cents-deviation lectures come in later pages. Leave them out unless Loudon asks.
- Interactions Loudon chose for v1: **live harmonic series** (toggle partials 1–16 on a drone, the ladder lights up) and **animated string & tube**.
- Not chosen for v1, but present as an extra: the just-vs-ET A/B playback on the bottom keyboard. Ask before expanding it, and remove it if he prefers.
- Look: **match the Loudon Live style.** The current palette and type are a stand-in (see below).

## Files
- `src/index.html`: the standalone page. Edit this one.
- `src/rational-hearing.artifact.html`: the claude.ai artifact form (no html/head wrapper). Regenerate it from `index.html` if you republish: take the `<title>` through the end of the first page `<style>`, then the body contents.
- No build, no dependencies beyond Google Fonts. Web Audio and SVG/Canvas only.

## Code map (inside the single `<script>`)
- `INTERVALS`: the 13 just ratios from the handout (U, -2 16/15, M2 9/8, -3 6/5, M3 5/4, P4 4/3, T.T. 64/45, P5 3/2, -6 8/5, M6 5/3, -7 16/9, M7 15/8, 0 2/1) with their consonance class.
- `NODES` / `EDGES`: the zigzag ladder of partials 1,2,3,4,5,6,8,9,15,16, positioned to echo the handout's drawing. Edge labels use Loudon's notation (`-3` = minor third, `0` = octave).
- `describePair()`: reduces any two partials to an interval name, folding octaves ("octave + major 3rd"). Ratios with 7, 11 or 13 report "beyond this page".
- Audio: 16 persistent sine oscillators, gain 1/√n, normalized by active count, through a compressor. Sound is off until the Sound button is pressed (browser autoplay rules).
- `drawString` / `drawTube`: canvas animations at the true ratio, slowed so one fundamental cycle takes 2.4 s. The string shows standing-wave modes p and q. The tube shows 1/p and 1/q lengths with air-displacement lines (open-pipe velocity pattern).
- `buildTemper` / `playCompare`: just-ratio bars against 12-TET dashed lines, cents labels, ×5 magnify, and A/B playback (just, then tempered).

## Teaching-content rules
- Math must be exact. Loudon wants no visually prominent element without mathematical meaning, and he wants exact audio-visual correspondence.
- Keep Loudon's notation: `-3`/`-6`/`-7`/`-2` for minor, `M` for major, `P` for perfect, `0` for octave, `U` for unison, `T.T.` for tritone.
- Consonance groups (from the handout): Perfect = 0, P5, P4. Imperfect = M6, M3, -3, -6. Dissonant = M2, M7, -7, -2.
- If 7-limit / raga material is added later, frame "7-limit in raga practice" as one interpretation. The classic 22-shruti tables are usually given as 5-limit, and scholars debate the point.

## Design
Current stand-in tokens come from the **Drafting Table** design system (claude.ai artifact, built from Loudon Live's *Drafting skin*): paper `#f0eee5`, ink `#1a1916`/`#3a3a35`/`#6a6862`, fill `#dcd9ca`, engineering red `#c8261a`, square corners, hairline frames. Type: Anton (display), Cormorant italic (the handwritten subtitle role), Manrope (body), JetBrains Mono (numbers). The real Loudon Live design files are in the palace at `_ops/loudon-live/design-system/` (`colors_and_type.css`, `README.md`). **Restyle from those first.**

Check the page at projector distance: big ratio numerals, readable edge labels, and the just-vs-ET gaps visible from the back row.
