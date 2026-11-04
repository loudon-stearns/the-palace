"""Build wavetable_scanner_study.html: the Sketch page plus the in-browser
packer (packer.js inlined). The Sketch stays unchanged beside it as the before.
Every replacement is checked: a pattern that matches nothing stops the build."""
import base64, json, subprocess, sys
from pathlib import Path
import numpy as np
HERE = Path(__file__).parent; BUNDLE = HERE.parent
src = (BUNDLE / "wavetable_scanner.html").read_text()

def rep(old, new, count=1):
    global src
    n = src.count(old)
    if n != count: sys.exit(f"pattern found {n}x, wanted {count}: {old[:70]!r}")
    src = src.replace(old, new)

# --- a demo table packed by this same packer.js in node (AKWF_cello) ---
demo = Path.home() / "Desktop/AKWF/AKWF_cello"
out = HERE / "demo_cello.wav"
subprocess.run(["node", str(HERE / "pack_folder.cjs"), str(demo), str(out)], check=True)
meta = json.loads(out.with_suffix(".json").read_text())
raw = out.read_bytes()[44:]
demo_entry = {"label": "Packed in-browser — AKWF_cello, dull → bright", "frames": meta["frames"],
              "frameNames": meta["frameNames"], "centroids": [round(c, 1) for c in meta["centroids"]],
              "order": "centroid", "data": base64.b64encode(raw).decode()}

# 1. titles
rep("single-cycle morph laboratory (Sketch)</title>", "single-cycle morph laboratory (Study · packer)</title>")
rep("single-cycle morph laboratory · Sketch</span>", "single-cycle morph laboratory · Study · packer</span>")
rep("Switch\n  tables to compare libraries side-by-side.",
    "Switch\n  tables to compare libraries side-by-side, or <em>drop a whole folder</em> of single-cycle WAVs and the page packs it\n  into a table itself.")

# 2. controls: folder + files, order toggle, export
rep('''        <label>Load .wav <span id="vFile">— (drop a wavetable WAV or pick one)</span></label>
        <label class="filebtn" for="cFile">Choose file…</label>
        <input id="cFile" type="file" accept=".wav,audio/wav,audio/wave" />''',
'''        <label>Pack cycles <span id="vFile">— drop a folder of single-cycle WAVs on the stage</span></label>
        <div class="seg">
          <label class="filebtn seg-btn" for="cDir">Choose folder…</label>
          <label class="filebtn seg-btn" for="cFile">Choose files…</label>
        </div>
        <input id="cDir" type="file" webkitdirectory multiple />
        <input id="cFile" type="file" multiple accept=".wav,audio/wav,audio/wave" />
      </div>
      <div class="ctl">
        <label>Frame order <span id="vOrder">dull → bright</span></label>
        <div class="seg" id="orderSeg">
          <button class="seg-btn active" data-order="centroid">Centroid</button>
          <button class="seg-btn" data-order="file">File order</button>
        </div>
      </div>
      <div class="ctl">
        <label>Export <span id="vExport">— pack something first</span></label>
        <button class="filebtn" id="cExport" disabled>Download packed .wav</button>''')
rep(".ctl input[type=file] { display: none; }",
    ".ctl input[type=file] { display: none; }\n.ctl button.filebtn:disabled { opacity: .4; cursor: default; }\n.seg label.seg-btn { text-align: center; }")

# 3. the packer itself, inlined
rep("<script>\n/* =====================================================================\n *  WAVETABLE DATA",
    "<script>\n" + (HERE / "packer.js").read_text() + "\n</script>\n<script>\n/* =====================================================================\n *  WAVETABLE DATA")
rep("const FRAME_LEN = 1024;\nconst TABLES = [", "const FRAME_LEN = 1024;\nconst TABLES = [" + json.dumps(demo_entry) + ", ")

# 4. file handling: parse ourselves, pack folders, keep the order toggle live
start = src.index("async function handleFile(file){")
end = src.index("/* =====================================================================\n *  ENGAGE")
src = src[:start] + r'''const packState = { files: null, folder: '', order: 'centroid', lastIdx: -1 };

// Read every File into {name, buffer}. Names are paths when a folder came in.
async function readAll(fileList){
  const out = [];
  for (const f of fileList) out.push({ name: f.webkitRelativePath || f.name, buffer: await f.arrayBuffer() });
  return out;
}
// A drop can carry folders: walk them (webkitGetAsEntry) and collect the files.
async function filesFromDrop(dt){
  const items = Array.from(dt.items || []).map(i => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
  if (!items.length) return Array.from(dt.files);
  const files = [];
  const walk = entry => new Promise(res => {
    if (entry.isFile) entry.file(f => { files.push(f); res(); }, () => res());
    else if (entry.isDirectory){
      const rd = entry.createReader(), all = [];
      const next = () => rd.readEntries(async batch => {
        if (!batch.length){ for (const e of all) await walk(e); res(); }
        else { all.push(...batch); next(); }
      }, () => res());
      next();
    } else res();
  });
  for (const e of items) await walk(e);
  return files;
}

function folderName(records){
  const n = records[0].name;
  return n.includes('/') ? n.split('/').slice(-2, -1)[0] : (records.length === 1 ? n : `${records.length} files`);
}

async function handleFiles(fileList){
  const recs = (await readAll(fileList)).filter(r => /\.wav$/i.test(r.name));
  if (!recs.length){ $('vFile').textContent = '— no .wav files in that drop'; return; }
  // One file that is already a table (2+ frames of 1024): load it as is.
  if (recs.length === 1){
    try {
      const w = WTPacker.parseWav(recs[0].buffer);
      if (w.samples.length % FRAME_LEN === 0 && w.samples.length >= 2 * FRAME_LEN){
        const F = Math.min(256, w.samples.length / FRAME_LEN);
        const names = Array.from({ length: F }, (_, i) => `frame${(i + 1).toString().padStart(2, '0')}`);
        tableData.push({ label: `Table — ${recs[0].name}`, frames: F, frameNames: names,
          samples: w.samples.slice(0, F * FRAME_LEN), data: null, order: 'as-authored' });
        fillTableSelect(); selectTable(tableData.length - 1);
        $('vFile').textContent = `${recs[0].name} — read as a ${F}-frame table (it is already ${FRAME_LEN}-sample frames)`;
        return;
      }
    } catch (e) { $('vFile').textContent = `${recs[0].name} — ${e.message}`; return; }
  }
  packState.files = recs; packState.folder = folderName(recs); packState.lastIdx = -1;
  repack();
}

function repack(){
  if (!packState.files) return;
  let t;
  try { t = WTPacker.packCycles(packState.files, { frameLen: FRAME_LEN, order: packState.order }); }
  catch (e){ $('vFile').textContent = `— ${e.message}`; return; }
  const entry = { label: `Packed — ${packState.folder}, ${t.order === 'centroid' ? 'dull → bright' : 'file order'}`,
    frames: t.frames, frameNames: t.frameNames, centroids: t.centroids, order: t.order,
    samples: t.samples, data: null, packed: t };
  if (packState.lastIdx >= 0) tableData[packState.lastIdx] = entry;
  else { tableData.push(entry); packState.lastIdx = tableData.length - 1; }
  fillTableSelect(); selectTable(packState.lastIdx);
  const notes = [];
  if (t.skipped.length) notes.push(`${t.skipped.length} skipped (${t.skipped[0].why})`);
  if (t.thinned) notes.push(`${t.thinned} thinned to fit 256 frames`);
  $('vFile').textContent = `${packState.folder} — ${t.frames} cycles packed${notes.length ? ' · ' + notes.join(' · ') : ''}`;
  $('cExport').disabled = false;
  $('vExport').textContent = `${t.frames} × ${FRAME_LEN}, float32`;
}

function setOrder(order){
  packState.order = order;
  document.querySelectorAll('#orderSeg .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.order === order));
  $('vOrder').textContent = order === 'centroid' ? 'dull → bright' : 'as the folder lists them';
  repack();
}
document.querySelectorAll('#orderSeg .seg-btn').forEach(b => b.addEventListener('click', () => setOrder(b.dataset.order)));

$('cExport').addEventListener('click', () => {
  const t = tableData[packState.lastIdx] && tableData[packState.lastIdx].packed;
  if (!t) return;
  const blob = new Blob([WTPacker.encodeWavFloat32(t.samples)], { type: 'audio/wav' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = t.fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  $('vExport').textContent = `saved ${t.fileName.length > 40 ? t.fileName.slice(0, 40) + '…' : t.fileName}`;
});

$('cFile').addEventListener('change', e => { if (e.target.files.length) handleFiles(e.target.files); });
$('cDir').addEventListener('change',  e => { if (e.target.files.length) handleFiles(e.target.files); });
// Drag-and-drop onto the stage: a folder, many files, or one table.
const stage = document.querySelector('.stage');
['dragover','drop'].forEach(ev => stage.addEventListener(ev, e => e.preventDefault()));
stage.addEventListener('drop', async e => { handleFiles(await filesFromDrop(e.dataTransfer)); });

''' + src[end:]

# 5. HUD: say what the order means, and the current frame's brightness
rep("    `<div class=\"row\"><span class=\"k\">note</span>",
    "    `<div class=\"row\"><span class=\"k\">order</span><span class=\"v\">${t.order === 'centroid' ? 'dull → bright (centroid sort): back ridges are brighter' : t.order === 'file' ? 'file order: depth means nothing' : 'as authored'}${t.centroids ? ` · this frame ${Math.round(t.centroids[cur])} Hz` : ''}</span></div>` +\n    `<div class=\"row\"><span class=\"k\">note</span>")

# 6. many frames: show a window of chips around the cursor
rep("  table.frameNames.forEach((nm, i) => {\n    const span",
    "  const W = 7, lo = F > 2 * W + 1 ? Math.max(0, Math.min(F - 2 * W - 1, cur - W)) : 0, hi = F > 2 * W + 1 ? lo + 2 * W + 1 : F;\n  if (lo > 0){ const s = document.createElement('span'); s.textContent = `… ${lo}`; strip.appendChild(s); }\n  table.frameNames.slice(lo, hi).forEach((nm, j) => { const i = lo + j;\n    const span")
rep("    strip.appendChild(span);\n  });\n}", "    strip.appendChild(span);\n  });\n  if (hi < F){ const s = document.createElement('span'); s.textContent = `${F - hi} …`; strip.appendChild(s); }\n}")

rep("function selectTable(idx){\n  state.tableIdx = idx;", "function selectTable(idx){\n  state.tableIdx = idx;\n  $('cTable').value = idx;")
rep("window.__wavetable = { state, tableData, palaceTokens, VIZ, FRAME_LEN };",
    "window.__wavetable = { state, tableData, palaceTokens, VIZ, FRAME_LEN, packState, handleFiles, setOrder };")

(BUNDLE / "wavetable_scanner_study.html").write_text(src)
print("wrote", BUNDLE / "wavetable_scanner_study.html", len(src), "bytes")
