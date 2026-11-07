// bench.cpp — how much of one core the crowd costs, per crowd size, at 44.1 kHz.
//   c++ -O2 -std=c++17 -I src -I "../../VST Template/machinery/src" check/bench.cpp -o /tmp/ngbench && /tmp/ngbench
#include "Algorithm.h"
#include <chrono>
#include <cstdio>
int main() {
    for (int idx = 0; idx < 4; ++idx) for (double tight : {0.5, 1.8}) {
        algo::Algorithm a; a.prepare(44100.0);
        double v[algo::kNumParams]; for (int i = 0; i < algo::kNumParams; ++i) v[i] = algo::kParams[i].def;
        v[algo::Size] = idx; v[algo::Tight] = tight; a.reset(v); a.noteOn(48, 0.8);
        float out[1]; const int n = 44100 * 5;
        auto t0 = std::chrono::steady_clock::now();
        for (int i = 0; i < n; ++i) a.step(v, nullptr, out);
        double s = std::chrono::duration<double>(std::chrono::steady_clock::now() - t0).count();
        std::printf("crowd %3d  tight %.1f  %5.1f %% of one core\n", algo::kSizes[idx], tight, 100.0 * s / 5.0);
    }
}
