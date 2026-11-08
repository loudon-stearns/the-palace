import fs from "fs";
const html = fs.readFileSync("Preset Oracle — encounter journal.html", "utf8");
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const els = {};
for (const id of ids) els[id] = { id, value: "", textContent: "", style: {}, classList: { toggle() {} } };
const F = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
Object.assign(globalThis, { document: { getElementById: (id) => { if (!els[id]) throw new Error("missing #" + id); return els[id]; } },
  getSelection: () => ({}), setInterval: () => 0, clearInterval: () => {} });
new Function(js)();
const btn = { textContent: "" };
for (let i = 0; i < 200 && els["c-name"].textContent !== F.card; i++) els.draw.onclick({ target: btn });
if (els["c-name"].textContent !== F.card) throw new Error("card never drawn");
for (const [k, val] of Object.entries(F.fields)) { if (!els[k]) throw new Error("no field " + k); els[k].value = val; }
els.make.onclick();
if (els.warn.textContent) throw new Error(els.warn.textContent);
process.stdout.write(els.out.textContent);
