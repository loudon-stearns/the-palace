## Move

Retype the labelled `connects-to` links that the two link types ratified on 2026-10-25 now name: the `directed-by` labels become `made-by` (29 links, the People and film pages pointing at their directors), and the `alternative-to` and `-vs-` labels become `contrasts-with` (18 links). The list, with source, label and target, is `_ops/swarm/sessions/weave-2026-10-24/link-retypes-for-new-types.json`. Loudon, 2026-10-25: "Approve the two new labels and a handoff to change the referenced links."

## Why this move matters

Weave v2.0's label harvest (Step 3f) read the labels as the palace's own proposal for its next link types; these two clusters were large and coherent enough, and the Schema Ceremony of 2026-10-25 (v1.30) added them. Until the links move, the types exist and nothing uses them.

## Current state

SCHEMA §4 lists `contrasts-with` (symmetric: set against or standing in for one another, short of a productive contradiction) and `made-by` (directed A→B: A, a work or a person, to the one who made or directed it; the source points back at its ground, like `member-of`). The linters and `palace_lib` know both. No link carries either yet.

## Next move

For each row: read the pair's pages once (the label was given by a reader this weave, the skeptic passed most, but a retype is a type claim); apply `retype` with `_ops/swarm/sessions/weave-2026-10-24/apply.py` or by hand, keeping the label where it still adds a register (`directed-by` becomes redundant under `made-by`; a `-vs-` label usually still says what is contrasted). Then `python3 _ops/swarm/lint-link-directions.py` and `lint-link-pairs.py` clean, `build-map.py`, and `label-harvest.py` to see what the next clusters are. One commit through the committer.

## Calibrations from this session

One link per pair holds; do not add beside. A `contrasts-with` is weaker than `contradicts` (Blake's contraries, both true) — if a pair is a productive contradiction, say so and use `contradicts`. `made-by` points from the made thing to its maker; never the reverse.

## Load these files first

`SCHEMA.md` §4 · `SCHEMA/SCHEMA — Context.md` § the v1.30 paragraph · `Palace development/Resonant Link Labels.md` · the JSON list above
