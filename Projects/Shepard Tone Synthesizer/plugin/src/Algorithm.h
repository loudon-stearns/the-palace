// Algorithm.h — Shepard Tone: the endless staircase, playable
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
        Center, Width, Glide, Climb, Wave, Tone, Resonance, Drift, TrackNote,
        Attack, Release, Level,
        kNumParams
    };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id             name              unit    min     max      default  taper           smooth choices      auto   group                hero
        { "center",      "Window",         "Hz",   80.0,   2000.0,  440.0,   Taper::Log,     20.0,  "",          true,  "Window",            true },
        { "width",       "Width",          "oct",  0.5,    3.0,     1.4,     Taper::Linear,  20.0,  "",          true,  "Window",            true },
        { "glide",       "Glide",          "s",    0.001,  5.0,     0.15,    Taper::Log,     0.0,   "",          true,  "Motion" },
        { "climb",       "Climb",          "st/s", -12.0,  12.0,    0.0,     Taper::Linear,  20.0,  "",          true,  "Motion" },
        { "wave",        "Wave",           "",     0.0,    1.0,     1.0,     Taper::Choice,  0.0,   "sine|saw",  true,  "Timbre" },
        { "tone",        "Tone",           "×",    1.0,    24.0,    4.0,     Taper::Log,     20.0,  "",          true,  "Timbre" },
        { "resonance",   "Resonance",      "",     0.0,    0.9,     0.0,     Taper::Linear,  20.0,  "",          true,  "Timbre" },
        { "drift",       "Drift",          "",     0.0,    0.8,     0.0,     Taper::Linear,  20.0,  "",          true,  "Break it" },
        { "track_note",  "Track the note", "",     0.0,    1.0,     0.0,     Taper::Toggle,  0.0,   "",          true,  "Break it" },
        { "attack",      "Attack",         "s",    0.001,  5.0,     0.02,    Taper::Log,     0.0,   "",          true,  "Output" },
        { "release",     "Release",        "s",    0.001,  10.0,    0.6,     Taper::Log,     0.0,   "",          true,  "Output" },
        { "level",       "Level",          "dB",   -60.0,  6.0,     -6.0,    Taper::Linear,  20.0,  "",          true,  "Output" },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    inline constexpr int kInputs  = 0;
    inline constexpr int kOutputs = 1;
    inline constexpr int N = 10;   // voices, one per octave
    inline constexpr const char* kProbes[] = { "env", "climb_pos",
        "s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9" };
    inline constexpr int kNumProbes = 2 + N;

    // ── 3. State and the per-sample update ─────────────────────────────────────
    inline constexpr double kLn001  = -4.605170185988091;   // = sketch.py LN001
    inline constexpr double kLo     = 12.0;                 // C0, the stack's floor
    inline constexpr double kSpan   = 12.0 * N;
    inline constexpr double kSqrt2Pi = 2.5066282746310002;
    inline constexpr double kFC4    = 261.6255653005986;
    inline constexpr double kSpread[N] = { -1.0, 0.56, -0.33, 0.78, -0.78, 0.11, 1.0, -0.56, 0.33, -0.11 };

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
        bool primed = false;
        double target = 60.0, climbPos = 0.0, env = 0.0;
        int stage = 0;   // 0 idle, 1 attack, 2 sustain, 3 release
        std::array<double, N> pk {}, phase {}, ic1 {}, ic2 {};
        double probes[kNumProbes] {};

        void prepare (double sampleRate) { sr = sampleRate; }

        void reset (const double*)
        {
            numHeld = 0; current = -1; primed = false;
            target = 60.0; climbPos = 0.0; env = 0.0; stage = 0;
            pk.fill (60.0); phase.fill (0.0); ic1.fill (0.0); ic2.fill (0.0);
        }

        void removeHeld (int note)
        {
            const auto end = held.begin() + numHeld;
            const auto it = std::find (held.begin(), end, note);
            if (it != end) { std::move (it + 1, end, it); --numHeld; }
        }

        void noteOn (int note, double)
        {
            removeHeld (note);
            if (numHeld == kMaxHeld) removeHeld (held[0]);
            held[(size_t) numHeld++] = note;
            current = note;
            target = (double) note;
            if (! primed) { pk.fill (target); primed = true; }
            stage = 1;
        }

        void noteOff (int note)
        {
            removeHeld (note);
            if (note == current)
            {
                if (numHeld > 0) { current = held[(size_t) numHeld - 1]; target = (double) current; }
                else if (stage != 0) stage = 3;
            }
        }

        void step (const double* v, const float*, float* out)
        {
            if (stage == 1)
            {
                env += 1.0 / (v[Attack] * sr);
                if (env >= 1.0) { env = 1.0; stage = 2; }
            }
            else if (stage == 3)
            {
                env *= std::exp (kLn001 / (v[Release] * sr));
                if (env < 1e-5) { env = 0.0; stage = 0; }
            }

            climbPos += v[Climb] / sr;
            climbPos -= kSpan * std::floor (climbPos / kSpan);

            const double glide = v[Glide], drift = v[Drift];
            const double log2c = std::log2 (v[Center] / 440.0);
            const double w = v[Width];
            const double inv2w2 = 1.0 / (2.0 * w * w);
            const bool saw = (int) v[Wave] == 1;
            const double tone = v[Tone], kq = 2.0 - 1.95 * v[Resonance];
            const bool trackNote = v[TrackNote] > 0.5;
            const double nyq = 0.45 * sr;
            double fcNote = 0.0;
            if (trackNote)
            {
                double fold = pk[0] + climbPos - 60.0;
                fold -= 12.0 * std::floor (fold / 12.0);
                fcNote = tone * kFC4 * std::pow (2.0, fold / 12.0);
            }

            double acc = 0.0;
            for (int k = 0; k < N; ++k)
            {
                const double tau = glide * (1.0 + drift * kSpread[k]);
                pk[(size_t) k] += (target - pk[(size_t) k]) * (1.0 - std::exp (-1.0 / (tau * sr)));
                double m = pk[(size_t) k] + climbPos - kLo + 12.0 * k;
                m -= kSpan * std::floor (m / kSpan);
                const double s = kLo + m;
                probes[2 + k] = s;
                const double f = std::min (440.0 * std::pow (2.0, (s - 69.0) / 12.0), nyq);
                const double x = (s - 69.0) / 12.0 - log2c;
                const double gWin = std::exp (-x * x * inv2w2);

                const double dt = f / sr;
                double t = phase[(size_t) k];
                const double y = saw ? 2.0 * t - 1.0 - blep (t, dt) : std::sin (2.0 * M_PI * t);
                t += dt;
                t -= std::floor (t);
                phase[(size_t) k] = t;

                double fc = trackNote ? fcNote : tone * f;
                fc = std::min (std::max (fc, 10.0), nyq);
                const double g = std::tan (M_PI * fc / sr);
                const double a1 = 1.0 / (1.0 + g * (g + kq));
                const double a2 = g * a1;
                const double a3 = g * a2;
                const double v3 = y - ic2[(size_t) k];
                const double v1 = a1 * ic1[(size_t) k] + a2 * v3;
                const double v2 = ic2[(size_t) k] + a2 * ic1[(size_t) k] + a3 * v3;
                ic1[(size_t) k] = 2.0 * v1 - ic1[(size_t) k];
                ic2[(size_t) k] = 2.0 * v2 - ic2[(size_t) k];

                acc += gWin * v2;
            }

            const double gain = std::pow (10.0, v[Level] / 20.0) / (w * kSqrt2Pi);
            out[0] = (float) std::tanh (gain * env * acc);
            probes[0] = env;
            probes[1] = climbPos;
        }
    };
}
