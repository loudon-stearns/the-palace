"""sketch.py — Simple Synth: one oscillator, one filter, one amplifier.

  oscillator  saw / square (both band-limited by polyBLEP), triangle, sine;
              tuned by the note, a coarse tune, a pitch envelope (jumps by
              `pitch_env` semitones at each note and decays in `pitch_decay`)
              and a sine LFO for vibrato (`vib_rate`, `vib_depth` in cents)
  filter      two-pole low-pass (a trapezoidal state-variable filter): cutoff,
              resonance, its own ADSR scaled by `filter_env` octaves, and key
              tracking around middle C
  amplifier   its own ADSR, velocity sensitivity, level in dB, then a soft clip
              (tanh), because a resonant filter can ring past full scale

Mono, last note priority: a new note retriggers both envelopes and the pitch
envelope; letting go of the newest note while an older one is held glides
back to the older note's pitch without a retrigger.

Envelopes: the attack rises in a straight line over its time; decay and release
fall exponentially, covering 99 % of the way in their time.

Written with scalar `math` calls, one sample at a time, so the C++ in
src/Algorithm.h can follow it operation for operation.
"""
import math

import numpy as np

LN001 = -4.605170185988091   # log(0.01): an exponential stage covers 99 % in its time
MAX_HELD = 16


class Env:
    def __init__(self):
        self.stage, self.value = 0, 0.0   # 0 idle, 1 attack, 2 decay and sustain, 3 release

    def on(self):
        self.stage = 1

    def off(self):
        if self.stage != 0:
            self.stage = 3

    def next(self, a, d, s, r, sr):
        if self.stage == 1:
            self.value += 1.0 / (a * sr)
            if self.value >= 1.0:
                self.value, self.stage = 1.0, 2
        elif self.stage == 2:
            self.value = s + (self.value - s) * math.exp(LN001 / (d * sr))
        elif self.stage == 3:
            self.value *= math.exp(LN001 / (r * sr))
            if self.value < 1e-5:
                self.value, self.stage = 0.0, 0
        return self.value


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
    freq_probe, cutoff_probe, amp_probe = np.zeros(steps), np.zeros(steps), np.zeros(steps)

    held, current, vel = [], -1, 0.0
    amp_env, filt_env = Env(), Env()
    pe = phase = lfo_phase = ic1 = ic2 = 0.0
    events, k = list(notes), 0

    for i in range(steps):
        while k < len(events) and events[k][0] <= i:
            _, on, note, velocity = events[k]
            k += 1
            if on:
                if note in held:
                    held.remove(note)
                held.append(note)
                if len(held) > MAX_HELD:
                    held.pop(0)
                current, vel = note, velocity / 127.0
                amp_env.on()
                filt_env.on()
                pe = 1.0
            else:
                if note in held:
                    held.remove(note)
                if note == current:
                    if held:
                        current = held[-1]
                    else:
                        amp_env.off()
                        filt_env.off()

        a_e = amp_env.next(p["a_attack"][i], p["a_decay"][i], p["a_sustain"][i], p["a_release"][i], sr)
        f_e = filt_env.next(p["f_attack"][i], p["f_decay"][i], p["f_sustain"][i], p["f_release"][i], sr)
        pe *= math.exp(LN001 / (p["pitch_decay"][i] * sr))
        lfo = math.sin(2.0 * math.pi * lfo_phase)
        lfo_phase += p["vib_rate"][i] / sr
        lfo_phase -= math.floor(lfo_phase)

        note_f = float(current) if current >= 0 else 60.0
        semis = note_f + p["tune"][i] + p["pitch_env"][i] * pe + p["vib_depth"][i] / 100.0 * lfo
        freq = min(440.0 * math.pow(2.0, (semis - 69.0) / 12.0), 0.45 * sr)
        dt = freq / sr
        t = phase
        wave = int(p["wave"][i])
        if wave == 0:
            y = 2.0 * t - 1.0 - blep(t, dt)
        elif wave == 1:
            t2 = t + 0.5
            if t2 >= 1.0:
                t2 -= 1.0
            y = (1.0 if t < 0.5 else -1.0) + blep(t, dt) - blep(t2, dt)
        elif wave == 2:
            y = 4.0 * abs(t - 0.5) - 1.0
        else:
            y = math.sin(2.0 * math.pi * t)
        phase += dt
        phase -= math.floor(phase)

        fc = p["cutoff"][i] * math.pow(2.0, p["filter_env"][i] * f_e + p["key_track"][i] * (note_f - 60.0) / 12.0)
        fc = min(max(fc, 20.0), 0.45 * sr)
        g = math.tan(math.pi * fc / sr)
        kq = 2.0 - 1.95 * p["resonance"][i]
        a1 = 1.0 / (1.0 + g * (g + kq))
        a2 = g * a1
        a3 = g * a2
        v3 = y - ic2
        v1 = a1 * ic1 + a2 * v3
        v2 = ic2 + a2 * ic1 + a3 * v3
        ic1 = 2.0 * v1 - ic1
        ic2 = 2.0 * v2 - ic2

        gain = math.pow(10.0, p["level"][i] / 20.0) * (1.0 - p["velocity"][i] * (1.0 - vel))
        out[0, i] = math.tanh(gain * a_e * v2)   # soft clip: a resonant patch stays under full scale
        freq_probe[i], cutoff_probe[i], amp_probe[i] = freq, fc, a_e

    return dict(out=out, probes={"freq": freq_probe, "cutoff": cutoff_probe, "amp_env": amp_probe})
