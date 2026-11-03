---
title: "Floquet Theory — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Floquet Theory]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of Floquet Theory's first rich face: each piece judged on whether it tests the text, stays faithful to it and walks up to its test, and every offer recomputed with an integrator and a lookup table that share nothing with the pieces' engines."
---

# Floquet Theory — rich — challenge

Challenger: claude-opus-5-5, 2026-11-03. Judged from the page (`Floquet Theory.md`), the manifest, every piece's source and the maker's commit body (72f72181). My own recomputation is in Python (scipy `solve_ivp` DOP853 at rtol 1e-12 to 1e-13, `scipy.special.mathieu_a`/`mathieu_b`, my own plane-wave matrix), not the pieces' RK4.

## Verdicts

### The monodromy matrix

**`Floquet Time-Modulated Loops — rich — multipliers.html` (gathered) — keep.**
1. Test: yes. It runs the page's three-line |ρ| list against det M = 1 and finds the stable pair on the circle, not inside it. The list could have survived; it doesn't.
2. Faithful: yes. Where it disagrees with the text it says so in the caption and the manifest carries the offer. The caption is honest that "the page" in the piece means the project's.
3. Walks up: circle onto ellipse (det M = 1 alone) → the pair riding the circle → the test with and without damping. Already challenged and landed on its home face.
Conform's one warning (play-silent, first step silent) belongs to that face and is by design.

### Stability boundaries and bifurcations

**`Floquet Theory — rich — three ways out.html` (made) — remake, one sentence.**
1. Test: yes, the strongest piece on the face. It predicts each growth from the multiplier and measures it on the engine (4e-5 a period), and it lets the stroboscope decide what each crossing makes. The +1 result came out against the text.
2. Faithful: mostly. The −1 and complex-pair findings are right, and the +1 finding (pitchfork, not transcritical) is right. One closing line of step 5 overreaches: "In general a crossing at +1 is a fold, and transcritical and pitchfork are its special cases." That holds for a lone periodic orbit of a generic nonlinear system. It is the wrong frame for the case the piece shows. The rest state x = 0 of a pumped resonator is a solution on both sides of the crossing, so a fold, where solutions appear from nothing, cannot happen. For a state that persists, the generic case is transcritical. Add the odd symmetry x → −x and you get a pitchfork. And the linear equation alone grows no new branch at all; the rings come from the soft brake (β), which the piece does name.
   Exact fix: replace that sentence with "The linear equation only says the rest state goes unstable; the rings are the brake's doing. A lone orbit would fold at +1, but the rest state survives the crossing, so it can't fold here: with no symmetry it would be transcritical, and because the ring has no preferred sign it is a pitchfork." Nothing else changes.
3. Walks up: the ring alone (two multipliers, no pump) → out at −1 → out at +1 → a pair off the axis → the test. Each step takes one idea alone.
Sound starts only on a click (play buttons; a slider re-renders and replays only a run already playing; the rail stops sound). It is one AudioContext, so the kit's hush and cap reach it. Console clean, clicked through all five steps headless.

**`04a_below_threshold.wav`, `04b_at_threshold.wav`, `04c_above_threshold.wav` (gathered, margin) — keep, all three.**
1. Test: yes. "Each crossing has a characteristic audible signature" and "Stage 1 makes the period-doubling case audible" are tested by the sign flip one pump period on. My own read: peak 220.00 Hz in all three. 04b at −10.0 dB with 440 Hz 93.0 dB down and 660 Hz at −30.8. 04c at −5.1 dB with 660 at −19.5. 04a wandering −48.4 to −24.7 dB (50 ms windows). The checks' correlations come out −0.998, −1.000 and −1.000.
2. Faithful: yes. The titles keep the build's labels and the captions correct them (q = 0.05 sits on q_c = 2ζ). That agrees with the Floquet Loops and Parametric Resonance faces.
3. Walks up: they're margin recordings, ordered by depth.
Tracked in git. The headless face logs `net::ERR_ABORTED` on all three, but that is preload being cancelled: they serve 200 (960058 bytes), and the landed Floquet Loops face logs the same.

### Floquet ↔ Bloch — the duality

**`Floquet Theory — rich — same equation twice.html` (made) — keep, with a note.**
1. Test: yes, though of a special kind. For Mathieu the equality is an identity, so the agreement couldn't fail. What could fail is the page's dictionary (μ ↔ k, bandgaps ↔ tongues), and the piece pins it: k ↔ Im μ, E ↔ a, odd gaps at the zone edge with negative ρ.
2. Faithful: yes. The disagreement goes to an offer and isn't smoothed over.
3. Walks up: a wave in a lattice → the same numbers read as time → bands beside tongues → the test.
Note: "within 2 × 10⁻⁷" is the bound of the piece's RK4 (N = 3000), not of the duality. With DOP853 the edges agree to 7e-11 at q = 1, and to 9e-9 at q = 0.3, where the third and fourth tongues are thinner than 1e-3. The caption could say "to the integrator's precision". That's taste.
No sound. Console clean.

### Floquet engineering

**`Floquet Theory — rich — standing on a shake.html` (made) — keep, with a note.**
1. Test: yes. "Fast enough" is held against the multipliers over every stroke and rate, and it fails for a long stroke.
2. Faithful: yes. The finding goes to an offer.
3. Walks up: balanced and falling → a slow shake → a fast shake → the map.
Note: the on-screen "fell past 90° at X s" is sensitive to the integrator. At 12 Hz with h = L/2 the fall comes at 3.24 s (the piece's RK4), 6.23, 7.06 or 8.57 s (DOP853 at different tolerances). It falls in every run, so the claim holds, but the time isn't a number to quote. No sound. Console clean.

## Checks run

- `conform.mjs "Floquet Theory"`: 4 pieces, 0 errors, 1 warning (play-silent on the gathered multipliers piece, the other face's, by design). Browser pass at 760 and 1130 px.
- `fingerprint.mjs "Floquet Theory"`: all four sections in step (e20265e7152b, 2f90e131891e, 68e121d8d5ad, 6ba826209b30).
- `Floquet Theory — proof — rich checks.mjs`: all passed (27 ok).
- I served the face (`rich-server.mjs --detach`, port 8852) and loaded it headless. Four frames, seven `proposal ·` chips, no unresolved-file boxes. The only console lines are the wav preload aborts above. Stopped afterward.
- Each made piece opened alone headless at 1130 px and clicked through every rail step, including the 24-run test: no errors, no warnings.
- Not run: `check-hidden-hush.mjs` and `check-time-cap.mjs`. The kit handles both, and only one piece makes sound. Not heard: an agent can't judge the mix.
- No Splice or other licensed file is copied. Every file a piece needs is either inline or tracked in the project.

## The offers

**Monodromy, |ρ| < 1 stable — confirmed.** Undamped Mathieu at q = 0.3, a from −0.5 to 10 in steps of 0.01: 941 stable, and 941 of 941 have |ρ₁| = |ρ₂| = 1 (worst 2.2e-13). Damped, κ = 0.1 at a = 1.5: |ρ| = 0.854636 = e^(−κπ/2). The page is wrong for the system it names, not just loose. With det M = 1 both multipliers can never be inside the circle, so its "stable" line describes no state of the undamped Mathieu equation, and its own Hamiltonian paragraph says as much. Calling |ρ| < 1 "stable" is the textbook's dissipative default; the page should name both cases.

**+1 is transcritical — pitchfork confirmed; the suggested wording disputed.** My own run of the nonlinear ring (a = 4 + q²/6, q = 0.35, κ = 0.005, β = 0.2, 16 random starts at 1e-4, 1500 periods): every run holds one stroboscope point, none flip, 4 settle on + and 12 on − (the maker had 4 and 4 of 8). Both signs occur in each set, so two mirror states exist. At −1, with the same settings except a = 1 and q = 0.02, every run flips every look: one 2T orbit, which is its own mirror shifted by T.
Why a pitchfork is forced: the equation, brake included, is odd in x, so −x(t) is a solution whenever x(t) is. A shift of half a pump period sends cos 2t to −cos 2t and is not a symmetry, so x* and −x* are distinct T-periodic states. And x = 0 is a solution at every q. A persisting state plus that symmetry gives a pitchfork.
Is the page wrong? For this resonator, yes. In general it is a looser phrasing: "transcritical" is the generic name for a state that survives the crossing with no symmetry, which is the pumped case without odd symmetry. The maker's replacement, "a fold in general", leads with the one case a pumped rest state can't have. There's a deeper point the offer should carry too. The page's list is the nonlinear theory of periodic orbits (its own Lost Branches says Floquet theory "is purely linear" and the bifurcation names belong to the nonlinear extension). For the linear Mathieu equation a +1 crossing is only a change of stability, with no new branch. Suggested line: "ρ → +1: the state goes unstable with a pattern that repeats every T. In the linear equation that is all; once a nonlinearity caps the growth, a lone orbit folds, a state that persists across the crossing is transcritical, and with the symmetry x → −x, as in a pumped resonator, it is a pitchfork."

**The complex pair can't be reached by pumping one resonator — confirmed.** det M = e^(−κπ) and an off-axis pair has |ρ| = e^(−κπ/2), for q from 0 to 0.3 at κ = ±0.005 (worst 5.8e-14). It goes further than the offer says: pump the damping too, κ(t) = 0.005 + 0.3 cos 2t, and det M = 0.984415 = e^(−κ̄π) still holds, with |ρ| = 0.99218. By Liouville only the mean damping counts. Undamped and Hamiltonian, ρ₁ρ₂ = 1 with M real means a real reciprocal pair or a conjugate pair on the circle, never a pair leaving off the axis. So a single resonator crosses off the axis only when its mean damping goes negative, and then it does so at every q. That is a Hopf of the rest state, giving a torus against the pump. With two or more degrees of freedom, a Krein collision (combination resonance) also gets there, as the maker notes. The page isn't wrong: Neimark–Sacker is the right name. It is silent on the fact that Stage 1's system can't reach it, and its next sentence promises later stages will.

**Duality, k ↔ Im μ, E ↔ a — confirmed.** Plane-wave gap edges against scipy's tabulated a₀, b₁, a₁ … b₄, a₄: 1.9e-13 at q = 0.3 and 2.5e-13 at q = 1. Against my own integrated tongue edges: ≤ 9e-9 and ≤ 7e-11. Inside bands, at k = 0.25, 0.5, 0.75 in three bands, tr M/2 − cos kπ ≤ 1.6e-12 and 2.4e-12. Tongue 1 at q = 0.3 spans 0.6891659–1.2883236, with tr M negative inside it; tongue 2 has tr M positive. That matches the Mathieu and Floquet Loops faces.
Is the page wrong? Mostly loose phrasing. Its own Brillouin-zone line already writes μ ∈ (−iπ/T, iπ/T], so "μ replaced k" is shorthand for μ = ik. The real slip is "quasi-energy spectrum β(μ)": β is Im μ, so β(μ) is not a band structure. The band structure is a against β at fixed q, as the offer says.

**Kapitza, "fast enough" — confirmed.** At h = L/10 the exact onset is 15.798 Hz (a₀(0.2) = −0.019913) against Kapitza's 15.764: 0.22 %. The caption's "within 0.2 %" rounds this; fair. b₁(q) = 0 at q = 0.90805, so h/L = 0.45402. At h = L/2 it stands from 3.304 to 6.714 Hz, and at no rate from 6.8 to 200 Hz. The full nonlinear swing, from 0.1 rad: stands at 6 Hz and at 5 Hz, falls at 12 Hz and at 3 Hz; at h = 2 cm it stands at 50 Hz and falls at 5 Hz (0.54 s). The rule's drift with stroke is 0.2 %, 1.3 % and 4.0 % at q = 0.2, 0.5 and 0.9, matching the piece's "4 % at 0.45". The page is the textbook short-stroke phrasing, not wrong. It is incomplete for a long stroke.

**Figure 11, no-claim-edit for the Floquet project — confirmed from the image.** The band panel's bands are straight crossing lines with no gap opened, and the one yellow "gap" is a line at E ≈ 0.16. The gain panel shades about eight narrow strips between ω ≈ 0.27 and 0.75 where the trace is ripple around zero. The footer reads `k ↔ μ` and `E ↔ ω`. The Floquet Loops face's own offer lists the same fault (media-11, straight-line bands).

**Agreement across the four faces.** The thresholds agree: tongue 1 opens at q = κ = 2ζ here, q_c = 2ζ on Floquet Loops, ε_c = 4ζ = 2q_c on Parametric Resonance, and q ≈ γ, √(8γ) on Mathieu, matching this face's √(8κ) = 0.200. The |ρ| reading agrees too: on Floquet Loops the undamped stable pair is on the circle and the damped one at e^(−κπ/2) (0.855 at κ = 0.1), the same as here. The tongue 1 edges agree to six figures (0.689166, 1.288324). No disagreement found.

## The face as a whole

It makes the idea felt. Each of the four sections now has something that could have proved the text wrong, and three did, each in a way you can hear or watch: a stroboscope that stays put on a side the whisper chose, a pair of multipliers that the pump turns but cannot move, a pendulum that falls again when you shake it faster. The bifurcations piece is the centre. It turns the page's list of names into three things you can tell apart by ear and by eye, and it is honest about which name this resonator refuses. The one weak spot is a general sentence that frames the pitchfork as a special fold when, for a pumped rest state, a fold is the one thing that can't happen. Fix that sentence and the face is ready for Loudon to read section by section. It is busy, but every number on it is earned.
