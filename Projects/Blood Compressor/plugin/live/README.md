# The ear check

The plan's next move is Loudon's ears and hands on Blood Compressor. This folder makes that one click.

**Open `Blood Compressor ear check.als` in Live 12 and press play.** The plugin must be installed and scanned (it is: `./plugin.sh install`, then Live → Settings → Plug-Ins → Rescan if Live was already open). One MIDI track: Live's Sampler plays the check's drum loop once a bar, and Blood Compressor sits after it. Nothing sounds until play; the device turns itself on one beat in. Nine sections, 68 bars at 100 bpm, about 2¾ minutes, each clip named for what to listen for:

1. **Bypass.** The beat as it arrives.
2. **Attack at its floor, 5 ms.** The front of each hit slips past the nerve, then the vessel clamps and the beat goes flat behind it.
3. **Attack 80 ms.** The body notices, then acts, and the kick's weight comes back.
4. **Release 40 ms.** The muscle lets go before the next hit, and the vessel pumps with the beat.
5. **Attack ridden 5 to 200 ms and back.** The punch opens and closes.
6. **A stressed body.** Sympathetic rises: the systolic line drops and the reflex quickens.
7. **Breathing.** Heart-rate variability on: the squeeze swells and ebbs across the bars.
8. **An old wall.** Vessel age rises: the ratio climbs and the knee loses its give.
9. **Your turn.** The lesson's settings; grab any knob and its lane lets go.

**Every section is equally loud** (−27.2 dBFS RMS on the preview), so the ear compares the shape of the beat, not its volume. Makeup is measured, not guessed: a render without makeup reads each section's loudness, and makeup brings it to the bypassed beat's. The loop is then turned down 11.5 dB so the loudest peak of the ride sits at −1.5 dBFS, under the Limiter's −1 on Main, which therefore never touches the punch. The threshold moves down with it (the lane reads −47.5, not −36), so the vessel squeezes exactly as it would at −36 dB on the loop at full level.

What the preview measured, through the plugin's own processBlock:

| section | makeup | peak | peak over loudness |
|---|---|---|---|
| bypass | 0 dB | −12.3 dBFS | 14.9 dB |
| attack 5 ms | 18.3 dB | −1.5 dBFS | 25.7 dB |
| attack 80 ms | 13.2 dB | −5.6 dBFS | 21.6 dB |
| release 40 ms | 7.9 dB | −4.5 dBFS | 22.7 dB |
| attack ridden | 14.2 dB | −4.2 dBFS | 23.0 dB |
| stressed body | 13.3 dB | −2.0 dBFS | 25.2 dB |
| breathing | 13.1 dB | −4.8 dBFS | 22.4 dB |
| old wall | 13.7 dB | −5.3 dBFS | 21.9 dB |

The fastest attack makes the beat *spikier*, not smoother: the 5 ms nerve lets every front through and flattens what follows. The October port measured the same thing on the sketch (14.7 dB in bypass to 26.3 at the fastest attack); this is the real plugin agreeing.

`ear-check-preview.wav` is the same ride, to hear before Live opens. Sections start at 0, 9.6, 28.8, 48.0, 67.2, 86.4, 105.6, 124.8 and 144.0 s.

The loop and the preview are WAVs, so they stay on this Mac and out of git; the Set finds the loop beside it. On another machine, remake all of it: `python3 live/ear-check.py`. The Set is written by the Shopkeeper's `live-set.mjs`, handed a copy of the parameter table with Bypass called linear 0–1 so it can be ridden. That writer makes instruments, so `drums-into-plugin.mjs` builds the Sampler with the writer's own library job and lifts it in front of the plugin. It renumbers the Sampler's ids from the Set's counter, sets the Sampler from Live's default −12 dB to 0 so the plugin hears the level the preview rendered, and turns each clip's held note into one note a bar.

Not yet done: the Set has been read back by the writer's check (384 ids, all unique; the loop on disk; the plugin installed), but nobody has opened it in Live.
