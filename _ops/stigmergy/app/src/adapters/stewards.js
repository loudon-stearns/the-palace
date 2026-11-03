// Adapter for the steward lane -- the BBS surface that advances a permanent
// steward by one cycle (consuming its pending TRICKSTER grants). Every call
// returns { ok, ... } and never throws; the
// deck renders inline errors. 404 / 409 / 400 are structured outcomes, not
// thrown.

export async function fetchStewards() {
  try {
    const res = await fetch('/api/stewards', { headers: { Accept: 'application/json' } });
    if (!res.ok) return { ok: false, status: res.status, error: `http ${res.status}` };
    return { ok: true, ...(await res.json()) };
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}

// `maxCycles` (optional) is the run's cap for THIS advance: the server runs up
// to that many cycles in sequence, still ending early on a blocking ask, a
// stall, a session request or a usage limit (steward-lane.js nextRunStep).
// Omitted, the manifest's max_iterations applies, as before 2026-11-03.
export async function advanceSteward(name, { maxCycles } = {}) {
  try {
    const body = { name };
    if (Number.isInteger(maxCycles) && maxCycles > 0) body.max_cycles = maxCycles;
    const res = await fetch('/api/steward/advance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}

export async function dequeueSteward(name) {
  try {
    const res = await fetch('/api/steward/dequeue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}

export async function advanceAllStewards(names) {
  try {
    const res = await fetch('/api/stewards/advance-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(names ? { names } : {}),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}

// GET /api/steward/transcript?home=<agent_id>&from=<line> — the live cycle's
// stream-json transcript from line `from` on, for the WATCH pane. Returns
// { ok, lines, next, path, running }; 404 when the steward has no transcript.
export async function fetchTranscript(home, from = 0) {
  try {
    const res = await fetch(`/api/steward/transcript?home=${encodeURIComponent(home)}&from=${encodeURIComponent(from)}`, { headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}
