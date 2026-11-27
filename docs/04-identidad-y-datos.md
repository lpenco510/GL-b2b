# 04 · Identidad, consentimiento y vínculo con la app actual

> Código: `packages/domain/src/identity.ts` y `engagement.ts`. En el portal: ficha del socio → *Vínculo con la app GRAVL*.

## Principio

**La cuenta es del socio.** El gimnasio, la empresa o el coach tienen un **vínculo** (Membership) con esa cuenta, limitado a lo que el socio aceptó. Si se da de baja del gimnasio, se revoca el vínculo y su historial sigue siendo suyo. Por eso el socio confía en GRAVL y por eso GRAVL puede venderle directo mañana.

## Modelo

```
GravlAccount (cuenta del socio, la de la app actual)
   │  gravlUserId
   │
   ├── Membership ── Partner A (gimnasio)     scopes: ACTIVITY, PERFORMANCE, PARTNER_MESSAGING
   │      externalMemberId (ID del ERP), source: QR_SCAN | ERP_SYNC, status, linkedAt, revokedAt
   │
   ├── Membership ── Partner B (empresa)      scopes: ACTIVITY, WELLNESS (solo agregado)
   │
   └── Membership ── Coach C                  scopes: ACTIVITY, PERFORMANCE
```

- Un socio puede estar vinculado a varios partners a la vez (su gimnasio + su empresa + su coach).
- El `userId` que ve el partner es el de la **Membership**, no el `gravlUserId`. Si dos partners comparan listas, no pueden cruzar identidades.
- **No todos los socios del gimnasio tienen la app.** El ERP conoce a todos; nosotros solo a los vinculados. La activación (vinculados ÷ socios totales) es la primera métrica comercial. En 9 Fitness: 1.240 / 4.120 = 30%.

## Cómo nace el vínculo

| Origen | Flujo | Matching |
| --- | --- | --- |
| `QR_SCAN` | El socio escanea el QR de la sede → login o alta en la app → acepta los alcances | Si el ERP está conectado, se matchea por email o documento y se confirma con el socio |
| `ERP_SYNC` | El ERP envía la alta → invitación por email/WhatsApp → el socio acepta en la app | `externalMemberId` |
| `CORPORATE_SSO` | El empleado entra con el SSO de la empresa → la app pide los alcances | Email corporativo |
| `COACH_INVITE` | El coach invita → el cliente acepta | Link de invitación |

**Nunca se crea un vínculo sin una acción del socio en la app.** Una alta en el ERP no le da al gimnasio acceso a datos de una cuenta GRAVL existente.

## Alcances (consentimiento)

| Alcance | Qué habilita | Default |
| --- | --- | --- |
| `ACTIVITY` | Asistencia, sesiones, racha | Requerido para el servicio B2B |
| `PERFORMANCE` | Strength Score, 1RM, volumen | Opt-in |
| `WELLNESS` | Readiness, sueño, HRV | Opt-in explícito (dato de salud) |
| `PARTNER_MESSAGING` | Recibir push con la marca del partner | Opt-in |
| `PUBLIC_PROFILE` | Aparecer con nombre en rankings y feed | Opt-in |

**Nunca se comparten, ni agregados con n chico:** peso corporal, fotos de comidas, notas médicas, ubicación GPS.

## Visibilidad por vertical

| Vertical | Nivel | Regla |
| --- | --- | --- |
| Gimnasio | Individual | Solo alcances consentidos |
| Coach | Individual | Solo sus clientes vinculados |
| Corporate | **Solo agregados** | k-anonimato ≥ 5; áreas más chicas se ocultan pero suman a los totales |

## Baja

- **Baja del gimnasio** (llega del ERP o la pide el socio): se revoca el vínculo al instante (`autoRevokeOnCancel`). El partner deja de ver a esa persona. Conserva solo los agregados históricos ya calculados.
- **Baja de GRAVL:** se borra la cuenta y se revocan todos los vínculos. Los partners reciben un webhook.
- **Exportación:** el socio puede descargar todos sus datos desde la app (portabilidad LGPD/GDPR).
