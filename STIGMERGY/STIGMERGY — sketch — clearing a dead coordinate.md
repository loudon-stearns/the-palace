---
title: "STIGMERGY — sketch — clearing a dead coordinate"
born: 2026-10-25
links:
  - target: "[[STIGMERGY]]"
    type: connects-to
    label: "workshop-for"
  - target: "[[STIGMERGY — baton — stale worktree on remainder]]"
    type: connects-to
    label: "drafted-for"
forward_vector: "I hold, verbatim, the stale-worktree session's draft for clearing the rich-face card's dead worktree coordinate (RETRACT and repost, or an amend event), until Loudon decides the route; then I am history."
---

# Clearing a dead worktree coordinate on an open card — a draft, not posted

From the session catching `stigmergy-stale-worktree-on-remainder-handoff-2026-10-25` (branch `claude/stale-worktree-remainder-4a8a3b`). Nothing below was written to the board.

## The card

`stigmergy-remainder-20261021T125648Z` (STIGMERGY, the rich-face pieces, OPEN) names the dead coordinate twice:

- `payload.worktree` = `{ branch: close/2026-10-13-handoffs, dir: /Users/loudonstearns/Documents/palace-close-2026-10-13, profile: docs }`. The folder is gone and so is the branch (`git branch --list 'close/*'` is empty). It isn't in the owner's `git worktree list` either.
- `payload.receiving_surface` = `"Claude Code, worktree close/2026-10-13-handoffs (/Users/…/palace-close-2026-10-13)"`. That's free text, but it still points at the same place.

## Why the wire has no clean way today

The fold (`handoff-model.mjs` `foldHandoffs`) reads three events: `handoff_ready`, `handoff_picked_up` and `handoff_closed`. Nothing changes a card's payload once it's posted, and the fold ignores every other type, `RETRACT` included. So the only routes that work today misuse a close or a claim:

1. **Partial close + remainder** (`close-handoff.mjs <id> --commit X --partial --remainder "<same move>"`). With this branch's fix it would drop the worktree and reset the surface. The dry run confirms it. But the close says "Landed part of the move in X", and nothing of the rich-face move has landed. The commit it cites would be this fix, which has nothing to do with the rich-face pieces. The board would be stating something false to clear one field. Not clean.
2. **The pre-v1.17 hack**: overload `handoff_picked_up` (legacy, no `lifecycle` marker, which the fold grandfathers as terminal) and repost. SCHEMA ratified `RETRACT` specifically to retire this hack.

## Recommended: RETRACT + repost, with the fold taught to honour RETRACT

`RETRACT` is ratified (SCHEMA — Reference §9 message types, v1.17). Its meaning: withdraw a message by adding a line, never editing one. It was ratified after a wrong-path `handoff_ready` had to be fixed with a repost. That's this case, with one difference noted below. The board has never carried a RETRACT, and no reader honours it yet.

**Code (small, on a branch):** in `foldHandoffs`, collect `type === 'RETRACT'` lines. A ready whose id is some RETRACT's `re` gets state `retracted`. It isn't shown and doesn't resolve as active, and `resolveCard` answers it like `closed` ("retracted — see <superseded_by>"). The app's `queue-model.js` needs the same rule, or the QUEUE deck keeps showing the card.

**The two lines, posted from the owner's board in this order:**

```json
{"schema_version":"1.0","id":"stigmergy-rich-face-pieces-handoff-<stamp>","ts":"<now>","session_id":"concierge-<…>","from":"STIGMERGY","to":"*","type":"BROADCAST","board":"GENERAL","health":{…stub…},
 "payload":{"kind":"handoff_ready","entry":"STIGMERGY","handoff_path":"STIGMERGY/STIGMERGY — baton — rich-face pieces.md","receiving_surface":"Claude Code (Mac)","move":"<the 20261021T125648Z move, verbatim>","note":"Reposts stigmergy-remainder-20261021T125648Z without its worktree: close/2026-10-13-handoffs (/Users/loudonstearns/Documents/palace-close-2026-10-13) is gone.","supersedes":"stigmergy-remainder-20261021T125648Z"}}

{"schema_version":"1.0","id":"retract-stigmergy-remainder-20261021T125648Z-<stamp>","ts":"<now>","session_id":"concierge-<…>","from":"STIGMERGY","to":"*","type":"RETRACT","board":"GENERAL","re":"stigmergy-remainder-20261021T125648Z","health":{…stub…},
 "payload":{"kind":"retract","reason":"Its worktree close/2026-10-13-handoffs is gone; the same move is reposted without it.","superseded_by":"stigmergy-rich-face-pieces-handoff-<stamp>"}}
```

The repost goes first, so the move is never off the board. This is the same order close-handoff uses for a remainder.

**The difference to decide (canon, not mine):** §9 says RETRACT is for a message "posted in error". This card wasn't posted in error. It went stale when the worktree was removed. Two honest options:

- Read "in error" as "wrong now", and say so in the `reason`.
- Or use a sibling event, say a `handoff_amended` REPLY with `payload.unset: ["worktree"]` that the fold applies over the ready's payload. That keeps the card's id and its claim history, but it's a new kind and needs a Schema Ceremony.

I recommend RETRACT + repost, because the kind already exists. Either way, the call belongs to Loudon and the Concierge.

## After either route

`list-handoffs.mjs` stops printing `→ worktree close/2026-10-13-handoffs (…)` for STIGMERGY. The rich-face baton file doesn't change, because its path is unchanged.
