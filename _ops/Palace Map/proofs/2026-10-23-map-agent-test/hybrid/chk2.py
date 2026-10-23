import json,collections,itertools,math
d=json.load(open('_ops/maps/palace-map-full-2026-10-23.json'))
E=d['edges']; nb=collections.defaultdict(set); typed=collections.defaultdict(set)
for e in E:
    s,t,r=e['source'],e['target'],e['type']; nb[s].add(t); nb[t].add(s); typed[(s,t)].add(r); typed[(t,s)].add(r)
hubs={n for n in nb if len(nb[n])>=40}
print(sorted(hubs))
res=[]
for a,b in itertools.combinations(list(nb),2):
    if (a,b) in typed or a in hubs or b in hubs: continue
    c=(nb[a]&nb[b])-hubs
    if len(c)>=3: res.append((len(c)/ (len(nb[a]|nb[b])-len(hubs&(nb[a]|nb[b]))),a,b,sorted(c)))
res.sort(reverse=True)
for r in res[:50]: print(round(r[0],2),r[1],'|',r[2],r[3])
print(d['edges'][0])
