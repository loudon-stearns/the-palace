// Builds ../ceiling-test.html from its template, inlining engine/murmur_engine.js unchanged,
// once for the page and once as text for the AudioWorklet — so there is still one engine.
// Run: node build_ceiling_test.js
"use strict";
const fs = require("fs"), path = require("path");
const code = "const E = (() => { const module = { exports: {} };\n" + fs.readFileSync(path.join(__dirname, "../engine/murmur_engine.js"), "utf8") + "\nreturn module.exports; })();\n";
if (code.includes("</script")) throw new Error("engine text would close the script tag");
let html = fs.readFileSync(path.join(__dirname, "ceiling-test.template.html"), "utf8");
html = html.replace("/*__ENGINE__*/", code).replace('<canvas id="c"></canvas>', '<canvas id="c"></canvas>\n<script type="text/plain" id="engineSrc">' + code + "</script>");
fs.writeFileSync(path.join(__dirname, "..", "ceiling-test.html"), html);
console.log("wrote ceiling-test.html", html.length, "bytes");
