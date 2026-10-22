# Lane A: the follow-up once branch claude/piece-origin-page-ba3a26 has landed

From the lane-A session, 2026-10-20. This is data for whoever does the follow-up, not instructions.

The branch lands clean onto local main, which includes lane C's 3aa72219. Once both lanes are on main, two small things meet at the seam, and neither could go on the lane-A branch without conflicting with lane C's landed lines.

## 1. The standalone preview needs a piece origin

On main, lane C's `_ops/rich-face/rich-server.mjs` builds the rich handler with no piece origin. With lane A's handler, every piece's figure on a standalone preview would show "No piece origin: this server runs no piece origin". It never falls back to the page's origin, so this is a box, not a security gap.

The fix is the patch `lane-a-preview-piece-origin.patch` in this folder. It applies to main's files (`git apply --check` passed against them).

- In `serve()`, it starts `startPieceOrigin({ root, port: 0 })`. The kernel picks the port as it binds, so there is no gap between choosing the port and taking it, and nothing to lease.
- It passes the piece origin to `createRichServer({ ..., pieces })`, and so on to `createRichHandler`.
- It closes the piece origin with the server, and on a failed bind.
- It records the piece origin's address in the lease note.
- It adds a check to lane C's two-previews test: each preview's `/_api/resolve` reports a piece origin that is up, not on the page's own port, and different for the two previews.

Verified only in a scratch extraction of the merge result (`_ops` and Kuramoto). There, `rich-server.test.js` (with the added check), `port-lease`, and lane A's piece-origin, rich-pieces, resolve, kit, middleware, handler and contract tests passed. Two `scratch-vite.test.js` cases failed, both because the scratch folder is not a git checkout.

## 2. The app README bullets (lane C's lines sit on either side)

In `_ops/stigmergy/app/README.md` § Testing, worktree & topology gotchas. These have been read against the code by the Concierge, and its corrections C8–C10 are folded in.

**Replace** the bullet that starts "- **Rich-face pieces run sandboxed, like artifacts.**" with:

- **Rich-face and deck pieces run on the piece origin, never on the app's.**
  - **Where they run.** Every piece on `/rich/`, and every web page `ArtifactSlot.jsx` plays on a card or a scroll, is framed on the piece origin (`_ops/rich-face/piece-origin.mjs`). That is `127.0.0.1:8843` beside the live 5173, and a free port elsewhere.
  - **How a frame is built.** From the plan that `GET /api/piece` or `_api/resolve` returns (`_ops/rich-face/contract.mjs`). A piece that needs nothing of an origin stays `sandbox="allow-scripts"`, opaque. One that needs its origin also gets `allow-same-origin`, after a check that the piece origin is not the page's own. Devices come only through `grants.json`.
  - **The kit.** Every served web page carries it (`_ops/rich-face/kit/`): height, play and hush, errors, storage under each piece's own prefix, and the camera only on a click.
  - **The deck's slot.** `ArtifactSlot` speaks the same protocol. It shows the piece's chips, a cap when one bites and its first error, and says so when there is no piece origin.
  - **The page itself.** An entry's own raw HTML is escaped, and mermaid renders `strict` under the page's `script-src 'self'`.
  - **The tests.** All run against the middleware on a temp palace, never :5173. In headless Chromium: `rich-sandbox.test.js` (the rich face), `rich-kit.test.js` (the kit; its Tone.js case skips when the CDN is out of reach) and `rich-pieces.test.js` (frames, camera, storage, canary, caps). `piece-origin.test.js` covers the server. The browser tests skip with a warning when Playwright's Chromium isn't installed.
  - **For whoever makes a piece,** the rules are in `_ops/rich-face/README.md` § What the page lets run, and its gotchas.

  *(2026-10-13; the kit 2026-10-18; the piece origin 2026-10-20)*

**Add after it:**

- **The piece origin is a second port, and 8843 is a single one.**
  - **Which port.** The middleware starts the piece origin. Under a real dev server it starts at once: on 8843 beside the app's own 5173, on a free port beside any other app port (a worktree's, a scratch server's), or on the port `STIGMERGY_PIECE_PORT` names. Anything else, such as a test's stub, starts it the first time a route asks.
  - **The scratch STIGMERGY.** It leases a port for the piece origin and hands it over as `STIGMERGY_PIECE_PORT`. Never start one with 8843: the live server would find its port taken, and every figure would say so.
  - **After a Vite rebuild.** A second start in the same process finds the first piece origin for that palace and port, or for that palace's free port, and keeps it. So the piece origin goes on running the code it started with: an edit to `piece-origin.mjs`, `contract.mjs` or `serve-file.mjs` reaches it only when the process restarts.

  *(2026-10-20)*

**And in the existing bullet that starts "- **An edit in the Vite config's import graph while a steward runs blinds the deck.**"**, add to its list of folders: "and every `_ops/rich-face/` module the middleware imports (`rich-handler.mjs`, `piece-origin.mjs` and what they import)".

## 3. The rich-face README's standalone line (lane C's)

Once 1 is in, the line under "Open one" that says "Standalone: …" can add: "Its pieces run on a piece origin of its own, on a second port."
