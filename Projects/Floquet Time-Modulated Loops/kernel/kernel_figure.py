"""The surface, its 2D spectrum, and the filter's bi-frequency map, per surface.
Run after floquet_kernel.py:  /usr/local/bin/python3 kernel_figure.py → kernel_map.png"""
import numpy as np, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
from floquet_kernel import SURF, kernel, bifreq, FS, L
from surface_io import load_surface
M = 14
fig, ax = plt.subplots(3, 3, figsize=(15, 11), facecolor="#111317",
                       gridspec_kw={"width_ratios": [1, 1, 2.2]})
for r, (name, stem) in enumerate(SURF.items()):
    S = load_surface(stem)
    C = np.abs(np.fft.fftshift(np.fft.fft2(S))) / S.size
    c0 = 512
    C = C[c0 - M:c0 + M + 1, c0:c0 + 2 * M + 1]          # rows n = -M..M, cols m = 0..2M
    f, n, H = bifreq(kernel(stem), fmax=(2 * M + 1) * FS / L, nmax=M)
    for a in ax[r]: a.set_facecolor("#111317"); a.tick_params(colors="#aaa", labelsize=8)
    ax[r, 0].imshow(S, cmap="magma", origin="lower", extent=[0, 1, 0, 1])
    ax[r, 0].set_title(f"{name}: the surface", color="#ddd", fontsize=10)
    ax[r, 0].set_xlabel("fast axis → the taps", color="#aaa", fontsize=8)
    ax[r, 0].set_ylabel("slow axis → scanned at f_mod", color="#aaa", fontsize=8)
    ax[r, 1].imshow(20 * np.log10(C + 1e-6), cmap="viridis", vmin=-60, vmax=-18, origin="lower",
                    extent=[-.5, 2 * M + .5, -M - .5, M + .5], aspect="auto")
    ax[r, 1].set_title("its 2D spectrum", color="#ddd", fontsize=10)
    ax[r, 1].set_xlabel("fast-axis mode m", color="#aaa", fontsize=8)
    ax[r, 1].set_ylabel("slow-axis mode n", color="#aaa", fontsize=8)
    Hd = 20 * np.log10(H / H.max() + 1e-6)
    ax[r, 2].imshow(Hd, cmap="viridis", vmin=-42, vmax=0, origin="lower", aspect="auto",
                    extent=[f[0], f[-1], n[0] - .5, n[-1] + .5])
    ax[r, 2].set_title("the filter: an input at this frequency comes out shifted by n·f_mod", color="#ddd", fontsize=10)
    ax[r, 2].set_xlabel(f"input frequency, Hz   (passbands every {FS / L:.2f} Hz = one fast-axis mode)", color="#aaa", fontsize=8)
    ax[r, 2].set_ylabel("shift rung n", color="#aaa", fontsize=8)
fig.suptitle("A surface read as a filter that changes over time: the surface's 2D spectrum is the filter's map", color="#eee", fontsize=13)
fig.tight_layout(rect=[0, 0, 1, 0.96])
fig.savefig("kernel_map.png", dpi=110, facecolor=fig.get_facecolor())
