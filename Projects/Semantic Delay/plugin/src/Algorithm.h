// Algorithm.h — Semantic Delay, the first plugin: a phrase delay whose echoes
// come back sung by another voice.
//
// Two threads, as the standing orders say. The audio thread (step) only cuts
// phrases with an energy gate and plays back echoes that are ready; it never
// waits, locks or allocates. A worker thread, started in prepare(), sends each
// finished phrase to the Python helper over its socket (HelperLink.h, RPC v0.2)
// and hands the converted echoes back. The plugin reports zero latency: the
// delay is the effect.
//
// The hand-off is a pool of slots, each owned by one thread at a time through
// an atomic state: FREE → CAPTURING (audio) → QUEUED → CONVERTING (worker) →
// DONE → FREE (audio, once every echo has played). Inside CONVERTING the
// worker publishes each echo the moment it is converted, so the first repeat
// can play while the later ones are still being sung.
//
// An echo that comes back after its time plays at once, late, rather than
// clipped at the front, and is counted in the `late` probe.
//
// reference/sketch.py mirrors the audio thread with no helper reachable: the
// gate, the phrase count and the dry path. tests/echo_through_helper.cpp drives
// this same file against the real helper in real time.
#pragma once

#include "ParamSpec.h"
#include "HelperLink.h"

#include <algorithm>
#include <array>
#include <atomic>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <thread>
#include <vector>

namespace algo
{
    using tpl::ParamSpec;
    using tpl::Taper;

    // ── 1. Parameters ──────────────────────────────────────────────────────────
    enum Param { Delay, Repeats, Feedback, Voice, Hold, LetGo, Steps, Dry, Wet, Gate, kNumParams };

    inline constexpr ParamSpec kParams[kNumParams] = {
        //  id          name           unit  min    max    default taper          smooth  choices             auto   group     hero
        { "delay",    "Delay",        "s",   2.0,  30.0,  10.0,  Taper::Log,     0.0,  "",                 true,  "Echo",   true  },
        { "repeats",  "Repeats",      "",    0.0,   3.0,   1.0,  Taper::Choice,  0.0,  "1|2|3|4",          true,  "Echo"          },
        { "feedback", "Feedback",     "",    0.0,  0.95,   0.6,  Taper::Linear,  0.0,  "",                 true,  "Echo"          },
        { "voice",    "Voice",        "",    0.0,   7.0,   0.0,  Taper::Choice,  0.0,  "1|2|3|4|5|6|7|8",  true,  "Voice"         },
        { "hold",     "Hold melody",  "",    0.0,   1.0,   1.0,  Taper::Linear,  0.0,  "",                 true,  "Voice",  true  },
        { "letgo",    "Let go",       "",    0.0,   1.0,   0.5,  Taper::Linear,  0.0,  "",                 true,  "Voice"         },
        { "steps",    "Quality",      "",    0.0,   1.0,   0.0,  Taper::Choice,  0.0,  "16 fast|32 fine",  true,  "Voice"         },
        { "dry",      "Dry",          "dB", -60.0,  6.0,   0.0,  Taper::Linear, 20.0,  "",                 true,  "Mix"           },
        { "wet",      "Wet",          "dB", -60.0,  6.0,   0.0,  Taper::Linear, 20.0,  "",                 true,  "Mix"           },
        { "gate",     "Phrase gate",  "dB", -70.0, -20.0, -45.0, Taper::Linear,  0.0,  "",                 true,  "Phrase"        },
    };

    // ── 2. Audio in and out, and probes ────────────────────────────────────────
    inline constexpr int kInputs  = 2;
    inline constexpr int kOutputs = 2;
    inline constexpr const char* kProbes[] = { "gate", "sent", "late", "busy", "helper" };
    inline constexpr int kNumProbes = 5;

    // The phrase cutter, the same numbers as standalone/segmenter.py.
    inline constexpr int    kBlock        = 512;    // analysis block, in samples, at any rate
    inline constexpr int    kOnsetBlocks  = 2;      // loud blocks in a row that open a phrase
    inline constexpr double kHangoverSec  = 0.30;   // quiet that closes it
    inline constexpr double kMinPhraseSec = 0.20;   // shorter is a click
    inline constexpr double kMaxPhraseSec = 8.0;    // longer is cut and sent
    inline constexpr int    kSlots        = 6;      // phrases in flight at once
    inline constexpr int    kMaxTaps      = 4;

    enum SlotState : int { Free, Capturing, Queued, Converting, Done };

    struct Slot
    {
        std::atomic<int> state { Free };
        std::vector<float> in;                 // the phrase, mono; sized in prepare()
        int len = 0;

        // Written by the audio thread before Queued; read by the worker after.
        int64_t end = 0, delay = 0;
        int repeats = 1, voice = 0, steps = 16, seq = 0;
        int next = 0;                          // the worker's: the next repeat to sing
        double feedback = 0.6, hold = 1.0, letgo = 0.5;

        // Written by the worker; tapReady publishes out[tapSrc[i]] and tapLen[i].
        std::array<std::vector<float>, kMaxTaps> out;
        std::array<int, kMaxTaps> tapSrc {}, tapLen {};
        std::array<std::atomic<bool>, kMaxTaps> tapReady {};

        // The audio thread's playback state.
        std::array<int64_t, kMaxTaps> tapStart {};
        std::array<int, kMaxTaps> tapPos {};
    };

    // The melody knob of repeat i: the first holds `hold`, each later one lets go by `letgo`.
    inline double tapCoupling (double hold, double letgo, int i) { return hold * std::pow (1.0 - letgo, (double) i); }

    // ── 3. State and the per-sample update ─────────────────────────────────────
    struct Algorithm
    {
        double sr = 44100.0;
        double probes[kNumProbes] {};

        std::array<Slot, kSlots> slots;
        std::atomic<int64_t> nowShared { 0 };
        std::atomic<bool> helperUp { false };
        std::atomic<bool> quit { false };
        std::thread worker;
        sd::HelperLink link;

        // audio thread
        int64_t now = 0;
        std::array<float, kBlock * kOnsetBlocks> pre {};
        int prePos = 0, blockPos = 0, above = 0, below = 0, hangBlocks = 1, minLen = 0, maxLen = 0;
        double acc = 0.0;
        int capturing = -1, seq = 0;
        double sent = 0, late = 0;

        Algorithm() = default;
        Algorithm (const Algorithm&) = delete;
        ~Algorithm() { stop(); }

        void stop()
        {
            if (! worker.joinable()) return;
            quit = true;
            link.interrupt();
            worker.join();
            link.close();
        }

        // Message thread, before audio starts. Allocates every buffer; (re)starts the worker.
        void prepare (double sampleRate)
        {
            stop();
            sr = sampleRate;
            hangBlocks = std::max (1, (int) std::lround (kHangoverSec * sr / kBlock));
            minLen = (int) std::lround (kMinPhraseSec * sr);
            maxLen = (int) std::lround (kMaxPhraseSec * sr);
            for (auto& s : slots)
            {
                s.in.assign ((size_t) (maxLen + kBlock * (kOnsetBlocks + 1)), 0.0f);
                for (auto& o : s.out) o.reserve ((size_t) (maxLen * 1.25));
                s.state = Free;
            }
            quit = false;
            worker = std::thread ([this] { run(); });
        }

        // Audio thread. Clears the phrase cutter; echoes already on their way keep coming.
        void reset (const double*)
        {
            if (capturing >= 0) slots[(size_t) capturing].state.store (Free, std::memory_order_release);
            capturing = -1;
            pre.fill (0.0f);
            prePos = blockPos = above = below = 0;
            acc = 0.0;
        }

        void step (const double* v, const float* in, float* out)
        {
            const float mono = 0.5f * (in[0] + in[1]);

            // the phrase cutter: pre-roll ring, capture, and the gate once per block
            pre[(size_t) prePos] = mono;
            prePos = (prePos + 1) % (int) pre.size();
            if (capturing >= 0)
            {
                auto& s = slots[(size_t) capturing];
                s.in[(size_t) s.len++] = mono;
            }
            acc += (double) mono * (double) mono;
            if (++blockPos == kBlock)
            {
                const double rms = std::sqrt (acc / kBlock + 1e-12);
                const bool loud = 20.0 * std::log10 (std::max (rms, 1e-9)) >= v[Gate];
                acc = 0.0;
                blockPos = 0;
                if (capturing < 0)
                {
                    above = loud ? above + 1 : 0;
                    if (above >= kOnsetBlocks) open();
                }
                else
                {
                    below = loud ? 0 : below + 1;
                    if (below >= hangBlocks || slots[(size_t) capturing].len >= maxLen) close (v);
                }
            }

            // the echoes
            ++now;
            float echo = 0.0f;
            int busy = 0;
            for (auto& s : slots)
            {
                const int st = s.state.load (std::memory_order_acquire);
                if (st != Free) ++busy;
                if (st != Converting && st != Done) continue;
                bool finished = true;
                double g = 1.0;
                for (int i = 0; i < s.repeats; ++i, g *= s.feedback)
                {
                    if (! s.tapReady[(size_t) i].load (std::memory_order_acquire)) { finished = false; continue; }
                    const int len = s.tapLen[(size_t) i];
                    if (len == 0) continue;   // the helper gave nothing back for this repeat
                    if (s.tapStart[(size_t) i] < 0)
                    {
                        const int64_t due = s.end + (int64_t) (i + 1) * s.delay;
                        s.tapStart[(size_t) i] = std::max (due, now);
                        if (now > due) late += 1;
                    }
                    if (now < s.tapStart[(size_t) i]) { finished = false; continue; }
                    int& pos = s.tapPos[(size_t) i];
                    if (pos < len)
                    {
                        echo += (float) g * s.out[(size_t) s.tapSrc[(size_t) i]][(size_t) pos++];
                        finished = false;
                    }
                }
                if (st == Done && finished) s.state.store (Free, std::memory_order_release);
            }
            nowShared.store (now, std::memory_order_relaxed);

            const float dry = (float) std::pow (10.0, v[Dry] / 20.0);
            const float wet = (float) std::pow (10.0, v[Wet] / 20.0);
            out[0] = dry * in[0] + wet * echo;
            out[1] = dry * in[1] + wet * echo;

            probes[0] = capturing >= 0 ? 1.0 : 0.0;
            probes[1] = sent;
            probes[2] = late;
            probes[3] = busy;
            probes[4] = helperUp.load (std::memory_order_relaxed) ? 1.0 : 0.0;
        }

        void open()
        {
            for (int k = 0; k < kSlots; ++k)
            {
                int expect = Free;
                if (! slots[(size_t) k].state.compare_exchange_strong (expect, Capturing, std::memory_order_acq_rel)) continue;
                auto& s = slots[(size_t) k];
                const int n = (int) pre.size();
                for (int j = 0; j < n; ++j) s.in[(size_t) j] = pre[(size_t) ((prePos + j) % n)];   // oldest first
                s.len = n;
                capturing = k;
                below = 0;
                return;
            }
            above = 0;   // every slot is busy: this phrase is let go
        }

        void close (const double* v)
        {
            auto& s = slots[(size_t) capturing];
            const int sung = s.len - below * kBlock;   // the hangover's quiet doesn't count toward a phrase
            above = below = 0;
            if (sung < minLen) { s.state.store (Free, std::memory_order_release); capturing = -1; return; }
            s.end      = now + 1;
            s.delay    = (int64_t) std::lround (v[Delay] * sr);
            s.repeats  = std::clamp ((int) v[Repeats] + 1, 1, kMaxTaps);
            s.feedback = v[Feedback];
            s.voice    = (int) v[Voice];
            s.hold     = v[Hold];
            s.letgo    = v[LetGo];
            s.steps    = v[Steps] > 0.5 ? 32 : 16;
            s.seq      = ++seq;
            for (int i = 0; i < kMaxTaps; ++i)
            {
                s.tapReady[(size_t) i].store (false, std::memory_order_relaxed);
                s.tapStart[(size_t) i] = -1;
                s.tapPos[(size_t) i] = 0;
                s.tapLen[(size_t) i] = 0;
            }
            s.state.store (Queued, std::memory_order_release);
            sent += 1;
            capturing = -1;
        }

        // ── the worker thread: phrases to the helper, echoes back ─────────────
        // One echo at a time, always the one due soonest across every phrase in
        // flight, so a new phrase's first repeat is never stuck behind an older
        // phrase's last one.
        void run()
        {
            const std::string path = sd::helperSocketPath();
            while (! quit.load())
            {
                for (auto& s : slots)
                {
                    int expect = Queued;
                    if (s.state.compare_exchange_strong (expect, Converting, std::memory_order_acq_rel))
                        s.next = 0;
                }
                Slot* job = nullptr;
                int64_t soonest = 0;
                for (auto& s : slots)
                {
                    if (s.state.load (std::memory_order_acquire) != Converting || s.next >= s.repeats) continue;
                    const int64_t due = s.end + (int64_t) (s.next + 1) * s.delay;
                    if (job == nullptr || due < soonest) { job = &s; soonest = due; }
                }
                if (job == nullptr) { std::this_thread::sleep_for (std::chrono::milliseconds (10)); continue; }

                if (! link.connected() && ! link.open (path)) link.close();
                helperUp = link.connected();

                const int i = job->next++;
                const double k = tapCoupling (job->hold, job->letgo, i);
                int src = i;
                for (int j = 0; j < i; ++j)   // the same knob as an earlier repeat: sing it once
                    if (std::abs (tapCoupling (job->hold, job->letgo, j) - k) < 0.005 && job->tapLen[(size_t) j] > 0) { src = j; break; }
                auto& o = job->out[(size_t) i];
                if (src == i)
                {
                    double ms = 0.0;
                    const bool ok = link.connected() && ! link.voices.empty()
                        && link.convert (job->in.data(), job->len, (int) std::lround (sr),
                                         link.voices[(size_t) job->voice % link.voices.size()], job->steps, k, 7 + i, o, ms);
                    if (ok) fadeEdges (o); else o.clear();
                    helperUp = link.connected();
                }
                job->tapSrc[(size_t) i] = src;
                job->tapLen[(size_t) i] = (int) job->out[(size_t) src].size();
                job->tapReady[(size_t) i].store (true, std::memory_order_release);
                if (job->next >= job->repeats) job->state.store (Done, std::memory_order_release);
            }
        }

        // 5 ms in and out, so an echo never starts or stops on a click.
        void fadeEdges (std::vector<float>& o) const
        {
            const int n = std::min ((int) o.size() / 2, (int) (0.005 * sr));
            for (int j = 0; j < n; ++j)
            {
                const float g = (float) j / (float) n;
                o[(size_t) j] *= g;
                o[o.size() - 1 - (size_t) j] *= g;
            }
        }
    };
}
