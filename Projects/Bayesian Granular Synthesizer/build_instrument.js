// Inlines bayes_engine.js into belief-instrument.html so the board's sandboxed
// iframe gets one self-contained file, and the page and the render share one engine.
//   node build_instrument.js
const fs = require("fs");
const src = fs.readFileSync("bayes_engine.js", "utf8");
const engine = src.slice(src.indexOf("/*ENGINE-START*/"), src.indexOf("/*ENGINE-END*/") + "/*ENGINE-END*/".length);
const html = fs.readFileSync("belief-instrument.template.html", "utf8").replace("/*ENGINE*/", () => engine);
fs.writeFileSync("belief-instrument.html", html);
console.log("wrote belief-instrument.html", html.length, "bytes");
