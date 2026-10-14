#!/usr/bin/env python3
"""
Round three of the ear-training reel: hear the arrival in the tone colour.
(cycle 11, 2026-10-14)

Passes 2 and 3 (mode_locking.py, loudness_locking.py) showed that on a bowed
string an underdamped overshoot makes one partial slip out of lock and catch
again. Pass 3 guessed that a soft bow shows the slip best, because it puts
the slip low and loud in the tone (partial 2, -6 dB). Measuring it says
otherwise: partial 2 drifts at most 1.9 Hz off its octave (0.3 %) and makes
about one beat in all. A slip is heard as a partial going out of tune and
beating, so this script sweeps bow strength and picks the bow by how far out
of tune the slipping partial goes and how many beats it makes (the sweep is
in the manifest). A firm bow, K = 15 Hz, wins: partial 5 goes 2 % sharp and
beats about 12 times. All clips: that bow, G3 -> E4, natural frequency 6 rad/s.

  timbre-01  underdamped (zeta 0.2)            pitch overshoots, partial 5 slips
  timbre-02  critically damped (zeta 1.0)      no overshoot, nothing slips
  timbre-03  overdamped (zeta 2.0)             no overshoot, nothing slips
  timbre-04  underdamped, slipping partial     the SAME pitch path as 01, but
             held                              the partial that slips in 01 is
                                               given a locking range big enough
                                               that it never slips

01 against 04 is the isolation test. The pitch path is identical, sample for
sample, and every partial except the slipping one behaves identically. Whatever the
ear hears differ between them is the slip and nothing else. The script checks
that claim in the audio: it reads the slipping partial's drift off its exact
harmonic straight from each rendered file (heterodyne + phase derivative).

Per-partial locking range is the only new thing here; the Adler equation is
unchanged from pass 2:

    d(psi_n)/dt = 2*pi*Delta_n(t) - 2*pi*K_n * sin(psi_n)

Outputs: multi-mode/audio/timbre-*.wav, multi-mode/figures/timbre-round.png,
multi-mode/timbre-manifest.json
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.io import wavfile

from mode_locking import damped_trajectory, style, SR, CR, N, n_idx, AMP, BG, FG1, FG3, FG4, ACC

HERE = Path(__file__).parent
AUDIO = HERE / "audio"; AUDIO.mkdir(exist_ok=True)
FIGS = HERE / "figures"; FIGS.mkdir(exist_ok=True)

DUR = 5.0
PREROLL = 0.5
B_AT_196 = 0.00025          # same string as passes 2 and 3
K_BOW = 15.0                # firm bow, chosen by the sweep below
SWEEP_K = [1.0, 3.4, 10.0, 15.0, 20.0, 30.0]
K_HELD = 1000.0             # "never slips"
F0, FT, WN = 196.0, 329.63, 6.0


def simulate(f1, K):
    """f1: (nc,) control-rate Hz. K: (N,) per-partial locking range, Hz."""
    nc = len(f1)
    B = B_AT_196 * (f1 / 196.0) ** 2
    delta = n_idx[None, :] * f1[:, None] * (np.sqrt(1 + B[:, None] * n_idx[None, :] ** 2) - 1)
    r = delta[0] / K
    psi = np.where(np.abs(r) < 1, np.arcsin(np.clip(r, -1, 1)), 0.0)
    psis = np.empty((nc, N)); dt = 1.0 / CR
    for i in range(nc):
        psi = psi + (2 * np.pi * delta[i] - 2 * np.pi * K * np.sin(psi)) * dt
        psis[i] = psi
    return psis, delta, np.abs(delta) < K[None, :]


def synth(f1, psis):
    nc = len(f1); na = int(round(SR * nc / CR))
    ta = np.arange(na) / SR; tc = np.arange(nc) / CR
    phi1 = 2 * np.pi * np.cumsum(np.interp(ta, tc, f1)) / SR
    out = np.zeros(na)
    for k in range(N):
        out += AMP[k] * np.sin((k + 1) * phi1 + np.interp(ta, tc, psis[:, k]))
    env = np.ones(na)
    a = int(0.03 * SR); env[:a] = np.linspace(0, 1, a)
    rr = int(0.25 * SR); env[-rr:] = np.linspace(1, 0, rr) ** 2
    return out * env


def spans(t, mask):
    """[(start, end), ...] of runs where mask is True."""
    m = np.concatenate([[False], mask, [False]]).astype(int)
    d = np.diff(m); s = np.flatnonzero(d == 1); e = np.flatnonzero(d == -1) - 1
    return [(round(float(t[a]), 2), round(float(t[b]), 2)) for a, b in zip(s, e)]


def main():
    nc = int(round(CR * DUR)); t = np.arange(nc) / CR
    npre = int(round(CR * PREROLL)); tt = np.arange(nc - npre) / CR

    def path(zeta):
        return np.concatenate([np.full(npre, F0), damped_trajectory(F0, FT, zeta, WN, tt)])

    # the sweep: for each bow, which partial slips on the overshoot, how far out
    # of tune it goes at worst, and how many beats it makes in all
    under = path(0.2); sweep = []
    for Kc in SWEEP_K:
        psis, delta, locked = simulate(under, np.full(N, Kc))
        for k in range(N):
            if locked[-1, k] and (~locked[npre:, k]).any():
                dev = np.gradient(psis[:, k]) * CR / (2 * np.pi)
                i = int(np.argmax(np.abs(dev[npre:]))) + npre
                sweep.append(dict(K_hz=Kc, slipping_partial=k + 1,
                                  partial_level_db=round(20 * np.log10(1 / (k + 1)), 1),
                                  peak_drift_hz=round(float(abs(dev[i])), 1),
                                  peak_out_of_tune_pct=round(float(100 * abs(dev[i]) / ((k + 1) * under[i])), 2),
                                  beats_total=round(float((psis[-1, k] - psis[0, k]) / (2 * np.pi)), 1)))
    _, _, lk = simulate(under, np.full(N, K_BOW))
    SLIP = [k for k in range(N) if lk[-1, k] and (~lk[npre:, k]).any()][0]   # 0-based

    K_bow = np.full(N, K_BOW)
    K_held = K_bow.copy(); K_held[SLIP] = K_HELD

    specs = [(1, "firm-underdamped", "Underdamped arrival, firm bow", 0.2, K_bow),
             (2, "firm-critical", "Critically damped arrival, firm bow", 1.0, K_bow),
             (3, "firm-overdamped", "Overdamped arrival, firm bow", 2.0, K_bow),
             (4, "underdamped-held", f"Underdamped arrival, partial {SLIP + 1} held (control)", 0.2, K_held)]

    manifest = dict(params=dict(B_at_196Hz=B_AT_196, K_bow_hz=K_BOW, K_held_hz=K_HELD,
                                f0_hz=F0, target_hz=FT, wn=WN, partials=N, spectrum="1/n"),
                    bow_sweep=sweep, clips=[])
    res = {}
    for idx, name, label, zeta, K in specs:
        f1 = path(zeta)
        psis, delta, locked = simulate(f1, K)
        audio = synth(f1, psis)
        res[name] = dict(f1=f1, locked=locked, audio=audio)
        slip = {k + 1: spans(t, ~locked[:, k]) for k in range(N)
                if locked[-1, k] and (~locked[npre:, k]).any()}
        manifest["clips"].append(dict(idx=idx, name=name, label=label, zeta=zeta,
                                      peak_f1_hz=round(float(f1.max()), 1),
                                      locked_on_arrival=int(locked[-1].sum()),
                                      out_of_lock_spans_s=slip))

    # one shared normalisation for all four, so levels compare honestly
    pk = max(np.max(np.abs(r["audio"])) for r in res.values())
    for c in manifest["clips"]:
        a = res[c["name"]]["audio"] / pk * 0.7
        p = AUDIO / f"timbre-{c['idx']:02d}-{c['name']}.wav"
        wavfile.write(str(p), SR, np.int16(np.clip(a, -1, 1) * 32767))
        c["wav"] = str(p.relative_to(HERE))

    # isolation check, read from the audio itself: heterodyne each clip against
    # n times the fundamental's phase, low-pass, and differentiate the phase. That
    # gives the slipping partial's drift off its exact harmonic (Hz), the beating the
    # ear hears. A steady phase offset (inaudible) reads as zero drift.
    from scipy.signal import butter, sosfiltfilt
    sos = butter(4, 60, fs=SR, output="sos")
    ta = np.arange(len(res["firm-underdamped"]["audio"])) / SR
    def p2_drift(name):
        f1a = np.interp(ta, t, res[name]["f1"])
        phi1 = 2 * np.pi * np.cumsum(f1a) / SR
        z = res[name]["audio"] * np.exp(-1j * (SLIP + 1) * phi1)
        z = sosfiltfilt(sos, z.real) + 1j * sosfiltfilt(sos, z.imag)
        dev = np.gradient(np.unwrap(np.angle(z))) * SR / (2 * np.pi)
        hop = SR // 100
        return ta[::hop], dev[::hop]
    td, d01 = p2_drift("firm-underdamped"); _, d04 = p2_drift("underdamped-held")
    _, d02 = p2_drift("firm-critical"); _, d03 = p2_drift("firm-overdamped")
    body = (td > 0.1) & (td < DUR - 0.3)          # skip the fade edges
    def peak(d, m): return round(float(np.abs(d[m]).max()), 2)
    slipmask = np.zeros_like(td, bool)
    for a, b in manifest["clips"][0]["out_of_lock_spans_s"].get(SLIP + 1, []):
        slipmask |= (td >= a) & (td <= b)
    manifest["isolation_check"] = dict(
        pitch_paths_identical=bool(np.array_equal(res["firm-underdamped"]["f1"], res["underdamped-held"]["f1"])),
        slipping_partial=SLIP + 1,
        peak_drift_hz=dict(
            clip01_during_slips=peak(d01, body & slipmask),
            clip01_outside_slips=peak(d01, body & ~slipmask),
            clip04_whole_clip=peak(d04, body),
            clip02_whole_clip=peak(d02, body),
            clip03_whole_clip=peak(d03, body)),
        note="the slipping partial's frequency minus exactly n x the fundamental, measured from the rendered audio "
             "(heterodyne, 60 Hz low-pass, phase derivative); 0.1 s trimmed from the fade-in, 0.3 s from the fade-out")
    rel_t, rel_d = td, dict(d01=d01, d04=d04, d02=d02)

    # figure
    fig = plt.figure(figsize=(13, 7.4), dpi=110, facecolor=BG)
    gs = fig.add_gridspec(3, 1, height_ratios=[1.3, 1, 1], hspace=0.5)
    cols = {"firm-underdamped": "#d96b6b", "firm-critical": "#e0b020",
            "firm-overdamped": "#7fb069", "underdamped-held": FG3}
    ax = fig.add_subplot(gs[0]); style(ax)
    for name in ["firm-overdamped", "firm-critical", "firm-underdamped"]:
        ax.plot(t, res[name]["f1"], color=cols[name], lw=1.8, label=name.replace("firm-", ""))
    ax.axhline(FT, color=FG4, lw=0.8, ls="--")
    for a, b in manifest["clips"][0]["out_of_lock_spans_s"].get(SLIP + 1, []):
        ax.axvspan(a, b, color="#d96b6b", alpha=0.15)
    ax.set_xlim(0, DUR); ax.set_ylabel("fundamental (Hz)")
    ax.set_title(f"Same firm bow, three arrivals at E4. Shaded: where partial {SLIP + 1} is out of lock (underdamped only)",
                 color=FG1, fontsize=10)
    ax.legend(fontsize=8, facecolor=BG, edgecolor=FG4, labelcolor=FG1, loc="lower right")

    ax = fig.add_subplot(gs[1]); style(ax)
    for j, name in enumerate(["firm-underdamped", "underdamped-held", "firm-critical", "firm-overdamped"]):
        lk = res[name]["locked"][:, SLIP]
        ax.fill_between(t, j - 0.4, j + 0.4, where=~lk, step="post", color=cols[name], alpha=0.9)
        ax.fill_between(t, j - 0.4, j + 0.4, where=lk, step="post", color=cols[name], alpha=0.12)
    ax.set_yticks(range(4)); ax.set_yticklabels(["01 underdamped", "04 same pitch, held", "02 critical", "03 overdamped"],
                                                 color=FG3, fontsize=8)
    ax.set_xlim(0, DUR); ax.set_title(f"Partial {SLIP + 1}: solid = slipping, faint = locked", color=FG1, fontsize=10)

    ax = fig.add_subplot(gs[2]); style(ax)
    ax.plot(rel_t, rel_d["d01"], color=cols["firm-underdamped"], lw=1.4, label="01 underdamped")
    ax.plot(rel_t, rel_d["d04"], color=cols["underdamped-held"], lw=1.2, ls="--", label=f"04 same pitch path, partial {SLIP + 1} held")
    ax.plot(rel_t, rel_d["d02"], color=cols["firm-critical"], lw=1.0, alpha=0.8, label="02 critical")
    ax.set_xlim(0.1, DUR - 0.3); ax.set_xlabel("time (s)"); ax.set_ylabel("Hz off harmonic")
    ax.set_title(f"Partial {SLIP + 1}'s drift off its exact harmonic, measured from the audio", color=FG1, fontsize=10)
    ax.legend(fontsize=7.5, facecolor=BG, edgecolor=FG4, labelcolor=FG1, loc="upper right")
    fig.suptitle("Round three: the arrival heard in the tone colour", color=FG1, fontsize=13)
    p = FIGS / "timbre-round.png"; fig.savefig(p, facecolor=BG, bbox_inches="tight"); plt.close(fig)

    (HERE / "timbre-manifest.json").write_text(json.dumps(manifest, indent=2))
    print(json.dumps(manifest, indent=1))


if __name__ == "__main__":
    main()
