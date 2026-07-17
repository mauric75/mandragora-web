# Fixes de seguridad — Chat IA

**Commit:** `c9d159eb` (main)  
**Autor:** Claude  
**Fecha:** 2026-07-17

---

## 1. CORS acotado

**Archivo:** `api/ai-admin/chat.js`

**Problema:**  
```javascript
res.setHeader('Access-Control-Allow-Origin', req.headers?.origin || '');
res.setHeader('Access-Control-Allow-Credentials', 'true');
```
Reflejaba cualquier origen y aceptaba cookies de sesión. Combinado con el endpoint `listar_reservas` (que devuelve nombre, WhatsApp, email de clientes reales), un sitio malicioso podía teóricamente hacer que un admin logueado filtrara datos sensibles sin saberlo.

**Solución:**  
Origen fijado a dominios conocidos de Vercel (`deploy-phi-wheat.vercel.app` y `*-mauricio-s-projects1.vercel.app`). Cualquier otro origen no recibe el header CORS y el navegador bloquea el acceso.

---

## 2. Rate limiting

**Archivo:** `api/ai-admin/chat.js`

**Problema:**  
Sin límite de requests. Una sesión válida podía llamar al chat en loop, gastando créditos de DeepSeek y spameando creación/edición de docentes vía IA.

**Solución:**  
Mismo `checkRateLimit` de `api/lib/rate-limit.js` que ya usaba `admin-auth.js` — 10 pedidos por minuto por IP. Devuelve 429 si se excede.

---

## 3. Logs de debug eliminados

**Archivo:** `api/ai-admin/chat.js`

**Problema:**  
`console.error('[CHAT] content:', ...)` y similares imprimían mensajes de usuario y respuestas de la IA en logs de Vercel, con potencial exposición de datos de conversación y reservas.

**Solución:**  
Eliminados todos los `console.error` con contenido de conversación. Solo quedan logs de error reales.
