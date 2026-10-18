// A stand-in for Shop/Maker/build-roster.mjs, for shop-roster tests: rewrites
// the block between the ROSTER markers in <cwd>/The Shop.md from the `status`
// of each page directly under <cwd>/Shop/, and touches nothing else.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hub = path.join(root, 'The Shop.md');
const END = '<!-- ROSTER:END -->';
const rows = fs.readdirSync(path.join(root, 'Shop')).filter((f) => f.endsWith('.md')).sort().map((f) => {
  const status = (fs.readFileSync(path.join(root, 'Shop', f), 'utf8').match(/^status:\s*(.+)$/m) || [])[1] || '?';
  return `| ${f.replace(/\.md$/, '')} | ${status} |`;
});
const text = fs.readFileSync(hub, 'utf8');
const si = text.indexOf('<!-- ROSTER:START');
const ei = text.indexOf(END);
fs.writeFileSync(hub, text.slice(0, si) + ['<!-- ROSTER:START -->', ...rows, END].join('\n') + text.slice(ei + END.length));
