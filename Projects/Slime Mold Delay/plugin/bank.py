"""bank.py — a small bank of dishes, fed real recordings, played through the plugin itself.

Every test path so far feeds the dish synthetic plucks. This feeds it three recordings
already in the palace (a drum loop, a speaking voice, a piano), on the three dishes, and
keeps what the lesson needs to stand on: the sound, and a picture of the roads the mold
grew for it at four moments.

Each render runs the harness's 'plugin' mode, the same processor Live runs, so the bank
is the plugin's sound, not a sketch of it. The roads are read back from the probes the
plugin streams to its screen (four tube slots every 128 samples), so the picture is the
dish the plugin actually grew.

    python3 bank.py      -> bank/<name>.wav, bank/roads.png, bank/report.json
"""
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

PLUG = Path(__file__).resolve().parent
PALACE = PLUG.parents[2]
sys.path.insert(0, str(PLUG / "reference"))
import sketch                                    # noqa: E402

SR, SECS = 44100, 16.0
HARNESS = PLUG / "build/SlimeMoldDelayHarness_artefacts/Release/SlimeMoldDelayHarness"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT = PLUG / "bank"
MOMENTS = [3.0, 7.0, 11.0, 15.9]
DEFAULTS = dict(feed=1.0, flow=0.9, clock=1.0, budget=2.4, dish=0, cover=0, regen=1.0, dry=0.3, wet=1.0)

SOURCES = dict(
    drums="Projects/Quantum Synthesizer/proofs/drum.wav",
    voice="Shop/Maker/coordination-demos/2026-05-30-narrated-beats/narration.wav",
    piano="Projects/Inharmonic Wavetable Synthesis/trajectory-library/01-real-piano-two-walls.wav",
)

BANK = [
    dict(name="drums-five", src="drums", values={},
         says="the drum loop on the Five flakes dish, knobs at their defaults"),
    dict(name="voice-five", src="voice", values={},
         says="a speaking voice on the Five flakes dish: speech feeds the middle flakes in bursts"),
    dict(name="piano-ring", src="piano", values={"dish": 1, "regen": 1.4},
         says="the piano on the Ring dish with Regen high, so the roads ring"),
    dict(name="drums-scatter-starving", src="drums", values={"dish": 2, "clock": 2.0,
         "feed": lambda t: 1.0 - 0.8 * np.clip((t - 6.0) / 6.0, 0, 1)},
         says="the drums on the Scatter dish, Clock 2x, Feed sinking from eating to starving after 6 s"),
]


def load(rel, steps):
    """The recording as 44.1 kHz mono, looped to fill the render."""
    with tempfile.TemporaryDirectory() as tmp:
        dst = Path(tmp) / "x.wav"
        subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@44100", "-c", "1", str(PALACE / rel), str(dst)],
                       check=True, capture_output=True)
        with wave.open(str(dst)) as w:
            x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float64) / 32768.0
    x = np.tile(x, steps // len(x) + 1)[:steps]
    return x * (0.5 / (np.abs(x).max() + 1e-9))


def render(entry):
    steps = int(SR * SECS)
    t = np.arange(steps) / SR
    x = load(SOURCES[entry["src"]], steps)
    inputs = np.vstack([x, x]).astype(np.float32)
    vals = {p: np.full(steps, float(d)) for p, d in DEFAULTS.items()}
    for p, v in entry["values"].items():
        vals[p] = v(t) if callable(v) else np.full(steps, float(v))
    rows = np.vstack([vals[p] for p in sketch.PARAM_IDS]).astype(np.float64)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        rows.tofile(tmp / "paths.f64")
        inputs.tofile(tmp / "in.f32")
        subprocess.run([str(HARNESS), "plugin", str(steps), str(SR), str(tmp / "paths.f64"), str(tmp / "out.bin"),
                        str(tmp / "in.f32")], check=True, capture_output=True)
        raw = (tmp / "out.bin").read_bytes()
    out = np.frombuffer(raw[:4 * 2 * steps], dtype=np.float32).reshape(2, steps)
    probes = np.frombuffer(raw[4 * 2 * steps:], dtype=np.float64).reshape(len(sketch.PROBES), steps)
    return x, vals, out, probes


def roads(probes, sec):
    """Every live tube at a moment: the latest frame of each probe group in the last 0.25 s."""
    P = {n: probes[i] for i, n in enumerate(sketch.PROBES)}
    end = int(sec * SR)
    start = max(0, end - (sketch.NGROUPS + 2) * 128)
    seen, tubes = set(), []
    for i in range(end - 1, start - 1, -128):
        g = int(P["group"][i])
        if g in seen:
            continue
        seen.add(g)
        for j in range(sketch.GROUP):
            d = P[f"g{j}d"][i]
            if d >= 0:
                tubes.append((P[f"g{j}ax"][i], P[f"g{j}ay"][i], P[f"g{j}bx"][i], P[f"g{j}by"][i], d, abs(P[f"g{j}q"][i])))
    lv = [float(P[f"lv{k}"][max(0, end - 2048):end].mean()) for k in range(sketch.NBANDS)]
    return tubes, lv, int(P["tubes"][end - 1]), float(P["used"][end - 1])


def flakes(layout):
    d = sketch.Dish(SR)
    d.clear(layout, 0)
    return [(d.nx[n], d.ny[n], d.band[n]) for n in range(sketch.NMAX) if d.alive[n] and d.kind[n] == sketch.FOOD]


def dish_svg(x0, y0, size, tubes, lv, food, label):
    s = size
    px = lambda v: x0 + v * s
    py = lambda v: y0 + v * s
    g = [f'<circle cx="{px(.5)}" cy="{py(.5)}" r="{s * .49}" fill="#14110b" stroke="#3a3220" stroke-width="2"/>']
    dmax = max([t[4] for t in tubes] + [1e-6])
    for ax, ay, bx, by, d, q in sorted(tubes, key=lambda t: t[4]):
        w = 0.6 + 5.0 * (d / dmax) ** 0.8
        a = 0.25 + 0.75 * min(1.0, d / dmax * 1.5)
        g.append(f'<line x1="{px(ax):.1f}" y1="{py(ay):.1f}" x2="{px(bx):.1f}" y2="{py(by):.1f}" '
                 f'stroke="#f2c230" stroke-opacity="{a:.2f}" stroke-width="{w:.2f}" stroke-linecap="round"/>')
    lmax = max(lv + [1e-6])
    for fx, fy, b in food:
        r = 4 + 8 * (lv[b] / lmax) ** 0.5
        g.append(f'<circle cx="{px(fx):.1f}" cy="{py(fy):.1f}" r="{r:.1f}" fill="#fff3c4" stroke="#c99a1a"/>')
        g.append(f'<text x="{px(fx) + 10:.1f}" y="{py(fy) + 4:.1f}" fill="#9a8a5a" font-size="10">{int(sketch.BAND_HZ[b])}</text>')
    g.append(f'<circle cx="{px(sketch.SINK_X)}" cy="{py(sketch.SINK_Y)}" r="6" fill="#d23a2a"/>')
    g.append(f'<text x="{x0 + 6}" y="{y0 + s + 14}" fill="#cfe" font-size="11">{label}</text>')
    return "\n".join(g)


def contact_sheet(rows):
    size, gap, lab = 220, 18, 230
    W = lab + len(MOMENTS) * (size + gap)
    H = len(rows) * (size + 36) + 40
    body = [f'<rect width="{W}" height="{H}" fill="#050606"/>',
            f'<text x="12" y="24" fill="#d8c79c" font-size="14">Slime Mold Delay — the roads each recording grew (the plugin\'s own processor)</text>']
    for r, (entry, shots, food) in enumerate(rows):
        y = 40 + r * (size + 36)
        body.append(f'<text x="12" y="{y + 20}" fill="#7cffb2" font-size="13">{entry["name"]}</text>')
        words, line, ly = entry["says"].split(), "", y + 40
        for wd in words:
            if len(line) + len(wd) > 30:
                body.append(f'<text x="12" y="{ly}" fill="#9fb" font-size="11">{line}</text>'); line, ly = "", ly + 15
            line += wd + " "
        body.append(f'<text x="12" y="{ly}" fill="#9fb" font-size="11">{line}</text>')
        for c, (sec, (tubes, lv, n, used)) in enumerate(zip(MOMENTS, shots)):
            body.append(dish_svg(lab + c * (size + gap), y, size, tubes, lv, food,
                                 f"{sec:g} s · {n} tubes · road {used:.2f}"))
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" font-family="ui-monospace,monospace">' \
          + "\n".join(body) + "</svg>"
    return svg, W, H


def write_wav(path, x):
    y = np.clip(x.T, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype("<i2").tobytes())


def db(x):
    return round(float(20 * np.log10(x + 1e-12)), 1)


def main():
    OUT.mkdir(exist_ok=True)
    rows, report = [], {}
    for entry in BANK:
        x, vals, out, probes = render(entry)
        write_wav(OUT / f"{entry['name']}.wav", out)
        shots = [roads(probes, s) for s in MOMENTS]
        food = flakes(int(vals["dish"][0]))
        rows.append((entry, shots, food))
        P = {n: probes[i] for i, n in enumerate(sketch.PROBES)}
        lvmean = [float(P[f"lv{k}"].mean()) for k in range(sketch.NBANDS)]
        tail = out[:, -SR:]
        report[entry["name"]] = dict(
            says=entry["says"], source=SOURCES[entry["src"]],
            peak_dbfs=db(np.abs(out).max()), rms_dbfs=db(np.sqrt((out ** 2).mean())),
            last_second_rms_dbfs=db(np.sqrt((tail ** 2).mean())),
            band_food_share={f"{int(h)} Hz": round(v / (sum(lvmean) + 1e-12), 2) for h, v in zip(sketch.BAND_HZ, lvmean)},
            tubes_at={f"{s:g}s": sh[2] for s, sh in zip(MOMENTS, shots)},
            road_used_at={f"{s:g}s": round(sh[3], 2) for s, sh in zip(MOMENTS, shots)},
            finite=bool(np.isfinite(out).all()))
        print(entry["name"], json.dumps(report[entry["name"]]))
    (OUT / "report.json").write_text(json.dumps(report, indent=1))
    svg, W, H = contact_sheet(rows)
    (OUT / "roads.svg").write_text(svg)
    html = OUT / "_roads.html"
    html.write_text(f'<html><body style="margin:0;background:#050606">{svg}</body></html>')
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--window-size={W},{H}",
                    f"--screenshot={OUT / 'roads.png'}", f"file://{html}"], check=True, capture_output=True)
    html.unlink()
    print("wrote", OUT / "roads.png")


if __name__ == "__main__":
    main()
