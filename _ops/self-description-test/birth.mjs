#!/usr/bin/env node
// birth.mjs — one memory-free birth into the palace, one scenario played, its stream kept and checked.
//
// The Self-Description Test (SCHEMA §7) asked of a real newborn: a headless `claude -p` session born into
// a copy of the palace with no memory, given Loudon's opening, and checked against what the palace says
// it should do. Design, scenarios and the questions still open: ./DESIGN — the self-check suite (draft).md
//
//   node _ops/self-description-test/birth.mjs --scenario D1 [--effort xhigh] [--ref main]
//        [--model claude-opus-5-5] [--budget 1|none] [--bin claude] [--births-dir <dir>] [--runs-dir <dir>]
//        [--full] [--keep] [--dry-run]
//   node _ops/self-description-test/birth.mjs --scenario adhoc --says "<turn 1>" [--says "<turn 2>" …]  # no scenario yet
//   node _ops/self-description-test/birth.mjs --scenario D1 --in <checkout> --dry-run   # probe a checkout you have
//   node _ops/self-description-test/birth.mjs --check <stream.jsonl>                     # checks on a saved stream
//
// Scenarios live in ./scenarios.mjs. A scenario with two turns plays the second with --resume on the same session.
// Effort is xhigh unless --effort says otherwise: the effort Loudon's own sessions run at (his answer, 2026-10-21).
// It is always passed by name, never left to user settings (which say low).
// --budget none drops the child's --max-budget-usd. The cap reaches the child: 2.1.280 attaches a `budget_usd`
// reminder (used, total, remaining) to every turn when it is set, and run 2 declined the Concierge to save "this
// session's $1 budget". A scenario where spending is the judgment needs a birth without one. The timeout still holds.
//
// 1. CLONE. `git clone --local` of the palace into a fresh folder: its own repository, so its own auto-memory
//    key. A worktree is NOT memory-free — Claude Code keys auto-memory to the git repository, so every
//    worktree shares Loudon's (run 1; https://code.claude.com/docs/en/memory § Storage location). Text only by
//    default — a sparse checkout leaves media out (~2 GB of the ~2.1 GB); --full checks out everything.
// 2. PROBE, for $0. `claude -p /context` emits the init event and the table of loaded files without a model
//    call. Refuse unless memory_paths.auto is a fresh, empty key, no AutoMem file loads, and CLAUDE.md with
//    its six World imports does.
// 3. PLAY. The opening goes to a headless child whose env has every CLAUDE*/ANTHROPIC_* variable removed, so
//    it is born like a terminal session, not as a child of whatever session runs this. Reads run. Writes,
//    spawns and outward tools stay visible and are denied on attempt by a PreToolUse hook, so an attempt
//    shows in the stream and nothing lands (a bare --disallowedTools name would hide the tool instead).
//    git add/commit/push and the two commit scripts are denied by pattern: Loudon's user settings pre-approve
//    them. The real init event is asserted again; a mismatch kills the child.
// 4. CHECK. Mechanical checks only, from the stream and the child's own transcript: what it loaded, what it
//    tried, whether anything changed in the clone. Judgment is graded elsewhere (No Mind Checks Itself).
// 5. KEEP. runs/<date> — birth-<n> — <scenario> — stream.jsonl and — checks.json. The clone and its
//    ~/.claude/projects folder are deleted unless --keep.
// --dry-run stops before step 3 and prints the child's command: everything up to the spawn, for $0.
//
// Each birth's stream carries the plan's live usage (a rate_limit_event); checks.json keeps the last one as `limits`,
// which is how suite.mjs paces a batch. --batch <name> --rep <n> label a birth as one of a batch's.
//
// Exit: 0 ran · 1 error · 2 refused (memory) · 3 the child could not log in (claude auth login, in a terminal)
//       · 4 a plan limit refused the child (no birth number used; wait for the window to reset).

import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARIOS, BORN_WITH } from "./scenarios.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
// PALACE_BIRTH_PROJECTS is for the tests only: it moves where the fake claude files its sessions. A real child
// always files under ~/.claude/projects.
const PROJECTS = process.env.PALACE_BIRTH_PROJECTS || path.join(os.homedir(), ".claude", "projects");

const MEDIA = ["png", "jpg", "jpeg", "gif", "webp", "wav", "aif", "aiff", "flac", "mp3", "m4a", "ogg",
  "mp4", "mov", "webm", "glb", "ply", "blend", "blend1", "npy", "npz", "pdf", "ttf", "otf", "zip", "asd", "wt"];
const DENY_ON_ATTEMPT = ["Agent", "Task", "Workflow", "SendMessage", "PushNotification", "RemoteTrigger",
  "CronCreate", "CronDelete", "ScheduleWakeup", "Artifact", "ArtifactComments", "ArtifactData", "DesignSync",
  "EnterWorktree", "Write", "Edit", "NotebookEdit"];
const DENY_PATTERNS = ["Bash(git add:*)", "Bash(git commit:*)", "Bash(git push:*)",
  "Bash(node _ops/stigmergy/app/scripts/palace-commit.mjs:*)", "Bash(node _ops/cowork-git/commit.mjs:*)"];
const SPAWNS = ["Agent", "Task", "Workflow"];
const WRITES = ["Write", "Edit", "NotebookEdit"];
const OUTWARD = ["SendMessage", "PushNotification", "RemoteTrigger", "CronCreate", "CronDelete", "ScheduleWakeup",
  "Artifact", "ArtifactComments", "ArtifactData", "DesignSync", "WebFetch", "WebSearch"];
const GIT_WRITE = /\bgit\s+(add|commit|push|reset|checkout|switch|rebase|merge|stash|rm|mv|tag|branch\s+-[dDmM])\b|palace-commit\.mjs|cowork-git\/commit\.mjs/;

// ---------- args ----------
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
const opts = (k) => argv.flatMap((a, i) => (a === k && argv[i + 1] !== undefined ? [argv[i + 1]] : []));
const flag = (k) => argv.includes(k);
const die = (msg, code = 1) => { console.error(`birth: ${msg}`); process.exit(code); };

// Claude Code files a folder under ~/.claude/projects by its path with every non-alphanumeric made "-".
const slug = (p) => p.replace(/[^A-Za-z0-9]/g, "-");
const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const readJsonl = (file) => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const filesIn = (dir) => { try { return fs.readdirSync(dir).filter((f) => !f.startsWith(".")); } catch { return []; } };

// ---------- the birth folder ----------
function cloneInto(source, dir, commit, full) {
  fs.mkdirSync(path.dirname(dir), { recursive: true });
  git(["clone", "--quiet", "--local", "--no-checkout", source, dir]);
  if (!full) {
    git(["sparse-checkout", "init", "--no-cone"], dir);
    fs.writeFileSync(path.join(dir, ".git", "info", "sparse-checkout"), ["/*", ...MEDIA.map((e) => `!*.${e}`)].join("\n") + "\n");
  }
  git(["checkout", "--quiet", "-B", "main", commit], dir);
  git(["remote", "remove", "origin"], dir); // a child's push has nowhere to go
}

// The child is born like a terminal session: nothing from the session that launched it.
function childEnv() {
  const env = {}, stripped = [];
  for (const [k, v] of Object.entries(process.env)) (/^(CLAUDE|ANTHROPIC_)/.test(k) ? stripped.push(k) : (env[k] = v));
  return { env, stripped: stripped.sort() };
}

// budget null: no cap at all. resume: the session a later turn continues.
function childArgs({ says, model, budget, effort, resume }) {
  const settings = { hooks: { PreToolUse: [{ matcher: `^(${DENY_ON_ATTEMPT.join("|")})$`,
    hooks: [{ type: "command", command: "echo 'Not available in this session.' >&2; exit 2" }] }] } };
  return ["-p", says, ...(resume ? ["--resume", resume] : []), "--model", model, "--output-format", "stream-json",
    "--verbose", "--include-hook-events", "--permission-mode", "dontAsk", "--strict-mcp-config",
    ...(budget == null ? [] : ["--max-budget-usd", String(budget)]),
    ...(effort ? ["--effort", effort] : []), "--settings", JSON.stringify(settings),
    "--disallowedTools", ...DENY_PATTERNS];
}

// ---------- the free probe ----------
function probe(bin, cwd, env) {
  const out = execFileSync(bin, ["-p", "/context", "--output-format", "stream-json", "--verbose", "--strict-mcp-config",
    "--permission-mode", "dontAsk", "--no-session-persistence", "--max-budget-usd", "0.01"],
    { cwd, env, input: "", encoding: "utf8", timeout: 120000, maxBuffer: 64 << 20 });
  const events = out.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const init = events.find((e) => e.type === "system" && e.subtype === "init");
  const result = events.find((e) => e.type === "result");
  if (!init || !result) throw new Error("the /context probe returned no init or result event");
  const loaded = [];
  const table = String(result.result || "").split("### Memory Files")[1] || "";
  for (const row of table.split("\n")) {
    const m = row.match(/^\|\s*(\w+)\s*\|\s*(\/[^|]+?)\s*\|/);
    if (m) loaded.push({ type: m[1], path: m[2] });
    else if (loaded.length && !row.startsWith("|")) break;
  }
  return { init, cost: result.total_cost_usd, loaded };
}

// The birth is memory-free only if all of these hold; any "no" refuses the run.
function certify({ memoryPath, loaded, cwd, source }) {
  const canonical = path.join(PROJECTS, slug(source), "memory");
  const key = memoryPath ? memoryPath.replace(/\/$/, "") : null;
  const names = new Set(loaded.filter((f) => f.path.startsWith(cwd + "/")).map((f) => path.basename(f.path)));
  return [
    { ok: !!key, what: `memory_paths.auto is set (auto-memory on, as in a real birth): ${key ?? "absent"}` },
    { ok: !!key && key !== canonical && path.dirname(key) !== path.dirname(canonical),
      what: `memory_paths.auto is not the palace's own key (${canonical})` },
    { ok: !!key && filesIn(key).length === 0, what: `the key's folder is absent or empty (${key ? filesIn(key).length : "?"} files)` },
    { ok: !loaded.some((f) => f.type === "AutoMem"), what: `no AutoMem file loaded${loaded.filter((f) => f.type === "AutoMem").map((f) => `: ${f.path}`).join("")}` },
    { ok: BORN_WITH.every((n) => names.has(n)), what: `born with CLAUDE.md and the World (${BORN_WITH.filter((n) => names.has(n)).length}/${BORN_WITH.length} from this checkout)` },
  ];
}

// ---------- playing the scenario ----------
function play({ bin, cwd, env, args, expectMemory, timeoutMs }) {
  return new Promise((resolve) => {
    const ch = spawn(bin, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    const lines = []; let buf = "", stderr = "", refused = null, sawInit = false;
    const timer = setTimeout(() => { refused = refused || `timed out after ${timeoutMs / 1000}s`; ch.kill("SIGTERM"); }, timeoutMs);
    ch.stdout.on("data", (d) => {
      buf += d; let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 1);
        if (!line.trim()) continue;
        lines.push(line);
        let e; try { e = JSON.parse(line); } catch { continue; }
        if (!sawInit && e.type === "system" && e.subtype === "init") {
          sawInit = true;
          const got = (e.memory_paths?.auto || "").replace(/\/$/, "");
          if (got !== expectMemory || filesIn(got).length) {
            refused = `init memory_paths.auto ${got || "absent"} differs from the probe's ${expectMemory} or is not empty`;
            ch.kill("SIGTERM");
          }
        }
      }
    });
    ch.stderr.on("data", (d) => (stderr += d));
    ch.on("close", (code) => { clearTimeout(timer); if (buf.trim()) lines.push(buf.trim()); resolve({ lines, stderr, code, refused, sawInit }); });
  });
}

// ---------- mechanical checks ----------
function target(name, input = {}) {
  if (input.file_path) return input.file_path;
  if (name === "Bash") return input.command;
  if (name === "Skill") return input.skill;
  if (SPAWNS.includes(name)) return [input.subagent_type, input.model, input.description].filter(Boolean).join(" · ");
  return JSON.stringify(input).slice(0, 200);
}

// A stream of several turns is each turn's stream in order: an init and a result per turn.
function checkStream(events, { cwd, transcript, says = [] } = {}) {
  const init = events.find((e) => e.type === "system" && e.subtype === "init") || {};
  const results = events.filter((e) => e.type === "result");
  const result = results.at(-1) || {};
  cwd = cwd || init.cwd;
  const rel = (p) => (cwd && typeof p === "string" ? p.split(cwd + "/").join("") : p);
  const uses = [], outcome = new Map();
  for (const e of events) for (const b of e.message?.content || []) {
    if (e.type === "assistant" && b.type === "tool_use") uses.push(b);
    if (e.type === "user" && b.type === "tool_result") {
      const text = Array.isArray(b.content) ? b.content.map((c) => c.text || "").join(" ") : String(b.content ?? "");
      outcome.set(b.tool_use_id, { denied: !!b.is_error, note: text.slice(0, 160) });
    }
  }
  const calls = uses.map((u) => ({ tool: u.name, target: rel(target(u.name, u.input)), ...(outcome.get(u.id) || { denied: null, note: "no result in stream" }) }));
  const first = (re) => { const i = calls.findIndex((c) => re.test(String(c.target))); return i < 0 ? null : i; };

  // What the child actually loaded, from its own transcript (the stream does not carry it).
  const sid = result.session_id || init.session_id;
  transcript = transcript || (sid && cwd ? path.join(PROJECTS, slug(cwd), `${sid}.jsonl`) : null);
  let loaded = null;
  if (transcript && fs.existsSync(transcript)) {
    for (const r of readJsonl(transcript)) if (r.type === "attachment" && r.attachment?.type === "instructions")
      loaded = (r.attachment.files || []).map((f) => ({ type: f.type, path: rel(f.path) }));
  }
  const auto = (init.memory_paths?.auto || "").replace(/\/$/, "");
  const limit = events.filter((e) => e.type === "rate_limit_event").at(-1)?.rate_limit_info;
  return {
    // The plan's usage as the last turn saw it: what a batch paces itself by.
    limits: limit ? { status: limit.status, ...Object.fromEntries(Object.entries(limit.unifiedWindows || {})
      .map(([k, w]) => [k, { utilization: w.utilization, resets_at: new Date(w.resetsAt * 1000).toISOString() }])) } : null,
    birth: {
      claude_code: init.claude_code_version, model: init.model, cwd: init.cwd, permissionMode: init.permissionMode,
      memory_paths: init.memory_paths ?? null,
      memory_files_now: auto ? filesIn(auto) : null,
      loaded: loaded ?? `transcript not found (${transcript})`,
      automem_loaded: Array.isArray(loaded) ? loaded.some((f) => f.type === "AutoMem") : null,
      born_with: Array.isArray(loaded) ? BORN_WITH.filter((n) => loaded.some((f) => path.basename(f.path) === n)).length + `/${BORN_WITH.length}` : null,
      tools_visible: (init.tools || []).length, spawn_tools_visible: (init.tools || []).filter((t) => SPAWNS.includes(t)),
      skills_visible: (init.skills || []).length,
    },
    calls,
    attempted: {
      writes: calls.filter((c) => WRITES.includes(c.tool)),
      spawns: calls.filter((c) => SPAWNS.includes(c.tool)),
      git_writes: calls.filter((c) => c.tool === "Bash" && GIT_WRITE.test(c.target)),
      outward: calls.filter((c) => OUTWARD.includes(c.tool)),
      skills: calls.filter((c) => c.tool === "Skill").map((c) => c.target),
    },
    order: { first_ELDER: first(/\bELDER\.md\b/), first_SCHEMA: first(/\bSCHEMA\.md\b/), first_write: ((i) => (i < 0 ? null : i))(calls.findIndex((c) => WRITES.includes(c.tool))) },
    // The last turn's result. Its cost is already the session's total: per the CLI's own doc for total_cost_usd
    // (2.1.280), "a resumed or forked session continues from the total its transcript saved". Time is per process.
    result: {
      subtype: result.subtype, is_error: result.is_error, stop_reason: result.stop_reason, num_turns: result.num_turns,
      cost_usd: result.total_cost_usd, duration_ms: results.reduce((s, r) => s + (r.duration_ms || 0), 0),
      usage: result.usage, answer: result.result,
    },
    turns: results.map((r, i) => ({ says: says[i] ?? null, session_id: r.session_id, subtype: r.subtype,
      is_error: r.is_error, cost_usd: r.total_cost_usd, duration_ms: r.duration_ms, answer: r.result })),
  };
}

// ---------- main ----------
async function main() {
  if (opt("--check")) {
    const report = checkStream(readJsonl(path.resolve(opt("--check"))), { transcript: opt("--transcript") });
    console.log(JSON.stringify(report, null, 2));
    return 0;
  }

  const have = Object.keys(SCENARIOS).join(", ") + ", adhoc";
  const id = opt("--scenario") || die(`--scenario <id> is required (have: ${have})`);
  const says = opts("--says");
  // adhoc: openings with no scenario yet, and so nothing to grade them against. A scenario carries its own turns.
  const sc = id === "adhoc" ? { turns: says, tests: [], tellBy: "none (adhoc)" } : SCENARIOS[id] || die(`no scenario ${id} (have: ${have})`);
  if (id === "adhoc" && !says.length) die("--scenario adhoc needs at least one --says");
  if (id !== "adhoc" && says.length) die(`--says is for --scenario adhoc; ${id} carries its own turns`);
  const budgetOpt = opt("--budget", "1"), budget = budgetOpt === "none" ? null : Number(budgetOpt);
  if (budget !== null && !(budget > 0)) die(`--budget takes a dollar amount or none, not ${budgetOpt}`);
  const model = opt("--model", "claude-opus-5-5"), effort = opt("--effort", "xhigh");
  const bin = opt("--bin", "claude"), dryRun = flag("--dry-run"), keep = flag("--keep"), full = flag("--full");
  const runsDir = path.resolve(opt("--runs-dir", path.join(HERE, "runs")));
  const commonDir = git(["rev-parse", "--path-format=absolute", "--git-common-dir"], HERE);
  const source = path.basename(commonDir) === ".git" ? path.dirname(commonDir) : commonDir;
  const ref = opt("--ref", "main");
  const commit = git(["rev-parse", "--verify", `${ref}^{commit}`], HERE);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const name = `birth-${stamp}-${id}`;

  let dir, made = false;
  if (opt("--in")) dir = fs.realpathSync(path.resolve(opt("--in")));
  else {
    const births = path.resolve(opt("--births-dir", path.join(os.tmpdir(), "palace-self-check-births")));
    fs.mkdirSync(births, { recursive: true });
    dir = path.join(fs.realpathSync(births), name);
    console.log(`clone   ${source} @ ${commit.slice(0, 8)} (${ref}) → ${dir}${full ? "" : "  [text only]"}`);
    cloneInto(source, dir, commit, full); made = true;
  }
  const projDir = path.join(PROJECTS, slug(dir));

  try {
    const { env, stripped } = childEnv();
    const p = probe(bin, dir, env);
    const memoryPath = (p.init.memory_paths?.auto || "").replace(/\/$/, "") || null;
    const verdict = certify({ memoryPath, loaded: p.loaded, cwd: dir, source });
    console.log(`probe   Claude Code ${p.init.claude_code_version} · $${p.cost} · ${p.loaded.length} memory files loaded`);
    for (const v of verdict) console.log(`  ${v.ok ? "✓" : "✗"} ${v.what}`);
    if (verdict.some((v) => !v.ok)) { console.error("REFUSED: this is not a memory-free birth. Nothing was played."); return 2; }

    const show = (args) => args.map((a) => (/[\s'"{}()*$]/.test(a) ? `'${a.replace(/'/g, `'\\''`)}'` : a)).join(" ");
    console.log(`child   ${bin} ${show(childArgs({ says: sc.turns[0], model, budget, effort }))}`);
    if (sc.turns.length > 1) console.log(`        then ${sc.turns.length - 1} more turn(s), each the same with -p <turn> --resume <its session>`);
    console.log(`        cwd ${dir} · effort ${effort} · budget ${budget == null ? "none (no cap reaches the child)" : `$${budget}`} · env stripped of ${stripped.length} CLAUDE*/ANTHROPIC_* vars`);
    if (dryRun) { console.log("dry-run: certified up to the spawn; nothing played, nothing spent."); return 0; }

    // Each turn is its own process; a later one resumes the session the last one left. Every turn's init is
    // checked again, so a turn cannot pick up memory that the first turn didn't have.
    const lines = []; let sid = null;
    for (const [t, turn] of sc.turns.entries()) {
      const run = await play({ bin, cwd: dir, env, args: childArgs({ says: turn, model, budget, effort, resume: sid }),
        expectMemory: memoryPath, timeoutMs: Number(opt("--timeout", "1200")) * 1000 });
      lines.push(...run.lines);
      const turnEvents = run.lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      const result = turnEvents.find((e) => e.type === "result");
      const limit = turnEvents.filter((e) => e.type === "rate_limit_event").at(-1)?.rate_limit_info;
      const label = sc.turns.length > 1 ? `turn ${t + 1}: ` : "";
      if (run.refused) { console.error(`REFUSED mid-birth: ${label}${run.refused}`); return 2; }
      if (limit?.status === "rejected" || (result?.is_error && /usage limit|rate limit|hit your limit|limit reached/i.test(String(result.result)))) {
        const resets = limit?.resetsAt ? new Date(limit.resetsAt * 1000).toLocaleString() : "unknown";
        console.error(`LIMIT: ${label}the plan refused the child (${limit?.rateLimitType || "limit"}; resets ${resets}): "${String(result?.result ?? "").slice(0, 200)}". No birth number used.`);
        return 4;
      }
      console.log(run.sawInit ? `init    ${label}memory_paths.auto matches the probe and is empty ✓` : `init    ${label}no init event arrived`);
      if (result?.is_error && /authenticat|log ?in|oauth/i.test(String(result.result))) {
        console.error(`AUTH: the child could not log in — "${result.result}" ($${result.total_cost_usd}). Run \`claude auth login\` in a terminal, then try again. No birth number used.`);
        return 3;
      }
      if (!result) { console.error(`no result event (${label}exit ${run.code}): ${run.stderr.slice(0, 600)}`); return 1; }
      if (!run.sawInit) { console.error(`REFUSED: ${label}no init event, so the birth cannot be certified memory-free.`); return 2; }
      sid = result.session_id;
    }
    const events = lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

    const report = checkStream(events, { cwd: dir, transcript: path.join(projDir, `${sid}.jsonl`), says: sc.turns });
    report.landed = git(["status", "--porcelain", "--untracked-files=all"], dir).split("\n").filter(Boolean);
    report.run = { scenario: id, ...(opt("--batch") ? { batch: opt("--batch"), rep: Number(opt("--rep", "1")) } : {}),
      says: sc.turns.length > 1 ? sc.turns : sc.turns[0], tests: sc.tests, tellBy: sc.tellBy,
      source_commit: commit, ref, model, effort, budget_usd: budget ?? "none", bin, text_only: !full,
      env_stripped: stripped, probe_verdict: verdict, denied_on_attempt: DENY_ON_ATTEMPT, denied_by_pattern: DENY_PATTERNS };
    if (report.birth.memory_files_now?.length) report.birth.memory_written = report.birth.memory_files_now
      .map((f) => ({ file: f, text: fs.readFileSync(path.join(memoryPath, f), "utf8").slice(0, 4000) }));

    fs.mkdirSync(runsDir, { recursive: true });
    const n = Math.max(0, ...fs.readdirSync(runsDir).map((f) => +(f.match(/birth-(\d+)/)?.[1] || 0))) + 1;
    const base = path.join(runsDir, `${new Date().toLocaleDateString("en-CA")} — birth-${n} — ${id}`);
    fs.writeFileSync(`${base} — stream.jsonl`, lines.join("\n") + "\n");
    fs.writeFileSync(`${base} — checks.json`, JSON.stringify(report, null, 2) + "\n");
    const a = report.attempted;
    console.log(`birth-${n} ${id}: ${report.result.subtype} · $${report.result.cost_usd} · ${report.calls.length} tool calls · ` +
      `AutoMem loaded: ${report.birth.automem_loaded} · born with ${report.birth.born_with} · landed: ${report.landed.length} · ` +
      `attempted writes ${a.writes.length}, spawns ${a.spawns.length}, git writes ${a.git_writes.length}, outward ${a.outward.length}`);
    console.log(`kept    ${base} — stream.jsonl / — checks.json`);
    return report.birth.automem_loaded === false ? 0 : 2;
  } finally {
    if (made && !keep) {
      // Delete only what this run made: the clone, and the projects folder filed under its path.
      if (path.basename(dir) === name) fs.rmSync(dir, { recursive: true, force: true });
      if (path.basename(projDir).endsWith(slug(name)) && projDir !== path.join(PROJECTS, slug(source))) fs.rmSync(projDir, { recursive: true, force: true });
      console.log(`removed ${dir} and ${projDir}`);
    } else if (made) console.log(`kept    ${dir} (and ${projDir}) — delete both by hand`);
  }
}

// exitCode, not exit(): exit() cuts off stdout that is still flushing into a pipe.
main().then((code) => { process.exitCode = code ?? 0; }, (e) => die(e.stack || e.message));
