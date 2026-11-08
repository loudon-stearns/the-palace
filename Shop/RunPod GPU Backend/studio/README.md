# Palace Studio

A tiny local web app to generate images on your RunPod FLUX endpoint and keep
every result (with its prompt) on disk. Your prompts go to the GPU **verbatim**.

## Run

Double-click **`Palace Studio.command`**: it starts the app, scales the endpoint up, opens Chrome,
and on quit stops the app and releases the endpoint (`Stop Palace Studio.command` does the release
if the window closed uncleanly). Or run it bare:

```bash
cd "The Palace/Shop/RunPod GPU Backend/studio"
export RUNPOD_API_KEY=your_key
export RUNPOD_ENDPOINT_ID=iy3ybd7qjl2trj      # the palace-flux endpoint
python3 palace_studio.py
```

Then open **http://localhost:8765**. Type a prompt, set size/seed/steps if you
like, hit **Generate**. Finished images appear in the gallery and are saved to
`./images/` with a `index.json` recording the prompt and settings.

Instead of env vars you can drop a `config.json` next to the script:

```json
{ "api_key": "your_key", "endpoint_id": "iy3ybd7qjl2trj" }
```

(Keep that file private — it holds your key. Don't commit it.)

## Notes
- **The launchers scale the endpoint for you**, through the Shop's shared
  `EndpointWorkers`: it parks to 0 only once no one else is rendering, so quitting
  never strands an agent's job. Run bare, `palace_studio.py` scales nothing — the
  endpoint must already have workers.
- **Everything Runpod** — keys, the API, cold starts, traps: [[RunPod GPU Backend — runbook]].
- First generation after the endpoint sits idle is a **cold start** (a few
  minutes while the worker boots); after that, ~30s per image.
- Stdlib only — no `pip install`. The API key stays server-side (never sent to
  the browser), and RunPod calls are proxied, so there are no CORS issues.

_Loudon Live · Autodidact Polymaths_
