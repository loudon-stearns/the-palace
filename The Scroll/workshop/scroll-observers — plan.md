---
title: "scroll-observers — plan"
born: 2026-11-03
links:
  - target: "[[The Scroll]]"
    type: connects-to
    label: workshop-for
forward_vector: "I am a child's plan for giving a scroll's Now one more input — the pages it links to, and what they need that involves it — computed when you look, never stored, never acted on by the look. I end when Loudon says yes, no, or change it, and the plan he agrees lands on The Scroll's scroll."
---

# Scroll observers — plan

A scroll's **Now** reads only the page's own things. This plan gives it one more input: the pages it links to (and, where it helps, the pages linking to it), and what those neighbours need that involves this page. One mechanism for every page, proven first on BLUELINE.

Two rules hold it. **Anything that summarizes something living elsewhere is computed when you look, not stored** — learned when Now replaced the `plan.md` that lied whenever the steward slept. And **a look computes, it never acts**: a read writes nothing, sends nothing, changes nothing in the house. It may surface a need and offer a move; the move waits for a hand — Loudon, a steward cycle, or a ceremony. Reading the trail is free; only walking it lays scent ([[STIGMERGY]]).

Marks used below: **(verified)** — I read the code or ran a read-only probe; **(inferred)** — my reading, not checked.

---

## What I found before planning

**Now is ready to take another input.** `computeNow` in `_ops/stigmergy/orchestrator/src/scroll-file.js` is pure given its inputs; `materializeScroll` gathers them and writes only when not `dryRun`. The deck's `readScroll` (`app/server/projects.js`) calls it with `dryRun: true`, and the git it runs is read-only (`git log`, and `git status` with `GIT_OPTIONAL_LOCKS=0`). The tests in `tests/unit/scroll-file.test.js` assert with `toContain` and there are no snapshot tests in the orchestrator or the app (verified), so a new block that renders only when present breaks nothing.

**The palace already has four ways of saying "neighbours", and one of them is stored.** (verified)
- A steward's manifest carries `neighborhood`, copied from the page's frontmatter links once, at enchant time (`enchant.js` `buildManifest`), plus two fixed names. `filterBoardForAgent` in `build-cycle-prompt.js` filters each cycle's board by it. When the page's links change, the steward keeps reading the old ring — a stored summary of something living elsewhere.
- `ephemeral-prompt.js` `extractNeighbors` reads them fresh from frontmatter.
- `app/src/lib/topology-live.js` `readLiveMap` builds the live typed-link graph, app-side.
- `palace-map.py near` reads the dated map, rebuilt each morning.

**The palace has four wikilink resolvers, and they disagree.** (verified by reading each)
- `_ops/swarm/lint-ghost-links.py`: Obsidian's rule — any file anywhere, by stem, case-insensitive, last path segment. Right.
- `topology-live.js` `targetId`: last path segment, then node ids only (bundle files are not nodes, by design).
- `app/src/lib/wikilink.js`: exact basename, case-sensitive.
- `_ops/daily-page/deal.py`: `entry-use.py`'s `_entries`, which holds only files with a canon `type:`, keyed by stem, looked up with the raw target. So `[[Shop/Blender]]` (path-qualified) and `[[BLUELINE — Text Layer]]` (a bundle file, no canon type) both print as forward ghosts. That is the cause of tuning items 59, 63 and 89 in [[The Daily Page — tuning]]. It is the resolver, not a stale list — item 63 guessed this; the code confirms it. The false ghost has already travelled: `Adopt the Craft, Author the Seam/proofs/2026-10-19-…/outside-read.md` lists "the `[[Shop/Blender]]` ghost".

**The board's needs come in four shapes, each with its own open/closed rule.** (verified)
- Batons: `handoff_ready` folded with claims and closes by `foldHandoffs` in `_ops/stigmergy/handoff-model.mjs`.
- Asks: `RESOURCE_REQUEST` answered by a grant or deny, read by `reconcilePendingRequests` in `process-cycle.js`. 95 asks on the board, 22 unanswered.
- Weave flags: 182 `weave_flag` broadcasts. Whether one is open is not on the board; `lint-weave-flags.py` decides it from `Palace-Resolves:` trailers and decline lines in git.
- Proposals for canon: owed items in stewards' tuning ledgers, grouped by the page they would change by `proposalsByPage` in `orchestrator/src/ledger-review.js`.

**The boundary is already soft in three places.** (verified)
- `GET /api/projects/scroll?write=1` (`app/server/api/projects.js`) is a look that writes. The adapter supports it; I found no UI caller with grep.
- A steward reads its Now from the scroll *on disk* (`build-cycle-prompt.js` reads the zone with `readZone`), so its Now is as old as the last cycle that wrote it.
- BLUELINE's Now on disk (on main) says *Regenerated 2026-09-25*. Nothing writes an unstewarded scroll, so anyone reading it in Obsidian reads a summary 39 days old. The deck's live Now is fine.

**Loudon folded Now on the deck.** `ScrollView.jsx` keeps it under a fold, quoting him (2026-10-18): "looks important but not really needed for the human users." So a need meant for him cannot live only inside Now.

**What BLUELINE's ring holds today** — a read-only probe over the main checkout (scratchpad, not the repo; one run). (verified)
- Its frontmatter names 25 links and its new body 29 wikilinks; 37 markdown files link to it, bundle files included. The 2026-11-02 map counts 20 out and 17 in among canon nodes.
- **Two neighbours have open batons**: [[Graphic Storytelling]] (2026-10-29: land the revision Loudon corrected) and [[Adopt the Craft, Author the Seam]] (2026-10-22: carry the Hand the Groove roughs toward a rich face).
- **BLUELINE's own open baton waits on one of them.** `blueline-remainder-20261103T130034Z` includes "the link-pair check once Graphic Storytelling's revision lands".
- **No ghosts in the new body** by Obsidian's rule. The dealer reported several (item 89).
- Thin: no neighbour has an unanswered ask; one neighbour keeps a tuning ledger; six have scrolls; no owed ledger line and no neighbour Plan names BLUELINE.
- Cost: walking 28,103 files took about 140 ms; parsing 1,257 markdown files about 150 ms; every signal for one page about 22 ms.

So for BLUELINE the live signals today are batons and ghosts. Asks and owed lines are the right plumbing, but they would show nothing yet. The first proof should be built on what is there.

---

## 1. Uses in the palace as it stands

Each one says what is observed, what the page would show, and who acts. They are ordered by how much evidence is behind them.

**1. A hub sees what its neighbours need, and what its own work waits on.** — [[BLUELINE]]
- *Observed:* open batons on the pages it links to; its own open baton's move text.
- *Shows:* "Graphic Storytelling — open baton since 10-29: land the revision · **your baton waits on this** (the link-pair check)". And "Adopt the Craft, Author the Seam — open baton since 10-22".
- *Who acts:* Loudon, by opening the neighbour's baton or sequencing the work; the session that catches either baton.
- *Status:* verified data; it is the use the whole idea came from.

**2. Ghosts computed when you look, by one resolver.** — any page; the dealer; the Deposit; the Weave
- *Observed:* the page's body wikilinks against every file stem in the palace.
- *Shows:* forward ghosts (nothing by that name exists) apart from file links (a bundle file, a path-qualified name), and **none** when there are none.
- *Who acts:* whoever edits the page — an elder, the Deposit, the Weave's disposition (invitation, typo, stale).
- *Status:* verified. Items 59, 63 and 89; a false ghost already copied into a proof.

**3. The Daily Page dealer reads the same view.** — [[The Daily Page]]
- *Observed:* the dealt page's ring and ghosts, through the shared resolver rule.
- *Shows:* in the morning's brief, true ghosts only, and the open batons around the page.
- *Who acts:* the morning's prep and sit.
- *Status:* verified need (item 59, still owed). The fix is in `deal.py`'s Python; it should share `lint-ghost-links.py`'s `build_target_index` rather than its own index (inferred: simplest path).

**4. A ceremony's scroll sees what waits on it.** — [[Weave Ceremony]] first
- *Observed:* palace-wide, not the ring. Weave flags still open (by `lint-weave-flags.py`'s rule), batons and asks that name the ceremony.
- *Shows:* "N flags open in the inbox, oldest from <date>" — the inbox the Weave reads at Step 0c, visible between weaves. Every `weave_flag` is addressed to the Weave (`to: weave-ceremony`, board `WEAVE`); 11 of them also name the Weave Ceremony page itself (probe). The open count I did not compute.
- *Who acts:* the next Weave run.
- *Status:* verified that the data and the closing rule exist. The rule lives in Python and reads git trailers, so this costs more (see § Cost).

**5. Proposals for canon aimed at this page.** — any page a steward wants changed
- *Observed:* owed `Proposed for canon` items in every tuning ledger that target this page (`proposalsByPage`).
- *Shows:* for example, "2 proposals from <steward>'s ledger, oldest 10-20", on the page being proposed for, not only on the proposer's scroll.
- *Who acts:* Loudon, in the ledger review.
- *Status:* verified mechanism. None aim at BLUELINE today.

**6. One link per pair, for this page's pairs.** — the Weave's Step 3d, made visible per page
- *Observed:* typed links both ways between this page and each neighbour.
- *Shows:* a pair carrying two links (exact duplicate, symmetric stated twice, `connects-to` beside a specific link, two specific types).
- *Who acts:* the Weave, or an elder on Loudon's word.
- *Status:* verified rule (`lint-link-pairs.py`). BLUELINE has no such pair in the 11-02 map, but its baton names a pair check still to come. It needs the Python type sets restated in JS and held by a parity test — the way `topology-parity.test.js` holds the live graph to the builder.

**7. Neighbours' asks, owed lines, Plan moves and stalls that name this page.** — any project
- *Observed:* a neighbour's unanswered asks; owed lines in its tuning ledger; its scroll's Plan; its steward's stall read (`readStall`).
- *Shows:* only those that name this page, by wikilink or structured field. Or, for a hub that observes `any`, every one, marked by whether it names this page.
- *Who acts:* Loudon for asks; the neighbour's next run for owed lines; the neighbour's steward or Loudon for a stall.
- *Status:* plumbing verified, signal thin. Zero owed lines naming a neighbour across the rings of BLUELINE, the Weave, the Loudon Live Design System and Stoicism. Owed lines rarely name another page. Build it once; expect it quiet.

**8. "Where it stands" and "Active Baton" sections become views.** — entry bodies
- *Observed:* the page's own open batons (folded from the board) and its scroll's Now.
- *Shows:* on the scroll, the page's open baton, which today's Now does not read. The BLUELINE commit `0ccda4a3` says so itself: "Not verified: whether the scroll's live Now reads as awake (it does not read the baton)."
- *Who acts:* the view is free. Trimming the duplicated body sections is a house edit — an elder, on Loudon's word.
- *Status:* verified count. Six canon entries carry a "Where it stands" or "Current state" heading: Generative Audio Devices, Project Stewardship System, Shimmer Cloud, STIGMERGY, SUBSTRATE, and BLUELINE until 11-03. Fifteen carry "## Active Baton", a stored copy of the board's baton state.

**9. A steward's neighbourhood computed, not copied.** — every stewarded page
- *Observed:* the page's links now, through the same index.
- *Shows:* nothing on the scroll. The cycle's board filter uses the live ring instead of `manifest.neighborhood`.
- *Who acts:* no one; it is machinery.
- *Status:* verified stored copy; the value is inferred.

**10. A design system sees who uses it.** — [[Loudon Live Design System]], [[Drafting Table Design System]]
- *Observed:* inbound links and body wikilinks palace-wide. The Loudon Live system is named in 44 markdown files, the Drafting Table in 23.
- *Shows:* mostly a view. The need case is a composted system still being pointed at — the BBS Design System folded into STIGMERGY on 11-02 and nine pages were repointed by hand.
- *Who acts:* an elder repointing, on Loudon's word.
- *Status:* thin as a *need*. Code that loads the tokens (`palace-tokens.js` in HTML) is a different, costlier scan. Not first.

**11. A philosophy page sees where it is cited.** — e.g. [[Stoicism]]
- *Observed:* inbound links and body mentions; unsaid links aimed at it.
- *Shows:* the cite list; today, also that [[Palace Map]]'s Plan names Stoicism (probe).
- *Who acts:* no one by default — a Philosopher Visit or the Weave if it chooses.
- *Status:* a view, not a need. I would not build it until a page asks for it.

**Checked and dropped:** false-ghost notes in prose — "[[X]] *(ghost — not yet deposited)*" where X exists. Only BLUELINE's old body had them, and the 11-03 edit removed them. Use 2 covers any that come back.

---

## 2. One reusable mechanism

Three pieces, each small.

### 2.1 The palace index — one read model, one resolver

New file: `_ops/stigmergy/orchestrator/src/palace-index.js`. One walk and one parse, giving a frozen object:

- `resolve(target)` → `{ kind: 'node' | 'file' | 'ghost', path }`, by Obsidian's rule (the `lint-ghost-links.py` rule): any file, by stem, case-insensitive, last path segment, `|` and `#` stripped.
- `out(title)` — frontmatter links `{ target, type, label }` and body wikilinks (code spans and fences stripped, as the linter does).
- `in(title)` — the reverse, built once.
- `titleOf(path)`, `pathOf(title)`, `bundleOf(title)` — so observers never call `resolveBundleDir`, which can walk the whole tree on every call (`findEntryFile`).

A parity test runs `lint-ghost-links.py` over a fixture tree and holds `resolve` to its answers, the same way `topology-parity.test.js` holds `topology-live.js` to the builder. That stops a fifth resolver from drifting. It lives in the orchestrator, because the app imports the orchestrator and never the reverse (`projects.js` imports `scroll-file.js`).

### 2.2 Declaring what a page observes

**Recommend no new field at first.** A page observes by its kind, and the kind is already read (`scrollKind`):

| Kind | Scope | Direction | Involves this page when |
|---|---|---|---|
| project | its ring | out: frontmatter links + body wikilinks | `any` need of a neighbour, marked when it names this page or this page's own open work names the neighbour |
| ceremony | the palace | — | the need names this page |
| page | itself | — | its own ghosts only |

When a page needs something else, the override lives in **the scroll's own frontmatter**, not the entry's. The scroll is a face, its frontmatter is machine-made, and adding a key there changes no canon field (SCHEMA §3). A field on the entry would mean a Schema Ceremony.

```yaml
observes:
  direction: out          # out | in | both
  via: [links, body]      # frontmatter links, body wikilinks
  types: []               # optional link-type filter, e.g. [spawned, enables]
  signals: [batons, ghosts]
  involve: any            # any | names-me
```

Writing the key is an act, so it is written on Loudon's word. Whether the `scroll` row of SCHEMA — Reference §8 names the key is a doc edit for him to decide.

"Names this page" means a wikilink or a structured field (`entry`, `target_entry`, `source_entries`, a proposal's target). It never means a bare substring: "BLUELINE" is inside "BLUELINE — Text Layer". The one exception is the hub join in use 1. BLUELINE's baton names "Graphic Storytelling" in prose, so for its *own* open work the observer matches neighbour titles as whole phrases. That is marked in the output as matched by name (inferred, not structured).

### 2.3 The observer contract

New file: `_ops/stigmergy/orchestrator/src/observers.js`. Split it into a folder later if it grows.

```js
// An observer reads a frozen snapshot and returns needs. It is handed no path,
// no file handle, no board writer — only data.
export const batonsObserver = {
  id: 'batons',
  reads: ['board'],                       // which snapshot parts (for cache keys)
  observe({ home, neighbours, snap }) {   // → Need[]
    // fold already done once per snapshot: snap.handoffs = foldHandoffs(board)
  },
};

// Need — what the look found
// { observer, about: '<neighbour title>', what: 'open baton', says: '<one line>',
//   since: '<iso>', ref: '<message id | file:line>', names_me: bool,
//   waits_on_it: bool, matched: 'structured' | 'name', offers: Offer[] }

// Offer — a move the look proposes, never takes
// { label, act: 'open' | 'draft-ask' | 'launch' | 'draft-edit' | 'baton',
//   draft: '<text or payload>', by: ['loudon'] | ['loudon', 'steward'] | ['ceremony:Weave'] }

export function runObservers({ home, kind, decl, snap, observers = DEFAULT }) { … } // → Need[]
```

The snapshot is built once per look, or taken from the cache, and deep-frozen:
`{ index, board, handoffs, asksByAuthor, proposalsByPage, readText(path) }`. `readText` is the only file access an observer gets. It reads a neighbour's tuning ledger or scroll text with `readFileSync` and nothing else. **An observer never calls `computeNow` or `materializeScroll` on a neighbour.** That would cost two `git log`s per neighbour and could recurse round a loop of hubs.

Signals by stage:

| Signal | Reads | Cost per look | Stage |
|---|---|---|---|
| batons | board fold | ~0 (fold shared) | 1 |
| ghosts | index | ~0 | 1 |
| asks | board (`reconcilePendingRequests` per neighbour) | small | 2 |
| owed | neighbour tuning text (`parseOwed`, `parseOrders`) | one read each | 2 |
| proposals | `proposalsByPage` | one walk of ledgers, cached | 2 |
| plan moves | neighbour scroll text (`readPlan`) | one read each | 2 |
| stalls | neighbour steward `state.json` + `history.jsonl` (`readStall`) | two reads each | 2 |
| pairs | index + restated type sets | ~0, plus a parity test | 3 |
| weave flags | board + git trailers (the `lint-weave-flags.py` rule) | one `git log`, cached on HEAD | 3 |

### 2.4 Into `computeNow`, without breaking a test

- `computeNow({ …, observed = null })` passes `observed` through to the view untouched. It stays pure.
- `renderNow`: when `now.observed !== null`, add one summary line (`- **Beside it:** 2 neighbours need something — one your baton waits on`) and a section `### What the pages beside it need`. That section lists the ones this page's work waits on first, then the rest, capped at eight with "…and N more". When `observed` is null — every existing test — nothing renders differently.
- `sourcesLine` adds "the pages it links to" only when observed is not null.
- `materializeScroll(opts)`: takes `opts.snapshot`, or builds one when absent (the CLI and a cycle, about 300 ms, once per run — `scrollAll` shares one across pages). `opts.observe === false` skips it.
- `readScroll` returns `observed` as structured data beside `zones`. The deck draws it **unfolded**, beside Open asks, with its offers as buttons. Now's fold stays as Loudon set it, and the markdown block inside Now is what a steward and Obsidian read.
- The PROJECTS rows (polled every 3 s) do not run observers in stages 1 and 2.

### 2.5 Cost and the cache

Measured: about 300 ms cold for the walk and parse, about 22 ms per page for every signal. That is fine for one look, but not for every 3-second poll across 40 rows.

- **Deck:** `projects.js` keeps one snapshot in memory, built like its existing `ledgerCache`. The key is HEAD (`gitHead`), plus the board file's size and mtime, plus a 30-second TTL so uncommitted edits show. A look with the cache warm costs the 22 ms.
- **CLI and cycle:** one snapshot per run.
- **Weave flags:** one `git log --grep` per HEAD, cached with the snapshot.
- The cache lives in memory only. A cache on disk would be a write by a look.

### 2.6 The read-only boundary, in code

1. **Observers receive data, not reach.** No `palaceRoot`, no board path, no writer. The snapshot is deep-frozen, so a stray mutation throws in strict mode.
2. **A static guard test** (`tests/unit/observers-readonly.test.js`). It reads the source of `observers.js` and `palace-index.js` and fails on any write API: `writeFileSync`, `appendFileSync`, `mkdirSync`, `rmSync`, `renameSync`, `copyFileSync`, `createWriteStream`, `postMessage`, `appendLedgerLine`, `recordRun`, `applyPlan`, `writePlan`, `child_process` other than read-only git through one named helper. This is the palace's own habit, as in `lint-baton-footer.py`: a rule checked mechanically.
3. **A runtime guard test.** On a temporary palace, hash every file and the board, run `readScroll` with observers on for several pages, then hash again. They must be identical, and `git status --porcelain` must be empty.
4. **Offers are data.** No route accepts an offer and runs it. Taking one goes through a write path that already exists: a board post through the composer, `writePlan`, `writeOrders`, a Concierge write, a launch from `AgentLaunchModal`. Each of those starts from a click or a ceremony.
5. **Move the one look that writes.** `GET /api/projects/scroll?write=1` becomes a `POST` or goes away (no UI caller found). Then the route table says what the prose says: GET reads.

### 2.7 Offering a move without taking it

The moves, and whose hand takes each:

- **open** — go to the neighbour's scroll or baton. Free; anyone.
- **draft-ask** — a board message drafted to the neighbour, or to TRICKSTER about it, shown in the composer. Posting is Loudon's click. A steward cycle may post an ask in its own name; it already can.
- **launch** — `AgentLaunchModal` in ephemeral mode on the neighbour, with a drafted mandate ("your baton waits on BLUELINE's link-pair check…"). The launch is Loudon's click.
- **draft-edit** — for a ghost or a pair: the drafted change, shown. Writing it is a house edit, so it goes to the Concierge or an elder on Loudon's word.
- **baton** — drafted text for the [[Baton Ceremony]], for when a need deserves its own move.

Every offer names who may take it (`by`). The deck greys out what is not Loudon's to click from there.

### 2.8 Files that would change (each read before naming it)

| File | Change |
|---|---|
| `_ops/stigmergy/orchestrator/src/palace-index.js` | **new** — the index and the one resolver |
| `_ops/stigmergy/orchestrator/src/observers.js` | **new** — the contract, the registry, the stage-1 observers |
| `_ops/stigmergy/orchestrator/src/scroll-file.js` | `computeNow` takes `observed`; `renderNow` and `sourcesLine` render it; `materializeScroll` takes or builds a snapshot |
| `_ops/stigmergy/orchestrator/src/scroll.js` | `scrollAll` builds one snapshot for the whole run |
| `_ops/stigmergy/app/server/projects.js` | snapshot cache beside `ledgerCache`; `readScroll` returns `observed` |
| `_ops/stigmergy/app/server/api/projects.js` | `?write=1` moves off GET |
| `_ops/stigmergy/app/src/adapters/projects.js` | `fetchScroll` loses `write`, or calls the new POST |
| `_ops/stigmergy/app/src/components/projects/ScrollView.jsx` | an unfolded "beside it" box with offer buttons |
| `_ops/stigmergy/orchestrator/tests/unit/` | new `palace-index.test.js`, `observers.test.js`, `observers-readonly.test.js`; new cases in `scroll-file.test.js` |
| *read only, reused:* `_ops/stigmergy/handoff-model.mjs` (`foldHandoffs`), `orchestrator/src/ledger.js` (`parseOwed`, `parseOrders`), `orchestrator/src/ledger-review.js` (`proposalsByPage`), `orchestrator/src/process-cycle.js` (`reconcilePendingRequests`) | no change |
| *later stages:* `_ops/daily-page/deal.py`, `orchestrator/src/build-cycle-prompt.js` (`filterBoardForAgent` from the live ring; Now computed fresh), `orchestrator/src/enchant.js` (`neighborhood` no longer copied) | stage 3–4 |

`foldHandoffs` lives outside the orchestrator. The snapshot builder imports it; the observers never import `handoff-model.mjs`, which also exports `postMessage`.

---

## 3. Staging

**Stage 1 — the smallest proof: BLUELINE, outbound, batons and ghosts, on the deck only.**
- Build `palace-index.js` with its parity test, the two observers, the guard tests (written first), `computeNow`'s pass-through and the deck's box.
- Nothing is written to disk. BLUELINE has no steward, so no cycle writes its scroll; this proof lives in the look alone.
- *Done when:*
  - BLUELINE's scroll on the deck shows Graphic Storytelling's open baton, marked as the one BLUELINE's baton waits on, and Adopt the Craft's.
  - It says "no ghosts" where `deal.py` printed several.
  - The full orchestrator and app suites pass.
  - `git status` is clean after a dozen looks.

**Stage 2 — every project scroll, by kind.**
- Asks, owed lines, proposals, Plan moves and stalls.
- `scroll.js --all` and the steward cycle write the block into Now on disk, with its stamp, like the rest of Now.
- The offers: open, draft-ask, launch.
- The `observes:` override in scroll frontmatter, for the first page that wants something other than its default.

**Stage 3 — ceremonies and the dealer.**
- The Weave's scroll shows the open flags in its inbox.
- Pairs, with their parity test.
- `deal.py` resolves through `lint-ghost-links.py`'s index, paying Daily Page item 59.

**Stage 4 — views replace stored copies.**
- A steward's board filter uses the live ring, not `manifest.neighborhood`.
- A cycle's prompt reads a freshly computed Now instead of the zone on disk.
- Then offer Loudon the body edits: the "Active Baton" and "Where it stands" sections point at the scroll instead of restating it. That is house work, on his word, one page at a time.

---

## Open questions for Loudon

1. **Out, or out and in, for BLUELINE?**
   - Out is the workflow its body walks.
   - In is the seventeen pages that grew from it, among them Frame Designer, GenAI Camera, Lettering and The Aftermath Frame. "Supporting other work" may mean watching them too.
2. **Where the box lives.** Unfolded beside Open asks (my recommendation, since you folded Now), or inside Now only?
3. **Where a declaration lives.** Kind defaults, then the scroll's frontmatter (my recommendation), or a field on the entry (a Schema Ceremony)?
4. **Where the boundary might want an exception.** Each is argued, not assumed:
   - **The `?write=1` look.** I recommend moving it to POST. If you want "a look that also saves" on the deck, it should be a button, which is a hand.
   - **Stale scrolls on disk.** BLUELINE's on-disk Now is 39 days old because only a cycle or the CLI writes it. I would not let a look refresh it. Instead, the heartbeat could run `scroll.js --all` each morning: a scheduled hand, not a look. Is that wanted, given each run touches every scroll in git?
   - **A steward acting on a neighbour's need.** It may already post asks. Should it be able to take a draft-ask aimed at a *neighbour's* steward, starting a conversation between stewards that you see but did not start?
   - **Weave flags read through git.** Allowed per look if cached on HEAD? It is still read-only.
5. **How much is too much.** A hub with fifty neighbours could fill the box. A cap of eight, with "your work waits on it" first, is my guess; your eye decides.

---

*Not done here: no code changed, nothing committed. The probe that measured BLUELINE's ring is a read-only script in this session's scratchpad, not in the repo. The Concierge was not summoned for this plan; the work stayed a child's plan.*
