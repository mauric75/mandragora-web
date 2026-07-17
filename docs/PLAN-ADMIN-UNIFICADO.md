# Plan técnico — Admin unificado de Mandrágora

**Fecha:** 2026-07-17  
**Estado:** Aprobado — sin implementar  
**Ramas involucradas:** `main`, `codex/ia-admin-pruebas`

---

## 1. Diagnóstico

### 1.1 Tres paneles separados

| Panel | Rama | URL | Auth | Seguridad |
|-------|------|-----|------|-----------|
| `admin.html` | `codex/ia-admin-pruebas` | Solo Preview | Cookie HMAC + roles | Alta (timingSafeEqual, rate limit, auditoría) |
| `noticias-admin.html` | `main` | Production | Bearer token texto plano | Baja |
| `push-admin.html` | `main` | Production | Bearer token texto plano | Baja |

### 1.2 Tres contraseñas distintas

| Variable | Panel | Entorno |
|----------|-------|---------|
| `ADMIN_PASSWORD` | Reservas + Chat IA | Solo Preview |
| `NOTICIAS_ADMIN_SECRET` | Noticias | Production |
| `PUSH_ADMIN_SECRET` | Push | Production |

### 1.3 Lo que existe en cada rama

**`main` (Production):**
- `noticias-admin.html` — CRUD de noticias via GitHub API
- `push-admin.html` — envío de push via Supabase
- `api/noticias-save.js` — endpoint CRUD (Bearer token)
- `api/push-send.js` — endpoint push (Bearer token)
- `api/push-subscribe.js` — endpoint público de suscripción
- `api/crear-preferencia.js` — MercadoPago
- `api/crear-suscripcion.js` — MercadoPago
- `data/noticias.json` — datos de noticias

**`codex/ia-admin-pruebas` (Preview):**
- `admin.html` — panel con login por cookies, reservas, chat IA
- `api/admin-auth.js` — endpoint unificado de autenticación (login/logout/session)
- `api/reservas.js` — endpoint de reservas (Supabase)
- `api/ai-admin/chat.js` — chat con DeepSeek
- `api/lib/admin-auth.js` — HMAC cookies, roles, timingSafeEqual
- `api/lib/audit.js` — logs a Supabase `admin_logs`
- `api/lib/rate-limit.js` — 10 req/min por IP
- `api/lib/supabase.js` — cliente Supabase server-side
- `supabase/migrations/` — esquemas de `reservas` y `admin_logs`

### 1.4 Lo que NO existe

- Panel de administración de docentes
- `data/docentes.json`
- `api/docentes.js`
- Endpoint para cambiar estado de reservas
- Paginación en reservas
- Unificación de los tres paneles

---

## 2. Arquitectura objetivo

```
┌─────────────────────────────────────────────────────────────┐
│                    admin.html (UNIFICADO)                    │
│                                                             │
│  Login único → POST /api/admin-auth?action=login            │
│  Sesión → cookie mandragora_admin_session (30 min)          │
│  Roles → admin | editor | consulta                          │
│                                                             │
│  ┌──────────┬──────────┬──────────┬──────────┬───────────┐  │
│  │ Reservas │ Noticias │ Docentes │   Push   │  Chat IA  │  │
│  │  (CRUD)  │  (CRUD)  │  (CRUD)  │ (enviar) │(DeepSeek) │  │
│  └──────────┴──────────┴──────────┴──────────┴───────────┘  │
│                                                             │
│  Backends:                                                  │
│  📋 Reservas → Supabase (reservas)                          │
│  📰 Noticias → GitHub API (data/noticias.json)              │
│  👤 Docentes → GitHub API (data/docentes.json)              │
│  📢 Push    → Supabase (mandragora_push_subscriptions)      │
│  🤖 Chat IA → DeepSeek API                                  │
│  📊 Auditoría → Supabase (admin_logs)                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Sistema de autenticación unificado

**Mecanismo:** Cookies firmadas con HMAC-SHA256  
**Cookie:** `mandragora_admin_session`  
**Payload:** `timestamp|role|signature`  
**Expiración:** 30 minutos (Max-Age)  
**Flags:** HttpOnly, SameSite=Strict, Secure en producción  

**Endpoint único:** `POST /api/admin-auth`
- `?action=login` + `{ password }` → valida contra `ADMIN_PASSWORD*`, devuelve cookie
- `?action=logout` → limpia cookie
- `GET` sin action → verifica sesión (204 válida, 401 expirada)

**Roles:**

| Rol | Permisos |
|-----|----------|
| `admin` | Todo: crear, editar, borrar, ver auditoría |
| `editor` | Crear y editar. No borrar |
| `consulta` | Solo lectura |

**Variables de entorno requeridas:**
- `ADMIN_PASSWORD` — contraseña rol admin
- `ADMIN_PASSWORD_EDITOR` — contraseña rol editor (opcional)
- `ADMIN_PASSWORD_CONSULTA` — contraseña rol consulta (opcional)
- `ADMIN_SESSION_SECRET` — clave para firmar cookies HMAC

### 2.2 Estructura del panel unificado

```html
<div id="dashboard" style="display:none">
  <nav class="tabs">
    <button data-tab="reservas">Reservas</button>
    <button data-tab="noticias">Noticias</button>
    <button data-tab="docentes">Docentes</button>
    <button data-tab="push">Push</button>
    <button data-tab="chat">Chat IA</button>
  </nav>

  <section id="tab-reservas"><!-- tabla + filtros --></section>
  <section id="tab-noticias"><!-- formulario + lista --></section>
  <section id="tab-docentes"><!-- formulario + lista --></section>
  <section id="tab-push"><!-- formulario de envío --></section>
  <section id="tab-chat"><!-- chat con IA --></section>
</div>
```

---

## 3. Plan de implementación

### Fase 1 — Merge y unificación de auth

**Objetivo:** Subir el sistema de auth seguro a producción y unificar los tres paneles.

#### Paso 1.1: Merge de `codex/ia-admin-pruebas` a `main`

Archivos que se incorporan a `main`:

| Archivo | Acción |
|---------|--------|
| `api/admin-auth.js` | NUEVO — endpoint de auth |
| `api/reservas.js` | NUEVO — endpoint de reservas |
| `api/ai-admin/chat.js` | NUEVO — endpoint de chat IA |
| `api/lib/admin-auth.js` | NUEVO — utilidades de auth |
| `api/lib/audit.js` | NUEVO — registro de auditoría |
| `api/lib/rate-limit.js` | NUEVO — rate limiter |
| `api/lib/supabase.js` | NUEVO — cliente Supabase |
| `supabase/migrations/*.sql` | NUEVO — esquemas de BD |
| `admin.html` | REEMPLAZAR — versión unificada |

**Variables a agregar en Vercel Production:**
`ADMIN_PASSWORD`, `ADMIN_PASSWORD_EDITOR`, `ADMIN_PASSWORD_CONSULTA`, `ADMIN_SESSION_SECRET`, `DEEPSEEK_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

#### Paso 1.2: Reescribir `admin.html` como panel unificado

El nuevo `admin.html` absorbe la funcionalidad de los tres paneles actuales:

- **Reservas:** GET `/api/reservas` → tabla con filtros (ya existe en codex)
- **Noticias:** formulario + lista (migrado desde `noticias-admin.html`)
- **Push:** formulario de envío (migrado desde `push-admin.html`)
- **Chat IA:** chat con DeepSeek (ya existe en codex)

#### Paso 1.3: Adaptar endpoints a cookie auth

Modificar `api/noticias-save.js` y `api/push-send.js` para usar `hasValidAdminSession(req)` de `lib/admin-auth.js`, eliminando `NOTICIAS_ADMIN_SECRET` y `PUSH_ADMIN_SECRET`.

#### Paso 1.4: Limpiar archivos redundantes

Archivar `noticias-admin.html` y `push-admin.html` (su funcionalidad queda en `admin.html`).

---

### Fase 2 — Sección Docentes

**Objetivo:** CRUD de docentes desde el panel + páginas públicas dinámicas.

#### Esquema `data/docentes.json`:
```json
[{
  "id": "docente-timestamp",
  "nombre": "string (2-80 chars, requerido)",
  "foto": "string (path a assets/images/elenco/)",
  "rol": "string (disciplinas, requerido)",
  "frase": "string (máx 200 chars)",
  "trayectoria": "string (máx 300 chars)",
  "instagram": "string (@usuario)",
  "whatsapp": "string (6-30 chars)",
  "precio": "number (pesos)",
  "activo": "boolean"
}]
```

#### Archivos:

| Archivo | Acción |
|---------|--------|
| `data/docentes.json` | NUEVO |
| `api/docentes.js` | NUEVO — CRUD via GitHub API |
| `admin.html` | MODIFICAR — pestaña Docentes |
| `escuela.html` | MODIFICAR — cargar desde JSON |
| `compania.html` | MODIFICAR — cargar desde JSON |
| `reservar.html` | MODIFICAR — cargar desde JSON |

#### Endpoint `api/docentes.js`:
- POST, mismo patrón que `noticias-save.js`
- Auth: cookie `mandragora_admin_session`
- Acciones: `list`, `save`, `delete`
- Delete solo para rol `admin`
- Backend: GitHub API sobre `data/docentes.json`

---

### Fase 3 — Mejoras complementarias

| Mejora | Archivos |
|--------|----------|
| Botones cambio de estado en reservas | `admin.html`, `api/reservas.js` |
| UI con restricciones por rol (data-role) | `admin.html` |
| Schema.org (PerformingArtsTheater, Event) | `index.html`, `agenda.html` |
| Reels en menú de las 13 páginas | `*.html` |

---

## 4. Variables de entorno — antes y después

| Variable | Antes | Después |
|----------|-------|---------|
| `ADMIN_PASSWORD` | Solo Preview | **Production** |
| `ADMIN_PASSWORD_EDITOR` | Solo Preview | **Production** |
| `ADMIN_PASSWORD_CONSULTA` | Solo Preview | **Production** |
| `ADMIN_SESSION_SECRET` | Solo Preview | **Production** |
| `DEEPSEEK_API_KEY` | Solo Preview | **Production** |
| `SUPABASE_URL` | Preview + Production | Sin cambios |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo Preview | **Production** |
| `GITHUB_TOKEN` | Production | Sin cambios |
| `NOTICIAS_ADMIN_SECRET` | Production | **Eliminada** |
| `PUSH_ADMIN_SECRET` | Production | **Eliminada** |

---

## 5. Límite de funciones Vercel (Hobby: 12)

| Funciones actuales (main) | 5 |
| Funciones del merge | +3 |
| Función nueva (docentes) | +1 |
| **Total** | **9 / 12** |

---

## 6. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Conflictos al mergear ramas | Merge local, probar en Preview primero |
| Cambiar auth rompe `noticias-admin.html` | Transición: aceptar cookie + Bearer temporalmente |
| Merge rompe páginas existentes en main | Hacer diff completo antes del merge |
| `SUPABASE_SERVICE_ROLE_KEY` expuesta | Solo se usa en serverless, nunca en frontend |
