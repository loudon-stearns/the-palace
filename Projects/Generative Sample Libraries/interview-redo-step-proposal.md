# Proposed addition to the Interview skill — "Rule 3: a flagged key is re-asked, not patched"

Drafted by the Generative Sample Libraries steward, cycle 38 (2026-10-15). A proposal for the
Interview skill at `_ops/sample-libraries/skills/interview/SKILL.md`, which a steward does not edit;
an elder lands it, or doesn't. It would sit after Rule 2 (audition before the full batch), as the
step that follows the full batch for a model source.

---

### After the batch — when the source is a model, the listener's notes go back to the model

Rule 2 catches a bad batch before it is made. A model source needs one more step after it,
because a model's takes vary: forty keys can be fine and three can sound like another player.

1. **Ask which keys give it away.** After the full instrument is heard, ask: "Which keys don't
   sound like the rest?" Accept key names (A#3, C4), or "none". Offer the measured weak keys as a
   starting list, so the listener isn't searching blind: the keys whose sample had to be lifted
   or cut most to sit at one level, and the keys whose swell the finishing pass couldn't reach.
2. **Re-ask the model; never patch the sample.** For each flagged key, render fresh takes asked for
   that key on seeds no earlier run used (six by default; the model picks its own octave, and
   about a third of takes land where asked). The take that held the key is rejected. The fresh
   takes may fill only the flagged keys, so no key the listener didn't name changes.
3. **Rebuild with the same chain, and play back only what changed.** Same pitch check, attacks,
   loops, level and velocity as the shipped build. Then play each flagged key held, old then new,
   and say where its new sample came from: a fresh take, an older take that had lost to the first
   pick, or a neighbour stretched over it.
4. **Round again, or stop.** The listener says "better", "still off" (another round on those keys,
   which keeps the earlier rounds' rejections) or "worse" (keep the shipped build). Stop when the
   listener says the instrument sounds like one player.

The tool: `Projects/Generative Sample Libraries/ai-source-probe/redo_keys.py`
(`redo_keys.py violin A#3 C4 --takes 6 --tag r1 --name "MusicGen Violin"`). Each round writes
`instruments/redo/<instrument>.json`, which carries every rejected take and every fresh run forward.

Why this is a rule and not a nicety: the loudness and swell fixes in `finish_instrument.py` can
only move a take's level. A take the model played thin, breathy or late stays thin, breathy or late
at any level. The only fix for a bad take is a better take.
