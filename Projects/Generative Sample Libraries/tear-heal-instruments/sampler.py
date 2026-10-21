#!/usr/bin/env python3
"""Files a sampler reads, and a small player that reads them back.

WAV + smpl, SFZ, DecentSampler (.dspreset, and the .dslibrary zip), and a
player that plays a key through a written SFZ the way a sampler would
(keycenter + tune, loop_continuous, attack, release, velocity), so every
demo and every check is made from the files on disk, not from the build's
intent.

bake_crossfade, write_wav_smpl, read_smpl and the click / level-step seam
measures are adopted from ai-source-probe/loop_sustain.py (the MusicGen
violin's loops); the DecentSampler skin is to_decentsampler.py's graphite.
"""
from __future__ import annotations

import math
import re
import struct
import wave
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

import numpy as np

SR = 44100
XFADE = 0.100          # baked crossfade before loop end, s (the shimmering sustain wants longer than the violin's 60 ms)
CLICK_LIMIT_DB = 6.0   # loop_sustain.py's limits
STEP_LIMIT_DB = 1.5

# Graphite skin of the Loudon Live design system, as DecentSampler ARGB (to_decentsampler.py).
BG, ACCENT, INK, RULE = "FF0A0A0F", "FFE8B84A", "FFE8E6DF", "FF4A4A5E"


# ---------------------------------------------------------------- loops

def seam_cost(y: np.ndarray, s: int, e: int, w: int) -> float:
    a, b = y[s - w:s + w], y[e - w:e + w]
    return float(np.sum((a - b) ** 2) / (np.sum(a * a) + np.sum(b * b) + 1e-12))


def almost_periods(freqs: np.ndarray, weights: np.ndarray, lo_s: float, hi_s: float,
                   keep: int = 6) -> list[int]:
    """Loop lengths (samples) after which every strong partial comes back
    close to its own phase. A locked sustain here is a stretched tone, its
    partials at r_n * F rather than n * F, so whole periods of partial 1 leave
    the upper partials out of phase at the seam and the crossfade cancels
    them (a level dip: a pump). The mismatch is weighted by each partial's
    power: sum w (1 - cos 2 pi f L) / sum w."""
    L = np.arange(int(lo_s * SR), int(hi_s * SR))
    w = weights / weights.sum()
    mis = np.zeros(len(L))
    for f, wt in zip(freqs, w):
        mis += wt * (1.0 - np.cos(2 * np.pi * f * L / SR))
    out = []
    for i in np.argsort(mis):
        if all(abs(L[i] - j) > int(0.01 * SR) for j in out):
            out.append(int(L[i]))
        if len(out) == keep:
            break
    return out


def find_loops(y: np.ndarray, f1: float, start_min: int, length_s: float = 2.0,
               partials: tuple[np.ndarray, np.ndarray] | None = None, keep: int = 8) -> list[dict]:
    """Candidate loops in the half second after start_min (the heal), best
    first. Two families of length: whole periods of partial 1, and (when the
    partials are known) almost-periods of the whole stretched tone. Each seam
    is scored as loop_sustain.py scores one: waveform likeness over ~4
    periods each side, plus the level gap 80 ms around it. The caller tries
    them in order through a held-note check, as loop_sustain.py does."""
    period = SR / f1
    w = max(int(4 * period), int(0.008 * SR))
    m = int(0.08 * SR)
    pad = max(w, m)
    c2 = np.concatenate(([0.0], np.cumsum(y * y)))
    lvl = lambda i: 10 * np.log10((c2[i + m] - c2[i - m]) / (2 * m) + 1e-18)
    k0 = round(length_s * f1)
    lengths = {int(round(k * period)): "periods" for k in range(max(8, k0 - 12), k0 + 13)}
    if partials is not None:
        lengths.update({L: "almost-period" for L in almost_periods(*partials, 0.6 * length_s, 1.5 * length_s)})
    cands = []
    s0 = max(start_min, pad + int(XFADE * SR) + 1)
    for s in range(s0, s0 + int(0.5 * SR), int(0.005 * SR)):
        for L, kind in lengths.items():
            for e in (s + L - 1, s + L, s + L + 1):
                if e + pad < len(y):
                    cands.append((seam_cost(y, s, e, w) + 0.05 * abs(lvl(e) - lvl(s)), s, e, kind))
    if not cands:
        raise ValueError("the render is too short for a loop after the heal")
    picked = []
    for cost, s, e, kind in sorted(cands):
        if all(abs((e - s) - (q[2] - q[1])) > int(0.005 * SR) or abs(s - q[1]) > int(0.05 * SR) for q in picked):
            picked.append((cost, s, e, kind))
        if len(picked) == keep:
            break
    return [{"loop_start": s, "loop_end": e - 1, "loop_sec": round((e - s) / SR, 3),
             "periods": round((e - s) / period, 2), "length_from": kind,
             "seam_cost": round(cost, 4)} for cost, s, e, kind in picked]


def hold_looped(y: np.ndarray, s: int, e_incl: int, secs: float) -> tuple[np.ndarray, list[int]]:
    """The sample held at its own key for secs, wrapping at the loop."""
    e = e_incl + 1
    pos = np.arange(int(secs * SR))
    lap = np.floor((pos - s) / (e - s)).astype(int)
    past = pos >= e
    idx = np.where(past, s + np.mod(pos - s, e - s), pos)
    wraps = [int(i) for i in np.flatnonzero(np.diff(lap) > 0) + 1 if past[i]]
    return y[idx], wraps


def bake_crossfade(y: np.ndarray, s: int, e_incl: int) -> np.ndarray:
    """After this, sample e_incl is followed (on the wrap) by s exactly as s-1 is."""
    e = e_incl + 1
    n = min(int(XFADE * SR), s, (e - s) // 3)
    out = y.copy()
    t = np.linspace(0.0, 1.0, n, endpoint=False)
    a, b = y[e - n:e], y[s - n:s]
    rho = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-12))
    ga, gb = np.cos(0.5 * math.pi * t), np.sin(0.5 * math.pi * t)
    norm = np.sqrt(ga * ga + gb * gb + 2 * rho * ga * gb)     # hold power through the blend
    out[e - n:e] = (a * ga + b * gb) / np.maximum(norm, 0.5)
    return out


# ---------------------------------------------------------------- WAV

def write_wav_smpl(path: Path, y: np.ndarray, unity: int, s: int, e_incl: int) -> None:
    pcm = np.clip(np.round(y * 32767.0), -32768, 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    smpl = struct.pack("<9I", 0, 0, int(round(1e9 / SR)), unity, 0, 0, 0, 1, 0)
    smpl += struct.pack("<6I", 0, 0, s, e_incl, 0, 0)       # forward loop, forever
    raw = bytearray(path.read_bytes())
    raw += b"smpl" + struct.pack("<I", len(smpl)) + smpl
    raw[4:8] = struct.pack("<I", len(raw) - 8)
    path.write_bytes(bytes(raw))


def write_wav(path: Path, y: np.ndarray) -> None:
    pcm = np.clip(np.round(y * 32767.0), -32768, 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as w:
        assert w.getframerate() == SR and w.getsampwidth() == 2 and w.getnchannels() == 1
        return np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(float) / 32767.0


def read_smpl(path: Path) -> tuple[int, int] | None:
    raw = path.read_bytes()
    i = raw.find(b"smpl")
    if i < 0:
        return None
    return struct.unpack("<2I", raw[i + 8 + 36 + 8:i + 8 + 36 + 16])


# ---------------------------------------------------------------- SFZ

def write_sfz(path: Path, head: list[str], glob: dict, groups: list[tuple[str, dict, list[dict]]]) -> None:
    """groups: (comment, group opcodes, regions). Regions carry sample, lokey,
    hikey, pitch_keycenter, tune, loop_start, loop_end."""
    lines = [f"// {h}" for h in head] + ["", "<control>", "default_path=samples/", "", "<global>"]
    lines += [" ".join(f"{k}={v}" for k, v in glob.items())]
    for comment, gops, regions in groups:
        lines += ["", f"// {comment}", "<group> " + " ".join(f"{k}={v}" for k, v in gops.items())]
        for r in regions:
            lines.append(f"<region> sample={r['sample']} lokey={r['lokey']} hikey={r['hikey']} "
                         f"pitch_keycenter={r['pitch_keycenter']} tune={r['tune']} "
                         f"loop_start={r['loop_start']} loop_end={r['loop_end']}")
    path.write_text("\n".join(lines) + "\n")


def parse_sfz(path: Path) -> tuple[dict, list[dict]]:
    """Global opcodes, and every region with its group's opcodes folded in."""
    glob, group, regions, where = {}, {}, [], None
    for line in path.read_text().splitlines():
        line = line.split("//")[0].strip()
        if not line:
            continue
        m = re.match(r"<(\w+)>\s*(.*)", line)
        if m:
            where, line = m.group(1), m.group(2)
            if where == "group":
                group = {}
            if where == "region":
                regions.append(dict(group))
        ops = dict(tok.split("=", 1) for tok in line.split())
        {"global": glob, "group": group, "region": regions[-1] if regions else {}}.get(where, {}).update(ops)
    ints = ("lokey", "hikey", "pitch_keycenter", "tune", "loop_start", "loop_end", "lovel", "hivel")
    for r in regions:
        for k in ints:
            if k in r:
                r[k] = int(r[k])
    return glob, regions


# ---------------------------------------------------------------- DecentSampler

def knob(tab, x, label, lo, hi, value, parameter):
    k = ET.SubElement(tab, "labeled-knob", x=str(x), y="40", width="90",
                      height="90", textSize="14", label=label, type="float",
                      minValue=str(lo), maxValue=str(hi), value=f"{value:g}",
                      textColor=INK, trackForegroundColor=ACCENT,
                      trackBackgroundColor=RULE)
    ET.SubElement(k, "binding", type="amp", level="instrument",
                  position="0", parameter=parameter)


def write_dspreset(path: Path, title: str, subtitle: str, glob: dict,
                   groups: list[tuple[str, dict, list[dict]]]) -> None:
    """The same map as the SFZ: one <group> per velocity layer. SFZ tune is
    cents; DecentSampler tuning is semitones (tune/100). amp_veltrack (percent)
    becomes ampVelTrack (0..1)."""
    attack, release = float(glob["ampeg_attack"]), float(glob["ampeg_release"])
    root = ET.Element("DecentSampler", minVersion="1.0.0")
    root.append(ET.Comment(f" written by build.py beside {path.with_suffix('.sfz').name}; same map "))
    root.append(ET.Comment(" SFZ tune (cents) written as tuning (semitones) = tune/100 "))
    ui = ET.SubElement(root, "ui", width="812", height="200", bgColor=BG)
    tab = ET.SubElement(ui, "tab", name="main")
    ET.SubElement(tab, "label", x="20", y="6", width="772", height="24", text=title,
                  textColor=ACCENT, textSize="18")
    ET.SubElement(tab, "label", x="20", y="150", width="772", height="40", text=subtitle,
                  textColor=INK, textSize="12")
    knob(tab, 20, "Attack", 0, 2, attack, "ENV_ATTACK")
    knob(tab, 130, "Release", 0, 8, release, "ENV_RELEASE")
    knob(tab, 240, "Volume", 0, 1, 0.8, "AMP_VOLUME")
    gs = ET.SubElement(root, "groups", attack=f"{attack:g}", decay="0", sustain="1",
                       release=f"{release:g}", volume="0.8")
    vt = int(glob.get("amp_veltrack", 100)) / 100
    for comment, gops, regions in groups:
        g = ET.SubElement(gs, "group", ampVelTrack=f"{vt:g}")
        g.append(ET.Comment(f" {comment} "))
        for r in regions:
            ET.SubElement(g, "sample", path=f"Samples/{r['sample']}",
                          rootNote=str(r["pitch_keycenter"]), loNote=str(r["lokey"]),
                          hiNote=str(r["hikey"]), loVel=str(gops["lovel"]),
                          hiVel=str(gops["hivel"]), tuning=f"{r['tune'] / 100:g}",
                          loopEnabled="true", loopStart=str(r["loop_start"]),
                          loopEnd=str(r["loop_end"]), loopCrossfade="0")
    ET.indent(root)
    path.write_text(ET.tostring(root, encoding="unicode") + "\n")


def parse_dspreset(path: Path) -> list[dict]:
    out = []
    for g in ET.parse(path).getroot().iter("group"):
        for s in g.iter("sample"):
            out.append({"sample": Path(s.get("path")).name, "lokey": int(s.get("loNote")),
                        "hikey": int(s.get("hiNote")), "pitch_keycenter": int(s.get("rootNote")),
                        "tune": round(float(s.get("tuning")) * 100),
                        "lovel": int(s.get("loVel")), "hivel": int(s.get("hiVel")),
                        "loop_start": int(s.get("loopStart")), "loop_end": int(s.get("loopEnd"))})
    return out


def pack_dslibrary(preset: Path, samples: list[str]) -> Path:
    lib = preset.with_suffix(".dslibrary")
    with zipfile.ZipFile(lib, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(preset, preset.name)
        for name in samples:
            z.write(preset.parent / "samples" / name, f"Samples/{name}")
    return lib


# ---------------------------------------------------------------- playing it back

def region_for(regions: list[dict], key: int, vel: int) -> dict:
    for r in regions:
        if r["lokey"] <= key <= r["hikey"] and int(r.get("lovel", 1)) <= vel <= int(r.get("hivel", 127)):
            return r
    raise KeyError((key, vel))


def play(folder: Path, glob: dict, regions: list[dict], key: int, vel: int, hold: float,
         cache: dict | None = None) -> tuple[np.ndarray, list[int]]:
    """One key held for `hold` seconds then released, through the SFZ: the
    sample resampled by (key - keycenter)*100 + tune cents, wrapping past
    loop_end to loop_start (loop_continuous: it keeps looping through the
    release), the amp envelope's attack and release, and amp_veltrack.
    Returns the audio and the output indices where the loop wrapped."""
    r = region_for(regions, key, vel)
    cache = {} if cache is None else cache
    if r["sample"] not in cache:
        cache[r["sample"]] = read_wav(folder / "samples" / r["sample"])
    y = cache[r["sample"]]
    rel = float(glob["ampeg_release"])
    att = float(glob["ampeg_attack"])
    step = 2.0 ** (((key - r["pitch_keycenter"]) * 100 + r["tune"]) / 1200.0)
    n = int((hold + rel) * SR)
    pos = step * np.arange(n)
    s, e = r["loop_start"], r["loop_end"] + 1
    lap = np.floor((pos - s) / (e - s)).astype(int)
    past = pos >= e
    pos = np.where(past, s + np.mod(pos - s, e - s), pos)
    out = np.interp(pos, np.arange(len(y)), y)
    wraps = [int(i) for i in np.flatnonzero(np.diff(lap) > 0) + 1 if past[i]]
    env = np.ones(n)
    a = max(1, int(att * SR))
    env[:a] = np.linspace(0, 1, a)
    h = int(hold * SR)
    env[h:] = np.exp(-np.arange(n - h) / (rel * SR / 6.9))        # -60 dB at the release time
    vt = float(glob.get("amp_veltrack", 100)) / 100
    gain = (1 - vt) + vt * (vel / 127) ** 2      # sfizz's reading: the square-law curve, mixed in by veltrack
    return out * env * gain, wraps


# ---------------------------------------------------------------- checks

def hf_db(x: np.ndarray) -> float:
    d = np.diff(x)
    return 10 * math.log10(float(np.mean(d * d)) + 1e-15)


def seam_check(out: np.ndarray, wraps: list[int]) -> dict:
    """loop_sustain.py's two ear-proxies on a held note: (a) click, the
    high-passed energy in the 5 ms around each wrap against the median of the
    held body; (b) level step, how much more the 20 ms level moves in the
    200 ms around a wrap than it moves anywhere else."""
    h = int(0.0025 * SR)
    wraps = [i for i in wraps if h < i < len(out) - int(0.1 * SR)]    # only wraps inside the held stretch
    body = out[int(1.0 * SR):]
    blocks = [hf_db(body[i:i + 2 * h]) for i in range(0, len(body) - 2 * h, 2 * h)]
    med = float(np.median(blocks))
    clicks = [hf_db(out[i - h:i + h]) - med for i in wraps if i > h]
    hop, win = int(0.005 * SR), int(0.02 * SR)
    c2 = np.concatenate(([0.0], np.cumsum(out * out)))
    idx = np.arange(0, len(out) - win, hop)
    env = 10 * np.log10((c2[idx + win] - c2[idx]) / win + 1e-12)
    span = int(0.1 * SR) // hop
    spread = lambda j: float(np.ptp(env[max(0, j - span):j + span]))
    far = [j for j in range(int(1.0 * SR) // hop, len(env) - span, span)
           if all(abs(j * hop - i) > 0.15 * SR for i in wraps)]
    base = float(np.percentile([spread(j) for j in far], 90)) if far else 0.0
    steps = [spread(i // hop) - base for i in wraps]
    click, step = max(clicks, default=0.0), max(steps, default=0.0)
    return {"wraps": len(wraps), "worst_click_db": round(click, 2),
            "worst_level_step_db": round(step, 2),
            "seam_ok": bool(click < CLICK_LIMIT_DB and step < STEP_LIMIT_DB)}


def measure_hz(y: np.ndarray, near_hz: float, search_cents: float = 80.0) -> float:
    """Partial 1 of a held stretch, by a Hann-windowed FFT zero-padded 8x and
    a parabola through the peak's log magnitude: well under a cent on a 2 s
    window, even at C1 (a bare FFT bin there is 27 cents wide)."""
    n = 1 << int(math.ceil(math.log2(len(y) * 8)))
    spec = np.abs(np.fft.rfft(y * np.hanning(len(y)), n))
    f = np.fft.rfftfreq(n, 1 / SR)
    lo, hi = near_hz * 2 ** (-search_cents / 1200), near_hz * 2 ** (search_cents / 1200)
    band = np.flatnonzero((f >= lo) & (f <= hi))
    i = band[np.argmax(spec[band])]
    a, b, c = np.log(spec[i - 1:i + 2] + 1e-18)
    return float(f[i] + 0.5 * (a - c) / (a - 2 * b + c) * (f[1] - f[0]))
