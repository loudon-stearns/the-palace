# Manim CE card check, 2026-11-14: a few seconds at -ql, Graphite tokens, one MathTex through the TeX bridge.
# Run from this folder:  ../../../Maker/tex-env.sh manim -ql card-check.py CardCheck
from manim import Scene, Text, MathTex, Circle, Arrow, VGroup, Create, Write, FadeIn, config, ManimColor, ORIGIN, RIGHT, UP, DOWN
BG, INK, ACCENT, INFO = "#0a0a0f", "#e8e8f0", "#e8b84a", "#4a8fff"   # Loudon Live Graphite skin
config.background_color = ManimColor(BG)

class CardCheck(Scene):
    def construct(self):
        ring = Circle(radius=1.4, color=INFO, stroke_width=3)
        arm = Arrow(ORIGIN, RIGHT * 1.4, buff=0, color=ACCENT, stroke_width=5)
        law = MathTex(r"\theta(t) = \omega t", color=INK).next_to(ring, DOWN, buff=0.5)
        title = Text("Manim CE · card check", font_size=28, color=INK).to_edge(UP)
        self.play(FadeIn(title), Create(ring), run_time=0.8)
        self.play(Create(arm), Write(law), run_time=0.8)
        self.play(arm.animate.rotate(3.14159 * 1.5, about_point=ORIGIN), run_time=1.6)
        self.wait(0.3)
