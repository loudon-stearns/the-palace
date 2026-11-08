"""Write demo-set.als: Live 12.4's own blank Set with a tempo map that exercises everything the reader reads.

    bar 1   4/4  120 bpm, holding          locator "intro"
    bar 5   7/8  jumps to 96               locator "verse"
    bar 9   3/4  ramps from 96 ...         locator "rise"
    bar 13  4/4  ... to 150, holding       locator "drop"
    bar 17                                 locator "end"

No song, no audio: open it in Live, and its ruler, its tempo lane and its locators should agree with
`python3 tempo_map.py demo-set.als` bar for bar. That agreement is the proof the reader reads Live right.
"""
import gzip, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from tempo_map import BEFORE_SONG, encode_meter

BLANK = os.path.join(HERE, "..", "..", "..", "Shop", "Shopkeeper", "probes", "2026-10-20-ableton-session",
                     "templates", "blank-set.als")
TEMPO = [(BEFORE_SONG, 120), (16, 120), (16, 96), (30, 96), (42, 150)]
METER = [(BEFORE_SONG, 4, 4), (16, 7, 8), (30, 3, 4), (42, 4, 4)]
LOCATORS = [(0, "intro"), (16, "verse"), (30, "rise"), (42, "drop"), (58, "end")]


def events(tag, pts):
    return "".join('\n\t\t\t\t\t\t\t\t<%s Id="%d" Time="%s" Value="%s" />' % (tag, i, repr(float(t)) if t != BEFORE_SONG else "-63072000", v)
                   for i, (t, v) in enumerate(pts))


def write(out):
    xml = gzip.open(BLANK, "rt", encoding="utf-8").read()
    xml = re.sub(r'<Ableton [^>]*>', '<Ableton MajorVersion="5" MinorVersion="12.0_12402" SchemaChangeCount="5" '
                 'Creator="Ableton Live 12.4.6" Revision="0de5c8fa9a692293676cb7700a15afb2046ee1f7">', xml)
    xml = xml.replace('<EnumEvent Id="0" Time="-63072000" Value="201" />',
                      events("EnumEvent", [(t, encode_meter(n, d)) for t, n, d in METER]).strip(), 1)
    xml = xml.replace('<FloatEvent Id="0" Time="-63072000" Value="120" />',
                      events("FloatEvent", TEMPO).strip(), 1)
    # Locator ids are pointees: take them from NextPointeeId and move it on.
    nxt = int(re.search(r'<NextPointeeId Value="(\d+)" />', xml).group(1))
    locs = "".join('\n\t\t\t\t<Locator Id="%d">\n\t\t\t\t\t<LomId Value="0" />\n\t\t\t\t\t<Time Value="%g" />'
                   '\n\t\t\t\t\t<Name Value="%s" />\n\t\t\t\t\t<Annotation Value="" />\n\t\t\t\t\t<IsSongStart Value="false" />'
                   '\n\t\t\t\t</Locator>' % (nxt + i, t, n) for i, (t, n) in enumerate(LOCATORS))
    xml = xml.replace("<Locators>\n\t\t\t<Locators />", "<Locators>\n\t\t\t<Locators>%s\n\t\t\t</Locators>" % locs, 1)
    xml = re.sub(r'<NextPointeeId Value="\d+" />', '<NextPointeeId Value="%d" />' % (nxt + len(LOCATORS)), xml, count=1)
    assert xml.count("<Locator Id=") == len(LOCATORS) and xml.count("<FloatEvent") >= len(TEMPO)
    with gzip.open(out, "wt", encoding="utf-8") as f:
        f.write(xml)
    return out


if __name__ == "__main__":
    print(write(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "demo-set.als")))
