// Cycle 5 Explorer — rich-face checks. Workshop.
// Runs the window piece's own engine (its <script id="engine"> block) against the claims the piece and the
// section make, and against the explorer's own spell(), so the piece can't spell a note the page wouldn't.
// node "Projects/Cycle 5 Explorer/workshop/rich-face-checks.mjs"   → prints each check, exits 1 on a failure.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url)), bundle = join(here, '..');
const piece = readFileSync(join(bundle, 'Cycle 5 Explorer — rich — the window.html'), 'utf8');
const explorer = readFileSync(join(bundle, 'cycle5-explorer.html'), 'utf8');

const engineSrc = piece.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const E = vm.createContext({});
vm.runInContext(engineSrc + '\n;globalThis.X = { mod, spell, nm, pc, stepOf, accOf, SD, MODES, KMIN, KMAX, okTonic, windowKs, scale, darker, compare };', E);
const X = E.X;

// the explorer's own theory core, from its first line to the end of nm()
const core = explorer.match(/const mod = [\s\S]*?const nm = [^\n]*\n/)[0];
const P = vm.createContext({});
vm.runInContext(core + '\n;globalThis.Y = { spell, nm };', P);
const Y = P.Y;

let fails = 0;
const check = (name, ok, detail = '') => { console.log((ok ? 'pass  ' : 'FAIL  ') + name + (detail ? '  · ' + detail : '')); if (!ok) fails++; };

// 1. spelling is the explorer's, everywhere on the strip
const ks = []; for (let k = X.KMIN; k <= X.KMAX; k++) ks.push(k);
const mism = ks.filter(k => X.nm(k) !== Y.nm(k));
check('the piece spells every k from −13 to 13 as the explorer does', mism.length === 0, mism.length ? 'differs at ' + mism.join(',') : ks.length + ' notes');
check('the strip runs G𝄫 to F𝄪, the text\'s edges', X.nm(-13) === 'G𝄫' && X.nm(13) === 'F𝄪', X.nm(-13) + ' … ' + X.nm(13));
check('C♭ Locrian reaches G𝄫 and C♯ Lydian reaches F𝄪', X.windowKs(-7 - 6).map(X.nm).includes('G𝄫') && X.windowKs(7).map(X.nm).includes('F𝄪'));
check('G major says F♯, not G♭', X.windowKs(1 - 1).map(X.nm).includes('F♯') && !X.windowKs(0).map(X.nm).includes('G♭'));

// 2. seven places apart: the same letter, a half step
const seven = ks.filter(k => k + 7 <= X.KMAX).every(k => X.spell(k).letter === X.spell(k + 7).letter && X.mod(X.pc(k + 7) - X.pc(k), 12) === 1);
check('k and k + 7 share a letter and sit a half step apart, all along the strip', seven);

// 3. every window covers the seven letters once
const wins = []; for (let L = -13; L <= 7; L++) wins.push(L);
check('every window [L, L+6] uses each letter once', wins.every(L => new Set(X.windowKs(L).map(k => X.spell(k).letter)).size === 7), wins.length + ' windows');

// 4. every scale the piece plays rises, one letter at a time
let rising = true, letters = true;
for (let T = -7; T <= 7; T++) for (let m = 0; m < 7; m++) {
  const s = X.scale(T, m); for (let i = 1; i < s.length; i++) if (s[i].midi <= s[i - 1].midi) rising = false;
  if (new Set(s.slice(0, 7).map(x => X.spell(x.k).letter)).size !== 7) letters = false;
}
check('every scale played rises and uses seven letters', rising && letters, '105 scales');

// 5. THE CLAIM, holding the tonic: each step darker lowers exactly one note
const wantFrom = ['♯4', '7', '3', '6', '2', '5'], wantTo = ['4', '♭7', '♭3', '♭6', '♭2', '♭5'];
let n = 0, one = 0, half = 0, same = 0, degOK = 0;
for (let T = -7; T <= 7; T++) for (let m = 0; m < 6; m++) {
  const r = X.compare({ T, m }, X.darker(T, m, 'tonic')); n++;
  if (r.notesChanged === 1) one++;
  if (r.semis === -1) half++;
  if (r.kLeft.length === 1 && X.spell(r.kLeft[0]).letter === X.spell(r.kCame[0]).letter && r.kCame[0] === r.kLeft[0] - 7) same++;
  if (r.degChanged.length === 1 && r.degFrom[0] === wantFrom[m] && r.degTo[0] === wantTo[m]) degOK++;
}
check('holding the tonic, every darker step changes exactly one note', one === n, one + ' of ' + n);
check('… and lowers it a half step', half === n, half + ' of ' + n);
check('… the note that leaves at L+6 comes back at L−1, same letter', same === n, same + ' of ' + n);
check('… the six steps lower ♯4, 7, 3, 6, 2, 5 in order, on every tonic', degOK === n, degOK + ' of ' + n);

// 6. holding the notes: no note changes, one degree does
let nn = 0, zero = 0, deg1 = 0, moved = 0;
for (let T = -7; T <= 7; T++) for (let m = 0; m < 6; m++) {
  const b = X.darker(T, m, 'notes'); if (!X.okTonic(b.T)) continue; nn++;
  const r = X.compare({ T, m }, b);
  if (r.notesChanged === 0) zero++;
  if (r.degChanged.length === 1 && r.degFrom[0] === wantFrom[m] && r.degTo[0] === wantTo[m]) deg1++;
  if (b.T === T + 1) moved++;
}
check('holding the notes, every darker step changes no note', zero === nn, zero + ' of ' + nn);
check('… the tonic moves up a fifth instead', moved === nn, moved + ' of ' + nn);
check('… and the same one degree goes down as with the tonic held', deg1 === nn, deg1 + ' of ' + nn);

// 7. the edge: past Locrian the note to leave is the tonic itself
check('past Locrian, the note that would leave is the tonic', [...Array(15)].map((_, i) => i - 7).every(T => { const L = T - 6; return L + 6 === T && !X.windowKs(L - 1).includes(T); }));

// 8. a key change (mode held) is the same move: one note, a half step
let kc = 0, kn = 0;
for (let T = -6; T <= 7; T++) for (let m = 0; m < 7; m++) { kn++; const r = X.compare({ T, m }, { T: T - 1, m }); if (r.notesChanged === 1 && r.semis === -1) kc++; }
check('one key flatward, mode held, also lowers exactly one note', kc === kn, kc + ' of ' + kn);

// 9. the explorer's inspector reads the same degree for "one step darker"
const darkLine = explorer.includes('const dark = m < 6 ? `${SD(6 - m)} → ${SD(-(m + 1))}');
check('the explorer\'s inspector names the same change, SD(6 − m) → SD(−(m + 1))', darkLine && [0, 1, 2, 3, 4, 5].every(m => X.SD(6 - m) === wantFrom[m] && X.SD(-(m + 1)) === wantTo[m]));

// 10. the piece never writes the kit's own message names
check('the piece leaves hush and height to the kit', !/rich:(hush|height)/.test(piece));

console.log(fails ? `\n${fails} failed` : '\nall pass');
process.exit(fails ? 1 : 0);
