"""
Pitch anchor + in-tune neuron: the audition, the figure, the numbers.
Needs /tmp/apo_anchor (v0.4, see anchor_sweep.py) and, for the before/after
tuning panel, /tmp/apo_anchor_old built the same way from neuropulse v0.3
(the v0.2.1 neuron with the anchor added). Reads sweep.json.

Out: ../neuropulse-pitch-anchor.wav   20% spread, coupling rising into a lock,
                                     anchor 0 then anchor 1, over a quiet 110 Hz reference
     ../pitch-anchor-findings.png
     findings.json
"""
import json, os, subprocess, numpy as np
import wave
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import anchor_sweep as A
from anchor_sweep import render, member_rates, SR, N, F0

cents = lambda f, ref=F0: 1200 * np.log2(f / ref)
sw = json.load(open("sweep.json"))
find = {}

# --- 1. single-neuron tuning across the keyboard, before and after --------------
PITCHES = [55, 82.41, 110, 164.81, 220, 261.63, 329.63, 380]
tune = {"pitch": PITCHES}
for tag, binary in [("v0.3", "/tmp/apo_anchor_old"), ("v0.4", "/tmp/apo_anchor")]:
    if not os.path.exists(binary): continue
    A.RENDER = binary; errs = []
    for f in PITCHES:
        r = member_rates(render(dict(freq=f, h_f=0, anchor=1, K_on=0), 3.0)[:, 3:], SR)
        errs.append(float(np.max(np.abs(cents(r, f))) * np.sign(np.median(cents(r, f)))))
    tune[tag] = errs
A.RENDER = "/tmp/apo_anchor"
tune["whole_sample_floor"] = [float(cents(SR / round(SR / f), f)) for f in PITCHES]
find["tuning_cents"] = tune

# --- 2. crowd pitch over time while coupling rises, 20% spread ----------------
def pitch_track(spk, hop=SR // 20):
    """Crowd pitch every 50 ms: median of each member's latest inter-spike rate."""
    onsets = [np.flatnonzero(np.diff(spk[:, i] > 0.5, prepend=0) == 1) for i in range(N)]
    t = np.arange(hop, spk.shape[0], hop); out = []
    for s in t:
        rs = []
        for on in onsets:
            k = np.searchsorted(on, s) - 1
            if k >= 1: rs.append(SR / (on[k] - on[k - 1]))
        out.append(np.median(rs) if rs else np.nan)
    return t / SR, np.array(out)

H, KMAX, FREE, RAMP, HOLD = 0.20, 0.048, 1.0, 5.0, 3.0
SEG = FREE + RAMP + HOLD
passes = {}
for a in [0.0, 1.0]:
    x = render(dict(freq=F0, h_f=H, anchor=a, K_on=KMAX, free_s=FREE, ramp_s=RAMP), SEG)
    au = x[:, 1].astype(float); au -= au.mean()
    tt, pt = pitch_track(x[:, 3:])
    passes[a] = dict(audio=au, t=tt, pitch=pt, K=x[::SR // 20, 2][1:len(tt) + 1])
    find[f"pass_anchor_{int(a)}"] = dict(start_hz=float(np.nanmedian(pt[(tt > 0.5) & (tt < 1.0)])),
                                         locked_hz=float(np.nanmedian(pt[tt > SEG - 2])))

# --- 3. the audition ------------------------------------------------------------
gap = np.zeros(int(0.4 * SR)); segs = []
ref_amp = None
for a in [0.0, 1.0]:
    au = passes[a]["audio"]; au = au / np.sqrt(np.mean(au[int(FREE * SR):] ** 2))
    tt = np.arange(len(au)) / SR
    segs += [au, gap]
mix = np.concatenate(segs[:-1])
mix = mix / np.max(np.abs(mix)) * 0.75
ref = 0.08 * np.sin(2 * np.pi * F0 * np.arange(len(mix)) / SR)    # quiet A2 reference, the dialed note
out = mix + ref
f = int(0.02 * SR); out[:f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
with wave.open("../neuropulse-pitch-anchor.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out / np.max(np.abs(out)) * 0.9 * 32767).astype("<i2").tobytes())
find["audition"] = dict(spread=H, K_max=KMAX, seconds_per_pass=SEG, gap_s=0.4,
                        order=["anchor 0 (old: spread centred on the dial)", "anchor 1 (fastest member on the dial)"],
                        reference="110 Hz sine at about -22 dB under the crowd")

# --- 4. figure ------------------------------------------------------------------
fig, ax = plt.subplots(1, 3, figsize=(16, 4.8))
col = {0.05: "#7fb3d5", 0.10: "#2471a3", 0.20: "#c0392b", 0.30: "#7d3c98"}
for run in sw["runs"]:
    K = [r["K"] for r in run["rows"]]; c = [cents(r["pitch"]) for r in run["rows"]]
    ax[0].semilogx(K, c, "-o" if run["anchor"] else "--o", color=col[run["h_f"]], ms=4,
                   label=f"{int(run['h_f']*100)}% spread, anchor {int(run['anchor'])}")
ax[0].axhline(0, color="k", lw=0.8)
ax[0].set_xlabel("coupling K"); ax[0].set_ylabel("crowd pitch, cents from the dialed 110 Hz")
ax[0].set_title("Where the crowd's pitch goes as coupling rises\n(dashed: anchor 0 · solid: anchor 1)")
ax[0].legend(fontsize=7, ncol=2)
for a, c in [(0.0, "#888"), (1.0, "#c0392b")]:
    p = passes[a]; ax[1].plot(p["t"], cents(p["pitch"]), color=c, lw=1.6, label=f"anchor {int(a)}")
ax[1].axhline(0, color="k", lw=0.8); ax[1].axvspan(FREE, FREE + RAMP, color="#eee", zorder=-1)
ax[1].set_xlabel("seconds (shaded: coupling ramps 0 → 0.048)"); ax[1].set_ylabel("cents from 110 Hz")
ax[1].set_title("The audition, 20% spread: the lock climbs onto the note\nwith anchor 1 and overshoots it by 3 semitones with anchor 0")
ax[1].legend()
if "v0.3" in tune:
    ax[2].plot(PITCHES, tune["v0.3"], "--o", color="#888", label="v0.3: planned spike length, charge from rest")
ax[2].plot(PITCHES, tune["v0.4"], "-o", color="#c0392b", label="v0.4: measured time since firing, real start voltage")
ax[2].plot(PITCHES, tune["whole_sample_floor"], ":", color="k", label="nearest whole-sample period (the floor)")
ax[2].axhline(0, color="k", lw=0.8); ax[2].set_xscale("log")
ax[2].set_xlabel("dialed pitch, Hz (one neuron, no coupling)"); ax[2].set_ylabel("cents off")
ax[2].set_title("One neuron in tune: the leftover error\nis the whole-sample period, nothing else")
ax[2].legend(fontsize=7)
plt.tight_layout(); plt.savefig("../pitch-anchor-findings.png", dpi=110)
json.dump(find, open("findings.json", "w"), indent=1)
print(json.dumps(find, indent=1))
