# 07 · Integración con GRAVL

> Relevado de gravl.ai/es/developers: visión general, scopes, endpoints, convenciones, OAuth, MCP y notas de versión.
> Cliente tipado y tests en `packages/gravl-api`. La matriz completa se ve en la consola → **Integración GRAVL**.

## Lo que ofrece hoy la API pública

- **Base:** `https://api.gravl.ai/api/v1`, JSON, versionada.
- **Acceso:** **solo lectura**. La escritura llegará "como scopes nuevos y explícitos".
- **Autenticación:**
  - Token personal (`gat_…`), para leer tus propios datos.
  - **OAuth 2.0 + PKCE**: tokens cortos con refresh rotatorio, revocable cuando el usuario quiera.
  - Una app nueva arranca en modo desarrollo y GRAVL la revisa antes de abrirla al público.
- **Límite de uso:** 100 pedidos cada 15 minutos por app y usuario. La doc pide no hacer polling.
- **Unidades:** pesos en **libras**, distancias en metros, fechas en UTC.
- **Privacidad:** *"No existe ningún scope que dé acceso a los datos de otra persona."* Pedir el entrenamiento de otro usuario devuelve 404.
- **MCP** (`mcp.gravl.ai/mcp`): permite que un asistente de IA registre entrenamientos y edite plantillas **de la propia cuenta**. El motor de escritura ya existe.

| Scope | Endpoints | Uso en el B2B |
| --- | --- | --- |
| `profile:read` | `/user` | Nombre y objetivo del socio |
| `workouts:read` | `/workouts`, `/workouts/{id}`, `/workout-templates` | Sesiones, última visita, volumen; series con RPE para coaches |
| `stats:read` | `/stats`, `/trophies` | Racha, entrenos de la semana, trofeos (retos) |
| `records:read` | `/personal-records` | PRs para el feed y el ranking |
| `splits:read` | `/splits` | Programación del coach |
| `exercises:read` | `/exercises`, `/equipment` | Catálogo de equipamiento: base del inventario por sede |
| `measurements:read` | `/measurements` | **No lo pedimos.** Peso y medidas son privados del socio |

## Lo que falta para el B2B (pedido concreto al equipo)

1. **`gymId` en cada entrenamiento.** La app ya sabe en qué gimnasio entrenás, porque adapta la rutina. Sin esto no hay nada "por sede".
2. **Evento de sustitución con motivo** ("máquina ocupada"). Es la única señal real de demanda insatisfecha por máquina.
3. **Strength Score y readiness** en `/stats`. Ya existen en la app (v1.54).
4. **Dos escrituras:** enviar un push con la marca del partner y asignar una rutina o un reto.
5. **Webhooks firmados:** entreno terminado, PR, sustitución, vínculo revocado.
6. **Catálogo de gimnasios con su inventario** (lo que hoy alimenta "Busca tu gimnasio").

## Dos canales, según el tamaño del cliente

**A. API pública + OAuth: coaches y gimnasios chicos.**

Cada cliente autoriza al coach desde la app. Con 24 clientes, el límite de uso sobra. **El producto para coaches se puede construir hoy**, sin tocar el core.

**B. Canal interno: cadenas y empresas.**

Para leer 3.600 socios de SportClub, la API pública no escala: es un token por socio y 100 pedidos cada 15 minutos. Hace falta un servicio de GRAVL con acceso directo a los datos.

| Opción | Cómo | A favor | En contra |
| --- | --- | --- | --- |
| Leer la base de producción | El servicio B2B consulta las tablas del core | Rápido de arrancar | Acopla el B2B al esquema interno; un dashboard pesado puede degradar la app |
| **Réplica de lectura + vistas** ✅ para empezar | Vistas en una réplica que ya filtran por consentimiento y partner | Rápido, no toca producción, el filtro vive en la base | Sigue atado al esquema del core |
| **Eventos** ✅ para escalar | El core publica eventos (entreno terminado con `gymId`, sustitución, PR) y el B2B arma sus agregados | Desacoplado y en tiempo casi real; alimenta webhooks y el feed en vivo | Requiere trabajo en el core |

**Recomendación:** arrancar con la réplica de lectura y vistas para el piloto de SportClub, y migrar a eventos en paralelo.

En cualquiera de los tres casos rige la misma regla: **el consentimiento del socio se aplica antes de que el dato salga del core**, no en la pantalla.

## Cómo se ve en el código

```ts
import { createGravlClient, activitySnapshot } from '@gravl/gravl-api';

const gravl = createGravlClient({ token }); // token OAuth del socio
const [workouts, stats] = await Promise.all([gravl.workoutsSince(hace30Dias), gravl.stats()]);
const actividad = activitySnapshot(workouts, stats); // sesiones 30d, racha, última visita, volumen en kg
```

El cliente maneja el 429 con `Retry-After`, no reintenta un 403 (el socio no dio permiso) y convierte libras a kilos.
