import { describe, test, expect } from 'vitest';
import { parseMakingSections, liftArtifacts, palacePathOf, ageOf, rowSignal, groupProjects, cardSpec, messageForSection, decisionFor } from '../../src/lib/scroll-view.js';
import { sortProjects, projectSortKey } from '../../server/projects.js';

const MAKING = [
  '<!-- scroll:entry id="gsl-039" -->',
  '### 2026-07-01 — cycle 19 — shipped the probe harness',
  '> shipped · harness ready',
  '',
  'Catch-up — the pipeline.',
  '',
  '**Artifacts:**',
  '- [the report](Projects/GSL/ai-source-probe/report.mock.html)',
  '- [a wav](Projects/GSL/crystal-audio/crystal_1_cubic.wav)',
  '- [the design doc](Projects/GSL/ai-source-probe/DESIGN.md)',
  '<sub>`gsl-039` · BROADCAST on GENERAL</sub>',
  '<!-- /scroll:entry -->',
  '',
  'a hand-written note between sections',
  '',
  '<!-- scroll:entry id="gsl-030" -->',
  '### 2026-06-06 — cycle 15 — earlier',
  'body',
  '<!-- /scroll:entry -->',
].join('\n');

describe('parseMakingSections', () => {
  test('splits entries in file order, lifts headings and media artifacts, keeps free text', () => {
    const s = parseMakingSections(MAKING);
    expect(s.map((x) => x.id)).toEqual(['gsl-039', null, 'gsl-030']);
    expect(s[0].heading).toBe('2026-07-01 — cycle 19 — shipped the probe harness');
    expect(s[0].body).toContain('> shipped · harness ready');
    expect(s[0].artifacts).toEqual([
      { path: 'Projects/GSL/ai-source-probe/report.mock.html', caption: 'the report' },
      { path: 'Projects/GSL/crystal-audio/crystal_1_cubic.wav', caption: 'a wav' },
    ]); // the .md link is not media
    expect(s[1].body).toBe('a hand-written note between sections');
    expect(s[2].heading).toBe('2026-06-06 — cycle 15 — earlier');
  });

  test('empty / placeholder making zones yield a single free section or nothing', () => {
    expect(parseMakingSections('')).toEqual([]);
    const s = parseMakingSections('_Nothing made yet._');
    expect(s).toHaveLength(1);
    expect(s[0].id).toBeNull();
  });

  test('liftArtifacts ignores web urls and lifts each palace file once, whatever form names it', () => {
    const a = liftArtifacts('[x](https://a/b.png) [y](open:Projects/x.wav) [z](Projects/x.wav) [z again](Projects/x.wav) [o](obsidian://open?file=a.png)');
    expect(a).toEqual([{ path: 'Projects/x.wav', caption: 'y' }, { path: 'a.png', caption: 'o' }]);
  });

  // The 2026-10-18 census: 39 web pages on 16 scrolls missed the trail for the
  // way their link was written, most for a space in a project bundle's path.
  // Meadows, cycle 9: the post and the section both named the sketch without
  // its Projects/ prefix. The scroll's line can be corrected, the post cannot.
  test('cardSpec: where the scroll corrects a post\'s path to the same file, the scroll\'s path wins and the post keeps its caption', () => {
    const msgs = [{ id: 'm-024', type: 'BROADCAST', payload: { artifacts: [{ path: "Meadows/sketch.html", caption: 'v0.1' }, { path: 'Meadows/other.png' }] } }];
    const section = { id: 'm-024', heading: 'h', body: '', footer: null, artifacts: [{ path: 'Projects/Meadows/sketch.html', caption: 'fixed' }] };
    const c = cardSpec(section, msgs);
    expect(c.artifacts.heavy).toEqual([{ path: 'Projects/Meadows/sketch.html', caption: 'v0.1' }]);
    expect(c.artifacts.light.map((a) => a.path)).toEqual(['Meadows/other.png']);
  });

  test('cardSpec: two post paths with one file name are ambiguous, so the scroll\'s path is added beside them', () => {
    const msgs = [{ id: 'w', type: 'BROADCAST', payload: { artifacts: [{ path: 'W/v1.8/index.html' }, { path: 'W/v1.9/index.html' }] } }];
    const section = { id: 'w', heading: 'h', body: '', footer: null, artifacts: [{ path: 'Projects/W/v1.9/index.html' }] };
    expect(cardSpec(section, msgs).artifacts.heavy.map((a) => a.path)).toEqual(['W/v1.8/index.html', 'W/v1.9/index.html', 'Projects/W/v1.9/index.html']);
  });

  test('palacePathOf reads every form a palace file arrives in', () => {
    expect(palacePathOf('Projects/Floquet Time-Modulated Loops/interactives/02_mathieu_simulator.html')).toBe('Projects/Floquet Time-Modulated Loops/interactives/02_mathieu_simulator.html');
    expect(palacePathOf('<Projects/Loudon Live/proofs/the-logo-heard.html>')).toBe('Projects/Loudon Live/proofs/the-logo-heard.html');
    expect(palacePathOf('Projects/Loudon%20Live/proofs/the-logo-heard.html')).toBe('Projects/Loudon Live/proofs/the-logo-heard.html');
    expect(palacePathOf('open:Projects/Blood Compressor/stage2-vessel-prototype-v3.html')).toBe('Projects/Blood Compressor/stage2-vessel-prototype-v3.html');
    expect(palacePathOf('obsidian://open?vault=The%20Palace&file=Projects/Semantic%20Webcam/08-tonal-bench.html')).toBe('Projects/Semantic Webcam/08-tonal-bench.html');
    expect(palacePathOf('/Dissolutions/proofs/x/a.html')).toBe('Dissolutions/proofs/x/a.html');
    expect(palacePathOf('Projects/A B/c.html "a title"')).toBe('Projects/A B/c.html');
    expect(palacePathOf('https://example.com/a.html')).toBe(null);
    expect(palacePathOf('mailto:x@y.z')).toBe(null);
    expect(palacePathOf('')).toBe(null);
  });

  test('liftArtifacts lifts a spaced path, and stops at the link\'s own closing paren', () => {
    const a = liftArtifacts('- [the sim](Projects/Floquet Time-Modulated Loops/interactives/03_pumped_swing.html) (see also [kap](<Projects/Floquet Time-Modulated Loops/interactives/15_kapitza_pendulum.html>))');
    expect(a.map((x) => x.path)).toEqual([
      'Projects/Floquet Time-Modulated Loops/interactives/03_pumped_swing.html',
      'Projects/Floquet Time-Modulated Loops/interactives/15_kapitza_pendulum.html',
    ]);
  });
});

describe('ageOf', () => {
  const now = Date.parse('2026-09-23T12:00:00Z');
  test('reads today / 1d / Nd / Nmo', () => {
    expect(ageOf('2026-09-23T08:00:00Z', now)).toBe('today');
    expect(ageOf('2026-09-22T08:00:00Z', now)).toBe('1d');
    expect(ageOf('2026-09-01T08:00:00Z', now)).toBe('22d');
    expect(ageOf('2026-06-01T08:00:00Z', now)).toBe('4mo');
    expect(ageOf(null, now)).toBe('');
  });
});

describe('rowSignal + groupProjects + sortProjects — one rule for the table', () => {
  const rows = [
    { home: 'Steady', stewarded: true, open_asks: 0, answered_unconsumed: 0, stalled: false, barren_streak: 0, last_activity: '2026-06-01T00:00:00Z' },
    { home: 'Needs', stewarded: true, open_asks: 2, open_blocking: false, answered_unconsumed: 0, stalled: false, barren_streak: 0, last_activity: '2026-05-01T00:00:00Z' },
    { home: 'Paused', stewarded: true, open_asks: 1, open_blocking: true, answered_unconsumed: 0, stalled: false, barren_streak: 0, last_activity: '2026-07-01T00:00:00Z' },
    { home: 'Ready', stewarded: true, open_asks: 0, answered_unconsumed: 1, stalled: false, barren_streak: 0, last_activity: '2026-07-01T00:00:00Z' },
    { home: 'Stuck', stewarded: true, open_asks: 0, answered_unconsumed: 0, stalled: true, barren_streak: 2, last_activity: '2026-09-21T00:00:00Z' },
    { home: 'Untended', stewarded: false, open_asks: 0, answered_unconsumed: 0, stalled: false, barren_streak: 0, last_activity: null },
    { home: 'Running', stewarded: true, running: true, run: { position: 2, cap: 10 }, open_asks: 0, answered_unconsumed: 0, stalled: false, barren_streak: 0, last_activity: '2026-09-23T00:00:00Z' },
  ];
  const by = Object.fromEntries(rows.map((r) => [r.home, r]));

  test('rowSignal names the state in one or two words, most urgent first', () => {
    expect(rowSignal(by.Running)).toEqual({ text: 'running 2/10', tone: 'warn' });
    expect(rowSignal(by.Needs)).toEqual({ text: '2 asks', tone: 'warn' });
    expect(rowSignal(by.Paused)).toEqual({ text: 'paused on you', tone: 'warn' });
    expect(rowSignal(by.Ready)).toEqual({ text: '1 ready', tone: 'ok' });
    expect(rowSignal(by.Stuck)).toEqual({ text: 'stalled', tone: 'err' });
    expect(rowSignal(by.Untended)).toEqual({ text: 'no steward', tone: 'dim' });
    expect(rowSignal(by.Steady)).toEqual({ text: 'steady', tone: 'dim' });
  });

  test('groupProjects buckets needs-you / ready / stuck / tended / untended', () => {
    const g = groupProjects(rows);
    expect(g.needs_you.map((r) => r.home).sort()).toEqual(['Needs', 'Paused', 'Running']);
    expect(g.ready.map((r) => r.home)).toEqual(['Ready']);
    expect(g.stuck.map((r) => r.home)).toEqual(['Stuck']);
    expect(g.tended.map((r) => r.home)).toEqual(['Steady']);
    expect(g.untended.map((r) => r.home)).toEqual(['Untended']);
  });

  test('sortProjects: what needs Loudon first, then ready, stuck, tended by recency, untended last', () => {
    const sorted = sortProjects(rows).map((r) => r.home);
    expect(sorted.slice(0, 2)).toEqual(['Paused', 'Needs']); // both need him; most recent activity first
    expect(sorted[2]).toBe('Ready');
    expect(sorted[3]).toBe('Stuck');
    expect(sorted.slice(4)).toEqual(['Running', 'Steady', 'Untended']);
    expect(projectSortKey(by.Untended)[0]).toBe(4);
  });
});

describe('the trail as cards (2026-10-13): a section joins its board message', () => {
  const sections = parseMakingSections(MAKING);
  const msg = {
    id: 'gsl-039', ts: '2026-07-01T10:00:00Z', type: 'BROADCAST', board: 'GENERAL', from: 'GSL',
    payload: {
      kind: 'shipped_artifact', headline: 'The probe harness ships.', ground: 'shipped · harness ready',
      catchup: 'GSL is the chat-driven instrument generator.', content: 'What I built. A harness.',
      artifacts: [{ path: 'Projects/GSL/crystal-audio/crystal_1_cubic.wav', caption: 'a wav' }, { path: 'Projects/GSL/ai-source-probe/report.mock.html', caption: 'the report' }],
      equations: [{ label: 'x', symbolic: 'y = x', worded: 'y equals x' }],
      left_rough: 'nobody listened', next_moves: ['listen'],
      options: [{ id: 'SHIP', label: 'SHIP — ship it' }, { id: 'WAIT', label: 'WAIT — hold' }],
    },
  };
  const grant = { id: 'resp-1', ts: '2026-07-02T09:00:00Z', type: 'RESOURCE_GRANT', re: 'gsl-039', from: 'TRICKSTER', payload: { option_id: 'SHIP', option_label: 'SHIP — ship it', notes: 'yes, and louder' } };

  test('finds the message by the section id and splits artifacts into light and heavy', () => {
    const sec = sections.find((s) => s.id === 'gsl-039');
    expect(messageForSection(sec, [msg])).toBe(msg);
    const c = cardSpec(sec, [msg, grant]);
    expect(c.fromMessage).toBe(true);
    expect(c.headline).toBe('The probe harness ships.');
    expect(c.catchup).toContain('GSL is');
    expect(c.artifacts.light.map((a) => a.path)).toEqual(['Projects/GSL/crystal-audio/crystal_1_cubic.wav']);
    expect(c.artifacts.heavy.map((a) => a.path)).toEqual(['Projects/GSL/ai-source-probe/report.mock.html']);
    expect(c.leftRough).toBe('nobody listened');
    expect(c.nextMoves).toEqual(['listen']);
    expect(c.options.map((o) => o.id)).toEqual(['SHIP', 'WAIT']);
  });
  test('carries the decision Loudon filed, with his note whole', () => {
    const sec = sections.find((s) => s.id === 'gsl-039');
    expect(decisionFor(msg, [msg, grant])).toEqual({ option: 'SHIP — ship it', notes: 'yes, and louder', ts: '2026-07-02T09:00:00Z' });
    expect(cardSpec(sec, [msg]).decision).toBeNull();
  });
  test('falls back to the section prose when no message is on the board', () => {
    const sec = sections.find((s) => s.id === 'gsl-039');
    const c = cardSpec(sec, []);
    expect(c.fromMessage).toBe(false);
    expect(c.prose).toContain('Catch-up');
    expect(c.artifacts.light.length + c.artifacts.heavy.length).toBe(sec.artifacts.length);
  });
});
