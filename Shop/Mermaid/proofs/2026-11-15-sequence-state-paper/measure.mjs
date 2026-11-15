// measure.mjs — called by make.py; prints one JSON object.
// Uses the headless Chromium that mermaid-cli's puppeteer brought (npx cache), so it
// installs nothing. For each SVG: does any label's ink run outside its box, and which
// face did it take. For each html route: served the way the palace serves a piece
// (another origin, `sandbox allow-scripts`, the piece CSP from contract.mjs enforced,
// not report-only), framed in a sandboxed iframe; did it draw, and does anything overflow.
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const npx = join(homedir(), '.npm/_npx');
const pdir = readdirSync(npx).map((d) => join(npx, d, 'node_modules/puppeteer')).find((p) => existsSync(p));
if (!pdir) { console.error('no puppeteer in the npx cache; run mmdc once'); process.exit(2); }
const pkg = JSON.parse(readFileSync(join(pdir, 'package.json'), 'utf8'));
const puppeteer = (await import(pathToFileURL(join(pdir, pkg.exports['.'].import)).href)).default;
const { pieceCsp } = await import(pathToFileURL(join(ROOT, '_ops/rich-face/contract.mjs')).href);

// Runs in the page: every label against the box it sits in, by the ink of its text.
const CHECK = () => {
  const ink = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
  const out = [];
  for (const svg of document.querySelectorAll('svg')) {
    const name = svg.closest('figure')?.dataset.name || svg.id || 'svg';
    const pairs = [];
    for (const g of svg.querySelectorAll('g.node')) {
      const shape = [...g.children].find((c) => /^(rect|path|polygon|circle|ellipse|g)$/.test(c.tagName) && !c.classList.contains('label'));
      const label = g.querySelector('.label foreignObject div, .label text, foreignObject div, text');
      if (shape && label && label.textContent.trim()) pairs.push([shape, label]);
    }
    for (const r of svg.querySelectorAll('rect.actor, rect.note')) {
      const t = [...r.parentNode.querySelectorAll(r.classList.contains('note') ? 'text.noteText' : 'text.actor')];
      for (const x of t) if (x.textContent.trim()) pairs.push([r, x]);
    }
    const over = [];
    for (const [shape, label] of pairs) {
      const b = shape.getBoundingClientRect(), t = ink(label), tol = 0.5;
      const d = { left: b.left - t.left, right: t.right - b.right, top: b.top - t.top, bottom: t.bottom - b.bottom };
      const worst = Math.max(...Object.values(d));
      if (worst > tol) over.push({ text: label.textContent.trim().slice(0, 40), by_px: +worst.toFixed(2), font: getComputedStyle(label).fontFamily });
    }
    const sb = svg.getBoundingClientRect();
    const outside = [...svg.querySelectorAll('text, foreignObject div')].filter((e) => e.textContent.trim()).filter((e) => {
      const t = ink(e); return t.width && (t.left < sb.left - 0.5 || t.right > sb.right + 0.5 || t.top < sb.top - 0.5 || t.bottom > sb.bottom + 0.5);
    }).map((e) => e.textContent.trim().slice(0, 40));
    const anyLabel = svg.querySelector('foreignObject div, text.actor, text');
    out.push({ name, pairs_checked: pairs.length, overflowing: over, outside_svg: outside,
      label_font: anyLabel ? getComputedStyle(anyLabel).fontFamily : null,
      jetbrains_available: document.fonts.check('14px "JetBrains Mono"') });
  }
  return out;
};

const browser = await puppeteer.launch({ headless: true, args: ['--no-first-run'] });
const result = { chromium: await browser.version(), svgs: {}, html: {} };
try {
  const page = await browser.newPage();
  for (const f of readdirSync(HERE).filter((f) => f.endsWith('.svg')).sort()) {
    await page.goto(pathToFileURL(join(HERE, f)).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    result.svgs[f] = (await page.evaluate(CHECK))[0];
  }

  // the piece origin (127.0.0.1) and the host page (localhost): two sites, as in STIGMERGY
  const csp = pieceCsp(null);
  const piece = createServer((req, res) => {
    const p = join(HERE, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(HERE) || !existsSync(p) || !p.endsWith('.html')) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'x-content-type-options': 'nosniff',
      'content-security-policy': csp + '; sandbox allow-scripts' });
    res.end(readFileSync(p));
  }).listen(0, '127.0.0.1');
  await new Promise((r) => piece.once('listening', r));
  const pport = piece.address().port;
  const host = createServer((req, res) => {
    const f = new URL(req.url, 'http://x').searchParams.get('f');
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(`<!doctype html><body style="margin:0"><iframe sandbox="allow-scripts" style="border:0;width:1100px;height:6000px" src="http://127.0.0.1:${pport}/${f}"></iframe>`);
  }).listen(0, 'localhost');
  await new Promise((r) => host.once('listening', r));
  const hport = host.address().port;

  for (const f of ['routes-svg-inline.html', 'routes-client-side.html']) {
    const p = await browser.newPage();
    await p.setViewport({ width: 1100, height: 900, deviceScaleFactor: 1 });
    const errors = [];
    p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
    p.on('requestfailed', (r) => errors.push('failed ' + r.url().slice(0, 100) + ' ' + (r.failure()?.errorText || '')));
    const t0 = Date.now();
    await p.goto(`http://localhost:${hport}/?f=${f}`, { waitUntil: 'networkidle0', timeout: 60000 });
    const frame = p.frames().find((fr) => fr.url().startsWith(`http://127.0.0.1:${pport}/`));
    let state = null;
    if (f.includes('client')) {
      try { await frame.waitForFunction(() => window.__mermaid && (window.__mermaid.done || window.__mermaid.error), { timeout: 30000 }); } catch (e) { state = 'timeout'; }
      state = state || (await frame.evaluate(() => window.__mermaid));
    }
    const ms = Date.now() - t0;
    const checks = await frame.evaluate(CHECK);
    const origin = await frame.evaluate(() => String(self.origin));
    const h = await frame.evaluate(() => Math.ceil(document.querySelector('main').getBoundingClientRect().bottom) + 8);
    await p.setViewport({ width: 1100, height: Math.min(h, 6000), deviceScaleFactor: 1 });
    await p.screenshot({ path: join(HERE, f.replace('.html', '-framed.png')), clip: { x: 0, y: 0, width: 1100, height: Math.min(h, 6000) } });
    result.html[f] = { framed_sandboxed: true, frame_origin: origin, ms_to_drawn: ms, svgs_drawn: checks.length,
      render_state: state, figures: checks, console_errors: errors };
    await p.close();
  }
  piece.close(); host.close();
} finally {
  await browser.close();
}
console.log(JSON.stringify(result));
