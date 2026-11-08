"""Haptic Handwheel — weigh the bench disc's inertia by hanging it, so nothing rests on its shape.

    python3 disc_inertia.py --mass 0.0402 --spacing 0.060 --length 0.500 --swings 20 --seconds 26.9
    python3 disc_inertia.py --selftest

The bench reads the rotor's inertia against one disc of known inertia, and every
number it reports (inertia, torque per amp, drag, friction, brake) comes out in
proportion to that disc. The analyzer used to assume a flat, solid disc,
½·m·r². A cap with a skirt carries its mass outward and is about 1.18× that, so
the whole bench would read about 15 % low. Hanging the disc measures it instead.

How (a bifilar pendulum, ten minutes and two threads):
  1. Weigh the disc on a kitchen scale (grams, to 0.1 g if you can).
  2. Hang it level from two threads tied at equal distance either side of its
     centre, `spacing` apart, both `length` long, both vertical.
  3. Twist it a few degrees about its vertical axis and let go. It turns back
     and forth without swinging sideways.
  4. Time 20 full twists (back and forth is one) with a stopwatch. Twice.

    J = m·g·d²·T² / (16·π²·L)

It prints the inertia and the radius that makes ½·m·r² match it, so you can pass
either `--disc-J` or `--disc-radius` to bench_analyze.py and run_bench.py.
"""
import math, argparse

G = 9.81

def inertia(mass, spacing, length, period):
    return mass * G * spacing ** 2 * period ** 2 / (16 * math.pi ** 2 * length)

def period_for(J, mass, spacing, length):
    return 4 * math.pi * math.sqrt(J * length / (mass * G * spacing ** 2))

def report(mass, spacing, length, swings, seconds, timing_err=0.2):
    T = seconds / swings
    J = inertia(mass, spacing, length, T)
    r_eq = math.sqrt(2 * J / mass)
    dJ = 2 * timing_err / seconds  # J goes as T², so a timing slip counts twice
    print(f'period                 {T:.4f} s  ({swings} twists in {seconds:.2f} s)')
    print(f'disc inertia J         {J:.4g} kg·m²   (±{100 * dJ:.1f} % from a {timing_err} s stopwatch slip)')
    print(f'as a flat disc         radius {r_eq * 1000:.1f} mm gives the same J')
    print(f'pass on:  --disc-J {J:.4g}')
    return J

def selftest():
    # The flat 40 g, 40 mm disc and the drawn cap (1.178× the flat formula, from
    # the Shopkeeper's CAD probe of 2026-10-20), hung 60 mm apart on 500 mm threads.
    m, r, d, L = 0.040, 0.040, 0.060, 0.500
    ok = True
    for name, J in (('flat disc', 0.5 * m * r ** 2), ('drawn cap', 1.178 * 0.5 * m * r ** 2)):
        T = period_for(J, m, d, L)
        got = inertia(m, d, L, T)
        err = (got - J) / J
        print(f'{name:<10} true J {J:.4g}  period {T:.3f} s  recovered {got:.4g}  ({100 * err:+.2g} %)'
              f'  equivalent radius {math.sqrt(2 * got / m) * 1000:.1f} mm')
        ok &= abs(err) < 1e-9
    print('selftest', 'passes' if ok else 'FAILS')
    return ok

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--selftest', action='store_true')
    ap.add_argument('--mass', type=float, help='kg (the scale reading in grams ÷ 1000)')
    ap.add_argument('--spacing', type=float, help='m between the two threads')
    ap.add_argument('--length', type=float, help='m, each thread, from the tie point to the disc')
    ap.add_argument('--swings', type=int, default=20)
    ap.add_argument('--seconds', type=float, help='s for that many full twists')
    a = ap.parse_args()
    if a.selftest: raise SystemExit(0 if selftest() else 1)
    if None in (a.mass, a.spacing, a.length, a.seconds): ap.error('need --mass, --spacing, --length and --seconds (or --selftest)')
    report(a.mass, a.spacing, a.length, a.swings, a.seconds)
