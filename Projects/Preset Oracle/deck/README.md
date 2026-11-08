# Deck — the Preset Oracle's cards

The deck is Loudon's own. His oracle page turned up on 2026-11-04 (kept unchanged at `../original/oracle.html`) with 122 cards, and the deck was restored from it, corrected where a card said something untrue, and grown.

- `Preset Oracle — deck.json` — the deck, once: 170 cards. 122 are `"pool": "original"`, Loudon's; 48 are `"pool": "new"`, written in the same shape on 2026-11-04. Every card has six parts, as the original did: `name`, `theme`, `quote`, `technical`, four `hints`, and `surprise` (shown as the Hidden Transmission). It also carries the original's drifting memory fragments.
- `tools/restore-deck.mjs` — rebuilds the deck from the original page, applies the factual corrections it lists (a moon that isn't in the resonance, a quote no one said, a formula that was wrong, a prime that wasn't), and appends `tools/new-cards.json`. The cards never announce a correction; the list in this script is the record. Rerun it after editing the new cards or a correction.
- `tools/new-cards.json` — the 48 new cards. Add more here, in the same six-part shape.
- `tools/build-deck.mjs` — pours the deck into every page that deals from it, between `/*DECK*/` markers: the oracle whole (`../oracle/Preset Oracle — the oracle.html`), and the encounter journal and sheet with the theme, the guidance and the transmission in their three slots. Run it after any change to the deck.

To change the deck: edit `tools/new-cards.json` (or a correction in `tools/restore-deck.mjs`), then `node tools/restore-deck.mjs && node tools/build-deck.mjs`, then `node ../oracle/tools/click-through.mjs`.

## Set aside

`Preset Oracle — deck draft.json` and `Preset Oracle — vetting table.html` are the 47-card draft written before the original was found, with `tools/fold-verdicts.mjs`, `tools/test-fold.mjs` and `tools/click-through.mjs`, which serve it. Nothing deals from them any more. They stay as raw material: a few of their cards were rewritten into the new pool (the conatus card, Parmenides in the warehouse, the glassblower).
