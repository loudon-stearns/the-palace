#!/usr/bin/env python3
"""Synth Templates — features, spectrograms and the sanity pass over renders/ (run by render-refs.mjs, or alone).

usage: python3 render-features.py [--no-png]
  reads renders/manifest.json and renders/<id>.wav; writes renders/features.json, renders/<id>.png, renders/SANITY-<date>.md

Per card: peak and RMS (dBFS), crest (dB), spectral centroid (Hz), rise time to -6 dB below the peak, tail from the last
note-off to -40 dB below the peak, stereo width (side/mid RMS) and L/R correlation, sounding duration (first to last sample
above -60 dBFS). Sanity flags: silent (peak < -40 dBFS), clipping (peak > -0.1 dBFS or crest < 3 dB), length (sounding
duration more than 2x off the card's length_s either way). numpy, scipy.signal, matplotlib only.
"""
import json, sys, pathlib, datetime, wave
import numpy as np
from scipy.signal import stft
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import yaml

HERE = pathlib.Path(__file__).parent; R = HERE / "renders"
NO_PNG = "--no-png" in sys.argv
man = json.load(open(R / "manifest.json")); SR = man["sample_rate_hz"]
db = lambda x: float(20 * np.log10(max(x, 1e-9)))

def read_wav(p):
    with wave.open(str(p)) as w:
        n = w.getnframes(); nc = w.getnchannels(); d = np.frombuffer(w.readframes(n), dtype="<i2").astype(np.float32) / 32768
    return d.reshape(-1, nc)

def envelope(mono, win=0.005):
    h = max(1, int(SR * win)); n = len(mono) // h
    return np.sqrt((mono[: n * h].reshape(n, h) ** 2).mean(axis=1)), h

def features(d, sched):
    mono = d.mean(axis=1); peak = float(np.abs(d).max())
    env, hop = envelope(mono); envdb = 20 * np.log10(env + 1e-9)
    above = np.where(envdb > -60)[0]
    if peak < 1e-6 or not len(above):
        return dict(peak_dbfs=round(db(peak), 2), rms_dbfs=-180.0, crest_db=0.0, centroid_hz=0.0, rise_s=None, tail_s=None, width=0.0, lr_corr=1.0, duration_s=0.0, onset_s=None)
    t_on, t_end = above[0] * hop / SR, (above[-1] + 1) * hop / SR
    seg = d[int(t_on * SR): int(t_end * SR)]; rms = float(np.sqrt((seg ** 2).mean()))
    pk_db = db(peak); ipk = int(np.argmax(envdb))
    rise = next((i for i in range(len(envdb)) if envdb[i] >= pk_db - 6), ipk) * hop / SR - t_on
    off = sched["last_note_off_s"]; i0 = int(off * SR / hop)
    after = envdb[i0:]; ref = after.max() if len(after) else pk_db
    below = np.where(after < ref - 40)[0]; tail = float(below[0] * hop / SR) if len(below) else float(t_end - off)
    m = (d[:, 0] + d[:, 1]) / 2; s = (d[:, 0] - d[:, 1]) / 2
    width = float(np.sqrt((s ** 2).mean()) / (np.sqrt((m ** 2).mean()) + 1e-9))
    corr = float(np.corrcoef(d[:, 0], d[:, 1])[0, 1]) if d[:, 0].std() > 0 and d[:, 1].std() > 0 else 1.0
    segm = mono[int(t_on * SR): int(t_end * SR)]; nps = min(2048, max(64, len(segm))); f, t, Z = stft(segm, SR, nperseg=nps, noverlap=nps * 3 // 4); P = np.abs(Z) ** 2
    cent = float((f[:, None] * P).sum() / (P.sum() + 1e-12))
    return dict(peak_dbfs=round(pk_db, 2), rms_dbfs=round(db(rms), 2), crest_db=round(pk_db - db(rms), 2), centroid_hz=round(cent, 1), rise_s=round(max(rise, 0), 4), tail_s=round(tail, 3), width=round(width, 3), lr_corr=round(corr, 3), duration_s=round(t_end - t_on, 3), onset_s=round(t_on, 3))

def spectrogram_png(d, r, p):
    mono = d.mean(axis=1); f, t, Z = stft(mono, SR, nperseg=2048, noverlap=1536); S = 20 * np.log10(np.abs(Z) + 1e-7)
    fig, ax = plt.subplots(figsize=(8, 3.2), dpi=100); fig.patch.set_facecolor("#f0eee5")
    ax.pcolormesh(t, f, S, vmin=-90, vmax=-10, cmap="magma", shading="auto", rasterized=True)
    ax.set_yscale("log"); ax.set_ylim(30, SR / 2); ax.set_xlabel("s"); ax.set_ylabel("Hz")
    ax.set_title(f"{r['name']} — {r['id']} — {r['render'].get('tempo')} bpm, {r['render'].get('note')}", fontsize=9, loc="left")
    ax.axvline(r["schedule"]["last_note_off_s"], color="#c8261a", lw=0.8, ls="--")
    fig.tight_layout(); fig.savefig(p); plt.close(fig)

feats = {}; flags = []
for r in man["renders"]:
    d = read_wav(R / r["wav"]); F = features(d, r["schedule"]); F["length_s_card"] = r["render"].get("length_s"); F["raw_peak_dbfs"] = r["schedule"].get("raw_peak_dbfs"); feats[r["id"]] = F
    if not NO_PNG: spectrogram_png(d, r, R / r["spectrogram"])
    kinds = []
    if F["peak_dbfs"] < -40: kinds.append("silent")
    if F["peak_dbfs"] > -0.1 or (F["crest_db"] < 3 and F["peak_dbfs"] >= -40): kinds.append("clipping")
    L = F["length_s_card"] or 0
    if L and F["duration_s"] > 0 and (F["duration_s"] > 2 * L or F["duration_s"] < L / 2): kinds.append("length")
    if r["warnings"]: kinds.append("vocab")
    if kinds: flags.append((r, F, kinds))
json.dump({"generator": "render-features.py", "sample_rate_hz": SR, "fields": {"peak_dbfs": "peak sample, dBFS", "rms_dbfs": "RMS over the sounding region", "crest_db": "peak minus RMS", "centroid_hz": "power-weighted spectral centroid over the sounding region", "rise_s": "onset to first -6 dB below peak (5 ms RMS envelope)", "tail_s": "last note-off to -40 dB below the post-off peak", "width": "side RMS / mid RMS", "lr_corr": "L/R correlation", "duration_s": "sounding length, first to last above -60 dBFS", "length_s_card": "the card's render.length_s", "raw_peak_dbfs": "float peak before the 16-bit clamp, from the manifest"}, "cards": feats}, open(R / "features.json", "w"), indent=1)

# the sanity pass: one likely cause per flagged card, read from the card
def cause(c, F, kinds):
    B = c.get("graph", {}).get("blocks", {}); chain = B.get("fx", {}).get("chain", []) or []; audio = c.get("graph", {}).get("audio", [])
    mods = c.get("graph", {}).get("modulation", []); aenv = B.get("aenv", {}).get("shape", {}); mode = str(c.get("mode", ""))
    if "silent" in kinds:
        selfed = [e for e in audio if len(e) == 3 and e[0] == e[1]]
        if selfed: return f"osc feeds itself ({selfed[0][0]}→{selfed[0][1]} {selfed[0][2]}): the voice routes it into its own frequency and never into the mixer"
        fm_only = [e for e in audio if len(e) == 3]
        srcs = [s for s in ("osc1", "osc2", "sub", "noise") if s in B]; carriers = [s for s in srcs if not any(e[0] == s for e in fm_only)]
        if not carriers: return "every source is a modulator (3-field audio edge): no carrier reaches the mixer"
        if all(str(B[s].get("level")) == "off" for s in srcs) or any(str(B[f].get("resonance")) == "self-oscillating" for f in ("filter1", "filter2") if f in B):
            return "self-oscillation: a Web Audio biquad never self-oscillates and the oscillator is off, so there is no source"
        if "filter1" in B and "filter2" in B:
            cw = lambda f: next((e["value"] for e in c.get("essentials", []) if e["block"] == f and e["param"] == "cutoff"), next((t["default"] for t in c.get("taste", []) if t["block"] == f and t["param"] == "cutoff"), "mid"))
            return f"two filters in series: {B['filter1'].get('type')} '{cw('filter1')}' Q {B['filter1'].get('resonance')} into {B['filter2'].get('type')} '{cw('filter2')}' Q {B['filter2'].get('resonance')}: the bands barely overlap, and the voice has no parallel routing (filter level words), formant peaks or wheel sweep to open them"
        if not any(m["from"] == "aenv" and m["to"].startswith("amp") for m in mods): return "no aenv→amp route; the fallback envelope should sound, so the silence is elsewhere in the graph"
        return "graph reached the amp but nothing came out: check the audio edges"
    if "clipping" in kinds:
        raw = F.get("raw_peak_dbfs"); over = f"raw peak {raw:+.1f} dBFS before the 16-bit clamp (the page's -12 dB compressor, bypassed here, would hold it); " if raw is not None and raw > -0.1 else ""
        if any(x in chain for x in ("saturation", "drive", "distortion", "overdrive")): return over + "fx drive stage (tanh at pre-gain 1+2·drive, post 0.7) flattens the crest"
        n_src = sum(1 for s in ("osc1", "osc2", "sub", "noise") if s in B); uni = max([int(B[s].get("unison") or 1) for s in ("osc1", "osc2", "sub") if s in B] or [1])
        notes = c.get("render", {}).get("note"); nn = len(notes) if isinstance(notes, list) and "mono" not in mode else 1
        if F["crest_db"] < 3: return over + f"flat crest: a dense sustained tone ({n_src} source(s), unison {uni}, {nn} note(s)) held at full level"
        return over + f"hot sum: {n_src} source(s) × unison {uni} × {nn} note(s) at their level words through amp '{B.get('amp', {}).get('level')}' and master 0.5"
    if "length" in kinds:
        pat = str(c.get("render", {}).get("pattern", "")); L = F["length_s_card"]
        if F["duration_s"] < L / 2:
            if any(w in pat for w in ("held", "bar", "bars", "seconds", "ring", "tail")): return f"pattern wants '{pat[:50]}' ({L}s) but playDemo holds a chord 3.5 beats / a single note 4 hits of half a beat: pattern and length_s are not read"
            return f"short: playDemo's fixed shapes give {F['duration_s']}s against length_s {L}"
        if "reverb" in chain or "delay" in chain or "echo" in chain: return f"long: fx tail (chain {chain}) runs past length_s {L}"
        rel = aenv.get("r"); return f"long: amp release '{rel}' and the pattern overrun length_s {L}"
    return "vocabulary word missing (see manifest warnings)"

today = datetime.date.today().isoformat(); counts = {}
for _, _, k in flags:
    for x in k: counts[x] = counts.get(x, 0) + 1
lines = [f"# Sanity pass — reference renders — {today}", "", f"Master compressor: {man.get('master_compressor','as on the page')}", "", f"{len(man['renders'])} cards rendered by `render-refs.mjs` (site/voice.js in Node, {SR} Hz, 16-bit stereo); {len(flags)} flagged. Thresholds: silent peak < -40 dBFS; clipping peak > -0.1 dBFS or crest < 3 dB; length = sounding duration more than 2× off the card's `render.length_s` either way; vocab = a word the vocabulary has no number for (the voice fell back).", "",
         "| kind | count |", "|---|---|"] + [f"| {k} | {v} |" for k, v in sorted(counts.items())] + ["", "| card | kinds | peak dBFS | crest dB | sounds s | length_s | likely cause |", "|---|---|---|---|---|---|---|"]
cards = {p.stem: yaml.safe_load(open(p)) for p in (HERE / "cards").glob("*.yaml")}
for r, F, kinds in sorted(flags, key=lambda x: (x[2][0] != "silent", x[2][0] != "clipping", x[0]["id"])):
    c = cards.get(r["id"], {}); why = cause(c, F, kinds)
    if "vocab" in kinds and len(kinds) > 1: why += "; vocab: " + "; ".join(sorted(set(r["warnings"])))
    lines.append(f"| {r['id']} | {', '.join(kinds)} | {F['peak_dbfs']} | {F['crest_db']} | {F['duration_s']} | {F['length_s_card']} | {why} |")
(R / f"SANITY-{today}.md").write_text("\n".join(lines) + "\n")
print(f"features.json ({len(feats)} cards), {'no PNGs' if NO_PNG else 'spectrograms'}, SANITY-{today}.md: {counts}")
