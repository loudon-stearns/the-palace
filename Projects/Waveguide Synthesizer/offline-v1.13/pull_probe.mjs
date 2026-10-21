// How the hair's pull (as a share of its ceiling) moves through one cycle
// while the hair holds, at three forces. Tells the chart what scale it needs.
import path from 'node:path';
import { loadSrc, engine } from '../offline-v1.11/bow_lab.mjs';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const SRC = loadSrc(path.join(HERE, '..', process.argv[2] || 'study-v1.12-the-lesson', 'index.html'));
for (const force of [0.3, 0.6, 1.0]) {
  const p = engine(SRC); p.send({ type: 'params', freq: 196 }); p.send({ type: 'view', mode: 'strobe' });
  p.send({ type: 'bow', on: true, speed: 0.5, force, position: 0.74 }); p.run(1.5);
  const t = p.posts.filter(m => m.type === 'bowtrace').pop();
  const N = t.grip.length, held = []; for (let i = 0; i < N; i++) if (t.grip[i] >= 0.98) held.push(+t.pull[i].toFixed(2));
  console.log('force', force, 'ceil', t.ceil.toFixed(3), 'held', held.length, 'pull share while holding:', held.join(' '));
}
