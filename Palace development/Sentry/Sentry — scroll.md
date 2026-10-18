---
title: "Sentry — scroll"
born: 2026-09-25
links:
  - target: "[[Sentry]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Sentry's scroll — the one page that opens on which version of the ceremony is live, whether it has run since it last changed, and what its tuning ledger still owes, then the plan it is following, then reads down through its runs and version changes, newest first. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are Loudon's and hold until he revokes them; my trail only ever grows."
---

# Sentry — scroll

> The ceremony's front door. **Now** is regenerated on every look — its version, its runs since the spec last changed, what its ledger owes; the **Plan** is the path agreed with Loudon, changed only with his yes, and the ledger's owed lines are the next run's to-do beneath it; **Standing Orders** are Loudon's, and hold until he revokes them; **The making** is the trail of runs and version changes, newest first. The card [[Sentry]] stays the spec, and its lessons live in [[Sentry — tuning]]. Rendered in [[STIGMERGY]]'s PROJECTS deck. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-18T19:39:28.867Z from the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the ceremony is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** — · **Stage:** growing
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector
- **Version:** v1.5 · the spec last changed 2026-10-18 (`b8b7442a`) — ops(Sentry): the Sentry reads commits and tags as push sends them: the push gate, the history check, and the names of pushed refs — v1.5
- **Runs since the change:** none yet — v1.5 has not run
- **Last run:** 2026-10-16 — quick sweep of 118edcbc and a hand read of every ref, 2 raised, held locally · nothing new (under v1.3)
- **Owed in the ledger:** 1 — item 4; the next run's tail read picks it up first
- **Latest lesson:** item 16, from the review of the message reads — 2026-10-18 — [[Sentry — tuning]]

### Runs since v1.5

_None yet._

### Owed

- **4.** Structured data escapes its strings, and a rule anchored on quotes misses what is inside. In JSON a `key = "…"` arrives as `key = \"…\"`. The format rules need no quotes and sti…

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this ceremony — never regenerated. It holds until he revokes it, and every run reads it before it starts, beside the tuning ledger's tail read. An order meant for the next run only goes into the ledger as owed instead: "once" on the PROJECTS deck._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="version-b8b7442abf48afeb96c966339a9b023028e25dec" -->
### 2026-10-18 — the spec moved to v1.5

ops(Sentry): the Sentry reads commits and tags as push sends them: the push gate, the history check, and the names of pushed refs — v1.5

On Loudon's word (2026-10-18): close the message gap. The repo is public, so a commit or tag message is as public as a file once pushed, yet the push gate read only blobs and paths, the history check only blobs and paths, and gitleaks reads patches, never a message.
<sub>`b8b7442a` · version change</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="version-450129067cef33479ef3a37eec876bc04e3bf2e7" -->
### 2026-10-18 — the spec moved to v1.4

ops(heartbeat): the steward batch runs when the Mac is truly awake, counts calendar days, and the Sentry watches GitHub's guard daily

On Loudon's yes (2026-10-18). The 06:00 timer met a Mac asleep on battery with the lid closed, inside a few-second dark wake (pmset log, 10-15 to 10-17); on 10-15 the batch stalled until he opened the lid, and its guard counted whole 24-hour days, so the 06:07 start of that run made 10-17 06:00 count as one day and skip. launchd now fires every 30 minutes and the wrapper decides: a batch only in a full wake with the lid open (pmset lists Graphics; AppleClamshellState is No), at 06:00 or later, two calendar days after the last; caffeinate holds off idle sleep while it runs; a skipped tick writ…
<sub>`45012906` · version change</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-f452ecbc35" -->
### 2026-10-16 — quick sweep of 118edcbc and a hand read of every ref, 2 raised, held locally

nothing new
<sub>a run under v1.3 · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-7a2f382468" -->
### 2026-10-16 — quick sweep of 118edcbc, 1 raised, held locally

nothing new
<sub>a run under v1.3 · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-6d6c642594" -->
### 2026-10-15 — sweep (hosting) of 3778f4a0, nothing raised

taught item 12
<sub>a run under v1.3 · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-4318bc42f5" -->
### 2026-10-15 — sweep (hosting) of 3778f4a0, nothing raised

item 12
<sub>a run under v1.3 · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="version-5c473ad92fb16db30011791f3d06a4ea96078136" -->
### 2026-10-14 — the spec moved to v1.3

ops(Sentry): the hosting check reads whether GitHub refuses a force push to main for everyone who can push

GitHub's guard on main is the one guard against rewriting main that lives off this Mac, and it comes off on purpose when Loudon closes a leak by rewriting history. The hosting check now reads main by name: its effective rules, each ruleset that supplies them (the bypass for the account gh is logged in as, which every session pushes as, and any deploy key or app listed to bypass), and classic protection (whose force-push and deletion blocks bind administrators too). It raises a force push that gets through or a guard that can be bypassed (medium), and at low a guard it cannot read, main no lon…
<sub>`5c473ad9` · version change</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="version-99a91587d588ba6aaa3e28b70b62019dfcd18ba0" -->
### 2026-09-26 — the spec moved to v1.2

edit(Sentry): v1.2 — each alert on its own; bot PRs read by lockfile

The hosting check raises every open Dependabot alert as its own finding — package, advisory, scope, the version that closes it — fingerprinted by advisory, manifest and package, so an allow entry holds as long as that alert does (the per-manifest count changed its fingerprint whenever a count moved). It also reads each open Dependabot npm pull request's lockfile at its head and raises one that lacks the version its title claims. Severity keeps item 10's weighting; a mismatch is medium, raised and never blocking.
<sub>`99a91587` · version change</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-aba612b6e8" -->
### 2026-09-27 — deep sweep of c80ff992, 4 raised, held locally

taught item 11
<sub>a run under v1.1 · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-3ad60fc42f" -->
### 2026-09-26 — public-surface gate of 4d33744c, 7 raised, held locally

nothing new
<sub>a run under v1.1 · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-4fbbf4e415" -->
### 2026-09-25 — public-surface gate of 9ef47639, 11 raised, held locally

nothing new
<sub>a run under v1.1 · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="version-aff66bc6512e567a5487e1eefc742c4c5be7638c" -->
### 2026-09-25 — the spec moved to v1.1

edit(Sentry): v1.1 — the hosting check reads Dependabot's alerts; 10

The first run on main raised npm advisories from two lockfiles with dev dependencies left out. Minutes later, with Dependabot switched on, GitHub reported 53 open advisories across every manifest, dev tooling included. The Sentry's view was narrower than the host's.
<sub>`aff66bc6` · version change</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-63792ee6c5" -->
### 2026-09-25 — deep sweep of b63b896b, 7 raised, held locally

nothing new
<sub>a run under v1.0 · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="version-a643be8747b565ed3140a483a8a1331c804e486b" -->
### 2026-09-25 — the spec moved to v1.0

Schema Ceremony — Sentry added — v1.24

The palace is public on purpose and becoming more public: git carries the whole house, and a read view on GitHub Pages is decided (5eac9572). Nothing in the palace owned security. The 2026-09-25 hosting assessment scanned only the working tree, and a tree scan cannot see history, which a public repo publishes whole.
<sub>`a643be87` · version change</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-5f42afab36" -->
### 2026-09-25 — hand-run history scan, before the Sentry had a page

taught items 1–9
<sub>a run under v0.0 · its line in the tuning ledger</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
