# Draft — the Board Record Schema's clock, on the Set's tempo map

*A workshop draft (2026-11-05), proposed for `BLUELINE — Board Record Schema`. It replaces the BIBLE's
`TEMPO` / `FPS` / `FRAMES_PER_BEAT` block and the determinism rule under it, and the `BEAT` and `FRAME`
comments in the BOARD extensions. The reader it describes is `tempo-map/tempo_map.py`.*

---

And to the `# === BIBLE ===`:

```
CLOCK: song.als              # the Set is the clock: its tempo lane, its meter lane, its locators.
                             # Never a number in the record. Tempo changes and meter changes included.
FPS: 24                      # any rate; nothing needs to divide evenly
```

> **The sync rule.** A board's place in the song is its `BAR` and `BEAT` on the Set's ruler. The Clock
> turns that into song beats through every meter change, into absolute seconds by summing the tempo
> segments before it (a ramp integrated exactly), and into a frame by rounding that time **once**:
> `FRAME = round(seconds × FPS)`. Frames are never added up beat by beat, so nothing drifts, at any tempo,
> through any change. Sync stays exact arithmetic and an offline deterministic render plus one start
> trigger — no elastic alignment. A beat need not fall on a whole frame; it falls on the nearest one,
> never more than half a frame (21 ms at 24 fps) from the music.

In the BOARD extensions:

```
BAR: 17                      # bar on the Set's ruler (meter changes counted, as Live counts them)
BEAT: 1.0                    # beat within the bar, in the bar's own unit (an eighth in 7/8)
FRAME: 2448                  # derived by the Clock: round(seconds × FPS), once; never hand-written
SECTION: verse               # the Set's locator this board sits under, filled by the Clock when blank
```
