# GRAVL para gimnasios: lo que armamos

Hola, te paso en limpio lo que venimos armando para el B2B, así lo ves antes de hablar con los founders.

## Qué es

Una demo funcional, no un mockup: se navega, se hace clic y las acciones funcionan. Tiene dos partes:

- **Portal del partner.** Lo usa el gimnasio, la empresa o el coach.
- **Consola interna.** La usamos nosotros para ver la cartera, armar propuestas y planificar mercados.

Tomé **SportClub** como ejemplo: un piloto de 12 sedes en AMBA. Los números son inventados, pero los planes (Flex, Plus, Total) y las categorías de sede son reales. Respeta la marca: los colores, las tipografías y el logo de gravl.ai.

## Qué hace

- **Dice qué hacer hoy, no solo qué pasó.** Por ejemplo: "136 socios quieren darse de baja, derivalos a la sede" o "254 socios Flex dejaron de venir, mandales un push". Cada acción se ejecuta en un clic.
- **Entiende cómo gana plata cada gimnasio.** En SportClub, al socio Flex (paga por uso) conviene reactivarlo. Al socio de abono fijo que no viene **no se lo molesta**: recordarle que paga es la forma más rápida de que se dé de baja. Esa regla se define por plan, en el acuerdo con cada cliente.
- **Usa datos que la app ya genera.** Series por máquina, la función "¿máquina ocupada? → cambiar ejercicio", horarios en que se entrena, récords y rachas. Nada de sensores ni números inventados para la venta.
- **Respeta al socio.** La cuenta es del socio, que decide qué comparte con su gimnasio. A una empresa nunca le mostramos personas, solo áreas de 5 o más.
- **Funciona para empresas y coaches**, con el mismo producto adaptado a cada uno.

## Qué ventajas nos abre

1. **El socio es nuestro.** Si un gimnasio deja GRAVL, sus socios siguen en GRAVL con todo su historial. El gimnasio pierde el panel; nosotros no perdemos al usuario. Cada partner es también un canal de adquisición B2C.
2. **Datos que nadie tiene juntos:** qué máquinas faltan, a qué hora y en qué sedes, en muchos gimnasios a la vez. Ningún gimnasio puede armar eso solo.
3. **Irse cuesta caro:** inventario cargado, carnet vinculado, ERP conectado, recepción usando la bandeja de bajas.
4. **Los coaches se pueden atacar ya.** La API pública alcanza para un coach con decenas de clientes: no hace falta tocar el core. Y el programa de Creadores es la puerta de entrada natural.
5. **Cobro directo:** sin la comisión de App Store ni de Google Play.

## Qué necesitamos del equipo

Leí toda la documentación de developers. Para que esto funcione con datos reales hacen falta:

- **El gimnasio en cada entrenamiento.** La app lo sabe; la API no lo devuelve.
- **El evento de "máquina ocupada".**
- **Strength Score y readiness** en la API.
- **Dos escrituras:** mandar un push con la marca del gimnasio y asignar una rutina.
- **Webhooks**, para no tener que consultar a cada rato.
- **Para cadenas grandes, un acceso interno.** Por ejemplo, una réplica de lectura con vistas que ya filtren por consentimiento, porque la API pública es de a un socio por vez.

## Ideas para después

- **Coaches que cobran a sus clientes por GRAVL**, con una comisión para nosotros, y su página propia como la de los Creadores.
- **Socio que deja el gimnasio:** que GRAVL le ofrezca seguir directo.
- **Reporte mensual automático para el dueño** y **benchmarks entre gimnasios**.
- **Expansión:** Argentina primero, después Chile, Uruguay, México y Brasil.

## Lo que falta para la propuesta comercial

No puse precios a propósito. Para armar una propuesta seria necesito:

- El ingreso neto promedio por suscriptor Pro (después de las tiendas).
- Cuántos eligen el plan anual y cuántos el mensual.
- Cuánto cuesta un usuario activo por mes.
- Qué se aprendió con MrFit MX.

Con eso, el precio B2B se arma solo: entre el costo por usuario y lo que ya gana GRAVL con cada suscriptor.

Para verlo: `npm install` y `npm run dev` en el repo. El portal queda en localhost:3000 y la consola en localhost:3001.
