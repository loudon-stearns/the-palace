// Haptic Handwheel — cancel the motor's own bumps. The `bench cog` test maps
// the cogging around one turn; bench_analyze.py fits it as a few harmonics and
// writes cog_map.h (COG_N, COG_H[], COG_A[], COG_B[], in volts). The firmware
// adds the opposite of that map, so frets made in software aren't fighting
// frets the magnets made. Until a map exists this cancels nothing.
#pragma once
#include <math.h>
#if __has_include("cog_map.h")
#include "cog_map.h"
#else
static const int COG_N = 0;
static const float COG_H[1] = {0}, COG_A[1] = {0}, COG_B[1] = {0};
#endif
static float cogGain = 1.0f;   // "set cogGain 0" in Max to feel the raw motor again
inline float cogCancel(float th) {
  float u = 0;
  for (int i = 0; i < COG_N; i++) u += COG_A[i] * cosf(COG_H[i] * th) + COG_B[i] * sinf(COG_H[i] * th);
  return cogGain * u;
}
