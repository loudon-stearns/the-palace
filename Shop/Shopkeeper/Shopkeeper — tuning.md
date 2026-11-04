---
title: "Shopkeeper — tuning"
born: 2026-11-03
links:
  - target: "[[Shopkeeper]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Shopkeeper's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Shopkeeper about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Shopkeeper — tuning

What Shopkeeper's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-11-03, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 4 — 2026-11-03

1. Two flagship HF demo Spaces in a row (Drama-3 last cycle, LightOnOCR-3 this one) ship as fully custom front-ends with no standard component API — gradio_client and the HF connector's own dynamic_space invoke both miss them the same way. When a Space's /config shows one html component and multiple parameterless handlers, that's the signature: stop probing the Space itself and go straight to a mac/browser pass or the model's own Inference API. *(offered by the steward, cycle 4)*
- run · 2026-11-03 · cycle 4 · taught item 1

## From cycle 5 — 2026-11-03

2. A Space's broken API surface can be the wrong thing to blame — check the model's own README for a free hosted inference route before assuming the demo's front-end is the only wall; some models simply have no free leg at all, no matter which client tries to reach them. *(offered by the steward, cycle 5)*
- run · 2026-11-03 · cycle 5 · taught item 2

## From cycle 6 — 2026-11-03

3. When a candidate's only real paths are 'load the weights yourself' or 'serve it yourself,' no amount of smarter sandbox tooling will reach it — the fix is a GPU, and the honest move is to cost one out and ask, not to keep retrying the free side. *(offered by the steward, cycle 6)*
- run · 2026-11-03 · cycle 6 · taught item 3

## From cycle 7 — 2026-11-03

4. A spending grant doesn't imply the credentials to spend it — check for the actual account/API access before costing out a plan that assumes it, the same way cycle 5 learned to check the model's README before blaming the Space. *(offered by the steward, cycle 7)*
- run · 2026-11-03 · cycle 7 · taught item 4

## From cycle 8 — 2026-11-03

5. A cycle that can't find a credential should check the Shop's own established gitignored-config pattern (per-Specialist, in its bundle) before concluding none exists — the environment and a CLI binary aren't the only places a key lives here. *(offered by the steward, cycle 8)*
- run · 2026-11-03 · cycle 8 · taught item 5

## From cycle 9 — 2026-11-04

6. Runpod's REST API 403s with Cloudflare error 1010 under Python's default urllib User-Agent — it needs a browser-style User-Agent header to pass; this applies to any future Specialist or probe calling rest.runpod.io directly, not just this one. *(offered by the steward, cycle 9)*
- run · 2026-11-04 · cycle 9 · taught item 6

## From cycle 10 — 2026-11-04

7. A Runpod pod's REST status can read RUNNING well before the server process inside it is actually listening — there's no /logs endpoint on rest.runpod.io (confirmed 400), so the only free signal for 'is it really up yet' is polling the service port itself and reading a 404 from the proxy as 'booting,' not 'broken.' *(offered by the steward, cycle 10)*
- run · 2026-11-04 · cycle 10 · taught item 7

## From cycle 11 — 2026-11-04

8. A rented GPU pod's REST status reading RUNNING is not proof the service inside it is healthy — once a pod goes past its expected boot window with no logs endpoint and no terminal access, the only safe move from a sandbox is to kill it rather than let an unexplained hang keep billing. *(offered by the steward, cycle 11)*
- run · 2026-11-04 · cycle 11 · taught item 8

## From cycle 12 — 2026-11-04

9. Runpod's REST API needs `dockerStartCmd` (string array) and `env` (object), not the free-form `dockerArgs` string I guessed at — and Secure Cloud can be out of capacity for an entire GPU priority list at once, where Community Cloud still has room. *(offered by the steward, cycle 12)*
- run · 2026-11-04 · cycle 12 · taught item 9
