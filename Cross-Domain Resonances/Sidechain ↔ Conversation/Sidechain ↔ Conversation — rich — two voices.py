"""
title: Sidechain ↔ Conversation — rich — two voices (recipe)
born: 2026-11-03
parent: [[Sidechain ↔ Conversation]] · rich face, proposal round 2026-11
forward_vector: I am how the two synthetic voices in the piece "who yields when" were made, so anyone can
  make them again: a speaker (Kokoro af_heart, the voice the palace already publishes) saying three short
  lines in the page's own words, and a listener whose inner voice never stops (Kokoro am_michael) saying
  the page's student quotes about planning a reply. Both resampled to 16 kHz, matched in speech level,
  companded to 8 bits (mu-law, mu = 255) and written as base64 into the piece between its markers.

Run:  ~/.venvs/kokoro/bin/python "Sidechain ↔ Conversation — rich — two voices.py" <scratch dir>
It writes <scratch dir>/voices.json; the piece's data script is that file's contents, word for word.
Kokoro is open weights (Apache-2.0); nothing licensed is used.
"""
import base64, json, sys
from pathlib import Path
import numpy as np
from kokoro import KPipeline

OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
SR_IN, SR = 24000, 16000
A_LINES = ["When one person speaks, the other listens.",
           "Two voices can't hold the same space at once.",
           "So one of us makes room."]
B_LINES = ["Right, and what I'll say next is this.",
           "I had a thought about that.",
           "Actually, here's my point.",
           "Wait, let me just add one thing.",
           "And another thing, while I'm at it.",
           "I know exactly what I'll say."]

pipe = KPipeline(lang_code="a")

def say(text, voice, speed):
    a = np.concatenate([np.asarray(x) for _, _, x in pipe(text, voice=voice, speed=speed)]).astype(np.float64)
    pk = np.max(np.abs(a)); on = np.where(np.abs(a) > pk * 10 ** (-45 / 20))[0]
    a = a[max(0, on[0] - 240): min(len(a), on[-1] + 480)]
    # resample 24 kHz -> 16 kHz: band-limit with a windowed sinc at 7.6 kHz, then take every 1.5th sample
    t = np.arange(-64, 65); h = np.sinc(2 * 7600 / SR_IN * t) * np.hanning(129); h /= h.sum()
    a = np.convolve(a, h, mode="same")
    pos = np.arange(0, len(a) - 1, SR_IN / SR)
    return np.interp(pos, np.arange(len(a)), a)

A = [say(s, "af_heart", 1.0) for s in A_LINES]
B = [say(s, "am_michael", 1.05) for s in B_LINES]
gapB = int(0.16 * SR)
b = np.concatenate(sum([[x, np.zeros(gapB)] for x in B], []))
L = len(b)
sumA = sum(len(x) for x in A)
gapA = (L - sumA) // 3
a = np.zeros(L); phrases = []; p = gapA // 2
for x in A:
    a[p:p + len(x)] = x; phrases.append([p / SR, (p + len(x)) / SR]); p += len(x) + gapA

def level(x):
    act = np.abs(x) > np.max(np.abs(x)) * 0.05
    return np.sqrt(np.mean(x[act] ** 2))
a *= 0.16 / level(a); b *= 0.16 / level(b)
for x in (a, b):
    x *= min(1.0, 0.97 / np.max(np.abs(x)))
for x in (a, b):   # 8 ms fades at the loop's ends, so the seam is silent in both
    f = int(0.008 * SR); r = np.linspace(0, 1, f); x[:f] *= r; x[-f:] *= r[::-1]

MU = 255.0
def mulaw(x):
    y = np.sign(x) * np.log1p(MU * np.abs(x)) / np.log1p(MU)
    return (np.round(y * 127) + 128).astype(np.uint8)

data = {"sr": SR, "n": L, "mu": MU,
        "phrases": [[round(s, 4), round(e, 4)] for s, e in phrases],
        "a_lines": A_LINES, "b_lines": B_LINES, "a_voice": "af_heart", "b_voice": "am_michael",
        "a": base64.b64encode(mulaw(a).tobytes()).decode(), "b": base64.b64encode(mulaw(b).tobytes()).decode()}
(OUT / "voices.json").write_text(json.dumps(data, separators=(",", ":")))
np.save(OUT / "a.npy", a); np.save(OUT / "b.npy", b)
print("loop", L / SR, "s · A phrases", data["phrases"], "· gapA", gapA / SR, "s")
