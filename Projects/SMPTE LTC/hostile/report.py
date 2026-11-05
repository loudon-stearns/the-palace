# Builds report.html from the gauntlet's results: one standalone page, everything inline.
#   python3 report.py      (after: node gauntlet.mjs make; run; run careful-reader.mjs; sweep; sweep careful-reader.mjs)
import json, base64, struct, io, wave, html, pathlib
here = pathlib.Path(__file__).parent
ans = {a['name']: a for a in json.load(open(here / 'files/answers.json'))}
gb = {r['name']: r for r in json.load(open(here / 'results.json'))}
cr = {r['name']: r for r in json.load(open(here / 'results-careful-reader.json'))}
sg = json.load(open(here / 'sweeps.json')); sc = json.load(open(here / 'sweeps-careful-reader.json'))

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

rows = ''.join(f'<tr><td class="n">{html.escape(k)}</td><td>{wavesvg(k)}</td><td class="why">{html.escape(ans[k]["why"])}</td>{cell(gb[k])}{cell(cr[k])}</tr>' for k in ans)

labels = {'noise': ('noise, dB below the code', ''), 'sampleRate': ('sample rate, 30 fps', ' Hz'), 'lowpass': ('low-pass, 30 fps', ' Hz'),
          'highpassWithNoise': ('high-pass + noise 20 dB down, 24 fps', ' Hz'), 'dc': ('DC offset (signal ±0.5), 6 kHz low-pass', ''), 'speed': ('tape speed, 25 fps', '×')}
def strip(k):
    head = ''.join(f'<th>{v}{labels[k][1]}</th>' for v, _, _ in sg[k])
    def line(rs): return ''.join(f'<td class="{"lie" if w else ("ok" if f > .9 else ("part" if f > 0 else "deaf"))}">{round(f*100)}%{"<br><b>"+str(w)+" wrong</b>" if w else ""}</td>' for _, f, w in rs)
    return f'<h3>{labels[k][0]}</h3><table class="sw"><tr><th></th>{head}</tr><tr><th>GoButton</th>{line(sg[k])}</tr><tr><th>careful</th>{line(sc[k])}</tr></table>'

lies_g = sum(r['wrong'] for r in gb.values()) + sum(w for rs in sg.values() for _, _, w in rs)
lies_c = sum(r['wrong'] for r in cr.values()) + sum(w for rs in sc.values() for _, _, w in rs)
pg = sum(r['pass'] for r in gb.values()); pc = sum(r['pass'] for r in cr.values())
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
<p>Twenty-six LTC files, each broken one way on purpose, with an answer key. Two readers took it: GoButton's own reader (the <code>ltc.js</code> the show runs, untouched) and a careful reader, the same code with three changes. Both are told nothing: no frame rate, no polarity, no speed.</p>
<p><span class="big">{lies_g}</span> wrong frames from GoButton's reader across the files and the sweeps &nbsp;·&nbsp; <span class="big g">{lies_c}</span> from the careful reader. Files passed: {pg} and {pc} of {len(ans)}.</p>
<p>A wrong frame is the worst thing a reader can do: a lighting desk that hears no timecode waits, but one that hears the wrong time jumps the show. LTC has no checksum. It has two checks a reader can make for free: the polarity bit keeps every frame's count of 0s even, and every frame is the one after the frame before. GoButton's reader makes neither.</p>
<h2>Listen (quiet: a quarter of full level)</h2>{listen}
<h2>The files</h2>
<table><tr><th>file</th><th>6 ms of it</th><th>what was done</th><th>GoButton</th><th>careful</th></tr>{rows}</table>
<p class="why">Read as right / expected frames. A pass allows three frames short (one never whole at the start, one cut at the end, one the careful reader spends confirming), more where a file says why. Orange is a wrong frame. Grey is a reader that heard nothing, which is honest.</p>
<h2>Where each reader breaks</h2>
{''.join(strip(k) for k in labels)}
<h2>The careful reader's three changes</h2>
<p><b>Listen with hysteresis.</b> A flip counts only when the signal crosses a band a fifth of its height wide, centred on its own middle. Noise 10 dB down: 64% read and 26 wrong becomes 94% and none. The cost: through a 1.2 kHz low-pass the 1s no longer reach the band and the reader goes deaf, where GoButton's still reads. Wider bands read more noise and less smear; there is no free width.</p>
<p><b>A gap is a gap.</b> A pulse over four bits long is silence, not a new measure of the bit: forget the measure and learn it again.</p>
<p><b>Trust only a checked frame.</b> Even 0s, and the frame after the last. On the EQ file GoButton's reader found every sync word and read 119 frames, all wrong; the careful reader passed on none. Silence beat a lie. It costs one frame of delay at every lock.</p>
<h2>Still open</h2>
<p>Noise 6 dB down, MP3 at 32 kbps and the resonant EQ defeat both readers; a reader that times its crossings through a filter matched to the bit, rather than the raw zero, should take them. And backward: GoButton's reader is forward-only, so <code>23-reverse</code> waits for the room's backward reader to join the gauntlet.</p>
'''
(here / 'report.html').write_text(page)
print('report.html', len(page) // 1024, 'KB; wrong frames', lies_g, 'vs', lies_c)
