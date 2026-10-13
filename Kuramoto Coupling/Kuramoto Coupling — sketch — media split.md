---
title: "Kuramoto Coupling — sketch — media split"
born: 2026-10-13
links:
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: sketch-for
  - target: "[[Enrichment]]"
    type: connects-to
    label: placement-rule
forward_vector: "I am the proposed split of Kuramoto Coupling's inline media — what stays in the text, what moves to the rich face — held for Loudon's yes. Once he answers and the edit lands, I go to the Archive."
---

# Kuramoto Coupling — media split (proposed)

The rule, from [[Enrichment]] step 1 in Loudon's words: keep in the text what is needed to understand it — formulas, essential graphics, an image the text is talking about — and place the rest in the rich face.

The test used for every row: does any sentence of the prose (not the figure's own caption) point at the piece or need it? The captions travel with their pieces into the manifest.

Line numbers are `Kuramoto Coupling.md` as of 87d8f076. The nine rows follow the baton's nine bullets.

| # | Piece | Where now | Verdict | Why — what the prose says about it |
|---|---|---|---|---|
| 1 | Regimes diagram (mermaid) | :91–109 | **Keep** | The two paragraphs above it (:87–89) say what happens below the threshold, at it, and above it, and the diagram draws those three regimes, with the R each one produces (→ 0, ~1/√N, → 1). It is the page's one picture of its central claim, and after the split the only place the plain page shows R's values. The "essential graphic" the rule keeps. |
| 2 | Two phasors uncoupled — `two-phasors-uncoupled-manim.mp4`, plus the Matplotlib variant linked in its caption | :111–115 | Gather | No sentence of the prose points at it. It shows :87's "each oscillator does its own thing" in motion, and its caption is the only text about it. The Matplotlib variant is a render comparison kept for "its own visual character" — about the tool, not the idea. |
| 3 | Two explorers — `two-phasors-coupling-explorer.html` (see) and `two-oscillators-coupling-explorer-audio.html` (hear) | :117–123 | Gather — **closest call** | "Drag the slider" and "hear it too" are the explorers' own captions; no paragraph refers to them, and the text reads whole without them. Playing the equation is what the rich face is for. Why it's close: the page's own `agency_profile.creation` wants exactly this demo, and in plain Obsidian the link is the only way to reach it. Flip to keep if the plain page should keep a door to its best demonstration. (K_c ≈ 0.220 checked against the explorer's code: π · 0.07.) |
| 4 | Phenomena walk — `phenomena-walk.mp4` | :149–151 | Gather | The opening line (:147) introduces the list of mirrors that follows, not the video. The walk's four domains (fireflies, neurons, jazz bassist, tidal friction) barely overlap the section's own six mirrors — a parallel tour, not something the prose leans on. |
| 5 | Fireflies — `fireflies-pond.png` | :157–158 | Gather | The prose never mentions fireflies. The image sits between the Spinoza and mycorrhizal paragraphs and illustrates neither. |
| 6 | Speech-rhythm narration — `speech-rhythm-and-groove-narration.wav` | :168 | Gather | It is the paragraph above it, read aloud (Kokoro, af_heart — `Shop/Kokoro.md`:193). A second voice for the same words, not something the words need. |
| 7 | Sync arriving — `sync-arriving.mp4` | :170–172 | Gather | :166 argues for entrainment. The video shows eight oscillators locking under that narration, but no sentence refers to it. |
| 8 | SA3 sound — `synchronization-arriving.wav` | :174–176 | Gather | No prose refers to it. Most of its caption is a verdict on the tool ("perhaps — needs more study"), and that verdict already lives in `Shop/Stable Audio Open.md`:157. |
| 9 | Round 1 teaching reel — `round-1-teaching-reel.mp4` | :178–180 | Gather | Its caption covers the whole Round 1 arc and calls it "the connective-tissue proof for the Shop": a record of the making, not part of the mirrors argument. |

**One keep, eight gathers.** No prose changes. Every gathered piece is a figure, and figures don't count toward a section's fingerprint (`_ops/rich-face/parse.js`:207–214), so after the cut the prose reads byte for byte as before and no bridging sentence is needed. "This concept appears everywhere once you see it:" still introduces the list that follows.

## Where they land in the rich face

- **Opening section**, in their current order, after the diagram: the uncoupled video, its narration (already in the manifest), the Matplotlib variant as a margin sidenote, then the two explorers. They carry no `near`, so they lay at the section's end. Anchoring them to a paragraph would put them above the diagram they follow. The narration's old `near` named the video's filename, and that anchor leaves with the text.
- **Cross-Domain Mirrors** (a new manifest section): the fireflies image in the margin beside the opening line, since its caption calls it "the first natural image people reach for", which is what that line says. The phenomena walk sits in the band below it. Beneath the speech-rhythm paragraph, in the band: its narration, the sync video, the SA3 strip, and then the reel at the section's end, where it sits now. The narration stays in the band rather than the margin. The six mirror paragraphs share one prose row in the rich face, so a margin strip would sit beside "Conversational rhythm", not beside the paragraph it reads.

I checked the draft headless on a private `rich-server` serving the branch. Every piece lays where listed above, all five videos read their metadata, the fireflies image loads, and the page throws no errors. No one has watched or listened through it.

## Stamping

Only the sections this edit touches get stamped: `--stamp "Kuramoto Coupling" "Cross-Domain Mirrors"`. A bare `--stamp` would also quietly re-stamp "Asymmetric Coupling: The Stubbornness Parameter". That section has been drifted since c38667a1 and is held for a real re-tune (48bda7a1's body).

## Small things noticed, not changed

- The diagram's caption says the "palette matches the arc's indigo / amber pair". Once the arc's pieces leave the plain page, "the arc" points at nothing a plain reader can see.
- `Shop/Stable Audio Open.md`:157 says the SA3 sound is "embedded in [[Kuramoto Coupling]]". After this edit it sits in the rich face.
