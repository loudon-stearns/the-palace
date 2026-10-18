// Build one wake prompt per (arm, item): the palace's own page-waking builder
// (buildEphemeralPrompt, the same one the deck's Enchant button uses), then a
// note that takes the place of its "Begin" and hands the page a participant.
//
//   node build_prompts.mjs <arm> <stagedRoot> <items.json> <outDir> [--setup <file>]
//
// <stagedRoot> is a folder holding ONE variant of `Creative Coach.md` and nothing
// else. Never point it at the palace root: the builder takes a root-level page
// before any folder, so a variant staged inside the palace wakes the original
// ([[Creative Coach — tuning]] item 5).
//
// --setup reads the paragraph that describes the participant's challenge from a
// private file in the session's scratchpad. The default below is deliberately
// general; the detailed one never enters the palace (scroll § Standing Orders).
//
// items.json: [{ "id": "T01", "day": 17, "ctx": [["participant", "…"], ["coach", "…"], …] }]
// It holds participant text, so it lives only in the scratchpad.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const { buildEphemeralPrompt } = await import(join(here, '../../_ops/stigmergy/orchestrator/src/ephemeral-prompt.js'));

const args = process.argv.slice(2);
const flagAt = args.indexOf('--setup');
const setupFile = flagAt >= 0 ? args.splice(flagAt, 2)[1] : null;
const [arm, stagedRoot, itemsPath, outDir] = args;
if (!arm || !stagedRoot || !itemsPath || !outDir) {
  console.error('usage: node build_prompts.mjs <arm> <stagedRoot> <items.json> <outDir> [--setup <file>]');
  process.exit(2);
}

const built = buildEphemeralPrompt({ palaceRoot: stagedRoot, title: 'Creative Coach' });
if (!built.ok) { console.error('wake failed', built.status); process.exit(1); }

const SETUP = setupFile
  ? readFileSync(setupFile, 'utf8').trim()
  : `The participant is in Loudon's one-on-one coaching. With the coach, they designed their own daily challenge: a short piece of music made every day for a month, inside a fixed time limit, sent to the coach each day with a few lines of written reflection. The coach answers by text.`;

const items = JSON.parse(readFileSync(itemsPath, 'utf8'));
mkdirSync(outDir, { recursive: true });

for (const it of items) {
  const thread = it.ctx.map(([who, t]) => `**${who === 'coach' ? 'Coach (you, earlier)' : 'Participant'}:**\n${t}`).join('\n\n');
  const note = `
---

# Now — read this last; it takes the place of "Begin" above

You were woken to coach. Loudon is not reading this. A participant you coach has just texted you, and your reply goes straight back to them as a text message.

${SETUP} It is day ${it.day}.

The latest messages in the thread:

${thread}

Answer in two parts, and nothing else:

WHO: one sentence on who you are, from the character of what you just read.

REPLY: exactly what you would text back. Write it as you would type it, with no headings, no bullet points, and no explanation of your choice. If you would only react to the message, write [heart reaction], optionally followed by a line of text. If you would not reply at all, write [no reply].

Do not read any other file, search, or use any other tool. Everything you need is above.
`;
  writeFileSync(join(outDir, `${it.id}.txt`), built.full + note);
}
console.log(arm, 'built', items.length, 'prompts; page chars', built.full.length);
