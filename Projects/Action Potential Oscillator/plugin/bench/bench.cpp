// bench.cpp — what the Action Potential engine costs, per crowd size, on this Mac.
// Runs algo::Algorithm::step() exactly as the plugin does (one call per sample,
// a held note, the knobs at a chosen setting) and times it against real time.
// Build: clang++ -std=c++17 -O3 -DNDEBUG -I../src -I"../../../VST Template/machinery/src" bench.cpp -o bench
#include "Algorithm.h"
#include <chrono>
#include <cstdio>
#include <cstring>

static double run (int sizeIdx, double sr, double couple, double spread, int note, double spikeMs, double seconds)
{
    double v[algo::kNumParams];
    for (int p = 0; p < algo::kNumParams; ++p) v[p] = algo::kParams[p].def;
    v[algo::Size] = sizeIdx; v[algo::Couple] = couple; v[algo::Spread] = spread; v[algo::Spike] = spikeMs;
    algo::Algorithm a; a.prepare (sr); a.reset (v); a.noteOn (note, 1.0);
    float out[1]; volatile float sink = 0.f;
    const long warm = (long) sr, N = (long) (sr * seconds);
    for (long i = 0; i < warm; ++i) { a.step (v, nullptr, out); sink = sink + out[0]; }
    double best = 1e9;
    for (int rep = 0; rep < 5; ++rep)
    {
        auto t0 = std::chrono::steady_clock::now();
        for (long i = 0; i < N; ++i) { a.step (v, nullptr, out); sink = sink + out[0]; }
        auto t1 = std::chrono::steady_clock::now();
        best = std::min (best, std::chrono::duration<double> (t1 - t0).count());
    }
    return 100.0 * best / seconds;   // percent of one core, real time
}

int main ()
{
    const int sizes[5] = { 1, 8, 16, 32, 64 };
    struct Case { const char* name; double sr, couple, spread; int note; double spike; };
    const Case cases[] = {
        { "default 44.1k A2 (locked)",   44100, 0.006, 0.1, 45, 1.0 },
        { "scattered 44.1k A2",          44100, 0.0,   0.3, 45, 1.0 },
        { "default 48k A2",              48000, 0.006, 0.1, 45, 1.0 },
        { "default 96k A2",              96000, 0.006, 0.1, 45, 1.0 },
        { "high note 48k A5, short spike", 48000, 0.006, 0.1, 81, 0.3 },
    };
    std::printf ("case");
    for (int s : sizes) std::printf ("\tn=%d", s);
    std::printf ("\n");
    for (const auto& c : cases)
    {
        std::printf ("%s", c.name);
        for (int k = 0; k < 5; ++k) std::printf ("\t%.3f", run (k, c.sr, c.couple, c.spread, c.note, c.spike, 3.0));
        std::printf ("\n");
    }
}
