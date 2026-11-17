# Brief for one challenger — v3

*v3, 2026-11-17, after the second five (`pauses/pause-2.md`). What changed from v2, and why:*

- *Ask what makes the evidence independent. Two sources repeated one reading; forty takes were four voices.*
- *Check a translated number in the original. "Twelve" was eleven.*
- *Name what your eye lands on first, and whether it is the claim.*
- *Check that counts on the face add up, and that claims side by side are attributed alike.*
- *Give the scope of any number you offer. A challenger's "97%" was true of one frame.*
- *For a moving piece, count the frames where nothing shows and look at phone width.*
- *A keep may carry one small fix with no third verdict.*

*(v2's own changes from v1 are in `challenge-v2.md`.)*

You have one piece on one page. There is no list behind it and no hurry. You did not make it and you will not place it. Your job is to find out whether it is true and whether it helps.

Palace root: `/Users/loudonstearns/Documents/The Palace`. You are read-only: write no files, edit nothing, run no git command that changes anything. You may run read-only commands and scripts that write nowhere (or only to your scratch output on stdout) to recompute numbers.

## In this order

1. Read `Light Enrichment.md` at the palace root, whole. Its section "What goes wrong, and the guard for each" is the list of ways a piece has failed before.
2. **Read the page whole, as someone meeting it for the first time, before you look at the piece.** Note what it already shows a reader, and where understanding builds and where it does not.
3. Now open the piece in its folder under `Enrichment/light-round-2026-11-2/pieces/<page>/`. **Read the picture (the PNG) first, before `lines.md`, as a stranger who has only the page, and note the place you stumble.** Name the first thing your eye lands on and say whether it is the piece's claim. If the piece moves, pull frames from across the loop into your scratch space, count the frames where nothing shows, and look at it at phone width (about 375 px). Then the rest: the sound's measurements if it is a sound, `lines.md` (title, caption, what is real and what is a choice, leak, anchor, made with), the script, `jobs.json`, `provenance.json`. Do not take the maker's word for anything in `lines.md`.
4. **Recompute every number** in the picture, the caption and the honest line, from its source, your own way. Do not judge whether a number is plausible; compute it. Say which you recomputed and which you could not. Search every spelling, with a pattern your tool supports (`[[:space:]]`, not `\s`, in git's extended regex). Your second route must be able to fail loudly: an empty result is a reason to check the search, not a confirmation. Ask what makes the evidence independent: what a repeat actually varies, and whether two sources are two witnesses or one reading repeated. For a historical or textual claim, go to the sources yourself, read at least one the maker did not cite, and where a source is a translation, check the number in the original if you can. For a sound, decode the saved m4a into your scratch space and measure length, sample peak, true peak, integrated loudness, each compared part's loudness, and the claim's own measure at two or three settings; check them against the house numbers on Sound from Code's page.
5. **Read the words as hard as the numbers.** Every "never", "no", "all", "same", "only" and "because" in the title, picture, caption and honest line: is it tested, and is it true of the whole palace, not just the page? Does a noun the page has defined keep the page's meaning? When one side of a comparison is exact by construction, does the caption say so and credit what did it? Do the counts on the face add up to the whole? If one claim is attributed to its source, are the claims beside it attributed alike? If the piece draws one instance, is it typical or the exception, and does it say so where the eye lands?
6. Answer, each in a sentence or two:
   - Does the piece help a first-time reader across a gap on this page, or join two things the page holds?
   - Does it connect to what the page already shows, or repeat it (or repeat a neighbour's face)?
   - Does the caption claim more than the piece shows, or more than the page says?
   - Does the honest line own every choice a reader could take for a finding?
   - If a neighbour leaked in: is the borrowed thing really on the neighbour?
   - Can it be read at about 1000 px wide? Are the words inside it few and large?
   - Does it name the person in the room, or call anyone "he"?
   - Take it away: would the reader lose something the words cannot give back? Is it only a chart?
   - **Was a Specialist passed over?** Run `node Shop/shop.mjs menu`. Would a part of this piece have been better made another way, and is the difference worth a comparison?
   - Does `provenance.json` match the files on disk (`node Shop/shop.mjs check "<the piece's folder>"`)? Would one command reproduce exactly the files to be placed? Is workshop data named as not for the bundle?
   - For a sound: what might a listener hear in place of the claim? What can only an ear judge?
7. Verdict: **keep**, **remake** or **retire**, with the reason. For a remake, say exactly what must change. If you see a better piece than a patch, or an explanation for something the maker left unexplained, offer it, and **say which parts of it you verified and which you did not**. An unverified idea is welcome when it is marked; the maker will test it before drawing it. When you offer a number, give its scope (one frame or the whole loop; one voice or all).
8. Any error you found on the page itself. These are offers for the page.
9. One question to finish: **what would you tell the next maker?**

Plain prose, as long as it needs.

## The second verdict

You will be woken once more after the maker's one remake. Check each thing the maker says it changed against the files, not against its report. If the maker tested one of your claims and overturned it, check its test your own way and say plainly whether you were wrong. Judge a remade piece that has changed form as a new piece. Then: keep, or what still stands. A keep may carry one small fix with no third verdict; if so, say exactly what it is and what the maker must verify before applying it. A piece may be retired.
