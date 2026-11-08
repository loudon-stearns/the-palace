---
title: "Radio Play — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Radio Play]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Radio Play's first rich face: a verdict and a reason for every piece, the maker's numbers measured again by other means, and the one place where the face misreports the Shop's own mix, so the remake has something exact to fix."
---

# Radio Play — rich — challenge

Challenger: claude-opus-5-5, proposal round 2026-11, on the maker's commit 64fdb5bd in the `enrich/radio-play` worktree. I did not make this face.

**Verdicts: 4 keep, 1 remake, 0 retire.**

## The pieces

### Radio Play (opening) · `rich-face/The Unsung Path — audio.m4a` · gathered · **keep**

- *Test or decorate?* A test the reader runs: the page says the voices, pacing, music and effects "carry the full meaning through sound alone". The soundtrack with no picture is the direct way to find out, and it can fail. If the play didn't make sense unseen, you'd hear that.
- *Faithful?* Yes. Its audio packets match the film's own audio track (both stream-copy MD5 `e506093b…`). The caption's −15.9 LUFS measures −15.92 (my BS.1770) and −15.9 (ffmpeg ebur128). The stings and foley are what `build_audio.py` lays: sting_title, swell_close, boot_beeps, whoosh, ding, click_beep. The caption says "Stable Audio 3" where the page says [[Stable Audio Open]]. That isn't a contradiction: the specialist page keeps the old name on purpose (`Shop/Stable Audio Open.md:40`).
- *Walks up?* It's a single gathered recording, which is the right way to open the face.

### The craft to master · `Radio Play — rich — timing is the performance.html` · made · **keep, with notes**

- *Test or decorate?* A test. The walk ends on two renders of one exchange, A and B in random order, that differ only in the silence before "Don't sound so shocked." One render rushes that silence and the other holds it. The piece calls the result a preference ("whether the held beat is the funnier one is yours to say"), and it gives no verdict. It offers "I can't tell them apart", which is how the page's claim would fail for this listener. Because it claims no discrimination, it owes no chance rate or rule up front, and it states none. That's honest.
- *Faithful?* Mostly. Notes below.
- *Walks up?* Yes, in five steps: the cast, one voice alone; one beat; the exchange's three silences; the laugh slid from under the line to on the joke; then the test. Each step plays on its own. The test comes last.

What I checked on the blind pair:
- **Sample identity.** I pulled both renders from the live piece and diffed them. Before the rushed punchline's file starts (13.645 s), the two are identical: largest difference 0. After the rushed skeptic take ends (14.500 s), they're identical when shifted by 55,441 samples (1.155 s): largest difference 0 over 276,959 samples. The rushed render overlaps the takes' own quiet inside that 0.855 s window, so the two differ there by more than the gap alone. In the rushed render the punchline take's pre-roll sits under the skeptic's last word at −73 dBFS peak (−92 RMS). The skeptic take's tail sits under "Don't" at −63 dBFS peak (−81 RMS). The speech there runs at about −21 dBFS RMS. So the renders differ only in the silence, to within about 60 dB. The maker's own check splits each render into parts before comparing, so it can't see this overlap. It doesn't matter to the ear.
- **Can anything but the ear decode the order?** Not from the page. Before a pick, the step-5 DOM shows no lengths, no canvas and no word "held". The order comes from `Math.random()` on each load. File names are the same takes for both, and the frame doesn't reveal the play length. Only `window.__rp.S.pair.heldIs` in devtools gives it away. **But the ear decodes it at once.** The gap differs by 1.155 s, so you hear which render rushes. The step's prompt also says the held one "is what the Shop's cut gives". The blinding hides the letters, not the identity, and naming the Shop's cut beforehand invites deference to it. *Note:* move "which is what the Shop's cut gives" from the prompt to the reveal.
- **The reveal text is fixed.** It always says the engine "found no difference at all", whatever `check.maxHead`/`maxTail` hold. Both hold 0 today, and `checks.mjs` keeps them at 0, so the text is true now. *Note:* print it from the check values.

What I checked on the laugh, step 4:
- The 7.15 dB figure reproduces as defined in `checks.py`: RMS over the whole punchline take, against the laugh's first 2.125 s with the laugh file aligned to the take's start. I got −7.12 (polyphase resampling where the maker used linear interpolation). **But the piece never shows that number.** Step 4's readout measures only the spoken part and gives −6.3 to −6.9 dB at full cover (slider −1.8 s: −6.3; −1.59 s: −6.7; −1.0 s: −6.9). The caption's "7.2 dB below" is a number the reader won't find in the piece. *Note:* say "about 6 to 7 dB", or make the caption read from step 4.
- **The laugh is folded to mono, quieter than the Shop mixed it.** The maker converted `laugh.wav` (and `bed_low.wav`) from stereo float to mono 16-bit by averaging the channels. My check: max |mono mean − copy| is 1.5e-5, so the conversion is faithful. The Shop's own `ffmpeg` chain keeps the laugh stereo and spreads the mono voice at −3 dB per side. Measured the Shop's way, with power summed over channels, the line sits **10.5 dB** under the laugh (whole take), **10.1 dB** on the spoken part and **11.2 dB** K-weighted. The piece's ~7 dB understates it by about 3.4 dB. The step's claim gets stronger, not weaker: under it, the line is buried. The A/B is untouched, because both renders carry the same laugh. Step 5's "the laugh as the Shop cut them" holds for the timing and is about 3.4 dB low on level. This has the same cause as the remake below. If the maker replaces the stems with stereo copies there, this piece's `parseWav` averages channels and has to change with them.

### Audio-first production · `Radio Play — rich — audio first, picture last.html` · made · **remake**

- *Test or decorate?* A test, and a good one. It rebuilds segment two in the page's order (voices, then score and foley, then balance, then picture) and checks the page's "the picture fills and syncs to the spine" against the film. It found something the text doesn't say: the scene lengths are synced to the audio, but the beats inside a scene are stretched to fit, not synced line by line. It also caught the picture contradicting the sound: the wikilink is shown as "…I link to you. [[in my prose]]." (`scenes.py:107`) while it says "I mention you" (`script.json`).
- *Faithful?* **No, on one number, and it's the number the piece and an offer both hand to the page.** Step 3 says "the Shop's bed sits 9.7 LU under the voices" and puts the fader at "the Shop's" level. That 9.7 is the gap in the piece's mono fold-down, not in the Shop's mix. I re-ran `build_audio.py`'s own filter chain for segment two, stopping before loudnorm: `aresample=48000,aformat=channel_layouts=stereo,adelay,volume`, `amix normalize=0`, with voices only and bed only, over 0.6–31.225 s. ffmpeg ebur128 reads voice −26.2 LUFS, bed −31.9 LUFS: **5.7 LU**. The voice is mono, upmixed at −3 dB per side, so its stereo loudness equals its mono loudness (−26.16 mono, −26.2 stereo). The bed is natively stereo, with an L/R correlation of 0.55, so folding it to mono drops it about 4.1 dB. My own BS.1770 on the mono fold-down from the original float bed gives 9.83 LU, which matches the maker's method, but the method doesn't describe the Shop's mix. At the fader's 0 dB, the piece plays the bed about 4 dB under the Shop's balance, so "hear where under stops being under" starts from the wrong place.
- *Walks up?* Yes, in four steps, each playable, each with a way back. The picture comes last.

**The remake, exactly:**
1. Keep `bed_low.wav` and `laugh.wav` stereo in `rich-face/unsung-path-stems/` (16-bit 44.1 kHz stereo adds about 3 MB). Render the rebuild in stereo the way ffmpeg did: mono takes at 0.7071 per side, bed and laugh as they are. If the maker keeps mono instead, the piece and caption must say it's a mono fold-down that sets the bed about 4 dB lower than the Shop's mix, and the fader's 0 dB can't be called "the Shop's".
2. Measure the gap in `checks.py` through the Shop's own chain (the `aformat=channel_layouts=stereo` path above), not on a mono rebuild. Expect about 5.7 LU, and print that.
3. Change the caption's "9.7 LU under the voices" and offer 2's "about 10 LU" to the measured figure.
4. Apply the same change to the timing piece's laugh (above) and its caption's 7.2 dB, since both pieces read the same stems.

**Minor notes, not remake reasons.** First, by packet timestamps the cuts land +21, −4, −4 and −4 ms from the audio joins. The video stream starts at 0.021 s, and the audio at 0. So "within 17 ms" is "within 21 ms" — still under a frame. Second, the picture-beat times depend on the detector; see offer 3.

### Enrichments · `rich-face/The Unsung Path.mp4` · gathered · **keep**

- *Test or decorate?* It's the artifact the page names ("First instance: the *Unsung Path* explainer"). The audio-first piece is what tests it, and this film is what the reader checks that test against.
- *Faithful?* Yes. It's byte-identical to `_ops/scratch/weave-video/The Unsung Path.mp4` (`cmp`). Five Manim scenes: 388 + 1071 + 1086 + 1308 + 711 = 4564 frames at 30 fps. The caption's "152.2 s of picture" rounds the stream duration (152.175 s). By frame count it's 152.13 s against 152.2 s of sound. Fine at the caption's precision.

### Enrichments · `radio-play-deck.html` · gathered · **keep**

- Already tracked in the bundle and kept as it was made in May. The page lists it under "The first deck". Its AudioContext is created in `initAudio()`, called only from the Begin button (`radio-play-deck.html:135`, `:561`, `:569`). It sizes itself from the viewport, so the manifest's `fill 16/9` contract is right. Conform finds nothing on it. It decorates rather than tests, which is what a gathered artifact is for.

## Checks run

- **`checks.py`** (maker's): ran clean and reproduced `checks.json` and the MEASURED block byte for byte (no diff after the run).
- **`checks.mjs`** (maker's): 16 of 16 pass.
- **`conform.mjs "Radio Play"`**: 0 errors, 18 warnings, all on the two made pieces: 16 sandbox-blocked (conform's opaque-origin frame refusing the declared stem fetches) and 2 play-silent (they follow from the blocked load). The 4 file-local warnings in the maker's count cleared once the files were committed. On the rich server (`--root` the worktree), every stem loads **200 on the piece origin** (8853). A real click on each piece's play button brings a `rich:play` from 8853 to the face, the AudioContext is `running` and a buffer source starts. In step 4 the film loads (readyState 4, 152.196 s) and plays. **So the 18 are keep-with-note**, as on Phoneme Choir's face.
- **Console:** clean on the face and in both pieces.
- **One voice:** starting the timing piece paused the film playing in the other piece.
- **Hidden hush:** I played the hide signal top-down in every frame, as `check-hidden-hush.mjs` does. Both pieces' AudioContexts went from `running` to `suspended`.
- **`fingerprint.mjs "Radio Play"`**: all four sections in step.
- **`untracked.mjs "Radio Play"`**: every file it names is tracked.
- **Tuning run line:** `- run · 2026-11-03 · v2.7 with the proposal-round settings · Radio Play · nothing new` (`Enrichment/Enrichment — tuning.md:61`). It ends as the ledger's line format asks, `· nothing new`. The version field carries extra words where the format has `v<version>`; so do the round's three sibling lines.

## Provenance of every stem

- **Ten Kokoro takes** (`s1_title__00/01`, `s2_problem__00–03`, `s4_demo__02–05`): generated in the palace on 2026-06-19 by `_ops/scratch/weave-video/kokoro_vo.py`, voices from `script.json` (af_heart, am_michael, af_bella, af_nicole), 24 kHz mono. All ten are byte-identical to `audio/raw/` (`cmp`). Kokoro is Apache-2.0 (`Shop/Kokoro.md:11`).
- **`bed_low.wav`**: generated in the palace on 2026-06-19 by Stable Audio 3 `small-music` (`sa3_assets.py:34`, `sa3.log`, `sfx/report.json`), prompt "low pulsing electronic underscore… no melody, no drums, loopable texture", 30 s stereo. Copied to mono 16-bit.
- **`laugh.wav`**: generated in the palace on 2026-06-19 by Stable Audio 3 `small-sfx` (`sa3_assets.py:52`, same log and report), prompt "warm studio audience laughter… sitcom laugh track", 4 s stereo. Copied to mono 16-bit.
- **Not a licensed sample.** No Splice, nothing recorded from outside. The model's own terms apply to the two SA3 renders: Stability AI Community License plus the Gemma terms on the text encoder (`Shop/Stable Audio Open.md:13`, `:141`). The palace already holds that as an open question for monetized use.

## The offers

1. **The craft to master, claim-change (Kokoro silences): confirmed.** I used a 5 ms RMS envelope at three thresholds. At −40 dB below the take's peak (the maker's rule): heads 260–425 ms, tails 440–705 ms. At an absolute −50 dBFS: heads 260–435, tails 480–710. At −60 dBFS: heads 260–425, tails 420–690. The maker's 258–423 and 439–704 hold. The takes start in digital zero, so the heads barely move with the threshold. A 600 ms beat is heard as 1.445–1.475 s depending on threshold (maker: 1.454). The exchange's 400/400/300 ms are heard as 1.36 / 1.375–1.395 / 1.255–1.28 s (maker: 1.36/1.39/1.26). Across the adjacent pairs actually used, the added silence is 0.75–1.02 s, so "0.75 to 1.0 s" is right to rounding.
2. **The craft to master, no-claim-edit (mix numbers): half confirmed, half disputed.** The segments measure −15.96, −15.66, −15.79, −16.36 and −15.59 LUFS on my BS.1770, −16.0, −15.7, −15.8, −16.4 and −15.6 on ffmpeg ebur128; the film measures −15.92 / −15.9. Those are confirmed, and so is the film sliced at the joins (−16.15 to −15.65). **"Bed about 10 LU under voice" is disputed.** That's the mono fold-down. The Shop's own stereo chain gives **5.7 LU**. As written, the offer would put a wrong number into the page.
3. **Enrichments, claim-change (VO-as-clock per scene, not inside one): confirmed in substance.** Picture minus sound is −16.7, −25, −25, 0 and 0 ms by frame count. Cuts fall within 21 ms by packet timestamps (maker: 17). The stretch is 35.725/29 = 1.2319, from `scenes.py:94` (`NOMINAL = 29.0`) and the `Seg` base class that scales every `run_time` and `wait` (`scenes.py:29–52`). The counter's last changing frame is 31.17 s into the segment; a frame at 31.3 s reads 913, while the foreman's first word is at 25.41 s. The beat times depend on the detector. The maker's statistic at 320×180 instead of 160×90, and two other statistics, put the four beats at 0.43–0.77, 8.83–8.87, 18.43–18.67 and 26.27–26.73 s. `scenes.py`'s own arithmetic puts them at 0, 8.62, 18.36 and 26.24 s, which lag the first words by −0.87, +0.19, +1.24 and +0.83 s. Either way the beats sit up to about 1.3 s late, and the claim holds. *Note:* "drift from 0.44 s early to 1.31 s late" reads as monotonic, and it isn't (+1.31 then +0.86). A beat that leads its line is also ordinary editing. "Beats sit up to about 1.3 s off their lines" says it without the gloss.
4. **Enrichments, no-claim-edit (assets now in the bundle): confirmed.** Every file is tracked under `Radio Play/rich-face/`. After the remake the size will be about 18 MB, not 15.

## Is 15 MB right?

Mostly, yes, and the copy is the prescribed route. The film has no bundle of its own: it lives only in `_ops/scratch/weave-video/`, which `.gitignore:40` ignores, so a face that pointed there would play only on this Mac. `_ops/rich-face/README.md` § Media a face plays says to copy a steward's render into the entry's `rich-face/` and commit it. The one redundancy is the m4a. Its 3.6 MB duplicates the mp4's audio track packet for packet. It buys the picture-free opening, and the page's first claim is that the sound stands without the picture, so I'd keep it. The stems are only the ten takes the pieces use, not all twenty-one, which is the right restraint. Everything copied stays in git's history for good. The remake should add only the two stereo SFX it needs, and nothing more.

## The face as a whole

It makes the page's idea felt rather than busy. The page describes a sound craft and held no sound; now you hear the play with nothing to look at, then pull it apart: who speaks, where the silence sits, where the laugh lands, and whether the picture really follows the sound. Two of its findings are real teaching. A Kokoro take brings its own second of silence to every gap. And VO-as-clock holds per scene but not per line. Both are things the Shop should know before its next play. Its one real fault sits in the measuring, not the idea. The stems were folded to mono to save space, and that quietly turned the Shop's bed and laugh down by about 4 and 3.4 dB, so the face reports a balance the Shop never mixed. Fix the fold, and the balance step can test "beds well under voice" against the real mix.
