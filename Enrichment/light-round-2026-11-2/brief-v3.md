# Brief for one page — v3

*v3, 2026-11-17, after the second five (`pauses/pause-2.md`). What changed from v2, and why:*

- *The house rules for sound are on Sound from Code's page, not its card. v2 pointed at the wrong place.*
- *New: independence of evidence. One piece had two sources for a date and both were summaries of one reading; one had forty takes and ten seeds moved nothing.*
- *New: a translation is a summary. "Twelve" was the English; the Latin said eleven.*
- *New: one instance is weighed against its neighbours, and an exception is named where the eye lands. Counts on the face add to the whole.*
- *New: attribute evenly.*
- *New: name what the eye lands on first. In three pieces the loudest thing was not the claim.*
- *New: look for a lost thing in the project's own proofs before rebuilding it.*
- *New: what a face can play, and what a moving piece owes its reader.*
- *New: every number in the notes comes from a file in the folder; a credited number is also derived.*
- *New in part one: say when a piece would show a person's conduct or a project's unreleased work.*
- *Changed: "run the bench once" is dropped. A remake changes an output, and the bench leaves a line each time.*

*(v2's own changes from v1 are in `brief-v2.md`.)*

You have one page, and you know only that page: assume nothing about what any other maker has been given. There is no list behind it and no hurry. Loudon, who built this palace, said of this round: "take your time, don't try to go fast, go well", and "as if we were doing these one at a time".

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
3. Notice how understanding builds as the page goes, and where it does not: a gap a reader crosses alone, or two ideas the page holds and does not join. That is where a piece belongs. Ask: **what does this page describe and never show?** For a page about a process, that is usually one real instance of the process, not a count of the palace. If the page tells of something that happened, find out why it happened before you plan to draw that it happened. If you mean to draw one real instance, look at its neighbours in the same record first, so you know whether yours is typical or the exception.
4. Open the linked neighbours you might borrow an image or idea from, and find the sentence you would borrow. If it is not there, do not borrow it. When the page itself sends the reader somewhere, open that place first; it may already hold exactly what your anchor sentence asks for.
5. Run `node Shop/shop.mjs menu` from the palace root and read it. For any Specialist you might use, run `node Shop/shop.mjs card "<name>"`. Choose the tool for each part of the piece: what would have been recorded or photographed is generated; what is plainly synthesized, measured or a diagram is built in code; the two are edited together. Loudon's goal is that the Shop gets used, "even when it seems inefficient", because use is what improves it. Building in your own code is also the Shop: name `Sound from Code` or `Drawn SVG`.
6. Check `git log --oneline -5 -- "<your page's path>"` and its bundle folder, so you know if someone is working there now.

Then report, in plain prose and short:

- **What the page already shows.**
- **The place**: the section, and the anchor sentence quoted exactly.
- **The gap or the join**, in a sentence or two, as a first-time reader would feel it.
- **The claim** the piece will make, written before it is made. Say whether the claim is on the page or is yours.
- **The piece**: what a reader will see or hear, in two or three sentences.
- **What makes each part**: Specialists by name, in order. If you chose your own code for a part a Specialist could have made, say why.
- **What could go wrong**, and how you would know. Before you report a count or a date, search every spelling, with a pattern your tool supports (`[[:space:]]`, not `\s`, in git's extended regex), and make your second route one that would fail loudly: an empty result is a reason to check the search. Ask what makes your evidence independent: two sources that repeat one reading are one witness, and ten renders that differ only by a seed may be one render. When a date or a fact is the hinge of your "why", read a primary text whole, look for a primary source that disagrees, and if you read a translation, check the number in the original.
- **Whether anything heavy is needed** (ComfyUI, Lettering, a long render), since the Mac is shared.
- **Whether the piece would show a person's own conduct** (what someone did, read, or did not), **or a project's unreleased work.** Say so plainly; the session stops for Loudon on those before anything is made.
- Or: **nothing belongs here**, and why. That is an honest answer and is kept.

If the page has a fault (a stale number, a broken link, a sentence that contradicts another), report it. It is an offer for the page and is often worth more than the picture.

## Part two: make (only when woken for it)

1. Make a folder `Enrichment/light-round-2026-11-2/pieces/<your page>/`. In it: your script, a `jobs.json` with one job (copy the shape from the workshop's `jobs.json`: name, page, sentence, claim, chain, seed, run, outputs, inputs, heard_by), and any data your script reads.
2. Make the piece with a script that stays. One seed, written down. A count names its source and is pinned to the commit that source was built at (count a second way with `git show <commit>:<path>`), and the source data is copied into your folder. A sound carries a picture drawn from the same arrays the sound was made from. Before you rebuild something a project has lost, search the project's own proof images for it; a side-by-side made for another purpose may hold the original whole. If a source gives no year for an event, draw it without a position in time: any point on a line is a claim.
3. **Iterate with your own script, directly.** Run the bench when an output is final, and again when an output file changes. Every bench run leaves a line on a Specialist's ledger and a remake cannot avoid that; say in your report how many lines you left. From the palace root: `node Shop/shop.mjs run "Enrichment/light-round-2026-11-2/pieces/<your page>/jobs.json" <job> --by "<a short name for you>" --no-present`. Before that run, make sure: one command reproduces exactly the files to be placed; each output belongs to one job; the job lists its inputs so they are hashed. A project's own instrument goes in the chain as `hand: <its name>`, first, because the bench has no other place for it yet. If a job taught you something about a Specialist, add `--taught "<the lesson>"`, and check its numbers before you send it; you cannot take it back. If the bench fails, say exactly how; do not go around it silently. Afterwards `node Shop/shop.mjs check "<your folder>"` should read clean.
4. Look at the result at the size it will be shown: the band of a rich face is about 1000 px wide. Render a picture to PNG and read it. **Then look once more as a stranger who has only the page, and name the place that reader would stumble**: two things that look the same, a line that ends before its number, a word used two ways. Fix it or own it. **Name the first thing the eye lands on. It should be the claim**, not the largest number, the only red mark, or the biggest box. Aim for fifty words or fewer inside the picture. If one claim in it is given as its source's word ("the merge's message"), give the claims beside it the same care. If it shows one instance chosen on purpose, say that it is the exception where the eye lands, and make any counts on the face add up to the whole.
   - **If the piece moves:** an animated WebP loops by itself in a rich face; a video plays only on a click and does not loop. Count the frames where nothing shows, tell the reader in the caption when to look, do not retime or strengthen the motion unless the caption says so, and say what a phone-width reader will see.
5. For a sound, measure the saved m4a, not the wav or the array: length, sample peak, true peak, integrated loudness, and whatever your claim depends on, at two or three settings of the method. The house numbers are on `Shop/Sound from Code.md`, § House rules a maker meets here (the card does not print them): true peak at or under −1 dBTP, −16 LUFS for a finished mix, 48 kHz. Meet them, or say which you did not and why. If two parts are compared, give each part's loudness. Say what a listener might hear in place of your claim (quieter for longer, a machine for a drip). If a loudness step changes what you measured (a normaliser can run in a different mode than asked), measure the claim after it. If a model gives you its own word clock or takes a seed, check what a seed actually changes before you count seeds, and if people once heard a take, re-render that take and lay the clock on it.
6. Write `lines.md` in your folder: a **title**; a **caption** that states the claim, not a description of the picture; **what is real and what is a choice** (every choice a reader could take for a finding: the selection, the scale, the threshold, the mapping, the rule or model you simulated, where the frame ends, how a count moves with the method's settings, and every house rule not met); **leaking in**, if a neighbour did; the **anchor** phrase for placement (a phrase from the sentence, not a heading); **made with**, from your chain; and **not for the bundle**: the workshop data in your folder that must not travel. Every number in `lines.md` comes from a script or data file in your folder, and a number you credit to someone else you also derive yourself.
7. **Read your words as hard as your numbers** before you report. A noun the page has already defined keeps the page's meaning in your title and caption. Every "never", "no", "all", "same", "only" and "because" is tested or cut. When one side of a comparison is exact by construction, say so and credit what did it. A caption states a count, not an extreme that the method's window decides. Find the page's central claim your piece also shows, and caption that if it is on the page.
8. The piece does not call the person in the room "he" and does not name Loudon as the reader.

## When a challenger comes back

You get one remake. Read the challenger's report whole. Its numbers are checks on yours. Its explanations and its "better piece" are claims: **verify each your own way before you draw it or write it**, and say what held and what did not. Do not take the patch because it is quickest; ask which form helps a first-time reader most. Keep the first version's files and name the new outputs so both exist.

Report what you made, what you measured, what you did not verify, and the answer to one question: **what would you tell the next maker?**
