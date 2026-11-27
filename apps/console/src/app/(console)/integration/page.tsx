'use client';

import { integrationMatrix, type Availability } from '@gravl/gravl-api';
import { Badge, Card, CardHeader, PageHeader, type Tone } from '@gravl/ui';
import { Cable, Database, KeyRound, Webhook } from 'lucide-react';

const meta: Record<Availability, { label: string; tone: Tone; text: string }> = {
  HOY: { label: 'Disponible hoy', tone: 'volt', text: 'Está en la API pública (OAuth, solo lectura).' },
  PEDIR: { label: 'Hay que pedirlo', tone: 'amber', text: 'La app ya lo sabe o lo hace; falta exponerlo.' },
  B2B: { label: 'Canal B2B', tone: 'neutral', text: 'No es para la API pública: canal interno o ERP.' },
};

const channels = [
  {
    icon: KeyRound,
    title: 'API pública + OAuth',
    who: 'Coaches · gimnasios chicos',
    body: 'Cada socio autoriza scopes desde la app. 100 pedidos cada 15 min por socio: alcanza para decenas de clientes. El producto para coaches se puede construir hoy.',
  },
  {
    icon: Database,
    title: 'Canal interno B2B',
    who: 'Cadenas · empresas',
    body: 'Servicio de GRAVL que lee del core (réplica de lectura o eventos), filtra por consentimiento y arma agregados por sede. Es la única forma de escalar a miles de socios.',
  },
  {
    icon: Webhook,
    title: 'Eventos y escritura',
    who: 'Todo el B2B',
    body: 'Webhooks (entreno terminado, PR, máquina ocupada) y dos escrituras: push con marca del partner y asignar rutina. Sin esto, el copiloto solo recomienda.',
  },
];

/** La matriz es configuración estática del paquete @gravl/gravl-api. */
export default function IntegrationPage() {
  const counts = (a: Availability) => integrationMatrix.filter((i) => i.availability === a).length;
  return (
    <div className="gravl-stagger space-y-6">
      <PageHeader
        eyebrow="Para el equipo de GRAVL"
        title={<>Integración GRAVL<span className="text-gravl-text-muted">.</span></>}
        description="Qué necesita cada pantalla del B2B y de dónde sale. Relevado de gravl.ai/developers: 15 endpoints, 7 scopes, todo de solo lectura."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(['HOY', 'PEDIR', 'B2B'] as Availability[]).map((a, i) => (
          <div key={a} className={i === 0 ? 'gravl-card !border-transparent !bg-gravl-ink p-5 text-white' : 'gravl-card p-5'}>
            <p className={i === 0 ? 'gravl-label !text-white/55' : 'gravl-label'}>{meta[a].label}</p>
            <p className={`gravl-num mt-3 text-[56px] ${i === 0 ? 'text-gravl-lime' : 'text-gravl-text'}`}>{counts(a)}</p>
            <p className={`mt-2 text-[13px] ${i === 0 ? 'text-white/60' : 'text-gravl-text-muted'}`}>{meta[a].text}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {channels.map((c) => (
          <Card key={c.title} interactive className="p-5">
            <c.icon size={18} className="text-gravl-text-muted" aria-hidden />
            <p className="mt-3 text-[15px] font-semibold text-gravl-text">{c.title}</p>
            <p className="gravl-label mt-1">{c.who}</p>
            <p className="mt-3 text-[13px] leading-relaxed text-gravl-text-secondary">{c.body}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-gravl-line p-5">
          <CardHeader icon={Cable} title="Matriz de integración" subtitle="Cada fila es una necesidad concreta del producto B2B." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-[13px]">
            <caption className="sr-only">Necesidades del B2B y su fuente</caption>
            <thead>
              <tr className="text-left">
                <th scope="col" className="gravl-label px-5 py-3">Necesidad</th>
                <th scope="col" className="gravl-label px-3 py-3">Dónde se usa</th>
                <th scope="col" className="gravl-label px-3 py-3">Fuente</th>
                <th scope="col" className="gravl-label px-3 py-3">Estado</th>
                <th scope="col" className="gravl-label px-5 py-3">Nota</th>
              </tr>
            </thead>
            <tbody>
              {integrationMatrix.map((i) => (
                <tr key={i.need} className="gravl-row border-t border-gravl-line align-top">
                  <td className="px-5 py-3 font-semibold text-gravl-text">{i.need}</td>
                  <td className="px-3 py-3 text-gravl-text-secondary">{i.usedIn}</td>
                  <td className="px-3 py-3">
                    <code className="text-xs text-gravl-text">{i.source}</code>
                    {i.scope && <p className="mt-0.5 text-[11px] text-gravl-text-muted">{i.scope}</p>}
                  </td>
                  <td className="px-3 py-3"><Badge tone={meta[i.availability].tone}>{meta[i.availability].label}</Badge></td>
                  <td className="px-5 py-3 text-gravl-text-muted">{i.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-gravl-text-muted">
        Cliente tipado de la API pública con tests: <code>packages/gravl-api</code>. Detalle técnico: <code>docs/07-integracion-gravl.md</code>.
      </p>
    </div>
  );
}
