# usage: route.py START TARGET file   — checks the route triples (lines under a 'ROUTE' marker are not needed; pass the triples file)
import sys,re,json
d=json.load(open('/Users/loudonstearns/Documents/The Palace/_ops/maps/palace-map-full-2026-10-24.json'))
E={(e['source'],e['type'],e['target']) for e in d['edges']}
s,t=sys.argv[1],sys.argv[2]; tr=[tuple(x.strip() for x in m) for m in re.findall(r'\[([^\[\]|]+)\|([^\[\]|]+)\|([^\[\]|]+)\]',open(sys.argv[3]).read())]
cur=s;ok=True
for a,r,b in tr:
    real=(a,r,b) in E
    nxt=b if a==cur else a if b==cur else None
    print(('ok ' if real else 'FAKE ')+f'{a} -{r}-> {b}', '' if nxt else f'  BREAK (at {cur})')
    if not real or not nxt: ok=False
    cur=nxt or cur
print('route', 'VALID' if ok and cur==t else f'INVALID (ends at {cur})', 'length',len(tr))
