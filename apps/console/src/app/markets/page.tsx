import type { Metadata } from 'next';
import { marketList, type MarketStatus } from '@gravl/domain';
import { portfolio } from '@gravl/mock-data';
import { Badge, Card, PageHeader, type Tone } from '@gravl/ui';

export const metadata: Metadata = { title: 'Mercados' };

const statusMeta: Record<MarketStatus, { label: string; tone: Tone }> = {
  live: { label: 'Operando', tone: 'emerald' },
  pilot: { label: 'Piloto', tone: 'cyan' },
  planned: { label: 'Planeado', tone: 'neutral' },
};

/** Server component: datos estáticos de configuración, sin estado de cliente. */
export default function MarketsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mercados"
        description="Lo que cambia por país: moneda, cobro, factura fiscal, ley de datos y región de almacenamiento. Estados y cifras impositivas son supuestos a validar con legal y finanzas."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {marketList.map((m) => {
          const partners = portfolio.filter((p) => p.market === m.code);
          return (
            <Card key={m.code} className="flex flex-col p-5">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-white">{m.flag} {m.name}</p>
                <Badge tone={statusMeta[m.status].tone}>{statusMeta[m.status].label}</Badge>
              </div>
              <dl className="mt-4 space-y-1.5 text-xs">
                {[
                  ['Moneda', `${m.currency}${m.quoteCurrency === 'USD' ? ' · cotiza en USD' : ''}`],
                  ['IVA / impuestos', m.vatPct ? `${m.vatPct}%` : 'Variable (ver notas)'],
                  ['Cobro', m.billingRails.join(', ')],
                  ['Factura', m.fiscalInvoice],
                  ['Datos', `${m.privacyLaw} · región ${m.dataRegion}`],
                  ['Agregadores', m.aggregators.join(', ') || '—'],
                  ['Partners', partners.length ? partners.map((p) => p.name).join(', ') : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="shrink-0 text-gravl-text-muted">{k}</dt>
                    <dd className="text-right text-gravl-text-secondary">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-gravl-text-muted">{m.notes}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
