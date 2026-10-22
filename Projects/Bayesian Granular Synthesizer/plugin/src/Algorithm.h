// Algorithm.h — Belief Cloud: the Bayesian grain cloud (reference/sketch.py says
// what each part does). The notes you hold are evidence; every grain draws its
// pitch from what the cloud believes, and grains near a believed note grow long.
// Follows the sketch operation for operation, random draws included.
#pragma once

#include "ParamSpec.h"

#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>

namespace algo
{
    using tpl::ParamSpec;
    using tpl::Taper;

    // ── 1. Parameters ──────────────────────────────────────────────────────────
    enum Param
    {
        Doubt, TimeToBelieve, Press, LetGo, Forget, Velocity,
        WidthStart, WidthFloor, Near, Rate, Shortest, Longest,
        Spread, Level,
        PriorShape, PriorTone, HillWidth, Register, RegisterWidth,
        PcC, PcCs, PcD, PcDs, PcE, PcF, PcFs, PcG, PcGs, PcA, PcAs, PcB,
        kNumParams
    };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id                 name                   unit    min     max     default  taper          smooth choices auto   group           hero
        { "doubt",           "Doubt",               "",     0.02,   4.0,    0.25,    Taper::Log,    20.0,  "",     true,  "Belief",       true },
        { "time_to_believe", "Time to believe",     "s",    0.05,   10.0,   1.6,     Taper::Log,    0.0,   "",     true,  "Belief",       true },
        { "press",           "Press",               "s",    0.005,  1.0,    0.08,    Taper::Log,    0.0,   "",     true,  "Evidence" },
        { "let_go",          "Let go",              "s",    0.05,   20.0,   1.4,     Taper::Log,    0.0,   "",     true,  "Evidence" },
        { "forget",          "Forget",              "s",    0.05,   10.0,   0.7,     Taper::Log,    0.0,   "",     true,  "Evidence" },
        { "velocity",        "Velocity",            "",     0.0,    1.0,    0.3,     Taper::Linear, 20.0,  "",     true,  "Evidence" },
        { "width_start",     "Width at press",      "ct",   30.0,   600.0,  120.0,   Taper::Log,    0.0,   "",     true,  "Width" },
        { "width_floor",     "Width floor",         "ct",   1.0,    25.0,   5.0,     Taper::Log,    0.0,   "",     true,  "Width" },
        { "near",            "Grain near",          "ct",   5.0,    200.0,  35.0,    Taper::Log,    0.0,   "",     true,  "Grains" },
        { "rate",            "Grain rate",          "/s",   10.0,   800.0,  160.0,   Taper::Log,    20.0,  "",     true,  "Grains" },
        { "shortest",        "Grain shortest",      "cyc",  1.0,    32.0,   4.0,     Taper::Log,    0.0,   "",     true,  "Grains" },
        { "longest",         "Grain longest",       "cyc",  8.0,    512.0,  128.0,   Taper::Log,    0.0,   "",     true,  "Grains" },
        { "spread",          "Spread",              "",     0.0,    1.0,    0.7,     Taper::Linear, 20.0,  "",     true,  "Output" },
        { "level",           "Level",               "dB",   -60.0,  6.0,    -2.0,    Taper::Linear, 20.0,  "",     true,  "Output" },
        { "prior_shape",     "Prior shape",         "",     0.0,    1.0,    0.0,     Taper::Linear, 0.0,   "",     true,  "Prior" },
        { "prior_tone",      "Prior tone",          "",     0.0,    1.0,    0.0,     Taper::Linear, 0.0,   "",     true,  "Prior" },
        { "hill_width",      "Prior hill width",    "ct",   5.0,    100.0,  20.0,    Taper::Log,    0.0,   "",     true,  "Prior" },
        { "register",        "Prior register",      "",     33.0,   96.0,   64.0,    Taper::Linear, 0.0,   "",     true,  "Prior" },
        { "register_width",  "Prior register width","oct",  0.5,    8.0,    8.0,     Taper::Log,    0.0,   "",     true,  "Prior" },
        { "pc_c",            "Prior C",             "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
        { "pc_cs",           "Prior C#",            "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
        { "pc_d",            "Prior D",             "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
        { "pc_ds",           "Prior D#",            "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
        { "pc_e",            "Prior E",             "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
        { "pc_f",            "Prior F",             "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
        { "pc_fs",           "Prior F#",            "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
        { "pc_g",            "Prior G",             "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
        { "pc_gs",           "Prior G#",            "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
        { "pc_a",            "Prior A",             "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
        { "pc_as",           "Prior A#",            "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
        { "pc_b",            "Prior B",             "",     0.0,    1.0,    1.0,     Taper::Linear, 0.0,   "",     true,  "Prior notes" },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    // The probes are what the CRT's visualizer reads: the cloud's state, the last
    // grain, and every note slot (note or -1, weight, conviction).
    inline constexpr int kInputs  = 0;
    inline constexpr int kOutputs = 2;
    inline constexpr int kMaxNotes = 16;
    inline constexpr const char* kProbes[] = {
        "voices", "mean_cycles", "prior_share", "grain_note", "grain_cycles",
        "n0_note", "n0_weight", "n0_conviction",    "n1_note", "n1_weight", "n1_conviction",
        "n2_note", "n2_weight", "n2_conviction",    "n3_note", "n3_weight", "n3_conviction",
        "n4_note", "n4_weight", "n4_conviction",    "n5_note", "n5_weight", "n5_conviction",
        "n6_note", "n6_weight", "n6_conviction",    "n7_note", "n7_weight", "n7_conviction",
        "n8_note", "n8_weight", "n8_conviction",    "n9_note", "n9_weight", "n9_conviction",
        "n10_note", "n10_weight", "n10_conviction", "n11_note", "n11_weight", "n11_conviction",
        "n12_note", "n12_weight", "n12_conviction", "n13_note", "n13_weight", "n13_conviction",
        "n14_note", "n14_weight", "n14_conviction", "n15_note", "n15_weight", "n15_conviction",
    };
    inline constexpr int kNumProbes = 5 + 3 * kMaxNotes;

    // ── 3. State and the per-sample update ─────────────────────────────────────
    inline constexpr int kLo = 33, kBinC = 10, kBins = 630;
    inline constexpr int kMaxVoices = 640, kCtl = 64, kTN = 4096;
    inline constexpr uint32_t kSeed = 12345u;
    inline constexpr int kNumPriorParams = 16;
    inline constexpr int kPriorParams[kNumPriorParams] = {
        PriorShape, HillWidth, Register, RegisterWidth,
        PcC, PcCs, PcD, PcDs, PcE, PcF, PcFs, PcG, PcGs, PcA, PcAs, PcB };

    struct Algorithm
    {
        double sr = 44100.0;
        uint32_t s = kSeed;
        std::array<double, kTN + 1> tab {};
        std::array<double, kBins> prior {}, cdf {}, tone {};
        double priorSum = 0.0;
        std::array<double, kNumPriorParams> priorKey {};
        bool havePrior = false;

        std::array<bool, kMaxNotes> active {}, held {};
        std::array<int, kMaxNotes> midi {};
        std::array<double, kMaxNotes> vel {}, w {}, ls {}, sig {}, conv {};
        double sumW = 0.0, priorShare = 1.0, lastLw = 0.0, lastSig = 0.0;

        std::array<double, kMaxVoices> vPh {}, vInc {}, vL {}, vR {};
        std::array<long, kMaxVoices> vPos {}, vLen {}, vFade {};
        int nv = 0;
        double next = 0.0;
        int ctl = 0;
        long dropped = 0;
        double meanCycles = 4.0, grainNote = 0.0, grainCycles = 0.0;
        double probes[kNumProbes] {};

        double rand()
        {
            s += 0x6D2B79F5u;
            uint32_t t = s;
            t = (t ^ (t >> 15)) * (t | 1u);
            t = t ^ (t + (t ^ (t >> 7)) * (t | 61u));
            return (double) (t ^ (t >> 14)) / 4294967296.0;
        }

        void prepare (double sampleRate)
        {
            sr = sampleRate;
            for (int i = 0; i <= kTN; ++i) tab[(size_t) i] = std::sin (2.0 * M_PI * i / kTN);
        }

        void reset (const double* v)
        {
            s = kSeed;
            havePrior = false;
            active.fill (false); held.fill (false); midi.fill (0);
            vel.fill (0.0); w.fill (0.0); ls.fill (0.0); sig.fill (0.0); conv.fill (0.0);
            sumW = 0.0; priorShare = 1.0;
            lastLw = std::log (v[WidthStart]); lastSig = v[WidthStart];
            nv = 0; next = 0.0; ctl = 0; dropped = 0;
            meanCycles = 4.0; grainNote = 0.0; grainCycles = 0.0;
            buildPrior (v);
        }

        // ---- the prior
        void buildPrior (const double* v)
        {
            bool same = havePrior;
            for (int k = 0; k < kNumPriorParams && same; ++k) same = priorKey[(size_t) k] == v[kPriorParams[k]];
            if (same) return;
            for (int k = 0; k < kNumPriorParams; ++k) priorKey[(size_t) k] = v[kPriorParams[k]];
            havePrior = true;
            const double shape = v[PriorShape], width = v[HillWidth], reg = v[Register], regw = v[RegisterWidth];
            double a = 0.0, mx = 0.0;
            for (int i = 0; i < kBins; ++i)
            {
                const double m = kLo + (i + 0.5) * kBinC / 100.0;
                double h = 0.02;
                const int base = (int) std::floor (m) - kLo;
                for (int k = std::max (0, base - 3); k <= std::min (63, base + 3); ++k)
                {
                    const double dist = m - (kLo + k);
                    if (std::fabs (dist) < 3.0)
                    {
                        const double d = dist * 100.0 / width;
                        h += v[PcC + (kLo + k) % 12] * std::exp (-0.5 * d * d);
                    }
                }
                const double r = (m - reg) / (12.0 * regw);
                const double p = std::exp (-0.5 * r * r) * ((1.0 - shape) + shape * h);
                prior[(size_t) i] = p;
                a += p;
                cdf[(size_t) i] = a;
                if (p > mx) mx = p;
            }
            priorSum = a;
            const double mean = a / kBins;
            for (int i = 0; i < kBins; ++i)
            {
                double t = 0.0;
                if (mx > mean * 1.05)
                {
                    t = (prior[(size_t) i] - mean) / (mx - mean);
                    t = t < 0.0 ? 0.0 : (t > 1.0 ? 1.0 : t);
                }
                tone[(size_t) i] = t;
            }
        }

        // ---- the evidence
        void noteOn (int note, double velocity)
        {
            if (velocity <= 0.0) { noteOff (note); return; }
            for (int j = 0; j < kMaxNotes; ++j)
                if (active[(size_t) j] && midi[(size_t) j] == note) { held[(size_t) j] = true; vel[(size_t) j] = velocity; return; }
            int slot = -1;
            for (int j = 0; j < kMaxNotes; ++j)
                if (! active[(size_t) j]) { slot = j; break; }
            if (slot < 0)
            {
                for (int pass = 0; pass < 2 && slot < 0; ++pass)
                {
                    const bool wantHeld = pass == 1;
                    double best = 2.0;
                    for (int j = 0; j < kMaxNotes; ++j)
                        if (held[(size_t) j] == wantHeld && w[(size_t) j] < best) { best = w[(size_t) j]; slot = j; }
                }
                sumW -= w[(size_t) slot];
            }
            const auto k = (size_t) slot;
            active[k] = true; held[k] = true; midi[k] = note; vel[k] = velocity;
            w[k] = 0.0; ls[k] = lastLw; sig[k] = lastSig; conv[k] = 0.0;
        }

        void noteOff (int note)
        {
            for (int j = 0; j < kMaxNotes; ++j)
                if (active[(size_t) j] && midi[(size_t) j] == note) held[(size_t) j] = false;
        }

        void evolve (const double* v)
        {
            const double dt = kCtl / sr;
            const double kOn = 1.0 - std::exp (-dt / v[Press]);
            const double dOff = std::exp (-dt / v[LetGo]);
            const double kF = 1.0 - std::exp (-dt / v[TimeToBelieve]);
            const double kB = 1.0 - std::exp (-dt / v[Forget]);
            const double lw = std::log (v[WidthStart]), lf = std::log (v[WidthFloor]);
            const double vs = v[Velocity];
            lastLw = lw; lastSig = v[WidthStart];
            double sum = 0.0;
            for (size_t j = 0; j < (size_t) kMaxNotes; ++j)
            {
                if (! active[j]) continue;
                if (held[j])
                {
                    const double target = 1.0 - vs * (1.0 - vel[j]);
                    w[j] += (target - w[j]) * kOn;
                    ls[j] += (lf - ls[j]) * kF;
                }
                else
                {
                    w[j] *= dOff;
                    ls[j] += (lw - ls[j]) * kB;
                    if (w[j] < 1e-3) { active[j] = false; held[j] = false; w[j] = 0.0; continue; }
                }
                sig[j] = std::exp (ls[j]);
                const double c = (lw - ls[j]) / (lw - lf);
                conv[j] = c < 0.0 ? 0.0 : (c > 1.0 ? 1.0 : c);
                sum += w[j];
            }
            sumW = sum;
            priorShare = v[Doubt] / (v[Doubt] + sum);
        }

        // ---- one grain
        double gauss()
        {
            double u = 0.0;
            while (u == 0.0) u = rand();
            return std::sqrt (-2.0 * std::log (u)) * std::cos (2.0 * M_PI * rand());
        }

        void draw (const double* v, double& outMidi, double& outCycles)
        {
            const double doubt = v[Doubt];
            const double z = doubt + sumW;
            bool anyNote = false;
            for (int j = 0; j < kMaxNotes; ++j) anyNote = anyNote || active[(size_t) j];
            double u = rand() * z;
            double m;
            if (u < doubt || ! anyNote)
            {
                const double t = rand() * priorSum;
                int a = 0, b = kBins - 1;
                while (a < b)
                {
                    const int c = (a + b) >> 1;
                    if (cdf[(size_t) c] < t) a = c + 1; else b = c;
                }
                m = kLo + (a + rand()) * kBinC / 100.0;
            }
            else
            {
                u -= doubt;
                int pick = -1;
                for (int j = 0; j < kMaxNotes; ++j)
                {
                    if (! active[(size_t) j]) continue;
                    pick = j;
                    if (u < w[(size_t) j]) break;
                    u -= w[(size_t) j];
                }
                m = midi[(size_t) pick] + gauss() * sig[(size_t) pick] / 100.0;
            }
            double best = 0.0;
            const double near = v[Near];
            for (size_t j = 0; j < (size_t) kMaxNotes; ++j)
            {
                if (! active[j]) continue;
                const double d = (m - midi[j]) * 100.0 / near;
                const double g = std::exp (-0.5 * d * d) * w[j] * conv[j];
                if (g > best) best = g;
            }
            const int bi = (int) std::floor ((m - kLo) * 100.0 / kBinC);
            if (bi >= 0 && bi < kBins)
            {
                const double tt = v[PriorTone] * tone[(size_t) bi];
                if (tt > best) best = tt;
            }
            const double nMin = v[Shortest];
            outMidi = m;
            outCycles = nMin * std::pow (v[Longest] / nMin, best);
        }

        void spawn (const double* v)
        {
            double m, cycles;
            draw (v, m, cycles);
            if (nv >= kMaxVoices) { ++dropped; return; }
            const double f = 440.0 * std::pow (2.0, (m - 69.0) / 12.0);
            if (f > sr * 0.45) return;
            const double cyc = sr / f;
            const auto k = (size_t) nv++;
            vPh[k] = rand();
            vInc[k] = f / sr;
            vPos[k] = 0;
            vFade[k] = std::max (2L, (long) std::floor (cyc + 0.5));
            vLen[k] = (long) std::floor (cyc * (cycles + 2.0) + 0.5);
            const double amp = std::sqrt (0.06 / v[Rate]) * std::sqrt (f / (cycles + 1.0));
            const double p = 0.5 + v[Spread] * (rand() - 0.5);
            vL[k] = amp * std::cos (p * M_PI / 2.0);
            vR[k] = amp * std::sin (p * M_PI / 2.0);
            grainNote = m; grainCycles = cycles;
            meanCycles += 0.02 * (cycles - meanCycles);
        }

        // ---- one sample
        void step (const double* v, const float*, float* out)
        {
            if (ctl <= 0) { buildPrior (v); evolve (v); ctl = kCtl; }
            while (next <= 0.0)
            {
                spawn (v);
                double u = rand();
                if (u < 1e-12) u = 1e-12;
                next += -std::log (u) / v[Rate] * sr;
            }

            double left = 0.0, right = 0.0;
            for (size_t k = 0; k < (size_t) nv; ++k)
            {
                const long pos = vPos[k], ln = vLen[k], fd = vFade[k];
                double e = 1.0;
                if (pos < fd) e = 0.5 - 0.5 * std::cos (M_PI * (double) pos / (double) fd);
                else if (pos > ln - fd) e = 0.5 - 0.5 * std::cos (M_PI * (double) (ln - pos) / (double) fd);
                double ph = vPh[k];
                const double x = ph * kTN;
                const int j = (int) x;
                const double sv = tab[(size_t) j] + (tab[(size_t) j + 1] - tab[(size_t) j]) * (x - j);
                ph += vInc[k];
                if (ph >= 1.0) ph -= 1.0;
                vPh[k] = ph;
                const double se = sv * e;
                left += se * vL[k];
                right += se * vR[k];
                vPos[k] = pos + 1;
            }
            for (int k = 0; k < nv;)
            {
                const auto a = (size_t) k;
                if (vPos[a] >= vLen[a])
                {
                    const auto b = (size_t) --nv;
                    vPh[a] = vPh[b]; vInc[a] = vInc[b]; vPos[a] = vPos[b]; vLen[a] = vLen[b];
                    vFade[a] = vFade[b]; vL[a] = vL[b]; vR[a] = vR[b];
                }
                else ++k;
            }

            const double g = std::pow (10.0, v[Level] / 20.0);
            ctl -= 1;
            next -= 1.0;
            out[0] = (float) std::tanh (left * g);
            out[1] = (float) std::tanh (right * g);

            probes[0] = nv; probes[1] = meanCycles; probes[2] = priorShare;
            probes[3] = grainNote; probes[4] = grainCycles;
            for (size_t j = 0; j < (size_t) kMaxNotes; ++j)
            {
                const size_t b = 5 + 3 * j;
                if (active[j]) { probes[b] = midi[j]; probes[b + 1] = w[j]; probes[b + 2] = conv[j]; }
                else { probes[b] = -1.0; probes[b + 1] = 0.0; probes[b + 2] = 0.0; }
            }
        }
    };
}
