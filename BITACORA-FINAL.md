# Bitácora completa — Admin unificado + Docentes + Chat IA

**Rama:** `feature/admin-unificado` → mergeado a `main`  
**Fecha:** 2026-07-17  
**URL Producción:** https://deploy-phi-wheat.vercel.app/admin.html  
**URL Preview:** https://deploy-i6qygltd5-mauricio-s-projects1.vercel.app/admin.html  
**Commit merge:** `dd344f6` — "merge admin unificado docentes y chat IA a produccion"

---

## 1. Fase 1 — Admin unificado

### 1.1 Merge inicial
Se mergeó `codex/ia-admin-pruebas` a `feature/admin-unificado`. Sin conflictos.

Archivos incorporados:
| Archivo | Función |
|---------|---------|
| `api/admin-auth.js` | Login/logout/sesión con cookies HMAC, 3 roles |
| `api/reservas.js` | Listado de reservas desde Supabase |
| `api/ai-admin/chat.js` | Chat con DeepSeek (function calling) |
| `api/lib/admin-auth.js` | HMAC cookies, timingSafeEqual, roles |
| `api/lib/audit.js` | Registro de acciones en Supabase |
| `api/lib/rate-limit.js` | 10 req/min por IP |
| `api/lib/supabase.js` | Cliente Supabase server-side |
| `supabase/migrations/` | Esquemas `reservas` y `admin_logs` |

### 1.2 `admin.html` — Panel unificado (reescrito)
Tres paneles (`admin.html`, `noticias-admin.html`, `push-admin.html`) unificados en uno solo con 5 pestañas:
- **Reservas** — tabla con filtros, badges de estado
- **Noticias** — formulario CRUD (título, texto, tipo, link, imagen, publicada, push)
- **Docentes** — formulario CRUD (nombre, rol, foto, frase, trayectoria, instagram, whatsapp, precio)
- **Push** — formulario de envío de notificaciones
- **Chat IA** — conversación con DeepSeek, consulta y modifica datos reales

### 1.3 Auth unificado
`noticias-save.js` y `push-send.js` migrados de Bearer token a cookie de sesión:
```javascript
import { hasValidAdminSession } from './lib/admin-auth.js';
if (!hasValidAdminSession(req)) return 401;
```
Aceptan ambos métodos (cookie + Bearer) para compatibilidad durante la transición.

### 1.4 MercadoPago unificado
`crear-preferencia.js` + `crear-suscripcion.js` → `mercadopago.js` (liberó 1 slot de Vercel):
```
POST /api/mercadopago
Body: { action: "preferencia" | "suscripcion", title, price, email }
```

### 1.5 Rediseño visual
- Tema oscuro Mandrágora (`#0c1012`, dorado `#CE9A47`)
- Header con logo + botón cerrar sesión
- Stats bar: total reservas, pendientes, noticias, docentes activos
- Tabs con íconos SVG
- Tabla con badges de estado por color (pendiente 🟡, contactada 🔵, confirmada 🟢, cancelada 🔴)
- Formularios con focus glow dorado
- Responsive móvil

---

## 2. Fase 2 — Sección Docentes

### 2.1 `data/docentes.json`
Array JSON con esquema:
```json
[{
  "id": "docente-timestamp",
  "nombre": "string (requerido)",
  "rol": "string (disciplinas, requerido)",
  "foto": "string (URL o path)",
  "frase": "string (máx 200)",
  "trayectoria": "string (máx 300)",
  "instagram": "string (@usuario)",
  "whatsapp": "string",
  "precio": "number",
  "activo": "boolean"
}]
```

### 2.2 `api/docentes.js`
Endpoint CRUD siguiendo patrón `noticias-save.js`:
- `list` — público (sin auth), usado por páginas del sitio
- `save` — requiere cookie de sesión (admin/editor)
- `delete` — solo admin
- Backend: GitHub API sobre `data/docentes.json`
- Validaciones: nombre 2-80 chars, rol requerido, frase máx 200, trayectoria máx 300
- Maneja archivo inexistente (devuelve array vacío)
- Auditoría en Supabase

### 2.3 Pestaña Docentes en admin.html
- Formulario con 9 campos + checkbox activo
- Lista de cards con botones editar/borrar
- Validación client-side

### 2.4 Páginas públicas dinámicas
`escuela.html`, `compania.html`, `reservar.html` cargan docentes desde el endpoint:
```javascript
fetch('/api/docentes', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({action: 'list'})
}).then(r => r.json()).then(data => {
  var docentes = data.docentes || [];
  // renderizar...
});
```

---

## 3. Fase 3 — Chat IA con function calling real

### 3.1 Arquitectura
```
Usuario → POST /api/ai-admin/chat { message }
              ↓
         DeepSeek API (deepseek-chat)
              ↓
    ¿Devuelve tool_calls?
    ├─ Sí → ejecutar herramienta contra datos reales
    │        ├─ listar_reservas → Supabase
    │        ├─ resumir_reservas → Supabase
    │        ├─ listar_docentes → GitHub API
    │        ├─ actualizar_docente → GitHub API (write)
    │        └─ crear_docente → GitHub API (write)
    └─ No → devolver respuesta al usuario
```

### 3.2 Herramientas implementadas

| Herramienta | Tipo | Fuente | Permiso |
|------------|------|--------|---------|
| `listar_reservas` | Lectura | Supabase | admin/editor/consulta |
| `resumir_reservas` | Lectura | Supabase | admin/editor/consulta |
| `listar_docentes` | Lectura | GitHub API | admin/editor/consulta |
| `actualizar_docente` | Escritura | GitHub API | admin/editor |
| `crear_docente` | Escritura | GitHub API | admin/editor |

### 3.3 Function calling loop
El endpoint implementa un loop de hasta 3 rondas:
1. Envía mensaje a DeepSeek con tools definidas
2. Si DeepSeek devuelve `tool_calls` (formato nativo OpenAI), ejecuta la herramienta
3. Si DeepSeek devuelve JSON en el contenido (`{"tool":"...","args":{...}}`), lo parsea y ejecuta
4. Envía el resultado de vuelta a DeepSeek
5. Repite hasta que DeepSeek devuelva texto final (máx 3 rondas)

### 3.4 Ejemplos
- *"qué docentes hay?"* → lista docentes desde `docentes.json`
- *"cuántas reservas hay?"* → consulta Supabase, devuelve total
- *"crea un docente llamado Fefa con rol Clown y Voz"* → crea en `docentes.json` via GitHub API
- *"cambia la frase de Pancho a: El escenario es nuestra segunda casa"* → actualiza en `docentes.json`

---

## 4. Variables de entorno en Vercel

### Production + Preview

| Variable | Estado |
|----------|--------|
| `ADMIN_PASSWORD` | ✅ Production + Preview |
| `ADMIN_PASSWORD_EDITOR` | ✅ Production + Preview |
| `ADMIN_PASSWORD_CONSULTA` | ✅ Production + Preview |
| `ADMIN_SESSION_SECRET` | ✅ Production + Preview |
| `DEEPSEEK_API_KEY` | ✅ Production + Preview |
| `SUPABASE_URL` | ✅ Production + Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Production + Preview |
| `GITHUB_TOKEN` | ✅ Production + Preview |
| `GITHUB_BRANCH` | `main` (Production) / `feature/admin-unificado` (Preview) |
| `NOTICIAS_ADMIN_SECRET` | ✅ (compatibilidad) |
| `PUSH_ADMIN_SECRET` | ✅ (compatibilidad) |
| `VAPID_PUBLIC_KEY` | ⚠️ Solo Preview |
| `VAPID_PRIVATE_KEY` | ⚠️ Solo Preview |
| `VAPID_SUBJECT` | ⚠️ Solo Preview |
| `MERCADOPAGO_ACCESS_TOKEN` | ⚠️ No configurado |

---

## 5. Funciones Vercel desplegadas (10/12)

1. `api/admin-auth.js`
2. `api/ai-admin/chat.js`
3. `api/docentes.js` (nueva)
4. `api/mercadopago.js` (unificada)
5. `api/noticias-save.js`
6. `api/push-send.js`
7. `api/push-subscribe.js`
8. `api/reservas.js`
9. `api/lib/admin-auth.js`
10. `api/lib/audit.js`
11. `api/lib/rate-limit.js`
12. `api/lib/supabase.js`

---

## 6. Commits en `feature/admin-unificado`

```
6b6b4ef mejorar mensaje de confirmacion post tool execution
34e77d2 restaurar loop function calling hasta 3 rondas
82bc008 soporte JSON tool calls y actualizar por id
aee1b83 simplificar a una ronda de tool calls
f924185 fix audit import y mas logs chat
31ad0d1 debug logs para function calling
...
147d94e bitacora admin unificado
fe2d4f9 admin unificado con 4 pestanas y cookie auth
```

---

## 7. Bugs corregidos

| Bug | Solución |
|-----|----------|
| `audit.js` importaba `createClient` que no existía | Cambiado a `getSupabaseAdmin()` |
| Tool calls de DeepSeek no se ejecutaban | Loop de function calling con soporte nativo + JSON |
| Regex de cierre `</tool_calls>` sin pipes | Corregido a `</tool_calls>` |
| `data/docentes.json` no existe → 500 | `readDocentes` devuelve array vacío si 404 |
| `GITHUB_BRANCH` no configurado → leía de `main` | Agregada variable en Preview |
| Vercel Authentication bloqueaba producción | Desactivado en Deployment Protection |
| Límite de 12 funciones Vercel | Unificado MercadoPago (2→1) |

---

## 8. Deploy a producción

**Fecha:** 2026-07-17  
**Commit:** `dd344f6`  
**URL:** https://deploy-phi-wheat.vercel.app

### Resultados

| Endpoint | Estado |
|----------|--------|
| Login | ✅ 204 |
| Reservas | ✅ 200 |
| Noticias | ✅ 200 |
| Docentes (público) | ✅ 200 |
| Chat IA | ✅ 200 |
| Push | ⚠️ 500 (faltan VAPID keys en Production) |
| MercadoPago | ⚠️ 500 (falta token en Production) |
| Escuela | ✅ 200 |
| Compañía | ✅ 200 |
| Admin | ✅ 200 |

### Pendientes para producción 100%

- Agregar `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` en Production para Push
- Agregar `MERCADOPAGO_ACCESS_TOKEN` real en Production
- Probar chat IA con escritura en producción (puede necesitar GITHUB_BRANCH=main)

