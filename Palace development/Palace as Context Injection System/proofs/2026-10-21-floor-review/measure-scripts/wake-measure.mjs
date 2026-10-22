import { buildEphemeralPrompt } from '/Users/loudonstearns/Documents/The Palace/.claude/worktrees/pacis-floor-242548/_ops/stigmergy/orchestrator/src/ephemeral-prompt.js';
for (const t of ["Kuramoto Coupling","The Daily Page","Concierge"]) {
  const b = buildEphemeralPrompt({ palaceRoot: '/Users/loudonstearns/Documents/The Palace/.claude/worktrees/pacis-floor-242548', title: t });
  if (!b.ok) { console.log(t, b.status); continue; }
  const f = b.full;
  const iPage = f.indexOf('# This is you');
  const iVec = f.indexOf('# Your desire');
  const iNb = f.indexOf('# Your neighbors');
  const iBegin = f.indexOf('# Begin');
  console.log(t, 'total', f.length, 'preamble(before page)', iPage, 'page+fence', iVec-iPage, 'vector+agency', iNb-iVec, 'neighbors', iBegin-iNb, 'begin', f.length-iBegin);
}
