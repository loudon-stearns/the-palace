# Fact-check — ten lensings

A cold Fable reader, labels shown, checked palace quotes against palace files and outside claims against the web.

---

Fact-check of the ten lensings in /private/tmp/claude-501/-Users-loudonstearns-Documents-The-Palace/29852af6-fcfc-4dff-8e09-d8cbcde3090f/scratchpad/lensings/. Palace claims checked against palace files; outside claims against the web; the two kept apart. Most serious first.

## Problems

1. **Ohm's Law bold — the Millman step is right in conclusion, wrong as stated.** I did the algebra under the model it names, θ̇ᵢ = ωᵢ + (K_r,i/N) Σⱼ K_s,j sin(θⱼ−θᵢ). At lock (θ̇ᵢ = Ω for all i): (Ω−ωᵢ)·K_s,i/K_r,i = (K_s,i/N) Σⱼ K_s,j sin(θⱼ−θᵢ). Summing over i, the right side is Σᵢⱼ K_s,i K_s,j sin(θⱼ−θᵢ)/N = 0 (symmetric weights times an antisymmetric sine). So Ω = Σ ωᵢ(K_s,i/K_r,i) / Σ(K_s,i/K_r,i): the page's "weighted by K_send ÷ K_receive" (Kuramoto Coupling.md:172) holds and R = K_receive/K_send is correct. But the current that obeys Kirchhoff is Iᵢ = (ωᵢ−Ω)/Rᵢ = −(K_s,i/N)Σⱼ K_s,j sin(θⱼ−θᵢ), i.e. the sine-sum **times K_send,i**. The bold reading says "The current is your coupling, the sine-sum pulling on that voice" (bold:23). For asymmetric K_send the bare sine-sums do not sum to zero (N=2: (K_s,2−K_s,1)·sin(θ₂−θ₁)), and plugging that current into ωᵢ−Ω = IᵢRᵢ gives Rᵢ = K_r,i/N, not K_r/K_s. The hedge "weighted currents cancel" papers over this. The careful reading defines the current correctly, "(Ω − ωᵢ)·K_send/K_receive" (careful:12). The bold's bound |ωᵢ−Ω| ≤ (K_r,i/N)Σⱼ K_s,j is correct as a necessary condition (j≠i, trivially). Its match to the page's K_send = 1 vs 4 simulation cannot be checked: the page gives no N, K_receive or normalisation (Kuramoto Coupling.md:172); the bold says so.

2. **Endosymbiosis careful misattributes a quote.** "too much and one voice dominates" is credited to Kuramoto (careful:23). Kuramoto Coupling.md:68 says "K too high → one oscillator dominates, the rest follow". The quoted words are Palace Philosophies.md:126 and Kuramoto Coupling/Kuramoto Coupling — Context.md:13.

3. **Endosymbiosis bold cites one quote to the wrong file.** "when the damping stays local" is attributed to Haptic Handwheel — rich — challenge.md:69–72. That file says "if the damping stays on the device" (:70) and "the damping kept local" (:72). The exact phrase is in Projects/Haptic Handwheel/Haptic Handwheel — rich — a stiff spring down a wire.html:483. "softer than a pitch-wheel return spring" (challenge:69) and "only while held" (challenge:69; scroll:445–450) check. "the steward marked one row" understates: the scroll table marks six rows (scroll:445–450).

4. **Ohm's Law careful and bold disagree on what "resistance" names.** Careful: "'resistance' names K_receive itself" (careful:20, JSON). Bold: the ratio K_receive ÷ K_send (bold:31). The algebra says the ratio. Careful's real catch stands regardless: the page calls K_receive "the stubbornness parameter" (Kuramoto Coupling.md:146) while K_receive = 0 is the most stubborn rung (:148) — the name runs opposite its value. Careful's "two roots short each other out... nothing locks" (careful:18) is right that no fully locked state exists with two K_receive = 0 voices at different pitches; "nothing locks" overstates (followers may partially entrain to one).

5. **Simondon bold — citation slip and two unflagged overstatements.** "Simondon.md:35" (bold:25, doorway) is the YAML forward_vector; the Concretization paragraph is Simondon.md:52. "A sawtooth coupler is beautifully adapted to the octave and helpless at the fifth of the fifth" (bold:17): the page says "progressively weaker for higher ratios" (Kuramoto Coupling.md:104), not helpless — not flagged. "the engine of 1910, cylinder and cooling fins designed apart" (bold:9): a dated illustration not in either page and not flagged, despite "No scene is invented".

6. **Merleau-Ponty bold — the Schneider analogy runs backwards, unflagged.** Schneider kept concrete movement (scratch the sting) and lost abstract movement (point to the nose on command) — confirmed (https://link.springer.com/article/10.1007/s11097-009-9122-x; https://philarchive.org/archive/AVUAPAv1). The reading says the pitch wheel "turns every player into Schneider" because the note becomes "an abstract target... reached by pointing" (bold:14). A wheel that demands abstract movement makes the player do what Schneider could not; it does not make them Schneider. Also unflagged: "a mournful voice down to the left, a bright one under the right hand" (bold:6) is invented colour; PhP says only "possibilities of achieving certain emotional or musical values". "I invented no scene" is therefore slightly wrong.

7. **Trickster bold — three small unflagged bends.** (a) "Coyote and his cousins... half a cycle away, perfectly placed, every one of them" (bold:19): the PRL uses distributed (Lorentzian) frequencies, so the π-state is partial — some oscillators drift. (b) "Its only remedy is to turn the knob down" (bold:31): the page states no remedy, and the same sentence concedes the page's own anchor answer ("without dominating it", Kuramoto Coupling.md:170). (c) Coyote "listens harder than the pad does": a contrarian with small |K_receive| listens weakly; flagged only generically as "Coyote's lines".

8. **Endosymbiosis bold — one unflagged bend.** "A knob that keeps everything on board is a free-living bacterium, the knob with a light beside it all over again" (bold:15) equates where computation lives with the page's two-parts point (Haptic Handwheel.md:111), which is about display vs control, not locality.

9. **O'Modhrain — exact wording and 23% rest on the palace alone.** The thesis is real (Stanford 2000, https://ccrma.stanford.edu/~sile/thesis.html) and experienced players did do worse with simulated bow friction, which she attributed to friction "not realistic enough to promote skill transfer... but close enough to be confusing" (secondary, Serafin et al. ICMC 2009: https://quod.lib.umich.edu/i/icmc/bbp2372.2009.061). The quoted "close enough to confuse… but not close enough to promote transfer of skill", the 23% and "not significant" exist in the palace only at Projects/Haptic Handwheel/Haptic Handwheel — sketch — starter build.md:48 (then Haptic Handwheel.md:157). The chapter PDFs could not be rendered here (no pdftoppm), so word-for-word is unverified. The three Handwheel lensings quote the palace page accurately.

10. **Hong & Strogatz — equation not read directly.** PRL 106, 054102 (2011) is real; the abstract confirms conformists/contrarians, antiphase lock, and a traveling wave with the mean field at a frequency other than the mean natural frequency (https://link.aps.org/doi/10.1103/PhysRevLett.106.054102). "coupled to the mean field with random signs" and "attracted to the mean field" put the sign on the receiving oscillator, so the Trickster bold's map to K_receive < 0 is fair (a sender-side sign is a different model, their later PRE). I could not render the PDF to confirm the equation or the literal "π state" label; the term is standard in the follow-on literature (https://www.nature.com/articles/srep36713). The abstract calls the traveling wave surprising next to "the stationary states one might have expected"; "does not occur in the original model" is a fair gloss.

## Clean

- Every other palace quote in all ten readings is word-for-word on the cited page: Kuramoto Coupling.md:68, 98, 102–108, 122, 130, 146–150, 168, 170, 172, 174, 180, 182; Ohm's Law.md:19, 28, 57, 91, 109; Trickster.md:90, 92, 96, 98, 100, 104, 112, 152, 158; Simondon.md:31, 48, 52, 60; Merleau-Ponty.md:51, 53, 55, 69; Endosymbiosis.md:32, 40, 44, 61; Haptic Handwheel.md:79, 85, 91, 93, 95, 99, 103, 105, 107, 111, 113, 115, 137, 151, 155, 157. Line numbers given as "Kuramoto Coupling.md:NN" in the Simondon pair and "Haptic Handwheel.md:NN" in the Merleau-Ponty careful all match the live files. (MP careful's "feeling the sound through the knob" is the link label at Haptic Handwheel.md:23, not the sentence at :113 — a near-quote.)
- Organist: in Phenomenology of Perception, footnoted "Cf. Chevalier, L'Habitude, pp. 202 and ff."; "more or fewer manuals, and stops differently arranged"; "only an hour's practice"; "settles into the organ as one settles into a house"; "knowledge in the hands, which is forthcoming only when bodily effort is made" (https://manuelflorenzo.blogspot.com/2013/04/hand-and-ability-habitude-in-merleau.html). Both MP readings have it right.
- Guimbal turbine: generator inside the penstock in a pressurised oil casing; oil lubricates and insulates, its pressure keeps water out; heat goes to the water through the double oil/water bath; this is the "associated milieu"; hypertelia = functional over-adaptation. All in the 1958 book as the Simondon bold says (https://www.researchgate.net/publication/275553866_Two_examples_of_Concretization; https://medium.com/@hfwnbq/on-the-mode-of-existence-of-technical-objects-dab25ce7b986).
- Human mtDNA: 37 genes (13 proteins, 22 tRNA, 2 rRNA); Allen's CoRR (1993, named 2003) with the hydrophobicity ("too oily to import") hypothesis as the rival, which the bold flags correctly as contested (https://en.wikipedia.org/wiki/CoRR_hypothesis; https://www.jfallen.org/publications/pdf/Allen_2003_CPG.pdf).
- Molecular mimicry and rheumatic fever (strep M protein vs cardiac myosin): established (https://www.ncbi.nlm.nih.gov/books/NBK459460/).
- Ohm careful's linearisation (incremental conductance K·cos φ → 0 at π/2) is correct math.

## Distortion checks, bold readings only

- Ohm's bold: names Millman/Kirchhoff as imported, the schematic/fuse as metaphor, the π/2 stretch and the unchecked simulation match. Misses the current definition (item 1).
- Trickster bold: names the tale, zero-as-floor, and the K_receive mapping. Misses item 7.
- Simondon bold: names the 1958 imports, the A→C→B ordering, filter-as-tuning, hysteresis-as-memory. Misses item 5; "No scene is invented" is not quite true.
- Merleau-Ponty bold: names style-not-surface and the chiasm-width bend. Misses item 6; "I invented no scene" is not quite true.
- Endosymbiosis bold: the most complete check of the five — names the biology, CoRR's status, the untested split, the workshop sources, and its mappings. Misses items 3 and 8.

## Spark scores

- Ohm bold 5: high — same core find as the careful, plus a flawed step and an unchecked simulation match; a 4.
- Ohm careful 4: earned; the Millman identity verified, three concrete consequences, honest about where linearity stops.
- Trickster bold 4: earned; real literature, correctly mapped, and it says the math is borrowed.
- Trickster careful 4: a shade high; the listener-finishes-the-lock claim is a metaphor hop it admits, untested.
- Simondon bold 4: earned; filter-as-tuning-system is a real, checkable design consequence.
- Simondon careful 4: earned; also catches its own edge label as loose.
- Merleau-Ponty bold 4: a shade high; the family-of-feels reframing is good, the Schneider move is muddled.
- Merleau-Ponty careful 4: earned; the answers-the-hand vs played-in absorption claim is testable and it proposes the test.
- Endosymbiosis bold 4: high; the "keep the damper local" rule is already the steward's finding (challenge:69–70), and the mimicry answer mostly serves the glass; a 3.
- Endosymbiosis careful 3: earned and honest.

One observation: in both pairs where the bold and careful landed on the same core find (Ohm → Millman; Simondon → A→C→B genesis), the find came from the glass–subject pairing, not the mandate; the bold added voice and one extension each, and most of the unflagged bends above are in the bold readings.