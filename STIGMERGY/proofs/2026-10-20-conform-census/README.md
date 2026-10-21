---
title: README
born: 2026-10-20
links:
  - { target: "[[STIGMERGY]]", type: connects-to, label: proof-for }
forward_vector: "I hold the piece checker's first census over every web page the palace keeps, and the false alarms it took to make its report true, so the run that turns the gates on can be compared with this one."
---

# Conform census, 2026-10-20

The piece checker, `_ops/rich-face/conform.mjs`, reads every piece against what it declares in its `<head>` and against what its code does ([[STIGMERGY — spec — rich-face pieces]] § 5). The spec says it runs report-only over every web page first, until its false alarms are tuned out. `census.md` beside this is that run, after the tuning. It reads only. Its browser pass serves the palace through the rich face's own handler on a loopback port of its own, never `:5173`, and never the board.

## Running it

```
node _ops/rich-face/conform.mjs --all --browser --out census.md     # every page, static and in the browser (~2 min)
node _ops/rich-face/conform.mjs --all --static                      # every page, static only (~2 s)
node _ops/rich-face/conform.mjs "Kuramoto Coupling"                 # one rich face, static and browser
```

The browser pass needs Playwright's Chromium from STIGMERGY's install. Without it the static checks still run and the report says the browser pass was skipped.

## What it found

Run on 2026-10-20 on the branch `claude/piece-origin-checker-dd8159`. A static rerun at 74c4e568 reads the same; the browser pass was not rerun there. The counts move as pages change, so run it again before quoting them.

256 pages and 2 rich faces. No page declares yet, so 244 are pre-contract and 12 are errored. That makes **15 errors, all real**:

- **8 unpinned CDN tags.** `d3@7` and `@observablehq/plot@0.6`, in four Flocking figures and the design system's categorical palette. These are the ones the spec names; pinning them is the migration's job (step 9).
- **3 files that are nowhere.**
  - Two BLUELINE proofs fetch a `storyboard.json` that was never committed.
  - The Quantum Synthesizer demo loads a `quantum-membrane.js` that does not exist.
- **4 BLUELINE proofs that need their own server.** Each opens a WebSocket to `/ws` on whatever served it, so it cannot run as a piece anywhere else.

There are also 1100 warnings. Most say what a declaration will have to say, or what the sandbox breaks today:

- 238 sibling files loaded and not declared, on 49 pages.
- 29 needs used and not declared: storage, camera, MIDI, microphone.
- 60 CDN tags with no SRI hash.
- 584 renders that git ignores. Since 2026-10-18 renders stay on the Mac, so those pages work only where the render sits.
- 145 errors the sandbox causes, which the piece origin should cure.
- 20 sounding pieces where the checker's click found no start control.

## The false alarms, and what took them out

The first static pass raised **664 errors**. The first browser pass raised **124 console errors**, on 71 pages. Each kind below was checked against the pages that raised it, then tuned:

| What raised it | How it was tuned |
|---|---|
| 533 of 571 "missing" files were renders git ignores. A worktree never has them; the owner checkout has them on disk. | Missing files are asked of `git check-ignore` once per run, by pattern. An ignored one is `file-ignored`, a warning. |
| `loadPreset('smooth')` read as a file. | A generic loader's string counts only when it reads as a file (an extension) or a URL. |
| `<script src>` inside a JS comment, and `<img src="passes/'+s.shot+'.png">` inside a script string. | Tags are read outside scripts and styles. String-built, `${…}`, `{{…}}` and `__PLACEHOLDER__` URLs are skipped, and so is `%23` in an SVG data URI. |
| Templates throw on their unfilled data (`/*__DATA__*/`). | Templates (`*template*.html`, `*.tpl.html`) are not pieces. So are `rate.html` (served by its own eval server) and the app's Vite mockups (`conform.json`, `not_pieces`). |
| Fonts and fetches refused to origin `null`, and the `ERR_FAILED` / `Failed to fetch` that follow each one. | These are `sandbox-blocked`, a warning, counted only when a CORS block came first. |
| p5 probing the motion sensors at start. | Noise, dropped. |
| A script error that only follows a blocked load (a JSX module the sandbox refused). | `error-after-block`, a warning: judge it again on the piece origin. |
| `Failed to load resource: 404` with no path. | The response is read instead. A run-time 404 becomes `file-missing` with its path, and an ignored one becomes `file-ignored`. |
| A webcam's `<video>` read as sound. | Sound means an audio context, Tone, an `<audio>`, or a `<video>` playing a file. |
| Heavy pieces missing their time among eight frames at once. Waveguide studies hit the 15 s load limit, and others the 3 s height limit, at one width only. | A piece that misses its time is driven again, alone, before the finding stands. Three were, and passed. |
| Kuramoto's waveform-locking still sounding 0.5 s after hush. It fades, then suspends 200 ms later. | Quiet is asked for over 1.5 s. |

## What it cannot see yet

- **Code outside the page.** Statically, it reads the page's own HTML, inline scripts and inline styles. A stylesheet it links (STIGMERGY's design-system fonts) or a library from a CDN is seen only in the browser.
- **The start control.** `play-silent` is a guess at where the piece starts its sound: a control named play or start, else the first button, else the middle. A piece that starts on a key, or behind a toggle already labelled ⏸, is reported silent.
- **Libraries' needs.** `need-unused` cannot see what a library does, so a need declared for a library's sake needs an `allow` line in `conform.json`.
- **The piece origin.** This pass frames every piece the way the rich face does today: sandboxed, opaque, served with the kit. When lane A's piece origin lands, the checker's host frame (`hostPage` in `conform.mjs`) should load each piece from there, with its declared allow list. The `sandbox-blocked` warnings should then mostly go, and what stays is a real fault.
