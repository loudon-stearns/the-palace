"""The split-way picture test, drawn half — 2026-11-15.
One piece three ways, about fireflies falling into step (Kuramoto coupling):
  split   — a FLUX plate (what would be photographed) with an exact diagram drawn over it as SVG
  drawn   — everything drawn: the pond, the fireflies and the same diagram, all SVG
  (whole  — everything generated: whole-klein.png / whole-krea.png, made by render.py)
The diagram's arrows and numbers come from a real simulation run here, so they can be checked.
Run from this folder: python3 split.py   (numpy only; PNGs are rasterised by headless Chrome).
A maker who can do this better another way does so, and leaves the comparison on the scroll."""
import base64, json, math, subprocess, os
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
W, H = 1344, 768
CREAM, RED, DIM = "#f0eee5", "#c8261a", "#b8b09a"          # Drafting Table paper, accent, rule
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""

# ── the simulation: seven fireflies, Kuramoto, Euler steps ───────────────────
rng = np.random.default_rng(1975)
N, K, dt, T = 7, 2.0, 0.01, 12.0
omega = rng.normal(1.0, 0.25, N)
theta0 = rng.uniform(0, 2 * math.pi, N)
th = theta0.copy(); rs = []
for _ in range(int(T / dt)):
    z = np.exp(1j * th).mean(); rs.append(abs(z))
    th = th + dt * (omega + K * np.abs(z) * np.sin(np.angle(z) - th))
r0, r1 = rs[0], rs[-1]
sim = {"N": N, "K": K, "dt": dt, "T": T, "seed": 1975, "r_start": round(float(r0), 3), "r_end": round(float(r1), 3),
       "theta_start": [round(float(x), 3) for x in theta0 % (2 * math.pi)],
       "theta_end": [round(float(x), 3) for x in th % (2 * math.pi)]}


def t(x, y, s, size=15, fill=CREAM, anchor="middle", weight=500, extra=""):
    return f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" letter-spacing="2" {extra}>{s}</text>'


def dial(cx, cy, phases, rr=88, ink=CREAM):
    g = [f'<circle cx="{cx}" cy="{cy}" r="{rr}" fill="none" stroke="{ink}" stroke-width="1.4"/>',
         f'<circle cx="{cx}" cy="{cy}" r="2.5" fill="{ink}"/>']
    for p in phases:                                    # each firefly is a dot on the circle at its phase
        x, y = cx + rr * math.cos(p), cy - rr * math.sin(p)
        g.append(f'<line x1="{cx}" y1="{cy}" x2="{x:.1f}" y2="{y:.1f}" stroke="{ink}" stroke-width="1" opacity="0.55"/>')
        g.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="#ffd36a" stroke="{ink}" stroke-width="1"/>')
    z = np.exp(1j * np.array(phases)).mean()          # the mean field, drawn as the red arrow
    ax, ay = cx + rr * abs(z) * math.cos(np.angle(z)), cy - rr * abs(z) * math.sin(np.angle(z))
    g.append(f'<line x1="{cx}" y1="{cy}" x2="{ax:.1f}" y2="{ay:.1f}" stroke="{RED}" stroke-width="3"/>')
    return "".join(g)


def diagram(Y=250):
    L, R = 300, 1044
    g = [dial(L, Y, theta0), dial(R, Y, th),
         t(L, Y + 128, "OUT OF STEP", 17), t(L, Y + 152, f"r = {r0:.2f}", 14, DIM),
         t(R, Y + 128, "IN STEP", 17), t(R, Y + 152, f"r = {r1:.2f}", 14, DIM),
         # the coupling arrow
         f'<path d="M {L+120} {Y-40} Q {(L+R)/2} {Y-150} {R-120} {Y-40}" fill="none" stroke="{CREAM}" stroke-width="1.6"/>',
         f'<path d="M {R-120} {Y-40} l -16 -2 m 16 2 l -6 -15" fill="none" stroke="{CREAM}" stroke-width="1.6"/>',
         t((L + R) / 2, Y - 142, f"COUPLING K = {K:g}", 16),
         t((L + R) / 2, Y - 120, f"{T:g} s of the simulation", 12, DIM)]
    # r(t), the order parameter, as a strip under the dials
    x0, x1, yb, hh = 470, 874, Y + 60, 70
    pts = " ".join(f"{x0 + i / (len(rs[::10]) - 1) * (x1 - x0):.1f},{yb - v * hh:.1f}" for i, v in enumerate(rs[::10]))
    g += [f'<line x1="{x0}" y1="{yb}" x2="{x1}" y2="{yb}" stroke="{DIM}" stroke-width="1"/>',
          f'<line x1="{x0}" y1="{yb-hh}" x2="{x1}" y2="{yb-hh}" stroke="{DIM}" stroke-width="0.6" stroke-dasharray="3 4"/>',
          f'<polyline points="{pts}" fill="none" stroke="{RED}" stroke-width="2"/>',
          t(x0 - 8, yb - hh + 4, "1", 11, DIM, "end"), t(x0 - 8, yb + 4, "0", 11, DIM, "end"),
          t((x0 + x1) / 2, yb + 22, "r, how much in step, over time", 12, DIM)]
    return "".join(g)


def svg(body, w=W, h=H):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" {FONT}>{body}</svg>'


# ── split: the generated plate under the drawn diagram ──────────────────────
def split(plate):
    subprocess.run(["magick", str(HERE / plate), "-quality", "84", str(HERE / "plate.jpg")], check=True)
    b64 = base64.b64encode((HERE / "plate.jpg").read_bytes()).decode()
    veil = f'<rect width="{W}" height="{H}" fill="#050a06" opacity="0.28"/>'    # a light veil so the ink reads
    return svg(f'<image href="data:image/jpeg;base64,{b64}" width="{W}" height="{H}"/>{veil}{diagram(520)}')


# ── drawn: the pond drawn too ───────────────────────────────────────────────
def drawn():
    r2 = np.random.default_rng(7)
    g = ['<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1430"/>'
         '<stop offset="1" stop-color="#3a3f6e"/></linearGradient>'
         '<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#23284a"/>'
         '<stop offset="1" stop-color="#070a16"/></linearGradient></defs>',
         f'<rect width="{W}" height="470" fill="url(#sky)"/>', f'<rect y="470" width="{W}" height="{H-470}" fill="url(#water)"/>']
    xs = np.arange(0, W + 24, 24); ys = 470 - 50 - 40 * np.abs(np.sin(xs / 97.0)) - r2.uniform(0, 30, len(xs))
    g.append('<polygon fill="#05070d" points="0,470 ' + " ".join(f"{x},{y:.0f}" for x, y in zip(xs, ys)) + f' {W},470"/>')
    g.append('<polygon fill="#11162c" opacity="0.8" points="0,470 ' + " ".join(f"{x},{940-y:.0f}" for x, y in zip(xs, ys)) + f' {W},470"/>')
    for _ in range(140):                                # fireflies and their reflections
        x, y = r2.uniform(0, W), r2.uniform(380, 520); s = r2.uniform(1.2, 3.2)
        g.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{s:.1f}" fill="#ffd36a"/>')
        if y < 470: g.append(f'<rect x="{x-s/2:.0f}" y="{940-y:.0f}" width="{s:.1f}" height="{s*4:.1f}" fill="#ffd36a" opacity="0.45"/>')
    for i in range(70):                                 # reeds
        x = r2.uniform(0, W); hgt = r2.uniform(60, 190)
        if 260 < x < 1080 and r2.random() < 0.8: continue
        g.append(f'<path d="M {x:.0f} {H} q {r2.uniform(-20,20):.0f} {-hgt/2:.0f} {r2.uniform(-30,30):.0f} {-hgt:.0f}" stroke="#05070d" stroke-width="2.4" fill="none"/>')
    return svg("".join(g) + diagram())


def raster(name):
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    html = HERE / f"_{name}.html"
    html.write_text(f'<html><body style="margin:0">{(HERE / (name + ".svg")).read_text()}</body></html>')
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--window-size={W},{H}",
                    f"--screenshot={HERE / (name + '.png')}", html.as_uri()], check=True, capture_output=True)
    html.unlink()


if __name__ == "__main__":
    (HERE / "split.svg").write_text(split("plate-klein.png"))
    (HERE / "drawn.svg").write_text(drawn())
    for n in ("split", "drawn"): raster(n)
    (HERE / "simulation.json").write_text(json.dumps(sim, indent=1) + "\n")
    print(json.dumps(sim))
