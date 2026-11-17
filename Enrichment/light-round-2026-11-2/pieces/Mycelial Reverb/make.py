"""Mycelial Reverb — one knock, five rooms.

The piece for the page's opening sentence, "the network that grows is the room you hear".
Three makers, in order:
  1. Mycelial Reverb's own engine, plugin/src/Algorithm.h, through rooms.cpp (compiled here, read-only use):
     one colony, seed 21, grown on the piece check's food to 3, 25, 60 and 170 threads, then frosted until
     nothing dies; at each stage a unit impulse (for RT60) and the piece's knock (for the ear).
  2. Sound from Code (this file, numpy): the five knocks laid end to end, dry 0.6 beside the dish at the
     plugin's own wet gain for carry 3 s (Dish::wetGain = 3.5), one gain over the whole, saved and measured.
  3. Drawn SVG (this file): five lanes drawn from the very arrays that were heard, each with its colony.

run (from this folder or anywhere):
  python3 make.py sound     the engine, the mix and the measurements: out/rooms.json, out/*.f32, out/measure.json,
                            one-knock-five-rooms.wav/.m4a (the bench job one-knock-five-rooms)
  python3 make.py picture   the picture, drawn from the saved wav and out/: one-knock-five-rooms.svg/.png
                            (the bench job one-knock-five-rooms-picture)
  python3 make.py           both, in that order: exactly the files to be placed
"""
import json, os, subprocess, tempfile, time, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
OUT = os.path.join(HERE, "out")
SRC = os.path.join(ROOT, "Projects", "Mycelial Reverb", "plugin", "src")
TPL = os.path.join(ROOT, "Projects", "VST Template", "machinery", "src")
NAME = "one-knock-five-rooms"
SR = 48000
ROOM_S = 4.0          # each room gets 4 s, knock at its start
LEAD_S = 0.25
DRY, WET = 0.6, 3.5   # the plugin's Dry level default; Dish::wetGain(3) = 3.5 / sqrt(3/3)
PEAK_DBFS = -1.0      # one gain over the whole file so its loudest sample sits here
SHOW = [0, 1, 2, 3, 5]
PLOT_S = 3.0          # the picture's time axis; every room is below -60 dB of the file's loudest moment by 2.2 s

PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def engine():
    os.makedirs(OUT, exist_ok=True)
    exe = os.path.join(OUT, "rooms")
    subprocess.run(["clang++", "-std=c++20", "-O2", "-ffp-contract=off", "-Wall", "-Wextra", "-I", SRC, "-I", TPL,
                    os.path.join(HERE, "rooms.cpp"), "-o", exe], check=True)
    with open(os.path.join(OUT, "rooms.json"), "w") as f:
        subprocess.run([exe, OUT], check=True, stdout=f)
    return json.load(open(os.path.join(OUT, "rooms.json")))


f32 = lambda n: np.fromfile(os.path.join(OUT, n), np.float32).astype(np.float64)


def rt60(L, R):
    """The piece check's rt60(): Schroeder's backward sum, a line from -5 to -35 dB, doubled."""
    e = np.cumsum((L * L + R * R)[::-1])[::-1]
    db = 10 * np.log10(e / e[0] + 1e-30)
    if db.min() > -35: return float("nan")
    return 2 * (int(np.argmax(db <= -35)) - int(np.argmax(db <= -5))) / SR


def mix(data):
    n_room = int(ROOM_S * SR); lead = int(LEAD_S * SR)
    out = np.zeros((2, lead + n_room * len(SHOW)))
    knock = f32("knock.f32")
    starts = []
    for i, k in enumerate(SHOW):
        o = lead + i * n_room; starts.append(o / SR)
        out[0, o:o + n_room] += WET * f32(f"knock_{k}_L.f32")[:n_room]
        out[1, o:o + n_room] += WET * f32(f"knock_{k}_R.f32")[:n_room]
        out[:, o:o + len(knock)] += DRY * knock
    raw_peak = float(np.abs(out).max())
    gain = 10 ** (PEAK_DBFS / 20) / raw_peak
    out *= gain
    fade = int(0.05 * SR); out[:, -fade:] *= np.linspace(1, 0, fade)
    return out, starts, raw_peak, gain


def save_wav(x, path):
    pcm = np.clip(np.round(x.T * 32767), -32768, 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def measure(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True)
    txt = r.stderr[r.stderr.rfind("Summary:"):]
    get = lambda key: float(txt.split(key)[1].split()[0])
    return {"integrated_lufs": get("I:"), "true_peak_dbfs": get("Peak:")}


# ── the picture ──────────────────────────────────────────────────────────────
def t(x, y, s, size=26, fill=INK, anchor="start", weight=400, extra=""):
    s = str(s).replace("&", "&amp;").replace("<", "&lt;")
    return f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" {extra}>{s}</text>'


def colony(st, x0, y0, w):
    sc = w / 1000.0; h = 600 * sc; nodes = st["nodes"]; parts = [f'<rect x="{x0}" y="{y0}" width="{w}" height="{h:.1f}" fill="{FILL}" rx="6"/>']
    P = lambda n: (x0 + nodes[str(n)][0] * sc, y0 + nodes[str(n)][1] * sc)
    for a, b, yy, L in st["segs"]:
        (ax, ay), (bx, by) = P(a), P(b)
        parts.append(f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="{INK2}" stroke-width="{0.9 + 0.7 * (yy - 1):.2f}" stroke-linecap="round"/>')
    for n in st["fruit_nodes"]:
        x, y = P(n); parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="6" fill="{RED}"/>')
    x, y = P(st["in"]); parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="8" fill="none" stroke="{RED}" stroke-width="2.5"/>')
    return "".join(parts), h


def inset(st, cx, cy, zoom, sc):
    """The newborn dish drawn larger, so its one junction and three threads can be seen."""
    nodes = st["nodes"]; sx, sy = nodes[str(st["in"])][0], nodes[str(st["in"])][1]
    P = lambda n: (cx + (nodes[str(n)][0] - sx) * sc * zoom, cy + (nodes[str(n)][1] - sy) * sc * zoom)
    parts = [f'<circle cx="{cx}" cy="{cy}" r="{30 * sc * zoom:.1f}" fill="{PAPER}" stroke="{RULE}" stroke-width="1.5"/>']
    for a, b, yy, L in st["segs"]:
        (ax, ay), (bx, by) = P(a), P(b)
        parts.append(f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="{INK2}" stroke-width="{2.5 + 1.5 * (yy - 1):.2f}" stroke-linecap="round"/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="9" fill="none" stroke="{RED}" stroke-width="3"/>')
    parts.append(t(cx + 30 * sc * zoom - 4, cy + 30 * sc * zoom, f"×{zoom}", 22, INK3, "end"))
    return "".join(parts)


def decay_db(k):
    """The click's energy still to come (Schroeder's backward sum), dB of its own start: what RT60 is read from."""
    L, R = f32(f"ir_{k}_L.f32"), f32(f"ir_{k}_R.f32")
    e = np.cumsum((L * L + R * R)[::-1])[::-1]
    return 10 * np.log10(e / e[0] + 1e-30)


def picture(data, heard, starts, rts):
    W, top, lane, gap = 1840, 190, 236, 0
    H = top + lane * len(SHOW) + 170
    px0, px1 = 470, 1440           # the time axis, 0 to ROOM_S seconds after the knock
    X = lambda s: px0 + (px1 - px0) * s / PLOT_S
    win = int(0.01 * SR)
    ref = float(np.abs(heard).max())
    g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" {FONT}>',
         f'<rect width="{W}" height="{H}" fill="{PAPER}"/>',
         t(60, 74, "MYCELIAL REVERB · ONE KNOCK, FIVE ROOMS", 26, INK3, weight=600, extra='letter-spacing="5"'),
         t(60, 128, "The same knock, fed to one colony as it grows.", 38, INK, weight=600),
         t(px0, top - 18, "dB", 24, INK3),
         t(1470, top - 18, "RT60", 24, INK3)]
    for i, k in enumerate(SHOW):
        st = data["stages"][k]; y0 = top + i * lane
        g.append(f'<line x1="60" y1="{y0:.1f}" x2="{W - 60}" y2="{y0:.1f}" stroke="{RULE}" stroke-width="1.5"/>')
        art, ch = colony(st, 60, y0 + 18, 340)
        g.append(art)
        if k == 0: g.append(inset(st, 60 + 268, y0 + 18 + 102, 7, 340 / 1000))
        # the heard lane, in dB from -60 to 0 of the file's loudest sample
        o = int(starts[i] * SR); seg = np.abs(heard[:, o:o + int(PLOT_S * SR)]).max(axis=0)
        nwin = len(seg) // win; env = seg[:nwin * win].reshape(nwin, win).max(axis=1)
        db = np.clip(20 * np.log10(env / ref + 1e-12), -60, 0)
        yb, yt = y0 + lane - 40, y0 + 30
        Y = lambda d: yb + (yt - yb) * (d + 60) / 60
        for d in (0, -20, -40, -60):
            g.append(f'<line x1="{px0}" y1="{Y(d):.1f}" x2="{px1}" y2="{Y(d):.1f}" stroke="{RULE}" stroke-width="1" stroke-dasharray="{"none" if d == -60 else "4 6"}"/>')
            g.append(t(px0 - 12, Y(d) + 8, f"{d}", 22, INK3, "end"))
        pts = " ".join(f"{X(j * win / SR):.1f},{Y(v):.1f}" for j, v in enumerate(db))
        g.append(f'<polygon points="{X(0):.1f},{Y(-60):.1f} {pts} {X(nwin * win / SR):.1f},{Y(-60):.1f}" fill="{INK2}" fill-opacity="0.85"/>')
        # the two zeros, named in every lane, so the gap between red and grey is not read as a finding
        g.append(f'<rect x="{px1 - 470}" y="{yt + 10:.1f}" width="470" height="56" fill="{PAPER}"/>')
        g.append(t(px1, yt + 33, "red 0 dB: the click's own start", 21, RED, "end"))
        g.append(t(px1, yt + 59, "grey 0 dB: the file's loudest moment", 21, INK3, "end"))
        rt = rts[k]
        dd = decay_db(k)[:int(PLOT_S * SR)][::win]
        cut = int(np.argmax(dd <= -60)) if (dd <= -60).any() else len(dd)
        line = " ".join(f"{X(j * win / SR):.1f},{Y(v):.1f}" for j, v in enumerate(dd[:cut + 1]))
        g.append(f'<polyline points="{line}" fill="none" stroke="{RED}" stroke-width="3.5"/>')
        g.append(f'<line x1="{X(rt):.1f}" y1="{Y(-60) - 16:.1f}" x2="{X(rt):.1f}" y2="{Y(-60) + 16:.1f}" stroke="{RED}" stroke-width="4"/>')
        pl = lambda n, w: f"{n} {w}" + ("" if n == 1 else "s")
        g.append(t(1470, y0 + 88, f"{rt:.2f} s", 50, RED, weight=600))
        g.append(t(1470, y0 + 134, ("after %d frosts" % data["frost_count"]) if k == 5 else ("newborn" if k == 0 else f"fed {st['fed_s']:.0f} s"), 26, INK2, weight=600))
        g.append(t(1470, y0 + 168, f"{pl(st['threads'], 'thread')} · {pl(st['loops'], 'loop')}", 24, INK3))
        g.append(t(1470, y0 + 198, pl(st['dead_ends'], 'dead end'), 24, INK3))
    yax = top + lane * len(SHOW)
    g.append(f'<line x1="60" y1="{yax}" x2="{W - 60}" y2="{yax}" stroke="{RULE}" stroke-width="1.5"/>')
    for s in range(int(PLOT_S) + 1):
        g.append(t(X(s), yax + 34, f"{s} s", 22, INK3, "middle"))
    g.append(t(px0, yax + 76, "grey: the knock as heard, below the file's loudest moment", 24, INK3))
    g.append(t(px0, yax + 110, "red: a click through the same dish, falling from its own start;", 24, RED))
    g.append(t(px0, yax + 140, "the tick is its RT60, the number on the right", 24, RED))
    g.append(t(60, yax + 76, "ring: way in", 24, RED))
    g.append(t(60, yax + 110, "dots: listening", 24, RED))
    g.append("</svg>")
    return "\n".join(g), W, H


def png(svg_path, png_path, W, H):
    if os.path.exists(png_path): os.remove(png_path)
    with tempfile.TemporaryDirectory() as prof:
        p = subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
                              "--disable-component-update", "--disable-background-networking", f"--user-data-dir={prof}",
                              f"--window-size={W},{H}", "--force-device-scale-factor=1", f"--screenshot={png_path}",
                              "file://" + svg_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        size, end = -1, time.time() + 90
        while time.time() < end and p.poll() is None:
            time.sleep(0.5); now = os.path.getsize(png_path) if os.path.exists(png_path) else -1
            if now > 0 and now == size: break
            size = now
        p.terminate(); p.wait(10)


def picture_only():
    """Redraw the picture from the saved sound and the engine's saved arrays, without rendering anything."""
    data = json.load(open(os.path.join(OUT, "rooms.json")))
    data["frost_count"] = int(data["stages"][5]["name"].split()[1])
    meas = json.load(open(os.path.join(OUT, "measure.json")))
    rts = [st["rt60_s"] for st in meas["stages"]]
    back = np.frombuffer(wave.open(os.path.join(HERE, NAME + ".wav")).readframes(10 ** 9), "<i2").reshape(-1, 2).T / 32768.0
    svg, W, H = picture(data, back, meas["room_starts_s"], rts)
    sp = os.path.join(HERE, NAME + ".svg"); open(sp, "w").write(svg)
    png(sp, os.path.join(HERE, NAME + ".png"), W, H)
    print("picture redrawn from", NAME + ".wav", "and out/")


def main():
    """The sound: engine, mix, files, measurements. The picture is drawn separately, from the saved wav."""
    data = engine()
    data["frost_count"] = int(data["stages"][5]["name"].split()[1])
    rts = [rt60(f32(f"ir_{k}_L.f32"), f32(f"ir_{k}_R.f32")) for k in range(len(data["stages"]))]
    heard, starts, raw_peak, gain = mix(data)
    wav = os.path.join(HERE, NAME + ".wav"); m4a = os.path.join(HERE, NAME + ".m4a")
    save_wav(heard, wav)
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", wav, "-c:a", "aac", "-b:a", "192k", m4a], check=True)
    back = np.frombuffer(wave.open(wav).readframes(10 ** 9), "<i2").reshape(-1, 2).T / 32768.0
    meas = {"seed": data["seed"], "knock_seed": data["knock_seed"], "length_s": back.shape[1] / SR,
            "sample_peak_dbfs": 20 * np.log10(np.abs(back).max()), "gain_db": 20 * np.log10(gain), "raw_peak": raw_peak,
            "room_starts_s": starts, **measure(wav), "m4a": measure(m4a), "stages": []}
    for k, st in enumerate(data["stages"]):
        row = {kk: st[kk] for kk in ("name", "threads", "loops", "dead_ends", "fruit", "fed_s", "frost_killed")}
        row["rt60_s"] = rts[k]; row["heard"] = k in SHOW
        if k in SHOW:
            i = SHOW.index(k); o = int(starts[i] * SR); seg = back[:, o:o + int(ROOM_S * SR)]
            row["room_peak_dbfs"] = 20 * np.log10(np.abs(seg).max())
            tail = seg[:, int(0.1 * SR):]; row["tail_rms_after_100ms_dbfs"] = 10 * np.log10(np.mean(tail ** 2) + 1e-20)
            row["left_right_rms_db"] = 10 * np.log10(np.mean(seg[0] ** 2) / np.mean(seg[1] ** 2))
        meas["stages"].append(row)
    json.dump(meas, open(os.path.join(OUT, "measure.json"), "w"), indent=1)
    for r in meas["stages"]: print(r)
    print({k: v for k, v in meas.items() if k != "stages"})


if __name__ == "__main__":
    import sys
    mode = sys.argv[1] if len(sys.argv) > 1 else "both"
    if mode in ("sound", "both"): main()
    if mode in ("picture", "both"): picture_only()
