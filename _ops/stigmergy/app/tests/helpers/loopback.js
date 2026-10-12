// Give supertest a URL on 127.0.0.1, never the bare server.
//
// Handed a server that is not listening yet, supertest calls server.listen(0) with no host. That
// binds the wildcard address, and the request then goes to http://127.0.0.1:<port>. This Mac hands
// out ephemeral ports in sequence, and a wildcard listen can be given a number another program
// already holds on 127.0.0.1 alone; a request to 127.0.0.1 is then answered by that program, not by
// the test's server. In the suite it showed as a 426, a socket hang up, another app's 200. The
// measurements are in the app README, § Testing, worktree & topology gotchas.
//
// tests/setup/loopback-only.js turns a wildcard listen into a failure, so this is the only way in.

const open = new Set();

/** Start `server` on a 127.0.0.1 port of its own. Resolves to the URL to hand supertest. */
export function listen(server) {
  return new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', fail);
      open.add(server);
      ok(`http://127.0.0.1:${server.address().port}`);
    });
  });
}

/**
 * Close every server listen() has opened in this test file and not yet closed. Call it from the
 * after-hook that matches where they were opened: afterEach for servers made in beforeEach or
 * inside a test, afterAll for servers made in beforeAll.
 */
export async function closeAll() {
  const servers = [...open];
  open.clear();
  await Promise.all(servers.map((server) => new Promise((done) => server.close(done))));
}
