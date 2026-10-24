"""Lift the Sampler out of a Set the writer made and save it as a Live preset.
Usage: python3 -I als-to-adv.py <set.als> <out.adv>
The .adv root header is taken from Live's own Sampler.adv (the writer's template), every pointee id is set to 0 as
Live writes presets (format study, 2026-10-24), and the device's Id attribute is dropped (a preset's device has none)."""
import sys, gzip, re
als, out = sys.argv[1], sys.argv[2]
TEMPLATE = "/Users/loudonstearns/Documents/The Palace/Shop/Shopkeeper/probes/2026-10-20-ableton-session/templates/Sampler.adv"
xml = gzip.open(als).read().decode('utf-8')
m = re.search(r'<MultiSampler\b[^>]*>.*?</MultiSampler>', xml, re.S)
if not m: sys.exit('no MultiSampler in ' + als)
dev = m.group(0)
dev = re.sub(r'^<MultiSampler Id="\d+"', '<MultiSampler', dev)
dev = re.sub(r'(AutomationTarget|ModulationTarget|Pointee) Id="\d+"', r'\1 Id="0"', dev)
head = gzip.open(TEMPLATE).read().decode('utf-8').split('\n', 2)
root = head[0] + '\n' + head[1] + '\n'       # <?xml …?> and the <Ableton …> opener
adv = root + '\t' + dev + '\n</Ableton>\n'
gzip.open(out, 'wb').write(adv.encode('utf-8'))
parts = len(re.findall(r'<MultiSamplePart ', dev)); paths = re.findall(r'<Path Value="([^"]*)"', dev)
print(f'wrote {out}: {parts} zones; samples: ' + '; '.join(p.split("/")[-1] for p in paths))
