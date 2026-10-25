"""Foundations card: six pages chosen by Loudon (2026-10-25), their threads, and a page's routes to each.
usage: python3 foundations.py "<Page>"   (from the palace root)"""
import json,sys,collections,networkx as nx
F={'FOUR PILLARS':'the framework and the tag on everything: Creation, Tools, Philosophy, Practice — four shadows of one thing.',
'JEWEL':'the seed every agent is born with: the palace\'s relational logic, compressed. It holds no rules.',
'CHILD':'how a child works here: think, make, offer; summon the Concierge first; honesty holds and taste yields.',
'ELDER':'what a child reads on top when it grows up: the rules for changing the house.',
'Palace Philosophies':'philosophy as a practice: a tradition is a tool; relations come first.',
'STIGMERGY':'the palace\'s nervous system made visible: state, queue, log — coordination by the marks agents leave.'}
d=json.load(open('_ops/maps/palace-map-full-2026-10-24.json'));N={n['id'] for n in d['nodes']}
U=nx.Graph();E=collections.defaultdict(list)
for e in d['edges']:
    if e['source'] in N and e['target'] in N: U.add_edge(e['source'],e['target']);E[frozenset((e['source'],e['target']))].append(e)
t=lambda x,y:(lambda e:f"[{e['source']} | {e['type']} | {e['target']}]")(E[frozenset((x,y))][0])
page=sys.argv[1]
L=['# The foundations — six pages the palace stands on (map build 2026-10-24)','Chosen by Loudon, not counted from the links.','']+[f'- **{k}** — {v}' for k,v in F.items()]+['','## Threads between them']
L+=[f"[{e['source']} | {e['type']} | {e['target']}]" for e in d['edges'] if e['source'] in F and e['target'] in F]
L+=['','## You are here: '+page]
for f in sorted(F,key=lambda f:nx.shortest_path_length(U,page,f)):
    p=nx.shortest_path(U,page,f);L.append(f"- {f}: {len(p)-1} hop(s) — "+' '.join(t(x,y) for x,y in zip(p,p[1:])))
print('\n'.join(L))
