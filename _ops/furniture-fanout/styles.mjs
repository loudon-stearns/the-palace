#!/usr/bin/env node
// styles.mjs — what the furniture sheet changed on each page, read from the browser, not guessed.
// Loads each page in headless Chromium (file://), waits for it to settle, and records the computed style
// of every element in its body. Run once before furnish.py --apply and once after; --diff names, per page,
// the elements whose look changed, split into the furniture the sheet is meant to dress (bare controls)
// and everything else (an element the page styled with a class or id: the ones to look at).
//
//   node _ops/furniture-fanout/styles.mjs --snap <out-dir> <list.txt>    one JSON per page
//   node _ops/furniture-fanout/styles.mjs --diff <before-dir> <after-dir> [--out report.json]
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const require = createRequire(join(ROOT, '_ops/stigmergy/app/package.json'));

const PROPS = ['color', 'background-color', 'background-image', 'border-top-color', 'border-top-width', 'border-top-style',
  'border-radius', 'padding-top', 'padding-left', 'margin-top', 'margin-left', 'font-family', 'font-size', 'font-weight',
  'text-transform', 'letter-spacing', 'text-decoration-line', 'text-decoration-color', 'outline-style', 'box-shadow',
  'appearance', 'list-style-type', 'resize', 'cursor', 'width', 'height'];
const LAYOUT = new Set(['width', 'height']);
const SCHEME = new Set(['color', 'border-top-color', 'text-decoration-color']);
const key = (p) => createHash('sha1').update(p).digest('hex').slice(0, 16);

async function snap(outDir, listFile) {
  const { chromium } = require('playwright');
  mkdirSync(outDir, { recursive: true });
  const pages = readFileSync(listFile, 'utf8').split('\n').filter(Boolean);
  const browser = await chromium.launch({ args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] });
  const N = 4; let i = 0;
  const work = async () => {
    const ctx = await browser.newContext({ viewport: { width: 1130, height: 900 } });
    while (i < pages.length) {
      const p = pages[i++];
      const page = await ctx.newPage();
      let rec = { path: p, els: [] };
      try {
        await page.goto(pathToFileURL(join(ROOT, p)).href, { waitUntil: 'load', timeout: 15000 });
        await page.waitForTimeout(1200);
        rec = await page.evaluate((PROPS) => {
          const els = [];
          for (const el of document.querySelectorAll('body *')) {
            if (el.closest('svg') || ['SCRIPT', 'STYLE', 'BR'].includes(el.tagName)) continue;
            const cs = getComputedStyle(el);
            const s = {}; for (const k of PROPS) s[k] = cs.getPropertyValue(k);
            els.push({ tag: el.tagName.toLowerCase(), type: el.getAttribute('type') || '', cls: el.getAttribute('class') || '', id: el.id || '', s });
          }
          return { path: location.pathname, scheme: getComputedStyle(document.documentElement).colorScheme, els };
        }, PROPS);
        rec.path = p;
      } catch (e) { rec.error = String(e.message || e).slice(0, 200); }
      writeFileSync(join(outDir, key(p) + '.json'), JSON.stringify(rec));
      await page.close();
      if (i % 25 === 0) process.stderr.write(`${i}/${pages.length}\n`);
    }
    await ctx.close();
  };
  await Promise.all(Array.from({ length: N }, work));
  await browser.close();
}

// which kind of furniture an element is, in furnish.py's words, so a change can be read against the plan
function kindOf(e) {
  const t = e.tag, ty = e.type.toLowerCase();
  if (t === 'input') return ty === 'range' ? 'range' : ['checkbox', 'radio'].includes(ty) ? 'check' : ty === 'file' ? 'file'
    : ty === 'number' ? 'number' : ['button', 'submit', 'reset'].includes(ty) ? 'button' : 'field';
  return { textarea: 'textarea', select: 'select', option: 'select', button: 'button', summary: 'details', details: 'details',
    a: 'link', dialog: 'dialog', progress: 'progress', meter: 'progress', hr: 'hr', mark: 'mark', kbd: 'kbd', code: 'code',
    pre: 'code', samp: 'code', td: 'numerals', th: 'numerals', time: 'numerals', output: 'numerals', label: 'touch' }[t] || null;
}

function diff(beforeDir, afterDir, out) {
  const plans = new Map(JSON.parse(readFileSync(join(HERE, 'plan.json'), 'utf8')).map((p) => [p.path, p]));
  const report = [];
  for (const f of readdirSync(afterDir)) {
    if (!existsSync(join(beforeDir, f))) continue;
    const a = JSON.parse(readFileSync(join(beforeDir, f), 'utf8'));
    const b = JSON.parse(readFileSync(join(afterDir, f), 'utf8'));
    const plan = plans.get(b.path) || {};
    // a linked sheet dresses everything; an inlined one only what the plan says, plus the textarea's grip rule
    const dressed = new Set(plan.link_controls ? ['range', 'check', 'file', 'number', 'button', 'field', 'textarea', 'select', 'details', 'link', 'dialog', 'progress', 'hr', 'mark', 'kbd', 'code', 'numerals', 'touch'] : [...(plan.dressed_here || []), 'numerals', 'touch', ...((plan.dressed_here || []).includes('grip') ? ['textarea'] : [])]);
    const r = { path: b.path, scheme: [a.scheme, b.scheme], expected: {}, styled: {}, layout: 0, aligned: true, error: b.error || a.error };
    if (a.els.length !== b.els.length) r.aligned = false;
    const n = Math.min(a.els.length, b.els.length);
    for (let i = 0; i < n; i++) {
      const x = a.els[i], y = b.els[i];
      if (x.tag !== y.tag || x.cls !== y.cls) { r.aligned = false; continue; }
      // colour and accent-colour that follow color-scheme are the point of it: a dark page's controls stop being white
      const changed = PROPS.filter((k) => x.s[k] !== y.s[k]);
      if (!changed.length) continue;
      const look = changed.filter((k) => !LAYOUT.has(k));
      if (!look.length) { r.layout++; continue; }
      // the default text colour of an element the page never coloured follows color-scheme: that is the scheme line at work
      if (look.every((k) => SCHEME.has(k))) { r.scheme_only = (r.scheme_only || 0) + 1; continue; }
      const who = `${y.tag}${y.type ? `[${y.type}]` : ''}${y.cls ? '.' + y.cls.trim().split(/\s+/).join('.') : ''}`;
      const k = kindOf(y);
      const bucket = k && dressed.has(k) ? r.expected : r.styled;
      const e = (bucket[who] ||= { n: 0, props: {} });
      e.n++;
      for (const p of look) e.props[p] ||= [x.s[p], y.s[p]];
    }
    report.push(r);
  }
  report.sort((p, q) => Object.keys(q.styled).length - Object.keys(p.styled).length);
  if (out) writeFileSync(out, JSON.stringify(report, null, 1));
  const touched = report.filter((r) => Object.keys(r.styled).length);
  console.log(`${report.length} pages compared; ${touched.length} where something outside the planned furniture changed look`);
  for (const r of touched.slice(0, 60)) console.log(`  ${r.path}: ${Object.entries(r.styled).map(([w, e]) => `${w}×${e.n} (${Object.keys(e.props).join(' ')})`).join('; ').slice(0, 260)}`);
}

const [mode, x, y, ...rest] = process.argv.slice(2);
if (mode === '--snap') await snap(x, y);
else if (mode === '--diff') diff(x, y, rest[0] === '--out' ? rest[1] : null);
else console.log('usage: --snap <out-dir> <list.txt> | --diff <before> <after> [--out file]');
