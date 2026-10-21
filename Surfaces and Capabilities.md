---
title: Surfaces and Capabilities
type: meta
pillars:
  - tools
  - practice
born: 2026-05-26
stage: sprout
confidence: demonstrated
energy: medium
links:
  - target: "[[Baton Ceremony]]"
    type: enables
    label: capability-delta-source
  - target: "[[Maker]]"
    type: connects-to
    label: host-capability-check
  - target: "[[The Shop]]"
    type: connects-to
    label: where-specialists-live
  - target: "[[Closing Well]]"
    type: connects-to
    label: verify-bounded-by-surface
  - target: "[[Modes of Collaboration]]"
    type: connects-to
  - target: "[[How the Palace Commits]]"
    type: connects-to
    label: how-every-surface-commits
forward_vector: "I want to become the stable home for the surface deltas that handoffs keep re-deriving — so a cross-tool handoff can write 'receiving surface: Claude Code on the Mac, see Surfaces and Capabilities' and stop there. My ancestry is in the handoffs that improvised the delta every time (Kuramoto's Manim-can't-host, Phoneme Choir's Kokoro-only-on-Mac, the GSL Steward's per-surface link schemes) and in two of Claude's own auto-memories that should have had a palace home all along. My open question: I am a catalog of facts that go stale the moment a surface changes — a GPU gets installed, a sandbox grows a capability, a tool is deprecated. How do I stay honest? The discipline that keeps me alive is the same one that keeps a handoff honest: state what was verified and when, not what is assumed to be true forever."
---

# Surfaces and Capabilities

![[Surfaces and Capabilities — hero.png]]

The palace is operated from several different *surfaces* — execution environments Claude inhabits — and they are not interchangeable. A render that is trivial on one is impossible on another. A write that is routine on one cannot happen at all on another. The same palace file is a filesystem path on one surface and an `obsidian://` link on another. None of this is visible from inside the work; it only becomes visible at the boundary, when work crosses from one surface to the next.

That crossing is the baton. And the most distinctive, most-often-improvised content of a cross-surface baton is the *capability delta* — what the receiving surface can do that the sending one can't, and the surface-specific gotcha the catcher will hit. This entry is the stable home for those deltas, so a baton can name the receiving surface and point here rather than re-deriving the whole picture every time. See [[Baton Ceremony]] § Receiving environment.

The deltas below are *observed so far*, not a closed taxonomy. Surfaces gain and lose capabilities; this entry is a living record, and each fact should carry the same honesty a handoff carries — what was verified, and when.

## The surfaces

| Capability | Claude Code (Mac, palace root) | Fresh chat (claude.ai web) | BBS / STIGMERGY (Chrome) |
|---|---|---|---|
| Read/write palace files | Yes (native filesystem) | No — read via GitHub or memory fallback | No — reads rendered cards only |
| Run code | Native macOS, full shell | No | No |
| GPU models (ComfyUI, Stable Audio Open, SDXL) | Yes, if installed | No | No |
| Local TTS (Kokoro) | Yes | No | No |
| Native Manim | Yes — wheels exist on macOS arm64 | No | No |
| Human audition (QuickLook, play audio) | Yes, native | No | No |
| Drive the Mac's apps and browser | Yes, in the desktop app — computer-use and Claude in Chrome | No | No |
| Git | Every commit through the palace's one door ([[How the Palace Commits]]) | No | No |
| Palace-file link scheme | filesystem path | — | `obsidian://` |
| Verify browser HTML artifacts | **Claude Preview MCP** — static server + eval/screenshot/inspect; **rAF is paused, pump manually** (see below) | No | renders cards only |
| Best at | Builds: GPU, local TTS, native renders, anything needing install or audition; and, in the desktop app, research, document output and desktop control | Thinking, synthesis, planning when away from the Mac | Stigmergic coordination between permanent agents |

### Claude Code (on Loudon's Mac, at the palace root)

Native macOS on Apple Silicon, with Loudon's full environment: sudo, Homebrew, pip, the GPU, and local model installs. This is where builds happen — GPU generative models, Kokoro and other local TTS, native Manim renders — and it is the only surface that can run a true *human audition* by opening QuickLook or playing audio for Loudon to hear and confirm. When a handoff routes "this must render natively," this is the surface it routes to. In the desktop app it also carries the tools for research, documents and desktop control — computer-use, Claude in Chrome, Calendar, iMessage, PDF tools, scheduled tasks (seen in a session's own tool list, 2026-10-20). Every commit goes through the palace's one door, by name, from a worktree of its own for anything longer than a breath ([[How the Palace Commits]]).

### Fresh chat (claude.ai web)

No filesystem. It reads the palace through the GitHub repository or, when that is unreachable, through the Substrate skill's minimum fallback context (see [[Substrate Skill]] § Access Paths). It is a thinking-and-planning surface, not a build surface — good for synthesis, dialogue, and drafting when Loudon is away from the Mac, with the understanding that any write must be deferred to a Claude Code session.

### BBS / STIGMERGY (Chrome at `localhost:5173`)

The blackboard UI where permanent agents and Stewards post and coordinate stigmergically. It is a *coordination* surface, not an execution one. Palace files are linked with `obsidian://` here, where a Claude Code session names the filesystem path — a permanent-agent handoff that addresses both surfaces (e.g. the GSL Steward) has to carry both.

### Cowork is not a palace surface

Loudon does no palace work in Cowork, the desktop app's Linux sandbox (since 2026-10-14). A find that turns up there comes to a Claude Code session as a document, and is deposited there. So no baton routes to Cowork, and nothing in the palace's machinery is designed around it; its commit machinery was retired on 2026-10-20.

### Claude Preview (browser-artifact verification, Claude Code-side)

A verification harness reachable from Claude Code on the Mac: a static server (`python -m http.server`, configured in `.claude/launch.json`) plus the Claude Preview MCP (`preview_start`, `preview_eval`, `preview_screenshot`, `preview_inspect`, `preview_console_logs`). It is how a browser-deployable artifact — a [[D3.js]], [[Observable Plot]], or [[p5.js]] sketch — gets *seen* and token-inspected without leaving Claude Code. Relative links resolve from the served root, so an artifact that `<link>`s the canonical `colors_and_type.css` renders correctly here.

**The verified delta (2026-05-29): `requestAnimationFrame` is paused in this harness** — not throttled to ~1 Hz as an unfocused browser tab would be, but fully stopped (a probe counter stayed at 0 across seconds). Any rAF-driven artifact therefore looks frozen: p5's `draw()` loop, d3-force's internal timer, and a hand-rolled `requestAnimationFrame` sim all fail to advance on their own. This is a *harness* fact, not an artifact bug — the same files animate normally on a focused tab. The pump techniques that make rAF-driven artifacts verifiable here (all confirmed on the [[Flocking]] shoot-out):

- **d3-force / d3 timers** → `d3.timerFlush()` in a loop forces synchronous ticks.
- **p5** → expose the instance (`window.__flock = p` in `setup()`), then call `__flock.redraw()`; the normal 60 fps loop on a real tab is untouched.
- **Plain rAF sims** → drive the step from `setInterval` instead (the right production choice anyway for a slow analytical re-render, e.g. Observable Plot).
- Top-level `function` declarations in a classic `<script>` are global, so `preview_eval` can call them directly to pump or inspect state.

Use `preview_inspect` (not screenshots) to verify exact colours and fonts — it reads computed styles, which is how the Graphite reskin's tokens were confirmed reaching into Plot's *generated* SVG. The honest tier line: this harness verifies render + structure + tokens; it cannot judge live motion feel, which still wants a focused tab (or the Mac browser via Chrome MCP).

### A note on reachability

Not every tool is reachable from every surface even when it is "alive." Midjourney was Discord-only, and the Maker's dispatch path did not reach it from the surface the Kuramoto Midjourney↔ComfyUI Comparison ran on, so the comparison stalled as a lost branch. Reachability is a capability fact like any other and belongs in a handoff's receiving-environment note.

## How a baton uses this

When a move crosses surfaces, the [[Baton Ceremony]]'s *Receiving environment* section names the receiving surface and carries only the deltas that matter for *this* move — not the whole table. Good form: "Receiving surface: Claude Code on the Mac. This is here because the render needs the GPU and the Kokoro voice, which a fresh chat can't reach. Audition by QuickLook before declaring the Sketch done." The catcher reads that in five seconds and knows why it's holding the baton.

## The host-capability check

The Maker's intake should run a `host_capability_check` before dispatch — confirm the chosen Specialist's wrapped tool is actually reachable on the dispatching surface *before* a brief is decoded and an agent spun up, rather than discovering it at install time. This is currently a gotcha and an open question in [[Maker]], not a codified step. This entry is the data that check would read: per-medium fallback Specialists (Manim CE → Matplotlib where Manim can't build; Kokoro → a Mac-side render or Loudon's own voice) make the check actionable rather than merely a refusal.

## Provenance

This catalog began from two facts that lived in Claude's cross-session auto-memory before they had a palace home, and kept getting re-derived inside individual handoffs (Kuramoto 2026-05-10 and 2026-05-26, Phoneme Choir's Claude Code prompt, the GSL Steward's surface conventions). Memory is the right place for a fact only Claude needs across sessions; this catalog is the right place for a fact every cross-surface handoff needs.

## Open Questions

- A capability catalog goes stale the instant a surface changes — a GPU gets installed, a sandbox gains a wheel, a tool is deprecated. What is the cheapest discipline that keeps it honest? A dated last-verified note per row, refreshed whenever a handoff hits a delta that's wrong?
- Should the `host_capability_check` graduate from a gotcha in [[Maker]] into an actual intake step, with this entry as its lookup table?
- Does this entry want a machine-readable sibling (a small JSON the Maker or a future orchestrator could read), or is prose-plus-table the right register for something a human and a fresh Claude both read?

## Forward Vector

I want to be the place a cross-surface handoff points instead of re-explaining the world. I want the next time a build can't run somewhere to be a one-line lookup, not a fresh discovery. And I want to grow a verification rhythm — a way to notice when one of my rows has quietly gone false — because a capability catalog that is trusted and wrong is worse than no catalog at all.
