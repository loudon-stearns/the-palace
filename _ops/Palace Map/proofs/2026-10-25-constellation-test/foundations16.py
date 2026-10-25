"""Foundations card, 16 pages agreed with Loudon 2026-10-25: their one line, the threads among them, a page's routes to its nearest five.
usage: python3 foundations16.py "<Page>"   (from the palace root)"""
import json,sys,collections,networkx as nx
F=[('Where it came from',[
 ('Meaning and the Link','Loudon\'s 2014 paper, whose thesis the palace enacts: links come before nodes.'),
 ('4 Pillars Framework - The Founding Conversation','the conversation of March 2026 the four pillars came from.'),
 ('1 from 2','an alignment fiction: an AI implanted at birth, aligned through relationship, not rules.')]),
('What every agent is born with',[
 ('JEWEL','the seed: the palace\'s relational logic, compressed. It holds no rules.'),
 ('FOUR PILLARS','Creation, Tools, Philosophy, Practice — four shadows of one thing, and the tag on everything.'),
 ('Palace Philosophies','philosophy as a practice: a tradition is a tool; relations come first; Spinoza, the Stoa, Kuramoto, stigmergy.'),
 ('Cooperation Yields Agency','shared intent plus combined capability is agency; what each of the two in the room brings.'),
 ('Modes of Collaboration','ways of working together, each with its own rhythm and its own answer to who leads.'),
 ('Hilaritas Generator','what good feels like: whole-being joy as power-to-act grows. "How do you feel?"')]),
('How it grows up',[
 ('CHILD','how a child works here: think, make, offer; honesty holds and taste yields.'),
 ('ELDER','what a child reads on top when it grows up: the rules for changing the house.'),
 ('SCHEMA','the palace\'s language: what can exist here and how things can be related.')]),
('How it runs',[
 ('SUBSTRATE','the anatomy: the organs the palace runs and how they couple.'),
 ('STIGMERGY','the nervous system made visible: state, queue, log — coordination by the marks agents leave.'),
 ('Palace Map','the topology: where every page stands and what reaches what.'),
 ('ROSETTA','the palace described for any operator arriving without context, and its words translated to other traditions.')])]
names=[n for _,g in F for n,_ in g]
d=json.load(open('_ops/maps/palace-map-full-2026-10-24.json'));N={n['id'] for n in d['nodes']}
U=nx.Graph();E=collections.defaultdict(list)
for e in d['edges']:
    if e['source'] in N and e['target'] in N: U.add_edge(e['source'],e['target']);E[frozenset((e['source'],e['target']))].append(e)
t=lambda x,y:(lambda e:f"[{e['source']} | {e['type']} | {e['target']}]")(E[frozenset((x,y))][0])
if '--stats' in sys.argv:
    import statistics as st
    sp=dict(nx.all_pairs_shortest_path_length(U));h=collections.Counter();ds=[]
    for n in U.nodes: m=min(sp[n].get(f,99) for f in names);h[m]+=1;ds.append(m)
    print('nearest-foundation',sorted(h.items()),'mean',round(st.mean(ds),2),'inner',sum(1 for e in d['edges'] if e['source'] in names and e['target'] in names));sys.exit()
page=sys.argv[1]
L=['# The foundations — sixteen pages the palace stands on (map build 2026-10-24)','Chosen with Loudon, not counted from the links.','']
for g,items in F: L+=[f'**{g}**']+[f'- **{n}** — {v}' for n,v in items]+['']
L+=['## Threads between them']+[f"[{e['source']} | {e['type']} | {e['target']}]" for e in d['edges'] if e['source'] in names and e['target'] in names]
L+=['','## You are here: '+page]
ds=sorted(names,key=lambda f:(nx.shortest_path_length(U,page,f),names.index(f)))
for f in ds[:5]:
    p=nx.shortest_path(U,page,f);L.append(f"- {f}: {len(p)-1} hop(s) — "+' '.join(t(x,y) for x,y in zip(p,p[1:])))
L.append('- farthest: '+', '.join(f'{f} ({nx.shortest_path_length(U,page,f)} hops)' for f in ds[-3:]))
print('\n'.join(L))
