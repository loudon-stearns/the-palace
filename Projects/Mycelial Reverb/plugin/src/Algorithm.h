// Algorithm.h — the Mycelial Reverb's engine in C++, with no JUCE in it.
//
// A hand port, line for line, of the <script id="mycel-engine"> block in the piece
// ("Biomechanical Synthesis — rich — mycelial reverb.html"). That JavaScript is the
// reference; check/gate.mjs runs both on the piece's own check cases and prints the
// largest difference.
//
//   MycelNet     the sound: a digital waveguide network. Every thread is a pair of delay
//                lines, one each way, each with a one-pole lowpass and a loss in
//                proportion to its length. Every meeting of threads is a junction that
//                shares out what arrives and never adds any: out = 2u(u·in) − in,
//                u = √y / √Σy, a Householder reflection. A tip gives back `tip` of what
//                reaches it. No allpass filters anywhere.
//   MycelColony  the growth: tips extend, branch and fuse; a frost kills dead ends;
//                fruiting bodies are stereo taps. Fed the energy in every thread once
//                per 512 samples.
//   Dish         the two together, as the plugin runs them: the colony is fed from
//                inside process(), so it grows wherever the sound is being made.
//
// Kept the same as the JavaScript on purpose, so the two can be compared number for
// number: the delay lines, the outputs, the taps and the per-thread energy are float32
// (the page's Float32Array); everything else is double. Compile with -ffp-contract=off,
// or the compiler fuses a*b+c and the rounding parts from the reference.
//
// Nothing here allocates after prepare(); every list has a fixed size.
#pragma once

#include "ParamSpec.h"   // VST Template/machinery/src: one row of the parameter table

#include <array>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

namespace algo
{
inline constexpr int kMaxSegs  = 170;             // the page's MAXS: a full dish
inline constexpr int kMaxNodes = kMaxSegs + 16;
inline constexpr int kChunk    = 32;              // no line is shorter, so a chunk never reads what it wrote
inline constexpr int kBlock    = 512;             // the colony is fed once per this many samples
inline constexpr double kDishW = 1000.0, kDishH = 600.0;

inline constexpr int kInputs = 2, kOutputs = 2;

// The host's parameters. Ids are stable forever: a host saves automation by them.
inline constexpr tpl::ParamSpec kParams[] = {
    { "carry",   "Carry",        "s",  0.2,   12.0, 3.0,  tpl::Taper::Log,    0.0,  "", true, "Soil",   true  },
    { "wetness", "Soil wetness", "",   0.0,   0.9,  0.25, tpl::Taper::Linear, 0.0,  "", true, "Soil",   true  },
    { "dry",     "Dry level",    "",   0.0,   1.0,  0.6,  tpl::Taper::Linear, 20.0, "", true, "Output", false },
    { "level",   "Dish level",   "dB", -24.0, 12.0, 0.0,  tpl::Taper::Linear, 20.0, "", true, "Output", false },
    { "hold",    "Hold it still", "",  0.0,   1.0,  0.0,  tpl::Taper::Toggle, 0.0,  "", true, "Growth", false },
};
inline constexpr int kNumParams = (int) (sizeof (kParams) / sizeof (kParams[0]));
enum { pCarry = 0, pWetness, pDry, pLevel, pHold };

// ── MycelNet ────────────────────────────────────────────────────────────────
struct MycelNet
{
    static constexpr int M = kMaxSegs, MN = kMaxNodes, CH = kChunk;

    double sr = 48000.0;
    int slot = 0;
    std::array<int32_t, M> segA {}, segB {}, len {}, pos {};
    std::array<uint8_t, M> alive {};
    std::array<double, M> y {}, w {}, g {};
    std::vector<float> pool;
    std::array<double, 2 * M> lp {};
    std::array<double, 2 * M * CH> inB {};
    std::array<double, CH> acc {}, kkA {};
    std::array<float, M> en {};
    std::array<float, MN> tapL {}, tapR {};
    int inNode = 0;
    double rt = 3.0, damp = 0.25, tip = 0.8;
    std::array<int32_t, M> list {};
    int ns = 0;
    std::array<int32_t, MN> nodes {};
    std::array<int32_t, MN + 1> off {};
    std::array<int32_t, 2 * M> half {};
    std::array<double, MN> invY {}, rootY {};
    int nn = 0;
    std::array<double, 2 * M> qW {};
    std::array<int32_t, 2 * M> qOut {}, qSeg {};
    // plan()'s scratch (the JavaScript allocates these each time)
    std::array<int32_t, MN> deg {}, where {}, fill {};
    std::array<double, MN> sumY {};

    // The JavaScript constructor. Allocates the delay memory; call off the audio thread.
    void prepare (double sampleRate)
    {
        sr = sampleRate;
        slot = (int) std::ceil (0.35 * 300 * sr / 1000) + 8;
        pool.assign ((size_t) 2 * M * (size_t) slot, 0.0f);
        segA.fill (0); segB.fill (0); len.fill (0); pos.fill (0); alive.fill (0);
        y.fill (0); w.fill (0); g.fill (0); lp.fill (0); inB.fill (0); acc.fill (0); kkA.fill (0);
        en.fill (0); tapL.fill (0); tapR.fill (0);
        inNode = 0; rt = 3.0; damp = 0.25; tip = 0.8;
        ns = 0; nn = 0;
    }

    double lineGain (int L) const { return std::pow (10.0, -3.0 * L / (rt * sr)); }

    void plan()
    {
        int s, n, nsl = 0;
        deg.fill (0);
        for (s = 0; s < M; s++) if (alive[(size_t) s]) { list[(size_t) nsl++] = s; deg[(size_t) segA[(size_t) s]]++; deg[(size_t) segB[(size_t) s]]++; }
        ns = nsl;
        int nnl = 0, o = 0;
        where.fill (-1);
        for (n = 0; n < MN; n++) if (deg[(size_t) n]) { where[(size_t) n] = nnl; nodes[(size_t) nnl] = n; off[(size_t) nnl] = o; o += deg[(size_t) n]; nnl++; }
        off[(size_t) nnl] = o; nn = nnl;
        int j, k;
        for (k = 0; k < nnl; k++) { fill[(size_t) k] = 0; sumY[(size_t) k] = 0.0; }
        for (j = 0; j < nsl; j++)
        {
            s = list[(size_t) j];
            k = where[(size_t) segB[(size_t) s]]; half[(size_t) (off[(size_t) k] + fill[(size_t) k]++)] = 2 * s;       // travels A→B, arrives at B
            sumY[(size_t) k] += y[(size_t) s];
            k = where[(size_t) segA[(size_t) s]]; half[(size_t) (off[(size_t) k] + fill[(size_t) k]++)] = 2 * s + 1;   // travels B→A, arrives at A
            sumY[(size_t) k] += y[(size_t) s];
        }
        for (k = 0; k < nnl; k++) { invY[(size_t) k] = 1 / sumY[(size_t) k]; rootY[(size_t) k] = std::sqrt (1 / sumY[(size_t) k]); }
        int q, h;
        for (q = 0; q < o; q++) { h = half[(size_t) q]; qW[(size_t) q] = w[(size_t) (h >> 1)]; qSeg[(size_t) q] = h >> 1; qOut[(size_t) q] = (h ^ 1) * slot; }   // what leaves goes back down the same thread, the other way
    }

    // The messages of the JavaScript's msg(), one method each.
    void add (int s, int a, int b, int L)
    {
        segA[(size_t) s] = a; segB[(size_t) s] = b; pos[(size_t) s] = 0; alive[(size_t) s] = 1;
        y[(size_t) s] = 1; w[(size_t) s] = 1;
        if (L > slot) L = slot;
        if (L < 32) L = 32;
        len[(size_t) s] = L; g[(size_t) s] = lineGain (L);
        std::fill (pool.begin() + (ptrdiff_t) ((size_t) (2 * s) * (size_t) slot), pool.begin() + (ptrdiff_t) ((size_t) (2 * s + 2) * (size_t) slot), 0.0f);   // a new hypha is born silent
        lp[(size_t) (2 * s)] = 0; lp[(size_t) (2 * s + 1)] = 0; plan();
    }
    void del (int s) { alive[(size_t) s] = 0; en[(size_t) s] = 0; plan(); }
    void ys (const double* pairs, int count)   // count numbers: thread, thickness, thread, thickness ...
    {
        for (int i = 0; i < count; i += 2) { const int s = (int) pairs[i]; if (alive[(size_t) s]) { y[(size_t) s] = pairs[i + 1]; w[(size_t) s] = std::sqrt (y[(size_t) s]); } }
        plan();
    }
    void setIn (int n) { inNode = n; }
    struct Tap { int n; double l, r; };
    void taps (const Tap* t, int count)
    {
        tapL.fill (0); tapR.fill (0);
        for (int i = 0; i < count; i++) { tapL[(size_t) t[i].n] = (float) t[i].l; tapR[(size_t) t[i].n] = (float) t[i].r; }
    }
    void par (double newRt, double newDamp, double newTip)
    {
        rt = std::min (12.0, std::max (0.2, newRt));
        damp = std::min (0.9, std::max (0.0, newDamp));
        tip = std::min (1.0, std::max (0.0, newTip));
        for (int s = 0; s < M; s++) if (alive[(size_t) s]) g[(size_t) s] = lineGain (len[(size_t) s]);
    }
    void reset()
    {
        alive.fill (0); en.fill (0); tapL.fill (0); tapR.fill (0); inNode = 0;
        plan();
    }

    // x: mono in (or nullptr). oL, oR: out. Reads every line, then scatters at every junction, then steps.
    void process (const float* x, float* oL, float* oR, int N)
    {
        const bool hasX = x != nullptr;
        const double d = damp, omd = 1 - d, tp = tip;
        const int slotL = slot, inN = inNode;
        float* const pl = pool.data();
        int i, j, k, q, s, p, h, L, B, o = 0, st, end, n;
        size_t base, ib;
        double f, v, e, ws, gs, iy, ry, tl, tr;
        for (i = 0; i < N; i++) { oL[i] = 0; oR[i] = 0; }
        while (o < N)
        {
            B = N - o; if (B > CH) B = CH;
            for (j = 0; j < ns; j++)
            {
                s = list[(size_t) j]; L = len[(size_t) s]; gs = g[(size_t) s]; e = 0;
                for (int c = 0; c < 2; c++)
                {
                    h = 2 * s + c; base = (size_t) h * (size_t) slotL; p = pos[(size_t) s]; f = lp[(size_t) h]; ib = (size_t) h * CH;
                    for (i = 0; i < B; i++) { f = omd * (double) pl[base + (size_t) p] + d * f; if (f < 1e-18 && f > -1e-18) f = 0; v = gs * f; inB[ib + (size_t) i] = v; e += v * v; if (++p == L) p = 0; }
                    lp[(size_t) h] = f;
                }
                en[(size_t) s] = (float) ((double) en[(size_t) s] + e);
            }
            for (k = 0; k < nn; k++)
            {
                n = nodes[(size_t) k]; st = off[(size_t) k]; end = off[(size_t) k + 1];
                if (end - st == 1)
                {                                           // a tip: the pulse turns round, and the tip keeps some
                    ib = (size_t) half[(size_t) st] * CH; base = (size_t) qOut[(size_t) st]; s = qSeg[(size_t) st]; p = pos[(size_t) s]; L = len[(size_t) s];
                    if (n == inN && hasX) for (i = 0; i < B; i++) { v = inB[ib + (size_t) i]; acc[(size_t) i] = v; pl[base + (size_t) p] = (float) (tp * v + (double) x[o + i]); if (++p == L) p = 0; }
                    else for (i = 0; i < B; i++) { v = inB[ib + (size_t) i]; acc[(size_t) i] = v; pl[base + (size_t) p] = (float) (tp * v); if (++p == L) p = 0; }
                }
                else
                {                                           // a junction: out = 2u(u·in) − in
                    for (i = 0; i < B; i++) acc[(size_t) i] = 0;
                    for (q = st; q < end; q++) { ws = qW[(size_t) q]; ib = (size_t) half[(size_t) q] * CH; for (i = 0; i < B; i++) acc[(size_t) i] += ws * inB[ib + (size_t) i]; }
                    iy = 2 * invY[(size_t) k]; ry = rootY[(size_t) k];
                    if (n == inN && hasX) for (i = 0; i < B; i++) kkA[(size_t) i] = acc[(size_t) i] * iy + (double) x[o + i] * ry;
                    else for (i = 0; i < B; i++) kkA[(size_t) i] = acc[(size_t) i] * iy;
                    for (q = st; q < end; q++)
                    {
                        ws = qW[(size_t) q]; ib = (size_t) half[(size_t) q] * CH; base = (size_t) qOut[(size_t) q]; s = qSeg[(size_t) q]; p = pos[(size_t) s]; L = len[(size_t) s];
                        for (i = 0; i < B; i++) { pl[base + (size_t) p] = (float) (kkA[(size_t) i] * ws - inB[ib + (size_t) i]); if (++p == L) p = 0; }
                    }
                    for (i = 0; i < B; i++) acc[(size_t) i] *= ry;
                }
                tl = (double) tapL[(size_t) n]; tr = (double) tapR[(size_t) n];
                if (tl != 0 || tr != 0) for (i = 0; i < B; i++) { oL[o + i] = (float) ((double) oL[o + i] + acc[(size_t) i] * tl); oR[o + i] = (float) ((double) oR[o + i] + acc[(size_t) i] * tr); }
            }
            for (j = 0; j < ns; j++) { s = list[(size_t) j]; p = pos[(size_t) s] + B; L = len[(size_t) s]; pos[(size_t) s] = p >= L ? p - L : p; }
            o += B;
        }
    }

    // Everything the network holds, as energy: the lines, and what each damping filter is keeping back.
    double stored() const
    {
        double E = 0; const double c = damp / (1 - damp);
        for (int j = 0; j < ns; j++)
        {
            const int s = list[(size_t) j];
            for (int h = 2 * s; h < 2 * s + 2; h++)
            {
                const size_t b = (size_t) h * (size_t) slot;
                for (int i = 0; i < len[(size_t) s]; i++) E += (double) pool[b + (size_t) i] * (double) pool[b + (size_t) i];
                E += c * lp[(size_t) h] * lp[(size_t) h];
            }
        }
        return E;
    }
};

// The JavaScript's mycelRng (mulberry32), bit for bit.
struct MycelRng
{
    uint32_t a = 1;
    double operator()()
    {
        a += 0x6D2B79F5u;
        uint32_t t = (a ^ (a >> 15)) * (1u | a);
        t = (t + ((t ^ (t >> 7)) * (61u | t))) ^ t;
        return (double) (t ^ (t >> 14)) / 4294967296.0;
    }
};

// ── MycelColony ─────────────────────────────────────────────────────────────
// Plain data all the way down (no pointers but `net`), so a whole colony copies with
// one assignment: that copy is what the editor draws and what the host saves.
struct MycelColony
{
    enum Preset { None = 0, Thread, Fork, Loop };
    struct Node { double x = 0, y = 0, ang = 0, credit = 0; bool used = false, tip = false, dormant = false; int16_t nsegs = 0; std::array<int16_t, kMaxSegs> segs {}; };
    struct Seg { int32_t a = 0, b = 0, L = 0; double px = 0, y = 1, e = 0, born = 0, sent = 0; bool used = false, hasSent = false; };
    struct Fruit { int32_t n = 0; double born = 0; };
    struct Event { int32_t k = 0, n = 0; double t = 0; };   // k: 0 a fusion, 1 a fruiting body
    static constexpr int kMaxFruit = 5, kEvents = 16;

    MycelNet* net = nullptr;      // where the messages go; may be null (a copy for drawing or saving)
    double sr = 48000.0;
    int maxSegs = kMaxSegs, block = kBlock;
    double msPerPx = 0.35;
    MycelRng rng;
    uint32_t seed = 1;
    double W = kDishW, H = kDishH, time = 0;
    std::array<Node, kMaxNodes> nodes {};
    int nNodes = 0;                               // the JavaScript's nodes.length
    std::array<Seg, kMaxSegs> segs {};
    int nSegs = 0;                                // the JavaScript's segs.length
    std::array<int16_t, kMaxSegs> freeS {}; int nFreeS = 0;
    std::array<int16_t, kMaxNodes> freeN {}; int nFreeN = 0;
    int nseg = 0;
    std::array<Fruit, kMaxFruit> fruit {}; int nFruit = 0;
    int inNode = 0;
    bool hold = false;
    int preset = None;
    double latCredit = 0, tThick = 0, tFruit = 0, lastFruit = -9, emax = 0;
    std::array<Event, kEvents> events {};         // the last few, for the editor's rings
    uint32_t eventCount = 0;

    void pushEvent (int k, int n) { events[eventCount % kEvents] = { k, n, time }; eventCount++; }

    void reset (uint32_t newSeed, double w, double h, int pre = None, double arg = 0)
    {
        rng.a = newSeed; seed = newSeed; W = w; H = h; time = 0;
        for (auto& n : nodes) n.used = false;
        for (auto& s : segs) s.used = false;
        nNodes = 0; nSegs = 0; nFreeS = 0; nFreeN = 0; nseg = 0;
        nFruit = 0; inNode = 0; hold = pre != None; preset = pre;
        latCredit = 0; tThick = 0; tFruit = 0; lastFruit = -9; emax = 0; eventCount = 0;
        if (net) net->reset();
        const double cx = W / 2, cy = H / 2;
        int n;
        if (pre == None)
        {
            newNode (cx, cy);
            const double a0 = rng() * 6.283;
            for (int i = 0; i < 3; i++)
            {
                const double a = a0 + i * 2.094 + (rng() - 0.5) * 0.6;
                n = newNode (cx + std::cos (a) * 26, cy + std::sin (a) * 26); nodes[(size_t) n].tip = true; nodes[(size_t) n].ang = a; nodes[(size_t) n].credit = 0.5; addSeg (0, n);
            }
        }
        else if (pre == Thread)
        {
            const double px = arg != 0 ? arg : 286; newNode (cx - px / 2, cy); n = newNode (cx + px / 2, cy); addSeg (0, n);
        }
        else if (pre == Fork)
        {
            newNode (cx - 230, cy); const int jn = newNode (cx - 30, cy); addSeg (0, jn);
            n = newNode (cx + 150, cy - 110); addSeg (jn, n); n = newNode (cx + 250, cy + 120); addSeg (jn, n);
        }
        else if (pre == Loop)
        {
            newNode (cx - 230, cy); const int j1 = newNode (cx - 60, cy); addSeg (0, j1);
            const int j2 = newNode (cx + 110, cy - 120), j3 = newNode (cx + 190, cy + 90);
            addSeg (j1, j2); addSeg (j2, j3); addSeg (j3, j1);
        }
        if (net) net->setIn (0);
        sendTaps();
    }
    int newNode (double x, double y)
    {
        const int id = nFreeN ? freeN[(size_t) --nFreeN] : nNodes++;
        Node& n = nodes[(size_t) id];
        n.x = x; n.y = y; n.nsegs = 0; n.tip = false; n.ang = 0; n.credit = 0; n.dormant = false; n.used = true;
        return id;
    }
    int addSeg (int a, int b)
    {
        Node& A = nodes[(size_t) a]; Node& B = nodes[(size_t) b];
        const double px = std::hypot (A.x - B.x, A.y - B.y);
        const int id = nFreeS ? freeS[(size_t) --nFreeS] : nSegs++;
        const int L = (int) std::max (32.0, std::floor (px * msPerPx * sr / 1000 + 0.5));
        Seg& s = segs[(size_t) id];
        s.a = a; s.b = b; s.px = px; s.L = L; s.y = 1; s.e = 0; s.born = time; s.sent = 0; s.hasSent = false; s.used = true;
        A.segs[(size_t) A.nsegs++] = (int16_t) id; B.segs[(size_t) B.nsegs++] = (int16_t) id; nseg++;
        if (net) net->add (id, a, b, L);
        return id;
    }
    static void dropSeg (Node& n, int id)
    {
        int at = 0; while (at < n.nsegs && n.segs[(size_t) at] != id) at++;
        for (int i = at; i + 1 < n.nsegs; i++) n.segs[(size_t) i] = n.segs[(size_t) i + 1];
        if (at < n.nsegs) n.nsegs--;
    }
    void delSeg (int id)
    {
        Seg& s = segs[(size_t) id];
        dropSeg (nodes[(size_t) s.a], id); dropSeg (nodes[(size_t) s.b], id);
        s.used = false; freeS[(size_t) nFreeS++] = (int16_t) id; nseg--;
        if (net) net->del (id);
    }
    int other (int sid, int n) const { const Seg& s = segs[(size_t) sid]; return s.a == n ? s.b : s.a; }
    bool joined (int a, int b) const
    {
        const Node& A = nodes[(size_t) a];
        for (int i = 0; i < A.nsegs; i++) if (other (A.segs[(size_t) i], a) == b) return true;
        return false;
    }
    struct Counts { int threads, joins, loops, tips, ends, fruit; };
    Counts counts() const
    {
        int v = 0, tips = 0, ends = 0;
        for (int i = 0; i < nNodes; i++) { const Node& n = nodes[(size_t) i]; if (n.used && n.nsegs) { v++; if (n.nsegs == 1) { ends++; if (n.tip && ! n.dormant) tips++; } } }
        return { nseg, v, nseg - v + 1, tips, ends, nFruit };
    }
    // One hypha tries to grow from `from` at angle `ang`. It may fuse into the network instead (anastomosis).
    // Returns the new tip's node, −2 if it fused, −1 if it found no room.
    int extend (int from, double ang)
    {
        const Node& F = nodes[(size_t) from];
        const double len = 16 + rng() * 22, m = 14;
        double a = 0, tx = 0, ty = 0; bool ok = false;
        const double sign = rng() < 0.5 ? -1 : 1;
        for (int k = 0; k < 4 && ! ok; k++)
        {
            a = ang + (rng() - 0.5) * 0.7 + k * 0.9 * sign; tx = F.x + std::cos (a) * len; ty = F.y + std::sin (a) * len;
            ok = tx > m && tx < W - m && ty > m && ty < H - m;
        }
        if (! ok) return -1;
        int i, best = -1; double bd = 20 * 20, dd;
        for (i = 0; i < nNodes; i++)
        {
            const Node& n = nodes[(size_t) i]; if (! n.used || i == from || ! n.nsegs || joined (from, i)) continue;
            dd = (n.x - tx) * (n.x - tx) + (n.y - ty) * (n.y - ty); if (dd < bd) { bd = dd; best = i; }
        }
        if (best < 0)
        {                                                   // does the new thread cross an old one? then it fuses there
            double bt = 2, den, t, u; int c;
            for (i = 0; i < nSegs; i++)
            {
                const Seg& s = segs[(size_t) i]; if (! s.used || s.a == from || s.b == from) continue;
                const Node& P = nodes[(size_t) s.a]; const Node& Q = nodes[(size_t) s.b];
                den = (tx - F.x) * (Q.y - P.y) - (ty - F.y) * (Q.x - P.x); if (std::fabs (den) < 1e-9) continue;
                t = ((P.x - F.x) * (Q.y - P.y) - (P.y - F.y) * (Q.x - P.x)) / den;
                u = ((P.x - F.x) * (ty - F.y) - (P.y - F.y) * (tx - F.x)) / den;
                if (t > 0 && t < 1 && u > 0 && u < 1 && t < bt)
                {
                    c = u < 0.5 ? s.a : s.b; if (joined (from, c)) c = u < 0.5 ? s.b : s.a;
                    if (! joined (from, c) && c != from) { bt = t; best = c; } else { bt = t; best = -2; }
                }
            }
            if (best == -2) return -1;
        }
        if (best >= 0) { addSeg (from, best); nodes[(size_t) best].tip = false; pushEvent (0, best); return -2; }
        if (nNodes >= kMaxNodes && nFreeN == 0) return -1;   // cannot happen below a full dish; a guard, not a rule
        const int n = newNode (tx, ty); nodes[(size_t) n].tip = true; nodes[(size_t) n].ang = a; addSeg (from, n); return n;
    }
    static double drive (double e) { const double v = (std::log (e + 1e-14) / 2.302585 + 8) / 5.5; return v < 0 ? 0 : v > 1 ? 1 : v; }

    // Called once per block of sound, with the energy that block left in every hypha.
    void feed (const float* en)
    {
        const double dt = (double) block / sr, norm = 1.0 / (2 * block);
        double em = 0; int i;
        time += dt;
        for (i = 0; i < nSegs; i++) { Seg& s = segs[(size_t) i]; if (s.used) { s.e += ((double) en[i] * norm - s.e) * 0.25; if (s.e > em) em = s.e; } }
        emax = em;
        if (! hold)
        {
            int tips = 0; const int N = nNodes;
            for (i = 0; i < N; i++)
            {
                Node& n = nodes[(size_t) i]; if (! n.used || ! n.tip || n.dormant || n.nsegs != 1) continue;
                tips++; const int sid = n.segs[0]; const double d = drive (segs[(size_t) sid].e);
                n.credit += dt * (0.5 + 2.6 * std::exp (-nseg / 10.0)) * d;   // a young colony is quick, so one knock is enough to see it move
                if (n.credit >= 1 && nseg < maxSegs)
                {
                    n.credit -= 1; const int got = extend (i, n.ang);
                    if (got == -1) { n.dormant = true; continue; }
                    n.tip = false;
                    if (got >= 0 && nseg < maxSegs && rng() < 0.33)
                    {
                        const double side = rng() < 0.5 ? -1 : 1;          // drawn in the JavaScript's order: side, then how far
                        const double turn = 0.6 + rng() * 0.6;
                        extend (i, n.ang + side * turn);
                    }
                }
            }
            if (tips < 3 && nseg < maxSegs)
            {                                               // a side branch from behind the front, so a colony is never sealed shut
                latCredit += dt * 1.2 * drive (em);
                if (latCredit >= 1)
                {
                    latCredit = 0; int tries = 12;
                    while (tries--)
                    {
                        const int c = (int) std::floor (rng() * N); const Node& n = nodes[(size_t) c];
                        if (n.used && n.nsegs >= 2 && n.nsegs <= 3) { if (extend (c, rng() * 6.283) != -1) break; }
                    }
                }
            }
            tFruit += dt; if (tFruit > 0.5) { tFruit = 0; fruiting(); }
        }
        tThick += dt;
        if (tThick > 0.25)
        {                                                   // threads that carry more of the sound thicken; the rest thin back
            tThick = 0; std::array<double, 2 * kMaxSegs> list; int nl = 0;
            for (i = 0; i < nSegs; i++)
            {
                Seg& s = segs[(size_t) i]; if (! s.used) continue;
                const double yT = em > 1e-9 && ! hold ? 1 + 3 * std::sqrt (s.e / em) : 1, y1 = s.y + (yT - s.y) * 0.12;
                if (! s.hasSent || std::fabs (y1 - s.sent) > 0.03) { s.sent = y1; s.hasSent = true; list[(size_t) nl++] = i; list[(size_t) nl++] = y1; }
                s.y = y1;
            }
            if (nl && net) net->ys (list.data(), nl);
        }
    }
    void fruiting()
    {
        if (nseg < 14 || nFruit >= kMaxFruit || time - lastFruit < 2.5) return;
        int i, j, best = -1; double sc, bs = 1e-9; bool ok; const Node& S = nodes[0];
        for (i = 1; i < nNodes; i++)
        {
            const Node& n = nodes[(size_t) i]; if (! n.used || n.nsegs < 3) continue;
            if (std::hypot (n.x - S.x, n.y - S.y) < 70) continue;
            ok = true; for (j = 0; j < nFruit; j++) { const Node& f = nodes[(size_t) fruit[(size_t) j].n]; if (std::hypot (n.x - f.x, n.y - f.y) < 150) ok = false; }
            if (! ok) continue;
            sc = 0; for (j = 0; j < n.nsegs; j++) sc += segs[(size_t) n.segs[(size_t) j]].e;
            if (sc > bs) { bs = sc; best = i; }
        }
        if (best >= 0) { fruit[(size_t) nFruit++] = { best, time }; lastFruit = time; pushEvent (1, best); sendTaps(); }
    }
    void sendTaps()
    {
        if (! net) return;
        const int Mf = nFruit; std::array<MycelNet::Tap, kMaxFruit + 1> list; int nl = 0;
        const double g0 = Mf ? 0.45 : 1, gm = Mf ? 1 / std::sqrt ((double) Mf) : 0;
        list[(size_t) nl++] = { 0, g0 * 0.7071, g0 * 0.7071 };
        for (int i = 0; i < Mf; i++) { const Node& n = nodes[(size_t) fruit[(size_t) i].n]; const double th = (0.12 + 0.76 * n.x / W) * 1.5708; list[(size_t) nl++] = { fruit[(size_t) i].n, gm * std::cos (th), gm * std::sin (th) }; }
        net->taps (list.data(), nl);
    }
    void setIn (int n) { inNode = n; if (net) net->setIn (n); }
    int nearest (double x, double y) const
    {
        int best = 0; double bd = 1e18, d;
        for (int i = 0; i < nNodes; i++) { const Node& n = nodes[(size_t) i]; if (! n.used || ! n.nsegs) continue; d = (n.x - x) * (n.x - x) + (n.y - y) * (n.y - y); if (d < bd) { bd = d; best = i; } }
        return best;
    }
    // A frost: every dead end dies back one thread. What is left is what was joined up.
    int frost()
    {
        std::array<int16_t, kMaxNodes> kill; std::array<bool, kMaxNodes> inKill {}; int nk = 0, i, killed = 0;
        for (i = 1; i < nNodes; i++) { const Node& n = nodes[(size_t) i]; if (n.used && n.nsegs == 1) { kill[(size_t) nk++] = (int16_t) i; inKill[(size_t) i] = true; } }
        for (i = 0; i < nk; i++)
        {
            const int ki = kill[(size_t) i]; Node& n = nodes[(size_t) ki]; if (! n.used || n.nsegs != 1 || nseg <= 1) continue;
            const int sid = n.segs[0], o = other (sid, ki); if (o == 0 && nodes[0].nsegs == 1) continue;
            delSeg (sid); n.used = false; freeN[(size_t) nFreeN++] = (int16_t) ki; killed++;
            if (inNode == ki) setIn (0);
        }
        for (i = 1; i < nNodes; i++)
        {
            Node& n = nodes[(size_t) i]; if (! n.used || n.nsegs != 1 || inKill[(size_t) i]) continue;
            const Node& o = nodes[(size_t) other (n.segs[0], i)]; n.tip = true; n.dormant = false; n.credit = 0; n.ang = std::atan2 (n.y - o.y, n.x - o.x);
        }
        const int before = nFruit; int keep = 0;
        for (i = 0; i < nFruit; i++) { const Node& f = nodes[(size_t) fruit[(size_t) i].n]; if (f.used && f.nsegs >= 2) fruit[(size_t) keep++] = fruit[(size_t) i]; }
        nFruit = keep;
        if (nFruit != before || killed) sendTaps();
        return killed;
    }

    // Build `target` from this colony: the same threads, thicknesses, way in and taps, silent.
    // (The check script's clone(); also what a host's sample-rate change and a loaded state need.)
    void buildNet (MycelNet& target) const
    {
        std::array<double, 2 * kMaxSegs> list; int nl = 0;
        for (int i = 0; i < nSegs; i++) { const Seg& s = segs[(size_t) i]; if (s.used) { target.add (i, s.a, s.b, s.L); list[(size_t) nl++] = i; list[(size_t) nl++] = s.y; } }
        target.ys (list.data(), nl); target.setIn (inNode);
        MycelColony c = *this; c.net = &target; c.sendTaps();
    }
    // A new sample rate: every thread keeps its length in milliseconds, so its length in samples changes.
    void retune (double sampleRate)
    {
        sr = sampleRate;
        for (int i = 0; i < nSegs; i++) { Seg& s = segs[(size_t) i]; if (s.used) s.L = (int) std::max (32.0, std::floor (s.px * msPerPx * sr / 1000 + 0.5)); }
    }

    // ── the whole colony as text, for the host's saved state. %.17g keeps every double exact.
    void save (std::string& out) const
    {
        char b[64];
        auto I = [&] (long long v) { std::snprintf (b, sizeof b, "%lld ", v); out += b; };
        auto D = [&] (double v) { std::snprintf (b, sizeof b, "%.17g ", v); out += b; };
        out += "MYCEL1 ";
        D (sr); I (maxSegs); I (block); D (msPerPx); I (rng.a); I (seed); D (W); D (H); D (time);
        I (nNodes); I (nSegs); I (nFreeS); I (nFreeN); I (nseg); I (nFruit); I (inNode); I (hold); I (preset);
        D (latCredit); D (tThick); D (tFruit); D (lastFruit); D (emax);
        for (int i = 0; i < nNodes; i++)
        {
            const Node& n = nodes[(size_t) i]; I (n.used); if (! n.used) continue;
            D (n.x); D (n.y); D (n.ang); D (n.credit); I (n.tip); I (n.dormant); I (n.nsegs);
            for (int j = 0; j < n.nsegs; j++) I (n.segs[(size_t) j]);
        }
        for (int i = 0; i < nSegs; i++)
        {
            const Seg& s = segs[(size_t) i]; I (s.used); if (! s.used) continue;
            I (s.a); I (s.b); I (s.L); D (s.px); D (s.y); D (s.e); D (s.born); D (s.sent); I (s.hasSent);
        }
        for (int i = 0; i < nFreeS; i++) I (freeS[(size_t) i]);
        for (int i = 0; i < nFreeN; i++) I (freeN[(size_t) i]);
        for (int i = 0; i < nFruit; i++) { I (fruit[(size_t) i].n); D (fruit[(size_t) i].born); }
        out += "END";
    }
    // Reads save()'s text. Leaves this colony untouched and returns false if the text is not a whole,
    // sane colony (a state from a damaged or foreign file must not reach the audio thread).
    bool load (const char* text)
    {
        if (text == nullptr || std::strncmp (text, "MYCEL1 ", 7) != 0) return false;
        const char* p = text + 7; bool bad = false;
        auto I = [&] () -> long long { char* e; const long long v = std::strtoll (p, &e, 10); if (e == p) bad = true; p = e; return v; };
        auto D = [&] () -> double { char* e; const double v = std::strtod (p, &e); if (e == p || ! std::isfinite (v)) bad = true; p = e; return v; };
        auto in = [&] (long long v, long long lo, long long hi) { if (v < lo || v > hi) bad = true; return (int) v; };
        MycelColony c; c.net = net;
        c.sr = D(); c.maxSegs = in (I(), 1, kMaxSegs); c.block = in (I(), 1, 1 << 16); c.msPerPx = D(); c.rng.a = (uint32_t) I(); c.seed = (uint32_t) I();
        c.W = D(); c.H = D(); c.time = D();
        c.nNodes = in (I(), 1, kMaxNodes); c.nSegs = in (I(), 1, kMaxSegs); c.nFreeS = in (I(), 0, kMaxSegs); c.nFreeN = in (I(), 0, kMaxNodes);
        c.nseg = in (I(), 1, kMaxSegs); c.nFruit = in (I(), 0, kMaxFruit); c.inNode = in (I(), 0, kMaxNodes - 1); c.hold = I() != 0; c.preset = in (I(), 0, 3);
        c.latCredit = D(); c.tThick = D(); c.tFruit = D(); c.lastFruit = D(); c.emax = D();
        if (bad || ! (c.sr > 0) || ! (c.W > 0) || ! (c.H > 0) || ! (c.msPerPx > 0)) return false;
        for (int i = 0; i < c.nNodes && ! bad; i++)
        {
            Node& n = c.nodes[(size_t) i]; n.used = I() != 0; if (! n.used) continue;
            n.x = D(); n.y = D(); n.ang = D(); n.credit = D(); n.tip = I() != 0; n.dormant = I() != 0; n.nsegs = (int16_t) in (I(), 0, kMaxSegs);
            for (int j = 0; j < n.nsegs && ! bad; j++) n.segs[(size_t) j] = (int16_t) in (I(), 0, c.nSegs - 1);
        }
        int live = 0;
        for (int i = 0; i < c.nSegs && ! bad; i++)
        {
            Seg& s = c.segs[(size_t) i]; s.used = I() != 0; if (! s.used) continue;
            s.a = in (I(), 0, c.nNodes - 1); s.b = in (I(), 0, c.nNodes - 1); s.L = in (I(), 32, 1 << 24); s.px = D(); s.y = D(); s.e = D(); s.born = D(); s.sent = D(); s.hasSent = I() != 0;
            if (bad || ! c.nodes[(size_t) s.a].used || ! c.nodes[(size_t) s.b].used || s.a == s.b || ! (s.y > 0)) bad = true;
            live++;
        }
        for (int i = 0; i < c.nFreeS && ! bad; i++) { c.freeS[(size_t) i] = (int16_t) in (I(), 0, c.nSegs - 1); if (! bad && c.segs[(size_t) c.freeS[(size_t) i]].used) bad = true; }
        for (int i = 0; i < c.nFreeN && ! bad; i++) { c.freeN[(size_t) i] = (int16_t) in (I(), 0, c.nNodes - 1); if (! bad && c.nodes[(size_t) c.freeN[(size_t) i]].used) bad = true; }
        for (int i = 0; i < c.nFruit && ! bad; i++) { c.fruit[(size_t) i].n = in (I(), 0, c.nNodes - 1); c.fruit[(size_t) i].born = D(); if (! bad && ! c.nodes[(size_t) c.fruit[(size_t) i].n].used) bad = true; }
        while (*p == ' ') p++;
        if (bad || std::strncmp (p, "END", 3) != 0 || live != c.nseg || ! c.nodes[0].used || ! c.nodes[(size_t) c.inNode].used) return false;
        // every thread must be on both its ends' lists, and every list entry a live thread at that node
        for (int i = 0; i < c.nNodes; i++)
        {
            const Node& n = c.nodes[(size_t) i]; if (! n.used) continue;
            for (int j = 0; j < n.nsegs; j++) { const Seg& s = c.segs[(size_t) n.segs[(size_t) j]]; if (! s.used || (s.a != i && s.b != i)) return false; }
        }
        int ends = 0; for (int i = 0; i < c.nNodes; i++) if (c.nodes[(size_t) i].used) ends += c.nodes[(size_t) i].nsegs;
        if (ends != 2 * c.nseg || c.nNodes - c.nFreeN < 2) return false;
        *this = c;
        return true;
    }
};

// ── Dish: the network and the colony as the plugin runs them ────────────────
struct Dish
{
    MycelNet net;
    MycelColony col;
    int fed = 0;            // samples since the colony last ate
    uint32_t feeds = 0;     // how many times it has (the processor publishes a picture when this moves)
    double tipKeep = 0.8;   // the page's fixed value: a tip gives back 0.8 of what reaches it

    Dish() { col.net = &net; }
    Dish (const Dish&) = delete;
    Dish& operator= (const Dish&) = delete;

    // Off the audio thread: allocates. Keeps the colony, rebuilds the network silent at the new rate.
    void prepare (double sampleRate, double carry, double wetness)
    {
        net.prepare (sampleRate);
        net.par (carry, wetness, tipKeep);
        col.net = &net; col.retune (sampleRate); col.buildNet (net);
        fed = 0;
    }
    // A new spore. Does not allocate (clears no delay memory until threads are added).
    void spore (uint32_t seed, bool hold)
    {
        col.net = &net; col.reset (seed, kDishW, kDishH); col.hold = hold; fed = 0; feeds++;
    }
    // Take a whole colony (a loaded state). Does not allocate; clears the delay memory it re-uses.
    void adopt (const MycelColony& c)
    {
        const double rt = net.rt, dp = net.damp;
        col = c; col.net = &net; col.block = kBlock; col.maxSegs = kMaxSegs; col.preset = MycelColony::None; col.retune (net.sr);
        net.reset(); net.par (rt, dp, tipKeep); col.buildNet (net);
        fed = 0; feeds++;
    }
    // x: mono in. oL, oR: the dish alone (no dry sound). Any n; the colony eats every 512 samples exactly.
    void process (const float* x, float* oL, float* oR, int n)
    {
        int o = 0;
        while (o < n)
        {
            const int b = std::min (n - o, kBlock - fed);
            net.process (x + o, oL + o, oR + o, b);
            fed += b; o += b;
            if (fed == kBlock) { fed = 0; col.feed (net.en.data()); net.en.fill (0); feeds++; }
        }
    }
    // The page's rule for how loud the dish is beside the dry sound: quieter as it carries further.
    static double wetGain (double carry) { const double g = 3.5 / std::sqrt (carry / 3); return std::max (0.8, std::min (6.0, g)); }
};
}  // namespace algo
