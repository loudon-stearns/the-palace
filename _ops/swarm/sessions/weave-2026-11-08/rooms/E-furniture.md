# Lane E — tab icons and browser furniture on every HTML page (writes the house: HTML files only)

Read `PREAMBLE.md` beside this file first.

## The flag you carry

Propagate flag `commons-stale-worktree-remainder-4a8a3b-1793750726779` (posted 2026-11-03, rhythm sweep). Home: [[Loudon Live Design System]] (find the page; read it whole, then `_ops/furniture-fanout/report.md`, especially § Left alone).

- **Decision:** Every HTML artifact wears the browser's furniture in the house style: `lang="en"`, color-scheme and theme-color by its ground, its system's `controls.css`, and a tab icon. A page in an entry's bundle takes the entry's avatar; a page with no entry takes Drafting Table's `favicon.svg`, or Loudon Live's `assets/favicon.svg` on the public channel. A rich-face piece carries no icon: the page that frames it is where the avatar belongs.
- **Scope:** every tracked `.html` outside the design-system folders, except records of past runs, templates a script fills in, STIGMERGY-dressed pages and machinery (`_ops/furniture-fanout/report.md` § Left alone).
- **Check:** its head has theme-color, `html lang`, and `controls.css` linked after its token sheet or inlined as `<style data-furniture>`; a non-rich page also has `rel=icon` at a tracked file.
- **Proposed action:** run `_ops/furniture-fanout/census.py`, then `furnish.py --apply` on it. A page on a system's token sheet gets a `<link>` to `controls.css` (a framed piece lists it in `piece:files`); any other page gets the sheet inlined in `@layer furniture` with `--fx-*` tokens borrowed from its own, so its own rules win, reduced motion excepted.
- **Why:** Loudon, 2026-11-03: "sometimes when using websites I see a little icon in the tab related to the page, none of my pages have that." Carried to 481 pages that day; this weave checks the pages made since.

## Method

1. Read `_ops/furniture-fanout/report.md` whole and the two scripts' `--help` (or their docstrings). Understand what the census counts as "left alone" before you run anything.
2. Run the census from the palace root. Save its output to `_ops/swarm/sessions/weave-2026-11-08/workers/E-census-before.txt`. Read it: how many pages fail the check, and which. Sanity-check a handful by opening the HTML heads yourself — a page the census marks wrong because it is a rich-face piece or a template is a census bug to report, not a page to furnish.
3. Run `furnish.py --dry-run` (or its equivalent) first; read the plan. Then `--apply`. Save the apply log as `workers/E-furnish-log.txt`.
4. Re-run the census → `workers/E-census-after.txt`. The check should be clean except what § Left alone excuses.
5. Open three furnished pages at random (`sed -n 1,30p`) and confirm the head reads right: `lang`, `theme-color`, the icon path exists on disk (`ls` it), `controls.css` after the token sheet.

Touch only `.html` files, and only through the scripts. If a page needs a hand edit the script cannot make, list it in your report and leave it.

## Output

Write `_ops/swarm/sessions/weave-2026-11-08/workers/E-furniture.md`: pages the census found wanting (count and list), pages furnished (count), pages left alone and why (by the report's categories), the three spot-checks, and any census bug or hand edit owed. Do not run git writes.
