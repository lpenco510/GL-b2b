import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSessionToken, passwordMatches, safeNextPath, verifySessionToken } from './session.ts';
import { createRateLimiter, csvCell } from './rateLimit.ts';

const SECRET = 'x'.repeat(40);

test('sesión válida para su app y no para otra', async () => {
  const t = await createSessionToken(SECRET, 'partner');
  assert.ok(await verifySessionToken(SECRET, t, 'partner'));
  assert.equal(await verifySessionToken(SECRET, t, 'console'), null);
});

test('sesión adulterada o con otra clave se rechaza', async () => {
  const t = await createSessionToken(SECRET, 'partner');
  const [body, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ aud: 'partner', iat: 0, exp: 9_999_999_999 })).toString('base64url');
  assert.equal(await verifySessionToken(SECRET, `${forged}.${sig}`, 'partner'), null);
  assert.equal(await verifySessionToken('y'.repeat(40), `${body}.${sig}`, 'partner'), null);
});

test('sesión vencida se rechaza', async () => {
  const t = await createSessionToken(SECRET, 'partner', Date.now() - 8 * 86_400_000);
  assert.equal(await verifySessionToken(SECRET, t, 'partner'), null);
});

test('contraseña', async () => {
  assert.equal(await passwordMatches('gravl-2026', 'gravl-2026'), true);
  assert.equal(await passwordMatches('gravl-2025', 'gravl-2026'), false);
  assert.equal(await passwordMatches('', 'gravl-2026'), false);
});

test('next solo acepta rutas internas', () => {
  assert.equal(safeNextPath('/retention?segment=AT_RISK'), '/retention?segment=AT_RISK');
  assert.equal(safeNextPath('https://malicioso.com'), '/');
  assert.equal(safeNextPath('//malicioso.com'), '/');
  assert.equal(safeNextPath('/\\malicioso.com'), '/');
});

test('rate limit: 5 intentos y bloqueo', () => {
  const rl = createRateLimiter({ max: 5, windowMs: 60_000 });
  for (let i = 0; i < 5; i++) assert.equal(rl.hit('ip').allowed, true);
  const blocked = rl.hit('ip');
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSec > 0);
});

test('CSV: neutraliza fórmulas', () => {
  assert.equal(csvCell('=HYPERLINK("x")'), `"'=HYPERLINK(""x"")"`);
  assert.equal(csvCell('Sofía'), '"Sofía"');
});
