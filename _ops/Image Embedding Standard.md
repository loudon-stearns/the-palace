---
title: Image Embedding Standard
type: meta
pillars:
  - tools
  - practice
born: 2026-03
stage: mature
version: 3
forward_vector: "I am the reason the palace adds an image: a picture earns its place by carrying what the words cannot. Figures do it by teaching, faces by helping a reader remember, and I hold each to its own test. I want to be a check the Weave can run, not a ceremony: does each figure teach, and does each face say in a line what it shows?"
links:
  - target: "[[SCHEMA]]"
    type: deepens
  - target: "[[Deposit Ceremony]]"
    type: enables
    label: figures-that-teach
  - target: "[[README - The Palace Guide]]"
    type: connects-to
    label: one-of-three-standards
  - target: "[[Hero and Avatar Maker]]"
    type: connects-to
    label: faces-held-to-their-own-test
  - target: "[[SUBSTRATE]]"
    type: connects-to
    label: conserved-markings
---
# Image Embedding Standard

![[Image Embedding Standard — hero.png]]

Why the palace adds an image, and what each one owes the page it sits on. One of three standards in the palace's visual language, beside [[Mermaid Diagram Standard]] and [[Technical Diagram Standard]], which say how to draw; this one says when a picture belongs at all.

## The test

A picture earns its place by carrying what the words cannot. Take it away: would the reader lose something the text can't give back? If not, it doesn't belong. If so, it belongs *because* of that, and the page should say what it is.

The palace keeps two kinds of picture, and the test asks each a different question.

**A figure teaches.** It sits in the body and collapses a relationship into a shape, keeps a structure that only space can hold, or shows a motion that language can only gesture at. Take it away and the reader knows less. One figure that teaches is worth ten that decorate.

**A face helps a reader remember.** It is the hero at the top of a page, made by the [[Hero and Avatar Maker]]: "a way to help humans remember and understand the page" (Loudon, 2026-10-15). Take it away and the reader knows the same, but finds the page again less easily. That is a real job, and a different one. A face that could sit on any page has failed it.

## What each one owes

**A figure owes alt text and a caption.** The alt text, inside the embed's pipe, says what the picture carries, for any reader who cannot see it, agents first among them. The caption, one italic line directly below, is its argument: what it claims, not what it shows. If you could write the caption without looking hard at the image, the caption is wrong. A figure from another work names its source, year and basis for use in the caption.

**A face owes one line, kept off the page.** It takes no caption and no alt text in its embed; a caption would turn every page's first line into commentary on its own picture. Instead its face file (`<bundle>/<Title> — face.json`) carries an `idiom`, one line on what the picture shows. That is what an agent reads in place of seeing it.

## Filing Protocol

Every picture lives in the bundle of the page it serves ([[SCHEMA]] §8); one that serves several lives with the page that owns it most. Its filename is a claim about what it shows (`kuramoto-order-parameter-vs-coupling-strength.svg`, never `diagram.png`); a face takes the house name `<Title> — hero.png`. Nothing is embedded from an external URL; archive it first. A generated technical figure keeps its `.tex` source beside its `.svg`, per [[Technical Diagram Standard]]. Prefer SVG for anything you draw.

When a page arrives with a picture, file the picture first, then write the page, then open it in Obsidian to see that the embed resolves: an embed that fails is invisible in Reading View.

## What doesn't belong

Screenshots of text that should be quoted. Pictures used as breaks or atmosphere inside the body. Figures with no source. Placeholders: if the figure isn't ready, say so in prose.

## Live example

![[palace-typed-link-graph-demo.svg|Four palace concepts — Kuramoto Coupling, Cooperation Yields Agency, Spinoza Conatus, and Four Pillars — connected by typed directed links including mirrors, enables, connects-to, and couples-with]]
*A fragment of the palace graph — solid arrows for directed relationships, dashed lines for symmetric ones, hubs double-ringed. Created 2026-03 as this standard's example.*

## Open questions

- Should an external figure get its own `source` entry, or is the caption's attribution enough?
- When a bundle holds many pictures, does it want an `images/` folder, or stay flat? Held until one hurts.
- Does a face that fails to be recognized blind (the Keystone Test, 2026-10-31) want remaking, or is a face allowed to be quiet?

---

*Cut in v3 (2026-11): the Obsidian syntax (it is Obsidian's), the filename table (one example does its work), and the answered question on generated graphs (now [[Weave Ceremony]]'s). The two deposit steps shrank to one line under Filing.*
