"""bracket.py — does 'only diamond is a bell' survive what the line widths could be?

Cycle 12 found diamond the only bell, but most of its Q values were estimates. This
takes modes.json (every mode the plugin plays, with what is actually known about its
room-temperature line width) and strikes each mineral twice: at the widest lines its
sources allow (shortest ring) and the narrowest (longest ring). If diamond's short
end still rings longer than every other mineral's long end, the finding does not
depend on the estimates.

Q for a mode, by what is known about it (modes.json 'kinds'):
  a width or range of its own  -> Q = line / width
  a Raman line, width unread   -> the crystal's anchor width range on this line
  not a Raman line             -> the anchor Q range x [0.5, 2]
Ring time: tau = Q / (pi f); T60 = ln(1000) tau. The ring of a strike is its
slowest mode, weighted by how loud the strike leaves it (rolloff 0.7 per mode, as the
plugin's default).

Writes bracket.json, bracket.wav (each mineral at A2: shortest, then longest) and
bracket.svg.  python3 bracket.py
"""
import json, math, os, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
A2 = 110.0
ROLL = 0.7
PLUGIN_Q = {"Diamond": 807, "Fluorite": 27, "Emerald": 57, "Ruby": 120,
            "Amethyst": 62, "Topaz": 58, "Labradorite": 30}   # Algorithm.h kQ today


def q_bracket(c, m, generous=False):
    line, wlo, whi = c["anchor"]
    if generous and m["kind"] in ("raman_unread", "not_raman") and "w" not in m:
        return m["cm"] / whi, max(m["cm"] / (wlo / 4.0), 2.0 * line / wlo)
    if "w" in m:
        return m["cm"] / m["w"][1], m["cm"] / m["w"][0]
    if m["kind"] == "raman_unread":
        return m["cm"] / whi, m["cm"] / wlo
    return 0.5 * line / whi, 2.0 * line / wlo


def t60(q, f):
    return math.log(1000.0) * q / (math.pi * f)


def ring_of(modes, qs, f0):
    """Seconds until the whole strike is 60 dB below its start: the latest any mode,
    started at its rolloff level, crosses -60 dB of the loudest."""
    end = 0.0
    for k, (m, q) in enumerate(zip(modes, qs)):
        lvl_db = 20 * math.log10(ROLL ** k)          # <= 0
        tau = q / (math.pi * f0 * m["r"])
        t = max(0.0, (60.0 + lvl_db) / 20.0 * math.log(10) * tau)
        end = max(end, t)
    return end


def strike(modes, qs, f0, secs):
    t = np.arange(int(secs * SR)) / SR
    y = np.zeros_like(t)
    for k, (m, q) in enumerate(zip(modes, qs)):
        f = f0 * m["r"]
        tau = q / (math.pi * f)
        y += (ROLL ** k) * np.exp(-t / tau) * np.sin(2 * math.pi * f * t)
    n = int(0.001 * SR)                               # 1 ms raised-cosine onset
    y[:n] *= 0.5 - 0.5 * np.cos(np.pi * np.arange(n) / n)
    f = int(0.08 * SR)                                # fade the cut, so a long ring ends clean
    y[-f:] *= np.linspace(1, 0, f)
    return y


def main():
    data = json.load(open(os.path.join(HERE, "modes.json")))
    rows, out, audio = [], {}, []
    gap = np.zeros(int(0.5 * SR))
    for c in data["crystals"]:
        br = [q_bracket(c, m) for m in c["modes"]]
        lo = [b[0] for b in br]; hi = [b[1] for b in br]
        now = [PLUGIN_Q[c["name"]]] * len(br)
        if c["name"] == "Amethyst":
            now[1] = 17
        r_lo, r_hi, r_now = (ring_of(c["modes"], q, A2) for q in (lo, hi, now))
        gen = [q_bracket(c, m, True)[1] for m in c["modes"]]
        r_gen = ring_of(c["modes"], gen, A2)
        kinds = [m["kind"] for m in c["modes"]]
        sourced = sum(k in ("raman_measured", "raman_range") for k in kinds)
        out[c["name"]] = {"ring_short_s": round(r_lo, 2), "ring_long_s": round(r_hi, 2),
                          "ring_plugin_now_s": round(r_now, 2),
                          "ring_long_if_unread_lines_4x_narrower_s": round(r_gen, 2),
                          "q_low": [round(x, 1) for x in lo], "q_high": [round(x, 1) for x in hi],
                          "modes": len(kinds), "modes_with_a_source": sourced,
                          "modes_not_raman": kinds.count("not_raman")}
        rows.append([c["name"], f"{sourced} of {len(kinds)}", kinds.count("not_raman"),
                     f"{r_lo:.1f}", f"{r_now:.1f}", f"{r_hi:.1f}", f"{r_gen:.1f}"])
        for q in (lo, hi):
            secs = min(6.0, max(0.6, ring_of(c["modes"], q, A2) + 0.1))
            y = strike(c["modes"], q, A2, secs)
            audio += [y / (np.max(np.abs(y)) + 1e-12) * 0.6, gap]
        audio.append(gap)
    d = out["Diamond"]["ring_short_s"]
    others = {k: v["ring_long_s"] for k, v in out.items() if k != "Diamond"}
    verdict = {"diamond_shortest_s": d, "longest_other": max(others, key=others.get),
               "longest_other_s": max(others.values()),
               "holds": d > max(others.values()),
               "margin": round(d / max(others.values()), 2)}
    gen = {k: v["ring_long_if_unread_lines_4x_narrower_s"] for k, v in out.items() if k != "Diamond"}
    verdict["stress"] = {"assumption": "every line without its own source is up to 4x narrower than the anchor's narrowest",
                         "longest_other": max(gen, key=gen.get), "longest_other_s": max(gen.values()),
                         "holds": d > max(gen.values())}
    json.dump({"at": "A2 (110 Hz), rolloff 0.7, ring = until the strike is 60 dB down",
               "crystals": out, "verdict": verdict,
               "table": {"columns": ["crystal", "modes with a sourced width", "modes that are not Raman lines",
                                     "ring, widest lines (s)", "ring, plugin today (s)", "ring, narrowest lines (s)", "ring if unsourced lines are 4x narrower (s)"],
                         "rows": rows}},
              open(os.path.join(HERE, "bracket.json"), "w"), indent=1)
    y = np.concatenate(audio)
    with wave.open(os.path.join(HERE, "bracket.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype("<i2").tobytes())
    svg(out, verdict)
    for r in rows: print(r)
    print(verdict, f"wav {len(y)/SR:.1f} s")


def svg(out, verdict):
    W, H, L, T, row = 760, 330, 120, 46, 36
    xmax = 60.0
    def x(s): return L + (W - L - 30) * math.log10(1 + s) / math.log10(1 + xmax)
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Helvetica, Arial, sans-serif">',
         f'<rect width="{W}" height="{H}" fill="#101418"/>',
         f'<text x="{L}" y="24" fill="#e8e2d0" font-size="15">How long each crystal rings at A2, across every width its sources allow</text>']
    for s in (0.1, 0.5, 1, 2, 5, 10, 20, 50):
        p.append(f'<line x1="{x(s):.1f}" y1="{T-6}" x2="{x(s):.1f}" y2="{T+row*7}" stroke="#2a3138"/>')
        p.append(f'<text x="{x(s):.1f}" y="{T+row*7+16}" fill="#8a9097" font-size="11" text-anchor="middle">{s:g} s</text>')
    for i, (name, v) in enumerate(out.items()):
        y = T + i * row + row / 2
        col = "#cfe6ff" if name == "Diamond" else "#d9a35a"
        p.append(f'<text x="{L-10}" y="{y+4}" fill="#e8e2d0" font-size="13" text-anchor="end">{name}</text>')
        p.append(f'<line x1="{x(v["ring_short_s"]):.1f}" y1="{y}" x2="{x(v["ring_long_s"]):.1f}" y2="{y}" stroke="{col}" stroke-width="8" stroke-linecap="round" opacity="0.85"/>')
        p.append(f'<circle cx="{x(v["ring_plugin_now_s"]):.1f}" cy="{y}" r="4" fill="#101418" stroke="#ffffff" stroke-width="1.5"/>')
    p.append(f'<text x="{L}" y="{H-10}" fill="#8a9097" font-size="11">bar: widest lines to narrowest · ring: the plugin today · log scale · ring = until 60 dB down</text>')
    p.append('</svg>')
    open(os.path.join(HERE, "bracket.svg"), "w").write("\n".join(p))


if __name__ == "__main__":
    main()
