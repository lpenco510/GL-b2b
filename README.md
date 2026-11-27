# GRAVL B2B

El negocio B2B de GRAVL: el **portal** que usan gimnasios, empresas y coaches, y la **consola** interna con la que GRAVL gestiona la cartera, cotiza y opera mercados.

```
apps/
  partner/     Portal del partner (gimnasios, corporate, coaches)   → http://localhost:3000
  console/     Consola interna de GRAVL (cartera, Deal Desk, mercados) → http://localhost:3001
packages/
  domain/      Reglas de negocio puras + tests
  ui/          Design system (tokens + componentes)
  mock-data/   Datos de demo (se reemplaza por la API)
  gravl-api/   Cliente tipado de api.gravl.ai + mapeo a la telemetría B2B (con tests)
db/           Esquema PostgreSQL propuesto para el Partner API (con aislamiento por partner)
docs/          Quién es quién, lógica de negocio, arquitectura, mercados, identidad, roadmap, design system
```

## Demo online

| | URL | Acceso |
| --- | --- | --- |
| Portal de partners | https://gravl-partners.vercel.app | contraseña `DEMO_PASSWORD` |
| Consola interna | https://gravl-console.vercel.app | contraseña `CONSOLE_PASSWORD` (distinta) |

Las contraseñas se cambian en Vercel → proyecto → Settings → Environment Variables, y después hay que hacer *Redeploy*. Ver `docs/08-seguridad.md`.

## Empezá por acá

0. [`docs/00-quien-es-quien.md`](docs/00-quien-es-quien.md): los perfiles explicados en una página.
1. [`docs/01-negocio.md`](docs/01-negocio.md): qué vendemos, a quién, cómo cobramos y qué no hacemos nunca.
2. [`docs/02-arquitectura.md`](docs/02-arquitectura.md): por qué tres apps separadas y cómo se aíslan los datos.
3. [`docs/03-mercados.md`](docs/03-mercados.md): moneda, cobro, factura y ley de datos por país.
4. [`docs/04-identidad-y-datos.md`](docs/04-identidad-y-datos.md): la cuenta es del socio; cómo se vincula con la app actual.
5. [`docs/05-roadmap.md`](docs/05-roadmap.md): próximas versiones y **preguntas abiertas**.
6. [`docs/06-design-system.md`](docs/06-design-system.md): reglas visuales de GRAVL.
8. [`docs/08-seguridad.md`](docs/08-seguridad.md): cómo está protegido y qué falta para producción.
7. [`docs/07-integracion-gravl.md`](docs/07-integracion-gravl.md): qué se conecta hoy con la API de GRAVL y qué hay que pedir.

**Para mandar al equipo de GRAVL:** [`docs/para-el-equipo-gravl.md`](docs/para-el-equipo-gravl.md) (corto, en criollo).

## Correr la demo en tu computadora

Necesitás [Node.js 20.9 o superior](https://nodejs.org) y Git.

```bash
git clone https://github.com/lpenco510/GL-b2b.git
cd GL-b2b
git checkout claude/optimistic-allen-lllye9
npm install
npm run dev
```

Abrí **http://localhost:3000** (portal) y **http://localhost:3001** (consola).

Recorrido sugerido (el ejemplo es **SportClub**, con un piloto de 12 sedes; todos los números son simulados):
- **Command Center:** qué hacer hoy. Las acciones respetan el plan de cada socio: Flex se reactiva, Plus y Total no se molestan.
- **Socios:** filtrá por "Intención de baja" o "Protegidos" y abrí un socio para ver su plan, su vínculo con la cuenta GRAVL y por qué se lo puede (o no) contactar.
- **Equipamiento:** solo datos que la app registra, como series por máquina y las veces que un socio encontró una máquina ocupada.
- **Acuerdo & Activación:** lo que se negoció, con la política por plan.
- Arriba a la derecha está el botón de **modo claro/oscuro**; ⌘K / Ctrl+K busca socios, módulos y acciones.
- Arriba a la izquierda cambiás de tipo de cliente: SportClub (cadena), Nimbus (empresa), Fuerza Studio (coach).
- **Consola** (puerto 3001): portafolio, Deal Desk y mercados, como los ve GRAVL por dentro.

## Comandos

| | |
| --- | --- |
| `npm run dev` | Portal + consola en modo desarrollo |
| `npm run dev:partner` / `npm run dev:console` | Una sola app |
| `npm test` | Tests de las reglas de negocio |
| `npm run typecheck` / `npm run lint` | Chequeos de todo el monorepo |
| `npm run build` | Build de producción de ambas apps |

> Next.js 16 (`cacheComponents`) + Tailwind v4. Antes de tocar APIs de Next, leé `node_modules/next/dist/docs/` (ver `AGENTS.md`).
