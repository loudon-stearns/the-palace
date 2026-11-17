#!/usr/bin/env node
// The media store, first slice — a workshop build of `The Gallery — spec — media store`.
// It is meant to live at _ops/store/store.mjs once Loudon says so; until then it runs from here.
//
//   node store.mjs put <file> --as <palace path> [--source <text>] [--note <text>] [--manifest <path>]
//   node store.mjs get <palace path>
//   node store.mjs check [<manifest>] [--hash]
//   node store.mjs ls [<manifest>]
//   node store.mjs sweep <Dropbox folder> [<folder> …] [--depth N] [--out <file>]
//
// The mirror root is ~/Library/CloudStorage/Dropbox/Palace unless STORE_ROOT says otherwise
// (tests point it at a temp folder). Nothing here ever opens a store file to read it except
// `put` (the file is local, before it moves) and `check --hash` (hydrated files only), because
// reading a dataless File Provider file hydrates it and fills the disk.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DROPBOX = path.join(os.homedir(), "Library/CloudStorage/Dropbox");
const MIRROR = process.env.STORE_ROOT || path.join(DROPBOX, "Palace");
const SF_DATALESS = 0x40000000;

function palaceRoot() {
  let d = path.dirname(fileURLToPath(import.meta.url));
  while (d !== "/") {
    if (fs.existsSync(path.join(d, "CLAUDE.md")) && fs.existsSync(path.join(d, "SCHEMA.md"))) return d;
    d = path.dirname(d);
  }
  throw new Error("not inside the palace");
}
const PALACE = palaceRoot();

function args(argv) {
  const pos = [], opt = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      opt[k] = v;
    } else pos.push(argv[i]);
  }
  return { pos, opt };
}

// The owning bundle of a palace path is the nearest folder D above it with a D.md beside it;
// its manifest is `D/<name> — store.jsonl`.
function manifestFor(palacePath) {
  let d = path.dirname(palacePath);
  while (d && d !== ".") {
    if (fs.existsSync(path.join(PALACE, d + ".md"))) return path.join(PALACE, d, `${path.basename(d)} — store.jsonl`);
    d = path.dirname(d);
  }
  throw new Error(`no entry owns ${palacePath}; pass --manifest`);
}

function readManifest(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.path);
}

function flags(p) {
  // st_flags is not in Node's stat; BSD stat prints it without reading the file.
  return Number(execFileSync("/usr/bin/stat", ["-f", "%f", p], { encoding: "utf8" }).trim());
}

function sha256(file) {
  const h = crypto.createHash("sha256");
  const fd = fs.openSync(file, "r"), buf = Buffer.alloc(1 << 20);
  let n;
  while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) h.update(buf.subarray(0, n));
  fs.closeSync(fd);
  return h.digest("hex");
}

const MIME = { ".wav": "audio/wav", ".aif": "audio/aiff", ".aiff": "audio/aiff", ".mp3": "audio/mpeg", ".flac": "audio/flac",
  ".m4a": "audio/mp4", ".mp4": "video/mp4", ".mov": "video/quicktime", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".pdf": "application/pdf" };

function put(file, opt) {
  if (!opt.as) throw new Error("put needs --as <palace path>");
  const src = path.resolve(file), rel = opt.as.replace(/^\/+/, "");
  const dest = path.join(MIRROR, rel);
  if (fs.existsSync(dest)) throw new Error(`already in the store: ${rel}`);
  const st = fs.statSync(src);
  if (!st.isFile()) throw new Error(`not a file: ${src}`);
  const sum = sha256(src);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try { fs.renameSync(src, dest); }
  catch (e) { if (e.code !== "EXDEV") throw e; fs.copyFileSync(src, dest); if (sha256(dest) !== sum) throw new Error("copy hash mismatch; source kept"); fs.unlinkSync(src); }
  const line = { path: rel, sha256: sum, bytes: st.size, mime: MIME[path.extname(rel).toLowerCase()] || "application/octet-stream",
    added: new Date().toISOString().slice(0, 10), source: opt.source || path.relative(PALACE, src), note: opt.note || "", link: "" };
  const man = opt.manifest ? path.resolve(opt.manifest) : manifestFor(rel);
  fs.appendFileSync(man, JSON.stringify(line) + "\n");
  console.log(`stored ${rel} (${st.size} bytes) → ${path.relative(PALACE, man)}`);
}

function get(rel) {
  const p = path.join(MIRROR, rel);
  if (!fs.existsSync(p)) throw new Error(`not in the store: ${rel}`);
  if (flags(p) & SF_DATALESS) execFileSync("/usr/bin/brctl", ["download", p]);
  console.log(p);
}

function manifests(arg) {
  if (arg) return [path.resolve(arg)];
  return execFileSync("git", ["-C", PALACE, "ls-files", "-z", "*— store.jsonl"], { encoding: "utf8" })
    .split("\0").filter(Boolean).map((f) => path.join(PALACE, f));
}

function check(arg, opt) {
  let bad = 0;
  for (const man of manifests(arg)) for (const r of readManifest(man)) {
    const p = path.join(MIRROR, r.path);
    let state;
    if (!fs.existsSync(p)) state = "MISSING";
    else {
      const st = fs.lstatSync(p), cloud = flags(p) & SF_DATALESS;
      if (st.size !== r.bytes) state = `SIZE ${st.size}≠${r.bytes}`;
      else if (opt.hash && !cloud && sha256(p) !== r.sha256) state = "HASH MISMATCH";
      else state = cloud ? "ok · online-only" : opt.hash ? "ok · hashed" : "ok · on disk";
    }
    if (!state.startsWith("ok")) bad++;
    console.log(`${state.padEnd(18)} ${r.path}`);
  }
  process.exitCode = bad ? 1 : 0;
}

function ls(arg) {
  for (const man of manifests(arg)) {
    console.log(`# ${path.relative(PALACE, man)}`);
    for (const r of readManifest(man))
      console.log(`${String(Math.round(r.bytes / 1024)).padStart(9)} KB  ${r.added}  ${r.link ? "linked" : "      "}  ${r.path}`);
  }
}

// ---- sweep: candidate works from a Dropbox area, by metadata only -------------------------
// One row per folder at the given depth below each area: counts by kind, bytes, first / median /
// last modification date. Folders whose names read as money or paperwork are held back by name
// (counted, never listed): the public face keeps out anything that risks Loudon's finances.

const KIND = {
  session: [".als", ".ptx", ".ptf", ".logicx", ".cpr", ".rpp", ".song", ".band", ".flp"],
  patch: [".maxpat", ".amxd", ".rnbopat", ".gendsp", ".fxp", ".nmsv", ".adg", ".adv"],
  audio: [".wav", ".aif", ".aiff", ".mp3", ".flac", ".m4a", ".ogg"],
  video: [".mp4", ".mov", ".m4v", ".avi", ".scc"],
  score: [".mid", ".midi", ".musx", ".sib", ".mscz", ".xml", ".mxl"],
  doc: [".pdf", ".doc", ".docx", ".pages", ".key", ".ppt", ".pptx", ".txt", ".rtf", ".md"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".psd", ".tif", ".tiff", ".svg"],
  code: [".js", ".py", ".c", ".cpp", ".h", ".html", ".css", ".ipynb", ".json"],
};
const KIND_OF = Object.fromEntries(Object.entries(KIND).flatMap(([k, xs]) => xs.map((x) => [x, k])));
const PACKAGES = new Set([".logicx", ".band", ".key", ".pages", ".app", ".vst3", ".component", ".photoslibrary"]);
const HOLD = /\btax|expense|invoice|receipt|reimburse|\bEIN\b|bank (statement|account)|payroll|\bw-?9\b|1099|licen[cs]e|\.lic$|password|passport|medical|insurance|mortgage|\blease\b|contract|(?<!de|un)signed/i;

function walk(dir, acc) {
  let names;
  try { names = fs.readdirSync(dir); } catch { return; }
  for (const n of names) {
    if (n.startsWith(".")) continue;
    const p = path.join(dir, n), ext = path.extname(n).toLowerCase();
    let st;
    try { st = fs.lstatSync(p); } catch { continue; }
    if (st.isDirectory() && !PACKAGES.has(ext)) { walk(p, acc); continue; }
    if (st.isSymbolicLink()) continue;
    const k = KIND_OF[ext] || "other";
    acc.files++; acc.bytes += st.size; acc.kinds[k] = (acc.kinds[k] || 0) + 1;
    if (st.mtimeMs > 86400000 * 365) acc.times.push(st.mtimeMs); // drop zero (1969/1970) stamps
  }
}

function day(ms) { return new Date(ms).toISOString().slice(0, 10); }

function rollup(rel, abs) {
  const acc = { files: 0, bytes: 0, kinds: {}, times: [] };
  const st = fs.lstatSync(abs);
  if (st.isDirectory() && !PACKAGES.has(path.extname(abs).toLowerCase())) walk(abs, acc);
  else { const k = KIND_OF[path.extname(abs).toLowerCase()] || "other"; acc.files = 1; acc.bytes = st.size; acc.kinds[k] = 1; acc.times.push(st.mtimeMs); }
  const t = acc.times.sort((a, b) => a - b);
  const row = { src: `Dropbox/${rel}`, files: acc.files, mb: Math.round(acc.bytes / 1048576),
    kinds: acc.kinds, first: t.length ? day(t[0]) : null, median: t.length ? day(t[t.length >> 1]) : null, last: t.length ? day(t.at(-1)) : null };
  // A session file or a patch is a strong sign of a made thing; media alone may be reference.
  row.signal = (acc.kinds.session || 0) + (acc.kinds.patch || 0) > 0 ? "made" : (acc.kinds.audio || acc.kinds.video) ? "media" : "papers";
  return row;
}

function sweep(areas, opt) {
  const depth = Number(opt.depth || 1), rows = [];
  let held = 0;
  const visit = (rel, d) => {
    const abs = path.join(DROPBOX, rel);
    const name = path.basename(rel);
    if (HOLD.test(name)) { held++; return; }
    let st; try { st = fs.lstatSync(abs); } catch { return; }
    if (d < depth && st.isDirectory() && !PACKAGES.has(path.extname(abs).toLowerCase())) {
      for (const n of fs.readdirSync(abs)) if (!n.startsWith(".")) visit(path.join(rel, n), d + 1);
      return;
    }
    rows.push({ area: areas.find((a) => rel.startsWith(a + "/")), ...rollup(rel, abs) });
  };
  for (const a of areas) for (const n of fs.readdirSync(path.join(DROPBOX, a))) if (!n.startsWith(".")) visit(path.join(a, n), 1);
  const out = rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
  if (opt.out) fs.writeFileSync(opt.out, out); else process.stdout.write(out);
  console.error(`swept ${areas.join(", ")}: ${rows.length} candidates, ${held} held back by name`);
}

const [cmd, ...rest] = process.argv.slice(2);
const { pos, opt } = args(rest);
try {
  if (cmd === "put") put(pos[0], opt);
  else if (cmd === "get") get(pos[0]);
  else if (cmd === "check") check(pos[0], opt);
  else if (cmd === "ls") ls(pos[0]);
  else if (cmd === "sweep") sweep(pos, opt);
  else { console.error("verbs: put · get · check · ls · sweep (the header of this file says how)"); process.exitCode = 2; }
} catch (e) { console.error(`store: ${e.message}`); process.exitCode = 1; }
