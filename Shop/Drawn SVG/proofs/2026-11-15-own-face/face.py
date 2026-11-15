"""Drawn SVG draws its own hero and icon, 2026-11-15: a ruled sheet, a curve plotted from numbers, and the
numbers themselves written beside it, in the Drafting Table paper inks. Run from this folder: python3 face.py
Writes face-hero.svg/png (1280x544) and face-icon.svg/png (1024x1024); copy the PNGs to the bundle's hero and icon.
A maker who can draw a better face another way does so."""
import math, subprocess
from pathlib import Path
HERE = Path(__file__).parent
PAPER, INK, INK3, RULE, RED = "#f0eee5", "#1a1916", "#6a6862", "#b8b09a", "#c8261a"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""


def curve(x0, x1, y0, amp, n=9):
    pts = [(x0 + i / (n - 1) * (x1 - x0), y0 - amp * math.exp(-i / 3.2) * math.cos(i * 1.25)) for i in range(n)]
    return pts


def hero():
    W, H = 1280, 544
    g = [f'<rect width="{W}" height="{H}" fill="{PAPER}"/>']
    for x in range(40, W, 40): g.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" stroke="{RULE}" stroke-width="0.5" opacity="0.6"/>')
    for y in range(32, H, 40): g.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="{RULE}" stroke-width="0.5" opacity="0.6"/>')
    pts = curve(160, 1120, 300, 190)
    g.append(f'<line x1="120" y1="300" x2="1160" y2="300" stroke="{INK}" stroke-width="2"/>')
    g.append('<polyline fill="none" stroke="' + INK + '" stroke-width="4" points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + '"/>')
    for i, (x, y) in enumerate(pts):
        g.append(f'<line x1="{x:.1f}" y1="300" x2="{x:.1f}" y2="{y:.1f}" stroke="{RED}" stroke-width="1" stroke-dasharray="3 4"/>')
        g.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="{PAPER}" stroke="{RED}" stroke-width="2.5"/>')
        g.append(f'<text x="{x:.1f}" y="{(y - 18) if y < 300 else (y + 30):.1f}" font-size="15" fill="{INK3}" text-anchor="middle">{300 - y:+.0f}</text>')
    g.append(f'<text x="120" y="500" font-size="18" fill="{INK}" font-weight="700" letter-spacing="4">DRAWN SVG</text>')
    g.append(f'<text x="1160" y="500" font-size="14" fill="{INK3}" text-anchor="end">every mark from a number · face.py</text>')
    return W, H, "".join(g)


def icon():
    W = H = 1024
    g = [f'<rect width="{W}" height="{H}" fill="{PAPER}"/>',
         f'<line x1="150" y1="610" x2="900" y2="610" stroke="{INK}" stroke-width="28" stroke-linecap="square"/>']
    pts = curve(190, 860, 610, 400, n=6)
    g.append('<polyline fill="none" stroke="' + INK + '" stroke-width="44" stroke-linejoin="miter" points="' + " ".join(f"{x:.0f},{y:.0f}" for x, y in pts) + '"/>')
    x, y = pts[0]
    g.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="62" fill="{RED}"/>')
    return W, H, "".join(g)


def write(name, W, H, body):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" {FONT}>{body}</svg>'
    (HERE / f"{name}.svg").write_text(svg)
    html = HERE / f"_{name}.html"; html.write_text(f'<html><body style="margin:0">{svg}</body></html>')
    subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu",
                    "--hide-scrollbars", f"--window-size={W},{H}", f"--screenshot={HERE / (name + '.png')}", html.as_uri()],
                   check=True, capture_output=True)
    html.unlink()


if __name__ == "__main__":
    write("face-hero", *hero()); write("face-icon", *icon()); print("ok")
