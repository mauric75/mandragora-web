# Bitácora — Admin unificado de Mandrágora

**Rama:** `feature/admin-unificado`  
**Base:** `main` + merge de `codex/ia-admin-pruebas`  
**Fecha:** 2026-07-17  
**Commit:** `fe2d4f9` — "admin unificado con 4 pestanas y cookie auth"

---

## 1. Cambios realizados

### 1.1 Merge de ramas

Se creó `feature/admin-unificado` desde `main` y se mergeó `codex/ia-admin-pruebas`. Sin conflictos. Archivos incorporados desde `codex/ia-admin-pruebas`:

| Archivo | Función |
|---------|---------|
| `api/admin-auth.js` | Endpoint unificado de autenticación (login/logout/session) |
| `api/reservas.js` | Listado de reservas desde Supabase |
| `api/ai-admin/chat.js` | Chat con DeepSeek |
| `api/lib/admin-auth.js` | HMAC cookies, timingSafeEqual, 3 roles |
| `api/lib/audit.js` | Registro de acciones en Supabase `admin_logs` |
| `api/lib/rate-limit.js` | Rate limiter: 10 req/min por IP |
| `api/lib/supabase.js` | Cliente Supabase server-side |
| `supabase/migrations/20260715230300_create_reservas.sql` | Esquema tabla `reservas` |
| `supabase/migrations/20260716_create_admin_logs.sql` | Esquema tabla `admin_logs` |

`main` no fue modificado en ningún momento.

### 1.2 `admin.html` — Panel unificado (reescrito)

El nuevo `admin.html` reemplaza los tres paneles separados (`admin.html`, `noticias-admin.html`, `push-admin.html`).

**Login:**
- Una sola contraseña → cookie `mandragora_admin_session` (30 min)
- 3 roles: `admin`, `editor`, `consulta`
- Rate limiting: 10 intentos/min
- Auditoría en Supabase

**4 pestañas:**

| Pestaña | Funcionalidad | Endpoint | Fuente de datos |
|---------|--------------|----------|-----------------|
| Reservas | Tabla con filtros (Sala/Talleres/Entradas/Consultas) | `GET /api/reservas` | Supabase |
| Noticias | Formulario CRUD + lista (título, texto, tipo, link, imagen, publicada, push) | `POST /api/noticias-save` | GitHub API → `data/noticias.json` |
| Push | Formulario de envío (título, mensaje, link) | `POST /api/push-send` | Supabase |
| Chat IA | Conversación con DeepSeek | `POST /api/ai-admin/chat` | DeepSeek API |

**Cambios respecto a los paneles anteriores:**
- `noticias-admin.html` y `push-admin.html` usaban cada uno su propia contraseña (Bearer token). Ahora comparten la cookie de sesión del admin unificado.
- La UI es consistente: mismos colores, tipografía, espaciados.
- Las pestañas usan `display: none/block` con clase `.is-active`.
- El Chat IA tiene su propia pestaña (antes estaba debajo de Reservas).

### 1.3 `api/noticias-save.js` — Auth por cookie

**Antes:**
```javascript
const adminSecret = process.env.NOTICIAS_ADMIN_SECRET;
const authHeader = req.headers['authorization'] || '';
if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
  return res.status(401).json({ error: 'No autorizado' });
}
```

**Ahora:**
```javascript
import { hasValidAdminSession } from './lib/admin-auth.js';
// ...
const sessionRole = hasValidAdminSession(req);
const adminSecret = process.env.NOTICIAS_ADMIN_SECRET;
const authHeader = req.headers['authorization'] || '';

if (!sessionRole && (!adminSecret || authHeader !== `Bearer ${adminSecret}`)) {
  return res.status(401).json({ error: 'No autorizado' });
}
```

Acepta ambos métodos: cookie de sesión (admin unificado) o Bearer token (`noticias-admin.html` viejo, para compatibilidad durante la transición).

### 1.4 `api/push-send.js` — Auth por cookie

Mismo cambio que `noticias-save.js`:
- Importa `hasValidAdminSession` de `lib/admin-auth.js`
- Acepta cookie O Bearer token (`PUSH_ADMIN_SECRET`)
- Compatibilidad hacia atrás con `push-admin.html` viejo

---

## 2. Variables de entorno necesarias para el Preview

El deployment de Vercel en `feature/admin-unificado` necesita estas variables en **Preview**:

| Variable | Estado actual | Acción necesaria |
|----------|--------------|------------------|
| `ADMIN_PASSWORD` | ✅ Preview (genérico) | Ninguna |
| `ADMIN_SESSION_SECRET` | ✅ Preview (genérico) | Ninguna |
| `ADMIN_PASSWORD_EDITOR` | ❌ Solo `codex/ia-admin-pruebas` | Ampliar scope a todos los Preview |
| `ADMIN_PASSWORD_CONSULTA` | ❌ Solo `codex/ia-admin-pruebas` | Ampliar scope a todos los Preview |
| `DEEPSEEK_API_KEY` | ❌ Solo `codex/ia-admin-pruebas` | Ampliar scope a todos los Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Solo `codex/ia-admin-pruebas` | Ampliar scope a todos los Preview |
| `SUPABASE_URL` | ❌ No aparece listada | Verificar si existe en Production. Si no, crearla en Preview |
| `GITHUB_TOKEN` | ✅ Production (solo Production) | Agregar a Preview para testing |
| `NOTICIAS_ADMIN_SECRET` | ✅ Production, Preview | Mantener (compatibilidad con `noticias-admin.html` viejo) |
| `PUSH_ADMIN_SECRET` | ? | Mantener si existe (compatibilidad con `push-admin.html` viejo) |

**Variables que se volverán innecesarias después de la transición:**
- `NOTICIAS_ADMIN_SECRET` — ya no se usa en el panel unificado
- `PUSH_ADMIN_SECRET` — ya no se usa en el panel unificado

---

## 3. Próximos pasos

### Para probar el Preview

1. Corregir las variables de entorno en Vercel (tabla arriba)
2. Esperar el deploy automático en Vercel (o hacer redeploy manual)
3. Entrar al Preview con `ADMIN_PASSWORD`
4. Probar las 4 pestañas

### Después de probar

1. Mergear `feature/admin-unificado` a `main`
2. Agregar las variables a Production
3. Eliminar `NOTICIAS_ADMIN_SECRET` y `PUSH_ADMIN_SECRET` de Production
4. Archivar `noticias-admin.html` y `push-admin.html`

### Pendiente (Fase 2 y 3 del plan)

- Sección Docentes (data/docentes.json + api/docentes.js + pestaña)
- Botones de cambio de estado en reservas
- Restricciones UI por rol
- Schema.org
- Reels en menú
