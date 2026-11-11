---
title: Reverb Design
type: project
pillars:
  - tools
  - creation
born: 2026-11
stage: growing
status: active
confidence: working
links:
  - target: "[[Biomechanical Synthesis]]"
    type: emerged-from
    label: the-dish-asked-how
  - target: "[[Mycelial Reverb]]"
    type: connects-to
    label: hook
  - target: "[[Compressor Design]]"
    type: connects-to
    label: sibling-teaching-page
  - target: "[[Reverb ↔ Space-Time]]"
    type: connects-to
    label: delay-is-distance
  - target: "[[Waveguide Synthesizer]]"
    type: connects-to
    label: one-comb-is-a-string
  - target: "[[DSP in Looping Dimensions]]"
    type: exemplifies
    label: several-loops-at-once
forward_vector: "I want to teach a reader who has just grown a reverb to build one: every claim here something they can knock on, and the famous designs (Schroeder, Freeverb, the plate) rebuilt as pieces out of the two already here. I lean toward a knot tied inside a thread."
---

# Reverb Design

A reverb is a machine for turning one sound into thousands of quieter, later copies of itself, arranged so the ear stops hearing copies and starts hearing a room. This page starts from a reverb you can grow, the dish made for [[Biomechanical Synthesis]], which is becoming an instrument of its own, [[Mycelial Reverb]], and ends at being able to read any reverb's block diagram. It is the sibling of [[Compressor Design]]: the same wager, that a process you have built by hand is one you can hear.

It began with a question. After playing the dish, Loudon asked: "how are reverbs designed, how do all pass filters and delays function in here, what are the most used reverb algorithms, the reverb we designed in the petri dish, how would that be described as an algorithm and as a network of delays and all pass filters?" The short answers: the dish is a waveguide network, which is a feedback delay network whose matrix is the colony's wiring; it has delays and no allpass filters at all; and the place an allpass would go is the first fifth of a second.

## Start from hearing

Clap in a room and three things happen in order. First the clap itself. Then a handful of separate echoes off the nearest walls, far enough apart that the ear can almost count them, and these tell you how big the room is ([[Reverb ↔ Space-Time]] is the page on that: delay is distance). Then the echoes of echoes arrive faster than you can separate them and fuse into a wash that dies away.

So a reverb has three things to get right, and every design on this page is a different bargain between them:

- **How soon it becomes a wash.** In a real room the echoes thicken quickly. A cheap reverb that stays countable for too long sounds like a flutter, or like something metallic.
- **How long it rings.** The usual number is RT60, the time for the tail to fall by 60 dB.
- **What colour it is, and how the colour changes.** Real rooms lose their highs first. A reverb whose tail keeps one pitch ringing sounds like a pipe.

Hold those three against everything below.

## One thread is a comb

Take one delay and feed its output back into its input, turned down. A sound goes in, comes out a little later, goes round again quieter, and again. In the dish this is one thread with two ends (its panel "1 · one thread" plays it):

`y(t) = x(t) + a · y(t − T)`

What you hear now is the sound, plus what you heard one trip ago (T), made smaller (a). In the dish, T is the trip down the thread and back, and a is what the two ends and the way there and back leave.

Two things follow from that one line. The echoes are evenly spaced and all the same shape, so you can count every one. And the loop favours pitches that fit a whole number of times into T and fights the ones that fall halfway between: drawn against pitch its response has evenly spaced teeth, which is why engineers call it a **comb filter**. Shorten the delay under about 25 ms and the echoes stop being a rhythm and become a note; that is a plucked string, and [[Waveguide Synthesizer]] builds instruments out of exactly this loop. The ring buffer at the heart of [[Compressor Design]] is the same memory, read once and not fed back.

A comb gives you the second of the three things, a tail whose length you set with a. It fails the first (it never becomes a wash) and the third (it rings at its teeth). Every reverb design is a way round those two failures.

## The knot the dish lacks

The dish's own numbers show what is missing. Its check found that a grown colony's echoes take about 200 ms to blur into a wash, and that growing it further barely moves that moment.

The classic fix is the **allpass filter**, published by Schroeder and Logan in 1961. It is a comb with one extra path:

`y(t) = −g · x(t) + x(t − D) + g · y(t − D)`

A little of the sound comes straight through upside down (−g), most of it comes out one trip round the loop later (D), and the rest keeps going round, smaller each time. The upside-down part is sized so that it exactly fills in the comb's teeth: every pitch comes out as loud as it went in. That is the name. An allpass passes all frequencies equally and only smears them in time. One click in, a little cloud of clicks out, no colour added and nothing lost.

So a comb makes a tail and colours it; an allpass makes no tail of its own and thickens whatever passes through. In the rich face, the piece *tie a knot* lets you tie allpasses into the thread the knock comes in on, first alone, then in front of one thread, then in front of a grown colony. On twelve colonies of 170 threads, at the dish's house settings, the wash arrived at a median 175 ms with no knots and 55 ms with four, sooner in all twelve, and the tail stayed the same length (2.30 s against 2.28 s). The four knots there are this page's own numbers, not a published design.

## The dish as an algorithm

Here is the dish with the fungus taken away. Forty-eight thousand times a second it does this:

1. **Every thread delivers.** A thread is two delay lines, one each way. Each hands over the sample that entered it L samples ago, dulled a little (a one-pole lowpass, the "wet soil") and turned down a little, by an amount that grows with the thread's length. That last rule is what makes "how far a pulse carries" a time in seconds: every line loses 60 dB over the same travel time, however the colony is wired.
2. **Every dead end reflects.** What arrives at a tip goes back down the same thread, times 0.8.
3. **Every junction shares.** Where threads meet, add up what arrives, each weighted by the thread's thickness; send each thread twice its share of that sum, less what it brought. Nothing is made and nothing is lost there. The knock, if there is one, is added at the junction you clicked.
4. **You listen at the spore and the fruiting bodies**, to the sum of what arrives.

Between blocks of sound the colony grows, which changes the wiring, and that is all growing is to the sound.

As a **network of delays**: a colony of M threads is 2M delay lines and one square table of numbers, 2M by 2M, saying how much of each line's output goes into each line's input. That shape, delay lines fed back through a matrix, is a **feedback delay network**, an FDN. Step 3 above is a Householder reflection (with its sign flipped), the matrix Jot proposed for FDNs. The dish's matrix is nearly all zeros: sorted so that the lines arriving at one junction sit together, it is a row of small squares down the diagonal, one per junction, and a lone 0.8 for every dead end. A full dish is 340 delay lines, and under one percent of its matrix is not zero.

The newborn dish, one spore and three dead-end threads, folds to three delay lines and the matrix ⅓·[−1 2 2; 2 −1 2; 2 2 −1]: a small textbook FDN, before it has grown anything. Rocchesso and Smith showed in 1997 that an FDN with a lossless matrix is the same thing as a waveguide network with one junction; the piece *the colony is a matrix* lets you hear it, by knocking on the dish, on the textbook network built from its wiring, and on one minus the other. The check finds the two agree to −134 dB or better under the loudest sample, for the spore, for stars of three to eight threads, and for twelve grown colonies at three sizes and after a frost.

The difference between the dish and a textbook FDN is that sparseness. In the textbook every line feeds every other on every trip, so echoes multiply at once. In a colony a line feeds only the two to five lines it touches, and a pulse has to walk the network to spread. That is why the dish takes a fifth of a second to blur, and why growing it does not help: more threads make it bigger, not better mixed.

**And as a network of allpass filters:** it has none. There are three places they could go.

- **In front**, on the thread the knock comes in on. This is what the knot piece builds and what the 175-to-55 ms figure measures.
- **Behind**, at the fruiting bodies. For a colony that is holding still this should sound the same as in front, since a fixed chain of filters gives the same result in either order. Reasoned, not run.
- **Inside the threads**: a knot in a hypha. Then a pulse meets the knot again on every trip round a loop, and the thickening compounds. Because an allpass loses nothing, the argument that the dish cannot blow up should survive it. This is the idea behind the plate below. Not built, not checked.

## The reverbs everyone uses

There are four families worth knowing by name. This section is prose only for now; nothing in it is playable yet.

**Schroeder (1962).** Several combs side by side, each a different length so their teeth and their echoes interleave, summed, then a few allpasses in a row to thicken the result. Combs for the tail, allpasses for the wash: the two halves of this page, bolted together.

**Freeverb.** The Schroeder plan that most people have actually heard, because its code was given away and went everywhere: eight combs in parallel, each with a lowpass in its loop so the highs die first, then four allpasses in series. By "Jezar at Dreampoint".

**The feedback delay network.** Gerzon first proposed feeding a set of delays back through a matrix; Stautner and Puckette published a four-line version with the conditions for it to stay stable; Jot gave a design method and the Householder matrix. Instead of combs that never talk to each other, every delay feeds every other, so the echoes multiply inside the loop and the tail is dense from early on. The dish is one of these with a sparse matrix.

**The allpass loop: Dattorro's plate (1997).** A few allpasses in front as diffusers, then a "tank": a figure-of-eight loop made of allpasses and delays, with lowpasses for damping, tapped at many points for the output. Allpasses inside the feedback loop are the third option in the list above.

J. O. Smith's 1985 paper proposed building reverbs from closed networks of waveguides, which is the family the dish belongs to by construction.

## Reading a block diagram

A reverb diagram uses four shapes, and the dish has all four.

- **A box marked z⁻ᴺ or with a time** is a delay: a thread. The number is how long.
- **A triangle or a circle with ×** is a gain: the tip that keeps a fifth, the loss along a thread.
- **A circle with +** is a sum: a junction.
- **A big square with a letter**, usually A or Q, is a matrix: many gains and sums drawn as one thing. The dish's junctions, all at once.

Then read it in this order. Find every arrow that goes backwards: each is a loop, and loops are where the tail lives. Go round each loop multiplying the gains: under one, or it never stops. Look for what sets the three things from the top of this page. Delay lengths and loop gains set how long it rings. A lowpass inside a loop is the colour changing over time. And an allpass, drawn as a delay with one arrow forward over it and one back, is thickening: in front of the loops it is a diffuser, inside them it is a tank.

[[DSP in Looping Dimensions]] carries this further: each loop is a dimension you travel round, and a reverb is several of them at once.

## What is checked and what is not

**Run on this page's own code** (`Reverb Design — rich — check.mjs`, output in the workshop, 2026-11-10): the allpass arithmetic; that one to four knots return the energy they are given and pass 64 pitches at the level they came in; that one thread does colour (7.4 dB between a tooth and a gap, as its loop gain predicts); the 175 ms and 55 ms medians on twelve colonies; the spore's matrix; that the star's matrix loses nothing; the −134 dB agreement between the dish and the network built from its wiring; the 340 lines and under one percent.

**Checked on the web, 2026-11-10:**
- Schroeder and Logan, "'Colorless' Artificial Reverberation", J. Audio Eng. Soc. 9:192–197, July 1961: the allpass. Schroeder, "Natural Sounding Artificial Reverberation", J. Audio Eng. Soc. 10(3):219–223, 1962: combs with allpasses.
- Smith, "A New Approach to Digital Reverberation Using Closed Waveguide Networks", Proc. International Computer Music Conference, 1985, pp. 47–53 (CCRMA report STAN-M-31).
- Rocchesso and Smith, "Circulant and Elliptic Feedback Delay Networks for Artificial Reverberation", IEEE Trans. Speech and Audio Processing 5(1):51–63, 1997: an FDN with an orthogonal matrix is a waveguide network with one junction and reflectively terminated branches.
- Smith, *Physical Audio Signal Processing*, online book, ccrma.stanford.edu/~jos/pasp/: Gerzon, Stautner and Puckette, Jot and the Householder matrix; Freeverb as eight parallel filtered combs and four series allpasses, by "Jezar at Dreampoint".
- Dattorro, "Effect Design, Part 1", J. Audio Eng. Soc. 45(9):660–684, 1997: the allpass-loop plate.

**Not checked, said from memory or by reasoning:** how many combs and allpasses Schroeder's 1962 design used (left out for that reason); that Freeverb "went everywhere"; that the length-proportional loss is how FDN decay time is usually set; the under-25 ms figure for echoes becoming a note (the dish's piece states it; no source here); that allpasses behind the dish would sound the same as in front; that knots inside the threads would keep the dish stable. Dattorro's plate is often credited to an earlier design by Griesinger; no source was found for that today, so the page does not say it. The "wash" moment is the dish's own measure, which its check attributes to Abel and Huang, 2006; that paper was not read. And no agent has heard any of it.

## Where this goes

The next playable things, in the order they would teach: Schroeder's plan built from the two pieces already here (combs side by side, then knots), with Freeverb's numbers as a preset once they are read from its source; knots inside the threads of a dish, which is both the untested stability claim and the road to the plate; and a diagram reader, where a published block diagram and the dish are the same picture drawn twice.
