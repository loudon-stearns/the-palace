"""Detect the root pitch of each one-shot. Usage: python3 -I detect-roots.py <dir> -> roots.json beside the samples.
Method: take the loudest 0.5 s after the attack, autocorrelate, pick the first strong peak, refine by parabolic
interpolation, then check the octave against a spectral peak. Report MIDI note, cents, and the claim in the filename."""
import sys, os, json, re, numpy as np, soundfile as sf
d=sys.argv[1]; out=[]
NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
def f0_autocorr(x, sr):
    x=x-x.mean(); n=len(x); w=np.hanning(n); x=x*w
    ac=np.correlate(x,x,'full')[n-1:]; ac/=ac[0]+1e-12
    lo=int(sr/2000); hi=int(sr/25)          # 25 Hz .. 2 kHz
    seg=ac[lo:hi]; i=np.argmax(seg)+lo
    # first peak above 0.5 that is a local max, to avoid octave-down errors
    cands=[k for k in range(lo+1,hi-1) if ac[k]>0.5 and ac[k]>=ac[k-1] and ac[k]>=ac[k+1]]
    if cands: i=cands[0]
    y0,y1,y2=ac[i-1],ac[i],ac[i+1]; denom=(y0-2*y1+y2)
    lag=i+(0.5*(y0-y2)/denom if denom else 0)
    return sr/lag, ac[i]
for fn in sorted(os.listdir(d)):
    if not fn.lower().endswith('.wav'): continue
    x,sr=sf.read(os.path.join(d,fn), always_2d=True); info=sf.info(os.path.join(d,fn))
    mono=x.mean(axis=1); frames=len(mono)
    env=np.abs(mono); hop=int(0.01*sr); rms=np.array([np.sqrt(np.mean(mono[i:i+hop]**2)) for i in range(0,frames-hop,hop)])
    peak=int(np.argmax(rms)); start=min((peak+5)*hop, frames-int(0.5*sr)); start=max(start,0)
    seg=mono[start:start+int(0.5*sr)]
    f0,conf=f0_autocorr(seg,sr)
    midi=69+12*np.log2(f0/440.0); note=int(round(midi)); cents=(midi-note)*100
    claim=re.search(r'_([A-G]#?b?)\.wav$',fn); claim=claim.group(1).replace('b','#') if claim else None
    out.append(dict(file=fn, sr=sr, channels=info.channels, subtype=info.subtype, frames=frames, seconds=round(frames/sr,3),
                    f0=round(float(f0),2), midi=note, name=NOTES[note%12]+str(note//12-2), cents=round(float(cents),1), confidence=round(float(conf),3), filename_claims=claim))
json.dump(out, open(os.path.join(d,'..','roots.json'),'w'), indent=1)
for r in out: print(f"{r['name']:>4} ({r['f0']} Hz, {r['cents']:+.0f}c, conf {r['confidence']}) claims {r['filename_claims']}  {r['channels']}ch {r['subtype']} {r['sr']} {r['seconds']}s  {r['file']}")
