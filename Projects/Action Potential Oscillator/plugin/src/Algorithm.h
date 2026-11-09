// Algorithm.h — Action Potential: a crowd of Stage-4 neurons, every knob a mechanism.
// reference/sketch.py says what each part does; this follows it operation for
// operation. Mono, last note priority; the crowd runs between notes, silent.
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
    enum Param { Couple, Spread, Size, Anchor, LeakSpread, ThrSpread,
                 Leak, Spike, Rise, Peak, Hyp, Damp, Refr,
                 Glide, Attack, Release, Velocity, Even, Level, kNumParams };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id            name               unit   min     max     default taper          smooth choices         auto   group       hero
        { "couple",     "Coupling",        "",    0.0,    0.04,   0.006,  Taper::Linear, 20.0, "",            true,  "Crowd",    true },
        { "spread",     "Rate spread",     "",    0.0,    0.5,    0.1,    Taper::Linear, 20.0, "",            true,  "Crowd",    true },
        { "size",       "Crowd",           "",    0.0,    4.0,    3.0,    Taper::Choice, 0.0,  "1|8|16|32|64", false, "Crowd" },
        { "anchor",     "Pitch anchor",    "",    0.0,    1.0,    1.0,    Taper::Linear, 20.0, "",            true,  "Crowd" },
        { "leakspread", "Leak spread",     "",    0.0,    0.5,    0.05,   Taper::Linear, 20.0, "",            true,  "Crowd" },
        { "thrspread",  "Threshold spread","",    0.0,    0.3,    0.02,   Taper::Linear, 20.0, "",            true,  "Crowd" },
        { "leak",       "Leak tau",        "ms",  0.1,    50.0,   5.0,    Taper::Log,    20.0, "",            true,  "Membrane" },
        { "spike",      "Spike length",    "ms",  0.1,    5.0,    1.0,    Taper::Log,    20.0, "",            true,  "Spike" },
        { "rise",       "Na rise share",   "",    0.05,   0.95,   0.3,    Taper::Linear, 20.0, "",            true,  "Spike" },
        { "peak",       "Spike peak",      "",    1.01,   3.0,    1.5,    Taper::Linear, 20.0, "",            true,  "Spike" },
        { "hyp",        "Undershoot",      "",    -0.8,   -0.01,  -0.2,   Taper::Linear, 20.0, "",            true,  "Recovery" },
        { "damp",       "Recovery damping","",    0.05,   2.0,    0.3,    Taper::Log,    20.0, "",            true,  "Recovery" },
        { "refr",       "Refractory",      "ms",  0.1,    20.0,   1.5,    Taper::Log,    20.0, "",            true,  "Recovery" },
        { "glide",      "Glide",           "s",   0.001,  2.0,    0.05,   Taper::Log,    0.0,  "",            true,  "Voice" },
        { "attack",     "Attack",          "s",   0.001,  5.0,    0.01,   Taper::Log,    0.0,  "",            true,  "Voice" },
        { "release",    "Release",         "s",   0.005,  10.0,   0.5,    Taper::Log,    0.0,  "",            true,  "Voice" },
        { "velocity",   "Velocity",        "",    0.0,    1.0,    0.5,    Taper::Linear, 20.0, "",            true,  "Output" },
        { "even",       "Even level",      "",    0.0,    1.0,    1.0,    Taper::Toggle, 0.0,  "",            true,  "Output" },
        { "level",      "Level",           "dB",  -60.0,  6.0,    -6.0,   Taper::Linear, 20.0, "",            true,  "Output" },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    inline constexpr int kInputs  = 0;
    inline constexpr int kOutputs = 1;
    inline constexpr int kShow = 32;
    inline constexpr const char* kProbes[] = {
        "sync", "mf", "f0", "env",
        "c00", "c01", "c02", "c03", "c04", "c05", "c06", "c07", "c08", "c09", "c10", "c11", "c12", "c13", "c14", "c15",
        "c16", "c17", "c18", "c19", "c20", "c21", "c22", "c23", "c24", "c25", "c26", "c27", "c28", "c29", "c30", "c31",
    };
    inline constexpr int kNumProbes = 4 + kShow;

    // ── 3. State and the per-sample update ─────────────────────────────────────
    inline constexpr int kMax = 64;
    inline constexpr int kSizes[5] = { 1, 8, 16, 32, 64 };
    inline constexpr int kMeter = 32;
    inline constexpr double kA1 = 0.8191725133961645;
    inline constexpr double kLn001 = -4.605170185988091;
    inline constexpr double kTwoPi = 2.0 * M_PI;

    inline double fract (double x) { return x - std::floor (x); }
    inline double jitter (int i) { return fract (std::sin (i * 12.9898 + 78.233) * 43758.5453) * 2.0 - 1.0; }

    struct Algorithm
    {
        double sr = 44100.0, ksr = 1.0, agcA = 0.0, gainA = 0.0;
        int sizeIdx = 3, n = 32, d = 32;
        std::array<double, kMax> jr {}, jt {}, jh {}, V {}, vel {}, v0 {}, cyc {};
        std::array<int, kMax> ph {}, t {}, el {};
        std::array<int, kShow> shown {};
        double top = 0.0, mf = 0.0;
        double f0 = 110.0, f0s = 110.0, velIn = 0.0, env = 0.0;
        int envStage = 0;   // 0 idle, 1 attack, 3 sustain, 2 release
        std::array<int, 16> held {};
        int numHeld = 0, current = -1;
        double lvl = 1e-4, gain = 1.0, dcx = 0.0, dcy = 0.0, sync = 0.0;
        int mcount = 0;
        double probes[kNumProbes] {};

        void prepare (double sampleRate)
        {
            sr = sampleRate;
            ksr = 44100.0 / sr;
            agcA  = 1.0 - std::exp (-1.0 / (0.3 * sr));
            gainA = 1.0 - std::exp (-1.0 / (0.045 * sr));
        }

        void build (int idx)
        {
            #pragma clang fp contract(off)
            sizeIdx = idx; n = kSizes[idx];
            for (int i = 0; i < n; ++i) { jr[(size_t) i] = jitter (i); jt[(size_t) i] = jitter (i + 101); jh[(size_t) i] = jitter (i + 211); }
            top = jr[0];
            for (int i = 1; i < n; ++i) if (jr[(size_t) i] > top) top = jr[(size_t) i];
            std::array<int, kMax> order {};
            for (int i = 0; i < n; ++i)
            {
                int r = 0;
                for (int j = 0; j < n; ++j) if (jr[(size_t) j] < jr[(size_t) i]) ++r;
                order[(size_t) r] = i;
            }
            d = std::min (n, kShow);
            for (int k = 0; k < d; ++k) shown[(size_t) k] = order[(size_t) ((k * n) / d)];
            for (int i = 0; i < n; ++i)
            {
                const size_t u = (size_t) i;
                V[u] = 0.0; ph[u] = 0; t[u] = 0; vel[u] = 0.0; v0[u] = 0.0; cyc[u] = 0.0;
                el[u] = (int) std::floor (fract (0.5 + i * kA1) * sr / 110.0);
            }
            mf = 0.0;
        }

        void reset (const double* v)
        {
            build ((int) v[Size]);
            f0 = f0s = 110.0;
            numHeld = 0; current = -1; velIn = 0.0;
            envStage = 0; env = 0.0;
            lvl = 1e-4; gain = 1.0; dcx = dcy = 0.0;
            mcount = 0; sync = 0.0;
        }

        static double noteHz (int note) { return 440.0 * std::pow (2.0, (note - 69.0) / 12.0); }

        void removeHeld (int note)
        {
            const auto end = held.begin() + numHeld;
            const auto it = std::find (held.begin(), end, note);
            if (it != end) { std::move (it + 1, end, it); --numHeld; }
        }

        void noteOn (int note, double velocity)
        {
            removeHeld (note);
            if (numHeld == (int) held.size()) removeHeld (held[0]);
            held[(size_t) numHeld++] = note;
            current = note; velIn = velocity;
            f0 = noteHz (note);
            envStage = 1;
        }

        void noteOff (int note)
        {
            removeHeld (note);
            if (note == current)
            {
                if (numHeld > 0) { current = held[(size_t) numHeld - 1]; f0 = noteHz (current); }
                else if (envStage != 0) envStage = 2;
            }
        }

        void step (const double* v, const float*, float* out)
        {
            #pragma clang fp contract(off)
            if ((int) v[Size] != sizeIdx) build ((int) v[Size]);

            if (envStage == 1)
            {
                env += 1.0 / (v[Attack] * sr);
                if (env >= 1.0) { env = 1.0; envStage = 3; }
            }
            else if (envStage == 2)
            {
                env *= std::exp (kLn001 / (v[Release] * sr));
                if (env < 1e-5) { env = 0.0; envStage = 0; }
            }

            f0s += (f0 - f0s) * (1.0 - std::exp (-1.0 / (v[Glide] * sr + 1.0)));

            const double tauMs = v[Leak], spikeMs = v[Spike], riseFr = v[Rise];
            const double peak = v[Peak], hyp = v[Hyp], damp = v[Damp], refrMs = v[Refr];
            const double hf = v[Spread], htau = v[LeakSpread], hthr = v[ThrSpread];
            const double fbase = f0s / (1.0 + v[Anchor] * hf * top);
            const double spikeS = std::max (2.0, spikeMs * 0.001 * sr);
            const double riseS  = std::max (1.0, spikeS * riseFr);
            const double fallS  = std::max (1.0, spikeS - riseS);
            const double refrS  = std::max (1.0, refrMs * 0.001 * sr);
            const double kick = v[Couple] * ksr * mf;
            const double span = peak - hyp;
            const bool tick = mcount + 1 >= kMeter;

            double s = 0.0, cx = 0.0, cy = 0.0;
            int spk = 0;
            for (int i = 0; i < n; ++i)
            {
                const size_t u = (size_t) i;
                const double myFreq = std::max (1.0, fbase * (1.0 + hf * jr[u]));
                const double myTau  = std::max (0.1, tauMs * (1.0 + htau * jt[u]));
                const double thr    = std::max (0.1, 1.0 + hthr * jh[u]);
                const double leakTau = std::max (2.0, myTau * 0.001 * sr);
                const double a = 1.0 - 1.0 / leakTau;
                const double period = sr / myFreq;
                const int p = ph[u], ti = t[u];
                const double Vi = V[u];
                double nV, nvel = 0.0;
                int nph;
                if (p == 0)
                {
                    const double m = std::max (1.0, period - (double) (el[u] - ti) - 0.5);
                    const double c = std::pow (a, m);
                    const double drive = (thr - v0[u] * c) / (leakTau * (1.0 - c)) + kick;
                    const double cv = Vi * a + drive;
                    if (cv >= thr) { nV = thr; nph = 1; } else { nV = cv; nph = 0; }
                }
                else if (p == 1)
                {
                    nV = std::min (peak, Vi + (peak - thr) / riseS);
                    nph = (ti + 1 >= riseS) ? 2 : 1;
                }
                else if (p == 2)
                {
                    nV = std::max (hyp, Vi + (hyp - peak) / fallS);
                    nph = (ti + 1 >= fallS) ? 3 : 2;
                }
                else
                {
                    const double springK = 1.0 / leakTau;
                    const double accel = -springK * Vi - damp * 2.0 * std::sqrt (springK) * vel[u];
                    const double rv = vel[u] + accel;
                    nV = Vi + rv;
                    nph = (ti + 1 >= refrS && Vi > hyp * 0.3) ? 0 : 3;
                    if (nph == 3) nvel = rv;
                }
                t[u] = nph != p ? 0 : ti + 1;
                vel[u] = nvel;
                el[u] = (p == 0 && nph == 1) ? 0 : el[u] + 1;
                if (p == 3 && nph == 0) v0[u] = nV;
                V[u] = nV;
                ph[u] = nph;
                const double x = (nV - hyp) / span;
                s += x * 2.0 - 1.0;
                if (nph == 1) ++spk;
                cyc[u] = el[u] / period;
                if (tick)
                {
                    const double ang = kTwoPi * cyc[u];
                    cx += std::cos (ang);
                    cy += std::sin (ang);
                }
            }
            mf = (double) spk / n;
            if (tick) { mcount = 0; sync = std::sqrt (cx * cx + cy * cy) / n; }
            else ++mcount;

            double y = s / n;
            const double dc = y - dcx + 0.995 * dcy;
            dcx = y; dcy = dc; y = dc;
            lvl += (y * y - lvl) * agcA;
            const double g = v[Even] > 0.5 ? std::min (40.0, 0.16 / std::sqrt (lvl + 1e-9)) : 0.5;
            gain += (g - gain) * gainA;
            const double amp = std::pow (10.0, v[Level] / 20.0) * (1.0 - v[Velocity] * (1.0 - velIn)) * env;
            out[0] = (float) std::tanh (y * gain * amp);

            probes[0] = sync; probes[1] = mf; probes[2] = f0s; probes[3] = env;
            for (int k = 0; k < kShow; ++k)
            {
                probes[4 + k] = k < d ? cyc[(size_t) shown[(size_t) k]] : 0.0;
            }
        }
    };
}
