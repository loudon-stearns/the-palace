---
title: "Baton Ceremony — Context"
aliases:
  - Handoff Ceremony — Context
born: 2026-05-28
forward_vector: "I will keep holding the design decisions and open tensions behind the Baton Ceremony so the card can stay lean and the why is never fully lost."
links:
  - target: "[[Baton Ceremony]]"
    type: connects-to
    label: context-of
---

# Baton Ceremony — Context

History, rationale, and design notes for [[Baton Ceremony]]. Read during Weaves or when revisiting the why — not during routine executions.

---

## Register: Fast vs. Slow

The Baton is fast where the Deposit is slow. A deposit slows down because there is a thought to compress; a baton is urgent because there is momentum to preserve. Both ceremonies share the show-before-write rhythm, but the registers differ — the deposit is archival and reflective, the baton is operational and forward-leaning.

## Pace Obligations — Rationale

The card's pace obligations exist because the baton genre is inherently tempted toward bloat: an outgoing Claude, aware it will not finish, often over-explains. The three rules (do not bloat, single show-and-confirm, no baton if the entry alone is sufficient) are a structural resistance to that temptation — not preferences, but design commitments.

## Forward Vectors

- The resumption protocol the first forward vector once asked for now exists in the card. The open part: should the "state the move back" step ever harden into a gate for high-stakes moves, or always stay the light confirmation it is now?
- The § Where the Baton Lives section names several shapes observed so far — framed as an open set, not a closed five. Do they want distinct templates, or is one flexible template plus a shape label enough? The cross-surface paste-prompt in particular reads like a prompt, not an entry companion, and may want its own skeleton.
- Should the [[Maker]]'s host-capability manifest (`Shop/Maker/host-capability.json`) feed a cross-surface baton's receiving-environment section, so it can be generated rather than hand-written?
- Multiple parallel batons on a single entry — [[SCHEMA]] §8 is silent on this. Does the bundle pattern want to enforce one active baton per entry, or permit branching?

## The Version and the Tuning File (2026-09-25)

Versioned **v1.0** with the remaining ceremonies: the card as it stood that day — three-state lifecycle, the footer's one home, the cold-start variant — plus the opening read. It marks where counting starts, not a ranking of what came before. The number moves when the procedure does — a step, the footer, a completion signal — never for prose. The eight lessons that built the card, from the footer that travels in the artifact to the linter that keeps it from drifting, are numbered in [[Baton Ceremony — tuning]]; each baton's commit names the version and says what the run taught.

## Moved from the card (2026-10-25)

The card's history and rationale, moved here word for word on 2026-10-25 so the card carries its steps; each heading names where the words stood on the card.

### From the opening, under the title

*Formerly the Handoff Ceremony. The **baton** is the file this ceremony generates — the thing that gets passed. "Handoff" is a secondary, looser name; see § Trigger for how to tell an official baton from a casual handoff.*

### From Step 2: Draft the baton, the note on the On-pickup section

The catcher reads only the baton, never this spec, and `_ops/closing-well/baton-executor.mjs` writes batons too, so one file read at write time keeps every copy alike.

### From Step 6: Delete when the move lands

This is the one beat the three-state lifecycle moved: a catch posts a claim and changes nothing on disk, so the pointer and the file both survive a fumble.

### From Announcing the Baton on the Board, its italic preface

*Load-bearing for everything once a scheduler exists.*

### From Announcing the Baton on the Board, its first paragraph

A baton filed in a bundle is invisible to everything but a human who knows to go read it.

### From Announcing the Baton on the Board, the convention

The wire field keeps its `handoff_ready` name for protocol stability even though the ceremony is now named for the baton — the palace lets categories prove themselves before hardening, and renaming a live wire field is a separate decision (see [[Speak Like a Person, Log Like a Protocol]]).

### From Announcing the Baton on the Board, the pairing

This mirrors the inbox-builder logic already used for resource requests (§2.6), so a future scheduled poller — or Loudon scanning `GENERAL` — reads the open batons with the same scan that finds open asks.

### From Announcing the Baton on the Board, the honest limit

**The honest limit.** Until the scheduled dispatch of Stage C exists, this post is for *visibility* — it surfaces the ready baton on the board for Loudon, but a human still triggers the pickup. The post is the trail; the scheduler is the ant. Announcing now is still worth it: it builds the convention and the board history that the scheduler will later read. See [[Two Batons, One Board]] § The board is a pheromone field, not an actuator.
