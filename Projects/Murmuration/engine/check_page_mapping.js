// Checks that Murmuration.html's own flock + mapping code (pulled out of the page and run
// with stubbed DOM/audio) produces the same grain parameters as murmur_engine.js, frame by
// frame, for both grain mappings — and, for the "density" reading, the same field weights
// as field_reading.js AND the same audio out of the page's own worklet code as the engine's
// Field voice. Not a browser test: it proves the twin, not the sound.
//    node check_page_mapping.js
"use strict";
const fs = require("fs"), vm = require("vm"), E = require("./murmur_engine.js"), F = require("./field_reading.js");
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
// the density reading: mapping and audio
{
  let captured = null, capN = 0, capBase = 0;
  const el = () => ({ addEventListener() {}, textContent: "", value: "0" });
  const ctx = { Math, Float32Array, Float64Array, Int32Array, Blob: function () {}, URL: {}, window: {}, console, document: { getElementById: el } };
  vm.createContext(ctx);
  vm.runInContext(cut + `\n;node={port:{postMessage:(d)=>{ if(d.type==='field') __cap(new Float32Array(d.buf), d.n, d.base); }}}; P.map="density";`, ctx);
  ctx.__cap = (f, n, b) => { captured = f; capN = n; capBase = b; };
  // the page's worklet, from its own source string
  const wctx = { Math, Float32Array, sampleRate: 48000, AudioWorkletProcessor: class { constructor() { this.port = {}; } }, registerProcessor: (n, c) => { wctx.Proc = c; } };
  vm.createContext(wctx); vm.runInContext(vm.runInContext("workletCode", ctx), wctx);
  const wp = new wctx.Proc(); const cn = new E.Grains(48000);
  wp.port.onmessage({ data: { type: "tables", TL: cn.TL, TR: cn.TR, BL: cn.BL, BR: cn.BR } });
  const fl = new E.Flock(60, 7), mem = {}, fe = new F.Field(48000);
  let maxMap = 0, maxAud = 0; const oL = new Float32Array(128), oR = new Float32Array(128), eL = new Float32Array(128), eR = new Float32Array(128);
  for (let f = 0; f < 1200; f++) {
    const eta = 0.25 * Math.pow(Math.max(0, 1 - f / 600), 2);
    vm.runInContext(`stepFlock(boids,{sep:P.sep,ali:P.ali,coh:P.coh,eta:${eta}}); pushFlock(boids);`, ctx);
    fl.step({ sep: 1.5, ali: 1.0, coh: 1.0, eta });
    const m = F.mapField(fl.boids, mem);
    for (let i = 0; i < m.length; i++) maxMap = Math.max(maxMap, Math.abs(m[i] - captured[i]));
    wp.port.onmessage({ data: { type: "field", buf: captured.buffer.slice(0), n: capN, base: capBase } }); fe.setField(m, F.FNC, 110);
    wp.process([], [[oL, oR]]); fe.process(eL, eR, 128);
    for (let s = 0; s < 128; s++) maxAud = Math.max(maxAud, Math.abs(oL[s] - eL[s]), Math.abs(oR[s] - eR[s]));
  }
  results.densityMapping = maxMap; results.densityAudio = maxAud;
}
// the third reading: the startle wave, with three predator strikes, through all three readings
for (const map of ["order", "page", "density"]) {
  let captured = null;
  const el = () => ({ addEventListener() {}, textContent: "", value: "0" });
  const ctx = { Math, Float32Array, Float64Array, Int32Array, Blob: function () {}, URL: {}, window: {}, console, document: { getElementById: el } };
  vm.createContext(ctx);
  vm.runInContext(cut + `\n;node={port:{postMessage:(d)=>{ __cap(new Float32Array(d.buf)); }}}; P.map=${JSON.stringify(map)}; P.pred="wave";`, ctx);
  ctx.__cap = (f) => { captured = f; };
  const fl = new E.Flock(60, 7), mem = {}, P = { base: 110, pitch: 19, mapping: map, startle: true };
  let maxd = 0, maxA = 0;
  for (let f = 0; f < 1200; f++) {
    const eta = 0.25 * Math.pow(Math.max(0, 1 - f / 600), 2);
    for (const [fs_, x, y] of [[400, 460, 260], [700, 200, 150], [760, 200, 150], [1000, 700, 400]]) if (f === fs_) {
      vm.runInContext(`field.predator={x:${x},y:${y}}; field.predT=1;`, ctx); fl.field.predator = { x, y }; fl.field.predT = 1;
    }
    vm.runInContext(`stepFlock(boids,{sep:P.sep,ali:P.ali,coh:P.coh,eta:${eta},startle:true}); pushFlock(boids);`, ctx);
    fl.step({ sep: 1.5, ali: 1.0, coh: 1.0, eta, startle: true });
    const m = map === "density" ? F.mapField(fl.boids, mem, true) : E.mapBoids(fl.boids, P, mem);
    for (let i = 0; i < m.length; i++) maxd = Math.max(maxd, Math.abs(m[i] - captured[i]));
    for (const b of fl.boids) maxA = Math.max(maxA, b.a);
  }
  results["startle/" + map] = maxd; results["startle/" + map + " (peak alarm reached)"] = +maxA.toFixed(3);
}
console.log("largest difference page vs engine over 1200 frames:", results);
