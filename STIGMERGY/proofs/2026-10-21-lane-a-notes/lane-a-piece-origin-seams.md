# Lane A (piece origin, kit, page): the seams lanes B and C will meet

From the lane-A session (branch `claude/piece-origin-page-ba3a26`, worktree `heuristic-shtern-9cf16a`). Written 2026-10-20. Data for you to weigh, not instructions.

## Committed on my branch (not landed)

- `1de17193`: `_ops/rich-face/contract.mjs`, `piece-origin.mjs`, `serve-file.mjs`, `grants.json` (no grants), with tests.
- `51a231ea`, `976e4339`: piece-origin fixes. The boot scan is async. The design system goes out CORP cross-origin. There is one free-port origin per palace per process.
- `d11346fe`: the kit.
- `e027e20b`: the page and its frames.

Update, later on 2026-10-20: lane C landed first (`3aa72219`). Its `rich-server.mjs` still builds the handler with no piece origin. The wiring, and the app README bullets that sit beside lane C's lines, are in `lane-a-follow-up-after-landing.md` in this folder, with a patch that applies to main.

## contract.mjs: one reader of the piece contract

If your checker or gates need to read a declaration or grants, this is meant to be imported rather than copied:

- `readDeclaration(html)` → `null` (declares nothing) or `{ needs, files, net, size, problems }`. It reads `<meta name="piece:needs|files|net|size">` in the `<head>` only, in either attribute order. Lists split on spaces and commas, and a space in a file name is written `%20`. `size` is `flow` or `fill <w>/<h>`. A need off the closed list is a `problems` entry.
- `contractOf({ html, manifestContract })` → `{ source: 'piece'|'manifest'|null, ... }`. The piece's own declaration wins; else the manifest entry's `contract` block (gathered proofs); else pre-contract.
- `declaredPath(piecePath, ref)` → the palace path a declared file means (a folder keeps its `/`), or null if it climbs out.
- `readGrants(root)` → `{ ok, byPiece: Map(path → { allow: Set, net: Set }), error }`. The format is `{ "grants": [ { "piece": "<palace path>", "allow": ["camera"], "net": ["host"], "yes": "Loudon, <date>" } ] }`.
- `framePlan(...)`, `piecePolicy(plan)`, `pieceCsp(plan, shelf)`, `shelfOrigins(root)` (every https origin `libs.json` names, in any shape, else unpkg / jsdelivr / cdnjs), `CAPS = { min: 120, max: 8000, fallback: 800 }`.

## piece-origin.mjs (lane C: the preview needs one)

- `startPieceOrigin({ root, port, host = '127.0.0.1' })` → a piece origin whose `.status` is `{ ok, origin, error }` and whose `.describe(path)` gives a frame plan. It never throws: a taken port comes back as `status.ok === false`. Pass `port: 0` for a free port. `close()` stops it.
- `createRichHandler({ root, base, app, pieces })` now takes `pieces`: a piece origin, or a promise of one. **Without one, every web page's figure on the rich face shows a box saying the server runs no piece origin.** It never falls back to the page's own origin. So `rich-server.mjs` (yours, lane C) should start one on a second free port and pass it in. Until it does, the standalone face shows boxes where its pieces were. I have not touched `rich-server.mjs`.
- `piecePortFor(appPort)` → `STIGMERGY_PIECE_PORT` if set; else 8843 beside 5173; else 0.

## What changes for the tests you own (lane B)

- `rich-sandbox.test.js` passes unchanged on my branch. Pre-contract pieces stay `sandbox="allow-scripts"`, and the piece origin answers `/api/*` with a 403, not a 404, so `out.open` is still not 404. Its pieces now load from a piece origin on a free port: the middleware starts one whenever it is given no `opts.pieces`.
- `rich.html`'s inline module moved to `_ops/rich-face/rich.js`, served as `_rich/rich.js`. The page carries `Content-Security-Policy: script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-src <piece origin>`. Mermaid still renders under it in headless Chromium (your sandbox test's diagram case).
- `build-public.mjs`: I touched its rich-face section only. It now marks the page static with `<meta name="rich:static" content="1">` instead of the inline `window.RICH_STATIC` script, copies `rich.js` beside `parse.js`, and writes `pieces` (static frame plans) into `data/rich.json`. If your gate edits the same file, we touch different lines, but expect a merge to look at it.
- The kit (`kit/piece.js`, mine) now posts `rich:held`, `rich:camera` and `rich:storage` as well, and wraps `getUserMedia` and `localStorage`/`sessionStorage`. A checker that counts messages should expect them.
