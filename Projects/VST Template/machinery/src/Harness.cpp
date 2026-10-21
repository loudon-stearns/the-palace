// Harness.cpp — template machinery: the console app verify.py drives.
// Don't edit per plugin.
//
//   Harness params
//       Print the parameter table, inputs, outputs and probes as JSON.
//   Harness engine <steps> <sr> <paths.f64> <out.bin> [<in.f32>] [--notes notes.f64]
//       Run Algorithm::step() directly with the exact per-sample parameter
//       values: the check against the sketch, with no smoothing in the way.
//   Harness plugin <steps> <sr> <paths.f64> <out.bin> [<in.f32>] [--notes notes.f64] [--block N]
//       Run the real Processor::processBlock, moving every parameter once a
//       block through the host-facing parameters, the way automation lands,
//       and the notes as MIDI on their exact sample.
//
// paths.f64: float64, parameter-major (parameter j, sample i at [j * steps + i]),
//            in natural units (Choice and Toggle as their index).
// in.f32:    float32, input-major (kInputs rows); effects only.
// notes.f64: float64 rows of four: sample, 1 = on / 0 = off, note, velocity 1..127;
//            sorted by sample. Each lands before that sample is computed.
// out.bin:   float32 outputs (kOutputs rows), then float64 probes (kNumProbes rows).
#include "PluginProcessor.h"

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

namespace
{
    template <typename T>
    bool readAll (const char* path, std::vector<T>& v, size_t count)
    {
        v.assign (count, T {});
        FILE* f = std::fopen (path, "rb");
        if (f == nullptr) { std::fprintf (stderr, "cannot open %s\n", path); return false; }
        const size_t got = std::fread (v.data(), sizeof (T), count, f);
        std::fclose (f);
        if (got != count) { std::fprintf (stderr, "%s: expected %zu values, got %zu\n", path, count, got); return false; }
        return true;
    }

    bool writeOut (const char* path, const std::vector<float>& out, const std::vector<double>& probes)
    {
        FILE* f = std::fopen (path, "wb");
        if (f == nullptr) return false;
        std::fwrite (out.data(), sizeof (float), out.size(), f);
        std::fwrite (probes.data(), sizeof (double), probes.size(), f);
        std::fclose (f);
        return true;
    }

    const char* taperName (tpl::Taper t)
    {
        switch (t)
        {
            case tpl::Taper::Linear: return "linear";
            case tpl::Taper::Log:    return "log";
            case tpl::Taper::Choice: return "choice";
            case tpl::Taper::Toggle: return "toggle";
        }
        return "?";
    }

    void printParams()
    {
        std::printf ("{\n  \"name\": \"%s\",\n  \"inputs\": %d,\n  \"outputs\": %d,\n  \"probes\": [",
                     PLUGIN_NAME, algo::kInputs, algo::kOutputs);
        for (int j = 0; j < algo::kNumProbes; ++j)
            std::printf ("%s\"%s\"", j ? ", " : "", algo::kProbes[j]);
        std::printf ("],\n  \"params\": [\n");
        for (int i = 0; i < algo::kNumParams; ++i)
        {
            const auto& s = algo::kParams[i];
            std::printf ("    {\"id\": \"%s\", \"name\": \"%s\", \"unit\": \"%s\", \"min\": %.17g, \"max\": %.17g, "
                         "\"default\": %.17g, \"taper\": \"%s\", \"smooth_ms\": %.17g, \"choices\": \"%s\", "
                         "\"automatable\": %s, \"group\": \"%s\", \"hero\": %s}%s\n",
                         s.id, s.name, s.unit, s.min, s.max, s.def, taperName (s.taper), s.smoothMs,
                         s.choices, s.automatable ? "true" : "false", s.group, s.hero ? "true" : "false",
                         i + 1 < algo::kNumParams ? "," : "");
        }
        std::printf ("  ]\n}\n");
    }
}

int main (int argc, char** argv)
{
    juce::ScopedJuceInitialiser_GUI juceInit;

    const std::string mode = argc > 1 ? argv[1] : "";
    if (mode == "params") { printParams(); return 0; }
    if ((mode != "engine" && mode != "plugin") || argc < 6)
    {
        std::fprintf (stderr, "usage: Harness params | engine|plugin <steps> <sr> <paths.f64> <out.bin> [<in.f32>] [--notes notes.f64] [--block N]\n");
        return 2;
    }

    const long   steps = std::atol (argv[2]);
    const double sr    = std::atof (argv[3]);
    const char*  inPath = nullptr;
    const char*  notesPath = nullptr;
    int block = 64;
    for (int a = 6; a < argc; ++a)
    {
        if (std::strcmp (argv[a], "--block") == 0 && a + 1 < argc) block = std::atoi (argv[++a]);
        else if (std::strcmp (argv[a], "--notes") == 0 && a + 1 < argc) notesPath = argv[++a];
        else inPath = argv[a];
    }

    struct Note { long sample; bool on; int note, velocity; };
    std::vector<Note> notes;
    if (notesPath != nullptr)
    {
        FILE* f = std::fopen (notesPath, "rb");
        if (f == nullptr) { std::fprintf (stderr, "cannot open %s\n", notesPath); return 1; }
        double row[4];
        while (std::fread (row, sizeof (double), 4, f) == 4)
            notes.push_back ({ (long) row[0], row[1] > 0.5, (int) row[2], (int) row[3] });
        std::fclose (f);
    }

    std::vector<double> paths;
    if (! readAll (argv[4], paths, (size_t) algo::kNumParams * (size_t) steps)) return 1;
    std::vector<float> input;
    if (algo::kInputs > 0)
    {
        if (inPath == nullptr) { std::fprintf (stderr, "this algorithm takes input: pass <in.f32>\n"); return 2; }
        if (! readAll (inPath, input, (size_t) algo::kInputs * (size_t) steps)) return 1;
    }

    std::vector<float>  out ((size_t) algo::kOutputs * (size_t) steps, 0.0f);
    std::vector<double> probes ((size_t) algo::kNumProbes * (size_t) steps, 0.0);
    auto at = [steps] (int row, long i) { return (size_t) row * (size_t) steps + (size_t) i; };

    if (mode == "engine")
    {
        algo::Algorithm a;
        a.prepare (sr);
        double v[algo::kNumParams];
        for (int j = 0; j < algo::kNumParams; ++j) v[j] = paths[at (j, 0)];
        a.reset (v);

        float in[algo::kInputs > 0 ? algo::kInputs : 1] {};
        float o[algo::kOutputs] {};
        size_t next = 0;
        for (long i = 0; i < steps; ++i)
        {
            for (; next < notes.size() && notes[next].sample <= i; ++next)
                tpl::deliverNote (a, notes[next].on, notes[next].note, notes[next].velocity / 127.0);
            for (int j = 0; j < algo::kNumParams; ++j) v[j] = paths[at (j, i)];
            for (int c = 0; c < algo::kInputs; ++c) in[c] = input[at (c, i)];
            a.step (v, in, o);
            for (int c = 0; c < algo::kOutputs; ++c) out[at (c, i)] = o[c];
            for (int j = 0; j < algo::kNumProbes; ++j) probes[at (j, i)] = a.probes[j];
        }
    }
    else
    {
        Processor proc;
        const int numIn = algo::kInputs > 0 ? 2 : 0;
        proc.setPlayConfigDetails (numIn, 2, sr, block);

        auto setAll = [&] (long i)
        {
            for (int j = 0; j < algo::kNumParams; ++j)
                if (auto* p = proc.apvts.getParameter (algo::kParams[j].id))
                    p->setValueNotifyingHost (p->convertTo0to1 ((float) paths[at (j, i)]));
        };
        setAll (0);
        proc.prepareToPlay (sr, block);

        Processor::ProbeSink sink { probes.data(), steps, 0 };
        proc.probeSink = &sink;

        juce::AudioBuffer<float> buf (2, block);
        juce::MidiBuffer midi;
        size_t next = 0;
        for (long start = 0; start < steps; start += block)
        {
            const int n = (int) std::min<long> (block, steps - start);
            setAll (start);
            midi.clear();
            for (; next < notes.size() && notes[next].sample < start + n; ++next)
            {
                const auto& e = notes[next];
                const int offset = (int) std::max (0L, e.sample - start);
                midi.addEvent (e.on ? juce::MidiMessage::noteOn (1, e.note, (juce::uint8) e.velocity)
                                    : juce::MidiMessage::noteOff (1, e.note), offset);
            }
            buf.setSize (2, n, false, false, true);
            buf.clear();
            for (int c = 0; c < numIn; ++c)
                for (int k = 0; k < n; ++k)
                    buf.setSample (c, k, input[at (std::min (c, algo::kInputs - 1), start + k)]);
            proc.processBlock (buf, midi);
            for (int c = 0; c < algo::kOutputs; ++c)
                for (int k = 0; k < n; ++k)
                    out[at (c, start + k)] = buf.getSample (c, k);
        }
        proc.releaseResources();
    }

    if (! writeOut (argv[5], out, probes)) { std::fprintf (stderr, "cannot write %s\n", argv[5]); return 1; }
    return 0;
}
