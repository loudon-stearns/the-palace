---
title: test-plan
born: 2026-11-15
links:
  - { target: "[[Rich-face Kit]]", type: connects-to, label: test-plan-for }
forward_vector: "I hold the test plan for the Rich-face Kit; I want every check here to be runnable and to record an honest last-run date."
---

# Rich-face Kit — Test Plan

Last run: **2026-11-15**, the two proofs below at the page's birth.

## Smoke

```sh
node _ops/rich-face/conform.mjs "Shop/Tone.js/proofs/2026-11-14-card-check/Tone.js — proof — starter.html" --browser
node _ops/rich-face/check-hidden-hush.mjs
node _ops/rich-face/check-time-cap.mjs
```

Pass: conform reports 0 errors; the two kit checks exit 0. Conform ran clean on all six starters on 2026-11-14; the two kit checks were not re-run on 2026-11-15.

## Open tests — from the card, 2026-11-15

- **The checker cannot check a piece that declares a file or a need** (ledger item 1). Test: frame each declaring piece on a piece origin by its plan, as `proofs/2026-11-15-second-file/check.mjs` does. Script only. Status: shown for one piece; conform itself still frames opaque. Open, a tool change.
- **A second file heard on Loudon's own scroll.** Test: `proofs/2026-11-15-second-file/second-file.html` on the kit's scroll in STIGMERGY; both buttons should sound alike. Needs Loudon's ear. Status: proof made 2026-11-15, headless pass; not heard.
- **Which newer features reach a piece in Loudon's own browser.** Test: `proofs/2026-11-15-frame-features/frame-features.html` on the scroll. Needs Loudon's eye (his Chrome, not headless). Status: proof made 2026-11-15; headless results in its `measured.json`.
- **No phone, Firefox or Safari has run a piece through the kit.** Test: open a starter's scroll on each. Needs Loudon's devices. Open.
- **The enforce switches are off.** Not a test: Loudon's call (`conform.json`). Open.
- **A maker's own way against a starter's.** Test: whenever a maker goes past a starter, the two side by side on this scroll. Open; none yet.
