# The loop of study v1.4, as arithmetic: retune() reproduced exactly, then the
# partials solved from the loop's phase delay (partial n sits where the whole
# loop delays it by exactly n of its own periods). Used to measure how much a
# given stiffness stretches the partials at each pitch, and to design v1.5's
# pitch-independent mapping. Checked against headless renders in measure_v15.py.
import numpy as np
SR = 48000; NAP = 8; C_MAX = 0.8; MIN_LEN = 8
def tauLP(a, w): return np.arctan2(a*np.sin(w), 1-a*np.cos(w))/w
def tauAP(c, w):
    ph = np.arctan2(-np.sin(w), c+np.cos(w)) - np.arctan2(-c*np.sin(w), 1+c*np.cos(w))
    return -ph/w
def tauEnd(g, a, w):
    dr = 1-a*np.cos(w); di = a*np.sin(w); m = (1-a)/(dr*dr+di*di)
    return -np.arctan2((1-g)*m*-di, g+(1-g)*m*dr)/w
P0 = dict(bright=0.55, bridge=0.985, nut=0.995)

def build(freq, c, bright=0.55, bridge=0.985, nut=0.995):
    """Given a dispersion coefficient, the loop as retune() would set it."""
    w = 2*np.pi*freq/SR; D = SR/freq; a = (1-bright)*0.9
    dcA = np.exp(-2*np.pi*0.25*freq/SR)
    tLP = 2*tauLP(a, w) + tauEnd(bridge, dcA, w) + tauEnd(nut, dcA, w)
    rem = D - tLP - NAP*tauAP(c, w)
    if rem < 2*MIN_LEN + 0.5: return None
    L = int(max(MIN_LEN, np.floor((rem-0.5)/2))); target = rem - 2*L; dd = target
    for _ in range(4):
        eta = (1-dd)/(1+dd); dd += target - tauAP(eta, w)
    eta = (1-dd)/(1+dd)
    def loopdelay(wv):
        return 2*L + 2*tauLP(a, wv) + tauEnd(bridge, dcA, wv) + tauEnd(nut, dcA, wv) + NAP*tauAP(c, wv) + tauAP(eta, wv)
    return loopdelay

def v14_c(freq, stiff):
    w = 2*np.pi*freq/SR; D = SR/freq; a = (1-0.55)*0.9
    dcA = np.exp(-2*np.pi*0.25*freq/SR)
    tLP = 2*tauLP(a, w) + tauEnd(0.985, dcA, w) + tauEnd(0.995, dcA, w)
    c = -C_MAX*stiff**0.6
    while D - tLP - NAP*tauAP(c, w) < 2*MIN_LEN + 0.5 and c < 0: c = min(0, c+0.01)
    return c

def partials(freq, c, nmax=16, fmax=12000):
    ld = build(freq, c)
    if ld is None: return None
    out = []
    for n in range(1, nmax+1):
        f = n*freq
        for _ in range(60):
            f = n*SR/ld(2*np.pi*f/SR)
        if f > fmax: break
        out.append(f)
    return np.array(out)

def fitB(fs):
    """Least squares on (f_n / n)^2 = f0^2 (1 + B n^2): a line in n^2."""
    n = np.arange(1, len(fs)+1); y = (fs/n)**2
    k, b = np.polyfit(n**2, y, 1); return k/b

def cents8(fs): return 1200*np.log2(fs[min(7, len(fs)-1)]/((min(7, len(fs)-1)+1)*fs[0]))
