#!/bin/sh
# Card check, 2026-11-14: rewrite the Tear and Heal library Set against the main checkout's renders, then check it.
# Run from the palace's main checkout. Does not open Live. Took 0.35 s to write and 0.12 s to check; "nothing to look at".
W="Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs"; D="Shop/Ableton Session Writer/proofs/2026-11-14-card-check"
node "$W" library "$PWD/Projects/Generative Sample Libraries/tear-heal-instruments/instruments" --out "$D/Tear and Heal.als" --force
node "$W" check "$D/Tear and Heal.als"
