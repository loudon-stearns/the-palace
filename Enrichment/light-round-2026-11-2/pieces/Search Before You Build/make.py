"""Search Before You Build — light piece: the answer was already upstream.

Reads the palace's own records (git history and GenAI Camera/renders.json), writes data.json,
draws upstream.svg (Drawn SVG) and rasterises upstream.png through headless Chrome at 2x.
No randomness: the seed in jobs.json is nominal.

Run from the palace root:  python3 "Enrichment/light-round-2026-11-2/pieces/Search Before You Build/make.py"
"""
import base64, io, json, subprocess, datetime as dt
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
FIX = "8156fa3d"                       # GenAI Camera: auto-range depth (Track-IV lesson), 2026-07-09 11:48
BRACKET = "min(dists)*0.82"            # the near/far bracket, as written in the proofs
PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
MONO = "'JetBrains Mono','IBM Plex Mono','SF Mono',Menlo,monospace"


def git(*a):
    return subprocess.run(["git", "-C", str(ROOT), *a], check=True, capture_output=True, text=True).stdout.strip()


def first_commit(path, needle=None):
    args = ["log", "--reverse", "--format=%h %aI", f"{FIX}^"]
    args += [f"-S{needle}"] if needle else ["--diff-filter=A"]
    line = git(*args, "--", path).splitlines()[0]
    h, iso = line.split()
    return {"path": path, "commit": h, "when": iso}


def gather():
    # every file in the palace that held the bracket the moment before the fix (route 1: git grep)
    files = [l.split(":", 1)[1] for l in git("grep", "-l", "-F", BRACKET, f"{FIX}^", "--", "Projects").splitlines()]
    bracket = sorted((first_commit(f, BRACKET) for f in files), key=lambda r: r["when"])
    comfy = first_commit("Projects/BLUELINE/proofs/track-VI-elemental-motion/lib/comfy.py")
    fix = dict(zip(("commit", "when", "subject"), git("log", "-1", "--format=%h%n%aI%n%s", FIX).split("\n")))
    renders = {r["n"]: r for r in json.load(open(ROOT / "GenAI Camera/renders.json"))}
    day = lambda iso: dt.date.fromisoformat(iso[:10])
    miss = dt.date(2026, 7, 9)          # the page: "Building the GenAI Camera on 2026-07-09"
    d = {
        "read_on": dt.date.today().isoformat(),
        "sources": ["git log / git grep at " + FIX + "^", "GenAI Camera/renders.json", "Search Before You Build.md"],
        "bracket_files": bracket,
        "comfy_client": comfy,
        "fix": fix,
        "flat_render": {"n": 5, "ts": renders[5]["ts"], "plate": "GenAI Camera/renders/render_005_depth.png"},
        "bracketed_render": {"n": 8, "ts": renders[8]["ts"], "plate": "GenAI Camera/renders/render_008_depth.png"},
        "miss_day": miss.isoformat(),
        "days_bracket_waited": (miss - day(bracket[0]["when"])).days,
        "days_comfy_waited": (miss - day(comfy["when"])).days,
    }
    # route 2: count the same days a second way, by calendar arithmetic from the page's own dates
    assert (dt.date(2026, 7, 9) - dt.date(2026, 6, 14)).days == d["days_bracket_waited"] == 25, d
    assert (dt.date(2026, 7, 9) - dt.date(2026, 6, 26)).days == d["days_comfy_waited"] == 13, d
    assert len(bracket) == 3 and bracket[0]["path"].endswith("track-IV-bench/bench.py"), bracket
    return d


def plate(path, box=(296, 318, 472, 560), w=120):
    im = Image.open(ROOT / path).convert("L").crop(box)        # head and torso, no tone change
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, "PNG")
    return im.size, "data:image/png;base64," + base64.b64encode(b.getvalue()).decode()


def draw(d):
    W, H = 1000, 470
    t0, t1 = dt.date(2026, 6, 11), dt.date(2026, 7, 11)
    X0, X1, AY = 50, 640, 262
    x = lambda iso: X0 + (dt.date.fromisoformat(iso[:10]) - t0).days * (X1 - X0) / (t1 - t0).days
    g = []
    T = lambda xx, yy, s, size=15, fill=INK2, anchor="start", weight=400, extra="": g.append(
        f'<text x="{xx:.1f}" y="{yy:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" {extra}>{s}</text>')
    L = lambda x1, y1, x2, y2, c=INK, w=1.5, extra="": g.append(
        f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}" {extra}/>')

    T(X0, 44, "THE ANSWER WAS ALREADY UPSTREAM", 13, INK3, weight=500, extra='letter-spacing="2.4"')
    T(X0, 76, "Written into the palace weeks before it was needed,", 20, INK, weight=600)
    T(X0, 102, "then written again from scratch.", 20, INK, weight=600)

    # axis with week ticks
    L(X0, AY, X1, AY, INK, 2)
    day = t0
    while day <= t1:
        if day.weekday() == 0 or day in (t0, t1):
            xx = x(day.isoformat()); L(xx, AY - 5, xx, AY + 5, INK3, 1)
            T(xx, AY + 22, f"{day.day} {day.strftime('%b')}", 12, INK3, "middle")
        day += dt.timedelta(1)

    # upstream: the bracket, three times; the client, once
    bf = d["bracket_files"]
    for r in bf:
        xx = x(r["when"]); L(xx, AY, xx, 168, INK, 1.2)
        g.append(f'<circle cx="{xx:.1f}" cy="{AY}" r="6" fill="{INK}"/>')
    xa = x(bf[0]["when"])
    T(xa - 6, 140, "near/far bracketed to the subject,", 15, INK, weight=600)
    T(xa - 6, 160, "in three proofs: " + ", ".join(Path(r["path"]).name for r in bf), 13, INK2)
    xc = x(d["comfy_client"]["when"])
    L(xc, AY, xc, 216, INK3, 1.2)
    g.append(f'<circle cx="{xc:.1f}" cy="{AY}" r="6" fill="{PAPER}" stroke="{INK}" stroke-width="2"/>')
    T(xc - 6, 196, "a ComfyUI client:", 15, INK, weight=600)
    T(xc - 6, 214, "lib/comfy.py", 13, INK2)

    # the day of the miss
    xm = x(d["miss_day"])
    L(xm, AY, xm, 132, RED, 1.6)
    g.append(f'<circle cx="{xm:.1f}" cy="{AY}" r="7" fill="{RED}"/>')
    T(xm - 8, 140, "9 Jul: both", 15, RED, "end", 600)
    T(xm - 8, 158, "written fresh", 15, RED, "end", 600)

    # how long each answer waited
    for yy, xs, n, what in ((316, xa, d["days_bracket_waited"], "the bracket waited"),
                            (360, xc, d["days_comfy_waited"], "the client waited")):
        L(xs, yy, xm, yy, INK, 1.4, f'marker-start="url(#tick)" marker-end="url(#tick)"')
        T((xs + xm) / 2, yy - 8, f"{n} days", 16, INK, "middle", 600)
        T((xs + xm) / 2, yy + 18, what, 12, INK3, "middle")

    # the morning of 9 July, small
    PX = 690
    T(PX, 140, "9 July, the same morning", 13, INK3, weight=500)
    (pw, ph), flat = plate(d["flat_render"]["plate"]); _, brk = plate(d["bracketed_render"]["plate"])
    for i, (src, ts, lab) in enumerate(((flat, d["flat_render"]["ts"], "reads flat"),
                                        (brk, d["bracketed_render"]["ts"], "bracketed"))):
        px = PX + i * (pw + 26)
        g.append(f'<image x="{px}" y="156" width="{pw}" height="{ph}" href="{src}"/>')
        g.append(f'<rect x="{px}" y="156" width="{pw}" height="{ph}" fill="none" stroke="{INK}" stroke-width="1"/>')
        T(px, 156 + ph + 20, ts[-5:], 14, INK, weight=600)
        T(px + 48, 156 + ph + 20, lab, 13, INK2)
    T(PX, 156 + ph + 46, f"{d['fix']['when'][11:16]}: the fix commit", 13, INK2)
    T(PX, 156 + ph + 64, "names bench.py as its source", 13, INK2)

    T(X0, H - 22, f"Dates from git (first commit holding each line) and GenAI Camera/renders.json, read {d['read_on']}. "
      "Plates cropped, tones as rendered.", 11, INK3)

    defs = (f'<defs><marker id="tick" markerWidth="2" markerHeight="12" refX="1" refY="6" orient="auto">'
            f'<rect width="2" height="12" fill="{INK}"/></marker></defs>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
            f'font-family="{MONO}"><rect width="{W}" height="{H}" fill="{PAPER}"/>{defs}{"".join(g)}</svg>'), (W, H)


def raster(svg_path, png_path, W, H):
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    html = HERE / "_raster.html"
    html.write_text(f'<html><body style="margin:0">{svg_path.read_text()}</body></html>')
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                    f"--window-size={W},{H}", f"--screenshot={png_path}", html.as_uri()], check=True, capture_output=True)
    html.unlink()


if __name__ == "__main__":
    d = gather()
    (HERE / "data.json").write_text(json.dumps(d, indent=1) + "\n")
    svg, (W, H) = draw(d)
    (HERE / "upstream.svg").write_text(svg)
    raster(HERE / "upstream.svg", HERE / "upstream.png", W, H)
    print(json.dumps({k: d[k] for k in ("days_bracket_waited", "days_comfy_waited")}),
          [r["path"].split("/")[-1] + " " + r["when"][:10] for r in d["bracket_files"]])
