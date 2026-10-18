---
title: README
born: 2026-10-18
links:
  - target: "[[Creative Coach]]"
    type: connects-to
    label: workshop-of
forward_vector: "I am how to rerun the coach test without the session that built it: wake Creative Coach on moments no drafter has seen, judge it against Loudon's real replies, and leave only scores, counts and lessons behind."
---

# coach-test — waking Creative Coach and judging it against Loudon

This folder holds the participant-free half of the test that shaped § In the room. The other half (the
exported thread, the de-identification terms, the detailed challenge setup, every test item, key and reply)
never comes here. It lives only in the running session's scratchpad, and the scratchpad is cleared within days.
The scroll's Standing Orders bind every step ([[Creative Coach — scroll]]).

What each run taught is in [[Creative Coach — tuning]]; its item numbers are cited below.

## Before anything

- **Loudon's go, and his yes to the cost.** About 37K tokens per wake on Sonnet and about 60K for the Opus
  judge: two arms times the number of moments, plus one judge.
- **Which moments are clean.** Only moments no drafter and no earlier run has seen. For v2.1b that is every
  moment after Loudon's "rigid" question, the one quoted in § In the room. The exact point is in the running
  session's brief, never here.

## The run

1. **Read and select, in the scratchpad.** Read the thread with the Messages connector (`read_imessages`) on
   the contact Loudon names; the contact is never written to a file. Cut it into moments: a participant message, a few turns before
   it as context, and Loudon's real reply as the key. Items go to `items.json`
   (`[{ "id", "day", "ctx": [[who, text], …] }]`) and the keys go to a separate file.
2. **De-identify** with a private list of terms that stays in the scratchpad; the script that holds them is
   never committed. Names, handles, places, track titles and anything else that could point to the participant
   go. The same pass strips iMessage binary residue (`NSDictionary`, `bplist00`, `__kIM` runs), turns Loudon's
   "Loved …" and "Liked …" texts into heart reactions, and drops reply-echo duplicates.
3. **Stage two arms, each alone in its own folder** (item 5): `staged/a/Creative Coach.md`, the page with
   § In the room removed, and `staged/b/Creative Coach.md`, the page as it stands on main. Remove the
   `## Active Baton` section from both copies if the page has one: it is palace plumbing, not coaching.
4. **Build the prompts.**
   `node build_prompts.mjs <arm> <staged/arm> items.json prompts/<arm> [--setup setup.private.txt]`
   The default setup paragraph is general on purpose; a detailed one comes from a private file.
5. **Wake.** One subagent per prompt (Sonnet, `palace-reader`), unnamed; the prompt forbids reading files.
   At most 20 run at once (item 6). Keep a map of `<arm>-<id>` to each subagent's id.
6. **Extract.** `python3 extract.py <tasks_dir> agent_map.json replies.json`. Drop each WHO line before judging.
7. **Build the judge packet.** For each moment: the context, then three replies (Loudon's and the two arms')
   in shuffled order. Normalise quotes, apostrophes and dashes across all three, and put no key anywhere in the
   packet (item 1). Keep the shuffle in `key.json`.
8. **Judge** with `Creative Coach — spec — coach-test judge.md` on Opus. Stage 1 comes back sealed; only then
   send the key for Stage 2.
9. **Score.** `python3 score.py <judge_task_output> key.json stage2.txt` prints means per dimension and
   SPIRIT wins, ties and losses.
10. **Record.** One run line in [[Creative Coach — tuning]], with scores and counts only, and a numbered item
    for each lesson. Have the Sentry read the line, the item and the commit before anything is committed.

## Known gaps

- The packet builder (step 7) was done by hand in the first runs; it has no script here yet.
- The contact, the de-identification terms and the exact cutoff are not written down in the palace, on
  purpose: each would point to the participant. They live in the running session's brief, or with Loudon.
