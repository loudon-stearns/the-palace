"""Reference model of the Face — Retrospective Delay, fourth move (JSUI on gen~).

The cat used to watch the knob. Now it watches the instrument. face.genexpr is
the grammar's séance unchanged, plus three outlets, and each one drives one
part of the drawing:

  out3  the knob as you hear it (the 20 ms slewed gain)   -> which pose
  out4  presence: is anything on the tape at the read head -> how much ectoplasm
  out5  holding: is the tape keeping the past right now    -> the candle

So the face can say things the knob can't: the cat asleep with wisps around it
(the past is kept, just not summoned) or the cat reaching into an empty room
(knob up, nothing on the tape).

This script runs the codebox line for line, checks that the séance underneath
is untouched (out2 against grammar_model.py), then paints the cat the way
seance-cat.js does and films it over the séance performance:

  face-film.mp4          the 15-measure performance with the cat reacting, 30 fps
  face-moments.png       six labelled stills from the film, plus the empty room

Needs Pillow. Run with the ComfyUI python:
    ~/ComfyUI-Installs/ComfyUI/standalone-env/bin/python face_model.py
"""
import math
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT / "stage-1" / "witness"))
sys.path.insert(0, str(ROOT / "stage-2-seance"))
sys.path.insert(0, str(ROOT / "stage-3-grammar"))
from witness_model import SR, MEASURE  # noqa: E402
from seance_model import ramp, write_wav  # noqa: E402
from grammar_model import grammar, lag_track, performance_input, TAPE  # noqa: E402

PSCALE = 4.0


def mstosamps(ms):
    return ms * SR / 1000.0


def face(x, gain_param, lag_param, measure=MEASURE, thresh=0.003, pscale=PSCALE):
    """face.genexpr, line for line. Returns out1..out5 as arrays."""
    tape = np.zeros(TAPE)
    env = listen = gs = penv = 0.0
    lagA = lagB = lastlag = float(lag_param[0])
    fade = target = 0.0
    M = min(measure, TAPE)
    rel = math.exp(-1.0 / (SR * 0.1))
    prel = math.exp(-1.0 / (SR * 1.0))
    xstep = 1.0 / mstosamps(30)
    gstep = 1.0 / mstosamps(20)
    lstep = 1.0 / mstosamps(5)
    outs = np.zeros((5, len(x)))
    for n, s in enumerate(x):
        phase = (n % M) / M
        w = int(math.floor(phase * M + 0.5)) % M
        lag = float(lag_param[n])
        if lag != lastlag:
            if target < 0.5:
                lagB, target = lag, 1.0
            else:
                lagA, target = lag, 0.0
            lastlag = lag
        fade = fade + min(max(target - fade, -xstep), xstep)
        # read first
        rA = (w - lagA * M) % M
        rB = (w - lagB * M) % M
        a_, b_ = tape[int(math.floor(rA))], tape[int(math.floor(rB))]
        ghost = a_ + (b_ - a_) * fade
        # then write
        a = abs(s)
        env = a if a > env else env * rel
        want = 1.0 if env > thresh else 0.0
        listen = listen + min(max(want - listen, -lstep), lstep)
        old = tape[w]
        tape[w] = old + listen * (s - old)
        gs = gs + min(max(gain_param[n] - gs, -gstep), gstep)
        out2 = gs * ghost
        # FACE
        g = abs(ghost)
        penv = g if g > penv else penv * prel
        outs[0, n] = s + out2
        outs[1, n] = out2
        outs[2, n] = gs
        outs[3, n] = min(max(penv * pscale, 0.0), 1.0)
        outs[4, n] = 1.0 - listen
    return outs


# ---- the séance performance, with what happens when ---------------------------

GAIN_POINTS = [(0, 0.0), (2.0, 0.0), (3.0, 0.85), (8.0, 0.85), (10.0, 0.0), (11.0, 0.0), (11.5, 0.85)]
LAG_EVENTS = [(0, 0.5), (int(MEASURE * 4.37), 0.25), (int(MEASURE * 12.61), 1.0)]
CAPTIONS = [  # (from measure, caption)
    (0.0, "you play; the knob is down"),
    (2.0, "you stop; the tape holds the phrase"),
    (2.2, "you raise the knob: the summoning"),
    (3.0, "the phrase comes back"),
    (4.37, "re-lag to a quarter note"),
    (6.0, "you play over it; the tape listens again"),
    (7.0, "you stop; the new phrase is kept"),
    (8.0, "you lower the knob: dismissed, not erased"),
    (10.0, "asleep, with the past still on the tape"),
    (11.0, "you raise it again"),
    (11.5, "the same past returns"),
    (12.61, "re-lag to a whole note"),
]


def caption_at(m):
    c = CAPTIONS[0][1]
    for start, text in CAPTIONS:
        if m >= start:
            c = text
    return c


# ---- the cat, painted the way seance-cat.js paints it ---------------------------

PANEL = 360
PLATE_DIR = HERE.parent / "jsui"
PLATES = {k: Image.open(PLATE_DIR / f"pose-{k}.png").convert("RGB").resize((PANEL, PANEL), Image.LANCZOS)
          for k in ("dormant", "awakening", "triumphant")}


def ss(e0, e1, x):
    u = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return u * u * (3 - 2 * u)


def bezier(p0, p1, p2, p3, steps=40):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        mt = 1 - t
        pts.append((mt ** 3 * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t ** 3 * p3[0],
                    mt ** 3 * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t ** 3 * p3[1]))
    return pts


def paint(gain, presence, holding, t):
    """One JSUI frame. Mirrors paint() in seance-cat.js."""
    w = h = PANEL
    wAwa = ss(0.15, 0.40, gain) * (1 - ss(0.60, 0.85, gain))
    wTri = ss(0.60, 0.85, gain)
    img = PLATES["dormant"].copy()
    a = min(1.0, wAwa + wTri)
    if a > 0.005:
        img = Image.blend(img, PLATES["awakening"], a)
    if wTri > 0.005:
        img = Image.blend(img, PLATES["triumphant"], wTri)

    img = img.convert("RGBA")
    veil = 0.55 * (1 - gain)
    if veil > 0.01:
        img = Image.blend(img, Image.new("RGBA", (w, h), (15, 13, 20, 255)), veil)

    # ectoplasm: how much ghost is on the tape. Pale, and drawn OVER the veil, so it
    # still shows while the cat sleeps: the past is kept even when nobody summons it.
    ecto = presence * (0.35 + 0.65 * max(wAwa, wTri))
    if ecto > 0.01:
        over = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(over)
        cx, cy = w * 0.5, h * 0.55
        for i in range(5):
            ph = t + i * 1.2566
            r = w * (0.16 + 0.035 * i)
            p0 = (cx + math.cos(ph) * r, cy + math.sin(ph) * r * 0.6)
            p3 = (cx + math.cos(ph + 1.2) * r * 1.3, cy + math.sin(ph + 1.2) * r * 0.6)
            pts = bezier(p0, (cx, cy - h * 0.15), (cx + w * 0.10, cy - h * 0.05), p3)
            # two passes, wide and faint then narrow and bright: a glow without a blur
            d.line(pts, fill=(238, 230, 208, int(255 * 0.18 * ecto)), width=round(14 * w / 360))
            d.line(pts, fill=(246, 240, 224, int(255 * 0.75 * ecto)), width=round(3 * w / 360))
        img = Image.alpha_composite(img, over)

    # the candle: lit while the tape keeps the past. Drawn over the veil so it reads in the dark.
    d = ImageDraw.Draw(img)
    bx, by = w * 0.08, h * 0.80
    d.rectangle([bx, by, bx + w * 0.022, by + h * 0.10], fill=(222, 210, 184, 255), outline=(30, 26, 24, 255))
    if holding > 0.02:
        fl = 1 + 0.12 * math.sin(t * 7.3) + 0.06 * math.sin(t * 13.1)
        fx, fy = bx + w * 0.011, by - h * 0.03 * fl
        rw, rh = w * 0.010, h * 0.025 * fl
        glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([fx - rw * 3, fy - rh * 2, fx + rw * 3, fy + rh * 2],
                                     fill=(240, 190, 90, int(60 * holding)))
        img = Image.alpha_composite(img, glow)
        ImageDraw.Draw(img).ellipse([fx - rw, fy - rh, fx + rw, fy + rh], fill=(244, 196, 96, int(255 * holding)))
    return img.convert("RGB")


try:
    FONT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Times New Roman.ttf", 15)
    FONT_S = ImageFont.truetype("/System/Library/Fonts/Supplemental/Times New Roman.ttf", 13)
except OSError:
    FONT = FONT_S = ImageFont.load_default()

INK, PAPER, DIM = (30, 26, 24), (232, 224, 206), (120, 110, 96)


def frame(gain, presence, holding, t, caption, measure_no):
    """The cat plus a reading bar: the three facts the face is drawn from."""
    out = Image.new("RGB", (PANEL, PANEL + 78), PAPER)
    out.paste(paint(gain, presence, holding, t), (0, 0))
    d = ImageDraw.Draw(out)
    y0 = PANEL + 8
    d.text((10, y0), caption, fill=INK, font=FONT)
    d.text((PANEL - 70, y0), f"measure {measure_no}", fill=DIM, font=FONT_S)
    for i, (name, v) in enumerate((("knob as heard", gain), ("on the tape", presence), ("holding", holding))):
        x = 10 + i * 118
        d.text((x, y0 + 28), name, fill=DIM, font=FONT_S)
        d.rectangle([x, y0 + 48, x + 100, y0 + 58], outline=INK)
        d.rectangle([x, y0 + 48, x + int(100 * v), y0 + 58], fill=INK)
    return out


# ---- runs ---------------------------------------------------------------------

def run_performance():
    x = performance_input()
    gain = ramp(len(x), GAIN_POINTS)
    lags = lag_track(len(x), LAG_EVENTS)
    return x, face(x, gain, lags), grammar(x, gain, lags)


def empty_room():
    """Nothing played, knob up: the cat reaches and finds nothing."""
    x = np.zeros(MEASURE)
    return face(x, np.full(len(x), 0.85), np.full(len(x), 0.5))


def film(outs, fps=30):
    n_frames = int(outs.shape[1] / SR * fps)
    fdir = HERE / "_frames"
    fdir.mkdir(exist_ok=True)
    for f in range(n_frames):
        n = int(f * SR / fps)
        m = n / MEASURE
        frame(outs[2, n], outs[3, n], outs[4, n], f * 0.04 * 30 / fps,
              caption_at(m), int(m) + 1).save(fdir / f"f{f:05d}.png")
    write_wav(fdir / "audio.wav", outs[0])
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps), "-i", str(fdir / "f%05d.png"),
                    "-i", str(fdir / "audio.wav"), "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    "-crf", "26", "-c:a", "aac", "-b:a", "128k", "-shortest", str(HERE / "face-film.mp4")],
                   check=True)
    for p in list(fdir.glob("*.png")) + [fdir / "audio.wav"]:
        p.unlink()
    fdir.rmdir()
    return n_frames


def moments(outs, empty):
    picks = [(1.0, "you play; the knob is down"), (3.5, "summoned: the phrase comes back"),
             (6.5, "playing over it: the tape listens"), (10.5, "dismissed: asleep, past still kept"),
             (12.0, "summoned again: the same past"), (None, "the empty room: knob up, nothing kept")]
    W, H = PANEL, PANEL + 78
    sheet = Image.new("RGB", (W * 3, H * 2), PAPER)
    rows = []
    for i, (m, cap) in enumerate(picks):
        src, n = (empty, MEASURE // 2) if m is None else (outs, int(m * MEASURE))
        g, p, hd = src[2, n], src[3, n], src[4, n]
        sheet.paste(frame(g, p, hd, 1.3 + i, cap, "-" if m is None else int(m) + 1), ((i % 3) * W, (i // 3) * H))
        rows.append((cap, g, p, hd))
    sheet.save(HERE / "face-moments.png")
    return rows


if __name__ == "__main__":
    x, outs, (g1, g2, _) = run_performance()
    print(f"séance underneath untouched: out2 vs grammar out2 max difference {np.max(np.abs(outs[1] - g2)):.2e}")
    print(f"out1 vs grammar out1 max difference {np.max(np.abs(outs[0] - g1)):.2e}")
    held = outs[3, int(3.5 * MEASURE):int(5.5 * MEASURE)]
    print(f"presence while a held phrase plays: median {np.median(held):.2f}, min {held.min():.2f}")
    empty = empty_room()
    print(f"empty room: presence max {empty[3].max():.3f}, holding at end {empty[4, -1]:.2f}")
    for cap, g, p, hd in moments(outs, empty):
        print(f"  {cap:40s} knob {g:.2f}  presence {p:.2f}  holding {hd:.2f}")
    print("frames:", film(outs))
