---
title: "STIGMERGY — rich — challenge"
born: 2026-11-05
links:
  - target: "[[STIGMERGY]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of STIGMERGY's proposed rich face: each piece judged for test, fidelity and walk-up against the page, §9 and the terminal's own code, so the face that claims to make honesty structural is honest about the terminal first."
---

# STIGMERGY — rich — challenge

Challenger, proposal round, 2026-11-05, in the worktree `enrich/stigmergy-face` (uncommitted: the relaid `STIGMERGY.md`, the manifest, five made pieces). Judged from the page, the manifest, each piece's source and header, [[SCHEMA — Reference]] §9, the code under `_ops/stigmergy/`, and a read-only look at the persistent board. Every step of every piece was driven in headless Chromium at 760 and 1130 px. I did not make this face.

**Verdicts: 2 keep, 4 remake, 0 retire.**

`conform.mjs "STIGMERGY"`: 6 pages, 0 errors, 7 warnings, the known seven only (five file-local that clear on commit; two sandbox-blocked font loads on the gathered proof). Nothing else.

The finding that runs under three of the pieces: **the page says the terminal reconciles QUEUE against LOG, and the terminal has that switched off.** `QueuePanel.jsx:279-283` disables git auto-resolution ("the heuristic was mis-firing … nothing greys or self-retires off a git guess"). Batons close only by a `handoff_closed` board event (`queue-model.js:486-491`, `handoff-model.mjs:13-14`); weave flags close by a `Palace-Resolves` trailer, and even that is advisory — the card greys and a person clears it (`queue-model.js:476-478`, `QueuePanel.jsx:24-25`). The pieces are faithful to the page's words; the words have drifted from the terminal, which is exactly what the page's own forward vector worries about (`STIGMERGY.md:165`).

## STIGMERGY (opening)

### one line, two readers — keep

**Test or decorate?** It shows more than it tests, and that is right for the claim. "The same data structure serves both" (`STIGMERGY.md:56`) is an architectural fact about the real terminal; no in-page model can test it, only show it faithfully. It does: the agent's reader in step 3 (latest `RESOURCE_GRANT` whose `re` names the request, `one line, two readers.html:128`) is the same fold the stewards run (`orchestrator/src/process-cycle.js:178-208`, last response by `re` wins), and the request and grant are in the real shape (checked against `shepard-steward-034` and recent grants on the persistent board). "No message is sent" is made felt.

**Faithful?** Yes, with two small wording slips, fixable without a second round:
- `:110` — LANES says "a face render". The Regen lane renders a page's hero and avatar (`STIGMERGY.md:120`); "face" here means text, rich or scroll. Say "a hero and avatar render".
- `:69` — the seam "edited, never committed" sits on the gap between OBSIDIAN and THE BOARD; that seam is between Obsidian and git. Move the label or reword it.

**Walk up?** Yes: three tools, one terminal, one line. Works at 760 px, no console errors, reset is clean.

## The honesty discipline, made structural

### say done, or show done — remake

**Test or decorate?** Step 3 tests, but one of its three rows cannot fail: OPENED is defined as `t==='real'` (`say done or show done.html:127`), which is TRUTH (`:124`), so "the OPENED row: 0" is always 0. That is the null that checks its own definition (tuning 12(c)).

**Faithful?** Not to the terminal.
- Step 2 says "only a commit that cites it moves the card … that is the only road" (`:113`). In the terminal a commit moves no QUEUE card on its own (see the top of this record); a baton's card moves on a `handoff_closed` that *cites* a commit, and an ordinary card is cleared by a person's click — which is a road made of saying.
- Step 1's arrow LOG → STATE and "nothing reaches the present by any other road" (`:60`, `:72`) are false: STATE reads the files live (`app/server/api/entries.js:5`), so an uncommitted edit is in the present the moment it is saved.
- The real fake is easier than the piece's. `close-handoff.mjs` checks only that the cited hash resolves (`close-handoff.mjs:9-10`, `:75`), not that it touches the baton's work, and `--force` skips even that.
- At `b = 0` the verdict still says "what remains, 0, is a commit that cites the task … that fake is not prevented" (`:140`); it should adapt.
- At 760 px the row tallies ("26 done, 4 not") sit past the right edge behind a per-row scrollbar (`.cells` nowrap + overflow-x, `:42`; content 802 px).

**What kind of claim?** "You cannot fake completion when the surface itself reconciles QUEUE against LOG" (`STIGMERGY.md:66`) is a design claim about the running terminal, so it has to be tested against what the terminal does.

**Remake, exactly:**
1. Step 1: STATE reads the working tree, LOG reads git, QUEUE reads the board. Put the honesty where it lives: in what *closes* a QUEUE item, not in where STATE comes from. Drop "no road from saying to being" as drawn.
2. Step 2: walk one baton, not a generic task. Agent posts "done" as a REPLY → card stays CLAIMED. `close --commit <hash>` → CLOSED, citing the hash. Show the third road honestly: a person clears an ordinary card by hand.
3. Step 3: keep WORD vs CITED. Make the citation fake the real one — a close that cites a real but unrelated commit, which the door accepts. Relabel OPENED as "what a reader finds who opens the cited commit", not a third test, and don't print it as a count that could have been otherwise.
4. Adapt the verdict to zero fakes; wrap or shorten the rows at 760 px.
5. Carry an offer, `claim-change`, section "The honesty discipline, made structural" and "The coordination schema": `STIGMERGY.md:66` ("the surface itself reconciles QUEUE against LOG") and `:72` ("reconciliation closes QUEUE items when git proves the work happened") describe a reconciliation the terminal has switched off. Today a card closes by a board event citing a commit (batons), a trailer (weave flags), or a person's clear.

**Walk up?** Yes, three steps, test last.

## The coordination schema

### the field — remake

**Test or decorate?** It tests. Step 3's gap sweep is a real model result: duplicate work climbs from 0.0 at gap 0 to 56.5 at gap 8 (200 seeds each; no board 210.5). Gap 0 gives 0 by construction (a claim is visible to the next agent in the same tick, `the field.html:122,127`), which is fine as the baseline. Step 2's no-board side is a strawman, and the teach text says so (`:73`).

**Faithful?** Step 1's field notes match §9 (`SCHEMA — Reference.md:371-398`) for `to`, `board`, `type`, `session_id`, `from`, except two:
- `ts` (`:97`): "the board is ordered by time and never re-ordered." It is ordered by append, never re-ordered; time order does not hold. The persistent board has 112 adjacent `ts` inversions in 1,369 lines. Say "ordered by when it was appended".
- `health` (`:104`): "who is speaking, and how it is doing." `health.model` is the model id; `from` says who. And `score` is a green stub on Path-2 and hand-authored lines (§9, `SCHEMA — Reference.md:381`); every scored line on the board is green, including the Path-2 line this mark is shaped from. Say what it is: "the model that wrote it, and a score the orchestrator writes from a live call — a green stub otherwise."
- The verdict's last sentence (`:172`), "that is why the palace leases what is scarce instead of trusting the board alone", overreaches. [[assume multi-agent]] (`assume multi-agent.md:33`) says the lease *is* a claim announced on the shared medium, and for batons there is no lease at all: rung 2 is not built, and `pickup-handoff.mjs:68-70` re-claims an already-claimed card with a warning.

**Remake, exactly:** fix the `ts` and `health` notes as above; replace the last verdict sentence with what the palace does about the gap — the pickup reads the board at the moment it claims and warns on a re-claim, which narrows the gap but does not close it; a lease is rung 2, not built. Label the chart's y-axis "ticks of duplicate work" (`:165` prints numbers only). Carry an offer, `claim-change`, section "Handoff Lifecycle": rung 1 does not stop a double catch; two catchers who read inside the gap can both claim one baton (`pickup-handoff.mjs:68-70`). The page doesn't say so.

**Walk up?** Yes. Run, reset and new seed mid-run all recover; no wedge. Fine at 760 px.

## The human node

### one pass — remake

**Test or decorate?** Step 2 tests something the page doesn't claim. "Unblocking many parallel threads in a single pass" (`STIGMERGY.md:78`) is a capability claim: because answers come built, one person can clear many forks in a sitting. The piece tests whether batching lowers interruptions, which follows from the arithmetic (tuning 12(a)).

**Faithful?**
- Step 2's verdict says "that is the page's claim, and it holds" at every T > 0 (`one pass.html:146`), including T = 15 min, where a pass clears 1.5 threads — not "many".
- "A parked thread costs nothing" contradicts the piece's own stat. At T = 240, 42 of 80 thread-hours are parked, and the day's forks fall from 38.5 to about 20: half the work never happens. Parked costs no tokens. It does cost the work. The page says only that "a blocked agent is simply waiting on the human" (`STIGMERGY.md:78`).
- Step 1's six asks sit under real page names (`:87-88`, all six real pages) but are invented, and unlike "one line, two readers" the piece doesn't say so.

**Broken states (driven):**
- A pass is counted as grants within one tick (`:104`). While the threads run, clicks 400 ms apart each count as their own pass, so a reader who follows the teach text ("let several pile up, then clear them in one pass") reads "the most you cleared in one sitting: 1". Only pausing first registers a pass, and the piece never says to pause.
- The inbox is rebuilt every 260 ms tick (`draw1` from `tick1`, `:98`, `:109`), so a button is replaced under the cursor. Pressed and held for 150 ms, 4 of 7 clicks were lost.
- Pressing run after every thread is done appends " every thread finished." again, each time (`:109`).

**Remake, exactly:**
1. Rebuild the inbox only when its set of cards changes; update the lanes separately.
2. Count a sitting by the reader's clock (grants with no gap over ~2 s, `performance.now()`), not by tick.
3. Guard the "every thread finished" append.
4. Label the step-1 asks as invented.
5. In step 2, drop "that is the page's claim, and it holds". Add the day's forks reached (or work done) beside the four stats, so the cost of parking shows. Turn the test toward the sentence's real claim: a per-decision cost — picking a built option versus writing a reply — so the reader sees that a pass is affordable only because the answers come built.
6. Revise the manifest caption to match ("threads that cost nothing while parked" goes).

**Walk up?** Yes, two steps, the concept first. Fine at 760 px.

## Handoff Lifecycle

### the fumble and the scent — remake

**Test or decorate?** Steps 1, 2 and 4 show and model; the honest note says rungs 2–4 are not built (`the fumble and the scent.html:8`, `:142`). Step 3 is the test, and it cannot fail. The lease is *defined* as L = τ·ln(1/θ) (`:210`), so s > θ ⇔ t − t_beat < L identically. I swept all 3,312 slider combinations: 0 disagreements every time. That is a derivation presented as an experiment (tuning 12(c)).

**What kind of claim?** "This is where lease expiry and … pheromone that evaporates unless refreshed turn out to be the same mechanism" (`STIGMERGY.md:97`) is a claim of identity between two mechanisms. It is true for scent that is *reset* to full at each beat. It is not obviously true for pheromone as [[Pheromone Trail]] describes it, "reinforced by successful paths" (`Palace development/Pheromone Trail.md:35`), where deposits add up. There the two readings part: a catcher that beat often leaves scent above 1 that outlives its lease after death, by τ·ln(s at death).

**Faithful?**
- Step 1's lines aren't §9 envelopes (`:177-180`), and the comment "as handoff-model.mjs folds it" (`:154`) overclaims. The real fold reads `payload.kind` on a BROADCAST, correlates by `re` or `payload.handoff_id`, lets a close win whatever the order, has no OPEN-before-CLAIMED guard, and grandfathers a legacy pickup as closed (`handoff-model.mjs:96-118`).
- A real partial close posts the remainder first, so the close can name it (`close-handoff.mjs:173-174`). The piece posts them the other way round (`:180`).
- Step 2 turns the rung-1 claim amber at 12 h (`:196`). That is a threshold flag, rung 2's job, and amber means warning in the look (`STIGMERGY.md:140`). Rung 1 only lets the age show.
- Step 2's clock never stops, even with the step hidden (`:200`).

**Broken at 760 px:** step 4's table forces the document to 1,034 px wide (`th,td{white-space:nowrap}`, `:51`, with no scrolling wrapper).

**Remake, exactly:**
1. Step 1: envelope-shaped lines (`type: BROADCAST`, `payload.kind`, `re`); post the remainder before the close; drop "as handoff-model.mjs folds it", or match it.
2. Step 2: keep the claim white, show its age only; stop the clock at a bound and when the step is hidden.
3. Step 3: state the equality as a derivation, in symbols and words (L = τ·ln(1/θ): "a scent reset at each beat and read against a threshold is a lease of that length"). Then make the test the case that can part: a toggle between scent reset at each beat and scent that adds up, counting disagreements after death. Carry an offer, `claim-change`, on `STIGMERGY.md:97`: "the same mechanism" holds when each beat resets the scent, not when it adds. Same offer, second clause: "the liveness heartbeat the palace already emits on every message" — what every message carries is a `health` block whose score is a green stub on Path-2 and hand-authored lines (§9, `SCHEMA — Reference.md:381`), and a catcher deep in a move posts nothing between claim and close.
4. Step 4: put `#tbl` in an `overflow-x:auto` wrapper, or let the headers wrap.

**Walk up?** Yes, four steps, one idea each, the run last. The fold buttons never wedge (ready, claim, partial, claim, close, ready all behave).

## The look

### find the ask (gathered proof, 2026-11-01) — keep

**Test or decorate?** It is the test: the colour sentence at `STIGMERGY.md:140` rests on it. Nine rounds, 24 lines each, exactly one target each (8 asks, 1 flag), checked against its data. Played through in Chromium: every round completes; the summary prints.

**Faithful?** It is a record, so it stays as played. Three things the caption should carry, since the proof itself shouldn't be edited:
- Its fixed shuffle deals two of the three reserved-colour rounds first (driven: RESERVED RESERVED RAINBOW …), while the game is still being learned. [[The Daily Page]]'s tuning item 83 records that the misses fell there and that "under two seconds" is one reserved round, at 1.7 s. The page's "That was one player and nine rounds" is honest; the caption should add "and the colour under test took the learning rounds".
- It plays once per browser. After nine rounds, a reload and DIAL IN go straight to the colour pick (the `go` handler skips when `trials.length >= 9`), so a returning reader can't replay.
- The result screen asks the player to "paste the block back into the chat"; on the face that addresses the morning's player, not the reader.

Also, lightly (tuning 12(b)): the sentence beside it already states the result before the reader plays. For a timed search that matters little.

**Walk up?** An intro, then the rounds. The confound above is the walk-up's flaw, and it belongs to the record.

## What I could not check

- The real TRICKSTER and QUEUE decks running; I read their code, not their screens.
- The pieces' Google fonts: I blocked them in my own runs, so VT323 headings were seen in fallback. Under the rich-face host the proof's own fonts are CORS-blocked (the known warning), so on the face it plays in fallback fonts.
- How the face's kit sizes each frame against the manifest heights, beyond conform's pass.
- Whether a reader holding a click on "one pass" in a real browser loses it as often as the 150 ms synthetic hold did.

## Second verdict

Same challenger, same day, on the remade pieces in the same worktree (the relay itself is now commit `21777f1b`; the pieces and manifest are still uncommitted). Remake is used up, so each piece is now keep or retire. I re-ran `conform.mjs "STIGMERGY"`: 6 pages, 0 errors, 7 warnings, the same known seven. Then I drove every step of the four remade pieces again at 760 px, swept every slider, and re-checked the two keep-slips.

**Final: 6 keep, 0 retire.**

### one line, two readers — keep (slips fixed)

LANES now says "a hero and avatar render". "edited, never committed" is an arc from OBSIDIAN to GIT, seen at 760 px. No console errors, no overflow.

### say done, or show done — keep

Rebuilt on what the terminal does, and the test can now fail both ways. Step 1 has STATE reading the files and QUEUE the board, and git closes nothing on its own. Step 2 behaves:
- a reply "done" leaves the card CLAIMED;
- `deadbee` is refused in the door's own words (`close-handoff.mjs:75`);
- `a1b2c3d` closes the card, and the verdict names what the door did not check.

Step 3 reads WORD against CLOSED against TRUTH:
- At 0/0, the verdict says nothing was faked.
- At 0.4/0, CLOSED matches TRUTH.
- At 0/0.4, CLOSED carries 9 fakes.
- A red mark in CLOSED opens the cited commit as a finding, not as a count.
- The rows wrap at 760 px, every one 726/726.

Two slips, both worth fixing before landing; neither changes the test:
- Step 1 says a card leaves "only by" three roads ("exactly three ways"), and the manifest caption repeats it. There is a fourth: a person's `RESOURCE_GRANT`/`RESOURCE_DENY` on the board also takes vector proposals, entry weave flags and to-dos off QUEUE (`queue-model.js:131`, `:182`, `:250`).
- Step 2 posts the close as a BROADCAST. The door posts it as a REPLY (`close-handoff.mjs:148`), and the fumble piece already does.

### the field — keep

The `ts` note now says the board is ordered by append, not by stamp. The `health` note names the model and the green stub. The last sentence now says what the pickup does and that a baton lease is unbuilt rung 2, matching `pickup-handoff.mjs:68-70`. The y-axis reads "ticks of duplicate work (mean of 200 runs)" and overlaps no other label. Run, reset and reseed recover cleanly.

One slip: the `ts` note's cause, "clocks differ", is a guess the board doesn't support. The 112 inversions run backwards a median of 15 minutes and up to about 9 days, which is not clock drift; only 8 involve a round, hand-written `:00Z` stamp. Say only that stamps are written by whoever posts and can run backwards, or drop the cause.

### one pass — keep

The defects from the first round are gone:
- While the threads run, a sitting now counts by the reader's clock: four clicks 400 ms apart read "4 threads, unblocked together".
- Held clicks lost: 0 of 8, against 4 of 7 before.
- The finish note appears once, and run is disabled until reset.
- The asks are labelled invented.

Step 2 now names the trade honestly. At 60 minutes a pass meets 3.2 decisions; picking takes 1.6 min, writing 12.8; the day reaches 31.5 forks, 21% fewer than when nothing waits long. "Parked costs nothing" and "the claim holds" are gone.

One slip: the cost sliders overlap (picking runs 0.25–3 min, writing 1–10). At pick 3, write 1, the verdict still says the pass is short "because the answers arrive already written", while its own numbers read 9.6 against 3.2 minutes. Make the verdict follow the numbers when picking costs as much as writing, or stop the ranges overlapping. Also, gently, per tuning 12(a): "that is the sentence's real claim" reads Loudon's sentence for him. "That is what the sentence turns on" claims less.

### the fumble and the scent — keep

The test can now part. With beats that reset, 0 of 6,624 slider settings disagree, and the verdict calls this the derivation, not an experiment. With beats that add, 4,286 of 6,624 disagree; at the defaults, 18 of 961 instants. The scent calls the claim dead at 23.70 h and the lease at 22.80 h, and the verdict says where "the same mechanism" holds and where it doesn't.

Fixed:
- Step 1's lines are in envelope shape (BROADCAST ready, REPLY claim and close, with `re`), the remainder is posted before the close as in `close-handoff.mjs:173-174`, and the fold says it is a simplified reading of `handoff-model.mjs`.
- Step 2 shows the claim white, never amber; its clock pauses while the step is hidden and stops at 72 h.
- Step 4's table sits in a scrolling wrapper, and the page holds at 760 px.

Two slips:
- In add mode with the catcher's death switched off, the verdict says the readings agree because "the build-up never crosses the threshold's margin … beat more often than τ". At H 2, τ 2, θ 0.25 that's wrong: they agree because nothing dies, and the same settings with the death on disagree at 18 instants. The note should say "let the catcher die" when the death is off.
- The reset/add switch is a native `<select>`, whose open list is drawn by the OS. The look says the board draws its own furniture (`STIGMERGY.md:143`). Two buttons in the board's style would keep to it.

### find the ask (gathered) — keep

Unchanged, as a record should be. The manifest caption now carries the shuffle confound, the 1.7 s single round, that it plays once per browser, and that its last screen speaks to the morning's player.

### Still open after this round

- The manifest's three offers are in, as open `claim-change`s: reconciliation is off; "the same mechanism" and the heartbeat, on `STIGMERGY.md:97`; and the double catch. But no section yet carries a `challenge` block with these verdicts, which Enrichment step 6 asks for.
- Not checked this round, as before: the real decks on screen, the fonts as the face serves them, and how the kit sizes each frame.
