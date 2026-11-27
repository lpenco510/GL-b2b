# 08 · Seguridad

> Lo que protege hoy a la demo, cómo está hecho y qué cambia en producción. Código en `packages/auth` (con tests) y en `src/proxy.ts` de cada app.

## Lo que ya está implementado

| Riesgo | Control | Dónde |
| --- | --- | --- |
| Entrar sin permiso | Todas las rutas (páginas y API) pasan por `proxy.ts`. Sin una sesión válida, redirige al login o devuelve 401. | `apps/*/src/proxy.ts` |
| Falsificar la sesión | Token firmado con **HMAC-SHA256**: la cookie sola no alcanza, se verifica la firma. | `packages/auth/src/session.ts` |
| Usar la sesión de una app en otra | El token lleva **audiencia** (`partner` o `console`). Una sesión del portal no abre la consola. | idem |
| Robar la cookie con JavaScript | Cookie **HttpOnly** + **Secure** (en producción) + **SameSite=Lax**. Vence a los 7 días. | `app/login/actions.ts` |
| Fuerza bruta | **5 intentos cada 10 minutos** por IP, más una demora fija ante cada error. | `packages/auth/src/rateLimit.ts` |
| Adivinar la contraseña por tiempos de respuesta | Comparación en **tiempo constante** (sobre HMAC, de largo fijo). | `passwordMatches()` |
| Open redirect (`/login?next=https://malicioso`) | Solo se aceptan rutas internas. | `safeNextPath()` |
| Desloguear a alguien con un link | El logout solo acepta POST. | `api/auth/logout` |
| Servidor mal configurado | **Falla cerrado**: en producción, sin contraseña configurada no entra nadie. | `authConfig()` |
| XSS, clickjacking, sniffing | **CSP**, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, HSTS, `Referrer-Policy` y `Permissions-Policy`. | `next.config.ts` |
| Indexación en Google | `X-Robots-Tag: noindex` y `robots.txt`. | idem |
| Excel que ejecuta fórmulas al abrir un CSV | Las celdas que empiezan con `= + - @` se neutralizan. | `csvCell()` |
| Fuga del token de un cliente de GRAVL (Coach) | Se usa una vez del lado del servidor: no se guarda, no se loguea y no vuelve al navegador. Tiene límite propio de consultas. | `api/coach/gravl/route.ts` |
| Logos subidos con código | Solo PNG, JPG, WebP o SVG de hasta 300 KB, y se muestran en `<img>`, donde un SVG no puede ejecutar scripts. | Configuración |
| Dependencias vulnerables | `npm audit`: 0 vulnerabilidades. | — |

Tests: `npm test` corre 7 pruebas de seguridad, entre ellas sesión adulterada, sesión vencida, otra audiencia, open redirect, rate limit e inyección en CSV.

## Lo que es de demo (y cómo se resuelve en producción)

| Hoy (demo) | Producción |
| --- | --- |
| Una contraseña compartida por app | Una cuenta por persona. Partners con email + contraseña o SSO. **Consola solo con SSO de Google Workspace + MFA.** |
| Rate limit en memoria (una instancia) | Redis/KV compartido entre instancias |
| CSP con `'unsafe-inline'` en scripts | CSP con nonces (rendering dinámico) o hashes |
| Marca guardada en el navegador | Guardada en el backend, por partner, con auditoría |
| Datos simulados | Partner API con Row-Level Security (`db/schema.sql`) y consentimiento aplicado en el core |
| Sin registro de accesos | `audit_log`: quién vio o hizo qué y cuándo. "Ver como partner" desde la consola queda registrado y es de solo lectura |

## Dónde se pone la contraseña

- **Vercel:** Project → Settings → Environment Variables → `DEMO_PASSWORD` (portal) y `CONSOLE_PASSWORD` (consola). Después de cambiarla hay que hacer *Redeploy*. Cambiarla cierra todas las sesiones abiertas.
- **Local:** sin variables, la contraseña es `gravl` (solo en desarrollo). Para usar otra, copiá `.env.example` como `apps/partner/.env.local`.
