# Review Layer — drop-in kit

A toggle-able per-moment commenting surface for early-version artifacts. Mount it on a first build so Loudon can leave section-level feedback **in context**, then send it to the board as the next round's brief. Flip it off to ship clean. A UI that runs inside another application — a plugin in a DAW, a Max for Live device — mounts it on its browser mock page, never in the host ([[Review Layer]]).

Concept and rationale: [[Review Layer]]. This kit is **one method** — the DOM-anchored one (inline pins + docked panel) — and it is *not* the definition of the layer. New review methods are wanted, not this one reused: for slides, video, generated images, sound, or anything else, inventing a fresh anchoring is the point. This file only covers HTML artifacts with stable DOM.

## Use

Include or paste `review-layer.js`, then call `mountReviewLayer` once after the DOM exists:

```html
<script src="review-layer.js"></script>
<script>
  mountReviewLayer({
    page: 'Wavetable Scanner',      // the palace entry this is a proof of — Send puts the notes on its board
    project: 'wavetable-scanner',   // names the storage key + export filenames
    round: 1,                       // bump each revision pass
    review: true,                   // set false (or omit) to ship clean — mounts nothing
    moments: [
      { id:'concept', label:'Concept & framing',    tag:'text',    sel:'.lead' },
      { id:'visual',  label:'Visual design',        tag:'design',  sel:'.topline' },
      { id:'phase',   label:'The disorder section',  tag:'control', sel:'#controls' },
      { id:'sound',   label:'Overall sound & mix',   tag:'sound' },   // no sel → panel-only
    ],
  });
</script>
```

Each moment becomes one autosaving note (localStorage, namespaced per project+round). A moment with a `sel` also gets an inline `◇/◆` pin appended to that element (`◆` once it has a note). Toggle the panel with the `◇ Review` tab.

## Send — the notes reach the board

Give the kit `page`, the palace entry the artifact belongs to, and its first button is **Send to STIGMERGY**. Open the artifact through the answers server, `http://127.0.0.1:8211/` plus its palace path (`node _ops/loudon-eval/eval-server.mjs`, with STIGMERGY running), and Send puts every noted moment on the board as one review note on that entry, by the same wire as `_ops/loudon-eval/answers.js`. It needs no second script. The note surfaces where work on the page starts: the QUEUE's REVIEW NOTE card, the Return map, a baton's pickup, and [[Enrichment]]'s first step. A session reads it with `node _ops/loudon-eval/read-answers.mjs --page "<Entry>"`.

A send sends once: the button is off while it is in flight, and a send that lands clears the notes it carried, so a second click finds nothing new. A note typed during the send stays. A send that can't land — the page opened as a file, no answers server, STIGMERGY stopped — keeps every note and says why.

The exports are the fallback, for an artifact opened anywhere else:

- **Copy for Claude** — a markdown digest of the non-empty notes, to paste in the chat.
- **Download .json** — structured, one record per moment (`{id, label, tag, note}`), for **individual responses** Claude can act on one at a time (the oblique-harvest pattern).
- **Download .md** — the markdown digest as a file (clipboard fallback for `file://`).

Without `page` the kit has no Send and works as it always did; the pages that pasted an earlier copy inline keep their Copy button until someone gives them the new kit and a `page`. A piece made for a rich face leaves the kit out: the face carries one dock for every section ([[Enrichment]], `_ops/rich-face/`).

## Granularity — the one rule that matters

**One moment per natural unit of the medium, not one per control.** A handful of moments you can review in a couple of minutes. The failure mode (learned from `Artifacts/Murmuration Synth/Murmuration.html`, which carried one moment per slider) is a review surface heavier than the artifact. Group related controls into a single moment — "the disorder/phase section", not six sliders.

## Anchoring rules

- Pin only **stable** elements. Never put a `sel` on a node whose `innerHTML` is rewritten each frame (a canvas HUD, a live readout) — the pin gets wiped. Those moments are panel-only (omit `sel`).
- `review: false` mounts nothing and injects no styles — the clean shipped state. No separate killswitch needed.

## Styling

Reads Loudon Live design tokens (`--accent`, `--bg`, `--fg-1/2/3`, `--border`, `--border-soft`, `--bg-elev-1/2`, `--mono`, `--sans`, `--r-sm`) with safe fallbacks, so it inherits the active skin and also works outside the system. Glyphs `◇ ◆`, no emoji.

---

*Origin: mechanism from Murmuration (2026-05-31); per-item granularity + JSON export from the oblique harvest (`_ops/Harvest Ceremony/Archive/oblique-harvest-final.html`). See [[Review Layer]].*
