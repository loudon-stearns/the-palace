// Checks that Murmuration.html's own flock + mapping code (pulled out of the page and run
// with stubbed DOM/audio) produces the same grain parameters as murmur_engine.js, frame by
// frame, for both mappings. Not a browser test: it proves the twin, not the sound.
//    node check_page_mapping.js
"use strict";
const fs = require("fs"), vm = require("vm"), E = require("./murmur_engine.js");
const html = fs.readFileSync(__dirname + "/../Murmuration.html", "utf8");
const src = html.match(/<script>([\s\S]*?)<\/script>/g).pop().replace(/<\/?script>/g, "");
const cut = src.slice(0, src.indexOf("/* ===================================================================== *\n *  VISUAL"));
const results = {};
for (const map of ["order", "page"]) {
  let captured = null;
  const el = () => ({ addEventListener() {}, textContent: "", value: "0" });
  const ctx = { Math, Float32Array, Float64Array, Int32Array, Blob: function () {}, URL: {}, window: {}, console,
    document: { getElementById: el } };
  vm.createContext(ctx);
  vm.runInContext(cut + `\n;node={port:{postMessage:(d)=>{ if(d.type==='flock') __cap(new Float32Array(d.buf)); }}}; P.map=${JSON.stringify(map)};`, ctx);
  ctx.__cap = (f) => { captured = f; };
  const fl = new E.Flock(60, 7), mem = {}, P = { base: 110, pitch: 19, mapping: map };
  let maxd = 0;
  for (let f = 0; f < 1200; f++) {
    const eta = 0.25 * Math.pow(Math.max(0, 1 - f / 600), 2);
    vm.runInContext(`stepFlock(boids,{sep:P.sep,ali:P.ali,coh:P.coh,eta:${eta}}); pushFlock(boids);`, ctx);
    fl.step({ sep: 1.5, ali: 1.0, coh: 1.0, eta });
    const m = E.mapBoids(fl.boids, P, mem);
    for (let i = 0; i < m.length; i++) maxd = Math.max(maxd, Math.abs(m[i] - captured[i]));
  }
  results[map] = maxd;
}
console.log("largest difference page vs engine over 1200 frames:", results);
