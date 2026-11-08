---
title: "Particle Synthesis — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Particle Synthesis]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of Particle Synthesis's proposed rich face, piece by piece and offer by offer, with the numbers re-run, so Loudon can take or leave each one knowing which parts held when someone else pushed on them."
---

# Challenge — Particle Synthesis's rich face, proposal round 2026-11-03

Challenger: claude-opus-5-5, a fresh agent that did not make this face. Judged from the page, the manifest, every piece's source, and the maker's commit body (1c564469) as its only account.

**Tally: 12 keep, 1 remake, 0 retire.** The remake is *One click, one law*: its last step is labelled a test and is a demonstration.

## The checks, and what they returned

- `conform.mjs "Particle Synthesis"`: 5 pages, errors 0, warnings 0, browser pass at 760 and 1130 px. The two gathered WebGPU pages read `nothing · flow (manifest; owed)`: their `contract` blocks are empty `{}`. That isn't an error, but it is a declaration still owed.
- `fingerprint.mjs "Particle Synthesis"`: all five made sections in step (Architecture 63d300976121, Dispersion 7ca6b83b0728, Prism b194857427fe, Fountain 81a72d8a19ef, Forward Vectors 10d8b7b9d703).
- The maker's `Particle Synthesis — rich — check.mjs`, run as it stands: every claim passes.
- The face served from this worktree (`rich-server.mjs --root … --detach`, then `--stop`) and opened in headless Chromium at 1130 px. Results: 13 proposal chips, no *Lost its place*, no drift flag, no unresolved-file boxes, five iframes. In each made piece I clicked every step, every play button and every measure button. Each piece had no AudioContext before the first click and a running one after. Hiding the page suspended all three. **Console: 0 errors, 0 warnings.**
- Every file the manifest names is tracked in git, including the two 3.1 MB takes copied into `rich-face/`. No Splice material.
- I recomputed the numbers independently, in Python with no code from the pieces, and in Node against the GPU build's own chirp. Results below.

## The pieces

### The Architecture: GPU Compute as Sonic Substrate

**`proofs/2026-10-22-gpu-fountain.html` — keep.** This is the section's claim built and running: one compute-shader thread per particle, summed into one signal. Its numbers could have contradicted the text, and on one point they nearly do. The caption is honest that the page's 25× is not measured; the nearest number is 4.2× (2098 ms CPU vs 496 ms GPU at 64 particles, `2026-10-22-gpu-fountain-report.json`, `mirror_mode0`; the harness sets n: 64 at `2026-10-22-gpu-fountain-harness.mjs:34`). Every caption number checks against the report: 96 throws, 349 strikes, correlation 0.99998, 732 ms and 787 ms for 6 s. As a gathered record it doesn't owe a walk-up. Note: the empty `contract` is owed. Also, the maker made no offer on the 25×. The caption carries it, which is fine for a proposal, but if Loudon wants the text to stop claiming an unmeasured number, it is an offer nobody has filed yet.

### Dispersion as Physics

**`proofs/2026-10-22-gpu-fountain-AB.png` — keep.** It sets the same 22,666 strikes (report `renders.ice/mapped.impacts`) side by side, made once by a law and once by a mapping rule. That is the page's own forward-vector test, physics versus parameter modulation, and the caption doesn't claim more than the picture.

**`rich-face/2026-10-22-gpu-fountain-A-ice.wav` — keep.** One half of an A/B the page asks for. The caption is honest that loudness is matched and nothing has been judged by ear.

**`rich-face/2026-10-22-gpu-fountain-B-mapped.wav` — keep.** Same reason. "2 kHz near to 200 Hz far" matches the build's `grainCPU` (`200·10^(1−…)`, `proofs/2026-10-22-gpu-fountain.html:263`), and "nobody had listened" is the honest flag.

**`proofs/2026-09-23-fountain-00-one-particle.wav` — keep.** It sits in the margin beside "High frequencies travel faster", which is exactly where the ice's direction should be heard, the more so once offer 2 lands. "About 12 m" matches the scroll (`Particle Synthesis — scroll.md:297`). This piece illustrates more than it tests, but it is the real build's sound, small and in the margin.

**`Particle Synthesis — rich — one click, one law.html` — remake.**
1. *Test or decoration?* Steps 1–4 make the section felt, and step 4 earns its place: one law held between two ends gives 1, 4, 9, 16 pinned and 2.7565, 5.4039, 8.9330 free. Those agree with the free–free beam roots of cos x·cosh x = 1, which I recomputed. That is the section's "natural inharmonicity without explicit … modulation paths", shown. Step 5, though, is titled **"The test: is it the law, and only the law?"** and it can't come out otherwise. `clickThrough` sets each bin's phase to r·√(ω/C) (piece, `phaseOf`). The band arrival it then measures is d(phase)/dω, which is exactly r/(2√(Cω)). The 1.0 % gap is the sixth-octave Gaussian band filter's bias: it reads the lows early, 251.42 ms against the law's 253.91 at 125 Hz, and the gap shrinks as distance grows (1.32 %, 0.98 %, 0.72 % at 4, 8, 16 m). The one-speed control is just as fixed: its phase is ω·r/340, so its spread is 0.0 ms by construction. Only an engine bug could make step 5 fail. The maker says so in the commit body, but the step title, the verdict's opening "The separation is the law's", and the caption's "every band … peaks where the law says, within 1 %" all present it as a finding.
2. *Faithful?* Yes. It holds the text's "high frequencies travel faster" to the ice, and it is candid that the law is one programmed line.
3. *Walks up?* Yes: a click, a one-speed road, the ice, two ends, then the check.

**What to do, one round.** At minimum, rename step 5 and reword its verdict and the caption so the band table reads as a check of the engine, not a measurement of ice. For example: "The check: does the sound hold the law? The engine turns each frequency by the law's phase, so this can only find the law's timing; the 1 % is the band filter reading the lows early." The better remake gives step 5 something that could actually fail. The 2026-10-22 build does not propagate; it **writes the chirp in closed form**, `cos(−r²/(4C·t) + π/4)` with instantaneous ω = r²/(4C·t²) (`proofs/2026-10-22-gpu-fountain.html:252–259`, the shader's twin at :119–128). Set that formula against the piece's exact propagation of the same click. I ran exactly that: waveform correlation 1.0000 at 8 m and 3 m, 0.9998 at 1 m; band arrivals agree to 0.03 ms at 8 m (125 Hz: exact 251.42, build 251.45 ms) and to 0.28 ms at 1 m. That tests whether what Loudon hears from the build is the law's answer, and it could fail on a sign or a factor. Be honest that for ω = C·k² the stationary-phase form is close to exact, so it tests the build's code, not the physics. It also says something the section would want to know: in the build, the sweep *is* written into the code. It is the law's own solution, derived rather than designed, but it is written.

### The Prism Metaphor

**`Particle Synthesis — rich — which way the colours run.html` — keep, with three small notes.**
1. *Test.* Yes, and the strongest on the face. The glass rows come from Schott's published N-BK7 Sellmeier coefficients (n = 1.51680 at the d line, catalogue 1.5168), data from outside the palace. If the page's "mirrors optical dispersion exactly" were right, red would trail blue. It leads.
2. *Faithful.* It holds the page's "the prism is not a metaphor" (same physics) and shows the direction the page's "exactly" gets wrong. It smooths nothing.
3. *Walks up.* Light through a prism, glass as a road, the ice, deep water, then the table. Each step is one concept.

Notes for the maker, none of them blocking:
- (a) Step 1 says "violet near 680". The engine's own 410 nm comes out at 665.0 Hz, and the check asserts 665; 680 Hz would be 401 nm. Write 665.
- (b) Step 1 quotes the phase index (1.530 at 410 nm, 1.513 at 700), and step 2's 161 ns comes from the group index (1.5800 vs 1.5317). A reader working from the quoted n gets 55 ns. Add a clause that a pulse travels at the group index.
- (c) The verdict's "a prism is the deep-water case, not the ice" overreaches by a little. The direction is deep water's; the law isn't. "A prism runs the deep-water way" would be exact.

### Particle Fountain: First Build

**`proofs/2026-09-23-fountain-cloud64.png` — keep.** It shows the parabolic arcs the section's own equation draws, beside "The trajectory is NOT programmed behavior". The caption is careful to say this build hears strikes through the ice and doesn't map height to pitch as the page's Max device does.

**`Particle Synthesis — rich — thrown, or on a spring.html` — keep, with two small notes.**
1. *Test.* Yes. It steps the page's own m·ÿ = −m·g (+ drag) once per sample and asks the section's sentence a question that could have gone the other way: if gravity were a spring constant, the arcs would be sines and the period would ignore the throw. They aren't, and it doesn't.
2. *Faithful.* It keeps the page's true half ("a second-order differential equation") and tests the false half. It uses the page's height→pitch mapping.
3. *Walks up.* One throw, a floor, a spring, both thrown harder, then audio rate.

Notes for the maker:
- (a) Step 1 says "as the page's audio mapping says: one octave for every two metres". The page maps height to pitch but gives no scale. Write "the page maps height to pitch; here, one octave for every two metres".
- (b) The audio-rate test gives the particle a floor with e = 1, which is neither the page's device ("it dies when it reaches the bottom") nor the build's (e = 0.45). Step 5 says so, which is honest. The 1/n² buzz holds for any repeating train of parabolic arcs. The halving of the pitch is specific to bouncing: a fountain whose repetition came from a fixed emission rate would keep the emitter's period. The verdict's "its timing belongs to the throw" is right for one flight (step 4 shows 2·v0/g doubling). It is worth half a sentence so nobody reads it as a claim about the emitter.

### Forward Vectors

**`proofs/2026-09-23-grains-05-crossing-collide.wav` — keep.** It is the record that the collision vector progressed, and it is already linked from the text's own "— progressed" line. Its numbers match the scroll: 13 meetings, 119 of 360 landings, drift 0.15 → 0.60 m (`Particle Synthesis — scroll.md:226, 247–248`).

**`proofs/2026-09-23-grains-04-crossing-pass-through.wav` — keep.** It is the control for the take above, at the same gain, so the difference can be heard.

**`proofs/2026-10-22-gpu-grains-meet-AB.png` — keep.** Every caption number checks against `2026-10-22-gpu-grains-meet-report.json`: 1,544 throws, 1,315 meetings, momentum error 3.5e-15, clack correlation 0.9868 to 0.9993, which rounds to the caption's 0.987–0.999.

**`proofs/2026-10-22-gpu-grains-meet.html` — keep.** It is the live version of the vector, and it loaded clean. Its `contract` is owed, as with the fountain page.

## The offers

**Offer 1 — Fountain, claim-change: confirmed.**
- I recomputed the harmonics without the piece's code. A periodic train of parabolic arcs, y = t(T − t) repeated, has an FFT with harmonics 2–5 at −12.04, −19.08, −24.08 and −27.96 dB under the first. Those are exactly 20·log10(1/n²).
- Flight time is 2·v0/g, so twice the launch speed is twice the period: 220 → 110 Hz.
- A spring's period is 2π/ω whatever the push; the piece measures 1.02018 s gentle and hard, every harmonic below −120 dB.
- So "the numerical solution to the harmonic oscillator equation" and "the gravity constant IS the spring constant" are both wrong, and "second-order differential equation" is right.

Duplication: [[Particle Synthesis — tuning]] item 2 (2026-10-22, proposed by the steward, still waiting on Loudon) already proposes replacement words for exactly this paragraph. This offer points there and offers no competing words, which is right. It should go one step further and say that **taking tuning item 2 closes this offer**, so the same edit isn't carried home twice from two ledgers. Its role is to supply the measurements as evidence for item 2's words.

**Offer 2 — Dispersion, claim-change: confirmed, and the answer is that it is wrong in direction, not in kind.**
- **Glass, N-BK7, 1 km, recomputed with an analytic Sellmeier derivative:**
  - Group index 1.55758 at 486 nm and 1.53480 at 656 nm. Δn_g = 0.0228, so Δt = Δn_g·L/c = **76.0 ns, blue trailing**.
  - The order-of-magnitude check: Δn ≈ 0.02 over 1 km at c gives 67 ns, the same order.
  - The phase-index gap alone (1.52239 − 1.51433 = 0.0081) would give only 27 ns. The 76 needs the group index, which the piece uses correctly.
  - For 410 vs 700 nm: 161.1 ns.
- **Deep water:**
  - c_g = g·T/(4π): 15.6 m/s for 20 s swell, 7.8 m/s for 10 s.
  - Over 2000 km they arrive at 1.483 and 2.965 days: **20 s swell leads 10 s by 1.48 days**.
  - Long leads short; c_g ∝ T ∝ √λ.
- **Lake ice, flexural waves, ω = C·k²:**
  - c_g = 2√(Cω) ∝ √f: 252 m/s at 8 kHz, 44.6 m/s at 250 Hz.
  - The law gives an 8 kHz lead of 147.8 ms over 8 m; the piece measures 146.5. **Highs first**: confirmed.
- **What the mirror keeps and what it loses.** The mirror holds in kind: a speed that depends on frequency, with the medium's law alone setting the order of arrival. It fails in direction: glass and deep water hold the highs back, and the ice sends them first. There is also a second gap the offer doesn't name. A prism fans colours **by angle at a surface**, set by the phase index through Snell's law. A grain spreads **in time along a path**, set by the group index. The page's "the spatial trajectory through the prism *is* the frequency-dependent filtering path" runs the two together. The piece's step 2, glass as a kilometre road, is the bridge. The proposed words ("mirrors optical dispersion in kind, with the order reversed: glass slows blue more than red") are sound. Loudon may want a clause on angle vs time too.

**Offer 3 — Prism, no-claim-edit: the finding stands, but I dispute the kind.** The sentence it proposes, "in the ice plate the builds use, the high components lead; in a glass prism and on deep water, the low ones do", adds a factual claim to the page. By step 7's split, a no-claim edit is a unit or a symbol; this is a claim. Fold it into offer 2, which is the same finding, or refile it as a claim-change so it goes through the Deposit map.

**Offer the maker left out, now made (for the bundle, not the text): the June prism runs deep water the wrong way.** The maker's commit body names this and leaves the two June artifacts ungathered, but files no offer. I verified it from the proof and the figure:
- `proofs/2026-06-08-dispersion-prism.html:145` sets the deep-water velocity to `0.35 + Math.sqrt(kn)*1.3`, which *rises* with wavenumber, so high partials are faster. The comment on the same line says "v ~ 1/sqrt(k)", which the code contradicts.
- In `proofs/2026-06-08-dispersion-laws.png`, the left panel draws "deep water ω ∝ √k" as a curve above the straight line that steepens toward k = 1. That is not √k, which bends down. The right panel has partial 12 arriving at about 0.54 s and partial 1 at about 1.30 s: **highs first**, the opposite of the sea.
- The same proof's "stiff bar" strike sounds `freq = f0*harm` (line 162), so its partials stay harmonic. Its note (line 97) claims "exactly the inharmonicity of a bell".
- The scroll lists both files without a flag (`Particle Synthesis — scroll.md:273–274, 324–325`).

Proposed manifest offer, ready to paste (the brief limits me to verdicts in the manifest, so I leave it here for the maker or the lander):

```json
{ "section": "Dispersion as Physics", "kind": "no-claim-edit", "status": "open",
  "what": "Bundle, not text: proofs/2026-06-08-dispersion-prism.html and its laws figure run the deep-water law the wrong way. Line 145 makes velocity rise with √k (highs first) while its comment says v ∝ 1/√k; the figure's 'ω ∝ √k' curve is convex, and its arrivals put partial 12 at ~0.54 s before partial 1 at ~1.30 s. The stiff-bar strike keeps harmonic partials (f0·n) though the note claims a bell's inharmonicity. Offer: on Loudon's word, the steward adds an erratum line to the scroll's 2026-06 entries naming both, or remakes the proof with c_g ∝ 1/√k and bending-law partials; the face does not gather either until then." }
```

## The face as a whole

It makes the page's idea felt, and it does the harder thing: it finds the two places the page's analogies break. Gravity is not a spring, and glass runs the other way from the ice. Each break gets a walk you can hear, not a footnote. The prism piece is the best thing here: real glass data against the build's ice, one table, one physics, two directions. The fountain piece is close behind, because the 1/n² buzz against a pure sine is something a learner can hear in two seconds. The gathered builds sit beside the sentences they answer, with captions that say what wasn't measured (the 25×) and what nobody has heard (the A/B). The one soft spot is the dispersion walk calling a demonstration a test. Its first four steps are good, and the fix is words, or the build-against-law comparison above. The Dispersion section carries five pieces, which is heavy but not busy, because each does a different job: the build's picture, its two takes, one particle, the walk. Nothing here is decoration for its own sake.
