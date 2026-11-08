---
title: "Crystal Sonification Reference — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Crystal Sonification Reference]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Crystal Sonification Reference's proposed rich face: every piece judged for test, fidelity and walk-up, every offer recomputed from the page's own numbers, so Loudon reads a face that has already been argued with."
---

# Crystal Sonification Reference — rich — challenge

Challenger, proposal round, 2026-11-03, on the maker's commit 28203190 in the worktree `enrich/crystal-sonification-reference`. Judged from the page, the manifest, the four made pieces, the gathered files and the commit body. I did not make this face.

**Tally: 18 keep, 4 remake, 0 retire.**

## The pieces

### The Universal Transposition System

**`… — rich — only ratios.html` · remake.** It walks up well: divide, then multiply, then the null. The 10⁻⁹ finding in step 2 is real (below, offer 3). But the test in step 3 can't fail. It checks (s·ω_n)/(s·ω₁) = ω_n/ω₁ in float64 against a rule of 10⁻¹², and that's an algebraic identity. The only thing that could break it is a floating-point bug. The +110 Hz control is a different operation, not a way the claim could fail. And the ear question, "Which two are the same chord?", leaks: the buttons are labelled "an octave down: the factor halved" and "the control: + 110 Hz".

The section's claim can fail, though, and the face shows where. "These ratios are the timbre DNA … independent of any choice about pitch", and yet the page puts ruby's character in its doublet ("The 'rubiness' is in the doublets"), and a doublet's beat rate is in hertz. Using the table ratios, the 1.10/1.14 beat is 0.04 × f_root. That's 2.2 Hz at MIDI 33, 8.8 Hz at A3 (the prompt's figure), 17.6 Hz at A4 and 41.9 Hz at MIDI 96. From ω, 430/417, it's 1.89, 7.57, 15.1 and 72 Hz (I ran the piece's own engine). The ruby strike's caption in this face already says the beat halves at A2. **Fix:** keep steps 1 and 2. Make step 3's last test the doublet across the note range. State a rule first (for example, "the shimmer stays a slow beat, under about 15 Hz"), score both outcomes, and let the page's claim hold or fail at each note. Then either drop the "which two" question or play the three unlabelled in a shuffled order. The identity can stay as a one-line demonstration before the test.

### Creative Mapping Parameters

**`charts/mapping_function_alpha_curves.png` · keep.** The caption is true. I read the chart: its x-label is "Input ratio (r_n / r_max)" and its curves start at 0. That means they plot (r_n − 1)/(r_max − 1), because r_n/r_max can't reach 0.

**`… — rich — where is the physics.html` · keep.** This is a real test. The piece's `map` is the page's formula character for character (the maker's P1, and my reading of `where is the physics.html`'s CHECK block against the `.md`'s line 84). The rule, 0.5 Hz (the page's own Type B tolerance, line 494), is stated before the reveal, and the note says what passing would have read: 0.00 Hz. It walks ruby → span → α → test. It's honest that the 8-second sweep is geometric, which the page doesn't specify. One note for the maker, not a fix: the page's word "proportionally" is exactly what α = 1 keeps (I recomputed the relative positions and they match to 10⁻¹²). The finding is with "the physics, undistorted" and "exactly as scaled", read against § 1's "the physics lives in the ratios". The offer already puts it that way.

### The Crystals (one `##`, 17 figures, one stamp)

**Seven charts (`charts/{diamond,ruby,amethyst,fluorite,emerald,topaz,labradorite}_spectrum.png`) · keep.** These are the page's own image prompts, drawn. I opened ruby and fluorite. In both, the axis label says "log₂ scale = semitones" while the ticks (1.0, 1.2, 1.4 … / 1.0, 1.5, 2.0 …) are evenly spaced, as the shared caption says. I didn't open the other five. Within this section the fluorite chart is the one that argues: F₂g at 1.69 sits outside a shaded gap of about 1.78–2.38, while the text's gap is 1.5–2.5.

**Seven strikes · keep.** I FFT'd three myself (Python, Hann, 2²⁰-point zero-pad, parabolic peak): `triclinic-proof/diamond_strike.wav`, `palette-strikes/ruby_strike.wav` and `palette-strikes/fluorite_strike.wav`. Every table mode is present over 110 Hz, with the largest error 0.0026 Hz (fluorite root). The files are 6.0 s, 16-bit, 44.1 kHz, mono. The captions are honest that the root and envelope are the summer engine's, not the prompts'. The diamond caption's "five, not four" and the ruby caption's 4.4 Hz are right. **Note on `triclinic-proof/labradorite_strike.wav`:** it sits beside "Bell-like but alien" with the caption "What the paragraph predicts". The parent's ring study found that the bell is the summer engine's shared 5.5 s ring. With labradorite's estimated Q of 30 it is "a dull knock with a bright tick" (`crystal-rings/README.md:49–52`, landed on the parent's face as `crystal-rings/strike_vs_ring.wav`). A clause pointing there would keep the strike from reading as confirmation.

**`… — rich — the intervals named.html` · remake.** The arithmetic is a sound lookup, and it can fail: one naming holds (soft mode, 835 c) and three fail. But the caption and engine header say "the rule, a quarter tone, is stated before any result". It isn't. Step 2 prints "the naming holds" before the 50-cent rule first appears in step 3's text. And "decide by ear before you look" leaks: the third button, "▸ the nearest", appears only when the naming fails (`J.nearest.cents !== J.named`), so the buttons give away the verdict. **Fix:** state the 50-cent rule in step 2's text, before its "show the numbers". Give every block the same buttons (the crystal, the page's interval, and both equal-tempered neighbours, labelled by interval name only). Or drop "decide by ear" and call the piece what it is, a lookup you can hear. Either way, the caption's "put to the ear" should match what the piece does.

**`charts/obsidian_vdos_comparison.png` · keep.** I read the chart: the bumps sit near r 3.1 and 7.0, which is 397 and 896 cm⁻¹ at 128 cm⁻¹. The caption is true.

**`… — rich — crystal to glass.html` · remake.** This is a real test that could have passed, and it walks quartz → glass → crossfade → test. Two sentences in it are wrong or incomplete.
1. Step 2's note says "The glass plays at the level of the quartz render, matched by RMS". As played it isn't: steps 1 and 2 both go through `playBuf`, which normalises each buffer to a 0.6 peak. Running the piece's own engine, I got the glass alone 3.3 dB below quartz alone in RMS (the quartz-frame glass 2.5 dB below). `playBufAt`, which is defined in the file and never used, is the fix. The crossfades are one buffer each, so their internal levels hold (page frame against quartz frame: 0.27 dB overall).
2. The crossfade prompt (`.md` line 418) says only "shaped noise matching the obsidian VDOS profile". It never says which frame. The piece builds it in the obsidian noise prompt's frame and then finds that frame misses. The answer text should say that the page leaves the frame open, and that the noise prompt (line 416) fixes it at A4.

### Comparative Spectrum — All Eight Crystals

**`charts/comparative_all_crystals.png` · remake (caption only).** The caption says "every crystal's modes on one log axis". The chart's axis is linear: ticks at 2.5, 5.0, 7.5 … 17.5 are evenly spaced, and its octave lines (Oct 1 at 2, Oct 2 at 4, Oct 3 at 8, Oct 4 at 16) widen. The page's prompt (line 424) asks for a logarithmic scale. Say "linear, though the prompt asks for log" and add it to offer 8.

**`palette-strikes/palette_tour.wav` · keep.** I checked it: 1,173,060 samples at 44.1 kHz is 26.6 s, and the order in `render_palette.py:48–60` is diamond, fluorite, emerald, ruby, amethyst, topaz, labradorite. The caption says plainly that this isn't the 90-second demonstration.

## The parent's face

This face doesn't duplicate "strike the seven". That piece puts the Bravais hypotheses on [[Crystal Synthesizer]] to the plugin's own engine, nine strikes by crystal system. This face lays the summer additive strikes beside each mineral's own Predicted Sound. The two faces share no strike file. They share one chart, `comparative_all_crystals.png`, which is this page's own image prompt. The parent's challenge made no interval findings. The one number both faces carry, the ruby doublet at 8.8 Hz over A3 (220 × 0.04) and 4.4 Hz over A2, agrees. The parent's ring study does bear on the labradorite strike here (note above).

## Checks run

- `node _ops/rich-face/conform.mjs "Crystal Sonification Reference"`: 4 pieces, introduced 4, errors 0, warnings 0; browser pass at 760 and 1130 px clean.
- `node _ops/rich-face/fingerprint.mjs "Crystal Sonification Reference"`: the four made sections in step (848b24cd005d, 800bfe4395ed, 27d995bac0bd, c2f17f22770e).
- The maker's `rich-checks/check-rich-pieces.mjs`: 38 of 38 pass.
- The face served (`rich-server.mjs --root <worktree> --detach`, then `--stop`) and loaded in headless Chromium at 1400 px, scrolled through: 22 figures, 22 proposal chips, 4 frames, 10 images, no missing-file boxes, **0 console errors or warnings**. AudioContext hooked in every frame: none existed before a click. Clicking a play button in each step of each piece started one. Setting the page hidden left all four `suspended`.
- An independent Python recompute of every offer (below), and FFTs of three strikes.
- Media: nothing copied into `rich-face/` and nothing needed copying. Every gathered file is already tracked (29 files under `charts/`, `palette-strikes/`, `triclinic-proof/`), the largest is 2.3 MB, and none is licensed. The `.md` is unchanged by the maker's commit.

## The offers

1. **Creative Mapping, α = 1 is the physics only at span log₂ r_max: confirmed.** The maker reads the formula as printed, and it isn't ambiguous: r_out = 1 + ((r − 1)/(r_max − 1))^α (2^span − 1) sends r_max to 2^span whatever α is. Ruby at span 2 puts the top at 4.00, which is 444.4 Hz and 1217.4 c from 1.98 over A3. No α changes the top mode, so the closest α is still 444.4 Hz off. At span 0.9855 = log₂ 1.98 it's exact. At 1 octave it's 4.4 Hz and 17.4 c off, which fails the page's 0.5 Hz too. What α = 1 keeps at any span is (r − 1)/(r_max − 1), exact. So the page's word "proportionally" is accurate, and "undistorted", "exactly as scaled" and § 2's "every ratio relationship is preserved" are not. The offer's kind is right.
2. **Creative Mapping in Practice, the doublet: numbers confirmed, verdict softer than written.** 61.8 c/8.80 Hz in the physics; 63.0 c/8.98 Hz at 1 octave; 155.1 c/26.94 Hz at 2; 375.1 c/134.69 Hz at 4. The page itself says the doublets "move outward as span increases", so what fails is "audible in all three" as a shimmer, not the widening. "The same four frequencies" listing five ratios: confirmed.
3. **Universal Transposition, 10⁻¹¹ not 10⁻⁹: confirmed.** 1 cm⁻¹ = 29.9792458 GHz. Ruby at A3 is 1.94×10⁻¹¹, diamond at G3 8.12×10⁻¹², labradorite at A2 6.12×10⁻¹¹, and amethyst, fluorite, emerald and topaz at their prompt roots fall between (1.5–3.8×10⁻¹¹). 10⁻⁹ puts ruby's root at 11,332 Hz. It's a no-claim-edit, as filed.
4. **The Crystals, interval names: confirmed.** Ruby 1.10 is 165.0 c (from ω, 417/378, 170.0 c), nearer a major second. Emerald 1.68 is 898.2 c (from ω 893.0 c), a major sixth, 196 c from a fifth. Amethyst 8.32 is 3667.9 c, three octaves and 68 c, against the 4000 c of "three octaves and a major third". The soft mode, 1.62, is 835.2 c and holds. Ruby's lower steps are 165.0, 61.8 and 74.3 c; "seven, two, one semitones" matches none of them.
5. **The Crystals, fluorite gap and diamond count: confirmed.** F₂g 322/190 = 1.695, inside "~1.5–2.5". LA 280/190 = 1.474, inside the TO–LO span of 1.35–2.48. Diamond's table has five distinct ω (805, 1060, 1190, 1265, 1332). The chart's shading, read by eye, runs about 1.78–2.38, consistent with the maker's pixel reading.
6. **The Crystals, obsidian's frame: numbers confirmed, kind disputed.** At A3 the noise prompt's bands are 200 and 500 Hz. Quartz's ring modes are 609.4–798.6 Hz and its stretches 1199.0–1830.4 Hz, so the bands sit 1.796 and 1.528 octaves below the families' geometric centres. 440/128 = 3.4375. In quartz's frame the bands are 687.5 and 1718.75 Hz, inside both families. But the sentence the piece quotes, g(ω) as "a smeared version of the quartz spectrum", is about wavenumber and holds. What's actually off is that the crossfade prompt never names a frame while the noise prompt names one. That fix is "say the frame" in the crossfade prompt, closer to a no-claim-edit than a claim-change. Loudon's call.
7. **Creative Mapping, the α-chart's x-axis: confirmed** from the chart itself.
8. **Asset Production Plan, Type B no longer "Ready to begin": confirmed.** Seven strikes exist (I checked three), there's no `audio/` folder, the axes are linear under log₂ labels (I saw ruby and fluorite), and the ruby chart has mode 6 at 1.0 and mode 7 at 0.85 against the prompt's "modes 1 and 7 at full amplitude". **Add:** the comparative chart is linear where its prompt asks for log.

One small thing from the recompute, not filed as an offer: the table's rounding inflates ruby's doublet. 1.14/1.10 is 61.8 c and 8.8 Hz at A3; from ω, 430/417 is 53.1 c and 7.57 Hz. The prompt's "~8.8 Hz" comes from the rounded ratios.

## The face as a whole

It makes the page's idea felt, and most of all it makes the page argue with itself, which is what this page needed. The page is a spec that was never run, and the face runs it: the stretch parameter's own formula, built, finds its "physics" setting at exactly one span per crystal. The crystals' own charts disagree with their own prose about intervals and gaps. And obsidian's glass, built from its two prompts, lands in a different frame from the crystal it dissolves. "Where is the physics" is the strongest piece. It opens on ruby alone, moves one knob at a time, and reaches a test that would have read 0.00 Hz if the sentence were true. The Crystals section is busy, with seventeen figures under one stamp, but every pair is a chart and its sound beside the paragraph that predicts them, which is what the page's own Asset Plan asked for. What keeps the face from whole is one null that can't fail, put where a real test of "only ratios" was waiting in the ruby doublet's beat; one interval lookup that tells you its answer before your ear can; one glass that is quieter than it says; and one caption that calls a linear axis log.
