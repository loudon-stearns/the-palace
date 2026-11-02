# Overshoot threshold — Portamento and Physical Pitch Modeling

A ten-minute listening test that measures two numbers for one listener, both about underdamped portamento
(the glide that overshoots its note and rings back):

1. **Can you hear it?** Two glides up a fifth; one lands clean (ζ = 1), one overshoots. Both reach halfway
   at 70 ms, so arrival speed is matched and the overshoot is the only cue. A 2-down 1-up staircase on the
   overshoot in cents finds the size you pick correctly about 71% of the time. Start note roves ±3 semitones
   around G3 so pitch memory doesn't help.
2. **Alive or sour?** Seven overshoots from 1.5× your threshold to 234 cents (a third of the fifth), each
   twice, shuffled. The sour line is where half your answers turn sour, interpolated in log cents.

The page ends with a JSON line to paste back. Everything is synthesized in the browser (Web Audio); no files.

| file | what |
|---|---|
| `overshoot-threshold.html` | the test. Opens standalone, or inline on the board. |
| `check_core.js` → `check_core.json` | checks the physics: each asked overshoot is produced to 0.01 cents, half-time is 70 ms at every ζ. |
| `sim_staircase.js` → `sim_staircase.json` | runs part one's staircase against 2000 simulated listeners per threshold (3, 8, 20, 50 cents). |

Run the checks with `node check_core.js` and `node sim_staircase.js`.

Not yet known: anyone's real numbers. The staircase reads about 5% low on simulated listeners (it tracks
71%, the simulated threshold is defined at 75%).
