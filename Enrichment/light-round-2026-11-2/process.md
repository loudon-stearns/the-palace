# The process of this round

Written by the working session (a child) on 2026-11-17, in the workshop the Concierge opened. It is this round's way of running [[Light Enrichment]], not a change to that page. What holds up is offered to that page at the end.

## Loudon's words it comes from, 2026-11-17

> lets do another run of light enrichments say 50

> take your time, don't try to go fast, go well

> use many sub agents and take your time

> as if we were doing these one at a time

> I have found may times that when you think in "batches" we aim for speed and bias toward efficiency

> make a process for all of these that is deliberate, and has the opportunity to improve between each few

## The shape

Fifty pieces, five at a time. Each page is handled as if it were the only one: its own agent, its own reading, its own folder, its own challenger. After every five there is a pause, and the pause changes the brief the next five are made from.

Five agents may work at the same hour. What they never share is a script, a brief written for ten, or a challenger.

## One page, start to finish

1. **Read.** One agent, one page. It reads the page whole as a first-time reader, takes stock of what the page already shows, opens the neighbours it might borrow from, and reads the Shop's menu. It brings back one line: the place, the anchor sentence, the claim, what the piece connects to on the page, and what will make each part, by name. "Nothing belongs here" is an honest answer and is kept.
2. **Loudon sees the line** before the piece is made. For the first five, the session stops here. After that it stops only when a line needs his decision; every line is on the round's page either way.
3. **Make.** The same agent, still holding its reading, makes the piece in `pieces/<Page>/` with a script that stays and a `jobs.json` of its own, run through the bench (`node Shop/shop.mjs run`), so the piece says what made it.
4. **Look.** The maker looks at the piece at the size it will be shown and measures any sound on the saved file. Then the working session looks at it too. A sound stays "unheard" until someone hears it.
5. **Challenge.** A separate agent, one per piece, given the page and the piece and nothing of the maker's reasoning. It reads the page whole, recomputes every number, asks whether the piece helps a first-time reader across a gap, whether it connects or only repeats, and whether a Specialist was passed over. Keep, remake or retire, with a reason, and any error found on the page.
6. **Remake once**, by the same maker. The same challenger gives a second verdict.
7. **Place.** The Concierge places it as a proposal, copying what made it from `provenance.json`, and commits by path.

## The pause after every five

Kept in `pauses/pause-N.md`. In order:

1. Each maker and each challenger has answered one question in its report: what would you tell the next maker?
2. The session lays the five pieces side by side with their verdicts and writes what went wrong and what went well, in plain words.
3. The brief changes. `brief-vN.md` becomes `brief-vN+1.md`, with a dated note at its head of what changed and why. If nothing needs changing, the note says so and says why.
4. A lesson about a tool goes to that Specialist's ledger as an owed line, through the bench. A lesson about the round stays in the pause file.
5. Where a maker doubted the Shop, one of the next five is made both ways and kept as a comparison (`Shop/Maker/comparisons/`). A few, when a real doubt exists; not one per pause by rule.
6. The round's single page (`all pieces.html`) grows by five.
7. The next five pages are chosen, with a line on why these five.

## What differs from the written process, on purpose

- One challenger per piece, where [[Light Enrichment]] step 7 says batches of about ten.
- A second verdict after a remake, which that page holds as an open question.
- The proposal list reaches Loudon five lines at a time, not fifty.

## Honest limits, at the start

- Makers cannot hear. Every sound is measured, and waits for an ear.
- Five makers at once share one Mac. Heavy tools (ComfyUI, Lettering, Manim at Piece) run one at a time; a maker that needs one says so in its line.
- The bench appends to a Specialist's ledger and scroll in this checkout. Whether five makers doing that at the same hour collide is not tested; makers run the bench with `--no-present`, and the session presents each pause's five together.
