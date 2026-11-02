// echo_through_helper.cpp — the plugin's own Algorithm.h, driven like a DAW
// would drive it, against the real helper on its socket.
//
// A host in miniature: 512-sample blocks, paced to the wall clock (so the
// helper's compute time lands exactly as it would live), the parameters held
// still. It reads a mono float32 phrase file, writes the stereo float32 output,
// and prints one line per echo: when it was due, when it started, how late.
// run_echo_test.py starts the helper, makes the files, and measures the result.
//
//   echo_through_helper in.f32 sr out.f32 delay repeats hold letgo steps voice
#include "Algorithm.h"

#include <chrono>
#include <cstdio>
#include <map>
#include <thread>
#include <tuple>

int main (int argc, char** argv)
{
    if (argc < 10) { std::fprintf (stderr, "usage: in.f32 sr out.f32 delay repeats hold letgo steps voice\n"); return 2; }
    const double sr = std::atof (argv[2]);
    std::vector<float> in;
    if (FILE* f = std::fopen (argv[1], "rb"))
    {
        float b[4096]; size_t n;
        while ((n = std::fread (b, 4, 4096, f)) > 0) in.insert (in.end(), b, b + n);
        std::fclose (f);
    }
    else { std::perror (argv[1]); return 1; }

    double v[algo::kNumParams];
    for (int i = 0; i < algo::kNumParams; ++i) v[i] = algo::kParams[i].def;
    v[algo::Delay] = std::atof (argv[4]);
    v[algo::Repeats] = std::atof (argv[5]) - 1;
    v[algo::Hold] = std::atof (argv[6]);
    v[algo::LetGo] = std::atof (argv[7]);
    v[algo::Steps] = std::atoi (argv[8]) == 32 ? 1 : 0;
    v[algo::Voice] = std::atof (argv[9]);
    v[algo::Dry] = 0.0;
    v[algo::Wet] = 0.0;

    auto alg = std::make_unique<algo::Algorithm>();
    alg->prepare (sr);
    alg->reset (v);

    const int block = 512;
    const int64_t total = (int64_t) in.size() + (int64_t) ((v[algo::Repeats] + 1) * v[algo::Delay] * sr) + (int64_t) (12 * sr);
    std::vector<float> out;
    out.reserve ((size_t) total * 2);
    std::map<std::tuple<int, int>, std::tuple<int64_t, int64_t, int>> echoes;   // (phrase, repeat) -> due, start, length
    const auto t0 = std::chrono::steady_clock::now();
    bool helperSeen = false;

    for (int64_t n = 0; n < total; n += block)
    {
        for (int j = 0; j < block; ++j)
        {
            const float x = (size_t) (n + j) < in.size() ? in[(size_t) (n + j)] : 0.0f;
            const float io[2] = { x, x };
            float o[2];
            alg->step (v, io, o);
            out.push_back (o[0]);
            out.push_back (o[1]);
        }
        helperSeen |= alg->probes[4] > 0.5;
        for (auto& s : alg->slots)
            for (int i = 0; i < s.repeats; ++i)
                if (s.tapStart[(size_t) i] >= 0 && s.tapLen[(size_t) i] > 0)
                    echoes[{ s.seq, i }] = { s.end + (int64_t) (i + 1) * s.delay, s.tapStart[(size_t) i], s.tapLen[(size_t) i] };
        // pace to the wall clock, as a sound card would
        const auto due = t0 + std::chrono::duration<double> ((double) (n + block) / sr);
        std::this_thread::sleep_until (due);
        if ((size_t) n > in.size() && alg->probes[3] == 0 && ! echoes.empty()) break;   // nothing in flight: done
    }

    if (FILE* f = std::fopen (argv[3], "wb")) { std::fwrite (out.data(), 4, out.size(), f); std::fclose (f); }
    std::printf ("{\"phrases\":%d,\"late\":%d,\"helper\":%s,\"coupling\":%s,\"voices\":%d,\"echoes\":[",
                 (int) alg->probes[1], (int) alg->probes[2], helperSeen ? "true" : "false",
                 alg->link.coupling ? "true" : "false", (int) alg->link.voices.size());
    bool first = true;
    for (auto& [key, val] : echoes)
    {
        std::printf ("%s{\"phrase\":%d,\"repeat\":%d,\"due_s\":%.3f,\"start_s\":%.3f,\"late_s\":%.3f,\"len_s\":%.3f}",
                     first ? "" : ",", std::get<0> (key), std::get<1> (key) + 1,
                     std::get<0> (val) / sr, std::get<1> (val) / sr, (std::get<1> (val) - std::get<0> (val)) / sr, std::get<2> (val) / sr);
        first = false;
    }
    std::printf ("]}\n");
    alg.reset();
    return 0;
}
