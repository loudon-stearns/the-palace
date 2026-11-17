// GoButton's reader with only the two checks: the patched ltc.js in ../gobutton-patch/, and
// nothing else changed (no hysteresis, no gap rule). It passes on only the frames that are
// sure: even 0s, and the frame after the last. Run it with:  node gauntlet.mjs run sure-reader.mjs
// TRUST=2 in the environment asks for two sure frames in a row instead of one.
// It answers one question the careful reader could not: are the checks alone enough?
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const L = require(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'gobutton-patch', 'ltc.js'));

export function read(samples, sampleRate) {
  return L.decode(L.newDecoder(sampleRate), samples, Number(process.env.TRUST || 1));
}
