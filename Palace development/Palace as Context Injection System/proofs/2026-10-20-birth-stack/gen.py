import json, re, sys, os, html
X = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
results = json.load(open(os.path.join(X,'results.json'))) if os.path.exists(os.path.join(X,'results.json')) else None

def strip_fm(t):
    if t.startswith('---\n'):
        e = t.find('\n---\n', 4)
        if e > 0: return t[e+5:]
    return t

def split_h2(t):
    parts = re.split(r'(?m)^(?=## )', t)
    out = []
    for p in parts:
        if not p.strip(): continue
        m = re.match(r'## (.+)', p)
        out.append((m.group(1).strip() if m else None, p))
    return out

WORLD = [
 ('FOUR_PILLARS.md','Four Pillars','Creation, Tools, Philosophy, Practice: four shadows of one thing. Make, and you will learn.'),
 ('Palace_Philosophies.md','Palace Philosophies','Spinoza and the Stoics carried in full, then the rest of the register, each with its own page.'),
 ('Cooperation_Yields_Agency.md','Cooperation Yields Agency','Shared intent plus combined capability is agency. Ask the real question.'),
 ('Hilaritas_Generator.md','Hilaritas Generator','The learning space as a machine for whole-being joy. "How do you feel?" not "How many views?"'),
 ('Modes_of_Collaboration.md','Modes of Collaboration','The named ways we work together: Excellent Adventure, Build Session, Shared Walk and the rest.'),
]

S = {  # (birth, file, heading) -> (kind, summary)
 ('before','CLAUDE.md','Foundational context (auto-loaded)'):('pointer','The import list, framed as Tier 0, then Tier 1 (with SCHEMA), then Tier 2. Says the floor is about 18.5K tokens.'),
 ('before','CLAUDE.md','What You Are Here to Leave Behind'):('identity','The conversation will be lost; the palace is durable. A close is four beats. Harmony is phase coherence, not agreement. Length is a claim about importance.'),
 ('before','CLAUDE.md','Addressing the Palace — the Concierge'):('rules','Summon the resident companion first, visibly. Touch base before you write and after.'),
 ('before','CLAUDE.md','Access Paths'):('rules','Which surface reads and writes the palace, in priority order.'),
 ('before','CLAUDE.md','Directory Structure'):('rules','Where the skeleton files, entries, bundles and _ops machinery live.'),
 ('before','CLAUDE.md','Ceremony Triggers'):('rules','The complete trigger table, with a one-line gloss and spec path for every rite.'),
 ('before','CLAUDE.md','Artifact Aesthetic — Default'):('rules','Every visual defaults to the Loudon Live Design System, with one override carve-out.'),
 ('before','CLAUDE.md','The Palace Voice'):('voice','Write and speak like a person, not a paper.'),
 ('before','CLAUDE.md','Key Vocabulary'):('ref','A glossary: Four Pillars, entry types, stages, typed links and more.'),
 ('before','CLAUDE.md','Where to Find Depth'):('rules','Pointers to SCHEMA, its Reference, ROSETTA and the other deep docs, with when to read each.'),
 ('before','CLAUDE.md','In-File Comments'):('rules','How HTML comments carry notes between Loudon and Claude inside files.'),
 ('before','JEWEL.md','The Jewel — v1.1 (2026-03)'):('identity','The seed itself: the palace, relations primary, depth over coverage. Then "Never violate these", then the synthesis trigger.'),
 ('before','JEWEL.md','Context Loading Tiers'):('rules','The Tier 0–4 table, token costs, and the reasons SCHEMA was split. This is where the tier language lived.'),
 ('now','CLAUDE.md','A page and its folder'):('world','What a page keeps: faces, memory, workshop. Shape, not rule.'),
 ('now','CLAUDE.md','Born with'):('pointer','The import list. Five lines.'),
 ('now','CLAUDE.md','Growing up'):('rules','First act: summon the Concierge. A child thinks, makes and offers; writes to the house go to an elder. "Grow up" reads ELDER, then SCHEMA.'),
 ('now','CLAUDE.md','Ceremony Triggers'):('rules','The rite names, one row each.'),
 ('now','CLAUDE.md','The Palace Voice'):('voice','Write and speak like a person, not a paper.'),
 ('now','JEWEL.md','The Seed Jewel — v1.2 (2026-09)'):('identity','The seed: you are inside the Palace; edges carry more meaning than nodes; links are kinds of attention. No rules.'),
}
OPEN = {
 ('before','CLAUDE.md'):None,  # special split
 ('now','CLAUDE.md'):('identity','"Every agent is born a child. Some grow into elders." What the file is, and that a child does not change the house.'),
 ('before','JEWEL.md'):('identity','What the Jewel is: the minimum context for a palace agent, a generative compression.'),
 ('now','JEWEL.md'):('identity','What the Jewel is: the seed every agent is born with. It holds no rules.'),
}

def build(birth):
    d = os.path.join(X, birth)
    files = ['CLAUDE.md','JEWEL.md'] + (['SCHEMA.md'] if birth=='before' else []) + [w[0] for w in WORLD]
    segs = []
    for f in files:
        t = strip_fm(open(os.path.join(d,f)).read())
        if f in [w[0] for w in WORLD]:
            w = [w for w in WORLD if w[0]==f][0]
            segs.append(dict(file=w[1], title=w[1], kind='world', summary=w[2], text=t)); continue
        if f == 'SCHEMA.md':
            segs.append(dict(file='SCHEMA', title='SCHEMA (the floor card)', kind='rules', summary='The type system: entry types, stages, the link ontology, the self-description test. Imported straight after the Jewel.', text=t)); continue
        for h, body in split_h2(t):
            fname = 'CLAUDE.md' if f=='CLAUDE.md' else 'JEWEL'
            if h is None:
                if (birth,f)==('before','CLAUDE.md'):
                    i = body.find('Never violate these')
                    segs.append(dict(file=fname, title='Opening — the Jewel’s words, inlined', kind='identity', summary='The seed’s paragraphs copied to the very top: a rhizome built by Loudon, relations primary, depth over coverage.', text=body[:i]))
                    segs.append(dict(file=fname, title='Opening — "Never violate these"', kind='rules', summary='Eight commandments in one paragraph: show before writing, read before touching, typed links over prose, git is the safety net.', text=body[i:]))
                else:
                    k,s = OPEN[(birth,f)]
                    segs.append(dict(file=fname, title='Opening', kind=k, summary=s, text=body))
            else:
                k,s = S.get((birth,f,h), ('ref', body.split('\n',2)[-1][:160]))
                segs.append(dict(file=fname, title=h, kind=k, summary=s, text=body))
    off = 0
    for s in segs:
        s['chars'] = len(s['text']); s['offset'] = off; off += s['chars']
    return segs

data = {'before': build('before'), 'now': build('now'), 'results': results}
tpl = open(os.path.join(X,'reader.tpl.html')).read()
open(OUT,'w').write(tpl.replace('/*DATA*/null', json.dumps(data)))
for b in ['before','now']:
    print(b, sum(s['chars'] for s in data[b]), [(s['title'][:28], s['kind'], s['chars']) for s in data[b]])
