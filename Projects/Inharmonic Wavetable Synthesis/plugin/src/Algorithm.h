// Algorithm.h — Bent Line: the two-wall additive engine of Inharmonic Wavetable
// Synthesis. Sixty-four partials a voice, eight voices. Wavetable B (a real
// material's measured bend, in cents per slot) sets where each partial sits;
// Wavetable A (an organ's FFT'd frames, or the material's own levels) sets how
// loud it is. Filing switches how a bell's modes are put into slots.
// reference/sketch.py says what each part does; this follows it operation for
// operation.
#pragma once

#include "ParamSpec.h"
#include "Constants.h"

#include <array>
#include <cmath>

namespace algo
{
    using tpl::ParamSpec;
    using tpl::Taper;

    // ── 1. Parameters ──────────────────────────────────────────────────────────
    enum Param
    {
        Material, Filing, Bend, Clock, Speed, BPos, Wall, APos, Decay, Release, Level,
        kNumParams
    };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id          name              unit  min    max    default taper          smooth choices                                                                 auto  group        hero
        { "material", "Material",        "",   0.0,   6.0,   3.0,    Taper::Choice, 0.0,  "Piano A2|Piano A4|Piano C6|Bell|Vibraphone|Marimba|Singing bowl", true, "Wavetable B" },
        { "filing",   "Filing",          "",   0.0,   1.0,   0.0,    Taper::Choice, 0.0,  "Rank|Nearest",                                                    true, "Wavetable B" },
        { "bend",     "Bend",            "x",  0.0,   2.0,   1.0,    Taper::Linear, 20.0, "",                                                                true, "Wavetable B", true },
        { "clock",    "Bend clock",      "",   0.0,   1.0,   0.0,    Taper::Choice, 0.0,  "Note|Manual",                                                     true, "Clock" },
        { "speed",    "Speed",           "x",  0.1,   10.0,  1.0,    Taper::Log,    20.0, "",                                                                true, "Clock" },
        { "bpos",     "B position",      "",   0.0,   1.0,   0.0,    Taper::Linear, 20.0, "",                                                                true, "Clock" },
        { "wall",     "Wavetable A",     "",   0.0,   1.0,   0.0,    Taper::Choice, 0.0,  "Organ|Own",                                                   true, "Wavetable A" },
        { "apos",     "A position",      "",   0.0,   1.0,   0.55,   Taper::Linear, 20.0, "",                                                                true, "Wavetable A", true },
        { "decay",    "Decay",           "s",  0.2,   30.0,  3.0,    Taper::Log,    0.0,  "",                                                                true, "Shape" },
        { "release",  "Release",         "s",  0.01,  5.0,   0.4,    Taper::Log,    0.0,  "",                                                                true, "Shape" },
        { "level",    "Level",           "dB", -60.0, 0.0,   -12.0,  Taper::Linear, 20.0, "",                                                                true, "Shape" },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    inline constexpr int kInputs  = 0;
    inline constexpr int kOutputs = 1;
    inline constexpr const char* kProbes[] = { "pos", "bend16", "voices" };
    inline constexpr int kNumProbes = 3;

    inline constexpr int kNP = 64, kNF = 16, kNV = 8, kK = 32, kNM = 7, kNO = 48;
    inline constexpr double kTwoPi = 6.283185307179586;

    // tables from the sketch: cents[m][filing][frame][slot], mask[m][filing][slot],
    // own[m][filing][frame][slot], times[m][frame], organ[frame][slot]
    inline double cents (int m, int fl, int fr, int s) { return constants::kCents[((m * 2 + fl) * kNF + fr) * kNP + s]; }
    inline double own   (int m, int fl, int fr, int s) { return constants::kOwn[((m * 2 + fl) * kNF + fr) * kNP + s]; }
    inline double mask  (int m, int fl, int s)         { return constants::kMask[(m * 2 + fl) * kNP + s]; }
    inline double times (int m, int fr)                { return constants::kTimes[m * kNF + fr]; }
    inline double organ (int fr, int s)                { return constants::kOrgan[fr * kNP + s]; }

    // ── 3. State and the per-sample update ─────────────────────────────────────
    struct Voice
    {
        bool active = false, held = false;
        int note = -1, ctr = 0;
        long order = 0, age = 0;
        double f0 = 0.0, vel = 0.0, e = 0.0, pos = 0.0, bend16 = 0.0;
        std::array<double, kNP> ph {}, inc {}, amp {}, damp {}, dec {}, dk {};
    };

    struct Algorithm
    {
        double sr = 44100.0;
        std::array<Voice, kNV> voices {};
        long counter = 0;
        double probes[kNumProbes] {};

        void prepare (double sampleRate) { sr = sampleRate; }

        void reset (const double*)
        {
            voices = {};
            for (auto& vo : voices) vo.dec.fill (1.0);
            counter = 0;
            for (auto& p : probes) p = 0.0;
        }

        void noteOn (int note, double velocity)
        {
            int pick = -1;
            for (int q = 0; q < kNV; ++q)
                if (pick < 0 && voices[(size_t) q].active && voices[(size_t) q].note == note) pick = q;
            for (int q = 0; q < kNV; ++q)
                if (pick < 0 && ! voices[(size_t) q].active) pick = q;
            if (pick < 0)
            {
                pick = 0;
                for (int q = 1; q < kNV; ++q)
                    if (voices[(size_t) q].order < voices[(size_t) pick].order) pick = q;
            }
            auto& vo = voices[(size_t) pick];
            counter += 1;
            vo.order = counter; vo.note = note; vo.held = true; vo.active = true;
            vo.f0 = 440.0 * std::pow (2.0, (note - 69) / 12.0); vo.vel = velocity;
            vo.age = 0; vo.ctr = 0; vo.e = 0.0;
            vo.ph.fill (0.0); vo.amp.fill (0.0); vo.dec.fill (1.0);
        }

        void noteOff (int note)
        {
            for (auto& vo : voices)
                if (vo.note == note) vo.held = false;
        }

        static double framePos (int m, double tt)
        {
            if (tt <= times (m, 0)) return 0.0;
            if (tt >= times (m, kNF - 1)) return (double) (kNF - 1);
            int j = 0;
            while (times (m, j + 1) <= tt) ++j;
            return j + (tt - times (m, j)) / (times (m, j + 1) - times (m, j));
        }

        void step (const double* v, const float*, float* out)
        {
            const int mat = (int) v[Material], fil = (int) v[Filing];
            const double bend = v[Bend];
            const int clock = (int) v[Clock];
            const double speed = v[Speed], bpos = v[BPos];
            const int wall = (int) v[Wall];
            const double apos = v[APos], decay = v[Decay], release = v[Release];
            const double gain = std::pow (10.0, v[Level] / 20.0) * 0.25;
            const double rk = std::exp (-1.0 / (sr * release));
            const double ainc = 1.0 / (0.004 * sr);
            double y = 0.0;

            for (auto& vo : voices)
            {
                if (! vo.active) continue;
                if (vo.ctr == 0)
                {
                    vo.pos = clock == 0 ? framePos (mat, (double) vo.age / sr * speed) : bpos * (kNF - 1);
                    const int lo = (int) std::floor (vo.pos);
                    const double a = vo.pos - lo;
                    const double opos = apos * (kNO - 1);
                    const int olo = (int) std::floor (opos);
                    const double oa = opos - olo;
                    double c16 = 0.0;
                    for (int s = 0; s < kNP; ++s)
                    {
                        const double nn = (double) (s + 1);
                        const double c = lo >= kNF - 1 ? cents (mat, fil, kNF - 1, s)
                                                       : cents (mat, fil, lo, s) * (1.0 - a) + cents (mat, fil, lo + 1, s) * a;
                        if (s == 15) c16 = c;
                        const double f = nn * vo.f0 * std::pow (2.0, bend * c / 1200.0);
                        vo.inc[(size_t) s] = f / sr;
                        double A;
                        if (wall == 0)
                            A = (olo >= kNO - 1 ? organ (kNO - 1, s)
                                                : organ (olo, s) * (1.0 - oa) + organ (olo + 1, s) * oa) * mask (mat, fil, s);
                        else
                            A = lo >= kNF - 1 ? own (mat, fil, kNF - 1, s)
                                              : own (mat, fil, lo, s) * (1.0 - a) + own (mat, fil, lo + 1, s) * a;
                        if (! (f < 0.45 * sr)) A = 0.0;
                        vo.damp[(size_t) s] = (A * vo.vel - vo.amp[(size_t) s]) / kK;
                        const double tau = decay / (1.0 + 0.07 * (nn - 1.0));
                        vo.dk[(size_t) s] = std::exp (-1.0 / (sr * tau));
                    }
                    vo.bend16 = bend * c16;
                }
                vo.ctr += 1;
                if (vo.ctr == kK) vo.ctr = 0;
                if (vo.held) vo.e = std::fmin (1.0, vo.e + ainc);
                else         vo.e = vo.e * rk;
                double s = 0.0;
                for (int k = 0; k < kNP; ++k)
                {
                    const size_t q = (size_t) k;
                    vo.amp[q] = vo.amp[q] + vo.damp[q];
                    vo.dec[q] = vo.dec[q] * vo.dk[q];
                    double p = vo.ph[q] + vo.inc[q];
                    p = p - std::floor (p);
                    vo.ph[q] = p;
                    s += vo.amp[q] * vo.dec[q] * std::sin (kTwoPi * p);
                }
                y += s * vo.e;
                vo.age += 1;
                if (! vo.held && vo.e < 1e-5) vo.active = false;
            }
            out[0] = (float) (y * gain);
            int nAct = 0;
            for (auto& vo : voices) if (vo.active) ++nAct;
            probes[0] = voices[0].pos;
            probes[1] = voices[0].bend16;
            probes[2] = (double) nAct;
        }
    };
}
