import { buildLensMandate } from '/Users/loudonstearns/Documents/The Palace/.claude/worktrees/pacis-floor-242548/_ops/stigmergy/orchestrator/src/lens-mandate.js';
const b = buildLensMandate({ palaceRoot: '/Users/loudonstearns/Documents/The Palace/.claude/worktrees/pacis-floor-242548', glassTitle: 'Cooperation Yields Agency', subjectTitle: 'Kuramoto Coupling' });
const f=b.full; const i=f.indexOf("# You are also a LENS"); const j=f.indexOf("## The procedure"); const k=f.indexOf("# Begin");
console.log('total',f.length,'before lens block',i,'lens block to Begin',k-i,'lens preamble+subject',j-i,'procedure+report',k-j, 'heading before:', f.slice(i-60,i).replace(/\n/g,' | '));
