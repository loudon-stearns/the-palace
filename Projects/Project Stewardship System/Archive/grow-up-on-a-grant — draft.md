# A steward grows up on a grant — draft

*Drafted 2026-10-13 by the elder session with Loudon, after the Quantum Synthesizer steward asked "revive to sprout?" twice, was granted twice, and could not land it: a steward is a child and may not touch the house, and no elder was coming. Loudon: "the steward should be an elder, I think." This is the proposed change, in three parts, for his yes. Nothing here is live.*

## The rule, in one paragraph

A steward is born a child and stays one: it makes in the workshop and proposes house changes on the board as a `FLAG` with `kind: house_change_proposal`, naming the file, the exact place, and the text. It grows up only on a grant. When a cycle fires and the board carries a `RESOURCE_GRANT` from Loudon against one of this steward's house-change proposals, that cycle is an **elder cycle**: the prompt adds [[ELDER]] on top of the SCHEMA it already carries, and the mandate names the grant. In that cycle the steward lands exactly what the grant names, commits it with the grant's id in the message, posts a `house_change_landed` reply, and makes nothing else in the house. A standing order cannot widen this; only a grant can. A grant is Loudon's yes in writing, so both halves of ELDER's rule hold: only an elder changes the house, and canon waits for his yes.

## Part 1 — the prompt (`_ops/orchestrator/prompts/shared.md`, after "The house and the workshop")

> **Growing up on a grant.** You do not edit the house — unless this cycle's mandate says you have grown up. That happens in exactly one case: Loudon granted a `house_change_proposal` you posted, and this cycle was fired to land it. Then [[ELDER]] is injected above, you are an elder for this cycle, and the mandate names the grant. Land *what the grant names and nothing else*: the file, the place, the text your proposal carried. Commit it yourself with `Palace-Kind: edit`, `Palace-Entry: <the entry>`, and the grant's message id in the body. Post one `REPLY` to your own proposal with `kind: house_change_landed` saying what changed, so your next cycle sees it done. If the grant chose an option other than landing, or the proposal no longer matches the entry (someone edited it since), do not land it — post a fresh proposal and say why. A standing order never makes you an elder; only a grant does. Stage moves are house changes like any other: never edit `stage:` without a grant that names the stage.

And in `_ops/orchestrator/prompts/steward.md` § "Read the pending requests before you act", one sentence:

> A grant on a `house_change_proposal` is not a question to re-ask next run; it is work for the elder cycle that fires on it. If you find yourself about to ask the same question a second time, post a `house_change_proposal` instead, or say plainly that the yes is on the board and the landing is what is missing.

## Part 2 — the code (`_ops/stigmergy/orchestrator/src/build-cycle-prompt.js`; edit only while the lane is idle)

- When slicing the board for this steward, find every `RESOURCE_GRANT` addressed to it whose `re` names a message of its own with `payload.kind === 'house_change_proposal'`, and that no later `REPLY` with `kind: house_change_landed` and the same `re` has closed.
- If any exist: inject `ELDER.md` (body only, after SCHEMA, under a heading "You have grown up for this cycle") and build the mandate: *"Loudon granted your proposal `<id>` (`<option>`): land it. Cite the grant in your commit. Make nothing else in the house this cycle."* Pass the proposal's artifact paths so the draft is in front of it.
- `process-cycle.js`: a cycle with an elder mandate is counted `shipped` when its `house_change_landed` reply validates and the named entry's commit exists (`git log -1 -- <entry>` newer than the fire). The lane's run controller needs no change.
- The lane's cycle commit already refuses files outside the bundle; the elder cycle commits the entry itself, so `cycle-commit.js` must allow the one path the grant names, and only that path.

## Part 3 — the standing order that caused the loop

Quantum's standing order (written 2026-09-23) says "end the run by asking whether to revive, never a stage edit." With Part 1 live it should read: *"Treat every run as a revival probe. When a run convinces you the page is alive, post a `house_change_proposal` for `stage: sprout` once; after Loudon grants it, the elder cycle lands it and the question is closed."* The orders zone is Loudon's; this line waits for his yes.

## What this does not do

It does not let a steward write canon on its own lean, add links, change a forward vector, or edit another page. Those stay proposals. It does not make the Concierge's "touch base before you write" check happen for stewards; the grant stands in for it, and the commit trailer makes the landing checkable after the fact. If that proves too thin, the alternative is to have the lane dispatch a separate elder (`palace-writer`) on a matched grant — cleaner separation, one more agent reading what the steward already holds.

## Today's worked case

Quantum Synthesizer: three revive grants and one APPLY, landed by hand on 2026-10-13 (`2782ff34`). With this change live, cycle 13's fire would have been the elder cycle, and the second ask would never have been posted.
