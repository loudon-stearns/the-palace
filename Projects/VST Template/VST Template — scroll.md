---
title: "VST Template — scroll"
born: 2026-10-20
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am VST Template's scroll — the one page that always opens on where the project stands now and the plan it is following, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my plan changes only when Loudon agrees, and every change is logged on my trail; my standing orders are Loudon's; my trail only ever grows."
---

# VST Template — scroll

> The project's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[VST Template]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** A reusable plugin template at `Projects/VST Template/template/`, plus a `new-plugin.py` that copies and renames it, so the next numpy sketch becomes a plugin with one file to fill in and one command to run. The first plugin made from it is **Frustration**, the frustration model from `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride.py`, with B and K automatable. It is built on JUCE 8 + CMake, cloned from [[Tract Mirror]].

**The moves ahead**

1. **Build the template and its example.** Tract Mirror's JUCE scaffold, cut down to a template: the algorithm in one `Algorithm.h` that knows no JUCE, a console render harness, and `new-plugin.py`.
2. **Make the Frustration plugin and check it against `ride.py`.** Port the per-sample body into the template, render `ride.py`'s three paths (breathe, coupling, string–bar) through the harness, and compare. Away from the edge it must match sample for sample. At the edge the check is behavioural: the fundamental's range and wobble, not the waveform.
3. **Validate, install, and prove it loads.** pluginval and auval, install to the user plug-in folders, then load it in a host and in Live 12.
4. **Write the afternoon recipe.** How the next sketch gets from numpy to an installed plugin in one afternoon.

**The five defaults Loudon accepted** (from the framework comparison, `Projects/VST Template/proofs/2026-10-20-framework-choice/README.md`):

- **Port path.** Claude ports the per-sample body by hand into `Algorithm.h`: a `State` struct, a `Params` table and a `process()`. The numpy sketch stays the reference, and the sketch's random constants are exported so both start identically.
- **Parameters.** B on a log taper from about 1e-7 to 30, K linear from 0 to 20 Hz, both smoothed per sample (B in the log domain, about 20 ms). Inertia is a continuous knob. N (40, 64 or 96) and pinning are set-and-forget.
- **Real-time cost.** Mono first. Polyphony is measured before it is promised.
- **The check.** As in the second move.
- **Where it lives.** `Projects/VST Template/template/` and `new-plugin.py`, with the first plugin beside the template.

Agreed by Loudon on 2026-10-20, in the VST Template session.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="plan-2026-10-20T22-53-01-04-00" -->
### 2026-10-20 — Plan agreed: JUCE 8 + CMake, cloned from Tract Mirror

Loudon read the framework comparison and said: "Go with JUCE 8 + CMake cloned from Tract Mirror, and your defaults for the other five decisions." That settles the framework, which the baton left to him, and the five defaults the comparison proposed: the port path, the parameters, the real-time cost, the check, and where it lives. The four moves follow the baton's next move: the template first, then the frustration model as its first test.
<sub>`plan-2026-10-20T22-53-01-04-00` · plan agreed · agreed 2026-10-20T22:53:01-04:00 · written by the Concierge on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="proof-2026-10-20-framework-choice" -->
### 2026-10-20 — How a numpy sketch becomes a plugin: eight routes compared, and the kernel ported and timed
> Before any template code: the routes from a numpy sketch to a plugin Loudon can automate in Live 12, checked against this Mac, with two measurements behind the choice.

Eight routes were compared for Loudon's real use: JUCE 8 + CMake, RNBO codebox, gen~ Plugin Export, Faust, iPlug2, Rust with nih-plug, Cmajor, and Python inside the plugin. To ground the comparison, the per-sample body of `ride.py` was ported to about thirty lines of plain C++ (`kern.cpp`), timed, and checked against a numpy reference (`ref.py`).

- **Cost.** One voice at 44.1 kHz on the M1 Max uses 2.5 % of one core at N = 40, 4.1 % at N = 64 and 6.6 % at N = 96. The numpy loop takes about 80 % of a core at any N.
- **Parity**, over 3 s at N = 40, K = 6 Hz. Under the edge (B = 4e-6) the port matches to 4.9e-8 of peak; well past it (B = 8e-5), to between 2e-7 and 3.4e-7. Just past the edge (B = 2.5e-5), two correct ports part company: the unwrapped phases drift past 1e-3 of peak at 2.1 s. So the check at the edge has to be behavioural.
- **The recommendation** was JUCE 8 + CMake cloned from Tract Mirror, the only route on this Mac that a Claude session can walk from sketch to installed, validated plugin with no export dialog. Loudon chose it; see the plan above.

**Artifacts:**
- [README.md — the comparison, the recommendation and the five defaults](Projects/VST Template/proofs/2026-10-20-framework-choice/README.md)
- [kern.cpp — ride.py's per-sample body in C++](Projects/VST Template/proofs/2026-10-20-framework-choice/kern.cpp)
- [ref.py — the numpy reference](Projects/VST Template/proofs/2026-10-20-framework-choice/ref.py)
- [cmp.py — the parity comparison](Projects/VST Template/proofs/2026-10-20-framework-choice/cmp.py)
- [results.txt — the timing and parity numbers](Projects/VST Template/proofs/2026-10-20-framework-choice/results.txt)
- [run.sh — re-runs both checks](Projects/VST Template/proofs/2026-10-20-framework-choice/run.sh)

_Left rough:_ the cost of polyphony is not measured yet (eight voices at N = 96 is estimated at about half a core with this naive kernel), and the RNBO route waits until the Max patching standards exist.
<sub>`proof-2026-10-20-framework-choice` · written by hand · the proof landed in `b5d84c83`</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
