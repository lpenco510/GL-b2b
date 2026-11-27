# 02 · Arquitectura

## Hoy: ¿qué base de datos usa la demo?

**Ninguna.** La demo corre con datos simulados generados en memoria (`packages/mock-data`). Por eso nunca pedí accesos: no hay nada conectado a GRAVL, a SportClub ni a ninguna base real. Es deliberado: se puede mostrar en una reunión sin riesgo y sin depender de nadie.

## Lo que ya existe en GRAVL (y cambia el plan)

En gravl.ai/developers GRAVL ya publica una **API REST** (`api.gravl.ai/api/v1`):

- Autenticación con **OAuth 2.0**: el usuario concede *scopes* a cada app.
- Hoy es **solo lectura**: entrenamientos, récords, medidas y estadísticas.
- *"No existe ningún scope que dé acceso a los datos de otra persona."*
- Hay además un servidor **MCP**.

Esto define la arquitectura B2B: **el portal del partner es, técnicamente, una app OAuth más.** No tocamos la base del core de GRAVL. Cuando un socio vincula su cuenta con SportClub, concede scopes. El Partner API lee con esos tokens y guarda solo lo que es del negocio B2B.

Lo que hay que pedirle al equipo de GRAVL:

1. **Scopes B2B nuevos**, por ejemplo `partner:activity` y `partner:messaging`. Que el socio los conceda al vincularse con su gimnasio.
2. **Lectura por lote:** un token "de partner" que lea los socios vinculados, siempre limitado a quienes concedieron el scope.
3. **Webhooks:** entrenamiento terminado, "máquina ocupada → cambiar ejercicio", récord. Así no hace falta consultar a cada rato.
4. **Escritura acotada:** enviar un push con la marca del partner y asignar una rutina. Son las dos únicas acciones que el panel necesita.

## Stack propuesto

| Pieza | Elección | Por qué |
| --- | --- | --- |
| Partner API (backend) | **.NET 8 / ASP.NET Core** | Maduro, tipado, rápido, fácil de contratar en LatAm. Si el core de GRAVL ya es .NET, mismo equipo y mismas prácticas. |
| Base de datos B2B | **PostgreSQL 16** con Row-Level Security | Aislamiento por partner en la base, no solo en el código. Esquema propuesto: `db/schema.sql`. |
| Frontends | Next.js (este repo) | Portal y consola comparten el design system. |
| Lectura de datos del socio | `api.gravl.ai` vía OAuth | No duplicamos ni copiamos el core: leemos lo que el socio autorizó. |
| Integraciones | Conectores por ERP (el de SportClub primero) | Altas, bajas, plan y señales de pago. |

Lo que vive en la base B2B: partners, sedes, inventario, acuerdos, política por plan, vínculos socio↔partner, señales del ERP, contactos enviados (para medir) y agregados diarios. **Los entrenamientos no viven acá: siguen en GRAVL.**

## El problema

Hoy hay **tres audiencias** con intereses distintos y, a veces, opuestos:

| Audiencia | Qué necesita | Qué NO puede ver |
| --- | --- | --- |
| **GRAVL** (staff interno) | Toda la cartera, precios, márgenes, salud de cuentas, soporte | — (pero todo queda auditado) |
| **Partner** (dueño de gimnasio, RR. HH., coach) | Sus socios, su sala, su acuerdo, su ROI | Otros partners, nuestros márgenes, datos que el socio no consintió |
| **Socio** (usuario de la app) | Su entrenamiento, sus datos, su cuenta | Nada de otros socios |

Ponerlas en una sola aplicación con "roles" es el error clásico. Un bug de permisos expone márgenes o datos de salud. Además el bundle del partner termina cargando código interno y un solo login mezcla tres niveles de riesgo.

## Las preguntas que nos hicimos

1. **¿De quién es el socio?** De GRAVL y de sí mismo. El partner tiene un *vínculo* con alcances consentidos (ver `04-identidad-y-datos.md`). Por eso la identidad no puede vivir en el portal del partner.
2. **¿Quién puede cambiar un precio?** Solo GRAVL. El partner ve su acuerdo, no lo edita. Por eso la consola es otra app.
3. **¿Qué pasa si se filtra el token de un partner?** Tiene que ver solo su tenant, solo los alcances consentidos y solo agregados donde corresponda. El aislamiento se aplica **en el backend**, nunca en la UI.
4. **¿El partner necesita datos en tiempo real o le alcanza con agregados?** Agregados con frescura de minutos para todo excepto el feed en vivo. Eso permite un *read model* separado del core transaccional.
5. **¿Dónde viven los datos?** Por mercado: UE en la UE, LatAm en São Paulo (ver `03-mercados.md`).

## La decisión

**Separar por audiencia en el deploy y compartir en el código.**

```
                ┌────────────────┐   ┌──────────────────┐   ┌────────────────┐
  Audiencia     │  App del socio │   │ Portal partner   │   │ GRAVL Console  │
                │  (iOS/Android) │   │ apps/partner     │   │ apps/console   │
                │  YA EXISTE     │   │ partner.gravl.ai │   │ interno + SSO  │
                └───────┬────────┘   └────────┬─────────┘   └───────┬────────┘
                        │                     │                     │
  Auth          Cuenta del socio       Staff del partner      Staff GRAVL
                (realm members)        (realm partners,       (Google SSO + MFA,
                                        SSO opcional)          allowlist de IP)
                        │                     │                     │
                ┌───────▼────────┐   ┌────────▼─────────┐   ┌───────▼────────┐
  API           │  Member API    │   │  Partner API     │   │  Admin API     │
                │                │   │  (BFF por tenant)│   │  (auditada)    │
                └───────┬────────┘   └────────┬─────────┘   └───────┬────────┘
                        └──────────────┬──────┴─────────────────────┘
                                       │
  Servicios (.NET)  Identidad · Training Core · Partners & Sedes · Engagement
                    · Analytics (read models) · Billing · Integraciones
```

### Reglas del backend

- **Tenant del token, nunca del request.** El `partnerId` sale del JWT; *row-level security* en la base.
- **Consentimiento como filtro de datos, no como `if` en la UI.** El Partner API devuelve un campo solo si el socio dio el alcance. Corporate solo recibe agregados con k ≥ 5.
- **El partner lee de read models**, no del core transaccional de entrenamiento. Un dashboard pesado no puede degradar la app del socio.
- **La consola escribe a través del Admin API**, con motivo obligatorio y log de auditoría. "Ver como partner" es solo lectura y queda registrado.
- **Engagement aplica la política del Deal en el servidor.** La UI muestra la decisión; no la toma. (`nudgeDecision` hoy vive en `packages/domain`, que también puede correr en el backend vía su port en .NET o como servicio Node.)

### Servicios (bounded contexts)

| Contexto | Responsabilidad | Dueño de |
| --- | --- | --- |
| Identidad | Cuentas de socio, staff de partner, staff GRAVL (realms separados) | Usuarios, sesiones, MFA |
| Training Core | Rutinas, motor de 1RM y fatiga, equipment-aware | Entrenamientos (existente) |
| Partners & Sedes | Organizaciones, sedes, inventario, vínculos socio↔partner | Tenants, Memberships |
| Engagement | Reglas de nudge, política de contacto, push, retos | Campañas, envíos |
| Analytics | Read models, agregados, k-anonimato, warehouse | Métricas |
| Billing | Deals, medición de uso, facturas por mercado, revenue share | Acuerdos, facturas |
| Integraciones | ERP (EVO, Glofox, Mindbody), agregadores (Wellhub, TotalPass), webhooks | Conectores |

## El repo

```
GL-b2b/
├─ apps/
│  ├─ partner/        Portal del partner  → localhost:3000
│  └─ console/        Consola interna     → localhost:3001
├─ packages/
│  ├─ domain/         Reglas de negocio puras + tests (sin React, sin I/O)
│  ├─ ui/             Design system: tokens.css + primitivas React
│  └─ mock-data/      Dataset de demo. Se reemplaza por el cliente de la API.
└─ docs/              Esta documentación
```

Reglas del repo:

- `domain` no importa nada de React ni de las apps. Si una regla de negocio está en un `.tsx`, está mal ubicada.
- `apps/*` no se importan entre sí. Lo compartido va a `packages/*`.
- `mock-data` es el único lugar con datos inventados. Cuando exista la API, se reemplaza por `packages/api-client` con los mismos tipos de `domain`.
- La consola nunca se despliega en el mismo dominio que el portal.

## Por qué Next.js para ambos frontends

Mismo design system, mismo equipo y deploy estático o en el edge. La consola puede bajar a un framework de herramientas internas si crece. El portal **no** se convierte en la app del socio: esa ya existe y tiene su propio ciclo de releases.
