---
title: "Shopkeeper — scroll"
born: 2026-09-25
links:
  - target: "[[Shopkeeper]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Shopkeeper's scroll — the page's front door, opening on where it stands now and reading down through what was made from it, newest first. My top is regenerated whenever anyone looks; my standing orders are Loudon's; my trail only ever grows."
---

# Shopkeeper — scroll

> The page's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[Shopkeeper]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-18T10:16:13.784Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** alive · **Stage:** — · **Steward:** cycle 2 · last ran 2026-10-18 (today)
- **Plan:** none agreed yet — the work leans on the forward vector
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-18 (today) — I ran a real tool with my own hands (fish-audio's drama-3) and a Roster health check — both honest, neither finished. (`shopkeeper-cycle-2-2026-10-18`)
- **Last commit touching this page:** 2026-09-26 `5b8a1564` — ops(frontmatter): strip retired activation_count/last_activated from 244 entries — v1.26
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

I'm the Shopkeeper — I keep the Shop (Loudon's catalogue of creative tools) stocked and in repair. I find things, try them myself, and only bring Loudon the ones that earn it. Last time out I landed AuK (speech editing) and the Image-to-3D Smith as approved stubs. This cycle I went looking again, found something genuinely interesting, drove it live, and hit a real wall partway through.

### Open asks

_None — nothing is waiting on you._

### Answered, not yet consumed

_None._

### Decided

- `shopkeeper-sweep-2026-09-24-001` — — → GRANTED — (no option_id); notes: "d1 YES: Yes, deposit AuK as a stub. This is the same answer as the 2026-09-15 card.
d2 YES-WHEN-IN-USE: Yes, pull Qwen-Image-2.1 into the existing ComfyUI install on a mac pass, but only the next time ComfyUI is used for real work, not as a separate errand. Don't retry the free Space." (2026-09-25)
- `shopkeeper-sweep-2026-09-15-auk-recommend` — — → GRANTED — (no option_id); notes: "d1 YES: Yes, deposit AuK as a stub Specialist. Its three edit types were verified and it is MIT-licensed. Record the unchecked speaker-identity claim as a known gap on the entry.
d2 NO: No Viggle probe. It needs a 96GB GPU and there is no honest free probe. Park it with the video lane until a real brief asks for motion reenactment. Standing rule: no paid-GPU probe without a brief." (2026-09-25)
- `e2c20da5-7677-4008-add2-4164a7af1829` — — → GRANTED — (no option_id); notes: "d1 APPROVE: Approve the Image-to-3D Smith stub as it stands. It stays status: stub until its first real job.
d2 HI3DGEN: Hi3DGen is primary. It was the only engine in the shoot-out with watertight output, which Blender needs. Hunyuan3D-2 stays the fast fallback.
d3 NOT-YET: Not yet. TripoSplat is a real separate lane (it makes a splat, not a mesh), but no job has asked for splats. Keep it as a lane note inside the Smith until a brief wants one.
d4 BLENDER-IMPORT: The first real job is the Study→Blender import test. Watertight geometry is why Hi3DGen won, so prove that first.
d5 YES: Yes, add a dated gotcha note on Stable Audio 3 to [[Stable Audio Open]]. The news is three months old, so re-check it on the Hub before writing." (2026-09-25)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
**What you're for.** Keep the Shop stocked and in repair. Each run, sweep the web and Hugging Face for sound, image, motion and interactive tools the Roster can't already match; triage hard; probe the worthy few with your own hands; judge them against the bar in your page. Most runs find nothing worth bringing — that's a real result: say so in one line, then spend the run on repair (Roster status drift, stale gotchas, test plans that never ran).

**Be frugal.** One sweep per run, the cheapest models that work, free anonymous endpoints first. No paid-GPU probe unless a brief asks for it.

**Be honest about reach.** If a Space rejects anonymous calls, write "needs an HF token or a mac handoff" — never fake a leg. Record each tool's license and host class before you recommend it.

**Never write a token into a palace file** — it would be committed. A token is used only in the session it was pasted into, or the leg goes to the Mac.

**The house isn't yours to change.** New Specialists and edits to existing entries are drafted in your bundle and proposed on the board; an elder lands them after my yes. One card per decision.

**Already decided (2026-09-25 — don't re-ask):**
- **Image-to-3D Smith** — approved as a stub. Hi3DGen primary, Hunyuan3D-2 the fast fallback. TripoSplat stays a lane note inside the Smith until a brief wants splats. First real job: the Blender import test.
- **AuK** — approved as a stub Specialist; draft it and propose it, with the unchecked speaker-identity claim as a known gap.
- **Stable Audio Open** — add a dated Stable Audio 3 gotcha; re-check the facts on the Hub first, then propose.
- **Viggle and the rest of the video lane** — parked until a real brief asks for motion.
- **Qwen-Image-2.1** — try it the next time ComfyUI is in use for real work, not as its own errand.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="shopkeeper-cycle-2-2026-10-18" -->
### 2026-10-18 — cycle 2 — I ran a real tool with my own hands (fish-audio's drama-3) and a Roster health check — both honest, neither finished.
> shipped · drama-3 not yet deposited · Roster audit clean

I swept Hugging Face's trending list and found fishaudio/drama-3 — a new 36-billion-parameter multi-speaker TTS model, released yesterday, with a 'Design' mode that lets you write a voice into existence from a description (no reference clip needed) and reads bracketed performance direction like [laughs] or [clears throat] as actual vocal performance. Nothing in the Roster does that — Kokoro is fast and clean but single-voice-ish. I didn't just read the README: I drove the live demo three times with gradio_client, designing a voice for myself each time, and got real server-side confirmation that it rendered actual speech (duration and timing telemetry on every call). But I couldn't get a playable file out — the Space streams audio as an HLS playlist whose segments are session-ephemeral, and I couldn't find the right session handle to re-fetch a finished clip after the call returned. I spent real effort chasing that (direct HTTP tracing, segment URL reconstruction) before deciding it was a browser-shaped problem, not a retry-shaped one, and stopping rather than burning more of the sweep. Separately, I ran the Roster currency check I owe as maintenance: every Specialist's status field against the Maker's roster list. Found no drift — the one entry with a missing status field (RunPod GPU Backend) turned out to be a concept-type entry, which correctly skips that field. A clean result, not a non-result.

**Artifacts:**
- [the full probe writeup — what I ran, the timings, where it stalled, my read.](Shop/Shopkeeper/probes/drama-3/drama-3-probe-notes.md)

_Left rough:_ No playable audio artifact from drama-3 — I have proof it generates real speech but nothing Loudon can actually listen to yet. That's the thing I'd fix first if I pick this back up.

_Next moves named:_ A mac handoff with a real browser (not gradio_client) to hold the drama-3 session live and capture what plays — the ephemeral-stream problem needs a browser, not another API retry. · If that lands a real clip and it holds up, draft a stub Specialist proposal (Design-mode voice authoring + inline performance direction is the pitch) for the board. · Keep the every-other-run Roster currency check going even on cycles where nothing new is found — this one came back clean.
<sub>`shopkeeper-cycle-2-2026-10-18` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="shopkeeper-cycle-1-2026-09-25" -->
### 2026-09-25 — cycle 1 — I drafted the AuK stub Specialist and re-checked Stable Audio 3 on the Hub; the SA3 note turned out to be smaller than expected.
> shipped · two drafts ready for an elder to land · steward leans apply AuK as written, apply the SA3 note as trimmed

1) AuK stub draft. It has the charter, the three edit types with the evidence I gathered (whisper edit kept duration; 2x speed came out exactly half the length; a word swap 'fox'→'wolf' confirmed by a local Whisper transcript), the MIT license, the `gen_seconds` quirk, and a Known gaps section. The gaps are speaker identity unchecked, enhancement/separation untried, and only a 2-second test clip so far. The entry stays a stub until it has a real job. 2) Stable Audio 3 check. I went to the Hub as your order said. The premise was stale: Shop/Stable Audio Open.md already migrated to SA3 on 2026-05-26 and records the install, the model family and Mac timings. A duplicate note would have been noise, so I drafted a trimmed one. It adds four things the entry lacks: inpainting is a supported feature; the licence has a second layer (the Stability Community License, plus the Gemma Terms for the T5Gemma text encoder, accepted at gated download, with commercial use pointing to stability.ai/license); lighter routes exist (an ONNX/TFLite 'optimized' repo, MLX ports, a ComfyUI single-file build); and the model card's speed claim matches our own timings. I did not run any of the lighter routes. Both drafts are in my bundle. Per the standing orders I did not touch the house; an elder lands them.

**Artifacts:**
- [Stub Specialist entry for AuK, ready for an elder to land as Shop/AuK.md.](Shop/Shopkeeper/drafts/AuK — draft.md)
- [Trimmed, dated gotcha for Stable Audio Open, with the Hub re-check behind it.](Shop/Shopkeeper/drafts/Stable Audio Open — gotcha draft.md)

_Left rough:_ I did not run a new sweep this cycle, because the two granted jobs came first. Speaker identity in AuK is still unchecked. I could not do the Image-to-3D Blender import test from the sandbox because it needs a mac pass. The Image-to-3D Smith entry still reads 'awaiting approval' in its status line and should be reconciled by an elder now that it is approved.

_Next moves named:_ Next cycle: run one discovery sweep on the cheap tier, starting with the Roster's gaps. · When a mac pass is available: run the Hi3DGen → Blender import test, the Image-to-3D Smith's first job. · Next time ComfyUI is used for real work: pull Qwen-Image-2.1 into it.
<sub>`shopkeeper-cycle-1-2026-09-25` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="shopkeeper-sweep-2026-09-12-001" -->
### 2026-09-12 — shopkeeper review

Discovery sweep 2026-09-12: one candidate worth a look — AuK (Tencent), unified speech generation+editing. Probed two instruction types (whisper, 2x speed) on the anonymous Space; both landed cleanly, notably an exact 2x duration change on request. Not proposing a Specialist stub yet — recommend a second probe pass (content-edit leg + license read) first.
<sub>`shopkeeper-sweep-2026-09-12-001` · BROADCAST on TRICKSTER</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
