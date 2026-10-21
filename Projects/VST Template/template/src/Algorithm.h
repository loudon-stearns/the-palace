// Algorithm.h — THE FILE YOU FILL IN. It knows nothing about JUCE.
//
// Port the numpy sketch's per-sample loop (reference/sketch.py) into step().
// Keep the same order of operations as the sketch, so the two match sample for
// sample wherever the model is not chaotic; verify.py checks it.
//
// Three rules for the audio thread: allocate nothing in step() or reset()
// (size arrays for the largest case, as std::array), take no locks, and keep
// every number of state in this struct.
//
// The example is a plain sine with a smoothed pitch and level, so the template
// builds and passes its own gates before anything is ported.
#pragma once

#include "ParamSpec.h"
#include <cmath>

namespace algo
{
    using tpl::ParamSpec;
    using tpl::Taper;

    // ── 1. Parameters. The enum order is the index into v[] in step(). ─────────
    enum Param { Freq, Level, kNumParams };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id       name         unit   min     max     default taper         smooth ms
        { "freq",  "Frequency", "Hz",  20.0, 2000.0, 220.0,  Taper::Log,    20.0 },
        { "level", "Level",     "dB", -60.0,    0.0, -12.0,  Taper::Linear, 20.0 },
    };

    // ── 2. Audio in and out, and probes. ───────────────────────────────────────
    // kInputs = 0 makes an instrument, > 0 an effect (match plugin.json "kind").
    // A probe is an inner value the verify step compares with the sketch
    // (a phase, a fundamental). It never reaches the audio.
    inline constexpr int kInputs  = 0;
    inline constexpr int kOutputs = 1;   // 1 = mono, copied to both channels; 2 = stereo
    inline constexpr const char* kProbes[] = { "phase" };
    inline constexpr int kNumProbes = 1;

    // ── 3. State and the per-sample update. ────────────────────────────────────
    struct Algorithm
    {
        double sr    = 44100.0;
        double phase = 0.0;
        double probes[kNumProbes] {};

        // Message thread, before audio starts. May allocate.
        void prepare (double sampleRate) { sr = sampleRate; }

        // Set the starting state, the same as the sketch's. v[] holds the
        // starting parameter values. Called after prepare(), and whenever the
        // host stops and restarts playback.
        void reset (const double* /*v*/) { phase = 0.0; }

        // One sample. v[] = current parameter values in natural units (already
        // smoothed; Choice and Toggle as their index). in[] has kInputs samples,
        // out[] takes kOutputs.
        void step (const double* v, const float* /*in*/, float* out)
        {
            const double gain = std::pow (10.0, v[Level] / 20.0);
            out[0] = (float) (gain * std::sin (2.0 * M_PI * phase));
            phase += v[Freq] / sr;
            phase -= std::floor (phase);
            probes[0] = phase;
        }
    };
}
