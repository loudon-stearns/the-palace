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
forward_vector: "I am the first draft of how the Shop gets used: a design for Loudon to cut, redirect or adopt. Nothing in me is decided. What he adopts moves to the pages it changes, and I go to the Archive."
---

# The Shop gets used — a design, first draft

A draft for Loudon, 2026-11-14. Nothing here is decided and nothing is built. It answers the walk ([[The Shop — sketch — discovery walk 2026-11-14]]) and holds the goal he set at pickup: the Shop is used constantly, as the easy default, and use is what improves it.

## The one idea

**Making passes through a page that remembers.**

The walk found the Shop missed four ways: silence, specs that route around it, tools used without their Specialist, and Specialists named and never run. It also found three places where the Shop works: the Hero and Avatar Maker's Regen button, BLUELINE's steward, Wavetable Scanner. In all three the Shop was in the path of the work, and in the first the tool wrote its own ledger line.

So the design does not add reminders. A reminder was tried on the Daily Page and its ledger records that it did not hold. The design puts one thing in the path of every making, and that thing does the remembering.

Three rules of construction, each taken from what already works here:

1. **In the path, not in a sentence.** The way to make a sound is a command that happens to be the Shop.
2. **The tool writes its own line.** No maker is asked to remember the ledger.
3. **Generated, never hand-kept.** The roster drifted when it was kept by hand. The menu, the routes and the host check are computed from the Specialists' own pages.

## 1. The bench — one command

A single script, `Shop/shop.mjs`, that every maker meets. It works from any worktree by resolving the main checkout's tools by path, which is how the board already works.

- **`shop menu [need]`** prints what the Shop can do here, now, by need and not by tool name: *a sound bed or texture → Stable Audio Open · about 3 s warm · available here · last ran today*. It joins three things that exist separately today: each Specialist's card, the host check, and the last run line.
- **`shop card "<Specialist>"`** prints one Specialist's card: what to call it for, what it has not yet been shown to hold, what it is not for, its one command, its speed, its live gotchas.
- **`shop run "<Specialist>" …`** runs the Specialist's command. Beside the output it writes a small provenance file: tool, version, prompt or script, seed, date, who. It appends the run line to the Specialist's ledger on the trunk. If the job just worked, the line says "nothing new" and that is all. `--taught "…"` adds a lesson as an owed item for an elder to place. It takes a jobs file, so a batch of thirty is still one uniform script.
- **`shop note "<Specialist>" "…"`** lets anyone, a steward included, leave a lesson on a Specialist's ledger as an owed line. Today a steward may not edit a Shop page, so what its making learns never reaches the tool.
- **`shop compare`** sets up a comparison: one brief, one seed, the Specialist on one side and the hand or a second Specialist on the other. The result is kept in `Shop/Maker/comparisons/`, which exists, with a line on both ledgers.
- **`shop check <paths>`** reads a folder or a commit and says, for each sound, image and video in it, what made it or that nothing says.

## 2. A card at the top of every Specialist

Stable Audio Open got three lines this morning: *Best used for, so far*, *Not yet shown to hold*, *Not my purpose*. Every Specialist gets the same block, plus **Run** (one command a maker can paste) and **Speed** (cold and warm). The bench reads the block by its labels.

This is a block in the body, not new frontmatter, so it needs no Schema Ceremony. If the block proves itself, `run:` as a real field is a later ceremony, with evidence.

Thirty-two cards is a fan-out: each drafted by its own woken page from its ledger, each read by an elder. Writing them will also surface which Specialists no longer run.

The Maker's Selection Heuristics are then generated from the cards. That closes the fourteen Specialists with no route and the six missing from the host file in one move, and "I need a music bed" gets an answer.

## 3. The hand joins the Shop

Loudon's thought, adopted: building by hand is a craft that can get better, so it gets a page and a ledger.

- **Sound from code.** numpy and scipy writing a wav. Its charter: measurements you listen to, where the sound must be exactly the numbers. It refuses mood and texture and routes them to Stable Audio Open. It carries the house loudness and sample-rate rules, which a maker going around the Maker never meets today.
- **Drawn SVG.** SVG written from a script. It carries the Drafting Table's tokens and what has been learned about legibility at size and in dark mode.
- **LaTeX comes alive.** It is a stub last run in June, and nine TikZ figures were made around it on 2026-11-09. The Technical Diagram Standard becomes its house recipe, linked both ways.
- **Raw Web Audio** folds into the Web Audio Worklet page, and the Maker's line calling it "not a Specialist" goes.

Their ledgers are seeded from lessons now scattered in other pages: the p5 alpha mistake, the pane audio bug, the Design System's ComfyUI recipes.

After this, nothing is made outside the Shop. "Use the Shop" stops meaning "don't write your own code" and means "make it somewhere that remembers."

## 4. Two doors, chosen by tier

The Shop has had one door, the Maker, built for a brief brought by Loudon. The misses were small makings in passing. The tier vocabulary already holds the answer:

- **A Sketch you run yourself**, at the bench.
- **A Study or a Piece goes to the Maker**, with intake, standards and a tradeoff talk.

The Maker stays the front door for work that deserves a foreman. The bench is the side door for everything else.

## 5. On the floor

Yes: the Shop belongs on the floor. Every agent that makes is born without it today, and the floor's one gate before making says "visual", so sound passes no gate.

- **One line in [[CHILD]], replacing the "before anything visual" sentence**, so the floor does not grow:
  > Before you make anything to be seen, heard or played, run `shop menu` and make it through a Specialist; your own script counts when it goes through the hand's page. The card names the design system to wear. If you expect the Shop to do worse, make both and keep the comparison.
- **A session-start hook that prints the short menu**, about a dozen lines by need. It is generated, so it is never stale, and it is a step Loudon can see. The palace has no hooks today; this would be the first.
- **The same menu injected into every steward and dispatched maker** by the orchestrator, beside "Default to making".
- **A trigger for Loudon**: "make [a thing]", "shop, …", "what can the shop do". Today no words call the Maker.
- **A Shop surface in STIGMERGY**: the roster by need, with warm and cold shown from the run lines.

## 6. Truth by script

- **The door reads provenance.** `palace-commit` already derives trailers from the diff. When a commit adds media, it reads the provenance files and writes `Palace-Made-With:`. Media with no provenance gets a printed warning, never a refusal.
- **Then git can answer the goal.** How much of this week's making went through the Shop, which Specialists ran, which have gone sixty days cold. No one reports it; it is counted.
- **The rich face shows it.** Each piece's manifest entry carries what made it, and the caption can say so: *Stable Audio Open · seed 7 · sets a mood, proves nothing.* That is the honest caption, written by the tool. Makers still cannot hear, and Loudon is still the audition.

## 7. How it meets what we already have

- **[[Enrichment]].** Step 3 already says "Make it with the Shop". It gains the bench as the way, `made with` in the manifest, and a fourth question for the challenger: was a Specialist passed over, and was a comparison worth making?
- **[[Light Enrichment]].** Step 4, "Make it with a script that stays", becomes "Make it through the Shop, with a script that stays". The script calls the bench or belongs to the hand's page. "A direction, not a step" becomes a step. Its real cost, that the Shop is slower than a script of one's own, is met by the jobs file and by warm tools, and where it still costs, by Loudon's rule that the Shop's improvement is equal to the work at hand.
- **[[The Daily Page]].** The prep may build by hand alone but "a Shop making waits for his yes". That makes the Shop the slow path by rule. Proposed: a local Sketch needs no yes; money and pods still wait for him.
- **[[Deposit Ceremony]].** "Seen, heard or played?" points at the bench for the figure.
- **The design systems.** The cascade is right and stays: the Maker's floor, then Drafting Table or Loudon Live, then the project. What is missing is the wiring the Loudon Live system has held "until first invocation". Each card says which dress its Specialist can wear today, `shop run --dress` passes the tokens, and each first run pays one row of that table, on the Specialist's page.
- **Stewards.** The menu in the prompt, `shop note` for write-back, and Shop pages in a manifest's neighborhood by medium, as BLUELINE has.
- **The [[Concierge]] and [[Search Before You Build]].** "I am about to make X" becomes a question the Concierge answers with the menu. The Shop becomes the third place the reflex looks.
- **The [[Shopkeeper]].** It tends supply today. It gains demand: each cycle reads the counts, gives a cold Specialist a real job or proposes its compost, and gives each stub its first brief.

## Comparison is how doubts are settled

When we expect the Shop to do worse, we make both and keep the result. The comparison updates the card: a win moves a line into *Best used for*, a loss into *Not yet shown to hold*, with the date. A Specialist's limits become known by trial, and the next maker reads them before choosing.

## What would be built, in order

Each stage ends in something usable, and the floor moves only after the menu can answer.

1. **Cards and the read-only bench.** `shop menu` and `shop card`, the Maker's routes generated, the host file completed.
2. **`shop run` for three Specialists** (Stable Audio Open, Matplotlib, Kokoro), with provenance and the automatic run line. Then the rest. The hand's pages are born.
3. **The floor**: the CHILD line, the hook, the triggers, the orchestrator's prompt. On Loudon's yes.
4. **The ceremonies**: Enrichment, Light Enrichment, the Daily Page, Deposit, the Technical Diagram Standard, each by its own route.
5. **The door and the counts**: provenance in the commit, the Shop surface in the app.
6. **The Shopkeeper's demand side.**

## Held, not settled

- **Floor length.** A fourth "before you make" clause says the Shop matters as much as prior art. The draft swaps a sentence instead of adding one. The hook adds a dozen lines to every session, including ones that make nothing.
- **Warnings can become noise.** The door warns and never refuses, because a rule on every job would fill the ledgers with garbage.
- **"Even when it seems inefficient"** will sometimes make a piece worse today. The caption and the audition keep that from reaching a reader unmarked.
- **One foreman.** The bench is a second door. The Shop's current bet is a single Maker.

## Not verified

- Whether a session-start hook's output reaches sessions in the desktop app and in dispatched agents. It needs a test before stage 3.
- Whether `palace-commit` can take the provenance trailer without disturbing the door. I have read its header, not its body.
- The walk's reports beyond the seven claims checked in the walk file.

## For Loudon to rule

1. May a steward leave an owed line on a Specialist's ledger with `shop note`?
2. Does a local Sketch on the Daily Page still wait for your yes?
3. The hook: on every session, or only the line in CHILD?
4. Names for the hand's pages. "Sound from code" and "Drawn SVG" are placeholders.
5. One page per material for the hand, as drafted, or one page for the hand.
