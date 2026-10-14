// Haptic Handwheel — first firmware sketch. UNVERIFIED: written without
// Arduino or SimpleFOC installed, never compiled for a board, never run.
// Target: ESP32 dev board + SimpleFOC Mini (or Shield) + GM5208-12 with its
// AS5048A encoder (SPI). Library: Simple FOC (Arduino Library Manager).
//
// Two jobs. PLAY: run a feel from feel_core.h every loop, add torque played
// in from Max, report the angle back. BENCH: the four tests that pin the
// motor's real numbers before anything else is bought (see BENCH.md).
//
// Serial protocol, 921600 baud, one text line per message (Max: [serial] +
// [fromsymbol]). Max → knob:
//   feel <name>              frets | string | struck | pendulum | follow | turntable | centre | free
//   set <param> <value>      any Params field, e.g. "set k 0.2", "set cancelBrake 1"
//   play <N·m>               torque played into the hand (LFO, pitch, beat clicks), held until replaced
//   bench coast | accel-bare | accel-disc | cog | chirp
// knob → Max, every 2 ms in PLAY:
//   a <angle rad> <speed rad/s> <torque N·m>
#include <SimpleFOC.h>   // compiles with SimpleFOC 2.3.3 on arduino-esp32 2.x; 2.3.4+ needs arduino-esp32 3.x (BENCH.md)
#include "feel_core.h"
#include "cog_cancel.h"                              // bench_analyze.py writes cog_map.h; until then this cancels nothing

BLDCMotor motor(7);                                   // 14 poles → 7 pole pairs
BLDCDriver3PWM driver(25, 26, 27, 14);                // ASSUMED pins — match your board
MagneticSensorSPI encoder(AS5048_SPI, 5);             // CS pin ASSUMED

// Bench tests at 12 V. For play, 24 V gives the cancelled brake room to keep
// up with a flick (order/PARTS.md, fit_check.mjs); raise SUPPLY_V to match the
// supply and keep VOLT_LIMIT low until the motor's heat is known.
const float SUPPLY_V = 12.0f, VOLT_LIMIT = 12.0f;

hw::Feel feel;
hw::Motor model;
float played = 0, tauMax = 0.2f;
uint32_t lastReport = 0;

void setup() {
  Serial.begin(921600);
  encoder.init();
  motor.linkSensor(&encoder);
  driver.voltage_power_supply = SUPPLY_V;
  driver.init();
  motor.linkDriver(&driver);
  motor.torque_controller = TorqueControlType::voltage; // no current sensing: back-EMF brakes the knob
  motor.controller = MotionControlType::torque;
  motor.voltage_limit = VOLT_LIMIT;
  motor.init();
  motor.initFOC();
  feel.id = hw::CENTRE; feel.p.k = 0.03f;             // a soft pitch-wheel return to start
}

void parse(String l) {
  l.trim();
  if (l.startsWith("feel ")) {
    String n = l.substring(5);
    if (n == "frets") feel.id = hw::FRETS; else if (n == "string") feel.id = hw::STRING;
    else if (n == "struck") feel.id = hw::STRUCK; else if (n == "pendulum") feel.id = hw::PENDULUM;
    else if (n == "follow") feel.id = hw::FOLLOW; else if (n == "turntable") feel.id = hw::TURNTABLE;
    else if (n == "centre") feel.id = hw::CENTRE; else feel.id = hw::FREE;
  } else if (l.startsWith("set ")) {
    int sp = l.indexOf(' ', 4); String k = l.substring(4, sp); float v = l.substring(sp + 1).toFloat();
    hw::Params& p = feel.p;
    if (k == "peak") p.peak = v; else if (k == "semisPerTurn") p.semisPerTurn = v; else if (k == "k") p.k = v;
    else if (k == "k3") p.k3 = v; else if (k == "damp") p.damp = v; else if (k == "rest") p.rest = v;
    else if (k == "rpm") p.rpm = v; else if (k == "kv") p.kv = v; else if (k == "cap") p.cap = v;
    else if (k == "target") p.target = v; else if (k == "wallLo") p.wallLo = v; else if (k == "wallHi") p.wallHi = v;
    else if (k == "cancelBrake") p.cancelBrake = v; else if (k == "tauMax") tauMax = v;
    else if (k == "R") model.R = v; else if (k == "kt") model.kt = v; else if (k == "cogGain") cogGain = v;
  } else if (l.startsWith("play ")) played = l.substring(5).toFloat();
  else if (l.startsWith("bench ")) bench(l.substring(6));
}

void loop() {
  motor.loopFOC();                                    // reads the encoder, commutates
  static uint32_t lastUs = micros();
  uint32_t now = micros(); float dt = (now - lastUs) * 1e-6f; lastUs = now;
  hw::Sense s{ motor.shaft_angle, motor.shaft_velocity, now * 1e-6f, dt };
  float tau = hw::tick(feel, s, played, tauMax);
  motor.move(model.volts(tau, s.om, feel.p.cancelBrake) + cogCancel(s.th));
  if (Serial.available()) parse(Serial.readStringUntil('\n'));
  if (millis() - lastReport >= 2) {
    lastReport = millis();
    Serial.printf("a %.5f %.4f %.4f\n", s.th, s.om, tau);
  }
}

// ── BENCH. Each test streams CSV lines "b,<test>,<t>,<angle>,<speed>,<Uq>" ──
// then "b,done". bench_analyze.py turns them into the motor's numbers.
void stream(const char* test, float t, float uq) {
  Serial.printf("b,%s,%.6f,%.6f,%.5f,%.4f\n", test, t, motor.shaft_angle, motor.shaft_velocity, uq);
}
void bench(String which) {
  uint32_t t0 = micros(); auto T = [&]() { return (micros() - t0) * 1e-6f; };
  if (which == "coast") {
    // Spin to ~20 rad/s, then coast twice: driver off (bearings only), then
    // driver on at 0 V (bearings + back-EMF brake). The difference is the brake.
    for (int pass = 0; pass < 2; pass++) {
      t0 = micros();
      while (T() < 1.0f) { motor.loopFOC(); motor.move(3.0f); }
      if (pass == 0) motor.disable();
      t0 = micros();
      while (T() < 3.0f) {
        if (pass == 1) { motor.loopFOC(); motor.move(0); } else encoder.update();
        motor.shaft_angle = encoder.getAngle(); motor.shaft_velocity = encoder.getVelocity();
        stream(pass ? "coast-brake" : "coast-free", T(), 0);
        delayMicroseconds(500);
      }
      motor.enable();
    }
  } else if (which == "accel-bare" || which == "accel-disc") {
    // A 2 V step from rest, 0.25 s. Run it bare, then again with a disc of known
    // mass and radius fitted: two accelerations give rotor inertia and kt.
    t0 = micros();
    while (T() < 0.25f) { motor.loopFOC(); motor.move(2.0f); stream(which.c_str(), T(), 2.0f); }
    motor.move(0); delay(800);
  } else if (which == "cog") {
    // Hold the knob with a stiff local spring at 1680 positions per turn (20 per
    // cogging bump on a 12-slot/14-pole motor), forward and then back. The volts
    // needed at each is cogging + friction; going both ways pulls them apart:
    // cogging is the average of the two passes, friction half their gap.
    const int N = 1680;
    for (int pass = 0; pass < 2; pass++) {
      for (int j = 0; j < N; j++) {
        int i = pass ? N - 1 - j : j;
        float target = i * hw::TAU_F / N; t0 = micros();
        while (T() < 0.03f) {
          motor.loopFOC();
          float u = 40.0f * (target - motor.shaft_angle) - 0.4f * motor.shaft_velocity;
          motor.move(u); if (T() > 0.024f) stream(pass ? "cog-rev" : "cog-fwd", target, u);
        }
      }
    }
  } else if (which == "chirp") {
    // Push a sine of torque, 10 → 400 Hz, on a soft spring. The encoder sees
    // the low end; a contact mic on the cap (into your audio interface) hears
    // the high end — that recording is the real test of "can it carry a G".
    t0 = micros(); float ph = 0, last = 0;
    while (T() < 8.0f) {
      motor.loopFOC(); float t = T(), f = 10.0f * powf(40.0f, t / 8.0f);
      ph += hw::TAU_F * f * (t - last); last = t;
      float u = 1.0f * sinf(ph) - 2.0f * motor.shaft_angle;
      motor.move(u + cogCancel(motor.shaft_angle)); stream("chirp", t, u);
    }
  }
  motor.move(0);
  Serial.println("b,done");
}
