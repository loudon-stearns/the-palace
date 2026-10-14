// Render harness for neuropulse.dsp — drives K from a sweep instead of a slider.
// Outputs: (audio, mean_field, K) so the analysis can line synchrony up with K.
np = library("../neuropulse.dsp")[N = 32;];   // match the Python audition's crowd of 32
import("stdfaust.lib");

sweep_mode = nentry("sweep_mode", 1, 0, 1, 1);      // 1 = sweep, 0 = hold K_fixed
K_fixed    = nentry("K_fixed", 0, 0, 1, 0.0001);
K_max      = nentry("K_max", 0.05, 0, 1, 0.0001);
hold_in    = nentry("hold_in_s", 3, 0, 60, 0.01);
ramp       = nentry("ramp_s", 24, 0.1, 600, 0.01);

t = ba.time / ma.SR;
// triangle 0 -> K_max -> 0 across ramp seconds (mirrors population_audition.py)
x = min(1.0, max(0.0, (t - hold_in) / ramp));
Ksweep = K_max * (1.0 - abs(2.0 * x - 1.0));
Ksig = select2(sweep_mode, K_fixed, Ksweep);

process = np.neuropulse(Ksig) : (_, fi.dcblocker) <: (!, _, _, !), Ksig : (_, _, _);
