---
title: "Web Audio Worklet — tuning"
born: 2026-11-08
links:
  - target: "[[Web Audio Worklet]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Web Audio Worklet page's record of what writing DSP in the audio thread has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real build taught."
ledger: tuning
standards:
  for: "what writing audio-thread DSP taught the Web Audio Worklet page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the platform itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Web Audio Worklet — tuning

What each job taught the Web Audio Worklet page. Each item names what the job showed and what changed because of it, if anything did. Newest last. These are the page's dated gotchas, moved here on 2026-11-08 when its Gotchas became present-tense rules. The page's `last_tested` date, the Wavetable Scanner Sketch, is kept as the first run line.

## From the Murmuration Sketch — 2026-05-30 — single HTML, zero audio dependencies

1. **A standalone single-file artifact has no sidecar `.js` for `audioWorklet.addModule(url)` to load.** Changed: the processor ships as a Blob URL — source in a template-literal string, `new Blob([src], {type:'application/javascript'})`, `URL.createObjectURL(blob)`, `addModule(url)`, then `revokeObjectURL`. Proven in [[Murmuration]]; it is what makes worklet DSP viable in the palace's single-file deployment.
2. **`AudioWorkletNode` is mono unless stereo is asked for in two places.** `outputChannelCount:[2]` in the constructor options and a write to `out[1]` in `process()`; one without the other gives a silent right channel or a thrown channel-count mismatch. Changed: both, with the idiom `const outR = out[1] || out[0];` for a mono host without a branch in the inner loop.
3. **Granular phase-scatter clicks unless it lands at the Hann window's zero.** Resetting a grain's read phase gives the cloud its texture, but mid-grain it splices across a non-zero window and clicks once per grain. Changed: scatter only when the envelope phase wraps (`gp >= 1`), where the window is ≈0.
4. **Transferring a buffer with `port.postMessage({...}, [buf.buffer])` neutered it on the main thread.** Changed: per-frame control traffic allocates a fresh `Float32Array` each frame; the GC cost is acceptable at 60 Hz for sketch-scale payloads, and a double-buffer pool is a Study-tier optimisation.
5. **`sampleRate` is a bare global inside `AudioWorkletGlobalScope`.** `this.context.sampleRate`, the main-thread idiom, is undefined there. Changed: read the global (and `currentTime` or `currentFrame` if needed) and cache `1/sampleRate` once; division in the inner loop is waste.
6. **Template-literal worklet source resolves `${...}` at page-definition time, which hides it from a standalone syntax check.** Injecting `${L}` shares a constant like table length across the thread boundary cleanly, but the extracted string isn't valid JS on its own (`this.L = ${L}` won't parse). Changed: a headless `node --check` of the worklet body substitutes the interpolations first.

## From the Wavetable Scanner Sketch — 2026-05-31

7. **`decodeAudioData` neutered its input ArrayBuffer.** A WAV loaded through `<input type="file">` left any retained reference empty after the call — small enough to miss until a retry-on-decode-failure path returns silently empty. Changed: pass `buf.slice(0)`.
8. **An `AudioContext` constructs and decodes while still `suspended`.** Only `resume()` and starting source nodes need a gesture. Surfaced wiring the [[Wavetable Scanner]]'s drag-and-drop path. Changed: file load happens before Engage (load a table, then play); uploads are not gated behind the unlock click.
9. **The Scanner needed the same `Float32Array` on both threads**, the worklet for lookup and the visualizer for geometry, where Murmuration wanted the main-thread side neutered (item 4). Changed: the decision rule — if both threads need the data across its lifetime, copy into a fresh array and transfer the copy; if only the audio thread does, transfer the original. Same primitive, opposite direction.
10. **The wavetable position morph is a blend of two frames at fractional phase, not a frame switcher.** Changed: the pattern became its own concept entry, [[1D Wavetable Scanning]].
11. **A wavetable scanner wants drone by default; a synth voice wants gated.** The deciding question is whether the user is exploring the timbre or playing a melody. Changed: the question lives in [[1D Wavetable Scanning]].

- run · 2026-05-31 · Wavetable Scanner, sketch · taught items 7–11
