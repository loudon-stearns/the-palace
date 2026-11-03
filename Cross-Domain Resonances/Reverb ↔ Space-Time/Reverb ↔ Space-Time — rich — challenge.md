---
title: "Reverb ↔ Space-Time — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Reverb ↔ Space-Time]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of Reverb ↔ Space-Time's first rich face: each piece judged on whether it tests the text, stays faithful to it and walks up to its test, Loudon's comment under The Physics held against what the clap piece answers, and every offer recomputed, the room by an image-source sum that shares no code with the pieces."
---

# Reverb ↔ Space-Time — rich — challenge

Challenger: claude-opus-5-5, 2026-11-03. Judged from the page (`Reverb ↔ Space-Time.md`), the manifest, the four pieces' source, `checks.mjs`, and the maker's commit body (88b62f94). My recomputation of the room is a separate image-source energy sum in Python (numpy, the same geometry and fitting windows, none of the pieces' code). The Lucier figures I re-ran on the piece's own engine with two baselines the piece doesn't have.

## Loudon's comment

Under The Physics: *"Help me understand how defining room dimensions and room size work together, and how well they can represent real spaces."* It has two halves.

The clap piece answers the first half well, and by measurement, not by assertion. Size sets the decay: every side ×2 doubles the decay. Dimensions set when the walls answer. Surfaces set the decay and leave the arrivals where they were. The line about a reverb's separate size and decay knobs being these two jobs pulled apart is the plainest answer to his question on the face.

The second half, how well this represents real spaces, is answered only in the fine-print note under the equations ("Real rooms scatter, so their late sound is nearer the even, diffuse field Sabine assumes than this bare box's"). The test step's verdict presents the box's two-slope decay as what a low, wide room does. That shape is mostly the model's: a shoebox with mirror walls and no scattering. Offer 3 talks about where Sabine reaches, which is part of the second half, but neither the piece nor the offer says plainly what a shoebox model can't stand for. That is the remake below.

## Verdicts

### The Physics

**`Reverb ↔ Space-Time — rich — one clap, one room.html` — remake, words only.**
1. Test or decoration: test. The piece runs t = d/343 and Sabine against a room model that could have disagreed with both, and it caught the page's 29 ms slip. My independent sum agrees with every figure it prints: 12 × 8 × 5 m at α 0.2 gives Sabine 0.986 s and the box 0.989 s over its first 15 dB, then 1.214 s. Doubled, Sabine gives 1.971 s and the box 1.975 s, then 2.432 s. Low and wide gives Sabine 0.735 s and the box 0.971 s, then 1.556 s. At α 0.45, Sabine gives 0.438 s and the box 0.376 s.
2. Faithful: where it disagrees with the text (29 ms), it says so and the manifest holds the offer. But its own test verdict misreads its numbers in one heading. "Shape sets the pattern, and Sabine barely sees it": Sabine moves 25% (0.99 → 0.74 s). The quantity that barely moves is the box's first 15 dB (0.99 → 0.97 s), and the box's late decay goes the other way (1.21 → 1.56 s). Sabine doesn't miss the shape; it sees the shape only as surface area, and here that sends it the wrong way.
3. Walks up: yes. One wall alone, then six first echoes, then every echo, then the four-room test. Every change re-claps, and the step rail stays open.
Runs clean, makes no sound before a click, and needs no files.
**Exact fix (one round):** (a) change the heading to "Shape sets the pattern, and Sabine sees it only as surface area" and say that Sabine shortens the decay while the box holds its first 15 dB and lengthens its late decay. (b) Add a last paragraph to the test verdict, "How far a box stands for a real room", with the note's honesty brought up where Loudon will read it. The box has mirror walls, one α for every surface and frequency, no furniture and no scattering, so its late slope (1.21 s even in the base room, 1.56 s in the low one) is the bare box's. A furnished room scatters toward Sabine and Eyring. Sabine fits when absorption is light and spread evenly. At α 0.45 the box's 0.38 s sits between Sabine's 0.44 s and Eyring's 0.33 s. (c) "The floor answers first in every room, at about 9 ms": in the low, wide room it answers at 7.3 ms, because the piece puts you at H/2 = 1.25 m there. Say "about 7 to 9 ms".

### The Relativity Connection

**`Reverb ↔ Space-Time — rich — a delay becomes a place.html` — keep, with notes.**
1. Test or decoration: test, at the last step. Where the reader hears one sound become two can land outside the page's 10 to 30 ms, and the verdict says which way it fell. The mono comb is an addition, not a test of anything the page says.
2. Faithful: mostly. The page's sentence is about two loudspeakers ("delay one speaker 10–30ms"); the piece runs on headphones, with no crosstalk between the ears, and its subhead says so ("On loudspeakers each ear hears both speakers, and the first two steps blur"). That is a fair, disclosed choice. The comb figures are right: summed, |1 + e^(−i2πfΔt)| goes silent at (k + ½)/Δt. At 25 ms that is 20, 60, 100 Hz…, (k + ½) ≤ 500, so 500 notches below 20 kHz. At 10 ms it is 50, 150, 250 Hz…, so 200.
3. Walks up: yes. The same click in both ears, then under a millisecond (Woodworth, 656 µs at most for an 8.75 cm head), then 1 to 40 ms, then the split and the sum.
Notes for the maker, none blocking: the in-piece thresholds ("under 10 ms for clicks, nearer 50 for speech") are about right. Wallach et al. (1949) give fusion at 1–5 ms for clicks and up to 40 ms for speech and piano. Blauert puts the end of precedence for speech near 50 ms. Litovsky et al. (1999, JASA 106(4):1633–1654) is a real review of this ground, but I could not open it to confirm it states these figures. Cite Wallach and Blauert, or say "reviewed in Litovsky et al. 1999". On the offer's framing, see below.

### Advanced Applications

**`Reverb ↔ Space-Time — rich — sitting in a box.html` — remake, words only.**
1. Test or decoration: test. Lucier's loop as Y = X·Hⁿ on the box, with the survivors checked against modes computed from the dimensions alone. The page's claim could have failed. It doesn't: the maker is confirming "room resonances emerge", not overturning it, and adds a condition.
2. Faithful to its own numbers: three overstatements in the verdict and caption.
   - "Below 244 Hz … one each" and the caption's "each survivor is one mode". By the piece's own density formula, modal overlap is 0.92 at 141 Hz, 1.85 at 200 Hz and 2.75 at 244 Hz; the Schroeder frequency is by definition where about three modes share a peak. The eight strongest peaks sit at 120–230 Hz. They are 4 tangential, 2 axial and 2 oblique ((1,1,3) at 203.5 Hz, (1,3,3) at 230.3 Hz). The 0.21 Hz distance reproduces exactly. Against a fairer baseline, random frequencies within ±5 Hz of each peak, the distance is 0.71 Hz, not 1.06. The finding holds (3× closer than chance), more modestly than "one each".
   - "They hold when the microphone moves (+15.1 → +7.5 dB)" against "those peaks sink to the crowd (+10.3 → +3.3 dB)". Both sets fall by about 7 dB. Random frequencies stand +1.1 dB (below) and +1.0 dB (above) over the band median at the moved microphone. So below the Schroeder frequency the peaks stay about 6 dB over chance, and above it about 2 dB. The contrast is real; "hold" against "sink" overstates it.
   - "The room alone ends on 28.6 Hz" is true only with the microphone in its first place; moved, the room alone ends on 1228.1 Hz. The verdict text does say "with the microphone here", but 28.6 Hz sits just under the piece's own 30 Hz high-pass, so the result leans on that choice. Say so.
3. Walks up: yes. One pass, the room's peaks against its modes, n passes, then the test with the microphone moved and the loudspeaker taken out of the loop.
The voice is the Kokoro voice reading a paraphrase of the page, not Lucier's text, so nothing licensed is copied.
**Exact fix (one round):** (a) caption and verdict: "below about 140 Hz each peak is one mode; toward 244 Hz two or three share a peak, and the strongest still sit within 0.4 Hz of one". (b) Add the local baseline beside the global one: "(random frequencies: 1.06 Hz; random ones near each peak: 0.71 Hz)". (c) Replace "hold" and "sink to the crowd" with the over-chance figures: below, they keep about 6 dB over chance when the microphone moves; above, about 2. (d) One clause on the 30 Hz high-pass beside the 28.6 Hz result. The engine stays as it is.

### Teaching Notes

**`Reverb ↔ Space-Time — rich — where are you.html` — remake.**
1. Test or decoration: as built, the blind round can't come out against the page. The reader answers each letter by picking one of the page's own student answers ("in my head", "a bedroom", "a concert hall", "a cathedral"). The verdict then says: "Notice what you named: a room, a size, a kind of place, not an amount of reverb. That is the page's point." The reader was only allowed to name places, so that sentence is circular. What the round does test is whether four rooms can be told apart and ordered, and it says honestly that they differ in size and surfaces at once.
2. Faithful: the labels are the page's own, faithfully. The subhead's "the voice stands 3 m from you in every room" is wrong for the small room: `placeIn` gives 2.48 m there (source at x = 1.2, listener at x = 3.6 in a 4 m room), and 3.07 m in the hall and the cathedral.
3. Walks up: yes. Dry alone, then dry against the small room, then the three rooms, then the blind round.
**Exact fix (one round):** (a) give each letter a short free-text box, "say where you are in a few words", before or instead of the place buttons, or add non-place choices ("just more reverb", "wetter", "an effect"). Then the verdict can read what the reader actually wrote: did they name a place or an amount? That is the page's claim, and that way it can fail. (b) Fix the 3 m line ("2.5 to 3 m"), or move the small room's source so the distance holds.

## Offers

1. **29 ms (no-claim-edit) — confirmed.** 10/343 = 29.15 ms is one way, the trip out without the return. Equivalently, it is a wall 4.97 m away. A wall 10 m away answers at 2·10/343 = 58.3 ms (58.33 ms with the ears 0.5 m from the hands). Both readings name the same slip; the page forgot the way back. The offer's "the bathroom and cathedral figures already use the round trip" is an inference. The bathroom fits round trip better (walls 0.86–1.7 m, against 1.7–3.4 m one way), and the cathedral reads either way (8.6–17 m or 17–34 m). The first proposed wording ("a wall 5 meters away") teaches the round trip; the second keeps the page's 10 m.
2. **Floor first (no-claim-edit) — confirmed, with its assumption named.** The piece puts the hands and ears both 1.5 m up (H/2 when the ceiling is under 3 m), with the ears 0.5 m to the side. That gives 2·1.5/343 = 8.7 ms by the piece's first-order formula. The full image path is 3.04 m, so 8.9 ms after the clap and 7.4 ms after the direct sound. In the low room it is 7.3 ms. A real standing clap (hands near 1.2 m, ears near 1.6 m) gives about 8.4 ms. "First wall reflection" is the right word.
3. **Size, shape and Sabine's reach (claim-change) — partly confirmed, partly disputed.** Confirmed: every side ×2 makes V ×8 and A ×4 at the same α, so T ×2 exactly (0.986 → 1.971 s). The low, wide room at the same volume has S = 525 m², so Sabine gives 0.735 s. Independently I get the box at 0.971 s over its first 15 dB, then 1.556 s. Disputed:
   - "Sabine barely sees it" contradicts these numbers (see the clap piece).
   - "Sabine matched the box's first 15 dB within about 5% … at every α tried" fails at α 0.45: box 0.38 s, Sabine 0.44 s, 16% long. It holds for α ≤ 0.2.
   - "Near-cubic" is a stretch for 12 × 8 × 5 m.
   - The two-slope decay should be labelled as the bare box's (it shows even in the base room, 0.99 then 1.21 s), not as what a real low room does.
   The proposed sentence is good; add "and lightly absorbing" to where Sabine fits. As an answer to Loudon's comment it covers size against dimensions. It does not yet cover how well the box represents real spaces, which the clap piece's remake should carry.
4. **Haas comb (claim-change) — confirmed as an addition, framing disputed.** The numbers are right (25 ms: 20, 60, 100 Hz…, 500 below 20 kHz; 10 ms: 50, 150 Hz…, 200). The page's sentence is about loudspeakers and stereo listening, and it says nothing false, so the comb adds to it and corrects nothing. The offer's "the Haas sentence is right on headphones" misdescribes the page; it speaks of speakers. On loudspeakers each ear hears both speakers, so a comb forms at each ear acoustically too. Two ears hear it less, and a mono sum is where it is loudest. Suggested: "Sum the two speakers to mono and the same delay becomes a comb filter: time difference becomes timbre." That stands as proposed. On the echo threshold: the substance is about right (Wallach et al. 1949: 1–5 ms for clicks, up to 40 ms for speech and music; Blauert: about 50 ms for speech). I could not confirm the figures in Litovsky et al. 1999 itself.
5. **Lucier (claim-change) — confirmed in substance.** The maker confirms that the modes emerge; it doesn't contradict the page. Position-dependence holds across the whole band, not only above Schroeder: below it, the peaks' prominence halves in dB when the microphone moves. So "as heard from where the loudspeaker and microphone stand" is right for the whole sentence. Carry the corrections from the piece's remake into the offer's text: one mode per peak only below about 140 Hz, the 0.71 Hz local baseline, about 6 dB over chance against about 2.

## Checks run

- `node "…/Reverb ↔ Space-Time — rich — checks.mjs"` reproduces every figure in the commit body and the offers. It also prints the room-alone result for the moved microphone (1228.1 Hz), which the commit body leaves out.
- My own image-source energy sum (numpy, separate code), described above. It agrees to the second decimal on all four rooms.
- My own run on the Lucier engine: which modes the eight strongest peaks sit near, the ±5 Hz local random baseline (0.71 Hz), the random-frequency stand-out at each microphone (+1.6/+1.1 dB below Schroeder, +0.6/+1.0 dB above), and modal overlap at 141, 200 and 244 Hz (0.92, 1.85, 2.75).
- `conform.mjs "Reverb ↔ Space-Time"`: 4 pages, 4 introduced, errors 0, warnings 0, browser pass at 760 and 1130 px.
- `fingerprint.mjs "Reverb ↔ Space-Time"`: all four sections in step (3cbbf4d8b1e5, 382bb2f4d0b4, 482c5e0d85a5, 8e5c0e875f5e).
- `rich-server.mjs --detach`, the face at `?entry=Reverb ↔ Space-Time` in headless Chromium at 1130 px: four piece frames, four proposal chips, no console messages and no page errors while every step of every piece was clicked and played. The test verdicts rendered with the numbers above.
- Sound before a click: none. Each piece makes its AudioContext only inside a click handler (`clap()`, `play()`). Hush on hide: clicking three pieces in turn left only the last one running (the kit's one voice at a time), and a played hide (visibilityState hidden, visibilitychange in every frame) took it from running to suspended, with no console errors or warnings. The Lucier piece was left out of the click run, since it builds about three million reflections on its first play.
- Every piece needs no files and no hosts. The voice is inlined as base64 (Kokoro af_heart, the same 60 KB in three pieces). Nothing licensed is copied.
- Litovsky et al. 1999: the citation is real (JASA 106(4), 1633–1654). Its echo-threshold figures were checked against Wallach et al. 1949 and Blauert as reported in Wikipedia's precedence-effect article, not against the review itself.
- Not checked: any piece by ear.

## The face as a whole

It makes the page's idea felt more than it decorates it. The clap piece is the best thing here. It takes Loudon's question literally and answers it with a room you can resize, and it found the page's one arithmetic slip. The Haas piece earns its place by turning one delay into place and then colour, which is the page's space–time–frequency triangle played rather than stated. Lucier as Y = X·Hⁿ is a real test that the page passes, with a condition worth knowing.

The face's weakness is a habit, not a piece: its verdict lines run a little ahead of their numbers. "Sabine barely sees it", "one each", "they hold", and a blind round whose verdict congratulates the reader for words it supplied. None of that needs a new engine. All of it is one round of sentences. Once fixed, the face shows the reader what the page says and what the page couldn't know without building the room.
