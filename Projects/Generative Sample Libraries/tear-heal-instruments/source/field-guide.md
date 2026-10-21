# Field guide to the edge

How to find, hold and play the thresholds of a stretched tone under pull. Everything here was heard in the renders beside this guide; the numbers come from one toy model (one tone, its partials pulled by outside voices tuned to the plain harmonic series), so trust the directions and the shapes, not the exact values.

## The five knobs

| Knob | What it does | Turn it up and… |
|---|---|---|
| **Stretch (B)** | How far the partials sharpen away from whole-number ratios (stiff-string law, partial n ≈ n·√(1+B·n²)) | you travel frozen → alive → edge → torn → released |
| **Coupling (K)** | How hard each outside voice pulls its partial | the edge moves to a larger stretch; too much and even a harmonic tone gets thrown around |
| **Inertia** | How stubborn the tone is | the tone stops bargaining; the voices bend to it instead (the heavy master) |
| **Partial count** | How high the spectrum reaches | the edge comes much sooner (stretch bites as roughly B·n³) and the break frays instead of snapping |
| **Pinning** | Hold partial 1 fixed while the rest stretch | the far end stops flying off and lands on a bar (ratios 1, 4, 9, 16 …), periodic again |

Pitch acts as a sixth knob if coupling scales with it: a low note is the same map on a slower clock.

## The regions (see `edgemap.png`)

- **Frozen**: whole-number ratios; the waveform repeats exactly. Steady and a little dead.
- **Alive**: just under the edge. Pitch holds (it sags a touch, the tone bargaining), the colour turns over. This is where most of the music is.
- **The edge**: the boundary line on the map. A few voices: a cliff. Many voices: a fraying.
- **Torn**: pitch wobbles and sinks; with few voices, a sawtooth of slips.
- **Released**: so far stretched that nothing can grip; the tone goes free (lower right of the map).
- **Over-coupled**: pull so strong that even the harmonic tone is shoved around (top band, 40 partials).

## How to find the edge

1. **Sweep slowly and on a log scale.** The edge sits at very different stretches for different tones; a linear sweep rushes past it. Equal time per doubling of B (`sweep40`, `sweep120`).
2. **Listen to the tone alone first** (`*-alone.m4a`). The voices mask the moment the colour starts moving.
3. **Watch two signs together:** the colour moving while the pitch holds means alive; the pitch itself starting to jitter means you are at the edge.
4. **Bisect.** Once you hear the break, halve the distance back and forth in B until the tone just holds. That is the place to build from.
5. **Few partials to find it, many to play it.** A 6-partial tone snaps cleanly (easy to locate); 40 or more fray (richer to live in).

## How to stay there, and move around it

- **Hold B just under the edge and ride coupling.** Coupling is the cleaner performance knob: at fixed stretch, raising K locks the tone and lowering it lets it tear (`ride-coupling`).
- **Breathe across it.** A slow log-shaped swing of B through the edge (period 10 to 20 s) gives tear-and-heal phrases (`ride-breathe`).
- **Use inertia as a brake.** A heavier tone can sit deep in stretch without tearing; a lighter one is more expressive near the edge.
- **Pin for timbre travel without loss.** With partial 1 pinned and coupling near zero, B becomes a string ↔ bar morph that never leaves its pitch (`ride-string-bar`).

## Gestures (`gestures`)

- **Quick modulation**: a 3 Hz wobble of B across the edge gives a fluttering, half-torn texture; the tone never fully relocks.
- **Percussive**: throw B far past the edge and let it decay (τ ≈ 0.25 s). Each strike tears, then heals: a pitch-drop and recovery, much like a drum's pitch envelope, made by physics rather than an envelope.
- **Sequenced**: step B through a pattern spanning frozen / alive / edge / torn. Only the steps above the edge tear, so the sequence plays the threshold as a rhythm.

## Source and register

- **A warm source helps.** Many harmonics, rolled off steeply, random starting phases (`*-warm`). The bright early renders made the effect harder to hear.
- **A low note slows everything down.** With coupling scaled to pitch, the bass version (`*-bass`, E1, 96 partials) shows the same edge, with the shimmer and the tears unfolding about 2.7× slower. The gestures kept their timing in seconds, so they hit the bass tone faster relative to its own clock.

## Still to try

- Coupling that follows loudness, so quiet upper partials pull weakly (the warm source should then hold longer).
- Voices free to re-pair with whichever partial is nearest during a dive.
- Real measured stretch (piano, bar, bell) in place of the stiff-string law.
- Two tones coupled to each other instead of to a fixed harmonic ensemble.
- The consonance question: does the edge sit where the ear starts to hear roughness?
