"""The Handwheel's probe parts as solids, built only from handwheel_dims.py.

Z is the motor's axis, up is the rotor side. Every part sits on z = 0.
"""
from build123d import Box, Compound, Cylinder, Pos, Rot, Align

from handwheel_dims import MOTOR, CAP, LADDER, LADDER_CLEARS

BOTTOM = (Align.CENTER, Align.CENTER, Align.MIN)


def tube(od, id_, h, z0=0.0):
    return Pos(0, 0, z0) * (Cylinder(od / 2, h, align=BOTTOM) - Cylinder(id_ / 2, h, align=BOTTOM))


def motor():
    """The GM5208-12 as its datasheet gives it: an envelope, not the motor.

    The page gives the outside, the height and the hollow shaft. It does not
    give where the rotor ends, the bolt patterns, or whether the shaft stands
    proud, so none of those are drawn. The shaft is drawn flush and through.
    """
    od, h = MOTOR["od"].value, MOTOR["height"].value
    s_od, s_id = MOTOR["shaft_od"].value, MOTOR["shaft_id"].value
    body = Cylinder(od / 2, h, align=BOTTOM) - Cylinder(s_od / 2, h, align=BOTTOM)
    # Two bodies, not one: fused, the shaft's outside would vanish into the can.
    return Compound([body, tube(s_od, s_id, h)])


def cap():
    """The light cap: a top plate, a skirt, and a ring that registers on the rotor OD.

    Built upside-up: the top face is at z = height, the open side faces the motor.
    """
    od, h = CAP["od"].value, CAP["height"].value
    plate, wall = CAP["plate"].value, CAP["wall"].value
    bore = MOTOR["od"].value + 2 * CAP["reg_clear"].value
    reg_od = bore + 2 * CAP["reg_wall"].value
    depth = CAP["reg_depth"].value
    hollow = h - plate
    shell = Cylinder(od / 2, h, align=BOTTOM) - Cylinder(od / 2 - wall, hollow, align=BOTTOM)
    return shell + tube(reg_od, bore, depth, z0=hollow - depth)


def ladder_ring(clear):
    """One rung of the fit ladder: a register ring with the clearance named by its notches."""
    bore = MOTOR["od"].value + 2 * clear
    wall, h = LADDER["wall"].value, LADDER["height"].value
    ring = tube(bore + 2 * wall, bore, h)
    notches = round(clear / 0.1)
    r = bore / 2 + wall
    for i in range(notches):
        ring -= Rot(0, 0, 90 + (i - (notches - 1) / 2) * 8) * Pos(r, 0, h) * Box(2.0, 1.2, 2.0)
    return ring


def ladder():
    return [ladder_ring(c) for c in LADDER_CLEARS]
