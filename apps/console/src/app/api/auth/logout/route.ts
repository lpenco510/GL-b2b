import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@gravl/auth';

/** Cierra sesión (POST para que un link o una imagen no puedan desloguear a nadie). */
export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/login', req.url), 303);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
