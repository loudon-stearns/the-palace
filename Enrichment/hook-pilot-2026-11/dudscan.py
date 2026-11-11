import subprocess,os,re,glob,json
out=subprocess.run(['git','-c','core.quotepath=off','ls-files','-z','--','*— rich.json'],capture_output=True,text=True).stdout
rows=[]
for m in [x for x in out.split('\0') if x]:
    d=os.path.dirname(m); entry=os.path.basename(m)[:-len(' — rich.json')]
    htmls=[h for h in glob.glob(os.path.join(glob.escape(d),glob.escape(entry)+' — rich — *.html'))]
    n=len(htmls); fad=dirc=snd=0; plain=0; names=[]
    for h in htmls:
        t=open(h,errors='ignore').read()
        f=len(re.findall(r'type\s*=\s*["\']?range',t))
        dm=bool(re.search(r'pointerdown|mousedown|touchstart|pointermove|mousemove|dragstart|keydown',t))
        au=bool(re.search(r'AudioContext|<audio',t))
        fad+=f; dirc+=dm; snd+=au
        if f>=1 and not dm: plain+=1; names.append(os.path.basename(h)[len(entry)+10:-5])
    rows.append(dict(entry=entry,dir=d,pieces=n,faders=fad,direct=dirc,sound=snd,plain=plain,plain_names=names))
json.dump(rows,open(os.path.join(os.path.dirname(__file__),'dudscan.json'),'w'),ensure_ascii=False,indent=1)
tot=sum(r['pieces'] for r in rows); pl=sum(r['plain'] for r in rows)
print('faces',len(rows),'html pieces',tot,'fader-only pieces',pl)
allp=[r for r in rows if r['pieces'] and r['plain']==r['pieces']]
print('faces where EVERY piece is faders-only, no direct touch:',len(allp))
for r in sorted(allp,key=lambda r:(-r['faders']/r['pieces'],r['entry'])): print(f"  {r['entry']} · {r['pieces']}p · {r['faders']} faders · sound {r['sound']}/{r['pieces']}")
print('faces with zero fader-only pieces:',len([r for r in rows if r['pieces'] and r['plain']==0]))
print('faces with no html piece found:',[r['entry'] for r in rows if not r['pieces']])
