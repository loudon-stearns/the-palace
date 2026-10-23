import json,collections,itertools,math
d=json.load(open('_ops/maps/palace-map-full-2026-10-23.json'))
E=d['edges']; 
adj=collections.defaultdict(set); nb=collections.defaultdict(set); typed=collections.defaultdict(set)
for e in E:
    s,t,r=e['source'],e['target'],e['type']
    nb[s].add(t); nb[t].add(s); typed[(s,t)].add(r); typed[(t,s)].add(r)
    if r=='mirrors': adj[s].add(t); adj[t].add(s)
def bfs(a,b):
    q=[[a]];seen={a}
    while q:
        p=q.pop(0)
        if p[-1]==b: return p
        for n in adj[p[-1]]:
            if n not in seen: seen.add(n);q.append(p+[n])
for a,b in [('Kuramoto Coupling','Haptic Handwheel'),('Kuramoto Coupling','Stoicism')]:
    print(a,b,bfs(a,b))
print('mirror nbrs of Stoicism',adj['Stoicism'])
cands=[('Slime Mold Delay','STIGMERGY'),('Slime Mold Delay','Pheromone Trail'),('Songlines','Walk Ceremony'),('Songlines','Walk That Weaves'),('Murmuration','Swarm Weave'),('Murmuration','Pheromone Trail'),('Tract Mirror','Haptic Handwheel'),('Semantic Webcam','Lateral Access'),('Pauline Oliveros','Lateral Access'),('Sentry','Trickster'),('Slime Mold Delay','Flocking'),('Songlines','Palace Map')]
for a,b in cands:
    print(a,'|',b,'edge:',typed.get((a,b)),'common:',len(nb[a]&nb[b]),sorted(nb[a]&nb[b])[:12])
nodes=list(nb)
res=[]
for a,b in itertools.combinations(nodes,2):
    if (a,b) in typed: continue
    c=nb[a]&nb[b]
    if len(c)>=4:
        aa=sum(1/math.log(len(nb[x])+1) for x in c)
        res.append((aa,a,b,sorted(c)))
res.sort(reverse=True)
for r in res[:45]: print(round(r[0],2),r[1],'|',r[2],len(r[3]),r[3][:8])
