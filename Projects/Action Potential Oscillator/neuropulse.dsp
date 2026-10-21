declare name        "NeuroPulse";
declare version     "0.4.0";
declare author      "Action Potential Oscillator (palace steward)";
declare description "Population of N Stage-4 action-potential neurons, pulse-coupled through the crowd's mean field. Each neuron is the charge / spike-rise / spike-fall / refractory state machine from neural_oscillator_dev_plan.md. Heterogeneity spreads each neuron's rate, leak and threshold; coupling K adds the share of neurons spiking right now to every charging neuron's drive. First version that compiles (Faust 2.88, 2026-10-14). v0.3: pitch anchor — a locked crowd plays its fastest member, so anchor 1 puts that member on the dialed note. v0.4: each neuron charges with exactly what is left of its period, from where its membrane really is — notes in tune to within a cent below the refractory ceiling.";
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
       h_f, h_tau, h_thr, K, coupling) = (step ~ si.bus(6)) : out
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

    // Frequency compensation, v0.4: measured, not predicted.
    // v0.2 subtracted the PLANNED spike + refractory from the period and
    // charged from rest. But the spike runs whole samples (a 14.4-sample rise
    // takes 15), the recovery can run long, and the ringing recovery hands
    // the charge a membrane that is not at rest (+0.025 at 110 Hz). Every
    // note came out 3-5 samples short: +13 cents at 110 Hz.
    // Now each neuron counts the samples since it fired (el) and latches the
    // voltage it entered the charge with (v0). The charge gets exactly what
    // is left of the period, from where the membrane really is. This is the
    // Gen~ plan's V_start_actual idea, plus the elapsed-time half.
    // The drive is recomputed every sample from the live frequency, so a
    // pitch CV still bends a charge already under way.
    charge_drive(v0, el, t) = (thr - v0 * c) / (leak_tau * (1.0 - c))
    with {
        m = max(1.0, period - (el - t) - 0.5);   // samples the charge may take; -0.5 centres the whole-sample firing
        c = pow(leak_coeff, m);
    };

    rise_rate = (peak - thr) / rise_s;
    fall_rate = (hyp - peak) / fall_s;
    spring_k  = 1.0 / leak_tau;

    step(V, ph, t, vel, el, v0) = (nV, nph, nt, nvel, nel, nv0)
    with {
        p = int(ph);

        drive    = charge_drive(v0, el, t) + K * coupling;
        chargeV  = V * leak_coeff + drive;
        fires    = chargeV >= thr;
        rise_end = (t + 1) >= rise_s;
        fall_end = (t + 1) >= fall_s;
        rec_end  = ((t + 1) >= refr_s) & (V > hyp * 0.3);

        accel    = -spring_k * V - damp * 2.0 * sqrt(spring_k) * vel;
        recVel   = vel + accel;

        // on firing, latch V at threshold (no discontinuity into the rise)
        // v0.2.1: clamp the spike at its peak and its floor. A spike whose
        // length is not a whole number of samples used to overshoot both,
        // and a very short spike (a click) fell far below the undershoot
        // and spent ~170 extra samples recovering: pitch dropped 110 -> 78 Hz.
        nV   = select4(p, select2(fires, chargeV, thr), min(peak, V + rise_rate),
                          max(hyp, V + fall_rate), V + recVel);
        nph  = select4(p, select2(fires, 0, 1), select2(rise_end, 1, 2),
                          select2(fall_end, 2, 3), select2(rec_end, 3, 0));
        nt   = select2(nph != ph, t + 1, 0);
        nvel = select2(p == 3, 0.0, recVel) * (nph == 3);
        // samples since this neuron last fired; the firing sample counts as 0
        nel  = select2((p == 0) & (nph == 1), el + 1, 0);
        // the voltage the charge starts from, latched as the recovery hands over
        nv0  = select2((p == 3) & (nph == 0), v0, nV);
    };

    out(V, ph, t, vel, el, v0) = ((V - hyp) / (peak - hyp) * 2.0 - 1.0), (int(ph) == 1);
};

// -----------------------------------------------------------------------------
// Pitch anchor (v0.3)
// -----------------------------------------------------------------------------
// A locked crowd plays its FASTEST member's own pitch (measured 2026-10-14 to
// within 0.01 Hz at 5/10/20% spread): the fastest neuron fires first and kicks
// everyone else over threshold. With rates spread symmetrically around the
// dial, a 20% spread locked at 132.6 Hz when 110 was asked for.
// anchor = 0: the spread is centred on the dial (the scattered cloud is on the
//             note, the lock goes sharp — the old behaviour).
// anchor = 1: the spread is shifted down so the fastest member sits on the dial
//             (the lock lands on the note; the scattered cloud sits flat).
// top_jitter(n) is the largest rate offset in a crowd of n, folded at compile time.
top_jitter(n) = tj(n - 1)
with { tj(0) = jitter(0); tj(k) = max(jitter(k), tj(k - 1)); };
anchored(n, freq, h_f, anchor) = freq / (1.0 + anchor * h_f * top_jitter(n));

// -----------------------------------------------------------------------------
// The crowd
// -----------------------------------------------------------------------------
// body takes the mean field (fed back, one sample late) and returns
// (mean_field, audio). `~ _` closes the loop over the first output only.
crowd(freq, tau_ms, spike_ms, rise_frac, peak, hyp, damp, refr_ms,
      h_f, h_tau, h_thr, K, gain, anchor) = body ~ _ : (_, _)
with {
    f_base   = anchored(N, freq, h_f, anchor);
    body(mf) = par(i, N, neuron(i, f_base, tau_ms, spike_ms, rise_frac, peak, hyp,
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
anchor   = hslider("h:population/[06]pitch anchor[style:knob]", 1.0, 0.0, 1.0, 0.001);

neuropulse(Kc) = crowd(freq, tau_ms, spike_ms, rise_fr, peak, hyp, damp, refr_ms,
                       h_f, h_tau, h_thr, Kc, gain, anchor);

process = neuropulse(K) : (!, fi.dcblocker);
