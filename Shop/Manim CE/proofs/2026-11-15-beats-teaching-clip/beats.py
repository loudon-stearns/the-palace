# Beats: a teaching clip made by three Specialists, 2026-11-15.
# Manim draws the mathematics; Kokoro reads one sentence (narrate.py); ffmpeg joins them to the house loudness (join.sh).
# The narration is the clock: every cue below is read from narration.json, Kokoro's own word timings,
# shifted by LEAD seconds (the narration starts LEAD s into the clip). Change the sentence, re-run narrate.py,
# and the cues follow. Graphite tokens from the Loudon Live Design System, as named constants.
# Run from this folder:  ../../../Maker/tex-env.sh manim -qh beats.py Beats
# A maker who can do this better another way should; leave the comparison on the scroll.
import json
from pathlib import Path
import numpy as np
from manim import (Scene, Axes, Text, MathTex, VGroup, DashedVMobject, Brace, Line, Create, Write, FadeIn, FadeOut,
                   config, ManimColor, UP, DOWN, LEFT, RIGHT, smooth, linear)

BG, INK, DIM, AMBER, BLUE = "#0a0a0f", "#e8e8f0", "#8a8aa0", "#e8b84a", "#4a8fff"
config.background_color = ManimColor(BG)

HERE = Path(__file__).parent
WORDS = json.loads((HERE / "narration.json").read_text())["words"]
SPEECH = json.loads((HERE / "narration.json").read_text())["audio_sec"]
LEAD = 1.2            # narration starts here in the clip
TOTAL = 17.0          # clip length in seconds
F1, F2 = 2.0, 2.25    # Hz; they differ by 0.25 Hz, so the sum beats once every 4 s
T_SPAN = 8.0          # seconds of signal shown across the axes: two beats


def cue(word, nth=0):
    """Clip time at which the nth occurrence of `word` starts in the narration."""
    hits = [w for w in WORDS if w["w"].lower() == word]
    return LEAD + hits[nth]["start"]


class Beats(Scene):
    def construct(self):
        self.clock = 0.0

        def at(t):                      # wait until clip time t
            if t > self.clock + 1e-3:
                self.wait(t - self.clock); self.clock = t

        def play(*anims, run_time):
            self.play(*anims, run_time=run_time); self.clock += run_time

        def axes(y):
            ax = Axes(x_range=[0, T_SPAN, 1], y_range=[-2.2, 2.2, 1], x_length=11, y_length=1.45 if y > -1 else 2.1,
                      axis_config={"color": DIM, "stroke_width": 1.5, "include_ticks": False}, tips=False)
            return ax.move_to([0.4, y, 0])

        title = Text("Beats", font="Georgia", font_size=44, color=INK).to_edge(UP, buff=0.35)
        ax_a, ax_b, ax_s = axes(1.95), axes(0.55), axes(-1.55)
        wave_a = ax_a.plot(lambda t: np.sin(2 * np.pi * F1 * t), color=AMBER, stroke_width=2.5)
        wave_b = ax_b.plot(lambda t: np.sin(2 * np.pi * F2 * t), color=BLUE, stroke_width=2.5)
        total = ax_s.plot(lambda t: np.sin(2 * np.pi * F1 * t) + np.sin(2 * np.pi * F2 * t), color=INK, stroke_width=2.2)
        env = lambda s: ax_s.plot(lambda t: s * 2 * abs(np.cos(np.pi * (F2 - F1) * t)), color=AMBER, stroke_width=1.6)
        env_up, env_dn = DashedVMobject(env(1), num_dashes=60), DashedVMobject(env(-1), num_dashes=60)

        lab_a = MathTex(r"f_1 = 2.00\ \mathrm{Hz}", color=AMBER, font_size=30).next_to(ax_a, LEFT, buff=0.1).shift(RIGHT * 0.3)
        lab_b = MathTex(r"f_2 = 2.25\ \mathrm{Hz}", color=BLUE, font_size=30).next_to(ax_b, LEFT, buff=0.1).shift(RIGHT * 0.3)
        lab_s = MathTex(r"\text{sum}", color=INK, font_size=30).next_to(ax_s, LEFT, buff=0.1).shift(RIGHT * 0.3)
        for lab, ax in ((lab_a, ax_a), (lab_b, ax_b), (lab_s, ax_s)):
            lab.move_to([ax.get_left()[0] - 0.05 - lab.width / 2, ax.get_center()[1], 0])

        # one beat period, braced under the sum: from one quiet point (t = 2 s) to the next (t = 6 s)
        brace = Brace(Line(ax_s.c2p(2, -2.2), ax_s.c2p(6, -2.2)), DOWN, color=DIM, buff=0.05)
        beat = MathTex(r"f_{\mathrm{beat}} = |f_1 - f_2| = 0.25\ \mathrm{Hz}", r"\;\Rightarrow\; T = 4\ \mathrm{s}",
                       color=INK, font_size=32).next_to(brace, DOWN, buff=0.12)
        ident = MathTex(r"\sin a + \sin b = 2\cos\tfrac{a-b}{2}\,\sin\tfrac{a+b}{2}", color=AMBER, font_size=36)
        ident.next_to(title, DOWN, buff=0.12)

        play(FadeIn(title), Create(ax_a), Create(ax_b), Create(ax_s), run_time=1.0)
        at(cue("add"));       play(Create(wave_a, rate_func=linear), run_time=0.55)
        at(cue("waves"));     play(Create(wave_b, rate_func=linear), run_time=0.55)
        at(cue("apart"));     play(FadeIn(lab_a), FadeIn(lab_b), run_time=0.45)
        at(cue("sum"));       play(Create(total, rate_func=linear), FadeIn(lab_s), run_time=0.9)
        at(cue("swells"));    play(Create(env_up), Create(env_dn), run_time=0.75)
        at(cue("beats"));     play(FadeIn(brace), run_time=0.4)
        at(cue("often"));     play(Write(beat[0]), run_time=1.0)
        at(cue("differ"));    play(Write(beat[1]), run_time=0.6)
        at(LEAD + SPEECH + 0.4)
        play(FadeOut(title, shift=UP * 0.2), run_time=0.3)
        play(Write(ident), run_time=1.6)
        at(TOTAL)
