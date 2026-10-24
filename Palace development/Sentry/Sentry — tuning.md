---
title: "Sentry — tuning"
born: 2026-09-25
links:
  - target: "[[Sentry]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Sentry's record of what its watches taught it, numbered, each lesson naming the spec change it forced, if any, so a rule's shape has a reason you can read. Every watch leaves a line here. I name what a run taught about the Sentry, never what it found — findings are held, and this file is public."
ledger: tuning
standards:
  for: "what each watch taught the Sentry — never a finding; this file is public"
  run: "one sweep"
  line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "sweep.mjs --record writes the line itself"
  merge: union
  kept: git
  trim: never
---

# Sentry — tuning

What each watch taught the Sentry. Items are lessons about the spec — how it reads, what it trusts, where it
is blind — and never a finding: open findings are held locally, and this ledger is as public as the scroll
([[Sentry]] § Faces are public; findings are held). A run leaves one line at the end; a run that taught
something also leaves a numbered item, naming the version when it changed the spec. Newest last.

## From the first watch — 2026-09-25 (hand-run, before the Sentry had a page)

The 2026-09-25 hosting assessment scanned the working tree for key formats and found none. It did not read history. Designing a pass over the full history — gitleaks, then a custom read of every blob — shaped the Sentry.

1. **A working-tree scan says nothing about history.** A file removed from the tree stays in every commit that held it, and a public repo publishes all of them. So the deep sweep reads every blob reachable from every ref, and marks each hit with whether a public ref can reach it. *(v1.0)*
2. **An established scanner reads `git log -p`, and `git log -p` skips merge commits.** Content that enters through a merge resolution is invisible to it. So the Sentry reads blobs as its own engine and runs gitleaks beside it for breadth; each covers the other's blind spot. *(v1.0)*
3. **Archives hide their insides from both engines by default.** gitleaks opens them only with `--max-archive-depth`; a raw blob read sees compressed bytes. So history sweeps run gitleaks at archive depth 3, and the Sentry reads the file names inside every zip and holds them to the same path rules as the tree. *(v1.0)*
4. **Structured data escapes its strings, and a rule anchored on quotes misses what is inside.** In JSON a `key = "…"` arrives as `key = \"…\"`. The format rules need no quotes and still catch real keys; the name-shaped rules do not. Decoding JSON before reading it is a spec change owed — v1.0 does not do it.
5. **A rule that floods its first run is narrowed before it lands.** The card-number rule matched 8,903 times on its first quick sweep: float arrays inside HTML pass the Luhn check by chance. ID and card numbers are now read only in prose-like files, and never inside a decimal. *(v1.0)*
6. **Everything tracked is public, not only the scroll.** Scroll, ledger, board, batons and commit bodies all reach GitHub. So open findings are held in the owner checkout's `_ops/sentry/held/`, a folder that ignores itself; a run line carries a scope and a bare count; `allow.json` carries hashes, never values or paths. *(v1.0)*
7. **A safety gate fails closed.** The palace's commit-msg hook fails open, which is right for a hook that only annotates. A push gate that failed open would let a worktree older than the Sentry push unscanned, silently ([[Tool Builder]]). So the gate refuses when it cannot run and names `git push --no-verify` as the way through. gitleaks missing is only a warning — the Sentry's own rules still read every blob. *(v1.0)*
8. **npm's severity is not the Sentry's.** Most of the palace's packages are local dev tooling, and npm rates a build-time advisory as if it shipped. The Sentry reads npm one step down — critical is high, high is medium — so the public gate fails on what can hurt a reader. *(v1.0)*
9. **A hook covers one machine.** The push gate lives in this Mac's shared `.git/hooks`; a push from any other surface never meets it. GitHub's own push protection meets every push, so the hosting check reads whether it is on. *(v1.0)*

## From the first run on main — 2026-09-25 (deep sweep of b63b896b)

10. **The deps check was narrower than GitHub's.** It read two npm lockfiles with dev dependencies left out; the moment Dependabot was switched on it reported advisories across every manifest, dev tooling included. The hosting check now reads Dependabot's open alerts too, weighted the way the npm check is — a runtime critical is high, a runtime high is medium, development is at most medium — so the gate fails on what can reach a reader and still names the rest. *(v1.1)*

## From a deep sweep — 2026-09-27 (deep sweep of c80ff992)

11. **A count per manifest is not a work list, and a bot's pull request is not a fix until its lockfile says so.** This sweep folded Dependabot's alerts into one finding per manifest — enough to say how much was open, not which package, which advisory, or which version closes it; that had to be read off GitHub by hand. And a Dependabot pull request's title names the version it moves to, while only its lockfile says what installs; the two can disagree, and a merge taken on the title closes nothing. So the hosting check now raises each open alert on its own, with a fingerprint that holds as long as the alert does, and reads each open Dependabot npm pull request's lockfile at its head, raising one that lacks the version its title claims. *(v1.2)*

## From the door's plan — 2026-10-14 (GitHub's guard on main)

12. **The one guard against rewriting main that lives off this Mac comes off on purpose, and can stay off.** On this Mac nothing stands in the way of a forced push but the habit of pushing through `palace-push`, which only ever sends a fast-forward; whenever GitHub's guard is off, a plain `git push --force`, from any checkout or any other machine, rewrites main. On 2026-10-14 Loudon turned on a GitHub ruleset that refuses a force push to main and its deletion, with no bypass ([[Worktree Practice — spec — the door]]). Closing a leak in public history needs exactly that force push, so the guard comes off for one push and has to go back on. The hosting check now reads the rules GitHub enforces on main. It raises at medium a force push that gets through, or a force-push guard that anyone who can push may bypass: the account `gh` is logged in as, which every session pushes as, a deploy key or app listed as a bypass, or people classic protection still lets force push. It raises at low a guard it cannot read, main no longer being the default branch, and, once main is not the default, a deletion that gets through or a deletion guard that can be bypassed. It covers main only: tags and other branches are neither guarded nor checked. *(v1.3)*

## From the door-health sweep — 2026-10-17

13. **A check that runs only when someone asks cannot catch a guard switched off.** Anyone who pushes as Loudon can also remove GitHub's guard on main, and the hosting check had not run for two days when the sweep looked. So the heartbeat now runs `guard-watch.mjs` once a day when the Mac is awake: the hosting check's own read of the guard, a few seconds, raising a notification when a force push could rewrite main, and looking again later when it cannot tell. *(v1.4)*

14. **A message is as public as a file, and nothing read one.** Item 6 counts commit bodies among what reaches GitHub, yet the push gate read only blobs and paths, the history check blobs and every path ever tracked, and gitleaks reads patches, never a message. A key pasted into a commit message, a merge's own message, an annotated tag's notes or name, or a branch's name would have gone out unchecked. The door-health sweep read every message then waiting to go out with the Sentry's rules and found nothing; on 2026-10-18 all 2,231 commits and tags in history raised nothing either. Now each commit is read three ways and each tag two: its message in full as prose, its headers for credentials (a tag's name, an author line, and any signed tag a merge carries), and, for a merge, each carried tag's message for personal data and text aimed at agents. The gate also reads the names of the refs a push updates, for credentials. Both read objects as push sends them: `git replace` can show a scrubbed message while push sends the original, so the Sentry ignores replace refs. *(v1.5)*

## From the review of the message reads — 2026-10-18

15. **A tag reaches GitHub without a remote-tracking branch.** The history check judged a hit public when a branch under `refs/remotes` reached its commit, but git never fetches tags there. A pushed tag's message, or a commit only a pushed tag reaches, read as private: the most urgent hit looked like the least. Now the history check asks each remote for its tags once, and says `unknown`, never `no`, when a remote cannot be asked and a tag could still make the hit public. *(v1.5)*

16. **A masked number still gave itself away.** `mask()` kept a value's first eight characters, which for an ID number in a message or a file is eight of its nine digits. A number made of digits and separators now shows only its last two. *(v1.5)*

- run · 2026-09-25 · v0 · hand-run history scan, before the Sentry had a page · taught items 1–9
- run · 2026-09-25 · v1.0 · deep sweep of b63b896b, 7 raised, held locally · nothing new
- run · 2026-09-25 · v1.1 · public-surface gate of 9ef47639, 11 raised, held locally · nothing new
- run · 2026-09-26 · v1.1 · public-surface gate of 4d33744c, 7 raised, held locally · nothing new
- run · 2026-09-27 · v1.1 · deep sweep of c80ff992, 4 raised, held locally · taught item 11
- run · 2026-10-15 · v1.3 · sweep (hosting) of 3778f4a0, nothing raised · taught item 12
- run · 2026-10-16 · v1.3 · quick sweep of 118edcbc and a hand read of every ref, 2 raised, held locally · nothing new
- run · 2026-10-18 · v1.5 · deep sweep of 99b3cd14, 11 raised, held locally · nothing new

## From Loudon's word on review weight — 2026-10-18

17. **A review's weight should match the worst the check can raise.** The guard watch (item 13) went through three independent review rounds, about 36 agents and 3.6M tokens, for a check that never raises above medium. Loudon, 2026-10-18: "I think that is heavy." The same day the message reads (items 14 to 16, `76666850`) ran two rounds past their estimate of 8 to 14 agents (29, then 7, then a 15-agent rerun after a network loss), and he was not asked to run, trim or wait. No spec change: before a review round on the Sentry's own code, size it by the worst the check can raise, say its size, and ask. **The version stays v1.5.**

## A finding closed — 2026-10-23 (public history)

The first watch found a personal data export in public history: an account's data export carrying contact details, no credentials. Loudon chose to take it back. The history was rewritten and force-pushed on 2026-09-26. GitHub Support then deleted the pull-request refs that still held the old history, ran garbage collection, and cleared its cached views; on 2026-10-23 the old commits answered 404 under both the account's current and former names. The gate below read history clean and GitHub's guard on main back on. The finding is closed. No spec change; the version stays v1.6.

- run · 2026-10-24 · v1.6 · public-surface gate of 980706d1, 42 raised, held locally · nothing new

## From the closing of that finding — 2026-10-23

18. **A support ticket closed is not a purge done, and a watch deleted is not a watch.** GitHub Support closed ticket #4795359 on 2026-10-22 without acting on it: probably already addressed, it said. The daily watch that would have said otherwise had been deleted on 2026-10-05; its files stayed on disk, and that was taken for watching (the same trap as [[Closing Well — tuning]] item 50). What showed the purge was still open was a live read: the old commit still answered 200. A ticket's status and a watch's files had both stood in for checks that never ran. So a finding in public history is called closed only on a live read of GitHub made that day, never on a ticket's status or a watch's files. The page's closing rule now says so. *(v1.7)*

- run · 2026-10-24 · v1.7 · public-surface gate of 12a53da1, 13 raised, held locally · nothing new
