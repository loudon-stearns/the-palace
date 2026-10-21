// scenarios.mjs — the scenarios a birth can play, and what each rests on. Shared by birth.mjs, due.mjs and grade.mjs.
//
// One scenario so far; the rest wait on Loudon's Part 3 answers (DESIGN § Part 3). A scenario carries:
//   turns  — what Loudon says, turn by turn. A second turn is played with --resume (section G's insistence).
//   tests  — the palace files the scenario rests on, relative to the palace root: due.mjs reads these.
//   canon  — the passages the grader judges against, read at the run's own commit: [{ file, heading }].
//   tellBy — "mechanical" (read from the stream) or "judgment" (a separate grader, grade.mjs).
// The "we want" line is not here. It is Loudon's, and lives in the DESIGN draft, where he corrects it; grade.mjs
// reads it from there.

export const SCENARIOS = {
  D1: {
    turns: ["what's the difference between a scroll and a ledger?"],
    tests: ["CLAUDE.md", "SCHEMA — Reference.md"],
    canon: [{ file: "CLAUDE.md", heading: "## A page and its folder" }, { file: "SCHEMA — Reference.md", heading: "## 8. Entry Bundles" }],
    tellBy: "judgment",
  },
};

// What every child is born with (CLAUDE.md § Born with). The birth is refused without all seven. The World files
// are space-free symlinks; WORLD maps each to the file it points at, so a diff to the real file is seen.
export const BORN_WITH = ["CLAUDE.md", "JEWEL.md", "FOUR_PILLARS.md", "Palace_Philosophies.md",
  "Cooperation_Yields_Agency.md", "Hilaritas_Generator.md", "Modes_of_Collaboration.md"];
export const WORLD = {
  "FOUR_PILLARS.md": "FOUR PILLARS.md", "Palace_Philosophies.md": "Palace Philosophies.md",
  "Cooperation_Yields_Agency.md": "Cooperation Yields Agency.md", "Hilaritas_Generator.md": "Hilaritas Generator.md",
  "Modes_of_Collaboration.md": "Modes of Collaboration.md",
};

// A change to any of these puts the whole suite at risk (DESIGN § When it runs, tier 2): what a child is born
// with, and what it grows into.
export const WHOLE_SUITE = [...BORN_WITH, ...Object.values(WORLD), "ELDER.md", "SCHEMA.md"];
