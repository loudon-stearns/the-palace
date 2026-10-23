---
title: "BLUELINE — baton"
born: 2026-07-04
links:
  - target: "[[BLUELINE]]"
    type: connects-to
    label: baton-for
forward_vector: "I carry the live move on BLUELINE's Aftermath Frame tool — from a working outline generator toward a swoosh that actually LEADS and gen-AI frames — across to a fresh Claude, waiting to be caught and deleted once the move is picked up."
---

# Baton: BLUELINE — the Aftermath Frame tool → a leading guide + gen-AI frames

## Move
The Aftermath Frame solver is now a **tool** (`proofs/session-11-outline/impact_tool.py`): one authored
ACTION → derived physics → an outline-inked frame + a manipulable `.blend`, with a named parameter
surface Loudon can steer. **The move now:** make the single-sweep flow guide actually **LEAD** the frame
(it is faint today), then carry the outline into the **gen-AI second pass** — the real target is
*consistent, beautiful gen-AI action frames*, outline as the fast-feedback seed a diffusion model layers on.

## Why this move matters
Loudon's stated goal is "**get the flow right — a strong single guide gen-AI can distinguish**." We shipped
the single-sweep arc (it replaced the vertical 5-line fan) and locked the debris look to his taste
(follow-arc, thinned, so the guide leads). But at the current default `guide-w 0.14` the swoosh reads
**faint** — it does not yet lead. That gap is the top of this baton: the guide is the spine of the whole
approach, and it isn't pulling its weight.

## Current state
- **The tool:** `impact_tool.py` — `--action chop|side|rising`, `--punch 0..1`, `--preset grounded|heroic|super`,
  `--spray arc|out`, `--density`, `--guide-w`, `--style outline|greybox`, `--plates 0|1`, `--save`, `--render`,
  and since 2026-10-13 `--guide-weight`, `--guide-rails`, `--rail-gap`, `--rail-side` (`3ac92372`).
  Locked frame-5 defaults, unchanged: `spray=arc · density=0.45 · punch=0.6 · guide-w=0.14`. With no new flags
  the chop frame is pixel-identical to `out/tool/chop_outline.png`. Named Blender collections
  (FIGURE/BLADE/TARGET/WOUND/DEBRIS/GUIDE) so the saved `.blend` is hand-manipulable. Saves the `.blend`
  **before** the flat-white render override touches materials. `contact_sheet.py` tiles a labelled range.
- **The look call:** frame 5 (follow-arc, thinned) — recorded in memory `feedback_blueline_aftermath_debris.md`
  and reproduced by `out/debris/d5_arc_thin.png`. The `contact_sheet.png`s show the range that got there.

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

## Tried and rejected (this session — don't re-walk)
- **Vertical 5-line speed fan** → replaced by ONE arc-following swoosh (reads as the swing, not as streaks).
- **Sampling the guide arc by `u`** → bunched near windup (the `u^2.5` accel); use **angle-uniform**
  `guide_dir(a)` — the guide shows the PATH, not the speed profile.
- **Guide at radius 1.24×Rc** → floated *above* the swing, invisible against debris; hug the blade at
  `R_CEN≈1.0` (Rc). Diagnosed with the `--diag` red-isolation mode in `single_sweep.py`.
- **Swoosh-only variation sweep** → barely moved the frame; **debris dominates** the composition, so vary
  the debris axis (`spray`/`punch`/`density`), not the guide, when exploring looks.
- **Physical fidelity (Cell-Fracture, forward dynamics)** → still the WRONG direction. Keep the 3D model
  simple + FAST to iterate; amplify only the *consequences*, never the motion.

## Next move
**BLUELINE is paused.** Loudon, 2026-10-13: "lets put this work aside for now. I need to rethink and reset
blueline." Nothing below starts until he comes back to it, and his reset may change the move itself.

When he does:
1. **His pick, full-size,** among the seven frames on `out/guide/contact_sheet.png`. If none leads, try a
   solid-black fill for the swoosh; that is untested.
2. **Set the default** to the pick, and re-run `--plates 1` at it.
3. **Update the memory note** `feedback_blueline_aftermath_debris.md`, which still says "gw 0.14".
4. **Give `side` a camera** off the swing plane, and render it again.
5. **Only then, the gen-AI pass,** per [[BLUELINE — Render Backend]] and [[Steer the Generator]]
   (rich-first/stylize-last). **The gen-AI render is RunPod and costs money — a quote and Loudon's yes before
   any pod.**

## Receiving environment
Same surface (Claude Code, Mac). **This baton and all the session-11 work live on `main`**, the 2026-10-13
guide experiment included. Catch it from the palace root `/Users/loudonstearns/Documents/The Palace`. If you
want isolation for a GPU or Blender build, branch a fresh worktree from `main`: `node _ops/worktree/new-worktree.mjs
--name feature/blueline-<slug> --profile blueline`. Blender **5.1.2** local for the solver (no GPU rent); studio
blends need **MPFB2 + Rigify** (installed). RunPod orchestrators and the Commons reaper exist (`_ops/commons`,
`_ops/runpod/agent_ns.py`) — but **quote before any paid pod**.

## Calibrations from this session
- **Loudon steers by looking at renders.** Show a range full-size, let him pick, *then* build around the
  pick. Don't accept a terse pick until you're sure he understood the question — he reversed "2"→"5" once
  the frames were shown full-size and re-explained. The informed, full-size pick is the real signal.
- **The look is settled: follow-arc debris, thinned, guide leading.** Not outward-splash, not a dense
  cloud. `punch` is the one energy dial (toward 1.0 only for a deliberate super-hit). Confirm before
  shipping any dense/splash look.
- **Motion real, consequences super-physical.** Never amplify the motion.
- **The target is consistent + beautiful gen-AI frames.** The outline is the fast seed, not the deliverable.

## Load these files first
1. `Projects/BLUELINE/proofs/session-11-outline/impact_tool.py` — the tool (this baton's subject).
2. `Projects/BLUELINE/proofs/session-11-outline/{single_sweep.py, debris_spread.py}` — the guide + debris
   prototypes the tool was distilled from (and `--diag` mode for guide placement).
3. memory `feedback_blueline_aftermath_debris.md` — the look call, in Loudon's words.
4. `The Aftermath Frame.md` — the concept + method.
5. `Projects/BLUELINE/BLUELINE — Motion and Flow.md` — the motion subsystem + the aftermath §.
6. `Steer the Generator.md` + `Projects/BLUELINE/BLUELINE — Render Backend.md` — the gen-AI target.

## On pickup (fixed — the catcher's checklist; do not rewrite per session)
*Identical in every baton. It rides along because the catching Claude loads the
baton and the entry, not this ceremony — so the catcher's obligations live where
the catcher will see them. Omit nothing here.*
A pickup has two beats: **claim** it when you catch it, **close** it when the move lands. The card stays visible in between — a claim that ages with no close is how a dropped baton (a "fumble") surfaces instead of vanishing. (A parent-entry baton that was never announced on the board has no card; skip the board posts — just remove the pointer and delete the file at close, step 8.)

**Catch it — claim:**
1. State the move back in one sentence. If you can't, the baton wasn't caught — stop and ask Loudon.
2. Check it may already be done before you commit to it. The baton is a snapshot from when it was written; the project may have moved past it. Re-read the parent entry and `git log` it since the baton's `born` date, and confirm the "Current state" the baton quotes still matches the file. For a board-announced baton, `node _ops/stigmergy/pickup-handoff.mjs <id>` prints exactly this reconciliation view — every commit that touched the entry since the baton posted — and then claims the card, so run it and read the list *before* you continue. If the move is already done, superseded, or no longer wanted, STOP — do not claim it; surface to Loudon, and if it plainly landed already, close it as a reconciler (step 7). A stale baton followed silently produces drift. (The auto-staleness heuristic is off by design — the freshness call is yours.)
3. If this baton or its board line is still uncommitted (authored on a surface that couldn't commit — e.g. Cowork), commit them first. That commit is the git archive step 8 relies on.
4. Claim it. For a board-announced baton (it shows in `list-handoffs`), the `pickup-handoff.mjs` from step 2 has already posted the claim (`handoff_picked_up`, `lifecycle: claim`) — the card moves to **CLAIMED (in flight)**; it does *not* leave the board. Leave the "Active Baton" pointer and the baton file in place for now — they come out at close, so a fumble mid-move never erases the work.
5. If the baton names a receiving-surface capability delta or a worktree coordinate, confirm it holds before relying on it — for a worktree, check `git worktree list` and recreate it (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`) if it is gone. A build that was supposed to run here but can't is a finding to report, not a failure to hide.
6. Act on the move, holding the calibrations above.

**Close it — when the move lands:**
7. Post the close. `node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>` retires the card — an explicit close is the *only* thing that clears it (done is never inferred). Cite the commit that landed the move: it makes the close a checkable claim, not a self-report. **Complete, or re-baton the rest:** if you finished the whole move, close plain; if you did only part, `--partial --remainder "<what's left>"` posts the leftover as a fresh `handoff_ready` so it reappears as open work. Never let "in the spirit of the original" quietly drop scope — a gap becomes a new baton, not silence.
8. Delete the baton file (git is its archive) and remove the "Active Baton" section from the parent entry. On a surface that can't delete (Cowork), remove the pointer and note "deletion pending." Steward batons are the exception — updated in place, never deleted or closed.
