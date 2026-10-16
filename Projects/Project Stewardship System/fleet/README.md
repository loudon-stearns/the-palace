---
title: "README"
born: 2026-10-16
links:
  - target: "[[Project Stewardship System]]"
    type: connects-to
    label: workshop-of
forward_vector: "I am the workshop where Project Stewardship System builds its fleet reading — a script that gathers every steward's record into one dataset, a written reading of it, and a dashboard of stewardship health — until the reading earns a steward of its own."
---

# fleet — the fleet-reading workshop

The workshop for the scroll's Plan move G: the script that reads every steward's record into one dataset, the written fleet reading, and the stewardship-health dashboard. Workshop, not house — make freely here.

## What is here

- `fleet-reading.mjs` — reads every steward's record (the registry, each runtime's `state.json` and `history.jsonl`, the live and archived board, each scroll, the cycle transcripts' cost lines, the heartbeat's last batch, the triage digest) into `fleet.json`, then builds the dashboard. Read-only outside this folder. It classifies with the lane's own helpers from `_ops/stigmergy/orchestrator/src/`, so it can't disagree with the PROJECTS deck.
- `dashboard.template.html` — the page, in the house dress (Graphite, Drafting in light mode), with the review layer inlined at build.
- `reading.json` — the written reading: the headline and the suggestions, in the page's own words. Rewritten by hand each reading.
- `fleet.json`, `Stewardship Health.html` — generated. Open the HTML in a browser; steward names open their scrolls in Obsidian.

Regenerate from the palace root: `node "Projects/Project Stewardship System/fleet/fleet-reading.mjs"`.

Reading 1 was hand-run on 2026-10-16 (Plan move G).
