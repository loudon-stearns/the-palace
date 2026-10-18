# STIGMERGY — v0.2 (operational board)

A browser-based BBS terminal that renders the palace's `blackboard.jsonl`
files with the full STIGMERGY visual language. v0.2 adds write paths
(POST endpoints with strict §2.2 schema enforcement), live tail (SSE),
and click-to-respond UI in the Trickster inbox.

## v0.2 endpoints + features

### Write path — POST endpoints

Both endpoints accept exactly one §2.2-conformant message JSON in the
request body. The server validates strictly and never coerces.

**Every write is JSON from STIGMERGY's own origin** (`server/request-guard.js`).
Any web page the browser loads can aim a request at localhost:5173, so before a
route under `/api/` or `/rich/` runs: a Host that is not localhost, an IP, or in
`server.allowedHosts` gets 403; a POST/PUT/PATCH/DELETE must carry
`Content-Type: application/json` (415 otherwise). A write or `GET /api/open` passes
only when the browser's Origin is this server's scheme and the very host:port in the
Host header and its `Sec-Fetch-Site` is `same-origin`, `none` (a URL you typed or a
bookmark) or absent, so a page on another localhost port, which the browser marks
`same-site`, gets 403 like any foreign site.
A preflight gets 403 with no CORS headers and `vite.config.js` sets `server.cors: false`,
so nothing clears another origin to send, and `tests/integration/request-guard-census.test.js`
fails on any server under `_ops/` that listens without `checkRequest`.
curl and node's fetch send no Origin and pass — send the
JSON type: `curl -H 'Content-Type: application/json' -d @msg.json localhost:5173/api/persistent`.
The standalone rich face (`_ops/rich-face/rich-server.mjs`) and `_ops/loudon-eval/eval-server.mjs`
answer at `/`, so each runs the same two checks on every path (`checkRequest`).

**A review note is Loudon's voice.** The rich face's review dock (`POST /rich/_api/review`)
and `_ops/loudon-eval` forward a `human_eval` BROADCAST from `TRICKSTER` on `GENERAL`, under
the one `session_id` `trickster`, reused for every note — never one minted per day or page
(SCHEMA — Reference §9). The QUEUE makes it a card by `payload.kind` and the page it names,
never by board or session id. Never send one at the live :5173 from a test or a probe.

**`POST /api/persistent`**
- Body: one §2.2 message object (JSON).
- `200` + the persisted line on success.
- `400` + `{ errors: [...] }` on validation failure. Every failed check
  is listed; nothing is written.
- `413` if the request body exceeds 64 KB.

**`POST /api/sessions/:id`**
- Same contract as above, scoped to `_ops/swarm/sessions/:id/blackboard.jsonl`.
- Auto-creates the session directory unless `?create=false` is passed.
- Path-traversal guard on `:id` — no `..` sequences allowed.

### Read path — SSE endpoints

Both stream `event: message` frames whenever a new line is appended to
the corresponding blackboard file. Clients can reconnect using the
`Last-Event-ID` header to replay missed messages. A heartbeat comment
line is emitted every 25 s (configurable via `STIGMERGY_SSE_HEARTBEAT_MS`).

**`GET /api/persistent/stream`**
- Streams the persistent blackboard (`blackboard.jsonl`).
- Supports `Last-Event-ID` for replay-on-reconnect.

**`GET /api/sessions/:id/stream`**
- Same SSE shape for a session blackboard.
- Returns `404` if the session file does not exist.

### Click-to-respond (Phase 4)

On the TRICKSTER board, pending `RESOURCE_REQUEST` messages show
interactive response buttons. Clicking a button opens a modal with the
§2.2-conformant JSON about to be POSTed. `[CONFIRM]` sends;
`[CANCEL]` closes. `ESC` and `Enter` also work. The file-edit path
still works (the file is the source of truth) but the UI is the primary
affordance for responding to resource requests.

### Live tail (Phase 5)

The board auto-updates without `[R]ELOAD` via the SSE endpoint. A
status-bar indicator shows the connection state: `LIVE` (connected),
`RECONNECTING` (attempting to reconnect), or `OFFLINE` (failed).

## v0.3 — inline rich content

Messages can carry artifacts (image / audio / sandboxed HTML) that render
inline in the message row.

### Read path — `GET /api/file`

**`GET /api/file?path=<palace-relative>`**
- Streams the file's bytes with content-type detection (the content-type
  table lives in `server/http.js`), `Content-Length`, and `Cache-Control: no-cache`.
- `400` on a missing/empty path, path traversal, an absolute path, or a
  directory. `404` when the file does not exist.
- An `.html`, `.htm` or `.svg` comes with `Content-Security-Policy: sandbox
  allow-scripts`: opened in a frame or a tab of its own, it runs in an opaque
  origin, never as STIGMERGY. A page that fetches a file beside it, or uses
  `localStorage`, cannot do so here.
- The `path` is resolved through the same `resolveInsidePalace` guard as
  `GET /api/open`: nothing outside the palace root is reachable, and that is
  judged by where the path really lands, so a symlink in the palace that points
  out of it is refused (`400`) like a traversal. This is the
  read-side counterpart to the strict write-side validator — lenient about
  *what* it serves, strict about *where* it reads from.

### Payload convention (allowed, not required)

Any message type may carry an artifact in its (opaque) `payload`:

- `payload.artifact_path: "<palace-relative>"` — a single artifact, or
- `payload.artifacts: [{ path, caption? }]` — a coherent multi-artifact set.

The §2.2 validator is unchanged — `payload` is opaque by spec, so the artifact
fields pass straight through. Artifact rendering is keyed on artifact
*presence*, not on message type or `kind`.

Rendering: image → `<img>`; audio → `<audio controls>` (browser-default
controls in v0.3); HTML → `<iframe sandbox="allow-scripts">` (deliberately
**no** `allow-same-origin`, so a served artifact cannot reach STIGMERGY's DOM,
storage, or POST endpoint); anything else → an open-link via `GET /api/open`.

## v0.4 — comparison, table, math

Three more renderable content types, all keyed on the (opaque) `payload`, all
rendering on any message type, no validator/schema change:

- **Equations (dual-channel math).** `payload.equations: [{ label?, symbolic,
  worded, where?: [{sym, def}] }]`. Renders each equation TWICE — the symbolic
  form and the worded (named-variable) form, operators kept in both — plus an
  optional `where` legend. Terminal-native monospace Unicode; no KaTeX/MathJax/CDN.
- **Tables.** `payload.table: { caption?, columns: [...], rows: [[...], ...] }`.
  Renders a phosphor monospace grid (header emphasized, CP437-weight cell
  borders, no rounded corners). Rows are padded/truncated to the column count.
- **Choice (A/B or ranked pick).** `payload.kind: "choice"`,
  `payload.choice_mode: "pick" | "rank"`, `payload.options: [{ id, label,
  artifact_path?, caption? }]`. Each option renders with its inline artifact
  (so you can audition the candidates), a select/rank control, and a `SEND`
  button that POSTs a §2.2 `REPLY` (`payload.kind: "choice_response"` carrying
  `choice` or `ranking`) correlated to the card — the asking agent reads the
  result. Picking writes only on `SEND`.

## The PROJECTS deck and every page's scroll (2026-09-23)

The STEWARDS roster became the **PROJECTS** deck (`[P]`; `W` and `?deck=stewards`
still land there). Every `type: project` entry is one row — stewarded or not —
grouped by what it needs: *needs you* (open asks / a running cycle) · *ready to
advance* (an answer filed since the steward last ran) · *stalled* (two barren
cycles) · *tended* · *no steward*. The signal column is computed by the same
rule as the scroll's Now zone (`server/projects.js` → the orchestrator's
`computeNow`), so the table and the scroll never disagree.

Click a name to open the page's **scroll** (`[Entry] — scroll.md` in its
bundle, the front door that replaced `plan.md`): the **Now** zone regenerated on
every fetch, the **Plan** agreed with Loudon (revised here with a line on what
changed and why, which lands on the trail; a steward's `plan_revision` ask shows
its whole proposed plan on its card, and choosing `adopt` makes it the plan), the
project's **open asks** as the same TricksterCards the TRICKSTER deck uses,
**Standing Orders** (Loudon's zone, editable only here in
the terminal, read by the steward at the top of every cycle), and **The making**
(the trail, newest first, media inline). Advancing fires a *run* — up to the
manifest's `stopping_conditions.max_iterations` consecutive cycles while the
steward ships and nothing waits on Loudon.

Below the projects (SCHEMA v1.28): **SERVICES**, stewarded pages that are not
projects; **CEREMONIES**, every page carrying `trigger:` — a ledger no longer
makes a page a ceremony; and **PAGES**, any other page that keeps a tuning
ledger. Every row opens the same scroll, drawn by one materializer
(`orchestrator/src/scroll-file.js`) from what the page has: the board block when
it lives on the board, the runs block when it keeps a tuning ledger
(`orchestrator/src/ledger.js`), its last encounter when it keeps a diary. Every
scroll has a Plan, a ceremony's too. When the page keeps a tuning ledger the
orders box asks *standing, or once?*: a standing order stays on the scroll, a
one-shot order goes into the ledger as owed for the next run to pay.

**A scroll opens over the deck you are on** (2026-10-18). `?scroll=<home>` rides
beside the open deck and entry, and `ScrollHost`
(`src/components/projects/ScrollHost.jsx`) draws it over that deck. SCROLL on a
STATE entry keeps STATE lit, and back returns to the page: a history step when
this tab opened it, a close when you landed by link. Old `?project=` links still
land. The Now zone sits in a closed fold, kept for the steward and the runs;
Open asks stays open below it.

**The trail plays in place.** Every artifact goes through `ArtifactSlot`, the
TRICKSTER card's player. A web page, video or pdf mounts in its own `LazyMount`
(300 px margin) and unmounts once you have scrolled past, so only the pieces in
view run, and a sound stops when its piece leaves. A web frame starts at 800 px
(a TRICKSTER card's starts at 480) until the piece reports its height. A section
keyed on a board message plays the message's `artifacts`; any section plays the
palace files its markdown links name (`palacePathOf` + `liftArtifacts`,
`src/lib/scroll-view.js`), in every form the palace writes: a plain path with
spaces, `<angle brackets>`, `%20`, `open:<path>`, an `obsidian://open?…&file=`
link, or a palace-absolute `/path`. A web address is never lifted.

- `GET /api/projects` — the rows (`projects`, `services`, `ceremonies`, `pages`) + the lane's worker status.
- `GET /api/projects/scroll?home=<Title>[&write=1]` — any page's scroll with a live Now
  zone (in memory; `write=1` persists it).
- `PUT /api/projects/orders` `{ home, orders, kind? }` — an order from Loudon: `standing` (the default) to the scroll's Standing Orders, `once` to the tuning ledger as owed.
- `PUT /api/projects/plan` `{ home, plan, why }` — write the agreed Plan, any page; the change is logged on the trail.
- `POST /api/steward/advance` `{ name, max_cycles? }` — start a run.

## Run

From this directory (`_ops/stigmergy/app/`):

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`. Stop with `Ctrl-C`.

The dev server reads palace data from `../../swarm/persistent/blackboard.jsonl`
and `../../swarm/sessions/*/blackboard.jsonl` via a tiny Vite middleware
(see `server/middleware.js`). The path is configurable via the env var
`PALACE_ROOT` if you need to point at a different palace root.

## What this is, and is not

**v0.2 is** an operational board. Read path (render), write path (POST
with strict §2.2 validation), live tail (SSE), and click-to-respond UI
(Trickster inbox response buttons + confirm modal) are all present.

**v0.2 is not** a daemonized service, an authentication system, the
Palace Orchestrator engine, or a Trickster broadcast surface for
non-RESOURCE_REQUEST types. Those are v0.3+.

## How Claude Code uses this directory

This dir is a build target driven by the contract in
[Palace development/BBS Production Plan v0.2.md](../../../Palace%20development/BBS%20Production%20Plan%20v0.2.md).
A Claude Code session reads that plan, builds the app phase by phase,
runs `node scripts/check-phase.js N` at each gate, dispatches a
vision-capable subagent against the matching `tests/checklists/phase-N.md`,
iterates on failures up to ten attempts per check, and stops on either
success (`V0.2-COMPLETE.md` written) or a stop condition
(`STOP-REPORT.md` written). See the plan for the full protocol.

## Testing, worktree & topology gotchas

Hard-won cautions for anyone building or testing this app:

- **The Playwright e2e fires REAL stewards.** `playwright.config.js` has `reuseExistingServer: !CI`, so `npx playwright test` attaches to whatever dev server is on :5173. If that server was started without `STIGMERGY_STUB_WORKER`, `stewards.spec.js` fires a real `claude -p` steward cycle (~60 s) that posts to the persistent blackboard, mutates `_ops/agents/permanent/*/state.json`, and can write real entries/wavetables — passing the stub env on the *test* command does NOT reach an already-running server. To verify a change safely, run only your surface's specs (`state-deck.spec.js`, etc.), not the full suite; the `stewards:41` "reap to idle" 15 s assertion fails against a non-stub server (real cycle ~60 s) — environmental, not a regression.
- **The steward lane cannot fire as root.** `claude -p --permission-mode bypassPermissions` refuses to run under root/sudo ("cannot be used with root/sudo privileges"), exits in ~400 ms, and leaves an empty transcript. Cloud containers (Claude Code on the web) run as root, so the lane's real worker never speaks there; the Mac is fine. Since 2026-09-23 an empty transcript is a **spawn failure** (`stop_hint: spawn_failed`, `CYCLE_SPAWN_FAILED` in history, iteration untouched, no retry, no stall, last-cycle reads FAILED) rather than a barren cycle — before that fix, one click marked four stewards STALLED in six seconds. In a root container dispatch cycles through the Agent tool (the runbook's Path 2) and wrap the subagent's final message as a one-record transcript for `process-cycle.js`. *(2026-09-23)*
- **One vitest flake is still unexplained: an SSE `fs.watch` delivery under load.** `sse-middleware.test.js` has now and then failed one `fs.watch` delivery check in a full concurrent run, and passes alone. Another program's port — the loopback bullet below — cannot be its cause: that file has listened on `127.0.0.1` and made its own `http.request` since its first commit (`d5e2bf40`). On 2026-10-12 it did not show: the four failures in 34 full runs before the loopback change were all another program's answer, none a missed delivery, and in 85 full runs after it the one failure was the regen-lane timeout below. So it is rare, not gone, and no error text has been recorded for it. If a delivery check there fails by itself in a full run, re-run the file alone (`npx vitest run tests/integration/sse-middleware.test.js`) and add the error text to this bullet. A lone failure anywhere else is worth a look. The `entry-save` stage-trailer check once listed beside this one handed supertest a bare server, so another program's port is its likely cause; that was never confirmed, because its error text was not recorded either. *(2026-10-12)*
- **A lane is not finished when its pid file goes.** The actuator removes `.worker.pid` *before* it calls the lane's reap (on purpose, so `status()` reads idle), and the regen lane's reap then awaits a git commit and posts to the board — about 170 ms later on a quiet machine, longer under load. A test that removes its temp palace when the pid file vanishes races that commit: `ENOTEMPTY` when the remove overlaps it, and otherwise a `stig-regen-*` folder the reap writes back into tmp (ten of ten full runs left one, 2026-10-12). Wait for the reap's own end — every `companion_regen_started` row answered by a `done` or `failed` row for the same turn (`regen-lane.test.js`, `settled`). The companion and steward reaps are synchronous, so for those two the pid file going does mean done. *(2026-10-12)*
- **`ps` cannot always read a live worker's command line, and the actuator no longer deletes a pid file when it can't.** `python3` on this Mac is a launcher that replaces itself with `Python.app` a few ms after it starts, and for 0.2–0.8 ms of that swap the kernel has no arguments to report for the pid. `ps -p <pid> -o command=` asked in that moment prints the bare name in parentheses, `(python3.14)` or `(Python)`, and exits 0. `isAlive()` took that for another program's pid and deleted the pid file, so the lane read idle for the rest of the render and would take a second one. Caught 2026-10-12: about 1 fire in 1,000 with the suite running, 1 in 546 on a quiet machine; the counts are in the commit that made this change. That the one timeout of "refuses a second render while one is running" that day (1 of 85 full runs) was this event is inferred: nothing of that run was kept, and at these rates it was an unlikely draw. A worker already dead when `ps` looked (`<defunct>`) would have lost its pid file the same way; that never showed. Two rules in `server/actuator.js` now (scars 2 and 5 in its header). The actuator does not ask `ps` about the worker it fired itself and has not yet reaped, because the OS cannot give that pid to anyone else. And for a pid file left by an earlier server, only an answer `ps` could read removes it: another program's command line, `<defunct>`, or no such process. A bare `(name)`, nothing at all, or a `ps` that timed out or failed leaves the file, and the lane reads running. The cost: a stale pid file whose pid went to a process `ps` cannot read holds the lane busy until that process ends, where before it freed the lane and risked two workers. To free one by hand, delete the lane's `.worker.pid` (in `_ops/stigmergy/.actuator-steward`, `-companion` or `-regen`). In tests, `tests/helpers/fake-ps.js` puts a stand-in `ps` first on PATH, which makes the unreadable answer certain. If the first ask after a fire ever reads idle again, `regen-lane.test.js` leaves its temp palace and prints what the lane, the pid file and `ps` each said. Not probed: whether `claude`, the worker the steward and companion lanes fire, replaces itself the same way at startup. *(2026-10-12)*
- **A command line that carries the worker's flag is not proof of a worker, so the actuator also checks when the process started.** The steward and companion lanes know their worker by `bypassPermissions` on its command line. Through 2026-10-12, 18 to 20 other processes on this Mac carried that word at any moment: each Claude desktop session runs as two, a `disclaimer` wrapper and the `claude` it starts, both with `--permission-mode=bypassPermissions`. The heartbeat's batch (`_ops/heartbeat/run-steward-batch.sh`) carries it as two words, exactly as the lanes do. `ps` is only asked about a pid file an earlier server left, so that is where it could bite: had the old pid gone to one of those sessions, the lane would have read running and refused to fire for as long as the session lived. This is reasoned from the code; it was never seen to happen. Now a command line with the flag is set against the fire time the actuator has written beside the pid since its first version (`.worker.started`). `ps -p <pid> -o lstart=` gives the start of whoever holds the pid. A real worker's sits within a second of its fire time (982 ms before to 16 ms after, over 40 fires of the test stub); one more than five seconds away means the pid has gone to someone else, and the file is removed. The rule above holds for this second ask too: a start `ps` could not read, or a `.worker.started` that is missing or is not a time `fire()` writes, removes nothing, and the command line decides alone as it did before. `ps` is asked in UTC and the C locale, because it prints the start in local time and the locale's words (`Mo. 12 Okt.` under `de_DE`), and its answer is matched against the exact shape, because `Date.parse` reads a date out of almost any line with a number in it. No argv changed, so a worker fired before this change is still known after a restart onto it. Also checked that day: `ps` returns the whole command line when the prompt is long (the flag was still there after a 300 KB argument). *(2026-10-12)*
- **Tests listen on `127.0.0.1` and hand supertest a URL, never a bare server.** Given a server that is not listening, supertest calls `server.listen(0)` with no host, which binds the wildcard address, then aims at `http://127.0.0.1:<port>`. This Mac hands out ephemeral ports in sequence (49152–65535), and a wildcard listen can be given a number another program already holds on `127.0.0.1` alone; the request then goes to that program, not the test's server. Seen 2026-10-12 as `expected 426 to be 404`, `socket hang up`, and a wrong status or body, in four tests across three of 34 full runs; the holders that day were Ollama and three RNBO WebSocket servers (a WebSocket server answers plain HTTP with 426). So `tests/helpers/loopback.js` gives `listen(server)`, which binds `127.0.0.1` and returns the URL, and `closeAll()` for the matching after-hook; supertest is handed that URL: `request(base)`, or `request(await listen(makeServer(…)))` for a server made inside a test. The rule is enforced where it happens, not by pattern: `tests/setup/loopback-only.js` makes any TCP listen without a loopback host throw inside a vitest run, with an error that names the helper, and `loopback-only.test.js` fails if that setup file leaves `vitest.config.js`. A grep is not enough: one for `request(server)` found 16 files where the guard found 20, because `request(makeServer(root, …))` binds the wildcard just the same. Measured: with 40 ports held on `127.0.0.1`, 40,000 wildcard listens were handed a held port 80 times and 40,000 `listen()` calls never. With every 8th ephemeral port held, the old `stewards`, `companion-turn` and `projects` files failed 10 of 37 tests (`expected 599 to be 200`, the holder's status, and on companion-turn's 409 test `expected undefined to be true`), and after the change the same files, and the whole suite, failed none and no request reached a holder. *(2026-10-12)*
- **`core/` edits are inert in a worktree.** `@stigmergy/core` is imported as a *package*; a worktree's `node_modules` symlinks to the owner's, whose `@stigmergy/core` points back at the owner's `_ops/stigmergy/core/`. So a worktree edit to `core/` is not what the tests/app load — make and verify `core/` changes on the **owner (main)**. (App `src/…` edits import by relative path and are fine in a worktree.)
- **A preview server run from a worktree traps board writes.** The app roots its board at its own cwd, so a dev server launched from a worktree writes companion/coordination state to *that worktree's* `blackboard.jsonl` + `.actuator-companion` — lost on `git worktree remove --force`. Before tearing down a stigmergy worktree, `git status` for a modified board and rescue any messages you didn't author to the owner tree. Prefer running previews from the owner.
- **No shebangs in app-imported orchestrator files.** The app (Vite/esbuild) bundles orchestrator modules imported by relative path, and esbuild does *not* strip a leading `#!/usr/bin/env node` — it becomes a `Syntax error "!"` and the dev server fails to start. Drop the shebang and invoke such files via `node <file>`. Vitest won't catch this; only a real `vite` start does.
- **Rich-face pieces run sandboxed, like artifacts.** Every piece frame on `/rich/` is `sandbox="allow-scripts"` — the rule `ArtifactSlot.jsx` applies — so a piece cannot write, run `/api/open`, or read the page. Every served web page carries the piece kit (`_ops/rich-face/kit/`), which reports height, play and errors and answers hush with no line from its maker. `ArtifactSlot` speaks the same protocol: it takes the height, relays play and hush between frames and `PhosphorAudio`, and shows a piece's first error. The page sizes a piece by the reported height, else its manifest `height`, else 800, and knows it by its frame, not its origin, for `rich:play`, `rich:hush` and `rich:height`; an entry's own raw HTML is escaped, and mermaid renders `strict`. `tests/integration/rich-sandbox.test.js` (the rich face) and `rich-kit.test.js` (the kit; its Tone.js case skips when the CDN is out of reach) check it in headless Chromium against the middleware on a temp palace, never :5173, and skip with a warning when Playwright's Chromium isn't installed. The rules for whoever makes a piece: `_ops/rich-face/README.md` § What the page lets run, and its gotchas. *(2026-10-13; the kit 2026-10-18)*
- **A scratch Vite given `port: 0` takes 5173.** Vite reads 0 as "use the default", and the live server listens on `[::1]:5173` only, so a scratch `createServer({ server: { host: '127.0.0.1', port: 0 } })` binds `127.0.0.1:5173` beside it, and anything aimed at `127.0.0.1:5173` meanwhile reaches the scratch server. Pick a free port first and pass it with `strictPort: true`. *(2026-10-13)*
- **Reuse the styled media components.** Surfacing audio → `src/components/PhosphorAudio.jsx`; image / iframe / file → `src/components/ArtifactSlot.jsx` (+ `src/lib/artifact.js`). Never drop a raw native `<audio controls>` / player — it breaks the phosphor language. Grep for the existing component before building a new media display.
- **The TOPOLOGY lens reads your files live; the dated map is the Weave's.** `/api/topology` and `/api/lens/suggest` build the typed-link graph from the entries' own frontmatter on every request (`src/lib/topology-live.js`, ~90 ms on the real palace) — compost, rename, demote or link a page and it shows. The lens still fetches once on mount, so **reload the page** to see a change. The dated `_ops/maps/palace-map-full-*.json` that `_ops/swarm/build-map-*.py` writes is no longer what the lens draws, in the app or on the public site: it stays the fixed picture the Weave, the linters and the partitioner argue from. The public read view reads the same graph once, at publish time (`scripts/build-public.mjs`, cut to the public set — published pages, and links with both ends published), so it is as new as the last push and its header says the day. Two builders now draw one graph, and they must not drift: every node and edge rule in `topology-live.js` restates the Python builder's, and `tests/integration/topology-parity.test.js` runs the real builder over the real tree and fails on any difference (it needs `python3` + PyYAML, and skips loudly without them). **Change a rule in one, change it in the other.** *(Until 2026-10-06 the lens drew the snapshot, and a page composted after the last build kept its node — and a 404 behind it — until the next one.)*
- **The map builder must skip `@import` symlinks or it mints phantom duplicate nodes.** The five `_`-underscore files at the palace root (`Cooperation_Yields_Agency.md`, `FOUR_PILLARS.md`, `Hilaritas_Generator.md`, `Modes_of_Collaboration.md`, `Palace_Philosophies.md`) are symlinks to their spaced originals, existing only so CLAUDE.md's `@import` floor resolves (the spaces bug). Python's `rglob("*.md")` yields them and `parse_fm` follows the link, so without an `if p.is_symlink(): continue` guard the builder emits duplicate underscore-id nodes (`Cooperation_Yields_Agency`) that have **no bundle folder** — hence no avatar and an ugly underscore label in the graph. `listEntries` (the JS walker) already skips them — a symlink Dirent reports `isFile()===false` — so only the Python builder needed the guard. Fixed in `build-map-2026-07-04.py`; keep the guard in any successor builder. *(2026-07-05)*
- **An edit in the Vite config's import graph while a steward runs blinds the deck.** The steward lane is built inside `vite.config.js` → `server/middleware.js`. Saving a file that graph imports (`server/`, `orchestrator/src/`, `core/`, much of `src/lib/`) makes Vite re-import the config in the same process and build a fresh, empty lane, while the old one finishes its run unseen. `src/components/*` and tests are outside it. Land such a change between cycles: check `curl localhost:5173/api/stewards` for `worker.running`. The fix (lane state on disk, a fresh lane adopting a live worker) is not built. *(2026-10-13)*
- **The Browser pane refuses sandboxed frames.** In the app's Browser pane a frame with `sandbox="allow-scripts"` comes back `ERR_BLOCKED_BY_CLIENT`, while a plain frame of the deck's own page loads, so the pane cannot show a piece playing. Prove pieces in headless Chromium instead: `tests/integration/rich-kit.test.js`, or a Playwright walk against a stub-worker scratch server on its own port. *(2026-10-18)*

## Directory map

```
_ops/stigmergy/app/
├── package.json
├── vite.config.js · vitest.config.js · playwright.config.js
├── index.html · src/
│   ├── main.jsx · App.jsx · styles/tokens.css
│   ├── components/  (Shell, LoginScreen, BoardIndex, …, primitives.jsx)
│   ├── adapters/    (fetch helpers; populated in Phase 2)
│   └── lib/         (parser, schema, inbox, roster; populated phase-by-phase)
├── server/middleware.js   (Vite plugin: GET /api/persistent etc.)
├── public/fonts/          (woff2 copies of VT323 + IBM Plex Mono)
├── tests/
│   ├── unit/  integration/  e2e/  fixtures/
│   ├── helpers/  setup/    (loopback.js: listen on 127.0.0.1 · loopback-only.js: refuses a wildcard listen)
│   └── checklists/         (visual-validator inputs)
├── screenshots/            (Playwright outputs; reviewed by visual-validator)
├── scripts/check-phase.js
└── build-log.jsonl         (append-only log of every check + every fix)
```

## Visual non-negotiables (cribbed from the design system)

- Phosphor green `#33ff66` on terminal black `#050a06`.
- VT323 for banners, IBM Plex Mono for body. No fallback to system mono.
- 80ch max-width on body text. CP437 box-drawing for cards.
- `border-radius: 0` everywhere. No drop shadows. No emoji.
- Lowercase body, UPPERCASE system. No em dashes — use `--`.
- `steps()` motion only. Type-on at ~20ms/char.
- Scanline overlay on by default; `[V]` toggles.

The source of truth for tokens lives in
`_ops/stigmergy/design-system/colors_and_type.css`. This app imports it,
does not modify it.
