// shop.test.mjs — the bench's tests. Run: node --test Shop/shop.test.mjs (from the palace root).
// The sections the bench writes are checked with the app's own scroll parser
// (_ops/stigmergy/app/src/lib/scroll-view.js), so what passes here is what the app splits and plays.
// Whether it LOOKS right in STIGMERGY is not tested here; only a look in the app says that.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderSection, renderPageSection, upsertSection, carryAnswers, sectionId, splitNotYet, quote, jobRows } from './shop.mjs';
import { parseMakingSections } from '../_ops/stigmergy/app/src/lib/scroll-view.js';

const SHOP = path.dirname(fileURLToPath(import.meta.url));
const PALACE = path.dirname(SHOP);

function fixture({ heard = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shop-test-')) + '/2026-11-15-two-drips';
  fs.mkdirSync(dir);
  const data = { made_for: 'Two drips for a test. Nothing more.', tier: 'sketch', question: 'does the second drip read as water?',
    artifacts: [{ path: 'listen.html', caption: 'both, playable' }],
    jobs: [
      { name: 'one', page: 'Some Page', sentence: 'the first sentence', claim: 'a drip', chain: ['Stable Audio Open (small-sfx)', 'hand: cut'], outputs: ['one — drip.m4a'], caption: 'the first drip' },
      { name: 'two', page: 'Some Page', sentence: 'the second sentence', claim: 'a drip', chain: ['Stable Audio Open (small-sfx)'], outputs: ['two (b).wav'] },
    ] };
  const prov = { jobs: {
    one: { chain: data.jobs[0].chain, outputs: { 'one — drip.m4a': 'abc' }, commit_at_run: 'deadbeef', heard_by: heard ? 'Loudon, 2026-11-15' : null, verdict: heard ? 'it drips' : null },
    two: { chain: data.jobs[1].chain, outputs: { 'two (b).wav': 'def' }, commit_at_run: 'deadbeef', heard_by: null, verdict: null } },
  batches: [{ at: '2026-11-15T10:00:00.000Z', jobs: ['one', 'two'], by: 'a test' }] };
  fs.writeFileSync(path.join(dir, 'provenance.json'), JSON.stringify(prov));
  return { J: { abs: path.join(dir, 'jobs.json'), dir, data, prov: path.join(dir, 'provenance.json') }, prov };
}

test('sectionId follows the folder: comparisons, proofs, anything else', () => {
  assert.equal(sectionId('/x/comparisons/2026-11-14-substrate-sounds'), 'comparison-2026-11-14-substrate-sounds');
  assert.equal(sectionId('/x/proofs/2026-11-15-A Slug'), 'test-2026-11-15-a-slug');
  assert.equal(sectionId('/x/workshops/round'), 'shop-round');
  assert.equal(sectionId('/x/proofs/y', { scroll_id: 'mine' }), 'mine');
});

test('quote: dates dropped, escapes undone, bare words quoted, quoted words kept', () => {
  assert.equal(quote('it drips'), '"it drips"');
  assert.equal(quote('2026-11-15: "the step reads as one"'), '"the step reads as one"');
  assert.equal(quote('heard beside its twin. Of the rest: "clean and \\"fake\\""'), 'heard beside its twin. Of the rest: "clean and "fake""');
});

test('splitNotYet splits on semicolons, else on sentences', () => {
  assert.deepEqual(splitNotYet('a melody; vocals; stereo.'), ['a melody', 'vocals', 'stereo']);
  assert.deepEqual(splitNotYet('The mount is untried. No GD&T. Not tried off the Mac.'), ['The mount is untried', 'No GD&T', 'Not tried off the Mac']);
  assert.deepEqual(splitNotYet(undefined), []);
});

test('a Specialist section parses in the app as one entry with heading, footer and every file', () => {
  const { J, prov } = fixture();
  const sec = renderSection(J, prov, { id: 'test-x', specialist: 'Stable Audio Open', presented: '2026-11-15' });
  const parsed = parseMakingSections(sec);
  assert.equal(parsed.length, 1);
  const [s] = parsed;
  assert.equal(s.id, 'test-x');
  assert.equal(s.heading, '2026-11-15 — Two drips for a test');
  assert.match(s.footer, /made through the bench/);
  assert.match(s.footer, /presented 2026-11-15 by the bench/);
  const names = s.artifacts.map((a) => path.basename(a.path));
  assert.deepEqual(names, ['listen.html', 'one — drip.m4a', 'two (b).wav']);
  assert.match(s.body, /Nobody has heard any of these yet\./);
  assert.match(s.body, /\*\*Artifacts:\*\*/);
  assert.ok(!/!\[\[/.test(sec), 'no Obsidian embeds');
});

test('a verdict shows once it is heard', () => {
  const { J, prov } = fixture({ heard: true });
  const [s] = parseMakingSections(renderSection(J, prov, { id: 'test-x' }));
  assert.match(s.body, /Loudon, 2026-11-15: "it drips"/);
  assert.match(s.body, /1 of 2 have been heard .*nobody has heard the other: two/);
  prov.round = { heard_by: 'Loudon, 2026-11-15', verdict: 'both drip' };
  assert.match(renderSection(J, prov, { id: 'test-x' }), /\*\*Heard\.\*\* Loudon, 2026-11-15: "both drip"/);
});

test('a job never run through the bench says so, and keeps its own verdict', () => {
  const { J } = fixture();
  J.data.jobs[0].heard_by = 'Loudon, 2026-11-14'; J.data.jobs[0].verdict = 'kept by hand';
  const rows = jobRows(J.data, { jobs: {} });
  assert.equal(rows[0].ran, false);
  const sec = renderSection({ ...J, prov: '/nonexistent/provenance.json' }, { jobs: {}, batches: [] }, { id: 'test-x' });
  assert.match(sec, /not run through the bench · Loudon, 2026-11-14: "kept by hand"/);
  assert.match(sec, /nothing here was run through the bench/);
});

test("the page's section links to the Specialist's scroll and parses", () => {
  const { J, prov } = fixture();
  const [s] = parseMakingSections(renderPageSection(J, prov, { id: 'test-x', page: 'Some Page', specialists: ['Stable Audio Open'] }));
  assert.equal(s.id, 'test-x');
  assert.match(s.body, /Stable Audio Open's scroll\]\(Shop\/Stable Audio Open\/Stable Audio Open — scroll\.md\)/);
  assert.equal(s.artifacts.length, 3);
});

test('upsert adds at the top of the trail, then replaces in place, never doubles', () => {
  const scroll = ['# x', '<!-- scroll:making:start -->', "_No run in the ledger yet — the first run's line will open the trail._", '<!-- scroll:making:end -->', ''].join('\n');
  const a = upsertSection(scroll, 'test-x', '<!-- scroll:entry id="test-x" -->\n### one\n<!-- /scroll:entry -->');
  assert.equal(a.how, 'added');
  assert.ok(!a.text.includes('No run in the ledger yet'), 'the empty-trail placeholder goes');
  const b = upsertSection(a.text, 'test-x', '<!-- scroll:entry id="test-x" -->\n### two $& $1\n<!-- /scroll:entry -->');
  assert.equal(b.how, 'replaced');
  assert.equal((b.text.match(/scroll:entry id="test-x"/g) || []).length, 1);
  assert.match(b.text, /### two \$& \$1/, 'replacement text is taken literally');
  const other = upsertSection(b.text, 'test-y', '<!-- scroll:entry id="test-y" -->\n### y\n<!-- /scroll:entry -->');
  assert.ok(other.text.indexOf('test-y') < other.text.indexOf('test-x'), 'newest first');
  assert.equal(upsertSection('no markers', 'x', 's').how, null);
});

// ── the two comparison folders, as presented on Stable Audio Open's scroll ──────────────
const SAO = path.join(SHOP, 'Stable Audio Open', 'Stable Audio Open — scroll.md');
const IDS = ['comparison-2026-11-14-substrate-sounds', 'comparison-2026-11-14-oliveros-room'];

test("both comparisons are on Stable Audio Open's scroll once, and every linked file exists", () => {
  const text = fs.readFileSync(SAO, 'utf8');
  const making = text.slice(text.indexOf('<!-- scroll:making:start -->'), text.indexOf('<!-- scroll:making:end -->'));
  const sections = parseMakingSections(making.replace('<!-- scroll:making:start -->', ''));
  for (const id of IDS) {
    const hits = sections.filter((s) => s.id === id);
    assert.equal(hits.length, 1, `${id} once`);
    const [s] = hits;
    assert.ok(s.heading && s.footer, `${id} has a heading and a footer`);
    assert.ok(s.artifacts.length >= 5, `${id} lifts its files`);
    for (const a of s.artifacts) assert.ok(fs.existsSync(path.join(PALACE, a.path)), `${a.path} exists`);
    assert.match(s.body, /have been heard/);
  }
});

test('a re-materialize keeps the bench sections byte for byte', async (t) => {
  let main;
  try { main = path.dirname(execFileSync('git', ['-C', PALACE, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' }).trim()); } catch { return t.skip('no git'); }
  let mod;
  // The materializer needs the orchestrator's packages, which a worktree may lack; the main
  // checkout's copy reads this checkout through palaceRoot.
  for (const root of [PALACE, main]) {
    try { mod = await import(pathToFileURL(path.join(root, '_ops/stigmergy/orchestrator/src/scroll-file.js')).href); break; } catch { /* next */ }
  }
  if (!mod) return t.skip('the materializer could not load here');
  const before = fs.readFileSync(SAO, 'utf8');
  const r = mod.materializeScroll({ palaceRoot: PALACE, home: 'Stable Audio Open', dryRun: true });
  assert.ok(r.text, 'materialized');
  const grab = (text, id) => text.match(new RegExp(`<!-- scroll:entry id="${id}" -->[\\s\\S]*?<!-- /scroll:entry -->`))?.[0];
  for (const id of IDS) assert.equal(grab(r.text, id), grab(before, id), `${id} unchanged`);
  assert.equal(fs.readFileSync(SAO, 'utf8'), before, 'dry run wrote nothing');
});

test('a rewrite of a section carries Loudon\'s scroll:answer blocks across, in order, before the footer', () => {
  const a1 = '<!-- scroll:answer by="Loudon" date="2026-11-17" files="a.m4a=abc" -->\n**Heard.** Loudon, 2026-11-17: "the second one $1"\n- pick · `a.m4a`\n<!-- /scroll:answer -->';
  const a2 = '<!-- scroll:answer by="Loudon" date="2026-11-18" files="" -->\n**Heard.** Loudon, 2026-11-18: "still that one"\n<!-- /scroll:answer -->';
  const old = `<!-- scroll:entry id="t" -->\n### old\n\nprose\n\n${a1}\n\n${a2}\n\n<sub>old foot</sub>\n<!-- /scroll:entry -->`;
  const fresh = '<!-- scroll:entry id="t" -->\n### new\n\nnew prose\n\n<sub>new foot</sub>\n<!-- /scroll:entry -->';
  const scroll = `# x\n\n${old}\n\n<!-- scroll:entry id="u" -->\n### other\n<!-- /scroll:entry -->\n`;
  const out = upsertSection(scroll, 't', fresh).text;
  assert.ok(out.includes('### new') && !out.includes('### old'));
  assert.ok(out.indexOf(a1) > out.indexOf('new prose') && out.indexOf(a1) < out.indexOf(a2) && out.indexOf(a2) < out.indexOf('<sub>new foot</sub>'));
  assert.equal(out.split('scroll:answer by=').length - 1, 2);
  const again = upsertSection(out, 't', carryAnswers(old, fresh)).text;
  assert.equal(again.split('scroll:answer by=').length - 1, 2);
  assert.ok(out.includes('### other'));
  const bare = '<!-- scroll:entry id="t" -->\n### nofoot\n<!-- /scroll:entry -->';
  const nf = carryAnswers(old, bare);
  assert.ok(nf.indexOf(a2) < nf.indexOf('<!-- /scroll:entry -->') && nf.endsWith('<!-- /scroll:entry -->'));
});
