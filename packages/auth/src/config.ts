import { signingSecret, type SessionPayload } from './session';

/**
 * Configuración por app, desde variables de entorno:
 *   Portal:  DEMO_PASSWORD
 *   Consola: CONSOLE_PASSWORD (si no está, usa DEMO_PASSWORD)
 *   Opcional: SESSION_SECRET (≥ 32 caracteres) para firmar sesiones.
 *
 * Falla cerrado: en producción, sin contraseña configurada no entra nadie.
 * Solo en desarrollo local hay una contraseña por defecto ("gravl") para no trabar a nadie.
 */
export function authConfig(aud: SessionPayload['aud']) {
  const env = process.env;
  const configured = aud === 'console' ? env.CONSOLE_PASSWORD || env.DEMO_PASSWORD : env.DEMO_PASSWORD;
  const isProd = env.NODE_ENV === 'production';
  const password = configured || (isProd ? '' : 'gravl');
  return {
    aud,
    password,
    configured: !!password,
    usingDevDefault: !configured && !isProd,
    secret: signingSecret({ sessionSecret: env.SESSION_SECRET, password: password || 'unset', aud }),
    secureCookie: isProd,
  };
}
