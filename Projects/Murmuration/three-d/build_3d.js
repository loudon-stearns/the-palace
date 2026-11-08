// Builds murmuration-3d.html from its template, inlining the engine unchanged
// (engine/murmur_engine.js and engine/field_reading.js), once for the page and once
// as text for the AudioWorklet — so there is still one engine. Run: node build_3d.js
"use strict";
const fs = require("fs"), path = require("path"), eng = p => fs.readFileSync(path.join(__dirname, "../engine", p), "utf8");
const code =
  "const E = (() => { const module = { exports: {} };\n" + eng("murmur_engine.js") + "\nreturn module.exports; })();\n" +
  "const ENGINE_ = E;\nconst FR = (() => { const module = { exports: {} }; const require = () => ENGINE_;\n" + eng("field_reading.js") + "\nreturn module.exports; })();\n";
if (code.includes("</script")) throw new Error("engine text would close the script tag");
let html = fs.readFileSync(path.join(__dirname, "murmuration-3d.template.html"), "utf8");
html = html.replace("/*__ENGINE__*/", code).replace("<canvas id=\"c\"></canvas>", "<canvas id=\"c\"></canvas>\n<script type=\"text/plain\" id=\"engineSrc\">" + code + "</script>");
fs.writeFileSync(path.join(__dirname, "..", "murmuration-3d.html"), html);
console.log("wrote murmuration-3d.html", html.length, "bytes");
