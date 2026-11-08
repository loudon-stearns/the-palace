// Algorithm.h — Neural Granular: a crowd of neurons whose agreement is the timbre.
// reference/sketch.py says what each part does; this follows it operation for
// operation. Mono, last note priority; the crowd runs between notes, silent.
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
    enum Param { Tight, Life, Spread, Lump, Size, Width, Glide, Attack, Release, Velocity, Even, Level, kNumParams };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id          name          unit   min     max     default taper          smooth choices              auto   group     hero
        { "tight",    "Tightness",  "",    0.0,    3.0,    0.8,    Taper::Linear, 20.0, "",                 true,  "Crowd",  true },
        { "life",     "Life",       "",    0.0,    0.75,   0.2,    Taper::Linear, 20.0, "",                 true,  "Crowd",  true },
        { "spread",   "Spread",     "",    0.01,   0.4,    0.1,    Taper::Log,    20.0, "",                 true,  "Crowd" },
        { "lump",     "Lumpiness",  "",    0.0,    1.0,    0.5,    Taper::Linear, 50.0, "",                 true,  "Crowd" },
        { "size",     "Crowd",      "",    0.0,    3.0,    2.0,    Taper::Choice, 0.0,  "32|64|128|256",    false, "Crowd" },
        { "width",    "Spike width","x",   0.5,    3.0,    1.0,    Taper::Log,    0.0,  "",                 true,  "Voice" },
        { "glide",    "Glide",      "s",   0.001,  2.0,    0.06,   Taper::Log,    0.0,  "",                 true,  "Voice" },
        { "attack",   "Attack",     "s",   0.001,  5.0,    0.01,   Taper::Log,    0.0,  "",                 true,  "Voice" },
        { "release",  "Release",    "s",   0.005,  10.0,   0.6,    Taper::Log,    0.0,  "",                 true,  "Voice" },
        { "velocity", "Velocity",   "",    0.0,    1.0,    0.5,    Taper::Linear, 20.0, "",                 true,  "Output" },
        { "even",     "Even level", "",    0.0,    1.0,    1.0,    Taper::Toggle, 0.0,  "",                 true,  "Output" },
        { "level",    "Level",      "dB",  -60.0,  6.0,    -6.0,   Taper::Linear, 20.0, "",                 true,  "Output" },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    inline constexpr int kInputs  = 0;
    inline constexpr int kOutputs = 1;
    inline constexpr int kBins = 24;
    inline constexpr const char* kProbes[] = {
        "sync", "core", "f0", "env", "fire",
        "f00", "f01", "f02", "f03", "f04", "f05", "f06", "f07", "f08", "f09", "f10", "f11",
        "f12", "f13", "f14", "f15", "f16", "f17", "f18", "f19", "f20", "f21", "f22", "f23",
        "p00", "p01", "p02", "p03", "p04", "p05", "p06", "p07", "p08", "p09", "p10", "p11",
        "p12", "p13", "p14", "p15", "p16", "p17", "p18", "p19", "p20", "p21", "p22", "p23",
    };
    inline constexpr int kNumProbes = 5 + 2 * kBins;

    // ── 3. State and the per-sample update ─────────────────────────────────────
    inline constexpr int kMax = 256;
    inline constexpr int kSizes[4] = { 32, 64, 128, 256 };
    inline constexpr int kRing = 4096;
    inline constexpr double kA1 = 0.8191725133961645, kA2 = 0.6710436067037893, kA3 = 0.5497004779019703;
    inline constexpr double kTwoPi = 2.0 * M_PI;
    inline constexpr double kLn001 = -4.605170185988091;
    inline constexpr int kMeter = 32;

    inline double fract (double x) { return x - std::floor (x); }

    struct Algorithm
    {
        double sr = 44100.0, agcA = 0.0, gainA = 0.0, fireA = 0.0;
        int sizeIdx = 2, n = 128;
        double lump = 0.5, width = 1.0;
        std::array<double, kMax> jit {}, th {}, c {}, s {};
        std::array<int, kMax> paceRank {};
        double sx = 0.0, sy = 0.0;
        long long clock = 0;
        std::array<double, kRing> acc {};
        int pos = 0;
        std::array<double, kRing / 2 + 2> spike {};
        int spikeN = 8;
        double f0 = 110.0, f0s = 110.0, vel = 0.0, env = 0.0;
        int envStage = 0;   // 0 idle, 1 attack, 3 sustain, 2 release
        std::array<int, 16> held {};
        int numHeld = 0, current = -1;
        double lvl = 1e-4, gain = 1.0, dcx = 0.0, dcy = 0.0, fire = 0.0, rCore = 0.0;
        int mcount = 0;
        std::array<double, kBins> histF {}, histP {};
        double probes[kNumProbes] {};

        void prepare (double sampleRate)
        {
            sr = sampleRate;
            agcA  = 1.0 - std::exp (-1.0 / (0.3 * sr));
            gainA = 1.0 - std::exp (-1.0 / (0.045 * sr));
            fireA = 1.0 - std::exp (-1.0 / (0.02 * sr));
        }

        void buildSpike (double w)
        {
            #pragma clang fp contract(off)
            int len = std::max (8, (int) std::floor (0.0016 * w * sr + 0.5));
            len = std::min (len, kRing / 2 - 2);
            spike.fill (0.0);
            double mean = 0.0;
            for (int k = 0; k < len; ++k)
            {
                const double t = k / sr / w;
                const double a = (t - 0.00035) / 0.00012;
                const double b = (t - 0.0006) / 0.0002;
                const double cc = (t - 0.0011) / 0.00028;
                spike[(size_t) k] = 0.6 * std::exp (-(a * a)) + 0.5 * std::exp (-(b * b)) - 0.28 * std::exp (-(cc * cc));
                mean += spike[(size_t) k];
            }
            mean /= len;
            for (int k = 0; k < len; ++k) spike[(size_t) k] -= mean;
            spikeN = len;
        }

        void build (int idx, double L)
        {
            #pragma clang fp contract(off)
            sizeIdx = idx; n = kSizes[idx]; lump = L;
            for (int i = 0; i < n; ++i)
                jit[(size_t) i] = 2.0 * fract (0.5 + i * kA1 + L * (constants::u_rate[i] - 0.5)) - 1.0;
            for (int i = 0; i < n; ++i)
                th[(size_t) i] = kTwoPi * fract (0.5 + i * kA3 + L * (constants::u_phase[i] - 0.5));
            for (int i = 0; i < n; ++i) { c[(size_t) i] = std::cos (th[(size_t) i]); s[(size_t) i] = std::sin (th[(size_t) i]); }
            for (int i = 0; i < n; ++i)
            {
                const double pi_ = fract (0.5 + i * kA2);
                int r = 0;
                for (int j = 0; j < n; ++j) if (fract (0.5 + j * kA2) < pi_) ++r;
                paceRank[(size_t) i] = r;
            }
            sx = sy = 0.0;
            for (int i = 0; i < n; ++i) { sx += c[(size_t) i]; sy += s[(size_t) i]; }
            clock = 0;
        }

        void reset (const double* v)
        {
            acc.fill (0.0); pos = 0;
            width = v[Width]; buildSpike (width);
            build ((int) v[Size], v[Lump]);
            f0 = f0s = 110.0;
            numHeld = 0; current = -1; vel = 0.0;
            envStage = 0; env = 0.0;
            lvl = 1e-4; gain = 1.0; dcx = dcy = 0.0; fire = 0.0;
            mcount = 0; rCore = 0.0; histF.fill (0.0); histP.fill (0.0);
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
            current = note; vel = velocity;
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

        void meter (int listenM)
        {
            #pragma clang fp contract(off)
            double cx = 0.0, cy = 0.0; int nf = 0;
            for (int i = 0; i < n; ++i)
                if (paceRank[(size_t) i] >= listenM) { cx += c[(size_t) i]; cy += s[(size_t) i]; ++nf; }
            rCore = nf > 0 ? std::sqrt (cx * cx + cy * cy) / nf : 0.0;
            const double psi = std::atan2 (sy, sx);
            histF.fill (0.0); histP.fill (0.0);
            const double w = 1.0 / n;
            for (int i = 0; i < n; ++i)
            {
                double rel = th[(size_t) i] - psi;
                rel -= kTwoPi * std::floor (rel / kTwoPi);
                int b = (int) (rel * (kBins / kTwoPi));
                if (b > kBins - 1) b = kBins - 1;
                if (paceRank[(size_t) i] >= listenM) histF[(size_t) b] += w; else histP[(size_t) b] += w;
            }
        }

        void step (const double* v, const float*, float* out)
        {
            #pragma clang fp contract(off)
            if ((int) v[Size] != sizeIdx) build ((int) v[Size], v[Lump]);
            if (v[Lump] != lump)
            {
                lump = v[Lump];
                for (int i = 0; i < n; ++i)
                    jit[(size_t) i] = 2.0 * fract (0.5 + i * kA1 + lump * (constants::u_rate[i] - 0.5)) - 1.0;
            }
            if (v[Width] != width) { width = v[Width]; buildSpike (width); }

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
            const double sig = v[Spread];
            const double kk = v[Tight] * 4.0 * sig / M_PI;
            const int listenM = (int) std::floor (v[Life] * n + 0.5);
            const double w0 = kTwoPi * f0s;
            const double kabs = kk * w0;
            const double zx = sx / n, zy = sy / n;
            const double dt = 1.0 / sr;
            const bool resync = (clock & 63) == 0;
            double nsx = 0.0, nsy = 0.0;
            int fired = 0;
            for (int i = 0; i < n; ++i)
            {
                const size_t u = (size_t) i;
                const double pull = paceRank[u] >= listenM ? kabs * (zy * c[u] - zx * s[u]) : 0.0;
                const double d = (w0 * (1.0 + sig * jit[u]) + pull) * dt;
                double t = th[u] + d;
                if (t >= kTwoPi)
                {
                    t -= kTwoPi;
                    const double frac = d > 0.0 ? t / d : 0.0;
                    for (int j = 0; j < spikeN; ++j)
                    {
                        const double x = j - frac + 1.0;
                        const int x0 = (int) std::floor (x);
                        const double f = x - x0;
                        if (x0 >= 0 && x0 + 1 < spikeN + 2)
                            acc[(size_t) ((pos + j) & (kRing - 1))] += spike[(size_t) x0] * (1.0 - f) + spike[(size_t) x0 + 1] * f;
                    }
                    ++fired;
                }
                th[u] = t;
                if (resync) { c[u] = std::cos (t); s[u] = std::sin (t); }
                else
                {
                    const double d2 = d * d;
                    const double cd = 1.0 - d2 * 0.5;
                    const double sd = d - d2 * d / 6.0;
                    const double ci = c[u];
                    c[u] = ci * cd - s[u] * sd;
                    s[u] = ci * sd + s[u] * cd;
                }
                nsx += c[u]; nsy += s[u];
            }
            sx = nsx; sy = nsy;

            double y = acc[(size_t) pos];
            acc[(size_t) pos] = 0.0;
            pos = (pos + 1) & (kRing - 1);
            y /= std::sqrt ((double) n);
            const double dc = y - dcx + 0.995 * dcy;
            dcx = y; dcy = dc; y = dc;
            lvl += (y * y - lvl) * agcA;
            const double g = v[Even] > 0.5 ? std::min (40.0, 0.16 / std::sqrt (lvl + 1e-9)) : 0.35;
            gain += (g - gain) * gainA;
            const double amp = std::pow (10.0, v[Level] / 20.0) * (1.0 - v[Velocity] * (1.0 - vel)) * env;
            out[0] = (float) std::tanh (y * gain * amp);

            fire += (fired * sr / (n * f0s) - fire) * fireA;
            ++clock;
            if (++mcount >= kMeter) { mcount = 0; meter (listenM); }

            probes[0] = std::sqrt (sx * sx + sy * sy) / n;
            probes[1] = rCore; probes[2] = f0s; probes[3] = env; probes[4] = fire;
            for (int b = 0; b < kBins; ++b) { probes[5 + b] = histF[(size_t) b]; probes[5 + kBins + b] = histP[(size_t) b]; }
        }
    };
}
