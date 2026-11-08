---
title: "BLUELINE — Context"
born: 2026-11-03
links:
  - target: "[[BLUELINE]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why BLUELINE is shaped as it is: how its threads were chosen, what the question of its Specialists settled, the two AIs it runs, and the reframes its scope went through and when, so the page can stay a short hub of doors. I grow when the page's shape or its scope changes again."
---

# BLUELINE — Context

Why [[BLUELINE]] is shaped the way it is. The page says what BLUELINE does and which works do each part. Where it stands and what comes next are on [[BLUELINE — scroll]]. This file holds the reasoning behind the shape, which those two leave out.

## Why the page is a hub

At the Daily Page of 2026-10-29, BLUELINE woke with its thesis back in Loudon's words: build a song and tell a story in frames alongside it. The page had been carrying a second copy of its own map. Its "What it is", "Where it stands" and "Bundle" sections repeated the Production Plan's §1, §3 and §8 almost line for line, and it never said the project had paused. The reshape, landed on 2026-11-03 in `0ccda4a3`, made the page what it had become: a hub in the everyday sense. It connects the works that grew from BLUELINE, keeps them in order, and notices what each one needs. `type` stays `project`. The vector shrank to one sentence, because a vector is the lean, the Plan is the route and the Standing Orders are the fences.

What the reshape cut from the body is kept below: the two AIs, and the dated asides on the scope.

## How the threads were chosen

The first spike, in June 2026, cut the work into parallel tracks by three filters. The framing still holds. It is why the threads run in parallel and why each one leaves reusable palace machinery behind.

1. **Does it serve all palace work, or only BLUELINE?** Substrate came first and was built as reusable Shop machinery: the GPU backend, the clock, the measuring ruler, the flow field, the Figure Rig. Most of BLUELINE turned out to be substrate other work needed anyway. The substrate was the prize.
2. **What is the biggest unknown in this seam, and the smallest test that retires it?** Prove the behaviour on one tiny case before any volume ([[Capability-first prototyping]]).
3. **Can it run without waiting on another thread?** Threads meet only at the [[BLUELINE — Board Record Schema|board record]], so they run side by side.

The threads meet the established animation pipeline in [[BLUELINE — Production Pipeline]]: the anime backbone, the comics skin, the feature film's tissue, the music video's clock. Adopt the craft and author the seam ([[Adopt the Craft, Author the Seam]]).

## What the Specialists question settled

In June the Production Pipeline's vector asked for a role-Specialist at every stage (Director, Board artist, DP and layout, Render-AI, Editor) under a BLUELINE foreman, "so the team is real and not a metaphor." [[BLUELINE — Specialists and Seams]] answered it on 2026-06-17, and the answer was smaller and more reused than one Specialist per stage.

- **A Specialist is a tool-citizen; a pipeline stage is a job.** Most stages are jobs an existing Shop Specialist already does: [[Shop/Blender]] for layout, [[Shop/ComfyUI]] with FLUX and the LoRA Trainer for the render, [[Shop/ffmpeg]] for the cut. A stage earns a Specialist only when it binds a versioned tool, exposes a typed dispatch surface, and gathers gotchas across jobs.
- **About three new tool-citizens, not seven.** It named a staging AI (a sentence into a staging spec over a curated vocabulary), a comic renderer (the animatic player, the opinionated vocabulary that is the product), and the flow field, which is probably a recipe inside ComfyUI unless it grows a tool of its own. The roster it predicted is live now as [[Shop/Figure Rig]], [[Shop/Lettering]] and [[Frame Designer]], the Maker's per-medium Designer.
- **The seams are the contract.** Every hand-off between stages is a board-record hand-off. Two are hard, and they are the only new engineering in the pipeline. Seam A, board to layout (2D to 3D), is solved by design: one record at two fidelities. Seam B, layout to render (exact blocking into exact pose keypoints a model obeys), is the frontier. That is [[Blocked, Not Prompted]]. The seam analysis lives on in [[BLUELINE — Production Pipeline]].
- **No second foreman, yet.** BLUELINE is a gated recipe the existing [[Shop/Maker]] runs, with the board record as its contract. It earns its own foreman only when its house standards and standing roster outgrow what the general Maker should carry.
- **Loudon is the Producer and the auteur, not the Director stage.** "Director" is an AI stage that drafts a treatment from his intent. It is the hand, not the eye. The Shop already gives him the Producer's role and rejected "Director" as a layer name. That also sets the staging AI's job: apply his vocabulary faithfully and flag what it can't, never invent a look of its own ([[Cooperation Yields Agency]] inside a pipeline).

Three questions it left open still stand: whether the Director stage ever earns a Specialist, whether the flow field is a Specialist or a recipe, and whether the comic renderer becomes a Shop Specialist that BLUELINE reuses like Blender.

## Two AIs, opposite risk profiles

BLUELINE runs two intelligences with opposite temperaments. The **staging AI** is cheap and reliable: language into editable proxies over a curated vocabulary, which is structured extraction, not pixels. The **render AI** is expensive and uncertain: a diffusion skin, and simulation. The milestones are ordered so the useful early tools never depend on the risky one. It is [[Diversity of Thought in Many-Agent Systems]] seen from the tooling side.

## Retired, do not reinvest

Three bets were tested and closed. Each one is here so nobody pays for it twice.

- **Warping the render's noise along the flow field** (Track V, M3 to M3.7). Flow-warped diffusion noise never beat seed-lock at the render, in a single jump or across a sequence: seed-lock held adjacent frames together better, and the warped chain wandered. A panel render holds together through seed-lock, a pose ControlNet, identity, depth and img2img. The flow field stays the spine of the composition and the effects, not a way to move the noise. The record is `proofs/m3-warped-noise/`.
- **A character LoRA** (Track II). It scored below its own text-only baseline, because it learned a costume, not a face. Identity moved to InstantID. The style LoRA is still live.
- **The crystal-head character.** Base SDXL refuses it. It is deferred to inpainting, a FLUX reference, or a LoRA of its own.

## The scope, and how it moved

The scope was locked in June and July 2026 and confirmed as Standing Orders on 2026-09-25. The orders themselves are on the scroll. What follows is how each one got its shape, from the asides the body carried until 2026-10-29.

- **Animal motion out** (2026-06-13). Humanoid only. Animals were the one case starved of data, and they were retired by decision.
- **Each milestone ships.** The ladder was M0 previz, M1 animatic, M2 motion comic, M3 flow-field effects, M4 hyperreal impact, M5 the sync server. Every rung is a usable tool, never a down payment on the next.
- **Staged, not simulated, relaxed** (2026-07-03). Comic motion is camera, effects and pose, never simulated contact between figures. The held-pose rule was lifted for one bounded experiment: blending key poses along the flow's line of action. That moved Motion and Flow's Edge 3 from a decision into the build queue.
- **The flow field became a stack** (2026-07-09). [[The Flow Field is the Spine]] was framed as one authored field rendered at three resolutions of reality. It became a stack: a panel carries wind, wake, impact and ambient fields, each from one source, composited like buses. The discipline is one source per motion, not one field per panel.
- **Live is the final stage** (2026-07-09). Live performance is the last rung, not a separate project. Every offline stage is built to survive the crossing into real time: the same record, the same audio-to-parameter map, the same warm-started render, with only the clock source and the step count changing ([[BLUELINE — The Page]]).
- **The page persists** (2026-07-09). The screen is a comic page, with panels arriving in musical time. The comic lexicon was adopted: the panel is the unit, and "frame" means only the single 1/24-second image.
- **Fixed tempo, then any tempo, then tempo changes** (2026-11-03 and 2026-11-04). The first law was fixed tempo: sync is exact arithmetic, with beats falling on whole frames, never elastic alignment. At 120 BPM and 24 frames a second a beat is exactly 12 frames, which is what the record assumed. At the 2026-10-29 sit, every saved Set of the song that was found ran at 127.001 BPM, where a beat is 11.34 frames, so "whole frames" didn't hold (what tempo the live test of 2026-06-23 ran at is not verified). Loudon: "we must be able to use any arbitrary tempo." The morning's cut script places each cut at the nearest frame of its absolute time, rounded once, so nothing accumulates drift; the board record is to follow. The Set sets the clock; no number in a record does.

  The next day Loudon put tempo changes inside a Set in scope too (2026-11-04): "Our focus on set tempo was used to avoid the complexity, we can move past that now and bring in the full expressive capability of tempo changes." So the record follows a Set's whole tempo map, its tempo changes and its meter changes, not one tempo. A single tempo was a way to keep the first rungs simple, not a law of the form.

The comic-and-cinema framing the old body opened with now lives on its own page, [[Comic and Cinema — Two Ways of Seeing]]: the storyboard speaks comic, the render speaks cinema, and the system's job is the transduction between them.
