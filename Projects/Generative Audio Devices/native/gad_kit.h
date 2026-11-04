// gad_kit.h — the native target's module kit (Generative Audio Devices, 2026-11-04).
//
// One C++ struct per module in native_registry.json. Each works in Rack's own
// units — volts on every cable, 1 V per octave, 10 V gates, ±5 V audio — so a
// PDL patch means the same thing here as in VCV Rack, and the knob values the
// archetypes resolve need no translation. The knob-to-sound curves are read
// from VCV Fundamental's source (github.com/VCVRack/Fundamental, commit
// 10dd016, 2026-06-10); each struct names the lines it follows. The DSP under
// the curves is simpler than Rack's (no oversampling, PolyBLEP instead of
// minBLEP), so the shapes match and the fine texture does not.
//
// A module has: float p[] (knobs, registry index order), float in[] and
// float out[] (volts, port index order), and void process(float dt).
#pragma once
#include <cmath>
#include <algorithm>
#include <cstdlib>

namespace gad {

constexpr float FREQ_C4 = 261.6256f;
inline float clampf(float x, float a, float b) { return std::min(std::max(x, a), b); }
inline float polyblep(float t, float dt) {           // band-limits a step at phase 0
  if (t < dt) { t /= dt; return t + t - t * t - 1.f; }
  if (t > 1.f - dt) { t = (t - 1.f) / dt; return t * t + t + t + 1.f; }
  return 0.f;
}

// VCO.cpp:720-761. pitch = FREQ/12 + V/OCT (+ FM·depth, exponential unless
// FM_MODE > 0, then linear Hz); freq = C4·2^pitch; outputs ±5 V.
struct VCO {
  enum { FREQ, FM_DEPTH, PW, PWM_DEPTH, FM_MODE, SYNC_MODE, N_PARAMS };
  enum { VOCT, FM, SYNC, PWM, N_INPUTS };
  enum { SIN, TRI, SAW, SQR, N_OUTPUTS };
  float p[N_PARAMS] = {0, 0, 0.5f, 0, 0, 1}, in[N_INPUTS] = {}, out[N_OUTPUTS] = {};
  float phase = 0.f, tri = 0.f;
  void process(float dt) {
    float pitch = p[FREQ] / 12.f + in[VOCT];
    float freq;
    if (p[FM_MODE] <= 0.f) freq = FREQ_C4 * std::exp2(pitch + in[FM] * p[FM_DEPTH]);
    else freq = FREQ_C4 * std::exp2(pitch) + FREQ_C4 * in[FM] * p[FM_DEPTH];
    float d = clampf(freq * dt, 0.f, 0.49f);
    float pw = clampf(p[PW] + in[PWM] / 10.f * p[PWM_DEPTH], 0.01f, 0.99f);
    phase += d; if (phase >= 1.f) phase -= 1.f;
    float saw = 2.f * phase - 1.f - polyblep(phase, d);
    float sq = (phase < pw ? 1.f : -1.f) + polyblep(phase, d) - polyblep(std::fmod(phase - pw + 1.f, 1.f), d);
    tri = 0.999f * tri + 4.f * d * sq;                // leaky-integrated square
    out[SIN] = 5.f * std::sin(6.2831853f * phase);
    out[TRI] = 5.f * clampf(tri, -1.f, 1.f);
    out[SAW] = 5.f * saw;
    out[SQR] = 5.f * sq;
  }
};

// VCF.cpp:313-366. cutoff = C4·2^(FREQ·10−5 + FREQ_in·FREQ_CV); resonance =
// (RES + RES_in/10·RES_CV)² · 10, self-oscillating near 4; drive gain =
// (1+DRIVE)^5; input scaled by 1/5 V, outputs scaled back by 5. A four-pole
// ladder with tanh at the input and soft-clipped outputs, as Rack's is.
struct VCF {
  enum { FREQ, RES, RES_CV, FREQ_CV, DRIVE, DRIVE_CV, N_PARAMS };
  enum { FREQ_IN, RES_IN, DRIVE_IN, IN, N_INPUTS };
  enum { LPF, HPF, N_OUTPUTS };
  float p[N_PARAMS] = {0.5f, 0, 1, 0, 0, 1}, in[N_INPUTS] = {}, out[N_OUTPUTS] = {};
  float s[4] = {}, y3 = 0.f;
  void process(float dt) {
    float drive = clampf(p[DRIVE] + in[DRIVE_IN] / 10.f * p[DRIVE_CV], -1.f, 1.f);
    float x = in[IN] / 5.f * std::pow(1.f + drive, 5.f) + 1e-6f * (2.f * float(std::rand()) / float(RAND_MAX) - 1.f);
    float r = clampf(p[RES] + in[RES_IN] / 10.f * p[RES_CV], 0.f, 1.f);
    float k = r * r * 10.f;                           // Rack's scale: self-oscillates near 4
    float fc = clampf(FREQ_C4 * std::exp2(p[FREQ] * 10.f - 5.f + in[FREQ_IN] * p[FREQ_CV]) * dt, 0.f, 0.45f);
    float g = std::tan(3.14159265f * fc); float G = g / (1.f + g);
    float u = std::tanh(clampf(x - k * y3, -4.f, 4.f));
    float y = u;
    for (int i = 0; i < 4; i++) { float v = (y - s[i]) * G; float o = v + s[i]; s[i] = o + v; y = o; }
    y3 = y;
    float hp = u - 4.f * s[0] + 6.f * s[1] - 4.f * s[2] + s[3];  // binomial highpass, as Rack's
    out[LPF] = 5.f * 2.f * std::tanh(y * 0.5f);
    out[HPF] = 5.f * 2.f * std::tanh(hp * 0.5f);
  }
};

// ADSR.cpp:43-46, 96-156. Each stage chases a target exponentially:
// lambda = (10/0.001)^(−knob) / 0.001 per second, so a knob sweeps 1 ms..10 s.
// Attack chases 1.2 and hands over at 1.0; output = 10 V · env.
struct ADSR {
  enum { A, D, S, R, A_CV, D_CV, S_CV, R_CV, PUSH, N_PARAMS };
  enum { A_IN, D_IN, S_IN, R_IN, GATE, RETRIG, N_INPUTS };
  enum { ENV, N_OUTPUTS };
  float p[N_PARAMS] = {0.5f, 0.5f, 0.5f, 0.5f, 0, 0, 0, 0, 0}, in[N_INPUTS] = {}, out[N_OUTPUTS] = {};
  float env = 0.f; bool gate = false, attacking = false; float lastRetrig = 0.f;
  static float lam(float k) { return std::pow(1e4f, -k) / 1e-3f; }
  void process(float dt) {
    float a = clampf(p[A] + in[A_IN] / 10.f * p[A_CV], 0.f, 1.f);
    float d = clampf(p[D] + in[D_IN] / 10.f * p[D_CV], 0.f, 1.f);
    float s = clampf(p[S] + in[S_IN] / 10.f * p[S_CV], 0.f, 1.f);
    float r = clampf(p[R] + in[R_IN] / 10.f * p[R_CV], 0.f, 1.f);
    bool old = gate;
    gate = p[PUSH] > 0.f || in[GATE] >= 1.f;
    if (gate && !old) attacking = true;
    if (in[RETRIG] >= 1.f && lastRetrig < 1.f) attacking = true;
    lastRetrig = in[RETRIG];
    attacking = attacking && gate;
    float target = attacking ? 1.2f : (gate ? s : 0.f);
    float l = attacking ? lam(a) : (gate ? lam(d) : lam(r));
    env += (target - env) * std::min(l * dt, 1.f);
    if (env >= 1.f) attacking = false;
    out[ENV] = 10.f * env;
  }
};

// VCA-1.cpp:36-60. gain = LEVEL · (CV/10 clamped 0..1), raised to the 4th
// power when RESPONSE is 0 (exponential); with no CV cable, gain = LEVEL.
struct VCA {
  enum { LEVEL, RESPONSE, N_PARAMS };
  enum { CV, IN, N_INPUTS };
  enum { OUT, N_OUTPUTS };
  float p[N_PARAMS] = {1, 1}, in[N_INPUTS] = {}, out[N_OUTPUTS] = {};
  bool cvConnected = false;
  void process(float) {
    float g = p[LEVEL];
    if (cvConnected) { float c = clampf(in[CV] / 10.f, 0.f, 1.f); if (p[RESPONSE] == 0.f) c = std::pow(c, 4.f); g *= c; }
    out[OUT] = in[IN] * g;
  }
};

// LFO.cpp:103-200. freq = 1 Hz · 2^(FREQ + FM_in·FM_DEPTH) (clock unpatched:
// clockFreq 2 / 2); OFFSET makes it unipolar 0..10 V, INVERT flips it.
struct LFO {
  enum { FREQ, FM_DEPTH, PW, PWM_DEPTH, OFFSET, INVERT, N_PARAMS };
  enum { FM, CLOCK, RESET, PWM, N_INPUTS };
  enum { SIN, TRI, SAW, SQR, N_OUTPUTS };
  float p[N_PARAMS] = {1, 0, 0.5f, 0, 1, 0}, in[N_INPUTS] = {}, out[N_OUTPUTS] = {};
  float ph = 0.f, lastReset = 0.f;
  void process(float dt) {
    float f = std::exp2(p[FREQ] + in[FM] * p[FM_DEPTH]);
    ph += std::min(f * dt, 0.5f); ph -= std::floor(ph);
    if (in[RESET] >= 2.f && lastReset < 2.f) ph = 0.f;
    lastReset = in[RESET];
    bool off = p[OFFSET] > 0.f; float inv = p[INVERT] > 0.f ? -1.f : 1.f;
    float pw = clampf(p[PW] + in[PWM] / 10.f * p[PWM_DEPTH], 0.01f, 0.99f);
    float q;
    q = off ? ph - 0.25f : ph;           out[SIN] = 5.f * (inv * std::sin(6.2831853f * q) + (off ? 1.f : 0.f));
    q = off ? ph : ph + 0.25f;           out[TRI] = 5.f * (inv * (4.f * std::fabs(q - std::round(q)) - 1.f) + (off ? 1.f : 0.f));
    q = off ? ph - 0.5f : ph;            out[SAW] = 5.f * (inv * 2.f * (q - std::round(q)) + (off ? 1.f : 0.f));
    out[SQR] = 5.f * (inv * (ph < pw ? 1.f : -1.f) + (off ? 1.f : 0.f));
  }
};

// Mixer.cpp:35-67. out = LEVEL · Σ inputs.
struct MIXER {
  enum { LEVEL, N_PARAMS };
  enum { IN1, IN2, IN3, IN4, IN5, IN6, N_INPUTS };
  enum { MIX, N_OUTPUTS };
  float p[N_PARAMS] = {1}, in[N_INPUTS] = {}, out[N_OUTPUTS] = {};
  void process(float) { float s = 0; for (float v : in) s += v; out[MIX] = s * p[LEVEL]; }
};

// VCMixer.cpp:60-127 (Fundamental v2.5.1 and 10dd016). Each channel: input ·
// LVL² (up to +6 dB), times max(0, CV/10) when its CV is cabled (linear; the
// module's exponential CV option is off by default and not built). Mix = sum ·
// MIX_LVL, times max(0, MIX_CV/10) when cabled. A channel with nothing in it
// adds nothing. Inputs in Rack's order: MIX_CV, IN1–4, CV1–4.
struct VCMIXER {
  enum { MIX_LVL, LVL1, LVL2, LVL3, LVL4, N_PARAMS };
  enum { MIX_CV, IN1, IN2, IN3, IN4, CV1, CV2, CV3, CV4, N_INPUTS };
  enum { MIX, OUT1, OUT2, OUT3, OUT4, N_OUTPUTS };
  float p[N_PARAMS] = {1, 1, 1, 1, 1}, in[N_INPUTS] = {}, out[N_OUTPUTS] = {};
  bool in1C = false, in2C = false, in3C = false, in4C = false;
  bool cv1C = false, cv2C = false, cv3C = false, cv4C = false, mixCvC = false;
  void process(float) {
    const bool inC[4] = {in1C, in2C, in3C, in4C}, cvC[4] = {cv1C, cv2C, cv3C, cv4C};
    float mix = 0.f;
    for (int i = 0; i < 4; i++) {
      float o = 0.f;
      if (inC[i]) {
        o = in[IN1 + i] * std::pow(p[LVL1 + i], 2.f);
        if (cvC[i]) o *= std::max(0.f, in[CV1 + i] / 10.f);
        mix += o;
      }
      out[OUT1 + i] = o;
    }
    mix *= p[MIX_LVL];
    if (mixCvC) mix *= std::max(0.f, in[MIX_CV] / 10.f);
    out[MIX] = mix;
  }
};

// Rack core MIDI_CV.cpp:70-96 (v2): PITCH = (note − 60)/12 V, GATE = 10 V
// while held, VELOCITY = vel/127 · 10 V. One per voice; the host sets it.
struct KEYBOARD {
  enum { PITCH, GATE, VELOCITY, N_OUTPUTS = 12 };
  float out[N_OUTPUTS] = {};
  void set(int note, bool held, int vel) {
    out[PITCH] = (note - 60) / 12.f; out[GATE] = held ? 10.f : 0.f; out[VELOCITY] = vel / 127.f * 10.f;
  }
};

} // namespace gad
