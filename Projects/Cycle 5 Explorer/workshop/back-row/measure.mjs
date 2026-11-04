// The back-row test for my page, done before Loudon does it in a room. Loads cycle5-explorer.html in headless
// Chromium at two projector resolutions, Paper and Phosphor, and measures every visible label's rendered
// cap height in screen pixels, grouped the way Loudon would point at it. Then turns pixels into the angle the
// letter makes at the back row (k screen-heights away), and writes measure.json, one full still and one still
// per region per screen.
// Room model and thresholds borrowed from Rational Hearing's back-row test: 5 arcmin is a 20/20 letter
// (Snellen), ~10 reads, 16+ is comfortable. The back row sits 8 screen-heights out; a small room, 6.
// Run: node "Projects/Cycle 5 Explorer/workshop/back-row/measure.mjs" [page.html] [tag] [?query]
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const target = resolve(process.argv[2] || join(here, "../../cycle5-explorer.html"));
const tag = process.argv[3] || "page";
const query = process.argv[4] || "";
const SCREENS = [[1280, 720], [1920, 1080]];
const CAP = 0.70; // cap height in em, for the page's mono and music faces, near enough
const screenArcmin = k => 2 * Math.atan(1 / (2 * k)) * 180 / Math.PI * 60;
const ang = (px, h, k) => px * screenArcmin(k) / h;
const band = a => a >= 16 ? "comfortable" : a >= 10 ? "reads" : a >= 5 ? "strains" : "below 20/20";

const browser = await chromium.launch();
const out = { page: target, tag, ran: new Date().toISOString(), cap_em: CAP, room: "back row at 8 screen-heights (6 for a small room)", runs: [] };
for (const [w, h] of SCREENS) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(pathToFileURL(target).href + query);
  await page.waitForTimeout(500);
  const r = await page.evaluate(([CAP]) => {
    const group = el => {
      const c = s => el.closest(s);
      const cls = el.getAttribute("class") || "";
      if (c("#wheel")) {
        if (/t-note/.test(cls)) return "wheel: note names";
        if (/t-deg/.test(cls)) return "wheel: degree numbers";
        if (/t-mode/.test(cls)) return "wheel: mode names";
        if (/t-func/.test(cls)) return "wheel: Roman numerals";
        if (/t-qual/.test(cls)) return "wheel: chord qualities";
        if (/t-from/.test(cls)) return "wheel: borrowed-from labels";
        if (/t-legend/.test(cls)) return "wheel: ring legends";
        return "wheel: other";
      }
      if (c(".titleblock")) return "title block";
      if (c("#modePanel")) {
        if (c(".modehead")) return "inspector: tonic and mode";
        if (c(".meter")) return "inspector: bright-dark meter";
        if (c("h2") || c("h3")) return "inspector: headings";
        return "inspector: scale and facts";
      }
      if (c("#chordPanel")) {
        if (c(".chordsym")) return "chord: big symbol";
        if (c("svg")) return "chord: staff";
        if (c(".tone")) return "chord: tones";
        if (c("h2") || c("h3")) return "chord: headings";
        return "chord: dialects and tensions";
      }
      if (c("table.g")) {
        if (c("td small")) return "grids: cell small print";
        if (c("td")) return "grids: cell names";
        if (c("th.rowh")) return "grids: row heads";
        return "grids: column heads";
      }
      if (c(".grids") || c(".gridnote") || c(".gridhead")) return "grids: notes and heads";
      if (c("#lof")) {
        if (c(".nm")) return "line of fifths: names";
        return "line of fifths: degrees, chord tones, range";
      }
      if (c("#lane") || c(".slot")) return "progressions: slots";
      if (c(".prog") || c(".presets")) return "progressions: presets and controls";
      if (c(".keys") || c("kbd")) return "keyboard help";
      if (c("button") || c(".seg") || c(".btn")) return "buttons";
      if (c("h1")) return "title";
      return "other text";
    };
    const rows = [], seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const el = n.parentElement; if (!el || seen.has(el) || !n.textContent.trim()) continue; seen.add(el);
      const rect = el.getBoundingClientRect(); if (!rect.width || !rect.height) continue;
      const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) continue;
      if (el.closest("[hidden]")) continue;
      let px = parseFloat(cs.fontSize) * (el.currentCSSZoom ?? 1); // CSS zoom is not in the computed size
      if (el instanceof SVGElement) {
        const fa = el.getAttribute("font-size"); if (fa && !el.style.fontSize && !/t-/.test(el.getAttribute("class") || "")) px = parseFloat(fa);
        const m = el.getScreenCTM(); px *= m ? Math.hypot(m.a, m.b) : 1;
      }
      rows.push({ g: group(el), text: n.textContent.trim().slice(0, 24), font_px: +px.toFixed(2), cap_px: +(px * CAP).toFixed(2), y: Math.round(rect.top + scrollY) });
    }
    return { rows, doc_h: document.documentElement.scrollHeight };
  }, [CAP]);
  const shot = `${tag}-${w}x${h}.png`;
  await page.screenshot({ path: join(here, shot) });
  // one frame per screenful, as Loudon would scroll on the projector
  const frames = [];
  for (let y = 0, i = 1; y < r.doc_h; y += h, i++) {
    await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(80);
    const f = `${tag}-${w}x${h}-frame${i}.png`; await page.screenshot({ path: join(here, f) }); frames.push(f);
  }
  const groups = {};
  for (const x of r.rows) { const g = groups[x.g] ||= { min_cap_px: 1e9, smallest: "", count: 0 }; g.count++; if (x.cap_px < g.min_cap_px) { g.min_cap_px = x.cap_px; g.smallest = x.text; } }
  for (const [g, v] of Object.entries(groups)) {
    v.arcmin_8H = +ang(v.min_cap_px, h, 8).toFixed(1); v.arcmin_6H = +ang(v.min_cap_px, h, 6).toFixed(1); v.band_8H = band(v.arcmin_8H);
  }
  out.runs.push({ screen: [w, h], doc_h: r.doc_h, screens_tall: +(r.doc_h / h).toFixed(2), shot, frames, groups, rows: r.rows });
  await page.close();
}
await browser.close();
writeFileSync(join(here, `${tag}-measure.json`), JSON.stringify(out, null, 1));
for (const run of out.runs) {
  console.log(`\n${run.screen.join("x")} · page is ${run.screens_tall} screens tall`);
  for (const [g, v] of Object.entries(run.groups).sort((a, b) => a[1].arcmin_8H - b[1].arcmin_8H))
    console.log(`  ${v.arcmin_8H.toFixed(1).padStart(5)}′ 8H  ${v.arcmin_6H.toFixed(1).padStart(5)}′ 6H  ${v.band_8H.padEnd(12)} ${g}  (smallest "${v.smallest}", ${v.min_cap_px}px cap, n=${v.count})`);
}
