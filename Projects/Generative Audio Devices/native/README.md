---
title: "Generative Audio Devices — native target README"
born: 2026-11-04
links:
  - target: "[[Generative Audio Devices]]"
    type: connects-to
    label: second-target
forward_vector: "I am the front door of the native target: the same PDL that becomes a VCV patch becomes a Mac app here, and next a plugin. I say what each file does and how to check it."
---

# Native target

The project's second target, built 2026-11-04 on Loudon's word ("move to VST or full MAC app"). A PDL patch becomes C++, and the C++ becomes a Mac app you play from the computer keyboard through the MacBook speakers, the same two defaults every VCV patch opens with. The same generated `patch.h` is meant to sit inside a plugin next.

Every cable carries volts, as in Rack: 1 V per octave, 10 V gates, ±5 V audio. So a PDL patch means the same thing here, and the archetypes' knob values need no translating. The curves from knob to sound are read from VCV Fundamental's source (commit `10dd016`). Each struct in `gad_kit.h` names the lines it follows. The DSP under the curves is simpler than Rack's, with no oversampling and PolyBLEP instead of minBLEP, so the shapes match and the fine texture may not.

| File | What it is |
|---|---|
| `native_registry.json` | This target's vocabulary: the PDL modules it can build, their ports and knobs by PDL's own names, and the source lines each follows. SEQ3 and VCMIXER aren't in it yet; a patch that uses them is refused by name. |
| `gad_kit.h` | One C++ struct per module: VCO, VCF, ADSR, VCA, LFO, MIXER, and the keyboard. |
| `emit_native.js` | PDL → `patch.h`. Reads the graph, every knob's value and the voice count from the renderer's `resolvePatch`, the resolver both targets share (since 2026-11-04, cycle 4). It never reads a `.vcv`. |
| `host_common.h` | The voice engine both hosts share. One voice plays the last held note, as Rack's MIDI-CV does. With several voices, notes take turns, and the count comes from the PDL's `# voices`. |
| `host_render.cpp` | Plays a short phrase (a bass figure, or two chords if the patch has voices) and writes a WAV. Prints peak, rms, non-finite samples and the pitch of the held note. |
| `host_app.mm` | The Mac app: Rack's QWERTY map (Z = C4, Q = C5, `` ` `` and `1` shift octaves) and the MacBook speakers, falling back to the system output. `--probe` names the output it would use without playing anything. |
| `build_app.sh` | `./build_app.sh <file.pdl> "<Name>"` builds `build/<Name>.app` and `build/<Name>.wav`. |
| `verify_native.js` | Puts every PDL the project holds through both targets, and checks that every knob the `.vcv` carries is the value the C++ gets. `--apps` also builds each one as an app. |

## Checking it still works

```sh
cd "Projects/Generative Audio Devices/native"
node verify_native.js          # 96/96 on 2026-11-04 (cycle 4)
node verify_native.js --apps   # 109/109: also builds each patch as an app, about 30 s
```

`build/` is a scratch folder and is not kept in git. Four built apps and their WAVs are in `../proofs/2026-11-04-native/`.
