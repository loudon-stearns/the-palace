---
title: "Weave Ceremony — tuning"
born: 2026-09-24
links:
  - target: "[[Weave Ceremony]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Weave's record of what each run taught it, numbered, each lesson naming the spec change it forced, if any, so the ceremony's version number has a reason you can read. Append after every run; never prune what a real run taught."
ledger: tuning
standards:
  for: "what each weave taught the Weave"
  run: "one weave"
  line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "the run itself, in the commit that records it"
  merge: union
  kept: git
  trim: never
---

# Weave Ceremony — tuning

What each weave taught the ceremony, appended after the run. Each entry names the trap, where it came from, and the spec change it forced, if any — or says plainly that none has landed yet. Newest last. Hashes are commits to `_ops/Weave Ceremony.md` unless noted.

## From the 2026-03-30 weave

1. **`connects-to` is the most under-described type.** Formalizing 34 unsung paths showed the body often names the relation more exactly than the type does. Forced: the label note in Step 3a and a new Step 3c, label enrichment (`b54785f4`).

## From the spring weave — activated 2026-04-07, recorded 2026-04-21

2. **One agent can't hold the palace any more.** Past about 50 entries a single-agent weave took too long. Forced: the Swarm Weave became the canonical path, with single-agent kept for palaces under ~20 (`76e60f39`; Context § Swarm Architecture).
3. **A weave without a fresh map is working on stale topology.** Forced: a Map Build as the standard opening step (`76e60f39`).

## From the two weaves of 2026-06-05

4. **Deposits were posting flags to a board the ceremony never read.** Forced: Step 1c (read the `weave_flag` inbox) and postcondition 2b (`6ef44f01`).
5. **Work can be lost in git's cracks before anyone looks at the graph.** Forced: Step 2.5, the substrate sweep, with recovery always additive and every discard named in the commit body (`6ef44f01`). The afternoon run discarded 7 dangling commits under it (`b445ac03`).
6. **The weave wrote links before reading SCHEMA, and §4 direction errors reached a commit.** Forced: Step 0, load the foundation, and precondition 3 (`7340f044`).
7. **SCHEMA's own wording for `deepens` / `emerged-from` was backwards** against the README and against usage, which had produced 9 reciprocal-direction pairs. Forced: Schema v1.9 (both point back to their ground) and the matching Step 0 trap (`00264952`).
8. **A careful hand audit still misses inverted arrows across dozens of worker links.** Forced: the link-direction linter as postcondition 2d and Step 6.5 (`8c412b02`). The afternoon run cleared 15 E1 errors and was the first to pass it (`83797950`).
9. **The map was counting vendored third-party docs as entries** (`node_modules`, venvs, build caches — 138 dropped). Forced: exclusions and a bundle-folder detector in the map builder. No spec change; tool only (`83797950`).

## From the doc-drift repair — 2026-06-09

10. **There is no stable map-builder name; the builders are date-stamped**, so the card's `build-map-<date>.py` placeholder was not runnable. Forced: Step 6.5 runs the newest builder by glob, the doc-drift linter joins as 2e, and a routing note for session artifacts (`14a4d13a`).

## From the simplification pass and deep-weave prep — 2026-06-16

11. **Guardrails written for weak workers aged badly.** Step 0 carried a long re-explanation of §4 traps aimed at Haiku; under the Sonnet-and-up baseline it was cut, with SCHEMA §4 and linter 2d as the backstop (`d0b2ee24`).
12. **Memory drifts from canon unless something tends it.** A MEMORY.md index line claimed a preference its own file had already reversed. Forced: Step 6b, reconcile memory (`ffff7c4e`), widened on 2026-07-05 to "weave memory home" (`0f319f83`).

## From the deep swarm weave — 2026-06-26 (parked, write-back finished 06-30)

13. **The run parked on usage limits mid-way.** The write-back then landed piecemeal on 06-30, closing with `031d2b3c` (CLOSEOUT). No spec change; the September plan answers it by ending every phase at a checkpoint in `RESUME.md` (`weave-2026-09-24/PLAN.md:45`).
14. **A naive frontmatter inserter jams the closing `---` onto the last label** when `links:` is the final key, and `yaml.safe_load` still passes it. Check structure, not just parse (`weave-2026-06-26/RESUME.md:41`). No spec change.
15. **Worker facts about people are unreliable** — one showed R. Murray Schafer dying in 1933 (it was 2021). Person fields were deferred to a lookup pass (`Weave Report — 2026-06-26.md:32`). No spec change.
16. **A full deep sweep costs too much**: about 60k tokens per Sonnet worker, near 21M for the whole palace. The run deep-read a ~73-entry priority set and scanned the rest with a free script (`weave-2026-06-26/RESUME.md:127-128`). No spec change.

## From the naming bugs — 2026-07-01

17. **macOS hides naming drift until a case-sensitive reader trips on it** — `Modes of collaboration/` beside `Modes of Collaboration.md` split a bundle. Forced: the entry-naming linter as postcondition 2f (`c541dc45`).

## From the charter conversation — 2026-07-05

18. **A newborn entry is the least-connected node by construction.** A deposit writes its outbound links; the links that make it reachable live in other files, and only a weave edits those. Forced: Step 0b, the new-entry catch-up (`0f319f83`; Context § Widened Charter).
19. **Hard caps had drifted into contradiction** — the postcondition said 5 new introductions, Step 3b and the Context said 15. Forced: the caps became guidelines for pace, which retired the contradiction instead of picking a number (`0f319f83`; Context § Rate Limit Rationale).

## From the Multi-Lens Weave — 2026-07-06

20. **A baton-launched weave skipped the flag inbox**, because 2b was the one postcondition with no check behind it. Forced: `lint-weave-flags.py` gates 2b however the weave is launched (`8845461f`).
21. **Fixing the graph doesn't tell the board.** Without a `Palace-Resolves:` trailer per flag, 35 resolved flags stayed open; PROOF posts are narration the queue never reads (`multi-lens-weave-2026-07-06/weave-flags-resolved.md:1-9`; [[Closing Well — tuning]] 19). Paid in v1.7 (item 43): Step 1c closes an entry flag by trailer or decline, and a touch is read by hand.
22. **One cut of the map only sees what that cut can see.** The oblique pass found pairs no folder, community or mirror lens could assemble. Forced: Multi-Lens as the canonical execution, and the HTML report as postcondition 5b (`8845461f`; `synthesis-report.md` § IV-b).

## From the voice measurement — 2026-08-25

23. **A stated value with no check drifts to the writer's default.** Word choice held; em-dashes rose 41% and bold 53%. Forced: the voice-drift linter as 2g, flag-only, set at p90 because a check that fails half the corpus teaches you to ignore it (`62d6ffbd`).

## From the September weave — 2026-09-24 (found and fixed during the run)

24. **The flag linter was wrong in both directions.** It matched `*<entry>*.md` and counted `target_entry`, so a touch to a scroll or a gotchas file "closed" a flag, and it couldn't read older payloads. Fixed in the tool, which now reports touched-but-unverified (`dd094117`; `PLAN.md:86`). The Step 1c change, as in 21, was paid in v1.7 (item 43).
25. **Ceremony cards were link targets but not nodes**, so their links never counted as inbound. Loudon, 2026-09-23: ceremonies are woven. Forced: the "Ceremonies are woven too" line (`8972a53d`; builder in `dd094117`).
26. **The catch-up measured the wrong thing twice.** Total degree hid entries with no inbound links (OBS: 7 links, 0 inbound); inbound-only then counted symmetric links one way — 17 "unreachable" were really 1, and 46% of walk proposals re-drew links that already existed. Forced: Step 0b now counts reach (`8972a53d`; `RESUME.md:42`; Context § Who the Workers Should Be).
27. **Growing the workers up didn't help; the harness was the problem.** The elder arm was as wrong as the children (71% invalid) at 16% more cost. Showing each room's existing links both ways and "read both pages first" took duplicates from 13% to 2%. No spec change: workers stay children (Context § Who the Workers Should Be; `ab/RESULT.md`).
28. **No first reader caught its own errors.** Every correction came from a second reader — the Concierge's cold read, blind judges, a skeptic pass that refuted 33 of 82 batch candidates. Proposed, not yet a rule: a skeptic stage before any batch signing, and the Concierge reading the decision surface cold (Context § Who the Workers Should Be).
29. **A pair of entries carries one typed link.** A weaker link isn't added beside a specific one; a generic `connects-to` is retyped in place; direct lineage reciprocals are the exception. Recorded in the Context; the card didn't say it. Paid in v2.0 (item 47).
30. **The "≥5 typed links" hub bar was set when the palace had ~30 entries**; the median is now 6. This run used worker convergence (three or more unassigned workers) or the top inbound decile instead. Departure, unverified; the card said ≥5 (`PLAN.md:135`, `:203`). Paid in v2.0 (item 48).
31. **One lens at a time costs Loudon four sittings and hides the cross-lens signal.** All Core lenses fanned out together, against the template (`PLAN.md:202`; `Multi-Lens Worker Prompt Template.md:140`). Departure, unverified.

## From the 2026-09-24 plan — the six adjustments (applied this run, unverified)

32. **The Bridge lens.** Tool entries and thought entries are written in separate vocabularies by one mind; pair them and ask each find to quote both pages and pass a fidelity test (`PLAN.md:36`, `:118`).
33. **A walk for the newcomers and the unreachable.** Workers follow typed links outward from each target and propose inbound links from neighbours, rather than surveying (`PLAN.md:37`, `:117`).
34. **A two-pile signing, sampled.** Pile A holds only moves already judged elsewhere; Loudon reads ten at random, and one wrong item sends the pile back — so a single yes is honest (`PLAN.md:38`, `:144-153`).
35. **The board tells the truth.** Payloads read from the board, a trailer per closed flag, touches checked by hand, the flag linter green before any trail is posted — the answer to 21 and 24 (`PLAN.md:39`, `:180`).
36. **Pheromone trails.** Held findings go on the board as flags the next weave reads first, with an advisory `expires_after`, instead of becoming a longer queue (`PLAN.md:40`, `:165`, `:192`).
37. **Cross-cycle convergence.** Workers never see July's held list; anything they find again on their own counts as confidence that has survived time (`PLAN.md:41`, `:130`).

## From the 2026-09-24 close (the ceremony-evolution close, after the weave)

38. **The ledger's first forced change was "read the ledger".** The card told a run to write tuning items and never to read them, so the four owed changes (21, 24, 29, 30) had no path back into a run. Loudon, at the close: "Is there a point in logging growth if we don't ask to check it." Forced: Step 0 now reads this file, owed items first, then anything after the last-run version — **v1.1**. The rule itself went into Schema v1.21 for every ceremony.
39. **The weave should watch its own language.** Loudon, 2026-09-24 close: look for over-complex, self-analysing prose, propose simplification, and be freer with deletion. "Lighter" means simpler statements of fact and taste, not less content. Paid in v2.0 (item 49): the Multi-Lens Worker Prompt Template's Pool 1 task 4.

## From the door — 2026-10-14

40. **The sweep could see dirt but not owners, and could not tell leftovers from work.** Five git commands list uncommitted edits and unmerged branches; they cannot say who wrote a file or which of a dozen worktrees are merged and clean (on 2026-10-13, eight of nine were, about 19 GB). Forced (v1.4): step 2.5 runs `trunk-state.mjs` as its sixth command, and its rows take recover, discard or leave like the rest.

## From Loudon's word — 2026-10-14

41. **The face policy and its script had drifted apart, and the script hid a project.** Step 5c said projects get a face whatever their stage; `face-audit.py` turned away seed and sprout entries of every type before it looked at type (`face-audit.py:160` at `6019acd7`), so [[LDN RTM]], a sprout project, never reached a batch. It also made five or more of an entry's own links an "always", a rule the card never named. Loudon, 2026-10-14: "I want it to be simpler, every canon gets a face and hero." Forced (v1.5): every canon entry wears a hero and an icon and none is retired; Step 5c, postcondition 5a, the commit line and the report's Faces line say so, and `face-audit.py` prints one list. 23 of 316 were faceless that day.

## From the roster check — 2026-10-18

42. **Two weaves fixed the Shop roster by hand and neither filed it.** The 2026-07-06 and 2026-09-24 syntheses both listed a re-run of `build-roster.mjs` under Mechanical (`multi-lens-weave-2026-07-06/synthesis-report.md:95`; `weave-2026-09-24/synthesis.md:33`). On 2026-10-18 the roster was stale again: [[Frame Designer]] and [[Loudon Live Post-producer]] moved into `Shop/` on 2026-10-12 (`d1d0e7f5`) and nobody re-ran the builder, and the Shopkeeper's own audit that morning called the roster clean ([[Shopkeeper — scroll]], cycle 2). It caught up in `8430c01c`. Two runs proving the fix mechanical is what earns a gate. Forced (v1.6): `lint-doc-drift.py` E4 fails postcondition 2e while a generated block is stale (the linter, `88c5f5f2`).

## From Loudon's word — 2026-10-18 (decisions reach every page)

43. **A decision had no way to reach the whole palace.** Several times a session settled something that should hold on every page and spread it by improvising: a propagation plan and a baton (Schema v1.28's ledgers), a same-day sweep of 244 entries (`activation_count`), a mirror set of six docs, or a line of prose saying "flagged for the next Weave" with nothing on the board (`BLUELINE — The Page.md:30`, `Enchanted Conversation Archive.md:241`, `SCHEMA — Reference.md:168`). The weave flag could not carry one: it names entries, and a touch to any of them closed it. Loudon, 2026-10-18: "any task/item/decision that needs to spread throughout the palace should be presented as a weave flag, and then in the next weave the weave agents should know about what needs to propagate and perform the tasks." Forced (v1.7): the propagate flag (`flag_type: propagate`, no source entries, a scope, a check, an optional pattern, a rhythm of sweep or by-touch), posted by `python3 -m commons propagate`; Step 1c carries it, postcondition 2b and the commit line count it, and `lint-weave-flags.py --since` gates it. The same change paid items 21 and 24, and fixed the linter, which had counted a flag resolved when any commit body named it, including the commit that posted it (`666a7bc1` listed three flags and the linter called them done).

- from Loudon · 2026-10-18 · "lets have the first weave settle it": the live deck greys 57 weave flags where lint-weave-flags.py counts 64 resolved; the deck learned the flags in a0202f3f and the cause is unconfirmed · paid in item 59

## From the floor review — 2026-10-21

44. **The worker templates paste an old Jewel, and Explore workers get no floor.** `_ops/swarm/Multi-Lens Worker Prompt Template.md:64-65` and `_ops/swarm/Single-Doc Worker Prompt Template.md:30-32` carry a condensed pre-v1.2 Jewel ("You are within a web of interconnected markdown files"): two copies that differ from each other and from today's. The 2026-09-24 weave didn't paste it; its palace-reader workers were born with the real Jewel (`_ops/swarm/sessions/weave-2026-09-24/RESUME.md:28`). But `Projects/Swarm Weave.md:188` still names `Explore` workers, and Explore loads no CLAUDE.md at all (none of 107 Explore transcripts, June to October), so for them the stale copy would be the only Jewel. Found in [[Palace as Context Injection System — sites]] (Reading · 2026-10-21); evidence `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/sites-reading — everything else.md:93-101`. Paid in v2.0 (item 50): the inline copy is gone from both templates and the coordinator dispatches `palace-reader`.
45. **Two of the Weave's own lines credit CLAUDE.md with the Jewel's words.** `_ops/Weave Ceremony.md:185` ("per [[CLAUDE]]'s 'missing connections are invitations'") and `_ops/swarm/lint-ghost-links.py:11` ("CLAUDE.md holds that 'missing connections are invitations'") point at a line CLAUDE.md doesn't carry. The Jewel does: "A missing connection is an invitation" (`JEWEL.md:47`). Noticed by the Concierge during the floor review. Paid in v2.0 (item 51): both point at [[JEWEL]].

## From the map-use plan — 2026-10-22

46. **The Weave rebuilt the map twice and never read what changed between builds.** The opening step ran a full Map Build ceremony (a run line each time) and Step 6.5 found the builder by shell glob; no step compared the fresh map with the last Weave's, so the deposits and flags since then had to be re-derived from the files. Loudon, 2026-10-22: "The Move 3 decisions and card edits are approved as drafted. Write the build-map.py shim and its test, then have the Concierge place the card edits and commit." Forced: **v1.9** — the opening step runs `_ops/swarm/build-map.py` (a build, not a run: [[Map Build Ceremony]] § Cadence) and then `palace-map.py diff <last weave's map> <today>`; Step 2 opens with that diff as its first bullet; Step 6.5 calls the stable door and diffs open against close; the report format carries "Since the last map" after Palace state and "What this Weave changed" at its end. Move 3 of the plan on the [[Palace Map]] scroll.

## From the October weave's open — 2026-10-24 (v2.0)

47. **One link per pair had a rule and no step.** Item 29 sat in the Context for a month while 410 pairs carried the same relation twice: 213 a symmetric type written on both sides, 151 a bare `connects-to` beside a specific link, 6 exact duplicates, 40 two specific types. Forced (v2.0): Step 3d, prune and retype, with `lint-link-pairs.py` behind it — flag-only until two clean runs. Pays 29.
48. **The hub bar of five was set at thirty entries.** 166 non-hub pages cleared it; 25 pages sat in the top inbound decile (19) without the type. Forced (v2.0): Step 2 and Step 5 take the top inbound decile, which `weave-health.py` prints each run. Pays 30.
49. **Lighter prose needed a worker to ask for it.** Forced (v2.0): Pool 1 task 4 in the Multi-Lens template — propose the simpler statement or the deletion, quoting the passage. Pays 39.
50. **Workers were handed a stale Jewel.** Both templates carried a pre-v1.2 paste, and `Explore` workers loaded no CLAUDE.md. Forced (v2.0): the paste is gone; the coordinator dispatches `palace-reader`, which is born with the real one. Pays 44.
51. **The card and the ghost linter credited CLAUDE with the Jewel's line.** Forced (v2.0): both cite [[JEWEL]]. Pays 45.
52. **A link the body never explains had no scan.** The unsung path (prose without a link) was audited from the first weave; its inverse never was. At this weave's open 1,028 of 2,943 frontmatter links pointed at a page the body never names, 354 of them unlabelled too. Forced (v2.0): `unsaid-links.py` and Step 3e; postcondition 2i settles every bare unsaid link.
53. **Label enrichment as "a handful per weave" could never catch up.** 558 bare `connects-to` at the open, against a handful a run. Loudon, 2026-10-24: "I agree that all the 'connect to' links are weak, labels or removal is fine … lets bias toward making the links high quality and lesser, and if some come back later, great." Forced (v2.0): Step 3c settles every bare `connects-to` — label, retype or cut; the Standing Order on the scroll carries his words.
54. **The face layer was complete and the memory layer was thin.** 316 of 325 pages wore both faces; 20 of 324 had a Context, 60 a scroll, 36 a tuning ledger, 3 a rich face, and the pages pointed at most had no account of their shape. Forced (v2.0): Step 5d, the bundle audit (`bundle-audit.py`) with the Context threshold, and Step 5e, rich-face nominations; postconditions 5d and 5e.
55. **No weave could say whether the palace was healthier than the last one left it.** Every report carried numbers; none kept them. Forced (v2.0): the health ledger, `Weave Ceremony — health.md`, a row at the open and the close by `weave-health.py --append`; Step 6.6 and postcondition 5f; the lean closes the report (5g).
56. **Decisions were carried after the read, so the read saw pages the palace had already outgrown.** Forced (v2.0): Step 1c becomes Step 0c, before the fan-out; Step 7 posts a propagate flag for each standard the weave set.
57. **The link types were a first guess, and the labels are the palace's own proposal for the next ones.** Loudon, 2026-10-24: "analyze all connect to labels, see if there are any that are so common that they deserve to be first label links. use fuzzy analysis … our original collection of link types was never meant to be eternal." Forced (v2.0): Step 3f, the label harvest, with `label-harvest.py` behind it and postcondition 2j; a candidate type still goes through a Schema Ceremony.

## From the October weave's run — 2026-10-24 (under v2.0)

58. **A first reader judges a link by whether either page names the other by title, and misses the reason written another way.** Nine Opus skeptic sets refuted 48 of 320 sampled verdicts (cuts 88% passed, retypes 81%, labels 85%); nearly every failed cut had its reason under another name ("four pillars" in display text, Meadows in the hub's own worked example), in a Context companion, in SUBSTRATE's anatomy face, or on the hub's side of the pair. Forced (template, no version move): the Multi-Lens worker brief's weak-link task now says where a reason may hide before a cut is proposed. The skeptic stage stays; this is what it is for.
59. **The deck greyed fewer flags than the linter counted because `buildQueue` drops an entry flag once a RESOURCE_GRANT or RESOURCE_DENY answers it** (`_ops/stigmergy/app/src/lib/queue-model.js:58-63`, `:182`), so an answered flag with a trailer is never greyed, only gone. Replayed 2026-10-24: 171 board flags, 164 deck items, 7 dropped — the gap. The linter's substring match was tightened to the deck's exact-token rule the same night and changed no count. Pays Loudon's one-shot order of 2026-10-18. Fix owed to the app: keep an answered entry flag in the list when a `Palace-Resolves` trailer exists, so it greys; and honour RETRACT in `buildQueue`.
60. **Readers worked from the map as it stood before the mechanical fold, so some cuts aimed at links the fold had already removed, and a few rationales claimed a reciprocal link that did not exist.** One pair would have lost both its links to two readers in two rooms. Forced in the run: the merge step holds the second cut on any pair (the pair guard) and applies against the frontmatter as it stands. Spec change owed: run the mechanical fold (Step 3d's W0/W1/W2 cases) before the fan-out, so every room reads the pairs as they will stand.
