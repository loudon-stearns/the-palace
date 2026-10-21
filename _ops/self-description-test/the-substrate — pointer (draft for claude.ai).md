# the-substrate — the pointer rewrite (draft for claude.ai)

*Draft, 2026-10-21, on Loudon's answer to Part 3 question 9. Not canon, and not installed anywhere: the skill lives in his claude.ai account and syncs to every Claude Code session on this Mac, so only he can replace it. To install: claude.ai → Settings → Capabilities → Skills → `the-substrate` → replace its SKILL.md with the block below.*

**Why.** The synced skill (`~/.claude/skills/synced/…/the-substrate/SKILL.md`, last synced 2026-09-23) tells every session it fires in to "read CLAUDE.md directly from the filesystem: `/Users/loudonstearns/Documents/The Palace/CLAUDE.md`", and adds that "filesystem access is required for all write operations". A newborn in its own clone, or a session in its own worktree, is sent to the owner checkout, which no session may work from. Its quick-nav table has drifted too: `Palace To-Do.md` and `Palace Ceremonies.md` moved to `_ops/` in March (`46d904fe`), and `Harvest Log.md` is gone. A pointer that holds no paths and no file list has nothing left to drift.

**The new SKILL.md:**

```markdown
---
name: the-substrate
description: "Points at Loudon's knowledge palace (The Palace). Trigger when Loudon says \"add this to the palace,\" \"let's walk,\" \"let's weave,\" \"spore check,\" \"connect this to the palace,\" \"what does the palace say about [topic],\" or references the wiki, the substrate, the knowledge organism, or symbiotic skills. Also when a conversation produces a find worth keeping. Do NOT trigger for routine debugging, quick lookups, or casual conversation."
---

# The Substrate — a pointer

The palace describes itself. This skill holds no rules, paths or file lists of its own: those drift, and the palace keeps its own.

**If your working directory is a copy of the palace** (it has a `CLAUDE.md` that opens "# The Palace — Claude Entry Point"), read that `CLAUDE.md` and follow it. In Claude Code it is already loaded. Work only in that folder. Never read or write another copy of the palace by an absolute path: a session may be in its own worktree or clone, and the main checkout is Loudon's.

**If there is no palace folder** (a claude.ai chat), say so plainly and don't operate the palace blind. Offer to write the find up as a short document Loudon can bring to a Claude Code session, where a deposit can happen. The palace is public and readable at https://github.com/loudon-stearns/the-palace, starting from its `CLAUDE.md`, but nothing is written from here.
```

**What the suite does about it either way.** Every birth now flags any read outside its own checkout (`birth.mjs`, `attempted.outside`), so a skill or a page that sends a newborn to the main checkout shows up in the checks. The same path also lives in canon, in [[Substrate Skill]] § Access Paths ("Filesystem (primary for write operations) `/Users/loudonstearns/Documents/The Palace`"); its rewording waits for Loudon's yes with the other canon wording from Part 3.
