"""A drawing sheet for build123d solids: projected views, sections, dimensions.

Views are projected from the solid itself (hidden-line removal in OCCT), so a
view cannot disagree with the model. Dimensions are placed on measured model
coordinates, and their labels come from the caller, who measures them from the
same solid. Colours are the house's drafting skin
(_ops/loudon-live/design-system/colors_and_type.css, .skin-drafting); the
colour of a dimension says where its number came from.

Every word and number is written as SVG <text>, not as glyph outlines, so a
sheet's numbers can be grepped and a changed dimension shows in a git diff.
(Outlined glyphs were also the slow part: build123d's SVG writer took most of
a minute per sheet on them.)
"""
import math
import re
from xml.sax.saxutils import escape

from build123d import (Box, Compound, Edge, ExportSVG, Face, Line, LineType, Pos,
                       Rectangle, Rot, Unit, Align, Wire)

PAPER, INK, INK2, INK3 = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862"
FILL = "#dcd9ca"
RED = "#c8261a"     # MEASURE: not known
BLUE = "#2b5fb0"    # DATASHEET: read from the maker
FONT = "'JetBrains Mono', 'SF Mono', Menlo, monospace"

SOURCE_LAYER = {"DESIGN": "dim", "DATASHEET": "dim_ds", "MEASURE": "hold", "ASSUMED": "dim"}
TEXT_COLOUR = {"text": INK, "dim": INK, "dim_ds": BLUE, "hold": RED}

DIM_TEXT, ARROW, GAP = 3.5, 3.0, 1.5     # mm: label size, arrowhead length, extension-line gap
CHAR = 0.6                               # a monospace character's advance, in ems


def fmt(v, places=2):
    s = f"{v:.{places}f}".rstrip("0").rstrip(".")
    return "0" if s == "-0" else s


def tol_text(tol):
    if tol is None:
        return ""
    lo, hi = tol
    if abs(lo + hi) < 1e-12:
        return f" ±{fmt(hi, 3)}"
    sign = lambda t: ("+" if t > 0 else "−" if t < 0 else "") + fmt(abs(t), 3)
    return f" {sign(hi)}/{sign(lo)}"


class View:
    """A projection placed on the sheet: model 2D (u, v) → sheet (x, y)."""

    def __init__(self, x0, y0, scale):
        self.x0, self.y0, self.s = x0, y0, scale

    def p(self, u, v):
        return (self.x0 + self.s * u, self.y0 + self.s * v)

    def place(self, shape):
        return Pos(self.x0, self.y0) * shape.scale(self.s)


class Sheet:
    W, H, M = 297.0, 210.0, 10.0

    def __init__(self):
        self.layers = {k: [] for k in
                       ("paper", "fill", "hatch", "center", "hidden", "visible",
                        "frame", "thin", "dim", "dim_ds", "hold")}
        self.texts = []
        self.add("paper", Rectangle(self.W, self.H, align=(Align.MIN, Align.MIN)))
        m = self.M
        self.box(m, m, self.W - 2 * m, self.H - 2 * m)

    def add(self, layer, shape):
        self.layers[layer].append(shape)

    # ── views ────────────────────────────────────────────────────────────────
    def project(self, solid, eye, up, view, hidden=True):
        vis, hid = solid.project_to_viewport(eye, up, (0, 0, 0))
        self.add("visible", view.place(Compound(vis)))
        if hidden and hid:
            self.add("hidden", view.place(Compound(hid)))

    def section_xz(self, solid, view, hatch_step=2.0, clip=None):
        """Cut on y = 0, look from −y, fill and hatch the cut face (ISO 45°).

        clip=(x_min, x_max) keeps only that slice, for a detail view; the
        clip's own edges are drawn as thin break lines, not as outline.
        """
        far = solid & Pos(0, 500, 0) * Box(1000, 1000, 1000)
        if clip:
            lo, hi = clip
            far = far & Pos((lo + hi) / 2, 0, 0) * Box(hi - lo, 2000, 2000)
            vis, _ = far.project_to_viewport((0, -500, 0), (0, 0, 1), (0, 0, 0))
            on_clip = lambda e: any(all(abs(v.X - x) < 1e-6 for v in e.vertices()) for x in clip)
            self.add("visible", view.place(Compound([e for e in vis if not on_clip(e)])))
            for e in vis:
                if on_clip(e):
                    self.add("hatch", view.place(e))
        else:
            self.project(far, (0, -500, 0), (0, 0, 1), view, hidden=False)
        cut = [f for f in far.faces() if abs(f.center().Y) < 1e-6 and abs(f.normal_at().Y) > 0.99]
        for f in cut:
            flat = view.place(Rot(-90, 0, 0) * f)
            self.add("fill", flat)
            bb = flat.bounding_box()
            lines, c = [], bb.min.X - (bb.max.Y - bb.min.Y)
            while c < bb.max.X:
                lines.append(Edge.make_line((c, bb.min.Y - 1, 0),
                                            (c + bb.max.Y - bb.min.Y + 2, bb.max.Y + 1, 0)))
                c += hatch_step
            hatch = flat.intersect(Compound(lines))
            # OCCT returns the pieces in a different order each run; sort them so
            # an unchanged part writes an unchanged SVG and git diffs stay quiet.
            key = lambda e: tuple(round(c, 4) for c in (*e.start_point(), *e.end_point()))
            self.add("hatch", Compound(sorted(hatch.edges(), key=key)))

    def centerline(self, p1, p2):
        self.add("center", Line(p1, p2))

    # ── dimensions ───────────────────────────────────────────────────────────
    def _arrow(self, layer, tip, ux, uy):
        """A filled arrowhead with its tip at `tip`, pointing along (ux, uy)."""
        bx, by = tip[0] - ux * ARROW, tip[1] - uy * ARROW
        w = ARROW / 6
        self.add(layer, Face(Wire.make_polygon(
            [tip, (bx - uy * w, by + ux * w), (bx + uy * w, by - ux * w)], close=True)))

    def dim(self, p1, p2, offset, label, source="DESIGN", tol=None, text_at="end"):
        """A linear dimension between two sheet points, offset to the right of p1→p2.

        When the label and its arrows will not fit between the extension lines,
        the arrows go outside and the label beyond p2, or beyond p1 with
        text_at="start" (the drafting habit for narrow spans), rather than
        letting text and arrowheads collide.
        """
        label = label + tol_text(tol)
        layer = SOURCE_LAYER[source]
        span = math.dist(p1, p2)
        ux, uy = (p2[0] - p1[0]) / span, (p2[1] - p1[1]) / span
        nx, ny = uy, -ux                                   # to the right of p1→p2
        sg = 1 if offset > 0 else -1
        q1 = (p1[0] + nx * offset, p1[1] + ny * offset)
        q2 = (p2[0] + nx * offset, p2[1] + ny * offset)
        for p, q in ((p1, q1), (p2, q2)):                  # extension lines
            self.add(layer, Line((p[0] + nx * sg * GAP, p[1] + ny * sg * GAP),
                                 (q[0] + nx * sg * 1.5, q[1] + ny * sg * 1.5)))
        ang = math.degrees(math.atan2(uy, ux))
        width = CHAR * DIM_TEXT * len(label)
        if span > width + 2 * ARROW + 3:                   # label inside, arrows inside
            self.add(layer, Line(q1, q2))
            self._arrow(layer, q1, -ux, -uy)
            self._arrow(layer, q2, ux, uy)
            mid = ((q1[0] + q2[0]) / 2, (q1[1] + q2[1]) / 2)
            self.text(label, *mid, DIM_TEXT, layer, "middle", ang, halo=True)
            return
        self.add(layer, Line((q1[0] - ux * (ARROW + 3), q1[1] - uy * (ARROW + 3)),
                             (q2[0] + ux * (ARROW + 3), q2[1] + uy * (ARROW + 3))))
        self._arrow(layer, q1, ux, uy)                     # outside, pointing in
        self._arrow(layer, q2, -ux, -uy)
        q, k, anchor = (q2, 1, "start") if text_at == "end" else (q1, -1, "end")
        self.text(label, q[0] + k * ux * (ARROW + 4.5), q[1] + k * uy * (ARROW + 4.5),
                  DIM_TEXT, layer, anchor, ang, middle=True)

    def diameter(self, c, r, label, source="DESIGN", tol=None, angle=35.0):
        """A diameter dimension across a circle, through its centre."""
        layer = SOURCE_LAYER[source]
        ux, uy = math.cos(math.radians(angle)), math.sin(math.radians(angle))
        pa, pb = (c[0] - r * ux, c[1] - r * uy), (c[0] + r * ux, c[1] + r * uy)
        self.add(layer, Line(pa, pb))
        self._arrow(layer, pa, -ux, -uy)
        self._arrow(layer, pb, ux, uy)
        self.text(label + tol_text(tol), *c, DIM_TEXT, layer, "middle", angle, halo=True)

    def marker(self, c, r, name):
        """A detail's circle on the parent view, and its letter."""
        self.add("thin", Pos(*c) * Edge.make_circle(r))
        self.text(name, c[0] + r * 0.75, c[1] + r * 0.75, 3.5)

    # ── text ─────────────────────────────────────────────────────────────────
    def text(self, s, x, y, size=2.5, layer="text", anchor="start", rotation=0.0,
             halo=False, middle=None):
        """Text at sheet (x, y). A centred label sits on its line (middle), with a
        paper-coloured knockout (halo) that breaks the line under it."""
        if s:
            self.texts.append(dict(s=s, x=x, y=y, size=size, layer=layer, anchor=anchor,
                                   rot=rotation, halo=halo,
                                   middle=halo if middle is None else middle))

    def lines(self, rows, x, y, size=2.5, lead=1.55, layer="text"):
        """Rows of text downward from (x, y); a row may be (text, layer)."""
        for i, row in enumerate(rows):
            s, lay = (row, layer) if isinstance(row, str) else row
            self.text(s, x, y - i * size * lead, size, lay)
        return y - len(rows) * size * lead

    def box(self, x, y, w, h, layer="frame"):
        self.add(layer, (Pos(x, y) * Rectangle(w, h, align=(Align.MIN, Align.MIN))).edges())

    def legend(self, x, y):
        for i, (src, lay, what) in enumerate((
                ("DATASHEET", "dim_ds", "read from the maker's page"),
                ("DESIGN", "dim", "chosen for this probe; change it in the source"),
                ("MEASURE", "hold", "not known: calipers, then the source"))):
            yy = y - i * 4.2
            self.add(lay, Line((x, yy + 1), (x + 6, yy + 1)))
            self.text(src, x + 8, yy, 2.5, lay)
            self.text(what, x + 32, yy, 2.5)

    def title_block(self, title, sub, number, scale, status, source, date="2026-10-20"):
        x, y, w = self.W - self.M - 130, self.M, 130
        self.box(x, y, w, 36)
        for yy in (y + 24, y + 12):
            self.add("frame", Line((x, yy), (x + w, yy)))
        self.add("frame", Line((x + 65, y), (x + 65, y + 12)))
        self.text(title, x + 2.5, y + 29.5, 4.2)
        self.text(sub, x + 2.5, y + 25.6, 2.5)
        self.text(f"No. {number}   ·   scale {scale}   ·   mm", x + 2.5, y + 17.5, 2.5)
        self.text(status, x + 2.5, y + 13.6, 2.5, "hold" if "HOLD" in status else "text")
        self.text(f"source  {source}", x + 2.5, y + 6.5, 2.2)
        self.text(f"drawn   {date}", x + 2.5, y + 2.5, 2.2)
        self.text("Shopkeeper probe · Sketch", x + 67.5, y + 6.5, 2.2)
        self.text("build123d 0.13 · OCCT", x + 67.5, y + 2.5, 2.2)

    # ── output ───────────────────────────────────────────────────────────────
    def _text_svg(self):
        """The text layer. ExportSVG flips y inside its group, so text sits outside
        that group at (x, −y), and a counter-clockwise angle becomes rotate(−a)."""
        out = [f'  <g font-family="{FONT}" id="text">']
        for t in self.texts:
            a = t["rot"] % 360
            if 90 < a <= 270:                              # keep labels upright
                a -= 180
            x, y = round(t["x"], 3), round(-t["y"], 3)
            attrs = [f'x="{x}"', f'y="{y}"', f'font-size="{t["size"]}"',
                     f'fill="{TEXT_COLOUR[t["layer"]]}"', f'text-anchor="{t["anchor"]}"']
            if t["middle"]:
                attrs.append('dominant-baseline="central"')
            if t["layer"] == "hold":
                attrs.append('font-weight="700"')
            turn = f' transform="rotate({round(-a, 3)} {x} {y})"' if abs(a) > 1e-9 else ""
            if t["halo"]:                                  # a knockout behind the label
                w, h = CHAR * t["size"] * len(t["s"]) + 1.6, t["size"] * 1.1
                out.append(f'    <rect x="{round(x - w / 2, 3)}" y="{round(y - h / 2, 3)}" '
                           f'width="{round(w, 3)}" height="{round(h, 3)}" fill="{PAPER}"{turn}/>')
            body = re.sub(" {2,}", lambda m: "\u00a0" * len(m.group()), escape(t["s"]))  # runs survive
            out.append(f'    <text {" ".join(attrs)}{turn}>{body}</text>')
        out.append("  </g>")
        return "\n".join(out)

    def write(self, svg_path):
        ex = ExportSVG(unit=Unit.MM, margin=0, fit_to_stroke=False, precision=4)
        style = {
            "paper": dict(fill_color=PAPER, line_color=None),
            "fill": dict(fill_color=FILL, line_color=None),
            "hatch": dict(line_color=INK3, line_weight=0.13),
            "center": dict(line_color=INK3, line_weight=0.18, line_type=LineType.ISO_LONG_DASH_DOT),
            "hidden": dict(line_color=INK2, line_weight=0.25, line_type=LineType.ISO_DASH),
            "visible": dict(line_color=INK, line_weight=0.5),
            "frame": dict(line_color=INK, line_weight=0.35),
            "thin": dict(fill_color=None, line_color=INK, line_weight=0.25),
            "dim": dict(fill_color=INK, line_color=INK, line_weight=0.18),
            "dim_ds": dict(fill_color=BLUE, line_color=BLUE, line_weight=0.18),
            "hold": dict(fill_color=RED, line_color=RED, line_weight=0.25),
        }
        for name, shapes in self.layers.items():
            ex.add_layer(name, **style[name])
            for s in shapes:
                ex.add_shape(s, layer=name)
        ex.write(svg_path)
        with open(svg_path) as f:
            svg = f.read()
        i = svg.rindex("</svg>")
        with open(svg_path, "w") as f:
            f.write(svg[:i] + self._text_svg() + "\n" + svg[i:])
