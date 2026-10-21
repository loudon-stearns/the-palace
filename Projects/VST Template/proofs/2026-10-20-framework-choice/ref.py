# numpy reference: ride.py's per-sample body, constant B and K, unpinned; dumps constants + tone
import numpy as np, sys
SR, F0 = 44100, 110.0
N = int(sys.argv[1]); B = float(sys.argv[2]); K = float(sys.argv[3]); secs = float(sys.argv[4])
n = np.arange(1, N+1); amp = n**-0.7; BACK = 21.0/n.sum()
rng = np.random.default_rng(7); DET = 1 + rng.uniform(-0.004, 0.004, N); w = n*F0*DET
p = np.zeros(N); ph = rng.uniform(0, 1, N); Fp = F0
np.savetxt(f"const_{N}.txt", np.stack([DET, ph]), fmt="%.17g")
steps = int(secs*SR); dt = 1/SR; tone = np.zeros(steps); F = np.zeros(steps)
for i in range(steps):
    r = n*np.sqrt(1 + B*n*n)
    gate = np.clip((4000.0 - np.abs(r*Fp - w))/1000.0, 0, 1)
    s = np.sin(2*np.pi*(ph - p))*gate
    dth = F0 + BACK*K*(r*s).sum()
    p += r*dth*dt; ph += (w - K*s)*dt; Fp = dth
    g = amp*np.clip((19000.0 - r*dth)/3000.0, 0, 1)
    tone[i] = g @ np.sin(2*np.pi*p); F[i] = dth
np.save(f"ref_{N}_{B:g}_{K:g}.npy", np.stack([tone, F]))
