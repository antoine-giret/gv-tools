import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { ApiError, fetchApi } from '../app/utils/fetch-api.ts';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('returns successful responses unchanged', async () => {
  const response = new Response('{"count":1}', { status: 200 });
  globalThis.fetch = async () => response;

  assert.equal(await fetchApi('/api/users/1/stats_traces'), response);
});

test('exposes an expired session as a 401 error', async () => {
  globalThis.fetch = async () => new Response('Unauthorized', { status: 401 });

  await assert.rejects(fetchApi('/api/users/1/stats_traces'), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 401);
    return true;
  });
});

test('preserves other HTTP errors and network failures', async () => {
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 });
  await assert.rejects(fetchApi('/api/users/1'), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 503);
    return true;
  });

  const networkError = new TypeError('Network unavailable');
  globalThis.fetch = async () => {
    throw networkError;
  };
  await assert.rejects(fetchApi('/api/users/1'), (error) => error === networkError);
});
