---
title: "The Gallery — spec — media store"
born: 2026-11-03
links:
  - target: "[[The Gallery]]"
    type: connects-to
    label: spec-of
  - target: "[[Image Embedding Standard]]"
    type: connects-to
    label: reads-against
forward_vector: "I specify the palace-wide store for the files git keeps out — a mirror of the palace tree inside Dropbox, a tracked manifest, one tool and a resolver that learns it — written for the Gallery first and built so any bundle can use it. I end when the tool exists and this page is its README."
---

# The Gallery — spec — media store

*A spec, not a build. Drafted 2026-11-03 by the child session; placed by the Concierge the same day. Loudon, 2026-11-03: "what we develop here can be used in many other aspects of the palace."*

## What is true on this Mac today (verified 2026-11-03)

- Dropbox is installed as the macOS File Provider kind: the folder is `~/Library/CloudStorage/Dropbox` (`~/Dropbox` is its alias). Files are online-only until read: a sample `.wav` carries the flags `compressed,dataless`. Reading one hydrates it; `/usr/bin/brctl download <path>` hydrates on purpose (the binary is present). There is no documented command to make a file online-only again; Finder does it.
- The account: `~/.dropbox/info.json` reports `subscription_type: "Pro"`, `is_team: false` — read as the Professional plan.
- The Dropbox holds about 178,000 files. The top-level folders that matter to the Gallery: `_CLASSES` (10,593 files), `_PERSONAL` (120,314), `_Reference` (5,391), `Berklee Google Backup 2024` (5,039), `WIND` (178), `Photos`, `Public`. Most of the bytes on disk are in one collaborator share (`Loudon | Valen`, 625 GB local). File types across the whole: wav 38,706 · asd 21,406 · jpg 16,765 · aif 11,597 · png 6,497 · fxp 5,771 · mid 5,222 · flac 4,827 · als 4,185. *(Counts from the child session's sweep on 2026-11-03; not re-counted on placement.)*
- The Mac's disk: 27 GB free of 1.8 TB. The palace's own ignored audio and video (about 30 GB outside worktrees) is part of that. *(The child session's figures; not re-measured on placement.)*
- The palace's rule for media today: `.gitignore` keeps `Projects/**/*.wav|mp4|mov|…` on this Mac; the one exception is a bundle's `rich-face/` folder, for a chosen take the public face must play. `_ops/rich-face/resolve.mjs` is the one resolver: git's index first, then, on the live page only, the ignored media (`_ops/rich-face/README.md` § The manifest). `_ops/rich-face/untracked.mjs` lists what a face names that git lacks.
- Dropbox shared links: `?raw=1` makes the browser render the file instead of the preview page (an HTTP redirect; HTML is never rendered). Daily bandwidth per Dropbox's help pages on 2026-11-03: Basic 20 GB and 100,000 downloads; Plus and Professional 1 TB; a link over the limit is disabled for 24 hours, longer on repeats, and no extra allowance can be bought. Sources: help.dropbox.com/files-folders/share/force-download, help.dropbox.com/files-folders/share/banned-links. This account is on the 1 TB tier. *(Web claims, not palace canon. The child session also reported forum posts from 2024 of `raw=1` video embeds breaking for hours; no URL was kept, so that stands unverified.)*

## The shape

**The store is a mirror of the palace tree inside Dropbox**: `~/Library/CloudStorage/Dropbox/Palace/<palace path>`. A file whose palace path is `Gallery/Peek A Boo/audio/take-3.wav` lives at `Dropbox/Palace/Gallery/Peek A Boo/audio/take-3.wav`. One rule, no lookup table, and Finder shows the palace's own shape.

**The palace tracks the manifest, never the bytes.** Each bundle that uses the store keeps `[Entry] — store.jsonl`, append-only, one line per file:

```
{"path":"Gallery/Peek A Boo/audio/take-3.wav","sha256":"…","bytes":88704044,"mime":"audio/wav","added":"2026-11-05","source":"Dropbox/Loudon | Lee - Peek A Boo/…","note":"rough mix, 2019-03 by file date","link":"https://www.dropbox.com/scl/fi/…?raw=1"}
```

`source` is provenance: where the file came from before the store (a tape, a drive, a Dropbox share, a Drive export). `link` is filled only once a public link exists. A later move off Dropbox (to R2 or B2, say) changes the `link` column and the mirror root, nothing else.

Two things the house asks of this file before it is real, both owed and neither done: a `.gitattributes` line so it merges by union (today only `* — tuning.md` and diaries do), and the §8 minimal self-description every bundle file carries, which a JSONL cannot hold as YAML — either a first-line header object or a sibling `.md` note; decide at build time ([[SCHEMA — Reference]] §8).

**One tool, `_ops/store/store.mjs`**, with these verbs:

- `put <file> [--as <palace path>] [--source <text>] [--note <text>]` — hashes, moves the file into the mirror, writes the manifest line in the owning bundle. Nothing is left in the palace tree.
- `get <palace path>` — hydrates the file (`brctl download`) so a tool can read it; prints the Dropbox path.
- `check [entry]` — every manifest line: the file exists in the mirror, its hash matches, whether it is hydrated. Exit 1 on a miss, so a gate can ask it.
- `link <palace path>` — asks the Dropbox API for a shared link, rewrites it with `raw=1`, records it. Needs `DROPBOX_TOKEN` in the environment, which Loudon creates (an app with `sharing.write` scope); the tool never stores it.
- `ls [entry]` — the manifest as a table.
- `sweep <Dropbox folder>` — for the hunt: lists files by name, extension, size and modification date **without hydrating them** (a dataless file still has its metadata), writing a candidates JSONL for the Harvest to triage. The file dates in `_CLASSES` and `_PERSONAL` are a first pass at dating works for free.

**The resolver learns the store.** `resolve.mjs` gains a third index after git's and the local media: the union of every `— store.jsonl`. On the live page a store file is served from the mirror path (hydrating on first read). In the public build a store file resolves to its `link` where one exists, else to the label "in the store, not yet linked: run store.mjs link". `untracked.mjs` learns the same, so its advice for an ignored file becomes "put it in the store" rather than "copy it under rich-face/".

**What stays as it is.** `rich-face/` keeps its meaning for a small chosen take that must survive Dropbox. The [[Image Embedding Standard]] says "Nothing is embedded from an external URL; archive it first." This spec reads the store as that archive and a `link` as a pointer to the palace's own copy; the Standard does not yet say so, and whether a public face may draw a picture from a Dropbox link is Loudon's call before the first one does.

## Order of building

1. `put`, `check`, `ls` and the manifest, with the resolver's live-page path. Test on one Gallery work and one existing project's ignored render.
2. `sweep`, run on `_CLASSES` first; hand the candidates to the hunt.
3. `link` once Loudon has made the token; test one audio and one video link in the public build; watch the bandwidth line for a week before more are linked.
4. Move the palace's ignored audio and video into the store, bundle by bundle, and let Finder make the mirror online-only, which gives the Mac its disk back.

## Risks, named

- Dropbox links are not a CDN and can be disabled for a day on traffic. The account's tier is 1 TB a day; a public Gallery that gets real attention still has a ceiling. If traffic ever matters, the `link` column is the one thing to migrate.
- A dataless file read by a script hydrates silently and fills the disk again; `sweep` must never open a file, and `check` must not hydrate to hash (hash at `put` time; later `check` compares sizes and hydration state, hashing only hydrated files).
- The File Provider kind may have a file-count ceiling; the child session cited "about 500,000 files by one university's guidance" without a URL, so the figure stands unverified. The Dropbox is at about 178,000 and the palace's media adds a few thousand; worth watching if the hunt pulls whole drives in.
