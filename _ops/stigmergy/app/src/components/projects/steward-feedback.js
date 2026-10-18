// The one line a steward act earns, worded the same whether it was clicked on
// the PROJECTS table or on a scroll opened from any deck. Each takes the
// adapter's reply and returns { tone, text } for the feedback line.

export function advanceFeedback(name, r) {
  if (r.ok && r.fired) return { tone: 'ok', text: `advancing ${name} -> cycle ${r.cycle_n}${r.run ? ` (a run of up to ${r.run.cap})` : ''}` };
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
  return { tone: 'err', text: r.error || (r.errors ? r.errors.join('; ') : `enchant failed (${r.status ?? '?'})`) };
}
