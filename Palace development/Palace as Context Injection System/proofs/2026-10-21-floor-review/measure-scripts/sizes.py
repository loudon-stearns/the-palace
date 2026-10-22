import os,sys,re
root="/Users/loudonstearns/Documents/The Palace/.claude/worktrees/pacis-floor-242548"
def n(p, label=None):
    full=p if p.startswith("/") else os.path.join(root,p)
    t=open(full,encoding="utf-8").read()
    return len(t)
def fm_split(t):
    m=re.match(r'^---\n(.*?)\n---\n',t,re.S)
    return (m.group(1),t[m.end():]) if m else ("",t)
rows=[]
def r(label,p):
    c=n(p); rows.append((label,p,c,round(c/3.8)))
    print(f"{c:7d} {round(c/3.8):6d}  {label}  [{p}]")
print("--- floor")
for p in ["CLAUDE.md","JEWEL.md","FOUR PILLARS.md","Palace Philosophies.md","Cooperation Yields Agency.md","Hilaritas Generator.md","Modes of Collaboration.md"]: r(p,p)
mem="/Users/loudonstearns/.claude/projects/-Users-loudonstearns-Documents-The-Palace/memory/MEMORY.md"
r("MEMORY.md",mem)
t=open(os.path.join(root,"CLAUDE.md")).read(); fm,b=fm_split(t); print("CLAUDE body chars",len(b),round(len(b)/3.8)," fm chars",len(fm))
world=sum(n(p) for p in ["FOUR PILLARS.md","Palace Philosophies.md","Cooperation Yields Agency.md","Hilaritas Generator.md","Modes of Collaboration.md"])
print("World total",world,round(world/3.8))
fl=n("CLAUDE.md")+n("JEWEL.md")+world
print("floor (CLAUDE+JEWEL+World) chars",fl,round(fl/3.8))
print("--- agents/skills")
for p in [".claude/agents/palace-reader.md",".claude/agents/palace-writer.md",".claude/agents/palace-orchestrator.md",".claude/skills/concierge/SKILL.md",".claude/skills/palace-orchestrator/SKILL.md","_ops/worktree/SKILL.md","_ops/loudon-live/design-system/SKILL.md","_ops/drafting-table/design-system/SKILL.md","_ops/stigmergy/design-system/SKILL.md","_ops/daily-page/scheduled-task/SKILL.md","_ops/wavetable-libraries/skills/interview/SKILL.md","_ops/sample-libraries/skills/interview/SKILL.md"]:
    t=open(os.path.join(root,p)).read()
    fm,b=fm_split(t)
    d=re.search(r'^description:\s*(.*)$',fm,re.M)
    dl=len(d.group(1).strip().strip('"')) if d else 0
    print(f"{len(t):7d} total  body {len(b):6d} ({round(len(b)/3.8):5d} tok)  desc {dl:5d} ({round(dl/3.8):4d} tok)  {p}")
S="/Users/loudonstearns/.claude/skills/synced/36519218-208c-4706-ba13-d14d8ef73f90_a01307b3-9378-49a1-b878-971dc59f2bb1"
for k in ["the-substrate","loudons-four-pillars"]:
    p=f"{S}/{k}/SKILL.md"; t=open(p).read(); fm,b=fm_split(t)
    d=re.search(r'^description:\s*(.*)$',fm,re.M); dl=len(d.group(1).strip().strip('"'))
    print(f"{len(t):7d} total  body {len(b):6d} ({round(len(b)/3.8):5d} tok)  desc {dl:5d} ({round(dl/3.8):4d} tok)  {k}")
print("--- concierge boot")
tot=0
for p in ["_ops/concierge/prompts/companion.md","ELDER.md","SCHEMA.md","SUBSTRATE.md","ROSETTA.md","_ops/Substrate Skill.md","_ops/Palace Ceremonies.md","STIGMERGY.md","SCHEMA — Reference.md"]:
    c=n(p); print(f"{c:7d} {round(c/3.8):6d}  {p}")
ref=open(os.path.join(root,"SCHEMA — Reference.md")).read(); i=ref.index("## 9. The Coordination Schema"); print(f"{len(ref)-i:7d} {round((len(ref)-i)/3.8):6d}  Ref §9 only")
boot=[n(x) for x in ["ELDER.md","SCHEMA.md","SUBSTRATE.md","ROSETTA.md","_ops/Substrate Skill.md","_ops/Palace Ceremonies.md","STIGMERGY.md"]]
print("boot set excluding wire-spec/Reference:",sum(boot),round(sum(boot)/3.8))
print("boot + Ref §9:",sum(boot)+len(ref)-i, round((sum(boot)+len(ref)-i)/3.8))
print("boot + whole Reference:",sum(boot)+len(ref), round((sum(boot)+len(ref))/3.8))
print("boot + charter:",sum(boot)+n("_ops/concierge/prompts/companion.md"))
for p in ["_ops/concierge/prompts/gatherer.md","_ops/concierge/prompts/oracle-qa.md","_ops/concierge/prompts/scout.md","_ops/concierge/prompts/curator.md","_ops/concierge/README.md","Palace development/Concierge.md"]:
    c=n(p); print(f"{c:7d} {round(c/3.8):6d}  {p}")
