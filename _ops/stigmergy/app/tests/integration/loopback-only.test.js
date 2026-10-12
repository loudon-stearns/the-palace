// The suite's own rule: no test listens on the wildcard address. tests/setup/loopback-only.js
// enforces it and tests/helpers/loopback.js is the way to comply; the reason is written there.
// If the first two tests fail, the setup file has come out of vitest.config.js, and a test's
// request can again be answered by another program on this machine.

import { describe, test, expect, afterEach } from 'vitest';
import http from 'node:http';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';

const makeServer = () => http.createServer((req, res) => { res.end('this server'); });

describe('tests listen on 127.0.0.1 only', () => {
  afterEach(closeAll);

  test('a listen with no host, or on a wildcard, is refused before it binds', () => {
    const server = makeServer();
    expect(() => server.listen(0)).toThrow(/wildcard address/);
    expect(() => server.listen({ port: 0 })).toThrow(/wildcard address/);
    expect(() => server.listen(0, '::')).toThrow(/127\.0\.0\.1 only/);
    expect(() => server.listen(0, '0.0.0.0')).toThrow(/127\.0\.0\.1 only/);
    expect(server.listening).toBe(false);
  });

  test('handing supertest a bare server is refused, and the error names the helper', () => {
    expect(() => request(makeServer()).get('/')).toThrow(/tests\/helpers\/loopback\.js/);
  });

  test('listen() binds 127.0.0.1 and the URL it returns reaches that server', async () => {
    const server = makeServer();
    const base = await listen(server);
    expect(server.address().address).toBe('127.0.0.1');
    expect(base).toBe(`http://127.0.0.1:${server.address().port}`);
    const res = await request(base).get('/');
    expect(res.text).toBe('this server');
  });

  test('closeAll() closes every server listen() opened', async () => {
    const servers = [makeServer(), makeServer()];
    for (const server of servers) await listen(server);
    await closeAll();
    expect(servers.map((server) => server.listening)).toEqual([false, false]);
  });
});
