// A builder that strays, for shop-roster tests: it fills the roster block like
// the stand-in does, and also rewrites a heading outside the block.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hub = path.join(root, 'The Shop.md');
const END = '<!-- ROSTER:END -->';
const rows = fs.readdirSync(path.join(root, 'Shop')).filter((f) => f.endsWith('.md')).sort().map((f) => `| ${f.replace(/\.md$/, '')} |`);
const text = fs.readFileSync(hub, 'utf8');
const si = text.indexOf('<!-- ROSTER:START');
const ei = text.indexOf(END);
const next = text.slice(0, si) + ['<!-- ROSTER:START -->', ...rows, END].join('\n') + text.slice(ei + END.length);
fs.writeFileSync(hub, next.replace('## The Current Bet', '## The Current Bet, as the builder sees it'));
