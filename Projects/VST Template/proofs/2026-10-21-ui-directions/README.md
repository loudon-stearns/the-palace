# Three directions for the template's editor

Loudon, 2026-10-21: "I'd like the next job of the VST template to create a design standard, so that we have custom UI not the default sliders."

All three directions here are drawn by one engine (`machinery/ui/editor.html`) from the plugins' own parameter tables. Nothing in them is laid out by hand. Each `*.png` is a mock page rendered by headless Chrome at the plugin's default size: Frustration at 760 × 520, Simple Synth at 900 × 600. To make the page itself, whose knobs can be dragged in a browser, run `python3 machinery/tools/ui.py mock plugins/Frustration --direction edge --out page.html`. The pages are 1.2 MB each, mostly the embedded fonts, so they aren't committed. The two `*-directions.png` sheets stack each plugin's three directions for reading on a phone.

## A · Bench

Knobs on cards, in Graphite. B and K, or Cutoff and Resonance, are two large knobs, each with its range written under it and decade marks on a log taper.

- **For:** it fits any table at its default size. Simple Synth's 20 controls sit under its heroes at 900 × 600. It reads as one family across every plugin. It is dark in Live's dark room.
- **Against:** it says nothing about how the two heroes relate. On Frustration, that relation is the instrument.

## B · Edge map

The two heroes become one XY pad, and the other controls shrink into a strip below.

- **On Frustration:** the pad is drawn over the edge map from the frustration sweeps. The dashed edge is where the tone first tears, for each coupling, and the torn side is tinted. The dot at B = 10⁻⁵, K = 6 Hz sits just under the edge, where the field guide says it is: near 1.8 × 10⁻⁵ at 40 partials. One hand moves both, and you can see where the edge is before you hear it.
- **Against, on Frustration:** the map is fixed. It is 40 partials, unpinned, inertia 1 (`edgemap.json`), so it is wrong as soon as the Partials, Pin or Inertia knobs move. A live edge needs the plugin to compute it: about a dozen runs of the model per change, or a precomputed table per partial count and pin setting.
- **Against, on Simple Synth:** Cutoff against Resonance is a familiar pad, but it has no map, so it is just a square.

## C · Signal flow

Faders on Drafting paper, with the groups laid out left to right, arrows between them, in the schematic register.

- **For:** it shows the instrument's structure.
- **Against:** vertical faders take room. Simple Synth runs off the bottom of 900 × 600, and would need about 1100 × 720. A cream window is also bright in Live at night.

## Recommendation: A, with B's pad as an opt-in for a plugin whose two heroes make a map

Bench is the only direction that fits any parameter table at its default size with no hand layout, so it should be the template's default. The pad earns its place only where the plane means something: on Frustration, the B–K plane is the field guide's map of where the tone tears. So it should be a switch in `plugin.json` (`"direction": "edge"` with a `ui/backdrop.json`), not the house look.

If Loudon picks that, Frustration would use the pad. A follow-up could then make its edge follow the Partials and Pin knobs.
