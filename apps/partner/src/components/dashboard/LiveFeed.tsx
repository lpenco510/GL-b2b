'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { REFERENCE_NOW, liveExercisePool, liveWorkoutFeed, locationName, members } from '@gravl/mock-data';
import { fmtRelative } from '@gravl/domain';
import { cn } from '@gravl/ui';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, LiveDot } from '@gravl/ui';
import type { LiveWorkoutEvent } from '@gravl/domain';
import { Activity, Pause, Play, Trophy } from 'lucide-react';

const TICK_MS = 6000;

/**
 * Simula el stream del WebSocket de GRAVL Core. Con cacheComponents la
 * página queda oculta (no desmontada) al navegar: el cleanup del effect
 * frena el intervalo mientras no se ve, así no gastamos CPU en background.
 */
export default function LiveFeed() {
  const { selectedLocationId } = useApp();
  const [events, setEvents] = useState<LiveWorkoutEvent[]>(liveWorkoutFeed);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const seq = useRef(0);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      seq.current += 1;
      setElapsed((e) => e + TICK_MS);
      const pick = liveExercisePool[Math.floor(Math.random() * liveExercisePool.length)];
      const member = members[Math.floor(Math.random() * members.length)];
      const steps = Math.floor((pick.max - pick.min) / pick.step);
      const weight = pick.min + Math.floor(Math.random() * (steps + 1)) * pick.step;
      const [first, last] = member.fullName.split(' ');
      const event: LiveWorkoutEvent = {
        id: `sim_${seq.current}`,
        memberName: `${first} ${last?.[0] ?? ''}.`,
        exercise: pick.exercise,
        weight,
        unit: 'kg',
        isPR: Math.random() < 0.18,
        locationId: member.locationId,
        timestamp: new Date(REFERENCE_NOW.getTime() + seq.current * TICK_MS).toISOString(),
      };
      setEvents((prev) => [event, ...prev].slice(0, 30));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [paused]);

  const now = useMemo(() => new Date(REFERENCE_NOW.getTime() + elapsed), [elapsed]);
  const visible = events.filter((e) => selectedLocationId === 'all' || e.locationId === selectedLocationId);
  const prs = visible.filter((e) => e.isPR).length;

  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <CardHeader
        icon={Activity}
        iconColor="var(--color-gravl-emerald)"
        title={
          <span className="flex items-center gap-2">
            Actividad en vivo {!paused && <LiveDot size={7} />}
          </span>
        }
        subtitle={`${visible.length} series registradas · ${prs} PRs en la última hora`}
        action={
          <Button
            size="sm"
            variant="ghost"
            icon={paused ? Play : Pause}
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Reanudar feed en vivo' : 'Pausar feed en vivo'}
          >
            {paused ? 'Reanudar' : 'Pausar'}
          </Button>
        }
      />

      <ul className="mt-4 max-h-[420px] flex-1 space-y-2 overflow-y-auto pr-1" aria-live="off">
        {visible.length === 0 && <EmptyState icon={Activity} title="Sin actividad en esta sede" description="Las series aparecen acá en tiempo real." />}
        {visible.map((evt, i) => (
          <li
            key={evt.id}
            className={cn(
              'flex items-center justify-between gap-3 rounded-xl border border-gravl-text/[0.04] bg-gravl-text/[0.02] p-3 transition-colors hover:bg-gravl-text/[0.04]',
              i === 0 && evt.id.startsWith('sim_') && 'animate-slide-up border-gravl-volt/20',
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={evt.memberName} size={36} />
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-bold text-gravl-text">
                  <span className="truncate">{evt.memberName}</span>
                  {evt.isPR && (
                    <Badge tone="amber" icon={Trophy}>
                      PR
                    </Badge>
                  )}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-gravl-text-secondary">
                  {evt.exercise} <span className="text-gravl-text-muted">· {locationName(evt.locationId)}</span>
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="gravl-num text-[22px] text-gravl-text">
                {evt.weight} {evt.unit}
              </p>
              <p className="text-[10px] text-gravl-text-muted">{fmtRelative(evt.timestamp, now)}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-gravl-text/[0.06] pt-3 text-[11px] text-gravl-text-muted">
        Sincronizado vía WebSocket con GRAVL Core API · datos anonimizados a inicial de apellido.
      </p>
    </Card>
  );
}
