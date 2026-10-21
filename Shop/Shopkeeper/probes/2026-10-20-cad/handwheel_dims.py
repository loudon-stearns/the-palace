"""Every number the Haptic Handwheel probe drawings use, and where it came from.

Each value carries one of four sources, and the drawings print them differently:

  DATASHEET  read from the maker's page; the URL and the read date are below.
  DESIGN     chosen here for the probe. Change it freely; the drawing follows.
  ASSUMED    a nominal figure from general knowledge. A scale or calipers is the truth.
  MEASURE    not known. The value is None until someone measures the real part,
             and nothing that depends on it gets an STL.

The motor's numbers come only from its shop page. The cap's numbers are a probe
stand-in for the light cap in Projects/Haptic Handwheel/order/PARTS.md:19; its
look is Loudon's call, not this file's.
"""
from dataclasses import dataclass

GM5208_PAGE = ("https://shop.iflight.com/ipower-motor-gm5208-12-brushless-gimbal-"
               "motor-with-as5048a-encoder-pro248")
GM5208_READ = "2026-10-20"


@dataclass(frozen=True)
class Dim:
    value: float | None
    source: str                     # DATASHEET | DESIGN | ASSUMED | MEASURE
    note: str = ""
    tol: tuple[float, float] | None = None   # (lower, upper) deviation, mm

    @property
    def known(self) -> bool:
        return self.value is not None


# ── the motor: iFlight GM5208-12 with the AS5048A encoder ─────────────────────
MOTOR = {
    "od": Dim(63.0, "DATASHEET", "outer diameter", (-0.05, +0.05)),
    "height": Dim(30.7, "DATASHEET", "height, encoder housing included", (-0.2, +0.2)),
    "shaft_od": Dim(15.0, "DATASHEET", "hollow shaft, outside", (-0.012, -0.008)),
    "shaft_id": Dim(12.0, "DATASHEET", "hollow shaft, inside", (0.0, +0.05)),
    "runout": Dim(0.1, "DATASHEET", "rotor housing runout, at most"),
    "mass_g": Dim(209.0, "DATASHEET", "mass, grams", (-0.5, +0.5)),
    # Not on the page. Each one is a question for calipers.
    "rotor_bolts": Dim(None, "MEASURE", "rotor-top bolt pattern: count, thread, circle"),
    "stator_bolts": Dim(None, "MEASURE", "base bolt pattern: count, thread, circle"),
    "rotor_height": Dim(None, "MEASURE", "how much of the 30.7 turns (the rotor bell)"),
    "shaft_top": Dim(None, "MEASURE", "how far the hollow shaft stands above the rotor"),
    "top_edge": Dim(None, "MEASURE", "the rotor's top edge: square, chamfer or round"),
}

# ── the light cap: Ø80, about 40 g (PARTS.md:19), registered on the rotor's OD ─
# The rotor OD is the one mating surface the datasheet tolerances (±0.05, runout
# ≤0.1), so the cap centres on it instead of on a bolt pattern nobody has seen.
CAP = {
    "od": Dim(80.0, "DESIGN", "outer diameter (PARTS.md:19)"),
    "height": Dim(15.0, "DESIGN", "overall height"),
    "plate": Dim(5.0, "DESIGN", "top plate thickness"),
    "wall": Dim(2.5, "DESIGN", "skirt wall"),
    "reg_clear": Dim(0.2, "DESIGN", "register clearance per side; the fit ladder picks it"),
    "reg_wall": Dim(2.0, "DESIGN", "register ring wall"),
    "reg_depth": Dim(3.0, "DESIGN", "register depth over the rotor's top edge"),
    "target_g": Dim(40.0, "DESIGN", "target mass, grams (PARTS.md:19)"),
}

# ── the fit ladder: three register rings to try on the real motor ────────────
# Print all three, push each onto the rotor, keep the clearance that slides on
# snug, and write it into CAP["reg_clear"]. The notches name the ring.
LADDER = {
    "clears": Dim(None, "DESIGN", "per-side clearances, one ring each"),
    "height": Dim(4.0, "DESIGN", "ring height"),
    "wall": Dim(2.0, "DESIGN", "ring wall"),
}
LADDER_CLEARS = (0.10, 0.20, 0.30)

# ── material ──────────────────────────────────────────────────────────────────
PLA_DENSITY = Dim(1.24, "ASSUMED", "PLA, g/cm³, nominal; weigh the print")
