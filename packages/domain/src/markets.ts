/**
 * Mercados. Todo lo que cambia por país vive acá: moneda, rieles de cobro,
 * facturación fiscal, ley de datos y región de almacenamiento.
 *
 * ⚠️ `status` y las cifras de impuestos son SUPUESTOS a validar con legal/finanzas
 * antes de cotizar. No son asesoramiento fiscal.
 */

export type MarketCode = 'AR' | 'UY' | 'CL' | 'BR' | 'MX' | 'CO' | 'ES' | 'US';
export type MarketStatus = 'live' | 'pilot' | 'planned';
export type DataRegion = 'sa-east' | 'us-east' | 'eu-west';

export interface Market {
  code: MarketCode;
  name: string;
  flag: string;
  status: MarketStatus;
  currency: string;
  locale: string;
  timeZone: string;
  /** Moneda en la que cotizamos B2B. En mercados con alta inflación, USD. */
  quoteCurrency: 'USD' | 'EUR' | 'local';
  /** Tipo de cambio de referencia (unidades de moneda local por 1 USD). Solo demo. */
  usdRate: number;
  vatPct: number;
  billingRails: string[];
  fiscalInvoice: string;
  privacyLaw: string;
  dataRegion: DataRegion;
  aggregators: string[];
  notes: string;
}

export const markets: Record<MarketCode, Market> = {
  AR: {
    code: 'AR', name: 'Argentina', flag: '🇦🇷', status: 'live', currency: 'ARS', locale: 'es-AR', timeZone: 'America/Argentina/Buenos_Aires',
    quoteCurrency: 'USD', usdRate: 1150, vatPct: 21, billingRails: ['Mercado Pago', 'dLocal', 'Stripe (USD)'],
    fiscalInvoice: 'Factura electrónica (ARCA)', privacyLaw: 'Ley 25.326', dataRegion: 'sa-east', aggregators: ['Wellhub'],
    notes: 'Cotizar en USD, facturar en ARS al tipo de cambio del día de emisión. Revisión de precio trimestral. Respetar “botón de baja”.',
  },
  UY: {
    code: 'UY', name: 'Uruguay', flag: '🇺🇾', status: 'planned', currency: 'UYU', locale: 'es-UY', timeZone: 'America/Montevideo',
    quoteCurrency: 'USD', usdRate: 40, vatPct: 22, billingRails: ['dLocal', 'Stripe (USD)'],
    fiscalInvoice: 'CFE (DGI)', privacyLaw: 'Ley 18.331', dataRegion: 'sa-east', aggregators: [],
    notes: 'Mercado chico: entrar vía cadenas argentinas con sedes en Montevideo.',
  },
  CL: {
    code: 'CL', name: 'Chile', flag: '🇨🇱', status: 'pilot', currency: 'CLP', locale: 'es-CL', timeZone: 'America/Santiago',
    quoteCurrency: 'local', usdRate: 940, vatPct: 19, billingRails: ['Stripe', 'dLocal'],
    fiscalInvoice: 'Factura electrónica (SII)', privacyLaw: 'Ley 19.628 → Ley 21.719', dataRegion: 'sa-east', aggregators: ['Wellhub'],
    notes: 'La nueva ley de datos endurece el tratamiento de datos de salud: consentimiento explícito por finalidad.',
  },
  BR: {
    code: 'BR', name: 'Brasil', flag: '🇧🇷', status: 'pilot', currency: 'BRL', locale: 'pt-BR', timeZone: 'America/Sao_Paulo',
    quoteCurrency: 'local', usdRate: 5.4, vatPct: 0, billingRails: ['Pix (dLocal)', 'Stripe', 'Boleto'],
    fiscalInvoice: 'NFS-e municipal', privacyLaw: 'LGPD', dataRegion: 'sa-east', aggregators: ['Wellhub', 'TotalPass'],
    notes: 'Mercado más grande de LatAm y cuna de los agregadores: competimos o nos integramos con ellos. Impuestos sobre servicios por municipio (ISS) — validar con contador local.',
  },
  MX: {
    code: 'MX', name: 'México', flag: '🇲🇽', status: 'pilot', currency: 'MXN', locale: 'es-MX', timeZone: 'America/Mexico_City',
    quoteCurrency: 'local', usdRate: 18.5, vatPct: 16, billingRails: ['Stripe', 'OXXO Pay', 'SPEI'],
    fiscalInvoice: 'CFDI 4.0 (SAT)', privacyLaw: 'LFPDPPP', dataRegion: 'us-east', aggregators: ['Wellhub', 'TotalPass'],
    notes: 'Fuerte presencia de cadenas low-cost de alto volumen: el modelo “débito automático” es la norma.',
  },
  CO: {
    code: 'CO', name: 'Colombia', flag: '🇨🇴', status: 'planned', currency: 'COP', locale: 'es-CO', timeZone: 'America/Bogota',
    quoteCurrency: 'local', usdRate: 4100, vatPct: 19, billingRails: ['dLocal', 'PSE', 'Stripe'],
    fiscalInvoice: 'Factura electrónica (DIAN)', privacyLaw: 'Ley 1581', dataRegion: 'us-east', aggregators: ['Wellhub'],
    notes: 'Registro de bases de datos ante la SIC obligatorio.',
  },
  ES: {
    code: 'ES', name: 'España', flag: '🇪🇸', status: 'planned', currency: 'EUR', locale: 'es-ES', timeZone: 'Europe/Madrid',
    quoteCurrency: 'EUR', usdRate: 0.92, vatPct: 21, billingRails: ['Stripe (SEPA)'],
    fiscalInvoice: 'Factura electrónica', privacyLaw: 'GDPR', dataRegion: 'eu-west', aggregators: ['Wellhub'],
    notes: 'Puerta a la UE. GDPR exige DPA con cada partner, datos en la UE y base legal por finalidad (art. 9 para salud).',
  },
  US: {
    code: 'US', name: 'Estados Unidos', flag: '🇺🇸', status: 'planned', currency: 'USD', locale: 'en-US', timeZone: 'America/New_York',
    quoteCurrency: 'USD', usdRate: 1, vatPct: 0, billingRails: ['Stripe'],
    fiscalInvoice: 'Invoice (sales tax por estado)', privacyLaw: 'CCPA + leyes estatales', dataRegion: 'us-east', aggregators: ['Wellhub'],
    notes: 'SaaS gravado en algunos estados: calcular sales tax con un proveedor (Stripe Tax). Regulación de suscripciones por estado.',
  },
};

export const marketList = Object.values(markets);

export function toLocal(usd: number, market: MarketCode) {
  return usd * markets[market].usdRate;
}
