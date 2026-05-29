/**
 * Integration tests for the VCaaS backend.
 *
 * Run against a local functions-framework + Firestore emulator:
 *   npm run dev (in another terminal)
 *   npm test
 *
 * These tests exercise validation logic and the happy path. They use the
 * built-in node:test runner (Node 18+) — no extra dependencies.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');

const API = process.env.TEST_API_URL || 'http://localhost:8080';

// Minimal 1x1 PNG (valid image bytes)
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

function buildFormData(overrides = {}) {
  const fd = new FormData();
  for (let i = 0; i < 9; i++) {
    fd.append(`images[${i}]`, new Blob([PNG_1x1], { type: 'image/png' }), `img${i}.png`);
  }
  fd.append('to', overrides.to ?? 'Sarah');
  fd.append('from', overrides.from ?? 'Alex');
  fd.append('message', overrides.message ?? 'Be mine');
  fd.append('prompt', overrides.prompt ?? 'a heart');
  fd.append('correctCells', overrides.correctCells ?? 'all');
  fd.append('ttl', overrides.ttl ?? '7');
  return fd;
}

describe('uploadImages', () => {
  test('rejects when fewer than 9 images', async () => {
    const fd = new FormData();
    fd.append('images[0]', new Blob([PNG_1x1], { type: 'image/png' }), 'a.png');
    fd.append('to', 'Sarah');
    fd.append('from', 'Alex');

    const res = await fetch(`${API}/upload`, { method: 'POST', body: fd });
    assert.strictEqual(res.status, 400);
  });

  test('rejects missing recipient name', async () => {
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      body: buildFormData({ to: '' }),
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error);
  });

  test('creates a valentine and returns a short URL', async () => {
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      body: buildFormData(),
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.ok(body.shortId, 'has shortId');
    assert.strictEqual(body.shortId.length, 16, 'shortId is 16 chars');
    assert.match(body.shortUrl, /\/v\/[0-9a-zA-Z]{16}$/, 'shortUrl format');
    assert.ok(body.configId, 'has configId');
    assert.ok(body.expiresAt, 'has expiresAt');
  });

  test('caps TTL at 30 days', async () => {
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      body: buildFormData({ ttl: '999' }),
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.ttlDays <= 30, 'ttl capped at 30');
  });
});

describe('resolveUrl', () => {
  test('returns 404 for unknown short IDs', async () => {
    const res = await fetch(`${API}/r/0000000000000000`, { redirect: 'manual' });
    assert.ok(res.status === 404 || res.status === 400);
  });

  test('redirects a valid short URL to the valentine page', async () => {
    // First create one
    const createRes = await fetch(`${API}/upload`, {
      method: 'POST',
      body: buildFormData({ to: 'Resolve', from: 'Test' }),
    });
    const { shortId } = await createRes.json();

    const res = await fetch(`${API}/r/${shortId}`, { redirect: 'manual' });
    assert.strictEqual(res.status, 302);
    const location = res.headers.get('location');
    assert.match(location, /[?&]to=Resolve/);
    assert.match(location, /[?&]img0=/);
  });
});

describe('getConfig', () => {
  test('returns config JSON for a valid id', async () => {
    const createRes = await fetch(`${API}/upload`, {
      method: 'POST',
      body: buildFormData({ to: 'ConfigTest' }),
    });
    const { configId } = await createRes.json();

    const res = await fetch(`${API}/config/${configId}`);
    assert.strictEqual(res.status, 200);
    const cfg = await res.json();
    assert.strictEqual(cfg.to, 'ConfigTest');
    assert.strictEqual(cfg.imageUrls.length, 9);
  });

  test('returns 404 for unknown config id', async () => {
    const res = await fetch(`${API}/config/does-not-exist`);
    assert.strictEqual(res.status, 404);
  });
});
