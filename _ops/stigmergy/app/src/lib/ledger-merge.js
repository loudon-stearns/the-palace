// ledger-merge.js -- what git's union merge made of a ledger that neither side
// had. Pure: palace-land hands it the three texts and the merge base.
//
// .gitattributes merges every ledger kind by union, so two branches that each
// append keep both, without a conflict (SCHEMA — Reference §6). Union never
// conflicts, so the lander's trial merge cannot refuse what it gets wrong:
//   - twice      two items with one number: both sides added an item N.
//   - two-forms  one item twice, as it was and as it was edited in place, when
//                the edit sat beside the other side's change.
//   - neither    a line found on neither side: two lines joined into one.
// The lander refuses those, before anything moves. One more it only notes:
//   - run-on     a heading that follows the line above with no blank between,
//                where its own side had one. It still reads as a heading.
//
// An item is a line that opens with its number at column 0 ("59. ", "12b. "),
// or a numbered heading ("## Encounter 4"). A number is reported only when the
// merge holds it more often than either side did, so a ledger that already
// repeats one is never refused for it.

const ITEM = /^(\d+[a-z]?)\. /;
const NUMBERED_HEADING = /^(#{1,6} \S+ \d+)\b/;
const HEADING = /^#{1,6} /;

export function itemKey(line) {
  const m = ITEM.exec(line) || NUMBERED_HEADING.exec(line);
  return m ? m[1] : null;
}

const linesOf = (text) => String(text ?? '').split('\n');

function keyCounts(lines) {
  const c = new Map();
  for (const l of lines) {
    const k = itemKey(l);
    if (k) c.set(k, (c.get(k) || 0) + 1);
  }
  return c;
}

export function ledgerDefects({ base = '', ours, theirs, merged }) {
  const o = linesOf(ours);
  const t = linesOf(theirs);
  const m = linesOf(merged);
  const before = keyCounts(linesOf(base));
  const oc = keyCounts(o);
  const tc = keyCounts(t);
  const refuse = [];
  const notes = [];

  for (const [item, n] of keyCounts(m)) {
    if (n <= Math.max(oc.get(item) || 0, tc.get(item) || 0)) continue;
    refuse.push({ kind: before.has(item) ? 'two-forms' : 'twice', item });
  }

  const onSide = new Set([...o, ...t]);
  for (const l of m) if (l && !onSide.has(l)) refuse.push({ kind: 'neither', line: l });

  for (let i = 1; i < m.length; i += 1) {
    if (!HEADING.test(m[i]) || m[i - 1] === '') continue;
    const side = [o, t].find((s) => {
      const at = s.indexOf(m[i]);
      return at >= 0 && (at === 0 || s[at - 1] === '');
    });
    if (side) notes.push({ kind: 'run-on', line: m[i] });
  }
  return { refuse, notes };
}

const clip = (s, n = 60) => (s.length > n ? `${s.slice(0, n)}…` : s);

// One phrase per defect, for the lander's one-line refusal.
export function describeDefect(d) {
  if (d.kind === 'twice') return `item ${d.item} twice (both sides added one)`;
  if (d.kind === 'two-forms') return `item ${d.item} in two forms (edited in place beside the other side's change)`;
  if (d.kind === 'neither') return `a line on neither side, two lines joined ("${clip(d.line)}")`;
  return `the heading "${clip(d.line)}" run on from the line above`;
}
