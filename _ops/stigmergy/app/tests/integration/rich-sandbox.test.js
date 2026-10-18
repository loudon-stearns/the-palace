import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { createRequire } from 'node:module';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';
import { buildReviewMessage } from '../../../../rich-face/rich-handler.mjs';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

// The rich face's pieces run sandboxed (sandbox="allow-scripts", the rule
// ArtifactSlot.jsx applies to served HTML): a piece cannot act as STIGMERGY.
// Driven in headless Chromium against STIGMERGY's own middleware on a temp
// palace — never :5173, never the real board. Kuramoto's three made pieces are
// copied in, so the test plays the real ones.

const HERE = dirname(fileURLToPath(import.meta.url));
const RICH_SRC = resolve(HERE, '../../../../rich-face');
const PALACE = resolve(HERE, '../../../../..');
const KURAMOTO = resolve(PALACE, 'Kuramoto Coupling');
const ENTRY = 'Probe Entry';

const require = createRequire(import.meta.url);
let chromium = null;
try { ({ chromium } = require('playwright')); if (!existsSync(chromium.executablePath())) chromium = null; } catch { chromium = null; }
if (!chromium) console.warn('[rich-sandbox] SKIPPED — no Playwright Chromium on this machine (npx playwright install chromium)');

// A piece that tries what a piece must not: write to the board and reach
// /api/open (a path that does not exist, so even a guard that let it through
// would run nothing). It records what it saw on its own body.
const PROBE = `<!doctype html><body><script>
(async () => {
  const out = {};
  const msg = ${JSON.stringify(JSON.stringify(buildReviewMessage({ task: 'from-a-piece' })))};
  try { out.json = (await fetch('/api/persistent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: msg })).status; } catch (e) { out.json = 'blocked'; }
  try { out.plain = (await fetch('/api/persistent', { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: msg })).status; } catch (e) { out.plain = 'blocked'; }
  try { out.open = (await fetch('/api/open?path=no-such-file.txt')).status; } catch (e) { out.open = 'blocked'; }
  try { out.parent = !!parent.document.body; } catch (e) { out.parent = 'refused'; }
  document.body.dataset.out = JSON.stringify(out);
})();
</script></body>`;

const KPIECES = [['waveform-locking', 914], ['ensemble', 840], ['stubbornness', 892]];

function makeTempPalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'rich-sandbox-test-'));
  // The rich face finds files through git's index (resolve.mjs), never by walking
  // the disk, so the temp palace is a repository; new files count untracked.
  execFileSync('git', ['init', '-q'], { cwd: root, env: gitFreeEnv() });
  assertScratchRepo(root);
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(resolve(root, '_ops/swarm/sessions'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  mkdirSync(resolve(root, '_ops/rich-face'), { recursive: true });
  for (const f of ['rich.html', 'parse.js']) copyFileSync(resolve(RICH_SRC, f), resolve(root, '_ops/rich-face', f));
  writeFileSync(resolve(root, `${ENTRY}.md`), [
    '---', `title: ${ENTRY}`, '---', `# ${ENTRY}`, '', 'Words.', '',
    '## Pieces', '', 'The pieces sit here.', '',
    '## Text', '',
    'Inline <b>bold</b>, H<sub>2</sub>O, and <span class="note">a span</span>.', '',
    '<img src="x" onerror="window.__entryRan = 1">', '',
    '<div onclick="window.__entryRan = 2" class="eq">a div with a handler</div>', '',
    '<div class="eq">e<sup>iθ</sup></div>', '',
    '<!-- a note to the next agent -->', '',
    'The tag <date> is a placeholder.', '',
    // After an inline <kbd>, <code>, <pre> or <script>, marked emits the text that
    // follows raw (its lexer is "in a raw block"), past the html renderer.
    '## Raw',  '',
    'Press <kbd><img/src=x onerror="window.__xss=\'kbd\'"></kbd> to go.', '',
    'Then <code><img/src=x onerror="window.__xss=\'code\'"></code> too.', '',
    '## Links', '',
    '[run](javascript:window.__js=\'link\') · [cased](JaVaScRiPt:window.__js=\'case\') · <javascript:window.__js=\'auto\'> · ![pic](javascript:window.__js=\'img\')', '',
    '[site](https://example.com/) · [mail](mailto:someone@example.com) · [[Other Entry]] · [bundle](Probe%20Entry/bare.html)', '',
    '[vault](obsidian://open?vault=The%20Palace&file=Kuramoto%20Coupling) · [native](open:Probe%20Entry/bare.html)', '',
    '## Keys <kbd><img/src=x onerror="window.__xss=\'heading\'"></kbd>', '',
    'Under a heading.', '',
    '```mermaid', 'flowchart LR', '  A["<b>K &lt; K_c</b><br/>drift"] --> B["lock"]', '  click A href "javascript:markClicked()"', '```', '',
  ].join('\n'), 'utf8');
  mkdirSync(resolve(root, ENTRY), { recursive: true });
  writeFileSync(resolve(root, ENTRY, 'probe.html'), PROBE, 'utf8');
  writeFileSync(resolve(root, ENTRY, 'note.md'), "---\ntitle: note\n---\nA [t](javascript:window.__js='textpiece') link.\n", 'utf8');
  writeFileSync(resolve(root, ENTRY, 'bare.html'), '<!doctype html><body><div style="height:1200px">tall</div></body>', 'utf8');
  for (const [n] of KPIECES) copyFileSync(resolve(KURAMOTO, `Kuramoto Coupling — rich — ${n}.html`), resolve(root, ENTRY, `${n}.html`));
  writeFileSync(resolve(root, ENTRY, `${ENTRY} — rich.json`), JSON.stringify({ entry: ENTRY, sections: [{ heading: 'Pieces', pieces: [
    { file: 'probe.html', origin: 'made', height: 500, caption: "A [cap](javascript:window.__js='caption') link." },
    { file: 'note.md', origin: 'made' },
    { file: 'bare.html', origin: 'made' },
    ...KPIECES.map(([n, height]) => ({ file: `${n}.html`, origin: 'made', height })),
  ] }] }), 'utf8');
  return root;
}

function makeServer(palaceRoot, log) {
  const plugin = blackboardMiddleware(palaceRoot);
  const handlers = [];
  plugin.configureServer({ middlewares: { use: (fn) => handlers.push(fn) } });
  return http.createServer((req, res) => {
    res.on('finish', () => log.push(`${req.method} ${req.url.split('?')[0]} ${res.statusCode}`));
    // Stands in for STIGMERGY's reader, which frames the rich face from the app's
    // own page on the same origin (RichFaceFrame.jsx) — not a palace file.
    if (req.url === '/framer') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!doctype html><body><iframe id="rf" style="width:1200px;height:900px" src="/rich/?entry=${encodeURIComponent(ENTRY)}&review=0"></iframe></body>`);
      return;
    }
    let i = 0;
    const next = () => { if (i >= handlers.length) { res.statusCode = 404; res.end('not found'); return; } handlers[i++](req, res, next); };
    next();
  });
}

describe('every rich manifest in the palace sizes its interactives', () => {
  // A sandboxed piece cannot be measured by the page, so a made piece carries its height.
  test('each .html piece in a — rich.json has a height', () => {
    const manifests = execFileSync('git', ['ls-files', '-z', '*— rich.json'], { cwd: PALACE, env: gitFreeEnv() }).toString().split('\0').filter(Boolean);
    expect(manifests.length).toBeGreaterThan(0);
    for (const m of manifests) {
      const json = JSON.parse(readFileSync(resolve(PALACE, m), 'utf8'));
      for (const s of json.sections || []) for (const p of s.pieces || []) {
        if (/\.html?$/i.test(p.file)) expect({ manifest: m, file: p.file, height: typeof p.height }).toEqual({ manifest: m, file: p.file, height: 'number' });
      }
    }
  });
});

describe.skipIf(!chromium)('the rich face in a browser', () => {
  let root, base, browser, page;
  const log = [];
  const board = () => readFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), 'utf8').trim();

  beforeAll(async () => {
    root = makeTempPalace();
    base = await listen(makeServer(root, log));
    browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
    page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.addInitScript(() => { window.markClicked = () => { window.__clicked = 1; }; });
    await page.goto(`${base}/rich/?entry=${encodeURIComponent(ENTRY)}&review=0`);
    await page.waitForSelector('figure[data-piece="probe.html"] iframe', { timeout: 30000 });
    await page.waitForSelector('.diagram svg', { timeout: 30000 });
    for (const f of await page.$$('figure[data-piece] iframe')) await f.scrollIntoViewIfNeeded();
  }, 90000);
  afterAll(async () => {
    await browser?.close();
    await closeAll();
    if (root) rmSync(root, { recursive: true, force: true });
  });

  test('every piece frame is sandboxed to scripts alone', async () => {
    const sandboxes = await page.$$eval('figure[data-piece] iframe', (fs) => fs.map((f) => f.getAttribute('sandbox')));
    expect(sandboxes).toHaveLength(2 + KPIECES.length);
    expect(new Set(sandboxes)).toEqual(new Set(['allow-scripts']));
  });

  test('a piece cannot write to the board, reach /api/open, or touch the page', async () => {
    const frame = page.frames().find((f) => f.url().endsWith('/probe.html'));
    await frame.waitForSelector('body[data-out]', { state: 'attached', timeout: 20000 });
    const out = JSON.parse(await frame.$eval('body', (b) => b.dataset.out));
    expect(out.parent).toBe('refused');
    expect(out.json).not.toBe(200);
    expect(out.open).not.toBe(404); // 404 would mean the guard let it through to the route
    expect(board()).toBe('');
    expect(log.filter((l) => /^POST \/api\/persistent 200$|^GET \/api\/open 404$/.test(l))).toEqual([]);
  }, 30000);

  test('a piece opened as the page itself still cannot write or reach /api/open', async () => {
    const top = await browser.newPage();
    try {
      await top.goto(`${base}/rich/${encodeURIComponent(ENTRY)}/probe.html`);
      await top.waitForSelector('body[data-out]', { state: 'attached', timeout: 20000 });
      const out = JSON.parse(await top.$eval('body', (b) => b.dataset.out));
      expect(out.json).not.toBe(200);
      expect(out.open).not.toBe(404);
      expect(board()).toBe('');
    } finally { await top.close(); }
  }, 30000);

  // Since 2026-10-18 every served page carries the piece kit (rich-face/kit),
  // which reports its content's height: a piece that says nothing itself is
  // sized to what it holds (bare.html: a 1200 px div and the body's 8 px
  // margins), and one with nothing laid out keeps its manifest height.
  test('a piece that says nothing is sized by the kit; one with nothing laid out keeps its manifest height', async () => {
    const heights = await page.$$eval('figure[data-piece]', (fs) => Object.fromEntries(fs.filter((f) => f.querySelector('iframe')).map((f) => [f.dataset.piece, f.querySelector('iframe').style.height])));
    expect(heights['probe.html']).toBe('500px');
    expect(heights['bare.html']).toBe('1216px');
  });

  // Kuramoto's manifest heights were measured in a 1130 px column; narrower,
  // the pieces grow taller (954–1025 px at 760, more stacked below 700). A
  // frame must hold its piece whole at either width: no scrollbar inside it.
  test("at 1130 and about 760 px, each of Kuramoto's pieces fits its frame", async () => {
    for (const vw of [1440, 792]) {
      const p = await browser.newPage({ viewport: { width: vw, height: 1000 } });
      try {
        await p.goto(`${base}/rich/?entry=${encodeURIComponent(ENTRY)}&review=0`);
        await p.waitForSelector('figure[data-piece="ensemble.html"] iframe', { timeout: 30000 });
        for (const [n] of KPIECES) {
          const el = await p.$(`figure[data-piece="${n}.html"] iframe`);
          await el.scrollIntoViewIfNeeded();
          const col = Math.round((await el.boundingBox()).width);
          expect(col, `column at viewport ${vw}`).toBeLessThanOrEqual(vw === 1440 ? 1130 : 760);
          const frame = await el.contentFrame();
          await frame.waitForSelector('#go', { timeout: 20000 });
          await expect.poll(async () => {
            const [content, room] = await frame.evaluate(() => [document.documentElement.scrollHeight, innerHeight]);
            return content <= room + 1 ? 'fits' : `${n} at ${col}px: content ${content} in a ${room} frame`;
          }, { timeout: 15000 }).toBe('fits');
        }
      } finally { await p.close(); }
    }
  }, 120000);

  // One voice at a time: starting a piece quiets the one playing. That needs
  // rich:play to reach the page from a sandboxed frame and rich:hush to reach
  // the frame back, so it shows both directions at once.
  test("Kuramoto's three pieces start on a click, and each start quiets the one before", async () => {
    const go = (n) => page.frameLocator(`figure[data-piece="${n}.html"] iframe`).locator('#go');
    await go('waveform-locking').click({ timeout: 20000 });
    await expect.poll(() => go('waveform-locking').textContent(), { timeout: 15000 }).toMatch(/stop/);
    await go('ensemble').click();
    await expect.poll(() => go('ensemble').textContent(), { timeout: 15000 }).toMatch(/stop/);
    await expect.poll(() => go('waveform-locking').textContent(), { timeout: 15000 }).toMatch(/start/);
    await go('stubbornness').click();
    await expect.poll(() => go('stubbornness').textContent(), { timeout: 15000 }).toMatch(/stop/);
    await expect.poll(() => go('ensemble').textContent(), { timeout: 15000 }).toMatch(/start/);
  }, 90000);

  test("an entry's raw HTML is shown, not run; comments stay unseen; plain formatting and class-only divs still render", async () => {
    const text = await page.$eval('section.sec[data-key="text"]', (s) => ({
      html: s.querySelector('.prose').innerHTML, words: s.querySelector('.prose').innerText,
      b: !!s.querySelector('.prose b'), sub: !!s.querySelector('.prose sub'), sup: !!s.querySelector('.prose .eq sup'),
      span: !!s.querySelector('.prose span.note'), img: !!s.querySelector('.prose img[src="x"]'),
      handler: !!s.querySelector('.prose [onclick]'),
    }));
    expect(await page.evaluate(() => window.__entryRan)).toBeUndefined();
    expect(text.img).toBe(false);
    expect(text.handler).toBe(false);
    expect(text.words).toContain('<img src="x"');
    expect(text.words).toContain('The tag <date> is a placeholder.');
    expect(text.words).not.toContain('a note to the next agent');
    expect(text).toMatchObject({ b: true, sub: true, sup: true, span: true });
  });

  test('on its own the page shows its top strip, face switch and all', async () => {
    expect(await page.locator('.top').isVisible()).toBe(true);
    await page.waitForSelector('#faces a.btn', { state: 'attached' });
  });

  // Framed by the reader, the reader carries the face switch; the page's own
  // strip and F would take the frame away to another face.
  test('framed by a page on its own origin, it hides its top strip and leaves F alone', async () => {
    const outer = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    try {
      await outer.goto(`${base}/framer`);
      const frame = outer.frameLocator('#rf');
      await frame.locator('section.sec[data-key="text"]').waitFor({ timeout: 30000 });
      await frame.locator('#faces a.btn').first().waitFor({ state: 'attached', timeout: 30000 });
      expect(await frame.locator('.top').isVisible()).toBe(false);
      const inner = outer.frames().find((f) => f.url().includes('/rich/?entry='));
      const before = inner.url();
      await frame.locator('section.sec[data-key="text"] .prose').first().click();
      await outer.keyboard.press('f');
      await outer.waitForTimeout(1500);
      expect(outer.frames().find((f) => f.parentFrame()).url()).toBe(before);
      expect(outer.url()).toBe(`${base}/framer`);
    } finally { await outer.close(); }
  }, 60000);

  test('text marked emits raw after <kbd>, <code> or in a heading runs nothing', async () => {
    await page.waitForSelector('section.sec[data-key="raw"] .prose');
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    expect(await page.$$eval('#sections [onerror], #sections script', (els) => els.length)).toBe(0);
  });

  // Only http(s), mailto and relative or palace paths survive in href and src —
  // in prose, a caption and a .md text piece alike — and obsidian: in an href,
  // the door into Loudon's vault (it opens a local app and carries no script).
  test('a link to javascript: is dropped; web, mail and palace links stay', async () => {
    await page.waitForSelector('figure[data-piece="note.md"] .textpiece');
    const urls = await page.$$eval('#sections a[href], #sections img[src]', (els) => els.filter((e) => !e.closest('.diagram'))
      .map((e) => { const attr = e.hasAttribute('href') ? 'href' : 'src'; const v = e.getAttribute(attr); return { attr, v, protocol: new URL(v, location.href).protocol }; }));
    const allowed = { href: ['http:', 'https:', 'mailto:', 'obsidian:'], src: ['http:', 'https:', 'mailto:'] };
    expect(urls.filter((u) => !allowed[u.attr].includes(u.protocol))).toEqual([]);
    const hrefs = urls.map((u) => u.v);
    expect(hrefs).toContain('obsidian://open?vault=The%20Palace&file=Kuramoto%20Coupling');
    expect(hrefs.filter((h) => /^open:/i.test(h))).toEqual([]);
    expect(hrefs).toContain('https://example.com/');
    expect(hrefs).toContain('mailto:someone@example.com');
    expect(hrefs.some((h) => h.startsWith('?entry=Other%20Entry'))).toBe(true);
    for (const name of ['run', 'cased', 'cap', 't']) await page.locator('#sections a', { hasText: new RegExp(`^${name}$`) }).first().click({ timeout: 5000 }).catch(() => {});
    expect(await page.evaluate(() => window.__js)).toBeUndefined();
  });

  // Under 'loose', mermaid keeps a click directive's javascript: link as written.
  test('a diagram renders strict: bold labels kept, a javascript: link in it dead', async () => {
    const svg = page.locator('.diagram svg');
    expect(await svg.locator('b').count()).toBeGreaterThan(0);
    const hrefs = await svg.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href') || a.getAttribute('xlink:href') || ''));
    expect(hrefs.filter((h) => /^\s*javascript:/i.test(h))).toEqual([]);
    await svg.locator('.node').first().click();
    expect(await page.evaluate(() => window.__clicked)).toBeUndefined();
  });
});
