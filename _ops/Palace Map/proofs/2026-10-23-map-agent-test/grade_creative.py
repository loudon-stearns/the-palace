# usage: grade_creative.py pairs "A::B" ... | const "A" "B" ...
import sys,json,collections
d=json.load(open('/Users/loudonstearns/Documents/The Palace/_ops/maps/palace-map-full-2026-10-23.json'))
ids={n['id'] for n in d['nodes']}
adj=collections.defaultdict(set);T={}
for e in d['edges']:
  adj[e['source']].add(e['target']);adj[e['target']].add(e['source']);T.setdefault(frozenset((e['source'],e['target'])),set()).add(e['type'])
mode,args=sys.argv[1],sys.argv[2:]
if mode=='pairs':
  for p in args:
    a,b=p.split('::')
    print(p,'| missing:'+','.join(x for x in (a,b) if x not in ids) if not {a,b}<=ids else '', '| LINKED' if b in adj[a] else '| unlinked', '| shared nbrs:',len(adj[a]&adj[b]))
else:
  s=set(args);print('missing',[x for x in s if x not in ids])
  seen={args[0]};q=[args[0]]
  for x in q:
    for y in adj[x]&s:
      if y not in seen: seen.add(y);q.append(y)
  types=set().union(*[T.get(frozenset((a,b)),set()) for a in s for b in s if a<b])
  print('connected' if seen==s else f'DISCONNECTED: {s-seen}','| inner types:',sorted(types))
