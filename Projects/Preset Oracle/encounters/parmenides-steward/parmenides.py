"""Preset Oracle — the steward's own encounter with
'Parmenides Dying Alone in a Warehouse'.
Constraint: feedback routing only, no filter envelopes.
Direction: industrial machinery becoming sentient.

Every sound here is made by feedback. One click starts it; after that nothing
is fed in. Four delay loops (the machines) saturate and cross-feed; a
feedback delay network (the warehouse) is the room. Filters are fixed one-pole
lowpasses inside the loops: they never move, so there is no filter envelope.
What moves is routing gain: the cross-feed between machines rises (becoming
sentient), then the master loop gain sinks below one (dying).

Usage: python3 parmenides.py [take]   take = 1 (first try) or 2 (committed)
"""
import sys, numpy as np
from scipy.io import wavfile

SR = 48000
DUR = 40.0
take = int(sys.argv[1]) if len(sys.argv) > 1 else 2
N = int(SR * DUR)
t = np.arange(N) / SR

# four machines: delay lengths in samples (fundamentals ~ 55, 82.4, 110.3, 164.8 Hz)
L = np.array([873, 583, 435, 291])
y = np.zeros((4, int(L.max()) + 1))     # ring buffers
w = np.zeros(4)                          # write heads
lp = np.zeros(4)                         # fixed one-pole lowpass state
dcx = np.zeros(4); dcy = np.zeros(4)      # fixed DC blocker in each loop (take 2)
a = 0.35 if take == 1 else 0.22          # lowpass coefficient (fixed for the whole piece)

# routing curves — gains only, the "becoming" and the "dying"
# self-feedback: holds near unity, then sinks below it from 26 s
if take == 1:
    g_self = np.full(N, 1.02)
    g_self[t > 26] = 1.02 - 0.08 * (t[t > 26] - 26) / 14
    cross = np.clip((t - 4) / 18, 0, 1) * 0.35
else:
    # take 2: loops run hot and polarity-inverted (a held state can't latch to DC),
    # then the gain sinks through the point where the loop can hold itself up
    g_self = np.full(N, -1.35)
    g_self[t > 26] = -1.35 + 0.55 * ((t[t > 26] - 26) / 14) ** 1.5
    cross = np.clip((t - 4) / 18, 0, 1) ** 2 * 0.3
# cross-feed matrix: each machine hears the next one round the ring
C = np.roll(np.eye(4), 1, axis=1)

# the warehouse: 8-line FDN with a Householder matrix, fixed damping
FL = np.array([1931, 2333, 2801, 3203, 3637, 4111, 4561, 5003])
fb = [np.zeros(n) for n in FL]; fi = np.zeros(8, int)
H = np.eye(8) - 2.0 / 8
room_g = 0.93
flp = np.zeros(8)

out = np.zeros((N, 2))
idx = np.arange(4)
taps = np.zeros(4)
for n in range(N):
    for k in range(4):
        taps[k] = y[k, (int(w[k]) - L[k]) % y.shape[1]]
    if n == 0:
        taps[:] += 0.8                     # the one click; nothing is fed in again
    x = g_self[n] * taps + cross[n] * (C @ taps)
    lp[:] = lp + a * (np.tanh(1.6 * x) - lp)   # saturation, then the fixed lowpass
    if take == 2:
        dcy[:] = lp - dcx + 0.995 * dcy; dcx[:] = lp; lp_out = dcy
    else:
        lp_out = lp
    for k in range(4):
        y[k, int(w[k])] = lp_out[k]
        w[k] = (w[k] + 1) % y.shape[1]
    # room
    rt = np.array([fb[j][fi[j]] for j in range(8)])
    flp[:] = flp + 0.45 * (rt - flp)
    mix = H @ (room_g * flp)
    src = lp_out.sum() * 0.25
    for j in range(8):
        fb[j][fi[j]] = mix[j] + src * (0.2 if j % 2 == 0 else -0.2)
        fi[j] = (fi[j] + 1) % FL[j]
    dry = lp_out * np.array([0.6, 0.4, 0.55, 0.45])
    out[n, 0] = dry[0] + dry[2] + 0.5 * (rt[0] + rt[2] + rt[4] + rt[6])
    out[n, 1] = dry[1] + dry[3] + 0.5 * (rt[1] + rt[3] + rt[5] + rt[7])

out -= out.mean(axis=0)
peak = np.abs(out).max()
out = out / peak * 0.89
# gentle 20 ms edges so the file doesn't click — a fade on the master, not a filter envelope
e = int(0.02 * SR); out[:e] *= np.linspace(0, 1, e)[:, None]; out[-e:] *= np.linspace(1, 0, e)[:, None]
name = f"parmenides-take{take}.wav"
wavfile.write(name, SR, (out * 32767).astype(np.int16))

# the ear an agent has: loudness and brightness, second by second
m = out.mean(axis=1)
print(f"{name}: peak before normalise {peak:.3f}")
print(" sec  rms_dB  centroid_Hz")
for s in range(0, int(DUR), 4):
    seg = m[s * SR:(s + 1) * SR]
    spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
    f = np.fft.rfftfreq(len(seg), 1 / SR)
    c = (f * spec).sum() / (spec.sum() + 1e-12)
    print(f"{s:4d}  {20*np.log10(np.sqrt((seg**2).mean())+1e-9):6.1f}  {c:8.0f}")
