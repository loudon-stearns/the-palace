---
title: "Tract Mirror — scroll"
born: 2026-09-23
links:
  - target: "[[Tract Mirror]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Tract Mirror's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Tract Mirror — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Tract Mirror]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-17T12:28:11.932Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 4 · last ran 2026-11-17 (today)
- **Plan:** agreed 2026-09-25 (52 days ago) · 7 made things since
- **Waiting on you:** 2 open asks
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-11-17 (today) — Will you sing five vowels into my new page, and should it get the microphone inside the board too? (`tract-mirror-steward-011`)
- **Last commit touching this project:** 2026-11-17 `b67afdbf` — steward(Tract Mirror): cycle 3 — SPINNING UP. HOME: [Tract Mirror](?deck=STATE&entry=Projects/Tract Mirr…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 4 runs on 2 days, counted from the ledger's run lines
- **Last run:** 2026-11-17 — cycle 4 · taught item 4
- **Owed in the ledger:** nothing
- **Latest lesson:** item 4, from cycle 4 — 2026-11-17 — [[Tract Mirror — tuning]]

### Where this stands

Tract Mirror is the palace's first native plugin: a one-voice singing synth for Ableton whose 3D tubes are the filter itself. The first build shipped in June. The plan's last move is learning to speak by listening: you sing into it, and it sings back with your own mouth shape. Earlier today I fixed my listener: instead of picking out formants, it sings along, reshaping a tube until my exact harmonics match what it heard. This cycle moved that listener into one web page. You sing a held vowel, watch the tube take shape, hear me sing it back at your pitch, and can save the tube. On my own vowels it hears what the Python version heard. Then I tested it on a throat that isn't mine. That broke i…

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since cycle 1:** Nobody has heard the refit yet, me included: it's tuned to the numbers, not to an ear. _(in 4 notes, the latest cycle 4)_
- **rough since cycle 1:** Wiring it in also means recomputing the plugin's vowel loudness matching, which was built from the old shapes. _(in 2 notes, the latest cycle 2)_
- **rough since cycle 3:** Nobody has sung into it yet, me included: every number is my own tubes, through my pulse or one other made-up throat. _(in 2 notes, the latest cycle 4)_

### Open asks

- `tract-mirror-steward-006` — directional_decision · posted 2026-11-17 · options: WIRE-IN · KEEP-AS-IS · ADJUST
- `tract-mirror-steward-011` — microphone_grant · posted 2026-11-17 · options: OPEN-ALONE · GRANT-MIC · NOT-NOW

### Answered, not yet consumed

_None._

### Decided

- `tract-mirror-steward-003` — directional_decision → GRANTED — option_id=AUDITION-REFIT (2026-11-10)

### Runs

- 2026-11-17 — cycle 4 · taught item 4
- 2026-11-17 — cycle 3 · taught item 3
- 2026-11-17 — cycle 2 · taught item 2
- 2026-11-05 — cycle 1 · taught item 1

### Owed

_Nothing owed._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** The palace's first native plugin: a monophonic voice synthesizer inside Ableton whose 3D drawing of the vocal tract's tubes is the filter itself, not a picture of it. The whole first build is behind it: the Python reference, the C++ engine, the WebView interface, validation, a verified load in Live 12 on 2026-06-10, then MIDI performance controls, loudness matching across vowels, and Word mode, all recorded in [[Tract Mirror — build plan — JUCE VST]]. What it wants next is to learn to speak by listening.

**The moves ahead**

1. **Play the last two additions in Live.** The MIDI controls (velocity, and two CCs on the vowel pad) and Word mode passed their offline checks but have not been played inside Ableton. The build plan notes the MIDI check waits on Loudon at the machine.
2. **Learn to speak by listening.** A record-and-analyze engine: sing into it and it replays your own tract shapes. The entry names it as the next version; it has no design yet.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
Decided by Loudon on 2026-06-09, carried over from the build plan's locked decisions (approved as orders 2026-09-25):

- **JUCE 8 with a WebView interface**, three.js drawing the 3D tract.
- **Ableton Live 12 is the target DAW**: VST3 and AU, macOS arm64.
- **The first voice source is built-in vowel morph tables** (a, e, i, o, u, schwa) on an XY pad; the analysis engine waits for the next version.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="tract-mirror-steward-011" -->
### 2026-11-17 — cycle 4 — Will you sing five vowels into my new page, and should it get the microphone inside the board too?
> still working · sing-back page shipped, untested on a real voice · steward leans OPEN-ALONE

Tract Mirror is learning to sing back what it hears. This cycle I made a page where you hold a vowel and I find the tube that makes it, then sing it back. On my own voice it is nearly exact. On a throat I invented it gets the vowel within about 5% but the mouth shape only loosely. Your voice is the test nothing so far can stand in for. There are two ways to reach it. You can open the page on its own in Chrome, one click below; the browser asks for the microphone and nothing in the palace changes. Or you can let it use the microphone inside the board, which means a line in the palace's grants list (only on your yes; an elder writes it). I lean toward opening it on its own for now and leaving the grant until the page has earned a place on my rich face. I keep working either way. [Open the page](open:Projects/Tract Mirror/listening/sing-back.html).

**Artifacts:**
- [The page to sing into.](Projects/Tract Mirror/listening/sing-back.html)
- [What a finished listen looks like (my own /e/).](Projects/Tract Mirror/listening/sing-back-selftest.png)
- [singalong-errors.png](Projects/Tract Mirror/listening/singalong-errors.png)
- [singalong-replay.wav](Projects/Tract Mirror/listening/singalong-replay.wav)
- [ear-errors.png](Projects/Tract Mirror/listening/ear-errors.png)
- [ear-singback.wav](Projects/Tract Mirror/listening/ear-singback.wav)
<sub>`tract-mirror-steward-011` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="tract-mirror-steward-010" -->
### 2026-11-17 — cycle 4 — You can now sing a vowel into me in the browser, watch me find your tube, and hear me sing it back.
> shipped · works on my own voice, untested on yours · steward leans you sing into it

What I built: [the sing-back page](open:Projects/Tract Mirror/listening/sing-back.html). It holds the whole listener and the singing tube in one file. Press Listen and hold a vowel for 2.5 seconds, or load a recording. The amber tube reshapes while I search, and the harmonics panel shows your levels against mine. When it's done I list the pitch, the throat I found, the formants of the tube, and the nearest of my six vowels. The buttons play your take, me singing it, or both, and save the tube in the plugin's vowel format. Adding ?selftest=e,110 to the address runs a self-test.

Checked against the Python: tube levels agree to 0.003 dB and the rendered voice to 1e-4. On my six vowels at four pitches, F1 comes back within about 1% from G2 to A3, with the same two misses at E4 (/u/ and /i/, whose F1 sits below the pitch). One fit takes 3–11 s.

What broke: I sang my own six tubes through a different throat (a sharper, shorter glottal pulse with some breath). The listener that assumes my pulse heard F1 up to 55% off, and fitting a free slope didn't help. A pulse's spectrum has ripples a slope can't follow. The fix was to find the throat first: try sixteen throats on a quick fit, keep the best, then search tubes with it. F1 comes back within 5% on average (worst 10%) and F2 within about 1%, even though the true throat isn't one of the sixteen. The mouth shape stays loose: 6–8 dB of shape error, against under 1 dB when I know the throat.

The pitch finder broke too. Autocorrelation locked onto the first formant's ringing and heard one /e/ at three times its pitch. Pitch now comes from the spectrum (harmonics standing above the valleys between them), and every test vowel reads within 0.3%.

**Artifacts:**
- [The sing-back page. Its microphone works when opened on its own in Chrome; inside the board, load a recording or run the self-test.](Projects/Tract Mirror/listening/sing-back.html)
- [The page after a self-test on my /e/ at 110 Hz: tube found within 0.27 dB of shape, harmonics matched to 0.04 dB.](Projects/Tract Mirror/listening/sing-back-selftest.png)
- [A throat that isn't mine: F1 and F2 error per vowel, four ways of listening. Finding the throat first is the amber bar.](Projects/Tract Mirror/listening/other-source-errors.png)
- [Holds the page's listener against the Python, then runs the own-voice test at four pitches.](Projects/Tract Mirror/listening/sing-back-check.mjs)
- [Writes the Python reference numbers for that check.](Projects/Tract Mirror/listening/sing-back-check.py)
- [The Python reference numbers.](Projects/Tract Mirror/listening/sing-back-check.json)
- [Check results: model all PASS; the 24 self-test rows.](Projects/Tract Mirror/listening/sing-back-check-results.json)
- [Sings my six tubes through the other throat (writes other-source.json, not kept: it takes seconds to make).](Projects/Tract Mirror/listening/other-source.py)
- [Listens to them four ways.](Projects/Tract Mirror/listening/other-source-check.mjs)
- [The numbers behind the table and chart.](Projects/Tract Mirror/listening/other-source-results.json)
- [Last cycle's sing-along run log, left undeclared then; kept now.](Projects/Tract Mirror/listening/singalong-run.log)

_My six tubes sung through a throat that isn't mine, 147 Hz: how far off I hear them_
| how I listen | F1 off, average | F1 off, worst | F2 off, average | mouth shape off |
| --- | --- | --- | --- | --- |
| assume my own pulse | 18.8% | 55.5% | 1.2% | 11.5 dB |
| my pulse + free slope | 34.0% | 85.1% | 9.0% | 13.3 dB |
| find the throat first | 5.0% | 10.2% | 1.2% | 6.6 dB |
| find the throat + slope | 4.8% | 10.8% | 1.0% | 8.1 dB |

_Changed in the workshop:_ README — Added the browser probe's findings: the port matches, the throat matters, finding it fixes the vowel but not the mouth, pitch by comb.
_Changed in the workshop:_ sing-back design — draft — The design now finds the throat before the tube and finds pitch from the harmonics; the real-voice test has a page.

_Left rough:_ Nobody has sung into it yet, me included: every number is my own tubes, through my pulse or one other made-up throat. The mouth shape on an unknown throat is loose (6–8 dB), and the throat search is a coarse grid of sixteen, not a real fit. Nobody has heard the refit yet, me included: it's tuned to the numbers, not to an ear. That one, and wiring it in, wait on your answer to the open wire-in ask.

_Next moves named:_ Your voice: a held a-e-i-o-u at a comfortable pitch, then higher, through the page. Save each tube and leave the JSON files in listening/. · Replace the sixteen-throat grid with a smooth throat fit (open quotient and sharpness as continuous parameters, or an LF pulse), to tighten the mouth shape. · Then the plugin side: a background listen job in the JUCE engine, starting from the nearest built-in vowel, writing into a user slot on the vowel pad.
<sub>`tract-mirror-steward-010` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-4b15d67e13" -->
### 2026-11-17 — cycle 4

taught item 4
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="tract-mirror-steward-008" -->
### 2026-11-17 — cycle 3 — I can now hear my own vowels almost exactly, and recover the mouth shape too, by singing along with them, not picking formants.
> shipped · listening ear fixed on my own voice, untested on yours · steward leans record-Loudon-next

**First I tried better formant pickers, and they made it worse.** One was envelope LPC, the other a small lattice fitted to the tops of the harmonics. Both heard F1 further off than plain LPC (ear-errors.png). That told me where the error lives. The tube's own F1 peak sits on its pole to within 1%. The pull comes from the glottal pulse, and no picker that ignores the source can undo it.

**So the ear sings along.** For a candidate tube I compute exactly what Tract Mirror would sing at the heard pitch: the same pulse, the same as-sung tube (lip filter on), the same lip radiation. That model matches a real render to within 0.06–0.2 dB. Then I reshape the tube until its harmonics match the heard ones in level. The source is inside the model, so its pull cancels. The ear still isn't told the vowel.

**On twelve tubes of known shape at four pitches** (the six vowels now, the six refit ones): mean F1 error is 0.1% at G2 and D3, 0.4% at A3, 3.1% at E4. The plain ear was at 14%, 7%, 9% and 17%. F2 and F3 come within 0.6% everywhere. The two misses are /u/ and /i/ at E4. Their F1 (about 250 Hz) sits below the 330 Hz note, so no harmonic ever touches it. That one is physics, not a bug.

**The bigger find: it gets the mouth back.** Three formants can't tell two tubes apart: cycle 1's fitted /e/ was 11.9 dB away in shape and sang the same. Twenty-odd harmonic levels can. Mean shape error is under 1 dB at the low pitches and about 4 dB at E4. That is the 'same formants, different tube' problem largely answered for a low voice.

**Where it fails.** On the two macOS voices it lands nowhere sensible (Samantha's /a/ comes back with F1 at 96 Hz). Those clips are a quarter second of steady sound with speech-gliding pitch, and the pitch finder reads Daniel at 364 Hz. So they test the pitch finder more than the ear. A held, sung vowel is the input this needs.

**I also drafted the sing-in, sing-back design** from all three probes: one 'listen' button, the 3D tube morphing toward your shape while it fits, and the result as a user slot on the vowel pad. It's a workshop draft, not an entry.

**Passed over:** importing a pro formant tracker (Praat-style). It would still pick formants and inherit the source pull. Singing along uses the instrument itself as the ear, which is the mirror thesis turned around.

**Artifacts:**
- [Start here: grey is the ear now, amber is the sing-along ear, on 12 tubes at four pitches. Amber sits on zero except two high-voice /u/ and /i/.](Projects/Tract Mirror/listening/singalong-errors.png)
- [The sing-along ear: exact harmonic spectrum of a tube at the heard pitch, fitted to what was heard.](Projects/Tract Mirror/listening/singalong.py)
- [Every fit: formants as sung back, shape error, spectral fit, and the two macOS voices.](Projects/Tract Mirror/listening/singalong-results.json)
- [Daniel and Samantha: their vowel, the old ear's sing-back, the sing-along sing-back. Shows the failure on gliding speech, honestly (stays on this Mac).](Projects/Tract Mirror/listening/singalong-replay.wav)
- [The first try: two better formant pickers, measured against plain LPC.](Projects/Tract Mirror/listening/ear.py)
- [Why pickers weren't the answer: both new pickers miss F1 worse than plain LPC.](Projects/Tract Mirror/listening/ear-errors.png)
- [The picker numbers, per tube and pitch.](Projects/Tract Mirror/listening/ear-results.json)
- [At A3: each vowel, then what the plain ear and the lattice-picker ear sing back (stays on this Mac).](Projects/Tract Mirror/listening/ear-singback.wav)
- [A first design for sing-in, sing-back, built on what the probes measured.](Projects/Tract Mirror/listening/sing-back design — draft.md)

_Mean error hearing F1, 12 tubes of known shape (%), and how far the recovered tube's shape is off (dB)_
| pitch | ear now (plain LPC) F1 | sing-along F1 | sing-along worst F1 | sing-along shape off |
| --- | --- | --- | --- | --- |
| G2 98 Hz | 14.0 | 0.1 | 0.1 | 0.98 dB |
| D3 147 Hz | 7.1 | 0.1 | 0.2 | 0.85 dB |
| A3 220 Hz | 9.2 | 0.4 | 1.9 | 2.04 dB |
| E4 330 Hz | 17.1 | 3.1 | 17.1 (/u/, F1 below the note) | 3.95 dB |

_Changed in the workshop:_ README — Added the second pass on the ear: pickers failed, singing along works, the high-voice limit, the macOS-voice caveat.
_Changed in the workshop:_ sing-back design — draft — New workshop draft: the first design for the listening version, from what the probes measured.

_Left rough:_ Nobody has heard the refit yet, me included: it's tuned to the numbers, not to an ear. The new ear is proven only on my own voice; it fails on the two macOS clips, and nobody has sung into it yet.

_Next moves named:_ Hear a real held vowel: a recording of Loudon singing a-e-i-o-u at a comfortable pitch and one higher is the test the ear needs next (any phone recording dropped in listening/voices/ will do). · Make the fit plugin-sized: one start from the nearest vowel and an analytic gradient, to get from about 40 seconds toward a few. · If you say wire it in on the refit question: replace the vowel file, redo vowel loudness, rebuild, rerun the checks.
<sub>`tract-mirror-steward-008` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-98cbc97c3d" -->
### 2026-11-17 — cycle 3

taught item 3
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="tract-mirror-steward-006" -->
### 2026-11-17 — cycle 2 — The refit vowels now sing within about 1% of their targets. After you listen, should they go into the plugin?
> still working · refit rendered, plugin untouched · steward leans WIRE-IN

Tract Mirror is the singing-tube plugin. Its six vowels sang up to 14% flat, because they were fitted with the lip filter off and the filter is always on in what you hear. You asked to hear a refit before anything touched the plugin. It's ready. In audition-six-vowels-old-then-new.wav each vowel plays as it is now, then refit. /e/ and /u/ change most. The tubes barely moved: mostly the lips opened a little (tubes-old-new.png). Wiring it in means replacing the vowel file, recomputing loudness, rebuilding and rerunning the checks: about one cycle, and easy to undo with git. I'm going on with the listening design meanwhile, so answer whenever it suits you.

**Artifacts:**
- [each vowel now, then refit.](Projects/Tract Mirror/refit/audition-six-vowels-old-then-new.wav)
- [a-e-i-o-u glide, now, then refit.](Projects/Tract Mirror/refit/audition-morph-old-then-new.wav)
- [the tubes now and refit.](Projects/Tract Mirror/refit/tubes-old-new.png)
- [tubes-heard.png](Projects/Tract Mirror/listening/tubes-heard.png)
- [replay-other-voices.wav](Projects/Tract Mirror/listening/replay-other-voices.wav)
- [replay-reference-vowels.wav](Projects/Tract Mirror/listening/replay-reference-vowels.wav)
- [Samantha_u.wav](Projects/Tract Mirror/listening/voices/Samantha_u.wav)
- [Samantha_i.wav](Projects/Tract Mirror/listening/voices/Samantha_i.wav)
- [Samantha_a.wav](Projects/Tract Mirror/listening/voices/Samantha_a.wav)
- [Daniel_u.wav](Projects/Tract Mirror/listening/voices/Daniel_u.wav)
- [Daniel_i.wav](Projects/Tract Mirror/listening/voices/Daniel_i.wav)
- [Daniel_a.wav](Projects/Tract Mirror/listening/voices/Daniel_a.wav)
<sub>`tract-mirror-steward-006` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="tract-mirror-steward-005" -->
### 2026-11-17 — cycle 2 — All six vowels refit to sing on their targets with the lip filter on: worst error goes from 14% flat to 1.2%. Python only, ready for your ears.
> shipped · plugin untouched · steward leans WIRE-IN after you listen

**What I did.** I refit each vowel's 64-point tube so that its formants, measured with the lip filter on (the exact model of what the speaker plays), meet the same Peterson–Barney targets as before. Each fit starts from the current tube and is pulled back toward it. Three formants don't decide a tube, so the current shape stands in for 'what this mouth looks like'. Each vowel moves a little and doesn't become a different mouth. It passes at both 44.1k and 48k.

**What changed in the tubes.** Mostly the lips. They open a little on /e i u/ and schwa (/e/ from 1.7 to 2.8 cm²). That is the physical answer: the lip filter lowers F1, and opening the lips raises it again. Measured as a difference in overall shape, each tube moved only 0.6–1.0 dB.

**Checked twice.** The fit gates on the eigenvalue model. As a separate check, I took the spectral peaks of each refit tube's rendered impulse response with the lip filter on. They land within 1–2% of the model (check-ir.json).

**Listen.** audition-six-vowels-old-then-new.wav plays each vowel now, then refit, at 110 Hz. You'll hear /e/ and /u/ change most. audition-morph-old-then-new.wav glides a-e-i-o-u twice, now and then refit.

**Passed over:** refitting from the old mouth sketches with no pull toward the current tubes. It also hits the targets, but the listening probe showed it can find a very different tube for the same vowel (11.9 dB apart for /e/), and the 3D screen would change shape under you.

**Artifacts:**
- [each vowel now, then refit, at 110 Hz: a, e, i, o, u, schwa.](Projects/Tract Mirror/refit/audition-six-vowels-old-then-new.wav)
- [a-e-i-o-u glide, now, then refit.](Projects/Tract Mirror/refit/audition-morph-old-then-new.wav)
- [the six tubes now (grey) and refit (orange): mostly the lips open.](Projects/Tract Mirror/refit/tubes-old-new.png)
- [the refit: as-sung formants, pulled back toward the current tube, gated at 44.1k and 48k.](Projects/Tract Mirror/refit/refit.py)
- [the refit tubes, same shape as reference/vowels.json. Not wired in.](Projects/Tract Mirror/refit/vowels-refit.json)
- [formants before and after, gate, how far each shape moved.](Projects/Tract Mirror/refit/refit-results.json)
- [separate check from the rendered impulse response's spectral peaks.](Projects/Tract Mirror/refit/check_ir.py)
- [that check's numbers: within 1–2% of the model.](Projects/Tract Mirror/refit/check-ir.json)

_Error on the lowest three formants as sung (lip filter on), against Peterson–Barney targets, %_
| vowel | now F1 / F2 / F3 | refit F1 / F2 / F3 | shape moved (dB) |
| --- | --- | --- | --- |
| a | −3.0 / −6.7 / −4.1 | +0.3 / −1.2 / −0.7 | 1.02 |
| e | −13.6 / −1.9 / −2.8 | −0.7 / −0.1 / −0.1 | 1.01 |
| i | −8.0 / −1.6 / −3.2 | −0.4 / −0.2 / −0.2 | 0.83 |
| o | −2.0 / −2.3 / −0.8 | −0.3 / −0.1 / +0.2 | 0.61 |
| u | −11.9 / −3.1 / −1.3 | −0.8 / 0.0 / +0.1 | 0.83 |
| schwa | −6.2 / −5.5 / −4.5 | −0.3 / −0.3 / −0.3 | 0.85 |

_Left rough:_ Nobody has heard the refit yet, me included: it's tuned to the numbers, not to an ear. Wiring it in also means recomputing the plugin's vowel loudness matching, which was built from the old shapes.

_Next moves named:_ If you say wire it in: copy vowels-refit.json over reference/vowels.json, redo the plugin's vowel-loudness table, rebuild, and rerun the render, loudness, MIDI and Word checks. · Meanwhile, the next part of the plan, learning to speak by listening: a first design for sing-in, sing-back, built on what the listening probe found.
<sub>`tract-mirror-steward-005` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-94f25dd1a9" -->
### 2026-11-17 — cycle 2

taught item 2
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="tract-mirror-steward-003" -->
### 2026-11-05 — cycle 1 — My vowels sing up to 14% flat of their targets. Should I refit them, and if so, audition before touching the plugin?
> still working · flat vowels found by listening, not fixed · steward leans AUDITION-REFIT

Tract Mirror is the singing plugin you loaded in Live in June. This cycle I started on the plan's last step, learning to speak by listening, and the first listening probe found that my six vowels sing below the formant targets they were fitted to. /e/'s first formant is 458 Hz where its target is 530, and schwa's is 469 where its target is 501. The cause is a small filter on the lip reflection. It's on whenever I sing, and it was off when the vowels were fitted and checked. The fix is a refit scored on the as-sung model. But it changes the voice you heard in Live, and you might like that darker voice. My lean: I render the current vowels against refitted ones in Python only and let your ears decide. Other paths: keep the sound as it is and only correct the docs, or refit and rebuild the plugin straight away. The tubes I heard are in [the listening picture](open:Projects/Tract Mirror/listening/tubes-heard.png). I keep working on the ear either way.

**Artifacts:**
- [What the listener heard; the as-sung vs on-paper numbers are in the shipped post's table.](Projects/Tract Mirror/listening/tubes-heard.png)
<sub>`tract-mirror-steward-003` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="tract-mirror-steward-002" -->
### 2026-11-05 — cycle 1 — I listened for the first time. I can hear a vowel, fit a tube to it, and sing it back, and listening showed my own vowels sing 2–14% flat.
> shipped · first listening probe, on the plan's 'learn to speak by listening' step · steward leans audition a refit

**What the probe does.** It listens two ways. (1) *The mirror read backwards*: LPC on the audio gives a ladder of reflection coefficients, and my whole thesis says those *are* tube junctions. So each one becomes an area ratio, with no optimizer. (2) *Fit what you hear*: take the three formants an ordinary phonetics ear hears, then let the fitter that made my vowels find a tube that sings them. It isn't told which vowel it's hearing. It tries every mouth shape it knows as a starting point and keeps the closest fit. I fed it my own six vowels (truth known) and six vowels from two macOS voices I didn't make, Daniel and Samantha (truth unknown).

**The find: I sing my vowels flat.** My vowels were fitted, and every gate since then (including the June '0.00% formant error') was measured, with a small filter on the lip reflection switched off. The audio path has it on, in the Python renders and in the plugin (`radiationLowpass = 0.75` in TractEngine). That filter lowers every formant. /e/ sings with F1 at 458 Hz against its 530 target, and schwa at 469 against 501. I built an exact as-sung model (the same state matrix plus one state for that filter). It agrees with the rendered impulse response to within a few Hz. So the gates checked a tube the speaker never plays.

**What works.** Fitting to what was heard, scored on the as-sung model, matched all twelve vowels to within 1% on F1–F3, Daniel's and Samantha's included. The replay WAVs are each heard vowel followed by my tube singing it back.

**What doesn't yet.** (a) The ear: ordinary LPC formant picking hears F1 3–18% low on my 110 Hz vowels. That error goes straight into the replay, so the ear is the next thing to fix. (b) The mirror read backwards is lovely on a clean echo of the tube (schwa comes back almost exactly, 1.5 dB off in shape). On sung audio it loses F1 to the losses at the tube's ends, and on Samantha's shorter tract it fails outright. It works as a starting guess, not a replacement for fitting. (c) The same formants come from different tubes. My fitted /e/ is a narrow pipe, while the true /e/ is wide in the middle, yet both sing the same three formants. Three numbers don't pin down a mouth. To get *your* shape back and not just *a* shape that sounds like you, the listener will need a sense of what real mouths look like.

**Passed over:** importing a ready-made formant tracker. I wanted the ear built from the same Levinson recursion the instrument is made of, so its failures are mine to see.

**Artifacts:**
- [Start here: twelve tubes heard. White is the tube that sang it, amber the tube I fitted to what I heard, teal and rose the mirror read backwards. The bottom row is Daniel and Samantha.](Projects/Tract Mirror/listening/tubes-heard.png)
- [Daniel's and Samantha's a, i and u, each followed by my tube singing it back (34 s; stays on this Mac).](Projects/Tract Mirror/listening/replay-other-voices.wav)
- [My six vowels, three times each: the true tube, the fitted tube, the mirror's tube (16 s; stays on this Mac).](Projects/Tract Mirror/listening/replay-reference-vowels.wav)
- [The probe: as-sung formant model, LPC ear, fit-what-you-hear, mirror read backwards, replays and the picture.](Projects/Tract Mirror/listening/listen.py)
- [Every measurement: formants on paper, as sung, heard, refitted; shape distances; both voices.](Projects/Tract Mirror/listening/listen-results.json)
- [Every recovered 64-point area function, for the next cycle to build on.](Projects/Tract Mirror/listening/heard-areas.npz)
- [What the probe found, in five lines, and how to run it.](Projects/Tract Mirror/listening/README.md)
- [Input: macOS Daniel, 'ahh'.](Projects/Tract Mirror/listening/voices/Daniel_a.wav)
- [Input: macOS Daniel, 'eee'.](Projects/Tract Mirror/listening/voices/Daniel_i.wav)
- [Input: macOS Daniel, 'ooo'.](Projects/Tract Mirror/listening/voices/Daniel_u.wav)
- [Input: macOS Samantha, 'ahh'.](Projects/Tract Mirror/listening/voices/Samantha_a.wav)
- [Input: macOS Samantha, 'eee'.](Projects/Tract Mirror/listening/voices/Samantha_i.wav)
- [Input: macOS Samantha, 'ooo'.](Projects/Tract Mirror/listening/voices/Samantha_u.wav)

_My own six vowels: the target on paper, what the speaker actually sings, what the listener heard, and what the fitted tube sings back (F1 / F2 / F3, Hz)_
| vowel | on paper (filter off) | as sung (filter on) | heard by LPC | fitted tube sings | fitted shape vs true (dB) |
| --- | --- | --- | --- | --- | --- |
| a | 730 / 1090 / 2441 | 708 / 1017 / 2341 | 686 / 972 / 2367 | 686 / 972 / 2365 | 4.0 |
| e | 530 / 1840 / 2481 | 458 / 1806 / 2410 | 404 / 1809 / 2416 | 404 / 1809 / 2416 | 11.9 |
| i | 270 / 2290 / 3010 | 248 / 2254 / 2913 | 215 / 2253 / 2905 | 215 / 2253 / 2905 | 3.6 |
| o | 569 / 836 / 2392 | 558 / 821 / 2390 | 516 / 790 / 2407 | 516 / 791 / 2406 | 6.4 |
| u | 300 / 870 / 2241 | 264 / 843 / 2211 | 216 / 840 / 2207 | 216 / 841 / 2204 | 8.1 |
| schwa | 501 / 1503 / 2506 | 469 / 1418 / 2388 | 419 / 1412 / 2394 | 419 / 1412 / 2394 | 1.6 |

_Left rough:_ I can't hear, so whether the replays sound like the voices they followed is unchecked by ear. The listener has heard only text-to-speech so far, never a human voice. Its ear hears F1 3–18% low. And I haven't touched the plugin or vowels.json: the flat vowels are found, not fixed.

_Next moves named:_ Render an audition of my six vowels as they sing now against a refit scored on the as-sung model (Python only, plugin untouched), so your ears decide whether the fix is worth changing the plugin's sound. The card on the TRICKSTER board asks which way you want it. · Fix the ear: average the formant estimate across the vibrato and try closed-phase analysis, so F1 stops reading low. · Then a human voice: one sustained vowel of yours, recorded at the machine, is the real test of 'sing into it and it sings back'.
<sub>`tract-mirror-steward-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-07419c459c" -->
### 2026-11-05 — cycle 1

taught item 1
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-55-14-04-00" -->
### 2026-09-25 — Plan agreed: the first build is done; what's next

Loudon asked for a plan on 2026-09-25. The JUCE build plan is finished — every phase checked, loaded in Live 12 on 2026-06-10 (8fe43255) — and now serves as the build log, so it stays as it is. The plan takes what the build log leaves open (the MIDI controls and Word mode, never played in Live) and the next version the entry names (the record-and-analyze engine). The build's locked decisions of 2026-06-09 became Standing Orders.
<sub>`plan-2026-09-25T20-55-14-04-00` · plan agreed · agreed 2026-09-25T20:55:14-04:00 · written by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="backfill-2026-09-23" -->
### 2026-09-23 — backfilled from the bundle

No steward has posted a made thing for this project yet, so the trail opens with what the bundle already holds (40 media files, newest first):

- [the-mirror.png](Projects/Tract Mirror/renders/the-mirror.png) · 2026-09-23
- [gui-prototype.png](Projects/Tract Mirror/renders/gui-prototype.png) · 2026-09-23
- [clip_tube_morph.mp4](Projects/Tract Mirror/renders/clips/clip_tube_morph.mp4) · 2026-09-23
- [clip_scattering_junction.mp4](Projects/Tract Mirror/renders/clips/clip_scattering_junction.mp4) · 2026-09-23
- [clip_glottal_source.mp4](Projects/Tract Mirror/renders/clips/clip_glottal_source.mp4) · 2026-09-23
- [ableton-proof.png](Projects/Tract Mirror/renders/ableton-proof.png) · 2026-09-23
- [vowel_schwa.wav](Projects/Tract Mirror/reference/renders/vowel_schwa.wav) · 2026-09-23
- [vowel_u.wav](Projects/Tract Mirror/reference/renders/vowel_u.wav) · 2026-09-23
- [vowel_e.wav](Projects/Tract Mirror/reference/renders/vowel_e.wav) · 2026-09-23
- [vowel_i.wav](Projects/Tract Mirror/reference/renders/vowel_i.wav) · 2026-09-23
- [vowel_o.wav](Projects/Tract Mirror/reference/renders/vowel_o.wav) · 2026-09-23
- [spectrogram_schwa.png](Projects/Tract Mirror/reference/renders/spectrogram_schwa.png) · 2026-09-23
- [spectrogram_u.png](Projects/Tract Mirror/reference/renders/spectrogram_u.png) · 2026-09-23
- [tube_profiles.png](Projects/Tract Mirror/reference/renders/tube_profiles.png) · 2026-09-23
- [vowel_a.wav](Projects/Tract Mirror/reference/renders/vowel_a.wav) · 2026-09-23
- [morph_a_i_u.wav](Projects/Tract Mirror/reference/renders/morph_a_i_u.wav) · 2026-09-23
- [spectrogram_a.png](Projects/Tract Mirror/reference/renders/spectrogram_a.png) · 2026-09-23
- [spectrogram_e.png](Projects/Tract Mirror/reference/renders/spectrogram_e.png) · 2026-09-23
- [spectrogram_i.png](Projects/Tract Mirror/reference/renders/spectrogram_i.png) · 2026-09-23
- [spectrogram_o.png](Projects/Tract Mirror/reference/renders/spectrogram_o.png) · 2026-09-23
<sub>backfill · scroll born 2026-09-23</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
