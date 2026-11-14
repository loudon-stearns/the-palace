"""Write palace-mermaid.json, a mermaid-cli config whose themeVariables come from the
Loudon Live Design System's own tokens (_ops/loudon-live/design-system/colors_and_type.css).

It holds no palette of its own. Same choices as the Observable Plot wrapper and
Shop/Matplotlib/palace.mplstyle: the skin's ground, one mono face (JetBrains Mono),
lines and borders in the quiet tokens, text in fg-1; the accent is left for the
diagram's own `classDef`, so emphasis stays a choice the source makes.

  python3 Shop/Mermaid/palace_mermaid_theme.py                 # Graphite (the default skin)
  python3 Shop/Mermaid/palace_mermaid_theme.py skin-drafting   # a named skin on top
  npx -y -p @mermaid-js/mermaid-cli mmdc -c Shop/Mermaid/palace-mermaid.json -b '#0a0a0f' -i d.mmd -o d.svg

For an Obsidian-inline Sketch, the same object goes in the block's front matter
(---\\nconfig:\\n  theme: base\\n  themeVariables: {...}\\n---). Born 2026-11-14; the smallest honest version.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CSS = HERE.parents[1] / "_ops/loudon-live/design-system/colors_and_type.css"


def tokens(skin=None):
    css = CSS.read_text()
    t = dict(re.findall(r"--([\w-]+):\s*([^;]+);", re.search(r":root\s*\{(.*?)\n\}", css, re.S).group(1)))
    if skin:
        block = re.search(r"\." + re.escape(skin) + r"\b[^{]*\{(.*?)\}", css, re.S)
        if not block:
            sys.exit(f"no skin .{skin} in {CSS}")
        t.update(dict(re.findall(r"--([\w-]+):\s*([^;]+);", block.group(1))))
    t = {k: v.strip() for k, v in t.items()}
    for k in ("bg", "bg-elev-1", "bg-elev-2", "border", "fg-1", "fg-2", "fg-3"):
        if not re.fullmatch(r"#[0-9a-fA-F]{6}", t[k]):
            sys.exit(f"token --{k} is {t[k]!r}, not a 6-digit hex; refusing to guess a colour")
    return t


def config(t):
    return {"theme": "base", "themeVariables": {
        "background": t["bg"], "fontFamily": "JetBrains Mono, monospace", "fontSize": "14px",
        "primaryColor": t["bg-elev-2"], "mainBkg": t["bg-elev-2"],
        "primaryTextColor": t["fg-1"], "textColor": t["fg-1"], "nodeTextColor": t["fg-1"],
        "primaryBorderColor": t["border"], "nodeBorder": t["border"],
        "secondaryColor": t["bg-elev-1"], "tertiaryColor": t["bg-elev-1"],
        "clusterBkg": t["bg-elev-1"], "clusterBorder": t["border"],
        "lineColor": t["fg-3"], "edgeLabelBackground": t["bg"], "titleColor": t["fg-2"],
    }}


if __name__ == "__main__":
    args = sys.argv[1:]
    out = HERE / "palace-mermaid.json"
    if "--out" in args:
        i = args.index("--out"); out = Path(args[i + 1]); del args[i:i + 2]
    out.write_text(json.dumps(config(tokens(args[0] if args else None)), indent=2) + "\n")
    print(f"wrote {out} ({args[0] if args else 'Graphite, the default skin'})")
