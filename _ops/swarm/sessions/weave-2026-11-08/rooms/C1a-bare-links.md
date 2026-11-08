# Lane C1a — the bare connects-to links and the pair judgments (proposes; writes nothing in the house)

Read `PREAMBLE.md` beside this file first.

## The flag you carry

Propagate flag `commons-the-palace-1792897100172` (Weave v2.0, 2026-10-24, rhythm sweep). Home: [[Weave Ceremony]] (`_ops/Weave Ceremony.md`, Steps 3c, 3d, 3e).

- **Decision:** A `connects-to` without a label is the palace's weakest claim: it is given the label the body carries, retyped to the relation it really is, or cut. A link with no reason on either page goes; a real connection returns with its reason.
- **Check:** `python3 _ops/swarm/weave-health.py` prints bare connects-to 0 (and `unsaid-links.py` 0 bare — that half is lane C1b's).

## Your list

1. **The 46 bare `connects-to`.** Find them from the map: every edge of type `connects-to` with no label. The quickest route: `python3 -c` over `_ops/maps/palace-map-full-2026-11-08.json` (edges carry `source`, `target`, `type`, `label`), or `python3 _ops/swarm/unsaid-links.py` for the ones whose body is also silent. Read BOTH pages for every one before a verdict.
2. **Four pair judgments** from `python3 _ops/swarm/lint-link-pairs.py` (run it yourself; the mechanical folds are already applied):
   - W1 differing labels: Exponential Decay Curvature ↔ Synth Templates (`where-the-curve-is-heard` / `the-envelope-card-points-here`); Hero and Avatar Maker ↔ Loudon Live Design System (`frame + cascade` / `tab-icon-source`); Hero and Avatar Maker ↔ Drafting Table Design System (`faces-as-tab-icon` / `tab-icon-source`). Say which side's label holds and which link is dropped (one link per pair; the kept link may take a better label).
   - W3 two specific types: Diversity of Thought in Many-Agent Systems `emerged-from` The Shop | The Shop `couples-with` Diversity of Thought. Say which relation it is.

## Where a reason may hide (tuning item 58)

A first reader judges a link by whether either page names the other by title, and misses the reason written another way. Before any cut, look for: the target under display text (`[[X|the four pillars]]`), the target named in a worked example or a table, the relation stated in a `— Context` companion in the bundle, the hub's side of the pair carrying the sentence, SUBSTRATE's anatomy for organ pages. A cut is still right when none of these carries it.

## Output

Write **only** `_ops/swarm/sessions/weave-2026-11-08/workers/C1a-bare-links.json`:

```json
{
 "lane": "C1a", "pages_read": ["..."],
 "weak_links": [{"source":"X","target":"Y","current_type":"connects-to","verdict":"label|retype|cut","proposed_type":"(if retype)","proposed_label":"(if label/retype)","evidence_source":"the sentence on X that carries the relation, quoted, or empty","evidence_target":"the sentence on Y, quoted, or empty","rationale":"one sentence","confidence":"high|medium|low"}],
 "pair_judgments": [{"pair":["X","Y"],"keep":{"source":"X","target":"Y","type":"...","label":"..."},"drop":{"source":"Y","target":"X","type":"..."},"rationale":"one sentence, quoting the page that carries the relation"}],
 "summary": "one paragraph: what you read, what pattern you saw, what you could not settle"
}
```

Every bare link gets a verdict; skip none. "label" only when a sentence on at least one page carries the relation and you can name its register in one or two words. "retype" when the relation is really another type — get the direction right (read it aloud as source → type → target). "cut" when neither page gives a reason; say so plainly. Do not propose a new link between a pair that already carries one. Write nothing in the house.
