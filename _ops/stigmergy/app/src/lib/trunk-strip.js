// trunk-strip.js -- the LOG deck's trunk strip in words. Pure: it takes the
// object `scripts/trunk-state.mjs --json` prints (served at /api/trunk-state,
// with the read's time as `ts`) and returns the strip's few short phrases, so
// the wording is testable without a DOM or a server.
//
// Each phrase is { key, parts, text, tone, title }: parts are runs of text with
// a tone, text is the parts joined, tone is the loudest part's, title is the
// longer story for a hover. Tones, quietest first:
//   dim   -- context
//   plain -- a count worth reading
//   warn  -- worth a look
//   loud  -- something to act on: a move of main around the door, a landing
//            that died halfway, main and origin diverged, a push that failed.

const RANK = { dim: 0, plain: 1, warn: 2, loud: 3 };
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const dim = (text) => ({ text, tone: 'dim' });
const plain = (text) => ({ text, tone: 'plain' });
const warn = (text) => ({ text, tone: 'warn' });
const loud = (text) => ({ text, tone: 'loud' });

const plural = (n, one, many = `${one}s`) => (n === 1 ? one : many);

function phrase(key, parts, title = '') {
  const kept = parts.filter((p) => p && p.text);
  const tone = kept.reduce((t, p) => (RANK[p.tone] > RANK[t] ? p.tone : t), 'dim');
  return { key, parts: kept, text: kept.map((p) => p.text).join(''), tone, title };
}

// An age the way trunk-state's own report says it: minutes under an hour,
// hours under two days, days after.
export function ageText(ms) {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return 'n/a';
  const h = ms / 3600000;
  return h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} days`;
}

// The ear's window, from the since the script was asked for to the read's time:
// "24h", or whole days past two.
export function windowLabel(sinceIso, tsIso, now = Date.now()) {
  const since = Date.parse(sinceIso || '');
  const at = Date.parse(tsIso || '') || now;
  if (!Number.isFinite(since)) return 'window';
  const hours = Math.max(1, Math.round((at - since) / 3600000));
  return hours >= 48 && hours % 24 === 0 ? `${hours / 24}d` : `${hours}h`;
}

// A day in local time, "oct 19"; the year joins when it is not this one.
export function shortDate(iso, now = Date.now()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'an unknown day';
  const year = d.getFullYear() === new Date(now).getFullYear() ? '' : ` ${d.getFullYear()}`;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}${year}`;
}

// Where an unsaved path sits, as trunk-state groups it: its top folder, or two
// deep under Projects/ and _ops/.
export function placeOf(path) {
  const p = String(path || '');
  return p.split('/').slice(0, p.startsWith('Projects/') || p.startsWith('_ops/') ? 2 : 1).join('/');
}

export function trunkStrip(state, { now = Date.now() } = {}) {
  if (!state || typeof state !== 'object') return [];
  const at = Date.parse(state.ts || '') || now;
  const out = [];

  // main against origin
  const r = state.remote || {};
  const fetched = r.fetchedMs ? `origin as last fetched, ${ageText(at - r.fetchedMs)} ago` : 'origin never fetched here';
  if (r.ahead === null || r.ahead === undefined) {
    out.push(phrase('remote', [dim('main '), dim('has no origin to compare')]));
  } else if (r.behind > 0) {
    out.push(phrase('remote', [dim('main '), loud(`diverged from origin: ${r.ahead} ahead, ${r.behind} behind`)],
      `a push would not be a fast-forward; ${fetched}`));
  } else if (r.ahead === 0) {
    out.push(phrase('remote', [dim('main '), plain('even with origin')], fetched));
  } else {
    out.push(phrase('remote', [
      dim('main '), plain(`${r.ahead} ahead of origin`),
      dim(r.oldestMs !== null && r.oldestMs !== undefined ? `, oldest unsent ${ageText(r.oldestMs)}` : ''),
    ], fetched));
  }

  // the last push receipt
  const p = state.lastPush;
  if (!p) {
    out.push(phrase('push', [dim('last push '), dim('none on record')]));
  } else {
    const count = Number.isFinite(p.count) ? `, ${p.count} ${plural(p.count, 'commit')}` : '';
    const when = typeof p.ts === 'string' ? `${p.ts.slice(0, 16).replace('T', ' ')} UTC` : 'at an unknown time';
    out.push(phrase('push', [
      dim('last push '), plain(`${shortDate(p.ts, at)}${count}`),
      ...(p.ok === false ? [dim(', '), loud('FAILED')] : []),
    ], `${when}, ${p.ok === false ? 'failed' : 'sent'}, gate ${p.gate || 'n/a'}`));
  }

  // what the ear heard: moves of main through the door, and around it
  const e = state.ear || {};
  const around = Array.isArray(e.around) ? e.around : [];
  if (!e.installed && !e.moves) {
    out.push(phrase('ear', [dim('the ear '), warn('is not installed')]));
  } else {
    const lead = e.partial ? 'the ear, since it began listening: ' : `the ear in ${windowLabel(state.since, state.ts, now)}: `;
    const named = around.slice(0, 10).map((a) => `around: ${String(a.ts || '').slice(11, 16)} ${String(a.new || '').slice(0, 8)} by ${a.caller || '?'}${a.cwd ? ` in ${a.cwd}` : ''}`);
    out.push(phrase('ear', [
      dim(lead), plain(`${e.door ?? 0} through the door`), dim(', '),
      around.length ? loud(`${around.length} around`) : dim('0 around'),
      ...(e.installed ? [] : [dim(', '), warn('not installed now')]),
    ], named.join('\n')));
  }

  // a landing that died halfway, or one under way
  const m = state.marker;
  if (m) {
    const branch = m.branch ? `: ${m.branch}` : '';
    if (m.state === 'died') {
      out.push(phrase('landing', [loud('a landing died halfway, waiting to be healed'), dim(branch)],
        'the next pass through the door finishes or undoes it'));
    } else if (m.state === 'in progress') {
      out.push(phrase('landing', [warn('a landing is under way'), dim(branch)]));
    } else {
      out.push(phrase('landing', [loud('a landing marker is unreadable')], 'the next pass through the door will look at it'));
    }
  }

  // what sits unsaved in the main checkout
  const rows = Array.isArray(state.unsaved) ? state.unsaved : [];
  if (rows.length === 0) {
    out.push(phrase('unsaved', [dim('nothing unsaved in main')]));
  } else {
    const places = {};
    for (const row of rows) { const k = placeOf(row.path); places[k] = (places[k] || 0) + 1; }
    const n = Object.keys(places).length;
    const list = Object.entries(places).sort((a, b) => b[1] - a[1]).map(([k, c]) => `${k}: ${c}`);
    out.push(phrase('unsaved', [dim('unsaved in main: '), plain(`${rows.length} ${plural(rows.length, 'path')} in ${n} ${plural(n, 'place')}`)], list.join('\n')));
  }

  // branches holding work not on main
  const unmerged = Array.isArray(state.unmerged) ? state.unmerged : [];
  if (unmerged.length === 0) {
    out.push(phrase('branches', [dim('every branch is on main')]));
  } else {
    out.push(phrase('branches', [
      plain(`${unmerged.length} ${plural(unmerged.length, 'branch', 'branches')}`),
      dim(` ${unmerged.length === 1 ? 'holds' : 'hold'} work not on main`),
    ], unmerged.join('\n')));
  }

  return out;
}

// The strip as one line of plain text, the way it reads on the deck.
export function trunkLine(state, opts) {
  return trunkStrip(state, opts).map((p) => p.text).join(' · ');
}
