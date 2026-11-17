// rooms.cpp — one knock, five rooms, from Mycelial Reverb's own engine.
//
// Reads the plugin's engine, Projects/Mycelial Reverb/plugin/src/Algorithm.h, and changes nothing in it.
// One colony (seed 21, the first seed of the piece check's growth section) is grown on the check's own
// food (plucked notes, phrase(40, 3)) to 3, 25, 60 and 170 threads, then given one frost. At each stage
// the network is copied silent (the check's clone, the engine's buildNet) at the piece's house settings
// (carry 3 s, soil wetness 0.25, tips keep 0.8) and two things are rendered from it:
//   ir_<k>_L/R.f32     a unit impulse, 8 s: what the RT60 is measured on (the check's rt60 method)
//   knock_<k>_L/R.f32  the piece's knock (knockBuf, its noise seeded here), 4 s: what is heard
// and the colony's drawing (nodes, threads, fruiting bodies, way in) goes to stdout as JSON.
//
//   clang++ -std=c++20 -O2 -ffp-contract=off -I <plugin/src> -I <VST Template/machinery/src> rooms.cpp -o rooms
//   ./rooms <out dir> > out/rooms.json
#include "Algorithm.h"

#include <cmath>
#include <cstdio>
#include <memory>
#include <string>
#include <vector>

using namespace algo;

static const double SR = 48000.0;
static const int BLOCK = 512;
static const uint32_t SEED = 21;      // the colony
static const uint32_t KNOCK_SEED = 7; // the knock's 96 samples of noise (the piece uses Math.random)
static std::string outDir;

static void put (const std::string& name, const std::vector<float>& v)
{
    const std::string path = outDir + "/" + name;
    FILE* f = std::fopen (path.c_str(), "wb");
    if (! f) { std::fprintf (stderr, "cannot write %s\n", path.c_str()); std::exit (2); }
    std::fwrite (v.data(), sizeof (float), v.size(), f);
    std::fclose (f);
}

// engine_gate.cpp's phrase(): plucked notes with gaps, the food the check grows colonies on.
static std::vector<float> phrase (double seconds, uint32_t seed)
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

// The piece's knockBuf(): 90 ms, a 640 Hz and a 1510 Hz ping and a 2 ms click of noise.
static std::vector<float> knock()
{
    const int n = (int) std::floor (0.09 * SR + 0.5);
    std::vector<float> d ((size_t) n);
    MycelRng r; r.a = KNOCK_SEED;
    for (int i = 0; i < n; i++)
    {
        const double t = i / SR;
        d[(size_t) i] = (float) (0.55 * std::sin (6.283 * 640 * t) * std::exp (-t * 70) + 0.3 * std::sin (6.283 * 1510 * t) * std::exp (-t * 110)
                                 + (i < 96 ? (r() * 2 - 1) * 0.5 * (1 - i / 96.0) : 0));
    }
    return d;
}

static void render (const MycelColony& col, const std::vector<float>& in, double seconds, std::vector<float>& L, std::vector<float>& R)
{
    auto net = std::make_unique<MycelNet>();
    net->prepare (SR); net->par (3, 0.25, 0.8);
    col.buildNet (*net);
    const int N = (int) std::floor (seconds * SR + 0.5);
    L.assign ((size_t) N, 0); R.assign ((size_t) N, 0);
    std::vector<float> x (BLOCK), l (BLOCK), r (BLOCK);
    for (int o = 0; o < N; o += BLOCK)
    {
        const int n = std::min (BLOCK, N - o);
        for (int i = 0; i < n; i++) x[(size_t) i] = (size_t) (o + i) < in.size() ? in[(size_t) (o + i)] : 0.0f;
        net->process (x.data(), l.data(), r.data(), n);
        std::copy_n (l.begin(), n, L.begin() + o); std::copy_n (r.begin(), n, R.begin() + o);
    }
}

static void drawing (const MycelColony& c, const char* name, double fed, int frostKilled)
{
    const auto k = c.counts();
    std::printf ("  {\"name\": \"%s\", \"threads\": %d, \"loops\": %d, \"dead_ends\": %d, \"fruit\": %d, \"fed_s\": %.3f, \"frost_killed\": %d, \"in\": %d,\n   \"nodes\": {",
                 name, k.threads, k.loops, k.ends, k.fruit, fed, frostKilled, c.inNode);
    bool first = true;
    for (int i = 0; i < c.nNodes; i++)
    {
        const auto& n = c.nodes[(size_t) i]; if (! n.used || ! n.nsegs) continue;
        std::printf ("%s\"%d\": [%.2f, %.2f, %d]", first ? "" : ", ", i, n.x, n.y, (int) n.nsegs); first = false;
    }
    std::printf ("},\n   \"segs\": [");
    first = true;
    for (int i = 0; i < c.nSegs; i++)
    {
        const auto& s = c.segs[(size_t) i]; if (! s.used) continue;
        std::printf ("%s[%d, %d, %.4f, %d]", first ? "" : ", ", s.a, s.b, s.y, s.L); first = false;
    }
    std::printf ("],\n   \"fruit_nodes\": [");
    for (int i = 0; i < c.nFruit; i++) std::printf ("%s%d", i ? ", " : "", c.fruit[(size_t) i].n);
    std::printf ("]}");
}

int main (int argc, char** argv)
{
    if (argc < 2) { std::fprintf (stderr, "rooms <out dir>\n"); return 2; }
    outDir = argv[1];
    const std::vector<float> food = phrase (40, 3), kn = knock();
    put ("knock.f32", kn);

    auto net = std::make_unique<MycelNet>(); auto col = std::make_unique<MycelColony>();
    net->prepare (SR);
    col->net = net.get(); col->sr = SR; col->maxSegs = kMaxSegs; col->block = BLOCK;
    col->reset (SEED, 1000, 600);

    std::printf ("{\"seed\": %u, \"knock_seed\": %u, \"sr\": %.0f, \"carry\": 3, \"wetness\": 0.25, \"tip\": 0.8, \"stages\": [\n", SEED, KNOCK_SEED, SR);
    const int targets[] = { 3, 25, 60, kMaxSegs };
    std::vector<float> l (BLOCK), r (BLOCK), L, R; size_t o = 0; double t = 0;
    int k = 0;
    for (int target : targets)
    {
        while (col->nseg < target && t < 400)
        {
            net->process (food.data() + o, l.data(), r.data(), BLOCK); col->feed (net->en.data()); net->en.fill (0);
            o += BLOCK; if (o + BLOCK > food.size()) o = 0; t += BLOCK / SR;
        }
        render (*col, std::vector<float> { 1.0f }, 8.0, L, R); put ("ir_" + std::to_string (k) + "_L.f32", L); put ("ir_" + std::to_string (k) + "_R.f32", R);
        render (*col, kn, 4.0, L, R); put ("knock_" + std::to_string (k) + "_L.f32", L); put ("knock_" + std::to_string (k) + "_R.f32", R);
        drawing (*col, ("grown to " + std::to_string (target)).c_str(), t, 0); std::printf (",\n");
        k++;
    }
    // One frost, as the page's table and the plugin's button give it: every dead end dies back one thread.
    // Then frost again until nothing dies, as the piece check does ("frosting to the loops alone").
    int killed = col->frost(), frosts = 1;
    render (*col, std::vector<float> { 1.0f }, 8.0, L, R); put ("ir_" + std::to_string (k) + "_L.f32", L); put ("ir_" + std::to_string (k) + "_R.f32", R);
    render (*col, kn, 4.0, L, R); put ("knock_" + std::to_string (k) + "_L.f32", L); put ("knock_" + std::to_string (k) + "_R.f32", R);
    drawing (*col, "after one frost", t, killed); std::printf (",\n"); k++;
    int more = 0, got;
    while ((got = col->frost()) && frosts < 40) { more += got; frosts++; }
    render (*col, std::vector<float> { 1.0f }, 8.0, L, R); put ("ir_" + std::to_string (k) + "_L.f32", L); put ("ir_" + std::to_string (k) + "_R.f32", R);
    render (*col, kn, 4.0, L, R); put ("knock_" + std::to_string (k) + "_L.f32", L); put ("knock_" + std::to_string (k) + "_R.f32", R);
    drawing (*col, ("after " + std::to_string (frosts) + " frosts").c_str(), t, killed + more);
    std::printf ("\n]}\n");
    return 0;
}
