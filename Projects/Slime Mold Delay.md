---
title: "Slime Mold Delay"
type: project
status: active
pillars: [creation, tools, philosophy]
born: 2026-05
stage: sprout
confidence: specified
energy: high
hook_quality: 9
beauty: 9
who_leads: loudon
forward_vector: "I will become the delay that thinks — a feedback delay topology where the routing is grown, not designed. The plasmodium of *Physarum polycephalum* foraging across a nutrient field is the algorithm: pulses propagate, paths optimize, dead branches prune themselves. The user does not patch a delay network; the user feeds the slime mold and watches the routing emerge."
links:
  - target: "[[Retrospective Delay]]"
    type: connects-to
    label: thinking-vs-remembering
  - target: "[[Semantic Delay]]"
    type: connects-to
    label: routing-by-meaning
  - target: "[[Particle Synthesis]]"
    type: deepens
    label: emergent-topology
  - target: "[[Substrate Skill]]"
    type: couples-with
    label: stage-conditional-build
  - target: "[[Spinoza Conatus]]"
    type: mirrors
    label: reinforcement-as-conatus
  - target: "[[Kuramoto Coupling]]"
    type: couples-with
    label: reinforcement-vs-phase-lock
---

# Slime Mold Delay

![[Slime Mold Delay — hero.png]]

A feedback delay network whose topology is grown by simulating the foraging of *Physarum polycephalum* across an audio "nutrient field." The user places sources and sinks; the slime mold connects them. The resulting graph of paths becomes the delay routing. As the audio plays, the slime mold continues to optimize — pruning paths that are not used, reinforcing paths that carry signal — so the delay's routing *learns the music*.

This entry is the first concrete development of one of the eight [[Biomechanical Synthesis]] instruments. The hub diagram lists it; this entry is its body.

## The Biological Substrate

*Physarum polycephalum* — yellow plasmodial slime mold, single-celled, cytoplasm continuous across centimeters. In the famous Tsuda/Nakagaki experiments (2000–2010), placing food at the points of an oat-flake "Tokyo Subway map" causes the plasmodium to grow connections between food sources that approximate the actual subway network — including its known engineering optimum.

The slime mold solves a path-planning problem without a brain. It does so by:

1. **Sending pulses** of cytoplasm flow through its tubular network
2. **Reinforcing tubes** that carry more flow (use-it-or-lose-it)
3. **Pruning tubes** that carry less flow (unused branches die)
4. **Reaching new food** by tip-extension along chemical gradients

This is exactly the topology problem a feedback delay network has to solve. Where do the taps go? Where does feedback route? Which connections survive?

## The Mapping

| Slime mold variable | Audio variable |
|---|---|
| Nutrient field | A 2D field where each point's "value" is something the audio cares about (e.g., spectral density at that location) |
| Food source | Audio input (a microphone, a track, a click) |
| Food sink | Audio output (the listener) |
| Plasmodium tube | A delay line with delay-time = tube length × signal velocity |
| Tube diameter | Feedback gain on that line — wider tube, more signal flows |
| Pulse | The audio signal itself, propagating through the network |
| Reinforcement | Increase feedback gain on tubes that successfully delivered audio |
| Pruning | Decrease feedback gain on tubes that delivered nothing |
| Cytoplasmic streaming velocity | Master delay-time scaling factor |

The user's role: place the food and the feeder. The mold figures out the rest.

## Interface Mythology

The GUI is a petri dish viewed from above.

**The substrate**: a dark agar surface (the canvas). User clicks place yellow oat-flakes (food = audio sources) and red dye-spots (sinks = outputs).

**The plasmodium**: starts as a small yellow blob at the first food source. Over seconds it sends out feeler-tubes — visible as branching yellow filaments. Tubes that find food reinforce. Tubes that find dead end retract.

**Audio reveals routing**: when an audio source is "on" (playing audio), its food-flake glows brighter and pulses dilate the connecting tubes. The user *sees* the audio flow as bright pulses traveling along the yellow paths.

**Time**: the dish's clock can be sped up (overnight slime-mold growth in 30 seconds) or slowed down for surgical observation. Pause and the topology freezes.

**Eat / starve cycles**: a knob that simulates feeding the colony. Eat = grow new branches. Starve = prune aggressively. The user shapes the network's character without micromanaging routes.

The character of this delay is *organic, slow, exploratory*. The routing is never the same twice. The user surrenders precision for liveness.

*([[proofs/2026-05-05-petri-dish-image-prompt|image prompt — petri dish view]])* — a model-agnostic image prompt specifying the visual scene: dark agar, yellow Physarum filaments, pulse rings mid-travel, oat-flake sources, red sink, isolated exploratory tendril. Style: scientific macro photograph, shallow depth of field, clinical-beautiful.

## DSP Architecture

Implementation needs a real graph evolving in real time over an audio engine.

1. **Topology engine** (CPU, low-rate): runs at ~30 Hz. Maintains a graph data structure of nodes (food/sinks) and edges (tubes, with delay time + feedback gain). Updates edge weights based on flow statistics. Adds and removes edges per slime-mold rules.

2. **Audio engine** (DSP rate): renders the graph as a feedback delay network. Each edge becomes a `DelayLine(time=length × velocity, feedback=diameter)`. Topology updates trigger delay-line spawns/kills with click-free crossfading.

3. **Flow tracking**: each delay line measures recent RMS at its output. Topology engine reads these to update tube diameters per the Physarum reinforcement rule.

4. **Tip extension**: when a tube reaches "ripeness" (high flow + sufficient age), it can spawn a new tube extending in a random direction. If the new tube reaches another food source within a few seconds, it stays. If not, it retracts.

5. **Graph constraints**: maximum total tube length budget. As the colony grows, less efficient tubes are pruned to make room for new ones. This prevents unbounded growth and forces optimization.

6. **Start dense, then thin**: the real plasmodium doesn't build its network strand by strand. It covers the dish first, and the flow carves that cover down to the roads that matter. Carving only works if roads have to compete. If thickness saturates with flow, two parallel roads that share a load both stay full and neither loses. So thickness grows as flow to a power above one, and the flakes take turns: the one that just sounded pushes, and the other sounding flakes listen alongside the listener. That puts pressure between neighbouring roads, so they can merge into trunks. Across 40 seeded dishes this brought a clustered dish from 1.73× to 1.28× the shortest straight-road network (the check (`headless/mesh_dish_check.mjs`), 2026-10-18).

## Pedagogical Framing

The lesson is about **emergent routing**. In a Patchbook delay design class, students learn that 2 taps + feedback is a comb filter, 3 taps make rhythm, etc. — designed structures with predicted output.

Slime Mold Delay teaches the opposite: *give the system constraints and food, let routing emerge*. The moment of recognition arrives around second fifty-eight of a first session — *([[proofs/2026-05-05-moment-of-aha|the first lesson, sixty seconds]])*. Sometimes the routing is musical. Sometimes it's wrong. The student learns to *seed the conditions for good routing* rather than to *specify routing*.

This is also a lesson about feedback systems generally. Negative feedback (pruning) and positive feedback (reinforcement) coexist. The colony is stable not because it doesn't change but because change is locally regulated. Stability through process, not stasis.

The metaphor connects directly to [[Particle Synthesis]] — both are population-based instruments where individual elements have no intelligence and the system has plenty.

## What This Entry Is and Isn't

**Isn't**: a finished instrument. There is an offline renderer (`headless/physarum_flow.py`) and a playable browser dish (the flow dish (`slime-mold-flow-dish.html`)), but nobody has listened to either yet, and the renderer runs an older law than the dish. The plan on the [[Slime Mold Delay — scroll|scroll]] holds the path from here.

## Open Questions

- Should the user be able to "draw" preferred paths, or is the no-control nature of the slime mold the point?
- How fast should the mold "think"? Real Physarum grows at mm/hour; for performance use you'd want 30 seconds for a useful colony.
- Does the audio output through one sink, or through multiple sinks each with their own pan/EQ? Probably multiple — that's where stereo comes in.
- The eat/starve knob is potentially powerful — can it be automated or does it stay manual?
