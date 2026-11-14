---
title: "The Shop — sketch — discovery design"
born: 2026-11-14
links:
  - target: "[[The Shop]]"
    type: connects-to
    label: "sketch-for"
  - target: "[[The Shop — baton]]"
    type: connects-to
    label: "design-for"
  - target: "[[The Shop — sketch — discovery walk 2026-11-14]]"
    type: connects-to
    label: "drawn-from"
forward_vector: "I am the working draft of how the Shop gets used: a design for Loudon to cut, redirect or adopt. Nothing in me is decided. What he adopts moves to the pages it changes, and I go to the Archive."
---

# The Shop gets used — a design, second draft

A draft for Loudon, 2026-11-14. Nothing here is decided and nothing is built. It answers the walk of eleven situations and the accounts of the two sessions that made the light round and the hook pilot, all in [[The Shop — sketch — discovery walk 2026-11-14]]. It holds the goal he set at pickup: the Shop is used constantly, as the easy default, and use is what improves it.

The second draft moved its weight. The first put the Shop in front of a maker at the start of a session. Both makers said the tool is not chosen there.

## The one idea

**Making passes through a page that remembers.**

A reminder was tried on the Daily Page and its ledger records that it did not hold. So the design adds no reminders. It puts the Shop at each place the tool actually gets fixed, and it makes the remembering automatic.

Three rules of construction, each taken from what already works here (the Hero and Avatar Maker's Regen button, BLUELINE's steward, Wavetable Scanner):

1. **In the path, not in a sentence.** "The brief's concrete paths beat the page's direction," said the light round's maker, whose makers read a page leaning toward the Shop and changed nothing.
2. **The tool writes its own line.** No maker is asked to remember the ledger.
3. **Generated, never hand-kept.** The menu, the routes and the host check are computed from the Specialists' own pages.

## Where the tool gets fixed

The two sessions named five moments. The tool was fixed at one of these every time, and never by a process page.

1. **The proposal.** The light round sent Loudon a list with a medium word per line: sound, diagram, count. One more word per line, the Specialist, and he would have seen "numpy" thirty times on the first day.
2. **The brief.** A planner who makes nothing writes "drawn by you in SVG" from habit, and the maker obeys the brief. The hook pilot's briefs are in no file at all; they were prompt text.
3. **The follow-up.** "Add a bed", one sentence to a resumed maker, fixed the sound for SUBSTRATE. It skips every ceremony.
4. **The workshop's first script.** "I opened one file and wrote numpy. After that the choice was made by import statements."
5. **The placing.** The elder who placed seventy pieces never asked what made one.

So the Shop goes to those five places:

- **A proposal line names its Specialist.** No code needed. It can start today.
- **A brief carries a tool line**: a Specialist by name, or "maker chooses at the bench". A follow-up that adds a material carries one too. Briefs are kept in the workshop, so the place the tool got fixed leaves a trace.
- **A workshop is born with the bench in it.** `shop workshop <folder>` writes a jobs-file skeleton and puts the menu in the README. The first file a maker opens is then the Shop's.
- **The placer copies "made with" from the provenance, or writes "nothing says".** It never guesses.

## 1. The bench — one command

A single script, `Shop/shop.mjs`. It works from any worktree by resolving the main checkout's tools by path.

- **`shop menu [need]`** prints what the Shop can do here, now, by need: *a sound bed or texture → Stable Audio Open · about 3 s warm · available here · last ran today*. The hook pilot's planner: "The cost that mattered to me was not speed but not knowing what was installed and working." It called *available here · last ran today* the one line that would have changed its briefs.
- **`shop card "<Specialist>"`** prints one Specialist's card.
- **`shop run <jobs file> [job]`** runs jobs. A job may be a function in the maker's own script, because a batch is one script with shared helpers, not thirty calls to one tool. Per job the file holds: the page and anchor sentence, the Specialist, the script and its git hash, one seed, kept inputs, the outputs as a group (a sound and the picture drawn from the same arrays are one act), the house rules and the values measured after saving, the claim, and who has heard or seen it.
  - **Provenance is a chain with a hash.** A generated bed that is then cut by hand and drawn is three links. Each output's hash is recorded, so a file later remade by the bare script shows up as changed.
  - **One run line for a batch**, with the per-job detail kept in the workshop. Thirty "nothing new" lines would end the bench's use within a day.
  - **A rerun of one job is as fast as the bare script**, or makers will iterate around it.
- **`shop scaffold "<Specialist>"`** is `run` for a thing with no output file. A playable piece starts from the house starter and is registered, with the recipe and version in its provenance.
- **`shop note "<Specialist>" "…"`** leaves a lesson on a Specialist's ledger as an owed line. A steward may use it. So may whoever carries Loudon's verdict from an audition.
- **`shop compare`** sets up a comparison: one brief, one seed, two routes. Kept in `Shop/Maker/comparisons/`.
- **`shop check <paths>`** says what made each sound, image and video in a folder or a commit, whether the file still matches its provenance, and who has heard it. For a rich face it runs with `conform.mjs` as one pass.

## 2. A card at the top of every Specialist

Stable Audio Open got three lines this morning: *Best used for, so far*, *Not yet shown to hold*, *Not my purpose*. Every Specialist gets the block, plus:

- **Run**: one command a maker can paste.
- **Speed**: cold and warm.
- **Checked by**: what can be measured about its output, and what only an ear or an eye can judge. The light round's maker: "Verifiability is the real reason I stayed with the hand, more than speed." A brief-writer needs it said as permission that a mood bed's check is Loudon's ear.
- **Wears**: which design system it can wear today.

A block in the body, read by its labels; no new frontmatter and no Schema Ceremony. The Maker's Selection Heuristics are generated from the cards, which closes the fourteen Specialists with no route and gives "I need a music bed" an answer.

## 3. The hand joins the Shop, and is counted apart

Loudon's thought, adopted: building by hand is a craft that gets better, so it gets pages and ledgers.

- **Sound from code.** Sounds that are plainly synthesized, and measurements you listen to. The split is Loudon's, from the first comparison (2026-11-14): "perhaps it is choosing to use stable to generate pieces that would be \"sampled\" and by hand for sounds that are clearly \"synthesized\"". So a room, a drip, rain, a bird go to Stable Audio Open as sources, and the hand cuts, places and mixes them; a tone, a pulse, a filter sweep, a clock stay with the hand. The first draft's split, mood against measurement, was mine and is replaced by his. It opens with what the light round learned the hard way: measure the file you saved, not the array you built; one seed per piece; two identical sources left and right are mono to the ear; a kept helper set, "so the fourth maker doesn't write a fourth kick drum".
- **Drawn SVG.** The Drafting Table's tokens as values, minimum text size at the width shown, escaping, which animation plays in the rich face.
- **LaTeX comes alive**, with the Technical Diagram Standard as its house recipe.
- **Raw Web Audio** folds into the Web Audio Worklet page.

One caution from the light round's maker, kept: renaming the hand "risks being true on paper". All seventy of its pieces would count as Shop work. So **the counts split hand from not-hand**, and the thing that moves work across is the comparison, not the name.

## 4. A playable piece is composed

A hook or a playable face has two layers. Its **materials** (a bed, a cue set, a panel image, an impulse response, sounds to feed an effect) are files, and they go through Specialists like any other. Its **instrument** is code that runs in the reader's browser; for that, a Specialist is "a starting point and a memory, not a renderer".

- **The rich-face kit becomes a Specialist.** The maker brief, `conform.mjs`, the shelf and the gotchas are where every face maker already starts. "Right now the kit is the real Specialist for playable faces and it is not in the Shop." Its page offers a starter that already passes conform, the gotchas that cost passes, and an offline render harness. Five makers each wrote their own `check.mjs` from nothing.
- **The kit learns the second file.** It asks for one self-contained HTML, so a maker synthesizes in the page to stay inside the rule. The README shows the path for a generated wav or png.
- **[[Playful Interface Design]] names a hook's materials by need**, each pointing at the menu. The dress has to hold across all of a piece's materials, so that coherence sits with the page that composes, and the card answers only "can this material wear it".

## 5. Two doors, chosen by tier

- **A Sketch you run yourself**, at the bench.
- **A Study or a Piece goes to the Maker**, with intake, standards and a tradeoff talk.

## 6. The audition closes the loop

Makers cannot hear or see. Loudon's verdict is the only real signal for mood, and today it has no way back to a tool. "Sixteen sounds made, none heard by anyone."

- **"Heard by" is as automatic as "made with."** Both sit in the manifest and both show in the caption: *Stable Audio Open · seed 7 · sets a mood, proves nothing · not yet heard*.
- **His verdict goes home to the card.** His sentence on SUBSTRATE's sounds, "we need to get better at making interface sounds and environmental sounds", belongs under *Not yet shown to hold* on the pages that made them.
- **Comparisons are planned, not free.** A few per round, chosen when the proposals are written, "since a maker who never tried it has no expectation either way". Every comparison is a pair only he can judge, and thirty makers comparing freely would bury him. They come to him as one sitting.
- **A comparison updates the card**: a win moves a line into *Best used for*, a loss into *Not yet shown to hold*, with the date.

## 7. On the floor

The Shop belongs on the floor, but the floor is not where the tool gets fixed, so it carries less than the first draft gave it.

- **One line in [[CHILD]], replacing the "before anything visual" sentence**, now covering the planner too:
  > Before you make anything to be seen, heard or played, or brief someone else to, run `shop menu`. Name the Specialist in the proposal and the brief. Your own script counts when it goes through the hand's page.
- **A session-start hook that prints the short menu** stays proposed, with a smaller claim: it tells a planner what is installed and working. It does not reach an agent spawned with the plain Agent tool or a resumed one; the brief's tool line does.
- **A trigger for Loudon**: "make [a thing]", "shop, …", "what can the shop do".
- **The menu on the table in a brainstorm with him**, before any brief exists. When he says "comic book frames", the Shop's ways of making frames are in the room.
- **A Shop surface in STIGMERGY**: the roster by need, warm and cold.

## 8. Truth by script

- **The door reads provenance.** When a commit adds media, `palace-commit` writes `Palace-Made-With:` from the provenance files. Media with none gets a warning, never a refusal.
- **Git can then answer the goal**: how much making went through the Shop this week, hand and not-hand apart, and which Specialists have gone cold.
- **A child's `shop run` writes a line on a trunk ledger.** That is a house write by a child's command. The Regen button already does it. It is said aloud as an exception, and tested against the isolation guard before anything depends on it.

## 9. How it meets what we already have

- **[[Enrichment]].** Step 3 already says "Make it with the Shop". It gains the bench as the way, the tool line in the maker brief, and a fourth question for the challenger: was a Specialist passed over?
- **[[Light Enrichment]].** The proposal list names a Specialist per line. Step 1's workshop is born with the bench. Step 4 becomes "Make it through the Shop, with a script that stays". Step 6 keeps its honesty and gains the "heard by" field.
- **[[The Daily Page]].** A local Sketch needs no yes; money and pods still wait for him.
- **[[Deposit Ceremony]].** "Seen, heard or played?" points at the bench for the figure.
- **The design systems.** The cascade stays. Each card says what it can wear, `--dress` passes the tokens, and each first run pays one row of the wiring the Loudon Live system has held "until first invocation".
- **Stewards.** The menu in the prompt, `shop note` for write-back, Shop pages in the manifest's neighborhood.
- **The [[Concierge]] and [[Search Before You Build]].** "I am about to make X" is answered with the menu.
- **The [[Shopkeeper]].** It gains the demand side: a cold Specialist gets a real job or a compost proposal.

## What would be built, in order

0. **Today, with no code.** A Specialist word on every proposal line. A tool line in every brief. And three comparisons whose hand version already exists: SUBSTRATE's bed and cues, the Pauline Oliveros room, Rick Rubin's voice against [[Kokoro]].
1. **Cards and the read-only bench.** `shop menu` and `shop card`, the Maker's routes generated, the host file completed.
2. **`shop workshop` and `shop run`** for three Specialists (Stable Audio Open, Sound from code, Kokoro), with chained provenance and the batch run line. Then the rest. The kit joins as a Specialist.
3. **The audition loop**: "heard by", the caption, the path from his verdict to a card.
4. **The ceremonies**, each by its own route. **The floor**, on Loudon's yes.
5. **The door and the counts.** The Shop surface in the app.
6. **The Shopkeeper's demand side.**

## Held, not settled

- **Loudon's ear is the bottleneck.** More generated material means more waiting on him. The design limits comparisons and gathers them; it does not make him faster.
- **Floor length.** The draft swaps a sentence instead of adding one. The hook adds a dozen lines to sessions that make nothing.
- **"Even when it seems inefficient"** will sometimes make a piece worse today. The caption and the audition keep that from reaching a reader unmarked.
- **One foreman.** The bench is a second door. The Shop's current bet is a single Maker.

## Not verified

- Whether a session-start hook's output reaches sessions in the desktop app.
- Whether a worktree agent can append to a trunk ledger past the isolation guard.
- Whether warm Stable Audio is fast enough inside a thirty-piece loop.
- Whether `palace-commit` can take the provenance trailer cleanly. I have read its header, not its body.
- The two sessions' accounts of their own transcripts, and the walk's reports beyond the seven claims checked.

## The first comparison, heard

The Pauline Oliveros room, by hand and through Stable Audio Open (`Shop/Maker/comparisons/2026-11-14-oliveros-room/`). Loudon heard both. The hand's "sounds like \"musique contrete\" a collection of precise crafted sounds assembled together"; the Stable Audio side, "while not as good by my ear, rings \"truer\" to me and doesn't feel artificially collected". Neither won. What came of it is the sampled-or-synthesized split in § 3, and a method: generate the pieces, edit them together by hand. It also showed the loop working once end to end: a pair made in minutes, a verdict in his words, and a line owed on the Specialist's ledger.

## The method the comparison turned up — choose, collect, edit

Loudon, 2026-11-14, while the third room was being made: "The same kind of process will be done with visuals, and this indicates how we should be approaching using tools, choose each tool for what it does best, then collect and edit together. We were doing very similar processes in blueline. Same kind of decision-tree."

So a made thing is usually several Specialists and an editor, and the question at the bench is asked per part, not per piece: what is this part, and which tool is best at that?

- **Sound:** what would have been sampled is generated (Stable Audio Open, one thing at a time); what is plainly synthesized is built by hand; a voice is [[Kokoro]]; the hand cuts, places and mixes.
- **Visuals, by the same tree, as a guess to be tried:** what would have been photographed or painted is generated ([[FLUX (Hugging Face)]], [[ComfyUI]]); what is a diagram, a count or a curve is drawn ([[Matplotlib]], LaTeX, drawn SVG); what moves by a rule is animated ([[Manim CE]], [[p5.js]]); the hand composes.
- **BLUELINE already works this way.** Its pipeline is a table of stages, each with one tool, and it names the joins: "the two seams" ([[BLUELINE — Production Pipeline]]). Its archived design page says "the seams ARE the contract". A seam is where one Specialist's output becomes the next one's input, and that is where a chain of provenance has its links.

What this changes here: the menu answers by part; a job in a jobs file is a chain by default; and each Specialist's card says what it hands on well and what it needs handed to it. The decision tree itself wants writing down once, on the Maker, from BLUELINE's table and these comparisons.

## Loudon's rulings, 2026-11-14

1. **A steward, or a child's `shop run`, may write an owed line on a Specialist's ledger.** "Yes, but flagged and reviewed later when we decide to update the specialist based on the ledger." So the line is marked as unreviewed, and the Specialist's page changes only at a review.
2. **A Sketch on the Daily Page does not wait.** "Sketches can use anything, just go."
3. **Comparisons per round:** "a few if needed".
4. **Stage 0 starts now.**

## Still open

- The hook on every session, or only the line in CHILD. He asked for the tradeoffs.
- Names for the hand's pages, and one page per material or one for the hand. He asked for more context.
