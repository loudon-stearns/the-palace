// Builds class-run-sheet.html from rehearsal.json: a one-class plan for teaching with the page, every beat
// of it pressed on the real page first by rehearse.mjs. What the sheet quotes (modes, feel words, the one
// note that changes, progressions in four dialects) is what the page showed, not what we expect it to show.
// Run after rehearse.mjs. The stills are inlined so the sheet stands alone in the board.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const R = JSON.parse(readFileSync(join(here, "rehearsal.json"), "utf8"));
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
const img = f => `data:image/jpeg;base64,${readFileSync(join(here, f)).toString("base64")}`;
const by = b => R.beats.filter(x => x.beat === b);
const lane = s => s.lane.map(x => `<span class="ch ${x.s !== "diatonic" ? "bor" : ""}"><b>${esc(x.r)}</b> ${esc(x.n)}${x.s !== "diatonic" ? ` <i>${esc(x.s)}</i>` : ""}</span>`).join("");

const emotionRows = by("emotion").map(s => `<tr><td class="mn">${esc(s.tonic)} ${esc(s.mode)}</td><td>${esc(s.facts["Scale"]).replace(/ {2}/g, " · ")}</td><td class="fw">“${esc(s.feel)}”</td><td class="dk">${esc(s.facts["One step darker"])}</td></tr>`).join("");
const windowRow = by("window").map(s => `<span class="w">${esc(s.tonic)} ${esc(s.mode)}</span>`).join(" → ");
const dialects = { berklee: "Berklee", jazz: "Jazz shorthand", lead: "Lead sheet", classical: "Classical" };
const cycleRows = by("cycle").map(s => `<tr><td class="k">${dialects[s.dialect]}</td><td>${lane(s)}</td></tr>`).join("");
const [bPreset, bDia, bBor, bMoved] = by("borrow");
const open = R.beats[0];

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cycle 5 Explorer — one class, rehearsed</title>
<style>
:root{--g0:#f0eee5;--g1:#e6e3d7;--ink:#1a1916;--ink2:#3a3a35;--ink3:#6a6862;--rule:#b8b09a;--soft:#cfc9b6;--acc:#c8261a;--blue:#2b5fb0;--ok:#3a7d2c;--amber:#a8730a}
*{box-sizing:border-box}body{margin:0;background:var(--g0);color:var(--ink);font:14px/1.55 "JetBrains Mono",ui-monospace,Menlo,monospace}
main{max-width:1060px;margin:0 auto;padding:28px 24px 60px}
header{border:1.5px solid var(--ink);display:grid;grid-template-columns:1fr auto;margin-bottom:22px}
header h1{margin:0;padding:14px 16px;font-size:20px;letter-spacing:.04em;text-transform:uppercase}
header .tb{border-left:1.5px solid var(--ink);padding:8px 14px;font-size:11px;color:var(--ink2)}header .tb b{color:var(--acc)}
h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;border-bottom:1.5px solid var(--ink);padding-bottom:4px;margin:34px 0 10px;display:flex;justify-content:space-between}
h2 .min{color:var(--ink3);letter-spacing:.06em}
p{max-width:80ch;margin:8px 0}.k{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3)}
.do{border-left:3px solid var(--blue);padding:6px 12px;background:var(--g1);margin:8px 0}
.say{border-left:3px solid var(--acc);padding:6px 12px;margin:8px 0;font-style:italic}
.ask{border:1px dashed var(--ink3);padding:6px 12px;margin:8px 0}
kbd{border:1px solid var(--ink);border-bottom-width:2px;padding:0 5px;font:inherit;font-size:12px;background:#f7f5ee}
.btnname{border:1px solid var(--ink3);padding:0 6px;background:#ebe7da;font-size:12.5px;white-space:nowrap}
table{border-collapse:collapse;width:100%;font-size:12.5px;margin:6px 0}
th{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);text-align:left;border-bottom:1px solid var(--ink);padding:3px 6px}
td{border-bottom:1px solid var(--soft);padding:4px 6px;vertical-align:top}
td.mn{color:var(--acc);white-space:nowrap}td.fw{color:var(--ink2)}td.dk{color:var(--blue);white-space:nowrap}
.w{white-space:nowrap;color:var(--acc)}
.ch{display:inline-block;border:1px solid var(--rule);padding:1px 6px;margin:2px 3px 2px 0;background:#f7f5ee;white-space:nowrap}
.ch.bor{border-style:dashed;border-color:var(--acc)}.ch i{color:var(--acc);font-size:11px}
figure{margin:12px 0}figure img{width:100%;border:1px solid var(--rule)}figcaption{font-size:11.5px;color:var(--ink3)}
.find{border:1.5px solid var(--amber);padding:8px 12px;margin:10px 0;background:#f6eedb}
.find b{color:var(--amber)}
.mark{color:var(--ink3);font-size:12px}
footer{margin-top:36px;font-size:11px;color:var(--ink3);border-top:1px solid var(--rule);padding-top:8px}
@media print{body{background:#fff}main{padding:0}figure{break-inside:avoid}}
</style></head><body><main>
<header><h1>Cycle 5 Explorer · one class, rehearsed</h1><div class="tb">STATUS <b>DRAFT</b> · a lesson plan for the page<br>every step pressed on the page first · ${esc(R.ran.slice(0, 10))}</div></header>

<p>A fifty-minute class built from the page as it stands, in the order your brief gives: emotion, then mode, then the cycle and its progressions, then modal interchange, with the four notations along the way. Every key and button below was pressed on the real page by a script before it went on this sheet, and the chords, feel words and notes quoted are what the page showed back. Blue boxes are what you do, red lines what you might say, dashed boxes a question for the room. Change anything with a pen.</p>

<h2>Before class <span class="min">2 min</span></h2>
<div class="do">Open <code>cycle5-explorer.html</code>. On a dark projector press <kbd>P</kbd> for Phosphor. Press <kbd>S</kbd> once as a sound check. The page opens on <b>${esc(open.tonic)} ${esc(open.mode)}</b>, with a mode change keeping the <b>same ${open.keep === "notes" ? "notes" : "tonic"}</b>. <kbd>T</kbd> flips that.</div>
<div class="find"><b>The grids now show every column.</b> Rehearsing turned up that the three grids, side by side, each hid their last column at every width up to 1920 pixels, the 7 and ♭7 column among them. On 2026-11-04 the page put Scale Tones and Chord Function side by side and Chord Tones on its own row below. A sweep of every width from 640 to 1920 now finds nothing hidden. On a phone they still scroll sideways.</div>

<h2>1 · Emotion first <span class="min">10 min</span></h2>
<div class="do">Press <kbd>T</kbd> until the header says <b>same tonic</b>. Then click <span class="btnname">Bright to dark, one note at a time</span>, or walk it by hand with <kbd>↑</kbd> to Lydian and <kbd>↓</kbd> one mode at a time, <kbd>S</kbd> for each scale.</div>
<div class="ask">Before you reveal the page's word: <i>what does this one feel like?</i> Collect the room's words for two or three modes, then show the inspector's.</div>
<div class="say">Every step darker lowers exactly one note. Watch the red box move in the Scale Tones grid.</div>
<table><thead><tr><th>mode</th><th>scale and degrees</th><th>the page's feel word</th><th>one step darker</th></tr></thead><tbody>${emotionRows}</tbody></table>
<figure><img src="${img(R.stills[0])}" alt="the page on C Dorian, same tonic"><figcaption>C Dorian, same tonic, as the page showed it in the rehearsal.</figcaption></figure>

<h2>2 · Same notes, new home <span class="min">8 min</span></h2>
<div class="do">Press <kbd>↑</kbd> twice to get back to C Ionian, then <kbd>T</kbd> for <b>same notes</b>. Click <span class="btnname">Same notes, new home</span>, or press <kbd>↑</kbd> once and walk <kbd>↓</kbd>. The white keys stay; the home moves:</div>
<p>${windowRow}</p>
<div class="say">It's one seven-note window on the line of fifths. Turning the degree ring moves the tonic inside the window; turning the note ring slides the window. That's the whole decoder ring.</div>
<div class="ask">Drag the note ring yourself, slowly, and ask: <i>which note just changed?</i> Each slot is one new sharp or one new flat.</div>
<p class="mark">Your 2026-10-27 video says the line-of-fifths jig "isn't incredibly useful for the students to see". The page shows it anyway, under the hood at the bottom. Skip it here, or use it once to answer whoever asks why F♯ and not G♭. ☐ skip &nbsp;☐ show once</p>

<h2>3 · The cycle, and four ways to write it <span class="min">12 min</span></h2>
<div class="do">Press <kbd>↑</kbd> five times to come home to C Ionian. Click <span class="btnname">Around the cycle</span>, which plays the diatonic cycle of fifths. Then press <kbd>N</kbd> three times while it loops, so the room watches one progression in each notation:</div>
<table><tbody>${cycleRows}</tbody></table>
<div class="say">Same chords, four dialects. Berklee writes uppercase numerals and puts the quality on the end; classical lets the case of the numeral tell you major or minor.</div>
<div class="do">Then try the presets <span class="btnname">II V I</span> and <span class="btnname">I VI II V</span>, and press <kbd>1</kbd> to <kbd>7</kbd> to play single chords. The inspector shows each one's tensions and avoid notes.</div>
<figure><img src="${img(R.stills[1])}" alt="the diatonic cycle loaded"><figcaption>The diatonic cycle loaded in the progression lane.</figcaption></figure>

<h2>4 · Borrow one chord <span class="min">14 min</span></h2>
<div class="do">Click <span class="btnname">Borrow one chord</span>. It puts the page on Ionian and plays the preset IV to minor IV:</div>
<p>${lane(bPreset)}</p>
<div class="say">The minor iv comes from the parallel minor, the same tonic with a darker window. The dashed outline in the lane marks a borrowed chord.</div>
<div class="do"><b>The students make one.</b> Hold <b>same tonic</b>. Click <span class="btnname">Clear</span>, turn on <span class="btnname">+ Build from clicks</span>, and press <kbd>1</kbd> <kbd>6</kbd> <kbd>4</kbd> <kbd>5</kbd>:</div>
<p>${lane(bDia)}</p>
<div class="do">Clear again. Press <kbd>1</kbd>, click the ♭VI in the <b>Aeolian</b> row of the Chord Function grid, then <kbd>4</kbd> <kbd>5</kbd>. Play both versions back to back:</div>
<p>${lane(bBor)}</p>
<div class="do">Now press <kbd>→</kbd> twice. The progression moves to D, and the borrowed chord keeps its colour:</div>
<p>${lane(bMoved)}</p>
<div class="ask"><i>Which single chord would you borrow into your own song, and from which mode?</i> Have two or three students build theirs on the projector.</div>
<figure><img src="${img(R.stills[2])}" alt="the borrowed progression in D"><figcaption>I ♭VI IV V moved to D: the ♭VI is still borrowed from Aeolian.</figcaption></figure>

<h2>5 · Walk the keys, and close <span class="min">4 min</span></h2>
<div class="do">Click <span class="btnname">Walk the keys</span>. It plays a tonic chord up the sharp side from C to F♯, then down the flat side from C to G♭.</div>
<div class="ask">The one question to end on: <i>how do you feel, and which mode felt most like you today?</i></div>
<p>Afterward the page is one file with nothing to install, so a student can keep it and open it in any browser.</p>

<h2>What I'd want back from you</h2>
<p>☐ The order works &nbsp;☐ Reorder it: ______________ &nbsp;&nbsp; ☐ Fifty minutes is right &nbsp;☐ It's really ____ minutes</p>
<p>☐ The student-made step in beat 4 is the right thing to make &nbsp;☐ Make something else: ______________</p>
<p>This sheet doesn't replace the review sheet in <code>review/</code>, which still carries your four open questions about the page itself.</p>

<footer>Built by build-run-sheet.mjs from rehearsal.json, which rehearse.mjs recorded by pressing these keys on the page in headless Chromium (silenced). Rerun both after any change to the page. Nothing on the page was changed.</footer>
</main></body></html>`;
writeFileSync(join(here, "class-run-sheet.html"), html);
console.log("class-run-sheet.html", (html.length / 1024).toFixed(0), "KB");
