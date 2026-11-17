#!/usr/bin/env python3
"""Deposit Ceremony — placed before the read (the remake of "words wait on a branch").

Same deposit, same record (deposit-record.json, checked against git by make.check), same frame.
What changed after the challenge (challenge.md):
  - the last fix is labelled in its commit's words: a repeat, cut on landing (no date the record lacks);
  - the picture says, under its head, that this deposit is the exception, with the count it is an exception in;
  - the title carries the claim (placed before its read, waiting on a branch, outside canon);
  - the wait is drawn smaller, and the caveat about when the words reached their reader is as large as the labels.

The six deposits run under v2.8 and v2.9 (the tuning ledger's run lines) and how each met its read are a
hand table below, each row citing the commit or ledger line it rests on; the script counts from it.
No randomness: nothing to seed. Run from here: python3 make2.py
"""
import json, os, subprocess, sys
from make import HERE, ROOT, RECORD, PAPER, INK, INK2, INK3, RULE, RED, FONT, check, t, dur, esc, raster, git

NAME = "Deposit Ceremony — placed before the read"

# Every deposit with a run line under v2.8 or v2.9 in "Deposit Ceremony — tuning.md", and where its read fell.
SIX = [
    ("D-2026-11-02-BBSLOOK", "read first", "94b53d49 body: on Loudon's yes to the final text"),
    ("D-2026-11-03-HEARDRISE", "read first", "77c674b9 body: approved the map and read every word; placed from the approved words"),
    ("D-2026-11-05-LTCSPEED", "landed before its words were read", "ledger correction line of 2026-11-08; landed on main in a4cdd3b1"),
    ("D-2026-11-04-AUDILLUSIONS", "placed on a branch, then read", "ledger: the map's yes came as a title change ... parked the words on a branch"),
    ("D-2026-11-09-DSPLOOP", "read first", "d659e922 body: read the whole page in a reading copy and said 'Yes, place it'"),
    ("D-2026-11-15-OBSIDIAN-RETIRED", "read first", "4f475baf body: approved the map and said yes to the final words; the draft waited in The Shop's bundle (1ab3271c)"),
]


def checks():
    ledger = open(os.path.join(ROOT, "_ops/Deposit Ceremony/Deposit Ceremony — tuning.md")).read()
    runs = [l for l in ledger.splitlines() if l.startswith("- run · ") and (" · v2.8 · " in l or " · v2.9 · " in l)]
    ids = sorted(l.split(" · ")[3] for l in runs)
    if ids != sorted(k for k, _, _ in SIX): sys.exit(f"the v2.8/v2.9 run lines are not the six: {ids}")
    if "The map's yes came as a title change, not as a read of the words" not in ledger: sys.exit("ledger reason moved")
    # the last fix: the repeat was made by the second read's own fix commit, and cut on landing
    d2 = git("show", "bd90c3bf", "--", "Auditory Illusions/Auditory Illusions — Context.md")
    d3 = git("show", "47a76840", "--", "Auditory Illusions/Auditory Illusions — Context.md")
    if not ("+- **Whisper's phantom phrases**" in d2 and "`mirrors` names the shared move. Drawn as `mirrors`." in d2): sys.exit("repeat origin moved")
    if "`mirrors` names the shared move. Drawn as `mirrors`." not in d3: sys.exit("repeat cut moved")


def draw(rec):
    br, m = rec["branch"], rec["merge"]
    W, H = 1000, 575
    yb, ym = 300, 430
    A0, AX0, AX1 = t(br[0]["when"]).replace(hour=8, minute=47, second=30), 130, 470
    A1 = A0.replace(hour=9, minute=2)
    B0, BX0, BX1 = t(m["when"]).replace(minute=51, second=30), 790, 960
    B1 = B0.replace(minute=54, second=0)
    xa = lambda s: AX0 + (t(s) - A0).total_seconds() / (A1 - A0).total_seconds() * (AX1 - AX0)
    xb = lambda s: BX0 + (t(s) - B0).total_seconds() / (B1 - B0).total_seconds() * (BX1 - BX0)
    GAP0, GAP1 = AX1 + 16, BX0 - 16
    n = len(SIX); first = sum(1 for _, k, _ in SIX if k == "read first"); branch = sum(1 for _, k, _ in SIX if k.startswith("placed on a branch"))
    unread = sum(1 for _, k, _ in SIX if k == "landed before its words were read")
    assert branch == 1 and first + branch + unread == n

    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" {FONT}>',
         f'<rect width="{W}" height="{H}" fill="{PAPER}"/>']
    tx = lambda x, y, s, size=15, fill=INK2, anchor="start", weight="normal", style="normal": o.append(
        f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" font-style="{style}">{esc(s)}</text>')
    ln = lambda x1, y1, x2, y2, c=INK, w=2, dash=None: o.append(
        f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}"' + (f' stroke-dasharray="{dash}"' if dash else "") + '/>')

    tx(40, 44, "ONE DEPOSIT, FROM ITS COMMITS", 15, INK3, weight="bold")
    tx(40, 72, "Placed before they were read, the words waited on a branch, outside canon", 21, INK, weight="bold")
    tx(40, 104, f"Of the {n} deposits under v2.8 and v2.9, this is the exception: {branch} placed on a branch", 16, INK2)
    tx(40, 126, f"before its read. By their commits, {first} were read first. By the ledger's correction,", 16, INK2)
    tx(40, 148, f"{unread} landed on main before its words were read.", 16, INK2)

    tx(40, yb + 5, "branch", 15, INK3); tx(40, ym + 5, "main", 15, INK3); tx(40, ym + 25, "(canon)", 13, INK3)
    x0 = xa(br[0]["when"]); xf = x0 - 45
    ln(xf - 8, ym, AX1, ym, INK3, 2); ln(BX0, ym, BX1 + 12, ym, INK3, 2)
    o.append(f'<path d="M{xf:.1f},{ym} C{xf:.1f},{yb + 40} {x0 - 14:.1f},{yb} {x0:.1f},{yb}" fill="none" stroke="{INK}" stroke-width="2"/>')
    ln(x0, yb, AX1, yb, INK, 2); ln(BX0, yb, xb(br[4]["when"]), yb, INK, 2)
    ln(GAP0, yb, GAP1, yb, INK, 2, "2 7")
    for x in (AX1 + 6, BX0 - 6):
        for y in (yb, ym):
            ln(x - 5, y + 9, x + 5, y - 9, INK3, 1.5)

    top = 178
    labels = [("written: %d lines" % br[0]["lines_added"], top), ("%d factual fixes" % br[1]["fixes"], top + 25),
              ("cold read: %d fixes" % br[2]["fixes"], top + 50), ("second read: %d fixes" % br[3]["fixes"], top + 75)]
    for c, (lab, ly) in zip(br[:4], labels):
        x = xa(c["when"])
        ln(x, ly + 8, x, yb - 9, RULE, 1)
        o.append(f'<circle cx="{x:.1f}" cy="{yb}" r="7" fill="{PAPER}" stroke="{INK}" stroke-width="2.5"/>')
        tx(x - 8, ly, lab, 15, INK, "start")
        if c is not br[1]: tx(x, yb + 30, t(c["when"]).strftime("%H:%M"), 13, INK3, "middle")
    d0 = dur(br[0]["when"], br[3]["when"])
    tx((AX0 + AX1) / 2 + 10, yb + 58, f"4 Nov · {d0[2]} min {d0[3]} s, first to last", 15, INK3, "middle")
    tx((AX0 + AX1) / 2 + 10, yb + 80, "verify state, each: unverified", 15, INK3, "middle")

    g = dur(br[3]["when"], br[4]["when"]); cx = (GAP0 + GAP1) / 2
    tx(cx, yb + 42, f"{g[0]} days {g[1]} h", 18, INK, "middle", "bold")
    tx(cx, yb + 64, "on the branch, no new commit", 15, INK, "middle")
    for i, s in enumerate(["When the words were put", "in front of their reader", "is not in the record."]):
        tx(cx, yb + 90 + 19 * i, s, 15, INK2, "middle")

    x4, xm = xb(br[4]["when"]), xb(m["when"])
    o.append(f'<circle cx="{x4:.1f}" cy="{yb}" r="7" fill="{PAPER}" stroke="{INK}" stroke-width="2.5"/>')
    R = W - 30
    ln(x4, top + 58, x4, yb - 9, RULE, 1)
    tx(R, top + 50, "1 fix: a repeat, cut on landing", 15, INK, "end")
    tx(x4 - 4, yb + 30, t(br[4]["when"]).strftime("%H:%M"), 13, INK3, "end")
    o.append(f'<path d="M{x4:.1f},{yb} C{x4 + 4:.1f},{yb + 60} {xm:.1f},{ym - 60} {xm:.1f},{ym}" fill="none" stroke="{RED}" stroke-width="2.5"/>')
    o.append(f'<circle cx="{xm:.1f}" cy="{ym}" r="8" fill="{RED}"/>')
    tx(R, ym + 38, "merged, 8 Nov " + t(m["when"]).strftime("%H:%M") + ", verify state: verified", 15, INK, "end")
    tx(R, ym + 68, "the merge's message:", 15, RED, "end")
    tx(R, ym + 88, "“read every word … (‘Read it, land it’)”", 15, RED, "end")

    tx(40, H - 18, f"Source: git (merge {m['hash']}, five branch commits) and the tuning ledger. Commit times, not read times.", 13, INK3)
    o.append("</svg>")
    return "\n".join(o), W, H


if __name__ == "__main__":
    rec = json.load(open(RECORD)); check(rec); checks()
    svg, W, H = draw(rec)
    sp, pp = os.path.join(HERE, NAME + ".svg"), os.path.join(HERE, NAME + ".png")
    open(sp, "w").write(svg); raster(sp, pp, W, H)
    print(sp); print(pp)
