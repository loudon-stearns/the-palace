// No test may listen on the wildcard address. A TCP listen with no host, or with '::' or
// '0.0.0.0', throws here before it binds. The reason is in tests/helpers/loopback.js: a wildcard
// port can be one another program holds on 127.0.0.1, and then that program answers the test.
//
// The usual way to trip this is handing supertest a bare http.Server: supertest then does the
// wildcard listen itself. Hand it `await listen(server)` from tests/helpers/loopback.js instead.

import net from 'node:net';

const LOOPBACK = new Set(['127.0.0.1', '::1', 'localhost']);
const listen = net.Server.prototype.listen;

// listen(port, host?, …) and listen({ port, host }) are TCP; listen(path), listen({ path }) and
// listen(handle) are not, and pass through.
function tcpHost(args) {
  const [first, second] = args;
  if (first !== null && typeof first === 'object') {
    return 'port' in first ? { host: first.host } : null;
  }
  if (typeof first === 'string' && Number.isNaN(Number(first))) return null;
  return { host: typeof second === 'string' ? second : undefined };
}

net.Server.prototype.listen = function loopbackOnlyListen(...args) {
  const tcp = tcpHost(args);
  if (tcp && !LOOPBACK.has(tcp.host)) {
    throw new Error(
      `a test listened on ${tcp.host === undefined ? 'the wildcard address (no host)' : `'${tcp.host}'`}; `
      + 'tests listen on 127.0.0.1 only. Use listen(server) from tests/helpers/loopback.js and hand '
      + 'supertest the URL it returns, not the server.',
    );
  }
  return listen.apply(this, args);
};
