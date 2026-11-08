# Brief: challenge one Dissolutions learning sequence

You are the challenger in Enrichment's proposal round, adapted to the Dissolutions learning sequences. You did not make what you are judging. Write nothing, commit nothing, spawn nothing: read, run, judge, and return your section.

WT = /Users/loudonstearns/Documents/The Palace/.claude/worktrees/dissolutions-sequences-905758 — the worktree on branch `claude/dissolutions-sequences-905758`, which holds the sequences. OWNER = /Users/loudonstearns/Documents/The Palace — main. Read member entries from MAIN (`git -C "$OWNER" show "main:<Entry>.md"`), because the sequences will land on main and the member text there is the one they must be faithful to.

## What you're judging

On 2026-10-25 Loudon played Dissolutions proofs and sent all six back with one note: "these are the end of a proof, we need to work our way there with each of them." Each sequence in `WT/Dissolutions/proofs/2026-10-25-learning-sequences/<slug>.html` answers that. It's a few short interactive steps, each taking one concept alone, then combining them, and ending on the existing 2026-10-20 proof, which is a record and stays untouched. Background: `WT/Dissolutions/Dissolutions — baton.md` (the remainder, the proof-page faults already found) and `WT/Dissolutions.md`. Loudon has played only the table that travels: "sounds good, great progress, will need work, but not tonight".

## The three questions (Enrichment.md step 6, on main)

1. **Does it test the claim or decorate it?** The claim here is the proof's: the identity (or isomorphism) its hunt-ledger line names in `Dissolutions/Dissolutions — hunt.md`. Does the sequence set up the player to meet that test, with steps that could fail if the identity were false, or does it only illustrate?
2. **Is it faithful to the member's text?** Read the member entry on main whole. Does any step say something the member text doesn't, contradict it, or overclaim? Do the numbers it shows hold? Run `node check-sequences.mjs --only <slug>.html` in the sequences folder (it re-runs every number a step shows), and spot-check one or two claims by your own route in node.
3. **Does it walk up?** Read `Progressive Staging.md` on main. One concept a step, smallest first, the test last, each step with one thing to hear. Is any step two ideas at once, missing a rung, or out of order? Does the proof step honestly map each step to where it waits on the proof?

Also look: take screenshots (`node check-sequences.mjs --only <slug>.html --shots <SCRATCH>/challenge-<slug>`, SCRATCH = /private/tmp/claude-501/-Users-loudonstearns-Documents-The-Palace--claude-worktrees-dissolutions-sequences-905758/9d2f87ad-bfed-4a42-996e-66e103c84480/scratchpad) and Read them. Is a step's picture readable, and does it mean what its words say?

## Verdict

**keep**, **remake** or **retire**, each with its reason. Remake gets one round: name exactly what to change, the smallest set that answers your reason, so a maker can do it without guessing. Retire means it's dropped before landing; say why it can't be saved by one remake. Don't remake for taste. Don't ask for axis labels (that note of Loudon's is open and handled separately), for the Google Fonts or legend faults in the proofs (already recorded), or for anything in the 2026-10-20 proofs themselves. A sequence that's good enough for Loudon to review at his pace is a keep: these land as proposals he'll judge himself.

## Return, under 600 words

A section in this exact form, for the record `Dissolutions — sequences — challenge.md`:

    ### <slug>.html — <keep|remake|retire>

    **Does it test or decorate?** …
    **Is it faithful?** … (what you recomputed, and the result)
    **Does it walk up?** …
    **Why <verdict>.** … (for remake: the numbered changes)

Then, separately, one line: anything you could not check (nobody can listen headless; say what that leaves).
