# Walk Ceremony — one step of a walk (the remake)

**File:** `Walk Ceremony — one step of a walk.png` (and `.svg`), made by `make-step.py`, job `one-step`.

**Title:** One step of a walk

**Caption:** A walk from this page has one link to follow, and it leads to The Cooperation Path. There, seven typed links lead on. Their types say what attention to bring: five are `connects-to`, which this page says to follow with curiosity rather than expectation; one `deepens` and one `spawned` link get no question from this page, and SCHEMA's link table gives their meaning instead. Across the palace, about half of all typed links are `connects-to` (1,202 of 2,496).

**What is real and what is a choice:**
- **Real:** the links. Walk Ceremony has exactly one typed link (`connects-to` → The Cooperation Path), and The Cooperation Path has exactly seven, as drawn. Both come from the Palace Map full build of 2026-11-16, built at commit `f2c1efdb`; its link table is copied into this folder. The script checks the seven against The Cooperation Path's own frontmatter at that commit, and stops if they differ. The count line comes from the same table.
- **Real:** the quoted words. "with curiosity rather than expectation" is from this page (How to Walk). "the target is the ground" is from SCHEMA §4, the `deepens` row. "traceable lineage" is from SCHEMA §4, the `spawned` row. The script checks each phrase against its source file.
- **Choice, the entry:** The Cooperation Path is not a sample chosen to show many types. It is the one step this page itself offers: its only typed link. The page also points there ("See also [[The Cooperation Path]] for the first named songline in the palace"). The step therefore shows none of the three types the page gives a question for (`mirrors`, `enables`, `couples-with`).
- **Choice, SCHEMA as the attention:** SCHEMA's table gives each type's meaning, not an attention. Reading a type as a kind of attention is the Jewel's move ("Treat these as kinds of attention") and this page's own. The two short phrases are the parts of SCHEMA's rows nearest to an attention.
- **Choice, left out:** the links' labels (`story-origin`, `songline-stop`, `mode-selection-as-path-design` and others) are left out to keep the words few. Walk Ceremony's own link carries the label `first-songline`.
- **Choice, the drawing:** each page is shown by its own icon from its bundle. The `deepens` and `spawned` lines are drawn darker only so they read apart from the `connects-to` group. The fan does not show direction.

**Leaking in:** SCHEMA's link table (`SCHEMA.md` §4), for `deepens` and `spawned`, named on the picture as "— SCHEMA". The neighbour The Cooperation Path, whose seven links are the picture.

**Anchor:** "what kind of attention to bring"

**Made with:** the Palace Map (`_ops/swarm/palace-map.py`, the 2026-11-16 build), checked against the page's frontmatter at `f2c1efdb`. The pages' own icons, used as a material. Drawn SVG, then headless Chrome for the PNG. Script: `make-step.py`. There is no randomness to seed.

---

## The first version, kept: "Every door in the palace" (job `every-door`, `make.py`)

It was challenged and sent for remake on 2026-11-17 (see `challenge.md`). Its numbers all matched the challenger's recount, but its words and its weight were wrong:
- "Door" on this page means the entry a walk starts from, so the title misled.
- "A walker meets it with no instruction" is false of the palace, because SCHEMA's table and the Jewel give the attention.
- The 2,497 explanation gave the wrong reason. The raw count is 2,497 at any date, because one link in *1 from 2* points at a web address.
- `grew-from` is not a SCHEMA type.
- It was tall (920 × 994), about seventy words, and mostly a chart.

Its counts, still true at `f2c1efdb`: 1,202 `connects-to`; 507 links of the three types with a question; 787 of the types the page gives no question for; 2,496 in all on 333 entries.
