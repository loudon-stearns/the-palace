# A3 — Shop Gotchas to tuning ledgers

Lane A3, Weave 2026-11-08. It carries flag `commons-the-palace-1794143281804` and the by-touch flag `commons-the-palace-1792347287670`. Before touching any page I read The Shop § The Specialist Anatomy (`The Shop.md:85-89`) and both sides of the FLUX exemplar (`4ebbfc08`).

None of the seven pages had a tuning ledger, so every ledger below is new. Each one is in FLUX's shape: §8 frontmatter, a `tuning-for` link to the parent, `ledger: tuning`, and the eight-key `standards` block. Dated items are numbered and grouped under `## From <job> — <date>`, and each says what the job found and then "Changed:". Each page's Gotchas section now opens with the ledger link and gives rules by topic under bold leads. Each page lost `last_tested` and `last_gotcha` and nothing else in its frontmatter.

## Three.js
- Ledger: `Shop/Three.js/Three.js — tuning.md` (new)
- Dated items moved: 4 (2026-05-31, Wavetable Scanner)
- Rules now stated: 7 (5 taught by the job, plus 2 under "Anticipated, not yet met on a job")
- Removed: `last_tested: 2026-05-31`, `last_gotcha: 2026-05-31`
- Run line: `2026-05-31 · Wavetable Scanner, sketch · taught items 1–4`
- Not placed: the two "still anticipated" items (WebGL context loss, silent GLSL failure). They have no date and no job behind them, so they stay on the page as rules, labelled as not yet met.

## Tone.js
- Ledger: `Shop/Tone.js/Tone.js — tuning.md` (new)
- Dated items moved: 2 (2026-05-26, Kuramoto two-oscillator explorer)
- Rules now stated: 8 (3 under Clocks, plus 5 under "Community wisdom, not yet met on a job")
- Removed: `last_tested: 2026-06-16`, `last_gotcha: 2026-05-26`
- Run line: `2026-06-16 · Shop/Maker/run-tests.mjs web-smoke, probe · nothing new`. That date comes from the harness write-back in `d43c398d`, not from a job.
- Pointer fixed: the Recipes line that said "resolved as the first dated gotcha above" now reads "the first gotcha above (item 1 in [[Tone.js — tuning]])".

## VCV Patch Generator
- Ledger: `Shop/VCV Patch Generator/VCV Patch Generator — tuning.md` (new)
- Dated items moved: 5, all on 2026-05-29 (first job 1, Rack audition 3, T7d 1)
- Rules now stated: 8 (Archetypes and voices 4, Layout 1, Registry and data 3)
- Removed: `last_tested: 2026-05-29`, `last_gotcha: "kick needs two ADSRs…"`
- Run line: `2026-05-29 · T7b archetype triple … and its Rack audition, piece · taught items 1–5`
- Pointer fixed: Forward Vector's "progressed" line said "the three `(2026-05-29, audition)` gotchas above". It now reads "the three audition items in [[VCV Patch Generator — tuning]]".
- Not placed: the three undated registry gotchas (plugin drift, out-of-range fallback, the embedded-JSON mirror) stay on the page as rules. The SEQ3 STEPS-index bug in the mirror rule has no date on the page. Git shows its fix recorded on 2026-05-29 (`346835d0`), but I could not date when it was found, so it stays on the page as that rule's reason and was not moved.
- Rule updated against canon: [[Generative Audio Devices]] (`Projects/Generative Audio Devices.md:53`, `:126`) says T7c shipped archetypes v0.2, and v0.2 sets attenuverter depth. The page's old line said "until a brief is on v0.2, hand-set…". The rule now says v0.2 sets depth in its clouds, and that on v0.1 or any hand-written `*` line with a modulation cable you set the attenuverter yourself.

## Web Audio Worklet
- Ledger: `Shop/Web Audio Worklet/Web Audio Worklet — tuning.md` (new)
- Dated items moved: 11 (2026-05-30 Murmuration 6, 2026-05-31 Wavetable Scanner 5)
- Rules now stated: 12 (Loading and unlocking 4, Inside `process()` 4, Crossing the thread boundary 2, Wavetables 2)
- Removed: `last_tested: 2026-05-31`, `last_gotcha: 2026-05-31`
- Run line: `2026-05-31 · Wavetable Scanner, sketch · taught items 7–11`
- Not placed: the two "inherited from the platform" items (async `addModule` with `suspended` start, and a `DynamicsCompressor` after the worklet) have no date. They are folded into the topic groups as rules and were not moved to the ledger.

## Whisper
- Ledger: `Shop/Whisper/Whisper — tuning.md` (new)
- Dated items moved: 3 (2026-05-26, Kokoro → Whisper round trip)
- Rules now stated: 7 (Model size 1, Technical vocabulary 2, Silence, timing and reproducibility 4)
- Removed: `last_tested: 2026-05-26`, `last_gotcha: 2026-05-26`
- Run line: `2026-05-26 · Kokoro → Whisper round trip on the Kuramoto narration, study · taught items 1–3`
- Not placed: the page lists four undated bullets (hallucination on silence, timing drift, diarization overlap, checkpoint hashes) without saying whether they came from a job. They stay as rules under their topic, and I did not mark them as community wisdom because the page never called them that.

## ffmpeg
- Ledger: `Shop/ffmpeg/ffmpeg — tuning.md` (new)
- Dated items moved: 3 (2026-05-26, Kuramoto Round 1 teaching reel)
- Rules now stated: 9 (The build 1, Concat 1, Loudness and sample rate 1, plus 6 under "Community wisdom, not yet met on a job")
- Removed: `last_tested: 2026-06-16`, `last_gotcha: 2026-05-26`
- Run line: `2026-06-16 · Shop/Maker/run-tests.mjs encode + decode smoke, probe · nothing new` (from `d43c398d`)
- Not placed: the 2026-06-19 Radio Play recipe calls `amix normalize=0` one of "the two gotchas", but the Gotchas section never had it. I left it in Recipes rather than invent a rule.

## p5.js
- Ledger: `Shop/p5.js/p5.js — tuning.md` (new)
- Dated items moved: 4 (2026-05-10 two-phasor explorer 2, 2026-05-29 Flocking expressive 2)
- Rules now stated: 4 (The draw loop and verification 2, Drawing 2)
- Removed: `last_tested: 2026-06-16`, `last_gotcha: 2026-05-29`
- Run line: `2026-06-16 · Shop/Maker/run-tests.mjs web-smoke, probe · nothing new` (from `d43c398d`)
- Nothing left unplaced.

## One divergence from the exemplar
FLUX's ledger has no run lines ("seeded history carries no run lines"). This brief, step 2, asks for `last_tested`'s date to become the ledger's first run line, so each of my ledgers has exactly one. It goes under the matching job's items, or under its own heading "From the Shop's test harness — 2026-06-16" when the date was the harness and not a job. All other seeded history has no run lines, as in FLUX. If the coordinator wants FLUX's exact form, delete those seven lines.

## Seen, not touched
- VCV Patch Generator's `tool_version` still reads `archetypes v0.1 (2026-05-29)`, but Generative Audio Devices says `archetypes.json` is v0.2. The brief keeps the rest of the frontmatter off-limits, so this is flagged only.
- The Test Suite "Last run" dates on Tone.js, ffmpeg and p5.js (2026-05-30) predate the 2026-06-16 harness pass. I left them as written.

## Checks run
- YAML frontmatter parses on all 14 files. No `last_tested` or `last_gotcha` remains on my seven pages. Each ledger's `title` matches its filename and links to its parent.
- `python3 _ops/swarm/lint-bundle-hygiene.py`: 0 errors, 14 warnings, none on my files.
- `lint-ghost-links.py`: no ghost link in my files. The one VCV-bundle hit, `[[PDL]]` in the spec file, was already there.
- No git writes.

## `command grep -l '^last_gotcha:' Shop/*.md`
```
Shop/ComfyUI.md
Shop/D3.js.md
Shop/Depth Anything.md
Shop/Kokoro.md
Shop/LaMa.md
Shop/LaTeX.md
Shop/Manim CE.md
Shop/Stable Audio Open.md
```
None of these are mine. All are A1's except `Shop/Stable Audio Open.md`, which is A2's.
