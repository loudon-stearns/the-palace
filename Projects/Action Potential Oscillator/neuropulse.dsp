declare name        "NeuroPulse";
declare version     "0.2.0";
declare author      "Action Potential Oscillator (palace steward)";
declare description "Population of N Stage-4 action-potential neurons, pulse-coupled through the crowd's mean field. Each neuron is the charge / spike-rise / spike-fall / refractory state machine from neural_oscillator_dev_plan.md. Heterogeneity spreads each neuron's rate, leak and threshold; coupling K adds the share of neurons spiking right now to every charging neuron's drive. First version that compiles (Faust 2.88, 2026-10-14).";
declare copyright   "Loudon Stearns / The Palace, 2026";

// =============================================================================
// NeuroPulse v0.2 — the first build that compiles
// =============================================================================
// v0.1 (June 2026) never compiled: its neuron defined V, phase, timer and
// velocity as four separate `~` loops that each reached into the others
// (`phase ~ _` inside V's own recursion, `V'` inside phase's), which sends the
// Faust evaluator into infinite recursion ("stack overflow in eval"). Its
// jitter hash also mapped to [-1, 2N] instead of [-1, 1].
//
// v0.2 fixes both at the root:
//   1. ONE recursion per neuron over the whole state tuple (V, phase, timer, vel):
//        step(V, ph, t, vel) = (V', ph', t', vel')   closed by  step ~ si.bus(4)
//   2. The population needs no deinterleave at all: the bank emits
//      V0,s0,V1,s1,...  and `:> (_,_)` sums channels by parity, giving
//      (sum of V, sum of spikes) in one merge.
//   3. The mean field is the FIRST output of the body, so `~ _` feeds back
//      exactly that channel.
//
// Every parameter is still a signal: neuropulse(K, ...) takes them as
// arguments so a render script can drive K with a sweep, and process wires
// them to sliders.
// =============================================================================

import("stdfaust.lib");

N = 16;  // population size (compile-time; par() unrolls)

// 4-way select on an integer phase 0..3
select4(i, a, b, c, d) = select2(i >= 2, select2(i == 1, a, b), select2(i == 3, c, d));

// Reproducible per-neuron offset in [-1, 1]
fract(x)  = x - floor(x);
jitter(i) = fract(sin(i * 12.9898 + 78.233) * 43758.5453) * 2.0 - 1.0;

ms2samp(t) = t * 0.001 * ma.SR;

// -----------------------------------------------------------------------------
// neuron — one Stage-4 oscillator, outputs (audio, spike_indicator)
// -----------------------------------------------------------------------------
neuron(i, freq, tau_ms, spike_ms, rise_frac, peak, hyp, damp, refr_ms,
       h_f, h_tau, h_thr, K, coupling) = (step ~ si.bus(4)) : out
with {
    j        = jitter(i);
    my_freq  = max(1.0, freq   * (1.0 + h_f   * j));
    my_tau   = max(0.1, tau_ms * (1.0 + h_tau * jitter(i + 101)));
    thr      = max(0.1, 1.0    + h_thr * jitter(i + 211));

    leak_tau   = max(2.0, ms2samp(my_tau));
    leak_coeff = 1.0 - 1.0 / leak_tau;
    period     = ma.SR / my_freq;

    spike_s  = max(2.0, ms2samp(spike_ms));
    rise_s   = max(1.0, spike_s * rise_frac);
    fall_s   = max(1.0, spike_s - rise_s);
    refr_s   = max(1.0, ms2samp(refr_ms));

    // frequency compensation: spike + refractory come out of the period
    charge_s = max(1.0, period - spike_s - refr_s);

    // drive that reaches threshold in charge_s samples from rest, with leak:
    // V_n = d * leak_tau * (1 - leak_coeff^n)  ->  solve V_charge_s = thr
    drive0 = thr / (leak_tau * (1.0 - pow(leak_coeff, charge_s)));
    drive  = drive0 + K * coupling;

    rise_rate = (peak - thr) / rise_s;
    fall_rate = (hyp - peak) / fall_s;
    spring_k  = 1.0 / leak_tau;

    step(V, ph, t, vel) = (nV, nph, nt, nvel)
    with {
        p = int(ph);

        chargeV  = V * leak_coeff + drive;
        fires    = chargeV >= thr;
        rise_end = (t + 1) >= rise_s;
        fall_end = (t + 1) >= fall_s;
        rec_end  = ((t + 1) >= refr_s) & (V > hyp * 0.3);

        accel    = -spring_k * V - damp * 2.0 * sqrt(spring_k) * vel;
        recVel   = vel + accel;

        // on firing, latch V at threshold (no discontinuity into the rise)
        nV   = select4(p, select2(fires, chargeV, thr), V + rise_rate,
                          V + fall_rate, V + recVel);
        nph  = select4(p, select2(fires, 0, 1), select2(rise_end, 1, 2),
                          select2(fall_end, 2, 3), select2(rec_end, 3, 0));
        nt   = select2(nph != ph, t + 1, 0);
        nvel = select2(p == 3, 0.0, recVel) * (nph == 3);
    };

    out(V, ph, t, vel) = ((V - hyp) / (peak - hyp) * 2.0 - 1.0), (int(ph) == 1);
};

// -----------------------------------------------------------------------------
// The crowd
// -----------------------------------------------------------------------------
// body takes the mean field (fed back, one sample late) and returns
// (mean_field, audio). `~ _` closes the loop over the first output only.
crowd(freq, tau_ms, spike_ms, rise_frac, peak, hyp, damp, refr_ms,
      h_f, h_tau, h_thr, K, gain) = body ~ _ : (_, _)
with {
    body(mf) = par(i, N, neuron(i, freq, tau_ms, spike_ms, rise_frac, peak, hyp,
                                damp, refr_ms, h_f, h_tau, h_thr, K, mf))
             :> (_, _)                                   // (sum V, sum spikes)
             : (*(gain / N), /(N))                       // (audio, mean field)
             : ro.cross(2);                              // (mean field, audio)
};
// crowd outputs (mean_field, audio): the mean field is the raster's shadow,
// handy for measuring synchrony; process keeps only the audio.

// -----------------------------------------------------------------------------
// UI
// -----------------------------------------------------------------------------
freq     = hslider("h:neuron/[01]frequency (Hz)[style:knob]", 110, 20, 1000, 0.01);
tau_ms   = hslider("h:neuron/[02]leak tau (ms)[style:knob]", 5.0, 0.1, 50.0, 0.01);
spike_ms = hslider("h:neuron/[03]spike (ms)[style:knob]", 1.0, 0.1, 5.0, 0.01);
rise_fr  = hslider("h:neuron/[04]rise fraction[style:knob]", 0.3, 0.05, 0.95, 0.001);
peak     = hslider("h:neuron/[05]spike peak[style:knob]", 1.5, 1.01, 3.0, 0.001);
hyp      = hslider("h:neuron/[06]hyperpolarization[style:knob]", -0.2, -0.8, -0.01, 0.001);
damp     = hslider("h:neuron/[07]recovery damping[style:knob]", 0.3, 0.05, 2.0, 0.001);
refr_ms  = hslider("h:neuron/[08]refractory (ms)[style:knob]", 1.5, 0.1, 20.0, 0.01);

K        = hslider("h:population/[01]K coupling[style:knob]", 0.0, 0.0, 0.2, 0.0001);
h_f      = hslider("h:population/[02]rate spread[style:knob]", 0.05, 0.0, 0.5, 0.001);
h_tau    = hslider("h:population/[03]leak spread[style:knob]", 0.05, 0.0, 0.5, 0.001);
h_thr    = hslider("h:population/[04]threshold spread[style:knob]", 0.02, 0.0, 0.3, 0.001);
gain     = hslider("h:population/[05]gain[style:knob]", 0.4, 0.0, 1.0, 0.001);

neuropulse(Kc) = crowd(freq, tau_ms, spike_ms, rise_fr, peak, hyp, damp, refr_ms,
                       h_f, h_tau, h_thr, Kc, gain);

process = neuropulse(K) : (!, fi.dcblocker);
