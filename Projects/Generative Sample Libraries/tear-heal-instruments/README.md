# Tear-and-heal instruments

Sampled instruments from the frustration sweeps on Harmonicity and Inharmonicity, made for the Generative Sample Libraries baton of 2026-10-17: a dissonant, inharmonic, torn attack that falls into a locked, steady sustain. Nothing in a note's envelope is drawn. A strike throws the tone's stretch past the edge where its partials can no longer hold against the voices pulling them; the pitch sags and wobbles; the stretch decays back under the edge and the tone relocks. The attack and the sustain come out of one mechanism.

Every key sits against its own edge. The baton's caveat said to find the edge for each patch rather than copy the field guide's numbers, so `build.py` bisects it on every sample key and places the sustain at 0.35 of it: alive, under the edge, never on it.

## Listen first

Everything below is in `audition/`, the smallest set that exercises every instrument: its lowest and highest key, soft, mid and hard.

1. **`first-note.wav`**: the baton's own next move, one strike with `gestures_warm.py`'s settings and nothing designed. Is this an instrument's note?
2. **`audition.wav`** (about 2 minutes) with **`cues.md`** beside it: what plays when, and how deep each note tore and when it healed. It is played through the written SFZ, so it is what a sampler will play.
3. **`traces.png`**: partial 1 of every strike, in cents against its key. The tear, then the heal.
4. **To play it:** drag `audition/heal/Heal.dslibrary` (or `snap/`, `bar/`, `voices/`) onto the free DecentSampler plugin, or open the `.sfz` in sforzando or sfizz. The audition build plays only its two sample keys and the keys either side of each.

## What to listen for

- **Does the tear read as an attack?** There is no loudness accent: a note starts at full level and the tear is the whole attack. If it wants a hit, that can be a drawn envelope in the sampler (the SFZ's `ampeg_decay` / `ampeg_sustain`), but then something is drawn.
- **Velocity is strike depth.** Soft throws the stretch 2× past the key's edge, mid 6×, hard 20×. Harder tears deeper and heals later: Heal at C1 dips 22, 52 and 123 cents and heals at 0.7, 1.2 and 2.0 s.
- **The register is a clock.** Coupling scales with pitch, so a low note is the same strike, slower. Heal heals in 2 s at C1 and in a quarter of a second at C7, where the tear is a chirp.
- **The sustain.** Heal's low keys keep a shimmer of about 3 cents after the heal (their highest partials never quite lock). Snap and every high key are dead still.
- **Bar to String** behaves differently from the rest: it starts clean, as a bar, and breaks partway through as the stretch falls through the edge, then heals into a string. Velocity sets how long the bar rings before it breaks (at C2 the three layers have healed by about 1.3, 1.9 and 2.4 s), more than how deep the tear goes (all three dip about 280 cents).
- **Heal with Voices** is Heal's own strikes with the outside voices mixed in, as the sweeps' with-voices renders were. The dissonance is the beating against a harmonic ensemble; the heal is the beating stopping. Is that the sound, or is the tone alone the sound?

## The collection

Rendered 2026-10-20, after Loudon's answer to the audition: "Good. The names in BUILD.md are fine." Each instrument is a folder in `instruments/`: drag its `.dslibrary` onto DecentSampler, or open its `.sfz` in sforzando or sfizz with `samples/` beside it. Beside each, `walk.wav` plays every sample root from low to high at mid velocity, and `velocity.wav` strikes the middle key at velocity 30, 64, 100 and 127.

| Instrument | Keys played | Sample roots | Samples | Hard strike: dip, cents | Hard strike heals in, s | Sustain wobble, cents |
|---|---|---|---|---|---|---|
| Heal | A0–D#7 | 25 (C1–C7) | 75 | 123–328 | 0.28–2.0 | 0.3–3.9 |
| Snap | A2–D#7 | 17 (C3–C7) | 51 | 277–463 | 0.17–0.67 | 0.2 |
| Bar to String | A1–D#6 | 17 (C2–C6) | 51 | 159–315 | 0.54–2.4 | 0.1–3.2 |
| Heal with Voices | A0–D#6 | 21 (C1–C6) | 63 | 123–290 | 0.38–2.0 | 0.3–3.9 |

The first render took about four minutes on this Mac (bisecting 52 edges, 168 s; the strikes, 67 s; then the checks and demos). With the edges cached in `edges.json`, a re-render takes about two.

## Rebuild

```bash
cd "Projects/Generative Sample Libraries/tear-heal-instruments"
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python engine.py              # parity: the compiled loop against the sweeps' own numpy loop
.venv/bin/python build.py audition
.venv/bin/python build.py all
```

## What is verified, and what is not

**Verified by measurement, from the files on disk** (`*/check.json`; the collection's numbers, the audition's in brackets):
- every sample's loop body is on pitch once its `tune` is applied: 240 of 240, worst 1.4 cents (audition: worst 0.7);
- every sample held 12 s through the player shows no click and no pump at the loop wraps: the limits are `loop_sustain.py`'s (6 dB, 1.5 dB), and the build prefers seams with room to spare (worst in the collection: a 4.1 dB click, a 0.98 dB level step);
- every loop starts after its note has healed;
- the SFZ and the `.dspreset` map the same samples to the same keys, velocities, tunes and loops, and the `.dslibrary` holds every sample;
- the pitch check fails when it should: a sample filed 25 cents wrong measures 25 cents wrong;
- the compiled model matches the sweeps' own loop to 2e-9 (`engine.py`).

**Not verified:**
- **No one has heard the full collection.** Loudon answered the audition; the 240 samples since are unheard.
- The `.dspreset` has not been loaded in DecentSampler, nor the `.sfz` in sforzando or sfizz; both were only read back as files. `ampVelTrack` follows DecentSampler's developer guide.
- The demo player's velocity curve is sfizz's reading of `amp_veltrack`; another player may scale soft notes differently.
- The edge is found by measurement (the sweeps' tear line, 7.9 cents of wobble), not by ear. The field guide's own method is by ear.

## What lives only on this Mac

The WAVs and the `.dslibrary` zips (`.gitignore`, 2026-10-18; the zips are listed in this folder's `.gitignore` because they hold the WAVs). They exist in the worktree they were rendered in. A checkout that wants them runs the rebuild above.

## Tried and set aside

**Coupling as the heal (`ride-coupling`).** Stretch held past the edge while coupling rises until the tone locks. At A3, with the stretch 1.3–2.4× past the edge and coupling rising four- to sixfold, the start shivers by 8–14 cents and the sustain never fully stills (3–5 cents left), against a strike's 36 cents settling to 2. It is a gentler instrument, not this one.

## Files

- `engine.py`: the model and its measures. `source/`: the sweeps' scripts and field guide, copied unchanged from commit b76016a2.
- `patches.py`: the four instruments and the reason behind each choice.
- `build.py`: the recipe. `sampler.py`: the formats and the player. `demos.py`: the listening files and the figure.
- `edges.json`: every key's edge, as bisected.
