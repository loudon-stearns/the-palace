#!/usr/bin/env python3
"""Check pendulum-slider.html's in-browser solver against numpy.

Pulls the <script id="core"> block out of the page, runs it in node, and
compares (1) the energy levels and (2) the partial ratios and loudnesses
against a numpy eigh of the same matrix, plus pendulum.py's published
ratios. Prints the result; writes pendulum-slider-checks.txt beside it.
"""
import json, os, re, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
html = open(os.path.join(HERE, "pendulum-slider.html")).read()
core = re.search(r'<script id="core">(.*?)</script>', html, re.S).group(1)
QS = [0.0, 0.5, 1.5, 3.0, 6.0, 10.0, 18.0, 32.0, 40.0]
js = core + f"\nconsole.log(JSON.stringify({QS}.map(q => strike(q))));"
out = json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)

K = 40; k = np.arange(-K, K + 1); M = 1024; X = np.arange(M) / M
PLUCK, PW, PICK = 0.40, 0.022, 0.46
d = np.minimum(np.abs(X - PLUCK) % 1, 1 - np.abs(X - PLUCK) % 1)
PL = np.exp(-d**2 / (2 * PW**2))
lines = []
P = lambda s: (print(s), lines.append(s))
P("== pendulum-slider.html solver (node) vs numpy eigh, K = 40 ==")
worst_E = worst_r = worst_a = 0
for q, js_s in zip(QS, out):
    H = np.diag(k.astype(float)**2) + np.diag(np.full(2*K, q/2), 1) + np.diag(np.full(2*K, q/2), -1)
    E, U = np.linalg.eigh(H)
    full = np.zeros((M, U.shape[1]), complex); full[k % M] = U
    phi = np.fft.ifft(full, axis=0) * M
    c = (phi.conj() * PL[:, None]).mean(0)
    pick = U.T @ np.exp(2j * np.pi * k * PICK)          # phi_n at the pickup, exactly (not on the grid)
    a = np.real(c * pick)[1:41]
    r = (E[1:41] - E[0]) / (E[1] - E[0])
    jE = np.array(js_s["E"][:41]); jr = np.array([p["ratio"] for p in js_s["partials"]])
    ja = np.array([p["amp"] for p in js_s["partials"]])
    # loudness: compare shapes (each normalised to its loudest); eigenvector sign is arbitrary but a_n is sign-invariant
    # High up the ladder the even/odd pairs split by less than machine precision, so each solver
    # may pick a different mix within a pair. Only the pair's summed loudness is meaningful (it is
    # the same frequency), so sum partials whose levels agree to 1e-6 before comparing.
    def merged(amp):
        out, i = [], 0
        while i < len(amp):
            j = i + 1
            while j < len(amp) and abs(E[j + 1] - E[i + 1]) < 1e-6: j += 1
            out.append(amp[i:j].sum()); i = j
        return np.array(out)
    a, ja = merged(a), merged(ja)
    an, jan = a / np.abs(a).max(), ja / np.abs(ja).max()
    eE, er, ea = np.abs(jE - E[:41]).max(), np.abs(jr - r).max(), np.abs(jan - an).max()
    worst_E, worst_r, worst_a = max(worst_E, eE), max(worst_r, er), max(worst_a, ea)
    P(f"  q = {q:5.1f}: levels max diff {eE:.1e} · ratios {er:.1e} · loudness shape {ea:.1e} · first ratios {' '.join(f'{v:.2f}' for v in jr[:6])}")
P(f"  worst: levels {worst_E:.1e}, ratios {worst_r:.1e}, loudness {worst_a:.1e}")
ok = worst_E < 1e-8 and worst_r < 1e-8 and worst_a < 1e-3
P("  PASS" if ok else "  FAIL")
open(os.path.join(HERE, "pendulum-slider-checks.txt"), "w").write("\n".join(lines) + "\n")
