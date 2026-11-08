// run.cpp — play one held note on a crowd of a chosen size and dump what it did.
//   c++ -O2 -std=c++17 -I . -I "../../../../VST Template/machinery/src" run.cpp -o /tmp/ngcrowd
//   /tmp/ngcrowd <sizeIdx 0..5> <tightness> <life> <even 0|1> <seconds> <out-prefix> [shipped]
// Writes <prefix>.audio.f32 (mono, 44.1 kHz) and <prefix>.r.f32 (crowd agreement, every
// 32 samples). Built with -DSHIPPED it uses the plugin's own Algorithm.h instead, for the
// sample-for-sample check that the widened copy is the same instrument up to 256.
#ifdef SHIPPED
#include "../../src/Algorithm.h"
#else
#include "Algorithm1024.h"
#endif
#include <cstdio>
#include <cstdlib>
#include <string>
int main (int argc, char** argv) {
    const int idx = std::atoi (argv[1]);
    algo::Algorithm a; a.prepare (44100.0);
    double v[algo::kNumParams]; for (int i = 0; i < algo::kNumParams; ++i) v[i] = algo::kParams[i].def;
    v[algo::Size] = idx; v[algo::Tight] = std::atof (argv[2]); v[algo::Life] = std::atof (argv[3]);
    v[algo::Even] = std::atof (argv[4]); v[algo::Velocity] = 0.0;
    const int n = (int) (std::atof (argv[5]) * 44100.0);
    const std::string pre = argv[6];
    a.reset (v); a.noteOn (48, 1.0);
    FILE* fa = std::fopen ((pre + ".audio.f32").c_str(), "wb");
    FILE* fr = std::fopen ((pre + ".r.f32").c_str(), "wb");
    float out[1];
    for (int i = 0; i < n; ++i) {
        a.step (v, nullptr, out);
        std::fwrite (out, 4, 1, fa);
        if ((i & 31) == 0) { float r = (float) a.probes[0]; std::fwrite (&r, 4, 1, fr); }
    }
    std::fclose (fa); std::fclose (fr);
}
