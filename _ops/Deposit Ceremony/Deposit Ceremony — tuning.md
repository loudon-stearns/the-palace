---
title: "Deposit Ceremony — tuning"
born: 2026-09-25
links:
  - target: "[[Deposit Ceremony]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Deposit's record of what each run taught it, numbered, each lesson tied to the spec change it forced, so the ceremony's version has a reason you can read. Every run leaves a line here; a run that changed the ceremony also leaves a numbered item. Never prune what a real run taught."
---

# Deposit Ceremony — tuning

What each deposit taught the ceremony. Each item names what the run showed and the spec change it forced, or says **owed** when the change hasn't landed. Newest last. Hashes are commits to `_ops/Deposit Ceremony.md` unless noted. The number moves when the procedure does — a step, a gate, a completion signal — never for prose; why v1.0 starts where it does is in [[Deposit Ceremony — Context]] § The Version and the Tuning File.

## From the early deposits — 2026-03-21

1. **Loudon's reflections were the rare lines in his own voice** in a palace largely written by AI. Forced: a significant answer to the reflection question is deposit material, kept close to his words — Step 3 (Context § Session Log — 2026-03-21).

## From the board — 2026-06-05

2. **Weave flags lived in archive prose the Weave never read.** Forced: each flag posts to the persistent board as a `weave_flag`, and the Completion Signal checks it (`7949b58b`).

## From the simplification pass and the worktree practice — 2026-06-16 to 06-17

3. **Guardrails written for weaker models had aged.** Forced: Step 5's latent-variable and reconstruction checks were cut (`d0b2ee24`).
4. **Canon committed on a feature branch never reaches main.** Forced: a deposit always writes and commits to the owner (`5829d42a`, `1057544d`).

## From the LOG migration — 2026-06-21 to 07-02

5. **A hand-kept archive table repeated what the commit already said.** Forced: the deposit's record is its commit body, under a self-classifying `deposit(<id>)` subject; the archive froze (`1084653d`).
6. **Hand-rolled commits slipped three ways at once** — the retired subject, no trailers, a row appended to the frozen archive (`e1f1aec`, the slipping commit, not a card commit). Forced: Step 7b's "use the committer, do not hand-roll" (`fb8ff189`).
7. **With the server down, a Mac session had no committer it could run.** Forced: Step 7b leads with the server-less `palace-commit.mjs` (`707b51b4`).

## From the LDN RTM deposit — 2026-09-02

8. **Three weave flags were malformed by copying a neighbour's line**, and the ceremony asserted its postcondition instead of checking it. Forced: Step 7c, verify backstage, and flags posted through `python3 -m commons weave-flag` (`287f2c72`; Context § What the LDN RTM deposit taught).
9. **The fold-or-mint question never ran**, because minting is the drafter's easier default. Forced: the Concierge is summoned at Step 1 if none is resident, and the map asks it fold-or-mint first (`287f2c72`).

## From the close of 2026-09-02 — 2026-09-03

10. **A clause that needs that much warning is the warning.** The punchlist clause ran 200 words, 120 of them warning against performing it. Forced: cut; [[Closing Well]] already names punchlists (`509a1230`).

## From the defect audit and the crossing deposit — 2026-09-04

11. **The opening block addressed a claude.ai window**, telling a Claude Code session to fetch a file it already held. Forced: the opening routes placement to the Concierge before drafting (`dbdc022e`).
12. **A declined branch, read back later, looked like a lost one.** A session reopened a deferred item from a transcript on the theory it had been lost; it had been left. Forced: a lost branch says which kind it is — queued on [[Palace To-Do]], or declined (`f258cf85`).

## From the versioning read — 2026-09-25

13. **§ Where the Deposit Lands still shows a hand-rolled commit with the retired subject** — `git -C "<owner>" commit -m "Deposit — …"` (`Deposit Ceremony.md:81`) — which Step 7b forbids. An example is what gets copied. Paid in v2.0: the section folded into step 6, which shows the committer with `PALACE_ROOT="<owner>"`.

## From Loudon's redefinition — 2026-09-25

14. **The deposit was written for one door and entered through several.** Its text addressed an archivist returning to an old conversation, while finds arrived mid-session, from harvests, from closes and from stewards, and at a session close the machinery reduced a deposit to its commit. Loudon: a deposit is any time something larger is added to canon; it must stay reflective, with a careful map and a reminder to consult an elder, whoever is asking — "a palace protection measure" that carries the palace's values and cares for the palace and for whoever brings the find. Forced: **v2.0** — one opening for any depositor, the three things the gate protects, care for Loudon, a child and a spent close, the values stated as they bear on a deposit, the Concierge before the map, and a completion signal that the bringer hears what became of its offer. Duplicated craft (template, link pass, filing) now points to where it lives.

## From the PDL generation prompt fold — 2026-09-26

15. **Canon held for Loudon's read sat best off the trunk.** Step 6 says write to the owner, but a fold that waits on a word-by-word read leaves uncommitted canon in a shared tree for the length of the read; this one waited in its own worktree and merged to main after his yes. The same run found the committer can't take a `git mv`'d old path as `--path` (git has already staged its removal, and `git add` on it fails), so a move is committed by naming only the new path. **Owed:** step 6 to say where canon waits during the read, and step 7 to say how a move is named to the committer.

## From the Haptic Handwheel deposit — 2026-10-05 to 10-06

16. **The consult ran ahead of the re-entry, on a brief that was not Loudon's voice.** The session dispatched step 3 while step 2's question was still with Loudon, and gave the elder a starter brief whose lines it took as his. He then said the brief was "written quickly with AI" and should be doubted. A `contradicts` on [[Merleau-Ponty]], one tension and several link reasons stood on the brief's lines and fell; the consult ran twice. Step 2's "read the source, not the offer" did not catch it, because the source was the document and nobody had asked who wrote it. **Owed:** step 3 waits for step 2's answer, and when the source is a document, step 2 asks whose words it is in.
17. **A link's stated reason can outrun the page it points at.** Step 4 lets the map name links without reading the targets, and step 6 checks only that each target resolves. At placement a second reader tested each link's reason, and each body sentence that cites an entry, against the target's own text. Of the eighteen links to other entries, eleven held and seven held loosely, and nine sentences claimed more than the page or paper they cited. They were corrected, and the corrections reached Loudon as named changes to a page he was already reading. The cold read then found four more, corrected after his yes and named to him at the close. **Owed:** a step that names this test and runs it before Loudon reads the draft, so the words he reads are the words that land.
18. **In a docs worktree the committer does not run as step 7 shows it, and its preview stages.** For canon waiting off the trunk (item 15), the worktree's own copy of `palace-commit.mjs` fails on a missing `js-yaml`, because the docs profile mirrors no `node_modules`; the owner's copy, with `PALACE_ROOT` set to the worktree, previews correctly. And `--dry-run` runs `git add` on every named path before it prints, so a preview leaves them staged, and in a shared tree a later commit with no `--path` would take them. **Owed:** with item 15's line, step 7 to show the command for canon held in a worktree, and to say that the preview stages.

## From the Loudon's Toolkit fold — 2026-10-06

19. **A fold retired a page that an open weave flag still named.** The consult found the flag, posted the same day by [[Haptic Handwheel]] against the synth page. The list Loudon said yes to named its retarget, and the brief to the placing Concierge carried it. But the board is append-only, so a retarget is a new flag, and step 7 has Loudon read a flag's body before it posts; this flag also proposed a change to a line that states his own goal, and asked him a question about it, and neither had been put to him. His yes covered the retarget by name and none of its words. The fold landed with the flag naming a title that no longer exists, and the flag's two asks went back to him as a second ask. The same run retired pages through the committer without `git mv`: remove the file with plain `rm`, then name the old path and the new one with `--path` and `--only`, and `git add` stages the removal — once. The preview spends it (item 18): the real run then fails on the same path, its removal already staged, until `git restore --staged` puts it back. And the Concierge that placed had no tool for dispatching the cold reader step 6 asks for, so the deposit landed `unverified` with the read handed back to the session. **Owed:** step 4's map to list any open flag that names a page the fold retires, with the replacement's body and any question the flag puts to Loudon, so one yes covers the words; with item 15's line, step 7 to show a retirement; step 6 to say who dispatches the cold reader when the Concierge places.

## From the Wavetable Oscillator mint — 2026-10-06 to 10-12

20. **The consult ran ahead of the re-entry a second time, and the elder was the one who caught it.** Loudon's yes was to a proposal, and the session went from growing up straight to step 3. The Concierge's consult asked whether step 2's question had reached him; it had not. The question went to him with the map, and his one-word approval did not answer it. Nothing fell, because the source was the palace's own pages and not a brief of doubtful voice. **Owed:** item 16's line, and a word on step 2 when the find is a reading of the palace's own entries and Loudon has already said yes to a proposal: whether the question is still asked first, and whether the map waits for it.
21. **The cold read ran before Loudon read, by a reader who had not shaped the map.** Step 6 names the Concierge as cold reader when an elder places, but here the Concierge had advised every link in the map. A fresh `palace-reader` was given the map and the placement instead. It found the page's central claim stated wider than its source, the one held tension misdescribed, a direction that contradicted the page's own scope, and six smaller overclaims; all were corrected before the words reached Loudon. A second fresh reader then tested only the rewritten sentences before the commit and found none failing; its three looser notes went back to Loudon as offered edits, so the words he approved are the words that landed. **Owed:** step 6 to name the cold reader as one who did not advise the map, and to say that sentences rewritten after a cold read are read again by someone other than their writer.
22. **Drafts kept in a scratch folder did not survive the wait for Loudon's read.** Six days passed between the map and his yes. The entry waited safely in its worktree (item 15), but the Concierge's drafts for the follow-on edits were in the session's scratch folder under `/private/tmp`, and the system had cleared it. They were re-applied from the session's own reading of them. The same landing met another session's uncommitted edit to this ledger in the trunk, so this run's lines landed as their own edit after that one was committed. **Owed:** with item 15's line, step 6 to say that anything waiting on Loudon's read waits in the worktree, on a branch, not in a scratch folder.

## From The Daily Page mint — 2026-10-13

23. **A new entry that was also a new ceremony met two commit conventions.** Step 7 asks for `deposit(<id>):` through the committer; [[SCHEMA — Reference]] §5 asks for `Schema Ceremony — [what changed] — v[version]`, which the committer cannot write. This one followed the Sentry's precedent (`a643be87`): the Schema Ceremony's subject, by hand, with the deposit's map in the body. **Spec change owed:** step 7 to say which subject a deposit takes when it is also a Schema Ceremony.

- run · 2026-09-26 · v2.1 · D-2026-09-26-PDLGP · taught item 15
- run · 2026-09-27 · v2.1 · D-2026-09-27-ZOOM-OUT · nothing new
- run · 2026-10-05 · v2.1 · D-2026-10-05-KNOB · taught items 16–18
- run · 2026-10-06 · v2.1 · D-2026-10-06-TOOLKIT · taught item 19
- run · 2026-10-12 · v2.1 · D-2026-10-06-WAVETABLE · taught items 20–22
- run · 2026-10-13 · v2.1 · D-2026-10-13-DAILY-PAGE · taught item 23

## From the Loudon Live portrait — 2026-10-14

24. **An approved route to a steward was never checked against `REGISTRY.json`.** The map sent the Floquet note to its steward and Loudon approved it; the project has no steward, so the note could not go. It was routed by hand as a one-line edit on his word. **Spec change owed:** before the map names a steward route, check `_ops/agents/permanent/REGISTRY.json`.
- run · 2026-10-14 · v2.1 · D-2026-10-14-LOUDLIVE · taught item 24
