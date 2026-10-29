# Rational Hearing: interactive version

This is an interactive web version of Loudon Stearns' one-page handout *Rational Hearing: musical intervals are ratios*. It was started in a Claude session on 2026-10-28 and packaged here so the work can continue in Claude Code and be filed in the palace.

**Live draft (private artifact):** https://claude.ai/artifact/SA5jm5VhgfRu1A746UvS2Q

## What's in here

| Path | What it is |
|---|---|
| `BRIEF.md` | Project brief for Claude Code (was `CLAUDE.md`; renamed on import so it does not collide with the palace's root CLAUDE). |
| `src/index.html` | The page as a standalone HTML file. Open it in a browser; no build step is needed. |
| `src/rational-hearing.artifact.html` | The same page in the form published to claude.ai. It has no `<html>`/`<head>` wrapper because the artifact host adds one. |
| `reference/rational-hearing-handout-v1.jpeg` | The original printed handout (page one). |
| `conversation/transcript.md` | The conversation that produced this work: your messages verbatim, plus Claude's replies. |
| `docs/design-notes.md` | Decisions, the math, how the code is organized, and what was assumed. |
| `docs/open-items.md` | What still needs doing, in rough priority order. |
| `palace/Rational Hearing.md` | A palace entry ready to drop into Obsidian. |

## Import into Claude Code

```bash
unzip rational-hearing.zip
cd rational-hearing
git init && git add . && git commit -m "Import Rational Hearing interactive v0.1"
claude
```

Claude Code read `CLAUDE.md` (now `BRIEF.md`) on start. A good first prompt is: *"Read docs/open-items.md and conversation/transcript.md, then open src/index.html and let's restyle it from the real Loudon Live skin."*

To preview the page: `open src/index.html` on a Mac, or `python3 -m http.server` and visit `localhost:8000/src/`.

## Import into the palace

Copy `palace/Rational Hearing.md` into the vault. Rename the frontmatter fields if your schema differs; the entry was written without access to the palace's current schema. You can also keep the transcript and the handout image as attachments.
