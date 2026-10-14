// check-vessel.mjs — run blood-vessel.js (the device's v8ui drawing) in Node,
// before anyone opens Max.
//
// A mock mgraphics records every call the file makes and turns the paint into
// an SVG, so we can see the picture Max should draw. Meters are fed exactly the
// way the device feeds them: the codebox runs on the heartbeat at 48 kHz, and
// every 33 ms three snapshot~ read pressure, squeeze and baroreceptors.
// It also checks: the drag maps a mouse y to the threshold and back, the
// vessel's curve equals the browser page's curve, and only known mgraphics
// calls are used (an unknown call throws).
// usage: node check-vessel.mjs   (writes vessel-*.svg/png and vessel-findings.json)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadCodebox } from "./codebox-harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 380, H = 160;   // the v8ui's size in the device

// ---- mock mgraphics -> SVG ----------------------------------------------------
function makeMg() {
  let out = [], d = "", src = "rgba(0,0,0,1)", lw = 1, fs_ = 10, cur = [0, 0];
  const used = new Set();
  const rgba = (r, g, b, a) => `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;
  const api = {
    relative_coords: 0, autofill: 0, size: [W, H],
    init() {}, redraw() {},
    set_source_rgba(r, g, b, a) { src = rgba(r, g, b, a === undefined ? 1 : a); },
    set_source_rgb(r, g, b) { src = rgba(r, g, b, 1); },
    set_line_width(w) { lw = w; },
    select_font_face() {}, set_font_size(s) { fs_ = s; },
    rectangle(x, y, w, h) { d += `M${x} ${y}h${w}v${h}h${-w}Z`; },
    move_to(x, y) { d += `M${x.toFixed(2)} ${y.toFixed(2)}`; cur = [x, y]; },
    line_to(x, y) { d += `L${x.toFixed(2)} ${y.toFixed(2)}`; },
    close_path() { d += "Z"; },
    arc(x, y, r) { d += `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`; },
    fill() { out.push(`<path d="${d}" fill="${src}"/>`); d = ""; },
    stroke() { out.push(`<path d="${d}" fill="none" stroke="${src}" stroke-width="${lw}"/>`); d = ""; },
    show_text(s) { out.push(`<text x="${cur[0]}" y="${cur[1]}" font-family="Arial" font-size="${fs_}" fill="${src}">${String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`); },
    save() {}, restore() {},
  };
  const mg = new Proxy(api, { get(t, k) { if (!(k in t)) throw new Error("mock mgraphics: unknown call " + String(k)); if (typeof t[k] === "function") used.add(k); return t[k]; } });
  return { mg, used, svg() { const s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out.join("")}</svg>`; out = []; return s; } };
}

function loadVessel() {
  const m = makeMg(), outs = [];
  const sb = { mgraphics: m.mg, outlet: (i, v) => outs.push([i, v]), post() {}, Math, inlets: 0, outlets: 0 };
  vm.runInNewContext(fs.readFileSync(path.join(here, "blood-vessel.js"), "utf8"), sb);
  return { sb, m, outs };
}

// ---- feed it the way the device does ------------------------------------------
function run(thresholdDb, seconds) {
  const sr = 48000, per = Math.round(sr * 0.033);
  const hb = loadCodebox(path.join(here, "heartbeat.codebox"), sr), cb = loadCodebox(path.join(here, "blood-compressor.codebox"), sr);
  const v = loadVessel();
  cb.set("threshold", thresholdDb); v.sb.threshold(thresholdDb); v.sb.ratio(4); v.sb.knee(6);
  let peakSqueeze = 0, peakSnapped = 0;
  for (let n = 1; n <= sr * seconds; n++) {
    const o = cb.tick(hb.tick(0)[0]);
    peakSqueeze = Math.min(peakSqueeze, o[3]);
    if (n % per === 0) { v.sb.meters(o[2], o[3], o[4]); peakSnapped = Math.min(peakSnapped, o[3]); }
  }
  return { v, peakSqueeze, peakSnapped };
}

const findings = { date: "2026-10-14", file: "rnbo/blood-vessel.js", size: [W, H] };
const frames = [];
for (const th of [-20, -36]) {
  const { v, peakSqueeze, peakSnapped } = run(th, 6);
  v.sb.paint();
  const svg = v.m.svg(), name = `vessel-threshold${th}`;
  fs.writeFileSync(path.join(here, name + ".svg"), svg);
  // headless Chrome rasterises the SVG at 2x (ImageMagick here has no fonts for the labels)
  try { execFileSync("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless", "--disable-gpu", "--hide-scrollbars", `--screenshot=${path.join(here, name + ".png")}`, `--window-size=${W},${H}`, "--force-device-scale-factor=2", "--default-background-color=00000000", "file://" + path.join(here, name + ".svg")], { stdio: "ignore", timeout: 60000 }); } catch (e) { console.log("png render failed:", e.message); }
  frames.push({ threshold: th, deepestSqueezeDb: +peakSqueeze.toFixed(2), deepestSqueezeTheVesselSawDb: +peakSnapped.toFixed(2), image: name + ".png" });
  findings.mgraphicsCallsUsed = [...v.m.used].sort();
}
findings.frames = frames;

// drag: click on the lane, drag to a y, release; every outlet value must be the threshold at that y
{
  const { sb, outs } = loadVessel();
  sb.paint();                                    // lays out the lane
  const tests = [];
  for (const target of [0, -12, -20.5, -36, -54, -60]) {
    // invert the file's own mapping: lane y = 4, h = 76, range -60..3 dB
    const laneY = 4, laneH = Math.round(H * 0.5) - 4, y = laneY + laneH * (1 - (target - -60) / (3 - -60));
    outs.length = 0; sb.onclick(50, y); sb.ondrag(50, y, 1); sb.ondrag(50, y, 0);
    tests.push({ asked: target, got: outs.length ? outs[outs.length - 1][1] : null });
  }
  outs.length = 0; sb.onclick(50, 2000); // a click below everything must not move the threshold
  findings.drag = { roundTrip: tests, clickOutsideMoved: outs.length > 0 };
}

// the curve: the vessel's curve against the browser page's
{
  const html = fs.readFileSync(path.join(here, "..", "stage2-vessel-prototype-v3.html"), "utf8");
  const sbx = { module: { exports: null }, Math, Float32Array: Float64Array };
  vm.runInNewContext(html.match(/<script id="dsp">([\s\S]*?)<\/script>/)[1], sbx);
  const REF = sbx.module.exports, ref = new REF.Compressor(48000), { sb } = loadVessel();
  let maxDiff = 0;
  for (const T of [-50, -30, -20, -6]) for (const R of [1, 2, 4, 20]) for (const K of [0, 6, 18]) {
    Object.assign(ref.p, { th: T, ra: R, kn: K });
    for (let x = -80; x <= 6; x += 0.1) maxDiff = Math.max(maxDiff, Math.abs(ref.curve(x) - sb.curve(x, T, R, K)));
  }
  findings.curveMaxDiffDb = maxDiff;
}

fs.writeFileSync(path.join(here, "vessel-findings.json"), JSON.stringify(findings, null, 2));
console.log(JSON.stringify(findings, null, 2));
