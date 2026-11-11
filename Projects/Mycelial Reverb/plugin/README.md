# Mycelial Reverb: the plugin

The dish as a VST3 and AU. Built 2026-11-10, the day the project was born, on Loudon's word of that day as relayed to this session: "I agree on the entire thing, make it happen." Nobody has heard it in a DAW yet.

```
plugin/
  plugin.json             Mycelial Reverb, code Mycl, effect, stereo, company Loudon Live
  src/Algorithm.h         the engine in C++, no JUCE: MycelNet, MycelColony, Dish, the parameter table
  src/PluginProcessor.*   the dish inside a JUCE processor: growth, state, the guard, the mix
  src/PluginEditor.*      a WebView that draws whatever colony the processor last published
  ui/index.html           the editor's one page: the dish and its hands
  check/gate.mjs          the C++ engine against the JavaScript engine in the piece
  check/engine_gate.cpp   the C++ side of that gate
  out/                    gate-report.json, gate-output.txt, two pictures of the editor
  CMakeLists.txt, plugin.sh   its own build file and steps (below: why not the template's)
```

## What it is

A growing digital waveguide network. Every thread is a pair of delay lines, one each way, each with a one-pole lowpass and a loss in proportion to its length. Every meeting of threads is a scattering junction that neither adds nor loses: out = 2u(u·in) − in, u = √y / √Σy, a Householder reflection weighted by each thread's thickness y. A dead-end tip gives back 0.8 of what reaches it. There are no allpass filters. The newborn dish, three threads at one junction, is a small feedback delay network.

The reference is the `<script id="mycel-engine">` block of the piece, `Projects/Biomechanical Synthesis/Biomechanical Synthesis — rich — mycelial reverb.html`, which this folder reads and never edits. `src/Algorithm.h` is a hand port of it, line for line. It keeps the JavaScript's number types on purpose (float32 delay lines, outputs, taps and per-thread energy; doubles elsewhere) and is compiled with `-ffp-contract=off`, so the compiler does not fuse a·b+c and round differently.

## Decisions

**Growth runs in the processor, not the editor.** On the page the colony runs on the main thread. Here `processBlock` feeds it every 512 samples, so the dish keeps growing with the window closed, in a bounce, anywhere sound passes through. The colony is fixed-size plain data, so it grows on the audio thread without allocating.

**The whole colony is saved in the plugin's state.** Seed, the random source's position, every node and thread, thicknesses, the way in, fruiting bodies, growth credits, and the knobs. It is written as text (about 12 kB for 60 threads), with every number exact. A session reopens to the same room and goes on growing the way it would have. What is not saved: the sound still ringing in the lines. Text that is cut off or not a sane colony is refused, and the dish stays as it was.

**"Hold it still" freezes growth.** It is a host parameter, so it automates. The dish goes on sounding.

**The editor holds no colony.** After each feed the audio thread copies the colony for the editor and the host's save, if it can take the lock without waiting. The editor asks for that copy 30 times a second and sends it to the page as one event. A loaded state travels the other way and is taken at the top of the next block.

**The guard is mine, and Loudon has not heard it.** The page puts a compressor after everything (−10 dB, 12:1, 3 ms, 200 ms) and multiplies the dish by about 3.5. A young dish is three short loops, a comb. Without a guard, the host check's quiet 110 Hz sawtooth (−12 dBFS) came out peaking at +6.3 dBFS, because the note sat on the comb. So the plugin holds back the dish alone with the page's four figures, and the dry sound passes untouched; the same render then peaked at −1.3 dBFS. It is a simple feed-forward gain, not WebAudio's compressor, and it has no look-ahead, so the first 3 ms of a loud hit get through. The status line says when it is working. Whether it should be there, and how hard, is a question of taste for the first listen.

**Other things that differ from the page.** The dish hears the mono sum of the input. Carry runs 0.2–12 s and wetness 0–0.9, the engine's own limits (the page's sliders stop at 0.5–10 and 0.7). "Dish level" is new: a trim in dB on top of the page's rule, which makes the dish quieter the further it carries. The page's plucked strings, rain and file loader are not here: a DAW brings the sound. The page's lesson tabs (one thread, a fork, a loop) are in the engine and the gate, not in the editor. The dish is always 1000 × 600 and holds 170 threads.

## The controls

| Host parameter | On the page | Range |
|---|---|---|
| Carry | how far a pulse carries | 0.2–12 s, default 3 |
| Soil wetness | how wet the soil is | 0–0.9, default 0.25 |
| Dry level | the sound itself, beside the dish | 0–1, default 0.6 |
| Dish level | (new) how loud the dish is | −24 to +12 dB, default 0 |
| Hold it still | hold it still | off / on |

Not parameters, because they are acts and not values: **knock** (the page's knock, sent in where the sound goes in), a click on the dish (knock there, and send the sound in there from now on), **a frost**, **a new spore**.

## The gate

`./plugin.sh gate` (or `node check/gate.mjs`, `--quick` for a short one). It compiles `check/engine_gate.cpp` with no JUCE, runs it, runs the JavaScript engine on the same cases, and compares the numbers. The cases are the piece's own check script's.

Full run, 2026-11-10, on the code as committed (`out/gate-output.txt`, `out/gate-report.json`). **The largest difference between the C++ and the JavaScript was 0 on every case.**

| Case | Compared | Largest difference |
|---|---|---|
| One thread echo | 24,000 samples a side, half a second | 0 |
| Fork of three | 9,600 samples a side | 0 |
| Junction energy | 2,000 random junctions, the rule as arithmetic | 0 (the rule's own error 1.22e-15 on both sides) |
| Energy never rises | 10 colonies grown in both engines to 3, 20, 80 and 170 threads, thread for thread (13,998 numbers); then 160 impulse runs, 720,160 readings of held energy | 0 and 0; largest step ratio 1.000000000 |
| The torture | 60 s of full-scale noise with growth, frosts and jumping controls: 5,761,024 output samples; both colonies ended with 87 threads | 0 |

The template expects a faithful port near 5e-8, float32 rounding. This one lands on zero because the port keeps float32 exactly where the JavaScript has it, and because every `sin`, `exp`, `log` and `pow` happened to round the same way in V8 and in this Mac's C library on these runs. That second part is luck that held, not a law: on another machine or compiler one of them could differ in the last bit, and then a colony could branch differently. The gate would say so.

Three more that the JavaScript has no side for:

- **The junction through the engine itself.** One chunk of noise arriving on every thread of 2,000 random junctions: energy out over energy in off by at most 2.80e-8, which is the float32 lines.
- **State.** A colony of 60 threads saved, loaded, saved again: the same text. Fed 20 s more beside the one it was saved from, both reached 128 threads and their outputs differed by 0.
- **The host's block size.** The same 10 s in blocks of 512 and in ragged blocks of 1 to 700 samples. Held still: difference 0. Growing: 9.31e-9, same thread count. Reported, not gated: a ragged block changes how each thread's energy is rounded on its way to the colony.

**The gate can fail.** Two wrong ports were gated once, on purpose (`MYCEL_SRC=<folder>`): the junction's 2 made 2.0001 failed four cases, and the growth rate's 2.6 made 2.61 failed the two that grow.

What the gate does not see: anything in `PluginProcessor.cpp`. The mix, the guard, the knock, the state crossing threads and the editor are checked only by the steps below.

## The build, and what ran

Why not the template's machinery: it wraps an algorithm whose whole state is its knobs and gives it the house editor. This plugin's state is a colony, it takes acts that are not knobs, and its editor is the dish. So it has its own processor, editor, `CMakeLists.txt` and `plugin.sh`. It borrows the template's shared JUCE 8.0.12, `ParamSpec.h`, the order of sealing, the validation steps, and `HostCheck.cpp` unchanged. Nothing in `VST Template/` was edited. That the machinery has no place for state beyond knobs is worth offering to its steward.

On this Mac, 2026-11-10:

- `./plugin.sh build`: VST3, AU and Standalone built; each bundle re-sealed after JUCE finished writing, and the strict signature check passed.
- `./plugin.sh pluginval` on the built VST3, before installing: strictness 5, SUCCESS.
- `./plugin.sh install`: copied to `~/Library/Audio/Plug-Ins/VST3/Mycelial Reverb.vst3` and `~/Library/Audio/Plug-Ins/Components/Mycelial Reverb.component`. That is outside the repo, on Loudon's machine. `./plugin.sh uninstall` removes both.
- `./plugin.sh validate`: signatures verified strictly, pluginval SUCCESS on the installed VST3, `auval -v aufx Mycl Loud`: AU VALIDATION SUCCEEDED.
- `./plugin.sh hostcheck`: it loaded, listed the five parameters as automatable, and every move changed the sound. **It reports FAILED, on one line: the defaults rendered twice differ.** The check expects a plugin to sound the same twice from a fresh start. This one grew during the first second, so the second render went through a bigger dish. That is the instrument, and the template's check has no way to be told so.
- `./plugin.sh editor`: the installed VST3's editor opened at 720 × 560 and 1000 × 760 and was photographed (`out/editor-*.png`). Both show a newborn dish, drawn from the processor's frames.

**Not verified.** Nobody has heard it. It has not been opened in Live or any DAW; Live's scanner has not been asked. The editor has only been seen with a newborn dish, never a grown one, and no one has clicked it. Saving and reopening a real session has not been tried (the state round trip is tested in the engine, and pluginval exercises state, but not a Set). Only 48 kHz is gated; other rates rebuild every thread at its length in milliseconds, untested by ear or number. Not built or tried on Windows or Intel.

## Not done, on purpose

Nothing here is published, hosted or packaged for download. That would widen the public surface and waits for Loudon and a Sentry gate. No licence file was added: the repo has no licence, and JUCE's terms for sharing a plugin built with it have not been weighed.
