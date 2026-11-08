"""comb_two_pumps_ref.py — one second of comb_render.py run() with both pumps, plus its noise, for the JS check."""
import numpy as np
src = open('comb_render.py').read().split('ramp = lambda')[0]; exec(src)
rng = np.random.default_rng(3); nz = 1e-4 * rng.uniform(-1, 1, FS)
x = run(1, lambda t: 0.1 + 0 * t, lambda t: np.ones_like(t), len_dev=lambda t: 0.6 * np.sin(2 * np.pi * 1.5 * F0 * t), seed=3)
nz.astype('<f8').tofile('/tmp/fq_ref_nz.f64'); x.astype('<f8').tofile('/tmp/fq_ref_py.f64')
