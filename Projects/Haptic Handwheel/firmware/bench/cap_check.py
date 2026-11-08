"""Haptic Handwheel — what the bench reports if the drawn cap stands in for the disc.

    /usr/local/bin/python3 cap_check.py   → cap_check.txt

The pretend motor runs its accel test with the drawn cap on (1.178× a flat
disc's ½·m·r², from the Shopkeeper's CAD probe of 2026-10-20), then the analyzer
reads it twice: once assuming a flat disc, once with the cap's measured inertia.
"""
import bench_analyze as B
flatJ = 0.5 * 0.040 * 0.040
capJ = 1.178 * flatJ
rows, tm = B.fake_motor(disc_J=capJ)
keys = ('J', 'kt', 'b_bearings', 'coulomb', 'b_backemf')
print(f"{'read as':<28}" + ''.join(f'{k:>12}' for k in keys))
for name, dj in (('flat disc, ½·m·r²', flatJ), ('measured, --disc-J', capJ)):
    m = B.analyze(rows, dj, 7.6)['motor']
    print(f'{name:<28}' + ''.join(f"{100 * (m[k] - tm[k]) / tm[k]:>+11.1f}%" for k in keys))
