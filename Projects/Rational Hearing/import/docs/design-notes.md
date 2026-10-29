# Design notes

## Purpose and audience
- The page is a lecture backdrop plus a student handout. Loudon talks over it, so it doesn't need to explain itself.
- The handout already shows ET's compromise visually: the ratio bars and the piano key lines don't quite line up. The interactive version keeps that idea, draws it to scale, and adds a ×5 magnify for projectors.

## Section by section

### 1. The harmonic series ("Every interval lives inside one note")
- **Ladder (left):** partials 1, 2, 3, 4, 5, 6, 8, 9, 15, 16 in a zigzag modeled on the handout. Each edge is the interval between neighbors: 1–2 `0`, 2–3 `P5`, 3–4 `P4`, 3–5 `M6`, 4–5 `M3`, 5–6 `-3`, 5–8 `-6`, 8–9 `M2`, 8–15 `M7`, 9–16 `-7`, 15–16 `-2`. Edge color shows the consonance class.
- **Tap a number** to toggle that partial. **Tap an edge label** to solo that pair. An edge lights red when both of its partials are sounding.
- **Readout:** the reduced ratio in big numerals, the interval name and class, `n × f = Hz` for each partial, and the size in cents. Three or more partials show as a chord ratio, and known shapes get names (4:5:6 major triad, 10:12:15 minor triad, and so on).
- **Spectrum:** bars for partials 1–16 at 1/√n height. These are clickable too.
- **Climb the series:** adds one partial every 0.7 s from 1 to 16.
- **Fundamental:** C 65.41 Hz (C2), whose partials land on the handout's letter names, or A 110 Hz (A2). The handout's own worked example uses A 440.

### 2. One ratio, two bodies
- Interval chips (all except U and T.T.) set the pair.
- **String:** two standing waves with p and q loops. Nodes are marked red, and the ends are clamped.
- **Tube:** two tubes 1/p and 1/q of the full length L, drawn against a dashed outline of L. The vertical lines move like an open pipe's air particles, with the most movement at the ends and none in the middle.
- Both animate at the true ratio, slowed so one fundamental cycle takes 2.4 s. Under `prefers-reduced-motion`, the string shows both extremes and the animation stops.

### 3. Just against equal
- Columns follow the handout's bottom row. Black bar = just ratio. Dashed line = 12-TET step. The cents label gives the just-minus-ET deviation.
- Deviations: -2 +11.7, M2 +3.9, -3 +15.6, M3 −13.7, P4 −2.0, T.T. −9.8, P5 +2.0, -6 +13.7, M6 −15.6, -7 −3.9, M7 −11.7. U and 0 are exact.
- Tapping a column plays the just dyad and then the ET dyad on a 7-harmonic saw-ish tone, with the drone ducked while it plays. Root: C4 (261.63 Hz) or A3 (220 Hz).
- The keyboard is relabeled from the chosen fundamental. Edge keys are faded, as on the handout ("can start from any note").

## Visual system (stand-in)
- Drafting Table / Loudon Live Drafting skin colors, light and dark themes. Square corners and hairline frames. The single accent (red) marks what is sounding.
- Class colors: Perfect = ink, Imperfect = datasheet blue, Dissonant = amber, Tritone = gray.
- Anton display; Cormorant italic stands in for the handwritten subtitle; Manrope body; JetBrains Mono numerals.
- **Assumption:** this approximates "Loudon Live style." The real skin files in the palace weren't reachable during the session.

## Audio engine
- 16 sine oscillators run continuously. Gains ease toward a target of (1/√n) ÷ Σ over the active partials. Master gain 0.32 goes into a DynamicsCompressor.
- The AudioContext is created on the first user gesture.
