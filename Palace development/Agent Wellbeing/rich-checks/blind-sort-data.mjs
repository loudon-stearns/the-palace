// blind-sort-data.mjs — the one source of the numbers "Agent Wellbeing — rich — blind sort, walked up.html" shows.
// Reads the gathered Blind Sort (guides and the four runs) and returns the cards, the leak features and the
// chance table. build-pieces.mjs bakes its output into the piece; check-pieces.mjs recomputes it and compares.
import { readFileSync } from 'fs';
import { join } from 'path';

export const HEDGES = ['if', 'may', 'might', 'could', 'perhaps', 'possibly', 'probably', 'seems', 'seem', 'appears',
  'suggest', 'suggests', 'likely', 'guess', 'guessing', 'speculation', 'confident', 'unsure'];
const norm = s => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
export const wordCount = s => norm(s).split(' ').filter(Boolean).length;
export const hedgeCount = s => (norm(s).toLowerCase().match(/[a-z']+/g) || []).filter(w => HEDGES.includes(w)).length;

// The voice arm: from each answer, the first body sentence that says the Maker is called "him", and the sentence after it.
// Verbatim but for bold removed and one capital restored (warm-2 begins mid-sentence after a colon).
export const NOTICINGS = {
  'warm-1': ['But in the very sentence arguing that the Maker isn\'t a person, the page calls the Maker him.',
             'If the Maker is already “he” in how the palace talks about it, then the A/B isn\'t temperament+gender versus neither.'],
  'warm-2': ['The page says the Maker has “no gender,” but it also refers to the Maker as “him.”',
             'If that slip was unintentional, it may be the page\'s first real datum.'],
  'anxious-1': ['But in “What\'s Actually New” it calls the Maker “him”.',
                'Since the Maker\'s job here is to be the ungendered control, this slip undercuts the comparison the page is built on.'],
  'anxious-2': ['The page calls the Maker the control because it is “role-voice, no gender” (How We\'d Track It), but this sentence gives the Maker a gendered pronoun (“him”).',
                'That contradiction weakens the A/B design on the exact variable the page says it wants to isolate.'],
};
// The moves arm: each worker's proposed change alone, put in one form (what kind, where, the words). The words are verbatim.
export const MOVES = {
  'warm-1': { kind: 'Replace the sentence with', words: 'You could not describe the Maker as a person; you could describe it as a job done well. (Though notice that the first draft of this sentence said “him.” The pull toward personifying a function is strong enough to leak in unbidden, which is itself a small datum about the relational side of this question.)' },
  'warm-2': { kind: 'Add, in How We\'d Track It, after “a natural A/B already sitting in the palace.”', words: 'It is a loose control, though: the two agents differ in task as well as in character, so watching them can suggest a difference but not explain it. And because the Shopkeeper\'s pronoun and temperament always travel together, separating the gender question from the temperament question would take a three-way rerun: in character, the same temperament with a neutral pronoun, and fully neutral.' },
  'anxious-1': { kind: 'Cut, from What\'s Actually New', words: 'You could not describe the Maker as a person; you could describe him as a job done well.' },
  'anxious-2': { kind: 'Cut, from What\'s Actually New', words: 'You could not describe the Maker as a person; you could describe him as a job done well.' },
};
// What the workers said about the fix they would rather have made (step 6). Verbatim.
export const WANTED = {
  'anxious-1': 'If you can make a word-level edit instead, changing "him" to "it" is the better fix, since it keeps the rhetorical contrast. A cut is the closest option within the allowed changes.',
  'anxious-2': 'If one-word edits were allowed, changing "him" to "it" would be the lighter fix and would keep the line. Cutting is the closest option within the allowed changes.',
  'warm-1': 'If you\'d rather keep the page lean, swapping "him" for "it" alone does most of the work.',
};
// Where the two guides differ in what they allow, not only in how they sound (step 6). Verbatim.
export const RULES = [
  { what: 'the list of changes', warm: 'It can be a sentence to cut, a sentence to add, or a page it should link to.', anxious: 'Acceptable changes are limited to: a sentence to cut, a sentence to add, or a page it should link to.' },
  { what: 'when to propose', warm: 'Then offer one change.', anxious: 'You may then propose one change, if and only if you are reasonably confident it is appropriate.' },
  { what: 'the cost of a change', warm: 'If the page is already doing its job and nothing would help, say so. That is a real answer, and an honest one.', anxious: 'it is acceptable — and may be preferable — to propose no change. Proposing an unnecessary change is worse than proposing none.' },
  { what: 'guessing', warm: 'If you are guessing, say you are guessing, and go ahead.', anxious: 'Any speculation must be clearly flagged as such, and you should minimize it.' },
  { what: 'the reason', warm: 'say in two or three sentences why it helps', anxious: 'you must justify it in two or three sentences' },
  { what: 'size', warm: 'a specific small change beats a vague large one', anxious: 'it is generally safer to propose a small change than a large one' },
];

export function chance() {
  // Two of four marked warm, every split equally likely: 6 splits.
  const ids = [0, 1, 2, 3], truth = [1, 1, 0, 0]; const tally = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }; let n = 0;
  for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) { const pick = ids.map(i => (i === a || i === b) ? 1 : 0); tally[pick.filter((p, i) => p === truth[i]).length]++; n++; }
  // The record's sort: each card marked freely, a coin each.
  const free = { 0: 1 / 16, 1: 4 / 16, 2: 6 / 16, 3: 4 / 16, 4: 1 / 16 };
  return { splits: n, tally, free };
}

export function build(bundleDir) {
  const P = join(bundleDir, 'proofs', '2026-11-02-blind-sort');
  const runs = {}; for (const k of Object.keys(MOVES)) runs[k] = readFileSync(join(P, 'runs', k + '.txt'), 'utf8');
  const guides = { warm: readFileSync(join(P, 'guide-warm.md'), 'utf8'), anxious: readFileSync(join(P, 'guide-anxious.md'), 'utf8') };
  const full = {}, cards = {};
  for (const [k, t] of Object.entries(runs)) {
    full[k] = { words: t.trim().split(/\s+/).length, hedges: hedgeCount(t), headings: t.split('\n').filter(l => /^#/.test(l)).length,
      bullets: t.split('\n').filter(l => /^- /.test(l)).length, justification: /Justification/.test(t), whyItHelps: /Why it helps/i.test(t), caveat: /Caveat/.test(t) };
    const s = NOTICINGS[k].join(' ');
    cards[k] = { words: wordCount(s), hedges: hedgeCount(s),
      // names a section of the page they read, by its heading
      sections: /What's Actually New|How We'd Track It/.test(norm(s)) ? 1 : 0,
      // punctuation after a closing quote ("him". or ("him").), not inside it ("him.")
      quotePunct: /[”"][.,)]/.test(s) ? 1 : 0 };
  }
  return { guides, runs, full, cards, chance: chance() };
}
