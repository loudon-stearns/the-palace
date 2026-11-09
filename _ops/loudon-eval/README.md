# Loudon Eval — Loudon's answers and ratings, posted to STIGMERGY

Two loops on one server and one wire. **The answers server**: any page that asks Loudon
something (a Daily Page rough, a review page, a Lens glass) is opened through it, and his
answers land on the STIGMERGY board, whichever browser he opened it in. **The rating sheet**
(June 2026): a set of generated images rated against a manifest. Both post a `human_eval`
BROADCAST from TRICKSTER; the session reads it off the board file, so nothing depends on the
browser or on the page keeping its state.

**Home entry: [[Review Layer]]** (`Review Layer.md`, § How the answers come back). The rule for
how a page's answers come back lives there; this README is the how-to.

## The answers server

```bash
node _ops/loudon-eval/eval-server.mjs        # or: preview_start "answers"
```

It serves the palace on **http://127.0.0.1:8211/** (bookmarkable), every file but dotfolders,
dotfiles and `node_modules`. Open a page by its palace path:
`http://127.0.0.1:8211/The%20Lens/proofs/2026-11-03-bold-mandate/woken-glasses.html`.

**A page that asks** includes the shared script by a path relative to itself, so it loads
from `file://` too (the server also serves it at `/_answers/answers.js`), and calls it on Submit:

```html
<script src="../../../_ops/loudon-eval/answers.js"></script>
<script>
  PalaceAnswers.submit({ page: 'The Lens', task: 'woken-glasses', answers: {…}, text: summary() });
</script>
```

Served here, it POSTs `{ page, task, answers, summary, url }` to `/answers`; the server
forwards a `human_eval` with `payload.entry` = the page and `payload.overall.note` = the
readable text, so the QUEUE raises a **REVIEW NOTE** card on that page. Anywhere else (a
`file://` page, the browser pane with no server), or when STIGMERGY is down (the server answers
502) or the board refuses it, the script shows the answers as **one block with a Copy button**,
selected so Cmd-C works where the clipboard is refused. The page says which happened. Check
`window.PalaceAnswers` before calling, and keep the page's own copy as the fallback if the
script fails to load.

**Framed in a rich face**, the script first hands the readable text to the face (`rich:note`).
The face adds it to the note box of the section the piece sits in, and its own Send takes it to
the board with his other notes. `submit` then resolves `{ mode: 'face' }`. If no face answers
within 800 ms, it posts as above. The piece must declare `/_ops/loudon-eval/answers.js` in
`piece:files` or in its manifest contract, or the piece origin answers 404.

**Reading them back:**

```bash
node _ops/loudon-eval/read-answers.mjs --page "The Lens"     # latest; --all, --task, --since 2h, --json
```

It reads the main checkout's board file directly, so it works with STIGMERGY stopped.

**The one exception to STIGMERGY's sandbox.** STIGMERGY serves every HTML file sandboxed, so
no page it serves can write. This server serves pages as themselves, because being
same-origin with `/answers` is the point. Any palace page opened here can post as TRICKSTER.
So it binds 127.0.0.1 only, stands behind STIGMERGY's request guard (a foreign Host, a
foreign origin and a non-JSON write are refused), posts only `human_eval` messages through the
app's validated write path, and serves no dotfolder, dotfile or `node_modules`.

**Answers are public once pushed.** The board, `_ops/swarm/persistent/blackboard.jsonl`, is tracked in a public repository, so every answer this server posts becomes public history when the palace is pushed. Loudon accepted that on 2026-11-07 ([[Review Layer]] § How the answers come back).

**Proved in Loudon's Chrome** on 2026-11-07: his answers to the Lens's Woken Glasses landed as
`human-eval-answers-The-Lens-1794059071889` and `read-answers.mjs` read them back whole. Headless
Chromium against a scratch STIGMERGY proved the REVIEW NOTE card, the 502 fallback and the
`file://` copy block. The card for answers reads as a note on the page, "sent from" the rough,
never "on the rich face of" (`queue-model.js` readReview `via`).

## The rating sheet

```bash
node _ops/loudon-eval/eval-server.mjs --dir <folder-with-images+manifest> [--port 8211] [--app http://localhost:5173]
```

Then Loudon opens `http://127.0.0.1:<port>/`, rates, clicks **Send to STIGMERGY** → the
rating is on the board. The agent reads it back. Done.

**Requires the STIGMERGY app running on :5173** (Loudon's normal surface) — that app's
strict validator + sanctioned write path do the work, so this server stays tiny.

### How it works (why it's robust)

- The server serves the harness (`rate.html`) + the task's `rating_manifest.json` + its
  images **same-origin**, so the browser Send has no CORS.
- On Send it wraps the ratings in a §2.2 `human_eval` BROADCAST and **forwards it
  server-to-server** to `POST /api/persistent`. No browser CORS; the app validates and
  appends. **One sanctioned write path, validated by reuse — no re-implementation.**
- Touches none of the STIGMERGY app. (The app already runs background appenders, so a
  second appender is how the system already works.)

## The message it posts (the `human_eval` board convention)

`BROADCAST` from `TRICKSTER` (the human node) on board `GENERAL`, under the one session id
`trickster`, reused for every eval — SCHEMA — Reference §9's one slug per agent. The rich face's
review dock posts on the same wire (`_ops/rich-face/rich-handler.mjs`):

```json
{
  "schema_version": "1.0", "id": "human-eval-<task>-<ms>", "ts": "<ISO8601 Z>",
  "session_id": "trickster", "from": "TRICKSTER", "to": "*",
  "type": "BROADCAST", "board": "GENERAL",
  "health": { "context_pct": 0, "stop_reason": "human_eval", "iteration": 1, "tokens_this_call": 0, "model": "loudon-trickster", "score": "green" },
  "payload": { "kind": "human_eval", "task": "<task>", "groups": { "<group>": { "<criterion>": <value>, "note": "" } }, "overall": { ... } }
}
```

**Validator gotcha:** the strict server validator requires the four Path-1 `health`
fields (`context_pct`, `stop_reason`, `iteration`, `tokens_this_call`) and **`iteration`
must be ≥ 1**. For a human the honest stub is zeros everywhere + `iteration: 1`, and the
model is the human node's id, `loudon-trickster` (SCHEMA — Reference §9; it was `human`
until 2026-11-07).

## Reading a rating back (agent side)

```bash
curl -s http://localhost:5173/api/persistent | python3 -c "
import sys,json
he=[m for m in json.load(sys.stdin)['messages'] if (m.get('payload') or {}).get('kind')=='human_eval' and m['payload'].get('task')=='<task>']
print(json.dumps(he[-1]['payload'], indent=2)) if he else print('no rating yet')"
```

Take the **latest** `human_eval` for the task (by `ts`) — that's Loudon's authoritative read.

## The manifest (per task — the only thing you author each time)

Drop a `rating_manifest.json` next to the images. Shape:

```json
{
  "task": "<id>", "title": "...", "instructions": "<html>",
  "criteria": [ { "key": "identity", "label": "...", "type": "scale", "max": 5 },
                { "key": "offchar",  "label": "...", "type": "flag" } ],
  "perGroupNote": true,
  "groups": [ { "id": "<g>", "label": "...", "images": ["a.png", "b.png", "c.png", "d.png"] } ],
  "overall": [ { "key": "ranking", "label": "...", "type": "rank", "options": ["g1","g2"] },
               { "key": "usable",  "label": "...", "type": "choice", "options": ["g1","g2","none"] },
               { "key": "note",    "label": "...", "type": "text" } ]
}
```

Criterion types: `scale` (1–max buttons), `flag` (checkbox per image). Overall types:
`rank` (click best→worst), `choice` (radio), `text`. Example: `Projects/BLUELINE/proofs/track-II-lora/grade/rating_manifest.json`.

## Files

- `eval-server.mjs` — the serve-and-forward server (Node, no deps): `/answers`, `/eval`, the palace or a `--dir`.
- `answers.js` — the shared script a page that asks calls on Submit: post, or the copy block.
- `read-answers.mjs` — reads answers back off the board file.
- `rate.html` — the reusable rating harness (Loudon Live skin). Serves for any manifest.
- Tests: `_ops/stigmergy/app/tests/integration/loudon-eval-wire.test.js`.
