// crystal.dsp — the crystal voice in Faust (Crystal Synthesizer, "take it on the road")
//
// The same strike as crystal-voice.codebox and the proofs' additive_strike():
// per-mode phase seeds, 0.70 roll-off between neighbouring modes, decay
// shortening tau_k = decay / (1 + 0.15 k), linear attack, modes at or above
// 0.45 x samplerate skipped without spending a roll-off step. One structure,
// another material: run check_faust.py to null it against the proofs.
//
// freq / gain / gate are Faust's standard voice names, so the polyphonic
// architectures (faust2caqt -nvoices 8, faust2juce -nvoices 8, faustgen~,
// faust2rnbo...) allocate voices themselves. What this file does NOT carry
// from the codebox: the 3 ms fade on a legato restrike (the poly architectures
// don't restrike a sounding voice), and its release starts one sample earlier.
declare name "Crystal Synthesizer";
declare description "Partials from a crystal's phonon modes. Nine lattices on one selector.";
import("stdfaust.lib");

freq    = hslider("freq[unit:Hz]", 110, 20, 5000, 0.01);
gain    = hslider("gain", 1, 0, 1, 0.001);
gate    = button("gate");
crystal = hslider("crystal[style:menu{'Diamond':0;'Fluorite':1;'Tetragonal (hyp.)':2;'Emerald':3;'Ruby':4;'Amethyst':5;'Topaz':6;'Monoclinic (hyp.)':7;'Labradorite':8}]", 0, 0, 8, 1);
attack  = hslider("attack[unit:ms]", 80, 1, 500, 0.1);
decay   = hslider("decay[unit:s]", 5.5, 0.1, 20, 0.01);
release = hslider("release[unit:s]", 0.4, 0.01, 10, 0.01);
rolloff = hslider("rolloff", 0.7, 0.3, 1, 0.001);
level   = hslider("level", 0.5, 0, 1, 0.001);

NMAX = 9;
c = int(max(0, min(8, floor(crystal + 0.5))));

// ratio(k): mode k of the selected crystal, 0 = no mode. Rows are crystals.
row(0) = (1.00, 1.32, 1.48, 1.57, 1.65, 0, 0, 0, 0);             // Diamond      cubic Fd-3m
row(1) = (1.00, 1.00, 1.35, 1.47, 1.69, 2.48, 0, 0, 0);          // Fluorite     cubic Fm-3m
row(2) = (1.00, 1.28, 1.41, 1.70, 1.85, 2.00, 0, 0, 0);          // Tetragonal   hypothesis
row(3) = (1.00, 1.23, 1.47, 1.68, 2.13, 2.30, 3.33, 0, 0);       // Emerald      hexagonal P6/mcc
row(4) = (1.00, 1.10, 1.14, 1.19, 1.52, 1.70, 1.98, 0, 0);       // Ruby         trigonal R-3c
row(5) = (1.00, 1.62, 2.07, 2.77, 3.13, 3.63, 5.45, 6.21, 8.32); // Amethyst     trigonal P3121
row(6) = (1.00, 1.45, 1.91, 2.37, 2.96, 3.68, 4.80, 6.05, 0);    // Topaz        orthorhombic Pbnm
row(7) = (1.00, 1.37, 1.71, 1.94, 2.23, 2.61, 0, 0, 0);          // Monoclinic   hypothesis
row(8) = (1.00, 1.83, 3.17, 4.67, 7.00, 9.50, 13.3, 17.5, 0);    // Labradorite  triclinic C-1
ratio(k) = par(i, 9, ba.take(k + 1, row(i))) : ba.selectn(9, c);

// numpy default_rng(7 + k).uniform(0, 1): the proofs' own phase seeds
seed(k) = ba.take(k + 1, (0.625095466604667, 0.3269722766055607, 0.8702492039700847,
    0.9560017096289753, 0.12857020276919962, 0.2508244581084461, 0.8647975870165865,
    0.8309833188891115, 0.6927433679651523));

trig = (gate > 0) & (gate' <= 0);                    // key down
n    = ((_ + 1) * (1 - trig)) ~ _;                   // samples since the strike, 0 at the strike
hz   = freq : ba.sAndH(trig);                         // the pitch struck
vel  = gain : ba.sAndH(trig);

included(k) = (ratio(k) > 0) & (hz * ratio(k) < ma.SR * 0.45);
amp(0) = 1;
amp(k) = amp(k - 1) * select2(included(k - 1), 1, rolloff);

phase(k) = (\(prev).(select2(trig, ma.frac(prev + hz * ratio(k) / ma.SR), seed(k)))) ~ _;
env(k)   = exp(0 - n / ((decay / (1 + 0.15 * k)) * ma.SR));
mode(k)  = included(k) * amp(k) * env(k) * sin(2 * ma.PI * phase(k));

attackN = floor(attack * 0.001 * ma.SR);
atk     = select2(attackN > 1, 1, min(1, n / (attackN - 1)));
held    = gate > 0;
rel     = (\(prev).(select2(trig, select2(held, prev * exp(-1 / (release * ma.SR)), 1), 1))) ~ _;

process = sum(k, NMAX, mode(k)) * atk * rel * vel * level * 0.6 <: _, _;
