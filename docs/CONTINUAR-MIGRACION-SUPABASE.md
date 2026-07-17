# Continuar migración de reservas a Supabase

## Estado actual

La migración quedó preparada en la rama `codex/ia-admin-pruebas`. `main` no fue modificado ni desplegado.

Se creó un proyecto Supabase independiente:

- Nombre: `mandragora`
- Proyecto: `qreponqhjjqfzsqjweza`
- Región: `sa-east-1`
- Organización: `mauric75@gmail.com's Org`
- Costo consultado: `$0 mensuales`

No se reutilizó `radar-legislativo` ni ningún otro proyecto existente.

## Qué ya está hecho

### Base de datos

La tabla `public.reservas` ya fue creada en el proyecto nuevo con:

- `id` UUID generado por la base.
- `servicio` limitado a `sala`, `taller`, `entrada` u `otro`.
- `detalle`, `fecha`, `nombre`, `whatsapp`, `email` y `mensaje`.
- `estado` limitado a `pendiente`, `contactada`, `confirmada` u `cancelada`.
- Fechas de creación y actualización.
- Índices para `fecha` y `estado`.
- RLS activado.
- Permisos revocados para `anon` y `authenticated`.

La API del servidor utilizará la clave `service_role`, que queda protegida en Vercel y nunca se envía al navegador.

### Backend

Se agregaron:

- `api/lib/supabase.js`: crea el cliente Supabase exclusivamente en el servidor.
- `api/reservas.js`: recibe reservas por `POST` y permite listarlas por `GET` únicamente con sesión admin válida.
- `supabase/migrations/20260715230300_create_reservas.sql`: deja documentado el esquema aplicado.

La API valida servicio, fecha, nombre, WhatsApp, email y límites de longitud antes de insertar.

### Formulario público

`reservar.html` ya no guarda datos personales en `localStorage` ni usa Supabase desde el navegador.

El nuevo flujo es:

1. Se arma el mensaje de WhatsApp.
2. Se abre WhatsApp para conservar el comportamiento actual.
3. Se envía la reserva a `/api/reservas`.
4. Se informa si la reserva fue guardada correctamente.

El tema visual continúa usando `localStorage`, porque no contiene datos de la reserva.

### Panel admin

`admin.html` ya no lee `mandragora-reservas` desde el navegador.

Después de iniciar sesión, consulta `/api/reservas` y muestra las reservas centralizadas, incluyendo detalle y estado.

## Paso pendiente 1: variables de Vercel

En Vercel, abrir el proyecto `deploy` y entrar a `Settings` → `Environment Variables`.

Crear estas dos variables para **Preview** únicamente:

```text
SUPABASE_URL=https://qreponqhjjqfzsqjweza.supabase.co
SUPABASE_SERVICE_ROLE_KEY=PEGAR_AQUI_LA_SERVICE_ROLE_KEY
```

La `SUPABASE_SERVICE_ROLE_KEY` se obtiene en el proyecto Supabase nuevo, en `Project Settings` → `API` → `Secret keys` o `Legacy API keys`.

Usar la clave `service_role` o `secret`, nunca la clave pública en esta variable.

Importante:

- No pegar la clave en el código.
- No ponerla en `reservar.html`.
- No guardarla en GitHub.
- No configurarla como `Production` hasta terminar todas las pruebas.
- Si la clave se expone, revocarla y generar otra inmediatamente.

Las variables existentes `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` deben seguir configuradas para Preview.

## Paso pendiente 2: crear un nuevo Preview

Como hay variables nuevas, Vercel debe generar un deployment nuevo.

En Vercel:

1. Ir a `Deployments`.
2. Elegir el deployment de `codex/ia-admin-pruebas`.
3. Usar `Redeploy`.
4. Mantener el entorno `Preview`.
5. No elegir `Production`.

La URL debe mostrar una referencia a la rama `codex-ia-admin-pruebas`.

## Paso pendiente 3: probar la reserva

En la URL Preview:

1. Abrir `reservar.html`.
2. Seleccionar servicio y fecha.
3. Completar nombre y WhatsApp.
4. Enviar el formulario.
5. Confirmar que WhatsApp se abre.
6. Confirmar que aparece el mensaje de reserva guardada.

Si aparece que no se pudo registrar, revisar que las dos variables estén en Preview, que la clave pertenezca al proyecto `mandragora` y que el deployment haya sido creado después de guardarlas.

## Paso pendiente 4: probar el panel admin

En la misma URL Preview, abrir `admin.html`:

1. Iniciar sesión con la contraseña actual configurada en `ADMIN_PASSWORD`.
2. Confirmar que aparece la reserva creada.
3. Probar los filtros de servicio.
4. Cerrar sesión.
5. Volver a abrir el panel y confirmar que solicita autenticación.

La consulta `GET /api/reservas` debe devolver `401` sin una sesión admin válida.

## Paso pendiente 5: commit y push de la rama

Solo después de probar el Preview:

```powershell
cd C:\Users\HP\Documents\Mandragora\deploy
git status
git diff --check
git add admin.html reservar.html api/lib/supabase.js api/reservas.js supabase/migrations/20260715230300_create_reservas.sql CONTINUAR-MIGRACION-SUPABASE.md
git commit -m "migrate reservations to Supabase"
git push -u origin codex/ia-admin-pruebas
```

No ejecutar `git push origin main`, no hacer merge automático y no seleccionar Production en Vercel.

## Paso pendiente 6: limpieza y mejoras posteriores

Después de confirmar que el Preview funciona:

- Decidir si se eliminan manualmente las reservas antiguas guardadas en `localStorage` de los navegadores de prueba.
- Agregar rate limiting al `POST /api/reservas`.
- Agregar protección anti-spam o CAPTCHA si el formulario recibe abuso.
- Agregar actualización de `estado` desde el panel admin.
- Agregar paginación si superan 200 reservas.
- Configurar backup y retención en Supabase.
- Revisar logs sin registrar nombres, teléfonos o mensajes completos.
- Ejecutar los asesores de seguridad y rendimiento de Supabase después de estabilizar la tabla.

## Criterio para pasar a producción

No pasar esta configuración a Production hasta verificar:

- El formulario guarda una reserva en la tabla central.
- WhatsApp sigue abriéndose.
- El panel admin muestra la misma reserva desde otro navegador.
- Un visitante no autenticado no puede consultar reservas.
- La clave `service_role` solo existe como variable de entorno protegida.
- El deployment probado corresponde a `codex/ia-admin-pruebas`.
- El usuario autoriza expresamente el merge o deploy a `main`.

