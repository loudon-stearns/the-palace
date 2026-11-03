"""Dump the Python reference's raw output (float64, before the float32 cast
and the -3 dBFS normalise) so the codebox mirror can subtract sample by sample."""
import os, sys
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(here, "..", "RNBO"))
sys.path.insert(0, os.path.join(here, "..", "python"))
import numpy as np
import mathieu_reference as R

n = int(R.DURATION_S * R.SAMPLE_RATE)
noise = R.make_noise_buffer(n)
# re-run the reference loop in float64 (render() casts its output to float32)
omega_0 = R.TWO_PI * R.FREQ / R.SAMPLE_RATE; a = omega_0**2; q = R.Q_DEPTH*a
omega_mod = R.MOD_RATE_RATIO*omega_0
x = v = phi = 0.0; out = np.zeros(n)
for i in range(n):
    phi += omega_mod
    if phi >= R.TWO_PI: phi -= R.TWO_PI
    coeff = a - 2.0*q*np.cos(phi)
    v_new = v + (-coeff*x - 2.0*R.DAMPING_ZETA*omega_0*v + R.NOISE_LEVEL*float(noise[i]))
    x_new = x + v_new
    x = R.SAT_AMP*np.tanh(x_new*R.INV_SAT); v = R.SAT_AMP*np.tanh(v_new*R.INV_SAT)
    out[i] = np.tanh(x)*R.GAIN
assert np.max(np.abs(out.astype(np.float32) - R.render(noise))) == 0.0  # same as render()
out.astype('<f8').tofile(os.path.join(here, "ref_out.f64"))
noise.astype('<f4').tofile(os.path.join(here, "ref_noise.f32"))
print("pre-norm peak", float(np.max(np.abs(out))), "n", n)
