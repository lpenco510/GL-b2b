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
docs/          Lógica de negocio, arquitectura, mercados, identidad, roadmap, design system
```

## Empezá por acá

1. [`docs/01-negocio.md`](docs/01-negocio.md): qué vendemos, a quién, cómo cobramos y qué no hacemos nunca.
2. [`docs/02-arquitectura.md`](docs/02-arquitectura.md): por qué tres apps separadas y cómo se aíslan los datos.
3. [`docs/03-mercados.md`](docs/03-mercados.md): moneda, cobro, factura y ley de datos por país.
4. [`docs/04-identidad-y-datos.md`](docs/04-identidad-y-datos.md): la cuenta es del socio; cómo se vincula con la app actual.
5. [`docs/05-roadmap.md`](docs/05-roadmap.md): próximas versiones y **preguntas abiertas**.
6. [`docs/06-design-system.md`](docs/06-design-system.md): reglas visuales de GRAVL.

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

Recorrido sugerido:
- En el portal, abrí el selector de workspace (arriba a la izquierda) y alterná entre **9 Fitness** (modelo asistencia) y **Pulso Fit** (low-cost, débito automático). El copiloto, los segmentos de Retención y la política de contacto cambian según el acuerdo.
- *Acuerdo & Activación* muestra lo que se negoció con el partner.
- En la consola, *Deal Desk* → elegí "Alto volumen" y México para cotizar a MegaGym MX.
- ⌘K / Ctrl+K busca socios, módulos y acciones.

## Comandos

| | |
| --- | --- |
| `npm run dev` | Portal + consola en modo desarrollo |
| `npm run dev:partner` / `npm run dev:console` | Una sola app |
| `npm test` | Tests de las reglas de negocio |
| `npm run typecheck` / `npm run lint` | Chequeos de todo el monorepo |
| `npm run build` | Build de producción de ambas apps |

> Next.js 16 (`cacheComponents`) + Tailwind v4. Antes de tocar APIs de Next, leé `node_modules/next/dist/docs/` (ver `AGENTS.md`).
