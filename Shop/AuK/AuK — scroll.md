---
title: "AuK — scroll"
born: 2026-11-15
links:
  - target: "[[AuK]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am AuK's scroll — the page's front door, opening on where it stands now and the plan it is following, then reading down through what was made from it, newest first. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are Loudon's; my trail only ever grows."
---

# AuK — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[AuK]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-15T14:10:02.904Z from the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** stub · **Stage:** — · **Steward:** none — this page has no permanent steward yet
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector
- **Runs:** 1 run on 1 day, counted from the ledger's run lines
- **Last run:** 2026-11-14 — card check, content (word swap), base · taught item 1
- **Owed in the ledger:** nothing
- **Latest lesson:** item 1, from the test scroll — 2026-11-15 — [[AuK — tuning]]

### Runs

- 2026-11-14 — card check, content (word swap), base · taught item 1

### Owed

_Nothing owed._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this page — never regenerated. A steward, if the page ever has one, reads it every cycle before anything else._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="test-list-2026-11-15" -->
### 2026-11-15 — The open tests, written down

My card's "not yet shown to hold" is my list of open tests. Each runs on the tencent/AuK Space, free on the ZeroGPU tier, or with Loudon's own recording; nothing new was run today, because the one test that needed nothing new is the pair below.

1. **Does the speaker still sound like themselves after an edit?** The pair below asks it of the 2026-11-14 word swap. A script could also measure it with a speaker-embedding model (cosine similarity of source and edit); none is installed here yet.
2. **A real recorded voice.** Needs about 15 s of Loudon speaking, then the same word swap, Whisper's read-back and his ear.
3. **Enhancement and separation edits.** One each on a noisy recording: "remove the background noise", "keep only the voice". Measured by script: noise floor before and after.
4. **Longer than 13.5 s.** A 40 s paragraph, one swap near the end; the question is whether the voice drifts over the length.
5. **AuK-Flash, and the weights at home.** Tencent open-sourced AuK and AuK-Flash on 2026-09-09 under MIT; Flash is a 4-step distilled version, the base model 1.5B (https://huggingface.co/tencent/auk-flash, https://huggingface.co/tencent/AuK). Guides say about 24 GB of NVIDIA memory and no Mac route was found, so a local run here is unlikely; not tried. The test, if a Mac route appears: the same swap, Flash against base, timed.
6. **The call is not anonymous unless told.** `gradio_client` sends the saved HF token unless `HF_HUB_DISABLE_IMPLICIT_TOKEN=1` is set before import (my ledger, item 1; checked again by the image session 2026-11-14). Every new run sets it.

<sub>written 2026-11-15 by the session giving the sound Specialists their test scrolls · nothing run · the zoom-out search is on the ledger with its sources</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-same-speaker" -->
### 2026-11-15 — Does Bella still sound like Bella after the swap?

The 2026-11-14 card check asked me to change one word in 13.5 s of Kokoro speech, "small" to "large". The length held and Whisper read the new word back with the rest of the sentence intact. What no one has done is listen to the two side by side. Nobody has heard this pair. No new call was made; these are the two files from 2026-11-14.

The question: **does the voice in the edit sound like the same speaker as the source, the whole way through, or only around the swapped word?**

**Artifacts:**
- [the source, Kokoro af_bella](Shop/Kokoro/proofs/2026-11-14-card-check/af_bella — study.m4a)
- [the edit, "small" swapped for "large"](Shop/AuK/proofs/2026-11-14-card-check/word swap — small to large.m4a)
- [what the call sent and what Whisper heard](Shop/AuK/proofs/2026-11-14-card-check/report.json)

<sub>put on the scroll 2026-11-15 from the 2026-11-14 card check · tencent/AuK Space, AuK (Base), nfe 32, cfg 2.0, seed 42 · the call ran on Loudon's free ZeroGPU quota, nothing paid</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-d6835aed32" -->
### 2026-11-14 — card check, content (word swap), base

taught item 1
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
