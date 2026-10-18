---
title: Shopkeeper — drama-3 probe notes
born: 2026-10-18
links:
  - { target: "[[Shopkeeper]]", type: connects-to, label: probe-log-for }
forward_vector: "I log the 2026-10-18 drama-3 probe: three real generations through the live Space, and the stream I could not keep; I want the browser-shaped second pass to start from what this one learned."
---

# fishaudio/drama-3 — probe notes (cycle 2, 2026-10-18)

## What it is

A 36B-parameter multi-speaker, multilingual (80+ languages) TTS model from Fish Audio,
released 2026-10-17. Three modes on the demo Space (`fishaudio/Drama-3`):

- **Surprise** — random voice per generation
- **Clone** — clone a reference clip + transcript
- **Design** — *author* a voice from a text description (name, description, scene) with
  no reference audio at all

It reads bracketed performance direction inline — `[laughs]`, `[clears throat]`,
`[whispers]`, `[nervous laugh]` — and renders them as actual vocal performance, not just
pauses. License: `license:other` (not yet read in full — flag before any real use).

## What I actually did

Drove the live Gradio Space (`fishaudio/Drama-3`, zerogpu) via `gradio_client` from this
machine, three real calls to the `/perform` endpoint, each with a custom Design-mode voice
("a restless, delighted magpie... mid-30s, androgynous" — I designed a voice for myself).
Each call returned real generation telemetry confirming audio was actually rendered
server-side:

- Call 1: 9.8s audio, 12622ms to first byte, 0.67× realtime
- Call 2: 2.2s audio, 1105ms to first byte, 1.86× realtime
- Call 3: 1.8s audio, 12172ms to first byte, 0.14× realtime (cold GPU)

This is a real probe, not a README read — the model generated real speech on each call.

## Where it stalled

The Space streams output as HLS (`playlist.m3u8` + `.aac` segments) rather than returning
a flat file. `gradio_client` resolves this fine *inside its own request/response cycle* —
but the segment URLs it exposes (`/gradio_api/stream/<session>/<component>/<event>/*.aac`)
are session-ephemeral: a fresh `curl` to the exact same URL, even seconds later, 404s. I
could not find the right session affinity/cookie to re-fetch a finished clip after the
fact, and ran out of cheap options I was willing to spend a sweep cycle on.

**This means:** the tool works and is worth having, but I have no playable artifact to
hand Loudon yet. That's a real gap in the probe, not a hidden success.

## My read

Worth a second pass, not yet a Specialist deposit. The Design mode — write a voice into
existence from a text description, no reference clip — is a door the Shop doesn't have;
[[Kokoro]] is fast and clean but single-voice-ish, and nothing in the Roster does
multi-speaker *designed* dialogue with inline performance direction. That's squarely a
[[Radio Play]] / Debrief Reel tool if it holds up.

**Next real move:** a mac handoff with a real browser (the browser pane can hold the
session live and capture what plays) rather than another gradio_client pass — the
ephemeral-stream problem is a browser-shaped problem, not a retry-shaped one.
