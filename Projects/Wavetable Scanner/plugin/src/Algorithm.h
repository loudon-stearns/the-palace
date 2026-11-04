// Algorithm.h — Wavetable Scanner: the browser synth's engine (synth/wt-synth.js), ported
// line for line, with the page's spectral morph (packer/packer.js) run on the tables at load.
//
// Voice: wavetable osc (1-7 unison copies, detune, stereo spread)
//        → 12 dB state-variable lowpass (Simper's TPT form) → amp envelope.
// Mod:   a second envelope (to cutoff and Position), LFO 1 (sine or triangle, to Position),
//        LFO 2 (sine, to cutoff), transpose. Eight voices, or mono / legato with glide.
//
// The JS engine renders in blocks and works out its slow values (the octave of the
// band-limited table, the filter's coefficients, the unison spread) at the start of each
// 16 samples. Here a sample counter does the same, so the reference render
// (reference/ref_render.cjs, the JS engine in 16-sample blocks) and this file agree to
// rounding. JS keeps the mix in a Float32Array, so the mix here is a float too.
#pragma once

#include "ParamSpec.h"
#include "Tables.h"

#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <vector>

namespace algo
{
    using tpl::ParamSpec;
    using tpl::Taper;

    // ── 1. Parameters ──────────────────────────────────────────────────────────
    enum Param
    {
        Table, Position, LfoWave, LfoRate, LfoToPos, EnvToPos,
        Unison, Detune, Spread,
        Cutoff, Reso, EnvToCutoff, KeyTrack, Lfo2Rate, Lfo2ToCutoff,
        AAttack, ADecay, ASustain, ARelease, MAttack, MDecay, MSustain, MRelease,
        Mode, Glide, Transpose, Velocity, Gain,
        kNumParams
    };

    // Defaults are wt-synth.js DEFAULTS; the envelope times are Synth Templates' words
    // (fast 0.0154, medium 0.575, short 0.0986, instant 0.00488 s).
    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id                name               unit   min      max      default  taper          smooth choices                         auto  group           hero
        { "table",          "Table",           "",    0.0,     2.0,     2.0,     Taper::Choice, 0.0,  "classics|cello|fm chain",       true, "Table" },
        { "position",       "Position",        "",    0.0,     1.0,     0.0,     Taper::Linear, 20.0, "",                              true, "Table",        true },
        { "lfo_wave",       "LFO shape",       "",    0.0,     1.0,     0.0,     Taper::Choice, 0.0,  "sine|triangle",                 true, "Scan" },
        { "lfo_rate",       "LFO rate",        "Hz",  0.01,    20.0,    0.2,     Taper::Log,    20.0, "",                              true, "Scan" },
        { "lfo_to_pos",     "LFO to Position", "",    0.0,     1.0,     0.0,     Taper::Linear, 20.0, "",                              true, "Scan" },
        { "env_to_pos",     "Env to Position", "",    -1.0,    1.0,     0.0,     Taper::Linear, 20.0, "",                              true, "Scan" },
        { "unison",         "Unison",          "",    0.0,     6.0,     0.0,     Taper::Choice, 0.0,  "1|2|3|4|5|6|7",                 true, "Unison" },
        { "detune",         "Detune",          "ct",  0.0,     50.0,    12.0,    Taper::Linear, 20.0, "",                              true, "Unison" },
        { "spread",         "Spread",          "",    0.0,     1.0,     0.6,     Taper::Linear, 20.0, "",                              true, "Unison" },
        { "cutoff",         "Cutoff",          "Hz",  20.0,    20000.0, 16000.0, Taper::Log,    20.0, "",                              true, "Filter",       true },
        { "reso",           "Resonance",       "",    0.0,     1.0,     0.1,     Taper::Linear, 20.0, "",                              true, "Filter" },
        { "env_to_cutoff",  "Env to cutoff",   "oct", -6.0,    6.0,     0.0,     Taper::Linear, 20.0, "",                              true, "Filter" },
        { "keytrack",       "Key track",       "",    0.0,     1.0,     0.0,     Taper::Linear, 20.0, "",                              true, "Filter" },
        { "lfo2_rate",      "LFO 2 rate",      "Hz",  0.01,    20.0,    0.3,     Taper::Log,    20.0, "",                              true, "Filter" },
        { "lfo2_to_cutoff", "LFO 2 to cutoff", "oct", 0.0,     4.0,     0.0,     Taper::Linear, 20.0, "",                              true, "Filter" },
        { "a_attack",       "Amp attack",      "s",   0.001,   10.0,    0.0154,  Taper::Log,    0.0,  "",                              true, "Amp envelope" },
        { "a_decay",        "Amp decay",       "s",   0.001,   10.0,    0.575,   Taper::Log,    0.0,  "",                              true, "Amp envelope" },
        { "a_sustain",      "Amp sustain",     "",    0.0,     1.0,     1.0,     Taper::Linear, 20.0, "",                              true, "Amp envelope" },
        { "a_release",      "Amp release",     "s",   0.001,   10.0,    0.0986,  Taper::Log,    0.0,  "",                              true, "Amp envelope" },
        { "m_attack",       "Mod attack",      "s",   0.001,   10.0,    0.00488, Taper::Log,    0.0,  "",                              true, "Mod envelope" },
        { "m_decay",        "Mod decay",       "s",   0.001,   10.0,    0.575,   Taper::Log,    0.0,  "",                              true, "Mod envelope" },
        { "m_sustain",      "Mod sustain",     "",    0.0,     1.0,     0.0,     Taper::Linear, 20.0, "",                              true, "Mod envelope" },
        { "m_release",      "Mod release",     "s",   0.001,   10.0,    0.575,   Taper::Log,    0.0,  "",                              true, "Mod envelope" },
        { "mode",           "Voice mode",      "",    0.0,     2.0,     0.0,     Taper::Choice, 0.0,  "poly|mono|legato",              true, "Voice" },
        { "glide",          "Glide",           "s",   0.0,     2.0,     0.0,     Taper::Linear, 0.0,  "",                              true, "Voice" },
        { "transpose",      "Transpose",       "st",  -24.0,   24.0,    0.0,     Taper::Linear, 0.0,  "",                              true, "Voice" },
        { "velocity",       "Velocity",        "",    0.0,     1.0,     0.6,     Taper::Linear, 20.0, "",                              true, "Output" },
        { "gain",           "Gain",            "",    0.0,     1.0,     0.35,    Taper::Linear, 20.0, "",                              true, "Output" },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    inline constexpr int kInputs  = 0;
    inline constexpr int kOutputs = 2;
    // position: where the scan is (the last sounding voice's, else the knob's with the LFO);
    // voices: how many sound. The picture reads both.
    inline constexpr const char* kProbes[] = { "position", "voices" };
    inline constexpr int kNumProbes = 2;

    // ── 3. The tables: morphed and band-limited once, shared by every instance ──
    inline constexpr int kFrame = 1024, kLevels = 10, kMaxV = 8, kMaxU = 7, kCtrl = 16;

    // packer.js fft, operation for operation
    inline void fft (double* re, double* im, int n, bool inverse)
    {
        for (int i = 1, j = 0; i < n; i++)
        {
            int bit = n >> 1;
            for (; j & bit; bit >>= 1) j ^= bit;
            j ^= bit;
            if (i < j) { std::swap (re[i], re[j]); std::swap (im[i], im[j]); }
        }
        for (int len = 2; len <= n; len <<= 1)
        {
            const double ang = (inverse ? 2 : -2) * M_PI / len, wr = std::cos (ang), wi = std::sin (ang);
            for (int i = 0; i < n; i += len)
            {
                double cr = 1, ci = 0;
                for (int k = 0; k < len / 2; k++)
                {
                    const int a = i + k, b = a + len / 2;
                    const double xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
                    re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
                    const double nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
                }
            }
        }
    }

    using Cycle = std::vector<float>;

    // packer.js alignRotations: turn each frame to best line up with the one before it
    inline std::vector<Cycle> alignRotations (const std::vector<Cycle>& frames)
    {
        const int L = kFrame;
        std::vector<Cycle> out { frames[0] };
        std::vector<double> are (L), aim (L), bre (L), bim (L), re (L), im (L);
        for (size_t f = 1; f < frames.size(); f++)
        {
            for (int i = 0; i < L; i++) { are[i] = out[f - 1][i]; aim[i] = 0; bre[i] = frames[f][i]; bim[i] = 0; }
            fft (are.data(), aim.data(), L, false); fft (bre.data(), bim.data(), L, false);
            for (int k = 0; k < L; k++) { re[k] = are[k] * bre[k] + aim[k] * bim[k]; im[k] = aim[k] * bre[k] - are[k] * bim[k]; }
            fft (re.data(), im.data(), L, true);
            int lag = 0; for (int i = 1; i < L; i++) if (re[i] > re[lag]) lag = i;
            Cycle r (L);
            for (int i = 0; i < L; i++) r[(i + lag) % L] = frames[f][i];
            out.push_back (std::move (r));
        }
        return out;
    }

    // packer.js spectralMorph (lock on): line up the phases, then fill each gap with
    // in-betweens built in the spectrum, equal power, so no harmonic cancels mid-morph
    inline std::vector<Cycle> spectralMorph (const std::vector<Cycle>& frames, int target)
    {
        const int F = (int) frames.size(), L = kFrame, H = L / 2;
        if (F < 2) return frames;
        const int between = std::max (0, std::min (64, (int) std::floor ((double) (target - 1) / (F - 1)) - 1));
        struct Spec { std::vector<double> m, p; };
        std::vector<Spec> spec ((size_t) F);
        std::vector<double> re (L), im (L);
        for (int f = 0; f < F; f++)
        {
            for (int i = 0; i < L; i++) { re[i] = frames[f][i]; im[i] = 0; }
            fft (re.data(), im.data(), L, false);
            spec[f].m.resize (H); spec[f].p.resize (H);
            for (int k = 0; k < H; k++) { spec[f].m[k] = std::hypot (re[k], im[k]); spec[f].p[k] = std::atan2 (im[k], re[k]); }
        }
        auto synth = [&] (const double* m, const double* p)
        {
            std::fill (re.begin(), re.end(), 0.0); std::fill (im.begin(), im.end(), 0.0);
            for (int k = 1; k < H; k++) { re[k] = m[k] * std::cos (p[k]); im[k] = m[k] * std::sin (p[k]); re[L - k] = re[k]; im[L - k] = -im[k]; }
            fft (re.data(), im.data(), L, true);
            Cycle o (L); for (int i = 0; i < L; i++) o[i] = (float) (re[i] / L);
            return o;
        };
        std::vector<Cycle> src { frames[0] };
        for (int f = 1; f < F; f++)
        {
            auto& A = spec[f - 1]; auto& B = spec[f];
            const double top = *std::max_element (A.m.begin(), A.m.end());
            for (int k = 1; k < H; k++) if (A.m[k] > top * 1e-3) B.p[k] = A.p[k];
            src.push_back (synth (B.m.data(), B.p.data()));
        }
        std::vector<Cycle> out;
        std::vector<double> m (H), ph (H);
        for (int f = 0; f < F - 1; f++)
        {
            out.push_back (src[f]);
            const auto& A = spec[f]; const auto& B = spec[f + 1];
            for (int j = 1; j <= between; j++)
            {
                const double t = (double) j / (between + 1);
                m[0] = ph[0] = 0;
                for (int k = 1; k < H; k++)
                {
                    double d = B.p[k] - A.p[k];
                    d -= 2 * M_PI * std::floor (d / (2 * M_PI) + 0.5);   // JS Math.round
                    m[k] = std::sqrt (A.m[k] * A.m[k] + t * (B.m[k] * B.m[k] - A.m[k] * A.m[k]));
                    ph[k] = A.p[k] + t * d;
                }
                out.push_back (synth (m.data(), ph.data()));
            }
        }
        out.push_back (src[F - 1]);
        return out;
    }

    // wt-synth.js buildMips: level L keeps harmonics 1 .. 512 >> L; level-major
    inline std::vector<float> buildMips (const std::vector<float>& samples, int frames)
    {
        std::vector<float> out ((size_t) kLevels * frames * kFrame);
        std::vector<double> re (kFrame), im (kFrame), sre (kFrame), sim (kFrame);
        for (int f = 0; f < frames; f++)
        {
            for (int i = 0; i < kFrame; i++) { sre[i] = samples[(size_t) f * kFrame + i]; sim[i] = 0; }
            fft (sre.data(), sim.data(), kFrame, false);
            for (int L = 0; L < kLevels; L++)
            {
                const int H = 512 >> L;
                std::fill (re.begin(), re.end(), 0.0); std::fill (im.begin(), im.end(), 0.0);
                for (int k = 1; k <= H; k++)
                {
                    const double w = k == 512 ? 0.5 : 1;
                    re[k] = sre[k] * w; im[k] = sim[k] * w;
                    if (k < 512) { re[kFrame - k] = sre[kFrame - k]; im[kFrame - k] = sim[kFrame - k]; }
                }
                fft (re.data(), im.data(), kFrame, true);
                const size_t base = ((size_t) L * frames + f) * kFrame;
                for (int i = 0; i < kFrame; i++) out[base + i] = (float) (re[i] / kFrame);
            }
        }
        return out;
    }

    struct WTable { std::vector<float> mips; int frames = 0; };

    // synth/page.html morphed(): remove each frame's DC, align, morph to ≤ 512 frames,
    // then match the raw table's loudness (not its peak)
    inline WTable makeTable (const wtdata::Raw& raw)
    {
        const int L = kFrame, F = raw.frames;
        std::vector<Cycle> frames;
        for (int f = 0; f < F; f++)
        {
            const float* c = raw.data + (size_t) f * L;
            double m = 0; for (int i = 0; i < L; i++) m += c[i];
            m /= L;
            Cycle x (L); for (int i = 0; i < L; i++) x[i] = (float) (c[i] - m);
            frames.push_back (std::move (x));
        }
        const auto out = spectralMorph (alignRotations (frames), 512);
        std::vector<float> samples (out.size() * L);
        for (size_t i = 0; i < out.size(); i++) std::copy (out[i].begin(), out[i].end(), samples.begin() + (ptrdiff_t) (i * L));
        double e = 0; for (float v : samples) e += (double) v * v;
        e /= (double) samples.size();
        double e0 = 0; for (int i = 0; i < F * L; i++) e0 += (double) raw.data[i] * raw.data[i];
        e0 /= (double) (F * L);
        if (e > 0) { const double k = std::sqrt (e0 / e); for (auto& v : samples) v = (float) (v * k); }
        return { buildMips (samples, (int) out.size()), (int) out.size() };
    }

    inline const std::array<WTable, wtdata::kNumTables>& tables()
    {
        static const auto t = []
        {
            std::array<WTable, wtdata::kNumTables> a;
            for (int i = 0; i < wtdata::kNumTables; i++) a[(size_t) i] = makeTable (wtdata::kRaw[i]);
            return a;
        }();
        return t;
    }

    // ── 4. State and the per-sample update ─────────────────────────────────────
    inline double coef (double T, double sr) { return 1 - std::exp (-3 / (std::max (T, 0.0005) * sr)); }   // tau = T/3

    struct Env
    {
        double v = 0; int stage = 0; long t = 0;   // 0 idle 1 attack 2 decay/sustain 3 release
        void gate (bool on) { if (on) { stage = 1; t = 0; } else if (stage) stage = 3; }
        double tick (double A, double D, double S, double R, double sr)
        {
            switch (stage)
            {
                case 1: v += (1 - v) * coef (A, sr); if (++t >= A * sr) stage = 2; break;
                case 2: v += (S - v) * coef (D, sr); break;
                case 3: v += (0 - v) * coef (R, sr); if (v < 1e-5) { v = 0; stage = 0; } break;
                default: break;
            }
            return v;
        }
    };

    struct Voice
    {
        int note = -1; bool gateOn = false; long age = 0; double vel = 1, cur = 60, target = 60;
        std::array<double, kMaxU> phase {};
        Env amp, mod;
        double f[2][2] {};
        bool fresh = false;                       // started since the last 16-sample mark
        int L0 = 0; double w = 0, a1 = 0, a2 = 0, a3 = 0;
        bool active() const { return amp.stage != 0; }
    };

    struct Algorithm
    {
        double sr = 48000.0;
        std::array<Voice, kMaxV> voices {};
        std::array<int, 128> stack {}; int numStack = 0;
        long clock = 0, ctr = 0; uint32_t seed = 1;
        int mode = 0; double glide = 0;          // read by noteOn/noteOff, from the last sample
        // the 16-sample values
        const WTable* tab = nullptr;
        int U = 1; double glideK = 1, kq = 2, lfoInc = 0, lfo2Inc = 0;
        double lfoBase = 0, lfo2Base = 0, lfoPh = 0, lfo2Ph = 0;
        std::array<double, kMaxU> det {}, panL {}, panR {};
        double probes[kNumProbes] {};

        void prepare (double sampleRate) { sr = sampleRate; tables(); }

        void reset (const double* v)
        {
            for (auto& x : voices) x = Voice {};
            numStack = 0; clock = 0; ctr = 0; seed = 1;
            lfoBase = lfo2Base = lfoPh = lfo2Ph = 0; lfoInc = lfo2Inc = 0;
            mode = (int) v[Mode]; glide = v[Glide];
            tab = &tables()[(size_t) std::clamp ((int) v[Table], 0, wtdata::kNumTables - 1)];
        }

        double rand() { seed = seed * 1664525u + 1013904223u; return seed / 4294967296.0; }

        void start (Voice& v, int note, double vel, bool retrigger)
        {
            v.note = note; v.target = note; v.vel = vel; v.gateOn = true; v.age = ++clock;
            if (! v.active())
            {
                v.cur = note;
                for (int u = 0; u < kMaxU; u++) v.phase[(size_t) u] = u ? rand() : 0;
                v.f[0][0] = v.f[0][1] = v.f[1][0] = v.f[1][1] = 0;
                v.fresh = true;
            }
            if (retrigger) { v.amp.gate (true); v.mod.gate (true); }
        }
        void removeStack (int note)
        {
            int j = 0; for (int i = 0; i < numStack; i++) if (stack[(size_t) i] != note) stack[(size_t) j++] = stack[(size_t) i];
            numStack = j;
        }

        void noteOn (int note, double vel)       // vel 0..1, as wt-synth.js's vel / 127
        {
            if (vel <= 0) { noteOff (note); return; }
            if (mode > 0)
            {
                removeStack (note);
                if (numStack == (int) stack.size()) removeStack (stack[0]);
                stack[(size_t) numStack++] = note;
                auto& v = voices[0];
                const bool legato = mode == 2 && v.gateOn;
                if (glide <= 0 || ! v.active()) v.cur = note;
                start (v, note, vel, ! legato);
                if (glide <= 0) v.cur = note;
                return;
            }
            Voice* v = nullptr;
            for (auto& x : voices) if (x.note == note && x.active()) { v = &x; break; }
            if (! v) for (auto& x : voices) if (! x.active()) { v = &x; break; }
            if (! v) { v = &voices[0]; for (auto& x : voices) if (x.age < v->age) v = &x; }
            start (*v, note, vel, true);
            v->cur = note;
        }

        void noteOff (int note)
        {
            if (mode > 0)
            {
                removeStack (note);
                auto& v = voices[0];
                if (v.note != note) return;
                if (numStack > 0)
                {
                    const int n = stack[(size_t) numStack - 1];
                    start (v, n, v.vel, mode == 1);
                    if (glide <= 0) v.cur = n;
                    return;
                }
                v.gateOn = false; v.amp.gate (false); v.mod.gate (false);
                return;
            }
            for (auto& v : voices)
                if (v.note == note && v.gateOn) { v.gateOn = false; v.amp.gate (false); v.mod.gate (false); }
        }

        double lfoAt (double ph, int wave) const { return wave == 1 ? 1 - 4 * std::fabs (ph - 0.5) : std::sin (2 * M_PI * ph); }

        void voiceControls (Voice& vc, const double* v, double hz, double em)
        {
            const double nyq = sr / 2;
            const double lam = std::max (0.0, std::log2 (512 * hz * (U > 1 ? std::pow (2.0, v[Detune] / 1200) : 1) / nyq));
            vc.L0 = std::min (kLevels - 1, (int) std::ceil (lam));
            vc.w = vc.L0 == 0 ? 0 : std::min (1.0, lam - (vc.L0 - 1));
            if (lam == 0) { vc.L0 = 0; vc.w = 0; }
            double fc = v[Cutoff] * std::pow (2.0, v[EnvToCutoff] * em + v[KeyTrack] * (vc.cur - 60) / 12 + v[Lfo2ToCutoff] * std::sin (2 * M_PI * lfo2Ph));
            fc = std::min (std::max (fc, 20.0), nyq * 0.9);
            const double g = std::tan (M_PI * fc / sr);
            vc.a1 = 1 / (1 + g * (g + kq)); vc.a2 = g * vc.a1; vc.a3 = g * vc.a2;
        }

        double read (double fp, double ph, int L0, double w) const
        {
            const int F = tab->frames; const float* m = tab->mips.data();
            const int fa = (int) fp, fb = fa + 1 < F ? fa + 1 : fa; const double ff = fp - fa;
            const double x = ph * kFrame; const int i0 = (int) x, i1 = (i0 + 1) & (kFrame - 1); const double xf = x - i0;
            const int L1 = L0 + 1 < kLevels ? L0 + 1 : L0;
            const size_t a0 = ((size_t) L0 * F + fa) * kFrame, b0 = ((size_t) L0 * F + fb) * kFrame,
                         a1 = ((size_t) L1 * F + fa) * kFrame, b1 = ((size_t) L1 * F + fb) * kFrame;
            const double s0a = m[a0 + i0] + ((double) m[a0 + i1] - m[a0 + i0]) * xf, s0b = m[b0 + i0] + ((double) m[b0 + i1] - m[b0 + i0]) * xf;
            const double s1a = m[a1 + i0] + ((double) m[a1 + i1] - m[a1 + i0]) * xf, s1b = m[b1 + i0] + ((double) m[b1 + i1] - m[b1 + i0]) * xf;
            const double s0 = s0a + (s0b - s0a) * ff, s1 = s1a + (s1b - s1a) * ff;
            return s0 + (s1 - s0) * w;
        }

        static double svf (double* st, double x, double a1, double a2, double a3)
        {
            const double v3 = x - st[1], v1 = a1 * st[0] + a2 * v3, v2 = st[1] + a2 * st[0] + a3 * v3;
            st[0] = 2 * v1 - st[0]; st[1] = 2 * v2 - st[1];
            return v2;
        }

        void step (const double* v, const float*, float* out)
        {
            mode = (int) v[Mode]; glide = v[Glide];
            const bool mark = (ctr & (kCtrl - 1)) == 0;
            if (mark)
            {
                if (ctr > 0) { lfoBase = std::fmod (lfoBase + lfoInc * kCtrl, 1.0); lfo2Base = std::fmod (lfo2Base + lfo2Inc * kCtrl, 1.0); }
                lfoPh = lfoBase; lfo2Ph = lfo2Base;
                tab = &tables()[(size_t) std::clamp ((int) v[Table], 0, wtdata::kNumTables - 1)];
                U = std::max (1, std::min (kMaxU, (int) v[Unison] + 1));
                const double uNorm = 1 / std::sqrt ((double) U);
                glideK = v[Glide] > 0 ? coef (v[Glide], sr) : 1;
                kq = 2 - 1.96 * std::min (1.0, std::max (0.0, v[Reso]));
                lfoInc = v[LfoRate] / sr; lfo2Inc = v[Lfo2Rate] / sr;
                for (int u = 0; u < U; u++)
                {
                    const double s = U > 1 ? (double) u / (U - 1) * 2 - 1 : 0;
                    det[(size_t) u] = std::pow (2.0, s * v[Detune] / 1200);
                    const double pan = s * v[Spread];
                    panL[(size_t) u] = std::sqrt ((1 - pan) / 2) * uNorm * 1.414;
                    panR[(size_t) u] = std::sqrt ((1 + pan) / 2) * uNorm * 1.414;
                }
            }

            const int F = tab->frames, wave = (int) v[LfoWave];
            float outL = 0, outR = 0;
            double lastPos = -1; int sounding = 0;
            for (auto& vc : voices)
            {
                if (! vc.active()) continue;
                vc.cur += (vc.target - vc.cur) * glideK;
                const double ea = vc.amp.tick (v[AAttack], v[ADecay], v[ASustain], v[ARelease], sr);
                const double em = vc.mod.tick (v[MAttack], v[MDecay], v[MSustain], v[MRelease], sr);
                const double hz = 440 * std::pow (2.0, (vc.cur + v[Transpose] - 69) / 12);
                if (mark || vc.fresh) { voiceControls (vc, v, hz, em); vc.fresh = false; }
                double pos = v[Position] + v[LfoToPos] * lfoAt (lfoPh, wave) * 0.5 + v[EnvToPos] * em;
                pos = pos < 0 ? 0 : pos > 1 ? 1 : pos;
                const double fp = pos * (F - 1);
                double l = 0, r = 0;
                const double inc = hz / sr;
                for (int u = 0; u < U; u++)
                {
                    const double s = read (fp, vc.phase[(size_t) u], vc.L0, vc.w);
                    l += s * panL[(size_t) u]; r += s * panR[(size_t) u];
                    vc.phase[(size_t) u] += inc * det[(size_t) u]; if (vc.phase[(size_t) u] >= 1) vc.phase[(size_t) u] -= 1;
                }
                const double lv = svf (vc.f[0], l, vc.a1, vc.a2, vc.a3), rv = svf (vc.f[1], r, vc.a1, vc.a2, vc.a3);
                const double amp = ea * (1 - v[Velocity] + v[Velocity] * vc.vel) * v[Gain];
                outL = (float) (outL + lv * amp); outR = (float) (outR + rv * amp);
                if (! vc.active()) vc.note = -1;
                lastPos = pos; ++sounding;
            }
            if (lastPos < 0) lastPos = std::min (1.0, std::max (0.0, v[Position] + v[LfoToPos] * lfoAt (lfoPh, wave) * 0.5));
            lfoPh += lfoInc; if (lfoPh >= 1) lfoPh -= 1;
            lfo2Ph += lfo2Inc; if (lfo2Ph >= 1) lfo2Ph -= 1;
            ++ctr;

            out[0] = (float) std::tanh ((double) outL);
            out[1] = (float) std::tanh ((double) outR);
            probes[0] = lastPos; probes[1] = sounding;
        }
    };
}
