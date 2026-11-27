/**
 * Límite de intentos de login por IP (ventana fija). En memoria: alcanza para una demo
 * en una instancia. En producción va a Redis/KV para que lo compartan todas las instancias.
 */
export function createRateLimiter(opts: { max: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    /** Registra un intento. Devuelve si está permitido y cuántos segundos faltan si no. */
    hit(key: string, now = Date.now()): { allowed: boolean; retryAfterSec: number; remaining: number } {
      if (hits.size > 10_000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      const cur = hits.get(key);
      if (!cur || cur.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + opts.windowMs });
        return { allowed: true, retryAfterSec: 0, remaining: opts.max - 1 };
      }
      cur.count += 1;
      const allowed = cur.count <= opts.max;
      return { allowed, retryAfterSec: allowed ? 0 : Math.ceil((cur.resetAt - now) / 1000), remaining: Math.max(0, opts.max - cur.count) };
    },
    reset(key: string) {
      hits.delete(key);
    },
  };
}

/** CSV seguro: neutraliza fórmulas (=, +, -, @) que Excel/Sheets ejecutarían al abrir el archivo. */
export function csvCell(value: unknown): string {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
