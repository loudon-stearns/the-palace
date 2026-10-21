# rich-face — the renderer behind [[Enrichment]]

An entry's **rich face**: the entry's own words as the spine, read live from its `.md`, with the
sound, image and interactive pieces [[Enrichment]] made or gathered laid beside the headings they
serve. The ceremony (when and how to enrich a page) is `Enrichment.md`; this folder is the machinery.

## Open one

- From an entry in STIGMERGY: the face switch (`F`), when the entry's bundle holds the manifest.
- With STIGMERGY running: `http://localhost:5173/rich/?entry=Kuramoto%20Coupling`
- Standalone: `node _ops/rich-face/rich-server.mjs [--root <palace>] [--detach]` prints its URL, on a
  port leased to it (8850–8949), so several sessions can preview several palaces at once; add
  `?entry=Kuramoto%20Coupling`. `--stop [port]` stops your own, `--list` shows them. Reviews reach
  STIGMERGY's board only when started with `--app http://localhost:5173`. The app README's
  § A preview of your own, on a leased port has the rest.
- Public: the read view ships this page static under `rich/`. `_ops/stigmergy/app/scripts/build-public.mjs`
  marks the page `<meta name="rich:static">`, so its lookups come from the snapshot (`data/rich.json`),
  its text is the snapshot's rather than re-read live, and nothing is posted.

Any entry opens. `&review=0` hides the review layer.

## Files

| file | what it does |
|---|---|
| `parse.js` | entry → sections → prose blocks and figures; the section fingerprint. Shared by the page and `fingerprint.mjs`, so a stamp and a check can't disagree. |
| `rich.html` | the page: its markup and styles. Its one script is `rich.js`. All its URLs are relative, so it works at `/` and at `/rich/`. |
| `rich.js` | the renderer, served as `_rich/rich.js` so the page can carry `script-src 'self'`. It reads the `.md` every few seconds, lays prose, figures and manifest pieces, frames each piece from its plan, marks drift, and carries the review dock. |
| `rich-handler.mjs` | the request handler: renderer + palace files (byte ranges), `_api/resolve`, `_api/find`, `_api/media`, `_api/review` → STIGMERGY `POST /api/persistent` as a `human_eval`. Mounted by STIGMERGY (`app/server/api/rich.js`) and by `rich-server.mjs`. |
| `rich-server.mjs` | the standalone server, the preview: any palace root, on a port leased from `_ops/commons/port-lease.mjs` |
| `resolve.mjs` | the one resolver: the page, `fingerprint.mjs` and the public build find an entry, or the file a reference names, the same way, from git's index. A miss comes back with a one-line label the page shows in the figure's place. |
| `contract.mjs` | the piece contract in one place: a piece's own declaration, its manifest entry's `contract` block and `grants.json` become how the piece is framed, its chips and mark, and the Permissions-Policy and CSP it is sent with. The page, the deck, the piece origin and the public build all ask here. |
| `piece-origin.mjs` | the piece origin: the listener every piece runs on, `127.0.0.1:8843` beside STIGMERGY's 5173 (below). |
| `serve-file.mjs` | sends one file: its type, byte ranges, and a web page as a piece with the kit injected. The handler and the piece origin both send files through it. |
| `grants.json` | what Loudon has let a piece use: camera, microphone, midi, hosts. One line per piece, written only on his yes. |
| `fingerprint.mjs` | section fingerprints and drift; `--stamp [section…]` records the "still true" verdict |
| `manifests/` | a workshop home for a manifest before its entry is placed; a manifest in the entry's bundle wins, and the face switch offers only the bundle's |

## The manifest — `[Entry]/[Entry] — rich.json`

Self-describing like any bundle file (`title`, `born`, `links`, `forward_vector`), then:

```json
{ "entry": "…", "tier": "sketch|study|piece", "made": "YYYY-MM-DD", "round": 1,
  "page": { "bed": { "file": "…wav", "volume": 0.14 } },
  "sections": [ { "heading": "In Our Instruments", "made_against": "<12 hex>", "made": "…", "stamped": "…",
      "pieces": [ { "file": "…", "origin": "made|gathered", "by": "…", "title": "…", "caption": "…",
                    "near": "<a phrase in a paragraph | a figure's filename>", "place": "margin|band", "height": 640,
                    "contract": { "needs": "camera", "files": "frames.json", "size": "fill 4/3" } } ] } ] }
```

A section is named by its heading. When the text repeats a heading, the repeat is named with its
place — the second `## Notes` is `"heading": "Notes (2)"` — and `fingerprint.mjs --stamp "Notes (2)"`
reaches it the same way.

Every file the text or the manifest names is found by `resolve.mjs`, the same way live and in the read
view. `/…` is palace-absolute. A path with a slash is tried beside the `.md`, then from the palace root,
then in the entry's bundle, and never by its last name alone. A bare name is looked up in the bundle (its
top folder, then anywhere under it), then across the palace, and each step counts only if exactly one
file has that name. The index is git's. On the live page it holds tracked files, new files git doesn't
ignore, and the sound, video and images git ignores. In the public build it holds committed files only, so
a build on the Mac publishes what CI's would (§ Media a face plays). A hidden folder, any other file git
ignores, a symlink that leads outside the palace, or a name in the wrong case is refused. At each step,
where a bare name could mean a tracked file or one git doesn't track, the tracked one wins.
A file that doesn't resolve shows as a labelled box in the figure's place, naming the file and why, e.g.
`3 files are named “index.html” (…). Give its path to choose one.` `near` anchors
a piece right after that paragraph or figure; otherwise it goes at the section's end. Audio, images and
text pieces default to the margin; video, interactives and diagrams to the band. An interactive's
`height` (px) is its size until the piece reports its own. Every served piece reports through the kit
(below), so the manifest `height` matters for what the kit can't measure: a piece sized by the viewport,
or one with nothing laid out. With neither, 800. Kuramoto's were measured in a 1130 px column.

`contract` is for a gathered proof nobody should edit: the manifest speaks for it, with the same fields a
piece declares in its own head (below). A piece that declares for itself is held to its own words.

## Media a face plays: what git tracks is what the public face has

The live page may play a file that is only on this Mac; the public build plays only what git tracks.
Loudon, 2026-10-20: "the rich face can play on a local machine if the files are only on the local
machine, if public, then they can't play, unfortunately. I would like, if possible, to decide to place
audio needed for rich faces in git, so they can be played." So the media a face needs is placed in git
on purpose, chosen with care, and not left ignored.

- **On the live page.** The resolver finds a file git doesn't track: a new file not yet committed, or a
  sound, video or image git ignores, such as a steward's render under `Projects/` or `Shop/Shopkeeper/`.
  The file plays, and its figure carries the chip `only on this Mac` (for a piece's declared files,
  `files · N only on this Mac`). The page's head lists every such file the face names, pieces' declared
  files included. Nothing else git ignores is ever served.
- **In the public build.** The build ships only committed files. A file it can't ship but this Mac has
  shows as a labelled box: `“take-07.wav” is only on this Mac: track it to publish.` A build in CI, which
  has no such file, shows the plain miss. A tracked file over 25 MB is left out too, and its box says so,
  so keep a take a face needs under that.
- **To publish one.** `node _ops/rich-face/untracked.mjs ["<Entry>"]` lists every file a face names that
  git doesn't track, with the step for each. It exits 1 while any is left.
  - A new file: commit it through the palace committer.
  - A steward's render: copy it into its entry's bundle under `rich-face/`, which `.gitignore` keeps
    (`!Projects/**/rich-face/**`, `!Shop/Shopkeeper/**/rich-face/**`), and commit the copy.

  Once the copy is committed, the face names it as before. A bare name lands on the tracked copy, even
  when the render sits in the bundle's own top folder.
  The steward's render stays ignored where it is. A new render of the same take changes nothing until
  someone copies it again on purpose.
- **Not `git add -f`.** The committer stages a path with a plain `git add`, which refuses an ignored
  file. And once an ignored file is force-tracked, every re-render of it that the steward posts would
  ride into its next cycle commit.
- **Choose with care.** A take copied into `rich-face/` stays in git's history for good. So the public
  face grows by what a face is worth playing, not by every render.

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

The page is served from STIGMERGY's origin, so anything that runs in it runs as STIGMERGY. So nothing the
palace writes runs there: every piece runs on the **piece origin**.

- **The piece origin.** STIGMERGY starts a second listener, `piece-origin.mjs`, on `127.0.0.1:8843`.
  `STIGMERGY_PIECE_PORT` names another port, and any STIGMERGY not on 5173 takes a free one. `127.0.0.1` is
  another site from `localhost`, so whatever a piece sends toward STIGMERGY is cross-site: the request
  guard refuses its writes and `/api/open`, and STIGMERGY sends no CORS, so a piece can't read what comes
  back. The piece origin answers GET and HEAD for its exact Host, with no CORS. It serves only registered
  pieces, the files they declare, and the design-system folder (not its review layer, whose notes land in
  storage a face does not keep). A piece is registered from every face (each manifest's pieces and its
  entry's text figures) at boot and again on a miss, and whenever the page or the deck asks to frame it.
  Anything else gets a 404 that says why. Every file goes out with nosniff. The design system's files go
  out with CORP cross-origin, since a piece with no origin of its own loads them too; a piece and its
  declared files, same-origin. If the port is taken, every piece's figure says so. A piece never falls
  back to the page's origin.
- **Each frame is built from the piece's plan** (`contract.mjs`). A piece that declares nothing is
  **pre-contract**. It runs `sandbox="allow-scripts"` in an opaque origin, as every piece ran before, and so
  does a declared piece that needs nothing of an origin (only `net`, `fill` or fullscreen). A piece that
  needs a device, storage or a declared file also gets `allow-same-origin`, and only after the page has
  checked that the piece's URL is on another origin than its own. A camera, microphone or midi reaches a
  piece only when both its frame's `allow` and the piece origin's `Permissions-Policy` say so, and both
  come from `grants.json`, so a frame that asks for more gets nothing. Each piece is also sent with a CSP:
  scripts from the piece origin, inline, and the shelf's CDNs (unpkg, jsDelivr and cdnjs until `libs.json`
  names its own); fetches only to the piece origin and its granted hosts. The CSP is report-only for its
  first round.
- **The figure says what its piece uses.** Each figure carries a mark (introduced, pre-contract or
  errored) and a chip for each need, declared file count, host and `fill`. A missing grant line shows as
  `camera · not granted`. A cap that bites is named under the frame: a height outside 120 to 8000 px, a
  piece sized by its own window, or a piece that never reported a height. A piece whose script fails is
  marked errored, and its first error shows under the frame.
- **The page's own script is its own file.** `rich.html` loads `_rich/rich.js` and carries
  `Content-Security-Policy: script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none';
  frame-src <the piece origin>`. So an entry's text that slipped past the sanitizer still runs nothing.
  Mermaid renders under it (proven in headless Chromium).
- **The server sandboxes a piece reached any other way.** Every palace `.html`, `.htm` and `.svg` under
  `/rich/<path>` (and STIGMERGY's `GET /api/file`) is sent with `Content-Security-Policy: sandbox
  allow-scripts`. A piece opened from a link in the prose or in a new tab still runs in an opaque origin.
  Only the page itself (`/rich/`), `_rich/rich.js`, `_rich/parse.js` and `_vendor/*` come without it.
- **Every served page carries the piece kit.** `kit/inject.mjs` puts `kit/piece.js` first in the `<head>`
  of every palace `.html` and `.htm` served at `/rich/<path>`, through STIGMERGY's `GET /api/file`, on the
  piece origin, and in the public build. The kit:
  - reports the piece's height;
  - posts `rich:play` when a sound the reader asked for starts;
  - on `rich:hush`, suspends the piece's audio and pauses its media until the next touch;
  - posts `rich:error` for the first three script errors;
  - keeps each piece's storage under its own prefix, its path, since every piece shares one origin. A piece
    with no origin keeps storage in memory, and the figure says it won't keep;
  - starts the camera only on a click. A piece that asks before one gets a "start the camera" button over
    it. The camera stops on hush or when another piece takes it, and comes back into the same stream on the
    next touch.

  A piece whose own inline script already says `rich:height` or `rich:hush` is left to do that part
  itself.
- **On the public site** the read view frames pieces opaque, from its own copied files. Storage lives in
  memory only, and the figure says so. A camera or microphone piece opens in its own tab.
- **Every link goes to the web, to mail, or into the palace.** After marked, the HTML is parsed inert
  and every element and attribute the page did not choose is dropped; an `href` or `src` survives only
  if it resolves to `http:`, `https:` or `mailto:` (a relative palace path resolves to the page's own),
  and an `href` may also be `obsidian:`, the vault's own door.
- **An entry's own HTML is shown, not run.** Comments stay unseen; tags with no attributes from a
  short list (`b`, `i`, `em`, `strong`, `sub`, `sup`, `br`, `kbd` …) and a `div` or `span` whose one
  attribute is a `class` still render; any other tag is escaped and shows as written. Diagrams render
  with mermaid's `securityLevel: 'strict'`.
- **Framed by STIGMERGY's reader** (same origin), the page hides its top strip and leaves `F` to the
  reader, which carries the face switch. The reader's frame passes camera, microphone, midi and fullscreen
  down to the page's frames. The public read view never frames it.

## Making pieces — the gotchas

- **One file, no build.** A piece is a single self-contained HTML (fonts from Google, everything else
  inline) so it plays inside the rich face, and opened on its own when it needs nothing of an origin.
  Worklet DSP goes in as a Blob URL, stereo in both places, a compressor after it ([[Web Audio Worklet]]).
- **Declare what a piece needs from its host, in its own `<head>`.** Four tags:
  - `<meta name="piece:needs" content="camera storage">`: any of camera, microphone, midi, storage,
    fullscreen.
  - `<meta name="piece:files" content="frames.json data/">`: every palace file it loads, by `fetch` or by
    tag (the design system needs no line). A name is beside the piece or `/palace/absolute`; a folder ends
    in `/`; a space is `%20`.
  - `<meta name="piece:net" content="storage.googleapis.com">`: every host it fetches from.
  - `<meta name="piece:size" content="fill 4/3">`: when the page should size it from the column, not
    from the height it reports.

  Undeclared, a file beside the piece isn't served: fetched or loaded by a tag, the piece origin answers a
  404 that says why. Storage that isn't declared lasts one visit, unless another need already gives the
  piece an origin. Storage kept inside a face isn't seen by the same piece opened on its own, nor the other
  way. Camera, microphone, midi and every host also need a line in `grants.json`, written only on Loudon's
  yes. Inline everything else. An ES module from the palace is a declared file like any other. Worklets
  from a Blob URL work.
- **The kit sizes a piece; the maker writes nothing for it.** It measures the content on load and on
  every change, so a piece fits its frame at any width (Kuramoto's waveform piece is 914 px tall in a
  1130 px column and 1025 at 760). Size by content, not the viewport: the kit stops growing a
  viewport-tied piece after two equal steps. A piece with nothing laid out (a fixed full-frame canvas)
  keeps its manifest `height`, so still give every interactive one.
- **One voice at a time, by the kit.** It hears an `AudioContext` start (Tone.js's own included) or an
  `<audio>`/`<video>` start after a click, and tells the page, which hushes every other video, strip
  and piece. A piece that answers `rich:hush` itself is left to it.
- **The camera starts on a click.** Call `RichPiece.camera()`, or `getUserMedia`, from a click handler.
  If a piece asks before any click, the kit holds the request behind a "start the camera" button. One
  piece holds a camera or microphone at a time: when one starts, the page (or the deck) stops every other
  piece's.
- **Test the claim headless.** Pull the worklet source out of the page and run it in Node against the
  equation the section states before trusting what the page shows. `check-kuramoto-pieces.mjs` is the worked example:
  `node _ops/rich-face/check-kuramoto-pieces.mjs` re-checks every claim Kuramoto's pieces make.
- **A line that links the rich face is a legacy door**, not prose — the parser still skips it, or adding one would drift its own section (Kuramoto, 2026-09-24). Don't write new ones; the face switch is the way in.
- **Prefix the renderer's own classes.** An entry's diagram can define the same names — Kuramoto's Mermaid defines `drift`.
- **Name and header.** `[Entry] — rich — <what>.html`, with a leading comment carrying title, born,
  the parent link and a forward vector; `.md` pieces carry minimal frontmatter (the renderer strips it).
