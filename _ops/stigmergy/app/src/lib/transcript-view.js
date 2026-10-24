/** Sum of a result line's usage token fields; null when there are none (tokens, never dollars — 2026-10-24). */
function tokensOf(u) {
  if (!u || typeof u !== 'object') return null;
  const n = ['input_tokens', 'output_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens']
    .map((k) => (typeof u[k] === 'number' ? u[k] : 0)).reduce((a, b) => a + b, 0);
  return n > 0 ? n : null;
}

// transcript-view.js — pure helpers for the WATCH pane: turn a steward cycle's
// stream-json transcript (the `claude -p --output-format stream-json` lines the
// lane captures to .actuator-steward/transcripts/) into a feed a person can
// read while the cycle runs (2026-10-13; Loudon: "can we see a steward's inner
// chain of thoughts and staging outputs as it works?").
//
// One transcript line → zero or more feed items:
//   { kind: 'thinking', text }            a thinking block that carries text
//   { kind: 'text', text }                the steward's prose
//   { kind: 'tool', name, verb, id }      a tool call, as its one-line verb
//   { kind: 'image', toolId, src, name }  an image the steward read (data: URL)
//   { kind: 'result', toolId, text }      a short tool result (long ones are cut)
//   { kind: 'done', reason, cost }        the run's result line
// Signature-only thinking blocks (no text) are skipped: the API returns those
// for most extended-thinking turns, and there is nothing to show.

const RESULT_CHARS = 400;

export function feedFromLine(line, { toolNames = new Map() } = {}) {
  let m;
  try { m = JSON.parse(line); } catch { return []; }
  if (!m || typeof m !== 'object') return [];
  const out = [];
  if (m.type === 'assistant' && m.message && Array.isArray(m.message.content)) {
    for (const c of m.message.content) {
      if (c.type === 'thinking' && typeof c.thinking === 'string' && c.thinking.trim()) out.push({ kind: 'thinking', text: c.thinking.trim() });
      else if (c.type === 'text' && typeof c.text === 'string' && c.text.trim()) out.push({ kind: 'text', text: c.text.trim() });
      else if (c.type === 'tool_use') {
        const name = c.name || 'tool';
        if (c.id) toolNames.set(c.id, { name, input: c.input || {} });
        out.push({ kind: 'tool', id: c.id || null, name, verb: toolVerb(name, c.input || {}) });
      }
    }
  } else if (m.type === 'user' && m.message && Array.isArray(m.message.content)) {
    for (const c of m.message.content) {
      if (c.type !== 'tool_result') continue;
      const call = c.tool_use_id ? toolNames.get(c.tool_use_id) : null;
      const parts = Array.isArray(c.content) ? c.content : (typeof c.content === 'string' ? [{ type: 'text', text: c.content }] : []);
      for (const p of parts) {
        if (p.type === 'image' && p.source && p.source.type === 'base64' && p.source.data) {
          out.push({ kind: 'image', toolId: c.tool_use_id || null, src: `data:${p.source.media_type || 'image/png'};base64,${p.source.data}`, name: call && call.input && call.input.file_path ? String(call.input.file_path).split('/').pop() : 'image' });
        } else if (p.type === 'text' && typeof p.text === 'string' && p.text.trim()) {
          const t = p.text.trim();
          // A Read of a file echoes the file back: skip those (they are the
          // steward's own inputs, not its outputs). Keep short command output.
          if (call && call.name === 'Read') continue;
          out.push({ kind: 'result', toolId: c.tool_use_id || null, text: t.length > RESULT_CHARS ? t.slice(0, RESULT_CHARS) + ' …' : t });
        }
      }
    }
  } else if (m.type === 'result') {
    out.push({ kind: 'done', reason: m.subtype || m.stop_reason || 'ended', tokens: tokensOf(m.usage), ms: typeof m.duration_api_ms === 'number' ? m.duration_api_ms : null });
  }
  return out;
}

/** The one-line verb for a tool call: its own description when it wrote one. */
export function toolVerb(name, input) {
  if (input && typeof input.description === 'string' && input.description.trim()) return input.description.trim();
  if (name === 'Read' && input && input.file_path) return `read ${String(input.file_path).split('/').pop()}`;
  if ((name === 'Write' || name === 'Edit') && input && input.file_path) return `${name === 'Write' ? 'write' : 'edit'} ${String(input.file_path).split('/').pop()}`;
  if (name === 'Bash' && input && typeof input.command === 'string') return input.command.replace(/\s+/g, ' ').slice(0, 120);
  if (name === 'Glob' || name === 'Grep') return `${name.toLowerCase()} ${input && (input.pattern || '') }`.trim();
  return name;
}

/**
 * Fold a batch of lines into a feed, carrying the tool-id → name map across
 * calls so a later tool_result can name the call it answers.
 */
export function feedFromLines(lines, state = { toolNames: new Map() }) {
  const items = [];
  for (const l of lines || []) if (l && l.trim()) items.push(...feedFromLine(l, state));
  return items;
}

/** How many feed items are worth keeping on screen before the oldest fold away. */
export const FEED_KEEP = 400;
