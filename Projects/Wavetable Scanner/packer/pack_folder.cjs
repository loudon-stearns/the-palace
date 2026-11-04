// node pack_folder.cjs <folder> <out.wav> [order: centroid|file|chain] [smooth sigma]  — the browser packer, run headless
const fs = require('fs'), path = require('path');
const P = require('./packer.js');
const [dir, out, order] = process.argv.slice(2);
const files = fs.readdirSync(dir).map(n => {
  const b = fs.readFileSync(path.join(dir, n));
  return { name: n, buffer: b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) };
});
const t0 = Date.now();
const t = P.packCycles(files, { order: order || 'centroid', smooth: +(process.argv[5] || 0) });
const ms = Date.now() - t0;
fs.writeFileSync(out, Buffer.from(P.encodeWavFloat32(t.samples)));
fs.writeFileSync(out.replace(/\.wav$/, '.json'), JSON.stringify({ ms, frames: t.frames, frameNames: t.frameNames, centroids: t.centroids, skipped: t.skipped, thinned: t.thinned, fileName: t.fileName, families: t.families, steps: t.steps }, null, 1));
console.log(`${path.basename(dir)}: ${t.frames} frames in ${ms} ms, skipped ${t.skipped.length}`);
