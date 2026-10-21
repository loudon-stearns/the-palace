# A plugin face

How the twelve components compose into one VST editor. The face is a sheet: frame, title block, views, notes.

## The skeleton

```
┌ frame (stroke-frame, rule) ────────────────────────────────────────┐
│  Dimension ── OSCILLATOR ──┐   Dimension ── FILTER ──┐            │
│  Panel                      │   Panel                 │   Scope    │
│    Knob  Knob  Choice       │     Knob  Knob  Toggle  │            │
│                             │                         │   Meter    │
│  notes (sheet-note)                         TitleBlock (bottom right)│
└────────────────────────────────────────────────────────────────────┘
```

1. **Frame.** The whole face is one `Panel` with `variant="sheet"`: a `stroke-frame` border in `rule`, `space-4` padding, `ground-000` behind.
2. **Title block, bottom right.** As on an A4 sheet. `name` is the plugin, `subtitle` its one-line charter, `number` its id (`FRU-01`), `version` the build, `status` what is unproven (`SKETCH · untested in Live`), `source` the sketch it came from (`ride.py`), `drawn` the date.
3. **Groups are spans.** Each group of controls sits in a `Panel` captioned by a `Dimension` across its top, label uppercase. The dimension is the group's name and its width, the way a sheet dimensions a part.
4. **Controls** inside at `space-4` gaps. A `Knob` per continuous parameter; `Choice` and `Toggle` for the others; a `Fader` where the gesture is a level. Every control shows its `Readout` beneath; a readout is never hidden behind a hover.
5. **The scope** is the one dark rectangle on a Paper face. Put it where a sheet puts its main view: upper right or centre. Give it a `Dimension` caption like any view (`OUTPUT · 2 ms/div`).
6. **Notes**, numbered, bottom left, in `sheet-note`. What this face assumes, what the host has not confirmed, what to measure. A HOLD note in `source-measure`.
7. **Legend**, bottom left under the notes, only when the face uses more than one source colour.

## Provenance on a plugin

| Sheet | Face | Colour |
|---|---|---|
| DESIGN | The value you set here | `source-design` (ink) |
| DATASHEET | The host is writing it: automation, a preset load | `source-datasheet` (blue) |
| ASSUMED | Modulated, smoothed, not at rest | `source-assumed` (amber) |
| MEASURE | Unknown or failed: clipping, no input, a parameter the host did not send | `source-measure` (red) |

Pass `source` to a `Knob`, `Fader` or `Readout` and the readout takes that colour. The knob's arc stays `accent`.

## Sizes

A face is laid out at 1x for a 1920-wide screen and scaled by the host. Knob `size` 72 for a main parameter, 56 for a secondary, 40 in a dense row. Faders 160 tall. The title block is 320 wide, four rows. Keep a face under 960 × 560 at 1x unless it has a reason.

## What the host provides

React 18, the fonts, parameter state and the bridge. The components call `onChange(value)` in natural units and never store a value themselves. In JUCE, `WebBrowserComponent` with `WebSliderRelay` and friends is the bridge; in a browser proof, a Web Audio `AudioParam`. Nothing here plays sound on its own.
