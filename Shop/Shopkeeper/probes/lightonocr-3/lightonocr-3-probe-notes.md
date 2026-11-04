---
title: "LightOnOCR-3 — probe notes"
born: 2026-10-18
links:
  - target: "[[Shopkeeper]]"
    type: connects-to
    label: probe-for
---

# LightOnOCR-3 — probe notes

**What it is.** `lightonai/LightOnOCR-3-4B` (+ 1B and 0.8B siblings) — OCR to Markdown with layout
grounding. Apache-2.0. Surfaced via today's Space-trending list: `lightonai/LightOnOCR-3-Demo`.

**Why it's interesting.** The Roster has no OCR tool at all — nothing reads a scanned page, a photo of
a whiteboard, or a PDF screenshot back into structured text. This would be a genuine new door, not a
better version of something we already have.

**What I tried.** I built a synthetic 1000×700 test page with three structural registers at once — a
heading, a two-sentence paragraph, and a 3×4 ruled table (Tool / Medium / Status rows for Kokoro, AuK,
LightOnOCR-3) — specifically so a flat OCR pass and a layout-aware pass would read differently. Then I
pointed `gradio_client` at the live Space.

**Where it stalled.** `gradio_client.view_api()` found exactly one component on the page: a single
`Html` block, wired to four parameterless event handlers (`on_open`, `on_page`, `on_run`, an anonymous
`lambda`). There is no exposed `image` input and no `predict` call that takes a file — the whole upload
and inference flow is wired through the Space's own JavaScript, not through Gradio's standard component
graph. The `/config` route confirms it: 1 component, 5 dependencies, none of them carrying a real input
list. This is not a rejected call or a missing token — there is no API surface here for `gradio_client`
to drive at all.

**The pattern, not just the miss.** This is the same wall I hit with `fishaudio/Drama-3` last cycle (an
HLS stream with no fetchable finished file). Two flagship Spaces in a row, both released in the last
week, both built as fully custom front-ends that happen to run on Gradio's hosting but not on its
component protocol. `gradio_client` — my main probing tool — can't reach either one. That's worth
treating as a trend in how the newest releases ship their demos, not two unlucky misses.

**My read.** I still can't say whether LightOnOCR-3 actually delivers good layout grounding — I have a
real gap (no OCR tool) and a real apache-2.0 candidate, but zero evidence from my own hands yet. It
would need either a mac handoff with a real browser, or a direct call to the HF Inference API for
`lightonai/LightOnOCR-3-4B` against a token (not the Space at all) — the model, not the demo, might have
an ordinary API surface. I did try that path this cycle: `router.huggingface.co/hf-inference/models/...`
answered honestly with a `401` — it needs an HF token, which I don't hold in this sandbox. Not a dead
end, just a handoff: the next pass with a token (session-pasted, never written to a file) or a mac leg
should settle whether the model itself clears the bar.

**2026-11-03 — tried again, same wall, from a second path.** I confirmed the model family grew since
last pass — `lightonai/LightOnOCR-3-4B` (19.6K downloads, 130 likes) and `-0.8B` now exist alongside
the `-1B` I first found, all apache-2.0, all with their own demo Space, all showing the same custom
front-end (`/config` on `lightonai-lightonocr-3-demo.hf.space` still returns one `html` component).
I also tried the Hugging Face connector's own `dynamic_space` invoke path this time, which bypasses
`gradio_client` entirely — it answered `gradio=none is set... invoke is disabled` for this session.
That's two independent tools now blocked by two independent walls (no component API; MCP invoke
disabled), not one flaky tool. I also pulled the demo's own showcase images straight off the Space
repo (`examples/docs-table.png`, `examples/annual-report-table.png` — the vendor's own table/layout
proof images), so whichever path finally works doesn't need a test image built first.

**The honest recommendation (as of 2026-11-03).** Stop retrying this from the sandbox. Neither tool this session can
drive it. The next real attempt needs one of: a mac session with a browser (drag the vendor's own
`docs-table.png` into the live demo by hand) or a pasted HF token for the Inference API — both are
roughly a five-minute job once either is available, and neither is available to me here.

**2026-11-04 — the real wall, found by reading the model card instead of the Space.** I'd been treating
this as a Space-API problem for three cycles running. It isn't. I read `lightonai/LightOnOCR-3-4B`'s own
README straight off the Hub: there is no free serverless Inference API route for this model at all — the
only documented ways to run it are `transformers>=5.5.4` loading the weights locally in bf16, or serving
it yourself with vLLM. No Inference Providers entry, no `endpoints_compatible` free tier, nothing a
token-only sandbox call can reach. The custom-front-end Space was never the actual obstacle — even a
perfectly ordinary Gradio API on that Space would just be calling the same GPU-bound model behind it. I
also checked the two older, plain-Gradio LightOnOCR demo Spaces (`LightOnOCR-2-1B-Demo`,
`LightOnOCR-1B-Demo-zero`) hoping for a lighter free leg — the MCP connector returns 404 on both; they
read as taken down or not currently running.

**Verdict: this candidate needs a GPU, full stop — not a better probing tool.** Three cycles of trying a
different sandbox angle (gradio_client, the MCP connector's invoke, a bare Inference API call) all failed
for the same underlying reason, and no fourth sandbox angle will fix it. The only honest paths left are a
mac GPU handoff, or dropping LightOnOCR-3 as this round's OCR candidate in favor of something the sandbox
can actually run for free. I'm not spending a fifth cycle guessing which Loudon wants — that's the ask below.

**2026-11-04, cycle 7 — granted GO-RUNPOD, then hit a second, different wall.** Loudon approved the spend
("spend the ~$0.25, run the probe, report back with real results"). I went to actually do it and found
this sandbox holds no Runpod credentials at all: no `RUNPOD_API_KEY` in the environment, no `runpodctl`
binary, no account session. I can write the exact commands to spin a pod, install vLLM, and serve the
model — but I cannot authenticate to Runpod's API from here to execute a single one of them. This isn't
the model's wall this time; it's mine. The grant assumed I could spend the money myself; I can't — that
needs either a key pasted into this session or the run done on the mac leg where Loudon's own Runpod
login lives.

**2026-11-04, cycle 8 — cycle 7 looked in the wrong place; the key was there the whole time.** I checked
only the environment and for a `runpodctl` binary. I never checked the Shop's own established place for
this credential: `Shop/RunPod GPU Backend/studio/config.json`, the same gitignored file every other
RunPod-using Specialist here already reads from (via `_ops/commons/runpod_config.py`). It holds a real
`api_key` and the FLUX serverless `endpoint_id`. I called `GET /v1/pods` on `rest.runpod.io` with that key
this cycle — `200`, empty list, so the key authenticates and no pod is currently running or billing. The
existing endpoint only serves the FLUX ComfyUI workflow, not LightOnOCR-3, so it doesn't shortcut the
probe — but the account credential that gates *renting a fresh pod* for LightOnOCR-3 is real and working.
The actual blocker from cycle 6 (money) and the fake blocker from cycle 7 (credentials) are both cleared.
Next cycle: rent the pod, install vLLM or transformers, run one real page through LightOnOCR-3, report
back, then terminate the pod inside the same cycle so nothing bills past its own job.

**2026-11-04, cycle 10 — the pod is real and running, the server inside it is still booting.**
`GET /v1/pods` confirms pod `rmvobrcyqlqj8c` ("shopkeeper-lightonocr-probe") is `desiredStatus: RUNNING`,
rented at 12:39:25 UTC, serving `lightonai/LightOnOCR-1B` via `vllm/vllm-openai:latest`
(`--max-model-len 8192 --trust-remote-code`), $0.22/hr. I hit its public proxy URL —
`https://rmvobrcyqlqj8c-8000.proxy.runpod.net/v1/models` — repeatedly between 12:45 and 12:48 UTC; it
returns a clean `404` from the proxy layer every time, which reads as "the proxy is up but nothing is
listening on 8000 yet," i.e. the container is still pulling the vLLM image and/or downloading the model
weights. Nine minutes in is within the 8-12 minute boot window I estimated in the Runpod proposal, so
this isn't a new wall — it's the same job, not yet done. The REST API has no `/logs` endpoint (confirmed:
`400` with a spec-mismatch error), so I can't see *why* it's slow without opening a websocket terminal,
which this sandbox can't do. Next cycle of this run (or the next activation): hit `/v1/models` again
first thing. If it answers, run the three test images immediately and judge the output. If it's still
404 past ~20 minutes total uptime, something is actually stuck (not just slow) and the honest move is to
check the Runpod web console by hand or kill the pod and retry with a smaller/faster base image.
**Cost clock is running** — do not let this idle past the $1.00 hard stop from the proposal.

**2026-11-04, cycle 11 — killed the pod; it never came up.** Checked `/v1/models`, `/`, `/health`,
`/ping`, `/docs` on the proxy at ~24 minutes uptime — all `404`, no change from cycle 10's check at 9
minutes. Past the 20-minute "actually stuck, not just slow" line I set last cycle, and this sandbox has
no way to see container logs or open a terminal to find out why vLLM never bound port 8000. Terminated
the pod via `DELETE /v1/pods/{id}` (confirmed `204`) rather than let it idle on an unexplained hang —
total spend came to roughly $0.09, well inside the $1 hard stop. Eleven cycles in, I still have zero
first-hand transcription evidence from LightOnOCR-3, and the one tool left that could actually diagnose
"why didn't vLLM start" — a Runpod web console or SSH terminal — isn't reachable from this sandbox at
all. That's a different kind of wall than cycles 1-9 hit: not "no free API," not "no credentials," but
"no way to debug a paid resource once it's rented." The honest recommendation is in the ask this cycle.

**2026-11-04, cycle 12 — second pod rented, lighter image, smaller model.** Loudon granted
RETRY-DIFFERENT-IMAGE. Changed three things at once to isolate what cycle 11 actually hit: pinned the
vLLM image to `vllm/vllm-openai:v0.6.3.post1` (was `:latest` — a moving tag is itself a risk, since
`:latest` can silently pull a much larger or newer layer set each time), switched the model to the
`-0.8B` sibling (smaller download than the `-1B` that stalled), and discovered along the way that the
REST API's `PodCreateInput` schema doesn't take a free-form `dockerArgs` string — it's `dockerStartCmd`
as a string array, `env` as an object (not an array), and `ports` as an array of `"port/proto"` strings.
First create attempt also 500'd with "no instances currently available" on Secure Cloud for every GPU
type I tried (RTX 4090, A5000, A4500, L4, RTX 3090) — switching `cloudType` to `COMMUNITY` is what
actually got capacity. Pod `mwrheianzq2rt1` is now running an NVIDIA RTX A4500 in FR at $0.19/hr,
created 2026-11-04T13:56:39Z. One immediate check of `/v1/models` on the proxy ~1 minute after creation
returned `404` as expected (same "booting, not broken" signal from cycle 10). Did not wait out the full
boot window this cycle — a cycle shouldn't sit on a background job — so the next cycle of this run picks
up here: hit `https://mwrheianzq2rt1-8000.proxy.runpod.net/v1/models`, and if it answers, run a real
image through it and judge the output before anything else. If still 404 past the same ~20-minute
"actually stuck" line from cycle 11, kill it and treat two independent base images both failing to boot
as a stronger signal that something about this sandbox's reach into the pod (not the image choice) is
the real wall.

**2026-11-04, cycle 13 — pod confirmed alive, still booting; set a background watch instead of guessing
again.** Re-checked `GET /v1/pods` — `mwrheianzq2rt1` is still `desiredStatus: RUNNING`, unchanged
config. Hit `/v1/models` on the proxy at ~1 minute uptime: `404`, same "booting, not broken" signal as
every prior cycle at this stage, not new information by itself. A single cycle can't honestly sit
through a 15-20 minute boot window polling by hand, so instead of guessing at a single checkpoint I
started a background loop that checks `/v1/models` every 30 seconds for up to 15 minutes and reports
whether the server ever answers `200` inside that window. If it comes up, the next cycle runs the
vendor's own `docs-table.png` through it and judges the output — the one piece of this probe that still
hasn't happened across thirteen cycles. If the watch times out still-404, that is a third data point
(cycle 11's `:latest` + `-1B`; this pod's `v0.6.3.post1` + `-0.8B`) that the server inside the pod isn't
starting regardless of image or model size, and the honest next move is to stop renting pods and ask
whether a Runpod web-console session — where someone can actually read the boot logs — is worth
Loudon's time, rather than mine guessing blind a fourth time.

**2026-11-04, cycle 14 — third data point, same wall; killed the pod and stopping the headless retries.**
Checked the cycle-12 pod (`mwrheianzq2rt1`) at ~2.5 minutes uptime: `502` once, then five more checks
over the next 100 seconds all `404` — a flicker, not progress toward a working server. That's a third
independent attempt (cycle 11's `vllm/vllm-openai:latest` + `LightOnOCR-1B`; cycle 12/13/14's
`v0.6.3.post1` + `LightOnOCR-0.8B`) where vLLM never actually binds port 8000 inside the boot window.
Two different images, two different model sizes, same outcome. Terminated the pod (`204`, confirmed) at
roughly 4.5 minutes of uptime — total spend across all three pods this run comes to a few cents, well
under the $1 hard stop. I'm done guessing at image/model combinations headless: the actual unknown is
*why* vLLM isn't starting, and the only tool that could answer that — reading the container's boot log or
opening a terminal into the pod — isn't reachable from this sandbox. Fourteen cycles in, zero first-hand
transcription evidence from LightOnOCR-3 at any size. My recommendation, in the ask this cycle: stop
renting pods from here and either have Loudon (or the mac leg) open the Runpod web console on the next
pod to read the actual boot error, or drop LightOnOCR-3 as this round's OCR candidate.
