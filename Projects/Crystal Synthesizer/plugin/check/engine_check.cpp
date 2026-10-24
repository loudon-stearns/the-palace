// engine_check.cpp — a stand-in for the template's Harness, engine mode only, with
// no JUCE: until VST Template can build a plugin that lives in a steward's bundle,
// this runs Algorithm::step() on the sketch's exact per-sample values so the port
// can be checked now. Same command line and file formats as machinery/src/Harness.cpp:
//
//   engine_check params
//   engine_check engine <steps> <sr> <paths.f64> <out.bin> [--notes notes.f64]
//
// Build: check/check_engine.py does it (clang++ -O2, -I the template's machinery/src).
#include "Algorithm.h"

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

static const char* taperName (tpl::Taper t)
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

int main (int argc, char** argv)
{
    const std::string mode = argc > 1 ? argv[1] : "";
    if (mode == "params")
    {
        std::printf ("{\"name\": \"Crystal Synthesizer\", \"inputs\": %d, \"outputs\": %d, \"probes\": [", algo::kInputs, algo::kOutputs);
        for (int j = 0; j < algo::kNumProbes; ++j) std::printf ("%s\"%s\"", j ? ", " : "", algo::kProbes[j]);
        std::printf ("], \"params\": [\n");
        for (int i = 0; i < algo::kNumParams; ++i)
        {
            const auto& s = algo::kParams[i];
            std::printf ("{\"id\": \"%s\", \"name\": \"%s\", \"unit\": \"%s\", \"min\": %.17g, \"max\": %.17g, \"default\": %.17g, "
                         "\"taper\": \"%s\", \"smooth_ms\": %.17g, \"choices\": \"%s\", \"group\": \"%s\", \"hero\": %s}%s\n",
                         s.id, s.name, s.unit, s.min, s.max, s.def, taperName (s.taper), s.smoothMs, s.choices, s.group,
                         s.hero ? "true" : "false", i + 1 < algo::kNumParams ? "," : "");
        }
        std::printf ("]}\n");
        return 0;
    }
    if (mode != "engine" || argc < 6) { std::fprintf (stderr, "usage: engine_check params | engine <steps> <sr> <paths.f64> <out.bin> [--notes f]\n"); return 2; }
    const long steps = std::atol (argv[2]);
    const double sr = std::atof (argv[3]);
    const char* notesPath = nullptr;
    for (int a = 6; a < argc; ++a) if (std::strcmp (argv[a], "--notes") == 0 && a + 1 < argc) notesPath = argv[++a];

    struct Note { long sample; bool on; int note, velocity; };
    std::vector<Note> notes;
    if (notesPath)
    {
        FILE* f = std::fopen (notesPath, "rb"); double row[4];
        while (std::fread (row, sizeof (double), 4, f) == 4) notes.push_back ({ (long) row[0], row[1] > 0.5, (int) row[2], (int) row[3] });
        std::fclose (f);
    }
    std::vector<double> paths ((size_t) algo::kNumParams * (size_t) steps);
    { FILE* f = std::fopen (argv[4], "rb"); if (! f || std::fread (paths.data(), 8, paths.size(), f) != paths.size()) { std::fprintf (stderr, "bad paths\n"); return 1; } std::fclose (f); }
    auto at = [steps] (int row, long i) { return (size_t) row * (size_t) steps + (size_t) i; };

    std::vector<float> out ((size_t) algo::kOutputs * (size_t) steps);
    std::vector<double> probes ((size_t) algo::kNumProbes * (size_t) steps);
    static algo::Algorithm a;   // large: keep it off the stack
    a.prepare (sr);
    double v[algo::kNumParams];
    for (int j = 0; j < algo::kNumParams; ++j) v[j] = paths[at (j, 0)];
    a.reset (v);
    float o[algo::kOutputs] {};
    size_t next = 0;
    for (long i = 0; i < steps; ++i)
    {
        for (; next < notes.size() && notes[next].sample <= i; ++next)
        {
            if (notes[next].on) a.noteOn (notes[next].note, notes[next].velocity / 127.0);
            else a.noteOff (notes[next].note);
        }
        for (int j = 0; j < algo::kNumParams; ++j) v[j] = paths[at (j, i)];
        a.step (v, nullptr, o);
        for (int c = 0; c < algo::kOutputs; ++c) out[at (c, i)] = o[c];
        for (int j = 0; j < algo::kNumProbes; ++j) probes[at (j, i)] = a.probes[j];
    }
    FILE* f = std::fopen (argv[5], "wb");
    std::fwrite (out.data(), 4, out.size(), f); std::fwrite (probes.data(), 8, probes.size(), f); std::fclose (f);
    return 0;
}
