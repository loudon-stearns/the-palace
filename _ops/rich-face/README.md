# rich-face — the renderer behind [[Enrichment]]

An entry's **rich face**: the entry's own words as the spine, read live from its `.md`, with the
sound, image and interactive pieces [[Enrichment]] made or gathered laid beside the headings they
serve. The ceremony (when and how to enrich a page) is `Enrichment.md`; this folder is the machinery.

## Open one

- From an entry in STIGMERGY: the face switch (`F`), when the entry's bundle holds the manifest.
- With STIGMERGY running: `http://localhost:5173/rich/?entry=Kuramoto%20Coupling`
- Standalone: `node _ops/rich-face/rich-server.mjs` → `http://127.0.0.1:8842/?entry=Kuramoto%20Coupling`
  (or the `rich-face` launch config). Reviews still post to STIGMERGY (`--app`, default :5173).
- Public: the read view ships this page static under `rich/`. `_ops/stigmergy/app/scripts/build-public.mjs`
  sets `RICH_STATIC`, so its lookups come from the snapshot (`data/rich.json`), its text is the
  snapshot's rather than re-read live, and nothing is posted.

Any entry opens. `&review=0` hides the review layer.

## Files

| file | what it does |
|---|---|
| `parse.js` | entry → sections → prose blocks and figures; the section fingerprint. Shared by the page and `fingerprint.mjs`, so a stamp and a check can't disagree. |
| `rich.html` | the renderer — reads the `.md` every few seconds, lays prose + figures + manifest pieces, marks drift, carries the review dock. All its URLs are relative, so it works at `/` and at `/rich/`. |
| `rich-handler.mjs` | the request handler: renderer + palace files (byte ranges), `_api/resolve`, `_api/find`, `_api/media`, `_api/review` → STIGMERGY `POST /api/persistent` as a `human_eval`. Mounted by STIGMERGY (`app/server/api/rich.js`) and by `rich-server.mjs`. |
| `rich-server.mjs` | the standalone server |
| `resolve.mjs` | the one resolver: the page, `fingerprint.mjs` and the public build find an entry, or the file a reference names, the same way, from git's index. A miss comes back with a one-line label the page shows in the figure's place. |
| `fingerprint.mjs` | section fingerprints and drift; `--stamp [section…]` records the "still true" verdict |
| `manifests/` | a workshop home for a manifest before its entry is placed; a manifest in the entry's bundle wins, and the face switch offers only the bundle's |

## The manifest — `[Entry]/[Entry] — rich.json`

Self-describing like any bundle file (`title`, `born`, `links`, `forward_vector`), then:

```json
{ "entry": "…", "tier": "sketch|study|piece", "made": "YYYY-MM-DD", "round": 1,
  "page": { "bed": { "file": "…wav", "volume": 0.14 } },
  "sections": [ { "heading": "In Our Instruments", "made_against": "<12 hex>", "made": "…", "stamped": "…",
      "pieces": [ { "file": "…", "origin": "made|gathered", "by": "…", "title": "…", "caption": "…",
                    "near": "<a phrase in a paragraph | a figure's filename>", "place": "margin|band", "height": 640 } ] } ] }
```

A section is named by its heading. When the text repeats a heading, the repeat is named with its
place — the second `## Notes` is `"heading": "Notes (2)"` — and `fingerprint.mjs --stamp "Notes (2)"`
reaches it the same way.

Every file the text or the manifest names is found by `resolve.mjs`, the same way live and in the read
view. `/…` is palace-absolute. A path with a slash is tried beside the `.md`, then from the palace root,
then in the entry's bundle, and never by its last name alone. A bare name is looked up in the bundle (its
top folder, then anywhere under it), then across the palace, and each step counts only if exactly one
file has that name. The index is git's: on the live page, tracked files plus new files git doesn't ignore;
in the public build, committed files only, so a build on the Mac publishes what CI's would. A hidden
folder, an ignored file, a symlink that leads outside the palace, or a name in the wrong case is refused.
A file that doesn't resolve shows as a labelled box in the figure's place, naming the file and why, e.g.
`3 files are named “index.html” (…). Give its path to choose one.` `near` anchors
a piece right after that paragraph or figure; otherwise it goes at the section's end. Audio, images and
text pieces default to the margin; video, interactives and diagrams to the band. An interactive's
`height` (px) is its size until the piece reports its own. Every served piece reports through the kit
(below), so the manifest `height` matters for what the kit can't measure: a piece sized by the viewport,
or one with nothing laid out. With neither, 800. Kuramoto's were measured in a 1130 px column.

## The parser's rules

- `# Title` opens the first section; each `##` opens the next. Deeper headings stay inside.
  Blank lines before the first heading open nothing; anything else there joins the H1's section
  (with no H1, it opens a section keyed to the title). No two sections ever share a key: a heading
  the text repeats (case and emphasis don't count) gets its place after it — `Notes (2)` — while every
  heading's first use, including one written `Notes (2)`, keeps its own.
- What a file is — video, audio, image, interactive — comes from one list in `parse.js` (`mediaKind`,
  `isMedia`); `rich.html` keeps none of its own.
- A figure is a blockquote holding media (its prose is the caption; a line that is only media —
  `![[file]]`, `[[file.ext|label]]` or `[label](file.ext)` — is not), a paragraph that is only an embed
  (an italic line right after it is the caption), or a ```` ```mermaid ```` fence.
- A legacy **door** — any line linking `/rich/?entry=` — is still dropped, as tolerance: the rich face
  never shows that line (the words around it stay; it is never a caption) and it never counts toward a
  fingerprint. Inside a code fence it is only text. A reader reaches the rich face by the face switch
  now, which offers it when the entry's bundle holds the manifest — not by a line in the body.
- A section's fingerprint is SHA-256 (first 12 hex) of its prose blocks, whitespace-collapsed. Figures'
  captions don't count — they travel with their media.

## What the page lets run

The page is served from STIGMERGY's origin, so anything that runs in it runs as STIGMERGY.

- **Every piece is sandboxed** — `sandbox="allow-scripts"`, the rule STIGMERGY's `ArtifactSlot.jsx`
  applies to all served HTML. A piece's origin is opaque: it cannot call STIGMERGY's API, read the
  page, or use storage, and it fetches nothing from the palace (classic `<script src>`, `<audio>`,
  `<img>` and fonts still load). The page knows a piece by its frame, never by origin.
- **The server sandboxes it too.** Every palace `.html`, `.htm` and `.svg` under `/rich/<path>` (and
  STIGMERGY's `GET /api/file`) comes with `Content-Security-Policy: sandbox allow-scripts`, so a piece
  opened any other way — a link in the prose, a new tab — still runs in an opaque origin. Only the
  renderer itself (`/rich/`), `_rich/parse.js` and `_vendor/*` come without it.
- **Every served page carries the piece kit.** `kit/inject.mjs` puts `kit/piece.js` first in the
  `<head>` of every palace `.html` and `.htm` served at `/rich/<path>`, through STIGMERGY's
  `GET /api/file`, and in the public build. Inside the sandbox it reports the piece's height and posts
  `rich:play` when a sound the reader asked for starts. On `rich:hush` it suspends the piece's audio and
  pauses its media, and the next touch brings them back. It posts `rich:error` for the first three
  script errors. A piece whose own inline script already says `rich:height` or `rich:hush` is left to
  do that part itself. STIGMERGY's frames show a piece's first error under it; the rich face does not
  show errors yet. Camera, storage and declared files wait for the piece origin
  ([[STIGMERGY — spec — rich-face pieces]]).
- **Every link goes to the web, to mail, or into the palace.** After marked, the HTML is parsed inert
  and every element and attribute the page did not choose is dropped; an `href` or `src` survives only
  if it resolves to `http:`, `https:` or `mailto:` (a relative palace path resolves to the page's own),
  and an `href` may also be `obsidian:`, the vault's own door.
- **An entry's own HTML is shown, not run.** Comments stay unseen; tags with no attributes from a
  short list (`b`, `i`, `em`, `strong`, `sub`, `sup`, `br`, `kbd` …) and a `div` or `span` whose one
  attribute is a `class` still render; any other tag is escaped and shows as written. Diagrams render
  with mermaid's `securityLevel: 'strict'`.
- **Framed by STIGMERGY's reader** (same origin), the page hides its top strip and leaves `F` to the
  reader, which carries the face switch. The public read view never frames it.

## Making pieces — the gotchas

- **One file, no build.** A piece is a single self-contained HTML (fonts from Google, everything else
  inline) so it plays inside the rich face and opened on its own. Worklet DSP goes in as a Blob URL,
  stereo in both places, a compressor after it ([[Web Audio Worklet]]).
- **A piece runs sandboxed, so it must stand alone.** Inline everything; a `fetch` of a file beside
  it, an ES module from the palace, or `localStorage` will fail. Worklets from a Blob URL work.
- **The kit sizes a piece; the maker writes nothing for it.** It measures the content on load and on
  every change, so a piece fits its frame at any width (Kuramoto's waveform piece is 914 px tall in a
  1130 px column and 1025 at 760). Size by content, not the viewport: the kit stops growing a
  viewport-tied piece after two equal steps. A piece with nothing laid out (a fixed full-frame canvas)
  keeps its manifest `height`, so still give every interactive one.
- **One voice at a time, by the kit.** It hears an `AudioContext` start (Tone.js's own included) or an
  `<audio>`/`<video>` start after a click, and tells the page, which hushes every other video, strip
  and piece. A piece that answers `rich:hush` itself is left to it.
- **Test the claim headless.** Pull the worklet source out of the page and run it in Node against the
  equation the section states before trusting what the page shows. `check-kuramoto-pieces.mjs` is the worked example:
  `node _ops/rich-face/check-kuramoto-pieces.mjs` re-checks every claim Kuramoto's pieces make.
- **A line that links the rich face is a legacy door**, not prose — the parser still skips it, or adding one would drift its own section (Kuramoto, 2026-09-24). Don't write new ones; the face switch is the way in.
- **Prefix the renderer's own classes.** An entry's diagram can define the same names — Kuramoto's Mermaid defines `drift`.
- **Name and header.** `[Entry] — rich — <what>.html`, with a leading comment carrying title, born,
  the parent link and a forward vector; `.md` pieces carry minimal frontmatter (the renderer strips it).
