---
title: "The Shop — sketch — test scroll brief"
born: 2026-11-15
links:
  - target: "[[The Shop]]"
    type: connects-to
    label: "sketch-for"
forward_vector: "I am the shared brief for the sessions giving every Specialist a scroll of test proofs on 2026-11-15; once their work lands and the method is written on the Maker, I go to the Archive."
---

# The shared brief — a scroll of test proofs for every Specialist

Read this whole before your own part. You are an elder for this work: read `ELDER.md` and `SCHEMA.md` first. Do not summon a Concierge; this brief stands in for it, and the session that sent you checks and lands your branch.

## Why

Loudon, 2026-11-14: "We are building a shop mechanism so that the shop GETS USED! Our goal should be the constant use and development of the shop, these are our tools and though it may be inefficient to use these tools initially, we design them to improve themselves, so with more use they will get very good."

Loudon, 2026-11-15: "Lets make a goal of each specialist having a scroll of test proofs and a method for testing and improving iteravely". And: "We have been depreciating OBSIDIAN, now we create proofs like you did here, as html files, often these are presented on a page's scroll so I can view them in STIGMERGY."

He no longer opens Obsidian. He looks and listens on a page's scroll in the STIGMERGY app. A thing he cannot reach there has not been shown to him.

## The method

1. **The test list is the card.** A Specialist's `**Not yet shown to hold:**` line on its page is its list of open tests. So is anything its ledger marks as unheard, unseen or owed.
2. **One test is one small proof.** A dated folder, `Shop/<Name>/proofs/<date>-<slug>/`, holding the made files, the script that made them, and what was measured. Plain ASCII filenames with no em-dash (an em-dash breaks a served URL for html).
3. **Each proof asks one question a script cannot answer**, in plain words, for Loudon's ear or eye. What a script can measure, measure, and say so.
4. **It goes on the Specialist's scroll.** If the Specialist has no scroll, make one: `node _ops/stigmergy/orchestrator/src/scroll.js --home "<Title>"` (read `The Scroll.md` first). Then add a hand section in the shape of the working example, `Shop/Stable Audio Open/Stable Audio Open — scroll.md`, the section with id `comparison-2026-11-14-substrate-sounds`: the `<!-- scroll:entry id="test-<date>-<slug>" -->` markers, a `### <date> — <headline>`, short prose, an `**Artifacts:**` list of markdown links by palace path, and a `<sub>` provenance line. The app plays wav, mp3, m4a, ogg and flac links in place, shows images, and frames an .html link. Say plainly "nobody has heard this" or "nobody has seen this".
5. **A run line goes on the tuning ledger**, and anything the test taught goes there as a line "owed a review". A Specialist's page changes only where this brief says a ruling covers it.
6. **Use the bench where it fits**: `node Shop/shop.mjs card "<Name>"`, `node Shop/shop.mjs menu`, and a `jobs.json` run with `node Shop/shop.mjs run`. Read `Shop/shop.mjs`'s header for the shapes. A second session is teaching the bench to write the scroll section itself; you write yours by hand in the shape above.

## Zoom out — this is part of every Specialist's test

Loudon: "the world is constantly improving, we should be doing searches for new updates and methods to consider as well. If a new method or update is out there, we should attempt to use it! This is how the shop can gain new tools."

For each Specialist, search the web for what has changed since its page was written: a new version, a new model, a better method, a rival tool. Where something new can be tried locally in a short time, try it as one of the test proofs, old against new. Record what you found on the ledger with the source and the date, tried or not.

## Nothing here may hold a better model back

Loudon: "how do we make sure these don't constrain new models as you gain skills I want to make sure using the pages don't hold back new model skills." And: "using this must not constrain what a future model does, we must keep open the ability to use new features!"

So, in everything you write: a card says what was seen to work, dated, never what must be done. House facts (a loudness target, a file format, the design system) are stated as the house's; technique is always the maker's to better. Where you write a page or a helper, say on it that a maker who can do better another way does so, and leaves the comparison on the scroll.

## How to work

- You may run several Opus subagents on one test and have another compare them, where that gets a better result. Loudon: "use opus liberally."
- A making that would take over twenty minutes, or needs an app only Loudon runs (Ableton Live, Max, VCV Rack, OBS), gets a scroll and a written test list, not a run. Do not launch or drive his apps.
- Money: nothing is spent unless your own part says so.
- Before anything visual, read the Drafting Table Design System's manifest.

## Git, and the close

- Work only in your own worktree. Commit only with `node _ops/stigmergy/app/scripts/palace-commit.mjs --kind <edit|ops|birth> --scope "<page>" --summary "…" --verify verified|unverified|couldnt [--body "…"] --author claude --path "<file>" [--path …]`. Never raw `git add`, `git commit` or `git merge`. Never push. Do not land your branch.
- Touch only the pages and folders your part names. `Shop/shop.mjs`, `Shop/Maker.md` and `The Shop.md` belong to other sessions unless your part names them.
- Before you end, run `node Shop/shop.mjs missing` and `node Shop/Maker/build-roster.mjs --check` and fix what you broke.
- End with a short report: your branch, what each Specialist's scroll now holds, each question waiting on Loudon, what you tried that failed, and what you did not verify. Honest and short. Say what you did, not how well.
