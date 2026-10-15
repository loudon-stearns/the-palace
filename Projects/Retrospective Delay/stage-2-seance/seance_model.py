"""Reference model of the Seance — Retrospective Delay, second move (vanilla Max).

Builds on the witness from the first move (a pure always-recording buffer,
which is exactly a half-note echo) and adds the thing an echo can't do:
SILENCE KEEPS. The buffer still writes on every sample, but in silence it
writes down what it already holds, so the last measure keeps coming back.
The listen/hold switch is a linear crossfade of a few milliseconds
(rampsmooth~ 240 240, 5 ms at 48 kHz) in both directions, going quiet and
coming back in, so neither edge clicks (Loudon, 2026-10-15). Then the seance
makes it performable:

  * the gain knob, ramped (line~), on the READ side: turning it down hides the
    past without erasing it — the witness keeps it while you aren't listening;
  * a choice of lag (quarter / half / whole note), switched without a click by
    two read heads that crossfade (the "overlapping phasors");
  * a crossfade at the loop seam — which, it turns out, is NOT at the measure
    boundary. In the witness the read head never jumps, so the measure line is
    seamless. The seam is wherever the witness stopped listening: the frozen
    measure's newest sample sits next to its oldest one. Crossfading the
    listen/hold switch (rampsmooth~ on the gate) smooths exactly that seam,
    and the splice where you come back in.

Renders:
  seance-performance.wav   a 15-measure performance: summon, re-lag, overwrite,
                           dismiss, summon again
  seam-hard.wav            a held chord that stops mid-measure, gate switched hard
  seam-smoothed.wav        the same, gate crossfaded over 5 ms
  comein-hard.wav          a frozen loop, then you come back in mid-measure, hard switch
  comein-crossfaded.wav    the same with the 5 ms crossfade in
  lagswitch-hard.wav       a frozen ghost re-lagged with one read head (jump)
  lagswitch-crossfade.wav  the same with two heads crossfading over 30 ms
and prints the click measurements. Stdlib + numpy only.

    python3 seance_model.py
"""
import sys
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "stage-1" / "witness"))
from witness_model import SR, MEASURE, phrase, pluck  # noqa: E402  (shared clock + test phrases)

THRESH = 0.003            # is anyone playing?
ENV_RELEASE_S = 0.1       # slide~ 1 4800 at 48 kHz
GATE_RAMP = 240           # rampsmooth~ 240 240 = 5 ms each way: the input crossfade
XFADE_S = 0.03            # line~ 30 ms between the two read heads
LAGS = {"quarter": MEASURE // 4, "half": MEASURE // 2, "whole": MEASURE}


def seance(x, gain, lag_events, smooth_gate=True, two_heads=True):
    """x: input; gain: per-sample knob value (already ramped);
    lag_events: list of (sample_index, lag_name), first at 0."""
    buf = np.zeros(MEASURE)
    out = np.zeros_like(x)
    ghost_out = np.zeros_like(x)
    env, g = 0.0, 0.0
    rel = np.exp(-1.0 / (SR * ENV_RELEASE_S))
    xstep = 1.0 / (SR * XFADE_S)
    events = dict(lag_events)
    lag_a = lag_b = LAGS[lag_events[0][1]]
    mix, target, active = 0.0, 0.0, 0     # mix 0 = head A, 1 = head B
    for n, s in enumerate(x):
        if n in events:
            new = LAGS[events[n]]
            if two_heads:                 # set the idle head, then crossfade to it
                if active == 0:
                    lag_b, target, active = new, 1.0, 1
                else:
                    lag_a, target, active = new, 0.0, 0
            else:
                lag_a = new
        if mix < target:
            mix = min(target, mix + xstep)
        elif mix > target:
            mix = max(target, mix - xstep)
        w = n % MEASURE
        ga = buf[(w - lag_a) % MEASURE]   # read before write
        gb = buf[(w - lag_b) % MEASURE]
        ghost = ga * (1.0 - mix) + gb * mix if two_heads else ga
        a = abs(s)
        env = a if a > env else env * rel
        hard = 1.0 if env > THRESH else 0.0
        g = g + min(max(hard - g, -1.0 / GATE_RAMP), 1.0 / GATE_RAMP) if smooth_gate else hard
        buf[w] = buf[w] + g * (s - buf[w])
        ghost_out[n] = gain[n] * ghost
        out[n] = s + ghost_out[n]
    return out, ghost_out


def ramp(n_total, points):
    """points: list of (measure_float, value); linear between, held at the ends."""
    idx = [int(m * MEASURE) for m, _ in points]
    return np.interp(np.arange(n_total), idx, [v for _, v in points])


def chord(dur_s, freqs=(220.0, 277.18, 329.63)):
    t = np.arange(int(SR * dur_s)) / SR
    att = np.minimum(1.0, t / 0.02) * np.minimum(1.0, (dur_s - t) / 0.02)  # 20 ms in and out
    return 0.12 * att * sum(np.sin(2 * np.pi * f * t) for f in freqs)


def click_score(y, start, stop):
    """largest sample-to-sample jump in a span — a held chord stays near 0.013."""
    d = np.abs(np.diff(y[start:stop]))
    return float(d.max()) if len(d) else 0.0


def write_wav(path, x):
    pcm = (np.clip(x, -1.0, 1.0) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(pcm.tobytes())


def performance():
    M = MEASURE
    x = np.zeros(M * 15)
    p1 = phrase([62, 65, 69, 72, 70, 69, 65, None, 67, 70, 74, 72, 69, None, 62, None])
    p2 = phrase([74, None, 72, 69, None, 67, 65, None])
    x[:M * 2] += p1[:M * 2]                              # m1-2  play; knob down
    x[M * 6:M * 7] += p2[:M]                             # m7    play over the ghost
    gain = ramp(len(x), [(0, 0.0), (2.0, 0.0), (3.0, 0.85),     # m3: summon
                         (8.0, 0.85), (10.0, 0.0),              # m9-10: dismiss
                         (11.0, 0.0), (11.5, 0.85)])            # m12: summon again
    lags = [(0, "half"), (int(M * 4.37), "quarter"), (int(M * 12.61), "whole")]
    y, _ = seance(x, gain, lags)
    return x, y, gain


def seam_test(smooth):
    x = np.zeros(MEASURE * 4)
    c = chord(MEASURE * 1.6 / SR)                        # held chord, cut off mid-measure
    x[:len(c)] = c
    gain = np.full(len(x), 0.85)
    y, ghost = seance(x, gain, [(0, "whole")], smooth_gate=smooth)
    return y, click_score(ghost, MEASURE * 2, MEASURE * 4)


def comein_test(smooth):
    """A chord fills one measure and is held; then you come back in mid-measure with a
    sharp pluck. The tape splices new over old at the entry point; listen as the loop
    passes over it."""
    x = np.zeros(MEASURE * 6)
    c = chord(MEASURE * 1.0 / SR)
    x[:len(c)] = c
    s = int(MEASURE * 2.41)
    p = pluck(392.0, 0.6) * 1.2
    x[s:s + len(p)] += p
    gain = np.full(len(x), 0.85)
    y, ghost = seance(x, gain, [(0, "whole")], smooth_gate=smooth)
    return y, click_score(ghost, MEASURE * 3, MEASURE * 5)


def lagswitch_test(two_heads):
    x = np.zeros(MEASURE * 4)
    c = chord(MEASURE * 1.0 / SR)                        # fills exactly one measure, then stops
    x[:len(c)] = c
    gain = np.full(len(x), 0.85)
    sw = int(MEASURE * 2.37)
    y, ghost = seance(x, gain, [(0, "whole"), (sw, "quarter")], two_heads=two_heads)
    return y, click_score(ghost, sw - 200, sw + int(SR * XFADE_S) + 200)


if __name__ == "__main__":
    x, y, gain = performance()
    write_wav(HERE / "seance-performance.wav", y)
    rms = [float(np.sqrt(np.mean((y - x)[i * MEASURE:(i + 1) * MEASURE] ** 2))) for i in range(15)]
    print("ghost RMS per measure:", " ".join(f"{r:.3f}" for r in rms))

    reference = click_score(chord(1.0), 2000, 40000)
    print(f"held chord, natural max step: {reference:.4f}")
    for smooth, name in ((False, "seam-hard"), (True, "seam-smoothed")):
        y, c = seam_test(smooth)
        write_wav(HERE / f"{name}.wav", y)
        print(f"{name}: max step in the frozen loop = {c:.4f}")
    print(f"pluck, natural max step: {float(np.abs(np.diff(pluck(392.0, 0.6) * 1.2 * 0.85)).max()):.4f}")
    for smooth, name in ((False, "comein-hard"), (True, "comein-crossfaded")):
        y, c = comein_test(smooth)
        write_wav(HERE / f"{name}.wav", y)
        print(f"{name}: max step where the loop passes the entry = {c:.4f}")
    for two, name in ((False, "lagswitch-hard"), (True, "lagswitch-crossfade")):
        y, c = lagswitch_test(two)
        write_wav(HERE / f"{name}.wav", y)
        print(f"{name}: max step around the switch = {c:.4f}")
