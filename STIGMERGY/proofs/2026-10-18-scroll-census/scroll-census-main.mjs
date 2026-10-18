// Census, second pass: the same count, made after link lifting landed. It also
// resolves each written path the way the deck does (palacePathOf) and checks that
// every page the deck plays is on disk. Read-only; uses the deck's own parser.
//
//   node scroll-census-main.mjs <palace-root> <board.jsonl>
//
// <board.jsonl> is only read (a copy of the board works). It supplies the
// messages a trail card can be built from; nothing is ever written to it.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const [rootArg, boardArg] = process.argv.slice(2);
if (!rootArg || !boardArg) {
  console.error('usage: node scroll-census-main.mjs <palace-root> <board.jsonl>');
  process.exit(2);
}
const ROOT = resolve(rootArg);
const { parseMakingSections, cardSpec, palacePathOf } = await import(`${ROOT}/_ops/stigmergy/app/src/lib/scroll-view.js`);
const files = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT }).toString().split('\0').filter((f) => / — scroll\.md$/.test(f));
const messages = readFileSync(resolve(boardArg), 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const HTML_REF = /\]\(\s*<?([^)>]*?\.html?)>?\s*\)|`([^`]*?\.html?)`/gi;
const tally = { scrolls: files.length, scrollsWithHtml: 0, plays: 0, playsViaMessage: 0, noLiftSpace: 0, noLiftOpen: 0, noLiftUrl: 0, backtickOnly: 0, other: 0 };
const perScroll = [];
for (const f of files) {
  const text = readFileSync(`${ROOT}/${f}`, 'utf8');
  const m = /<!--\s*scroll:making:start\s*-->([\s\S]*?)<!--\s*scroll:making:end\s*-->/.exec(text);
  const making = m ? m[1] : (text.split(/^## The making\s*$/m)[1] || '');
  const sections = parseMakingSections(making);
  let row = { scroll: f.replace(/ — scroll\.md$/, '').split('/').pop(), plays: 0, missed: 0, why: new Set() };
  for (const s of sections) {
    const spec = cardSpec(s, messages);
    const playing = new Set([...spec.artifacts.light, ...spec.artifacts.heavy].map((a) => a.path).filter((p) => /\.html?$/i.test(p)));
    const viaMsg = spec.fromMessage;
    for (const p of playing) { row.plays++; tally.plays++; if (viaMsg) tally.playsViaMessage++; if (!existsSync(`${ROOT}/${p}`)) { tally.missingOnDisk = (tally.missingOnDisk || 0) + 1; (tally.missingList = tally.missingList || []).push(p); } }
    HTML_REF.lastIndex = 0; let r;
    while ((r = HTML_REF.exec(s.body || '')) !== null) {
      const ref = (r[1] || r[2] || '').trim();
      if (!ref || playing.has(ref) || playing.has(palacePathOf(ref))) continue;
      if ([...playing].some((p) => decodeURIComponent(p) === decodeURIComponent(ref))) continue;
      row.missed++;
      if (r[2] && !r[1]) { tally.backtickOnly++; row.why.add('named in backticks, not linked'); }
      else if (/^open:/i.test(ref)) { tally.noLiftOpen++; row.why.add('open: link'); }
      else if (/^[a-z]+:\/\//i.test(ref)) { tally.noLiftUrl++; row.why.add('a web URL'); }
      else if (/\s/.test(ref)) { tally.noLiftSpace++; row.why.add('space in the path'); }
      else { tally.other++; row.why.add('other: ' + ref.slice(0, 50)); }
    }
  }
  if (row.plays || row.missed) { tally.scrollsWithHtml++; perScroll.push({ ...row, why: [...row.why].join('; ') }); }
}
console.log(JSON.stringify(tally, null, 1));
perScroll.sort((a, b) => b.missed - a.missed);
for (const r of perScroll) console.log(`${String(r.plays).padStart(3)} play  ${String(r.missed).padStart(3)} missed  ${r.scroll}${r.why ? '  -- ' + r.why : ''}`);
