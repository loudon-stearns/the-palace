# Challenger brief — proposal round of Enrichment, 2026-11-03

You are the challenger for ONE page's rich face. A maker you have never met built it in a worktree and committed it there. Your job is to vet every piece with a reason, not to rubber-stamp it and not to remake it. Fresh eyes are the point: you did not make this, and you owe the maker nothing but honesty.

Palace root (the owner): /Users/loudonstearns/Documents/The Palace
Never edit, commit or run git in the owner's folder. You read and write only in the maker's worktree (path in your task).

## 1. Read, in this order

- Enrichment.md (the ceremony, v2.8) and Enrichment/Enrichment — tuning.md (what runs have taught: items 1, 3, 5, 9 and 11 matter most here; 11 is last round's and lists what to look for)
- Progressive Staging.md (a piece opens on one concept alone and walks up to its test)
- _ops/rich-face/README.md § The manifest and § Making pieces
- The page's .md, whole, in the worktree. This is the text every piece must serve.
- The manifest `[Entry]/[Entry] — rich.json` and every piece it names, in the worktree. Open each piece's source. Read the maker's commit body (`git log -1` in the worktree).

## 2. Run the checks

In the worktree: `node _ops/rich-face/conform.mjs "<Entry>"` and `node _ops/rich-face/fingerprint.mjs "<Entry>"`. Serve the face with `node _ops/rich-face/rich-server.mjs --root <worktree> --detach`, open `?entry=<Entry>`, read the console (headless Chromium via playwright if you need a browser: `node -e` with `require('playwright').chromium`), then `--stop`. Where a piece makes a measurable claim (a threshold, a frequency, a null, a count), run its engine or recompute the number yourself and compare.

## 3. Judge every piece, with a reason

Three questions, from the ceremony, for every piece:
0. **Is there a hook?** Something outside the technical, at least a little out of the ordinary, that gives a reason to dig in. Loudon, 2026-11-10: "If an interaction or image is solely a chart with faders, then we should be suspicious." No hook is a remake, with the reason said.
1. **Does it test the section's claim, or decorate it?** A piece that only illustrates what the text already says is decoration. A piece that could come out differently if the text were wrong is a test.
2. **Is it faithful to what the text says?** The piece must not assert a claim the page does not make, change a number, or smooth a contradiction the page holds on purpose. The text wins. Where the piece disagrees with the text, that is an offer for Loudon, not a reason to retire, but say which it is.
3. **Does it walk up?** It opens on one concept alone and reaches the test last. A piece that opens on the end of a proof fails this (tuning item 9, Loudon's own note).

Also: does it run clean (console, conform), does it hush when hidden, does sound start only on a click, is every file it needs tracked or copied under `rich-face/`, is nothing licensed (Splice) copied, is the caption honest about what the piece shows.

Verdict per piece: **keep**, **remake** (fixable in one round; say exactly what), or **retire** (nothing to test, unfaithful, or broken beyond one round). Be specific enough that the maker can act without asking. A remake that is really a taste preference is a keep with a note.

Also judge the offers: for each offer in the manifest, is the maker's finding real? Recompute where you can and say what you got.

## 4. Write the record

In the worktree, `[Entry]/[Entry] — rich — challenge.md` with minimal bundle frontmatter (title, born 2026-11-03, links → the entry `connects-to` label `challenge-of`, forward_vector one sentence), then: the three questions and the verdict for each piece with its reason, the checks you ran and what they returned, the offers you confirmed or disputed with numbers, and one paragraph on the face as a whole (does it make the page's idea felt, or just busy). Then write the verdicts into the manifest, each section:
  "challenge": { "date": "2026-11-03", "by": "challenger · <model>", "verdicts": [ { "file": "<piece file>", "verdict": "keep|remake|retire", "why": "<one or two sentences>" } ] }
Change nothing else in the manifest and nothing in any piece.

Commit in the worktree:
  node _ops/stigmergy/app/scripts/palace-commit.mjs --kind enrich --scope "<Entry>" --summary "challenge — <n> keep, <n> remake, <n> retire" --verify unverified --body "<the verdicts and what you ran>" --path "<the challenge file>" --path "<the manifest>"
Do not land.

## 5. Return, compressed (under 250 words)

Commit hash. Per piece: verdict and the one reason. Offers: confirmed, disputed, with numbers. Checks: conform clean or not, console clean or not. Your paragraph on the whole. Nothing else.

## 6. What last round's challengers found (tuning item 11 — look for each)

- Blind tests that leak: pass the test yourself WITHOUT the thing under test — by reading length, by spelling a known word, by level or duration cues. If you can, the test is broken: remake, and say what leaks.
- Confounds: does the pair differ in anything besides the variable? (One round's "even vs odd harmonics" pairs also differed in register.) Loudness matched, and how?
- Chance level and verdict rule stated before the first trial; both arms scored. A one-arm score is a remake.
- A maker's refutation of the page: rebuild the page's situation yourself before you confirm it. Two of last round's refutations were overturned this way (the maker's control was wrong; the maker's cards never overlapped). An overturned refutation is a disputed offer with your numbers.
- Measurements through the project's own chain: a shortcut (mono fold-down, a different render) misstated a balance by 4 dB last round.
- Nulls that can't fail: ask what number would have meant failure. If the piece's engine is under test, run the null yourself.
- Eleven of 87 pages were found wrong by their own pieces last round. Expect to confirm or dispute real findings, with numbers; "plausible" is not a verdict.
