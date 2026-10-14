// Spike-shape experiment harness for neuropulse.dsp.
// Same neuron, same crowd, but every spike-shape control is a command-line
// entry, and the crowd also emits each neuron's own spike flag so the
// analysis can compute the true Kuramoto order parameter from spike times.
// Outputs: (mean_field, audio, K, spike_0 .. spike_{N-1})
np = library("../neuropulse.dsp");
import("stdfaust.lib");

N = 32;

freq     = nentry("freq", 110, 20, 1000, 0.01);
tau_ms   = nentry("tau_ms", 5.0, 0.1, 50, 0.01);
spike_ms = nentry("spike_ms", 1.0, 0.01, 10, 0.001);
rise_fr  = nentry("rise_frac", 0.3, 0.01, 0.99, 0.001);
peak     = nentry("peak", 1.5, 1.01, 3, 0.001);
hyp      = nentry("hyp", -0.2, -0.8, -0.001, 0.001);
damp     = nentry("damp", 0.3, 0.05, 4, 0.001);
refr_ms  = nentry("refr_ms", 1.5, 0.05, 20, 0.01);
h_f      = nentry("h_f", 0.05, 0, 0.5, 0.001);
h_tau    = nentry("h_tau", 0.05, 0, 0.5, 0.001);
h_thr    = nentry("h_thr", 0.02, 0, 0.3, 0.001);

// coupling schedule: K = 0 for the first `free_s` seconds (lets the crowd
// fall out of its synchronized start), then K_on.
K_on   = nentry("K_on", 0, 0, 1, 0.00001);
free_s = nentry("free_s", 1, 0, 60, 0.01);
t = ba.time / ma.SR;
Ksig = select2(t >= free_s, 0.0, K_on);

body(mf) = par(i, N, np.neuron(i, freq, tau_ms, spike_ms, rise_fr, peak, hyp,
                              damp, refr_ms, h_f, h_tau, h_thr, Ksig, mf))
         <: ((si.bus(2 * N) :> (_, _) : (*(1.0 / N), /(N)) : ro.cross(2)),   // (mean field, audio)
             par(i, N, (!, _)));                              // each neuron's spike flag

process = (body ~ _) : (_, _, si.bus(N)) : (_, _, Ksig, si.bus(N));
