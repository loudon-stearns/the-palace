// UserTables.h — Wavetable Scanner: your own tables, read from a folder.
//
// The plugin's Table menu ends in eight folder slots. At each prepare (the host calls it when
// the plugin is switched on, or the sample rate changes), the plugin lists the folder
//     ~/Music/Wavetable Scanner/Tables      (or $WTSC_TABLES, for the checks)
// takes the first eight .wav and .wt files by name, and fills the slots in that order. The
// readers are packer/formats.js readTable and packer/packer.js parseWav + resampleCycle,
// ported: a Surge .wt, a Serum / Vital CLM WAV (the 'clm ' chunk names its frame size), or a
// plain WAV of 1024-sample frames, which is what the page's Ableton and Float buttons save.
// Frames that aren't 1024 long are resampled in the spectrum. A file is read, morphed and
// band-limited once, and every instance shares it until the file changes.
//
// All of this runs in prepare, never on the audio thread.
#pragma once

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <map>
#include <memory>
#include <mutex>
#include <string>
#include <vector>

#include <dirent.h>
#include <sys/stat.h>

namespace algo
{
    inline constexpr int kSlots = 8, kMaxRaw = 512;

    inline uint32_t rd32 (const uint8_t* p) { return (uint32_t) p[0] | ((uint32_t) p[1] << 8) | ((uint32_t) p[2] << 16) | ((uint32_t) p[3] << 24); }
    inline uint16_t rd16 (const uint8_t* p) { return (uint16_t) (p[0] | (p[1] << 8)); }

    // packer.js harmonics + resampleCycle: one cycle of N samples to L, in the spectrum
    inline std::vector<float> resampleCycle (const float* x, int N, int L)
    {
        if (N == L) return std::vector<float> (x, x + N);
        const int K = std::min ((N - 1) / 2, L / 2 - 1), Kh = std::min (N / 2, L / 2 - 1);
        std::vector<double> hr ((size_t) Kh + 1), hi ((size_t) Kh + 1);
        if ((N & (N - 1)) == 0)
        {
            std::vector<double> r (x, x + N), i ((size_t) N, 0.0);
            fft (r.data(), i.data(), N, false);
            for (int k = 0; k <= Kh; k++) { hr[(size_t) k] = r[(size_t) k]; hi[(size_t) k] = i[(size_t) k]; }
        }
        else
        {
            std::vector<double> c ((size_t) N), s ((size_t) N);
            for (int t = 0; t < N; t++) { c[(size_t) t] = std::cos (2 * M_PI * t / N); s[(size_t) t] = std::sin (2 * M_PI * t / N); }
            for (int k = 0; k <= Kh; k++)
            {
                double a = 0, b = 0; int idx = 0;
                for (int t = 0; t < N; t++) { a += x[t] * c[(size_t) idx]; b -= x[t] * s[(size_t) idx]; idx += k; if (idx >= N) idx -= N; }
                hr[(size_t) k] = a; hi[(size_t) k] = b;
            }
        }
        std::vector<double> re ((size_t) L, 0.0), im ((size_t) L, 0.0);
        const double g = (double) L / N;
        for (int k = 0; k <= K; k++)
        {
            re[(size_t) k] = hr[(size_t) k] * g; im[(size_t) k] = hi[(size_t) k] * g;
            if (k > 0) { re[(size_t) (L - k)] = re[(size_t) k]; im[(size_t) (L - k)] = -im[(size_t) k]; }
        }
        if (N % 2 == 0 && N / 2 < L / 2) { const int k = N / 2; re[(size_t) k] = hr[(size_t) k] * g / 2; re[(size_t) (L - k)] = re[(size_t) k]; }
        fft (re.data(), im.data(), L, true);
        std::vector<float> out ((size_t) L);
        for (int i = 0; i < L; i++) out[(size_t) i] = (float) (re[(size_t) i] / L);
        return out;
    }

    // formats.js readTable: a table file → raw 1024-sample frames (empty if it isn't one)
    inline std::vector<float> readTableFile (const std::string& path, int& frames)
    {
        frames = 0;
        std::vector<uint8_t> b;
        if (FILE* f = std::fopen (path.c_str(), "rb"))
        {
            std::fseek (f, 0, SEEK_END); const long n = std::ftell (f); std::fseek (f, 0, SEEK_SET);
            if (n > 0 && n < (64L << 20)) { b.resize ((size_t) n); if (std::fread (b.data(), 1, (size_t) n, f) != (size_t) n) b.clear(); }
            std::fclose (f);
        }
        const size_t n = b.size();
        if (n < 12) return {};
        std::vector<float> raw; int L = 0;
        if (std::memcmp (b.data(), "vawt", 4) == 0)
        {
            L = (int) rd32 (&b[4]); const int count = rd16 (&b[8]), flags = rd16 (&b[10]);
            if ((flags & 1) || L < 2 || count < 1) return {};
            const bool i16 = (flags & 4) != 0;
            const size_t total = (size_t) L * (size_t) count;
            if (12 + total * (i16 ? 2 : 4) > n) return {};
            raw.resize (total);
            const double s = (flags & 8) ? 32768 : 16384;
            for (size_t i = 0; i < total; i++)
            {
                if (i16) raw[i] = (float) ((int16_t) rd16 (&b[12 + i * 2]) / s);
                else { float v; std::memcpy (&v, &b[12 + i * 4], 4); raw[i] = v; }
            }
        }
        else
        {
            if (std::memcmp (b.data(), "RIFF", 4) != 0 || std::memcmp (&b[8], "WAVE", 4) != 0) return {};
            int format = 0, channels = 0, bits = 0, clm = 0; size_t dataOff = 0, dataLen = 0; bool haveFmt = false, haveData = false;
            for (size_t o = 12; o + 8 <= n;)
            {
                const uint32_t len = rd32 (&b[o + 4]); const size_t body = o + 8;
                if (std::memcmp (&b[o], "fmt ", 4) == 0 && body + 16 <= n)
                {
                    format = rd16 (&b[body]); channels = rd16 (&b[body + 2]); bits = rd16 (&b[body + 14]);
                    if (format == 0xFFFE && len >= 26 && body + 26 <= n) format = rd16 (&b[body + 24]);
                    haveFmt = true;
                }
                else if (std::memcmp (&b[o], "data", 4) == 0) { dataOff = body; dataLen = std::min ((size_t) len, n - body); haveData = true; }
                else if (std::memcmp (&b[o], "clm ", 4) == 0 && body + 3 <= n && std::memcmp (&b[body], "<!>", 3) == 0)
                    for (size_t i = body + 3; i < std::min (n, body + 16) && b[i] >= '0' && b[i] <= '9'; i++) clm = clm * 10 + (b[i] - '0');
                o = body + len + (len & 1);
            }
            if (! haveFmt || ! haveData || channels < 1 || bits < 8) return {};
            const int bps = bits / 8; const size_t count = dataLen / ((size_t) bps * (size_t) channels);
            auto sample = [&] (size_t p) -> double
            {
                const uint8_t* q = &b[p];
                if (format == 3 && bits == 32) { float v; std::memcpy (&v, q, 4); return v; }
                if (format == 3 && bits == 64) { double v; std::memcpy (&v, q, 8); return v; }
                if (format == 1 && bits == 8)  return (q[0] - 128) / 128.0;
                if (format == 1 && bits == 16) return (int16_t) rd16 (q) / 32768.0;
                if (format == 1 && bits == 24) return (int32_t) ((uint32_t) q[0] << 8 | (uint32_t) q[1] << 16 | (uint32_t) q[2] << 24) / 2147483648.0;
                if (format == 1 && bits == 32) return (int32_t) rd32 (q) / 2147483648.0;
                return NAN;
            };
            if (std::isnan (sample (dataOff))) return {};
            raw.resize (count);
            for (size_t i = 0; i < count; i++)
            {
                double s = 0;   // averaged in float, as parseWav's Float32Array does
                for (int c = 0; c < channels; c++) s += sample (dataOff + (i * (size_t) channels + (size_t) c) * (size_t) bps);
                raw[i] = (float) (s / channels);
            }
            L = clm > 0 ? clm : kFrame;
            if (raw.size() % (size_t) L != 0 || raw.size() < 2 * (size_t) L) return {};
        }
        int F = (int) (raw.size() / (size_t) L);
        // more frames than the morph needs: thin evenly, ends kept (formats.js thinIndex)
        std::vector<int> pick;
        for (int i = 0; i < std::min (F, kMaxRaw); i++) pick.push_back (F <= kMaxRaw ? i : (int) std::lround ((double) i * (F - 1) / (kMaxRaw - 1)));
        std::vector<float> out (pick.size() * (size_t) kFrame);
        for (size_t i = 0; i < pick.size(); i++)
        {
            const auto c = resampleCycle (raw.data() + (size_t) pick[i] * (size_t) L, L, kFrame);
            std::copy (c.begin(), c.end(), out.begin() + (ptrdiff_t) (i * kFrame));
        }
        frames = (int) pick.size();
        return out;
    }

    inline std::string userTableFolder()
    {
        if (const char* e = std::getenv ("WTSC_TABLES")) if (*e) return e;
        const char* h = std::getenv ("HOME");
        return std::string (h ? h : "") + "/Music/Wavetable Scanner/Tables";
    }

    struct UserTable { std::string name; std::shared_ptr<const WTable> table; };

    // the folder's first eight tables by name, read through a cache every instance shares
    inline std::array<UserTable, kSlots> loadUserTables()
    {
        static std::mutex lock;
        struct Entry { long long mtime = 0, size = 0; std::shared_ptr<const WTable> t; };
        static std::map<std::string, Entry> cache;

        const std::string dir = userTableFolder();
        std::vector<std::string> names;
        if (DIR* d = opendir (dir.c_str()))
        {
            while (dirent* e = readdir (d))
            {
                std::string s = e->d_name; if (s.empty() || s[0] == '.') continue;
                std::string low = s; for (auto& ch : low) ch = (char) std::tolower ((unsigned char) ch);
                const auto ends = [&] (const char* x) { const size_t k = std::strlen (x); return low.size() > k && low.compare (low.size() - k, k, x) == 0; };
                if (ends (".wav") || ends (".wt")) names.push_back (s);
            }
            closedir (d);
        }
        std::sort (names.begin(), names.end(), [] (const std::string& a, const std::string& b)
        {
            std::string x = a, y = b;
            for (auto& c : x) c = (char) std::tolower ((unsigned char) c);
            for (auto& c : y) c = (char) std::tolower ((unsigned char) c);
            return x != y ? x < y : a < b;
        });

        std::array<UserTable, kSlots> out {};
        std::lock_guard<std::mutex> g (lock);
        int slot = 0;
        for (const auto& name : names)
        {
            if (slot == kSlots) break;
            const std::string path = dir + "/" + name;
            struct stat st {};
            if (stat (path.c_str(), &st) != 0) continue;
            auto& c = cache[path];
            if (! c.t || c.mtime != (long long) st.st_mtime || c.size != (long long) st.st_size)
            {
                int F = 0; const auto raw = readTableFile (path, F);
                c = { (long long) st.st_mtime, (long long) st.st_size, nullptr };
                if (F >= 2) c.t = std::make_shared<const WTable> (makeTable (wtdata::Raw { raw.data(), F }));
            }
            if (c.t) out[(size_t) slot++] = { name, c.t };
        }
        return out;
    }
}
