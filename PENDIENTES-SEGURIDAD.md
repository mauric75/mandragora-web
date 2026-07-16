# Pendientes de Seguridad — Mandrágora

## Crítico

1. **Contraseña hardcodeada en admin.html** — `admin.html:55` tiene la clave visible en JS público. Reemplazar por autenticación real del servidor.
2. **Reservas en localStorage** — `reservar.html:536` guarda datos personales en el navegador. Migrar a Supabase.
3. **XSS en admin** — `admin.html:85` usa innerHTML con datos de usuario. Sanitizar con textContent.
4. **Precios manipulables** — `api/crear-preferencia.js:10` acepta el precio del frontend. Validar en servidor.
5. **Public Key de prueba** — `pagar.html:77` usa `TEST-xxxxxxxx`. Reemplazar por la real.

## Backend y despliegue

6. Restringir CORS (`Access-Control-Allow-Origin: *`) a dominios reales
7. Rate limiting en pagos, reservas y push
8. Headers de seguridad: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, protección anti-iframes
9. Variables de entorno: nunca publicar SUPABASE_SERVICE_ROLE_KEY, MERCADOPAGO_ACCESS_TOKEN, PUSH_ADMIN_SECRET
10. Ampliar .gitignore
11. Si alguna clave real fue expuesta: revocar y regenerar (no solo ocultar)
12. Validar pagos de MercadoPago mediante webhook (no confiar solo en exito.html)
13. Supabase: configurar RLS, permisos por tabla y políticas de acceso
14. Validar entradas públicas: longitud y formato de nombre, email, teléfono
15. Sesiones admin: cierre de sesión, expiración, protección contra intentos repetidos

## Mantenimiento

11. Fijar versiones de dependencias con lockfile
12. Auditorías periódicas de dependencias
13. Proteger admin.html y push-admin.html en desarrollo
14. Páginas de error sin detalles internos

## Orden recomendado

1. Revocar claves expuestas (si las hay)
2. Public Key real de MercadoPago
3. Webhook de validación de pagos
4. Autenticación real para admin
5. Proteger reservas (Supabase + RLS)
6. Validar precios en servidor
7. Sanitizar datos (XSS)
8. Rate limiting + validación de entradas
9. Endurecer API y headers
