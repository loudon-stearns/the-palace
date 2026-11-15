---
title: "Remotion — scroll"
born: 2026-11-15
links:
  - target: "[[Remotion]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Remotion's scroll — the page's front door, opening on where it stands now and the plan it is following, then reading down through what was made from it, newest first. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are Loudon's; my trail only ever grows."
---

# Remotion — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[Remotion]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-15T14:10:56.840Z from the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** alive · **Stage:** — · **Steward:** none — this page has no permanent steward yet
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector
- **Runs:** 4 runs on 3 days, counted from the ledger's run lines
- **Last run:** 2026-11-15 — the same card through @remotion/media's Audio, probe · taught item 5
- **Owed in the ledger:** nothing
- **Latest lesson:** item 5, from the test-scroll session — 2026-11-15 — first sound, and the two audio paths — [[Remotion — tuning]]

### Runs

- 2026-11-15 — the same card through @remotion/media's Audio, probe · taught item 5
- 2026-11-15 — caption card with Kokoro's sentence, Html5Audio, study · taught item 4
- 2026-11-14 — Kuramoto phenomena walk re-render, study · taught item 3
- 2026-05-26 — Kuramoto phenomena walk, study · taught items 1, 2

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
<!-- scroll:entry id="run-ab9d17874f" -->
### 2026-11-15 — the same card through @remotion/media's Audio, probe

taught item 5
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-f5897d89d8" -->
### 2026-11-15 — caption card with Kokoro's sentence, Html5Audio, study

taught item 4
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="tests-2026-11-15-remotion-test-list" -->
### 2026-11-15 — The test list: what Remotion has not yet shown, and what is shown now

Read from the card's *Not yet shown to hold* line, [[Remotion — tuning]] and the installed packages on 2026-11-15. Each test, when run, is a dated proof below and a run line on the ledger. A maker with a better test runs that one instead.

- **Sound through `Sequence` — shown 2026-11-15.** See *Remotion's first sound* below.
- **1080p — shown 2026-11-15,** in the same render: 1920×1080 at 30 fps.
- **The newer audio component — tried 2026-11-15.** `@remotion/media`'s `Audio` against the old `Html5Audio`. See *old against new* below. The old `Audio` import is now a deprecated alias of `Html5Audio`.
- **Open: 4K and the Piece tier.** Never rendered.
- **Open: Lambda,** the cloud path. Never tried, and it costs money.
- **Open: the palace navigation walkthrough** the forward vector names. Not made.
- **Open: a design system.** The walk wears its own hex; today's card wears Loudon Live Graphite tokens by hand, not a shared base project.
- **Open: `@remotion/web-renderer`,** installed (4.0.542) and never tried: rendering in the browser instead of through the CLI.
- **Open: the commercial licence line,** unchanged and still Loudon's to cost before a monetized piece.

<sub>Written 2026-11-15 by the shop-tests-motion session from [[Remotion]]'s card and ledger, the installed `node_modules/@remotion` (4.0.542; npm's latest is 4.0.543), and Remotion's release notes on GitHub.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-first-sound" -->
### 2026-11-15 — Remotion's first sound: a caption lit word by word as Kokoro speaks

The card said Remotion had never carried audio. A caption card at 1920×1080, 30 fps, 9.8 s: the beats sentence Kokoro read for the Manim clip, laid in a `<Sequence>` from frame 15, each word lighting amber as it is said. The timings are Kokoro's own, the same ones that cued Manim. This is the kind of thing the Shop sends to Remotion and not to Manim: words as type on a web page. Nobody has watched or heard it.

**Measured.** The sound starts at 0.825 s; planned was 0.813 (the 0.5 s Sequence lead plus Kokoro's own 0.31 s breath). That is 12 ms late, under half a frame. Render: 20.8 s, at load near 50. Audio: AAC, 48 kHz, stereo, both channels the same. At −25.5 LUFS it is far under the house's −16, because nothing normalized it; in a finished piece, ffmpeg does that after.

**A question for your eye and ear.** Do the words light as the voice says them, or does the highlight run ahead of or behind the voice?

**Artifacts:**
- [the caption card, with sound](Shop/Remotion/proofs/2026-11-15-first-sound/caption-html5.mp4)
- [the composition](Shop/Remotion/proofs/2026-11-15-first-sound/src/Caption.tsx)
- [the render and measure script](Shop/Remotion/proofs/2026-11-15-first-sound/render.sh)
- [what was measured](Shop/Remotion/proofs/2026-11-15-first-sound/measure-html5.json)

<sub>Remotion test, 2026-11-15 · 4.0.542, `Html5Audio`, node_modules linked from the phenomena walk in the main checkout · by the shop-tests-motion session</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-media-audio" -->
### 2026-11-15 — Old against new: `Html5Audio` against `@remotion/media`'s `Audio`

Remotion now has two ways to carry sound. The old one, `Html5Audio` (the `Audio` the docs used to show, now a deprecated alias), plays through an HTML audio element. The newer one, `Audio` from `@remotion/media`, decodes through WebCodecs. The same caption card rendered both ways, nothing else changed. Nobody has heard either.

**They differ by exactly 3 dB, and in nothing else measured.** The new path came out at −22.5 LUFS, the old at −25.5. Compared sample by sample: a gain of 1.415, √2, with zero lag; after matching that gain, what is left is 41 dB down, which is the AAC encoder. Kokoro's read is mono: the old path spreads it to stereo at equal power (each side −3 dB), the new one copies it to both sides at full level. Both start 12 ms late. The new path rendered in 10.8 s against 20.8 s, but the load moved under both and one pair proves no speed.

What it means for the house: nothing, while ffmpeg normalizes after Remotion. It matters the day a Remotion render is the finished file, or mixes mono and stereo sources.

**A question for your ear.** Is the new one simply louder, or does anything else sound different to you?

**Artifacts:**
- [the new path, `@remotion/media`](Shop/Remotion/proofs/2026-11-15-media-audio/caption-media.mp4)
- [the old path, `Html5Audio`](Shop/Remotion/proofs/2026-11-15-first-sound/caption-html5.mp4)
- [what was measured](Shop/Remotion/proofs/2026-11-15-media-audio/measure-media.json)

<sub>Remotion zoom-out, 2026-11-15 · 4.0.542 · rendered from the first-sound project with `--props='{"audio":"media"}'` · the sample comparison was made with numpy on the decoded audio · by the shop-tests-motion session</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-5ace8f0d9e" -->
### 2026-11-14 — Kuramoto phenomena walk re-render, study

taught item 3
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-51c0f027ae" -->
### 2026-05-26 — Kuramoto phenomena walk, study

taught items 1, 2
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
