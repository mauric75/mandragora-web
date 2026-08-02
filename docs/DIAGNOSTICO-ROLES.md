# Diagnóstico: Sistema de roles (admin, editor, consulta)

**Fecha:** 2 de agosto 2026

## Estado actual

El sistema define 3 roles con contraseñas independientes (`ADMIN_PASSWORD`, `ADMIN_PASSWORD_EDITOR`, `ADMIN_PASSWORD_CONSULTA`), pero su implementación es inconsistente:

| Capa | admin | editor | consulta |
|------|-------|--------|----------|
| `admin-auth.js` | ✅ | ✅ | ✅ |
| REST API (save) | ✅ | ✅ (igual que admin) | ✅ (igual que admin) |
| REST API (delete) | ✅ | ❌ (agenda/docentes) / ✅ (noticias, bug) | ❌ (agenda/docentes) / ✅ (noticias, bug) |
| Chat IA | ✅ | ✅ (crear/editar, no borrar) | ✅ (solo lectura) |
| Frontend (`admin.html`) | ✅ | ❌ (ve todo igual que admin) | ❌ (ve todo igual que admin) |
| Vercel env vars | ✅ | ⚠️ solo en scope `codex/ia-admin-pruebas` | ⚠️ solo en scope `codex/ia-admin-pruebas` |

## Problemas detectados

1. **Editor y consulta son indistinguibles en la REST API** — ambos pueden guardar, y en noticias incluso borrar (bug)
2. **El frontend no diferencia roles** — todos los usuarios ven los mismos botones. Un usuario `consulta` puede clickear "Borrar" aunque la operación falle en el backend
3. **El único lugar con implementación completa es el Chat IA**
4. **Las contraseñas de editor y consulta posiblemente no existen en producción** (solo en el scope de pruebas)
5. `.env.example` no documenta `ADMIN_PASSWORD_EDITOR` ni `ADMIN_PASSWORD_CONSULTA`

## Sugerencia: simplificar a un solo rol

Eliminar los roles `editor` y `consulta`, dejar solo `admin`. Los cambios necesarios:

1. **`api/lib/admin-auth.js`:** `checkAdminPassword` solo verifica `ADMIN_PASSWORD`
2. **`api/agenda.js` y `api/docentes.js`:** quitar `getAdminSessionRole(req) !== 'admin'` de los delete
3. **`api/ai-admin/chat.js`:** quitar checks de rol en herramientas (todo requiere admin)
4. **Vercel:** eliminar `ADMIN_PASSWORD_EDITOR` y `ADMIN_PASSWORD_CONSULTA`
5. **`.env.example`:** sin cambios necesarios (ya no las incluye)

Si en el futuro se necesita un rol de solo lectura, implementarlo con frontend que oculte botones según el rol.
