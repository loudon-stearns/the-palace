"""Rank anchors, sweep sizes, check stability, write locator cards.
usage: python3 constellation.py [--k 20]   (run from the palace root; reads the dated builds from disk)"""
import json,sys,collections,statistics as st,networkx as nx
B={'09-26':'_ops/maps/palace-map-full-2026-09-26.json','10-23':'_ops/maps/palace-map-full-2026-10-23.json','10-24':'_ops/maps/palace-map-full-2026-10-24.json'}
def load(f):
    d=json.load(open(f));N={n['id'] for n in d['nodes']}
    G=nx.DiGraph();U=nx.Graph();E=collections.defaultdict(list)
    for e in d['edges']:
        if e['source'] in N and e['target'] in N:
            G.add_edge(e['source'],e['target']);U.add_edge(e['source'],e['target']);E[frozenset((e['source'],e['target']))].append(e)
    pr=nx.pagerank(G);ms=[dict(G.in_degree()),pr,nx.betweenness_centrality(U)];s=collections.Counter()
    for m in ms:
        for i,x in enumerate(sorted(m,key=lambda t:-m[t])): s[x]+=i
    return d,U,E,pr,[x for x,_ in sorted(s.items(),key=lambda t:t[1])]
k=int(sys.argv[sys.argv.index('--k')+1]) if '--k' in sys.argv else 20
R={b:load(f)[4] for b,f in B.items()}
d,U,E,pr,rank=load(B['10-24'])
A=rank[:k]; print('anchors',A)
print('stability vs 10-24:',{b:len(set(R[b][:k])&set(A)) for b in B})
prr=sorted(pr,key=lambda x:-pr[x])
print('born-with PageRank ranks:',{b:prr.index(b)+1 for b in ['FOUR PILLARS','Cooperation Yields Agency','Hilaritas Generator','Modes of Collaboration','CHILD','JEWEL','Palace Philosophies'] if b in prr})
sp=dict(nx.all_pairs_shortest_path_length(U))
for kk in (10,12,15,18,20,22,25,28,30):
    AA=rank[:kk];h=collections.Counter();near=collections.Counter();ds=[]
    for n in U.nodes:
        m=min(sp[n].get(a,99) for a in AA);h[m]+=1;ds.append(m)
        if m>0: near[next(a for a in AA if sp[n].get(a)==m)]+=1
    inner=[e for e in d['edges'] if e['source'] in AA and e['target'] in AA]
    tok=(len(' · '.join(AA))+sum(len(f"[{e['source']} | {e['type']} | {e['target']}]")+1 for e in inner)+350)//4
    print(f"k={kk}: at0..3={[h[i] for i in range(4)]} mean={st.mean(ds):.2f} FOUR-PILLARS-nearest={near[AA[0]]/sum(near.values()):.0%} anchors-nobody's-nearest={kk-len(near)} inner={len(inner)} card~{tok}tok same-as-10-23={len(set(AA)&set(R['10-23'][:kk]))}/{kk}")
def card(page):
    inner=[e for e in d['edges'] if e['source'] in A and e['target'] in A]
    L=['# The constellation — %d anchor pages (map build 2026-10-24)'%k,'Chosen by structure: inbound links, PageRank and betweenness, ranked together.','Anchors: '+' · '.join(A),'','## Threads between anchors']+[f"[{e['source']} | {e['type']} | {e['target']}]" for e in inner]+['','## You are here: '+page]
    ds=sorted(((nx.shortest_path_length(U,page,a),a) for a in A))
    for kk_,a in ds[:3]:
        p=nx.shortest_path(U,page,a);L.append(f"- {a}: {kk_} hop(s) — "+' '.join(f"[{E[frozenset((x,y))][0]['source']} | {E[frozenset((x,y))][0]['type']} | {E[frozenset((x,y))][0]['target']}]" for x,y in zip(p,p[1:])))
    L.append('- farthest anchors: '+', '.join(f'{a} ({kk_} hops)' for kk_,a in ds[-3:]))
    return '\n'.join(L)
if '--card' in sys.argv: print(card(sys.argv[sys.argv.index('--card')+1]))
