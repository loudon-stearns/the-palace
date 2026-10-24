// Algorithm.h — Crystal Synthesizer: eight struck crystals, each phonon mode a
// resonator whose ring time comes from the mineral's Raman line width, every mode
// split into an ordinary and an extraordinary ray by the mineral's birefringence,
// and each mode's strike delayed by the mineral's dispersion (the prism in time).
// reference/sketch.py says what each part does; this follows it operation for
// operation.
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
        Crystal, Hardness, VelBright, Velocity, Lifetime, Rolloff, Release,
        Angle, Spread, Fire, Width, Level,
        kNumParams
    };

    // Everything the algorithm reads into coefficients jumps (smooth 0): it is read
    // once per change, and a resonator's state carries it smoothly across the jump.
    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id            name               unit   min    max     default  taper          smooth choices                                                                                         auto  group      hero
        { "crystal",    "Crystal",         "",    0.0,   8.0,    4.0,     Taper::Choice, 0.0,   "Diamond|Fluorite|Tetragonal|Emerald|Ruby|Amethyst|Topaz|Monoclinic|Labradorite", true, "Crystal" },
        { "hardness",   "Hardness",        "ms",  0.05,  50.0,   1.0,     Taper::Log,    0.0,   "",  true, "Strike" },
        { "vel_bright", "Vel to hardness", "",    0.0,   1.0,    0.5,     Taper::Linear, 0.0,   "",  true, "Strike" },
        { "velocity",   "Velocity",        "",    0.0,   1.0,    0.6,     Taper::Linear, 0.0,   "",  true, "Strike" },
        { "lifetime",   "Lifetime",        "x",   0.1,   50.0,   1.0,     Taper::Log,    0.0,   "",  true, "Ring" },
        { "rolloff",    "Rolloff",         "",    0.3,   1.0,    0.7,     Taper::Linear, 0.0,   "",  true, "Ring" },
        { "release",    "Release",         "s",   0.05,  30.0,   4.0,     Taper::Log,    0.0,   "",  true, "Ring" },
        { "angle",      "Axis angle",      "deg", 0.0,   90.0,   90.0,    Taper::Linear, 0.0,   "",  true, "Light", true },
        { "spread",     "Birefringence",   "x",   0.25,  64.0,   1.0,     Taper::Log,    0.0,   "",  true, "Light" },
        { "fire",       "Fire",            "ms",  0.0,   400.0,  40.0,    Taper::Linear, 0.0,   "",  true, "Light", true },
        { "width",      "Width",           "",    0.0,   1.0,    0.7,     Taper::Linear, 20.0,  "",  true, "Output" },
        { "level",      "Level",           "dB",  -60.0, 6.0,    -6.0,    Taper::Linear, 20.0,  "",  true, "Output" },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    inline constexpr int kInputs  = 0;
    inline constexpr int kOutputs = 2;
    inline constexpr int kVoices  = 8;
    inline constexpr int kModes   = 9;
    inline constexpr int kRes     = 2 * kModes;   // ordinary rays 0..8, extraordinary 9..17
    // split · then per voice hz, amp, age (seconds since the strike) · then each mode's energy
    inline constexpr const char* kProbes[] = {
        "split",
        "v0_hz", "v0_amp", "v0_age", "v1_hz", "v1_amp", "v1_age", "v2_hz", "v2_amp", "v2_age",
        "v3_hz", "v3_amp", "v3_age", "v4_hz", "v4_amp", "v4_age", "v5_hz", "v5_amp", "v5_age",
        "v6_hz", "v6_amp", "v6_age", "v7_hz", "v7_amp", "v7_age",
        "m0", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8",
    };
    inline constexpr int kNumProbes = 1 + 3 * kVoices + kModes;

    // ── 3. The crystals (= sketch.py) ──────────────────────────────────────────
    inline constexpr double kTwoPi = 6.283185307179586;
    inline constexpr double kPi = 3.141592653589793;
    inline constexpr double kDiamondD = 0.044;

    inline constexpr double kRatios[9][kModes] = {
        { 1.00, 1.32, 1.48, 1.57, 1.65 },                               // Diamond
        { 1.00, 1.00, 1.35, 1.47, 1.69, 2.48 },                         // Fluorite
        { 1.00, 1.28, 1.41, 1.70, 1.85, 2.00 },                         // Tetragonal (hypothesis)
        { 1.00, 1.23, 1.47, 1.68, 2.13, 2.30, 3.33 },                   // Emerald
        { 1.00, 1.10, 1.14, 1.19, 1.52, 1.70, 1.98 },                   // Ruby
        { 1.00, 1.62, 2.07, 2.77, 3.13, 3.63, 5.45, 6.21, 8.32 },       // Amethyst
        { 1.00, 1.45, 1.91, 2.37, 2.96, 3.68, 4.80, 6.05 },             // Topaz
        { 1.00, 1.37, 1.71, 1.94, 2.23, 2.61 },                         // Monoclinic (hypothesis)
        { 1.00, 1.83, 3.17, 4.67, 7.00, 9.50, 13.3, 17.5 },             // Labradorite
    };
    inline constexpr double kQ[9]    = { 807.0, 27.0, 100.0, 57.0, 120.0, 62.0, 58.0, 100.0, 30.0 };
    inline constexpr double kDn[9]   = { 0.0, 0.0, 0.059, 0.006, 0.008, 0.009, 0.010, 0.006, 0.009 };
    inline constexpr double kDisp[9] = { 0.044, 0.007, 0.039, 0.014, 0.018, 0.013, 0.014, 0.012, 0.012 };

    inline double qual (int c, int k) { return (c == 5 && k == 1) ? 17.0 : kQ[c]; }   // amethyst's soft mode

    // ── 4. State and the per-sample update ─────────────────────────────────────
    struct Voice
    {
        int state = 0;          // 0 silent, 1 ringing
        bool pending = false, held = false;
        int note = -1, pendNote = 0;
        double pendVel = 0.0, hz = 0.0, vel = 0.0, rel = 0.0;
        long age = 0, pulseEnd = 0, order = 0;
        int pulseN = 1, steal = 0, stealN = 1;
        bool fresh = true;      // coefficients owed
        int lastC = -1;
        double lastLife = 0.0, lastRoll = 0.0, lastSplit = 0.0;
        std::array<double, kRes> y1 {}, y2 {}, a1 {}, a2 {}, b0 {}, rr {}, env {}, amk {};
        std::array<long, kRes> delay {};
    };

    struct Algorithm
    {
        double sr = 44100.0;
        std::array<Voice, kVoices> voices {};
        long counter = 0;
        double probes[kNumProbes] {};

        void prepare (double sampleRate) { sr = sampleRate; }

        void reset (const double*)
        {
            voices = {};
            counter = 0;
            for (auto& p : probes) p = 0.0;
        }

        void noteOn (int note, double velocity)
        {
            int pick = -1;
            for (int i = 0; i < kVoices && pick < 0; ++i)
                if (voices[(size_t) i].note == note && (voices[(size_t) i].state == 1 || voices[(size_t) i].pending)) pick = i;
            for (int i = 0; i < kVoices && pick < 0; ++i)
                if (voices[(size_t) i].state == 0 && ! voices[(size_t) i].pending) pick = i;
            if (pick < 0)
            {
                pick = 0;
                for (int i = 1; i < kVoices; ++i)
                    if (voices[(size_t) i].order < voices[(size_t) pick].order) pick = i;
            }
            auto& vo = voices[(size_t) pick];
            vo.order = ++counter;
            vo.note = note; vo.held = true;
            vo.pendNote = note; vo.pendVel = velocity;
            if (! vo.pending)
            {
                if (vo.state == 1)
                {
                    vo.stealN = std::max (1, (int) std::floor (0.003 * sr));
                    vo.steal = vo.stealN;
                }
                else vo.steal = 0;
            }
            vo.pending = true;
        }

        void noteOff (int note)
        {
            for (auto& vo : voices)
                if (vo.note == note) vo.held = false;
        }

        void coefs (Voice& vo, int c, double life, double roll, double split)
        {
            const double hz = vo.hz;
            double am = 1.0;
            for (int k = 0; k < kModes; ++k)
            {
                const double r = kRatios[c][k];
                const double fo = hz * r;
                const bool ok = r > 0.0 && fo < sr * 0.45;
                for (int e = 0; e < 2; ++e)
                {
                    const size_t j = (size_t) (k + kModes * e);
                    const double f = e == 1 ? fo * (1.0 + split) : fo;
                    if (ok && f < sr * 0.45)
                    {
                        const double w = kTwoPi * f / sr;
                        const double R = std::exp (-kPi * f / (qual (c, k) * life * sr));
                        vo.a1[j] = 2.0 * R * std::cos (w);
                        vo.a2[j] = R * R;
                        vo.b0[j] = am * std::sin (w);
                        vo.rr[j] = R;
                        vo.amk[j] = am;
                    }
                    else
                    {
                        vo.a1[j] = 0.0; vo.a2[j] = 0.0; vo.b0[j] = 0.0; vo.rr[j] = 0.0; vo.amk[j] = 0.0;
                    }
                }
                if (ok) am *= roll;
            }
            vo.fresh = false;
            vo.lastC = c; vo.lastLife = life; vo.lastRoll = roll; vo.lastSplit = split;
        }

        void strike (Voice& vo, int c, const double* v)
        {
            vo.y1 = {}; vo.y2 = {}; vo.env = {};
            vo.hz = 440.0 * std::pow (2.0, (vo.pendNote - 69) / 12.0);
            vo.vel = vo.pendVel;
            vo.rel = 1.0;
            vo.age = 0;
            const double hard = v[Hardness] * std::pow (4.0, -v[VelBright] * (2.0 * vo.vel - 1.0));
            vo.pulseN = std::max (1, (int) std::floor (hard * 0.001 * sr));
            vo.state = 1;
            vo.pending = false;
            const double spreadS = v[Fire] * 0.001 * (kDisp[c] / kDiamondD);
            long dmax = 0;
            for (int k = 0; k < kModes; ++k)
            {
                const double r = kRatios[c][k];
                const long d = r > 0.0 ? (long) std::floor (spreadS * std::log2 (r) * sr) : 0;
                vo.delay[(size_t) k] = d; vo.delay[(size_t) (k + kModes)] = d;
                dmax = std::max (dmax, d);
            }
            vo.pulseEnd = dmax + vo.pulseN;
            vo.fresh = true;
        }

        void step (const double* v, const float*, float* out)
        {
            const int c = std::min (std::max ((int) v[Crystal], 0), 8);
            const double s = std::sin (v[Angle] * (kPi / 180.0));
            const double split = kDn[c] * v[Spread] * (s * s);
            const double life = v[Lifetime], roll = v[Rolloff];
            const double relk = std::exp (-1.0 / (v[Release] * sr));
            const double wd = v[Width];
            probes[0] = split;

            double L = 0.0, R = 0.0;
            double mode[kModes] {};
            for (int i = 0; i < kVoices; ++i)
            {
                auto& vo = voices[(size_t) i];
                if (vo.pending)
                {
                    if (vo.steal > 0)
                    {
                        --vo.steal;
                        if (vo.steal == 0) strike (vo, c, v);
                    }
                    else strike (vo, c, v);
                }
                const double fade = vo.steal > 0 ? (double) vo.steal / (double) vo.stealN : 1.0;
                if (vo.state == 1 && (vo.fresh || vo.lastC != c || vo.lastLife != life || vo.lastRoll != roll || vo.lastSplit != split))
                    coefs (vo, c, life, roll, split);

                probes[1 + 3 * i] = 0.0; probes[2 + 3 * i] = 0.0; probes[3 + 3 * i] = 0.0;
                if (vo.state == 0) continue;

                // the resonators
                const double n = (double) vo.pulseN;
                double yo = 0.0, ye = 0.0, loud = 0.0;
                std::array<double, kRes> y {};
                for (size_t j = 0; j < (size_t) kRes; ++j)
                {
                    const double ip = (double) vo.age - (double) vo.delay[j];
                    const double x = (ip >= 0.0 && ip < n) ? (1.0 - std::cos (kTwoPi * (ip + 0.5) / n)) / n : 0.0;
                    if (ip == 0.0) vo.env[j] = vo.amk[j];
                    y[j] = vo.b0[j] * x + vo.a1[j] * vo.y1[j] - vo.a2[j] * vo.y2[j];
                    vo.y2[j] = vo.y1[j];
                    vo.y1[j] = y[j];
                    vo.env[j] = vo.env[j] * vo.rr[j];
                }
                for (int k = 0; k < kModes; ++k)
                {
                    yo += y[(size_t) k];
                    ye += y[(size_t) (k + kModes)];
                    loud = std::max (loud, std::max (vo.env[(size_t) k], vo.env[(size_t) (k + kModes)]));
                }
                const double g = (1.0 - v[Velocity] * (1.0 - vo.vel)) * vo.rel * 0.3 * fade;
                L += g * 0.5 * ((1.0 + wd) * yo + (1.0 - wd) * ye);
                R += g * 0.5 * ((1.0 - wd) * yo + (1.0 + wd) * ye);
                for (int k = 0; k < kModes; ++k)
                    mode[k] += g * 0.5 * (vo.env[(size_t) k] + vo.env[(size_t) (k + kModes)]);
                probes[1 + 3 * i] = vo.hz;
                probes[2 + 3 * i] = g * loud;
                probes[3 + 3 * i] = (double) vo.age / sr;
                if (! vo.held) vo.rel *= relk;
                vo.age += 1;
                if (vo.age >= vo.pulseEnd && vo.steal == 0 && ! vo.pending && ! vo.held && loud * vo.rel < 1e-4)
                {
                    vo.state = 0;
                    vo.y1 = {}; vo.y2 = {}; vo.env = {};
                }
            }
            for (int k = 0; k < kModes; ++k) probes[1 + 3 * kVoices + k] = mode[k];
            const double gain = std::pow (10.0, v[Level] / 20.0);
            out[0] = (float) std::tanh (gain * L);
            out[1] = (float) std::tanh (gain * R);
        }
    };
}
