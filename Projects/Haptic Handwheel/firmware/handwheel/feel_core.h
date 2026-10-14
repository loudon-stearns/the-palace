// Haptic Handwheel — feel core. Plain C++, no Arduino, no SimpleFOC, so it
// compiles and is tested on a laptop (host-test/) and runs unchanged in the
// sketch (handwheel.ino). The feels match proofs/feel-lab/feel_engine.js;
// host-test/compare.mjs checks that they agree.
//
// What runs here, on the knob, is everything that ANSWERS the hand (springs,
// frets, walls, the string) — the stability sweep showed those cannot cross a
// cable. What is PLAYED INTO the hand (an LFO, a pitch, beat clicks) arrives
// as `played` torque from Max or a CV line and is simply added.
#pragma once
#include <math.h>
#include <stdint.h>

namespace hw {

static const float TAU_F = 6.2831853f;

struct Sense {          // what the device knows this tick
  float th;             // angle, rad (unwrapped)
  float om;             // speed, rad/s (filtered)
  float t;              // seconds since start
  float dt;             // this tick's period, s
};

enum FeelId : uint8_t { FREE = 0, FRETS, STRING, STRUCK, PENDULUM, FOLLOW, TURNTABLE, CENTRE };

struct Params {         // one set per feel; Max can change any of them
  float peak = 0.03f;       // frets: pull toward the nearest semitone, N·m
  float kick = 0.006f;      // frets: push off the ridge between notes, N·m (beat the friction)
  float semisPerTurn = 24;  // pitch range of one turn
  float k = 0.085f;         // spring stiffness, N·m/rad (struck, centre, follow)
  float k3 = 0.25f;         // string: cubic stiffening, N·m/rad³
  float damp = 0.0f;        // extra virtual damping, N·m·s/rad (local, fast)
  float rest = 0.0f;        // spring rest angle, rad
  float rpm = 33.333f;      // turntable speed
  float kv = 0.01f;         // turntable speed gain, N·m per rad/s
  float cap = 0.06f;        // turntable torque cap, N·m
  float target = 0.0f;      // follow: where the knob is pulled, rad (Max sends notes)
  float wallLo = -1e9f, wallHi = 1e9f; // end stops, rad
  float wallK = 3.0f;       // end-stop stiffness, N·m/rad
  // The motor's own brake. Driven by voltage, back-EMF damps the knob for
  // free (≈0.002–0.023 N·m·s/rad on this motor). 1 = cancel it fully (the
  // knob coasts, the struck spring rings); 0 = leave it on (stiff feels stay
  // calm even over a slow cable). See proofs/motor-numbers.
  float cancelBrake = 0.0f;
};

struct Feel {
  FeelId id = FREE;
  Params p;
  // the torque this feel wants, N·m, from what the device senses
  float torque(const Sense& s) const {
    float tau = 0;
    switch (id) {
      case FREE: break;
      case FRETS: {
        const float sp = p.semisPerTurn / TAU_F;           // semitones per radian
        const float a = TAU_F * sp * s.th, sn = sinf(a);
        // the kick pushes the knob off the ridge between two notes, where the
        // fret's pull is too weak to beat friction (proofs/feel-lab, feel map)
        tau = -p.peak * sn - p.kick * ((sn > 0) - (sn < 0)) * 0.5f * (1.0f - cosf(a));
      } break;
      case STRING: { const float x = s.th; tau = -(0.04f * x + p.k3 * x * x * x); } break;
      case STRUCK:   tau = -p.k * (s.th - p.rest); break;
      case PENDULUM: tau = -p.k * sinf(s.th - p.rest); break;
      case CENTRE:   tau = -p.k * (s.th - p.rest); break;
      case FOLLOW:   tau = p.k * (p.target - s.th); break;
      case TURNTABLE: {
        const float w = p.rpm / 60.0f * TAU_F;
        tau = p.kv * (w - s.om);
        if (tau > p.cap) tau = p.cap; if (tau < -p.cap) tau = -p.cap;
      } break;
    }
    tau -= p.damp * s.om;
    if (s.th > p.wallHi) tau -= p.wallK * (s.th - p.wallHi);
    if (s.th < p.wallLo) tau -= p.wallK * (s.th - p.wallLo);
    return tau;
  }
};

struct Motor {          // turning torque into volts for SimpleFOC's voltage mode
  float R = 7.6f;       // Ω per phase (datasheet 15.2 Ω across two leads) — bench pins it
  float kt = 0.2f;      // N·m/A — bench pins it (bracket 0.18–0.42)
  float vMax = 12.0f;   // supply limit for Uq
  // Uq that makes `tau`, optionally cancelling a fraction of the back-EMF brake
  float volts(float tau, float om, float cancelBrake) const {
    float u = tau * R / kt + cancelBrake * kt * om;
    if (u > vMax) u = vMax; if (u < -vMax) u = -vMax;
    return u;
  }
};

// One tick: the feel that answers the hand, plus what is played into it.
inline float tick(const Feel& f, const Sense& s, float played, float tauMax) {
  float tau = f.torque(s) + played;
  if (tau > tauMax) tau = tauMax; if (tau < -tauMax) tau = -tauMax;
  return tau;
}

} // namespace hw
