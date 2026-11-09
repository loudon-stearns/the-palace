// exact.cpp — renders 10 s through an engine and writes raw floats, to compare two builds bit for bit.
#include "Algorithm.h"
#include <cstdio>
int main (int argc, char** argv)
{
    std::FILE* f = std::fopen (argv[1], "wb");
    for (int k = 0; k < 5; ++k)
    {
        double v[algo::kNumParams];
        for (int p = 0; p < algo::kNumParams; ++p) v[p] = algo::kParams[p].def;
        v[algo::Size] = k;
        algo::Algorithm a; a.prepare (48000); a.reset (v); a.noteOn (45, 1.0);
        float out[1];
        for (long i = 0; i < 480000; ++i)
        {
            v[algo::Couple] = 0.03 * i / 480000.0;          // sweep coupling: the parameters move
            if (i == 240000) a.noteOn (52, 0.8);           // and a new note glides in
            a.step (v, nullptr, out); std::fwrite (out, 4, 1, f);
        }
    }
    std::fclose (f);
}
