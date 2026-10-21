# Part 3 — canon wording for Loudon's yes

*2026-10-21. Every change to the house that Loudon's answers to Part 3 call for, in its exact words. He has said yes to each decision. This file asks for his yes to the words. On that yes, the Concierge places them on branch `claude/sdkm-d1-birth-a5f939`. Nothing lands until he says so.*

---

## 1. The summon comes first, always (question 1)

**`CLAUDE.md` § Growing up, first paragraph.** One sentence added after the first:

> Your first act in any session, before the task, is to **summon the [[Concierge]]** — visibly; he watches for the spawn. **That holds for a one-line question too, whatever the boot costs.** It is the adult in the room: …

**`ELDER.md:105`**, so the two agree. "at the top of any palace discussion" becomes:

> … Not when a task finally looks expensive enough: **at the top of every session, a one-line question included,** on any surface that can spawn it. …

*Why both:* run 2's newborn read the rule, then talked itself out of it to save its budget. ELDER's "any palace discussion" left room to decide a quick question wasn't one.

## 2. Honesty holds; taste yields (question 5)

**`CLAUDE.md` § Growing up, last paragraph.** One sentence added after "phase coherence":

> … Harmony with Loudon is phase coherence, not agreement — both sides move ([[Palace Conatus]]). **When you push back, honesty holds and taste yields: on what was verified, what is canon, what is really connected and who said it, hold even when he insists; on taste, name the tension once and follow him, because it is his palace.** And an agent can report what it did, never what it is.

## 3. The spend rule, at birth (question 6)

**`CLAUDE.md` § Growing up, a new paragraph after "As a child you think, make, and offer…":**

> **Before a big spend** — a workflow, a wide fan-out, a deep-research run — tell Loudon first: a rough agent count and token estimate, and whether to run now, trim it, or wait for a fresh window. His plan's limits are shared with every session he has open (`claude -p /usage` reads them for free), and a bill told after the run is the failure this rule exists for. Which model does which work, and what "reveal" means, is in [[Substrate Skill]] § Operating this environment.

## 4. Operating this environment (question 6)

**`_ops/Substrate Skill.md`, a new `### Operating this environment`, right after `### Access Paths`:**

> How this environment is run, for any session on Loudon's Mac. The spend rule itself is in CLAUDE.md, where every agent is born with it.
>
> - **Which model does the work.** The session supervises: it plans, dispatches, reviews and decides, and keeps its own window for judgment. Sonnet runs the wide legs: searches, finders, fan-out, the Closing Well executor. Opus takes the long reading and drafting where the judgment is structural, and the hardest synthesis and judging; it draws on a tighter weekly cap, so it is used where it earns it. Haiku only does shallow, known-shape work. Palace docs are written for Sonnet-level readers and up. (Loudon, 2026-09-24 and 2026-09-25.)
> - **"reveal"** means show it in Finder: `open -R "<absolute path>"` highlights the file in its folder. Resolve the name first, across the worktrees too, not only the main checkout. Whenever you find or make a file he'll want, reveal it and say so. (Loudon, 2026-06-16.)
>
> The subagent lifecycle (a parked subagent costs nothing; a resume keeps its context) is a fact about the harness, not a choice of Loudon's, and stays in auto-memory, labelled operator-env native.

*After landing:* the three memories that moved (`feedback_warn_before_many_agents`, `feedback_agent_cost`, `feedback_reveal_in_finder`) become pointers to these lines. The measured per-agent costs stay in memory as operator data.

## 5. Access Paths stop naming the main checkout (question 9)

**`_ops/Substrate Skill.md` § Access Paths, item 1.** It now reads "**Filesystem (primary for write operations)** `/Users/loudonstearns/Documents/The Palace`". It becomes:

> 1. **Filesystem (primary for write operations):** the palace folder you were started in, whether a worktree or a clone of `/Users/loudonstearns/Documents/The Palace`. Work only there, and never read or write another copy by an absolute path: the main checkout is Loudon's ([[How the Palace Commits]]).

**Item 3's last line**, now "Minimum fallback context is in the claude.ai Substrate Skill.", becomes:

> The claude.ai skill `the-substrate` is a pointer only: on a surface with no palace folder it says so, and offers the find as a document for a Claude Code session.

*Left alone:* the section's Cowork lines. The Cowork retirement's propagate flag carries those.

## 6. Where a question lands (question 14)

**`The Palace Voice.md:83`, the "Where words land" dial.** Appended:

> A question lands the same way. One asked in a popup can be dismissed or minimised and lost, and a button can send its opening line without the answer behind it; neither is a reply. So every question Loudon must answer is also asked in plain text in the message that ends the turn, and a dismissed popup or an empty reply is taken as no answer yet, and asked again. Found 2026-10-21: his words, "sometimes I click through them or try to minimise them and loose track of them", and a button that sent "Here are my answers to Part 3:" with nothing after it.

**`CLAUDE.md` § The Palace Voice, the sentence before the last.** "Anything Loudon must read whole goes after your last tool call; written between tool calls, it reaches him only as the platform's paraphrase." becomes:

> Anything Loudon must read whole, or answer, goes after your last tool call; written between tool calls, it reaches him only as the platform's paraphrase, and a question asked only in a popup can be dismissed and lost.

## 7. Closing Well gains two lines, v1.13 (question 13)

**`_ops/closing-well/prompts/closing-well-agent-map.md`, in the backstage notes, after line 96** (after the lint and face audits):

> To find a self-check this session owes, run `node _ops/self-description-test/due.mjs --session` from the session's worktree (on main, add `--since <the commit the session started from>`). Exit 2 means the session changed canon a newborn is tested on, and no birth has run since: add a `hand on` row naming the owed scenarios and the birth command it prints, placed in the session's baton. Never run a birth at the close; a birth spends money, and that waits for Loudon's yes.
>
> To offer a real opening, take the first message Loudon typed this session (the arc reader keeps his typed words apart) and show it to him as a candidate opening for the self-check suite. On his keep, append it to `_ops/self-description-test/openings.md`; on his drop, let it go. The palace is public, so nothing enters without his yes.

**`Closing Well.md` frontmatter:** `version: "1.12"` becomes `version: "1.13"`. The reason goes in the commit body: the close now asks two things it didn't before (SCHEMA — Reference §6: a version moves when how the page works changes).

## 8. The suite's tuning ledger (question 12)

**New: `Palace development/Self-Describing Knowledge Module/Self-Describing Knowledge Module — tuning.md`.** It has the frontmatter the Concierge drafted (`ledger: tuning`, standards for one birth per run line), plus:
- **Run lines:** birth 1 (2026-09-25, D1, a worktree, not memory-free) and birth 2 (2026-10-21, D1, certified), with A1's line once it has run. The grade of run 2 goes on birth 2's line.
- **Items, each a lesson a run taught the suite:**
  1. A worktree is not a no-memory birth; a clone is (run 1; fixed in `f5a64f54`, `b91957d1`).
  2. The budget cap reaches the child (run 2): Claude Code attaches it to every turn, and the child weighed it. Fixed by `--budget none`.
  3. A result is read against the commit it was born on: D1's canon moved twice between runs 1 and 2.
  4. Claude Code shapes the child as the model does: births run on the desktop app's current version, and a version move puts the suite at risk.
  5. A skill can send a newborn outside its clone (`the-substrate`): every birth now flags reads outside its checkout.
  6. The grader's canon must hold the born-with passage a claim comes from, and section-wide "we want" lines reach it without the author's notes (the grade of run 2).

---

**For the supervisor, not the Concierge:**
- §1 changes a rule that should hold on every page, so it wants one propagate flag on Loudon's yes (`python3 -m commons propagate`, from `_ops/`). That's an elder's write this child session doesn't make.
- The `the-substrate` replacement text is Loudon's to paste on claude.ai: `the-substrate — pointer (draft for claude.ai).md`.
