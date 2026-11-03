# Loudon Live Design System

The brand and visual system for **Loud'n Live** — Loudon's teaching and coaching face, online and in person: YouTube videos and livestreams for electronic musicians, the RTM series, one-on-one coaching. It is a moving target; `Projects/Loudon Live.md` holds the current portrait and wins when the two disagree. Instruments get built, sound gets studied, and music gets played; DSP fundamentals sit next to real music technique, and the work in progress is part of the teaching.

> Building synths, effects, and tools — out loud.

**Audience:** Electronic musicians, to start; in time, creative coaching for people who learn across fields on their own (Autodidact Polymaths, now in the background, 2026-10-14). Named situationally in prose, phrased to the register and said once — **not** stamped on every artifact (see *Naming the audience*, below).

**Footer signature:** `Loud'n Live` — the wordmark alone. *(The `· Autodidact Polymaths` tagline was retired from the universal footer 2026-07; forward-only, already-shipped artifacts keep the old footer.)*

**Editorial posture:** Subject is sound and music; tools are the medium. Honesty is a light touch, not a confession. Loud'n Live is itself a teaching artifact.

**Pillars:** The Four Pillars — *Creation · Tools · Philosophy · Practice* — four projections of a single higher-dimensional reality cast by the light of curiosity.

## Sources

Synthesised from Loudon's personal knowledge base **"The Palace"** (mounted via local FS Access at `The Palace/`). Key entries:

| Entry | What it provided |
|---|---|
| `Projects/Loudon Live.md` | Channel charter, editorial posture, audience |
| `Projects/Loudon Live/Loudon Live — launch kit.md` | Channel copy, OBS scene specs, asset list |
| `Projects/Loudon Live/Archive/Loudon Live — asset plan.md` | The variant system — 6 palettes × 6 generators × seed (archived 2026-09-25; this system built it) |
| `Projects/Loudon Live/toolchain/render_starting_soon.py` | Reference palette + generator code |
| `Projects/Shepard Tone Synthesizer/session-1-interactive.html` | Canonical session-artifact reference |
| `Hyperdimensional Prism.md` | The Lissajous-in-sphere visual-identity essay |
| `FOUR PILLARS.md` · `Autodidact Polymaths.md` · `Progressive Staging.md` | Pedagogy |
| `Hilaritas Generator.md` · `Quality Manifesto.md` · `Trickster.md` · `Palace Philosophies.md` · `Playful Interface Design.md` · `The Shop.md` · `Shop/Maker.md` · `Enrichment.md` | Voice, tone, taste |

Snapshots of the most useful sources live under `_reference/` for offline use.

## Index

| Path | Contents |
|---|---|
| `colors_and_type.css` | Locked tokens — type, palettes (Graphite default + 5 skin classes), spacing, radii, motion |
| `controls.css` | The browser's furniture re-dressed for the bare elements — scrollbars, selects, checkboxes, ranges, the textarea grip, spinners, `<details>`, focus, selection, autofill, links — in tokens, per skin. Load after `colors_and_type.css`. |
| `preview/controls.html` | The specimen: every control bare, switchable across the six skins. |
| `assets/favicon.svg` | The tab icon for a public-channel page with no entry of its own: the Lissajous at 32px. |
| `palace-tokens.js` | Runtime token reader — `palaceTokens()` reads the active skin's values from `colors_and_type.css` into JS so D3 / Plot / p5 charts stay update-safe (never hardcode a hex). Also `palaceSeries()` (ordered ramp) and `palaceCategorical()` (the `--cat-1..6` qualitative palette). Read by any JS-driven visual. |
| `palace-plot-defaults.js` | Observable Plot house-defaults wrapper — `palacePlot()` bakes the active skin (bg / fg-3 text / mono face / token frame) into every chart. Built on `palace-tokens.js`. |
| `looks/` | Loud'n Live's complete looks — `worn-broadcast.html`, the first (§ Looks) |
| `assets/` | Brand marks — Lissajous logos, wordmark, LL monogram, avatar, watermark |
| `assets/logo-lissajous.live.html` | The canonical p5.js live Lissajous sketch (the patch IS the logo) |
| `assets/generators/` | Six per-stream generative SVGs |
| `preview/` | Design-system specimen cards (Type · Colors · Spacing · Components · Brand) |
| `slides/` | OBS card templates (1920 × 1080) — gallery at `slides/index.html` |
| `ui_kits/session-artifact/` | Long-form session HTML, JSX components |
| `ui_kits/stream-overlay/` | OBS live composite — cam, lower-third, watermark, chat |
| `SKILL.md` | Agent-Skills front-matter for Claude Code |
| `_reference/` | Source-file snapshots |

---

## Content fundamentals · the house style

The default dress, worked out through review — a **floor, not a cage**. A tiny floor is non-negotiable (the studio voice, the Lissajous sigil, the nevers: no emoji / no hype); everything below is the reliable *house style* a projection reaches for and may depart from. Every decision below carries a rule and a *why*. When in doubt: hold the floor, reach for the house style, depart deliberately. Studio register, never commercial-production. Loudon presents as many projections (loudon, LDN, Loud'n Live, Professor Compressor, Sonic Sensei, TRICKSTER) — this house style is the home of the **Loud'n Live** projection.

### Voice

**Curious, technical, professional. First-person. Studio register.** Three vocabulary moves:

| Do | Don't |
|---|---|
| "Let's explore" · "hang out" · "working on something synth-shaped" | "I'll teach" · "subscribe and hit the bell" |
| Collaborators · participants | Students · followers · audience |
| "Live build · synth lab, session 1" · "Sound lab · first principles" | "Finishing the synth in one hour" · "Working synth by end of stream" |
| Sketch / Study / Piece (or per-medium analogues: Demo / Take / Master) | MVP / v1 / final · launch / ship |

The italic-light *Live* is the only italicised word in the wordmark — and italic in body is reserved for emphasis and for the *one* keyword in a two-word title ("The infinite *staircase*", "The *leaky* integrator").

**Sentence case in display and body. UPPERCASE only for mono eyebrows and footers — never for emphasis in prose.**

**First-person.** "I'm working on…" in trailer copy. First-person plural "we'll see / let's…" when the work is collaborative. Second-person "you" only when teaching directly, sparingly — the channel is *with* the viewer, not *at* them.

**Emoji & decorative unicode: never.** No 🎶 / 🔥 / ✨ / hashtag clouds. The only typographic accents are the `·` interpunct as separator, em-dashes for asides, and `● ▸ ◂ ◐ ◇ ◉` for live/state indicators.

**No abbreviations** when a full word fits. *Snare*, not "SNR". *Hats*, not "HAT". Mono labels can be terse but should not be cryptic.

**Honesty as a light touch.** "The channel itself is a work in progress" appears once, in the trailer. It does not become the brand.

---

### Type · the LOCKED stack

| Role | Family | Weights | Use |
|---|---|---|---|
| **Display / wordmark** | **Anton** | 400 | LOUD’N LIVE lockup · slide hero numbers and big poster headlines |
| **Body serif** | **Cormorant Garamond** | 300 (italic 300, 400 reserved) | Long-form reading body in publication-flavoured artifacts · italic pull-quotes · identity statements |
| **UI sans** | **Manrope** | 300 / 400 / 500 / 700 | Magazine-article body in session artifacts · captions · lower-thirds · labels · subheads |
| **Mono** | **JetBrains Mono** | 400 / 500 / 600 | Metadata · eyebrows · parameter chips · code · timestamps |
| **Pixel** | **Silkscreen** | 400 | Sparse legends · dividers · `124 BPM` and `A · 02 / 04` style markers. **Reserved register — never body.** |

**Rules.** Anton is always uppercase, always +0.005em. Cormorant body runs 300 weight at 0.005em tracking. Manrope is 300 for body, 500 for labels; never bold body. Mono eyebrows track +0.18em; mono overlines on the OBS title bar track +0.22em. Pixel font is for technical garnishes only — pixelation is a register, not a default.

**The italic-light "Live" trick.** In any wordmark or hero, when "Live" appears alongside the channel name it is italic, weight 300, in the active accent colour. The trick survives across all skins.

**The `’n` connector.** *(Replaced the `/` slash separator 2026-07.)* The connector is the word `’n`, not a slash — and it **case-matches whatever run it sits in.** In an all-caps setting (the Anton display lockup, mono all-caps eyebrows) the `’N` is a full-size cap, part of the run: `LOUD’N LIVE`. In title or sentence case (prose, body, signatures) it is lowercase: `Loud’n Live`. **Never strand a shrunken lowercase `’n` between all-caps words** — a tiny `n` marooned in a caps lockup (worst beside the italic *Live*) reads wrong. Said aloud the mark is "Loudon" (the *o* elided); read on the page it is "loud *and* live." One apostrophe, always (not the three-word `Loud 'n' Live` idiom). Accent and glow live on "LIVE" only. **Plain-text fallback** (handles / URL slugs / hashtags, where no apostrophe survives): `loudonlive` — restore the *o*, never `loudnlive`.

---

### Color · the LOCKED system

**The brand is intentionally multi-palette.** A locked grammar (type, layout, wordmark) cycles a per-stream skin (palette + generative element + seed). The Graphite skin is the channel default.

| Skin | Register | Bg | Accent | When |
|---|---|---|---|---|
| **Graphite** (default) | Workshop in dim light | `#0a0a0f` | `#e8b84a` signal-amber | The channel default |
| **Amber Lab** | Parchment · philosophical · long-form contemplation | `#f4ecdc` | `#e8651b` signal-orange | Quote · theory · philosophy episodes |
| **CRT** | Phosphor green on stark black · scope / DSP / signal-watching | `#000000` | `#00ff66` phosphor green | First-principles DSP, oscilloscope thinking |
| **Strobe** | Pure black + white + phosphor red · dance / performance | `#000000` | `#ff2a2a` phosphor red | High-energy live, set-pieces, dance |
| **Cobalt Grid** | Lab · mathematics · blueprint | `#0e1f4d` | `#a8e040` lime | Mathematics, formal theory, blueprint-thinking |
| **Drafting** | Paper · schematic · engineering | `#f0eee5` | `#c8261a` engineering red | Build instructions, schematics, signal flow |

**Semantic accents are constant across skins:** `info` (parameter-blue `#4a8fff`), `success` (phosphor green `#00ff66`), `danger` (phosphor red `#ff2a2a`). Use sparingly — one signal per layout.

**Cyan is allowed.** In Worn Broadcast it carries handles, links and one side of the colour fringe (§ Looks). The old teal callout stays retired: change-notes use `info` blue.

**Glow is reserved.** The `text-shadow` glow on the wordmark's "LIVE" is the brand's signature lit-sign moment. Use the same glow vocabulary on the on-air red dot (animated 1.6 s pulse) and on tier badges of `success` colour. Do not glow neutral foreground text.

---

### Looks

Loud'n Live wears complete looks, and there will be a few. A look is a whole dress for the projection: palette, type, texture and motion travel together and are worn whole, where a skin swaps only the palette over the locked grammar. The six skins stay the default for everything else the public channel shows.

| Look | File | What it is |
|---|---|---|
| **Worn Broadcast** (2026-10-25, the first) | `looks/worn-broadcast.html` | A signal wearing out on old hardware. STIGMERGY's phosphor and grammar carried most of the way; Anton, the amber LIVE and the Lissajous sigil keep it Loud'n Live. Ground `#040805`, phosphor `#33ff66`, amber `#ffb000` for LIVE alone, cyan `#7fdbff` on handles and links. Anton · IBM Plex Mono · VT323. Circuit board, tube face, scanlines, grain, one glitch every few seconds, never constant. |
| **Cyanotype** (2026-10-25, the second) | `looks/cyanotype.html` | A blueprint print a careful hand has worked on: the Drafting Table grammar on a dark cyanotype ground, revised. Every line ruled; the hand shows in guidelines left in, an erased old name, a rubbed-out first sigil, a revision table, a checker's red pencil. Ground a generated paper plate tinted to `#1e5c88` (a tone map only), cream ink `#f3edd8`, amber `#ffc23a` outline on LIVE, ice-blue `#a9d4f0` dimensions, red pencil `#ef4a36`. Josefin Sans (the wordmark a thin-pen outline) · JetBrains Mono · Caveat. The sigil draws itself once; the on-air dot pulses. |
| **Night Signal** (2026-10-25, the third) | `looks/night-signal.html` | Cyberpunk and electronic music, layered and dirty: Worn Broadcast's bones pushed into a city at night and onto a dance floor. A generated night plate (rain on glass, neon bokeh), the old board, a TB-303 filter sweep, a spectrum analyser, the sigil as a stereo vectorscope, a synth panel with six 303 knobs over two octaves of keys, the neon wordmark (LOUD'N magenta, LIVE cyan, one tube failing), rain at two depths. Ground `#03030a`, magenta `#ff2bd6`, cyan `#00e5ff`, acid `#c6ff00`, amber `#ffb000`. Anton · Chakra Petch · IBM Plex Mono · VT323. Everything moves on one clock (`?bpm=`, default 128), with a drop every eight bars. |

The file's header comment is each look's spec. Each fills from its URL, so it drops into OBS as a browser source: Worn Broadcast takes `?session=…&topic=…&handle=…&title=…&link=…&status=…&ghost=…`, Cyanotype `?sheet=…&title=…&subject=…&no=…&status=…&n1=…&n2=…&n3=…&check=…`, Night Signal `?bpm=…&session=…&chip=…&topic=…&handle=…&title=…`. The set is complete for now.

### Spacing · radii · borders

- **Radii ceiling = 4 px.** 0 / 1 / 2 / 4 only. Tags & params → 1 px; cards & panels → 2 px; 4 px is the ceiling. **Never 8, never 12.** Pill (999) only when shape carries meaning — `● LIVE`, tier badge.
- **Borders are 1 – 1.5 px.** Never thicker. `--border` is `#4a4a5e` (bumped for visible separation on `#0a0a0f`). On hover, accent border at 0.55.
- **No redundant separation.** If a row has a border, don't also put a dividing line under it. Choose one mechanism.
- **Spacing scale** is 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 120. Geometric thereafter.

---

### Elevation

Elevation lifts off dark surfaces via an **inset top highlight + dark drop**, never just a drop alone. Three levels: base (1 px highlight, 1 px drop), cards (medium highlight, 6 px drop), overlays (strong highlight, 18 px wide drop). Plus accent glow (reserved for the *one* primary CTA per view) and danger glow (reserved for the on-air red dot).

---

### Motion

**Restrained.** `cubic-bezier(.4, 0, .2, 1)` 220 ms is the default; emphasised motion uses `.2 .9 .2 1` at 550 ms. The two ambient motions allowed are: (1) the Lissajous-trace slow rotation in `assets/logo-lissajous.live.html`, and (2) the 1.6 s pulse on the on-air red dot. No bounces, no springs, no decorative motion.

---

### Iconography

Iconographic system: **none, by design.** The channel uses **typographic glyphs as state indicators** (`● ▸ · ◐ ◇`), the **Lissajous trace** as the channel mark, and the **LL monogram** in avatars / lower-thirds. **No emoji. No CDN icon library.** Where a real icon set is later needed, Phosphor Light is the recommended substitute.

---

### The browser's furniture

A browser supplies what a page does not: a scrollbar, a select's chevron and popup, the checkbox and the radio, a range slider's thumb, a textarea's resize grip, a number field's spinner, the `<details>` triangle, the focus ring, the selection colour, the autofill tint, the tab icon. Each arrives in the operating system's dress and sits in the artifact like a borrowed chair. On 2026-11-03 Loudon saw one: a Graphite textarea with a white scrollbar and the OS's dotted grip. A sweep found the same on most of the 500 artifacts the palace has made: 424 dark pages with no `color-scheme`, 177 range sliders with the OS thumb, 34 textareas with the OS grip, 123 pages that hid keyboard focus and drew nothing in its place, no tab icon anywhere.

`controls.css`, loaded after `colors_and_type.css` and before the artifact's own styles, re-dresses all of it for the bare elements, so a page gets it for free and a class of its own still wins by order. Its rules are the house grammar's: square or 2 px; a hairline is the control; the thumb is a mark, not a bar; accent only where the hand is (dragging, checked, keyboard focus); every value is also written as text beside its control. Three choices worth knowing:

- **The scrollbar is a thin mark in a transparent gutter.** It rests in `--fg-4`, wakes to `--fg-3` under the pointer, and goes accent only while dragged. No track, no arrows.
- **`color-scheme` follows the skin.** Graphite, CRT, Strobe and Cobalt Grid are dark; Amber Lab and Drafting are light; the select popup, the date picker and the body scrollbar follow. This one line fixes most of what the sweep found.
- **Checked is the house's `●` on.** Accent with the page colour ringed inside, not a tick. A radio is round because the shape means one-of. Focus is one accent hairline, 2 px outside; the house's one glow stays with the call to action.

It also sets what the browser draws when nothing is asked: links (accent, hairline under, no purple visited), `hr`, `mark` (accent-soft, not yellow), `kbd`, `code` in the mono face, tabular numerals in cells and readouts, the autofill tint painted back, an invalid field in `--danger` with no OS bubble, `overscroll-behavior: contain` on in-window scrollers, no tap flash, and nothing moving under `prefers-reduced-motion` (the Lissajous rotation and the on-air pulse included). Where Chrome lets a page draw the select popup (`appearance: base-select`, 135+), it wears the skin; elsewhere `color-scheme` keeps it on the right side of the light.

What it cannot dress: `<audio controls>` and `<video controls>` (the OS player; draw a `▸ ■` button and a hairline scrub) and the `title=` tooltip (write the caption, or a `◇` aside). A shared transport is the next component the system wants.

**The tab icon.** Every canon entry wears an avatar and a hero ([[Hero and Avatar Maker]]). A page in an entry's bundle takes the avatar beside it as its tab icon, `<link rel="icon" href="<Entry> — icon.png">`, and may pin the hero behind its header where that fits (STIGMERGY already renders the hero that way). A page in a subfolder of the bundle reaches it by `../` on its own, and by `/palace/<Entry>/<Entry> — icon.png` when it is framed, because the frame refuses `..` (`_ops/rich-face/README.md` § Making pieces). A public-channel page with no entry takes `assets/favicon.svg`. `<meta name="theme-color">` carries the skin's `--bg`. The specimen is `preview/controls.html`.

---

### Symbolic vocabulary · use intentionally

Each palette and each generator carries a conceptual handle that the autodidact polymath can read at a glance. **Use them when they're relevant, not as decoration.**

| Symbol / register | Conceptual handle |
|---|---|
| Lissajous trace inside a sphere | The higher-dimensional object revealed through accumulated motion · the Hyperdimensional Prism |
| Waveform stack (sine + saw + square + noise) | DSP fundamentals · the spectrum |
| Particle field | Drift · contemplation · slow change |
| Lissajous bundle | Coupled oscillations · ratio families · Kuramoto |
| Spectral bands | Spectrum as bar chart · Fourier register |
| Modular grid (step sequencer) | Rhythm · time-discretized music · pattern programming |
| Phase interference | Wave physics · two-source field |
| CRT scanline veil | First-principles signal watching · the scope on the bench |
| Drafting registration marks | Engineering / schematic register · the patch as plan |
| Parchment warm cream | Philosophy / theory / quote · long-form contemplation |
| Pixel typography (Silkscreen) | Technical garnish · sequencer time-marker · drum-machine display |
| Phosphor red dot, pulsing | "On air" · live · the channel is broadcasting *now* |

---

### Avoid

- Minty greens. Phosphor green replaces the old teal in every callout.
- Decorative gradients in chrome. The only allowed gradient is the radial protection-gradient under cards on busy backgrounds.
- Emoji. CDN icon libraries. Hashtag clouds.
- Bubbly humanist fonts (DM Sans, Fraunces, Source Serif 4 in display use). Source Serif 4 stays only as the body-serif fallback.
- Radii ≥ 8 px. Heavy drop shadows on dark surfaces without an inset top highlight.
- Centred-book-cover layouts in slides — left-aligned editorial spread is the default.
- Abbreviations cryptic enough to need decoding ("SNR" instead of "Snare").
- Outcome-promising titles, second-person broadcast voice, emoji.
- The browser's own furniture: an OS scrollbar, select chevron, checkbox, slider thumb, resize grip, spinner or details triangle on a page in this dress. A dark skin with no `color-scheme: dark`. A page with no tab icon.

---

## Naming the audience — state it, don't stamp it

*(New 2026-07. Replaces the old universal `· Autodidact Polymaths` footer stamp.)*

The audience is electronic musicians, to start (2026-10-14). The idea below, people who teach themselves across fields, stays in the background: the rules and the phrasing bank still hold for when it is named.

The audience used to ride every footer. That over-said it, and "autodidact polymaths" carries an academic tilt that fights the everyday voice. Instead, name the idea in specific moments — prose, intros — quickly and never leaned on. Two rules:

1. **Describe the way of learning, never label the person.** "You teach yourself things across fields" invites recognition; "you are a polymath" tells someone what they are — the move the phrase was built to avoid.
2. **Match the phrasing to the register, and say it once.** The term "autodidact polymaths" keeps a home, but a rare one: the Amber Lab / long-form register, used once. Everywhere else, a plainer line tuned to the room.

**Phrasing bank** (living — add good lines back, tagged by register):

| Register / skin | How to say it, quickly and in passing |
|---|---|
| **Graphite** (workshop) | "…if you teach yourself things — lots of things — you're in the right place." / "for people who learn by building, whatever the field." |
| **Amber Lab** (philosophical) | *The one place the term earns its keep:* "a channel for autodidact polymaths — the self-taught, working across more than one field at once." Said once, then dropped. |
| **CRT** (DSP · first-principles) | "We'll derive this from scratch — no prerequisites assumed, just a willingness to be a beginner for an hour." |
| **Strobe** (performance) | "For the ones who never picked just one thing." |
| **Cobalt Grid** (math) | "If you like it when a concept from one field explains something in another — that's the whole idea here." |
| **Drafting** (build) | "Built for generalists — people assembling their own education one project at a time." |

The **silent** version is the cross-domain aside — a `◇`-marked marginal note naming an idea in a second field's vocabulary. It proves who the channel is for without a word. Asides demonstrate; the occasional line names.

---

*Footer of every future Loud'n Live artifact: `Loud'n Live` (the wordmark alone).*
