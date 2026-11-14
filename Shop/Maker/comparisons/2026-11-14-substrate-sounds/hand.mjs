// Render the hook's own sounds offline, exactly as the page makes them: the code between /*sound:begin*/ and /*sound:end*/
// in "SUBSTRATE — rich — born on the floor.html" is evaluated unchanged. Writes one m4a per sound.
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const html = fs.readFileSync(path.join(process.env.SHOP_PALACE, 'SUBSTRATE', 'SUBSTRATE — rich — born on the floor.html'), 'utf8');
const src = html.slice(html.indexOf('/*sound:begin*/'), html.indexOf('/*sound:end*/'));
const B = { jewel: 4, world: 5, child: 10, beyond: 11, mirror: 13, turn: 15, core: 17, name: 23, red: 24, last: 25 };
const SOUND = new Function('B', src + '\nreturn SOUND;')(B); const SR = 44100;
function wav(name, x, gain) {
  const n = x.length, b = Buffer.alloc(44 + n * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i] * gain)) * 32767), 44 + i * 2);
  const w = `hand-${name}.wav`; fs.writeFileSync(w, b); execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '128000', w, `substrate-sounds — hand — ${name}.m4a`]); fs.unlinkSync(w);
}
// the levels the page plays them at: master 0.5 everywhere, and the bed a further 0.5 under the cues
const which = process.argv[2];
if (which === 'bed') wav('bed', SOUND.bed.render(SR), SOUND.master * SOUND.bedGain);
else wav(which, SOUND.cues[which].render(SR), SOUND.master);
