"""sketch.py — Shepard Tone: the endless staircase as a playable instrument.

What the four proofs settled, in one loop (Theory § Stages 1–4 on the page):

  stack       one played pitch becomes ten voices a whole number of octaves apart,
              from C0 (16.35 Hz) up through ten octaves. A voice that climbs past
              the top re-enters at the bottom: the wrap, at the same pitch class.
  glide       ONE glide, run on pitch before the stack, so every voice moves as one
              (Stage 3). `glide` is its time constant. `climb` adds an endless drift
              in semitones per second: the Risset glissando, under the hand.
  window      the Shepard loudness sits on each VOICE, by its fundamental (Stage 4):
              a Gaussian in log-frequency, centred at `center` Hz, `width` octaves
              wide (one standard deviation).
  timbre      each voice is a sine or a band-limited saw, through its own two-pole
              low-pass whose cutoff is `tone` times THAT voice's frequency (Stage 4:
              the filter follows the voice), with `resonance`.
  amplifier   a linear attack, a release falling 99 % in its time, level in dB, then
              a soft clip. Mono, last note priority.

Two teaching switches break the illusion on purpose, the two ways the proofs found:

  drift       gives each voice its own glide time, spread by up to ±drift (Stage 3's
              failure). Play a climb with glide on: the octaves stop agreeing.
  track_note  wires the cutoff from the played note folded into one octave, one
              signal for every voice (Stage 4's failure): the brightness steps
              once an octave, and the seam comes back in the tone.

Written with scalar `math` calls, one sample at a time, in the order
src/Algorithm.h runs it.
"""
import math

import numpy as np

LN001 = -4.605170185988091   # log(0.01): the release covers 99 % in its time
N = 10                       # voices, one per octave
LO = 12.0                    # MIDI pitch of the stack's floor, C0
SPAN = 12.0 * N              # the stack's height in semitones; a voice wraps by this
SQRT2PI = 2.5066282746310002
F_C4 = 261.6255653005986
MAX_HELD = 16
# how far each voice's glide time strays when drift is 1: fixed, so the
# plugin and the sketch agree, and spread so neighbours disagree
SPREAD = [-1.0, 0.56, -0.33, 0.78, -0.78, 0.11, 1.0, -0.56, 0.33, -0.11]
PROBES = ["env", "climb_pos"] + [f"s{k}" for k in range(N)]


def blep(t, dt):
    if t < dt:
        x = t / dt
        return x + x - x * x - 1.0
    if t > 1.0 - dt:
        x = (t - 1.0) / dt
        return x * x + x + x + 1.0
    return 0.0


def render(v, sr, inputs=None, notes=()):
    p = {k: a.tolist() for k, a in v.items()}
    steps = len(p["level"])
    out = np.zeros((1, steps))
    probes = {name: np.zeros(steps) for name in PROBES}

    held, current, primed = [], -1, False
    target = 60.0
    pk = [60.0] * N
    phase = [0.0] * N
    ic1 = [0.0] * N
    ic2 = [0.0] * N
    climb_pos = 0.0
    stage, env = 0, 0.0      # 0 idle, 1 attack, 2 sustain, 3 release
    events, e = list(notes), 0

    for i in range(steps):
        while e < len(events) and events[e][0] <= i:
            _, on, note, velocity = events[e]
            e += 1
            if on:
                if note in held:
                    held.remove(note)
                held.append(note)
                if len(held) > MAX_HELD:
                    held.pop(0)
                current = note
                target = float(note)
                if not primed:
                    pk = [target] * N
                    primed = True
                stage = 1
            else:
                if note in held:
                    held.remove(note)
                if note == current:
                    if held:
                        current = held[-1]
                        target = float(current)
                    elif stage != 0:
                        stage = 3

        if stage == 1:
            env += 1.0 / (p["attack"][i] * sr)
            if env >= 1.0:
                env, stage = 1.0, 2
        elif stage == 3:
            env *= math.exp(LN001 / (p["release"][i] * sr))
            if env < 1e-5:
                env, stage = 0.0, 0

        climb_pos += p["climb"][i] / sr
        climb_pos -= SPAN * math.floor(climb_pos / SPAN)

        glide, drift = p["glide"][i], p["drift"][i]
        log2c = math.log2(p["center"][i] / 440.0)
        w = p["width"][i]
        inv2w2 = 1.0 / (2.0 * w * w)
        saw = int(p["wave"][i]) == 1
        tone, kq = p["tone"][i], 2.0 - 1.95 * p["resonance"][i]
        track_note = p["track_note"][i] > 0.5
        nyq = 0.45 * sr
        if track_note:
            fold = pk[0] + climb_pos - 60.0
            fold -= 12.0 * math.floor(fold / 12.0)
            fc_note = tone * F_C4 * math.pow(2.0, fold / 12.0)

        acc = 0.0
        for k in range(N):
            tau = glide * (1.0 + drift * SPREAD[k])
            pk[k] += (target - pk[k]) * (1.0 - math.exp(-1.0 / (tau * sr)))
            m = pk[k] + climb_pos - LO + 12.0 * k
            m -= SPAN * math.floor(m / SPAN)
            s = LO + m
            probes[f"s{k}"][i] = s
            f = min(440.0 * math.pow(2.0, (s - 69.0) / 12.0), nyq)
            x = (s - 69.0) / 12.0 - log2c
            g_win = math.exp(-x * x * inv2w2)

            dt = f / sr
            t = phase[k]
            if saw:
                y = 2.0 * t - 1.0 - blep(t, dt)
            else:
                y = math.sin(2.0 * math.pi * t)
            t += dt
            t -= math.floor(t)
            phase[k] = t

            fc = fc_note if track_note else tone * f
            fc = min(max(fc, 10.0), nyq)
            g = math.tan(math.pi * fc / sr)
            a1 = 1.0 / (1.0 + g * (g + kq))
            a2 = g * a1
            a3 = g * a2
            v3 = y - ic2[k]
            v1 = a1 * ic1[k] + a2 * v3
            v2 = ic2[k] + a2 * ic1[k] + a3 * v3
            ic1[k] = 2.0 * v1 - ic1[k]
            ic2[k] = 2.0 * v2 - ic2[k]

            acc += g_win * v2

        gain = math.pow(10.0, p["level"][i] / 20.0) / (w * SQRT2PI)
        out[0, i] = math.tanh(gain * env * acc)
        probes["env"][i] = env
        probes["climb_pos"][i] = climb_pos

    return dict(out=out, probes=probes)
