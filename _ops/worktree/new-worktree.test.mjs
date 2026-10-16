// new-worktree.mjs teardown, proved on a throwaway repo — never on the palace.
//
//   node --test _ops/worktree/new-worktree.test.mjs
//
// Built-ins only (node:test), so it runs in a docs worktree with no node_modules.
// Born 2026-10-15: `--remove --dry-run` removed two worktrees for real, because the
// remove path ran before the dry-run check. The control test runs the same setup
// without --dry-run, so a preview that deletes can't pass by accident.

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), "new-worktree.mjs");

let base, owner;
const g = (cwd, ...a) => execFileSync("git", a, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const run = (...a) => spawnSync("node", [SCRIPT, ...a], { cwd: owner, encoding: "utf8" });
const isLink = (p) => { try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; } };
const hasBranch = (b) => { try { g(owner, "rev-parse", "--verify", "--quiet", `refs/heads/${b}`); return true; } catch { return false; } };
const listed = (dir) => g(owner, "worktree", "list", "--porcelain").split("\n").some(l => l === `worktree ${dir}`);

// A worktree shaped like a real palace one: its own commit, a borrowed `_tools` link the
// .gitignore hides, and a deeper borrowed link it doesn't (the teardown unlinks both).
function makeWorktree(branch, { merged = false, dirty = false } = {}) {
  const dir = path.join(base, `wt-${branch.replace(/\//g, "-")}`);
  g(owner, "worktree", "add", "-q", dir, "-b", branch, "main");
  fs.writeFileSync(path.join(dir, `${branch.replace(/\//g, "-")}.md`), "work\n");
  g(dir, "add", "-A");
  g(dir, "commit", "-q", "-m", `work on ${branch}`);
  if (merged) g(owner, "merge", "-q", "--ff-only", branch);
  fs.symlinkSync(path.join(owner, "_tools"), path.join(dir, "_tools"), "dir");
  fs.mkdirSync(path.join(dir, "deep", "dir"), { recursive: true });
  fs.symlinkSync(path.join(owner, "_tools"), path.join(dir, "deep", "dir", "borrowed"), "dir");
  if (dirty) {
    fs.writeFileSync(path.join(dir, "unsaved notes.txt"), "someone's work\n");
    fs.appendFileSync(path.join(dir, "README.md"), "an edit not yet committed\n");
  }
  return dir;
}

beforeEach(() => {
  base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "newworktree-")));
  owner = path.join(base, "owner");
  fs.mkdirSync(owner);
  g(owner, "init", "-q", "-b", "main");
  g(owner, "config", "user.email", "test@palace");
  g(owner, "config", "user.name", "Test Palace");
  g(owner, "config", "commit.gpgsign", "false");
  fs.writeFileSync(path.join(owner, "README.md"), "# owner\n");
  fs.writeFileSync(path.join(owner, ".gitignore"), "_tools\n");
  g(owner, "add", "-A");
  g(owner, "commit", "-q", "-m", "seed");
  fs.mkdirSync(path.join(owner, "_tools"));
  fs.writeFileSync(path.join(owner, "_tools", "weights.bin"), "16 GB, pretend\n");
});
afterEach(() => { fs.rmSync(base, { recursive: true, force: true }); });

test("--remove --delete-branch --dry-run changes nothing on a merged, clean worktree", () => {
  const dir = makeWorktree("feat/merged", { merged: true });
  const r = run("--name", "feat/merged", "--dir", dir, "--remove", "--delete-branch", "--dry-run");
  assert.equal(r.status, 0, r.stderr);

  assert.match(r.stdout, /Teardown preview/);
  assert.match(r.stdout, /\(on feat\/merged\)/);
  assert.match(r.stdout, /2 owner-pointing symlink\(s\) would be unlinked/);
  assert.match(r.stdout, /tree:\s+clean/);
  assert.match(r.stdout, /merged into HEAD \(main\); `git branch -d` would delete it/);
  assert.match(r.stdout, /--dry-run: nothing changed/);
  assert.doesNotMatch(r.stdout, /✓ (unlinked|worktree removed|branch)/);

  assert.ok(fs.existsSync(dir), "worktree dir still there");
  assert.ok(listed(dir), "git still knows the worktree");
  assert.ok(isLink(path.join(dir, "_tools")), "_tools link still there");
  assert.ok(isLink(path.join(dir, "deep", "dir", "borrowed")), "deep link still there");
  assert.ok(hasBranch("feat/merged"), "branch still there");
});

test("--remove --dry-run changes nothing on an unmerged, dirty worktree, with -d or -D", () => {
  const dir = makeWorktree("feat/unmerged", { dirty: true });

  const safe = run("--name", "feat/unmerged", "--dir", dir, "--remove", "--delete-branch", "--dry-run");
  assert.equal(safe.status, 0, safe.stderr);
  assert.match(safe.stdout, /tree:\s+NOT clean — 2 changed or untracked path\(s\)/);
  assert.match(safe.stdout, /unsaved notes\.txt/);
  assert.match(safe.stdout, /1 commit\(s\) not merged into HEAD \(main\); `git branch -d` would refuse/);

  const forced = run("--name", "feat/unmerged", "--dir", dir, "--remove", "--force-delete", "--dry-run");
  assert.equal(forced.status, 0, forced.stderr);
  assert.match(forced.stdout, /`git branch -D` would DISCARD those commits/);

  assert.ok(fs.existsSync(path.join(dir, "unsaved notes.txt")), "untracked work still there");
  assert.match(fs.readFileSync(path.join(dir, "README.md"), "utf8"), /not yet committed/);
  assert.ok(isLink(path.join(dir, "_tools")), "_tools link still there");
  assert.ok(listed(dir), "git still knows the worktree");
  assert.ok(hasBranch("feat/unmerged"), "branch still there");
  assert.match(g(owner, "log", "-1", "--format=%s", "feat/unmerged"), /work on feat\/unmerged/);
});

test("--remove --dry-run with no --delete-branch says the branch is kept", () => {
  const dir = makeWorktree("feat/keep", { merged: true });
  const r = run("--name", "feat/keep", "--dir", dir, "--remove", "--dry-run");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /feat\/keep — merged into HEAD \(main\); kept \(no --delete-branch\)/);
  assert.ok(fs.existsSync(dir));
});

test("control: the same teardown without --dry-run really removes, and spares the owner", () => {
  const dir = makeWorktree("feat/merged", { merged: true });
  const r = run("--name", "feat/merged", "--dir", dir, "--remove", "--delete-branch");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /✓ 2 owner-pointing symlink\(s\) unlinked/);
  assert.ok(!fs.existsSync(dir), "worktree dir gone");
  assert.ok(!listed(dir), "git forgot the worktree");
  assert.ok(!hasBranch("feat/merged"), "branch gone");
  assert.ok(fs.existsSync(path.join(owner, "_tools", "weights.bin")), "owner's _tools untouched");
});
