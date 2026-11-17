#!/usr/bin/env python3
"""Synth Templates — a card's Serum mapping, made into a real Serum 2 preset, rendered in the hosted Serum 2 and set beside the reference.

usage: ~/.venvs/palace-vital/bin/python on-serum.py [house-bass] [--fit]
  needs the palace-vital venv (pedalboard, numpy, scipy, mido, matplotlib, pyyaml, zstandard, cbor2) and
  /Library/Audio/Plug-Ins/VST3/Serum2.vst3. Writes proofs/<date>-on-serum/House Bass (Synth Templates).SerumPreset (load it in
  Serum 2), house-bass-serum.wav, house-bass-compare.png, house-bass-compare.json

Why Serum 2 and not Serum 1. Both host in pedalboard. In Serum 1 the modulation matrix's sources and destinations are not
parameters; they live in a binary chunk, and guessing which factory slot was which misled twice (2026-11-17). Serum 2 keeps its
whole state as readable data: 'XferJson\\0', a u64 length, a JSON header, then u32 raw length, u32 2, and a zstd frame of CBOR
whose modules are named (Env0, VoiceFilter0, Oscillator0, ModSlot0 {source, destModuleTypeString, destModuleParamName,
plainParams.kParamAmount}). A .SerumPreset file is the same shape with a preset header, and the VST3 state's IComponent (JUCE's
size-prefixed 6-bit encoding) holds it with a processor header. So the matrix slot is written as data, the rest is set by
parameter, and the preset file carries the very bytes that were rendered.

Serum's units, read off its own display on this Mac (2026-11-17):
  envelope time  t = 32 s * raw^5            (raw 0.5 = 1.00 s, 0.3 = 78 ms, 0.2 = 10 ms; Serum 1 the same)
  filter cutoff  f = 8 Hz * (22050/8)^raw     (a log knob over 11.43 octaves; raw 0.5 = 425 Hz)
  levels, amp sustain   gain = raw^2          (raw 0.5 = -12 dB); Env 2 sustain % = raw^2
  matrix amount  raw 0.5 = 0, 1.0 = +100 %
  Default Shapes (S2 Tables) is nine frames: saw, sine, triangle, a morph, square, then pulses 25 % down to 3 %; square is frame 5.
"""
import sys, re, json, math, struct, datetime, pathlib
import numpy as np, yaml, mido, pedalboard, zstandard, cbor2
from scipy.io import wavfile
from scipy.signal import stft
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = pathlib.Path(__file__).parent
SR = 48000
CARD = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else "house-bass"
FIT = "--fit" in sys.argv
OUT = HERE / "proofs" / f"{datetime.date.today().isoformat()}-on-serum"
VST, PLUG = "/Library/Audio/Plug-Ins/VST3/Serum2.vst3", "Serum 2"
NAME = "House Bass (Synth Templates)"
ENV2 = [3, 0]          # the matrix source code for Env 2, found by sweeping codes 0-11 (2026-11-17): 2 follows the amp envelope,
                       # 3 is the only one Env 2's decay moves, 4-5 the other envelopes, 6 and up the LFOs; proved again in main()

# ---- Serum's units -------------------------------------------------------------------------------------------------
t_raw = lambda s: (max(s, 0.0) / 32.0) ** 0.2
hz_raw = lambda hz: math.log(hz / 8.0) / math.log(22050 / 8.0)
CUT_OCT = math.log2(22050 / 8.0)
gain_raw = lambda g: max(g, 0.0) ** 0.5
amt_raw = lambda frac: 0.5 + 0.5 * frac
SQUARE = 4 / 8          # Default Shapes, frame 5 of 9

# ---- the state ------------------------------------------------------------------------------------------------------
ALPHA = ".ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+"


def j64enc(b):
    bits = len(b) * 8; out = []
    for i in range(0, bits, 6):
        v = 0
        for k in range(6):
            p = i + k
            if p < bits and (b[p // 8] >> (p % 8)) & 1: v |= 1 << k
        out.append(ALPHA[v])
    return f"{len(b)}." + "".join(out)


def j64dec(s):
    size, data = s.split(".", 1); size = int(size); out = bytearray(size); bit = 0
    for ch in data:
        v = ALPHA.index(ch)
        for k in range(6):
            if (v >> k) & 1 and bit // 8 < size: out[bit // 8] |= 1 << (bit % 8)
            bit += 1
    return bytes(out)


def xfer_unpack(b):
    assert b[:9] == b"XferJson\0", "not an Xfer state"
    n = struct.unpack("<Q", b[9:17])[0]; meta = json.loads(b[17:17 + n]); ulen, ver = struct.unpack("<II", b[17 + n:25 + n])
    return meta, ver, cbor2.loads(zstandard.ZstdDecompressor().decompress(b[25 + n:], max_output_size=ulen + 16))


def xfer_pack(meta, ver, obj):
    j = json.dumps(meta, separators=(",", ":")).encode(); raw = cbor2.dumps(obj)
    return b"XferJson\0" + struct.pack("<Q", len(j)) + j + struct.pack("<II", len(raw), ver) + zstandard.ZstdCompressor(level=19).compress(raw)


def get_chunk(plugin):
    return j64dec(re.search(r"<IComponent>([^<]*)</IComponent>", plugin.raw_state[8:].decode()).group(1))


def put_chunk(plugin, chunk):
    x = re.sub(r"<IComponent>[^<]*</IComponent>", "<IComponent>" + j64enc(chunk) + "</IComponent>", plugin.raw_state[8:].decode())
    body = x.encode(); plugin.raw_state = b"VC2!" + struct.pack("<I", len(body)) + body


def route(plugin, source, amount_pct):
    """write matrix slot 1 as data: source -> Filter 1 cutoff, amount in %"""
    meta, ver, obj = xfer_unpack(get_chunk(plugin))
    obj["ModSlot0"] = {"destModuleID": 0, "destModuleParamID": 3, "destModuleParamName": "kParamFreq",
                       "destModuleTypeString": "VoiceFilter", "plainParams": {"kParamAmount": float(amount_pct)}, "source": list(source)}
    put_chunk(plugin, xfer_pack(meta, ver, obj))


# ---- the card's rows, in Serum 2's parameters -----------------------------------------------------------------------
def voc_time(voc, w): return float(voc["time"][w])


def house_bass(P, voc, fdecay=None, depth_oct=None, release=None, depth_raw=None):
    T = lambda w: voc_time(voc, w)
    fd = fdecay if fdecay is not None else T("short"); dep = depth_oct if depth_oct is not None else 3.5
    rel = release if release is not None else T("short")
    v = {
        "mono_toggle": 1.0, "legato": 0.0, "porta_time": 0.0,                                 # mono, no glide
        "a_enable": 1.0, "a_level": 0.75, "a_wt_pos": SQUARE, "a_unison": 0.0, "a_octave_oct": 0.5,
        "b_enable": 0.0, "c_enable": 0.0, "noise_enable": 0.0,
        "sub_enable": 1.0, "sub_shape": 0.0, "sub_octave_oct": 0.4, "sub_level": gain_raw(0.75 ** 2 / 2),  # sine, -1 oct, 6 dB under Osc A
        "a_filter_balance": 0.0, "sub_osc_filter_balance": 0.0,                               # both into Filter 1 only
        "filter_1_on": 1.0, "filter_1_type": MG24, "filter_1_freq_hz": hz_raw(300.0), "filter_1_res": 0.4,
        "filter_1_drive": 0.0, "filter_1_wet": 1.0, "filter_2_on": 0.0,
        "env_1_attack": t_raw(T("fast")), "env_1_hold": 0.0, "env_1_decay": t_raw(T("medium")),
        "env_1_sustain": gain_raw(0.7), "env_1_release": t_raw(rel),
        "env_2_attack": 0.0, "env_2_hold": 0.0, "env_2_decay": t_raw(fd), "env_2_sustain": 0.0, "env_2_release": t_raw(rel),
        "mod_1_amount": depth_raw if depth_raw is not None else amt_raw(dep / CUT_OCT),
    }
    for k, x in v.items(): P[k].raw_value = float(x)
    shows = {k: P[k].string_value.strip() for k in ["mono_toggle", "a_wt_pos", "sub_shape", "sub_octave_oct", "sub_level", "a_level",
             "filter_1_type", "filter_1_freq_hz", "filter_1_res", "env_1_attack", "env_1_decay", "env_1_sustain", "env_1_release",
             "env_2_attack", "env_2_decay", "env_2_sustain", "env_2_release", "mod_1_amount"]}
    return {"cutoff_hz": 300.0, "fenv_decay_s": round(fd, 4), "fenv_depth_oct": dep, "resonance": 0.4,
            "aenv_s": [T("fast"), T("medium"), 0.7, round(rel, 4)], "as_serum_shows": shows}


def find_raw(p, want):
    for v in np.linspace(0, 1, 4001):
        p.raw_value = float(v)
        if p.string_value.strip() == want: return float(v)
    raise SystemExit(f"no raw value shows {want!r}")


# ---- render and measure (the same lines on-vital.py draws) ---------------------------------------------------------
HELD = [(0.05, 1.05)]          # one held note for the checks; the pattern's notes are too short to see a decay in


def schedule(card):
    r = card["render"]; beat = 60 / r["tempo"]; unit = beat / 2; t0 = 0.05; n = round(4 * beat / unit)
    return [(t0 + i * unit, t0 + i * unit + unit * 0.5) for i in range(n) if i % 2 == 1], r.get("velocity", 100)


def render(plugin, notes, vel, note=36, dur=2.5):
    lead = 0.5; msgs = []
    for on, off in notes:
        msgs.append(mido.Message("note_on", note=note, velocity=vel, time=on + lead))
        msgs.append(mido.Message("note_off", note=note, velocity=0, time=off + lead))
    plugin.reset()
    return plugin(msgs, duration=dur + lead, sample_rate=SR, num_channels=2)[:, int(lead * SR):]


def read(path):
    sr, x = wavfile.read(path); x = x.astype(np.float32) / (32768 if x.dtype == np.int16 else 1)
    return (x.T if x.ndim == 2 else np.vstack([x, x])), sr


def contour(mono, hop=0.005):
    f, t, Z = stft(mono, SR, nperseg=1024, noverlap=1024 - int(hop * SR)); P = np.abs(Z) ** 2
    lev = 10 * np.log10(P.sum(axis=0) + 1e-12); cen = (f[:, None] * P).sum(axis=0) / (P.sum(axis=0) + 1e-12)
    return t, lev - lev.max(), cen


def compare(ref, got):
    t, lr, cr = contour(ref.mean(axis=0)); _, lg, cg = contour(got.mean(axis=0)); n = min(len(t), len(lg))
    live = (lr[:n] > -30) & (lg[:n] > -30)
    oct_err = float(np.sqrt(np.mean((np.log2(cr[:n][live] + 1) - np.log2(cg[:n][live] + 1)) ** 2))) if live.any() else 9.0
    a, b = np.maximum(lr[:n], -50), np.maximum(lg[:n], -50)
    db_err = float(np.sqrt(np.mean((a - b)[(a > -50) | (b > -50)] ** 2)))
    return oct_err, db_err


def feats(x):
    m = x.mean(axis=0); rms = float(np.sqrt((m[np.abs(m) > 1e-4] ** 2).mean())); pk = float(np.abs(x).max())
    f, t, Z = stft(m, SR, nperseg=2048, noverlap=1536); P = np.abs(Z) ** 2
    return {"peak_dbfs": round(20 * math.log10(pk + 1e-9), 2), "rms_dbfs": round(20 * math.log10(rms + 1e-9), 2),
            "centroid_hz": round(float((f[:, None] * P).sum() / (P.sum() + 1e-12)), 1)}


def bright(x, a, b, on=HELD[0][0]):
    """brightness (spectral centroid, Hz) of a window of a held note, a..b seconds after its onset"""
    seg = x.mean(axis=0)[int((on + a) * SR):int((on + b) * SR)]; F = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))) ** 2
    fr = np.fft.rfftfreq(len(seg), 1 / SR); return round(float((fr * F).sum() / (F.sum() + 1e-12)), 1)


def harmonics(x, f0=65.406, a=0.3, b=0.9, on=HELD[0][0]):
    """the waveform check on a held note with the filter open: 2nd and 4th harmonics against the 3rd, and the 3rd against the 1st, in dB"""
    seg = x.mean(axis=0)[int((on + a) * SR):int((on + b) * SR)]; F = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
    fr = np.fft.rfftfreq(len(seg), 1 / SR); h = lambda k: float(F[np.argmin(np.abs(fr - k * f0))])
    return round(20 * math.log10((h(2) + h(4)) / 2 / h(3) + 1e-9), 1), round(20 * math.log10(h(3) / h(1)), 1)


MG24 = None


def main():
    global MG24
    assert CARD == "house-bass", "only the house bass has a Serum builder so far"
    OUT.mkdir(parents=True, exist_ok=True)
    card = yaml.safe_load(open(HERE / "cards" / f"{CARD}.yaml")); voc = yaml.safe_load(open(HERE / "vocabulary.yaml"))
    ref, rsr = read(HERE / "renders" / f"{CARD}.wav"); assert rsr == SR
    s = pedalboard.load_plugin(VST, plugin_name=PLUG); P = s.parameters
    MG24 = find_raw(P["filter_1_type"], "MG Low 24")
    route(s, ENV2, 0.0); P = s.parameters
    notes, vel = schedule(card); checks = {}

    # 1. the square: Osc A alone, filter wide open, a held note. A square has no even harmonics and its 3rd sits ~9.5 dB under the 1st.
    house_bass(P, voc, depth_raw=0.5); P["sub_enable"].raw_value = 0.0; P["filter_1_freq_hz"].raw_value = 1.0
    y = render(s, HELD, vel); checks["osc_a_frame"] = P["a_wt_pos"].string_value.strip()
    checks["even_vs_3rd_db"], checks["3rd_vs_1st_db"] = harmonics(y)
    # 2. the routing: slot 1 must open the filter at the onset, a longer Env 2 decay must hold it open longer,
    #    and with the cutoff already wide open the slot must change almost nothing
    house_bass(P, voc, depth_raw=0.5); y0 = render(s, HELD, vel)
    house_bass(P, voc); y1 = render(s, HELD, vel)
    house_bass(P, voc, fdecay=0.6); y2 = render(s, HELD, vel)
    house_bass(P, voc, depth_raw=0.5); P["filter_1_freq_hz"].raw_value = 1.0; o0 = render(s, HELD, vel)
    house_bass(P, voc); P["filter_1_freq_hz"].raw_value = 1.0; o1 = render(s, HELD, vel)
    w = lambda y: (bright(y, 0.005, 0.03), bright(y, 0.10, 0.13))
    checks.update({"slot_off_hz": w(y0), "slot_on_hz": w(y1), "slot_on_env2_decay_600ms_hz": w(y2), "filter_open_off_on_hz": [w(o0), w(o1)]})
    checks["slot_is_env2_to_cutoff"] = bool(w(y1)[0] > 1.3 * w(y0)[0] and w(y2)[1] > 1.2 * w(y1)[1]
                                            and abs(math.log2(w(o1)[0] / w(o0)[0])) < 0.3)
    print(json.dumps(checks))
    assert checks["slot_is_env2_to_cutoff"], f"source {ENV2} is not Env 2 into the cutoff: {checks}"

    chose = house_bass(P, voc); x = render(s, notes, vel); first = {"chose": chose, "err": compare(ref, x)}
    fit = None
    if FIT:
        best = (first["err"], dict()); grid = []
        for fd in [0.05, 0.07, 0.0986, 0.13, 0.16, 0.2, 0.25]:
            for dep in [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]:
                house_bass(P, voc, fd, dep); e = compare(ref, render(s, notes, vel))
                grid.append({"fenv_decay_s": fd, "fenv_depth_oct": dep, "brightness_oct": round(e[0], 3)})
                if e[0] < first["err"][0] * 0.9 and e[0] < best[0][0]: best = (e, dict(fdecay=fd, depth_oct=dep))
        rbest = None; rgrid = []
        for rel in [0.0986, 0.12, 0.15, 0.18, 0.22, 0.27, 0.33]:
            house_bass(P, voc, release=rel, **best[1]); e = compare(ref, render(s, notes, vel))
            rgrid.append({"release_s": rel, "loudness_db": round(e[1], 2)})
            if rbest is None or e[1] < rbest[0][1]: rbest = (e, rel)
        c = house_bass(P, voc, release=rbest[1], **best[1]); x = render(s, notes, vel)
        fit = {"chose": c, "err": compare(ref, x), "pluck_grid": grid, "release_grid": rgrid}
    pk = float(np.abs(x).max()); x = x / pk * 0.89 if pk > 0.89 else x     # -1 dBFS, a plain gain, as the reference set does

    # the preset: the very state that rendered, with a preset header in place of the processor one
    meta, ver, obj = xfer_unpack(get_chunk(s))
    pmeta = {"fileType": "SerumPreset", "hash": meta.get("hash", ""), "presetAuthor": "Synth Templates",
             "presetDescription": "The house bass card's Serum rows: square (Default Shapes, frame 5) and a sine sub an octave down "
                                  "into MG Low 24 at 300 Hz, Env 2 plucks the cutoff with no sustain, mono. Compare it against the card's reference render.",
             "presetName": NAME, "product": "Serum2", "productVersion": meta.get("productVersion", "2"),
             "tags": ["Bass", "Mono"], "url": "https://xferrecords.com/", "vendor": "Xfer Records", "version": 7.0}
    pfile = OUT / f"{NAME}.SerumPreset"; pfile.write_bytes(xfer_pack(pmeta, ver, obj))
    wavfile.write(OUT / f"{CARD}-serum.wav", SR, (x.T * 32767).astype(np.int16))
    # read it back: a fresh Serum 2 given the file's data must show the same values and play the same sound
    s2 = pedalboard.load_plugin(VST, plugin_name=PLUG); _, _, pobj = xfer_unpack(pfile.read_bytes())
    put_chunk(s2, xfer_pack(meta, ver, pobj))
    back = {k: s2.parameters[k].string_value.strip() for k in ["filter_1_type", "filter_1_freq_hz", "env_2_decay", "env_2_sustain", "mod_1_amount", "a_wt_pos", "mono_toggle"]}
    xb = render(s2, notes, vel); pb = float(np.abs(xb).max()); xb = xb / pb * 0.89 if pb > 0.89 else xb
    back["same_sound_rms_diff_db"] = round(20 * math.log10(float(np.sqrt(np.mean((xb - x) ** 2))) / float(np.sqrt(np.mean(x ** 2))) + 1e-12), 1)

    side = {"card": CARD, "synth": "Serum 2 (VST3, hosted in pedalboard)", "schedule": notes, "velocity": vel, "checks": checks,
            "as_mapped": first, "fitted": fit, "read_back": back, "features": {"reference": feats(ref), "serum": feats(x)},
            "err_units": "brightness: RMS octaves between the two centroid lines; loudness: RMS dB between the two level lines (each against its own peak)"}
    json.dump(side, open(OUT / f"{CARD}-compare.json", "w"), indent=1)
    t, lr, cr = contour(ref.mean(axis=0)); t2, lg, cg = contour(x.mean(axis=0)); n = min(len(t), len(t2))
    fig, ax = plt.subplots(2, 1, figsize=(9, 5), dpi=110, sharex=True); fig.patch.set_facecolor("#f0eee5")
    for a in ax: a.set_facecolor("#f7f5ee")
    mr, mg = lr[:n] > -40, lg[:n] > -40
    ax[0].plot(t[:n][mr], cr[:n][mr], ".", ms=2.5, color="#1d1d1b", label="reference (the site's voice)")
    ax[0].plot(t[:n][mg], cg[:n][mg], ".", ms=2.5, color="#c8261a", label="Serum 2, this preset")
    ax[0].set_yscale("log"); ax[0].set_ylabel("brightness, Hz"); ax[0].legend(fontsize=8, loc="upper right", frameon=False)
    ax[1].plot(t[:n], lr[:n], color="#1d1d1b", lw=1); ax[1].plot(t[:n], lg[:n], color="#c8261a", lw=1)
    ax[1].set_ylim(-50, 3); ax[1].set_ylabel("loudness, dB"); ax[1].set_xlabel("s")
    for on, off in notes:
        for a in ax: a.axvspan(on, off, color="#d9d4c3", alpha=0.35, lw=0)
    e = (fit or first)["err"]
    ax[0].set_title(f"House Bass — reference vs Serum 2 · brightness off by {e[0]:.2f} oct RMS · loudness shape off by {e[1]:.1f} dB RMS", fontsize=9, loc="left")
    fig.tight_layout(); fig.savefig(OUT / f"{CARD}-compare.png"); plt.close(fig)
    print("read back:", back)
    print("as mapped:", [round(v, 3) for v in first["err"]], first["chose"]["as_serum_shows"])
    if fit: print("fitted:", [round(v, 3) for v in fit["err"]], {k: fit["chose"][k] for k in ["fenv_decay_s", "fenv_depth_oct", "aenv_s"]}, fit["chose"]["as_serum_shows"])
    print("features:", side["features"])


if __name__ == "__main__":
    main()
