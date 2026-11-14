// Algorithm.h — the frustration model (reference/sketch.py, from ride.py).
//
// One tone of N partials shares a fundamental; N outside voices tuned to the
// plain harmonic series pull on its partials. Stretch B bends the partials away
// from whole-number ratios; coupling K sets how hard the voices pull. Near the
// edge (B about 1.8e-5 at N = 40, K = 6 Hz) the tone tears and heals.
//
// Same order of operations as the sketch, line for line, phases wrapped to
// [0, 1) each sample on both sides (unwrapped they lose precision).
//
// Play: drone is ride.py, sounding as it loads at Pitch. Keys plays it from MIDI,
// mono and last note first: the note sets the fundamental, an amplitude envelope
// shapes the loudness, and a gesture envelope carries the point on the B-K pad
// from where Stretch and Coupling rest toward the edge and back. In both modes an
// orbit (an LFO, sine on B in decades, cosine on K in Hz) traces a loop around it.
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
    enum Param
    {
        B, K, Inertia, F0, Voices, Level, Partials, Pinned, Source,
        Play, Velocity, AAttack, ADecay, ASustain, ARelease,
        GAttack, GRelease, GStretch, GCoupling, ORate, OStretch, OCoupling,
        kNumParams
    };

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
        { "play",      "Play",           "",    0.0,    1.0,    1.0,    Taper::Choice,  0.0,   "drone|keys",   true,   "Keys" },
        { "velocity",  "Velocity",       "",    0.0,    1.0,    0.5,    Taper::Linear,  20.0,  "",             true,   "Keys" },
        { "a_attack",  "Amp attack",     "s",   0.001,  10.0,   0.01,   Taper::Log,     0.0,   "",             true,   "Amp envelope" },
        { "a_decay",   "Amp decay",      "s",   0.001,  10.0,   0.5,    Taper::Log,     0.0,   "",             true,   "Amp envelope" },
        { "a_sustain", "Amp sustain",    "",    0.0,    1.0,    0.8,    Taper::Linear,  20.0,  "",             true,   "Amp envelope" },
        { "a_release", "Amp release",    "s",   0.001,  10.0,   1.0,    Taper::Log,     0.0,   "",             true,   "Amp envelope" },
        { "g_attack",  "Gesture in",     "s",   0.01,   20.0,   1.2,    Taper::Log,     0.0,   "",             true,   "Gesture" },
        { "g_release", "Gesture out",    "s",   0.01,   20.0,   0.8,    Taper::Log,     0.0,   "",             true,   "Gesture" },
        { "g_stretch", "Gesture B",      "dec", -2.0,   2.0,    0.5,    Taper::Linear,  20.0,  "",             true,   "Gesture" },
        { "g_coupling","Gesture K",      "Hz",  -10.0,  10.0,   0.0,    Taper::Linear,  20.0,  "",             true,   "Gesture" },
        { "o_rate",    "Orbit rate",     "Hz",  0.01,   8.0,    0.2,    Taper::Log,     20.0,  "",             true,   "Orbit" },
        { "o_stretch", "Orbit B",        "dec", 0.0,    2.0,    0.25,   Taper::Linear,  20.0,  "",             true,   "Orbit" },
        { "o_coupling","Orbit K",        "Hz",  0.0,    10.0,   1.5,    Taper::Linear,  20.0,  "",             true,   "Orbit" },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    inline constexpr int kInputs  = 0;
    inline constexpr int kOutputs = 1;
    // B and K are the moving point, named for the pad's parameters so the pad draws its trail.
    inline constexpr const char* kProbes[] = { "fundamental", "B", "K", "f0", "amp" };
    inline constexpr int kNumProbes = 5;

    // ── 3. State and the per-sample update ─────────────────────────────────────
    inline constexpr double kLn001 = -4.605170185988091;   // log(0.01), = sketch.py LN001

    // Simple Synth's envelope: the attack rises in a straight line, decay and release
    // fall exponentially, covering 99 % of the way in their time.
    struct Env
    {
        int stage = 0;   // 0 idle, 1 attack, 2 decay and sustain, 3 release
        double value = 0.0;

        void on() { stage = 1; }
        void off() { if (stage != 0) stage = 3; }

        double next (double a, double d, double s, double r, double sr)
        {
            if (stage == 1)
            {
                value += 1.0 / (a * sr);
                if (value >= 1.0) { value = 1.0; stage = 2; }
            }
            else if (stage == 2)
            {
                value = s + (value - s) * std::exp (kLn001 / (d * sr));
            }
            else if (stage == 3)
            {
                value *= std::exp (kLn001 / (r * sr));
                if (value < 1e-5) { value = 0.0; stage = 0; }
            }
            return value;
        }
    };

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
        static constexpr int kMaxHeld = 16;
        std::array<int, kMaxHeld> held {};
        int numHeld = 0, current = -1;
        bool fresh = false;   // a note arrived from silence: the tone starts over
        double vel = 0.0, orbit = 0.0;
        Env ampEnv, gestEnv;
        double probes[kNumProbes] {};

        void prepare (double sampleRate) { sr = sampleRate; dt = 1.0 / sr; }

        void reset (const double* v)
        {
            numHeld = 0; current = -1; fresh = false; vel = 0.0; orbit = 0.0;
            ampEnv = {}; gestEnv = {};
            configure ((int) v[Partials], (int) v[Source]);
            restart (v[F0]);
        }

        void removeHeld (int note)
        {
            const auto end = held.begin() + numHeld;
            const auto it = std::find (held.begin(), end, note);
            if (it != end) { std::move (it + 1, end, it); --numHeld; }
        }

        void noteOn (int note, double velocity)
        {
            if (ampEnv.stage == 0) fresh = true;
            removeHeld (note);
            if (numHeld == kMaxHeld) removeHeld (held[0]);
            held[(size_t) numHeld++] = note;
            current = note;
            vel = velocity;
            ampEnv.on();
            gestEnv.on();
        }

        void noteOff (int note)
        {
            removeHeld (note);
            if (note == current)
            {
                if (numHeld > 0) current = held[(size_t) numHeld - 1];
                else { ampEnv.off(); gestEnv.off(); }
            }
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

            const bool keys = v[Play] > 0.5;
            const double f0 = keys && current >= 0 ? 440.0 * std::pow (2.0, (current - 69) / 12.0) : v[F0];
            if (fresh) { fresh = false; if (keys) restart (f0); }
            double aE = 1.0, gE = 0.0;
            if (keys)
            {
                aE = ampEnv.next (v[AAttack], v[ADecay], v[ASustain], v[ARelease], sr);
                gE = gestEnv.next (v[GAttack], 1.0, 1.0, v[GRelease], sr);
            }
            const double os = std::sin (2.0 * M_PI * orbit), oc = std::cos (2.0 * M_PI * orbit);
            orbit += v[ORate] * dt;
            orbit -= std::floor (orbit);
            // the point: where B and K rest, carried by the gesture and the orbit (B in decades)
            const double dec = gE * v[GStretch] + v[OStretch] * os;
            const double b = dec != 0.0 ? std::clamp (v[B] * std::pow (10.0, dec), 1e-7, 30.0) : v[B];
            const double kc = std::clamp (v[K] + gE * v[GCoupling] + v[OCoupling] * oc, 0.0, 20.0);
            const double mix = v[Voices];
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

            double gain = std::pow (10.0, v[Level] / 20.0);
            if (keys) gain *= aE * (1.0 - v[Velocity] * (1.0 - vel));
            out[0] = (float) (gain * norm * (tone + mix * vox));
            probes[0] = dth; probes[1] = b; probes[2] = kc; probes[3] = f0; probes[4] = keys ? aE : 1.0;
        }
    };
}
