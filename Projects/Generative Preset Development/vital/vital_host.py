"""Host Vital (VST3) from Python and load any .vital preset as plugin state.

Vital 1.5.5's own `--headless --render` segfaults inside renderAudioToFile, so
we host the VST3 via pedalboard instead. The VST3 state wraps the preset JSON
in a VST2-compatible fxb chunk (VstW header, CcnK/FBCh, chunk size at byte 172,
JSON from 176, JUCEPrivateData trailer), base64'd JUCE-style inside XML.

The trap, found the hard way: the outer wrapper is b"VC2!" + a little-endian
length of the XML. Leave that length stale and any preset longer than the init
state is silently truncated, and Vital drops the load. It looked like a dozen
different bugs (spaces, long floats, first-try failures) before it was this one.
Every load is still read back and checked.
"""
import re, struct, json
import numpy as np, pedalboard, mido
from juceb64 import dec, enc
VST = "/Library/Audio/Plug-Ins/VST3/Vital.vst3"
SR = 44100

def _chunk(plugin):
    return dec(re.search(rb"<IComponent>(.*?)</IComponent>", plugin.raw_state).group(1).decode())

def current(plugin):
    d = _chunk(plugin)
    return json.loads(d[d.index(b"{", 176):d.rindex(b"}") + 1])

def _write(plugin, text):
    s = plugin.raw_state
    m = re.search(rb"<IComponent>(.*?)</IComponent>", s)
    d = dec(m.group(1).decode())
    j = d.index(b"{", 176); end = d.rindex(b"}") + 1
    new = d[:j] + text.encode() + d[end:]
    new = new[:20] + struct.pack(">i", len(new) - 24) + new[24:172] + struct.pack(">i", len(new) - 176) + new[176:]
    xml = s[8:m.start(1)] + enc(new).encode() + s[m.end(1):]
    # outer wrapper: b"VC2!" + little-endian XML length (JUCE copyXmlToBinary)
    xml = xml.rstrip(b"\x00") + b"\x00"
    plugin.raw_state = b"VC2!" + struct.pack("<I", len(xml) - 1) + xml

_BASE = {}
def load(plugin, preset, tries=2):
    """preset: dict or JSON text. Overlays on Vital's own init state (fills keys
    1.0-era files lack), then verifies a few settings read back."""
    if isinstance(preset, str): preset = json.loads(preset)
    if id(plugin) not in _BASE: _BASE[id(plugin)] = current(plugin)
    t = json.loads(json.dumps(_BASE[id(plugin)]))
    for k, v in preset.items():
        if k != "settings": t[k] = v
    t["synth_version"] = _BASE[id(plugin)]["synth_version"]
    t["settings"].update(preset.get("settings", {}))
    text = json.dumps(t, separators=(",", ":"))
    probe = [k for k, v in preset.get("settings", {}).items() if isinstance(v, (int, float))][:40]
    for _ in range(tries):
        _write(plugin, text)
        got = current(plugin)["settings"]
        if all(abs(float(got.get(k, 1e9)) - float(preset["settings"][k])) < 1e-3 * max(1, abs(float(preset["settings"][k]))) for k in probe):
            return True
    raise RuntimeError("Vital did not take the preset after %d tries" % tries)

def render(plugin, notes=(48,), hold=3.0, tail=2.0, vel=90):
    msgs = [mido.Message("note_on", note=n, velocity=vel, time=0.0) for n in notes]
    msgs += [mido.Message("note_off", note=n, velocity=0, time=hold) for n in notes]
    plugin.reset()
    return plugin(msgs, duration=hold + tail, sample_rate=SR, num_channels=2)
