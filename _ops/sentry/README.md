# The Sentry — machinery

The runnable half of [[Sentry]]. The page says what the Sentry watches and why; this folder is how it looks.
Everything here reads. Nothing here fixes, rewrites history, rotates a key, or changes a setting — it raises,
and Loudon decides. The one thing with teeth is the push gate, and it only says no.

## Commands

| Run | What it does | Cost |
|---|---|---|
| `node _ops/sentry/sweep.mjs` | **quick** — the working tree (secrets, personal data, text aimed at agents), tracked paths that should never be tracked, agent permissions, the script census, every piece a rich face shows (the piece checker, report-only) | offline, ~20 s |
| `node _ops/sentry/sweep.mjs --deep` | quick **+ history** (every blob, commit and tag in every ref, and gitleaks over the full log) **+ deps** (`npm audit` per lockfile) **+ hosting** (GitHub repo settings, whether GitHub refuses a force push to main for everyone who can push, each open Dependabot alert, and each open Dependabot pull request's lockfile against its title, via `gh`) | network, ~3 min |
| `node _ops/sentry/sweep.mjs --gate` | the check before anything widens the public surface: `--deep`, and exits 1 on any open high finding | same as deep |
| `node _ops/sentry/sweep.mjs --only history,hosting` | named checks only | — |
| `node _ops/sentry/sweep.mjs --only rich` | the rich check alone: every piece a rich face shows, by the piece checker | offline, seconds |
| `node _ops/sentry/sweep.mjs --record [--taught "item N"]` | also marks the ledger with the run's line (scope and a bare count, never a finding) and rebuilds the scroll with the palace's own generator | — |
| `node _ops/sentry/guard-watch.mjs` | the daily guard watch the heartbeat runs when the Mac is awake: whether GitHub still refuses a force push to main for everyone who can push; one line, exit 0 holds / 3 raise it / 4 could not tell | network, seconds |
| `node _ops/sentry/sweep.mjs --selftest` | plants one of everything in memory and proves each rule still catches it | instant |
| `node --test _ops/sentry/tests/*.test.mjs` | the push gate and the history check against real git in throwaway repos: a key in a commit message, a merge's message, a tag's notes and name, a branch's name, a message hidden behind `git replace`, and whether a hit is public; and the rich check at push (`rich-gate.test.mjs`) | seconds |
| `node _ops/sentry/install-hooks.mjs [--check\|--uninstall]` | installs the push gate (a shim in the shared hooks dir) | — |

The deep sweep sends the dependency list to the npm registry, reads repo settings through `gh`, and, when a
history hit is open, asks each git remote for its tag list (`git ls-remote --tags`, up to 30 s per remote) to
settle whether the hit is public. Nothing else leaves the machine.

## What goes where — faces are public, findings are held

The repository is public, so the scroll is public. A scroll that names an open finding points strangers at it.

- **`held/`** — always in the **owner checkout** (`<main checkout>/_ops/sentry/held/`), whichever worktree
  ran the sweep, in a folder that carries its own `*` `.gitignore` so no branch and no `git add -A` can ever
  commit it. `latest.md` / `latest.json`: the full masked report with paths, commits, and whether a public ref
  can reach each hit. `inventory.json`: the script census the next sweep diffs against. `gate.log`: one line
  per push the gate checked.
- **The ledger and scroll** (`Palace development/Sentry/`, public) — `--record` appends the standard run line
  (`- run · <date> · v<version> · <scope> of <head>, N raised, held locally · nothing new`) to
  `Sentry — tuning.md`, then runs `_ops/stigmergy/orchestrator/src/scroll.js --home "Sentry"` to rebuild
  `Sentry — scroll.md` from it. When a finding is closed, the ledger may say what it was.
- **`allow.json`** (public) — reviewed exceptions. Each entry is a hash of the finding plus the reason it is
  fine; never the value, never the path. `must_stay_ignored` lists local secret files whose ignore rule must
  hold. `skip` exempts a path prefix from one family (the Sentry's own docs quote the phrases it hunts).

No value is ever printed or stored whole. `mask()` in `rules.mjs` is the only way a value leaves the engine;
a number (an ID, a card, a phone) shows only its last two digits.

A history hit says whether it is public: `yes` when a remote-tracking branch reaches it, or a tag the remote
lists (git never fetches tags under `refs/remotes`, so the history check asks each remote for its tags once);
`unknown` when a remote could not be asked and none that answered shows it public, for a tag's own message
or a commit only a local tag reaches; `no` otherwise.

## Severity

`high` blocks a push and fails `--gate`: a real-format key (Anthropic, GitHub, Hugging Face, AWS, RunPod,
OpenAI, Google, Slack, …), a private key, a tracked `.env` / `settings.local.json` / key file / data export,
an SSN or card number in prose, a GPS-tagged photo, invisible Unicode tag characters, an order to send
credentials somewhere. `medium` and `low` are raised, never blocking: name-shaped assignments, emails and
phones, instruction-override phrases, broad agent permissions, a newly network-reaching script, a hosting
setting that is off. `info` is a placeholder (`your-api-key-here`) — counted, not shown. A rich-face
checker error is `high` only while `enforce.push` is on (§ The rich check); otherwise it is `medium`, and
the checker's warnings are `low`.

## The push gate

`pre-push.mjs` reads every blob the push would add (what the remote does not have yet — for a new branch,
everything no remote-tracking ref reaches), every commit and tag in the same range, and the names of the
refs it updates; runs the Sentry rules on them, and runs gitleaks on the same range when it is installed.
Once pushed, a message is as public as a file. A commit is read three ways, a tag two: its message in full,
as prose (`commit 1a2b3c4d message:3`); its headers for credentials only — a tag's name, an author line, and
everything a merge carries, so a key in a carried tag shows as `… header` — without flooding on emails; and,
for a merge, the message of each signed tag it carries, for personal data and text aimed at agents
(`… mergetag message`). A ref's name is read for credentials and never printed or logged. Objects are read
as push sends them, with `refs/replace` ignored, so a message "fixed" with `git replace` is still caught.

The gate reads a new ref against the remote-tracking branches, and an updated ref against its old tip. So
anything the remote already holds only through a tag is read again: a tag wrapping a pushed tag, a branch
on a commit only a pushed tag reaches. A hit there is already public, not a false positive, and an fp in
`allow.json` would hide it from the history check too. Run `sweep.mjs --only history` to see it, and bring
it to Loudon. It blocks on high, prints the rest. `git push --no-verify` skips it once. It
**fails closed** ([[Tool Builder]]: fail-closed on safety): if node or the logic is missing, or the gate
errors, the push is refused and the message names `--no-verify` as the way through. A missing gitleaks is
only a warning — the Sentry's own rules still read every blob. The shim is shared by every worktree
(`git rev-parse --git-path hooks`); it runs the pushing worktree's copy of the logic and falls back to the
owner checkout's for a branch older than the Sentry.

## The rich check

`rich.mjs` runs the piece checker (`_ops/rich-face/conform.mjs`, [[STIGMERGY — spec — rich-face pieces]] § 5)
over every piece a rich face shows: its declaration, what its code needs, its CDN pins, its root-absolute
URLs, and how the face names its files. It reads statically, so like the Sentry's own rules it needs only
node and git. The sweep reads the working tree. The push gate reads the commit being pushed, never the
working tree, and only when the push touches something a rich face depends on: a manifest, `grants.json`,
`libs.json`, the checker's settings, a face's entry, a piece, a file a piece declares, or the name of a
reference that no longer resolves.

A checker error is `high` only while `enforce.push` is on in `_ops/rich-face/conform.json`, and the gate
reads that switch from the commit being pushed. It is off, so today the rich check raises and never
blocks, and the gate's one tooth is still credentials. Turning it on is Loudon's call. With it on, a rich
check that cannot run refuses the push (fail closed), and a rich block is fixed in a new commit, never a
rewrite; with it off, a check that cannot run says so and the push goes on.

A rich finding names a piece and a rule, never a value, so its detail is shown as written rather than
through `mask()`. Its findings count among a sweep's raised, and so in a recorded run's line. They are
fingerprinted by rule, piece and key, so an `allow.json` fp holds across line moves; the checker's own
reviewed exceptions live in `conform.json`'s `allow`.

## Engines

The Sentry's own rules (`rules.mjs`, read by `engine.mjs`) always run — they need nothing but node and git,
they read every blob including merge results, every commit and tag, the file names inside zip
archives, and they carry the palace's own formats (RunPod keys). **gitleaks** (Homebrew, ~150 rules) runs beside them when installed: broader, but it reads
only the added lines of each patch in `git log -p` (none for a merge commit, and never a commit or tag message), and it opens archives only when told to (`--max-archive-depth=3`
on history sweeps). Each covers the other's blind spot. Neither decodes JSON strings yet
([[Sentry — tuning]] item 4).

## The deep read — when a judgment is needed

Rules find shapes. They cannot tell a public thinker's name from a private student's, or a quoted attack
from a live one. When a sweep raises personal data or agent-aimed text that needs reading, or before a step
that widens the public surface, the Sentry reads the flagged files itself — one `palace-reader` agent with
`prompts/deep-read.md`, the held report as its list. A fan-out across the whole tree is only for the gate
before a new public door opens, and is costed first (roughly one Sonnet reader per ~40 prose files; the tree
holds ~800, so ~20 readers).

## Adding a rule

Add it to `rules.mjs` with an id and a severity, add a planted example to `selftest()` in `sweep.mjs`, run
`--selftest`, then a quick sweep to see its noise. A rule that floods the report on first run is tuned or
narrowed (`ext:`) before it lands — the card-number rule learned this on HTML float arrays. What the run
taught goes in [[Sentry — tuning]].
