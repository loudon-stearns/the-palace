# Encounters — how the Preset Oracle keeps what happens

The oracle is finished as an artifact. What it lacks is a record of the encounter: a person, a card, a synthesizer, and forty minutes. This folder is where those records go, one file per encounter.

## How an encounter is kept

For a whole class, start from `Preset Oracle — running a session.md`: print one `Preset Oracle — encounter sheet.html` per student, run the hour on paper, then type each kept sheet into the journal. For one maker at a time:

1. Open `Preset Oracle — encounter journal.html` in a browser.
2. Draw a card, or type in the card drawn from the oracle itself.
3. Start the clock. Make the preset. Press *I committed* when you stop adjusting.
4. Fill in what happened. Ask the maker whether it may be kept, and how.
5. Write the record, copy it, and save it here as
   `Preset Oracle — encounter — YYYY-MM-DD — <preset name>.md`.
   Put the recording beside it with the same stem (`.wav`); audio stays on the Mac, out of git.

## What a record holds, and why

The four hooks come from the glassblower proof, where they were first named:

| Field | What it catches |
|---|---|
| The instrument | what the maker reached for first, the habit the card had to get past |
| The moves | the decisions, in order: where the constraint bit |
| The recording | the phrase itself, the only part that isn't a description |
| Their reading | what the anchor meant to *them*, and how it became a sound |
| The surprise | where intent and result came apart: the place the learning happened |
| The miss | what was tried and thrown away; the good failures |
| Minutes to commit | whether the deliberate incompleteness held |

## Consent comes first

A record is written only after the maker answers *may this be kept?* The journal will not write one without an answer, and writes nothing for *don't keep this*. `quote-anonymous` and `keep-private` records name no one. Only `quote-named` and `quote-anonymous` records may be quoted on the page.

## What the archive is for

Once a few records exist, they are read together: which cards teach and which only puzzle, what kinds of surprise recur, whether the glassblower prompt teaches as well as *Parmenides Dying Alone in a Warehouse*. That reading, not any one record, is what grows the page.

## Tests

`tools/click-through.mjs` drives the journal in real headless Chrome with mouse clicks: draws (asking twice when the oracle refuses), deals all seven cards, takes a typed-in card, runs and commits the clock, refuses to write before consent, and checks the record for each consent choice. Run it with `node tools/click-through.mjs` after any change to the journal. 15/15 passed on 2026-11-03.

## Known gap

The original 140-card queue isn't in the palace or on this Mac. The journal and the sheet carry the same seven-card seed deck (kept in step by hand) built from the challenges the page names, and says so on its face. When the 140 turn up, they replace the seed deck.

## Records so far

- 2026-11-03 · *Parmenides Dying Alone in a Warehouse* · the steward's own encounter, an AI answering its own card in Python. A calibration of the form, not a student record: its surprise was measured, not heard. Its render script, both takes and the headless journal driver (`drive-journal.mjs`, which draws the card and writes the record through the journal's own code) are in `parmenides-steward/`.
