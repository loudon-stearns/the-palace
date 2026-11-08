# Semantic Delay — the first plugin

A VST3 and AU you put on a send in Live. It cuts what you sing into phrases,
sends each one to the Python helper (`../daemon/`), and plays back each echo
sung by the helper's voice, seconds later. Built 2026-11-02 from
[VST Template](../../VST%20Template/template/README.md)'s machinery, plugin
code `Smdl`.

## How it is built

Two threads, as the standing orders say:

- **The audio thread** (`Algorithm::step`) mixes the input to mono, keeps a
  short pre-roll, and cuts phrases with an energy gate (the numbers in
  `../standalone/segmenter.py`, on 512-sample blocks). It plays the echoes
  that are ready. It never waits, locks or allocates.
- **A worker thread** sends each phrase to the helper over its socket
  (`src/HelperLink.h`, contract v0.2 with the melody knob, falling back to
  v0.1). It sings one echo at a time, always the one due soonest across every
  phrase in flight, and publishes each echo the moment it is back, so a first
  repeat plays while later ones are still being sung.

The plugin reports zero latency to Live: the delay is the effect. An echo that
comes back after its time plays at once, late, instead of clipped at the
front, and is counted.

## The knobs

| knob | what it does |
|---|---|
| Delay | 2–30 s from the end of a phrase to its first echo. With the model at about 1 s of compute per sung second (16 steps), the delay must be at least the phrase length plus a little, or the echo comes late. |
| Repeats, Feedback | 1–4 echoes; each repeat is quieter by the feedback amount. |
| Voice | which of the helper's reference singers sings, in the helper's own order (`prompts.list`). |
| Hold melody | the melody knob of the first echo: 1 sings your melody, 0 wanders onto the phrase's scale. |
| Let go | how much each later repeat loosens: repeat i is held at `hold × (1 − letgo)^i`. Repeats with the same setting are sung once and reused. |
| Quality | 16 steps (fast) or 32 (fine): the half of the open speed-vs-quality question a knob can answer. |
| Dry, Wet, Phrase gate | levels, and how loud a sound must be to start a phrase. |

## Where the helper is

`$SEMANTIC_DELAY_SOCK`, else `$SEMANTIC_DELAY_RUNTIME_DIR/daemon.sock`, else
`/tmp/semantic-delay-<uid>/daemon.sock` — the helper's own default. So: start
the helper with its defaults, then open Live.

```bash
~/miniconda3/envs/soulx/bin/python ../daemon/semantic_delay_daemon.py --backend soulx
```

With no helper running, the plugin passes the dry signal and stays silent on
the wet side; it tries again on the next phrase.

## Checked by

- `./plugin.sh verify` (run with `SEMANTIC_DELAY_SOCK=/nonexistent/sd.sock`):
  the audio thread against `reference/sketch.py`, sample for sample, with the
  phrase gate and phrase count matched exactly. Two paths: two sung phrases;
  a click (let go) and a 9 s note (cut at 8 s).
- `./plugin.sh validate`: codesign, pluginval at strictness 5, auval. Passed.
- `./plugin.sh hostcheck`: loads the installed VST3 and AU as a DAW does. Passed.
- `tests/run_echo_test.py --backend soulx`: the plugin's own `Algorithm.h`,
  built without JUCE, played in real time against the real helper. Two sung
  phrases, 12 s delay, two repeats each (k = 1, then 0.5): four echoes, all on
  time, all sung by the reference singer. Report, picture and output in
  `proofs/echo-through-helper-soulx/`. `--backend stub` checks the timing
  without the model.

## Gotchas

- **The phrase gate counted its own hangover.** The 0.3 s of quiet that closes
  a phrase counted toward the 0.2 s minimum, so a click was always long enough
  to send. The plugin counts only what came before the quiet. The standalone
  instrument's `segmenter.py` still has the old behaviour.
- **Sing the soonest echo first.** Converting phrase by phrase put a new
  phrase's first echo behind an older phrase's second; at a 12 s delay it came
  0.33 s late. Ordering by due time fixed it.
- **The host check needs a move that changes the sound with no helper.** Wet
  and the gate don't, in a one-second render with nothing to echo; Dry does.
- **The editor needs at least 900 × 560.**
- `./plugin.sh editor` returned NO PICTURE on 2026-11-02; the mock
  (`ui.py shot`) is the picture in `proofs/editor-900x600.png`.
