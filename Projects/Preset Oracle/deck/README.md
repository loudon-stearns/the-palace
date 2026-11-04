# Deck — the Preset Oracle's cards, drafted and waiting to be vetted

The original 140-card queue isn't in the palace or on this Mac. This folder holds its replacement, drafted from the thinkers and films the Preset Oracle page names, and the table where Loudon vets it.

- `Preset Oracle — deck draft.json` — the deck, once: 47 cards. Five each for Spinoza, Parmenides, Merleau-Ponty, Heidegger, Barthes and Deleuze; two each for The Matrix, Bill & Ted, The Big Lebowski, Fight Club, Inception, Memento, Arrival and Mulholland Drive; and the glassblower card from the proof. The seven seed cards from the journal are among them. Every card carries a back, `why`, for the teacher only: what it is built to make a maker meet.
- `Preset Oracle — vetting table.html` — the deck laid out as a wheel, one arc per thinker or film. Draw a card, turn it over to read its back, then keep, mend or strike it. Unvetted cards flicker; kept ones hold still in gold; mended ones carry a gold seam where they were repaired; struck ones go to ash and stay on the wheel. The hand-back at the foot is what Loudon pastes into a reply. The page keeps nothing once it is closed.
- `tools/build-deck.mjs` — pours the JSON into the pages between `/*DECK*/` markers, and refuses a card missing a field. Run it after any change to the deck.
- `tools/click-through.mjs` — drives the table in headless Chrome with real clicks. 18/18 passed eight runs in a row on 2026-11-04.

## What happens next

When Loudon's verdicts come back, a cycle folds them into the JSON (kept as is, mended words taken in, struck cards removed) and only then adds the journal and the encounter sheet to `build-deck.mjs`'s targets. Until then they keep their seven-card seed deck, so no unvetted card reaches a student.
