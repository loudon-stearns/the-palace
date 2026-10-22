// build_helix.js — inline the engine and the visualizer into one self-contained page.
//   node plugin/ui/build_helix.js   →  belief-helix.html in the bundle
const fs = require("fs"), path = require("path");
const here = __dirname;
let html = fs.readFileSync(path.join(here, "belief-helix.template.html"), "utf8");
const eng = fs.readFileSync(path.join(here, "belief_cloud.js"), "utf8");
const vis = fs.readFileSync(path.join(here, "visualizer.js"), "utf8");
html = html.replace("/*BELIEF-CLOUD*/", () => eng.split("/*ENGINE-START*/")[1].split("/*ENGINE-END*/")[0]).replace("/*VISUALIZER*/", () => vis);
const out = path.join(here, "..", "..", "belief-helix.html");
fs.writeFileSync(out, html);
console.log("wrote", out, html.length, "bytes");
