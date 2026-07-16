# Mandrágora — IA Interna para Administración
## Documento Técnico — Julio 2026

---

## 1. Rama de trabajo

Todo el desarrollo está en:
```
codex/ia-admin-pruebas
```
Main (`main`) no fue modificado. El código de producción sigue intacto.

---

## 2. Arquitectura general

```
admin.html (panel admin)
  ├── /api/admin-auth   ← login/logout/sesión unificados
  ├── /api/reservas     ← listar reservas (GET), crear (POST)
  ├── /api/ai-admin/chat ← chat con DeepSeek (Fase 1, solo lectura)
  └── Supabase (tablas: reservas, admin_logs)

Variables de entorno (Vercel Preview):
  ADMIN_PASSWORD
  ADMIN_PASSWORD_EDITOR
  ADMIN_PASSWORD_CONSULTA
  ADMIN_SESSION_SECRET
  DEEPSEEK_API_KEY
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
```

---

## 3. Funciones serverless (Vercel `api/`)

| Archivo | Ruta | Método | Qué hace |
|---------|------|--------|----------|
| `api/admin-auth.js` | `/api/admin-auth` | GET | Verificar sesión |
| | `/api/admin-auth?action=login` | POST | Iniciar sesión (devuelve cookie) |
| | `/api/admin-auth?action=logout` | POST | Cerrar sesión |
| `api/reservas.js` | `/api/reservas` | GET | Listar reservas (requiere sesión) |
| | `/api/reservas` | POST | Crear reserva (público) |
| `api/ai-admin/chat.js` | `/api/ai-admin/chat` | POST | Enviar mensaje a DeepSeek |

### Librerías internas (`api/lib/`)

| Archivo | Qué exporta |
|---------|-------------|
| `admin-auth.js` | `isAdminConfigured()`, `checkAdminPassword(password)`, `createSessionCookie(req, role)`, `hasValidAdminSession(req)`, `clearSessionCookie(req)`, `getAdminSessionRole(req)` |
| `audit.js` | `logAdminAction(role, action, resource, details, req)` → inserta en `admin_logs` |
| `rate-limit.js` | `checkRateLimit(key)` → 10 req/min en memoria |
| `supabase.js` | `createClient()` → cliente Supabase con SERVICE_ROLE_KEY |

---

## 4. Sistema de autenticación

### Roles (Fase 0)

Tres niveles, basados en contraseñas distintas configuradas como variables de entorno:

| Variable Vercel | Rol |
|-----------------|-----|
| `ADMIN_PASSWORD` | `admin` |
| `ADMIN_PASSWORD_EDITOR` | `editor` |
| `ADMIN_PASSWORD_CONSULTA` | `consulta` |

La función `checkAdminPassword()` itera sobre las tres variables, compara con `crypto.timingSafeEqual`, y devuelve el rol. El rol se guarda en la cookie de sesión (campo 3 del payload).

### Cookie de sesión
- Nombre: `mandragora_admin_session`
- HttpOnly, SameSite=Strict, Secure en producción
- Expira: 30 minutos
- Formato: `timestamp.random.role.firma`

### Auditoría
Cada login se registra en `public.admin_logs` (Supabase) con rol, acción, IP y timestamp.

---

## 5. Rate limiting

Implementado en `api/lib/rate-limit.js`:
- 10 intentos por minuto por IP
- En memoria (se reinicia con cada deploy frío)
- Aplicado en: `POST /api/admin-auth?action=login`

---

## 6. Supabase

### Proyecto
- Nombre: `mandragora`
- ID: `qreponqhjjqfzsqjweza`
- Región: `sa-east-1`

### Tablas

**`public.reservas`**
```
id UUID, servicio TEXT, detalle TEXT, fecha DATE,
nombre TEXT, whatsapp TEXT, email TEXT, mensaje TEXT,
estado TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```
RLS: solo service_role puede leer/escribir. Anon y authenticated bloqueados.

**`public.admin_logs`**
```
id UUID, user_role TEXT, action TEXT, resource TEXT,
details JSONB, ip_address TEXT, created_at TIMESTAMPTZ
```
RLS: solo service_role. Índices en `created_at` y `action`.

### Migraciones
```
supabase/migrations/20260715230300_create_reservas.sql
supabase/migrations/20260716_create_admin_logs.sql
```

---

## 7. IA — Fase 1 (solo lectura)

### Endpoint: `POST /api/ai-admin/chat`

Recibe `{ message: string }`, envía a DeepSeek con herramientas definidas.

Herramientas registradas:
- `listar_reservas(servicio?, estado?)`
- `resumir_reservas()`

Modelo: `deepseek-chat`, temperature 0.3, max_tokens 500.

La respuesta de DeepSeek se registra en `admin_logs` (solo primeros 200 chars de prompt y respuesta).

### UI
- El chat aparece abajo de la tabla de reservas en admin.html
- Se activa después de `showDashboard()`
- Input + botón "Enviar"
- Historial simple en el DOM

---

## 8. Configuración de Vercel

### Variables de entorno (Preview)

```
ADMIN_PASSWORD=<ver en Vercel — Settings → Environment Variables>
ADMIN_PASSWORD_EDITOR=<ver en Vercel>
ADMIN_PASSWORD_CONSULTA=<ver en Vercel>
ADMIN_SESSION_SECRET=<ver en Vercel>
DEEPSEEK_API_KEY=<ver en Vercel>
SUPABASE_URL=https://qreponqhjjqfzsqjweza.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<ver en Vercel>
```

**IMPORTANTE:** Estas credenciales estuvieron expuestas en texto plano en este documento, en un repo público. Fueron rotadas por seguridad — cualquier valor visto anteriormente en el historial de git ya no es válido.

### Deploy actual (Preview)
URL base: `https://deploy-rm95wzdug-mauricio-s-projects1.vercel.app`

---

## 9. Pendientes

### Fase 0 (seguridad base)
- [x] Reemplazar contraseña hardcodeada
- [x] Autenticación real con sesiones
- [x] Roles (admin/editor/consulta)
- [x] Migrar reservas a Supabase
- [x] RLS en Supabase
- [x] Registros de auditoría
- [x] Rate limiting
- [ ] Restricciones de UI por rol (editor no puede borrar, consulta solo lee)
- [ ] Public Key de MercadoPago real

### Fase 1 (IA solo lectura)
- [x] Endpoint /api/ai-admin/chat
- [x] Integración con DeepSeek
- [x] Herramientas: listar_reservas, resumir_reservas
- [ ] UI del chat funcional (pendiente debug)
- [ ] Más herramientas: buscar_evento, filtrar por fecha

### Fase 2 (modo borrador)
- [ ] IA puede proponer nuevos eventos/noticias
- [ ] Sistema de aprobación (aprobar/rechazar/editar)

### Fase 3 (acciones aprobadas)
- [ ] Botones aprobar/rechazar/deshacer
- [ ] Ejecución post-aprobación

---

## 10. Para continuar

```bash
cd C:\Users\HP\Documents\Mandragora\deploy
git checkout codex/ia-admin-pruebas
git pull origin codex/ia-admin-pruebas
```

El chat de IA no se muestra en el panel admin — requiere debug de la UI.
El backend está completo y funcional (login, roles, auditoría, rate limiting, chat DeepSeek).
