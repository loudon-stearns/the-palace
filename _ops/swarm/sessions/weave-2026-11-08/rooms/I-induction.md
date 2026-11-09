# Lane I — newcomer induction: the seven under-reached pages (proposes; writes nothing in the house)

Read `PREAMBLE.md` beside this file first.

## The job (Weave Step 0b)

Seven pages born since the last weave (2026-10-24) are under the catch-up target. The target is ~80% of the median inbound reach of an established page (median 9 → target 7). Your job: walk outward from each newcomer along its typed links, two hops, and propose **inbound** links from the pages you meet that genuinely should point at the newcomer — a real relation with a sentence on the pointing page that could carry it. Never a link manufactured to reach a number. Reachability is never faked.

## The newcomers

| page | path | inbound | gap |
|---|---|---|---|
| LightOnOCR-3 | `Shop/LightOnOCR-3.md` | 3 | 4 |
| Operator Memory | find it (`Palace development/` likely) | 3 | 4 |
| Splice Instrument Forge | `Shop/…` or `Projects/…` — find it | 4 | 3 |
| FM Synthesis | `FM Synthesis.md` | 5 | 2 |
| CAD Drafter | `Shop/CAD Drafter.md` | 6 | 1 |
| Cycle 5 Explorer | `Projects/Cycle 5 Explorer.md` | 6 | 1 |
| Synthesis Notes (Loudon) | `Synthesis Notes (Loudon).md` | 6 | 1 |

`python3 _ops/swarm/new-entry-catchup.py --since-commit a75350ec` reprints this; `python3 _ops/swarm/palace-map.py near "<Entry>"` prints each one's ring and two-hop reach — start there.

## Rules

- Read the newcomer whole, then every candidate pointing page whole before proposing. Quote the sentence on the pointing page that carries the relation (or say plainly it would need one — then the proposal goes to Loudon's eye, not the batch).
- One link per pair: check the map for an existing link either way before proposing. Symmetric links (`mirrors`, `couples-with`, `contradicts`, `contrasts-with`, labelled `connects-to`) count as reach both ways; a directed link points from the page that holds the relation to its ground (SCHEMA §4; read it aloud as source → type → target).
- A Shop page's natural inbound is often `member-of` from nothing (membership is declared on the member side) — do not add `member-of` from a hub to a member. What reaches a Specialist is the pages whose work it does: a project that used it, a sibling it hands off to, a concept it embodies.
- Generous but genuine: 2–5 proposals per newcomer is the expected range; zero for one of them is an honest answer if its neighbourhood does not yet talk about it — say so.
- Also note any newcomer whose own outbound links look wrong (a direction reversed, a bare `connects-to` that should carry a label) — as weak_links verdicts, not edits.

## Output

Write **only** `_ops/swarm/sessions/weave-2026-11-08/workers/I-induction.json`:

```json
{
 "lane": "I", "pages_read": ["..."],
 "typed_relations": [{"source":"<pointing page>","target":"<newcomer>","proposed_type":"...","proposed_label":"...","kind":"newcomer","evidence_source":"the sentence on the pointing page, quoted, or empty","evidence_target":"the sentence on the newcomer, quoted, or empty","rationale":"one sentence","confidence":"high|medium|low","needs_sentence":false}],
 "weak_links": [{"source":"X","target":"Y","current_type":"...","verdict":"label|retype|cut|keep-as-is","proposed_type":"...","proposed_label":"...","evidence_source":"...","evidence_target":"...","rationale":"...","confidence":"..."}],
 "per_newcomer": [{"entry":"...","inbound_now":3,"proposed":2,"would_reach":5,"note":"one line"}],
 "summary": "one paragraph"
}
```

Write nothing in the house.
