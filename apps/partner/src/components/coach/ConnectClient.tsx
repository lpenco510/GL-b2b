'use client';

import React, { useState } from 'react';
import { Badge, Button, Card, CardHeader, Segmented, cn } from '@gravl/ui';
import { fmtDate, fmtInt } from '@gravl/domain';
import { AlertTriangle, Check, Copy, Flame, KeyRound, Link2, Loader2, PlugZap, Trophy } from 'lucide-react';

interface LiveResult {
  client: { name: string; goal: string | null };
  snapshot: { workoutsLast30Days: number; workoutsThisWeek: number; currentStreakWeeks: number; lastWorkoutAt: string | null; volumeLast30DaysKg: number; prsLast30Days: number };
  totalXp: number;
  recentWorkouts: { id: string; name: string; date: string; minutes: number; volumeKg: number; prs: number }[];
  records: { exercise: string; type: string; weightKg: number | null; reps: number | null; at: string }[];
  scopesMissing: string[];
}

const SCOPES = ['profile:read', 'workouts:read', 'stats:read', 'records:read'];
const goalLabel: Record<string, string> = { stronger: 'Más fuerza', muscleMass: 'Masa muscular', lean: 'Definición', generalFitness: 'Fitness general' };

/**
 * Conectar clientes reales de GRAVL. Dos caminos:
 *  1. OAuth (el definitivo): el cliente acepta desde su app los permisos que pide el coach.
 *  2. Token personal (para probar hoy): el cliente genera un token de solo lectura y lo comparte.
 */
export default function ConnectClient() {
  const [mode, setMode] = useState<'oauth' | 'token'>('token');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<LiveResult>();
  const [copied, setCopied] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GRAVL_OAUTH_CLIENT_ID;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio';
  const authorizeUrl = `https://api.gravl.ai/oauth/authorize?client_id=${clientId ?? 'gci_…'}&redirect_uri=${encodeURIComponent(`${origin}/api/coach/oauth/callback`)}&response_type=code&scope=${encodeURIComponent(SCOPES.join(' '))}&code_challenge_method=S256&code_challenge=…`;

  const connect = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch('/api/coach/gravl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al conectar.');
      setResult(data as LiveResult);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setToken(''); // el token no queda en pantalla ni en memoria del componente
      setLoading(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        icon={PlugZap}
        title="Conectar un cliente real de GRAVL"
        subtitle="Esto no es simulado: lee la actividad real del cliente desde la API pública de GRAVL, con los permisos que él aprueba."
        action={<Badge tone="ink">API en vivo</Badge>}
      />

      <div className="mt-4">
        <Segmented<'oauth' | 'token'>
          label="Forma de conexión"
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'token', label: 'Probar con un token' },
            { value: 'oauth', label: 'Invitar cliente (OAuth)' },
          ]}
        />
      </div>

      {mode === 'oauth' ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { n: 1, t: 'El coach comparte un link', d: 'Por WhatsApp o QR. El link abre la pantalla de permisos de GRAVL.' },
            { n: 2, t: 'El cliente acepta en GRAVL', d: `Ve exactamente qué se pide: ${SCOPES.join(', ')}. Nunca peso ni medidas.` },
            { n: 3, t: 'Aparece en tu lista', d: 'Con su actividad real. El cliente puede revocar el acceso cuando quiera.' },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-gravl-line p-4 transition-colors hover:border-gravl-text/20">
              <span className="gravl-num text-[28px] text-gravl-text-muted">{s.n}</span>
              <p className="mt-1 text-[14px] font-semibold text-gravl-text">{s.t}</p>
              <p className="mt-1 text-[13px] text-gravl-text-muted">{s.d}</p>
            </div>
          ))}
          <div className="md:col-span-3">
            <div className="flex flex-col gap-2 rounded-xl bg-gravl-text/[0.04] p-3 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 truncate text-xs text-gravl-text-secondary">{authorizeUrl}</code>
              <Button
                size="sm"
                icon={copied ? Check : Copy}
                onClick={() => navigator.clipboard?.writeText(authorizeUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
              >
                {copied ? 'Copiado' : 'Copiar link'}
              </Button>
            </div>
            {!clientId && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-gravl-amber">
                <AlertTriangle size={13} aria-hidden /> Falta registrar la app OAuth en app.gravl.ai/settings/developer (5 minutos) y configurar NEXT_PUBLIC_GRAVL_OAUTH_CLIENT_ID.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (token.trim()) void connect();
            }}
            className="space-y-3"
          >
            <p className="text-[13px] text-gravl-text-secondary">
              El cliente crea un token de solo lectura en <span className="font-semibold text-gravl-text">app.gravl.ai → Ajustes → Desarrollador</span> y te lo pasa. Lo usamos una vez para leer su actividad: no se guarda.
            </p>
            <label className="group flex items-center gap-2 rounded-xl border border-gravl-line bg-gravl-surface px-3 transition-[border-color,box-shadow] duration-200 focus-within:border-gravl-text focus-within:shadow-[0_0_0_3px_rgba(210,254,11,0.55)]">
              <KeyRound size={15} className="shrink-0 text-gravl-text-muted" aria-hidden />
              <span className="sr-only">Token de GRAVL</span>
              <input
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="gat_…"
                className="h-10 min-w-0 flex-1 bg-transparent font-mono text-sm text-gravl-text outline-none placeholder:text-gravl-text-muted"
              />
            </label>
            <Button type="submit" variant="primary" icon={loading ? Loader2 : Link2} disabled={!token.trim() || loading} className={cn('w-full justify-center', loading && '[&>svg]:animate-spin')}>
              {loading ? 'Leyendo GRAVL…' : 'Conectar y leer actividad'}
            </Button>
            {error && <p role="alert" className="text-[13px] font-medium text-gravl-crimson">{error}</p>}
          </form>

          {result ? (
            <div className="animate-slide-up rounded-xl border border-gravl-line p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[16px] font-semibold text-gravl-text">{result.client.name}</p>
                  <p className="text-xs text-gravl-text-muted">
                    {result.client.goal ? `Objetivo: ${goalLabel[result.client.goal] ?? result.client.goal} · ` : ''}
                    {fmtInt(result.totalXp)} XP
                  </p>
                </div>
                <Badge tone="volt" icon={Check}>Datos reales</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { l: 'Sesiones 30 d', v: result.snapshot.workoutsLast30Days },
                  { l: 'Esta semana', v: result.snapshot.workoutsThisWeek },
                  { l: 'Racha', v: `${result.snapshot.currentStreakWeeks} sem.` },
                  { l: 'Volumen 30 d', v: `${fmtInt(result.snapshot.volumeLast30DaysKg)} kg` },
                ].map((k) => (
                  <div key={k.l} className="rounded-lg bg-gravl-text/[0.04] p-3">
                    <p className="gravl-label">{k.l}</p>
                    <p className="gravl-num mt-1 text-[26px] text-gravl-text">{k.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="gravl-label mb-2 flex items-center gap-1.5"><Flame size={12} aria-hidden /> Últimos entrenamientos</p>
                  <ul className="space-y-1.5 text-[13px]">
                    {result.recentWorkouts.length === 0 && <li className="text-gravl-text-muted">Sin entrenamientos en los últimos 30 días.</li>}
                    {result.recentWorkouts.map((w) => (
                      <li key={w.id} className="flex justify-between gap-3">
                        <span className="truncate text-gravl-text">{w.name} <span className="text-gravl-text-muted">· {fmtDate(w.date)}</span></span>
                        <span className="tabular-nums shrink-0 text-gravl-text-secondary">{fmtInt(w.volumeKg)} kg</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="gravl-label mb-2 flex items-center gap-1.5"><Trophy size={12} aria-hidden /> Récords</p>
                  <ul className="space-y-1.5 text-[13px]">
                    {result.scopesMissing.includes('records:read') && <li className="text-gravl-text-muted">El cliente no compartió sus récords.</li>}
                    {result.records.map((r, i) => (
                      <li key={i} className="flex justify-between gap-3">
                        <span className="truncate text-gravl-text">{r.exercise}</span>
                        <span className="tabular-nums shrink-0 text-gravl-text-secondary">{r.weightKg != null ? `${r.weightKg} kg` : '—'}{r.reps ? ` × ${r.reps}` : ''}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-gravl-line p-6 text-center text-[13px] text-gravl-text-muted">
              Cuando conectes un cliente, acá aparece su actividad real: sesiones, racha, volumen y récords.
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
