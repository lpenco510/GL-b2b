// Tests de las reglas de negocio. Correr con: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nudgeDecision, revenueAtRiskUsd } from './engagement.ts';
import { playbooks } from './deals.ts';
import { approvalFor, gravlGrossMargin, monthlyInvoiceUsd } from './pricing.ts';
import type { B2BMemberTelemetry } from './types.ts';

const NOW = new Date('2026-11-23T19:00:00-03:00');
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();
const member = (over: Partial<B2BMemberTelemetry> = {}): B2BMemberTelemetry => ({
  userId: 'm1', gravlUserId: 'g1', externalMemberId: 'e1', consents: ['ACTIVITY', 'PARTNER_MESSAGING'],
  paymentStatus: 'CURRENT', fullName: 'Test', locationId: 'l1', joinedAt: daysAgo(200), workoutsFirst30Days: 8,
  workoutsLast30Days: 0, workoutsThisWeek: 0, weeklyTarget: 3, currentStreakWeeks: 0, strengthScore: 200,
  strengthScoreDelta30d: 0, macrosActive: false, lastWorkoutAt: daysAgo(30), status: 'AT_RISK', churnRisk: 80, ...over,
});
const attendance = playbooks.REGIONAL_CHAIN.defaultContactPolicy;
const breakage = playbooks.HIGH_VOLUME.defaultContactPolicy;

test('asistencia: el socio inactivo recibe push', () => {
  const d = nudgeDecision(member(), attendance, { now: NOW });
  assert.equal(d.allowed, true);
  assert.equal(d.channel, 'PUSH');
});

test('débito automático: NO se contacta al durmiente que paga', () => {
  assert.equal(nudgeDecision(member(), breakage, { now: NOW }).allowed, false);
});

test('débito automático: la intención de baja va a staff', () => {
  const d = nudgeDecision(member({ cancelIntent: 'CANCEL_PAGE_VISIT' }), breakage, { now: NOW });
  assert.equal(d.allowed, true);
  assert.equal(d.channel, 'STAFF');
});

test('sin consentimiento nunca se contacta, aunque quiera darse de baja', () => {
  const d = nudgeDecision(member({ consents: ['ACTIVITY'], cancelIntent: 'CANCEL_PAGE_VISIT' }), attendance, { now: NOW });
  assert.equal(d.allowed, false);
});

test('límite de frecuencia', () => {
  assert.equal(nudgeDecision(member(), attendance, { now: NOW, lastNudgedAt: daysAgo(2) }).allowed, false);
});

test('en débito automático la inactividad no es ingreso en riesgo', () => {
  assert.equal(revenueAtRiskUsd([member()], 'BREAKAGE', 30), 0);
  assert.ok(revenueAtRiskUsd([member()], 'ATTENDANCE', 30) > 0);
});

test('factura respeta el mínimo mensual', () => {
  const p = { ...playbooks.HIGH_VOLUME.defaultPricing, discountPct: 0 };
  const u = { activeUsers: 100, eligible: 0, locations: 1, coachClients: 0, proUpsellRevenueUsd: 0 };
  assert.equal(monthlyInvoiceUsd(p, u), p.minimumMonthlyUsd);
});

test('descuentos grandes requieren aprobación', () => {
  const p = { ...playbooks.REGIONAL_CHAIN.defaultPricing, discountPct: 35 };
  const u = { activeUsers: 1000, eligible: 0, locations: 3, coachClients: 0, proUpsellRevenueUsd: 0 };
  assert.equal(approvalFor(p, gravlGrossMargin(p, u)).level, 'CEO');
});
