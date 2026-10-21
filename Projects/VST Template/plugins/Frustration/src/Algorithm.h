// Algorithm.h — the frustration model (reference/sketch.py, from ride.py).
//
// One tone of N partials shares a fundamental; N outside voices tuned to the
// plain harmonic series pull on its partials. Stretch B bends the partials away
// from whole-number ratios; coupling K sets how hard the voices pull. Near the
// edge (B about 1.8e-5 at N = 40, K = 6 Hz) the tone tears and heals.
//
// Same order of operations as the sketch, line for line, phases wrapped to
// [0, 1) each sample on both sides (unwrapped they lose precision).
#pragma once

#include "ParamSpec.h"
#include "Constants.h"

#include <algorithm>
#include <array>
#include <cmath>

namespace algo
{
    using tpl::ParamSpec;
    using tpl::Taper;

    // ── 1. Parameters ──────────────────────────────────────────────────────────
    enum Param { B, K, Inertia, F0, Voices, Level, Partials, Pinned, Source, kNumParams };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id           name              unit   min     max     default taper           smooth choices         auto    group        hero
        { "B",         "Stretch",        "",    1e-7,   30.0,   1e-5,   Taper::Log,     20.0,  "",             true,   "The edge",  true },
        { "K",         "Coupling",       "Hz",  0.0,    20.0,   6.0,    Taper::Linear,  20.0,  "",             true,   "The edge",  true },
        { "inertia",   "Inertia",        "",    0.1,    100.0,  1.0,    Taper::Log,     20.0,  "",             true,   "Tone" },
        { "f0",        "Pitch",          "Hz",  20.0,   880.0,  110.0,  Taper::Log,     20.0,  "",             true,   "Tone" },
        { "voices",    "Voices",         "",    0.0,    1.0,    0.0,    Taper::Linear,  20.0,  "",             true,   "Output" },
        { "level",     "Level",          "dB",  -60.0,  6.0,    -6.0,   Taper::Linear,  20.0,  "",             true,   "Output" },
        { "partials",  "Partials",       "",    0.0,    2.0,    0.0,    Taper::Choice,  0.0,   "40|64|96",     false,  "Partials" },
        { "pinned",    "Pin partial 1",  "",    0.0,    1.0,    0.0,    Taper::Toggle,  0.0,   "",             true,   "Partials" },
        { "source",    "Source",         "",    0.0,    1.0,    1.0,    Taper::Choice,  0.0,   "bright|warm",  true,   "Partials" },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    inline constexpr int kInputs  = 0;
    inline constexpr int kOutputs = 1;
    inline constexpr const char* kProbes[] = { "fundamental" };
    inline constexpr int kNumProbes = 1;

    // ── 3. State and the per-sample update ─────────────────────────────────────
    struct Algorithm
    {
        static constexpr int kMaxN = 96;
        static constexpr int kNs[3] = { 40, 64, 96 };
        static constexpr double kNormGain = 2.0;   // = sketch.py NORM_GAIN

        double sr = 44100.0, dt = 1.0 / 44100.0;
        int N = 40, nIndex = -1, source = -1;
        const double* det = constants::DET_40;
        const double* ph0 = constants::PH0_40;
        std::array<double, kMaxN> n {}, amp {}, offset {}, p {}, ph {}, r {}, s {}, w {};
        double back = 0.0, norm = 0.0, Fp = 110.0;
        double probes[kNumProbes] {};

        void prepare (double sampleRate) { sr = sampleRate; dt = 1.0 / sr; }

        void reset (const double* v)
        {
            configure ((int) v[Partials], (int) v[Source]);
            restart (v[F0]);
        }

        // N and the source set the partials' amplitudes and the normalisation.
        void configure (int ni, int src)
        {
            nIndex = std::clamp (ni, 0, 2);
            source = src;
            N = kNs[nIndex];
            const double* offs = constants::OFFS_40;
            switch (nIndex)
            {
                case 0:  det = constants::DET_40; ph0 = constants::PH0_40; offs = constants::OFFS_40; break;
                case 1:  det = constants::DET_64; ph0 = constants::PH0_64; offs = constants::OFFS_64; break;
                default: det = constants::DET_96; ph0 = constants::PH0_96; offs = constants::OFFS_96; break;
            }
            const bool warm = (source == 1);
            double nsum = 0.0, asum = 0.0;
            for (int k = 0; k < N; ++k)
            {
                const double nn = k + 1;
                n[(size_t) k] = nn;
                amp[(size_t) k] = warm ? 1.0 / nn * std::min (1.0, 4.0 / nn) : std::pow (nn, -0.7);
                offset[(size_t) k] = warm ? offs[k] : 0.0;
                nsum += nn;
                asum += amp[(size_t) k];
            }
            back = 21.0 / nsum;
            norm = kNormGain / asum;
        }

        void restart (double f0)
        {
            for (int k = 0; k < N; ++k) { p[(size_t) k] = 0.0; ph[(size_t) k] = ph0[k]; }
            Fp = f0;
        }

        void step (const double* v, const float*, float* out)
        {
            const int ni = (int) v[Partials], src = (int) v[Source];
            if (ni != nIndex) { configure (ni, src); restart (v[F0]); }   // a new N is a new tone: start over
            else if (src != source) configure (ni, src);                 // a new source keeps the phases

            const double b = v[B], kc = v[K], f0 = v[F0], mix = v[Voices];
            const double denom = v[Pinned] > 0.5 ? (1.0 + b) : 1.0;
            const double pull = (back / v[Inertia]) * kc;

            double acc = 0.0;
            for (int k = 0; k < N; ++k)
            {
                const auto i = (size_t) k;
                r[i] = n[i] * std::sqrt ((1.0 + b * n[i] * n[i]) / denom);
                w[i] = n[i] * f0 * det[k];
                const double gate = std::clamp ((4000.0 - std::fabs (r[i] * Fp - w[i])) / 1000.0, 0.0, 1.0);
                s[i] = std::sin (2.0 * M_PI * (ph[i] - p[i])) * gate;
                acc += r[i] * s[i];
            }
            const double dth = f0 + pull * acc;

            double tone = 0.0, vox = 0.0;
            for (int k = 0; k < N; ++k)
            {
                const auto i = (size_t) k;
                p[i] += r[i] * dth * dt;
                ph[i] += (w[i] - kc * s[i]) * dt;
                p[i] -= std::floor (p[i]);
                ph[i] -= std::floor (ph[i]);
                const double g = amp[i] * std::clamp ((19000.0 - r[i] * dth) / 3000.0, 0.0, 1.0);
                tone += g * std::sin (2.0 * M_PI * (p[i] + offset[i]));
                if (mix > 0.0) vox += amp[i] * std::sin (2.0 * M_PI * ph[i]);
            }
            Fp = dth;

            out[0] = (float) (std::pow (10.0, v[Level] / 20.0) * norm * (tone + mix * vox));
            probes[0] = dth;
        }
    };
}
