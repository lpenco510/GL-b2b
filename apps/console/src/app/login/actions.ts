'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authConfig, createSessionToken, passwordMatches, safeNextPath, SESSION_COOKIE, SESSION_TTL_SECONDS } from '@gravl/auth';
import type { LoginState } from '@gravl/ui';
import { loginLimiter } from '@/lib/loginLimiter';

/**
 * Login por contraseña única (demo). Controles:
 *  - rate limit por IP, demora fija ante error (frena fuerza bruta),
 *  - comparación en tiempo constante,
 *  - cookie HttpOnly + Secure (prod) + SameSite=Lax, firmada con HMAC y con audiencia 'console',
 *  - redirect solo a rutas internas (sin open redirect).
 */
export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const cfg = authConfig('console');
  const h = await headers();
  const ip = (h.get('x-forwarded-for')?.split(',')[0] ?? h.get('x-real-ip') ?? 'local').trim();
  const attempt = Date.now();

  const rl = loginLimiter.hit(ip);
  if (!rl.allowed) return { error: `Demasiados intentos. Probá de nuevo en ${Math.ceil(rl.retryAfterSec / 60)} min.`, attempt };
  if (!cfg.configured) return { error: 'El servidor no tiene contraseña configurada (CONSOLE_PASSWORD).', attempt };

  const password = String(form.get('password') ?? '').slice(0, 200);
  if (!(await passwordMatches(password, cfg.password))) {
    await new Promise((r) => setTimeout(r, 450));
    return { error: rl.remaining > 0 ? `Contraseña incorrecta. Te quedan ${rl.remaining} intentos.` : 'Contraseña incorrecta.', attempt };
  }

  loginLimiter.reset(ip);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(cfg.secret, 'console'), {
    httpOnly: true,
    secure: cfg.secureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect(safeNextPath(String(form.get('next') ?? ''), '/portfolio'));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login');
}
