// engine_gate.cpp — Algorithm.h with no JUCE, run on the piece's own check cases.
// gate.mjs compiles this, runs it, runs the JavaScript engine on the same cases and
// compares the files written here number for number.
//
//   engine_gate <out dir> [--quick]
//
// The cases are the check script's ("… — rich — mycelial reverb — check.mjs"), ported
// with it: one thread, a fork of three, 2,000 random junctions, energy never rising
// (colonies grown to 3, 20, 80 and 170 threads, four control corners each), and the
// torture run. Two more that only the plugin needs: a saved colony reloads to the same
// room, and the host's block size does not change the sound.
#include "Algorithm.h"

#include <cstdio>
#include <memory>
#include <string>
#include <vector>

using namespace algo;

static const double SR = 48000.0;
static const int BLOCK = 512;
static std::string outDir;

template <typename T>
static void put (const char* name, const std::vector<T>& v)
{
    const std::string path = outDir + "/" + name;
    FILE* f = std::fopen (path.c_str(), "wb");
    if (! f) { std::fprintf (stderr, "cannot write %s\n", path.c_str()); std::exit (2); }
    std::fwrite (v.data(), sizeof (T), v.size(), f);
    std::fclose (f);
}

struct Rig
{
    std::unique_ptr<MycelNet> net = std::make_unique<MycelNet>();
    std::unique_ptr<MycelColony> col = std::make_unique<MycelColony>();
    explicit Rig (uint32_t seed, int preset = MycelColony::None, double arg = 0)
    {
        net->prepare (SR);
        col->net = net.get(); col->sr = SR; col->maxSegs = kMaxSegs; col->block = BLOCK;
        col->reset (seed, 1000, 600);                       // the JavaScript constructor's reset
        if (preset != MycelColony::None) col->reset (seed, 1000, 600, preset, arg);
    }
};
struct Par { double rt, damp, tip; };

static std::unique_ptr<MycelNet> cloneNet (const MycelColony& col, const Par* par)
{
    auto net = std::make_unique<MycelNet>();
    net->prepare (SR);
    if (par) net->par (par->rt, par->damp, par->tip);
    col.buildNet (*net);
    return net;
}
static void impulse (MycelNet& net, double seconds, std::vector<float>& L, std::vector<float>& R)
{
    const int N = (int) std::floor (seconds * SR + 0.5);
    L.assign ((size_t) N, 0); R.assign ((size_t) N, 0);
    std::vector<float> x (BLOCK), l (BLOCK), r (BLOCK);
    for (int o = 0; o < N; o += BLOCK)
    {
        const int n = std::min (BLOCK, N - o);
        std::fill (x.begin(), x.end(), 0.0f); if (o == 0) x[0] = 1;
        net.process (x.data(), l.data(), r.data(), n);
        std::copy_n (l.begin(), n, L.begin() + o); std::copy_n (r.begin(), n, R.begin() + o);
    }
}
// A source the colony can eat: plucked notes with gaps (the check script's phrase()).
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
static double growTo (Rig& rg, int target, const std::vector<float>& src, double maxSeconds)
{
    std::vector<float> l (BLOCK), r (BLOCK); size_t o = 0; double t = 0;
    while (rg.col->nseg < target && t < maxSeconds)
    {
        rg.net->process (src.data() + o, l.data(), r.data(), BLOCK); rg.col->feed (rg.net->en.data()); rg.net->en.fill (0);
        o += BLOCK; if (o + BLOCK > src.size()) o = 0; t += BLOCK / SR;
    }
    return t;
}
// The colony as numbers, for comparing two colonies thread for thread.
static void graph (const MycelColony& c, std::vector<double>& g)
{
    g.push_back (c.nseg); g.push_back (c.nSegs); g.push_back (c.nNodes); g.push_back (c.nFruit); g.push_back (c.inNode); g.push_back (c.time);
    for (int i = 0; i < c.nSegs; i++)
    {
        const auto& s = c.segs[(size_t) i];
        if (! s.used) { g.push_back (-1); continue; }
        g.push_back (s.a); g.push_back (s.b); g.push_back (s.L); g.push_back (s.y); g.push_back (s.e);
    }
    for (int i = 0; i < c.nFruit; i++) g.push_back (c.fruit[(size_t) i].n);
}

int main (int argc, char** argv)
{
    if (argc < 2) { std::fprintf (stderr, "engine_gate <out dir> [--quick]\n"); return 2; }
    outDir = argv[1];
    const bool quick = argc > 2 && std::string (argv[2]) == "--quick";
    std::printf ("{\n");

    // ── one thread ──
    {
        Rig rg (1, MycelColony::Thread, 286); rg.net->par (3, 0, 0.8);
        std::vector<float> L, R; impulse (*rg.net, 0.5, L, R);
        put ("thread_L.f32", L); put ("thread_R.f32", R);
        std::printf (" \"threadL\": %d,\n \"threadGain\": %.17g,\n", rg.col->segs[0].L, rg.net->lineGain (rg.col->segs[0].L));
    }
    // ── a fork of three ──
    {
        Rig rg (1, MycelColony::Fork); rg.net->par (3, 0, 0.8);
        std::vector<float> L, R; impulse (*rg.net, 0.2, L, R);
        put ("fork_L.f32", L); put ("fork_R.f32", R);
        std::printf (" \"forkL\": %d,\n \"forkGain\": %.17g,\n", rg.col->segs[0].L, rg.net->lineGain (rg.col->segs[0].L));
    }
    // ── the junction rule itself, any thicknesses ──
    {
        MycelRng r; r.a = 7; double worst = 0; std::vector<double> ratios;
        for (int k = 0; k < 2000; k++)
        {
            const int n = 2 + (int) std::floor (r() * 5); double y[8], a[8], sy = 0, S = 0, ein = 0, eout = 0;
            for (int i = 0; i < n; i++) { y[i] = 0.2 + r() * 5; a[i] = r() * 2 - 1; sy += y[i]; S += std::sqrt (y[i]) * a[i]; ein += a[i] * a[i]; }
            for (int i = 0; i < n; i++) { const double o = 2 * S / sy * std::sqrt (y[i]) - a[i]; eout += o * o; }
            worst = std::max (worst, std::fabs (eout / ein - 1)); ratios.push_back (eout / ein);
        }
        put ("junction.f64", ratios);
        std::printf (" \"junctionWorst\": %.17g,\n", worst);
    }
    // The same rule through the engine: junctions of 2 to 6 threads of random thickness, one
    // 32-sample chunk of random sound arriving on every thread, energy in against energy out.
    {
        MycelRng r; r.a = 7; double worst = 0;
        auto net = std::make_unique<MycelNet>(); net->prepare (SR); net->par (3, 0, 1);
        for (int k = 0; k < 2000; k++)
        {
            net->reset();
            const int n = 2 + (int) std::floor (r() * 5); double pairs[16];
            for (int i = 0; i < n; i++) { net->add (i, 0, i + 1, 64); pairs[2 * i] = i; pairs[2 * i + 1] = 0.2 + r() * 5; }
            net->ys (pairs, 2 * n);
            // sound travelling toward the junction (node 0 is each thread's A end: the half 2s+1)
            for (int i = 0; i < n; i++) for (int j = 0; j < 32; j++) net->pool[(size_t) (2 * i + 1) * (size_t) net->slot + (size_t) j] = (float) (r() * 2 - 1);
            double ein = 0; const double g = net->g[0];
            for (int i = 0; i < n; i++) for (int j = 0; j < 32; j++) { const double v = g * (double) net->pool[(size_t) (2 * i + 1) * (size_t) net->slot + (size_t) j]; ein += v * v; }
            float l[32], rr[32]; net->process (nullptr, l, rr, 32);
            // what left the junction now sits at the start of each thread's outgoing line (the half 2s)
            double eout = 0;
            for (int i = 0; i < n; i++) for (int j = 0; j < 32; j++) { const double v = net->pool[(size_t) (2 * i) * (size_t) net->slot + (size_t) j]; eout += v * v; }
            worst = std::max (worst, std::fabs (eout / ein - 1));
        }
        std::printf (" \"junctionEngineWorst\": %.17g,\n", worst);
    }

    // ── with nothing going in, the energy held never rises ──
    const std::vector<float> food = phrase (40, 3);
    put ("food.f32", food);
    {
        std::vector<double> E, G; double worstStep = 0; int runs = 0;
        const int nSeeds = quick ? 2 : 10;
        const Par corners[] = { { 12, 0, 1 }, { 12, 0.9, 1 }, { 0.2, 0, 0 }, { 12, 0.5, 0.8 } };
        for (int si = 0; si < nSeeds; si++)
        {
            Rig rg ((uint32_t) (11 + si));
            for (int target : { 3, 20, 80, kMaxSegs })
            {
                if (target > 3) growTo (rg, target, food, 400);
                graph (*rg.col, G);
                for (const Par& par : corners)
                {
                    auto net = cloneNet (*rg.col, &par); float x[64] = {}, l[64], r[64];
                    x[0] = 1; net->process (x, l, r, 64); x[0] = 0; double prev = net->stored(); E.push_back (prev);
                    const int steps = (int) std::floor ((quick ? 2 : 6) * SR / 64 + 0.5);
                    for (int k = 0; k < steps; k++) { net->process (x, l, r, 64); const double e = net->stored(); const double ratio = e / prev; if (prev > 1e-12 && ratio > worstStep) worstStep = ratio; prev = e; E.push_back (e); }
                    runs++;
                }
            }
        }
        put ("passive_E.f64", E); put ("passive_graph.f64", G);
        std::printf (" \"passiveRuns\": %d,\n \"passiveWorstStep\": %.17g,\n", runs, worstStep);
    }

    // ── the torture ──
    {
        Rig rg (99); MycelRng r; r.a = 5;
        std::vector<float> x (BLOCK), l (BLOCK), rr (BLOCK), OL, OR; std::vector<double> E, G;
        double peak = 0, t = 0, nextJ = 0; bool bad = false; const double T = quick ? 20 : 60;
        while (t < T)
        {
            for (int i = 0; i < BLOCK; i++) x[(size_t) i] = (float) (r() * 2 - 1);
            rg.net->process (x.data(), l.data(), rr.data(), BLOCK); rg.col->feed (rg.net->en.data()); rg.net->en.fill (0);
            for (int i = 0; i < BLOCK; i++) { const double a = std::max (std::fabs ((double) l[(size_t) i]), std::fabs ((double) rr[(size_t) i])); if (a > peak) peak = a; if (! std::isfinite (a)) bad = true; }
            OL.insert (OL.end(), l.begin(), l.end()); OR.insert (OR.end(), rr.begin(), rr.end());
            t += BLOCK / SR;
            if (t > nextJ)
            {
                nextJ = t + 0.25;
                const double rt = r() < 0.5 ? 12 : 0.2 + r() * 11.8;         // drawn in the JavaScript's order
                const double dp = r() < 0.5 ? 0 : r() * 0.9;
                const double tp = r() < 0.5 ? 1 : r();
                rg.net->par (rt, dp, tp);
                if (r() < 0.08) rg.col->frost();
                if (r() < 0.3) { const double nx = r() * 1000; const double ny = r() * 600; rg.col->setIn (rg.col->nearest (nx, ny)); }
            }
        }
        graph (*rg.col, G);
        rg.net->par (12, 0, 1); std::fill (x.begin(), x.end(), 0.0f);
        const double e0 = rg.net->stored(); double eEnd = e0, rise = 0, prev = e0; E.push_back (e0);
        const int steps = (int) std::ceil ((quick ? 5 : 20) * SR / BLOCK);   // the JavaScript's k < 468.75 runs 469 times
        for (int k = 0; k < steps; k++) { rg.net->process (x.data(), l.data(), rr.data(), BLOCK); const double e = rg.net->stored(); rise = std::max (rise, e / prev); prev = e; eEnd = e; E.push_back (e); }
        put ("torture_L.f32", OL); put ("torture_R.f32", OR); put ("torture_E.f64", E); put ("torture_graph.f64", G);
        std::printf (" \"torturePeak\": %.17g,\n \"tortureFinite\": %s,\n \"tortureThreads\": %d,\n \"tortureAfterDb\": %.17g,\n \"tortureRise\": %.17g,\n",
                     peak, bad ? "false" : "true", rg.col->nseg, 10 * std::log10 (eEnd / e0), rise);
    }

    // ── plugin only: a saved colony reloads to the same room, and goes on growing the same way ──
    {
        Rig a (31); growTo (a, 60, food, 400);
        std::string text; a.col->save (text);
        Rig b (1); MycelColony loaded; const bool ok = loaded.load (text.c_str());
        std::string again; loaded.save (again);
        // b takes the colony the way the plugin does: the same threads, silent lines
        b.net->reset(); *b.col = loaded; b.col->net = b.net.get(); b.col->buildNet (*b.net);
        a.net->reset(); a.col->buildNet (*a.net);          // a's lines emptied too, so the two start level
        std::vector<float> la (BLOCK), ra (BLOCK), lb (BLOCK), rb (BLOCK); double diff = 0; size_t o = 0;
        for (int k = 0; k < (int) (20 * SR / BLOCK); k++)
        {
            a.net->process (food.data() + o, la.data(), ra.data(), BLOCK); a.col->feed (a.net->en.data()); a.net->en.fill (0);
            b.net->process (food.data() + o, lb.data(), rb.data(), BLOCK); b.col->feed (b.net->en.data()); b.net->en.fill (0);
            for (int i = 0; i < BLOCK; i++) diff = std::max ({ diff, std::fabs ((double) la[(size_t) i] - lb[(size_t) i]), std::fabs ((double) ra[(size_t) i] - rb[(size_t) i]) });
            o += BLOCK; if (o + BLOCK > food.size()) o = 0;
        }
        MycelColony junk; const bool r1 = junk.load ("MYCEL1 48000 170"), r2 = junk.load ("nonsense"), r3 = junk.load ((text.substr (0, text.size() / 2)).c_str());
        std::printf (" \"stateLoads\": %s,\n \"stateTextSame\": %s,\n \"stateBytes\": %zu,\n \"stateThreadsAtSave\": 60,\n \"stateThreadsAfter20s\": [%d, %d],\n \"stateMaxDiffAfterReload\": %.17g,\n \"stateRefusesDamaged\": %s,\n",
                     ok ? "true" : "false", again == text ? "true" : "false", text.size(), a.col->nseg, b.col->nseg, diff, (! r1 && ! r2 && ! r3) ? "true" : "false");
    }
    // ── plugin only: the host's block size. Dish::process cuts any block so the colony still eats
    //    every 512 samples; the sound must not depend on how the host cut it. ──
    {
        auto run = [&] (bool ragged, bool hold, std::vector<float>& L, std::vector<float>& R, int& threads)
        {
            auto d = std::make_unique<Dish>(); d->col.reset (41, kDishW, kDishH); d->prepare (SR, 3, 0.25); d->col.hold = hold;
            if (hold) { Rig g (41); growTo (g, 40, food, 400); d->adopt (*g.col); d->col.hold = true; }
            const int N = (int) (10 * SR); L.assign ((size_t) N, 0); R.assign ((size_t) N, 0);
            MycelRng r; r.a = 3; int o = 0;
            while (o < N) { int n = ragged ? 1 + (int) std::floor (r() * 700) : BLOCK; n = std::min (n, N - o); d->process (food.data() + o, L.data() + o, R.data() + o, n); o += n; }
            threads = d->col.nseg;
        };
        std::vector<float> l1, r1, l2, r2; int t1, t2; double dh = 0, dg = 0;
        run (false, true, l1, r1, t1); run (true, true, l2, r2, t2);
        for (size_t i = 0; i < l1.size(); i++) dh = std::max ({ dh, std::fabs ((double) l1[i] - l2[i]), std::fabs ((double) r1[i] - r2[i]) });
        run (false, false, l1, r1, t1); run (true, false, l2, r2, t2);
        for (size_t i = 0; i < l1.size(); i++) dg = std::max ({ dg, std::fabs ((double) l1[i] - l2[i]), std::fabs ((double) r1[i] - r2[i]) });
        std::printf (" \"blockHeldMaxDiff\": %.17g,\n \"blockGrowingMaxDiff\": %.17g,\n \"blockGrowingThreads\": [%d, %d]\n", dh, dg, t1, t2);
    }
    std::printf ("}\n");
    return 0;
}
