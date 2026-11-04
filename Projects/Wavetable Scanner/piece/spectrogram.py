"""spectrogram.py — draws tour.wav as tour-spectrogram.png (numpy, a PPM, then sips). Amber on
the CRT's dark, with a bright line where each table's section begins."""
import numpy as np, wave, subprocess, pathlib
H = pathlib.Path(__file__).parent
w = wave.open(str(H / 'tour.wav')); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).mean(1) / 32768.
N, hop, W, Hh, top = 4096, 441, 1400, 420, 12000
win = np.hanning(N); cols = (len(x) - N) // hop
S = np.abs(np.fft.rfft(np.stack([x[i * hop:i * hop + N] * win for i in range(cols)]), axis=1))
S = 20 * np.log10(S + 1e-9); S = np.clip((S - S.max() + 90) / 90, 0, 1)
fbin = np.linspace(0, top, Hh) / (sr / N)
img = S[:, np.round(fbin).astype(int)].T[::-1]                      # rows high→low Hz
img = img[:, np.round(np.linspace(0, cols - 1, W)).astype(int)]
amber, bg = np.array([255, 176, 0]), np.array([11, 15, 12])
rgb = (bg + (amber - bg) * (img[..., None] ** 1.6)).astype(np.uint8)
for k in range(4): rgb[:, int(k * 11.5 * sr / hop * W / cols)] = [255, 230, 160]
with open(H / 'tour-spectrogram.ppm', 'wb') as f: f.write(b'P6 %d %d 255\n' % (W, Hh)); f.write(rgb.tobytes())
subprocess.run(['sips', '-s', 'format', 'png', str(H / 'tour-spectrogram.ppm'), '--out', str(H / 'tour-spectrogram.png')], check=True, capture_output=True)
(H / 'tour-spectrogram.ppm').unlink()
