/**
 * Sesión mínima y correcta para la demo.
 *
 *  - Token = base64url(payload) + "." + base64url(HMAC-SHA256(payload)).
 *  - La clave sale de SESSION_SECRET; si no está, se deriva de la contraseña
 *    (cambiar la contraseña invalida todas las sesiones abiertas).
 *  - Solo Web Crypto: funciona igual en el proxy de Next, en route handlers y en Node.
 *  - Comparaciones en tiempo constante (contraseña y firma).
 *
 * Esto NO reemplaza un proveedor de identidad: es la puerta de una demo. El plan real
 * (SSO + MFA para la consola, cuentas por usuario para partners) está en docs/08-seguridad.md.
 */

export const SESSION_COOKIE = 'gravl_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días

export interface SessionPayload {
  /** Qué app emitió la sesión: una sesión de partner no abre la consola. */
  aud: 'partner' | 'console';
  iat: number;
  exp: number;
}

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s: string): Uint8Array {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

/** Igualdad en tiempo constante entre dos secuencias de bytes. */
export function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

/**
 * Compara contraseñas sin filtrar su longitud ni su contenido por tiempo:
 * se comparan los HMAC de ambas (longitud fija) en tiempo constante.
 */
export async function passwordMatches(input: string, expected: string): Promise<boolean> {
  const key = await hmacKey('gravl-password-compare');
  const [a, b] = await Promise.all([
    crypto.subtle.sign('HMAC', key, enc.encode(input)),
    crypto.subtle.sign('HMAC', key, enc.encode(expected)),
  ]);
  return timingSafeEqualBytes(new Uint8Array(a), new Uint8Array(b));
}

/** Secreto de firma: SESSION_SECRET o derivado de la contraseña + app. */
export function signingSecret(opts: { sessionSecret?: string; password: string; aud: SessionPayload['aud'] }) {
  return opts.sessionSecret && opts.sessionSecret.length >= 32 ? opts.sessionSecret : `derived:${opts.aud}:${opts.password}`;
}

export async function createSessionToken(secret: string, aud: SessionPayload['aud'], now = Date.now()): Promise<string> {
  const payload: SessionPayload = { aud, iat: Math.floor(now / 1000), exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

export async function verifySessionToken(secret: string, token: string | undefined, aud: SessionPayload['aud'], now = Date.now()): Promise<SessionPayload | null> {
  if (!token || token.length > 512) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  try {
    const expected = new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(body)));
    if (!timingSafeEqualBytes(expected, fromB64url(sig))) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as SessionPayload;
    if (payload.aud !== aud) return null;
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < now) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Solo rutas internas: evita open redirects del tipo ?next=https://otro-sitio. */
export function safeNextPath(next: string | null | undefined, fallback = '/'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  if (next.startsWith('/login')) return fallback;
  return next;
}
