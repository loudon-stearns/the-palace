// Taps every key slot's mode name and quality on the wheel, in normal and room view, and checks what each tap
// did: the mode name sets the mode, the quality selects the chord. Run: node taps.mjs [page.html]
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const target = resolve(process.argv[2] || join(here, "../../cycle5-explorer.html"));
const browser = await chromium.launch(); let bad = 0, n = 0;
for (const q of ["", "?room"]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.addInitScript(() => { window.AudioContext = class { constructor() { return new OfflineAudioContext(2, 44100, 44100); } }; });
  await page.goto(pathToFileURL(target).href + q); await page.waitForTimeout(300);
  for (let s = 0; s <= 6; s++) for (const kind of ["t-mode", "t-qual"]) {
    await page.evaluate(() => { S.L = -1; S.m = 1; S.sel = { d: 0, src: "c" }; renderAll(); });
    const box = await page.evaluate(([s, kind]) => { const ts = [...document.querySelectorAll(`#wheel text.${kind}`)];
      const t = kind === "t-mode" ? ts.find(e => +e.dataset.s === s) : ts[s]; t.scrollIntoView({ block: "center" }); const b = t.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, txt: t.textContent }; }, [s, kind]);
    await page.mouse.click(box.x, box.y);
    const st = await page.evaluate(() => ({ m: S.m, sel: S.sel }));
    const want = kind === "t-mode" ? st.m === s : (st.m === 1 && st.sel.d === s - 1);
    n++; if (!want) { bad++; console.log("MISS", q || "page", s, kind, box.txt, JSON.stringify(st)); }
  }
  await page.close();
}
await browser.close(); console.log(`${n - bad}/${n} taps did what the label says`);
