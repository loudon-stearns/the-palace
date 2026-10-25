#!/bin/zsh
# Weave 2026-10-24 — run from the MAIN checkout after palace-land, on Loudon's yes to checkpoint 2 and his word of 2026-10-25.
set -e
M="/Users/loudonstearns/Documents/The Palace"; cd "$M/_ops"
SRC="7ec4caf5"
python3 -m commons propagate --sender "Weave Ceremony" --home "Weave Ceremony" --rhythm sweep --source-id "$SRC" \
  --decision "A pair of entries carries one typed link. A symmetric link is stated once; a connects-to beside a specific link is folded into it; only a direct lineage reciprocal (spawned or enables with its ground) keeps two." \
  --scope "every canon entry's frontmatter" \
  --check "python3 _ops/swarm/lint-link-pairs.py reports W0 0, W1 0, W2 0 (W3 is a judgment list)" \
  --action "fold the pair as Weave Step 3d says: keep the labelled or stating side, carry the label, drop the other" \
  --rationale "Weave v2.0, 2026-10-24 (tuning 47); Loudon: 'bias toward making the links high quality and lesser'"
python3 -m commons propagate --sender "Weave Ceremony" --home "Weave Ceremony" --rhythm sweep --source-id "$SRC" \
  --decision "A connects-to without a label is the palace's weakest claim: it is given the label the body carries, retyped to the relation it really is, or cut. A link with no reason on either page goes; a real connection returns with its reason." \
  --scope "every canon entry's frontmatter, new deposits included" \
  --check "python3 _ops/swarm/unsaid-links.py reports 0 bare unsaid links and python3 _ops/swarm/weave-health.py prints bare connects-to 0" \
  --action "label, retype or cut, reading both pages first (Weave Steps 3c and 3e)" \
  --rationale "Weave v2.0's Standing Order, Loudon 2026-10-24: 'all the connect to links are weak, labels or removal is fine'"
python3 -m commons propagate --sender "Weave Ceremony" --home "Weave Ceremony" --rhythm sweep --source-id "$SRC" \
  --decision "A page pointed at twenty times or more, over 20 KB, or mature or fruiting past half those marks, carries a Context companion: what it left out, what was tried and dropped, why it is shaped so. Written by the hand that next works the page, never restated from it." \
  --scope "the 20 pages the bundle audit and the folder readers both named: 2D Torus Wavetable Synthesizer, Action Potential Oscillator, Crystal Synthesizer, Floquet Time-Modulated Loops, Four Pillars of Enchanted Agency, Generative Sample Libraries, Inharmonic Wavetable Synthesis, Loudon Live, Manim CE, Palace Enchantment, Palace Graffiti, Palace Map, Portamento and Physical Pitch Modeling, Revival Ceremony, Substrate Skill, Swarm Weave, Web Audio Worklet, Ableton Session Writer, Mermaid Diagram Standard; then the rest of bundle-audit's list" \
  --check "python3 _ops/swarm/bundle-audit.py no longer lists the page under CONTEXT OWED" \
  --action "write <Entry>/<Entry> — Context.md with §8 frontmatter answering the three questions; add spawned [rationale-archive] from the parent" \
  --rationale "Weave v2.0 Step 5d (tuning 54): 316 of 325 pages wore faces and 20 had a Context"
python3 -m commons propagate --sender "TRICKSTER" --home "Weave Ceremony" --rhythm sweep --source-id "$SRC" \
  --decision "The palace keeps no to-do list apart from its handoffs. A thought with no mover becomes a baton announced on the board, or is let go; the Palace To-Do is composting and its open items move to batons." \
  --scope "every live page that points a reader at the Palace To-Do: README - The Palace Guide, ROSETTA, Deposit Ceremony, Baton Ceremony, Return Ceremony, BBS Design System, Loudon Live, Palace Enchantment, Haptic Handwheel, Loudon's Toolkit — context — assessment, Frequency-Time Duality — baton; archives, tuning ledgers and Contexts are history and stay" \
  --check "the pattern finds no live page" --pattern '\[\[Palace To-Do(\]\]|\|)' --paths '*.md,:(exclude)_ops/Palace To-Do.md,:(exclude)_ops/Palace To-Do/*,:(exclude)_ops/Weave Ceremony/*,:(exclude)_ops/swarm/sessions/*' \
  --action "point the reader at list-handoffs (node _ops/stigmergy/list-handoffs.mjs) and the Baton Ceremony instead; drop a sentence that only existed to route to the list" \
  --rationale "Loudon, 2026-10-25: 'Create a handoff for the to-do's and to retire to-do entirely in favor of handoffs.' Weave v2.0 Step 6 walks the open handoffs."
cd "$M"; S="_ops/swarm/sessions/weave-2026-10-24"
node _ops/closing-well/baton-executor.mjs --entry "Enrichment" --move "Enrich the seven pages the 2026-10-24 weave nominated for a rich face, one at a time" --body-file "$S/batons/enrichment-rich-faces.md" --qualifier "rich-face nominations 2026-10" --session-id weave-2026-10-24 --owner "$M" --post | tail -3
node _ops/closing-well/baton-executor.mjs --entry "SCHEMA" --move "Retype the labelled connects-to links the two new types name: directed-by to made-by, alternative-to and -vs- to contrasts-with" --body-file "$S/batons/schema-retype-new-types.md" --qualifier "retype to the two new types" --session-id weave-2026-10-24 --owner "$M" --post | tail -3
node _ops/closing-well/baton-executor.mjs --entry "Palace To-Do" --move "Retire the Palace To-Do in favour of handoffs: each open item becomes its own baton or is released, then the page goes" --body-file "$S/batons/palace-todo-retired.md" --session-id weave-2026-10-24 --owner "$M" --post | tail -3
git -c core.quotepath=off status --short | head -8
