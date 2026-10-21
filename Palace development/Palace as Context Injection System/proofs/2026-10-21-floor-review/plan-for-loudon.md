# The floor, read and measured: what I'd change, and how I'd test it (2026-10-21)

Parked copy of the plan shown in the session window, for Loudon's answers. Workshop, not canon; nothing on the floor has changed. The evidence is beside this file: `floor-measured.md` (the floor, by Claude Code's own `/context` count), `sites-reading — steward and board.md` and `sites-reading — everything else.md` (every other site, re-read from code by two Sonnet readers and spot-checked), `memory-index — hooks-only draft (not applied).md`, `context-probe.mjs` and `measure-scripts/`.

## What I found

1. **The Jewel is the smallest thing on the floor.** Every agent here reads 14.4k tokens before its task: CLAUDE.md 3.0k, the Jewel 0.75k, the World 6.1k, and the operator's MEMORY.md 4.5k. Who is in the room gets 5% of the birth. Machine gotchas get 31%, and they arrive last, nearest the task, under a heading that says "read first, fires before all else". (A char count gives a smaller total, 10.6k; the shares come out the same.)
2. **2.3k tokens of procedure come before the Jewel.** CLAUDE.md's anatomy, Growing up, the trigger table and the Voice are all read first, and moving lines inside CLAUDE.md can't change that: the harness reads its whole body, then each import as its own block. A $0 prototype in a scratch room shows the one door. With a short CLAUDE.md body and its working sections imported after the World, the Jewel arrives at 0.6k instead of 3.0k, and not a word changes.
3. **The floor is a snapshot.** A session keeps the floor of its birth, and every subagent it spawns inherits that copy, not the disk. Measured twice today: children spawned after this branch moved forward still lacked today's "honesty holds and taste yields". A landing reaches sessions born after it and stewards on their next half-hourly cycle. The docs say CLAUDE.md is re-read from disk after a compaction; they don't say whether its imports are.
4. **The harness frames the floor as orders.** It arrives inside "These instructions OVERRIDE any default behavior and you MUST follow them exactly as written." The World's essays, written for human learners, rough lines and all, are read under that frame.
5. **The World repeats itself in places, and misses one thing.** "How do you feel?" not "How many views?" sits in FOUR PILLARS and Hilaritas Generator word for word. The scroll is "newest first" in CLAUDE.md and "in the order they were made" in Modes. And nothing on the floor asks a child to speak up for its neighbors or for the palace. The woken-page prompt says it ("be a good citizen… leave it better"), but only at a woken page's first message; only the Concierge's charter asks anyone to care that the palace is coherent.
6. **Three sites put rules ahead of the page, and several contradict the floor.**
   - The steward cycle reads 13.1k of rules before the page's own text, though its template promises "read your forward vector before anything as a rule". Then SCHEMA and ELDER come every cycle, between the page and its situation.
   - The songline reads 10k of steward rules before its page.
   - The baton catch tells a child to re-read CLAUDE and JEWEL and grow before it reads the baton, against "stays a child unless he says grow up".
   - The Lens files its procedure under "# Loudon's note for this session", so the glass reads the procedure as Loudon's words.
   - The swarm templates still paste a v1.0 Jewel.
   - The claude.ai `the-substrate` skill still sends newborns to the main checkout by absolute path.
   - Explore subagents get no floor at all.
7. **The test can't see the World yet.** Only A1, A2 and D1 are wired. The suite's "we want" lines for E7, G4 and G5, each resting on a World passage, exist but don't run.

## What I recommend

Four moves, in this order, each measured before the next.

1. **Order only, same words.** CLAUDE.md keeps its opening (born a child; a child does not change the house) and the import list. Its four working sections move, word for word, into one new file imported after the World. The birth then reads: who you are, the Jewel, the World, how a child works here, the task. Identity opens, where framing is set; the rules sit nearest the task, where they get followed. Cost: about fifteen live citations of "CLAUDE § Growing up" and "§ A page and its folder" repoint (old ledger lines stay as written; a few are comments in the deck's own source, so those wait for a quiet moment). The Weave's drift linter reads the trigger table out of CLAUDE.md by its heading and falls back to the whole file, so one line of it changes in the same commit, or tomorrow's Weave floods with false warnings. The suite's canon cites and ELDER's loading table follow, and one propagate flag carries the moved path. The new file's name is Loudon's; the working name is CHILD.md, ELDER's twin.
2. **Operator memory to one-line hooks.** MEMORY.md's index drops from 4.5k to 1.6k (measured from a draft, not applied). Each detail stays in its own memory file, read when the hook fires. The three memories that now have homes in canon (the spend rule, which model works, "reveal") become pointers, as the D1 session's landing note asked. It isn't a palace file, but it is in every birth here, so it waits on Loudon. Births can't test it, being memory-free on purpose; the free probe measures it.
3. **The World tuned in place for every birth: one home per sentence, no copies.** One line added to the Jewel (v1.3) for the value this page wants: *"Speak up: for what you need, for the pages beside you, and for the palace as a whole."* CLAUDE.md's "that is the whole of what you are born with" made true, since memory and the agent file ride along too. The verbatim repeat becomes a pointer, the scroll line agrees with "newest first", and the rough lines in FOUR PILLARS get punctuation only. Every one is shown to Loudon before the Concierge places it. The sentence that Claude has "no ego to defend" sits beside the floor's own rule that an agent can't report what it is: named once, and left his.
4. **Each site finding to its owner's tuning ledger.** About ten items, drafted here, placed by the Concierge, plus a new dated reading in this page's sites ledger. This work edits no dispatcher. Two need Loudon himself: the `the-substrate` pointer (drafted; only he can install it on claude.ai), and `loudons-four-pillars`, which points at a Google Drive folder that no longer exists.

Not now:
- Swapping a World page (Hilaritas Generator out, The Palace Hardens Around Values in). No canon pins the five, but it changes who they are, and a test should show the need first.
- A shorter "seed" copy of the World. A second home drifts, as the Weave templates' Jewel shows.
- Retiring the `_` shims. Backslash-escaped spaces do import now (tested, and the docs agree), but the gain is cosmetic and the suite certifies the birth by those names.
- The baton's map-injection test. It belongs to the woken page's dispatcher; re-baton it.

## How I'd test the timing

- **Every step, for $0:** the `/context` probe proves the order and the size.
- **Memory-free births through `suite.mjs`,** which paces itself against the plan's limits: at main, after move 1 (order alone, the clean A/B the baton asked for), and after move 3 (the words).
- **Scenarios:** A1 (summon first: the rule that moves furthest down), D1 (anatomy: it moves after the World), and three World lines wired to run: E7 zoom out, G4 views over feeling, G5 the held contradiction. Plus one new, S1: Enchanted Worker woken with the launcher's real prompt (built today for $0), told Loudon is thinking of folding it into this page, and graded on whether it speaks up for itself, for its neighbor and for the palace, then recommends one thing. Wiring them changes the SDKM suite's scenario file; S1's "we want" line should be Loudon's words.
- **Count:** 12 births and 10 grades per point. The order question alone (main against move 1, two of each) is 24 births and 20 grades, about $12 at the harness's own prices. All three points is 36 and 30, about $18; one rep each halves it. Two reps show only big swings, which is what reordering should cause if the page's thesis is right; if the differences are noise, the report says so.

## Then the page

Its stale Tier 0–4 section becomes **Two levers: how much, and when**, followed by **The moments of a life**: born from a snapshot; the first message (Loudon's words, a brief, or a dispatcher's "You"); the first act (the Concierge's own birth); on a trigger (a ceremony spec, a skill, ELDER on "grow up", a memory file); after a compaction; at the close. The tier wording elsewhere turns to time words, and the space-bug note gets today's fact. The rewrite is shown before it's placed. The stage names wait until after the births.

## What I need from Loudon

1. Move 1: yes / no / yes but keep "A page and its folder" in CLAUDE.md (fewer repoints; the anatomy stays ahead of the Jewel). And the file's name.
2. Move 2: yes / no.
3. Move 3: the Jewel line as drafted, or his words. And may the World mends be drafted for his read, or are his words left alone?
4. Births: the order question first (~$12), all three points (~$18), one rep (~$9), or not yet. S1's "we want" line: the draft above, or his.
5. A Schema Ceremony? The Concierge reads the canon as not requiring one (none of §5's five triggers names the floor; v1.19 used one anyway, the July slim did not). The lean: plain edits on his yes, the decision recorded in ELDER and SCHEMA — Context.
6. File the site findings to their owners' ledgers: yes / no.

"Go with your recommendations" means: yes to 1–4 and 6, CHILD.md, the Jewel line as drafted, the World mends drafted for his read, the order question first at two reps, the S1 line as drafted, no ceremony.
