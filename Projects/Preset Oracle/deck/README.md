# Deck — the Preset Oracle's cards, drafted and waiting to be vetted

The original 140-card queue isn't in the palace or on this Mac. This folder holds its replacement, drafted from the thinkers and films the Preset Oracle page names, and the table where Loudon vets it.

- `Preset Oracle — deck draft.json` — the deck, once: 47 cards. Five each for Spinoza, Parmenides, Merleau-Ponty, Heidegger, Barthes and Deleuze; two each for The Matrix, Bill & Ted, The Big Lebowski, Fight Club, Inception, Memento, Arrival and Mulholland Drive; and the glassblower card from the proof. The seven seed cards from the journal are among them. Every card carries a back, `why`, for the teacher only: what it is built to make a maker meet.
- `Preset Oracle — vetting table.html` — the deck laid out as a wheel, one arc per thinker or film. Draw a card, turn it over to read its back, then keep, mend or strike it. Unvetted cards flicker; kept ones hold still in gold; mended ones carry a gold seam where they were repaired; struck ones go to ash and stay on the wheel. The hand-back at the foot is what Loudon pastes into a reply. The page keeps nothing once it is closed.
- `tools/build-deck.mjs` — pours the JSON into all three pages between `/*DECK*/` markers, and refuses a card missing a field. The vetting table gets every card, backs included. The journal and the encounter sheet get only cards marked `"dealt": true`, fronts only. Run it after any change to the deck. The seven seed cards are the ones dealt today, in the draft's wording.
- `tools/fold-verdicts.mjs` — takes the hand-back text Loudon pastes back, deals what he kept, takes in the words he mended and deals those cards, and moves what he struck to the deck's `struck` list with his reason. Then it rebuilds. `--dry-run` says what would change and writes nothing. It refuses, writing nothing, if the hand-back names a card this deck doesn't hold.
- `tools/test-fold.mjs` — runs the whole path on a throwaway copy of the bundle: it folds the hand-back the table's own click-through wrote (`tools/handback-sample.txt`), rebuilds, and deals through the copied journal in Chrome. 16/16 passed three runs in a row on 2026-11-04.
- `tools/click-through.mjs` — drives the table in headless Chrome with real clicks. 18/18 passed eight runs in a row on 2026-11-04.

## What happens next

When Loudon's verdicts come back, save the hand-back to a file and run `node tools/fold-verdicts.mjs <file>`. Only the cards he kept or mended reach a student. A partial hand-back is fine: the rest wait, and the deck stays `draft-1` until every card has a verdict, then becomes `vetted-1`.
