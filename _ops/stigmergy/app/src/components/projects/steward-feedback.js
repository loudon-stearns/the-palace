// The one line a steward act earns, worded the same whether it was clicked on
// the PROJECTS table or on a scroll opened from any deck. Each takes the
// adapter's reply and returns { tone, text } for the feedback line.

export function advanceFeedback(name, r) {
  if (r.ok && r.fired) return { tone: 'ok', text: `advancing ${name} -> cycle ${r.cycle_n}${r.run && r.run.cap > 1 ? ` (a run of up to ${r.run.cap} cycles -- it stops early on a blocking ask, a stall or a usage limit)` : ''}` };
  if (r.ok && r.queued && r.already === 'running') return { tone: 'dim', text: `${name} is the live cycle` };
  if (r.ok && r.queued && r.already) return { tone: 'dim', text: `${name} is already queued (#${r.already})` };
  if (r.ok && r.queued) return { tone: 'ok', text: `${name} queued #${r.position} behind ${r.current || 'the live cycle'} — it fires when the lane frees` };
  if (r.status === 409 || r.busy) return { tone: 'warn', text: 'a steward cycle is already running' };
  if (r.status === 404) return { tone: 'err', text: `no steward registered for "${name}"` };
  return { tone: 'err', text: r.error || r.msg || `advance failed (${r.status ?? '?'})` };
}

export function enchantFeedback(name, r) {
  if (r.ok && r.result === 'enchanted') return { tone: 'ok', text: `${name} has a steward now (${r.slug}) — advance it when you're ready` };
  if (r.ok && r.result === 'already_enchanted') return { tone: 'dim', text: `${name} already has a steward (${r.slug})` };
  if (r.status === 404) return { tone: 'err', text: `no project entry found for "${name}"` };
  return { tone: 'err', text: r.error || (r.errors ? r.errors.join('; ') : `add steward failed (${r.status ?? '?'})`) };
}

// Why a run ended, in the deck's words (steward-lane.js stopReason, the batch
// limits, and the usage limit). Anything unknown reads as it came.
export const STOP_WORDS = {
  run_cap: 'ran its cycles',
  paused_on_loudon: 'paused -- a blocking ask waits on you',
  wants_a_session: 'paused -- it asks for a live session',
  stalled: 'stalled -- two barren cycles in a row',
  barren: 'barren -- it posted nothing',
  spawn_failed: 'the worker never spoke',
  interrupted: 'the worker was cut off',
  usage_limit: 'the usage limit hit',
  batch_limit: 'a batch limit hit',
};

// The one line a scroll shows for its steward's last run, from the lane's
// last_cycle record (2026-11-03): which cycle, how far through the run it got,
// and why it stopped -- "early" when it ended before its cap. null when the
// record is not this steward's or carries no run.
export function runEndedFeedback(name, last) {
  if (!last || last.name !== name || !last.run) return null;
  const run = last.run;
  // No verdict yet (a stub fire, or a record from before the reap wrote one): nothing to say.
  if (!run.continued && !run.stopped_because && !last.stop_hint) return null;
  const cap = Number.isInteger(run.cap) ? run.cap : 1;
  const position = Number.isInteger(run.position) ? run.position : 1;
  const where = `cycle ${last.cycle_n ?? '?'} · ${position}/${cap} of the run`;
  if (run.continued) return { tone: 'dim', text: `last run: ${where} -> continuing` };
  const reason = run.stopped_because || last.stop_hint || 'unknown';
  const why = STOP_WORDS[reason] || String(reason).replace(/_/g, ' ');
  const early = reason !== 'run_cap' && position < cap;
  const tone = reason === 'run_cap' ? 'ok' : (reason === 'spawn_failed' || reason === 'interrupted' || last.ok === false) ? 'err' : 'warn';
  return { tone, text: `last run: ${where} · ${early ? 'stopped early: ' : ''}${why}` };
}
