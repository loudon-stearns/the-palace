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
        <input id="cFile" type="file" multiple accept=".wav,.wt,audio/wav,audio/wave" />
      </div>
      <div class="ctl">
        <label>Frame order <span id="vOrder">families, each walked smoothly</span></label>
        <div class="seg seg3" id="orderSeg">
          <button class="seg-btn active" data-order="chain">Family chain</button>
          <button class="seg-btn" data-order="centroid">Centroid</button>
          <button class="seg-btn" data-order="file">File order</button>
        </div>
      </div>
      <div class="ctl">
        <label>Smooth along Position <span id="vSmooth">off — frames as packed</span></label>
        <div class="seg seg3" id="smoothSeg">
          <button class="seg-btn active" data-smooth="0">Off</button>
          <button class="seg-btn" data-smooth="1">Blur 1 frame</button>
          <button class="seg-btn" data-smooth="1.5">Blur 1.5</button>
        </div>
      </div>
      <div class="ctl">
        <label>Export the table <span id="vExport">— the one showing, for the synth you use</span></label>
        <div class="seg seg4" id="exportSeg">
          <button class="filebtn seg-btn" data-kind="serum" title="CLM WAV, 2048-sample frames, up to 256 — drag onto a Serum or Vital oscillator">Serum / Vital</button>
          <button class="filebtn seg-btn" data-kind="surge" title=".wt, 1024-sample waves, up to 512 — Surge XT's own format">Surge .wt</button>
          <button class="filebtn seg-btn" data-kind="ableton" title="16-bit WAV, 1024-sample frames — drag onto Wavetable's oscillator">Ableton</button>
          <button class="filebtn seg-btn" id="cExport" data-kind="float" title="32-bit float WAV, 1024-sample frames, as pack_wavetable.py writes">Float .wav</button>
        </div>''')
rep(".ctl input[type=file] { display: none; }",
    ".ctl input[type=file] { display: none; }\n.ctl button.filebtn:disabled { opacity: .4; cursor: default; }\n.seg label.seg-btn { text-align: center; }\n.seg.seg3 { grid-template-columns: 1fr 1fr 1fr; }\n.seg.seg4 { grid-template-columns: 1fr 1fr 1fr 1fr; }")

# 3. the packer itself, inlined
rep("<script>\n/* =====================================================================\n *  WAVETABLE DATA",
    "<script>\n" + (HERE / "packer.js").read_text() + "\n</script>\n<script>\n" + (HERE / "formats.js").read_text() + "\n</script>\n<script>\n/* =====================================================================\n *  WAVETABLE DATA")
rep("const FRAME_LEN = 1024;\nconst TABLES = [", "const FRAME_LEN = 1024;\nconst TABLES = [" + json.dumps(demo_entry) + ", ")

# 4. file handling: parse ourselves, pack folders, keep the order toggle live
start = src.index("async function handleFile(file){")
end = src.index("/* =====================================================================\n *  ENGAGE")
src = src[:start] + r'''const packState = { files: null, folder: '', order: 'chain', smooth: 0, lastIdx: -1 };
const ORDER_WORDS = { chain: 'family chain', centroid: 'dull → bright', file: 'file order' };

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
  const recs = (await readAll(fileList)).filter(r => /\.(wav|wt)$/i.test(r.name));
  if (!recs.length){ $('vFile').textContent = '— no .wav or .wt files in that drop'; return; }
  // One file that is already a table (a Serum/Vital CLM WAV, a Surge .wt, or 2+ frames
  // of 1024): load it as is. A CLM table's 2048-sample frames come in as themselves,
  // not split in half.
  if (recs.length === 1){
    try {
      const r = WTFormats.readTable(recs[0].buffer);
      if (r){
        const F = Math.min(256, r.frames);
        const names = Array.from({ length: F }, (_, i) => `frame${(i + 1).toString().padStart(2, '0')}`);
        tableData.push({ label: `Table — ${recs[0].name}`, frames: F, frameNames: names,
          samples: r.samples.slice(0, F * FRAME_LEN), data: null, order: 'as-authored', fileName: recs[0].name });
        fillTableSelect(); selectTable(tableData.length - 1);
        $('vFile').textContent = `${recs[0].name} — read as a ${F}-frame table (${r.source}${r.frames > F ? `, first ${F} of ${r.frames}` : ''})`;
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
  try { t = WTPacker.packCycles(packState.files, { frameLen: FRAME_LEN, order: packState.order, smooth: packState.smooth }); }
  catch (e){ $('vFile').textContent = `— ${e.message}`; return; }
  const entry = { label: `Packed — ${packState.folder}, ${ORDER_WORDS[t.order]}${t.smooth ? `, blurred ${t.smooth}` : ''}`,
    frames: t.frames, frameNames: t.frameNames, centroids: t.centroids, order: t.order, families: t.families,
    samples: t.samples, data: null, packed: t };
  if (packState.lastIdx >= 0) tableData[packState.lastIdx] = entry;
  else { tableData.push(entry); packState.lastIdx = tableData.length - 1; }
  fillTableSelect(); selectTable(packState.lastIdx);
  const notes = [];
  if (t.skipped.length) notes.push(`${t.skipped.length} skipped (${t.skipped[0].why})`);
  if (t.thinned) notes.push(`${t.thinned} thinned to fit 256 frames`);
  if (t.families) notes.push(`${t.families.k} families: ${t.families.names.map((n, i) => `${n} ${t.families.of.filter(f => f === i).length}`).join(', ')}`);
  $('vFile').textContent = `${packState.folder} — ${t.frames} cycles packed${notes.length ? ' · ' + notes.join(' · ') : ''}`;
  $('vExport').textContent = `${t.frames} frames — pick the synth you use`;
}

function setOrder(order){
  packState.order = order;
  document.querySelectorAll('#orderSeg .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.order === order));
  $('vOrder').textContent = { chain: 'families, each walked smoothly', centroid: 'dull → bright', file: 'as the folder lists them' }[order];
  repack();
}
document.querySelectorAll('#orderSeg .seg-btn').forEach(b => b.addEventListener('click', () => setOrder(b.dataset.order)));
function setSmooth(sigma){
  packState.smooth = +sigma;
  document.querySelectorAll('#smoothSeg .seg-btn').forEach(b => b.classList.toggle('active', +b.dataset.smooth === +sigma));
  $('vSmooth').textContent = +sigma ? `each frame blended into its neighbours, sigma ${sigma}` : 'off — frames as packed';
  repack();
}
document.querySelectorAll('#smoothSeg .seg-btn').forEach(b => b.addEventListener('click', () => setSmooth(b.dataset.smooth)));

/* Export whichever table is showing, packed or built in, in the chosen synth's format. */
function exportAs(kind){
  const t = tableData[state.tableIdx]; if (!t) return;
  const base = (t.packed && t.packed.fileName) || t.fileName || t.label.replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '');
  let x;
  if (kind === 'float') x = { buffer: WTPacker.encodeWavFloat32(t.samples), fileName: base.replace(/\.(wav|wt)$/i, '') + '.wav', frames: t.frames, thinned: 0 };
  else x = WTFormats.exportTable(t.samples, kind, base);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([x.buffer], { type: kind === 'surge' ? 'application/octet-stream' : 'audio/wav' }));
  a.download = x.fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  const nm = x.fileName.length > 34 ? x.fileName.slice(0, 34) + '…' : x.fileName;
  $('vExport').textContent = `saved ${nm}${x.thinned ? ` · thinned ${x.thinned} to fit ${x.frames}` : ''}`;
}
document.querySelectorAll('#exportSeg .seg-btn').forEach(b => b.addEventListener('click', () => exportAs(b.dataset.kind)));

$('cFile').addEventListener('change', e => { if (e.target.files.length) handleFiles(e.target.files); });
$('cDir').addEventListener('change',  e => { if (e.target.files.length) handleFiles(e.target.files); });
// Drag-and-drop onto the stage: a folder, many files, or one table.
const stage = document.querySelector('.stage');
['dragover','drop'].forEach(ev => stage.addEventListener(ev, e => e.preventDefault()));
stage.addEventListener('drop', async e => { handleFiles(await filesFromDrop(e.dataTransfer)); });

''' + src[end:]

# 5. HUD: say what the order means, and the current frame's brightness
rep("    `<div class=\"row\"><span class=\"k\">note</span>",
    "    `<div class=\"row\"><span class=\"k\">order</span><span class=\"v\">${t.order === 'chain' && t.families ? `family chain: ${t.families.names[t.families.of[cur]]} (family ${t.families.of[cur] + 1} of ${t.families.k}, darkest first)` : t.order === 'centroid' ? 'dull → bright (centroid sort): back ridges are brighter' : t.order === 'file' ? 'file order: depth means nothing' : 'as authored'}${t.centroids ? ` · this frame ${Math.round(t.centroids[cur])} Hz` : ''}</span></div>` +\n    `<div class=\"row\"><span class=\"k\">note</span>")

# 6. many frames: show a window of chips around the cursor
rep("  table.frameNames.forEach((nm, i) => {\n    const span",
    "  const W = 7, lo = F > 2 * W + 1 ? Math.max(0, Math.min(F - 2 * W - 1, cur - W)) : 0, hi = F > 2 * W + 1 ? lo + 2 * W + 1 : F;\n  if (lo > 0){ const s = document.createElement('span'); s.textContent = `… ${lo}`; strip.appendChild(s); }\n  table.frameNames.slice(lo, hi).forEach((nm, j) => { const i = lo + j;\n    const span")
rep("    strip.appendChild(span);\n  });\n}", "    strip.appendChild(span);\n  });\n  if (hi < F){ const s = document.createElement('span'); s.textContent = `${F - hi} …`; strip.appendChild(s); }\n}")

rep("function selectTable(idx){\n  state.tableIdx = idx;", "function selectTable(idx){\n  state.tableIdx = idx;\n  $('cTable').value = idx;")
rep("window.__wavetable = { state, tableData, palaceTokens, VIZ, FRAME_LEN };",
    "window.__wavetable = { state, tableData, palaceTokens, VIZ, FRAME_LEN, packState, handleFiles, setOrder, setSmooth };")

# 7. the cursor plane: a cross-section at the scan position, and a handle you can drag.
# The Sketch rotated it a quarter turn, so it ran lengthwise through the middle of the
# table and never marked the scan. Unrotated, it spans the sample axis (X) and sits at z.
rep("  VIZ.cursorPlane = new THREE.Mesh(planeGeom, planeMat);\n  VIZ.cursorPlane.rotation.y = Math.PI / 2;       // facing along Z\n  VIZ.scene.add(VIZ.cursorPlane);",
    "  VIZ.cursorPlane = new THREE.Mesh(planeGeom, planeMat);\n  VIZ.scene.add(VIZ.cursorPlane);\n  // Its outline, so the cross-section reads against a dense table.\n  VIZ.cursorEdge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([\n    new THREE.Vector3(-3.1, -1.3, 0), new THREE.Vector3(3.1, -1.3, 0), new THREE.Vector3(3.1, 1.3, 0), new THREE.Vector3(-3.1, 1.3, 0)]),\n    new THREE.LineBasicMaterial({ color: t.accent, transparent: true, opacity: 0.5 }));\n  VIZ.cursorPlane.add(VIZ.cursorEdge);\n  initCursorDrag();")
rep("  VIZ.cursorPlane.position.z = z;\n  VIZ.cursorPlane.position.x = 0;",
    "  VIZ.cursorPlane.position.z = z;\n  VIZ.cursorPlane.position.x = 0;\n  const lit = VIZ.drag.active || VIZ.drag.hover;\n  VIZ.cursorPlane.material.opacity = lit ? 0.22 : 0.10;\n  VIZ.cursorEdge.material.opacity = lit ? 0.95 : 0.5;")
rep("function onResize(){", r"""/* Drag the cursor plane along the frame axis to set Position. A press that lands
 * on the plane (or within a quarter-unit of it) grabs it; any other press orbits.
 * The press is caught on the stage before OrbitControls sees it. While dragging,
 * the pointer ray is met with whichever of two planes holding the frame axis
 * (the floor y = grab height, or the wall x = grab x) faces the camera more,
 * so the drag tracks from any orbit angle. */
function initCursorDrag(){
  const c = VIZ.canvas, ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  VIZ.drag = { active: false, hover: false, surface: null, id: null };
  const aim = e => { const r = c.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, VIZ.camera); };
  const onPlane = () => {
    const F = tableData[state.tableIdx].frames; if (F < 2) return null;
    const z = VIZ.cursorPlane.position.z, p = new THREE.Vector3();
    if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -z), p)) return null;
    if (Math.abs(p.x) > 3.4 || Math.abs(p.y) > 1.5) {
      // Seen nearly edge-on: accept a press on the floor or wall within reach of the plane.
      const q = new THREE.Vector3();
      for (const pl of [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)])
        if (ray.ray.intersectPlane(pl, q) && Math.abs(q.z - z) < 0.25 && Math.abs(q.x) < 3.4 && Math.abs(q.y) < 1.5) return q.clone();
      return null;
    }
    return p;
  };
  const posAt = () => {
    const p = new THREE.Vector3();
    if (!ray.ray.intersectPlane(VIZ.drag.surface, p)) return null;
    return Math.max(0, Math.min(1, (p.z + 2) / 4));
  };
  const setPos = v => { const el = $('cPos'); el.value = v.toFixed(3); el.dispatchEvent(new Event('input')); };
  c.parentElement.addEventListener('pointerdown', e => {
    if (e.target !== c || e.button > 0) return;
    aim(e); const hit = onPlane(); if (!hit) return;
    e.stopPropagation(); e.preventDefault();
    if (state.lfoRate > 0) { const l = $('cLfo'); l.value = 0; l.dispatchEvent(new Event('input')); }
    const d = ray.ray.direction;
    VIZ.drag.surface = Math.abs(d.y) >= Math.abs(d.x)
      ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -hit.y) : new THREE.Plane(new THREE.Vector3(1, 0, 0), -hit.x);
    VIZ.drag.active = true; VIZ.drag.id = e.pointerId;
    c.setPointerCapture(e.pointerId); c.style.cursor = 'grabbing';
  }, true);
  c.addEventListener('pointermove', e => {
    aim(e);
    if (VIZ.drag.active && e.pointerId === VIZ.drag.id){ const v = posAt(); if (v !== null) setPos(v); return; }
    VIZ.drag.hover = !!onPlane(); c.style.cursor = VIZ.drag.hover ? 'grab' : '';
  });
  const end = e => { if (!VIZ.drag.active || e.pointerId !== VIZ.drag.id) return;
    VIZ.drag.active = false; c.releasePointerCapture(e.pointerId); c.style.cursor = VIZ.drag.hover ? 'grab' : ''; };
  c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
  c.style.touchAction = 'none';
}

function onResize(){""")
rep("Play a note and scan the cursor across the ridges", "Play a note and drag the glowing cursor across the ridges")

(BUNDLE / "wavetable_scanner_study.html").write_text(src)
print("wrote", BUNDLE / "wavetable_scanner_study.html", len(src), "bytes")
