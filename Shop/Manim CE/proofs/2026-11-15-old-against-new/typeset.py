# Manim CE 0.22.1's MathTypst against MathTex, 2026-11-15: the beats clip's two equations, set both ways.
# TypesetBoth: upper row MathTex (LaTeX, needs Shop/Maker/tex-env.sh), lower row MathTypst (Typst, no TeX at all).
# TypstOnly: the lower row alone, rendered with TeX taken off PATH, to show it needs none.
# Run from this folder with Manim 0.22.1 (~/.venvs/manim-0.22/bin/manim): see run.sh.
from manim import Scene, MathTex, Text, VGroup, config, ManimColor, UP, DOWN, LEFT
try:
    from manim import MathTypst
except ImportError:
    MathTypst = None
BG, INK, DIM, AMBER = "#0a0a0f", "#e8e8f0", "#8a8aa0", "#e8b84a"
config.background_color = ManimColor(BG)

TEX = [r"\sin a + \sin b = 2\cos\tfrac{a-b}{2}\,\sin\tfrac{a+b}{2}",
       r"f_{\mathrm{beat}} = |f_1 - f_2| = 0.25\ \mathrm{Hz}"]
TYP = [r"sin a + sin b = 2 cos (a-b)/2 thin sin (a+b)/2",
       'f_"beat" = |f_1 - f_2| = 0.25 "Hz"']

def row(cls, srcs, tag):
    eqs = VGroup(*[cls(s, color=c, font_size=40) for s, c in zip(srcs, (AMBER, INK))]).arrange(DOWN, buff=0.35)
    label = Text(tag, font_size=18, color=DIM).next_to(eqs, LEFT, buff=0.6)
    return VGroup(label, eqs)

class TypesetBoth(Scene):
    def construct(self):
        top = row(MathTex, TEX, "MathTex\n(LaTeX)")
        bot = row(MathTypst, TYP, "MathTypst\n(Typst)")
        VGroup(top, bot).arrange(DOWN, buff=0.9)
        self.add(top, bot)

class TypstOnly(Scene):
    def construct(self):
        self.add(row(MathTypst, TYP, "MathTypst\n(Typst)"))

class TexOnly(Scene):
    def construct(self):
        self.add(row(MathTex, TEX, "MathTex\n(LaTeX)"))
