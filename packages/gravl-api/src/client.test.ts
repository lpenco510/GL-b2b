// Tests contra los ejemplos publicados en gravl.ai/es/developers. Correr con: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGravlClient, GravlApiError } from './client.ts';
import { activitySnapshot, toKg } from './mapping.ts';
import type { GravlStats, WorkoutSummary } from './types.ts';

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers });

test('lista entrenamientos con el token del socio', async () => {
  let seen = '';
  const client = createGravlClient({
    token: 'gat_test',
    fetch: async (url, init) => {
      seen = `${url} ${(init?.headers as Record<string, string>).Authorization}`;
      return json(200, { items: [], pageNumber: 1, totalPages: 1, totalCount: 0, hasPreviousPage: false, hasNextPage: false });
    },
  });
  await client.workouts({ page: 1, pageSize: 2 });
  assert.equal(seen, 'https://api.gravl.ai/api/v1/workouts?page=1&pageSize=2 Bearer gat_test');
});

test('429: respeta Retry-After y reintenta', async () => {
  let calls = 0;
  const waits: number[] = [];
  const client = createGravlClient({
    token: 't',
    sleep: async (ms) => void waits.push(ms),
    fetch: async () => (++calls === 1 ? json(429, undefined, { 'Retry-After': '7' }) : json(200, { streak: { current: 1, longest: 1, workoutsThisWeek: 1 }, totalXp: 0, trophyCount: 0 })),
  });
  await client.stats();
  assert.equal(calls, 2);
  assert.deepEqual(waits, [7000]);
});

test('403: el socio no concedió el scope → error explícito, sin reintento', async () => {
  let calls = 0;
  const client = createGravlClient({
    token: 't',
    fetch: async () => (calls++, json(403, { status: 403, title: 'Missing scope', detail: "This authorization is missing the 'measurements:read' scope." })),
  });
  await assert.rejects(client.stats(), (e: unknown) => e instanceof GravlApiError && e.missingScope);
  assert.equal(calls, 1);
});

test('mapeo: libras a kg y actividad de 30 días', () => {
  assert.equal(toKg(24150), 10954.3);
  const now = new Date('2026-07-20T12:00:00Z');
  const w = (d: string, volume = 24150): WorkoutSummary => ({
    id: d, name: 'Push Day', notes: null, startDate: d, endDate: d, durationMinutes: 62, type: 'custom', volume, calories: 410, personalRecordCount: 1, exerciseCount: 6,
  });
  const stats: GravlStats = { streak: { current: 6, longest: 14, workoutsThisWeek: 3 }, totalXp: 12480, trophyCount: 22 };
  const snap = activitySnapshot([w('2026-07-12T17:03:00Z'), w('2026-05-01T10:00:00Z')], stats, [], now);
  assert.equal(snap.workoutsLast30Days, 1);
  assert.equal(snap.currentStreakWeeks, 6);
  assert.equal(snap.lastWorkoutAt, '2026-07-12T17:03:00Z');
});
