// host_common.h — the voice engine every host shares: the app, the WAV
// renderer and the plugin (native target, 2026-11-04). Plays like Rack's
// MIDI-CV module: one voice keeps the last note held and falls back to the
// one under it; several voices take notes in rotation (MIDI_CV polyMode 0,
// ROTATE), the count coming from the PDL's voices.
// Allocates nothing after construction, so a plugin can call it on the audio
// thread: the held notes are a fixed array, as in VST Template's Simple Synth.
#pragma once
#include PATCH_H
#include <algorithm>

struct Engine {
  static constexpr int MAX_HELD = 128;
  patch::Voice v[patch::VOICES];
  int note[patch::VOICES], next = 0;
  int held[MAX_HELD], nheld = 0;
  Engine() { for (int i = 0; i < patch::VOICES; i++) { note[i] = -1; kb(i).set(60, false, 0); } }
  gad::KEYBOARD& kb(int i) { return *reinterpret_cast<gad::KEYBOARD*>(&v[i]); } // KEYBOARD is Voice's first member
  void unhold(int n) {
    int* end = held + nheld; int* it = std::find(held, end, n);
    if (it != end) { std::move(it + 1, end, it); --nheld; }
  }
  void on(int n) {
    unhold(n); if (nheld == MAX_HELD) unhold(held[0]); held[nheld++] = n;
    if (patch::VOICES == 1) { note[0] = n; kb(0).set(n, true, 127); return; }
    int i = next; next = (next + 1) % patch::VOICES;
    note[i] = n; kb(i).set(n, true, 127);
  }
  void off(int n) {
    unhold(n);
    if (patch::VOICES == 1) {
      if (note[0] != n) return;
      if (nheld == 0) kb(0).set(n, false, 0); else { note[0] = held[nheld - 1]; kb(0).set(held[nheld - 1], true, 127); }
      return;
    }
    for (int i = 0; i < patch::VOICES; i++) if (note[i] == n) { kb(i).set(n, false, 0); note[i] = -1; }
  }
  void tick(float dt, float& l, float& r) {
    l = r = 0.f;
    for (auto& x : v) { float a, b; x.process(dt, a, b); l += a; r += b; }
  }
};
