// C++ port of the same per-sample body; mode 0 = unwrapped phases (numpy-identical ops), 1 = wrapped mod 1
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <vector>
#include <chrono>
int main(int argc, char** argv) {
  const int N = atoi(argv[1]); const double B = atof(argv[2]), K = atof(argv[3]), secs = atof(argv[4]);
  const int wrap = atoi(argv[5]); const char* out = argc > 6 ? argv[6] : nullptr;
  const double SR = 44100, F0 = 110.0, dt = 1.0 / SR, TWO_PI = 2.0 * M_PI;
  std::vector<double> n(N), amp(N), DET(N), w(N), p(N, 0.0), ph(N), r(N), s(N);
  char fn[64]; snprintf(fn, sizeof fn, "const_%d.txt", N); FILE* f = fopen(fn, "r");
  for (int k = 0; k < N; ++k) fscanf(f, "%lf", &DET[k]);
  for (int k = 0; k < N; ++k) fscanf(f, "%lf", &ph[k]); fclose(f);
  double nsum = 0; for (int k = 0; k < N; ++k) { n[k] = k + 1; amp[k] = std::pow(n[k], -0.7); w[k] = n[k] * F0 * DET[k]; nsum += n[k]; }
  const double BACK = 21.0 / nsum; double Fp = F0;
  const long steps = (long)(secs * SR); std::vector<float> tone(steps), F(steps);
  auto t0 = std::chrono::steady_clock::now();
  for (long i = 0; i < steps; ++i) {
    double acc = 0;
    for (int k = 0; k < N; ++k) {
      r[k] = n[k] * std::sqrt(1 + B * n[k] * n[k]);
      double g = std::fmin(std::fmax((4000.0 - std::fabs(r[k] * Fp - w[k])) / 1000.0, 0.0), 1.0);
      s[k] = std::sin(TWO_PI * (ph[k] - p[k])) * g; acc += r[k] * s[k];
    }
    const double dth = F0 + BACK * K * acc; double y = 0;
    for (int k = 0; k < N; ++k) {
      p[k] += r[k] * dth * dt; ph[k] += (w[k] - K * s[k]) * dt;
      if (wrap) { p[k] -= std::floor(p[k]); ph[k] -= std::floor(ph[k]); }
      double g = amp[k] * std::fmin(std::fmax((19000.0 - r[k] * dth) / 3000.0, 0.0), 1.0);
      y += g * std::sin(TWO_PI * p[k]);
    }
    Fp = dth; tone[i] = (float)y; F[i] = (float)dth;
  }
  double el = std::chrono::duration<double>(std::chrono::steady_clock::now() - t0).count();
  printf("N=%d  %.1f ns/sample  realtime x%.0f  (%.2f%% of one core)\n", N, el / steps * 1e9, secs / el, 100 * el / secs);
  if (out) { FILE* o = fopen(out, "wb"); fwrite(tone.data(), 4, steps, o); fwrite(F.data(), 4, steps, o); fclose(o); }
}
