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

## From the card check — 2026-11-14 — the card's starter, a probe

- run · 2026-11-14 · the card's starter: web-smoke, conform --browser, an OfflineAudioContext render (220 Hz, RMS 0.141, L = R), probe · nothing new

## From the test proofs — 2026-11-15 — the voice ceiling, and the block size (zoom-out)

12. **A Blob-URL worklet does not load from a page opened straight from disk in Chrome or Safari.** From `file://`, `addModule(blobURL)` fails in headless Chromium 147 ("Unable to load a worklet's module") and WebKit 26.4 (a CORS refusal); Firefox 148 loads it. The card's starter fails the same way. A `data:text/javascript,` URL of the same source loads in all three. Served (STIGMERGY, the piece origin, any local server) the Blob URL works. Changed: both 2026-11-15 proofs try the Blob URL and fall back to the data: URL. Not changed: the page's Gotchas and the starter, which still say Blob only, and Murmuration, which has no fallback. Whether the piece origin's CSP, once enforced, allows a data: worklet is unchecked. Owed a review.
13. **Murmuration's grain voice works out its pan gains per sample per voice** (a `cos` and a `sin` each), though a voice's pan is constant within a block. Worked out once per voice, the same samples come out (difference 0) and offline renders ran 1.3 to 2.0 times faster in headless Chromium across four runs on a busy Mac. Changed: nothing in Murmuration; the proof carries both forms. Owed a review.
14. **The engine's cost, measured offline** (headless, Apple M1 Max, the Mac shared with other sessions): 1.4 to 1.9 ms of one core per voice per second of sound in Chromium 147 across four runs, so one core runs out between 470 and 670 voices and Murmuration's 60 take 9 to 13% of real time. WebKit 26.4 was a little cheaper per voice; Firefox 148 moved threefold between runs and is unsettled. Cost grows in a straight line with voices up to 256 (r² over 0.98 in Chromium and WebKit). Live in headless Chromium, Chrome's dropout counter stayed near zero to 512 voices and ran away at 1024. No ear has judged it. Owed a review.
15. **Inside the audio thread in Chromium 147 there is no `performance.now()`;** a block's time can only be read with `Date.now()`, in whole milliseconds against a 2.7 ms block. Summed over half a second the average holds; a single block's cost cannot be read. Changed: the voice-ceiling proof's meter sums, and says which clock it had. Owed a review.
16. **Zoom-out, 2026-11-15 — two platform changes since the page was written.** (a) `AudioContext.playbackStats` (renamed from `playoutStats`), Chrome's Intent to Ship named Chrome 146: `underrunEvents` and `underrunDuration` count dropouts, a crackle counter a script can read. Present in headless Chromium 147, absent in Firefox 148 and WebKit 26.4. Tried: both proofs show it. Sources: https://groups.google.com/a/chromium.org/g/blink-dev/c/p-IHBp8Nw2Q and https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/playbackStats, read 2026-11-15. (b) `renderSizeHint` on `AudioContext` and `OfflineAudioContext`, a render block other than 128: origin trial from Chrome 145, Intent to Ship for Chrome 153 with three LGTMs in July 2026; Firefox expected later, no WebKit signal. Tried in headless Chromium 147 behind `--enable-blink-features=WebAudioConfigurableRenderQuantum`: 256, 512 and 1024 were given exactly, `process()` saw that many frames, and the output matched 128 sample for sample; for this per-sample-bound engine bigger blocks gave no steady saving offline (20% slower to 14% faster across two runs, no direction) and did not hold off dropouts live. Without the flag the hint is ignored and blocks stay 128. Source: https://groups.google.com/a/chromium.org/g/blink-dev/c/i4c1unRSmcE/m/-TiRAkilFwAJ, read 2026-11-15. Not tried: `setSinkId` on an `AudioContext` (absent in all three headless engines), WASM SIMD in the worklet (validates in all three; no build made). Owed a review.

- run · 2026-11-15 · the voice ceiling: Murmuration's grain voice, 8 to 1024 voices offline in Chromium, Firefox and WebKit, and a page for the ear, probe · taught items 12–15
- run · 2026-11-15 · zoom-out, the block size: renderSizeHint 128 against 256, 512, 1024 in headless Chromium, and a page for the ear, probe · taught item 16
