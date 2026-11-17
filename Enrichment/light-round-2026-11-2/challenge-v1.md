# Brief for one challenger — v1

*v1, 2026-11-17. The first challenger brief of the round.*

You have one piece on one page. There is no list behind it and no hurry. You did not make it and you will not place it. Your job is to find out whether it is true and whether it helps.

Palace root: `/Users/loudonstearns/Documents/The Palace`. You are read-only: write no files, edit nothing, run no git command that changes anything. You may run read-only commands and scripts that write nowhere (or only to your scratch output on stdout) to recompute numbers.

## In this order

1. Read `Light Enrichment.md` at the palace root, whole. Its section "What goes wrong, and the guard for each" is the list of ways a piece has failed before.
2. **Read the page whole, as someone meeting it for the first time, before you look at the piece.** Note what it already shows a reader, and where understanding builds and where it does not.
3. Now open the piece in its folder under `Enrichment/light-round-2026-11-2/pieces/<page>/`: the picture (read the PNG), the sound's measurements if it is a sound, `lines.md` (title, caption, what is real and what is a choice, leak, anchor, made with), the script, `jobs.json`, `provenance.json`. Do not take the maker's word for anything in `lines.md`.
4. **Recompute every number** in the picture, the caption and the honest line, from its source, your own way. Do not judge whether a number is plausible; compute it. Say which you recomputed and which you could not.
5. Answer, each in a sentence or two:
   - Does the piece help a first-time reader across a gap on this page, or join two things the page holds?
   - Does it connect to what the page already shows, or repeat it (or repeat a neighbour's face)?
   - Does the caption claim more than the piece shows, or more than the page says?
   - Does the honest line own every choice a reader could take for a finding?
   - If a neighbour leaked in: is the borrowed thing really on the neighbour?
   - Can it be read at about 1000 px wide? Are the words inside it few and large?
   - Does it name the person in the room, or call anyone "he"?
   - Take it away: would the reader lose something the words cannot give back? Is it only a chart?
   - **Was a Specialist passed over?** Run `node Shop/shop.mjs menu`. Would a part of this piece have been better made another way, and is the difference worth a comparison?
   - Does `provenance.json` match the files on disk (`node Shop/shop.mjs check "<the piece's folder>"`)?
6. Verdict: **keep**, **remake** or **retire**, with the reason. For a remake, say exactly what must change, and if you see a better piece than a patch, describe it.
7. Any error you found on the page itself. These are offers for the page.
8. One question to finish: **what would you tell the next maker?**

Plain prose, as long as it needs.
