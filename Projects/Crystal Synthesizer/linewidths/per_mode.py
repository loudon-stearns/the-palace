"""per_mode.py — one Q per mode, the middle of what the literature allows.

The plugin gave every mode of a crystal the same Q. But a Raman line's width, not its
Q, sets how long it rings: Q = line / width, and a mode plays at a pitch in
proportion to its line, so tau = Q / (pi f) is the same for every mode of one width.
One Q per crystal therefore cut every upper mode short: the higher the mode, the
sooner it died. This takes the geometric middle of each mode's bracket (bracket.py's
rules, modes.json's sources) and writes:

  per_mode.json   the table the plugin's three engines carry (QM), with each mode's
                  range and how it is known
  per_mode.wav    each mineral at A2: the plugin as it was (one Q), then per mode
  per_mode.svg    each mode's ring at A2, before and after, mineral by mineral

The two hypothesis slots (tetragonal, monoclinic) have no mineral and keep Q 100.
Ruby's widths are still my bracket, not a reading; it is marked estimated.

  python3 per_mode.py
"""
import json, math, os, wave
import numpy as np
import bracket as b

HERE = os.path.dirname(os.path.abspath(__file__))
SLOT = {"Diamond": 0, "Fluorite": 1, "Emerald": 3, "Ruby": 4, "Amethyst": 5,
        "Topaz": 6, "Labradorite": 8}
FLAT = [807.0, 27.0, 100.0, 57.0, 120.0, 62.0, 58.0, 100.0, 30.0]
SOFT = (5, 1, 17.0)                       # amethyst's soft mode, as the plugin had it


def main():
    data = json.load(open(os.path.join(HERE, "modes.json")))
    qm = [[100.0] * 9 for _ in range(9)]
    rows, audio, svg_rows = [], [], []
    gap = np.zeros(int(0.5 * b.SR))
    for c in data["crystals"]:
        s = SLOT[c["name"]]
        mids, info = [], []
        for k, m in enumerate(c["modes"]):
            lo, hi = b.q_bracket(c, m)
            q = float(round(math.sqrt(lo * hi)))
            mids.append(q)
            qm[s][k] = q
            info.append({"r": m["r"], "cm": m["cm"], "kind": m["kind"], "q": q,
                         "range": [round(lo, 1), round(hi, 1)]})
        flat = [SOFT[2] if (s, k) == SOFT[:2] else FLAT[s] for k in range(len(mids))]
        rb, ra = b.ring_of(c["modes"], flat, b.A2), b.ring_of(c["modes"], mids, b.A2)
        tb = [b.t60(q, b.A2 * m["r"]) for q, m in zip(flat, c["modes"])]
        ta = [b.t60(q, b.A2 * m["r"]) for q, m in zip(mids, c["modes"])]
        rows.append({"crystal": c["name"], "slot": s, "ring_before": round(rb, 2),
                     "ring_after": round(ra, 2), "top_mode_t60_before": round(tb[-1], 2),
                     "top_mode_t60_after": round(ta[-1], 2),
                     "estimated": c["name"] == "Ruby", "modes": info})
        svg_rows.append((c["name"], tb, ta))
        secs = min(max(rb, ra) + 0.4, 7.0)
        for qs in (flat, mids):
            y = b.strike(c["modes"], qs, b.A2, secs)
            audio += [y / (np.max(np.abs(y)) + 1e-12) * 0.5, gap]
    out = {"what": "per-mode Q, the geometric middle of each mode's bracket; slots in plugin order",
           "slots": ["Diamond", "Fluorite", "Tetragonal (hypothesis)", "Emerald", "Ruby",
                     "Amethyst", "Topaz", "Monoclinic (hypothesis)", "Labradorite"],
           "QM": qm, "crystals": rows}
    json.dump(out, open(os.path.join(HERE, "per_mode.json"), "w"), indent=1)
    y = np.concatenate(audio)
    with wave.open(os.path.join(HERE, "per_mode.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(b.SR)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype("<i2").tobytes())
    write_svg(svg_rows)
    for r in rows:
        print(f"{r['crystal']:12s} ring {r['ring_before']:6.2f} -> {r['ring_after']:6.2f} s   "
              f"top mode {r['top_mode_t60_before']:6.2f} -> {r['top_mode_t60_after']:6.2f} s")
    print("QM =", json.dumps(qm))


def write_svg(rows):
    W, rowh, left, top = 760, 62, 120, 54
    H = top + rowh * len(rows) + 40
    lx = lambda t: left + (math.log10(max(t, 0.05)) + 1.31) / (math.log10(80) + 1.31) * (W - left - 30)
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
         'font-family="Helvetica, Arial, sans-serif" font-size="12">',
         f'<rect width="{W}" height="{H}" fill="#0d0f14"/>',
         '<text x="20" y="24" fill="#e8e6e0" font-size="15">Each mode\'s ring at A2, one Q per crystal (grey) and one per mode (gold)</text>',
         '<text x="20" y="42" fill="#8a8f9a">left to right in a row: low mode to high · seconds until 60 dB down, log axis</text>']
    for t in (0.1, 0.3, 1, 3, 10, 30):
        x = lx(t)
        o.append(f'<line x1="{x:.1f}" y1="{top - 4}" x2="{x:.1f}" y2="{H - 34}" stroke="#262a33"/>')
        o.append(f'<text x="{x:.1f}" y="{H - 18}" fill="#8a8f9a" text-anchor="middle">{t:g} s</text>')
    for i, (name, tb, ta) in enumerate(rows):
        y0 = top + i * rowh + 10
        o.append(f'<text x="20" y="{y0 + 18}" fill="#e8e6e0">{name}{" *" if name == "Ruby" else ""}</text>')
        n = len(tb)
        for k, (a, bb) in enumerate(zip(tb, ta)):
            y = y0 + 4 + k * (40 / max(n - 1, 1))
            o.append(f'<line x1="{lx(a):.1f}" y1="{y:.1f}" x2="{lx(bb):.1f}" y2="{y:.1f}" stroke="#5a5f6a" stroke-width="1"/>')
            o.append(f'<circle cx="{lx(a):.1f}" cy="{y:.1f}" r="2.6" fill="#7d828c"/>')
            o.append(f'<circle cx="{lx(bb):.1f}" cy="{y:.1f}" r="3" fill="#e2b04a"/>')
    o.append(f'<text x="20" y="{H - 4}" fill="#8a8f9a">* ruby\'s widths are my bracket, not a reading</text>')
    o.append('</svg>')
    open(os.path.join(HERE, "per_mode.svg"), "w").write("\n".join(o))


if __name__ == "__main__":
    main()
