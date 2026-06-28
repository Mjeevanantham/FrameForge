import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';

function waitForServer(url, { timeoutMs = 5000 } = {}) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    async function poll() {
      try {
        const response = await fetch(url);
        resolve(response);
      } catch (error) {
        if (Date.now() - startedAt > timeoutMs) {
          reject(error);
          return;
        }
        setTimeout(poll, 100);
      }
    }
    poll();
  });
}

test('web server serves health and landing page', async () => {
  const port = 3210 + Math.floor(Math.random() * 500);
  const child = spawn(process.execPath, ['apps/web/src/server.js'], {
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    const healthResponse = await waitForServer(`http://127.0.0.1:${port}/health`);
    assert.equal(healthResponse.status, 200);
    assert.deepEqual(await healthResponse.json(), { ok: true, service: 'frameforge-web' });

    const homeResponse = await fetch(`http://127.0.0.1:${port}/`);
    const home = await homeResponse.text();
    assert.equal(homeResponse.status, 200);
    assert.match(home, /HTML to production-quality video/);
    assert.match(home, /preview-720p-30/);
    assert.match(home, /<svg/);

    const notFoundResponse = await fetch(`http://127.0.0.1:${port}/missing`);
    assert.equal(notFoundResponse.status, 404);
  } finally {
    child.kill('SIGTERM');
  }
});
