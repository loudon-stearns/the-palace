// Bakes SUBSTRATE/workshop/strata.json into the piece, between its strata markers.
// usage (from the palace root): node SUBSTRATE/workshop/strata.mjs > SUBSTRATE/workshop/strata.json && node SUBSTRATE/workshop/bake.mjs
import fs from 'node:fs';
const piece = 'SUBSTRATE/SUBSTRATE — rich — born on the floor.html';
const d = JSON.parse(fs.readFileSync('SUBSTRATE/workshop/strata.json', 'utf8'));
delete d.groups;
const html = fs.readFileSync(piece, 'utf8');
const a = html.indexOf('/*strata:begin*/'), b = html.indexOf('/*strata:end*/');
if (a < 0 || b < 0) throw new Error('markers not found');
fs.writeFileSync(piece, html.slice(0, a) + '/*strata:begin*/\nconst STRATA = ' + JSON.stringify(d) + ';\n' + html.slice(b));
console.log('baked', d.total, 'commits,', d.weeks.length, 'weeks, head', d.head);
