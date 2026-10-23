---
title: "Enrichment — sketch — floating companion"
born: 2026-10-13
links:
  - target: "[[Enrichment]]"
    type: connects-to
    label: sketch-for
  - target: "[[Review Layer]]"
    type: connects-to
    label: the-other-half-of-the-loop
forward_vector: "I am a design note, not a build: what it would take to float the entry-agent window over a page's rich face, so Loudon can fix what he sees without leaving the page. I end when he has made the two choices below and someone builds it, or he decides the QUEUE is enough."
---

# Floating companion on the rich face — sketch

> **2026-10-23 — decided, for now.** Loudon: no floating companion on the rich face. The companion is a feature of the text face only, and the rich face's notes answer it ("we use the Notes for the rich face for now"). The rich face now opens as its own page (`f67b19dd`, landed `15882875`). What follows is the design as it stood before that.

Loudon asked for two ways to turn rich-face review notes into work. The first is in: each note becomes a QUEUE item (`25837dc0`). This note covers the second: the companion window floating over the rich face, for quick fixes in place. Nothing here is built.

## What is already there

- **The window exists, on the other face.** `EntryAgentWindow.jsx` is a box that floats over an entry in the STATE reader and glows the section it sits over (`:14–27`). Its turns already carry that section (`server/api/entry-agent.js:58–62`, `companion-lane.js:216`). Edits are proposed, approved, committed through the enforced path, and undoable (`entry-agent.js:79`, `:135`).
- **The rich face is a separate page.** Choosing it in the face switch leaves the app (`EntryReader.jsx:213`, `window.location.assign`) for the plain-HTML page at `/rich/`, where no window runs.
- **They share an origin.** STIGMERGY mounts the rich face at `/rich/` (`server/api/rich.js:1–8`), so a page served there can call `/api/entry-agent/*`. No framing header blocks an iframe of it; none is set anywhere in the app or `_ops/rich-face/`.
- **The write path edits the text only.** Its ops are body edits and frontmatter edits on the `.md` (`armed-write.js:317–423`). Nothing writes the rich manifest (`[Entry] — rich.json`), and the turn's grounding doesn't read it.

## Two ways to put it there

**A. Bring the rich face into the reader (recommended).** When the face switch picks rich, show `/rich/?entry=` in an iframe inside the reader instead of navigating away, and float the existing window over it. The scroll-spy, which today reads STATE's headings (`EntryAgentWindow.jsx:47–48`, `data-testid="heading-h*"`), learns to read the iframe's headings too; same origin makes that a direct DOM read. An approved text edit needs no extra plumbing, because the rich face already re-reads the `.md` every few seconds ([[Enrichment]] § Drift).
*Reuses:* the whole window, its lane, the approve/undo/proof protocol, the SSE reply path.
*Costs:* the face switch's rich branch in `EntryReader.jsx`, and a second heading source for the scroll-spy and glow. My estimate is one focused session with tests, for text edits. That estimate has not been tested.

**B. A small window written into `rich.html`.** Plain JS that posts to `/api/entry-agent/turn` with the heading in view, listens for the reply, and posts approve/undo. It keeps the rich face standalone, but it is a second client of a subtle protocol, and every change to the window would need making twice. It also could not run on the standalone server (`rich-server.mjs`, :8842), which has no `/api/entry-agent/*`. The baton warned against a second companion surface. B is that.

## What Loudon must choose

1. **A or B: is the rich face a page inside STIGMERGY, or its own page?** A keeps one companion and makes the reader the everyday door. B keeps the rich face self-contained at the price of two windows. I recommend A.
2. **What may a fix on the rich face change?** The text only, which the write path can do today. Or the rich face itself as well: move a piece, retire it, rewrite a caption. That means a new family of manifest ops in `armed-write.js` with preview and undo, plus the manifest in the turn's grounding. It is a second build of about the same size as the first, and it touches `app/server/*`, so it waits until no steward is live. I recommend starting with text only and adding manifest ops once Loudon has seen what he actually reaches for.

## Small things either way

- Give the turn the page's open `human_eval` notes as grounding, so the window starts from what Loudon already said, the same thing [[Enrichment]]'s step 1 asks a run to do.
- Never mount it on the public read view (`RICH_STATIC`, `rich.html:180–184`).
- `companion-lane.js:33` pins `DEFAULT_MODEL = 'opus'`. That line is changing under the latest-Opus resolver baton (`STIGMERGY/STIGMERGY — baton — latest-opus-resolver.md`), so build against whatever it becomes.

## In the way today (2026-10-13)

The owner tree had uncommitted edits in `EntryReader.jsx` and `StateDeck.jsx`, which are A's files. `rich.html` and `rich-handler.mjs` belong to another worker this session, which is B's ground. Whoever builds this should check both first.
