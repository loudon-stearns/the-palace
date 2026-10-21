# pin-cdn — the diffs shown before the pins are written

What `node _ops/rich-face/pin-cdn.mjs` would write, captured 2026-10-21 for Loudon to see before any page is pinned (STIGMERGY — spec — rich-face pieces § 6, decision 3: only CDN pins get edited in a gathered proof, after he has seen the diff). The shelf they pin to is `_ops/rich-face/libs.json`.

- `pins.diff`: `--all --except _ops/loudon-live/design-system`, 57 tags in 35 pages, digest `7e91875caa65`.
- `design-system-pins.diff`: the five design-system pages, 6 tags, digest `eefadf0589d8`. That folder is Loudon's; offered, not written.

Each tag keeps its other attributes, takes the shelf's exact url (d3@7 → 7.9.0, plot@0.6 → 0.6.17, both proven to serve the same bytes as the loose spelling), and gains `integrity` and `crossorigin="anonymous"`. Proven on a throwaway palace: pinned d3, Plot, p5 and Tone load inside the sandboxed frames on the piece origin with no integrity or CORS error.

To write either after his yes: the same command with `--write <digest>`. If any page changed since, the digest differs and nothing is written; run it again and show the new diff.
