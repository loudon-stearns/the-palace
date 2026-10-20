"""Haptic Handwheel — box day in one command.

    python3 run_bench.py --R 7.6                 # finds the knob's USB port, runs the bench in order
    python3 run_bench.py --port /dev/cu.usbmodem1101 --R 7.6
    python3 run_bench.py --fake                  # a pretend knob, to rehearse without the hardware

It waits for the knob's "ready" line, then sends coast, accel-bare, asks you to
fit the disc, sends accel-disc, cog, and (once you say the recording is rolling)
chirp. Every "b," line goes to capture-<date>.csv beside this script, and when
the last test ends it hands the capture to bench_analyze.py, which prints the
motor's numbers and writes ../handwheel/cog_map.h.

No pyserial needed: the port is opened with the standard library. macOS has no
named constant for 921600 baud, so the speed is set with the IOSSIOSPEED ioctl.
"""
import os, sys, glob, time, argparse, subprocess, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
BAUD = 921600

STEPS = [  # (bench command, what to tell the person first, wait for Enter?)
    ('coast',      'Hands off. It spins up and lets go, twice (about 8 s).', False),
    ('accel-bare', 'Hands off, no cap. A short push from rest.', False),
    ('accel-disc', 'Fit the disc of known mass now (the light 40 g cap).', True),
    ('cog',        'Hands off and keep the desk still: one turn forward, one back (about 100 s).', False),
    ('chirp',      'Tape the contact mic to the rim and START RECORDING in your DAW.', True),
]

class Port:
    """A raw serial port, standard library only."""
    def __init__(self, path):
        import termios, fcntl
        self.fd = os.open(path, os.O_RDWR | os.O_NOCTTY | os.O_NONBLOCK)
        a = termios.tcgetattr(self.fd)
        a[0] = 0; a[1] = 0                                   # no input/output processing
        a[2] = termios.CS8 | termios.CREAD | termios.CLOCAL  # 8N1
        a[3] = 0                                             # raw: no echo, no line editing
        a[4] = a[5] = termios.B230400                        # placeholder; replaced below
        termios.tcsetattr(self.fd, termios.TCSANOW, a)
        if sys.platform == 'darwin':
            import struct
            fcntl.ioctl(self.fd, 0x80045402, struct.pack('I', BAUD))   # IOSSIOSPEED
        else:
            a[4] = a[5] = getattr(termios, 'B921600'); termios.tcsetattr(self.fd, termios.TCSANOW, a)
        self.buf = b''
    def write(self, line): os.write(self.fd, (line + '\n').encode())
    def lines(self, timeout):
        """Yield complete lines until `timeout` seconds pass with nothing new."""
        import select
        last = time.time()
        while time.time() - last < timeout:
            r, _, _ = select.select([self.fd], [], [], 0.2)
            if not r: continue
            try: chunk = os.read(self.fd, 65536)
            except BlockingIOError: continue
            if not chunk: continue
            last = time.time(); self.buf += chunk
            while b'\n' in self.buf:
                l, self.buf = self.buf.split(b'\n', 1)
                yield l.decode(errors='replace').strip()

class FakeKnob:
    """Answers like handwheel.ino, from bench_analyze.py's pretend motor."""
    def __init__(self, R):
        sys.path.insert(0, HERE); import bench_analyze as ba
        rows, _ = ba.fake_motor(R=R); cog, _ = ba.fake_cog(R=R); ch, self.mic, _ = ba.fake_chirp(R=R)
        self.tests = {}
        for r in rows: self.tests.setdefault(r[0].split('-')[0] if r[0].startswith('coast') else r[0], []).append(r)
        self.tests['cog'] = [('cog-fwd',) + r for r in cog['cog-fwd']] + [('cog-rev',) + r for r in cog['cog-rev']]
        self.tests['chirp'] = [('chirp',) + r for r in ch]
        self.out = ['hello handwheel pretend knob', 'ready']
    def write(self, line):
        if line == 'hello': return
        test = line.split()[1]
        self.out += ['b,%s,%.6f,%.6f,%.5f,%.4f' % r for r in self.tests[test]] + ['b,done']
    def lines(self, timeout):
        while self.out: yield self.out.pop(0)

def find_port():
    c = sorted(glob.glob('/dev/cu.usbmodem*') + glob.glob('/dev/cu.usbserial*') + glob.glob('/dev/cu.SLAB*') + glob.glob('/dev/cu.wchusbserial*'))
    if not c: sys.exit('No knob found on USB. Is it plugged in, and is the Arduino serial monitor closed?')
    if len(c) > 1: print('More than one port; using', c[0], '(pass --port to choose)')
    return c[0]

def ask(msg, fake):
    print('\n→ ' + msg)
    if fake: print('  (pretend knob: carrying on)'); return
    input('  press Enter when ready… ')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--port'); ap.add_argument('--fake', action='store_true')
    ap.add_argument('--R', type=float, required=True, help='ohms per phase: half the meter reading across two motor leads')
    ap.add_argument('--disc-mass', type=float, default=0.040); ap.add_argument('--disc-radius', type=float, default=0.040)
    ap.add_argument('--only', help='run just these tests, comma-separated (e.g. coast,cog)')
    ap.add_argument('--out', help='capture file (default capture-<date>.csv here)')
    a = ap.parse_args()
    sys.stdout.reconfigure(line_buffering=True)

    knob = FakeKnob(a.R) if a.fake else Port(a.port or find_port())
    stamp = datetime.datetime.now().strftime('%Y-%m-%d-%H%M')
    out = a.out or os.path.join(HERE, ('fake-' if a.fake else '') + f'capture-{stamp}.csv')

    print('Waiting for the knob to say ready (it aligns its motor first: a small twitch is normal)…')
    hello = None
    knob.write('hello')   # a classic ESP32 resets when the port opens and greets us; a Nano ESP32 doesn't, so ask
    for l in knob.lines(timeout=15):
        if l.startswith('hello'): hello = l; print(' ', l)
        if l == 'ready': break
    else: sys.exit('The knob never said "ready". Press its reset button and run this again; if it still says nothing, see box-day.html, step 5.')
    if not hello: print('  (no hello line: an older firmware, or the board reset before the port opened. Carrying on.)')

    wanted = a.only.split(',') if a.only else [s[0] for s in STEPS]
    counts = {}
    with open(out, 'w') as f:
        for test, msg, wait in STEPS:
            if test not in wanted: continue
            if wait: ask(msg, a.fake)
            else: print('\n→ ' + msg)
            knob.write('bench ' + test); n = 0; t0 = time.time()
            for l in knob.lines(timeout=10):
                if l == 'b,done': break
                if l.startswith('b,'): f.write(l + '\n'); n += 1
            else: sys.exit(f'`bench {test}` went quiet before "b,done" after {n} lines. Capture so far is in {out}.')
            counts[test] = n; print(f'  {test}: {n} lines in {time.time() - t0:.1f} s')
            if test == 'chirp' and not a.fake: print('  you can stop recording; save it as chirp_mic.wav beside this script')

    print(f'\nSaved {out}')
    low = [t for t, n in counts.items() if n < 100]
    if low: print('  warning: very few lines from', ', '.join(low), '— check the encoder wiring (box-day.html, step 6)')
    cmd = [sys.executable, os.path.join(HERE, 'bench_analyze.py'), out, '--R', str(a.R),
           '--disc-mass', str(a.disc_mass), '--disc-radius', str(a.disc_radius), '--plot', out.replace('.csv', '.png')]
    if a.fake: cmd += ['--header', os.devnull]
    mic = os.path.join(HERE, 'chirp_mic.wav')
    if a.fake:
        import numpy as np; from scipy.io import wavfile
        sig, sr = knob.mic; mic = out.replace('.csv', '-mic.wav')
        wavfile.write(mic, sr, (sig / np.max(np.abs(sig)) * 0.8 * 32767).astype(np.int16))
    if 'chirp' in counts:
        if os.path.exists(mic): cmd += ['--mic', mic]
        else: print('  no chirp_mic.wav yet: analysing the chirp from the encoder alone. Re-run bench_analyze.py with --mic once it is saved.')
    print('\n' + ' '.join(cmd[1:]) + '\n')
    subprocess.run(cmd)

if __name__ == '__main__':
    main()
