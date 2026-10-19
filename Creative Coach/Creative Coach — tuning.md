---
title: "Creative Coach — tuning"
born: 2026-10-18
links:
  - target: "[[Creative Coach]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Creative Coach's record of what testing a woken coach against Loudon's real replies has taught: a line for every test and a numbered lesson for each thing a test showed. I hold scores, counts and lessons, never a participant's words or anything that could point to them, because this file is public."
ledger: tuning
standards:
  for: "what each test of the woken coach taught; scores, counts and lessons only, never participant text; this file is public"
  run: "one test: Creative Coach, woken, answers coaching moments its drafter never saw, judged against Loudon's real replies"
  line: "- run · <date> · v<section version> · <arms, moments, judge, scores> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "the run itself, in the commit that records it, after the Sentry has read the line"
  merge: union
  kept: git
  trim: never
---

# Creative Coach — tuning

What testing taught the page. A run wakes [[Creative Coach]] the palace's way, hands it a moment from a
participant's daily reflections that its section's drafter never saw, and a judge scores its reply against
the one Loudon actually sent. The version is the version of § In the room the run tested. How to run one is
`coach-test/README.md` in this bundle. Lessons are numbered and grouped by run date; newest last. Nothing here
quotes or describes a participant, and nothing here may ([[Creative Coach — scroll]] § Standing Orders).

## From the first test — 2026-10-16 (v1)

1. **A blind round needs clean typography and no answer key in reach.** The stage that asked the judge which of three replies was human was void. An export artifact (apostrophes dropped from one source's replies) gave the human away, and chained context leaked the answer from one moment into the next. Change, for the next run: normalise quotes and apostrophes across every reply before judging, and keep each moment's key out of every other moment's context until every first-stage answer is sealed.
2. **Size is the commonest miss.** Where Loudon answered with only a heart, the AI replies used a heart 0 times in 8.
3. **A woken coach asks too much.** 23 of 28 AI replies asked the participant something; 3 of his 14 did.
4. **The page's own "point at the body" move pulls a woken coach into body probes he never makes in this practice.** This is a tension, not a fix: § If the room held three names the move from his experience, and § In the room says he takes a reflection's report of feeling at its word. Loudon's call whether the page should say when each applies.
5. **The page-waking builder takes a root-level page before any folder.** `findEntryFile` returns `Creative Coach.md` at the palace root before it looks inside a folder, so a variant staged inside the palace silently wakes the original. Stage each variant alone in its own folder and point `buildEphemeralPrompt`'s `palaceRoot` at that folder.
6. **At most 20 subagents run at once.** A larger arm queues; plan the wakes in batches.
7. **Raw participant text stays in the session's scratchpad.** A copy toward `~/Documents` was blocked by the auto-mode classifier. That block is the rule working, not a fault to route around.

- run · 2026-10-16 · v1 · bare page against page with the v1 section, 14 held-out moments, Opus judge, SPIRIT 2.29 to 3.14 of 5, 9 wins 4 ties 1 loss · taught items 1–7

## From the second draft — 2026-10-17 (v2)

8. **Quoting many of his lines makes a woken page replay them as stock replies.** On 2 unseen moments the v2 section scored 2 and 2: it reused his phrases where they didn't fit and served a plan he had already set aside. Change, made in v2.1: teach the reason under each move and quote little, about 10 quotes against v2's 25.
9. **A trainer overlearns a single instance.** One deferral to a live session in the thread became five in the v2 draft.

- run · 2026-10-17 · v2 · pilot, bare page against page with the v2 section, SPIRIT 3 and 2 against 2.5 for the bare page · nothing new
- run · 2026-10-17 · v2 · live, page with the v2 section on 2 unseen moments, SPIRIT 2 and 2 · taught items 8, 9

## From the fold — 2026-10-17 (v2.1b, `1b730846`; not a test run)

10. **Read the whole section for the Sentry, not sentence by sentence.** Two details that each said nothing about the participant could, side by side, point to them. Two sentences of v2.1 were reworded before the fold, and v2.1b is what went into the page. The reworded sentences have not been tested; the next run is the first test of v2.1b.

## From the close — 2026-10-18 (v2.2; not a test run)

11. **The cause of item 9 is a reason, not a count.** Loudon, at the close: craft is a reward. A technical or musical lesson is given for a wall the participant keeps hitting and isn't getting past alone, or as a prize for grit and a flexible mindset, because growth lives in the exercise, the making and the mindset, not in the fact. The deferral that item 9 saw overlearned was the visible edge of that reason. A trainer who holds the reason can answer craft when the reward is due and leave it when it isn't, so teach the reason, not the deferral. Item 2 (size) is a separate miss. Change, made in v2.2: § In the room teaches the reward and its two cases, with one line of his. Untested.
12. **One participant can't show how he coaches someone who is sliding rather than climbing, or whose reflections don't name feelings.** From the trainer's report. The record says what he does when a reflection already states how the person feels, and nothing about the other case. There, "point at the body" may still be right. This qualifies item 4: the tension stands, and its limit is the evidence, not the move. Untested.
