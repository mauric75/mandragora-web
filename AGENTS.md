# AGENTS.md — Mandrágora

Instrucciones para IAs y nuevas ventanas de ZCode que trabajen en este proyecto.

---

## ¿Qué es Mandrágora?

Casa de teatro, escuela de artes escénicas y compañía de producción en Montevideo, Uruguay.
Producción: https://deploy-phi-wheat.vercel.app

## Arquitectura

| Componente | Tecnología | Detalle |
|-----------|-----------|--------|
| Hosting | Vercel (Hobby, 12 funciones máx.) | Proyecto `mauricio-s-projects1/deploy` |
| Dominio | `deploy-phi-wheat.vercel.app` | Futuro: `mandragora.uy` |
| Funciones | Node.js serverless en `api/` | Endpoints consolidados por límite de 12 |
| Base de datos | Supabase | Reservas (`reservas`) + Storage (`imagenes`) |
| Contenido | GitHub API | `mauric75/mandragora-web` rama `main`, archivos `data/*.json` |
| IA | DeepSeek (`deepseek-chat`) | 18 tools con function calling |
| Auth | Cookie HMAC | `mandragora_admin_session`, 3 roles (admin/editor/consulta) |
| Upload imágenes | Supabase Storage | Multipart via `/api/docentes` |

## Estructura del repo

```
deploy/                    ← este es EL repo (mauric75/mandragora-web)
├── api/
│   ├── docentes.js        ← endpoint consolidado: docentes + obras + upload
│   ├── agenda.js          ← CRUD de eventos
│   ├── ai-admin/
│   │   └── chat.js        ← Chat IA con DeepSeek + 18 herramientas
│   ├── lib/
│   │   ├── admin-auth.js  ← autenticación HMAC + roles
│   │   └── ...
│   └── ...
├── data/
│   ├── docentes.json      ← datos de docentes (fuente: GitHub API)
│   ├── obras.json
│   ├── agenda.json
│   └── noticias.json
├── assets/images/         ← imágenes estáticas (se sirven directo)
├── admin.html             ← panel de administración (6 pestañas + Chat IA)
├── escuela.html           ← página pública de la escuela
├── compania.html          ← página pública de la compañía
├── index.html             ← landing
└── docs/                  ← bitácoras, planes, diagnósticos
```

⚠️ **Importante:** `C:\Users\HP\Documents\Mandragora\deploy` tiene su propio `.git`. El repo padre (`C:\Users\HP\Documents`) es `radar-legislativo` — NO tocar.

## Seguridad (LEER ANTES DE TOCAR NADA)

- **NUNCA commits secrets.** `GITHUB_TOKEN`, `DEEPSEEK_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` viven SOLO en Vercel env vars.
- **NUNCA exponer** `C:\Users\HP\Documents\codex-bridge\.env` (contiene API keys reales).
- El archivo `.env.local` en `deploy/` se genera con `vercel env pull` y está en `.gitignore`.
- Las contraseñas de admin están en variables de Vercel encriptadas.

## Reglas de trabajo

1. **NUNCA tocar `main` directamente.** Crear rama `feature/*`, probar, luego mergear.
2. **Siempre pasar el enlace** después de cualquier cambio ("siempre que hagas algo pasame el enlace").
3. **Verificar deploys.** `vercel --prod` solo desde `main`. `vercel` a secas para previews.
4. **Documentar todo** en `deploy/docs/` (bitácoras MD).
5. **No desactivar la protección de deploy de Vercel.**
6. **Producción es `deploy-phi-wheat.vercel.app`** — no confundir con previews.

## Comandos útiles

```bash
# Deploy preview (desde cualquier rama)
cd C:/Users/HP/Documents/Mandragora/deploy
npx vercel

# Deploy producción (SOLO desde main)
npx vercel --prod

# Ver variables de entorno
npx vercel env ls

# Pull env vars a .env.local
npx vercel env pull
```

## Paleta de colores oficial

| Color | Variable CSS | Hex |
|-------|-------------|-----|
| Azul | `--c-blue` | `#1D3D91` |
| Dorado | `--c-gold` | `#CE9A47` |
| Dorado brillante | `--c-gold-bright` | `#D4A84B` |
| Verde | `--c-green` | `#8ABE28` |
| Fondo | `--c-bg` | `#FFFFFF` |
| Fondo suave | `--c-bg-soft` | `#f2f4f8` |
| Texto | `--c-ink` | `#000000` |

## API: endpoints principales

Todos los endpoints aceptan solo POST (excepto OPTIONS para CORS).

| Endpoint | Acciones | Auth |
|----------|---------|------|
| `/api/docentes` | `list`, `save`, `delete`, `upload` (multipart) | list=público, resto=admin |
| `/api/agenda` | `list`, `save`, `delete` | list=público |
| `/api/ai-admin/chat` | `message` + `history` (opcional) | admin |
| `/api/reservas` | consulta de Supabase | admin |
| `/api/noticias-save` | CRUD noticias | admin |

## Chat IA

- **Modelo:** DeepSeek (`deepseek-chat`)
- **Tools:** 18 (listar_reservas, crear_evento, actualizar_docente, listar_obras, etc.)
- **Memoria:** Soporta `history` array en el request body (últimos 20 mensajes)
- **Imágenes:** El chat acepta 📎, Ctrl+V y drag-drop. Sube a Supabase y pasa URL a la IA
- **System prompt:** Define rol, herramientas disponibles, formato de respuesta

## Limitaciones conocidas

1. **Vercel Hobby: 12 funciones máximo.** Los endpoints están consolidados (ej: `docentes.js` maneja docentes + obras + upload).
2. **Supabase plan gratuito:** se pausa tras 7 días de inactividad. Hay que resumirlo manualmente.
3. **Roles admin/editor/consulta:** implementados parcialmente (ver `docs/DIAGNOSTICO-ROLES.md`). En la práctica solo se usa admin.
4. **Merge bug en docentes.js:** ya arreglado (merge selectivo, no borra campos ausentes).

## Contacto

- **GitHub:** https://github.com/mauric75/mandragora-web
- **Vercel:** https://vercel.com/mauricio-s-projects1/deploy
- **Supabase:** proyecto `mandragora` (ID: `qreponqhjjqfzsqjweza`)
