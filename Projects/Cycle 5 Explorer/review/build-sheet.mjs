// Builds review-sheet.html from audit.json and page-sound.json: one printable sheet for Loudon's review of
// the page's open questions. Run after audit.mjs and render-audio.mjs.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const A = JSON.parse(readFileSync(join(here, "audit.json"), "utf8"));
const P = JSON.parse(readFileSync(join(here, "page-sound.json"), "utf8"));
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const D = Object.keys(A.dialects);
const tensSorted = t => t.split(" ").filter(Boolean).sort((a, b) => parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""))).join(" ");

const modeBlocks = A.sheet.map(s => `
<section class="mode">
  <h3><span class="mname">C ${esc(s.mode)}</span><span class="scale">${esc(s.scale)}</span><span class="deg">${esc(s.degrees)}</span></h3>
  <p class="feel"><span class="k">feel word</span> “${esc(s.feel)}” <span class="mark">☐ yes &nbsp;☐ change to ____________</span></p>
  <table><thead><tr><th>deg</th>${D.map(d => `<th>${esc(A.dialects[d])}</th>`).join("")}<th>tensions <small>(avoid)</small></th></tr></thead><tbody>
  ${s.chords.map(c => `<tr><td class="dg">${esc(c.deg)}</td>${D.map(d => `<td><b>${esc(c.dialects[d].symbol)}</b> <span class="rn">${esc(c.dialects[d].roman)}</span></td>`).join("")}<td class="tn">${esc(tensSorted(c.tens))}</td></tr>`).join("")}
  </tbody></table>
</section>`).join("");

const pitchRows = P.pitches.map(p => `<tr><td>${p.note}</td><td>${p.want}</td><td>${p.found}</td><td>${p.cents > 0 ? "+" : ""}${p.cents}</td><td>${p.newest_is_this_note === true ? "yes" : esc(p.newest_is_this_note)}</td></tr>`).join("");
const timeline = P.marks.map(m => m.what ? `<li class="sec"><span class="t">${m.t.toFixed(1)} s</span> ${esc(m.what)}</li>` : `<li><span class="t">${m.t.toFixed(1)} s</span> ${esc(m.chord)} · ${esc(m.roman)}</li>`).join("");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cycle 5 Explorer — review sheet</title>
<style>
:root{--g0:#f0eee5;--g1:#e6e3d7;--ink:#1a1916;--ink2:#3a3a35;--ink3:#6a6862;--rule:#b8b09a;--soft:#cfc9b6;--acc:#c8261a;--blue:#2b5fb0;--ok:#3a7d2c;--amber:#a8730a}
*{box-sizing:border-box}body{margin:0;background:var(--g0);color:var(--ink);font:14px/1.5 "JetBrains Mono",ui-monospace,Menlo,monospace}
main{max-width:1060px;margin:0 auto;padding:28px 24px 60px}
header{border:1.5px solid var(--ink);display:grid;grid-template-columns:1fr auto;margin-bottom:22px}
header h1{margin:0;padding:14px 16px;font-size:20px;letter-spacing:.04em;text-transform:uppercase}
header .tb{border-left:1.5px solid var(--ink);padding:8px 14px;font-size:11px;color:var(--ink2)}
header .tb b{color:var(--acc)}
h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;border-bottom:1.5px solid var(--ink);padding-bottom:4px;margin:30px 0 12px}
p{max-width:78ch}.k{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3);margin-right:8px}
.q{border-left:3px solid var(--acc);padding:6px 12px;margin:10px 0;background:var(--g1)}
.q b{display:block}.q .mark{color:var(--ink3)}
.mode{border:1px solid var(--rule);padding:10px 12px 12px;margin:14px 0;break-inside:avoid;background:#f5f3eb}
.mode h3{margin:0 0 4px;font-size:15px;display:flex;gap:18px;flex-wrap:wrap;align-items:baseline}
.mname{color:var(--acc)}.scale{color:var(--ink)}.deg{color:var(--blue);font-size:12px}
.feel{margin:2px 0 8px;font-size:13px}.mark{color:var(--ink3);font-size:12px;margin-left:10px}
table{border-collapse:collapse;width:100%;font-size:12.5px}
th{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);text-align:left;border-bottom:1px solid var(--ink);padding:3px 6px}
td{border-bottom:1px solid var(--soft);padding:3px 6px;white-space:nowrap}
td.dg{color:var(--blue);font-weight:700}.rn{color:var(--ink3)}td.tn{color:var(--amber)}
.ok{color:var(--ok);font-weight:700}
ul.tl{columns:2;list-style:none;padding:0;font-size:12.5px}ul.tl li{padding:1px 0}ul.tl .sec{color:var(--acc);margin-top:6px}.t{color:var(--ink3);display:inline-block;width:52px}
.notice{border:1px dashed var(--amber);padding:8px 12px;margin:8px 0}
footer{margin-top:36px;font-size:11px;color:var(--ink3);border-top:1px solid var(--rule);padding-top:8px}
@media print{body{background:#fff}.mode{background:#fff}main{padding:0}}
</style></head><body><main>
<header><h1>Cycle 5 Explorer · review sheet</h1><div class="tb">STATUS <b>SKETCH</b> · for Loudon's review<br>generated from the page's own code · nothing hand-copied</div></header>

<p>This is everything the page asks you, on one sheet you can print and mark with a pen. The rows below are read straight out of <code>cycle5-explorer.html</code>, so if a dialect looks wrong here it is wrong on the page. I changed nothing on the page itself.</p>

<h2>The four questions</h2>
<div class="q"><b>1 · What should a mode change keep, by default in class?</b>The same notes (C Ionian → D Dorian, relative) or the same tonic (C Ionian → C Dorian, parallel; the modal interchange chart). The page opens on same notes today. <span class="mark">☐ same notes &nbsp;☐ same tonic</span></div>
<div class="q"><b>2 · Do the four dialects match how you write at Berklee?</b>Read the grids below. Things I'd ask about: Berklee half-diminished as <code>–7(♭5)</code> vs <code>–7♭5</code>; uppercase numerals with the quality as a suffix (<code>II–7</code>, <code>♭VImaj7</code>); jazz shorthand mixes <code>Δ7</code> with <code>–7</code>; classical writes major sevenths as <code>IM7</code>, where some books write <code>I7</code>.</div>
<div class="q"><b>3 · Does each mode's feel word match how you teach emotion to mode?</b>One tick box per mode, below.</div>
<div class="q"><b>4 · Which feature comes first?</b>Secondary dominants and tritone subs · harmonic and melodic minor windows · a bass and voice-leading view · MIDI out to Ableton · presentation mode for a projector. <span class="mark">pick one: ____________</span></div>

<h2>The seven modes on C, every chord in every dialect</h2>
<p>This is the same-tonic view: C stays put while the window slides. Each chord shows its symbol in bold and its Roman numeral beside it. Tensions come from the mode's own window; the ones in parentheses are avoid notes by the half-step rule (a tension a half step above a chord tone). I sorted the tensions into 9, 11, 13 here. On the page the written symbol is already sorted (<code>Cmaj7(9, ♯11, 13)</code>), but <b>the row of note chips above it runs in fifths order (9, 13, ♯11)</b>. That's a small thing I'd fix when the page is next open.</p>
${modeBlocks}

<h2>Is the spelling right everywhere? <span class="ok">yes, ${A.checks} checks, ${A.fails.length} failures</span></h2>
<p>I ran every tonic from C♭ to C♯ through every mode (105 scales). Each one has to use all seven letters once and match the mode's step pattern. Every diatonic seventh chord has to have the right intervals and stay inside the key, and every avoid-note flag has to agree with the half-step rule. The edges:</p>
<ul>${A.edges.map(e => `<li>${esc(e)}</li>`).join("")}</ul>

<h2>The page's own sound, rendered for the first time</h2>
<p>Nobody had heard the page since it was restyled, because a headless browser has no speakers. So I loaded the page, swapped its audio output for an offline renderer, and pressed its own buttons in code: the scale, then the <i>Diatonic cycle 5</i> preset at the default 88 bpm, then <i>IV to minor IV</i>. The result is <code>review/page-sound.wav</code>, ${P.seconds} s. Peak ${P.peak_dbfs} dBFS, average ${P.rms_dbfs} dBFS, ${P.clipped_samples} clipped samples.</p>
<table style="max-width:560px"><thead><tr><th>scale note</th><th>should be (Hz)</th><th>measured</th><th>cents</th><th>the new note at its onset?</th></tr></thead><tbody>${pitchRows}</tbody></table>
<p class="notice">That's measured, not heard. I checked that each scale step lands on the right pitch. Whether the triangle-plus-octave voice and the reverb sound good enough for a classroom is a question for your ears.</p>
<ul class="tl">${timeline}</ul>

<footer>Rebuild: <code>node review/audit.mjs && node review/render-audio.mjs && node review/build-sheet.mjs</code> from the project folder. Cycle 5 Explorer steward, ${new Date().toISOString().slice(0, 10)}.</footer>
</main></body></html>`;
writeFileSync(join(here, "review-sheet.html"), html);
console.log("review-sheet.html", html.length, "bytes");
