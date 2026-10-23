import sys,re,json
d=json.load(open('/Users/loudonstearns/Documents/The Palace/_ops/maps/palace-map-full-2026-10-23.json'))
E={(e['source'],e['type'],e['target']) for e in d['edges']}
ids={n['id'] for n in d['nodes']}
t=open(sys.argv[1]).read()
trip=re.findall(r'\[([^\[\]|]+)\|([^\[\]|]+)\|([^\[\]|]+)\]',t)
bad=[];ok=0
for a,r,b in trip:
    a,r,b=a.strip(),r.strip(),b.strip()
    if (a,r,b) in E: ok+=1
    else: bad.append((a,r,b,'nodes-exist' if a in ids and b in ids else 'MISSING-NODE:'+','.join(x for x in (a,b) if x not in ids)))
print(f'{ok}/{len(trip)} triples real')
for x in bad: print('  FAKE',x)
