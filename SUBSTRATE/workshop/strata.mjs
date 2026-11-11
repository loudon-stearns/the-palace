// Mines the palace's git history into weekly strata for "SUBSTRATE — rich — born on the floor.html".
// usage (from the palace root): node "SUBSTRATE/workshop/strata.mjs" > "SUBSTRATE/workshop/strata.json"
// The one git command: git log --format='%h%x09%ad%x09%an%x09%s' --date=format:'%G-W%V %Y-%m-%d'
import { execSync } from 'node:child_process';
const CMD = "git log --format='%h%x09%ad%x09%an%x09%s' --date=format:'%G-W%V %Y-%m-%d'";
const rows = execSync(CMD, { maxBuffer: 1 << 28 }).toString().trim().split('\n').map(l => l.split('\t'));
const GROUPS = {
  ceremony: /^(deposit|weave|weave-apply|schema|harvest|closing-well|baton|handoff|stage|walk|spore|revival|self-model|map|return|pre-weave|pre-schema|token)/i,
  edit: /^(edit|docs|palace|citizen)/i,
  machinery: /^(ops|feat|fix|chore|stigmergy|board|refactor|test|build)/i,
  making: /^(enrich|proof|blueline|shop|art|render|hero)/i,
  steward: /^steward/i,
  landing: /^merge/i,
};
const kindOf = (s) => { for (const [g, re] of Object.entries(GROUPS)) if (re.test(s)) return g; return 'other'; };
const weeks = new Map(); const authors = {};
for (const [h, ad, an, s] of rows) {
  const [wk, day] = ad.split(' ');
  if (!weeks.has(wk)) weeks.set(wk, { week: wk, commits: 0, first: day, last: day, kinds: {} });
  const w = weeks.get(wk); w.commits++; if (day < w.first) w.first = day; if (day > w.last) w.last = day;
  const k = kindOf(s || ''); w.kinds[k] = (w.kinds[k] || 0) + 1;
  authors[an] = (authors[an] || 0) + 1;
}
const list = [...weeks.values()].sort((a, b) => a.week < b.week ? -1 : 1);
const first = rows[rows.length - 1], head = rows[0];
console.log(JSON.stringify({
  command: CMD, mined: new Date().toISOString().slice(0, 10), head: head[0], total: rows.length,
  first: { hash: first[0], date: first[1].split(' ')[1], subject: first[3] },
  authors, groups: Object.fromEntries(Object.entries(GROUPS).map(([g, re]) => [g, String(re)])), weeks: list,
}, null, 1));
