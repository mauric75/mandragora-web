# Mandrágora — Estado del proyecto (2026-07-18)

## Producción
- URL: https://deploy-phi-wheat.vercel.app
- Admin: https://deploy-phi-wheat.vercel.app/admin.html
- Rama: main
- Vercel Hobby (límite 12 funciones — estamos en 11/12 justo)
- Pass admin: <ver en Vercel — Settings → Environment Variables → ADMIN_PASSWORD>
- **IMPORTANTE:** si esta doc mostraba antes la contraseña real, esa contraseña ya estuvo pública en un repo público y debe considerarse comprometida — rotarla.

## Arquitectura
- HTML estático + serverless functions en api/
- Datos: data/*.json vía GitHub API (mauric75/mandragora-web)
- Supabase: reservas (tabla) + Storage (imágenes, bucket "imagenes")
- DeepSeek para chat IA (deepseek-chat)
- GITHUB_BRANCH=main en Production

## Admin unificado (6 pestañas + nav/footer del sitio)
1. Reservas — tabla con filtros, badges de estado por color
2. Noticias — CRUD (título, texto, tipo, link, imagen, publicada) + upload de imagen
3. Docentes — CRUD (nombre, rol, foto, frase, trayectoria, instagram, whatsapp, precio) + upload de foto
4. Agenda — CRUD (título, fecha, tipo, categoría, descripción, link, botón)
5. Push — envío de notificaciones
6. Chat IA — 14 herramientas (consulta y modifica datos reales)
- Tema oscuro, menú y footer estándar del sitio
- Upload de imágenes a Supabase Storage con preview

## Chat IA — 14 herramientas
- Reservas: listar_reservas, resumir_reservas
- Docentes: listar_docentes, crear_docente, actualizar_docente
- Agenda: listar_eventos, crear_evento, actualizar_evento, borrar_evento, proximo_evento
- Noticias: listar_noticias, crear_noticia, actualizar_noticia, borrar_noticia
- Cruces: cruzar_evento_reservas
- Textos: sugerencia para redes (via system prompt, sin tool)

## Páginas públicas dinámicas
- escuela.html → carga docentes desde /api/docentes
- compania.html → carga elenco desde /api/docentes
- reservar.html → carga opciones de docente desde /api/docentes
- agenda.html → carga eventos desde /api/agenda (agrupados por mes)
- noticias.html → carga desde data/noticias.json (estático, requiere deploy)

## Auth
- Cookie HMAC (mandragora_admin_session, 30 min)
- 3 roles: admin (todo), editor (no borra), consulta (solo lectura)
- Rate limiting: 10 req/min en login y chat
- CORS acotado a deploy-phi-wheat.vercel.app y *-mauricio-s-projects1.vercel.app
- Auditoría en Supabase admin_logs

## Funciones Vercel (11/12)
1. admin-auth.js
2. ai-admin/chat.js
3. agenda.js
4. docentes.js (incluye upload de imágenes)
5. mercadopago.js (unificado: preferencia + suscripción)
6. noticias-save.js
7. push.js (unificado: subscribe + send)
8. reservas.js
+ lib/ (admin-auth, audit, rate-limit, supabase) — 3 funciones

## Lecciones aprendidas
- GITHUB_BRANCH se corrompe con printf → usar Vercel API o UI
- Tool calls de DeepSeek necesitan 2 rondas (listar → actualizar)
- No usar "¡Listo!" como fallback (engañoso)
- El chat no tiene memoria entre mensajes (sin historial)
- Crear noticias/eventos desde terminal corrompe acentos → usar Unicode escapes
- Funciones dentro de IIFE no son accesibles desde onchange inline → usar window.fn
- No poner headers manuales con FormData (rompe el Content-Type multipart)
- Siempre trabajar en rama de prueba, mergear a main solo cuando está probado

## Pendientes
- Botones de estado en reservas (pendiente → contactada → confirmada → cancelada)
- UI con restricciones por rol (esconder botón borrar para no-admin)
- Schema.org SEO
- Reels en menú
- Migrar a hosting con dominio mandragora.uy
- MercadoPago con token real
- Chat IA con memoria de conversación
