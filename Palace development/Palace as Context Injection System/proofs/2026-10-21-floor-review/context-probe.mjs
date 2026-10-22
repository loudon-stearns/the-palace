// $0 probe: run `claude -p /context` in a folder and print its full result text (the loaded-context table).
import { execFileSync } from "node:child_process";
import { resolveBin } from "/Users/loudonstearns/Documents/The Palace/.claude/worktrees/pacis-floor-242548/_ops/self-description-test/claude-bin.mjs";
const cwd = process.argv[2];
const { bin, from } = resolveBin(process.argv[3]);
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC_)/.test(k)));
const out = execFileSync(bin, ["-p", "/context", "--output-format", "stream-json", "--verbose", "--strict-mcp-config",
  "--permission-mode", "dontAsk", "--no-session-persistence", "--max-budget-usd", "0.01"],
  { cwd, env, input: "", encoding: "utf8", timeout: 120000, maxBuffer: 64 << 20 });
const ev = out.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const result = ev.find((e) => e.type === "result");
console.log(`bin: ${from}\ncost: ${result?.total_cost_usd}\n`);
console.log(result?.result);
