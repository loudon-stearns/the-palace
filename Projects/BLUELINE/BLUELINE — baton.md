---
title: "BLUELINE — baton"
born: 2026-07-04
links:
  - target: "[[BLUELINE]]"
    type: connects-to
    label: baton-for
forward_vector: "I carry BLUELINE's reset, commissioned at the Daily Page of 2026-10-29: the bundle brought to current standards, a record that works at any tempo, the six boards finished, and the Aftermath Frame's open pick, waiting to be caught and deleted once the moves land."
---

# Baton: BLUELINE — the reset, after the Daily Page of 2026-10-29

## Move
Bring BLUELINE's bundle up to the standard its new face set, and make its record work at any tempo. BLUELINE woke again at the Daily Page of 2026-10-29, with Loudon's thesis back: build a song and tell a story in frames alongside it. The vector and the body were landed that morning; this baton carries the rest. It replaces the July Aftermath Frame baton: the pause that held that move is over, so its pick is item 7 here.

## Why this move matters
The face now says BLUELINE is a workflow and a hub, a page that connects the works that grew from it and watches what they need. Its bundle still says otherwise: no Context, a Production Plan whose name collides with the scroll's Plan, a scroll that doesn't know it woke, and a record that assumes 120 BPM. Loudon, 2026-11-03: "we must be able to use any arbitrary tempo." That is now a Standing Order on the scroll.

## Current state
- `Projects/BLUELINE.md`: new vector and hub-shaped body (2026-10-29, landed at the close).
- `BLUELINE — scroll.md`: Standing Orders carry **Any tempo** (2026-11-03); the old "beats falling on whole frames" is marked superseded, not deleted. Now and Plan are untouched.
- The morning's cut: `proofs/2026-10-29-daily-page/` holds the notes, a board-by-beat timing table for both cuts, and `make_cuts.py` (the song is an argument). The cuts themselves stay on the Mac that made them, because the song is unreleased. Loudon picked cut 1, the Set's own 127 grid; cut 2, the record's 120, lands about a second early.
- The standards read behind the items below is the Concierge's checklist of 2026-10-29, relayed in the sit; its citations are in the morning's commit body.

## Next move — the items, roughly in order
1. **Done 2026-11-04, in `59deaa22`** (the move in `793a4f91`): [[BLUELINE — Context]] written; the Production Plan archived under its own name, its threads and proofs a dated trail entry on the scroll, its links cut or retargeted. Still open from it: the scroll Plan's opening sentence names the Production Plan; its replacement waits on Loudon's word. *As it was:* **A Context, grown from the Production Plan.** `BLUELINE — Context.md`: why the page is shaped as it is. Take the Plan's origin rationale (§7), what Specialists and Seams settled, the dated reframe asides cut from the body on 2026-10-29, and the "two AIs, opposite risk profiles" section the body dropped (the body before the 2026-10-29 edit: `git log -p -- Projects/BLUELINE.md`). Then decide what is left of the Production Plan: status belongs to the scroll's Now, proofs placed to the scroll's trail. Its name should stop colliding with the Plan.
2. **Done 2026-11-04, in `e40fa50b`:** Now regenerated and no longer reads as paused (active, plan agreed today, nothing waiting); its "Where this stands" still shows the last shipped board message, from 2026-06-21, until something new ships. The Plan's opening now points to the trail and the Context. A plan_revision for the stale moves (the cut with sound, the tempo map) is drafted and waits on Loudon's yes. *As it was:* **The scroll made true to "awake".** Now's on-disk copy dates from 2026-09-25 and Now does not read the baton; regenerate it and check it no longer reads as paused. The Plan's moves predate the reset; any change to them is a `plan_revision` on Loudon's yes.
3. **Done 2026-11-04, in `e525be9c` and `41d2d8a7`:** Specialists and Seams in `Archive/`; `render-backend/PLAN.md` is its folder's `README.md`; `flow-field-spine.md` folded into [[The Flow Field is the Spine]] § The recipe, without its two claims about the projection's result (that entry's rich-face offers 3 and 4 hold them for Loudon); the two face folders already meet the face standard, so they are unchanged. *As it was:* **The bundle moves.** `BLUELINE — Specialists and Seams.md` to `Archive/` (it calls itself folded). `flow-field-spine.md` renamed to `BLUELINE — sketch — flow-field-spine.md`, or folded into [[The Flow Field is the Spine]]. The hero/icon folders `BLUELINE — Render Backend/` and `BLUELINE — Text Layer/` (a bundle folder pairs with an entry; decide whether either wants to be one — Text Layer is 30 KB). `render-backend/PLAN.md` renamed, so it isn't read as a second Plan. Each move names both sides to the committer.
4. **The Board Record Schema, on the Set's tempo map.** `BLUELINE — Board Record Schema.md` assumes 120 BPM and 12 frames a beat. Make the record read the Set's full tempo map, its tempo changes and its meter changes, not one tempo (Loudon, 2026-11-04: "Our focus on set tempo was used to avoid the complexity, we can move past that now and bring in the full expressive capability of tempo changes."). Place each cut at the nearest frame of its absolute time, rounded once, so nothing accumulates drift; with a tempo map, absolute time is the sum over the tempo segments before the beat, not beat × 60 / BPM. `make_cuts.py` does the single-tempo case. Not edited on 2026-10-29 by Loudon's word; this is where it goes. Item 8 is its natural source.
5. **The shared finish over the six boards.** The woken page asked for one finish across the six boards and a cut with sound (plan move 5). The morning made the cut with the boards as they were; the finish is still owed.
6. **Done 2026-11-04, in `59deaa22`:** BLUELINE's `emerged-from` link to Graphic Storytelling cut (the lineage back is not direct); Frame Designer and Hand-Drawn 3D Look keep both links. *As it was:* **The link pairs, once [[Graphic Storytelling]]'s revision lands.** Three pairs carry links both ways: Graphic Storytelling (`enables` in, `emerged-from` out), [[Frame Designer]] and [[Hand-Drawn 3D Look]]. Keep a reciprocal only where the lineage is direct (one link per pair, the Weave's Step 3d).
7. **The Aftermath Frame's guide pick.** His full-size pick among the seven frames on `proofs/session-11-outline/out/guide/contact_sheet.png` (or a solid-black fill, untested); set the default to it and re-run `--plates 1`; update the memory note `feedback_blueline_aftermath_debris.md` ("gw 0.14"); give `side` a camera off the swing plane; only then the gen-AI pass, per [[BLUELINE — Render Backend]] and [[Steer the Generator]]. **A RunPod run costs money: a quote and Loudon's yes before any pod.** The tool's state:

**2026-10-13 — the guide experiment, landed unjudged** (`3ac92372`, `93abb7af`, merged in `4277dfdb`). Loudon
set BLUELINE aside before making a pick.
- **Seven chop frames** on `out/guide/contact_sheet.png`, with the full-size PNGs beside it. Tiles 1–5 are
  guide-w 0.14 (today's control), 0.20, 0.24, 0.28 and 0.32. Tile 6 is 0.20 with `--guide-weight 2.0`. Tile 7 is
  0.20 with `--guide-rails 2 --rail-side in`.
- **The worker's read, not Loudon's:** width alone does not make the guide lead. The ribbon renders hollow from
  the flat-white fill, and above 0.14 its outer edge runs into the column and hides. The worker leaned to tile 6.
- **`side` and `rising`**, each rendered at 0.14 and 0.20 (`out/actions/`). `rising` reads well. `side` doesn't:
  its camera sits almost in the swing plane, so the guide collapses into the wake dust. It needs a new camera,
  not a wider guide.
- **Real conditioning plates** from `--plates 1`, chop at the defaults (`out/plates/`):
  - depth, its range fitted to the subject in each frame, with the guide hidden;
  - canny, from the Freestyle edges at 1 px;
  - a geometric OpenPose plate projected from the armature and drawn with a numpy copy of controlnet_aux's
    `draw_bodypose` (14 of 18 keypoints; the face is turned away), plus `chop_keypoints.json`.
  None has been fed to a ControlNet yet.
- Blender 5.1.2 confirmed at both install paths. Nothing touched a GPU pod or a gen-AI model.
- **Not yet:** a pick, so no new default · `side` with a usable camera · any gen-AI pass.

8. **The look at Loudon's separate Ableton-session parsing work (private; tools and techniques only).** In a session of its own, read how it parses a Set and what it learns from one, and bring only the tools, concepts and techniques here — Loudon: "the tools and concepts and techniques developed there absolutely can be applied here." No detail of that work goes into any page or commit. It is the natural source for item 4's tempo map, and now central to it (Loudon, 2026-11-04).

When a pod script next runs, move it onto the resolver, `_ops/commons/runpod_config.py`, which knows where the RunPod key lives and falls back to the primary checkout. Eleven BLUELINE readers still find the key their own way: the ten pod and serverless orchestrators under `Projects/BLUELINE/proofs/` and `render-backend/serverless_runner.py`. Each points at the right path today, and each can only be proven with a live pod, so move it when it runs, not before. (Folded in from the Palace To-Do at its retirement, on Loudon's call of 2026-10-25.)

## Tried and rejected (the Aftermath Frame, item 7 — don't re-walk)
- **Vertical 5-line speed fan** → replaced by ONE arc-following swoosh (reads as the swing, not as streaks).
- **Sampling the guide arc by `u`** → bunched near windup (the `u^2.5` accel); use **angle-uniform**
  `guide_dir(a)` — the guide shows the PATH, not the speed profile.
- **Guide at radius 1.24×Rc** → floated *above* the swing, invisible against debris; hug the blade at
  `R_CEN≈1.0` (Rc). Diagnosed with the `--diag` red-isolation mode in `single_sweep.py`.
- **Swoosh-only variation sweep** → barely moved the frame; **debris dominates** the composition, so vary
  the debris axis (`spray`/`punch`/`density`), not the guide, when exploring looks.
- **Physical fidelity (Cell-Fracture, forward dynamics)** → still the WRONG direction. Keep the 3D model
  simple + FAST to iterate; amplify only the *consequences*, never the motion.

## Calibrations
- **"Hub" is the everyday sense.** A page that connects to many works, supports them by connecting them logically, and observes and responds to their needs. `type` stays `project`.
- **A vector is the lean; the Plan is the route; Standing Orders are the fences.** Don't put a plan in the vector.
- **The Set sets the clock.** Read tempo and sections from the Set, never from a number in a record.
- **Loudon steers by looking and listening.** Show a range full-size, or play it, let him pick, then build around the pick.
- **Unreleased music stays off the palace.** The repo is public: no song audio, no private paths or addresses in a tracked file.

## Load these files first
1. `Projects/BLUELINE.md` and `Projects/BLUELINE/BLUELINE — scroll.md`.
2. `Projects/BLUELINE/BLUELINE — Context.md` — why the page is shaped as it is (the Production Plan is archived in `Archive/`).
3. `Projects/BLUELINE/proofs/2026-10-29-daily-page/` — the cut notes, timing and script.
4. `Projects/BLUELINE/BLUELINE — Board Record Schema.md` — item 4.
5. `SCHEMA — Reference.md` §8 — the bundle kinds and names.
6. For item 7: `proofs/session-11-outline/impact_tool.py` and `The Aftermath Frame.md`.

## On pickup` heading down is appended verbatim to the baton; this note is not. Edit here,
     nowhere else — a second copy is how this drifted before (2026-07-07 → 2026-08-26). -->

## On pickup (fixed — the catcher's checklist; do not rewrite per session)
*Identical in every baton. It rides along because the catching Claude loads the
baton and the entry, not this ceremony — so the catcher's obligations live where
the catcher will see them. Omit nothing here.*
A pickup has two beats: **claim** it when you catch it, **close** it when the move lands. The card stays visible in between — a claim that ages with no close is how a dropped baton (a "fumble") surfaces instead of vanishing. (A parent-entry baton that was never announced on the board has no card; skip the board posts — just remove the pointer and delete the file at close, step 8.)

**Catch it — claim:**
1. State the move back in one sentence. If you can't, the baton wasn't caught — stop and ask Loudon.
2. Check it may already be done before you commit to it. The baton is a snapshot from when it was written; the project may have moved past it. Re-read the parent entry and `git log` it since the baton's `born` date, and confirm the "Current state" the baton quotes still matches the file. For a board-announced baton, `node _ops/stigmergy/pickup-handoff.mjs <id>` prints exactly this reconciliation view — every commit that touched the entry since the baton posted — and then claims the card, so run it and read the list *before* you continue. If the move is already done, superseded, or no longer wanted, STOP — do not claim it; surface to Loudon, and if it plainly landed already, close it as a reconciler (step 7). A stale baton followed silently produces drift. (The auto-staleness heuristic is off by design — the freshness call is yours.)
3. If this baton or its board line is still uncommitted, commit them first. That commit is the git archive step 8 relies on.
4. Claim it. For a board-announced baton (it shows in `list-handoffs`), the `pickup-handoff.mjs` from step 2 has already posted the claim (`handoff_picked_up`, `lifecycle: claim`) — the card moves to **CLAIMED (in flight)**; it does *not* leave the board. Leave the "Active Baton" pointer and the baton file in place for now — they come out at close, so a fumble mid-move never erases the work.
5. If the baton names a receiving-surface capability delta or a worktree coordinate, confirm it holds before relying on it — for a worktree, check `git worktree list` and recreate it (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`) if it is gone. A build that was supposed to run here but can't is a finding to report, not a failure to hide.
6. Act on the move, holding the calibrations above.

**Close it — when the move lands:**
7. Post the close. `node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>` retires the card — an explicit close is the *only* thing that clears it (done is never inferred). Cite the commit that landed the move: it makes the close a checkable claim, not a self-report. **Complete, or re-baton the rest:** if you finished the whole move, close plain; if you did only part, `--partial --remainder "<what's left>"` posts the leftover as a fresh `handoff_ready` so it reappears as open work. Never let "in the spirit of the original" quietly drop scope — a gap becomes a new baton, not silence.
8. Delete the baton file (git is its archive) and remove the "Active Baton" section from the parent entry. Steward batons are the exception — updated in place, never deleted or closed, until their page ends and the steward leaves stewardship.
