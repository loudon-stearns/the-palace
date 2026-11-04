// host_common.h — the voice engine both hosts share (native target, 2026-11-04).
// Plays like Rack's MIDI-CV module: one voice keeps the last note held and
// falls back to the one under it; several voices take notes in rotation
// (MIDI_CV polyMode 0, ROTATE), the count coming from the PDL's voices.
#pragma once
#include PATCH_H
#include <vector>
#include <algorithm>

struct Engine {
  patch::Voice v[patch::VOICES];
  int note[patch::VOICES], next = 0;
  std::vector<int> held;
  Engine() { for (int i = 0; i < patch::VOICES; i++) { note[i] = -1; kb(i).set(60, false, 0); } }
  gad::KEYBOARD& kb(int i) { return *reinterpret_cast<gad::KEYBOARD*>(&v[i]); } // KEYBOARD is Voice's first member
  void on(int n) {
    held.erase(std::remove(held.begin(), held.end(), n), held.end()); held.push_back(n);
    if (patch::VOICES == 1) { note[0] = n; kb(0).set(n, true, 127); return; }
    int i = next; next = (next + 1) % patch::VOICES;
    note[i] = n; kb(i).set(n, true, 127);
  }
  void off(int n) {
    held.erase(std::remove(held.begin(), held.end(), n), held.end());
    if (patch::VOICES == 1) {
      if (note[0] != n) return;
      if (held.empty()) kb(0).set(n, false, 0); else { note[0] = held.back(); kb(0).set(held.back(), true, 127); }
      return;
    }
    for (int i = 0; i < patch::VOICES; i++) if (note[i] == n) { kb(i).set(n, false, 0); note[i] = -1; }
  }
  void tick(float dt, float& l, float& r) {
    l = r = 0.f;
    for (auto& x : v) { float a, b; x.process(dt, a, b); l += a; r += b; }
  }
};
