# Propagate flags this weave posts (Step 7), on Loudon's yes to checkpoint 2 — run from `_ops/` in the MAIN checkout after the landing, so the board line names a commit on main

1. One link per pair
python3 -m commons propagate --sender "Weave Ceremony" --home "Weave Ceremony" --rhythm sweep \
  --decision "A pair of entries carries one typed link. A symmetric link is stated once; a connects-to beside a specific link is folded into it; only a direct lineage reciprocal (spawned/enables with its ground) keeps two." \
  --scope "every canon entry's frontmatter" \
  --check "python3 _ops/swarm/lint-link-pairs.py reports W0 0, W1 0, W2 0 (W3 is a judgment list)" \
  --action "fold the pair as Step 3d says: keep the labelled or stating side, carry the label, drop the other" \
  --rationale "Weave v2.0, 2026-10-24 (tuning 47; Loudon: 'bias toward making the links high quality and lesser')" \
  --source-id "<the Weave commit>"

2. A bare connects-to is labelled, retyped or cut
python3 -m commons propagate --sender "Weave Ceremony" --home "Weave Ceremony" --rhythm sweep \
  --decision "A connects-to without a label is the palace's weakest claim: it is given the label the body carries, retyped to the relation it really is, or cut. A link with no reason on either page goes; a real connection returns with its reason." \
  --scope "every canon entry's frontmatter; new deposits included" \
  --check "python3 _ops/swarm/unsaid-links.py reports 0 bare unsaid links, and python3 _ops/swarm/weave-health.py prints bare connects-to 0" \
  --action "label, retype or cut, reading both pages first (Weave Step 3c/3e)" \
  --rationale "Weave v2.0 standing order, Loudon 2026-10-24" \
  --source-id "<the Weave commit>"

3. Memory keeps pace with faces — the Context threshold (rhythm sweep; the check is bundle-audit's list)
python3 -m commons propagate --sender "Weave Ceremony" --home "Weave Ceremony" --rhythm sweep \
  --decision "A page pointed at twenty times or more, over 20 KB, or mature/fruiting past half those marks carries a Context companion: what it left out, what was tried and dropped, why it is shaped so. Written by the hand that next works the page, not restated from it." \
  --scope "the 20 pages the bundle audit and the folder readers both named (2D Torus Wavetable Synthesizer, Action Potential Oscillator, Crystal Synthesizer, Floquet Time-Modulated Loops, Four Pillars of Enchanted Agency, Generative Sample Libraries, Inharmonic Wavetable Synthesis, Loudon Live, Manim CE, Palace Enchantment, Palace Graffiti, Palace Map, Portamento and Physical Pitch Modeling, Revival Ceremony, Substrate Skill, Swarm Weave, Web Audio Worklet, Ableton Session Writer, Mermaid Diagram Standard), then the rest of bundle-audit's list" \
  --check "python3 _ops/swarm/bundle-audit.py lists the page under CONTEXT OWED no longer" \
  --action "write <Entry>/<Entry> — Context.md with §8 frontmatter, answering the three questions; add spawned from the parent" \
  --rationale "Weave v2.0 Step 5d (tuning 54): 316 of 325 pages wore faces, 20 had a Context" \
  --source-id "<the Weave commit>"

4. The To-Do retired in favour of handoffs (Loudon, 2026-10-25)
python3 -m commons propagate --sender "TRICKSTER" --home "Weave Ceremony" --rhythm sweep \
  --decision "The palace keeps no to-do list apart from its handoffs. A thought with no mover becomes a baton announced on the board, or is let go; the Palace To-Do is composting and its open items move to batons." \
  --scope "every live page that points a reader at the Palace To-Do: README - The Palace Guide, ROSETTA, Deposit Ceremony, Baton Ceremony, Return Ceremony, BBS Design System, Loudon Live, Palace Enchantment, Haptic Handwheel, Loudon's Toolkit — context — assessment, Frequency-Time Duality — baton; archives, tuning ledgers and Contexts are history and stay" \
  --check "the pattern finds no live page" --pattern "\[\[Palace To-Do(\]\]|\|)" --paths "*.md,:(exclude)_ops/Palace To-Do.md,:(exclude)_ops/Palace To-Do/*,:(exclude)_ops/Weave Ceremony/*" \
  --action "point the reader at list-handoffs (node _ops/stigmergy/list-handoffs.mjs) and the Baton Ceremony instead; drop a sentence that only existed to route to the list" \
  --rationale "Loudon, 2026-10-25: 'Create a handoff for the to-do's and to retire to-do entirely in favor of handoffs.' Weave v2.0 Step 6 now walks the open handoffs." \
  --source-id "<the Weave commit>"
