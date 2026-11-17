# Brief for one page — v1

*v1, 2026-11-17. The first brief of the round. Nothing has changed yet because nothing has been made.*

You have one page. There is no list behind it and no hurry. Loudon, who built this palace, said of this round: "take your time, don't try to go fast, go well", and "as if we were doing these one at a time".

Palace root: `/Users/loudonstearns/Documents/The Palace`. This round's workshop: `Enrichment/light-round-2026-11-2/`.

## What you are

A child here. You may read anything. You may write only inside `Enrichment/light-round-2026-11-2/pieces/<your page>/`. You do not edit any entry, bundle, manifest, ledger or scroll by hand, and you do not run `git add`, `commit`, `checkout`, `stash` or `reset`. An elder places what you make.

## What a light enrichment is

One small thing set beside one sentence of a page, in its rich face: a picture, a diagram, a short loop, a drawing from the palace's own records, a short sound. It makes that sentence clearer or more felt, and asks nothing of the reader: nothing to operate, nothing to learn first.

Read `Light Enrichment.md` at the palace root, whole, before anything else. It is the method. Its section "What goes wrong, and the guard for each" is the list of mistakes the first round made.

## Part one: read, and bring back one line

Do this part and then stop. You will be woken again to make.

1. Read your page whole, as someone meeting it for the first time. Read its Context file and scroll if it has them. Look at its hero image.
2. Take stock of what the page already shows a reader: figures, tables, diagrams, its hero. Write that down.
3. Notice how understanding builds as the page goes, and where it does not: a gap a reader crosses alone, or two ideas the page holds and does not join. That is where a piece belongs.
4. Open the linked neighbours you might borrow an image or idea from, and find the sentence you would borrow. If it is not there, do not borrow it.
5. Run `node Shop/shop.mjs menu` from the palace root and read it. For any Specialist you might use, run `node Shop/shop.mjs card "<name>"`. Choose the tool for each part of the piece: what would have been recorded or photographed is generated; what is plainly synthesized, measured or a diagram is built in code; the two are edited together. Loudon's goal is that the Shop gets used, "even when it seems inefficient", because use is what improves it. Building in your own code is also the Shop: name `Sound from Code` or `Drawn SVG`.
6. Check `git log --oneline -5 -- "<your page's path>"` and its bundle folder, so you know if someone is working there now.

Then report, in plain prose and short:

- **What the page already shows.**
- **The place**: the section, and the anchor sentence quoted exactly.
- **The gap or the join**, in a sentence or two, as a first-time reader would feel it.
- **The claim** the piece will make, written before it is made. Say whether the claim is on the page or is yours.
- **The piece**: what a reader will see or hear, in two or three sentences.
- **What makes each part**: Specialists by name, in order. If you chose your own code for a part a Specialist could have made, say why.
- **What could go wrong**, and how you would know.
- **Whether anything heavy is needed** (ComfyUI, Lettering, a long render), since the Mac is shared.
- Or: **nothing belongs here**, and why. That is an honest answer and is kept.

If the page has a fault (a stale number, a broken link, a sentence that contradicts another), report it. It is an offer for the page and is often worth more than the picture.

## Part two: make (only when woken for it)

1. Make a folder `Enrichment/light-round-2026-11-2/pieces/<your page>/`. In it: your script, a `jobs.json` with one job (copy the shape from the workshop's `jobs.json`: name, page, sentence, claim, chain, seed, run, outputs, inputs, heard_by), and any data your script reads.
2. Make the piece with a script that stays. One seed, written down. A count names its source file and the date. A sound carries a picture drawn from the same arrays the sound was made from.
3. Run it through the bench from the palace root: `node Shop/shop.mjs run "Enrichment/light-round-2026-11-2/pieces/<your page>/jobs.json" <job> --by "<a short name for you>" --no-present`. If a job taught you something about a Specialist, add `--taught "<the lesson>"`. If the bench fails, say exactly how; do not go around it silently.
4. Look at the result at the size it will be shown: the band of a rich face is about 1000 px wide. Render a picture to PNG and read it. Measure a sound on the saved file: length, peak, loudness, and whatever your claim depends on.
5. Write `lines.md` in your folder: a **title**; a **caption** that states the claim, not a description of the picture; **what is real and what is a choice** (every choice a reader could take for a finding: the selection, the scale, the threshold, the mapping); **leaking in**, if a neighbour did; the **anchor** phrase for placement (a phrase from the sentence, not a heading); and **made with**, from your chain.
6. The piece does not call the person in the room "he" and does not name Loudon as the reader.

Report what you made, what you measured, what you did not verify, and the answer to one question: **what would you tell the next maker?**
