// Host test: drive feel_core.h with a scripted sweep of senses and print
// torque, so compare.mjs can check it against the JS feel engine.
#include "../handwheel/feel_core.h"
#include <stdio.h>
using namespace hw;
int main() {
  struct Case { const char* name; FeelId id; Params p; };
  Params d; Params pend = d; Params fol = d; fol.k = 0.25f; fol.damp = 0.004f; fol.target = 0.785f;
  Params cen = d; cen.k = 0.03f; Params walls = d; walls.k = 0.03f; walls.wallLo = -1; walls.wallHi = 1;
  Case cases[] = {
    {"frets", FRETS, d}, {"string", STRING, d}, {"struck", STRUCK, d}, {"pendulum", PENDULUM, pend},
    {"follow", FOLLOW, fol}, {"turntable", TURNTABLE, d}, {"walls", CENTRE, walls},
  };
  printf("feel,th,om,tau\n");
  for (auto& c : cases) {
    Feel f; f.id = c.id; f.p = c.p;
    for (int i = 0; i <= 400; i++) {
      Sense s; s.th = -1.5f + 3.0f * i / 400.0f; s.om = 6.0f * sinf(0.37f * i); s.t = i * 1e-3f; s.dt = 1e-3f;
      printf("%s,%.6f,%.6f,%.8f\n", c.name, s.th, s.om, tick(f, s, 0, 1e6f));
    }
  }
  Motor m; // a sanity line: volts for 0.1 N·m at rest and at 10 rad/s with the brake cancelled
  fprintf(stderr, "Uq(0.1 N·m, still)=%.2f V  Uq(0.1 N·m, 10 rad/s, cancel)=%.2f V\n",
          m.volts(0.1f, 0, 0), m.volts(0.1f, 10, 1));
  return 0;
}
