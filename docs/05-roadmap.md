# 05 · Roadmap y decisiones abiertas

## Dónde estamos

Demo funcional sobre datos determinísticos. Las reglas de negocio ya están en código y con tests. No hay backend, autenticación ni pagos reales.

## Próximas versiones

### v0.3 · De demo a piloto (un partner real)
- `packages/api-client` con los tipos de `domain`; reemplazar `mock-data` pantalla por pantalla.
- Login real en el portal (staff del partner) y en la consola (SSO Google + MFA).
- Conector con el ERP del partner (en SportClub, el sistema detrás del carnet): altas, bajas, plan y señales de pago.
- **Grupo de control del 10%** para medir el efecto real de los nudges.
- Atribución: socio contactado → volvió en 72 h → ingreso recuperado.

### v0.4 · Low-cost a escala
- Señales de intención de baja en tiempo real (webhook del ERP al entrar a la página de baja, débito rechazado).
- Bandeja de recepción: lista del día con guion y oferta sugerida; registra el resultado.
- Oferta in-app de GRAVL Pro con revenue share y liquidación mensual al partner.
- Sugerencia de horario valle dentro de la rutina del socio.

### v0.5 · Coaches como producto propio
- Alta self-serve con tarjeta, sin vendedor (`PER_COACH`).
- El coach cobra a sus clientes a través de GRAVL (Stripe Connect / Mercado Pago marketplace) y GRAVL cobra una comisión. **Este es el negocio grande del segmento**, no la suscripción.
- Marca propia del coach en la app (white-label liviano).

### v0.6 · El socio individual como cliente directo
La misma cuenta que hoy usa la app (ver `04-identidad-y-datos.md`):
- "Mis gimnasios, mi empresa, mi coach": el socio ve y revoca sus vínculos.
- Si deja su gimnasio, la app le ofrece seguir con GRAVL Pro directo. La cuenta es suya, así que no pierde nada. Esto convierte cada baja de un partner en un posible cliente B2C. Tiene que estar en el contrato: **el partner lo acepta al firmar.**
- Pase multi-gimnasio propio (a largo plazo; compite con agregadores, decisión estratégica).

### Transversal
- i18n: es-AR → es-MX/es-ES, pt-BR, en.
- Reporte mensual automático en PDF para el dueño y QBR para la consola.
- Tests e2e (Playwright) de los flujos críticos: nudge, derivación a staff, reto, mantenimiento.

## Preguntas abiertas para los founders

1. **Ticket:** ingreso neto por suscriptor Pro (después de las tiendas), mix mensual/anual, costo por usuario activo (ver `01-negocio.md` §11).
2. **API:** ¿se pueden sumar scopes B2B (`partner:activity`, `partner:messaging`) y webhooks a `api.gravl.ai`? Es la base técnica de todo el B2B.
3. **Backend del core:** ¿en qué está hecho? Si es .NET, el Partner API va en .NET con el mismo equipo.
4. **Panel de partner actual:** la web de Empresas ya promete uno. ¿Existe algo construido o es este?
5. **MrFit MX:** ¿qué aprendieron con ese cliente? Precio, activación, qué usan del panel.
6. **Creadores → coaches:** ¿el programa de Creadores puede ser la puerta de entrada al segmento coach?
7. **Socio que deja el gimnasio:** ¿le ofrecemos seguir con GRAVL directo? Es la ventaja de datos (§10), pero hay que acordarlo en el contrato.
8. **SportClub:** ¿hay contacto? ¿Su app "SportClub Carnet" puede hacer el vínculo con GRAVL en un toque?
