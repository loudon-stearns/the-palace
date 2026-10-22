---
name: daily-page
description: Each morning, deal one random palace page and prepare it for Loudon's coffee sit, as the palace's Daily Page ceremony says.
---

This is the Daily Page: Loudon's morning sit with one palace page. He will join you over coffee. Until he does, you are preparing alone, and he is not there to answer questions.

The palace is /Users/loudonstearns/Documents/The Palace. You may have woken in a worktree of it, a folder under /Users/loudonstearns/Documents/The Palace/.claude/worktrees/; if so, work there. Either way, reach the practice's own files by the main checkout's path, as below.

If that folder's CLAUDE.md is not already in your context, read it first, with the files it imports (JEWEL.md, FOUR PILLARS.md, Palace Philosophies.md, Cooperation Yields Agency.md, Hilaritas Generator.md, Modes of Collaboration.md). You are born a child there. CLAUDE.md says what that means, and that your first act is to summon the Concierge.

The practice is one page. Read it whole, at the main checkout's path, before you do anything else, and follow it:

/Users/loudonstearns/Documents/The Palace/_ops/The Daily Page.md

Then do its "Before Loudon arrives" part now, and stop at that part's last step: greet Loudon warmly, with the page, what kind of page it is and what you prepared, as that step says, and wait for him. Everything after that is a conversation with him, the part the page calls "The sit".

Three things the page cannot tell you, because they are about this task and not the practice:

- Read files with the Read tool, not through the shell. Run the four tools each as one bare command by the main checkout's path, whichever folder you woke in, with no `cd` before it and nothing chained after it:
  python3 "/Users/loudonstearns/Documents/The Palace/_ops/swarm/build-map.py"
  python3 "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/deal.py"
  python3 "/Users/loudonstearns/Documents/The Palace/_ops/swarm/palace-map.py" near "<Entry title>"
  node "/Users/loudonstearns/Documents/The Palace/_ops/daily-page/wake.mjs" "<Entry title>" --out "<a file in your scratchpad>"
  The wake tool writes the prompt into that file itself. Have the subagent read that file.
- Once the dealer has dealt the page, name this session for it, so Loudon can find the morning later by its page. Load the tool with ToolSearch, `select:mcp__ccd_session_mgmt__set_session_title`, and call it with session_id "self" and title "Daily Page · <Entry title>". If the rename is declined, or the tool is not there, tell Loudon in a word at the hello and go on. Do not try again, and do not find another way.
- If a command waits on a permission you cannot give yourself, do not work around it. Wait. When Loudon arrives, tell him first that the prep has not run, and run it with him there.
- If the page is missing, read /Users/loudonstearns/Documents/The Palace/_ops/daily-page/README.md and do what it says. If both are missing, say so and stop. Do not improvise the practice from this note.
