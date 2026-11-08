// Algorithm.h — Slime Mold Delay: a delay network grown by a slime mold.
//
// Ported line for line from reference/sketch.py (read its docstring first). The dish: a
// round agar, one listener near the middle, five oat flakes that are five bands of the
// incoming sound. The mold starts as a mesh over the agar and its flow law carves the mesh
// down to the roads that carry what is playing; tips go out for food the roads don't reach.
// Every tube is a delay line both ways (length / streaming speed = echo time), and sound
// leaves a junction split the way the flow splits there.
//
// Audio-thread rules. Everything is sized in prepare(): nodes and tubes live in fixed
// slots, iterated in slot order (the same order as the sketch), and each node keeps one
// history buffer that every tube leaving it reads. A history is never cleared: a node slot
// remembers the sample it was born on, and a read from before that is silence. The dish
// steps 30 times a second (Clock scales it) inside step(), a few hundred microseconds of
// Gaussian elimination on at most 80 nodes, then nothing until the next tick.
#pragma once

#include "ParamSpec.h"
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <vector>

namespace algo
{
    using tpl::ParamSpec;
    using tpl::Taper;

    // ── 1. Parameters. ────────────────────────────────────────────────────────
    enum Param { Feed, Flow, Clock, Budget, Dish, Cover, Regen, Dry, Wet, kNumParams };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id        name            unit      min   max   default taper          smooth choices                         auto  group    hero
        { "feed",   "Feed",         "",       0.0,  1.0,  1.0,    Taper::Linear, 0.0,   "",                             true, "Mold",  true },
        { "flow",   "Flow speed",   "dish/s", 0.3,  2.5,  0.9,    Taper::Log,    0.0,   "",                             true, "Mold",  true },
        { "clock",  "Clock",        "x",      0.0,  4.0,  1.0,    Taper::Linear, 0.0,   "",                             true, "Dish" },
        { "budget", "Budget",       "",       0.6,  4.0,  2.4,    Taper::Linear, 0.0,   "",                             true, "Dish" },
        { "dish",   "Dish",         "",       0.0,  2.0,  0.0,    Taper::Choice, 0.0,   "Five flakes|Ring|Scatter",     false, "Dish" },
        { "cover",  "Cover again",  "",       0.0,  1.0,  0.0,    Taper::Toggle, 0.0,   "",                             true, "Dish" },
        { "regen",  "Regen",        "",       0.3,  1.5,  1.0,    Taper::Linear, 0.0,   "",                             true, "Echo" },
        { "dry",    "Dry",          "",       0.0,  1.0,  0.3,    Taper::Linear, 20.0,  "",                             true, "Mix" },
        { "wet",    "Wet",          "",       0.0,  1.5,  1.0,    Taper::Linear, 20.0,  "",                             true, "Mix" },
    };

    // ── 2. Audio in and out, and probes. ──────────────────────────────────────
    inline constexpr int kInputs  = 2;
    inline constexpr int kOutputs = 2;
    // lv0..4: each flake's level; tip*: the exploring tips (-1 when none); tubes, used:
    // live tubes and their total length; group: which four tube slots g0..g3 describe now
    // (one group every 128 samples, so the CRT sees every tube about four times a second).
    inline constexpr const char* kProbes[] = {
        "lv0", "lv1", "lv2", "lv3", "lv4",
        "tip0x", "tip0y", "tip1x", "tip1y", "tip2x", "tip2y",
        "tubes", "used", "group",
        "g0ax", "g0ay", "g0bx", "g0by", "g0d", "g0q",
        "g1ax", "g1ay", "g1bx", "g1by", "g1d", "g1q",
        "g2ax", "g2ay", "g2bx", "g2by", "g2d", "g2q",
        "g3ax", "g3ay", "g3bx", "g3by", "g3d", "g3q" };
    inline constexpr int kNumProbes = 38;

    // ── 3. The flow law (slime-mold-flow-dish.html) and the plugin's sizes. ───
    inline constexpr double TICK_HZ = 30.0;
    inline constexpr double K = 2.2, MU = 1.0;
    inline constexpr int TAU = 18, RETRACT = 9;
    inline constexpr double PROBE_RATE = 1.2;
    inline constexpr int PROBE_MAX = 3, PROBE_LIFE = 30;
    inline constexpr double PROBE_STEP = 0.024, R_CAP = 0.06;
    inline constexpr double D0 = 0.18, MID = 0.6, SATED = 0.12;
    inline constexpr double MESH_S = 0.11, MESH_D = 0.3, POW_G = 1.5;
    inline constexpr int MESH_GRACE = 6;
    inline constexpr double MESH_ANNEAL = 8;
    inline constexpr double QEPS = 0.015, LISTEN = 0.5, PULSE_FLOOR = 0.25, EAR = 0.02;
    inline constexpr double G_FWD = 0.95, G_BACK = 0.3;
    inline constexpr double SINK_X = 0.52, SINK_Y = 0.46;

    inline constexpr int NMAX = 80, TMAX = 288;
    inline constexpr int HISTBITS = 17;
    inline constexpr int64_t HIST = (int64_t) 1 << HISTBITS;
    inline constexpr int64_t MASK = HIST - 1;
    inline constexpr int NBANDS = 5;
    inline constexpr double BAND_HZ[NBANDS] = { 120.0, 300.0, 750.0, 1900.0, 4700.0 };
    inline constexpr double BAND_Q = 1.2;
    inline constexpr int FADE_TICKS = 12;
    inline constexpr int GROUP = 4;
    inline constexpr int NGROUPS = TMAX / GROUP;
    inline constexpr double WET_GAIN = 3.0;

    enum Kind { SINK = 0, FOOD = 1, BRANCH = 2 };
    enum TState { FREE = 0, LIVE = 1, FADING = 2 };

    inline constexpr double FIVE[5][2] = { { 0.10, 0.30 }, { 0.18, 0.76 }, { 0.86, 0.22 }, { 0.92, 0.66 }, { 0.55, 0.90 } };

    inline double dist (double ax, double ay, double bx, double by)
    {
        const double dx = ax - bx;
        const double dy = ay - by;
        return std::sqrt (dx * dx + dy * dy);
    }
    inline double sgn (double x) { return x > 0 ? 1.0 : (x < 0 ? -1.0 : 0.0); }

    // mulberry32, as the flow dish uses it
    struct Rng
    {
        uint32_t s = 11;
        double operator()()
        {
            s += 0x6D2B79F5u;
            uint32_t t = (s ^ (s >> 15)) * (1u | s);
            t = (t + ((t ^ (t >> 7)) * (61u | t))) ^ t;
            return (double) (t ^ (t >> 14)) / 4294967296.0;
        }
        double normal()
        {
            const double u = (*this)();
            const double v = (*this)();
            return std::sqrt (-2.0 * std::log (1.0 - u)) * std::cos (2.0 * M_PI * v);
        }
    };

    struct Tip
    {
        int anchor = -1, tube = -1;
        int64_t serial = 0;
        double f = 0, ax = 0, ay = 0, px = 0, py = 0, dx = 0, dy = 0;
        int age = 0;
        int passed[2] { -1, -1 };
        int npassed = 0;
        bool hasPassed (int n) const { for (int i = 0; i < npassed; ++i) if (passed[i] == n) return true; return false; }
    };

    // ── 4. The dish: nodes, tubes and the flow law. ───────────────────────────
    struct DishState
    {
        int layout = -1;
        Rng rng;
        double nx[NMAX] {}, ny[NMAX] {};
        int kind[NMAX] {};
        bool alive[NMAX] {}, mesh[NMAX] {};
        double env[NMAX] {}, fast[NMAX] {};
        int band[NMAX] {};
        int64_t born[NMAX] {};
        double panL[NMAX] {}, panR[NMAX] {};
        int nhigh = 0;
        int ts[TMAX] {}, ta[TMAX] {}, tb[TMAX] {};
        double L[TMAX] {}, D[TMAX] {}, Q[TMAX] {}, w[TMAX] {};
        int starve[TMAX] {}, retract[TMAX] {}, grace[TMAX] {};
        int64_t serial[TMAX] {};
        int fade[TMAX] {};
        int thigh = 0;
        int64_t nserial = 0;
        double g[2 * TMAX] {}, tg[2 * TMAX] {};
        int tick = 0, meshAt = 0;
        double used = 0.0;
        Tip tips[PROBE_MAX];
        int ntips = 0;
        int64_t nowBorn = 0;
        int sink = 0;

        // scratch for one step: sized here, never allocated on the audio thread
        double A[NMAX][NMAX] {};
        double rhs[NMAX] {}, sol[NMAX] {}, I[NMAX] {}, thru[NMAX] {};
        bool comp[NMAX] {}, on[NMAX] {};
        int stack[NMAX] {}, ids[NMAX] {}, idx[NMAX] {}, foods[NMAX] {}, fed[NMAX] {}, ears[NMAX] {};
        int live[NMAX] {}, sounding[NMAX] {}, cand[NMAX] {}, hungry[NMAX] {}, busy[TMAX] {}, allv[NMAX] {};
        double wts[NMAX] {}, bw[TMAX] {};
        double nearD[NMAX] {};
        int nearJ[NMAX] {};

        void clear (int lay, int64_t now)
        {
            layout = lay;
            rng = Rng {};
            for (int n = 0; n < NMAX; ++n)
            {
                nx[n] = 0.0; ny[n] = 0.0; kind[n] = BRANCH; alive[n] = false; mesh[n] = false;
                env[n] = 0.0; fast[n] = 0.0; band[n] = -1; born[n] = 0; panL[n] = 0.0; panR[n] = 0.0;
            }
            nhigh = 0;
            for (int t = 0; t < TMAX; ++t)
            {
                ts[t] = FREE; ta[t] = 0; tb[t] = 0; L[t] = 1.0; D[t] = 0.0; Q[t] = 0.0; w[t] = 1.0;
                starve[t] = 0; retract[t] = -1; grace[t] = -1; serial[t] = 0; fade[t] = 0;
            }
            thigh = 0;
            nserial = 0;
            for (int i = 0; i < 2 * TMAX; ++i) { g[i] = 0.0; tg[i] = 0.0; }
            tick = 0; meshAt = 0; used = 0.0; ntips = 0;
            nowBorn = now;
            sink = addNode (SINK_X, SINK_Y, SINK, false);
            double pts[NBANDS][2] {};
            int np = 0;
            if (lay == 0)
            {
                for (int k = 0; k < NBANDS; ++k)
                {
                    pts[k][0] = 0.5 + (FIVE[k][0] - 0.5) * 0.9;
                    pts[k][1] = 0.5 + (FIVE[k][1] - 0.5) * 0.9;
                }
                np = NBANDS;
            }
            else if (lay == 1)
            {
                for (int k = 0; k < NBANDS; ++k)
                {
                    pts[k][0] = 0.5 + 0.36 * std::cos (-0.5 * M_PI + k * 2.0 * M_PI / NBANDS);
                    pts[k][1] = 0.5 + 0.36 * std::sin (-0.5 * M_PI + k * 2.0 * M_PI / NBANDS);
                }
                np = NBANDS;
            }
            else
            {
                while (np < NBANDS)
                {
                    const double x = 0.12 + 0.76 * rng();
                    const double y = 0.12 + 0.76 * rng();
                    if (dist (x, y, 0.5, 0.5) > 0.38 || dist (x, y, SINK_X, SINK_Y) < 0.15) continue;
                    bool near = false;
                    for (int i = 0; i < np; ++i) if (dist (x, y, pts[i][0], pts[i][1]) < 0.15) near = true;
                    if (near) continue;
                    pts[np][0] = x; pts[np][1] = y; ++np;
                }
            }
            for (int k = 0; k < NBANDS; ++k)
            {
                const int n = addNode (pts[k][0], pts[k][1], FOOD, false);
                band[n] = k;
            }
            seedMesh();
        }

        int addNode (double x, double y, int k, bool m)
        {
            for (int n = 0; n < NMAX; ++n)
            {
                if (alive[n]) continue;
                bool ref = false;
                for (int t = 0; t < thigh; ++t)
                    if (ts[t] != FREE && (ta[t] == n || tb[t] == n)) { ref = true; break; }
                if (ref) continue;
                nx[n] = x; ny[n] = y; kind[n] = k; alive[n] = true; mesh[n] = m;
                env[n] = 0.0; fast[n] = 0.0; band[n] = -1;
                born[n] = nowBorn;
                const double u = 0.5 * x * M_PI;
                panL[n] = std::cos (u); panR[n] = std::sin (u);
                if (n + 1 > nhigh) nhigh = n + 1;
                return n;
            }
            return -1;
        }

        int addTube (int a, int b, double d)
        {
            for (int t = 0; t < TMAX; ++t)
            {
                if (ts[t] != FREE) continue;
                ts[t] = LIVE; ta[t] = a; tb[t] = b;
                L[t] = dist (nx[a], ny[a], nx[b], ny[b]);
                D[t] = d; Q[t] = 0.0; w[t] = 1.0;
                starve[t] = 0; retract[t] = -1; grace[t] = -1;
                nserial += 1; serial[t] = nserial; fade[t] = 0;
                g[2 * t] = 0.0; g[2 * t + 1] = 0.0; tg[2 * t] = 0.0; tg[2 * t + 1] = 0.0;
                if (t + 1 > thigh) thigh = t + 1;
                return t;
            }
            return -1;
        }

        void cut (int t) { ts[t] = FADING; fade[t] = FADE_TICKS; }

        bool hasTube (int a, int b) const
        {
            for (int t = 0; t < thigh; ++t)
                if (ts[t] == LIVE && ((ta[t] == a && tb[t] == b) || (ta[t] == b && tb[t] == a))) return true;
            return false;
        }

        int freeTubeSlots() const
        {
            int c = 0;
            for (int t = 0; t < TMAX; ++t) if (ts[t] == FREE) ++c;
            return c;
        }

        int split (int t, double f)
        {
            if (freeTubeSlots() < 2) return -1;
            const int a = ta[t], b = tb[t];
            const int m = addNode (nx[a] + (nx[b] - nx[a]) * f, ny[a] + (ny[b] - ny[a]) * f, BRANCH, false);
            if (m < 0) return -1;
            const double dd = D[t], qq = Q[t], ww = w[t];
            cut (t);
            const int ends[2][2] = { { a, m }, { m, b } };
            for (const auto& e : ends)
            {
                const int h = addTube (e[0], e[1], dd);
                Q[h] = qq; w[h] = ww;
            }
            return m;
        }

        // start dense, then thin
        void seedMesh()
        {
            int nlive = 0;
            for (int n = 0; n < nhigh; ++n) if (alive[n]) live[nlive++] = n;
            int nall = 0;
            for (int i = 0; i < nlive; ++i) allv[nall++] = live[i];
            const double spacing = MESH_S;
            const double dy = spacing * std::sqrt (3.0) / 2.0;
            int r = 0;
            double y = 0.5 - 0.44;
            bool full = false;
            while (y <= 0.94 && ! full)
            {
                double x = 0.06 + (r % 2 ? spacing / 2.0 : 0.0);
                while (x <= 0.94)
                {
                    if (dist (x, y, 0.5, 0.5) <= 0.43)
                    {
                        bool close = false;
                        for (int i = 0; i < nlive; ++i)
                            if (dist (nx[live[i]], ny[live[i]], x, y) < spacing * 0.45) { close = true; break; }
                        if (! close)
                        {
                            const int p = addNode (x, y, BRANCH, true);
                            if (p < 0) { full = true; break; }
                            allv[nall++] = p;
                        }
                    }
                    x += spacing;
                }
                r += 1;
                y += dy;
            }
            const double reach = spacing * 1.08;
            for (int i = 0; i < nall; ++i)
            {
                const int a = allv[i];
                int nn = 0;
                for (int j = 0; j < nall; ++j)
                {
                    if (j == i) continue;
                    const int b = allv[j];
                    nearD[nn] = dist (nx[a], ny[a], nx[b], ny[b]);
                    nearJ[nn] = j;
                    ++nn;
                }
                // a stable insertion sort by distance, the same order as Python's sorted()
                for (int p = 1; p < nn; ++p)
                {
                    const double dv = nearD[p];
                    const int jv = nearJ[p];
                    int q = p - 1;
                    while (q >= 0 && nearD[q] > dv) { nearD[q + 1] = nearD[q]; nearJ[q + 1] = nearJ[q]; --q; }
                    nearD[q + 1] = dv; nearJ[q + 1] = jv;
                }
                const bool ends = kind[a] == FOOD || kind[a] == SINK;
                for (int k = 0; k < nn; ++k)
                {
                    if (! (nearD[k] <= reach || (ends && k < 3))) continue;
                    const int j = nearJ[k];
                    const int b = allv[j];
                    if (j > i || ! mesh[b])
                        if (b != a && ! hasTube (a, b))
                        {
                            const int t = addTube (a, b, MESH_D);
                            if (t >= 0) grace[t] = tick + MESH_GRACE * (int) TICK_HZ;
                        }
                }
            }
            used = 0.0;
            for (int t = 0; t < thigh; ++t) if (ts[t] == LIVE) used += L[t];
            meshAt = tick;
        }

        void solve (int n)
        {
            for (int c = 0; c < n; ++c)
            {
                int piv = c;
                for (int r = c + 1; r < n; ++r)
                    if (std::abs (A[r][c]) > std::abs (A[piv][c])) piv = r;
                if (piv != c)
                {
                    for (int k = 0; k < n; ++k) std::swap (A[c][k], A[piv][k]);
                    std::swap (rhs[c], rhs[piv]);
                }
                for (int r = c + 1; r < n; ++r)
                {
                    const double f = A[r][c] / A[c][c];
                    if (f == 0.0) continue;
                    for (int k = c; k < n; ++k) A[r][k] -= f * A[c][k];
                    rhs[r] -= f * rhs[c];
                }
            }
            for (int r = n - 1; r >= 0; --r)
            {
                double s = rhs[r];
                for (int k = r + 1; k < n; ++k) s -= A[r][k] * sol[k];
                sol[r] = s / A[r][r];
            }
        }

        // one tick of dish time (1/30 s)
        void step (const double* levels, double hunger, double budget)
        {
            const int N = nhigh;
            const double decay = std::exp (-1.0 / (TICK_HZ * 1.5));
            const double fdecay = std::exp (-1.0 / (TICK_HZ * 0.25));
            for (int n = 0; n < N; ++n)
                if (alive[n] && kind[n] == FOOD)
                {
                    const double lv = levels[band[n]];
                    env[n] = std::max (lv, env[n] * decay);
                    fast[n] = std::max (lv, fast[n] * fdecay);
                }

            // only food the network reaches can push; the listener drains exactly that
            for (int n = 0; n < NMAX; ++n) comp[n] = false;
            comp[sink] = true;
            int sp = 0;
            stack[sp++] = sink;
            while (sp > 0)
            {
                const int u = stack[--sp];
                for (int t = 0; t < thigh; ++t)
                {
                    if (ts[t] != LIVE) continue;
                    if (ta[t] == u && ! comp[tb[t]]) { comp[tb[t]] = true; stack[sp++] = tb[t]; }
                    else if (tb[t] == u && ! comp[ta[t]]) { comp[ta[t]] = true; stack[sp++] = ta[t]; }
                }
            }

            for (int n = 0; n < NMAX; ++n) I[n] = 0.0;
            int nf = 0, nfed = 0;
            for (int n = 0; n < N; ++n) if (alive[n] && kind[n] == FOOD) foods[nf++] = n;
            for (int i = 0; i < nf; ++i) if (comp[foods[i]]) fed[nfed++] = foods[i];
            double tot = 0.0;
            for (int i = 0; i < nf; ++i) tot += PULSE_FLOOR * env[foods[i]] + fast[foods[i]];
            if (tot > 1e-4)
            {
                double drain = 0.0;
                for (int i = 0; i < nfed; ++i)
                {
                    const int n = fed[i];
                    const double v = PULSE_FLOOR * env[n] + fast[n];
                    I[n] = v / tot;
                    drain += v / tot;
                }
                I[sink] = -drain * LISTEN;
                int ne = 0;
                for (int i = 0; i < nfed; ++i) if (env[fed[i]] > EAR) ears[ne++] = fed[i];
                if (ne > 0)
                {
                    for (int i = 0; i < ne; ++i) I[ears[i]] -= drain * (1.0 - LISTEN) / ne;
                }
                else
                    I[sink] = -drain;
            }

            // pressure and flow: Kirchhoff on the live tubes
            int M = 0;
            for (int n = 0; n < NMAX; ++n) idx[n] = -1;
            for (int n = 0; n < N; ++n) if (alive[n]) { idx[n] = M; ids[M++] = n; }
            for (int i = 0; i < M; ++i)
            {
                for (int k = 0; k < M; ++k) A[i][k] = 0.0;
                A[i][i] = 1e-4;
            }
            for (int t = 0; t < thigh; ++t)
            {
                if (ts[t] != LIVE) continue;
                const double c = D[t] / L[t];
                const int a = idx[ta[t]], b = idx[tb[t]];
                A[a][a] += c; A[b][b] += c; A[a][b] -= c; A[b][a] -= c;
            }
            for (int i = 0; i < M; ++i) rhs[i] = I[ids[i]];
            solve (M);

            const double mu = MU * (1.6 - 0.6 * hunger);
            const double age = (tick - meshAt) / (TICK_HZ * MESH_ANNEAL);
            const double gnow = 1.0 + (POW_G - 1.0) * std::min (1.0, age);
            for (int t = 0; t < thigh; ++t)
            {
                if (ts[t] != LIVE) continue;
                const double q = D[t] / L[t] * (sol[idx[ta[t]]] - sol[idx[tb[t]]]);
                Q[t] = q;
                if (std::abs (q) > 1e-4)
                    w[t] += std::max (-0.15, std::min (0.15, sgn (q) - w[t]));
                if (retract[t] < 0)
                {
                    const double grow = std::pow (std::abs (q), gnow);
                    D[t] = std::max (0.0, D[t] + K / TICK_HZ * (grow - mu * D[t]));
                    const bool idle = std::abs (q) < QEPS;
                    starve[t] = (idle && ! (grace[t] > tick)) ? starve[t] + 1 : 0;
                    if (starve[t] >= TAU) retract[t] = RETRACT;
                }
                else if (retract[t] > 0)
                {
                    D[t] *= (double) (retract[t] - 1) / retract[t];
                    retract[t] -= 1;
                }
                else
                    cut (t);
            }
            for (int n = 0; n < NMAX; ++n) on[n] = false;
            on[sink] = true;
            for (int t = 0; t < thigh; ++t)
                if (ts[t] == LIVE) { on[ta[t]] = true; on[tb[t]] = true; }
            for (int n = 0; n < N; ++n)            // a branch point with no tubes left dissolves
                if (alive[n] && kind[n] == BRANCH && ! on[n]) alive[n] = false;
            used = 0.0;
            for (int t = 0; t < thigh; ++t) if (ts[t] == LIVE) used += L[t];

            // tip extension
            int nl = 0, ns = 0;
            for (int n = 0; n < N; ++n) if (alive[n]) live[nl++] = n;
            for (int i = 0; i < nl; ++i) if (kind[live[i]] == FOOD && env[live[i]] > 0.01) sounding[ns++] = live[i];
            int unmetN = 0;
            for (int i = 0; i < ns; ++i) if (! comp[sounding[i]]) ++unmetN;
            const double unmet = (double) unmetN / std::max (1, ns);
            const double satiety = SATED + (1.0 - SATED) * unmet;
            if (ntips < PROBE_MAX && rng() < PROBE_RATE * hunger * satiety / TICK_HZ)
            {
                for (int n = 0; n < NMAX; ++n) thru[n] = 0.0;
                for (int t = 0; t < thigh; ++t)
                    if (ts[t] == LIVE) { thru[ta[t]] += std::abs (Q[t]); thru[tb[t]] += std::abs (Q[t]); }
                int nc = 0;
                for (int n = 0; n < N; ++n) if (on[n] && alive[n]) cand[nc++] = n;
                double tw = 0.0;
                for (int i = 0; i < nc; ++i) { wts[i] = thru[cand[i]] + 0.05; tw += wts[i]; }
                double r = rng() * tw;
                int k = 0;
                while (k < nc - 1)
                {
                    r -= wts[k];
                    if (! (r > 0)) break;
                    ++k;
                }
                Tip pr;
                pr.anchor = cand[k]; pr.ax = nx[cand[k]]; pr.ay = ny[cand[k]];
                int nb = 0;
                for (int t = 0; t < thigh; ++t) if (ts[t] == LIVE && retract[t] < 0) busy[nb++] = t;
                if (nb > 0 && rng() < MID)
                {
                    double s = 0.0;
                    for (int i = 0; i < nb; ++i) { bw[i] = (std::abs (Q[busy[i]]) + 0.05) * L[busy[i]]; s += bw[i]; }
                    double r2 = rng() * s;
                    int j = 0;
                    while (j < nb - 1)
                    {
                        r2 -= bw[j];
                        if (! (r2 > 0)) break;
                        ++j;
                    }
                    const int t = busy[j];
                    const double f = 0.15 + 0.7 * rng();
                    const int a = ta[t], b = tb[t];
                    pr = Tip {};
                    pr.anchor = -1; pr.tube = t; pr.serial = serial[t]; pr.f = f;
                    pr.ax = nx[a] + (nx[b] - nx[a]) * f; pr.ay = ny[a] + (ny[b] - ny[a]) * f;
                    pr.passed[0] = a; pr.passed[1] = b; pr.npassed = 2;
                }
                const double ang = rng() * 2.0 * M_PI;
                pr.px = pr.ax; pr.py = pr.ay; pr.dx = std::cos (ang); pr.dy = std::sin (ang); pr.age = 0;
                tips[ntips++] = pr;
            }
            int keep = 0;
            for (int pi = 0; pi < ntips; ++pi)
            {
                Tip pr = tips[pi];
                int nh = 0;
                for (int i = 0; i < nl; ++i)
                {
                    const int n = live[i];
                    if (kind[n] == FOOD && ! on[n] && env[n] > 0.01) hungry[nh++] = n;
                }
                // a bud with no unfed food to chase still smells the fed food: a shorter second road
                if (nh == 0 && pr.npassed > 0)
                    for (int i = 0; i < ns; ++i) if (! pr.hasPassed (sounding[i])) hungry[nh++] = sounding[i];
                if (nh > 0)                                   // chemotaxis toward sounding food
                {
                    int tg = hungry[0];
                    for (int i = 1; i < nh; ++i)
                    {
                        const int n = hungry[i];
                        if (dist (pr.px, pr.py, nx[n], ny[n]) / (0.2 + env[n] * 8.0)
                            < dist (pr.px, pr.py, nx[tg], ny[tg]) / (0.2 + env[tg] * 8.0))
                            tg = n;
                    }
                    const double vx = nx[tg] - pr.px;
                    const double vy = ny[tg] - pr.py;
                    const double m = std::sqrt (vx * vx + vy * vy) + 1e-9;
                    pr.dx = 0.85 * pr.dx + 0.15 * vx / m;
                    pr.dy = 0.85 * pr.dy + 0.15 * vy / m;
                }
                pr.dx += 0.12 * rng.normal();
                pr.dy += 0.12 * rng.normal();
                const double m = std::sqrt (pr.dx * pr.dx + pr.dy * pr.dy) + 1e-9;
                pr.dx /= m; pr.dy /= m;
                pr.px += pr.dx * PROBE_STEP;
                pr.py += pr.dy * PROBE_STEP;
                const double rx = pr.px - 0.5;
                const double ry = pr.py - 0.5;
                const double rr = std::sqrt (rx * rx + ry * ry);
                if (rr > 0.45)                                // the dish is round: a tip meets the glass and turns back
                {
                    pr.px = 0.5 + rx / rr * 0.45;
                    pr.py = 0.5 + ry / rr * 0.45;
                    const double d = pr.dx * rx / rr + pr.dy * ry / rr;
                    pr.dx = pr.dx - 2.0 * d * rx / rr;
                    pr.dy = pr.dy - 2.0 * d * ry / rr;
                }
                pr.age += 1;
                int hit = -1;
                for (int i = 0; i < nl; ++i)
                {
                    const int n = live[i];
                    if (n != pr.anchor && ! pr.hasPassed (n) && dist (pr.px, pr.py, nx[n], ny[n]) < R_CAP) { hit = n; break; }
                }
                if (hit >= 0)
                {
                    int anchor = pr.anchor;
                    if (anchor < 0)                           // a bud found something: now cut the tube
                    {
                        const int t = pr.tube;
                        if (ts[t] != LIVE || serial[t] != pr.serial || retract[t] >= 0) continue;
                        if (used + dist (pr.ax, pr.ay, nx[hit], ny[hit]) <= budget)
                        {
                            const int mm = split (t, pr.f);
                            if (mm >= 0) anchor = mm;
                        }
                    }
                    if (anchor >= 0 && ! alive[anchor]) continue;   // its anchor dissolved while it was out
                    if (anchor >= 0 && ! hasTube (anchor, hit))
                    {
                        const double dd = dist (nx[anchor], ny[anchor], nx[hit], ny[hit]);
                        if (used + dd <= budget && addTube (anchor, hit, D0) >= 0) used += dd;
                    }
                    continue;
                }
                if (pr.age < PROBE_LIFE) tips[keep++] = pr;
            }
            ntips = keep;
            tick += 1;
        }
    };

    // ── 5. The per-sample machine: bands in, the network, the mix out. ────────
    struct Algorithm
    {
        double sr = 44100.0;
        double probes[kNumProbes] {};

        DishState* dish = nullptr;
        std::vector<DishState> dishStore;
        std::vector<float> hist;          // NMAX histories of HIST samples each
        double svf[NBANDS][4] {};
        double ae = 0, cg = 0, cv = 0;

        int64_t now = 0;
        double ic1[NBANDS] {}, ic2[NBANDS] {}, bandv[NBANDS] {}, e[NBANDS] {};
        double tickAcc = 0, clockAcc = 0, vs = 0.9, coverWas = 0;
        double nin[NMAX] {}, inj[NMAX] {}, levels[NBANDS] {};

        // the lines, rebuilt at every tick in slot order
        int nlines = 0;
        int lsrc[2 * TMAX] {}, ldst[2 * TMAX] {}, lgi[2 * TMAX] {};
        double lL[2 * TMAX] {}, lpanL[2 * TMAX] {}, lpanR[2 * TMAX] {};
        int64_t lborn[2 * TMAX] {};
        bool lsink[2 * TMAX] {};
        int nfood = 0;
        int foodN[NBANDS] {}, foodK[NBANDS] {};
        double amp[TMAX] {}, outs[NMAX] {}, tots[NMAX] {};

        void prepare (double sampleRate)
        {
            sr = sampleRate;
            dishStore.assign (1, DishState {});
            dish = dishStore.data();
            hist.assign ((size_t) NMAX * (size_t) HIST, 0.0f);
            for (int k = 0; k < NBANDS; ++k)
            {
                const double g = std::tan (M_PI * BAND_HZ[k] / sr);
                const double kq = 1.0 / BAND_Q;
                const double a1 = 1.0 / (1.0 + g * (g + kq));
                const double a2 = g * a1;
                const double a3 = g * a2;
                svf[k][0] = kq; svf[k][1] = a1; svf[k][2] = a2; svf[k][3] = a3;
            }
            ae = 1.0 - std::exp (-1.0 / (0.023 * sr));
            cg = 1.0 - std::exp (-1.0 / (sr / TICK_HZ));
            cv = 1.0 - std::exp (-1.0 / (0.6 * sr));
        }

        void reset (const double* v)
        {
            now = 0;
            for (int k = 0; k < NBANDS; ++k) { ic1[k] = 0; ic2[k] = 0; bandv[k] = 0; e[k] = 0; }
            tickAcc = 0.0; clockAcc = 0.0;
            vs = v[Flow];
            coverWas = v[Cover];
            dish->clear ((int) v[Dish], 0);
            sync (v);
            for (auto& p : probes) p = 0.0;
        }

        void onTick (const double* v)
        {
            auto& d = *dish;
            for (int t = 0; t < d.thigh; ++t)
                if (d.ts[t] == FADING)
                {
                    d.fade[t] -= 1;
                    if (d.fade[t] <= 0) { d.ts[t] = FREE; d.g[2 * t] = 0.0; d.g[2 * t + 1] = 0.0; }
                }
            if (v[Cover] >= 0.5 && coverWas < 0.5)
            {
                d.nowBorn = now;
                d.seedMesh();
            }
            coverWas = v[Cover];
            clockAcc += v[Clock];
            for (int k = 0; k < NBANDS; ++k) levels[k] = std::sqrt (e[k]);
            d.nowBorn = now;
            while (clockAcc >= 1.0)
            {
                d.step (levels, v[Feed], v[Budget]);
                clockAcc -= 1.0;
            }
            sync (v);
        }

        // sound leaves a junction split the way the flow splits there
        void sync (const double* v)
        {
            auto& d = *dish;
            for (int t = 0; t < TMAX; ++t) amp[t] = 0.0;
            for (int n = 0; n < NMAX; ++n) { outs[n] = 0.0; tots[n] = 0.0; }
            for (int t = 0; t < d.thigh; ++t)
                if (d.ts[t] == LIVE)
                {
                    amp[t] = std::pow (d.D[t], 1.0 / POW_G);
                    const int a = d.ta[t], b = d.tb[t];
                    tots[a] += amp[t]; tots[b] += amp[t];
                    if (d.w[t] >= 0.0) outs[a] += amp[t];
                    else outs[b] += amp[t];
                }
            nlines = 0;
            for (int t = 0; t < d.thigh; ++t)
            {
                if (d.ts[t] == FREE) continue;
                const int a = d.ta[t], b = d.tb[t];
                if (d.ts[t] == LIVE)
                {
                    const double fa = outs[a] > 0.0 ? amp[t] / outs[a] : 0.0;
                    const double fb = outs[b] > 0.0 ? amp[t] / outs[b] : 0.0;
                    const double ka = tots[a] > 0.0 ? amp[t] / tots[a] : 0.0;
                    const double kb = tots[b] > 0.0 ? amp[t] / tots[b] : 0.0;
                    const double gab = G_BACK * ka + (G_FWD * fa - G_BACK * ka) * (1.0 + d.w[t]) / 2.0;
                    const double gba = G_BACK * kb + (G_FWD * fb - G_BACK * kb) * (1.0 - d.w[t]) / 2.0;
                    d.tg[2 * t] = std::min (1.0, gab) * v[Regen];
                    d.tg[2 * t + 1] = std::min (1.0, gba) * v[Regen];
                }
                else
                {
                    d.tg[2 * t] = 0.0; d.tg[2 * t + 1] = 0.0;
                }
                if (a != d.sink) addLine (a, b, 2 * t, d.L[t]);
                if (b != d.sink) addLine (b, a, 2 * t + 1, d.L[t]);
            }
            nfood = 0;
            for (int n = 0; n < d.nhigh; ++n)
                if (d.alive[n] && d.kind[n] == FOOD && nfood < NBANDS) { foodN[nfood] = n; foodK[nfood] = d.band[n]; ++nfood; }
        }

        void addLine (int s, int t, int gi, double len)
        {
            auto& d = *dish;
            lsrc[nlines] = s; ldst[nlines] = t; lgi[nlines] = gi; lL[nlines] = len;
            lsink[nlines] = t == d.sink;
            lborn[nlines] = d.born[s];
            lpanL[nlines] = d.panL[s]; lpanR[nlines] = d.panR[s];
            ++nlines;
        }

        void step (const double* v, const float* in, float* out)
        {
            auto& d = *dish;
            if ((int) v[Dish] != d.layout)
            {
                d.clear ((int) v[Dish], now);
                sync (v);
            }
            const double xl = in[0], xr = in[1];
            const double x = 0.5 * (xl + xr);
            for (int k = 0; k < NBANDS; ++k)
            {
                const double kq = svf[k][0], a1 = svf[k][1], a2 = svf[k][2], a3 = svf[k][3];
                const double v3 = x - ic2[k];
                const double v1 = a1 * ic1[k] + a2 * v3;
                const double v2 = ic2[k] + a2 * ic1[k] + a3 * v3;
                ic1[k] = 2.0 * v1 - ic1[k];
                ic2[k] = 2.0 * v2 - ic2[k];
                const double bnd = kq * v1;
                bandv[k] = bnd;
                e[k] += ae * (bnd * bnd - e[k]);
            }
            tickAcc += TICK_HZ / sr;
            if (tickAcc >= 1.0)
            {
                tickAcc -= 1.0;
                onTick (v);
            }
            vs += (v[Flow] - vs) * cv;

            // the network: every line reads its source node's history at its tube's delay
            for (int n = 0; n < NMAX; ++n) { nin[n] = 0.0; inj[n] = 0.0; }
            for (int i = 0; i < nfood; ++i) inj[foodN[i]] = bandv[foodK[i]];
            double wl = 0.0, wr = 0.0;
            const double nowd = (double) now;
            for (int l = 0; l < nlines; ++l)
            {
                const int gi = lgi[l];
                d.g[gi] += (d.tg[gi] - d.g[gi]) * cg;
                double dl = lL[l] / vs * sr;
                dl = std::min (std::max (dl, 0.05 * sr), (double) HIST - 4.0);
                const double pos = nowd - dl;
                const double i0f = std::floor (pos);
                const double fr = pos - i0f;
                const int64_t i0 = (int64_t) i0f;
                double y = 0.0;
                if (! (i0 < lborn[l]))
                {
                    const float* h = hist.data() + (size_t) lsrc[l] * (size_t) HIST;
                    const double h0 = (double) h[i0 & MASK];
                    const double h1 = (double) h[(i0 + 1) & MASK];
                    y = h0 + fr * (h1 - h0);
                }
                const double val = y * d.g[gi];
                if (lsink[l]) { wl += val * lpanL[l]; wr += val * lpanR[l]; }
                else nin[ldst[l]] += val;
            }
            const int64_t wpos = now & MASK;
            for (int n = 0; n < d.nhigh; ++n)
            {
                if (n == d.sink) continue;
                hist[(size_t) n * (size_t) HIST + (size_t) wpos] = (float) std::tanh (inj[n] + nin[n]);
            }
            const double wetL = std::tanh (WET_GAIN * wl) * 0.8;
            const double wetR = std::tanh (WET_GAIN * wr) * 0.8;
            out[0] = (float) (v[Dry] * xl + v[Wet] * wetL);
            out[1] = (float) (v[Dry] * xr + v[Wet] * wetR);
            writeProbes();
            now += 1;
        }

        void writeProbes()
        {
            auto& d = *dish;
            for (int n = 0; n < d.nhigh; ++n)
                if (d.alive[n] && d.kind[n] == FOOD) probes[d.band[n]] = d.env[n];
            int j = NBANDS;
            for (int i = 0; i < PROBE_MAX; ++i)
            {
                if (i < d.ntips) { probes[j] = d.tips[i].px; probes[j + 1] = d.tips[i].py; }
                else { probes[j] = -1.0; probes[j + 1] = -1.0; }
                j += 2;
            }
            int liveN = 0;
            for (int t = 0; t < d.thigh; ++t) if (d.ts[t] == LIVE) ++liveN;
            probes[j] = liveN; probes[j + 1] = d.used;
            const int grp = (int) ((now >> 7) % NGROUPS);
            probes[j + 2] = grp;
            j += 3;
            for (int s = 0; s < GROUP; ++s)
            {
                const int t = grp * GROUP + s;
                if (d.ts[t] == LIVE)
                {
                    const int a = d.ta[t], b = d.tb[t];
                    probes[j] = d.nx[a]; probes[j + 1] = d.ny[a]; probes[j + 2] = d.nx[b]; probes[j + 3] = d.ny[b];
                    probes[j + 4] = d.D[t]; probes[j + 5] = d.Q[t];
                }
                else
                {
                    probes[j] = 0.0; probes[j + 1] = 0.0; probes[j + 2] = 0.0; probes[j + 3] = 0.0;
                    probes[j + 4] = -1.0; probes[j + 5] = 0.0;
                }
                j += 6;
            }
        }
    };
}
