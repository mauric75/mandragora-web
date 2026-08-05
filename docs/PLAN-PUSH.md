# Diagnóstico y Plan: Notificaciones Push

> Fecha: 2026-08-04
> Rama: main

---

## Estado actual: ~80% implementado

El sistema push tiene la arquitectura correcta pero varios bugs y omisiones impiden que funcione completamente.

---

## ✅ Lo que SÍ funciona

| Componente | Archivo | Estado |
|---|---|---|
| API serverless (subscribe + send) | `api/push.js` | ✅ Funcional |
| Suscripción cliente (botón campanita) | `assets/js/push.js` | ✅ Cargado en 11 páginas |
| Service Worker (push + notificationclick) | `sw.js` | ✅ Funcional |
| Tab "Push" en admin unificado | `admin.html` (línea 1235) | ✅ Usa endpoint correcto |
| Tabla en Supabase | `mandragora_push_subscriptions` | ✅ Existe (creada manualmente) |
| Dependencia `web-push` | `package.json` | ✅ v3.6.7 instalada |
| Claves VAPID | Env vars + push.js | ✅ Configuradas |

---

## 🔴 Fase 1 — Bugs críticos (rompen funcionalidad)

### 1.1 Endpoint `/api/push-send` NO existe

El endpoint fue consolidado dentro de `/api/push` (que usa `action: 'send'`), pero **3 archivos nunca se actualizaron**:

| Archivo | Línea | Qué rompe |
|---|---|---|
| `admin.html` | 881 | Auto-push desde Noticias al marcar "Avisar por push" |
| `noticias-admin.html` | 237 | Mismo bug en admin standalone de noticias |
| `push-admin.html` | 88 | Toda la página standalone de envío push |

**Fix:** Cambiar las 3 llamadas de:
```js
api('/api/push-send', { body: JSON.stringify({ title, body, url }) })
```
a:
```js
api('/api/push', { body: JSON.stringify({ action: 'send', title, body, url }) })
```

### 1.2 Falta migración SQL

La tabla `mandragora_push_subscriptions` no tiene archivo de migración en `supabase/migrations/`. Si se recrea la BD, no se puede regenerar.

**Fix:** Crear `supabase/migrations/20260804_create_push_subscriptions.sql`:
```sql
CREATE TABLE IF NOT EXISTS mandragora_push_subscriptions (
  id SERIAL PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🟡 Fase 2 — Configuración y despliegue

### 2.1 Variables VAPID no documentadas

`.env.example` solo contiene `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET`. Faltan:
```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:info@mandragora.uy
```

### 2.2 Clave pública VAPID hardcodeada

`assets/js/push.js:3` tiene la clave pública en duro:
```js
var VAPID_PUBLIC_KEY = 'BGzBEECV_PlkO2WBn8ix-_4EzUNLm5hbRIeua55CJ0biqjHqijCL0I4jbTLH1sfCbjh-KrW9vjzbb6vO8Wp6DNo';
```
Debería obtenerse dinámicamente del servidor (nuevo endpoint `api/push-key.js` o vía `<meta>` tag).

---

## 🟡 Fase 3 — Mejoras de seguridad y UX

### 3.1 Rate limiting en endpoint push

`PENDIENTES-SEGURIDAD.md` lo menciona como pendiente. El módulo `api/lib/rate-limit.js` ya existe pero no se usa en `api/push.js`.

### 3.2 Auto-push "fire-and-forget"

El envío push desde Noticias no espera respuesta ni muestra feedback al admin si falla.

### 3.3 Sin contador de suscriptores

El admin no muestra cuántos suscriptores hay. Se podría agregar un endpoint `GET /api/push?action=stats` y mostrarlo en la pestaña Push.

### 3.4 Sin botón de unsubscribe

El usuario no puede darse de baja desde la UI. Solo puede hacerlo desde configuración del navegador o cuando la suscripción expira (limpieza automática por 404/410).

---

## 🔵 Fase 4 — Limpieza

### 4.1 `push-admin.html` redundante

Es un standalone que duplica la funcionalidad de la pestaña Push en `admin.html`. Usa auth por password en vez de cookie de sesión. Evaluar si eliminarlo.

### 4.2 CORS abierto

`api/push.js:10` usa `Access-Control-Allow-Origin: *`. Restringir a los dominios reales de Mandrágora.

---

## Arquitectura actual

```
[Usuario visita página]
  └─ push.js: botón campanita flotante (11 páginas)
       └─ Notification.requestPermission()
            └─ PushManager.subscribe(VAPID)
                 └─ POST /api/push { action: 'subscribe', subscription }
                      └─ Supabase: upsert mandragora_push_subscriptions

[Admin envía notificación]
  └─ admin.html Push tab → POST /api/push { action: 'send', title, body, url }
  └─ admin.html Noticias → POST /api/push-send ❌ ROTO
  └─ noticias-admin.html  → POST /api/push-send ❌ ROTO
  └─ push-admin.html      → POST /api/push-send ❌ ROTO
       └─ web-push library (VAPID)
            └─ Browser Push Service → sw.js: push event → showNotification()
                 └─ notificationclick → abrir/enfocar URL
```

---

## Archivos del sistema push

```
deploy/
├── api/
│   └── push.js                    # Serverless function (subscribe + send)
├── assets/js/
│   └── push.js                    # Cliente: botón + suscripción
├── sw.js                          # Service Worker (push, notificationclick)
├── admin.html                     # Admin unificado (Push tab ✅, Noticias auto-push ❌)
├── noticias-admin.html            # Admin standalone noticias (auto-push ❌)
├── push-admin.html                # Admin standalone push (envío ❌)
├── package.json                   # web-push ^3.6.7
├── .env.example                   # Sin vars VAPID
├── PENDIENTES-SEGURIDAD.md        # Rate limiting + PUSH_ADMIN_SECRET pendientes
├── supabase/migrations/           # Sin migración para push_subscriptions
├── docs/
│   └── PLAN-PUSH.md               # Este archivo
└── CONTEXT.md                     # Documentación completa (sección 9.3, 13.5)
```
