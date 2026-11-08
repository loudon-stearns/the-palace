#!/usr/bin/env node
// emit-vcv.js — run Generative Audio Devices' real emitVcvJson (extracted from PDL Renderer.html, the t6-oracle recipe)
// on a .pdl written by card-to-pdl.py, without a browser.  Usage: node pdl/emit-vcv.cjs pdl/house-bass.pdl [out.vcv]
const fs = require("fs"), path = require("path");
const PALACE = path.resolve(__dirname, "..", "..", "..", "..");
const RENDERER = path.join(PALACE, "Projects", "Generative Audio Devices", "pdl-renderer");
const html = fs.readFileSync(path.join(RENDERER, "PDL Renderer.html"), "utf8");
function between(s, a, b) { const i = s.indexOf(a); const j = s.indexOf(b, i + a.length); return s.slice(i + a.length, j); }
const regText = between(html, '<script type="application/json" id="vcv-registry">', "</script>").trim();
const archText = between(html, '<script type="application/json" id="archetypes">', "</script>").trim();
const REG = JSON.parse(regText).modules;
const bs = html.indexOf('<script type="text/babel">'); const body = html.indexOf(">", bs) + 1;
const code = html.slice(body, html.indexOf("// ─── Port Map", body));
const docShim = { getElementById: (id) => ({ textContent: id === "vcv-registry" ? regText : id === "archetypes" ? archText : "{}" }) };
const { emitVcvJson } = new Function("document", "React", code + "\n return { emitVcvJson, parsePDL };")(docShim, { useState: () => [undefined, () => {}] });

const inFile = process.argv[2]; const outFile = process.argv[3] || inFile.replace(/\.pdl$/, ".vcv");
const res = emitVcvJson(fs.readFileSync(inFile, "utf8"));
const patch = res.json || res.patch || res.vcv || res;
const text = typeof patch === "string" ? patch : JSON.stringify(patch, null, 2);
fs.writeFileSync(outFile, text);
const parsed = JSON.parse(text);
const mods = (parsed.modules || []).map(m => m.model);
const known = Object.values(REG).map(m => m.slug);
console.log("result keys:", Object.keys(res).join(", "));
console.log("warnings:", (res.warnings || []).length, (res.warnings || []).map(w => w.reason).join(" | "));
console.log("skipped:", (res.skipped || []).length, (res.skipped || []).map(s => s.line || JSON.stringify(s)).join(" | "));
console.log("modules:", mods.join(", "));
console.log("unknown to registry:", mods.filter(m => !known.includes(m)).join(", ") || "none");
console.log("cables:", (parsed.cables || []).length, "→", outFile);
