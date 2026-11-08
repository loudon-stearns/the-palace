# Cycle 5 Explorer

> Frozen import record. This folder is the claude.ai package as it arrived on 2026-10-28, kept whole as the project's workshop record; nothing here is maintained. `BRIEF.md` was `CLAUDE.md` in the zip (renamed so it does not collide with the palace's root CLAUDE). The live page is `../cycle5-explorer.html` and the live tests are `../tests/theory.test.mjs`; the copies under `src/` and `tests/` here are the frozen originals.

An interactive harmony teaching space: a cycle-of-fifths decoder ring whose rings you drag to change key and mode, with linked Scale Tones / Chord Function / Chord Tones grids, sound, progressions, and translation between Berklee, jazz shorthand, lead-sheet and classical notation.

**Open it:** double-click `src/index.html`. No install or build needed. An internet connection loads the fonts.

## Bring it into Claude Code

1. Unzip anywhere, e.g. `~/Projects/cycle5-explorer`.
2. Optional: `git init && git add -A && git commit -m "Cycle 5 Explorer v2 from claude.ai"`.
3. Run `claude` in that folder. `BRIEF.md` (was `CLAUDE.md`) loads as the brief and gives Claude Code the full context: the theory model, notation rules, color code, settled decisions and the roadmap.
4. Good first prompts:
   - "Read docs/design-spec.md and docs/conversation.md, then propose the next three features."
   - "Restyle the page to the Loudon Live design system: here are its tokens…"
5. After changing theory code, run `node tests/theory.test.mjs` (26 checks).

## Bring it into the palace

`palace/Cycle 5 Explorer.md` is an Obsidian note with frontmatter, a summary, and the core ideas worth keeping. Drop it into the vault where projects live. Copy `docs/` alongside it if you want the conversation and transcript in the vault too. The note links to them by relative path.

## Contents

```
BRIEF.md                           context for Claude Code (was CLAUDE.md)
README.md                          this file
src/index.html                     the app (standalone)
src/artifact-body.html             same app, in claude.ai Artifact format
tests/theory.test.mjs              theory-core tests (node)
docs/design-spec.md                original → decisions → what's built → open questions
docs/conversation.md               the build conversation
docs/original-video-transcript.md  narration of the original Illustrator version
docs/original/                     stills from the original video
docs/screenshots/                  v1 of the rebuild
palace/Cycle 5 Explorer.md         Obsidian note for the palace
```

The live version is a private claude.ai artifact: https://claude.ai/artifact/BHCGoSk5HJpY5pqSAa9iuu
