#!/usr/bin/env python3
"""
voicing_atlas.py
================

Which partial does each surface actually sound on each lock?

Writing Étude No. 2 taught that a note on this instrument is not "baseHz".
Each surface on each lock puts its energy on some harmonics and not others:
Knot Shadow on 1:1 is mostly fundamental, and on 3:2 it is a whistle on the
5th harmonic. This tool measures that for every catalog surface on every
lock the Hopf codebox can choose, straight from the surface's 2D spectrum.

THE MATH (conventions of RNBO/torus_2d_hopf.codebox):
  lock a:b  ->  height = (a-b)/(a+b),  f0 = 2*baseHz/(a+b)
                x rate w1 = b*f0,  y rate w2 = a*f0
  A surface coefficient c[m,n] (m cycles along x, n along y) sounds at
  harmonic h = |m*b + n*a| of f0. Terms with h = 0 are constant on the
  closed orbit and the DC blocker removes them.
  Coefficients that land on the same h add with a relative phase that
  depends on longitude (n * 2pi * longitude). So the energy on h is
  reported two ways: the longitude average (incoherent sum, the stable
  "character") and the min..max of the dominant harmonic's share over 32
  longitudes (how much turning longitude re-voices it).
  The pole (height -1) is not a lock: y rate is zero, longitude picks a
  row, and harmonic m of the x rate (2*baseHz) sounds. Reported averaged
  over rows, as share of energy, and the pitch multiple is 2*m.

Ignores the bilinear lookup's gentle low-pass and anything past Nyquist,
both of which depend on baseHz. Checked against the codebox itself by
proofs/voicing-atlas/check_against_codebox.mjs: the exact per-longitude
spectra match the codebox's output to the percent (2026-10-13).

    python3 Tools/voicing_atlas.py     -> proofs/voicing-atlas/voicing_atlas.json
                                          proofs/voicing-atlas/voicing_atlas.png
                                          proofs/voicing-atlas/voicing-atlas.html (data re-inlined)
"""
from __future__ import annotations
import json, os, struct, sys
from math import gcd
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from tinyplot import text, write_png

BUNDLE = os.path.dirname(HERE)
OUT = os.path.join(BUNDLE, 'proofs', 'voicing-atlas')
SIZE, HMAX, NLON, KC = 1024, 64, 32, 160

SURFACES = [
    ('01_sine_cycle_sweep', 'Sine Cycle Sweep'), ('02_partial_stack_sweep', 'Partial Stack'),
    ('03_duty_cycle_morph', 'Duty Cycle'), ('04_sine_plus_3rd_sweep', 'Sine + 3rd'),
    ('10_membrane', 'Membrane'), ('11_chladni_ghost', 'Chladni Ghost'),
    ('12_theta_surface', 'Theta'), ('13_stiff_string', 'Stiff String'),
    ('14_knot_shadow', 'Knot Shadow'), ('15_penrose_lattice', 'Penrose'),
    ('16_kuramoto_bloom', 'Kuramoto Bloom'), ('17_matern_field', 'Matern Field'),
    ('18_fisher_ridge', 'Fisher Ridge'),
]
# every coprime a:b with a, b <= 5, ordered by height from the pole upward
LOCKS = sorted({(a, b) for a in range(1, 6) for b in range(1, 6) if gcd(a, b) == 1},
               key=lambda ab: (ab[0] - ab[1]) / (ab[0] + ab[1]))


def read_surface(stem):
    b = open(os.path.join(BUNDLE, 'Wavetables', stem + '.wav'), 'rb').read()
    i = b.find(b'data'); n = struct.unpack('<I', b[i + 4:i + 8])[0]
    x = np.frombuffer(b[i + 8:i + 8 + n], dtype='<f4').astype(float)
    return x[:SIZE * SIZE].reshape(SIZE, SIZE)          # [row = y, col = x]


def spectrum(S):
    C = np.fft.fft2(S) / S.size                          # C[n (y), m (x)]
    k = np.fft.fftfreq(SIZE, 1.0 / SIZE).astype(int)
    n, m = np.meshgrid(k, k, indexing='ij')
    return C, m, n


def lock_energy(C, m, n, a, b):
    """Energy per harmonic 1..HMAX (+ overflow), longitude-averaged, plus the
    exact spectrum at NLON longitudes (from the coefficients with |m|,|n| <= KC,
    which carry all but a sliver of every surface's energy)."""
    hs = m * b + n * a
    h = np.abs(hs).ravel()
    keep = (h > 0)
    hc = np.minimum(h, HMAX + 1)
    P = (np.abs(C).ravel() ** 2)
    E = np.bincount(hc[keep], weights=P[keep], minlength=HMAX + 2)[1:]
    tot = E.sum()
    shares = E / tot if tot > 0 else E
    dom = int(np.argmax(shares[:HMAX])) + 1
    # coherent: at longitude L, c[m,n] picks up e^{i 2pi n L}. Fold signed h
    # onto |h| by summing h and -h separately (they are conjugates for a real
    # surface, so each contributes the same energy).
    band = ((np.abs(m) <= KC) & (np.abs(n) <= KC)).ravel()
    Cb, nb, hb = C.ravel()[band], n.ravel()[band], hs.ravel()[band]
    pos = (hb > 0) & (hb <= HMAX)
    per_lon = []
    for L in np.arange(NLON) / NLON:
        z = Cb[pos] * np.exp(2j * np.pi * nb[pos] * L)
        re = np.bincount(hb[pos], weights=z.real, minlength=HMAX + 1)[1:]
        im = np.bincount(hb[pos], weights=z.imag, minlength=HMAX + 1)[1:]
        e = 2 * (re ** 2 + im ** 2)
        per_lon.append(e / e.sum() if e.sum() > 0 else e)
    per_lon = np.array(per_lon)
    return shares, dom, per_lon


def pole_energy(S):
    R = np.fft.rfft(S, axis=1) / SIZE
    E = (np.abs(R[:, 1:]) ** 2).mean(axis=0)
    E = np.concatenate([E[:HMAX], [E[HMAX:].sum()]])
    return E / E.sum()


def summarize(shares):
    order = np.argsort(shares[:HMAX])[::-1]
    p = shares[shares > 0]
    return {
        'top': [[int(i) + 1, round(float(shares[i]), 3)] for i in order[:4]],
        'fundamental': round(float(shares[0]), 3),
        'above_%d' % HMAX: round(float(shares[HMAX]), 3),
        # effective number of partials: 1 = a sine, large = a cloud
        'partials': round(float(np.exp(-(p * np.log(p)).sum())), 1),
        'spectrum': [round(float(s), 4) for s in shares[:24]],
    }


def main():
    os.makedirs(OUT, exist_ok=True)
    atlas = {'conventions': {
        'lock': 'a:b -> height (a-b)/(a+b), f0 = 2*baseHz/(a+b), x rate b*f0, y rate a*f0',
        'harmonic': 'c[m,n] sounds at |m*b + n*a| * f0',
        'pitch_x_base': 'dominant harmonic * 2/(a+b): multiply by baseHz for the pitch you hear',
        'shares': 'longitude-averaged energy share per harmonic (DC removed)',
        'lon_range': 'dominant harmonic share, min..max over 32 longitudes (exact, coherent)',
        'lon_doms': 'every harmonic that is loudest at some longitude: one entry = longitude cannot re-voice it',
        'at_lon0': 'exact shares at longitude 0, harmonics 1..24',
        'purest': 'the longitude where one harmonic carries the most energy, that harmonic, its share',
        'lon_spectra': '16 longitudes (0, 1/16, ...) x harmonics 1..16, exact shares, for the playable atlas',
        'row_doms': 'pole only: loudest harmonic at each of 32 rows (longitude picks the row)',
        'pole': 'height -1, row-averaged; pitch multiple 2*m; row_spectra = 16 rows x harmonics 1..16'},
        'surfaces': {}}
    for stem, name in SURFACES:
        S = read_surface(stem)
        S = S - S.mean()
        C, m, n = spectrum(S)
        rec = {'pole': summarize(pole_energy(S))}
        dom = rec['pole']['top'][0][0]
        R = np.abs(np.fft.rfft(S[::SIZE // NLON], axis=1)[:, 1:HMAX + 1]) ** 2
        rec['pole'].update(dom=dom, pitch_x_base=2 * dom,
                           row_doms=sorted(set(int(d) + 1 for d in R.argmax(axis=1))),
                           row_spectra=[[round(float(v), 3) for v in (q / max(q.sum(), 1e-30))[:16]] for q in R[::2]])
        for a, b in LOCKS:
            sh, dom, pl = lock_energy(C, m, n, a, b)
            r = summarize(sh)
            doms = pl.argmax(axis=1) + 1
            r.update(dom=dom, pitch_x_base=round(dom * 2 / (a + b), 4),
                     lon_range=[round(float(pl[:, dom - 1].min()), 3), round(float(pl[:, dom - 1].max()), 3)],
                     lon_doms=sorted(set(int(d) for d in doms)),
                     at_lon0=[round(float(v), 4) for v in pl[0, :24]])
            # the purest voicing longitude can reach: where one partial carries most
            i, k = np.unravel_index(np.argmax(pl), pl.shape)
            r['purest'] = {'longitude': round(i / NLON, 4), 'h': int(k) + 1,
                           'share': round(float(pl[i, k]), 3),
                           'pitch_x_base': round((int(k) + 1) * 2 / (a + b), 4)}
            # for the playable atlas: every other longitude, harmonics 1..16
            r['lon_spectra'] = [[round(float(v), 3) for v in pl[j, :16]] for j in range(0, NLON, 2)]
            rec['%d:%d' % (a, b)] = r
        atlas['surfaces'][name] = rec
        print(f'{name:16s} pole h{rec["pole"]["dom"]:<2d}  ' + '  '.join(
            f'{k} h{rec[k]["dom"]}:{int(100 * rec[k]["top"][0][1])}%'
            for k in ('1:1', '1:2', '2:1', '2:3', '3:2')))
    json.dump(atlas, open(os.path.join(OUT, 'voicing_atlas.json'), 'w'), indent=1)
    draw(atlas)
    page(atlas)
    checks(atlas)


def draw(atlas):
    cols = ['pole'] + ['%d:%d' % l for l in LOCKS]
    names = list(atlas['surfaces'])
    CW, CH, LW, TOP = 58, 40, 236, 96
    W, Hh = LW + CW * len(cols) + 20, TOP + CH * len(names) + 80
    img = np.full((Hh, W, 3), 14, np.uint8)
    text(img, 20, 16, 'VOICING ATLAS - WHICH HARMONIC SOUNDS, PER SURFACE AND LOCK', (235, 235, 235), 2)
    text(img, 20, 40, 'BIG NUMBER = LOUDEST HARMONIC OF F0.  SMALL = ITS SHARE %.  BRIGHT = PURE, DARK = A CLOUD', (150, 150, 150), 1)
    for j, c in enumerate(cols):
        text(img, LW + j * CW + 8, TOP - 22, c.upper(), (200, 200, 200), 2 if len(c) <= 4 else 1)
    for i, nm in enumerate(names):
        y = TOP + i * CH
        text(img, 16, y + 13, nm, (220, 220, 220), 2)
        for j, c in enumerate(cols):
            r = atlas['surfaces'][nm][c]
            share = r['top'][0][1]
            purity = 1.0 / max(r['partials'], 1.0)
            # warm = pure (one partial carries it), cool = a cloud
            t = min(1.0, share)
            col = (int(40 + 200 * t), int(40 + 120 * t * purity + 40 * t), int(90 - 50 * t + 100 * (1 - t)))
            img[y + 2:y + CH - 2, LW + j * CW + 2:LW + (j + 1) * CW - 2] = col
            text(img, LW + j * CW + 8, y + 7, str(r['dom']), (255, 255, 255), 2)
            text(img, LW + j * CW + 8, y + 26, f'{int(round(100 * share))}%', (20, 20, 20) if t > 0.6 else (230, 230, 230), 1)
    text(img, 20, Hh - 50, 'LOCK A:B  F0 = 2 X BASEHZ/(A+B).  POLE = HEIGHT -1 (1D SYNTH), HARMONIC OF 2 X BASEHZ.', (150, 150, 150), 1)
    text(img, 20, Hh - 32, 'LONGITUDE-AVERAGED.  MEASURED FROM EACH SURFACE 2D SPECTRUM BY TOOLS/VOICING_ATLAS.PY', (150, 150, 150), 1)
    write_png(os.path.join(OUT, 'voicing_atlas.png'), img)


def page(atlas):
    """Inline a compact copy of the atlas into the playable page, between its
    atlas-data script tags, so the page works offline and in a sandbox."""
    import re
    cols = ['pole'] + ['%d:%d' % l for l in LOCKS]
    D = {'cols': cols, 'names': list(atlas['surfaces']), 'surfaces': {}}
    for nm, rec in atlas['surfaces'].items():
        D['surfaces'][nm] = {}
        for c in cols:
            r = rec[c]
            d = {'dom': r['dom'], 'share': r['top'][0][1], 'partials': r['partials']}
            if c == 'pole':
                d.update(spectra=r['row_spectra'], row_doms=r['row_doms'])
            else:
                d.update(spectra=r['lon_spectra'], lon_doms=r['lon_doms'], purest=r['purest'])
            D['surfaces'][nm][c] = d
    hp = os.path.join(OUT, 'voicing-atlas.html')
    html = open(hp, encoding='utf-8').read()
    blob = json.dumps(D, separators=(',', ':'))
    html = re.sub(r'(<script id="atlas-data" type="application/json">)[\s\S]*?(</script>)',
                  lambda m: m.group(1) + blob + m.group(2), html, count=1)
    open(hp, 'w', encoding='utf-8').write(html)


def checks(atlas):
    s = atlas['surfaces']
    print('\nSANITY (the exact codebox A/B is proofs/voicing-atlas/check_against_codebox.mjs):')
    print('  Penrose 1:2 top', s['Penrose']['1:2']['top'], '- five equal plane waves: 4, 12, 16, 24, 22')
    print('  Penrose pole top', s['Penrose']['pole']['top'], '- 3, 9, 11, loudest 3rd')
    pur = sorted(((r['purest']['share'], nm, k, r['purest']) for nm, rec in s.items()
                  for k, r in rec.items() if k != 'pole'), key=lambda t: t[0], reverse=True)
    print('  purest voicings:')
    for sh, nm, k, p in pur[:6]:
        print(f"    {nm} {k} at longitude {p['longitude']}: {int(100 * sh)}% on h{p['h']} = {p['pitch_x_base']} x baseHz")


if __name__ == '__main__':
    main()
