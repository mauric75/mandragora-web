# Mandrágora — Estado del proyecto (2026-07-18)

## Producción
- URL: https://deploy-phi-wheat.vercel.app
- Admin: https://deploy-phi-wheat.vercel.app/admin.html
- Rama: main
- Vercel Hobby (límite 12 funciones — estamos en 12)
- Pass admin: MandragoraAdmin2026!

## Arquitectura
- HTML estático + serverless functions en api/
- Datos: data/*.json vía GitHub API (mauric75/mandragora-web)
- Supabase para reservas (qreponqhjjqfzsqjweza)
- DeepSeek para chat IA (deepseek-chat)
- GITHUB_BRANCH=main en Production

## Admin unificado (6 pestañas)
1. Reservas — tabla con filtros, badges de estado
2. Noticias — CRUD (título, texto, tipo, link, imagen, publicada)
3. Docentes — CRUD (nombre, rol, foto, frase, trayectoria, instagram, whatsapp, precio)
4. Agenda — CRUD (título, fecha, tipo, categoría, descripción, link, botón)
5. Push — envío de notificaciones
6. Chat IA — 14 herramientas

## Chat IA — 14 herramientas
- Reservas: listar_reservas, resumir_reservas
- Docentes: listar_docentes, crear_docente, actualizar_docente
- Agenda: listar_eventos, crear_evento, actualizar_evento, borrar_evento, proximo_evento
- Noticias: listar_noticias, crear_noticia, actualizar_noticia, borrar_noticia
- Cruces: cruzar_evento_reservas
- Textos: sugerencia para redes (via system prompt, sin tool)

## Auth
- Cookie HMAC (mandragora_admin_session, 30 min)
- 3 roles: admin (todo), editor (no borra), consulta (solo lectura)
- Rate limiting: 10 req/min
- CORS acotado a deploy-phi-wheat.vercel.app y *-mauricio-s-projects1.vercel.app
- Auditoría en Supabase admin_logs

## Lecciones aprendidas
- GITHUB_BRANCH se corrompe con printf → usar Vercel API o UI
- Tool calls de DeepSeek necesitan 2 rondas (listar → actualizar)
- No usar "¡Listo!" como fallback (engañoso)
- El chat no tiene memoria entre mensajes (sin historial)
- Crear noticias/eventos desde terminal corrompe acentos → usar Unicode escapes
- Siempre trabajar en rama de prueba, mergear a main solo cuando está probado

## Pendientes
- Botones de estado en reservas (pendiente → contactada → confirmada → cancelada)
- UI con restricciones por rol
- Schema.org SEO
- Reels en menú
- Migrar a hosting con dominio mandragora.uy
- MercadoPago con token real
