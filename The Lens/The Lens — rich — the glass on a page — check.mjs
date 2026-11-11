// Holds "the glass on a page" to its sources: every paragraph of the subject and every
// Merleau-Ponty excerpt must be in its file word for word. Run from the palace root:
//   node "The Lens/The Lens — rich — the glass on a page — check.mjs"
// Exit 1 on any miss. A paraphrase, a fixed typo or a drifted page fails it.
import { readFileSync } from 'node:fs';
const html = readFileSync('The Lens/The Lens — rich — the glass on a page.html', 'utf8');
const D = JSON.parse(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/.exec(html)[1]);
const subject = readFileSync(D.subject, 'utf8');
const woken = readFileSync(D.mp_file, 'utf8');
let bad = 0;
const hold = (what, text, src) => { const ok = src.includes(text); if (!ok) bad++; console.log((ok ? 'ok   ' : 'MISS ') + what + ' (' + text.length + ' chars)'); };
for (const p of D.passages) hold(`subject ${p.id} § ${p.sec}`, p.text, subject);
for (const [pid, parts] of Object.entries(D.eyes.mp.r)) parts.forEach((t, i) => hold(`Merleau-Ponty excerpt ${pid}.${i + 1}`, t, woken));
const j = JSON.parse(woken.slice(woken.indexOf('```json') + 7, woken.lastIndexOf('```')));
const same = (what, a, b) => { const ok = a === b; if (!ok) bad++; console.log((ok ? 'ok   ' : 'MISS ') + what); };
same('Merleau-Ponty spark', D.eyes.mp.spark, j.spark);
same('Merleau-Ponty payoff', D.eyes.mp.payoff, j.candidate.type);
same('Merleau-Ponty doorway', D.eyes.mp.doorway, j.doorway);
hold('Merleau-Ponty payoff detail', D.eyes.mp.detail, j.candidate.detail);
hold('Merleau-Ponty distortion check', D.eyes.mp.distortion, j.distortion_check);
console.log(bad ? `${bad} miss(es)` : 'all held');
process.exit(bad ? 1 : 0);
