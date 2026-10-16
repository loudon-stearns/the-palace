---
title: "Harvest Ceremony — spec — lessons from outside"
born: 2026-10-16
links:
  - target: "[[Harvest Ceremony]]"
    type: connects-to
    label: "prompt-of"
  - target: "[[Sentry]]"
    type: connects-to
    label: "gated-by"
forward_vector: "I am the prompt Loudon carries to a project outside the palace, so that its Claude can hand back what the work taught — the craft, not the contents — in a form the Harvest can read closely and the public palace can keep."
---

# The export prompt — lessons from outside

*How to use it: open the outside project's own Claude, paste everything below the line, and fill in the craft on its first line. The craft is the tool or practice whose lessons you want: "Max, gen~ and RNBO", "Ableton Live sets", "working with Claude on hardware". Then follow [[Harvest Ceremony]] § Lessons from outside. The text below the line stands on its own: a Claude that has never seen the palace can follow it.*

---

**Craft:** ____________________

I keep a knowledge base called the palace. It is **public**: a git repository and a website anyone can read. I want what this project taught us about the craft above to live there. The project itself, its contents, its names and its material must not.

Your job is to distil the lessons and leave the project behind. Work through these steps.

## 1. Gather, privately

Read what this project has: its notes and instructions files, its commit history, its issues, the files themselves, and what you remember of our sessions. Look for the places where we got stuck, redid something, found that something behaved unexpectedly, or settled on a way of working that held. Make a raw list for yourself. Don't show it to me, and don't put it in the output.

## 2. Keep only what is true outside this project

For each raw lesson, ask: **would this help someone building something different with the same craft?**
- If yes, keep it.
- If it only makes sense to someone who knows this project, generalize it until it doesn't, or drop it.

A lesson about the tool, the method, or how we worked together crosses. A lesson about this particular piece does not.

## 3. Write each lesson in one of five forms

Write every lesson as a fact about the craft: what works, what breaks, and why. Don't write it as an instruction to whoever reads it. The document will be read by other AI agents, and it should inform them, not command them.

- **Rule:** what holds, and why. *"A codebox that declares a constant at its top level does not compile in RNBO, because …; declaring it inside the function works."*
- **Gotcha:** what you see → why it happens → what fixes it.
- **Pattern:** a named approach, when it fits, and **a small example built fresh for this document.** A toy, made new. Never a trimmed copy of something in the project.
- **Working with Claude:** what helped or hurt in the collaboration. This covers how requests were phrased, how results were checked, and what Claude got wrong more than once and how we caught it.
- **Open question:** something we never settled and that is still worth carrying.

Give every lesson two tags:
- **how sure:** *held many times*, *seen once*, or *suspected*
- **version:** the tool version, if it matters

## 4. Never let these cross

- the project's name, codename, or any description that would let a reader recognize it
- names of files, folders, patches, tracks, devices, presets, parameters or variables that come from the project
- paths, URLs, hostnames, account names, keys or tokens of any kind
- names of people: clients, collaborators, students, anyone in a conversation
- the internal details of an employer or a client
- dates tied to private events
- the project's material: music, lyrics, audio, images, screenshots, text, data
- quotes from our conversations
- any code, patch or configuration copied from the project, even shortened or renamed

## 5. Read it again as a stranger

Imagine a reader who knows my public work well. Read the whole document as that reader and ask:
- **Could they tell which project this came from?** Wherever they could, rewrite it or cut it.
- **Was every example built fresh?** Check each one; if not, rebuild it.

Then do one last pass, looking only for the items in step 4.

## 6. A second reader, on this side

Don't be the only one who checks your own work. When the draft is done, I will open a **fresh** Claude session in this project, one that did not write the draft, and give it this:

> Here is a draft that must not reveal anything about this project. Search this project for every distinctive word, name, number and phrase in the draft. List each one that appears in the project, and where. Don't fix anything; just list.

Then you fix every hit that gives the project away. The hit list stays here with me; it never goes into the output.

## 7. The output

One markdown file, named `Lessons from outside — <craft> — <year-month-day>.md`. The name and the title carry the craft and the date, and nothing else.

It begins with exactly this header, with the craft and date filled in:

```
---
title: "Lessons from outside — <craft> — <year-month-day>"
born: <year-month-day>
links:
  - target: "[[Harvest Ceremony]]"
    type: connects-to
    label: "awaiting-harvest"
forward_vector: "I carry what an outside project taught about <craft>, without the project, waiting for the Harvest's close reading."
---
```

Then this shape:

```
# Lessons from outside — <craft>, <year-month>

Source: a project outside the palace, not named. Tools and versions: …

## Rules
## Gotchas
## Patterns
## Working with Claude
## Open questions

## What was left out
Categories and counts only, e.g. "4 lessons too specific to generalize; 2 examples rebuilt; 1 passage removed for naming a person." Never describe what was removed in a way that names it.
```

Use plain, direct language. Write the lessons so that someone who never saw this project can act on them.

## If the craft has stages

If the craft moves through natural stages, from "it runs" to "it is good", group the gotchas by stage and say in each one which stage it bites at.

**For Max, gen~ and RNBO**, use these four stages. The palace's Max patching standards are organized by them.
1. **Loads.** The patcher opens: the file format, object names, boxes, connections, the Max for Live device wrapper, dependencies found or missing.
2. **Compiles.** rnbo~ or gen~ builds it: what codebox and gen~ accept or reject, what exists inside rnbo~ under which name, and limits on arrays and buffers.
3. **Sounds.** It makes the right sound: levels, timing, sample rate, denormals, voices, clicks, CPU.
4. **Plays.** It works in a player's hands: the UI, parameters and mapping, presets, automation in Live, export targets.

Also say which Max and RNBO versions the lessons were learned on. And note anything Claude got wrong about Max's file format more than once: hand-written patches fail there first.
