# Family: Filter Routings

Two filters, one lesson each. From Loudon's notes: serial and parallel schemes, each a template.

Cards to write (17), in tier order:

## serial-flexible-band-pass
- name: Serial: Flexible Band-Pass
- tier: 1
- mode: mono
- classics: 
- essentials (catalog): Filter 1 HP low cutoff, filter 2 LP high cutoff; raise resonance for 'horns' at both edges. Serial.
- teaches: Two filters as one adjustable band-pass
- concepts the card must list: ["Serial routing", "Serial: flexible band-pass (HP + LP) with horns"]

## serial-extreme-48-db
- name: Serial: Extreme 48 dB
- tier: 1
- mode: mono
- classics: 
- essentials (catalog): Both filters LP 24 dB, identical settings (slave if available); then give them slightly different modulation.
- teaches: Stacked slopes
- concepts the card must list: ["Filter slope: 12 vs 24 dB/oct, poles", "Serial: extreme 48 dB, slaved filters"]

## parallel-dual-low-pass
- name: Parallel: Dual Low-Pass
- tier: 1
- mode: poly
- classics: 
- essentials (catalog): Two LP 24 dB in parallel near 300 Hz; slowly modulate one. The second only ever adds.
- teaches: Parallel smoothness vs serial steepness
- concepts the card must list: ["Parallel routing", "Parallel: dual low-pass smoothness"]

## low-res-notch-on-bass
- name: Low-Res Notch on Bass
- tier: 1
- mode: mono
- classics: 
- essentials (catalog): Big bass with a low-resonance notch in the mids; keeps the brightness and the sub, leaves room for everything else.
- teaches: Notch width (Q) on a bass
- concepts the card must list: ["Resonance as width (Q) on band-pass and notch", "Low-resonance notch on big bass"]

## serial-notch-then-low-pass
- name: Serial: Notch then Low-Pass
- tier: 2
- mode: mono
- classics: 
- essentials (catalog): Saw. Filter 1 notch (low res) in the mids; filter 2 LP 12 dB sets the highs. Serial.
- teaches: Serial routing; notch to clear mids while keeping presence
- concepts the card must list: ["Serial routing", "Serial: notch then low-pass"]

## serial-source-and-resonator
- name: Serial: Source and Resonator
- tier: 2
- mode: poly
- classics: 
- essentials (catalog): Filter 1 LP with full keytracking (the timbre); filter 2 LP/BP with no keytracking (the body). Serial.
- teaches: Keytracked vs fixed filter; formant regions
- concepts the card must list: ["Serial: source and resonator (keytracked vs fixed)"]

## serial-dual-notch-pad
- name: Serial: Dual Notch Pad
- tier: 2
- mode: poly
- classics: 
- essentials (catalog): Two notch filters, two slow unsynced LFOs with different rates, a little noise, max unison.
- teaches: Unsynced LFOs; noise builds with polyphony
- concepts the card must list: ["Noise for softness and high end", "Serial: dual notch pad with two unsynced LFOs"]

## parallel-flexible-notch-with-horns
- name: Parallel: Flexible Notch with Horns
- tier: 2
- mode: mono
- classics: 
- essentials (catalog): HP and LP in parallel, HP cutoff above LP cutoff for a mid notch; send 90% to LP, 10% to HP; inverted envelope on the HP (sustain 0); a little noise to the HP.
- teaches: Parallel notch; inverted envelope; mix balance
- concepts the card must list: ["Parallel: flexible notch with horns, inverted HP envelope, mix balance"]

## parallel-twin-peaks
- name: Parallel: Twin Peaks
- tier: 2
- mode: poly
- classics: 
- essentials (catalog): Two BP in parallel: one at the fundamental with full keytracking, one higher with partial keytracking and more resonance.
- teaches: Keytracking amount as per-note character; vocal formants
- concepts the card must list: ["Parallel routing", "Parallel: twin peaks, keytracking amount, vocal formants"]

## parallel-low-pass-and-band-pass-accent
- name: Parallel: Low-Pass and Band-Pass Accent
- tier: 2
- mode: mono
- classics: 
- essentials (catalog): LP keytracked for timbre; BP with no keytracking placed in the mix, resonance driven by a fast decay envelope scaled by velocity; a hint of overdrive after.
- teaches: Envelope → resonance; velocity → envelope amount; stationary accent band
- concepts the card must list: ["Parallel: low-pass + band-pass accent (env \u2192 resonance, velocity)", "Envelope \u2192 filter resonance"]

## filter-thunk
- name: Filter Thunk
- tier: 2
- mode: poly
- classics: 
- essentials (catalog): Resonant LP under 100 Hz in parallel with the main voice; a little keytracking, a lot of velocity modulation; subtle.
- teaches: Resonance = delay feedback; low-frequency transient
- concepts the card must list: ["Filter thunk (resonance = delay feedback)"]

## svf-morph-in-motion
- name: SVF Morph in Motion
- tier: 2
- mode: poly
- classics: 
- essentials (catalog): State-variable filter, morph LP→BP→HP modulated by a slow LFO at small depth.
- teaches: Filter-type morphing; small modulation ranges
- concepts the card must list: ["SVF morph, modulated in small amounts"]

## filter-model-test
- name: Filter Model Test
- tier: 2
- mode: mono
- classics: 
- essentials (catalog): Sine through each filter model at high resonance; watch the analyzer for added harmonics.
- teaches: Filter distortion as character
- concepts the card must list: ["Filter models and their distortion (sine test)"]

## drive-by-velocity
- name: Drive by Velocity
- tier: 2
- mode: mono
- classics: 
- essentials (catalog): Saw, LP with drive; velocity → drive, or an envelope → drive for bite on the attack; second filter after to tame it.
- teaches: Nonlinear drive; dynamics become timbre
- concepts the card must list: ["Drive: by velocity, by envelope; serial filter after", "Distortion: nonlinear, harmonic, compresses dynamics, tames resonance"]

## self-oscillating-filter-as-oscillator
- name: Self-Oscillating Filter as Oscillator
- tier: 2
- mode: mono
- classics: 
- essentials (catalog): Filter resonance past self-oscillation, keytracked 100%, oscillator muted; ping with a short envelope.
- teaches: Filter as a sine source; pinging
- concepts the card must list: ["Resonance: boost at cutoff; self-oscillation"]

## serial-bring-out-the-noise
- name: Serial: Bring Out the Noise
- tier: 3
- mode: mono
- classics: 
- essentials (catalog): LP 24 dB set low, then BP high cutoff with very high resonance to lift a couple of partials back up.
- teaches: Resonance recovers what was cut; exposes filter models
- concepts the card must list: ["Serial: bring out the noise (LP then high-Q BP)"]

## serial-notch-vs-band-pass-tug
- name: Serial: Notch vs Band-Pass Tug
- tier: 3
- mode: mono
- classics: 
- essentials (catalog): Notch (low res) and BP (high res) at the same cutoff; modulate them differently.
- teaches: Phase interaction between filters
- concepts the card must list: ["Resonance as width (Q) on band-pass and notch", "Serial: notch vs band-pass tug of war"]

