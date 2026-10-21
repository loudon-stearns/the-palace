#!/usr/bin/env python3
"""The collection: four instruments that tear, then heal.

Every key of every patch is placed against its own edge, found by bisection
on that key (engine.find_edge), never copied from the field guide's numbers:
the sustain rests at a fraction of the edge (alive: the colour moves, the
pitch holds) and each velocity layer throws the stretch past it, from where
it decays back (B(t) = rest + (peak - rest) * exp(-t / tau)) and relocks.

Choices made here, with the reason each one is not a default:
  - velocity -> strike depth. The baton's "obvious first guess"; kept because
    a harder strike tearing longer and deeper is what a struck thing does.
  - coupling scales with pitch (K = 6 Hz at 110 Hz, as ride_warm.py). That
    makes a low note the same note on a slower clock, so the bass tears and
    heals slower. tau scales with sqrt(110 / f) only, so the clock still
    shows through but the top of the keyboard is not a click.
  - partial count follows pitch: as many partials as fit under 18 kHz, capped
    per patch. So high keys of a many-partial patch snap and low keys fray,
    the field guide's partial-count knob played by register.
  - a sample every 3 semitones. Resampling a sample by +-1.5 semitones moves
    its heal by at most 9%, small next to the 2.7x the register itself makes.
"""
from __future__ import annotations

from dataclasses import dataclass

NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
STEP = 3                       # semitones between sample roots
PARTIAL_CEILING_HZ = 18000.0   # partials kept under this
K_AT_110 = 6.0                 # coupling, Hz, at 110 Hz (the sweeps' K)
LAYERS = (("soft", 1, 42), ("mid", 43, 85), ("hard", 86, 127))


def note_name(m: int) -> str:
    return f"{NOTE_NAMES[m % 12]}{m // 12 - 1}"


def key_hz(m: int) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


@dataclass(frozen=True)
class Patch:
    name: str          # folder and filename stem
    title: str         # what a sampler shows
    blurb: str
    source: str        # "warm" (ride_warm.py) or "bright" (ride.py)
    n_max: int         # partial count cap
    pinned: bool       # partial 1 held at ratio 1 while the rest stretch
    rest: float        # sustain stretch, as a fraction of the key's edge
    throws: tuple      # per layer: peak stretch as a multiple of the edge,
                       # or (pinned) as an absolute stretch
    tau: float         # strike decay at 110 Hz, seconds
    lo: int            # lowest root key (MIDI)
    hi: int            # highest root key
    release: float     # sampler release, seconds
    voices: float = 0.0          # how much of the outside voices is mixed in
    renders_from: str | None = None   # reuse another patch's simulations

    def roots(self) -> list[int]:
        return list(range(self.lo, self.hi + 1, STEP))

    def partials(self, key: int) -> int:
        return int(max(6, min(self.n_max, PARTIAL_CEILING_HZ // key_hz(key))))

    def tau_at(self, key: int) -> float:
        return self.tau * (110.0 / key_hz(key)) ** 0.5


PATCHES = {
    "heal": Patch(
        "heal", "Heal",
        "The centre of the collection: the warm source, up to 96 partials. A strike "
        "throws the stretch past the key's edge; the tone tears, sags and wobbles, "
        "then relocks into a sustain resting at a third of its edge.",
        source="warm", n_max=96, pinned=False, rest=0.35, throws=(2.0, 6.0, 20.0),
        tau=0.25, lo=24, hi=96, release=0.8),
    "snap": Patch(
        "snap", "Snap",
        "Eight bright partials: few partials snap instead of fraying. The edge is a "
        "cliff, so the tear is a run of slips and the sustain is dead still.",
        source="bright", n_max=8, pinned=False, rest=0.35, throws=(2.0, 6.0, 20.0),
        tau=0.15, lo=48, hi=96, release=0.5),
    "bar": Patch(
        "bar", "Bar to String",
        "Partial 1 pinned. A strike starts as a bar (partials near 1, 4, 9, 16, "
        "free of the voices' grip), tears as the stretch falls through the edge, "
        "and heals into a string.",
        source="warm", n_max=64, pinned=True, rest=0.35, throws=(0.02, 1.0, 30.0),
        tau=0.12, lo=36, hi=84, release=1.0),
    "voices": Patch(
        "voices", "Heal with Voices",
        "Heal's own strikes with the outside voices mixed in, as in the sweeps' "
        "with-voices renders: the tear is heard as beating against a harmonic "
        "ensemble, and the heal as the beating stopping.",
        source="warm", n_max=96, pinned=False, rest=0.35, throws=(2.0, 6.0, 20.0),
        tau=0.25, lo=24, hi=84, release=0.8, voices=0.35 / 0.6, renders_from="heal"),
}
