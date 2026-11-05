# tempo-map — the Set's clock

BLUELINE places every panel by the Ableton Set's own clock. Until 2026-11-05 the board record assumed one
tempo (120 BPM, 12 frames a beat). This folder reads the whole clock from the Set instead: its tempo lane
(holds, jumps and ramps), its meter lane, and its locators as sections. Then it puts each cut on the
nearest frame of its absolute time, rounded once.

| file | what it does |
|---|---|
| `tempo_map.py` | the reader. `TempoMap.from_set(path)`, then `seconds_at`, `frame_at`, `beat_of(bar, beat)`, `bar_beat`, `section_at`, and `stamp_record` for a `board_template.txt`. Python standard library only. |
| `test_tempo_map.py` | 15 checks: the one-tempo case equals the 2026-10-29 cut's arithmetic, ramps and jumps equal brute-force integration, every meter round-trips, the demo Set round-trips, and the drift trap is shown. |
| `make_demo_set.py` → `demo-set.als` | a Set written from Live 12.4's own blank (the Shopkeeper's template): 4/4 at 120, a jump to 96 in 7/8, a ramp to 150 through 3/4, 4/4 at 150, five locators. No song. |
| `demo-boards.txt` | three boards with BAR and BEAT only; `--record` fills in FRAME and SECTION. |
| `make_proof.py` → `proofs/tempo-map.html` | the demo clock drawn, with clicks you can play, and the old record's bars beside it. |

```
python3 tempo_map.py <set.als> [--fps 24] [--cuts "5.4,13.1"] [--record board_template.txt]
python3 test_tempo_map.py
```

## How it reads the clock

- Absolute time is the sum over the tempo segments before the beat, not `beat × 60 / BPM`. A ramp is
  integrated exactly: `60/k · ln(bpm₁/bpm₀)`, where `k` is the change in BPM per beat.
- A frame is `round(seconds × fps)`, once, from absolute time. Never add frames per beat: at 127 BPM that
  rounds 11.34 frames a beat down to 11, and after 128 bars the cut is 173 frames (7 seconds) off.
- Bars follow the meter: a 7/8 bar is 3.5 quarter notes, and BEAT counts the meter's own unit, as
  Live's ruler does.

## Where Live keeps it

Read from Live 12.4's blank Set, and checked for shape (not content) against Live 11 Sets on this Mac:
the Main track (`MainTrack` in 12, `MasterTrack` in 11) holds `Tempo` and `TimeSignature`, each with an
`AutomationTarget Id`. An `AutomationEnvelope` whose `PointeeId` matches holds the lane: `FloatEvent`s in
BPM for tempo, `EnumEvent`s for meter, encoded `(numerator − 1) + 99 × log2(denominator)` (201 is 4/4).
Times are in quarter-note beats, and the first event sits at −63072000, before the song. Two tempo events
at one time are a jump. Locators sit in `Locators > Locators`; Live 11 puts a `NextLocatorMapping` after
the inner list.

## Not proven yet

- **That Live ramps tempo linearly in beats.** The reader assumes it. The check: open `demo-set.als` in
  Live, put a locator at bar 11 beat 2 and at bar 17, and read their times in seconds (or export the
  metronome and compare onsets). The reader says 20.5336 s and 29.1005 s.
- **That Live writes a meter change the way the reader decodes it.** The encoding is confirmed for 4/4
  only, from the blank. `demo-set.als` writes 7/8 and 3/4 the same way; if Live shows them, the encoding holds.
- Loudon's separate Set-parsing work, the baton's fourth item, has not been read. The reader was built
  from the palace's own Set tools, the Shopkeeper's `live-set.mjs` and the Forge's `forge-session.mjs`.
