// survey.cpp — is one frost enough to make the dish ring longer? The piece check's twelve growth seeds
// (21–32), each grown on its food to 170 threads, then RT60 (the check's method, carry 3 s, wetness 0.25,
// tips 0.8) full, after one frost, and after frosting until nothing dies. Prints one JSON line per seed.
// Reads Projects/Mycelial Reverb/plugin/src/Algorithm.h; changes nothing there.
#include "Algorithm.h"

#include <cmath>
#include <cstdio>
#include <memory>
#include <vector>

using namespace algo;
static const double SR = 48000.0;
static const int BLOCK = 512;

static std::vector<float> phrase (double seconds, uint32_t seed)   // engine_gate.cpp's, unchanged
{
    const int N = (int) std::floor (seconds * SR + 0.5);
    std::vector<float> x ((size_t) N, 0.0f);
    MycelRng r; r.a = seed;
    const double notes[] = { 146.8, 174.6, 196, 220, 261.6, 293.7 };
    for (double t = 0; t < seconds; t += 0.6)
    {
        const double f = notes[(int) std::floor (r() * 6)];
        const int P = (int) std::floor (SR / f + 0.5);
        std::vector<float> d ((size_t) P);
        for (int i = 0; i < P; i++) d[(size_t) i] = (float) (r() * 2 - 1);
        const int o = (int) std::floor (t * SR + 0.5);
        int p = 0; double prev = 0;
        const int n = std::min (N - o, (int) std::floor (0.5 * SR + 0.5));
        for (int i = 0; i < n; i++)
        {
            const double v = d[(size_t) p];
            d[(size_t) p] = (float) (0.996 * 0.5 * (v + prev)); prev = v; p = (p + 1) % P;
            x[(size_t) (o + i)] = (float) ((double) x[(size_t) (o + i)] + 0.4 * v);
        }
    }
    return x;
}
// the check's rt60(): Schroeder's backward sum, a line from −5 to −35 dB, doubled
static double rt60 (const MycelColony& col)
{
    auto net = std::make_unique<MycelNet>(); net->prepare (SR); net->par (3, 0.25, 0.8); col.buildNet (*net);
    const int N = (int) (10 * SR); std::vector<double> e2 ((size_t) N);
    std::vector<float> x (BLOCK, 0.0f), l (BLOCK), r (BLOCK);
    for (int o = 0; o < N; o += BLOCK)
    {
        x[0] = o == 0 ? 1.0f : 0.0f; net->process (x.data(), l.data(), r.data(), BLOCK);
        for (int i = 0; i < BLOCK && o + i < N; i++) e2[(size_t) (o + i)] = (double) l[(size_t) i] * l[(size_t) i] + (double) r[(size_t) i] * r[(size_t) i];
    }
    std::vector<double> e ((size_t) N + 1, 0.0);
    for (int i = N - 1; i >= 0; i--) e[(size_t) i] = e[(size_t) i + 1] + e2[(size_t) i];
    int a = -1, b = -1;
    for (int i = 0; i < N; i++) { const double db = 10 * std::log10 (e[(size_t) i] / e[0] + 1e-30); if (a < 0 && db <= -5) a = i; if (db <= -35) { b = i; break; } }
    return a < 0 || b < 0 ? NAN : 2.0 * (b - a) / SR;
}

int main()
{
    const std::vector<float> food = phrase (40, 3);
    for (uint32_t seed = 21; seed <= 32; seed++)
    {
        auto net = std::make_unique<MycelNet>(); auto col = std::make_unique<MycelColony>();
        net->prepare (SR); col->net = net.get(); col->sr = SR; col->maxSegs = kMaxSegs; col->block = BLOCK;
        col->reset (seed, 1000, 600);
        std::vector<float> l (BLOCK), r (BLOCK); size_t o = 0; double t = 0;
        while (col->nseg < kMaxSegs && t < 400)
        {
            net->process (food.data() + o, l.data(), r.data(), BLOCK); col->feed (net->en.data()); net->en.fill (0);
            o += BLOCK; if (o + BLOCK > food.size()) o = 0; t += BLOCK / SR;
        }
        const auto c0 = col->counts(); const double r0 = rt60 (*col);
        const int k1 = col->frost(); const auto c1 = col->counts(); const double r1 = rt60 (*col);
        int frosts = 1, got; while ((got = col->frost()) && frosts < 40) frosts++;
        const auto c2 = col->counts(); const double r2 = rt60 (*col);
        std::printf ("{\"seed\": %u, \"threads\": [%d, %d, %d], \"dead_ends\": [%d, %d, %d], \"one_frost_killed\": %d, \"frosts_to_rings\": %d, \"rt60\": [%.4f, %.4f, %.4f]}\n",
                     seed, c0.threads, c1.threads, c2.threads, c0.ends, c1.ends, c2.ends, k1, frosts, r0, r1, r2);
    }
    return 0;
}
