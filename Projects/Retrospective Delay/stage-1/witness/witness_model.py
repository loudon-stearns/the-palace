"""Reference model of the Witness — Retrospective Delay, first move (vanilla Max).

Runs the patch as specified, sample by sample, and asks one honest question:
is the spec'd witness actually different from a single-tap echo?

Two witnesses:
  A  "as specified"  — the buffer always writes the input; read head trails by
                       half a measure. (stage-1 patch spec, 2026-05-27)
  B  "silence keeps" — the buffer always writes, but in silence it writes down
                       what it already holds, so the last measure stays and
                       keeps coming back until you play again. (the home
                       entry's promise: "when you play silence, the last
                       phrase repeats")

Renders three WAVs (input, A, B) and prints the null test against a plain
half-note echo. Stdlib + numpy only.

    python3 witness_model.py
"""
import wave
from pathlib import Path

import numpy as np

SR = 48_000
BPM = 120
MEASURE = int(SR * 60 / BPM * 4)  # 96 000 samples = 2.0 s
LAG = MEASURE // 2                # half note behind the write head
GAIN = 0.8                        # the conduit, on the read side
HERE = Path(__file__).parent


def pluck(freq, dur):
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 7.0) * np.minimum(1.0, t * 400)
    tone = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * 2 * freq * t) + 0.15 * np.sin(2 * np.pi * 3 * freq * t)
    return 0.3 * env * tone


def phrase(notes):
    """notes: list of midi numbers (None = rest), eighth notes at BPM."""
    eighth = 60 / BPM / 2
    out = np.zeros(int(SR * eighth * len(notes)) + SR)
    for i, m in enumerate(notes):
        if m is None:
            continue
        p = pluck(440 * 2 ** ((m - 69) / 12), eighth * 2.5)
        s = int(i * SR * eighth)
        out[s:s + len(p)] += p
    return out


def build_input():
    """2 measures of phrase one, 3 measures of silence, 1 measure of phrase two, 2 of silence."""
    total = np.zeros(MEASURE * 8)
    p1 = phrase([62, 65, 69, 72, 70, 69, 65, None, 67, 70, 74, 72, 69, None, 62, None])
    p2 = phrase([74, None, 72, 69, None, 67, 65, None])
    total[:min(len(p1), MEASURE * 2)] += p1[:MEASURE * 2]
    s = MEASURE * 5
    total[s:s + min(len(p2), MEASURE)] += p2[:MEASURE]
    return total


def witness(x, silence_keeps=False, gate_thresh=0.003, hold_release_s=0.1):
    buf = np.zeros(MEASURE)
    out = np.zeros_like(x)
    env = 0.0
    rel = np.exp(-1.0 / (SR * hold_release_s))  # slide~-style release
    for n, s in enumerate(x):
        w = n % MEASURE                 # phasor~ 1n * measure-in-samples
        r = (w - LAG) % MEASURE         # (-~ 0.5) -> wrap~ -> index
        ghost = buf[r]                  # read before write, as the DSP chain orders it
        if silence_keeps:
            a = abs(s)
            env = a if a > env else env * rel
            gate = 1.0 if env > gate_thresh else 0.0
            buf[w] = buf[w] + gate * (s - buf[w])   # old + gate*(in - old)
        else:
            buf[w] = s
        out[n] = s + GAIN * ghost
    return out


def echo(x):
    y = np.zeros_like(x)
    y[LAG:] = x[:-LAG]
    return x + GAIN * y


def write_wav(path, x):
    x = np.clip(x, -1.0, 1.0)  # one shared scale, so the three files compare by ear
    pcm = (x * 32767).astype("<i2")
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(pcm.tobytes())


def rms_by_measure(x):
    return [float(np.sqrt(np.mean(x[i * MEASURE:(i + 1) * MEASURE] ** 2))) for i in range(len(x) // MEASURE)]


if __name__ == "__main__":
    x = build_input()
    a = witness(x)
    b = witness(x, silence_keeps=True)
    e = echo(x)
    print(f"null test, A vs half-note echo: max |diff| = {np.max(np.abs(a - e)):.3e}")
    print(f"null test, B vs half-note echo: max |diff| = {np.max(np.abs(b - e)):.3e}")
    print("RMS per measure (in / A / B):")
    for i, (ri, ra, rb) in enumerate(zip(rms_by_measure(x), rms_by_measure(a), rms_by_measure(b))):
        print(f"  m{i + 1}: {ri:.4f}  {ra:.4f}  {rb:.4f}")
    write_wav(HERE / "witness-input.wav", x)
    write_wav(HERE / "witness-A-as-specified.wav", a)
    write_wav(HERE / "witness-B-silence-keeps.wav", b)
