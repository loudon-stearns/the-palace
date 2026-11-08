// Algorithm.h — Retrospective Delay. Ported line for line from reference/sketch.py,
// which is the séance of stage-5-portal/portal.codebox: one measure of tape, always
// listening; silence keeps; one knob summons the past back.
//
// Speed (2026-11-03) is the page's first forward vector made a knob: the read head
// runs at its own rate, so the past comes back slower and lower, faster and higher, or
// backwards. Each read head keeps how far behind the planchette it sits, as a fraction
// of the measure; at Speed 1 that never moves and the device is the séance as it was.
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
    enum Param { Gain, Lag, Bpm, Thresh, Dry, Speed, kNumParams };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id        name         unit   min     max     default taper          smooth  choices                  auto  group       hero
        { "gain",   "Summon",    "",    0.0,    1.0,    0.6,    Taper::Linear, 20.0,   "",                      true, "Séance",   true },
        { "lag",    "Lag",       "",    0.0,    2.0,    1.0,    Taper::Choice, 0.0,    "quarter|half|whole",    true, "Séance" },
        { "bpm",    "Tempo",     "bpm", 30.0,   300.0,  120.0,  Taper::Linear, 0.0,    "",                      true, "Measure" },
        { "thresh", "Listen above", "dB", -80.0, -20.0, -50.0,  Taper::Linear, 20.0,   "",                      true, "Measure" },
        { "dry",    "Dry",       "",    0.0,    1.0,    1.0,    Taper::Toggle, 0.0,    "",                      true, "Output" },
        { "speed",  "Speed",     "x",   -2.0,   2.0,    1.0,    Taper::Linear, 60.0,   "",                      true, "Séance" },
    };

    // ── 2. Audio in and out, and probes. ──────────────────────────────────────
    inline constexpr int kInputs  = 2;
    inline constexpr int kOutputs = 2;
    inline constexpr const char* kProbes[] = { "knob", "presence", "holding", "head", "lag", "level", "ghost", "speed" };
    inline constexpr int kNumProbes = 8;

    inline constexpr double kLags[3] = { 0.25, 0.5, 1.0 };
    inline constexpr double kMinBpm  = 30.0;
    inline constexpr double kPScale  = 4.0;
    inline constexpr double kHome    = 1e-3;   // within this of 1, Speed is home: the heads stop drifting

    // ── 3. State and the per-sample update. ───────────────────────────────────
    struct Algorithm
    {
        double sr = 44100.0;
        std::vector<double> tl, tr;
        int T = 1;
        int w = 0;
        double env = 0.0, listen = 0.0, penv = 0.0, genv = 0.0;
        double lagA = 0.5, lagB = 0.5, fade = 0.0, target = 0.0;   // each head: measures behind the planchette
        double duck = 1.0, ducks = 0.0;
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
            ducks = 0.005 * sr;                    // a moving head fades out over the last 5 ms before the planchette
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
            duck = 1.0;
        }

        static double clampStep (double d, double s) { return d > s ? s : (d < -s ? -s : d); }

        // The tape at a fractional slot, between samples linearly; slot M-1 runs on to 0.
        static double at (const std::vector<double>& t, double pos, int M)
        {
            const int i = std::min ((int) pos, M - 1);
            const double f = pos - i;
            const double a = t[(size_t) i];
            return f == 0.0 ? a : a + (t[(size_t) (i + 1 < M ? i + 1 : 0)] - a) * f;
        }

        double readPos (double lag, int M) const
        {
            double r = w - lag * M;
            r = r - std::floor (r / M) * M;
            return r >= M ? r - M : r;
        }

        static double wrap (double d) { return d > 1.0 ? d - 1.0 : (d < 0.0 ? d + 1.0 : d); }
        static double turns (double a, double b) { const double d = std::abs (a - b); return std::min (d, 1.0 - d); }

        void step (const double* v, const float* in, float* out)
        {
            const int M = std::min ((int) std::floor (sr * 240.0 / v[Bpm] + 0.5), T);
            if (w >= M) w = 0;
            const int li = (int) v[Lag];
            const double sp = std::abs (v[Speed] - 1.0) < kHome ? 1.0 : v[Speed];
            const bool home = sp == 1.0;
            // Speed home again with the heads drifted off the grid: fade back to the lag.
            if (home && li == last && fade == target && turns (target < 0.5 ? lagA : lagB, kLags[li]) > 1e-9)
                last = -1;
            if (li != last)
            {
                if (target < 0.5) { lagB = kLags[li]; target = 1.0; }
                else              { lagA = kLags[li]; target = 0.0; }
                last = li;
            }
            fade = fade + clampStep (target - fade, xstep);

            // READ FIRST
            const double pa = readPos (lagA, M), pb = readPos (lagB, M);
            double a0 = at (tl, pa, M);
            double gl = a0 + (at (tl, pb, M) - a0) * fade;
            a0 = at (tr, pa, M);
            double gr = a0 + (at (tr, pb, M) - a0) * fade;

            // A moving head crosses the planchette, where now meets a measure ago: it
            // fades out there, and a stalled head (Speed near 0) fades rather than hum.
            if (! home || duck < 1.0)
            {
                const double near = turns (fade < 0.5 ? lagA : lagB, 0.0) * M;   // the head you mostly hear
                const double want = home ? 1.0 : std::min ({ 1.0, near / ducks, std::abs (sp) * 20.0 });
                duck = duck + clampStep (want - duck, lstep);
                gl *= duck; gr *= duck;
            }
            if (! home)
            {
                const double dd = (1.0 - sp) / M;
                lagA = wrap (lagA + dd); lagB = wrap (lagB + dd);
            }

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
            probes[7] = sp;
            w = w + 1;
            if (w >= M) w = 0;
        }
    };
}
