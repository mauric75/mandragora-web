# Bitácora — 2 de agosto 2026

## Cambios realizados

### 1. Fix merge bug en API (`api/docentes.js`)
- **Problema:** Al actualizar un docente/obra sin incluir `foto` u otros campos, el spread `{ ...existente, ...payload }` los pisaba con `undefined`
- **Solución:** Merge selectivo que solo actualiza campos definidos en el payload (líneas 160 y 225)
- **Rama:** `feature/fix-api-merge` → main

### 2. Limpieza de docentes duplicados
- Eliminados 2 "Docente de Prueba" duplicados de `data/docentes.json`
- Consolidación de entradas duplicadas de Pablo Bentancur en una sola con trayectoria formateada

### 3. Chat IA — Upload de imágenes
- Botón 📎, Ctrl+V (pegar) y drag & drop en el chat del admin
- Upload a Supabase Storage vía `/api/docentes`, URL inyectada en el mensaje
- System prompt actualizado para que la IA use URLs de imagen
- **Rama:** `feature/ia-upload-imagenes` → main

### 4. Chat IA — Memoria de conversación
- Guarda últimos 20 mensajes (10 intercambios) como `history`
- Se envía al backend para que DeepSeek tenga contexto
- **Rama:** `feature/ia-memoria` → main

### 5. Formateo de saltos de línea en desplegables
- `escuela.html`: `\n\n` → párrafo nuevo, `\n` → `<br>` en trayectorias
- Aplica a todos los docentes con desplegable "+ Más info"

### 6. Interconexión obras ↔ elenco
- `compania.html`: cada obra tiene link "Ver elenco →" que baja a la sección Elenco
- `escuela.html`: cada docente tiene link "Ver en Compañía →" que va a `compania.html#elenco`

### 7. Menú principal rediseñado
- **Antes:** 10 items planos (Escuela, Sala, Compañía, Cine Viajero, Comunidad, Noticias, Galeria, Contacto, Agenda)
- **Ahora:** 7 items con dropdowns:
  - Escuela ▾ (Docentes, Talleres)
  - Sala ▾ (Cartelera, Alquiler)
  - Compañía ▾ (Elenco, Obras)
  - Nosotros ▾ (Historia, Comunidad, Cine Viajero, Contacto)
  - Agenda
  - Noticias
  - Galería
- Agregado "Nosotros" que no estaba en el menú

### 8. Hero actualizado
- Título: **Teatro Mandrágora**
- Eyebrow: DONDE LA MAGIA OCURRE
- Lede: Escuela de artes · Compañía · Sala

### 9. Transcripciones
- 5 audios de cliente (`cliente-reinion1` al `5`) transcritos con Vosk
- Guardados en `deploy/docs/cliente-reinionN.txt`
- Transcripción TurboScribe de reunión anterior en `landings/SkyElite-Private-Jets/mqeub0ss-lolo2.txt`

### 10. Cerebro (memoria persistente)
- API key configurada en `C:\Users\HP\.config\cerebro\config.json`
- URL: `https://www.mengxy.cc`
- Comandos `/memory` y `/recall` funcionando

### 11. Documentación
- `AGENTS.md`: instrucciones completas para IAs y nuevas ventanas
- `docs/DIAGNOSTICO-ROLES.md`: análisis de los 3 roles (admin/editor/consulta) con sugerencia de simplificación
- `docs/DIAGNOSTICO-ROLES.md`: diagnóstico del sistema de roles
- Esta bitácora

### 12. Diagnóstico de roles
- El sistema de 3 roles (admin/editor/consulta) existe en `admin-auth.js` pero el frontend no diferencia
- Documentado en `docs/DIAGNOSTICO-ROLES.md` con sugerencia de simplificar a un solo rol

## Archivos modificados
- `api/docentes.js` — merge selectivo
- `api/ai-admin/chat.js` — memoria, system prompt imágenes
- `admin.html` — upload imágenes, memoria chat
- `escuela.html` — formateo desplegables, link Compañía
- `compania.html` — link Ver elenco
- `index.html` — hero, menú dropdown
- `data/docentes.json` — limpieza duplicados, Pablo
- `*.html` (12 páginas) — menú dropdown
- `AGENTS.md` — creado
- `docs/DIAGNOSTICO-ROLES.md` — creado
- `docs/cliente-reinion1-5.txt` — transcripciones

## Producción
🔗 https://deploy-phi-wheat.vercel.app
