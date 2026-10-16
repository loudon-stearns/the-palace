// Build fixtures/arc-narration.jsonl from real records. Signatures blanked; tool output cut.
import fs from "fs"; import os from "os"; import path from "path";
const R = path.join(os.homedir(), ".claude/projects/-Users-loudonstearns-Documents-The-Palace");
const load = (id) => fs.readFileSync(path.join(R, id + ".jsonl"), "utf8").split("\n");
const clean = (line) => {
  const o = JSON.parse(line);
  for (const k of ["toolUseResult", "wireToolInputs", "serverClassifierContext", "serverClassifierRequest"]) delete o[k];
  for (const b of (o.message && Array.isArray(o.message.content)) ? o.message.content : []) {
    if ("signature" in b) b.signature = "";
    if (b.type === "tool_result") {
      if (typeof b.content === "string") b.content = b.content.slice(0, 200);
      else if (Array.isArray(b.content)) b.content = b.content.filter(c => c.type === "text").map(c => ({ type: "text", text: c.text.slice(0, 200) }));
    }
    if (b.type === "tool_use" && b.input) for (const k of Object.keys(b.input)) if (typeof b.input[k] === "string") b.input[k] = b.input[k].slice(0, 300);
  }
  return JSON.stringify(o);
};
// Whole API messages (every record sharing message.id) plus the tool_result answering them.
function messageRecords(id, recordIndex) {
  const L = load(id); const o = JSON.parse(L[recordIndex]); const mid = o.message.id;
  const out = []; const toolIds = new Set();
  for (let i = 0; i < L.length; i++) { let r; try { r = JSON.parse(L[i]); } catch { continue; }
    if (r.type === "assistant" && r.message.id === mid) { out.push(i); for (const b of r.message.content) if (b.type === "tool_use") toolIds.add(b.id); }
    else if (r.type === "user" && Array.isArray(r.message.content) && r.message.content.some(b => b.type === "tool_result" && toolIds.has(b.tool_use_id))) out.push(i); }
  return out.map(i => clean(L[i]));
}
// A TTU message: first thinking non-empty and slow, a second non-empty thinking after it.
function findTTU() {
  for (const f of fs.readdirSync(R).filter(f => f.endsWith(".jsonl"))) {
    const L = load(f.slice(0, -6)); const m = new Map();
    for (let i = 0; i < L.length; i++) { let o; try { o = JSON.parse(L[i]); } catch { continue; }
      if (o.type !== "assistant" || o.isSidechain) continue;
      for (const b of o.message.content) { const a = m.get(o.message.id) || []; a.push({ i, b, ms: o.thinkingDurationMs }); m.set(o.message.id, a); } }
    for (const [, a] of m) if (a.length >= 3 && a[0].b.type === "thinking" && a[0].b.thinking && a[0].ms > 1000 && a[1].b.type === "thinking" && a[1].b.thinking && a[1].ms < 200 && a[1].b.thinking.length < 400)
      return { id: f.slice(0, -6), rec: a[0].i };
  }
}
const ttu = findTTU();
// A narration block on a version that recorded no thinkingDurationMs, second in its message.
function findNoTiming() {
  for (const f of fs.readdirSync(R).filter(f => f.endsWith(".jsonl"))) {
    const L = load(f.slice(0, -6)); const seen = new Map();
    for (let i = 0; i < L.length; i++) { let o; try { o = JSON.parse(L[i]); } catch { continue; }
      if (o.type !== "assistant" || o.isSidechain) continue;
      for (const b of o.message.content) { if (b.type !== "thinking") continue; const n = (seen.get(o.message.id) || 0) + 1; seen.set(o.message.id, n);
        if (n === 2 && b.thinking && b.thinking.length < 300 && o.thinkingDurationMs == null) return { id: f.slice(0, -6), rec: i }; } }
  }
}
const noTiming = findNoTiming();
const D = "aa97f4d5-5917-4836-bea6-69c78115ecc6";
const L = load(D);
const parts = [
  // The Daily Page gap, 2026-10-15: text that survived (290), send_message, the narration (299), preview_start, the end-of-turn text (304).
  ...[289, 290, 291, 292, 298, 299, 300, 301, 303, 304].map(i => clean(L[i])),
  // Real thinking that opens its message, slow: must stay dropped (record 79, 32.6 s).
  ...messageRecords(D, 79),
  ...messageRecords(ttu.id, ttu.rec),                                 // TTU: real thinking, then narration
  ...messageRecords("3af35990-2cad-45d9-9a84-4cd035562781", 543),      // fast, first in its message
  ...messageRecords(noTiming.id, noTiming.rec),                        // no timing recorded, second in its message
];
fs.writeFileSync(process.argv[2], parts.join("\n") + "\n");
console.log("ttu from", ttu, "no-timing from", noTiming, "records", parts.length);
