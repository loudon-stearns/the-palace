---
title: "The Aftermath Frame — rich — challenge"
born: 2026-11-03
links:
  - target: "[[The Aftermath Frame]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of The Aftermath Frame's first rich face: every piece judged with a reason, every offer rebuilt from BLUELINE's own files before it was confirmed, and the one place the face's finding belongs to BLUELINE rather than to this page."
---

# The Aftermath Frame — rich — challenge

Challenger · claude-opus-5-5 · 2026-11-03 · on the maker's commit `f9e85566`. I did not make this face.

## What I ran

- `node "The Aftermath Frame — rich — checks.mjs"`: every line as stated, "every check came out as stated".
- My own recompute, numpy, from BLUELINE's files and not from the pieces: `proofs/session-8-swing/build_swing.py:29-41`, `proofs/session-9-three-swings/build_swings.py`, `proofs/session-10-impact/build_impact.py:142-163`, `proofs/session-11-outline/impact_tool.py:68-157`. Column, contact, pivot, windup, reach, time and exponent read from those lines.
- The maker's `tool check.py` re-run in Blender 5.1.2 (`/opt/homebrew/bin/blender -b --factory-startup`) on the tool's own code: the posed grip lands on the IK target (0.62, −0.05, 1.00), and every baked number in `POSED` and `TOOL_RUN` came back the same.
- `conform.mjs`: errors 0, warnings 0, browser at 760 and 1130 px. `fingerprint.mjs`: both sections in step (`b3a1ffd3ff6b`, `270c1ed0732e`).
- The face served (`rich-server.mjs --detach`), driven in headless Chromium through every step, every action and both checks, the null on and off: console empty, no page errors, all three images load (hero 1280, s9 1500, s10 1000 px wide), frames grow to fit (1904 and 2142 px after the result opens).
- Hush: neither piece has sound, an animation loop, a timer or a fetch (`requestAnimationFrame`, `setInterval`, `Audio`, `fetch`: zero hits), so there is nothing to hush. Pixel-reading: none; the Blender numbers are baked as `POSED` and `TOOL_RUN`. Tracked: both pieces, `checks.mjs`, `tool check.py`, and both gathered PNGs (`git ls-files`). Nothing licensed.
- BLUELINE's active baton, item 7 (the guide pick, `Projects/BLUELINE/BLUELINE — baton.md`): the face shows nothing from `session-11-outline/out/`, and the guide width doesn't touch the swing model the pieces port. No collision. One tension is noted under offer 1.

## The pieces

### The method — a swing is a rotation (made) · keep, with notes

1. **Test or decoration?** Two checks. The first, the page's 133° / 23 rad/s / 33 m/s, is a transcription check: it fails only if the page misquoted the solver. That is worth having, but it can't find anything about the physics. The inputs are 1.42 m reach, 0.25 s and k 2.5, and with Δθ fixed ω is just 10·Δθ. The second check is the real test. Does the blade meet the wood first at the contact? It fails, and a control built to pass does pass. I rebuilt it independently and the build is wrong in the way the piece says (numbers under offer 1).
2. **Faithful?** Yes. Step 5's rule names the three inputs the page doesn't ("the three the page does not name: pivot to tip 1.42 m, windup to impact 250 ms, exponent 2.50"), so a reader of the piece sees them. The **caption** doesn't: it says "the chop gives 132.9°, 23.2 rad/s and 32.9 m/s, so the page's 133, 23 and 33 pass" without saying those come from inputs the page never states. Note for the maker: add "at the solver's 1.42 m, 250 ms and k 2.5, which the page doesn't name" to the caption.
3. **Walks up?** Yes: one angle, then the schedule, then speed, then every point, then the test. From step 1 the drawing shows the blade inside the column at 80° and the contact in front of it, so the finding is visible before the test names it. That is a strength.

One more thing the page should know: its numbers hang on the misplaced contact. Move the contact onto the wood at the same height, (1.14, 0.02, 1.06), and the chop gives 128.3°, 22.4 rad/s and 31.8 m/s. The page check then fails on all three.

### The method — s9_contact_sheet.png (gathered) · remake, caption only

The render is the right proof beside "it generalizes to any action". But the caption says "speed-lines down into the wound". Session 9 has no wound: `build_swings.py` has no kerf or boolean, and the session-10 report says "Sessions 7–9 left the column a static, undeformed cylinder". Change it to "down into the contact" (or "at the column"). In the chop tile you can also see the drawn sword stop short of the column, which supports offer 1. The caption could point at that.

### Real motion — the gain and the motion (made) · remake, three text fixes

1. **Test or decoration?** A test, though one that passes by construction, and the piece says so ("This holds by construction"). The null is not a straw man. The page's own words, "impossibly fast" and the forward vector's "Parameterize the super-physics as coherent knobs (impossibly strong / fast)", invite exactly this leak. It is the failure a careless "fast" knob would make. In my Blender re-run the null fails on the tool's own code: v_c goes from −18.56 to −188.57 m/s (z) at punch 3.9. The port's 167.04 m/s is the largest single-component difference at gain 10 (−185.60 vs −18.56). Rule stated first, both arms run, three actions.
2. **Faithful?** Three statements are wrong and need fixing:
   - Step 1: v_c "is the only thing about the motion the consequences are allowed to read." Step 3 of the same piece says otherwise, and so does the tool (`impact_tool.py:146-152`): the wake reads `vel(base,u)` and `blade_dir(u)` along the whole swept path. The guide swoosh traces the arc too. Say instead: "the shards read only this arrow; the air reads the whole path."
   - Step 4: "the tool's 'punch' dial sets three such gains, from 0.6 to 3.4". At punch 0 to 1 they run 0.6–2.6 (spread), 0.6–3.2 (count) and 0.8–3.2 (streak) (`impact_tool.py:79-81`). Make it "from 0.6 to 3.2".
   - Result note: "at gain 10 there is little left to run it from." The mean shard direction still sits 6.7° off v_c at gain 10 (my 200,000-draw recompute). The swoosh in the piece's own frame still traces the arc whatever the gain. What spreads is each shard: 27° off v_c on average at gain 1, 40° at 1.8, 75° at 10. Say that instead.
3. **Walks up?** Yes: one arrow, then shards, then the air, then the gain, then the test.

Small, and no fix needed: the port seeds shard origins along the model blade (`M.dImp`), while the tool uses the drawn sword (`bdir`, `impact_tool.py:139`). This changes positions only, never directions, so no statistic moves.

### Real motion — s10_impact.png (gathered) · keep, with a note

The render is right for "The impact is real too". The caption describes the build accurately ("a slot cut along the drawn sword at the moment of impact, widened and run on through the column"), and the render shows it: a small notch at mid-column, with the sword ending short of it. But the caption states this flatly beside a page line that says something else ("exactly where the blade passed"). Note for the maker: add "— not, as the text says, where the blade passed; see the offer" so the disagreement is labelled, not hidden.

## The offers

1. **Method, claim-change: confirmed, every number. Route it to BLUELINE, not to this page's text.** Independent numpy and the Blender re-run agree:
   - Chop: first in wood at 197.3 ms, after 73.6° of 132.9°, r 1.267 m. The contact is 22.1 cm off the wood (column surface at x 1.14, contact at 0.92). v_c is 20.17 m/s; the impact-pose blade enters the wood at r 1.111 m, where it moves at 25.76 m/s. The drawn sword is 0.364 m, 35.9° off the model blade, and ends 17.3 cm short. Kerf 1.06 m.
   - Side: 243.2 ms. Rising: 189.0 ms and 66.8°. Both contacts 24.1 cm off. The rising tip goes to −0.50 m and stays below z = 0 until 190 ms.

   I add one thing. The page's "tip 33 m/s" is the tip of a 1.42 m reach that is never drawn. The drawn sword ends 0.910 m from the pivot, where the swing gives 21.1 m/s.

   **Whose is it?** The defect is BLUELINE's build: the column sits 22 cm past the authored contact, and `R_TIP` doesn't match the sword drawn. It belongs on BLUELINE's scroll as a finding for the tool, and should not go into this page as a sentence. The maker's proposed sentence describes the proof, and it would go stale the day the tool is fixed. A fix that moves the contact onto the wood would also move the page's numbers (128.3°, 22.4 rad/s, 31.8 m/s). The page's own share is the method gap: the contact is authored, not found. Offer 2 already carries that.

   **A tension for Loudon, named, not resolved.** The baton's "Tried and rejected" list says physical fidelity (Cell Fracture, forward dynamics) is "still the WRONG direction". Finding the contact by intersecting the blade with the column is cheap geometry, not simulation, but it moves the tool toward fidelity, and that call is his.
2. **Method, no-claim-edit: confirmed.** The tool authors pivot, windup, contact, R_TIP 1.42, T 0.25 and k 2.5. The axis and Δθ are derived (`impact_tool.py:68-73`). At T = 0.30, ω = 19.33. The page lists the axis as authored and doesn't list the contact. The proposed wording is right, and this is the offer that carries the page's real share of offer 1.
3. **Real motion, claim-change: confirmed.** The kerf is `box(blen+0.7, 0.11, 0.05)` along the drawn sword from the grip (`impact_tool.py:116`, `build_impact.py:145`): 1.06 m, one pose. A chop moves across its blade's length, so the space it sweeps is a fan, not a slot. The kerf's centreline is inside the wood only from 0.55 to 0.85 m along the sword line, near z 1.07. None of the path the model blade cut through the top of the column (from 197 ms) is removed. The session-10 report's "the blade's swept volume" is wrong in the same way, so BLUELINE's scroll should hear it too.
4. **Real motion, claim-change (addition): numbers confirmed, the reading disputed, and the kind is wrong.** Coherence is 0.886, 0.752, 0.642 and 0.257 at spread 1, 1.8, 2.6 and 10 (my draw). The port gives 0.887, 0.753, 0.642 and 0.256. But a falling mean-direction length is what "spread" means. The page already says the gain scales spread, so this doesn't contradict "never the motion". It only describes what spread costs the eye, and that cost is untested on any reader. The mean still points back at the swing (6.7° off at gain 10), and the swoosh carries the arc whatever the gain. Recommend demoting it to a no-claim-edit or dropping it. If it is kept: "the wider the spray, the less each shard points back at the swing."
5. **Real motion, no-claim-edit: confirmed, with one correction.** With the arc spray, the mean shard sits 10.3° off v_c at spread 1 and 9.3° at the tool's heroic 1.8. With the out spray (1.5 × normal) it sits 46.6° off at spread 1. But session 10's build ran `GAIN_SPREAD = 1.8` (`build_impact.py:79`), and there it is **42.9°**, not ~47°. The gain moving the mean toward v_c is confirmed (10.3° to 6.7°). `checks.mjs` prints 10.50° and 6.07° from 7,200 and 72,000 port shards, while the piece and manifest say 10.3° and 6.6° from 200,000. That gap is sampling noise, but the check doesn't compare the stated figure, so "every check came out as stated" doesn't cover it. Proposed wording is right.

## The face as a whole

The face makes the page's idea felt rather than busy, and it found a real thing. The first piece's drawing makes "a swing is a rotation" something you can turn with a slider. By step 1 it is already showing that the rotation is aimed at the wrong place: the blade is inside the post long before the contact the numbers come from. The second piece shows the page's load-bearing split holding under a gain of ten, against a null the page's own words would tempt someone into. The two gathered renders are the right proofs beside the right lines, and they quietly show the finding too (the sword short of the post, the slot apart from the blade). What it must not do is let the finding land in the wrong house. The column, the reach and the kerf are BLUELINE's to fix, on BLUELINE's tempo and under Loudon's "keep it simple" calibration. This page's share is one honest clause: the contact is authored, not found. The fixes asked for are a caption word, three sentences in the second piece, and a recount of 47° to 43°.
