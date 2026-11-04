# The synth: the scanner's tables, played

`wavetable_synth.html` (one folder up) is a playable wavetable synth in the browser. It takes MIDI from any keyboard you plug in, and also plays from the computer keys or the keys on the page. It opens with three tables: the Sketch's five classics, the cello table and the 122-frame FM family chain. **Pack a folder…** packs single cycles in the family-chain order and plays them at once, with the spectral morph between frames. **Load a table .wav…** takes any table the scanner exported.

## Try it (two minutes)

1. Open `wavetable_synth.html` in Chrome and click **Engage**. Chrome asks to use MIDI devices: allow it, and every input is heard on every channel.
2. Play. On the computer keys, A W S E D F T G Y H U J K is one octave from C, and Z and X move the octave.
3. Move the **mod wheel**. It carries Position through the table, and the bright line in the picture is the frame you are hearing.
4. Pick the FM chain table, put **Unison** at 5 and **Detune** around 15 ¢, and hold a chord while the wheel goes up.

## The voice

```
wavetable osc ×1–7 unison (detune, stereo spread) → 12 dB state-variable lowpass → amp envelope → tanh
mod envelope → cutoff (± 6 oct), → Position     LFO → Position     mod wheel (CC1) → Position
CC74 → cutoff     CC64 sustain     pitch bend ± range     poly 8 · mono · legato, glide
```

The engine is `wt-synth.js`. It is one plain class with a per-sample `render(L, R, n)` and no Web Audio nodes inside it. The page stringifies the class into an AudioWorklet, and `prove_synth.cjs` runs the same class in Node. That shape makes the VST port a translation: state, a per-sample loop and named parameters are exactly what the VST Template's `Algorithm.h` takes.

- **Anti-aliasing.** `buildMips` band-limits every frame once per octave, so level L keeps harmonics up to 512 >> L. A note reads the two levels around its pitch and blends them, which keeps its top harmonic below Nyquist without a jump in timbre at the octave line.
- **Morph.** The **Morph** menu next to Table is set to *Spectral* by default. It lines up the phases of every frame and fills each gap with in-between frames made in the spectrum (`packer.js` `spectralMorph`, up to 512 frames), so no harmonic drops out halfway from one frame to the next. *Crossfade* plays the frames as they are, the way it used to. Loudness is matched on energy, not peak: lined-up phases make the waveform peakier, the engine reads floats and ends in tanh, and the switch measured within 0.1 dB in all three browsers. The numbers are in `../packer/BUILD.md` § Spectral morph. A packed folder is no longer blurred; the morph does the smoothing.
- **Envelopes.** These follow the Synth Templates standard in `vocabulary.yaml`, the Minimoog RC curve: tau = T/3, so a stage of T seconds reaches 95 % at T. The panels show each time in seconds and as the nearest vocabulary word, so *medium* here means the same 0.575 s a card means.

## What was measured (`prove_synth.json`, `synth_check.json`)

| check | result |
|---|---|
| saw at C7 (2093 Hz), 48 kHz: energy off the harmonics | −57 dB band-limited, −14.6 dB from the raw table |
| time words: when a stage reaches 95 % | instant 4.87 ms (word 4.88) · fast 15.4 ms · short 98.5 ms · medium 0.574 s · slow 1.408 s |
| 8 voices × 7 unison copies, 122-frame table, in Node | 11.4× real time |
| Morph switch, FM chain, wheel at the middle | Spectral 485 frames, Crossfade 122; level the same within 0.1 dB; switching back takes 150 to 200 ms; same in all three browsers |
| Chrome 156 · Firefox 148 · WebKit 26.4 | engage, page key, computer-key triad (60 64 67), raw MIDI bytes, wheel 0/64/127 → Position 0 / 0.504 / 1, CC74 → cutoff, release to silence, table switch, a folder of 40 organ cycles packed and played; no page errors in any |

`demo_cello.wav` and `demo_fmsynth_chain.wav` are 12-second renders from the Node engine: four chords while the mod wheel rises and falls. Nobody has heard them yet.

**Not yet tried:** a real MIDI keyboard (the test feeds raw MIDI bytes through the page's own handler, `onMidi`; headless Chrome refuses the MIDI permission), Safari.app by hand (Safari has no Web MIDI, so the computer keys are its way in), and phone touch.

## Where it goes next

- **The plugin.** Port `Engine` into the VST Template's `Algorithm.h`: the same state, the same per-sample loop and the same parameter names as `DEFAULTS`, with a table WAV loaded from disk. The host check is that the plugin and `prove_synth.cjs` render the same notes alike.
- **Synth Templates.** Its reference voice has no wavetable. Three of its cards say so: evolving-pad and detuned-dubstep-growl play a saw where a table belongs, and wavetable-chip is the third. This engine is that oscillator, and its time words already match theirs. The hook is a `wave: wavetable` source in their `voice.js` that reads a packed table, plus a card-to-patch map, so a card's words can set this synth. That code lives in their workshop, so it goes to them as a proposal.
