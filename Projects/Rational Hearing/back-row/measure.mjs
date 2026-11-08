// The back-row test, done on the page before Loudon does it in a room. Loads rational-hearing.html in headless
// Chromium at three projector resolutions, normal and Projector mode, and measures every visible label's rendered
// cap height and the drawn just-vs-equal gaps, in screen pixels. visual.py turns pixels into what the back row sees.
// Run: node "Projects/Rational Hearing/back-row/measure.mjs"   (uses the STIGMERGY app's Playwright)
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const PAGE = pathToFileURL(join(here, "..", "rational-hearing.html")).href;
const SCREENS = [[1280, 720], [1920, 1080], [1024, 768]];
const CAP = 0.73; // JetBrains Mono cap height, in em

const browser = await chromium.launch();
const out = { measured: new Date().toISOString(), cap_em: CAP, runs: [] };
for (const [w, h] of SCREENS) for (const present of ["off", "on"]) for (const mag of [1, 5]) {
  if (mag === 5 && present === "off" && w !== 1280) continue;
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(PAGE + (present === "on" ? "?present=on" : ""));
  await page.waitForTimeout(400);
  if (mag === 5) { await page.click("#magBtn"); await page.waitForTimeout(150); }
  const r = await page.evaluate(([CAP]) => {
    // which group a label belongs to, named the way Loudon would point at it
    const group = el => {
      const c = n => el.closest(n);
      if (c(".node")) return el.classList.contains("num") ? "ladder numerals" : "ladder letter names";
      if (c(".edge")) return "ladder edge labels (P5, M3…)";
      if (c(".brackets")) return "bracket column (class words, short names)";
      if (c("#temper")) {
        if (el.classList.contains("short")) return "temper: interval names";
        if (el.classList.contains("frac")) return "temper: ratios";
        if (el.classList.contains("dev")) return "temper: cents deviation";
        return "temper: keys and captions";
      }
      if (c(".ratio")) return "readout: big ratio";
      if (c(".iname")) return "readout: interval name";
      if (c(".math")) return "readout: n × f = Hz lines";
      if (c(".spec-title") || c("#spec") || c(".spectrum")) return "spectrum labels";
      if (c("svg")) return "other drawing labels";
      if (c("h1")) return "title";
      if (c("h2")) return "section headings";
      if (c(".btn") || c(".seg") || c("button")) return "buttons";
      if (c(".lede") || c(".fig-note") || c(".note") || c(".eq") || c(".sub")) return "body text";
      return "other text";
    };
    const rows = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n; const seen = new Set();
    while ((n = walker.nextNode())) {
      const el = n.parentElement; if (!el || seen.has(el) || !n.textContent.trim()) continue; seen.add(el);
      const rect = el.getBoundingClientRect(); if (!rect.width || !rect.height) continue;
      const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) continue;
      let px = parseFloat(cs.fontSize);
      if (el instanceof SVGElement) { const m = el.getScreenCTM(); px *= m ? Math.hypot(m.a, m.b) : 1; }
      rows.push({ g: group(el), text: n.textContent.trim().slice(0, 24), font_px: +px.toFixed(2), cap_px: +(px * CAP).toFixed(2) });
    }
    // the drawn gap between each just bar and its ET line, on screen
    const svg = document.getElementById("temper"), m = svg.getScreenCTM(), s = Math.hypot(m.a, m.b);
    const gaps = [...svg.querySelectorAll(".col")].map(g => {
      const bar = g.querySelector(".bar"), short = g.querySelector(".short").textContent;
      const xj = +bar.getAttribute("x") + 4, xe = +g.querySelector("rect").getAttribute("x") + 34;
      return { short, gap_px: +(Math.abs(xj - xe) * s).toFixed(2), dev: g.querySelector(".dev").textContent };
    });
    return { rows, gaps, temper_scale: +s.toFixed(3), doc_h: document.documentElement.scrollHeight };
  }, [CAP]);
  const shot = `shot-${w}x${h}-${present}${mag === 5 ? "-x5" : ""}.png`;
  await page.screenshot({ path: join(here, shot) });
  // a second shot framed on each section, as Loudon would scroll to it on the projector
  const sections = await page.$$eval("section", s => s.map(e => e.getBoundingClientRect().top + scrollY));
  const frames = [];
  for (let i = 0; i < sections.length; i++) {
    await page.evaluate(y => scrollTo(0, y), sections[i]);
    const f = `frame-${w}x${h}-${present}${mag === 5 ? "-x5" : ""}-s${i + 1}.png`;
    await page.screenshot({ path: join(here, f) }); frames.push(f);
  }
  out.runs.push({ screen: [w, h], present, magnify: mag, shot, frames, ...r });
  await page.close();
}
await browser.close();
writeFileSync(join(here, "measure.json"), JSON.stringify(out, null, 1));
console.log(out.runs.map(r => `${r.screen.join("x")} present=${r.present} x${r.magnify}: ${r.rows.length} labels, temper scale ${r.temper_scale}`).join("\n"));
