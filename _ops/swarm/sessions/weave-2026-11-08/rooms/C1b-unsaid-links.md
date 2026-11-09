# Lane C1b — the bare unsaid links (proposes; writes nothing in the house)

Read `PREAMBLE.md` beside this file first.

## The flag you carry

Propagate flag `commons-the-palace-1792897100172` (Weave v2.0, 2026-10-24, rhythm sweep), the unsaid half. Home: [[Weave Ceremony]] (`_ops/Weave Ceremony.md`, Step 3e).

- **Step 3e:** `unsaid-links.py` lists every frontmatter link whose target the page's body never names — no wikilink, no title. Disposition is judgment, per link: **write the sentence** (the connection is real and the page should say it), **add the label** (the type and label carry the reason), or **cut** it. A bare unsaid link — unlabelled too — is always settled this weave; a labelled one is reviewed, not swept.
- **Check:** `python3 _ops/swarm/unsaid-links.py` reports 0 bare unsaid links.

## Your list

Run `python3 _ops/swarm/unsaid-links.py` in the palace root. Take every link it marks **bare** (unlabelled and unsaid) — 142 at the open, across many pages. Leave out the ones whose type is `connects-to`: lane C1a holds those. Everything else bare (an unlabelled `deepens`, `enables`, `spawned`, `mirrors`, `member-of`… whose target the body never names) is yours. Read BOTH pages for every one.

Two kinds you will meet often, and how to read them:
- **A `spawned` to a `— Context`, `— scroll` or other bundle file, unlabelled.** The body rarely names its own Context. The honest fix is the label (`rationale-archive`, `scroll-for`, `tuning-ledger`), not a sentence. Verdict `label`.
- **A lineage link (`emerged-from`, `exemplifies`, `member-of`) the body never explains.** Check the direction first (the source points back at its ground). If the relation is real, the label carries it; if the body says the opposite, propose the retype; if nothing on either page supports it, cut.

## Where a reason may hide (tuning item 58)

Display text (`[[X|other words]]`), a worked example or table, the `— Context` companion, the other side of the pair, SUBSTRATE's anatomy for organ pages. Look before you cut.

## Output

Write **only** `_ops/swarm/sessions/weave-2026-11-08/workers/C1b-unsaid-links.json`:

```json
{
 "lane": "C1b", "pages_read": ["..."],
 "weak_links": [{"source":"X","target":"Y","current_type":"...","verdict":"label|retype|cut|sentence","proposed_type":"(if retype)","proposed_label":"(if label/retype)","proposed_sentence":"(if sentence: the exact sentence, and the section it goes in)","evidence_source":"quoted, or empty","evidence_target":"quoted, or empty","rationale":"one sentence","confidence":"high|medium|low"}],
 "summary": "one paragraph: counts by verdict, the pattern, what you could not settle"
}
```

A `sentence` verdict changes what a page says, so it goes to Loudon's eye, never the batch — use it only where the connection is clearly real and the page is poorer for not saying it. Every bare link in your set gets a verdict. Write nothing in the house.
