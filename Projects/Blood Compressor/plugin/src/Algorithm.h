// Algorithm.h — Blood Compressor: a feed-forward compressor dressed as the body.
// Ported line for line from reference/sketch.py (itself the browser vessel and the
// RNBO codebox v0.2, with times in seconds and the sidechain high-pass a knob).
//
//   sidechain high-pass (detector only) -> RMS detector, stereo-linked (louder side)
//   -> soft-knee gain computer (cubic Hermite: the vessel wall yielding)
//   -> nerve-conduction delay (fixed 5 ms: the body always has reaction time)
//   -> attack / release ballistics in dB (baroreceptor reflex / smooth muscle)
//   -> one gain on both sides, plus makeup
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
    enum Param { Threshold, Ratio, Knee, Attack, Release, Detector, ScHpf, Makeup, Bypass,
                 RelCurve, Sympathetic, Hrv, Age, kNumParams };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id           name              unit   min      max      default  taper          smooth choices  auto   group           hero
        { "threshold", "Threshold",      "dB",  -60.0,   0.0,     -20.0,   Taper::Linear, 20.0,  "",      true,  "Systolic",     true },
        { "ratio",     "Ratio",          ":1",  1.0,     20.0,    4.0,     Taper::Log,    20.0,  "",      true,  "Vessel wall",  true },
        { "knee",      "Knee",           "dB",  0.0,     24.0,    6.0,     Taper::Linear, 20.0,  "",      true,  "Vessel wall" },
        { "attack",    "Attack",         "s",   0.005,   0.5,     0.06,    Taper::Log,    0.0,   "",      true,  "Reflex" },
        { "release",   "Release",        "s",   0.005,   3.0,     0.3,     Taper::Log,    0.0,   "",      true,  "Reflex" },
        { "detector",  "Detector",       "s",   0.001,   0.1,     0.01,    Taper::Log,    0.0,   "",      true,  "Baroreceptors" },
        { "sc_hpf",    "Sidechain HPF",  "Hz",  1.0,     500.0,   80.0,    Taper::Log,    20.0,  "",      true,  "Baroreceptors" },
        { "makeup",    "Makeup",         "dB",  0.0,     24.0,    0.0,     Taper::Linear, 20.0,  "",      true,  "Output" },
        { "bypass",    "Bypass",         "",    0.0,     1.0,     0.0,     Taper::Toggle, 0.0,   "",      true,  "Output" },
        // the body (cycle 11): see step() for what each one bends
        { "rel_curve", "Release curve",  "",    -1.0,    1.0,     0.0,     Taper::Linear, 0.0,   "",      true,  "Reflex" },
        { "sympathetic","Sympathetic",   "",    0.0,     1.0,     0.0,     Taper::Linear, 20.0,  "",      true,  "Body" },
        { "hrv",       "Heart-rate var", "",    0.0,     1.0,     0.0,     Taper::Linear, 0.0,   "",      true,  "Body" },
        { "age",       "Vessel age",     "",    0.0,     1.0,     0.0,     Taper::Linear, 20.0,  "",      true,  "Body" },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    inline constexpr int kInputs  = 2;
    inline constexpr int kOutputs = 2;
    // What the CRT draws: pressure (detector, dB peak-equivalent), target (what the
    // wall asks for before the nerve delay, dB), squeeze (applied, dB), reflex (0/1),
    // breath (hrv times the breathing wave, -1..1: how far the set point has moved).
    inline constexpr const char* kProbes[] = { "pressure", "target", "squeeze", "reflex", "breath" };
    inline constexpr int kNumProbes = 5;

    inline constexpr double kNerveS = 0.005;
    inline constexpr int    kDLen   = 16384;
    inline constexpr double kDB10   = 4.342944819032518;   // 10 / ln(10)

    inline double curve (double x, double T, double R, double K)
    {
        const double lo = T - K / 2.0;
        const double hi = T + K / 2.0;
        if (K <= 0.0 || x <= lo)
        {
            if (x > T) return T + (x - T) / R;
            return x;
        }
        if (x >= hi) return T + (x - T) / R;
        const double s = (x - lo) / K;
        const double y0 = lo;
        const double y1 = T + (K / 2.0) / R;
        const double m0 = K;
        const double m1 = K / R;
        const double s2 = s * s;
        const double s3 = s2 * s;
        return (2.0 * s3 - 3.0 * s2 + 1.0) * y0 + (s3 - 2.0 * s2 + s) * m0
             + (-2.0 * s3 + 3.0 * s2) * y1 + (s3 - s2) * m1;
    }

    // ── 3. State and the per-sample update ─────────────────────────────────────
    struct Algorithm
    {
        double sr = 44100.0;
        double hpX = 0.0, hpY = 0.0, hpX2 = 0.0, hpY2 = 0.0;
        double ms = 0.0, g = 0.0;
        std::array<double, kDLen> dline {};
        int dw = 0, d = 1;
        double n = 0.0;   // samples since reset: the breathing clock
        double probes[kNumProbes] {};

        void prepare (double sampleRate)
        {
            sr = sampleRate;
            d = std::max (1, (int) std::floor (sr * kNerveS + 0.5));
        }

        void reset (const double* /*v*/)
        {
            hpX = hpY = hpX2 = hpY2 = 0.0;
            ms = 0.0; g = 0.0;
            dline.fill (0.0);
            dw = 0;
            n = 0.0;
        }

        void step (const double* v, const float* in, float* out)
        {
            const double x  = in[0];
            const double x2 = in[1];
            // the body: a stressed body (sympathetic), a breathing set point (hrv),
            // a stiffer wall (age); the muscle's letting-go (rel_curve) is below
            const double S  = std::min (1.0, std::max (0.0, v[Sympathetic]));
            const double A  = std::min (1.0, std::max (0.0, v[Age]));
            const double Hv = std::min (1.0, std::max (0.0, v[Hrv]));
            const double b = 0.6 * std::sin (2.0 * M_PI * 0.25 * n / sr)    // breathing, sinus arrhythmia
                           + 0.4 * std::sin (2.0 * M_PI * 0.1 * n / sr);    // the Mayer wave
            n += 1.0;
            const double br = Hv * b;
            const double R = std::max (1.0, v[Ratio]) * (1.0 + A);
            const double K = std::max (0.0, v[Knee]) * (1.0 - 0.8 * A);
            const double T = v[Threshold] - 12.0 * S + 3.0 * br;

            const double a = std::exp (-2.0 * M_PI * v[ScHpf] / sr);
            const double hp = a * (hpY + x - hpX);
            hpX = x; hpY = hp;
            const double hp2 = a * (hpY2 + x2 - hpX2);
            hpX2 = x2; hpY2 = hp2;

            const double ar = std::exp (-1.0 / (sr * (v[Detector] * (1.0 + 0.2 * br))));
            ms = ar * ms + (1.0 - ar) * std::max (hp * hp, hp2 * hp2);
            const double det = kDB10 * std::log (ms + 1e-12) + 3.0103;
            const double target = std::min (0.0, curve (det, T, R, K) - det);

            dline[(size_t) dw] = target;
            int r = dw - d;
            if (r < 0) r += kDLen;
            const double delayed = dline[(size_t) r];
            if (++dw >= kDLen) dw = 0;

            const double atk = std::max (0.005, v[Attack] / (1.0 + S));
            const double m = std::min (4.0, std::max (0.25, std::pow (2.0, -v[RelCurve] * (-g - 6.0) / 6.0)));
            const double rel = std::max (0.005, v[Release] / (1.0 + 3.0 * S) * m);
            const double c = delayed < g ? std::exp (-1.0 / (sr * atk)) : std::exp (-1.0 / (sr * rel));
            g = c * g + (1.0 - c) * delayed;

            if (v[Bypass] >= 0.5) { out[0] = (float) x; out[1] = (float) x2; }
            else
            {
                const double gl = std::pow (10.0, (g + v[Makeup]) / 20.0);
                out[0] = (float) (x * gl);
                out[1] = (float) (x2 * gl);
            }
            probes[0] = det;
            probes[1] = target;
            probes[2] = g;
            probes[3] = target < -0.05 ? 1.0 : 0.0;
            probes[4] = br;
        }
    };
}
