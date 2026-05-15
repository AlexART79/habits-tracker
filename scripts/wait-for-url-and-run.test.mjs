import assert from 'node:assert/strict';
import { test } from 'node:test';
import { waitForUrl } from './wait-for-url-and-run.mjs';

test('waitForUrl resolves when the URL returns an HTTP response, including 401', async () => {
  let attempts = 0;

  const response = await waitForUrl('http://localhost:3002/auth/me', {
    intervalMs: 1,
    timeoutMs: 100,
    request: async () => {
      attempts += 1;
      if (attempts === 1) {
        throw new Error('ECONNREFUSED');
      }
      return { status: 401 };
    },
  });

  assert.equal(response.status, 401);
  assert.equal(attempts, 2);
});
