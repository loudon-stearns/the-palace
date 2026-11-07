---
title: "BLUELINE — baton"
born: 2026-07-04
links:
  - target: "[[BLUELINE]]"
    type: connects-to
    label: baton-for
forward_vector: "I carry the remainder of BLUELINE's reset: the board record on the Set's tempo map, the six boards finished and cut again, the Aftermath Frame's guide pick, and what Loudon's separate Set-parsing work can teach; I wait to be caught, and am deleted once the last of it lands."
---

# Baton: BLUELINE — the reset's remainder

## Move
Finish BLUELINE's reset. Four things are left: review the steward's tempo map and land the board record's clock edit, give the six boards one finish and cut them to the song again, make the Aftermath Frame's guide pick, and learn from Loudon's separate Set-parsing work. The bundle, the scroll, the Context and the link pairs were done on 2026-11-04; the steward built the tempo map on 2026-11-05.

## Why this move matters
BLUELINE tells a story in frames alongside a song, and the Set's own clock places every panel. Loudon, 2026-11-04: "Our focus on set tempo was used to avoid the complexity, we can move past that now and bring in the full expressive capability of tempo changes." Until the record reads a Set's tempo map, it still assumes one tempo (120 BPM, 12 frames a beat), and every cut made from it inherits that.

## Current state
As of 2026-11-07, landed on main:
- `Projects/BLUELINE.md`: a hub-shaped body; the Scope line reads "Any tempo, tempo changes included" (`59deaa22`).
- [[BLUELINE — Context]] holds why the page is shaped as it is; the Production Plan is in `Archive/`, and its thread and proof maps are a dated trail entry on the scroll (`793a4f91`, `59deaa22`).
- The scroll: Now no longer reads as paused (`e40fa50b`). The Plan has a new move 5, put the record on the Set's tempo map, before move 6, level the six boards and cut again (`db48fe7d`); its opening counts seven ready to build (`dece9cec`). Standing Orders: "Any tempo, synced exactly", tempo changes within a Set included (2026-11-04).
- The bundle: Specialists and Seams archived, `render-backend/README.md` (was `PLAN.md`), `flow-field-spine.md` folded into [[The Flow Field is the Spine]] (`e525be9c`, `41d2d8a7`); that page's Session 4 claim corrected (`6acb87e2`). The two face folders already meet the standard.
- Link pairs: BLUELINE's `emerged-from` link to Graphic Storytelling cut; Frame Designer and Hand-Drawn 3D Look keep both (`59deaa22`).
- The cut of 2026-10-29: `proofs/2026-10-29-daily-page/` holds the notes, a board-by-beat timing table and `make_cuts.py`, which places cuts at a single tempo. The cuts themselves stay on the Mac that made them, because the song is unreleased. Loudon picked cut 1, on the Set's own grid.
- The tempo map, built by BLUELINE's steward on 2026-11-05 (cycles 1 and 2, `2980ecfb`, `5426e608`): `tempo-map/` holds a reader of a Set's whole clock (`tempo_map.py`), a cutter on that clock (`cut.py`), their tests, and a demo. It was built from a generated demo Set with no song in it (`demo-set.als`) and the palace's own Set tools, not from item 4's work. The steward wrote only its workshop, the scroll and its tuning ledger; `BLUELINE — Board Record Schema.md` is unchanged. Its proposed clock edit is `BLUELINE — tuning` item 2, owed until Loudon's ledger review, with the full text in `tempo-map/clock-section-draft.md`. Unproven, per `tempo-map/README.md`: nobody has opened `demo-set.als` in Live, so the ramp and the 7/8 and 3/4 encoding are unchecked; the cutter has never run on the real song.

## Next move — the remainder, roughly in order
1. **Loudon reviews the steward's tempo map, and the Board Record Schema's clock edit lands.** `BLUELINE — Board Record Schema.md` still assumes 120 BPM and 12 frames a beat. The record should read the Set's full tempo map, its tempo changes and its meter changes, not one tempo, and place each cut at the nearest frame of its absolute time, rounded once, so nothing accumulates drift; absolute time is the sum over the tempo segments before the beat, not beat × 60 / BPM. The steward's `tempo-map/` does this and its draft says it. **One route:** the steward's proposal, `BLUELINE — tuning` item 2, and this item are the same edit; it is settled at Loudon's ledger review, not landed twice. Bring him the reader and its proof page to look at and listen to first. This is plan move 5.
2. **The shared finish over the six boards.** One finish across the six boards, then the cut again, on the tempo map once item 1 holds. The cut of 2026-10-29 was made with the boards as they were. The steward's six-board cut (`tempo-map/cut.py` over `demo-set.als`, `demo-six-boards.txt`) is a demo of the cutter on a demo clock, not the finished boards; its MP4 stays on the Mac. This is plan move 6.
3. **The Aftermath Frame's guide pick.** His full-size pick among the seven frames on `proofs/session-11-outline/out/guide/contact_sheet.png` (or a solid-black fill, untested); set the default to it and re-run `--plates 1`; update the memory note `feedback_blueline_aftermath_debris.md` ("gw 0.14"); give `side` a camera off the swing plane; only then the gen-AI pass, per [[BLUELINE — Render Backend]] and [[Steer the Generator]]. **A RunPod run costs money: a quote and Loudon's yes before any pod.** The tool's state:

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

4. **The look at Loudon's separate Ableton-session parsing work (private; tools and techniques only).** In a session of its own, read how it parses a Set and what it learns from one, and bring only the tools, concepts and techniques here — Loudon: "the tools and concepts and techniques developed there absolutely can be applied here." No detail of that work goes into any page or commit. It is the natural source for item 1's tempo map, and now central to it (Loudon, 2026-11-04).

When a pod script next runs, move it onto `_ops/commons/runpod_api.py`, the one module that speaks Runpod, which finds the key through `_ops/commons/runpod_config.py` with no path given; how Runpod works now is in [[RunPod GPU Backend — runbook]] (`e4cdef4a`, `c6294b69`). Two BLUELINE scripts moved on 2026-11-07: `proofs/new-story/balloon_pod_orchestrator.py` and `proofs/track-VI-elemental-motion/lib/pod.py`. Nine still spell the key's path themselves: six pod orchestrators that hand it to the pod provider (`cloud-i2v/svd_orchestrator.py`, `m3-warped-noise/flux_orchestrator.py`, `m3_pod_orchestrator.py`, `sdxl_orchestrator.py`, `new-story/pose_pod_orchestrator.py`, `style-lock/instantid_orchestrator.py`), `track-VI-elemental-motion/lib/fluxcn.py` and `test_serverless_cn.py`, and `render-backend/serverless_runner.py`. Each points at the right path today, and each can only be proven with a live pod, so move it when it runs, not before. (Folded in from the Palace To-Do at its retirement, on Loudon's call of 2026-10-25.)

## Tried and rejected (the Aftermath Frame, item 3 — don't re-walk)
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
- **The Set sets the clock.** Read tempo and sections from the Set, never from a number in a record. Its tempo changes and meter changes too (Loudon, 2026-11-04).
- **Loudon steers by looking and listening.** Show a range full-size, or play it, let him pick, then build around the pick.
- **Unreleased music stays off the palace.** The repo is public: no song audio, no private paths or addresses in a tracked file.

## Load these files first
1. `Projects/BLUELINE.md` and `Projects/BLUELINE/BLUELINE — scroll.md`.
2. `Projects/BLUELINE/BLUELINE — Context.md` — why the page is shaped as it is (the Production Plan is archived in `Archive/`).
3. `Projects/BLUELINE/proofs/2026-10-29-daily-page/` — the cut notes, timing and script.
4. `Projects/BLUELINE/BLUELINE — Board Record Schema.md`, `BLUELINE — tuning.md` item 2 and `tempo-map/README.md` — item 1.
5. `SCHEMA — Reference.md` §8 — the bundle kinds and names.
6. For item 3: `proofs/session-11-outline/impact_tool.py` and `The Aftermath Frame.md`.

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
