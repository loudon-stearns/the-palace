# Builds report.html from the gauntlet's results: one standalone page, everything inline.
#   python3 report.py      (after: node gauntlet.mjs make; then run and sweep with no reader, and with each of
#                           careful-reader.mjs, backward-reader.mjs, checked-backward-reader.mjs)
import json, base64, struct, io, wave, html, pathlib
here = pathlib.Path(__file__).parent
ans = {a['name']: a for a in json.load(open(here / 'files/answers.json'))}
# the readers, in the order the page sets them side by side: (short name, results suffix)
READERS = [('GoButton', ''), ('careful', '-careful-reader'), ('room', '-backward-reader'), ('room, checked', '-checked-backward-reader')]
res = {n: {r['name']: r for r in json.load(open(here / f'results{x}.json'))} for n, x in READERS}
swp = {n: json.load(open(here / f'sweeps{x}.json')) for n, x in READERS}
sg = swp['GoButton']

def samples(name):
    with wave.open(str(here / 'files' / (name + '.wav'))) as w:
        sr = w.getframerate(); raw = w.readframes(w.getnframes())
    return sr, struct.unpack('<%dh' % (len(raw) // 2), raw)

def wavesvg(name, ms=6, at=0.5):
    sr, y = samples(name); a = int(at * sr); n = max(2, int(ms / 1000 * sr)); seg = y[a:a + n]
    pts = ' '.join('%.1f,%.1f' % (i / (n - 1) * 300, 30 - v / 32768 * 28) for i, v in enumerate(seg))
    return f'<svg viewBox="0 0 300 60" class="w"><line x1="0" y1="30" x2="300" y2="30" class="z"/><polyline points="{pts}"/></svg>'

def clip(name, secs=1.5):
    sr, y = samples(name); seg = y[:int(secs * sr)]
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(struct.pack('<%dh' % len(seg), *[int(v * 0.25) for v in seg]))
    return 'data:audio/wav;base64,' + base64.b64encode(buf.getvalue()).decode()

def cell(r):
    if r['wrong']: return f'<td class="lie">{r["right"]}/{r["expected"]} · <b>{r["wrong"]} wrong</b></td>'
    return f'<td class="{"ok" if r["pass"] else "deaf"}">{r["right"]}/{r["expected"]}</td>'

rows = ''.join(f'<tr><td class="n">{html.escape(k)}</td><td>{wavesvg(k)}</td><td class="why">{html.escape(ans[k]["why"])}</td>{"".join(cell(res[n][k]) for n, _ in READERS)}</tr>' for k in ans)

labels = {'noise': ('noise, dB below the code', ''), 'sampleRate': ('sample rate, 30 fps', ' Hz'), 'lowpass': ('low-pass, 30 fps', ' Hz'),
          'highpassWithNoise': ('high-pass + noise 20 dB down, 24 fps', ' Hz'), 'dc': ('DC offset (signal ±0.5), 6 kHz low-pass', ''), 'speed': ('tape speed, 25 fps', '×')}
def strip(k):
    head = ''.join(f'<th>{v}{labels[k][1]}</th>' for v, _, _ in sg[k])
    def line(rs): return ''.join(f'<td class="{"lie" if w else ("ok" if f > .9 else ("part" if f > 0 else "deaf"))}">{round(f*100)}%{"<br><b>"+str(w)+" wrong</b>" if w else ""}</td>' for _, f, w in rs)
    return f'<h3>{labels[k][0]}</h3><table class="sw"><tr><th></th>{head}</tr>{"".join(f"<tr><th>{n}</th>{line(swp[n][k])}</tr>" for n, _ in READERS)}</table>'

lies = {n: sum(r['wrong'] for r in res[n].values()) + sum(w for rs in swp[n].values() for _, _, w in rs) for n, _ in READERS}
passes = {n: sum(r['pass'] for r in res[n].values()) for n, _ in READERS}
score = ''.join(f'<tr><th>{n}</th><td class="{"lie" if lies[n] else "ok"}">{lies[n]}</td><td>{passes[n]} of {len(ans)}</td><td class="{"ok" if res[n]["23-reverse"]["pass"] else "deaf"}">{"reads" if res[n]["23-reverse"]["pass"] else "deaf"}</td></tr>' for n, _ in READERS)
listen = ''.join(f'<div class="l"><span>{n}</span><audio controls preload="none" src="{clip(n)}"></audio></div>' for n in ['00-clean-30', '13-eq-peak', '08-noise-6dB', '22-tape-stop', '16-mp3-32'])

page = f'''<!doctype html><meta charset="utf-8"><title>SMPTE LTC — the hostile gauntlet</title>
<style>
body{{background:#0f1210;color:#d8e0d4;font:14px/1.5 "JetBrains Mono",ui-monospace,monospace;margin:24px;max-width:1100px}}
h1{{font-size:20px;margin:0 0 4px}} h2{{font-size:15px;margin:28px 0 6px;color:#9fd39a}} h3{{font-size:13px;margin:14px 0 4px;color:#b9c4b4}}
p{{max-width:820px}} table{{border-collapse:collapse;width:100%}} td,th{{padding:3px 6px;border-bottom:1px solid #26302a;vertical-align:middle;text-align:left}}
.n{{white-space:nowrap}} .why{{color:#9aa596;font-size:12px}} svg.w{{width:150px;height:30px}} svg.w polyline{{fill:none;stroke:#9fd39a;stroke-width:1.2}} svg.w .z{{stroke:#334;stroke-width:.5}}
.ok{{color:#9fd39a}} .deaf{{color:#6b7568}} .part{{color:#d9c27a}} .lie{{color:#ff8a5c;background:#2a1712}}
.sw td,.sw th{{text-align:center;font-size:12px;border:1px solid #26302a}} .big{{font-size:28px;color:#ff8a5c}} .big.g{{color:#9fd39a}}
.l{{display:flex;gap:12px;align-items:center;margin:4px 0}} .l span{{width:160px}} code{{color:#e7d9a8}}
</style>
<h1>The hostile gauntlet</h1>
<p>Twenty-six LTC files, each broken one way on purpose, with an answer key. Four readers took it, told nothing: no frame rate, no polarity, no speed. <b>GoButton</b> is the <code>ltc.js</code> reader the show runs, untouched. <b>careful</b> is the same code with three changes. <b>room</b> is the teaching room's backward reader, lifted out of its page as it stands. <b>room, checked</b> is the room's reader with one change: a frame counts only when it follows the frame before.</p>
<table style="width:auto"><tr><th>reader</th><th>wrong frames, files + sweeps</th><th>files passed</th><th>played backward</th></tr>{score}</table>
<p>A wrong frame is the worst thing a reader can do: a lighting desk that hears no timecode waits, but one that hears the wrong time jumps the show. LTC has no checksum. It has two checks a reader can make for free: the polarity bit keeps every frame's count of 0s even, and every frame is the one after the frame before. GoButton's reader makes neither. The room's reader makes the first, and it is not enough: at a 7 kHz sample rate it read 98 frames, every one wrong and every one with an even count of 0s, and not one following the one before. The second check is the one that holds.</p>
<h2>Listen (quiet: a quarter of full level)</h2>{listen}
<h2>The files</h2>
<table><tr><th>file</th><th>6 ms of it</th><th>what was done</th>{''.join(f'<th>{n}</th>' for n, _ in READERS)}</tr>{rows}</table>
<p class="why">Read as right / expected frames. A pass allows three frames short (one never whole at the start, one cut at the end, one the careful reader spends confirming), more where a file says why. Orange is a wrong frame. Grey is a reader that heard nothing, which is honest.</p>
<h2>Where each reader breaks</h2>
{''.join(strip(k) for k in labels)}
<h2>The careful reader's three changes</h2>
<p><b>Listen with hysteresis.</b> A flip counts only when the signal crosses a band a fifth of its height wide, centred on its own middle. Noise 10 dB down: 64% read and 26 wrong becomes 94% and none. The cost: through a 1.2 kHz low-pass the 1s no longer reach the band and the reader goes deaf, where GoButton's still reads. Wider bands read more noise and less smear; there is no free width.</p>
<p><b>A gap is a gap.</b> A pulse over four bits long is silence, not a new measure of the bit: forget the measure and learn it again.</p>
<p><b>Trust only a checked frame.</b> Even 0s, and the frame after the last. On the EQ file GoButton's reader found every sync word and read 119 frames, all wrong; the careful reader passed on none. Silence beat a lie. It costs one frame of delay at every lock.</p>
<h2>The room's reader, and its one change</h2>
<p>The room's reader works on a whole buffer: it times every edge first, then sorts the gaps, locking on the 90th-percentile gap of the next forty, and looks for the sync word both ways round. So it reads <code>23-reverse</code>, which no other reader does, and holds through a 1.2 kHz low-pass and a 2 kHz high-pass under noise, where the careful reader goes deaf. It finds its crossings at the true zero, so hum as loud as the code and a 40%-plus DC offset take it, and at 8 kHz, 1.7 samples a half bit, its edges blur. <b>Follows the last</b>, in the direction it is running, under any count a tape can have, costs it one frame a lock and takes its wrong frames from 102 to none.</p>
<h2>Still open</h2>
<p>No reader takes noise 6 dB down or the resonant EQ. The 32 kbps MP3 is closer than it looked: the first gauntlet's copy was secretly at double speed (lame drops to 22.05 kHz at that bitrate, and it was read back at 44.1); fixed, every reader reads most of it and none passes. A reader that times its crossings through a filter matched to the bit, rather than the raw zero, should take more of them.</p>
'''
(here / 'report.html').write_text(page)
print('report.html', len(page) // 1024, 'KB; wrong frames', lies, 'passed', passes)
