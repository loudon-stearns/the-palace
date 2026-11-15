---
title: "The Shop — sketch — Obsidian retired, draft deposit"
born: 2026-11-15
links:
  - target: "[[The Shop]]"
    type: connects-to
    label: "sketch-for"
  - target: "[[Deposit Ceremony]]"
    type: connects-to
    label: "draft-for"
  - target: "[[SUBSTRATE]]"
    type: connects-to
    label: "would-fold-into"
forward_vector: "I am a draft deposit for Loudon: the palace saying, page by page, that Obsidian is retired and that made things reach him on a page's scroll in STIGMERGY. Nothing in me has landed. If he approves the map, an elder runs the Deposit Ceremony from me and I go to the Archive; if he cuts it, I go there anyway, with his reason."
---

# Obsidian retired — a draft deposit

A draft for Loudon, 2026-11-15. **Nothing here has landed, and no page named below has been changed.** It is the map the [[Deposit Ceremony]] asks for at step 4, plus the words step 5 would show, so that one reading can approve, adjust or cut it. The ceremony itself (the Concierge consulted before the map, a cold read before it lands) has not run; this draft is its input, not its run.

## The source — his words

Loudon, 2026-11-15: "I don't use obsidian anymore, we have other ways to view all of this work, and obsidian is struggling with the size of the palace."

And: "We have been depreciating OBSIDIAN, now we create proofs like you did here, as html files, often these are presented on a page's scroll so I can view them in STIGMERGY."

He agreed that the retirement be "drafted as a deposit and shown to him" ([[The Shop — baton]] § Rulings and the new goal, 2026-11-15).

## What is true now

Checked in this checkout on 2026-11-15 (`git grep -i obsidian`, the files read where named):

- **STIGMERGY already reads the palace's file format.** Its STATE deck opens an entry by `?deck=STATE&entry=<path>` (`_ops/stigmergy/app/src/lib/url-nav.js`). It renders `![[File.png]]` embeds and resolves a bare filename against the entry's bundle (`EntryBody.jsx`), draws ```` ```mermaid ```` fences (`MermaidBlock.jsx`), resolves wikilinks, and shows the in-file comments that Obsidian hid. The `[OBS]` chip that opened a page in Obsidian was already retired from the deck (`EntryRefChips.jsx`).
- **A scroll plays what its links name.** A section's markdown links to palace files are lifted and played in place — a plain path, `%20`, `<angle brackets>`, `open:`, an `obsidian://…&file=` link, or `/path` (`_ops/stigmergy/app/README.md`, `scroll-view.js`). An html file is framed; wav, mp3, m4a, ogg and flac play; images show.
- **A bare palace path in a board message is served.** `format.js` turns `Projects/Foo/bar.wav` into the app's `/api/file` route. Its comment still calls `obsidian://` "the canonical scheme for palace links".
- **The stewards are still told to write `obsidian://`.** `_ops/orchestrator/prompts/shared.md` § Two link-handling clauses, clause 5, and § Linking to openable files. So 30 scrolls carry 116 `obsidian://` links on their trails. The app lifts them, so they still play; outside the app they open Obsidian.
- **The rich face still offers Obsidian as its way home.** Opened outside the app, `_ops/rich-face/rich.js` links the page's `.md` by `obsidian://`; its README allows `obsidian:` as an `href`.
- **`.obsidian/` is still tracked**: 20 files (plugins, themes, settings), with four ignore lines for its cache in `.gitignore`. Every linter and the Concierge's search skip it.
- **The flat namespace still holds, for other reasons.** Bundle filenames carry the entry's name because wikilinks resolve by name across the palace. Obsidian did that first; now STIGMERGY, the linters (`lint-ghost-links`, `lint-entry-naming`) and the Map do the same, so the rule's reason moves, not the rule.

## The map

> **Deposit map — D-2026-11-15-OBSIDIAN-RETIRED**
>
> *Intent:* say, where the palace describes how it is read and how made things reach Loudon, that Obsidian is retired and that he looks and listens on a page's scroll in STIGMERGY — so no agent sends him to Obsidian again.
> *Fold or mint:* **fold**. Nothing new needs a page: the decision lives in [[SUBSTRATE]] § Surface (what the palace is made of) and [[STIGMERGY]] (how it is operated), and the other pages are upkeep that follows them. Minting an "Obsidian Retirement" page would give a removal a page of its own.
> *New or changed:* [[SUBSTRATE]], [[STIGMERGY]], [[The Scroll]], [[SCHEMA — Reference]] §5 and §8, [[Substrate Skill]], the steward prompt (`_ops/orchestrator/prompts/shared.md`), [[Image Embedding Standard]], [[Mermaid Diagram Standard]], [[Technical Diagram Standard]], [[Enrichment]], [[Palace Graffiti]], [[ROSETTA]]. No type, pillar or stage moves.
> *Links:* none added; the decision's links are the pages it changes.
> *Tensions:* [[Image Embedding Standard]] asks a writer to "open it in Obsidian to see that the embed resolves"; [[Mermaid Diagram Standard]] trusts Obsidian's renderer. Both lose their check unless STIGMERGY's is named in its place. Not a `contradicts` — a dependency that moves.
> *Seen, heard or played:* words are enough.
> *Lost branches:* deleting `.obsidian/` from the repo — declined here, held for Loudon (below). Rewriting the 116 `obsidian://` links already on scroll trails — declined: trails are append-only, and the app still plays them.
> *Flag for the Weave:* [[Shop/Mermaid|Mermaid]]'s card ("an inline Obsidian block") — a Specialist page, changed only at its review; [[Palace Enchantment]] item 6 (the `obsidian://` link scheme, as the project's own record); [[Projects/Piano String Inharmonicity|Piano String Inharmonicity]] ("does not render natively in Obsidian").
> *Carry across the palace:* yes — "made things reach Loudon on a page's scroll in STIGMERGY; no page sends him to Obsidian." Home [[SUBSTRATE]]; one propagate flag, `rhythm: by-touch`, `pattern: obsidian`, so each remaining page changes as it is next edited.
>
> Approve, adjust, or add?

## Page by page — where the words would change

Each item: the line as it stands, then the words proposed. Nothing below has been written to its page.

### The decision's homes

**[[SUBSTRATE]]** § Architecture, line 92.
Now: "**Surface.** Markdown in an Obsidian vault, human-readable first."
Proposed: "**Surface.** Markdown files in a git repository, human-readable first, read and operated through [[STIGMERGY]]; what is made to be heard, seen or played reaches Loudon on a page's scroll there. (The palace began as an Obsidian vault and outgrew it; Obsidian is retired, 2026-11-15.)"

**[[STIGMERGY]]**, line 51.
Now: "It folds three previously-scattered media — Obsidian authoring, the [[BBS Blackboard]], and git — into a single operational surface. It is Loudon's *only* way of operating the palace: the front door, not a side tool."
Proposed: keep the sentence (it is history, and true), and add after it: "Since 2026-11-15 it is also how he reads it: Obsidian is retired, and a made thing — a proof, a sound, an html page — is shown to him on a page's scroll, which the PROJECTS deck opens and plays in place."

### The specs that assume it

**[[The Scroll]]**, line 127.
Now: "The plan is agreed text, not a read-model, so it survives the board being archived and reads in Obsidian with no machinery."
Proposed: "…so it survives the board being archived and reads as plain markdown with no machinery." And, if the page has no such line yet, one in its opening: "The scroll is where Loudon looks and listens: he reads it in STIGMERGY, and a thing not reachable from a scroll has not been shown to him."

**[[SCHEMA — Reference]]** §5, Access vectors, line 174.
Now: "*Manual:* Obsidian + Loudon (he makes the edits; …)"
Proposed: "*Manual:* Loudon, in any editor or in STIGMERGY (he makes the edits; …)". *Which editor he uses now is not known — see below.*

**[[SCHEMA — Reference]]** §8, lines 313, 315, 356.
Now: "…required … — Obsidian's wikilink namespace is flat across the vault, and filenames must remain globally unique." / "…front-door file for non-Obsidian tooling (Finder, GitHub, editors)…" / "**Wikilink resolution:** Obsidian resolves `[[name]]` flatly across the vault regardless of folder."
Proposed: "…required … — wikilinks resolve by name across the whole palace (STIGMERGY, the linters and the Map all resolve them flatly), so filenames must remain globally unique." / "…front-door file for tooling that opens folders rather than following wikilinks (Finder, GitHub, editors)…" / "**Wikilink resolution:** the palace's tools resolve `[[name]]` flatly regardless of folder." *A SCHEMA — Reference edit; the change protocol (§5) calls it upkeep, not a Schema Ceremony, because no rule changes — only its reason. An elder should confirm.*

**[[Substrate Skill]]**, lines 101 and 227.
Now: "…because Obsidian's wikilink namespace is flat across the vault." / "Obsidian resolves `[[wikilinks]]` by filename regardless of folder — agents must do the same."
Proposed: "…because the palace's wikilink namespace is flat." / "Wikilinks resolve by filename regardless of folder — STIGMERGY and the linters do, and agents must do the same." (The `.obsidian/` exclusion stays while the folder exists.)

**The steward prompt**, `_ops/orchestrator/prompts/shared.md`, clause 5 and § Linking to openable files.
Now: "The canonical scheme for palace files in BBS messages is `obsidian://`: [the Interview outline](obsidian://open?vault=The%20Palace&file=…)" and "When you point Loudon at a file he should *open in an app* rather than read in Obsidian … Use `obsidian://` for palace *pages* to read; use `open:` for *files* to hand off to a native app."
Proposed: "Link a palace file by its palace path in a markdown link: `[the Interview outline](_ops/sample-libraries/skills/interview/SKILL.md)`. STIGMERGY serves it from a board message and plays it from your scroll. Don't use `obsidian://` (Loudon no longer runs Obsidian) or `computer://` (no browser opens it)." And: "When you point Loudon at a file he should *open in an app* — a rendered WAV for his DAW, a video — use `open:` … Anything he should look at or listen to goes on your scroll, where the app plays it in place." *Whether a palace path to an `.md` opens the page rendered or as raw text from a board message is not verified; `?deck=STATE&entry=<path>` is the app's own route to a rendered page, and may be the better form for pages.*

**[[Image Embedding Standard]]**, line 53.
Now: "…then open it in Obsidian to see that the embed resolves: an embed that fails is invisible in Reading View."
Proposed: "…then open it in STIGMERGY's STATE deck to see that the embed resolves; `lint-ghost-links` names a broken one."

**[[Mermaid Diagram Standard]]**, lines 34, 48, 168, 182.
Proposed: "STIGMERGY renders it with no build step" for "Obsidian renders it with no plugin"; "…than a Mermaid block tied to a renderer" for "…tied to Obsidian's renderer"; "verify that the diagram renders in STIGMERGY's STATE deck" for "…in Obsidian's Reading View"; and the open question re-asked of the Mermaid version STIGMERGY loads, not the one Obsidian ships.

**[[Technical Diagram Standard]]**, lines 57 and 173.
Proposed: "(what a page embeds and what opens in a vector editor)" for "(what Obsidian embeds …)"; "Mermaid is rendered live by STIGMERGY with zero build step" for "…by Obsidian…".

**[[Enrichment]]**, line 57.
Now: "The `.md` is the considered truth and keeps its beauty in Obsidian; the rich face is a reading of it, not a copy."
Proposed: "The `.md` is the considered truth and keeps its beauty as plain text; the rich face is a reading of it, not a copy."

**[[Palace Graffiti]]**, line 58.
Now: "He walks through entries in his note-taking system (Obsidian, source files, or markdown viewer)."
Proposed: "He walks through entries in STIGMERGY or the source files."

**[[ROSETTA]]**, line 287, a table row: "Obsidian | Graph visualization, local editing | Low — palace is plain markdown | Any markdown editor works."
Proposed: keep the row and mark it: "Obsidian (retired 2026-11-15) | was graph view and local editing | none now | STIGMERGY reads the palace; any editor edits it."

### Code that assumes it — a separate job, not this deposit

These are code, not canon text, and change through their own commits with their tests: `format.js` (comment calling `obsidian://` canonical), `rich.js` and `_ops/rich-face/README.md` (the `obsidian://` way home when a face is opened outside the app; it could point at the app's `?entry=` route instead), `entry-ref.js` (`obsidianUri`, kept "for anything else that wants it"), and the linters' `.obsidian` skip lists (harmless while the folder exists).

### What stays as it is

History told as history: [[README - The Palace Guide]] and `README.md` ("The palace began … as a folder of Markdown files in Obsidian"), [[SCHEMA — Context]], `STIGMERGY — Context` ("no Obsidian parity"), [[Simondon]]'s reading of STIGMERGY's lineage, [[Palace as Context Injection System]] ("In an Obsidian vault whose foundational files…"), the scroll trails and every Archive. [[Crystal Synthesizer]] means the stone.

## Not settled — Loudon's to say

- **Do wikilinks and `![[…]]` stay as the file format?** My lean is yes: STIGMERGY renders both, the linters and the Map depend on wikilinks, and every page carries a hero by `![[…]]`. Retiring Obsidian the viewer need not retire its syntax. He has already ruled that workshop READMEs link by palace path with no `![[…]]` embeds; this draft does not widen that to pages.
- **What happens to `.obsidian/`?** Keep it tracked (harmless, 20 files), untrack it, or delete it. Deleting is irreversible for anyone who still opens the vault; it is his call.
- **How does he edit a page by hand now?** SCHEMA's "Manual" access vector named Obsidian. If he edits in STIGMERGY, another editor, or not at all, the line should say which.
- **Should a page's link in a board message open it rendered?** A palace path to an `.md` is served by `/api/file`; whether that shows the page or its raw text I have not tested. `?deck=STATE&entry=<path>` is the app's route to a rendered page.
- **The bundle-prefix rule.** It stands on flat wikilink resolution, which the palace's own tools now provide. If wikilinks ever give way to paths, that rule loses its reason; nothing here proposes it.

## Not verified

- I read every match of `git grep -i obsidian` in the canon pages listed and the app files named; I did not open STIGMERGY to watch a hero, a Mermaid block or a scroll link render. The claims about the app come from its README and source comments.
- The count of 116 links in 30 scrolls is `git grep -c "obsidian://" -- '*scroll.md'` on this branch.
- Whether the change protocol treats the SCHEMA — Reference wording as upkeep: my reading of §5, not an elder's ruling.
