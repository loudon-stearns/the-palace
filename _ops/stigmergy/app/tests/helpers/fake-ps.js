// A stand-in `ps` for the actuator's liveness check.
//
// The actuator asks `ps -p <pid> -o command=` who holds a pid. What ps answers
// is not always a command line: for under a millisecond while a worker's
// launcher re-execs into the real program the kernel has none to give, and ps
// prints the bare name in parentheses -- "(python3.14)" -- with exit 0. A dead
// worker its parent has not reaped yet prints "<defunct>". No such process is
// exit 1 with nothing printed.
//
// A test cannot make the kernel's unreadable moment happen on demand (about one
// fire in 1,000 with the suite running), but it can hand the actuator the answer
// ps gives in that moment. fakePs() puts a shell script named `ps` first on PATH
// -- the actuator runs `ps` by name -- and returns the undo. Call the undo in a
// `finally`: PATH is this test process's own, but every later spawn reads it.

import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// script -- the body of the stand-in, e.g. 'echo "(python3.14)"' or 'exit 2'.
export function fakePs(script) {
  const bin = mkdtempSync(join(tmpdir(), 'fake-ps-'));
  writeFileSync(join(bin, 'ps'), `#!/bin/sh\n${script}\n`, { mode: 0o755 });
  const before = process.env.PATH;
  process.env.PATH = `${bin}:${before}`;
  return () => {
    process.env.PATH = before;
    rmSync(bin, { recursive: true, force: true });
  };
}
