"""The Set's clock: read an Ableton Live Set's tempo map and place every cut on a frame.

BLUELINE's board record used to assume one tempo (beat x 60 / BPM). A Set can change tempo,
ramp it, and change meter, so this reads all three from the Set itself and answers four questions:

    seconds_at(beat)        absolute song time of a beat, summed over the tempo segments before it
    frame_at(beat, fps)     that time on the nearest frame, rounded ONCE, so nothing drifts
    beat_of(bar, beat)      a bar and a beat within it (1-based, like Live's ruler) as song beats
    bar_beat(beat)          the reverse, through every meter change

Where Live keeps it (read from Live 12.4's own blank Set, Shop/Shopkeeper/probes/.../blank-set.als):
    MainTrack > Tempo > AutomationTarget Id          the tempo lane's pointee
    MainTrack > TimeSignature > AutomationTarget Id  the meter lane's pointee
    AutomationEnvelope (PointeeId = tempo)  FloatEvent Time=<beats> Value=<bpm>
    AutomationEnvelope (PointeeId = meter)  EnumEvent  Time=<beats> Value=(num-1) + 99*log2(den)
    Locators > Locators > Locator           Time=<beats> Name=<section>
Times are in quarter-note beats from the arrangement's start; the first event sits at -63072000,
Live's "before the song" point. Two tempo events at one time are a jump; between events the
tempo ramps linearly in beats (ASSUMED from Live's drawn ramps; check_against_live() is the proof).

    python3 tempo_map.py <set.als> [--fps 24] [--cuts "bar.beat,bar.beat,..."] [--record board_template.txt]
"""
import bisect, gzip, math, re, sys

BEFORE_SONG = -63072000.0
DENOMS = {0: 1, 1: 2, 2: 4, 3: 8, 4: 16}


def decode_meter(v):
    v = int(round(v))
    return v % 99 + 1, DENOMS[v // 99]


def encode_meter(num, den):
    return (num - 1) + 99 * {d: k for k, d in DENOMS.items()}[den]


class TempoMap:
    def __init__(self, tempo_points, meter_points=((0.0, 4, 4),), sections=()):
        """tempo_points: [(beat, bpm)], time-ordered; equal beats make a jump.
        meter_points: [(beat, num, den)]. sections: [(beat, name)]."""
        pts = sorted(((max(b, 0.0), float(v)) for b, v in tempo_points), key=lambda p: p[0])
        # Before the song, keep only the last value: it is the tempo at beat 0.
        head = [p for p in pts if p[0] <= 0.0]
        pts = ([(0.0, head[-1][1])] if head else []) + [p for p in pts if p[0] > 0.0]
        if not pts:
            raise ValueError("no tempo")
        # Segments: (b0, bpm0, b1, bpm1); the last runs on forever at its tempo.
        self.segs = []
        for (b0, v0), (b1, v1) in zip(pts, pts[1:]):
            if b1 > b0:
                self.segs.append((b0, v0, b1, v1))
        last_b, last_v = pts[-1]
        self.segs.append((last_b, last_v, math.inf, last_v))
        # Cumulative seconds at each segment start: the sum over the segments before it.
        self.t0 = [0.0]
        for s in self.segs[:-1]:
            self.t0.append(self.t0[-1] + self._seg_seconds(s, s[2]))
        self.b0 = [s[0] for s in self.segs]
        m = sorted(((max(b, 0.0), n, d) for b, n, d in meter_points), key=lambda p: p[0])
        mh = [p for p in m if p[0] <= 0.0]
        self.meters = ([(0.0,) + mh[-1][1:]] if mh else [(0.0, 4, 4)]) + [p for p in m if p[0] > 0.0]
        # Bar number at each meter change (bar 1 at beat 0); a change mid-bar starts a new bar there.
        self.meter_bar = [1.0]
        for (b0, n, d), (b1, _, _) in zip(self.meters, self.meters[1:]):
            self.meter_bar.append(self.meter_bar[-1] + math.ceil((b1 - b0) / (n * 4 / d) - 1e-9))
        self.sections = sorted(sections)

    @staticmethod
    def _seg_seconds(seg, b):
        b0, v0, b1, v1 = seg
        db = b - b0
        if b1 == math.inf or abs(v1 - v0) < 1e-12:
            return 60.0 * db / v0
        k = (v1 - v0) / (b1 - b0)                       # bpm per beat
        return 60.0 / k * math.log((v0 + k * db) / v0)  # integral of 60/bpm(b) db

    def bpm_at(self, beat):
        b0, v0, b1, v1 = self.segs[max(0, bisect.bisect_right(self.b0, beat) - 1)]
        return v0 if b1 == math.inf else v0 + (v1 - v0) * (beat - b0) / (b1 - b0)

    def seconds_at(self, beat):
        i = max(0, bisect.bisect_right(self.b0, beat) - 1)
        return self.t0[i] + self._seg_seconds(self.segs[i], beat)

    def beat_at_seconds(self, t):
        i = max(0, bisect.bisect_right(self.t0, t) - 1)
        b0, v0, b1, v1 = self.segs[i]
        dt = t - self.t0[i]
        if b1 == math.inf or abs(v1 - v0) < 1e-12:
            return b0 + dt * v0 / 60.0
        k = (v1 - v0) / (b1 - b0)
        return b0 + v0 / k * (math.exp(k * dt / 60.0) - 1.0)

    def frame_at(self, beat, fps=24):
        """The one rounding: absolute seconds to the nearest frame. Never add frame counts."""
        return round(self.seconds_at(beat) * fps)

    def beat_of(self, bar, beat=1.0):
        """Live's ruler, 1-based: bar 17 beat 1 -> song beats. 'beat' counts the meter's own unit."""
        i = max(0, bisect.bisect_right(self.meter_bar, bar) - 1)
        b0, n, d = self.meters[i]
        return b0 + (bar - self.meter_bar[i]) * n * 4 / d + (beat - 1) * 4 / d

    def bar_beat(self, beat):
        i = max(0, bisect.bisect_right([m[0] for m in self.meters], beat) - 1)
        b0, n, d = self.meters[i]
        unit = 4 / d
        bars = math.floor((beat - b0) / (n * unit) + 1e-9)
        return int(self.meter_bar[i] + bars), 1 + (beat - b0 - bars * n * unit) / unit

    def section_at(self, beat):
        name = None
        for b, n in self.sections:
            if b <= beat + 1e-9:
                name = n
        return name

    @classmethod
    def from_set(cls, path):
        xml = gzip.open(path, "rt", encoding="utf-8").read()
        main = re.search(r"<(MainTrack|MasterTrack)[ >][\s\S]*?</\1>", xml).group(0)  # Live 12: MainTrack, with attributes; 11: MasterTrack

        def target(tag):
            m = re.search(r"<%s>[\s\S]*?<AutomationTarget Id=\"(\d+)\"" % tag, main)
            return m.group(1) if m else None

        def manual(tag):
            m = re.search(r"<%s>\s*<LomId Value=\"\d+\" />\s*<Manual Value=\"([^\"]+)\"" % tag, main)
            return float(m.group(1)) if m else None

        lanes = {}
        for env in re.finditer(r"<AutomationEnvelope Id=\"\d+\">\s*<EnvelopeTarget>\s*<PointeeId Value=\"(\d+)\" />([\s\S]*?)</AutomationEnvelope>", main):
            lanes[env.group(1)] = [(float(t), float(v)) for t, v in
                                   re.findall(r"<(?:Float|Enum)Event Id=\"\d+\" Time=\"([^\"]+)\" Value=\"([^\"]+)\"", env.group(2))]
        tempo = lanes.get(target("Tempo")) or [(BEFORE_SONG, manual("Tempo") or 120.0)]
        meter = lanes.get(target("TimeSignature")) or [(BEFORE_SONG, manual("TimeSignature") or 201)]
        loc = re.search(r"<Locators>\s*<Locators>([\s\S]*?)</Locators>", xml)  # Live 11 puts NextLocatorMapping after
        sections = []
        if loc:
            for body in re.findall(r"<Locator Id=\"\d+\">([\s\S]*?)</Locator>", loc.group(1)):
                t = re.search(r"<Time Value=\"([^\"]+)\"", body)
                n = re.search(r"<Name Value=\"([^\"]*)\"", body)
                if t:
                    sections.append((float(t.group(1)), n.group(1) if n else ""))
        return cls(tempo, [(b,) + decode_meter(v) for b, v in meter], sections)

    def describe(self):
        rows = []
        for (b0, v0, b1, v1), t in zip(self.segs, self.t0):
            bar, bt = self.bar_beat(b0)
            kind = "holds" if b1 == math.inf or v0 == v1 else "ramps to %g" % v1
            rows.append("  beat %8.2f  (bar %d.%g)  %7.3fs  %g bpm %s" % (b0, bar, round(bt, 3), t, v0, kind))
        for b, n, d in self.meters:
            bar, _ = self.bar_beat(b)
            rows.append("  meter %d/%d from bar %d (beat %g)" % (n, d, bar, b))
        for b, n in self.sections:
            rows.append("  section %-12s at beat %g, %.3fs" % (n, b, self.seconds_at(b)))
        return "\n".join(rows)


def stamp_record(text, tm, fps=24):
    """board_template.txt in, the same text out with each BOARD's FRAME (and SECTION, if blank) filled
    from its BAR and BEAT on the Set's clock. BEAT counts the meter's own unit, like Live's ruler."""
    out, bar, beat = [], None, 1.0
    for line in text.splitlines():
        key = line.split(":", 1)[0].strip()
        if line.startswith("# === BOARD"):
            bar, beat = None, 1.0
        elif key == "BAR":
            bar = int(line.split(":", 1)[1].split("#")[0])
        elif key == "BEAT":
            beat = float(line.split(":", 1)[1].split("#")[0])
        elif key in ("FRAME", "SECTION") and bar is not None:
            b = tm.beat_of(bar, beat)
            if key == "FRAME":
                line = "FRAME: %d                  # bar %d beat %g = %.4fs on the Set's clock, @%dfps" % (
                    tm.frame_at(b, fps), bar, beat, tm.seconds_at(b), fps)
            elif not line.split(":", 1)[1].split("#")[0].strip():
                line = "SECTION: %s" % (tm.section_at(b) or "")
        out.append(line)
    return "\n".join(out) + "\n"


def parse_cut(s):
    bar, _, beat = s.partition(".")
    return int(bar), float(beat or 1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    args = sys.argv[1:]
    fps = int(args[args.index("--fps") + 1]) if "--fps" in args else 24
    tm = TempoMap.from_set(args[0])
    print(tm.describe())
    if "--cuts" in args:
        for c in args[args.index("--cuts") + 1].split(","):
            bar, bt = parse_cut(c.strip())
            b = tm.beat_of(bar, bt)
            print("  cut bar %d beat %g -> song beat %g, %.4fs, frame %d @%dfps (%s)"
                  % (bar, bt, b, tm.seconds_at(b), tm.frame_at(b, fps), fps, tm.section_at(b)))
    if "--record" in args:
        sys.stdout.write(stamp_record(open(args[args.index("--record") + 1]).read(), tm, fps))
