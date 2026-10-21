// Algorithm.h — Simple Synth: one oscillator, one filter, one amplifier
// (reference/sketch.py says what each part does). Mono, last note priority.
// Follows the sketch operation for operation.
#pragma once

#include "ParamSpec.h"

#include <algorithm>
#include <array>
#include <cmath>

namespace algo
{
    using tpl::ParamSpec;
    using tpl::Taper;

    // ── 1. Parameters ──────────────────────────────────────────────────────────
    enum Param
    {
        Wave, Tune, PitchEnv, PitchDecay, VibRate, VibDepth,
        Cutoff, Resonance, FilterEnv, KeyTrack, FAttack, FDecay, FSustain, FRelease,
        AAttack, ADecay, ASustain, ARelease, Velocity, Level,
        kNumParams
    };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id             name              unit   min      max      default taper          smooth ms
        { "wave",        "Wave",           "",    0.0,     3.0,     0.0,    Taper::Choice,  0.0, "saw|square|triangle|sine" },
        { "tune",        "Tune",           "st",  -24.0,   24.0,    0.0,    Taper::Linear,  20.0 },
        { "pitch_env",   "Pitch env",      "st",  -24.0,   24.0,    0.0,    Taper::Linear,  20.0 },
        { "pitch_decay", "Pitch decay",    "s",   0.005,   5.0,     0.15,   Taper::Log,     0.0 },
        { "vib_rate",    "Vibrato rate",   "Hz",  0.1,     20.0,    5.0,    Taper::Log,     20.0 },
        { "vib_depth",   "Vibrato depth",  "ct",  0.0,     100.0,   10.0,   Taper::Linear,  20.0 },
        { "cutoff",      "Cutoff",         "Hz",  20.0,    20000.0, 1200.0, Taper::Log,     20.0 },
        { "resonance",   "Resonance",      "",    0.0,     1.0,     0.3,    Taper::Linear,  20.0 },
        { "filter_env",  "Filter env",     "oct", -6.0,    6.0,     3.0,    Taper::Linear,  20.0 },
        { "key_track",   "Key track",      "",    0.0,     1.0,     0.5,    Taper::Linear,  20.0 },
        { "f_attack",    "Filter attack",  "s",   0.001,   10.0,    0.005,  Taper::Log,     0.0 },
        { "f_decay",     "Filter decay",   "s",   0.001,   10.0,    0.4,    Taper::Log,     0.0 },
        { "f_sustain",   "Filter sustain", "",    0.0,     1.0,     0.2,    Taper::Linear,  20.0 },
        { "f_release",   "Filter release", "s",   0.001,   10.0,    0.3,    Taper::Log,     0.0 },
        { "a_attack",    "Amp attack",     "s",   0.001,   10.0,    0.005,  Taper::Log,     0.0 },
        { "a_decay",     "Amp decay",      "s",   0.001,   10.0,    0.3,    Taper::Log,     0.0 },
        { "a_sustain",   "Amp sustain",    "",    0.0,     1.0,     0.7,    Taper::Linear,  20.0 },
        { "a_release",   "Amp release",    "s",   0.001,   10.0,    0.25,   Taper::Log,     0.0 },
        { "velocity",    "Velocity",       "",    0.0,     1.0,     0.5,    Taper::Linear,  20.0 },
        { "level",       "Level",          "dB",  -60.0,   6.0,     -6.0,   Taper::Linear,  20.0 },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    inline constexpr int kInputs  = 0;
    inline constexpr int kOutputs = 1;
    inline constexpr const char* kProbes[] = { "freq", "cutoff", "amp_env" };
    inline constexpr int kNumProbes = 3;

    // ── 3. State and the per-sample update ─────────────────────────────────────
    inline constexpr double kLn001 = -4.605170185988091;   // log(0.01), = sketch.py LN001

    struct Env
    {
        int stage = 0;   // 0 idle, 1 attack, 2 decay and sustain, 3 release
        double value = 0.0;

        void on() { stage = 1; }
        void off() { if (stage != 0) stage = 3; }

        double next (double a, double d, double s, double r, double sr)
        {
            if (stage == 1)
            {
                value += 1.0 / (a * sr);
                if (value >= 1.0) { value = 1.0; stage = 2; }
            }
            else if (stage == 2)
            {
                value = s + (value - s) * std::exp (kLn001 / (d * sr));
            }
            else if (stage == 3)
            {
                value *= std::exp (kLn001 / (r * sr));
                if (value < 1e-5) { value = 0.0; stage = 0; }
            }
            return value;
        }
    };

    inline double blep (double t, double dt)
    {
        if (t < dt)       { const double x = t / dt;         return x + x - x * x - 1.0; }
        if (t > 1.0 - dt) { const double x = (t - 1.0) / dt; return x * x + x + x + 1.0; }
        return 0.0;
    }

    struct Algorithm
    {
        static constexpr int kMaxHeld = 16;

        double sr = 44100.0;
        std::array<int, kMaxHeld> held {};
        int numHeld = 0, current = -1;
        double vel = 0.0;
        Env ampEnv, filtEnv;
        double pe = 0.0, phase = 0.0, lfoPhase = 0.0, ic1 = 0.0, ic2 = 0.0;
        double probes[kNumProbes] {};

        void prepare (double sampleRate) { sr = sampleRate; }

        void reset (const double*)
        {
            numHeld = 0; current = -1; vel = 0.0;
            ampEnv = {}; filtEnv = {};
            pe = phase = lfoPhase = ic1 = ic2 = 0.0;
        }

        void removeHeld (int note)
        {
            const auto end = held.begin() + numHeld;
            const auto it = std::find (held.begin(), end, note);
            if (it != end) { std::move (it + 1, end, it); --numHeld; }
        }

        void noteOn (int note, double velocity)
        {
            removeHeld (note);
            if (numHeld == kMaxHeld) removeHeld (held[0]);
            held[(size_t) numHeld++] = note;
            current = note;
            vel = velocity;
            ampEnv.on();
            filtEnv.on();
            pe = 1.0;
        }

        void noteOff (int note)
        {
            removeHeld (note);
            if (note == current)
            {
                if (numHeld > 0) current = held[(size_t) numHeld - 1];
                else { ampEnv.off(); filtEnv.off(); }
            }
        }

        void step (const double* v, const float*, float* out)
        {
            const double aE = ampEnv.next (v[AAttack], v[ADecay], v[ASustain], v[ARelease], sr);
            const double fE = filtEnv.next (v[FAttack], v[FDecay], v[FSustain], v[FRelease], sr);
            pe *= std::exp (kLn001 / (v[PitchDecay] * sr));
            const double lfo = std::sin (2.0 * M_PI * lfoPhase);
            lfoPhase += v[VibRate] / sr;
            lfoPhase -= std::floor (lfoPhase);

            const double noteF = current >= 0 ? (double) current : 60.0;
            const double semis = noteF + v[Tune] + v[PitchEnv] * pe + v[VibDepth] / 100.0 * lfo;
            const double freq = std::min (440.0 * std::pow (2.0, (semis - 69.0) / 12.0), 0.45 * sr);
            const double dt = freq / sr;
            const double t = phase;
            double y;
            switch ((int) v[Wave])
            {
                case 0:  y = 2.0 * t - 1.0 - blep (t, dt); break;
                case 1:
                {
                    double t2 = t + 0.5;
                    if (t2 >= 1.0) t2 -= 1.0;
                    y = (t < 0.5 ? 1.0 : -1.0) + blep (t, dt) - blep (t2, dt);
                    break;
                }
                case 2:  y = 4.0 * std::fabs (t - 0.5) - 1.0; break;
                default: y = std::sin (2.0 * M_PI * t); break;
            }
            phase += dt;
            phase -= std::floor (phase);

            double fc = v[Cutoff] * std::pow (2.0, v[FilterEnv] * fE + v[KeyTrack] * (noteF - 60.0) / 12.0);
            fc = std::min (std::max (fc, 20.0), 0.45 * sr);
            const double g = std::tan (M_PI * fc / sr);
            const double kq = 2.0 - 1.95 * v[Resonance];
            const double a1 = 1.0 / (1.0 + g * (g + kq));
            const double a2 = g * a1;
            const double a3 = g * a2;
            const double v3 = y - ic2;
            const double v1 = a1 * ic1 + a2 * v3;
            const double v2 = ic2 + a2 * ic1 + a3 * v3;
            ic1 = 2.0 * v1 - ic1;
            ic2 = 2.0 * v2 - ic2;

            const double gain = std::pow (10.0, v[Level] / 20.0) * (1.0 - v[Velocity] * (1.0 - vel));
            out[0] = (float) std::tanh (gain * aE * v2);   // soft clip: a resonant patch stays under full scale
            probes[0] = freq; probes[1] = fc; probes[2] = aE;
        }
    };
}
