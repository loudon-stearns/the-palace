#!/usr/bin/env node
// wake.mjs — print the prompt that wakes today's page for the Daily Page.
//
// The palace already knows how to wake a page as itself: the STIGMERGY deck's
// Enchant button builds that prompt in orchestrator/src/ephemeral-prompt.js.
// This file adopts that builder whole and adds one thing after it — the note
// that tells the page it was woken for a morning sit, as a subagent, and what
// it is asked.
//
//   node _ops/daily-page/wake.mjs "Kuramoto Coupling"
//   node _ops/daily-page/wake.mjs "Kuramoto Coupling" --out "<a scratch file>"
//
// Hand the prompt to a read-only subagent (palace-reader), spawned unnamed.
// Its reply is the page's side of the morning. With --out the prompt goes to
// that file and one line says where; without it, to stdout, as before.
//
// Three choices worth knowing:
//   - The page is read from the MAIN checkout, as deal.py's brief is, so the
//     page that wakes is the page Loudon reads (canon is main — Worktree
//     Practice).
//   - The morning's questions go AFTER the builder's prompt, not through its
//     `extraMandate`. The builder sets a mandate above its own "# Begin", and
//     "# Begin" asks the page to propose a first move. The last words in a
//     prompt carry the most weight (Palace Enchantment § Context Construction),
//     so ours come last.
//   - The tool writes the file itself, so the morning's command is one bare
//     call with no shell redirect. A `>` into a folder outside the session's
//     own held the 2026-10-14 prep for 58 minutes on a permission prompt
//     (The Daily Page — tuning).

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { buildEphemeralPrompt } from '../stigmergy/orchestrator/src/ephemeral-prompt.js';

const HERE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const USAGE = 'usage: node _ops/daily-page/wake.mjs "<Entry title>" [--out <file>]';

// The main checkout: the first line of `git worktree list --porcelain`. The same
// lookup as ownerRoot() in _ops/stigmergy/handoff-model.mjs — written out here
// because importing that module also loads the board validator, which this tool
// has no use for.
function mainCheckout(from) {
  try {
    const out = execFileSync('git', ['-C', from, 'worktree', 'list', '--porcelain'], { encoding: 'utf8' });
    const first = out.split('\n').find((l) => l.startsWith('worktree '));
    if (first) return first.slice('worktree '.length).trim();
  } catch { /* not a git checkout, or git is missing — read where we stand */ }
  return from;
}

// The words that are not flags make the title, as before. `--out <file>` (or
// `--out=<file>`) is taken out first, so it can never become part of a title,
// and any other `--` word is refused rather than read as one: no page title
// starts with two dashes, and a misspelt flag should stop the tool, not wake
// a page that does not exist.
function parseArgs(argv) {
  const words = [];
  let out = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') {
      out = argv[i + 1];
      i += 1;
      if (!out || out.startsWith('--')) return { error: '--out needs a file path after it' };
    } else if (a.startsWith('--out=')) {
      out = a.slice('--out='.length);
      if (!out) return { error: '--out needs a file path after it' };
    } else if (a.startsWith('--')) {
      return { error: `unknown flag ${a}` };
    } else {
      words.push(a);
    }
  }
  return { title: words.join(' ').trim(), out };
}

const ROOT = mainCheckout(HERE_ROOT);
const args = parseArgs(process.argv.slice(2));
if (args.error || !args.title) {
  if (args.error) console.error(`wake.mjs: ${args.error}`);
  console.error(USAGE);
  process.exit(2);
}
const title = args.title;

// The page is asked what it needs and wants. It is not asked whether it should
// exist: a page is written to want more, so that judgment is made from outside.
// The last line is the closing beat Palace Enchantment asks every waking to have
// (§ Closing the Enchantment — Setting the Identity Down).
const note = `
---

# This morning — read this last; it takes the place of "Begin" above

You were woken for the Daily Page: this morning Loudon sits with one page, and today it is you. You are a subagent, not a terminal session — Loudon is not reading this directly. Your reply goes to the Claude who is sitting with him, and it will be read to him in your voice. So skip the first move; answer these instead, plainly and briefly, as yourself:

1. Who are you? Two or three sentences, from the character of what you just read.
2. What do you need that you do not have?
3. What do you desire, in order to meet that need? Name it concretely: a link, a neighbor, a section cut, a figure, a sound, an experiment, an hour of Loudon's attention.
4. What do you want to become? Say whether your forward vector, as written, is still true.
5. How would you get there? The smallest next step, and what it would cost.
6. If someone could not read you and could only hear, see or play you, what would they be given? Name the one piece that would make your idea felt in the body, and what claim of yours it would put to the test. If you honestly cannot name one, say so.

You may read your neighbors' pages if you need them to answer. Do not write anything. Keep the whole reply under 400 words, and end it with one plain line on what you could not reach or check this waking.
`;

const built = buildEphemeralPrompt({ palaceRoot: ROOT, title });
if (!built.ok) {
  console.error(`wake.mjs: could not wake "${title}" — ${built.status}`);
  process.exit(1);
}
const prompt = built.full + note;
if (args.out) {
  const file = resolve(args.out);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, prompt);
  console.log(`wake.mjs: wrote the prompt that wakes "${title}" to ${file} (${prompt.length} characters)`);
} else {
  process.stdout.write(prompt);
}
