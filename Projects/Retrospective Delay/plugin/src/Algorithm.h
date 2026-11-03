// Algorithm.h — Retrospective Delay. Ported line for line from reference/sketch.py,
// which is the séance of stage-5-portal/portal.codebox: one measure of tape, always
// listening; silence keeps; one knob summons the past back.
//
// Audio-thread rules: the tape is sized once in prepare() for the slowest tempo at
// this sample rate; step() and reset() allocate nothing and take no locks.
#pragma once

#include "ParamSpec.h"
#include <algorithm>
#include <cmath>
#include <vector>

namespace algo
{
    using tpl::ParamSpec;
    using tpl::Taper;

    // ── 1. Parameters. ────────────────────────────────────────────────────────
    enum Param { Gain, Lag, Bpm, Thresh, Dry, kNumParams };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id        name         unit   min     max     default taper          smooth  choices                  auto  group       hero
        { "gain",   "Summon",    "",    0.0,    1.0,    0.6,    Taper::Linear, 20.0,   "",                      true, "Séance",   true },
        { "lag",    "Lag",       "",    0.0,    2.0,    1.0,    Taper::Choice, 0.0,    "quarter|half|whole",    true, "Séance" },
        { "bpm",    "Tempo",     "bpm", 30.0,   300.0,  120.0,  Taper::Linear, 0.0,    "",                      true, "Measure" },
        { "thresh", "Listen above", "dB", -80.0, -20.0, -50.0,  Taper::Linear, 20.0,   "",                      true, "Measure" },
        { "dry",    "Dry",       "",    0.0,    1.0,    1.0,    Taper::Toggle, 0.0,    "",                      true, "Output" },
    };

    // ── 2. Audio in and out, and probes. ──────────────────────────────────────
    inline constexpr int kInputs  = 2;
    inline constexpr int kOutputs = 2;
    inline constexpr const char* kProbes[] = { "knob", "presence", "holding", "head", "lag", "level", "ghost" };
    inline constexpr int kNumProbes = 7;

    inline constexpr double kLags[3] = { 0.25, 0.5, 1.0 };
    inline constexpr double kMinBpm  = 30.0;
    inline constexpr double kPScale  = 4.0;

    // ── 3. State and the per-sample update. ───────────────────────────────────
    struct Algorithm
    {
        double sr = 44100.0;
        std::vector<double> tl, tr;
        int T = 1;
        int w = 0;
        double env = 0.0, listen = 0.0, penv = 0.0, genv = 0.0;
        double lagA = 0.5, lagB = 0.5, fade = 0.0, target = 0.0;
        int last = 1;
        double rel = 0.0, prel = 0.0, grel = 0.0, xstep = 0.0, lstep = 0.0;
        double probes[kNumProbes] {};

        void prepare (double sampleRate)
        {
            sr = sampleRate;
            T = (int) std::floor (sr * 240.0 / kMinBpm + 0.5) + 1;
            tl.assign ((size_t) T, 0.0);
            tr.assign ((size_t) T, 0.0);
            rel   = std::exp (-1.0 / (sr * 0.1));
            prel  = std::exp (-1.0 / sr);
            grel  = std::exp (-1.0 / (sr * 0.05));
            xstep = 1000.0 / (30.0 * sr);
            lstep = 1000.0 / (5.0 * sr);
        }

        void reset (const double* v)
        {
            std::fill (tl.begin(), tl.end(), 0.0);
            std::fill (tr.begin(), tr.end(), 0.0);
            w = 0;
            env = listen = penv = genv = 0.0;
            last = (int) v[Lag];
            lagA = lagB = kLags[last];
            fade = target = 0.0;
        }

        static double clampStep (double d, double s) { return d > s ? s : (d < -s ? -s : d); }

        int readSlot (double lag, int M) const
        {
            double r = w - lag * M;
            int i = (int) std::floor (r - std::floor (r / M) * M);
            return i >= M ? i - M : i;
        }

        void step (const double* v, const float* in, float* out)
        {
            const int M = std::min ((int) std::floor (sr * 240.0 / v[Bpm] + 0.5), T);
            if (w >= M) w = 0;
            const int li = (int) v[Lag];
            if (li != last)
            {
                if (target < 0.5) { lagB = kLags[li]; target = 1.0; }
                else              { lagA = kLags[li]; target = 0.0; }
                last = li;
            }
            fade = fade + clampStep (target - fade, xstep);

            // READ FIRST
            const int ra = readSlot (lagA, M), rb = readSlot (lagB, M);
            double a0 = tl[(size_t) ra];
            const double gl = a0 + (tl[(size_t) rb] - a0) * fade;
            a0 = tr[(size_t) ra];
            const double gr = a0 + (tr[(size_t) rb] - a0) * fade;

            // THEN WRITE. Silence keeps.
            const double sl = (double) in[0], sR = (double) in[1];
            const double ax = std::max (std::abs (sl), std::abs (sR));
            env = ax > env ? ax : env * rel;
            const double want = env > std::pow (10.0, v[Thresh] / 20.0) ? 1.0 : 0.0;
            listen = listen + clampStep (want - listen, lstep);
            double old = tl[(size_t) w];
            tl[(size_t) w] = old + listen * (sl - old);
            old = tr[(size_t) w];
            tr[(size_t) w] = old + listen * (sR - old);

            const double g = v[Gain];
            out[0] = (float) (v[Dry] * sl + g * gl);
            out[1] = (float) (v[Dry] * sR + g * gr);

            const double ga = std::max (std::abs (gl), std::abs (gr));
            penv = ga > penv ? ga : penv * prel;
            genv = ga > genv ? ga : genv * grel;
            probes[0] = g;
            probes[1] = std::min (std::max (penv * kPScale, 0.0), 1.0);
            probes[2] = 1.0 - listen;
            probes[3] = (double) w / M;
            probes[4] = lagA + (lagB - lagA) * fade;
            probes[5] = env;
            probes[6] = genv * g;
            w = w + 1;
            if (w >= M) w = 0;
        }
    };
}
