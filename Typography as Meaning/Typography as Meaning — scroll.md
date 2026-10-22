---
title: "Typography as Meaning — scroll"
born: 2026-10-22
links:
  - target: "[[Typography as Meaning]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Typography as Meaning's scroll: the page that opens on where the lettering grammar stands, then reads down through everything made to test it, newest first, so whoever arrives can climb from one balloon to a whole conversation without redoing the climb. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are his; my trail only grows."
---

# Typography as Meaning — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[Typography as Meaning]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

_Not generated yet. This zone belongs to the machine and fills itself in the first time anyone looks._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where the work is going:** from one balloon, a word with a face, to a whole conversation whose balloons know where the others are, so that a many-voice frame reads as clearly as one voice does.

**Done:** the ladder. Six frames climb the conversation rules one at a time, two or three balloons each, with a computed checker ([conversation ladder](Typography as Meaning/proofs/2026-10-22-daily-page/conversation-ladder.html)). Its balloon bodies are placed by hand; the tails, joins, trails and checks are computed.

**The moves ahead:**
1. **A solver that places the balloons itself.** It uses Comic Chat's method: bodies placed greedily in reading order, a routing channel kept free for every earlier tail, tails routed last. It passes every check on the ladder, and it is creative rather than only legal. Not started.
2. **The summit: the many-voice frame.** The nine-beat frame in [whos-talking.html](Typography as Meaning/proofs/2026-10-22-daily-page/whos-talking.html), part III, laid out by the solver so it reads. Today it is a mess of crossing tails.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this page. Never regenerated; it holds until he revokes it._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="plan-2026-10-22" -->
### 2026-10-22 — The plan agreed: solver next, the many-voice frame as the summit

On the Daily Page, Loudon approved the page's new Forward Vectors and the tuned forward vector ("And yes, tune the vector"). That became the first Plan above: the ladder is done, a solver that places the balloons is next, and the nine-beat frame is the summit. There was no earlier plan; until today the work leaned on the forward vector alone.

<sub>Daily Page, 2026-10-22 · plan set, from none</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-22-next-rung" -->
### 2026-10-22 — The next rung, not built

The ladder's balloon bodies are still placed by hand. The next rung is a solver that places them itself, Comic Chat's routing-channel way, passes the ladder's checks, and is creative rather than merely legal. Then it climbs back toward the many-voice frame. Loudon: "No time to build the next part." No baton was written: the rung is carried by the Plan above and the page's Forward Vectors.

<sub>Daily Page, 2026-10-22 · not started</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-22-ladder" -->
### 2026-10-22 — The conversation ladder: one rule per frame, with a checker

Six frames, two or three texts each, one rule per frame:
1. Who speaks first sits highest.
2. Flop the panel when the right-hand speaker starts.
3. A pause is a second balloon.
4. An interruption butts in.
5. Said and thought.
6. Depth, an off-panel voice and a whisper.

Each frame shows its fix beside its mistake, and a computed checker runs under both. It checks for:
- crossing tails;
- a tail running through another balloon;
- covered faces;
- a balloon blocking the sightline between two people;
- reading order;
- a thought trailing to the mouth.

Every fix passes, and every mistake fails on its own rule, with one exception: the pause frame. The one-breath version breaks no rule, so a checker cannot see a beat.

**The checker's own bug.** At first it tested only the drawn half of each tail, so two tails aimed across each other could pass. It was fixed to test the full invisible aiming line to the mouth. The bug was exposed by the checker itself.

Balloon positions are placed by hand; the tails, joins, trails and checks are computed. Loudon, on the ladder: "This all works great!"

**Artifacts:**
- [conversation-ladder.html: six frames, fix beside mistake, with the checker](Typography as Meaning/proofs/2026-10-22-daily-page/conversation-ladder.html)

<sub>Daily Page, 2026-10-22 · self-contained HTML, fonts embedded · verified by headless render and DOM checks</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-22-research" -->
### 2026-10-22 — The research: how letterers place a conversation

After the nine-beat frame failed, the morning went to sources before making more:
- **Time runs down the panel.** Balloons read top to bottom, and left to right only at equal height. So equal height is a coin flip, and a reply never sits above the line it answers ([Kurlander, Skelly & Salesin, "Comic Chat", SIGGRAPH 1996](https://grail.cs.washington.edu/wp-content/uploads/2015/08/comics.pdf); [C. Merritt Houghton](https://cmerritthoughton.substack.com/p/art-does-your-comic-sound-odd-a-diagnostic)).
- **The first speaker stands on the left**; when the art disagrees, flop the panel ([Todd Klein](https://kleinletters.com/BalloonPlacement.html)).
- **Tails never cross.** If they must, the balloons are in the wrong place (Klein; [Evan Waterman](https://evanjwaterman.com/guide/lettering/general-tips/)).
- **A tail aims along an invisible line to the mouth and stops about halfway.** Short is intimate; long is distance or shouting ([Blambot](https://blambot.com/articles_grammar.shtml); Waterman).
- **Joins and butts.** One speaker's balloons join along one arc, and a second balloon adds a beat ([Balloon Tales](https://balloontales.com/creating-tails-and-joins/)). Butted balloons are an interruption, with a double dash.
- **Keep clear of the people.** Balloons stay off faces and out of the line of sight between two people. A thought trail points to the head, not the mouth (Blambot). Loudon caught that last one himself in the sit.

**The method that makes balloons aware of each other** is Comic Chat's. It places the balloon bodies greedily in reading order, keeping a routing channel free for every earlier balloon's tail, and routes the tails last. In the paper's words, the algorithm "defers placing the tails until all the bodies have been placed"; the authors had "originally tried using a greedy algorithm for tail placement, with poor results."

<sub>Daily Page, 2026-10-22 · Comic Chat (§5.2) and Klein read in the source; Merritt Houghton, Waterman, Blambot and Balloon Tales cited as reported, not fetched</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-22-whos-talking" -->
### 2026-10-22 — Who's talking? The grammar run backwards, then the nine-beat frame

The page claims that once you answer who, where and to whom, the form is chosen for you. If that holds, it should also run backwards: the four answers should be readable off the form alone.

**I · The read.** The word "stay" is lettered six ways. Loudon guesses who is speaking, inside or outside the story, to whom, and the feeling, from the form alone, and each axis keeps a tally.

**II · The machine.** The same rules run forwards: set the four answers and the lettering follows. The grammar is written as a function, after the [[BLUELINE — Text Layer]] lettering.

**III · The conversation.** One frame holds a whole exchange in nine beats: narrator, two speakers, a whisper, two thoughts, a radio.

**What it found:**
- **The margin did half its job.** Loudon first read panel 4, a narrator caption in the top margin, as having "no text". He never took the word for part of the story, but he looked straight past it. A quiet margin caption is easy to miss. That is a real case for the page's "find the limits".
- **The axes collide.** When a radio speaks with menace, the source rule overrides the emotion rule. The function needs a precedence order, and source outranks emotion.
- **The nine-beat frame failed, and the failure became the map.** Loudon called it "a mess… not possible to read, all the tails overlapping, no creativity in placement… this reveals where our work needs to be done". One balloon is a word with a face; a conversation is a layout problem in which every balloon must know where the others are. He asked to build up to it, two or three bits of text at a time. That turned the morning toward research first, then the ladder.

**Artifacts:**
- [whos-talking.html: the blind read, the machine, the nine-beat frame](Typography as Meaning/proofs/2026-10-22-daily-page/whos-talking.html)

<sub>Daily Page, 2026-10-22 · self-contained HTML except two interface fonts loaded from Google Fonts; the balloon fonts are embedded</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-22-deal" -->
### 2026-10-22 — Dealt on the Daily Page; verdict: tune

The shuffle dealt this page for the morning sit. It was read with its siblings, [[BLUELINE — Text Layer]] and [[Graphic Storytelling]], and woken. The woken page asked for the same piece the prep had already built, a blind who's-speaking read, and for a second test at [[Loudon Live]]. The verdict was **tune**. The page gained a section on the conversation, from one balloon to many, with the rules and Comic Chat's method, cited. It also gained the two findings from the blind read, a new forward bullet for the solver and the many-voice frame, and a forward vector that reaches from one voice's face to a whole conversation. Nothing moved to a sibling: this page holds the general grammar, and BLUELINE is paused.

<sub>Daily Page, 2026-10-22 · tune</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
