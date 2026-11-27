/**
 * Cuánto cobramos, cuánto gana el partner y cuánto nos queda.
 * Toda cotización (Deal Desk) y toda factura usan estas funciones.
 */
import type { Deal, Pricing } from './deals';

/** Costo variable estimado por usuario activo/mes: infra + IA + soporte (USD). Supuesto a validar con finanzas. */
export const COST_PER_ACTIVE_USER_USD = 0.35;
/** Margen bruto mínimo aceptable. Por debajo, el deal no se firma. */
export const MIN_GROSS_MARGIN = 0.6;

export interface Usage {
  activeUsers: number;
  eligible: number;
  locations: number;
  coachClients: number;
  /** Ingreso bruto mensual por upsell a GRAVL Pro dentro del partner (USD). */
  proUpsellRevenueUsd: number;
}

export function effectiveUnitPrice(p: Pricing) {
  return p.unitPriceUsd * (1 - p.discountPct / 100);
}

/** Factura mensual al partner (USD, antes de impuestos). */
export function monthlyInvoiceUsd(p: Pricing, u: Usage): number {
  const unit = effectiveUnitPrice(p);
  let base: number;
  switch (p.model) {
    case 'PER_ACTIVE_USER': base = unit * u.activeUsers; break;
    case 'PER_ELIGIBLE': base = unit * u.eligible; break;
    case 'PER_LOCATION': base = unit * u.locations; break;
    case 'PER_COACH': base = unit + Math.max(0, u.coachClients - 15) * 1.5; break;
  }
  return Math.max(p.minimumMonthlyUsd, base);
}

/** Lo que le pagamos al partner por el upsell de Pro dentro de su base. */
export function partnerRevShareUsd(p: Pricing, u: Usage) {
  return (u.proUpsellRevenueUsd * p.partnerRevSharePct) / 100;
}

export function gravlGrossMargin(p: Pricing, u: Usage) {
  const revenue = monthlyInvoiceUsd(p, u) + u.proUpsellRevenueUsd - partnerRevShareUsd(p, u);
  const cost = u.activeUsers * COST_PER_ACTIVE_USER_USD;
  return revenue > 0 ? (revenue - cost) / revenue : 0;
}

export type ApprovalLevel = 'AUTO' | 'HEAD_OF_SALES' | 'CEO';

/** Reglas de descuento: protegen el margen y evitan que cada vendedor invente precio. */
export function approvalFor(p: Pricing, margin: number): { level: ApprovalLevel; reason: string } {
  if (margin < MIN_GROSS_MARGIN) return { level: 'CEO', reason: `Margen ${Math.round(margin * 100)}% < piso de ${MIN_GROSS_MARGIN * 100}%` };
  if (p.discountPct > 30) return { level: 'CEO', reason: 'Descuento mayor a 30%' };
  if (p.discountPct > 15 || p.termMonths < 12) return { level: 'HEAD_OF_SALES', reason: p.discountPct > 15 ? 'Descuento mayor a 15%' : 'Plazo menor a 12 meses' };
  return { level: 'AUTO', reason: 'Dentro de la política comercial' };
}

export interface PartnerRoiInput {
  members: number;
  avgMonthlyFeeUsd: number;
  /** Puntos de retención anual ganados (ATTENDANCE) o bajas evitadas/mes como % (BREAKAGE). */
  liftPts: number;
}

/**
 * ROI del partner. Mismo cálculo, distinta palanca según el modelo:
 *  - ATTENDANCE: socios que no se van por mejor experiencia.
 *  - BREAKAGE: cancelaciones evitadas sobre la base con intención de baja + revenue share.
 */
export function partnerRoi(deal: Pick<Deal, 'monetization' | 'pricing'>, input: PartnerRoiInput, u: Usage) {
  const retainedMembers = Math.round(input.members * (input.liftPts / 100));
  const retainedRevenue = retainedMembers * input.avgMonthlyFeeUsd * 12;
  const revShare = deal.monetization === 'BREAKAGE' ? partnerRevShareUsd(deal.pricing, u) * 12 : 0;
  const annualCost = monthlyInvoiceUsd(deal.pricing, u) * 12 + deal.pricing.setupFeeUsd;
  const gain = retainedRevenue + revShare;
  return {
    retainedMembers,
    retainedRevenue,
    revShare,
    annualCost,
    net: gain - annualCost,
    multiple: annualCost ? gain / annualCost : 0,
    paybackMonths: gain ? (annualCost / gain) * 12 : Infinity,
  };
}
