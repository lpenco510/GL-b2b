import { NextResponse, type NextRequest } from 'next/server';
import { authConfig, SESSION_COOKIE, verifySessionToken } from '@gravl/auth';

/**
 * Puerta de toda la app: sin sesión válida de 'console', se va al login.
 * La verificación es criptográfica (HMAC), no "existe la cookie".
 */
export async function proxy(req: NextRequest) {
  const cfg = authConfig('console');
  const session = cfg.configured ? await verifySessionToken(cfg.secret, req.cookies.get(SESSION_COOKIE)?.value, 'console') : null;
  if (session) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  if (req.nextUrl.pathname !== '/') url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  // Todo, salvo el login, los assets de Next y los archivos públicos.
  matcher: ['/((?!login|_next/static|_next/image|icon.png|brand-icon.png|partners/|robots.txt).*)'],
};
