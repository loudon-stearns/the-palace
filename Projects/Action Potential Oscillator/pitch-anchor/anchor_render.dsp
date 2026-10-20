// Pitch-anchor probe for neuropulse.dsp v0.3.
// The crowd of 32 with the anchor applied exactly as np.crowd does, plus each
// neuron's own spike flag, so the analysis can read every member's pitch.
// Coupling: free for free_s seconds, then ramps linearly to K_on over ramp_s.
// Outputs: (mean_field, audio, K, spike_0 .. spike_31)
np = library("../neuropulse.dsp");
import("stdfaust.lib");

N = 32;

freq     = nentry("freq", 110, 20, 1000, 0.01);
h_f      = nentry("h_f", 0.05, 0, 0.5, 0.001);
anchor   = nentry("anchor", 1, 0, 1, 0.001);
K_on     = nentry("K_on", 0, 0, 1, 0.00001);
free_s   = nentry("free_s", 1, 0, 60, 0.01);
ramp_s   = nentry("ramp_s", 0.001, 0.001, 60, 0.01);

t = ba.time / ma.SR;
Ksig = K_on * min(1.0, max(0.0, (t - free_s) / ramp_s));
f_base = np.anchored(N, freq, h_f, anchor);

body(mf) = par(i, N, np.neuron(i, f_base, 5.0, 1.0, 0.3, 1.5, -0.2, 0.3, 1.5,
                              h_f, 0.05, 0.02, Ksig, mf))
         <: ((si.bus(2 * N) :> (_, _) : (*(1.0 / N), /(N)) : ro.cross(2)),
             par(i, N, (!, _)));

process = (body ~ _) : (_, _, si.bus(N)) : (_, _, Ksig, si.bus(N));
