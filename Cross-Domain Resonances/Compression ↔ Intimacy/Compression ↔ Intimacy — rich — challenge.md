---
title: "Compression ↔ Intimacy — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Compression ↔ Intimacy]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of Compression ↔ Intimacy's first rich face: the blind test kept, the distance piece sent back because it builds the page's whisper and shout with the same range and then finds they don't differ in range, the four knobs sent back for one sentence that calls a measurement that can't fail a test, and the three offers reworked from numbers I ran myself, so Loudon can approve or revise without redoing the sums."
---

# Challenge — Compression ↔ Intimacy, rich face, proposal round

Challenger: claude-opus-5-5, 2026-11-03, against the maker's commit `85775bad`. I read the brief, Enrichment v2.8 and its tuning (items 1, 3, 5, 9, 11), Progressive Staging, the rich-face README (§ The manifest, § Making pieces), the page whole, the manifest, all three pieces' source, `check.mjs` and the maker's commit body.

**Verdicts: 1 keep, 2 remake, 0 retire.**

## The checks I ran, and what came back

- `check.mjs` (the maker's): all PASS. Every printed number came back from the engine.
- **My own probe** (scratchpad, the engine loaded straight from "where is the singer"):
  - **Loudness, measured outside the engine.** I wrote the four blind buffers to 32-bit float WAV exactly as the piece plays them (it applies one ×0.9 gain to all four), then ran ffmpeg's `ebur128`, a separate BS.1770 implementation. All four read **−20.0 LUFS**. The match is real.
  - **Length and start.** All four are 187 200 samples. Each version's first non-zero sample falls between 1444 and 1448, so the starts differ by at most 4 samples (0.08 ms).
  - **Pumping.** At both ratios the gain holds at 0.0 dB through both breaths, so nothing breathes in the gaps. Inside the syllable bodies the gain moves 0.00–1.19 dB peak to peak at 4:1 and 0.19–1.57 at 20:1. The worst at 4:1 is the soft line just after the shout, which is still releasing. That release is the variable at work, not a wobble.
  - **Colour inside a syllable.** The maker's 0.14 dB holds, but only over the vowel body: `sylBands` measures from t+0.08 s, after the consonant. Across the consonant it doesn't hold. At 4:1 the consonant rises against its own vowel by **+4.7 dB** (the "t" before the half voice) and **+7.0 dB** (the "h" before the shout). At 20:1 the same two rise +7.7 and +8.1. That is the range being narrowed inside a syllable, so it isn't a leak, but "level, not colour" is only true of the vowels. The spectral centroid of each vowel body moves 0–2 Hz under compression. The close-mic control moves it 20–329 Hz.
  - **Onsets.** The fastest gain move is 0.45 dB/ms at 4:1 and 2.03 dB/ms at 20:1. The maker's broadband onset check (≤ 2.0 dB at 20:1) reproduces. Weighted towards the highs, the 20:1 onsets stand up to 21.5 dB further above their bodies than the uncompressed ones do. Most of that is the consonant lift above, plus the fast attack. The 20:1 arm isn't the verdict arm, and "sounds processed" is the page's own prediction for 20:1.
  - **Release, recomputed.** 4:1, threshold −30, attack 10 ms. At 40 ms release the soft line after the shout is held 1.93 dB where its own level asks 1.82, the whisper after it 0.00, and the extra hold is gone after 79 ms. At 1 s: 10.99 dB, 6.97 dB and 1380 ms. In what the ear gets, the soft line comes out at −38.55 dB against −29.53, and the whisper at −50.95 against −44.00. All the maker's numbers stand.
  - **Distance, recomputed.** Over the floor the range is 27.87 dB at 4 m and 12.17 dB at 32 m. In open air with no floor, it changes by at most 7.1e-14 dB across 61 distances. Both match the maker.
  - **The page's pair, rebuilt with different made ranges** (details under offer 1).
- `fingerprint.mjs`: The Technical Side `253b387f0ce8`, The Conceptual Side `ef5bc40c3a10` and Teaching the Resonance `ec219b821f79`, all in step. Three stamps, by name.
- `conform.mjs`: 3 pieces, errors 0, warnings 0, browser pass at 760 and 1130 px.
- **The live face, headless** (rich-server on this worktree, `?entry=Compression ↔ Intimacy`):
  - The head reads "proposal round, not yet approved by Loudon · 3 offers for the text", and all three figures carry a proposal chip.
  - No piece made an AudioContext before a click. In each piece, one click on Play made one, and it was running.
  - Hiding the page suspended it in all three pieces, and each Play button went back to "Play".
  - I drove the blind test through all 24 trials. It scored all three sets, and "2 of 8 → 37 in 256" is right (1+8+28).
  - Console clean.
- **Other checks.**
  - No detached `new Audio()`. The only grep hit is `new AudioContext`.
  - No code comment names `rich:hush`, so the kit keeps the hush.
  - No file, sample or recording is loaded (`piece:needs` is empty, nothing fetched). The voice is synthetic, and nothing is licensed.
- **Is anything duplicated?** I compared the faces already landed in the owner's folder.
  - Compressor Design's pieces are about the ring buffer, the RMS window and the knee's spectrum.
  - Blood Compressor's "stressed body" measures release, but for a heartbeat plugin's threshold claim.
  - Nothing here duplicates them.
- **The Vulnerability Parallel** is `###` at line 76 under `## The Conceptual Side` (line 53). The manifest files the four-knobs piece under The Conceptual Side and says why, in both the caption and the forward vector. Confirmed.

## The pieces

### The Technical Side · "does distance narrow a voice" — **remake**

1. **Does it test, or decorate?** It looks like a test, but it can't fail. In the engine, open-air distance is one gain on the whole voice: `place()` multiplies every sample by 0.05/r. A dB difference between syllables can't change under that, so the "null" of 7e-14 dB is arithmetic. It checks the code, not the world. Over a fixed floor the range can only narrow. So the step's own sentence, "The test can fail: any distance where the range comes out wider … would bear the page out", is not true of this model.
2. **Is it faithful?** No, at its last step. The page's sentence predicates range of the acts: "a whispered voice in your ear has minimal range; a shout across a field has enormous range." The most natural reading is that a whisper is made with little range and a shout with a lot, each heard where it happens. It does not say distance does anything to range. The piece builds "the page's own pair" with both phrases given the same 4 dB range "by choice". It then reports "What is enormous in the pair is not range", which is the assumption coming back out as a finding. Rebuilt in the piece's own engine with the shout made wider, the page's pair holds at the listener:

   | the shout made with | whisper in your ear, 5 cm, arrives with | shout across a field, 50 m, arrives with |
   |---|---|---|
   | 4 dB (the piece) | 4.00 dB | 3.17 dB |
   | 12 dB | 4.00 dB | **7.21 dB** |
   | 20 dB | 4.00 dB | **8.42 dB** |

   Whether real shouts are made wider is outside the palace. Two papers report that shouted speech raises the vowel-to-consonant ratio: Raitio et al. 2013, and Rostolland 1982 as they cite him (secondhand; I read neither in full). That points the page's way for the shout. I did not verify the whisper half.
3. **Does it walk up?** Yes. One phrase at the microphone, then carried away, then the pair.

**The remake:**
- Keep steps 1 and 2, but say plainly that open-air distance is a pure gain here, so the range can't move, and that the floor is the only thing that changes it. Drop "the test can fail" from step 2.
- Rebuild step 3 so the pair's made ranges are an input the reader can set: equal, and shout-wider. Show that the range at the listener follows the range as made, less what the floor takes.
- Either measure range across consonants or say the measure skips them. The vowel-to-consonant ratio is where shouts are reported to widen.
- Cut "What is enormous in the pair is not range". Carry the effort-against-level cue with its two caveats (offer 1 below).

### The Conceptual Side · "four knobs and the guard" — **remake** (one sentence; the rest is a keep)

1. **Does it test, or decorate?** It tests whether the section's four lines make one map, a claim the page takes for granted ([[Latent Error]]), and it finds a real seam (offer 2). The finding stands on reading the text, not on the meter.
2. **Is it faithful?** It quotes all four of the page's lines word for word. One sentence isn't honest about its own test. Step 5 says "The test can fail: if a slower release held them down less, the page's line would hold on its own section's reading." A one-pole release can't do that: a slower release holds longer by definition, at every sample where the hold is above what the level asks. So the failure number named there can't occur. This is tuning item 11's "null that can't fail".
3. **Does it walk up?** Yes: the 4:1 voice and its hold, then threshold, ratio and attack, then release as the test.

**The remake.** Replace that sentence with: "The meter can't go the other way: a slower release always holds longer. What is under test is which way the page reads the hold." In the caption, "the test, set before the slider moves" can stay if it says the test is of the reading. Nothing else changes.

### Teaching the Resonance · "where is the singer" — **keep**

1. **Does it test, or decorate?** It tests. Part 1's claim, that the 4:1 version feels close, is asked blind and could come back "can't tell" or "farther". It came back "can't tell" when I answered at random.
2. **Is it faithful?** Yes. It uses the page's three versions with its settings: 4:1 with medium times, and 20:1 with fast ones. It leaves "sounds fake" unscored and says so.
3. **Does it walk up?** Yes: a whisper and a shout, then the three versions matched, then the bass control, then 24 blind pairs.

**Chance, recomputed for the test as built.**
- There are 24 trials: 8 per arm, 4 with the processed version first, shuffled, and side and order are random.
- In the 4:1 set, a pass ("closer") is 7 or 8 of 8. Guessing gets there 9 times in 256 (0.035). "Farther" is 0 or 1 of 8, also 9 in 256. Any verdict on the 4:1 set is 18 in 256 (0.070).
- Across all six edges of the three sets, a guesser trips one 0.197 of the time. That is why the verdict is read from the 4:1 set alone. All of this is stated before trial 1, and all three sets are scored.
- The power is low. A listener who really hears 4:1 as closer 75% of the time passes 7 of 8 only about 37% of the time. The piece says "eight trials miss a small effect often".

**The leaks.** I tried to pass it by length, by start, by an onset click, by gain wobble, by pumping and by spectral change inside a vowel, and none of them gives the answer. The three the maker names are honest caveats, not fatal ones:
- **Loudest moment against average.** These pull in opposite directions, so neither favours the page.
- **The brightness of the raised whispers.** This is the range at work. But it is *unclosed*, not unclosable: a fourth arm, the uncompressed voice equalised to the 4:1 version's long-term spectrum (+7.2 dB above 3 kHz) and matched, would separate brightness from range.
- **The listener who can hear which version is compressed.** This is unavoidable for anyone who has just read the page beside it.

**Notes for a later round, not a remake.**
- Say "inside each vowel" where the piece and caption say "inside each syllable". At 4:1 the consonants rise +4.7 and +7.0 dB against their vowels.
- Change "can't be closed" for the brightness leak to "isn't closed here".
- Consider that brightness arm.

## The offers

**Offer 1 (The Technical Side, claim-change) — disputed.**
- The propagation half reproduces: no change in open air (7.1e-14 dB), 27.87 dB at 4 m and 12.17 at 32 m over the floor. But it answers a reading the sentence doesn't make, and it can't come out any other way in this model.
- On the reading the sentence does carry (the range belongs to the act, heard in its setting), the engine's own pair holds once the shout is made wider than the whisper: 7.21 dB at 50 m against 4.00 at 5 cm.
- "The whisper arrives 27.4 dB louder though made 32 dB softer" reproduces. It is set by the engine's 32 dB whisper-to-shout gap, though. Brungart & Scott's own stimuli spanned "a 60-dB range of different vocal effort levels". At a 60 dB gap, the whisper at 5 cm and the shout at 50 m (60 dB of inverse square apart) arrive about level.
- The citation exists, and the volume, issue, pages and DOI (10.1121/1.1379730) are right. The quoted result is right for high-level voiced speech: distance judgments doubled "with each 8-dB increase in production level and each 12-dB decrease in presentation level". But the same abstract says that for whispered speech "the distance judgments were unaffected by changes in production level", and changed with presentation level only above about 66 dB SPL. The suggested sentence leans on a whisper ("a whisper that arrives loud can only be close"), and that is the case the paper supports least.
- What survives is a **no-claim-edit**, if Loudon wants one: make the sentence say that the range belongs to the act ("a whisper is made with little range; a shout with a lot"). The effort-against-level cue could also go in as an addition for voiced speech, but not as a correction.
- Sources (web, not palace): the abstract at https://scholar.usuhs.edu/en/publications/the-effects-of-production-and-presentation-level-on-the-auditory-/ . Raitio et al. 2013 at https://www.pure.ed.ac.uk/ws/files/14560064/Raitio_Suni_et_al_2013_Analysis_and_Synthesis_of_Shouted_Speech.pdf (search summary only, not read in full).

**Offer 2 (The Conceptual Side, claim-change) — confirmed, as a reading.**
- The numbers reproduce: 1.93 / 1.82 / 0.00 dB and 79 ms at 40 ms; 10.99 / 6.97 dB and 1380 ms at 1 s.
- This is not a contradiction the page holds on purpose. Nowhere does the page name it. The four lines are presented as one map ("Compression parameters map to intimacy"), and the section's own first subsection maps compression the other way ("Loud ↓ … Defenses ↓ … → Intimacy").
- So it is an unnamed double reading. The maker's two ways home (turn the release line, or name the double reading as a held contradiction) are both fair, and the choice is Loudon's.
- The measurement can't fail, so the offer stands on the reading of the text. The numbers show it; they don't prove it.

**Offer 3 (The Structural Identity, claim-change) — confirmed in part.**
- The rows do mix. "Fast attack = guarded" reads the hold as the guard. "Reduces loud peaks | Reduces defensive reactions" and "Slow release = sustain | Sustained openness" read it as the closeness.
- "Controlled by threshold | Controlled by trust" is neutral, though; it doesn't read either way. Count it out.
- The table follows offer 2, as the maker says.
- **A slip the maker missed:** "Creates proximity effect". The proximity effect is a close microphone's bass rise, not something a compressor does. This face's own control tells the two apart (+7.7 dB at 200 Hz from a cardioid at 5 cm, with the range unchanged). That is a no-claim-edit candidate for Loudon, e.g. "Creates a sense of proximity". I added no offer for it, since the brief says to change nothing else in the manifest.

## The face as a whole

The face is serious work: one synthetic voice and one engine, byte for byte, across three pieces. Every number it prints is re-run in Node, and the loudness match held up against an outside meter. At its centre is the blind test, and that is the right centre. The page's whole case rests on a felt claim ("suddenly the singer is right here"), and the face turns that claim into a question a reader can answer and lose. The four-knobs piece finds a real seam in the page's map, and you can hear it: the soft line after the shout ducked by a slow release.

The weak piece is the one that sounds most like physics. It refutes a reading the page doesn't hold, with a null that can't fail, and then builds the page's pair so that it can't differ. Mended, it becomes the honest part: distance doesn't make range, so whatever closeness compression gives, it gives through the act and the ear. That is what the blind test then asks.

The face is dense; each step is a paragraph. But it serves the idea rather than crowding it. It makes the page's claim something you can feel and test, which is more than the text alone can do.
