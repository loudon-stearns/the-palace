// probe.cpp — tests the two "because" lines of the first draft, on the same colony as rooms.cpp.
// For each stage, the knock is rendered twice through the same network:
//   as built   the engine's own taps (spore at 0.45·0.7071 per side once fruiting bodies exist, else 0.7071;
//              each fruiting body at 1/sqrt(n), panned by x)
//   spore only the spore alone at 0.7071 per side, as the newborn has it
// and prints the peak and the energy of each, so the tap rule's share of the level drop can be read off.
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
static std::vector<float> knock()   // rooms.cpp's, unchanged
{
    const int n = (int) std::floor (0.09 * SR + 0.5);
    std::vector<float> d ((size_t) n);
    MycelRng r; r.a = 7;
    for (int i = 0; i < n; i++)
    {
        const double t = i / SR;
        d[(size_t) i] = (float) (0.55 * std::sin (6.283 * 640 * t) * std::exp (-t * 70) + 0.3 * std::sin (6.283 * 1510 * t) * std::exp (-t * 110)
                                 + (i < 96 ? (r() * 2 - 1) * 0.5 * (1 - i / 96.0) : 0));
    }
    return d;
}
static void render (const MycelColony& col, bool sporeOnly, const std::vector<float>& in, double& peak, double& energy)
{
    auto net = std::make_unique<MycelNet>(); net->prepare (SR); net->par (3, 0.25, 0.8); col.buildNet (*net);
    if (sporeOnly) { MycelNet::Tap t { 0, 0.7071, 0.7071 }; net->taps (&t, 1); }
    const int N = (int) (4 * SR); std::vector<float> x (BLOCK), l (BLOCK), r (BLOCK); peak = 0; energy = 0;
    for (int o = 0; o < N; o += BLOCK)
    {
        for (int i = 0; i < BLOCK; i++) x[(size_t) i] = (size_t) (o + i) < in.size() ? in[(size_t) (o + i)] : 0.0f;
        net->process (x.data(), l.data(), r.data(), BLOCK);
        for (int i = 0; i < BLOCK; i++) { peak = std::max ({ peak, std::fabs ((double) l[(size_t) i]), std::fabs ((double) r[(size_t) i]) }); energy += (double) l[(size_t) i] * l[(size_t) i] + (double) r[(size_t) i] * r[(size_t) i]; }
    }
}
static void row (const MycelColony& c, const char* name, const std::vector<float>& kn)
{
    double p1, e1, p2, e2; render (c, false, kn, p1, e1); render (c, true, kn, p2, e2);
    const auto k = c.counts();
    std::printf ("{\"stage\": \"%s\", \"threads\": %d, \"fruit\": %d, \"spore_tap\": %.4f, \"peak_as_built\": %.6f, \"peak_spore_only\": %.6f, \"energy_as_built\": %.6g, \"energy_spore_only\": %.6g}\n",
                 name, k.threads, k.fruit, (k.fruit ? 0.45 : 1.0) * 0.7071, p1, p2, e1, e2);
}

int main()
{
    const std::vector<float> food = phrase (40, 3), kn = knock();
    auto net = std::make_unique<MycelNet>(); auto col = std::make_unique<MycelColony>();
    net->prepare (SR); col->net = net.get(); col->sr = SR; col->maxSegs = kMaxSegs; col->block = BLOCK;
    col->reset (21, 1000, 600);
    std::vector<float> l (BLOCK), r (BLOCK); size_t o = 0; double t = 0;
    for (int target : { 3, 25, 60, kMaxSegs })
    {
        while (col->nseg < target && t < 400)
        {
            net->process (food.data() + o, l.data(), r.data(), BLOCK); col->feed (net->en.data()); net->en.fill (0);
            o += BLOCK; if (o + BLOCK > food.size()) o = 0; t += BLOCK / SR;
        }
        row (*col, ("grown to " + std::to_string (target)).c_str(), kn);
    }
    col->frost(); int f = 1; while (col->frost() && f < 40) f++;
    row (*col, "frosted to no dead ends", kn);
    return 0;
}
