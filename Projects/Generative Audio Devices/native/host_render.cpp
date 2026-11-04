// host_render.cpp — plays a short phrase through a generated patch and writes
// a WAV, so the native target can be measured without a speaker. Prints one
// line of JSON: peak, rms, any non-finite samples, and the pitch heard in the
// middle of the first note (autocorrelation).
//   clang++ -std=c++17 -O2 -DPATCH_H='"patch.h"' host_render.cpp -o render && ./render out.wav
#include "host_common.h"
#include <cstdio>
#include <vector>
#include <cstdint>
#include <cmath>

struct Ev { float t; int note; bool on; };

int main(int argc, char** argv) {
  const int SR = 48000; const float dt = 1.f / SR;
  std::vector<Ev> ev; float len;
  if (patch::VOICES == 1) {                     // a one-bar bass figure, 124 bpm eighths, then a held note
    int fig[] = {48, 48, 60, 48, 51, 48, 55, 58};
    float e = 60.f / 124 / 2;
    for (int i = 0; i < 8; i++) { ev.push_back({i * e, fig[i], true}); ev.push_back({i * e + e * 0.6f, fig[i], false}); }
    ev.push_back({8 * e, 48, true}); ev.push_back({8 * e + 1.2f, 48, false});
    len = 8 * e + 2.6f;
  } else {                                      // two chords: Cmaj7, then Am9 voiced under it
    int c1[] = {48, 55, 64, 71}, c2[] = {45, 52, 59, 60, 67};
    for (int n : c1) { ev.push_back({0.f, n, true}); ev.push_back({2.5f, n, false}); }
    for (int n : c2) { ev.push_back({2.6f, n, true}); ev.push_back({5.2f, n, false}); }
    len = 8.5f;
  }
  std::stable_sort(ev.begin(), ev.end(), [](const Ev& a, const Ev& b) { return a.t < b.t; });
  int N = int(len * SR); std::vector<float> L(N), R(N);
  Engine eng; size_t k = 0; int bad = 0;
  for (int i = 0; i < N; i++) {
    float t = i * dt;
    while (k < ev.size() && ev[k].t <= t) { ev[k].on ? eng.on(ev[k].note) : eng.off(ev[k].note); k++; }
    eng.tick(dt, L[i], R[i]);
    if (!std::isfinite(L[i]) || !std::isfinite(R[i])) { bad++; L[i] = R[i] = 0; }
  }
  double pk = 0, ss = 0;
  for (int i = 0; i < N; i++) { pk = std::max(pk, (double)std::fabs(L[i])); pk = std::max(pk, (double)std::fabs(R[i])); ss += L[i] * L[i]; }
  // pitch: autocorrelation over 0.05 s of the first note, after its attack
  float a0 = patch::VOICES == 1 ? 8 * (60.f / 124 / 2) + 0.9f : 1.8f; int s0 = int(a0 * SR), W = 4800;
  // the shortest lag whose correlation is within 10% of the best one (avoids octave errors)
  int lo = SR / 1000, hi = SR / 30; W = 9600; std::vector<double> cor(hi + 1, 0.0); double mx = 0;
  for (int lag = lo; lag <= hi; lag++) { double c = 0; for (int j = 0; j < W; j++) c += L[s0 + j] * L[s0 + j + lag]; cor[lag] = c; mx = std::max(mx, c); }
  int best = 0;
  for (int lag = lo + 1; lag < hi; lag++) if (cor[lag] >= 0.9 * mx && cor[lag] >= cor[lag - 1] && cor[lag] >= cor[lag + 1]) { best = lag; break; }
  double hz = 0;
  if (best) { double a = cor[best - 1], b = cor[best], c = cor[best + 1], d = a - 2 * b + c; hz = SR / (best + (d != 0 ? 0.5 * (a - c) / d : 0)); }
  // write WAV, 16-bit stereo
  FILE* f = std::fopen(argc > 1 ? argv[1] : "out.wav", "wb");
  auto w32 = [&](uint32_t x) { std::fwrite(&x, 4, 1, f); }; auto w16 = [&](uint16_t x) { std::fwrite(&x, 2, 1, f); };
  std::fwrite("RIFF", 1, 4, f); w32(36 + N * 4); std::fwrite("WAVEfmt ", 1, 8, f); w32(16); w16(1); w16(2); w32(SR); w32(SR * 4); w16(4); w16(16);
  std::fwrite("data", 1, 4, f); w32(N * 4);
  for (int i = 0; i < N; i++) for (float s : {L[i], R[i]}) { int16_t q = (int16_t)std::lround(std::max(-1.f, std::min(1.f, s)) * 32767); std::fwrite(&q, 2, 1, f); }
  std::fclose(f);
  std::printf("{\"name\":\"%s\",\"voices\":%d,\"seconds\":%.2f,\"peak\":%.4f,\"rms\":%.4f,\"nonfinite\":%d,\"first_note_hz\":%.2f}\n",
              patch::NAME, patch::VOICES, len, pk, std::sqrt(ss / N), bad, hz);
}
