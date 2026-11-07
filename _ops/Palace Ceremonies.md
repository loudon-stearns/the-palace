---
title: Palace Ceremonies
type: hub
pillars:
  - practice
  - tools
born: 2026-03
stage: growing
forward_vector: "I am the doorway to the palace's rites, for people and agents alike. Both learn here what a rite is before which rites there are; then a person finds what each one tends, the words that begin it and what it asks of whoever calls it, and an agent finds the page to read before it runs one. I stay true by pointing at each rite, never retelling it."
links:
  - target: "[[SUBSTRATE]]"
    type: deepens
  - target: "[[Harvest Ceremony]]"
    type: enables
  - target: "[[Deposit Ceremony]]"
    type: enables
  - target: "[[Walk Ceremony]]"
    type: enables
  - target: "[[Weave Ceremony]]"
    type: enables
  - target: "[[Spore Check Ceremony]]"
    type: enables
  - target: "[[Self-Model Update Ceremony]]"
    type: enables
  - target: "[[Revival Ceremony]]"
    type: enables
  - target: "[[SCHEMA]]"
    type: connects-to
    label: trigger-field-spec
  - target: "[[Map Build Ceremony]]"
    type: enables
  - target: "[[Closing Well Ceremony]]"
    type: enables
  - target: "[[Closing Well]]"
    type: enables
    label: carries-the-trigger
  - target: "[[Sentry]]"
    type: enables
    label: ceremony-registry
  - target: "[[The Daily Page]]"
    type: enables
    label: ceremony-registry
  - target: "[[SCHEMA — Reference]]"
    type: connects-to
    label: ledger-rules
  - target: "[[Palace Ceremonies — Context]]"
    type: spawned
---
# Palace Ceremonies

![[Palace Ceremonies — hero.png]]

The palace's rites: what one is, and which there are. Every ceremony is listed here. The register the machinery reads is the `trigger:` field; this page is how a person finds a rite, and the doorway an agent comes through before it opens one's own page.

## What Makes a Ceremony, and How It Changes

A ceremony is a rite the palace runs on itself. Its page carries `trigger:`, the words that begin it, and that field is what makes it one, whatever the page's type. A page that only keeps a ledger is not a ceremony ([[SCHEMA]] §1). Most rites begin when Loudon says the words; a few also begin on their own — the Daily Page with the morning's task, the Sentry's gate at every push. Context still decides: "close" alone does not begin a close.

The field makes a ceremony. What makes a good one:

- **It tends something.** A harvest gathers, a weave connects, a close puts the day to sleep and a return wakes it. A rite that tends nothing is a checklist.
- **It knows what done looks like.** Most say it as a contract: what holds before, what must be true after, what to do when it goes sideways. One that cannot verify its end has not ended ([[ELDER]]). An honest "nothing found" can be the end; it is the Walk's.
- **It reads like a letter, not a script.** It says what it is for and what done looks like, and leaves the route to whoever walks it. Its metaphors are part of the instruction.
- **It remembers.** Its version moves when its spec changes, not because it ran. Every ceremony keeps a tuning ledger today, `[Ceremony] — tuning.md`. A run opens by reading the ledger's tail and closes with one line — what it ran on, and "nothing new" or what it taught — so the next run starts from the last, not from scratch. The exact rules and commands: [[SCHEMA — Reference]] §6.

Adding or retiring a ceremony is a Schema Ceremony ([[SCHEMA — Reference]] §5); changing how one works is an edit to its page, and its version moves.

Every rite is run by the agent it was addressed to, with one exception. The session that hears "close well" is the spent one, so it reads only the card, [[Closing Well Ceremony]], and a fresh moderator runs [[Closing Well]], the page that carries the field.

The rites are listed below, grouped by what each tends.

---

## The Rites

Grouped by what each one tends; how they couple as organs of the palace is [[SUBSTRATE]] § Anatomy. **Say** holds words from each page's own field — and, for two rites, the moment that also begins them — and "…" means the page has more. **Loudon's part** is what the rite asks of whoever calls it. The steps are on each rite's page — read it before you run one.

| Ceremony | Say | When | What it does | Loudon's part |
|---|---|---|---|---|
| **Bringing finds in** | | | | |
| [[Harvest Ceremony]] | "harvest", "let's harvest" | When a body of past work waits to be sifted; stopped and started freely | Searches past conversations, documents and archives, and lists what is worth depositing, without depositing any of it. | Calls the interesting candidates as they come; in a close reading, approves each section's deposit map |
| [[Deposit Ceremony]] | "deposit", "let's deposit", "add this to the palace", … | When a find is large enough to change canon; upkeep is an edit | Brings a find into canon, as a new entry or a fold that changes what one says, through a map approved before anything is written. | Approves the map, and reads every word before it is written |
| **Sitting with pages** | | | | |
| [[The Daily Page]] | the morning's scheduled task; or "daily page", "today's page", … | Every morning | Deals one page by chance, until every page has been sat with, and ends the morning in a verdict on it. | Sits with the page, says what it brings back, and gives the verdict |
| [[Walk Ceremony]] | "walk", "let's walk" | Weekly | Follows typed links from one page and names honestly what the path turned up: a connection, a tension, or nothing. | May name the starting page; sees any proposed change before it is written |
| **Tending the whole** | | | | |
| [[Weave Ceremony]] | "weave", "let's weave" | Monthly | Reads every thread of the palace with parallel readers and a skeptic, carries each decision made since the last weave to every page, and settles links, stages and faces. | Confirms what the decision surface proposes, mostly in sampled batches; alone retires a propagate flag |
| [[Map Build Ceremony]] | "map build", "build the map" | Run by hand when a mind should learn from it; built without a ledger line every morning and at every weave | Reads every page's frontmatter and writes the palace's graph — its pages, its typed links, and the pages pointed at but not yet written — to `_ops/maps/`. | |
| [[Self-Model Update Ceremony]] | "self-model update" | At the end of a weave; when an organ is grown, retired or rewired; when the anatomy check fails | Redraws [[SUBSTRATE]]'s anatomy from the map's diff and the anatomy check, so a fresh agent can name every organ and how it couples. | Reads the diff before it is written |
| **Pages' sleep and waking** | | | | |
| [[Spore Check Ceremony]] | "spore check" | Quarterly, when Loudon calls it | Reads every sleeping page together and gives each a disposition — revive, hold, compost or fold — deciding and never reviving. | Agrees each sleeper's disposition before anything is written |
| [[Revival Ceremony]] | "revive [entry]", "let's revive [entry]", … | When Loudon asks, a Spore Check or a Daily Page decides *revive*, or he grants a steward's request | Wakes a sleeping page: it is met through something made, then made true to what it is now and given a plan. | Meets the page through something made and decides whether it is alive; reads every changed word, agrees the plan, and names a steward if he wants one |
| **Sessions' sleep and waking** | | | | |
| [[Closing Well Ceremony]] — runs [[Closing Well]] | "close well", "let's close well", "close this session well" | At the end of a session | A fresh moderator reads the day cold, draws out what it amounted to, and places each gesture — keep, hand on, leave a trace, let go — through its own rite. | Talks through the day on the panel, then says whether the reckoning is true |
| [[Baton Ceremony]] | "baton", "pass the baton", "baton this", … | Whenever a session hands the next its place in an ongoing plan | Compresses a move in flight into one file the next session catches and runs with, deleted once the move lands. | Names why it is being passed, and sees it before it is written |
| [[Return Ceremony]] | "I'm back", "what did I miss", "roll call", … | On coming back after a gap; a roll call whenever sessions are open at once | Asks the record before interpreting anything, and shows a return map, every row cited, that ends on one move to re-enter with. | Signs, adjusts or declines the return map |
| **Where the palace meets the world** | | | | |
| [[Enrichment]] | "enrich [page]", "enrich this page", "proposal round", … | On request: one page, or a round of many | Makes a page's rich face, with sound, image and interaction beside its own words, each piece challenged by a second agent and each section a proposal until approved. | Approves each section at his own pace |
| [[Sentry]] | "sentry sweep", "security sweep", "sentry, check [X]"; and, unasked, before anything widens the public surface | On request; before anything widens the public surface; its gate at every push | Sweeps for what must not leave a public repository, raises it masked, and refuses a credential at every push. | Decides each finding, raised to him masked |

**"Handoff" is ambiguous — ask first.** "Baton" is the trigger. Loudon also says "handoff", sometimes meaning an informal pass, so when he says "handoff" or "hand this off", ask *"Baton ceremony, or an informal handoff?"* and go on his answer. A training wheel while the "baton" habit sets in.

**Where to see them:** the CEREMONIES box on STIGMERGY's PROJECTS deck gives each ceremony's version, its runs since the spec changed, and what its ledger owes. A ceremony's name there opens its scroll; a standing order saved in the scroll stays there; a one-shot order goes into the ledger as owed.

### Two rites with no page

**The Schema Ceremony** begins when one of these changes is proposed ([[SCHEMA — Reference]] §5): an entry type, a link type, a required field, the stage lifecycle, or a ceremony itself, added or removed. It has steps, a postcondition and a fixed commit subject, but no page and no `trigger:`, so the machinery does not count it. **The Ceremony Reader**, below, reads a proposed rite.

---

## Ways of Asking

Not rites: palace-aware asks any conversation can make. They keep no page, ledger or scroll.

| Ask | Say | When | What it does |
|---|---|---|---|
| **Connection** | "connect this", "connect [X] to the palace" | Any conversation | Proposes typed links between the topic in hand and the pages it belongs beside. |
| **Query** | "what does the palace say about [topic]?" | Any conversation | Reads the pages on the topic, follows their typed links, and synthesizes what they say. |

---

## Reading a Ceremony

A good ceremony reads like a letter from someone who has done this before. It tells you what the ceremony is for, what a finished ceremony looks like, and what to do when things go sideways — but it doesn't over-specify the route. Ceremonies are living practices, not scripts. The metaphors and aesthetic register of a ceremony are part of its instruction, not decoration.

When you encounter a ceremony for the first time, read it the way you would read directions from a friend: for the spirit, not the letter.

### The Ceremony Reader

When a new ceremony is proposed, read it against the marks above from three seats, as three visitors arriving for the first time.

**As a gardener** — Does this ceremony tend something? Does it have a season, a rhythm, a sense of when it's needed? Does it leave the palace in better condition than it found it? A ceremony that does not tend anything is not yet a ceremony — it is a checklist.

**As a traveler** — Could someone follow this ceremony on a path they've never walked before? Not every step needs to be named, but the landmarks should be visible. Where does the ceremony begin? Where does it arrive? What would tell you that you've reached the destination?

**As a poet** — Does the language of this ceremony match what it asks you to do? A ceremony that describes an organic, slow, embodied practice should not read like an API specification. The words carry meaning. If the ceremony's register is wrong — too mechanical for a ritual, too vague for a technical procedure — the friction is worth noting.

After reading from all three perspectives, produce a short report:

- What feels alive and right in this ceremony?
- What feels stiff, over-specified, or mismatched to its own metaphors?
- What is missing — not as a checklist item, but as something the ceremony seems to want and doesn't yet have?
- Any suggested edits, offered as possibilities rather than corrections.

The report is a gift to the ceremony's author, not a verdict. A ceremony can proceed with known rough edges. The Ceremony Reader surfaces them; Loudon decides what to do with them.

**Trigger:** "Read this ceremony" / "Does this ceremony feel right?"

---

*Why this page is shaped as it is — the field rather than a ledger, the groups, the thin rows, the two readers — and the questions held open about ledgers beyond ceremonies live in [[Palace Ceremonies — Context]].*
