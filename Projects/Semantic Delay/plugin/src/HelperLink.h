// HelperLink.h — the plugin's side of the helper's wire (daemon/RPC-v0.1.md, RPC-v0.2.md).
//
// Plain POSIX and std, no JUCE, so the end-to-end test in tests/ builds it with
// clang++ alone. Only the worker thread touches it: every call here blocks.
//
// Frames: uint32 big-endian LEN (kind + payload), uint8 KIND, payload.
// A call is a REQUEST_HEADER (JSON), maybe a REQUEST_BLOB, then a
// RESPONSE_HEADER (+ RESPONSE_BLOB) or an ERROR. PROGRESS frames are skipped.
#pragma once

#include <atomic>
#include <cerrno>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>

namespace sd
{
    enum : uint8_t { kReqHeader = 0x01, kReqBlob = 0x02, kRespHeader = 0x10, kRespBlob = 0x11,
                     kProgress = 0x20, kError = 0x30 };

    // Where the helper listens: $SEMANTIC_DELAY_SOCK, else
    // $SEMANTIC_DELAY_RUNTIME_DIR/daemon.sock, else /tmp/semantic-delay-<uid>/daemon.sock.
    inline std::string helperSocketPath()
    {
        if (const char* s = std::getenv ("SEMANTIC_DELAY_SOCK")) return s;
        if (const char* d = std::getenv ("SEMANTIC_DELAY_RUNTIME_DIR")) return std::string (d) + "/daemon.sock";
        return "/tmp/semantic-delay-" + std::to_string ((unsigned) getuid()) + "/daemon.sock";
    }

    // ── the few JSON reads the plugin needs; the helper writes compact JSON ──
    inline size_t jsonKey (const std::string& j, const char* key, size_t from = 0)
    {
        const std::string k = std::string ("\"") + key + "\":";
        const size_t at = j.find (k, from);
        return at == std::string::npos ? at : at + k.size();
    }
    inline double jsonNumber (const std::string& j, const char* key, double fallback, size_t from = 0)
    {
        const size_t at = jsonKey (j, key, from);
        return at == std::string::npos ? fallback : std::strtod (j.c_str() + at, nullptr);
    }
    inline std::string jsonString (const std::string& j, const char* key, size_t from = 0)
    {
        size_t at = jsonKey (j, key, from);
        if (at == std::string::npos || at >= j.size() || j[at] != '"') return {};
        const size_t end = j.find ('"', at + 1);
        return end == std::string::npos ? std::string() : j.substr (at + 1, end - at - 1);
    }

    struct HelperLink
    {
        int fd = -1;
        std::atomic<int> liveFd { -1 };   // so another thread can shut the socket to unblock us
        bool coupling = false;            // the helper speaks v0.2 and lists "coupling"
        std::vector<std::string> voices;  // prompt ids, in the helper's order
        std::string lastError;
        int calls = 0;

        bool connected() const { return fd >= 0; }

        void close()
        {
            liveFd.store (-1);
            if (fd >= 0) ::close (fd);
            fd = -1;
        }

        // From any thread: unblocks a worker stuck in a read.
        void interrupt()
        {
            const int f = liveFd.load();
            if (f >= 0) ::shutdown (f, SHUT_RDWR);
        }

        bool writeAll (const void* p, size_t n)
        {
            auto* c = static_cast<const char*> (p);
            while (n > 0)
            {
                const ssize_t w = ::send (fd, c, n, 0);
                if (w < 0 && errno == EINTR) continue;
                if (w <= 0) return false;
                c += w; n -= (size_t) w;
            }
            return true;
        }
        bool readAll (void* p, size_t n)
        {
            auto* c = static_cast<char*> (p);
            while (n > 0)
            {
                const ssize_t r = ::recv (fd, c, n, 0);
                if (r < 0 && errno == EINTR) continue;
                if (r <= 0) return false;
                c += r; n -= (size_t) r;
            }
            return true;
        }
        bool sendFrame (uint8_t kind, const void* payload, size_t n)
        {
            const uint32_t len = (uint32_t) (n + 1);
            const unsigned char head[5] = { (unsigned char) (len >> 24), (unsigned char) (len >> 16),
                                            (unsigned char) (len >> 8), (unsigned char) len, kind };
            return writeAll (head, 5) && (n == 0 || writeAll (payload, n));
        }
        bool recvFrame (uint8_t& kind, std::vector<char>& payload)
        {
            unsigned char head[5];
            if (! readAll (head, 5)) return false;
            const uint32_t len = ((uint32_t) head[0] << 24) | ((uint32_t) head[1] << 16) | ((uint32_t) head[2] << 8) | head[3];
            if (len < 1 || len > 0x04000000u) return false;
            kind = head[4];
            payload.resize (len - 1);
            return len == 1 || readAll (payload.data(), len - 1);
        }

        // Send a header (and a blob), return the response header's JSON; the blob, if
        // any, lands in blob. false on an ERROR frame or a broken connection.
        bool call (const std::string& header, const void* blobData, size_t blobBytes,
                   std::string& response, std::vector<char>* blob)
        {
            if (! sendFrame (kReqHeader, header.data(), header.size())) { lastError = "send failed"; close(); return false; }
            if (blobData != nullptr && ! sendFrame (kReqBlob, blobData, blobBytes)) { lastError = "send failed"; close(); return false; }
            std::vector<char> p;
            uint8_t kind = 0;
            for (;;)
            {
                if (! recvFrame (kind, p)) { lastError = "connection lost"; close(); return false; }
                if (kind == kProgress) continue;
                response.assign (p.begin(), p.end());
                if (kind == kError) { lastError = jsonString (response, "code") + " " + jsonString (response, "message"); return false; }
                if (kind != kRespHeader) { lastError = "unexpected frame"; close(); return false; }
                break;
            }
            if (blob != nullptr && jsonKey (response, "output") != std::string::npos)
            {
                if (! recvFrame (kind, *blob) || kind != kRespBlob) { lastError = "no audio came back"; close(); return false; }
            }
            return true;
        }

        // Connect, say hello in v0.2 (falling back to v0.1), and read the voices.
        bool open (const std::string& path)
        {
            close();
            fd = ::socket (AF_UNIX, SOCK_STREAM, 0);
            if (fd < 0) { lastError = "no socket"; return false; }
            int one = 1;
            ::setsockopt (fd, SOL_SOCKET, SO_NOSIGPIPE, &one, sizeof one);
            sockaddr_un addr {};
            addr.sun_family = AF_UNIX;
            std::snprintf (addr.sun_path, sizeof addr.sun_path, "%s", path.c_str());
            if (::connect (fd, (sockaddr*) &addr, sizeof addr) != 0)
            {
                lastError = "no helper at " + path;
                ::close (fd); fd = -1;
                return false;
            }
            liveFd.store (fd);

            std::string r;
            coupling = false;
            if (call (R"({"method":"hello","id":"h-sd","protocol_version":"0.2"})", nullptr, 0, r, nullptr))
                coupling = r.find ("\"coupling\"") != std::string::npos;
            else if (! connected() || ! call (R"({"method":"hello","id":"h-sd","protocol_version":"0.1"})", nullptr, 0, r, nullptr))
                return false;   // a v0.1 helper closes after the mismatch; that is the honest end of it

            voices.clear();
            if (! call (R"({"method":"prompts.list","id":"pl-sd"})", nullptr, 0, r, nullptr)) return false;
            const size_t list = jsonKey (r, "prompts");
            for (size_t at = list; at != std::string::npos; )
            {
                at = jsonKey (r, "id", at);
                if (at == std::string::npos) break;
                voices.push_back (jsonString (r, "id", at - 5));
                at += 1;
            }
            return true;
        }

        // One conversion. k < 0 sends no melody knob (v0.1 behaviour).
        bool convert (const float* pcm, int n, int sampleRate, const std::string& prompt, int steps,
                      double k, int seed, std::vector<float>& out, double& wallMs)
        {
            char head[640];
            char knob[160] = "";
            if (k >= 0.0 && coupling)
                std::snprintf (knob, sizeof knob, R"(,"coupling":{"k":%.4f,"seed":%d})", k, seed);
            std::snprintf (head, sizeof head,
                R"({"method":"convert","id":"c-sd-%d","prompt_id":"%s","input":{"sample_rate":%d,"channels":1,"encoding":"pcm_f32le","byte_length":%d},"options":{"n_steps":%d,"cfg":3.0,"auto_shift":true,"pitch_shift":0,"output_sample_rate":null%s}})",
                ++calls, prompt.c_str(), sampleRate, n * 4, steps, knob);
            std::string r;
            std::vector<char> blob;
            if (! call (head, pcm, (size_t) n * 4, r, &blob)) return false;
            wallMs = jsonNumber (r, "wall_clock_ms", 0.0);
            out.resize (blob.size() / 4);
            std::memcpy (out.data(), blob.data(), out.size() * 4);   // pcm_f32le; this Mac is little-endian
            return true;
        }
    };
}
