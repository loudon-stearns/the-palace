---
title: "Mycelial Reverb"
type: project
status: active
pillars: [creation, tools, philosophy]
born: 2026-11
stage: sprout
who_leads: loudon
forward_vector: "I want to grow into a reverb a player raises from one spore, in a browser and in a DAW, so that anyone who has fed it sound can say what a room is made of: delays, and the places where they meet."
links:
  - target: "[[Reverb Design]]"
    type: deepens
    label: pedagogical-mythology
  - target: "[[Slime Mold Delay]]"
    type: connects-to
    label: grown-topology-sibling
  - target: "[[Waveguide Synthesizer]]"
    type: connects-to
    label: two-travelling-waves-per-thread
  - target: "[[Reverb ↔ Space-Time]]"
    type: connects-to
    label: the-network-is-the-room
  - target: "[[VST Template]]"
    type: connects-to
    label: borrows-its-build
---

# Mycelial Reverb

A reverb you grow. A dish holds one spore. Feed it sound and threads reach out, branch, and fuse where they meet; the network that grows is the room you hear.

It is the third of the eight instruments [[Biomechanical Synthesis]] lists, and the first place the mycelial one has a body. This page holds the instrument: the piece a reader plays, the engine under it, and the plugin. The lesson about how reverbs are built belongs to [[Reverb Design]], which points here.

## What it is, as an algorithm

A growing digital waveguide network.

- **A thread** is a pair of delay lines, one for each direction. Each has a one-pole lowpass, the soil's wetness, and loses a little in proportion to its length. *Carry* sets that loss as a decay time, 0.2 to 12 seconds.
- **A meeting of threads** is a scattering junction that adds nothing and loses nothing, a Householder reflection: out = 2u(u·in) − in, where u = √y / √Σy and y is each thread's thickness. At a fork of three equal threads, a third of what arrives comes back upside down and two thirds go on.
- **A dead-end tip** gives back 0.8 of what reaches it.
- **A fruiting body** is where you listen. They come up at busy junctions and are the stereo taps, panned by where they sit in the dish.

There are no allpass filters anywhere. The newborn dish, one junction and three threads, is a small feedback delay network: three delay loops mixed by one 3×3 Householder matrix. Everything after that is the same arithmetic on a bigger graph, up to 170 threads.

## How it grows

| In the dish | In the network |
|---|---|
| A tip extends only while sound reaches it | A delay line lengthens, then forks |
| A thread that carries more sound thickens | Its weight at each junction rises, so more is sent down it |
| A new thread lands near or across the colony and fuses | A loop: sound can now circle |
| A frost kills every dead end one thread back | The lossy tips go; what is left rings longer |
| Fruiting bodies rise at busy junctions | New listening points |

## What is exact, what is borrowed, what is metaphor

**Exact:** the waveguide arithmetic. With nothing going in, the energy the network holds can only fall, at every control setting tested. The numbers are in the piece's check output (`Projects/Biomechanical Synthesis/workshop/2026-11-10-mycelial-reverb/check-output.txt`).

**Borrowed from fungi:** growth at the tips, branching, fusion, and thickening of the routes in use.

**Metaphor:** that sound is food. The piece says so on its own face.

**A limit to name.** This is the mycelial model in space: threads are delay lines laid out in a dish. § The Mycelial Model in Detail on [[Biomechanical Synthesis]] describes a different one, in the spectrum, with hyphae growing toward the harmonics of a played note. That one is still unbuilt.

## Where things sit

**The piece** is the page a reader plays: `Projects/Biomechanical Synthesis/Biomechanical Synthesis — rich — mycelial reverb.html`, with its check script beside it. It lives in Biomechanical Synthesis's bundle, on the branch `hook/biomechanical-synthesis`, not yet landed. This project points at it there for now.

**The engine** is the script block inside that piece (`MycelNet`, `MycelColony` and a seeded random source). It is the reference everything else is checked against.

**The plugin** is in `plugin/` in this page's folder: a JUCE 8 VST3 and AU, code Mycl. `src/Algorithm.h` is a hand port of the engine to C++, with no JUCE in it. Three decisions shape it:

- Growth runs in the processor, not the editor, so the dish keeps growing with its window closed.
- The whole colony is saved in the plugin's state: seed, graph, thicknesses, taps and controls. A session reopens to the same room.
- *Hold it still* freezes growth.

It does not use the [[VST Template]]'s shared processor and editor. That machinery saves only the knobs and gives every plugin one house editor; this plugin needs the colony in its state, actions that are not knobs (a knock, a frost, a new spore), and the dish itself as its editor. It borrows the template's copy of JUCE, its parameter table, its signing order, its validation steps and its host check.

## What has been checked

The C++ engine was run against the JavaScript one on the check script's own cases (`plugin/check/gate.mjs`; numbers in `plugin/out/gate-report.json`). The largest difference on every case was zero: one thread's echoes, a fork of three, 2,000 random junctions, ten colonies grown in both engines to 3, 20, 80 and 170 threads and compared thread for thread, and a minute of full-scale noise with growth, frosts and jumping controls, 5,761,024 output samples. A colony of 60 threads saved and reloaded went on growing and sounding the same. The gate was also seen to fail on two deliberately wrong ports: the junction's 2 made 2.0001 failed four cases, and the growth rate's 2.6 made 2.61 failed two. The zero rests partly on V8 and this Mac's C library rounding sin, exp, log and pow the same way on these runs, which is not guaranteed on another machine (`plugin/README.md`).

The plugin builds, passes pluginval at strictness 5 and auval, and is installed on this Mac; the full record is on [[Mycelial Reverb — scroll]].

**Not verified:** nobody has heard the plugin in a DAW, and no agent has heard the piece. The editor has only been seen with a newborn dish, never a grown one. Live's scanner has not been asked. No real session has been saved and reopened. Only 48 kHz is gated.

Nothing has been published, hosted or packaged for download. There is no licence file, and JUCE's licence terms for sharing this have not been weighed.

## Open questions

- Should the spectral mycelial model be built too, or is the spatial one the instrument?
- Does the tail turn to a wash sooner as the colony grows? The piece wrote that guess down first, and its check reports it as not settled.
- Is the plugin's guard wanted, and how hard should it work? A newborn dish is three short loops, a comb. A quiet 110 Hz sawtooth at −12 dBFS sat on it and came out peaking at +6.3 dBFS. The worker added a guard on the dish alone, with the piece's own compressor figures (−10 dB, 12:1, 3 ms, 200 ms) and the dry sound untouched; the same render then peaked at −1.3 dBFS. It is a simple feed-forward gain with no look-ahead, a choice of taste, and unheard.

## Palace connections

- **[[Biomechanical Synthesis]]** — the framework this instrument comes from, and the bundle where the piece lives today
- **[[Reverb Design]]** — the teaching page, a draft; it opens on the dish and takes it apart
- **[[Slime Mold Delay]]** — the sibling: a delay network whose routing a slime mold grows
- **[[Waveguide Synthesizer]]** — the palace's page on travelling waves in delay lines
- **[[Reverb ↔ Space-Time]]** — reverb as space made audible; here the space is grown
- **[[VST Template]]** — the build this plugin borrows from, and where it parts ways
