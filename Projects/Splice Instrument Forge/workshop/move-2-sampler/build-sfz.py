"""roots.json -> an SFZ the Ableton Session Writer reads. Usage: python3 -I build-sfz.py <name> [--release 0.4]
Key ranges split at the midpoints between roots and run to the ends of the keyboard; each region is tuned by
the detected cents so every root sounds in tune; one velocity layer."""
import sys, json, os
name=sys.argv[1]; rel=float(sys.argv[sys.argv.index('--release')+1]) if '--release' in sys.argv else 0.4
roots=sorted(json.load(open('roots.json')), key=lambda r:r['midi'])
lines=['<control>','default_path=samples/','<global>',f'ampeg_attack=0.001 ampeg_release={rel} amp_veltrack=100','']
for i,r in enumerate(roots):
    lo=0 if i==0 else (roots[i-1]['midi']+r['midi'])//2+1
    hi=127 if i==len(roots)-1 else (r['midi']+roots[i+1]['midi'])//2
    lines.append(f"<region> sample={r['file']} lokey={lo} hikey={hi} pitch_keycenter={r['midi']} tune={int(round(-r['cents']))} // detected {r['name']} {r['f0']} Hz")
open(f'{name}.sfz','w').write('\n'.join(lines)+'\n'); print(open(f'{name}.sfz').read())
