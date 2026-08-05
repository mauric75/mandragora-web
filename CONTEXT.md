# Mandrágora — Contexto Completo del Proyecto

> **Última actualización:** 2026-08-04
> **Documento generado para:** referencia de desarrollo, onboarding, y contexto de IA

---

## 1. Visión General

**Mandrágora** es un centro cultural en Montevideo, Uruguay que integra:

- 🎭 **Teatro** — Sala tipo "caja negra" con capacidad para 500 personas, equipamiento profesional de sonido, iluminación, proyección HD y conectividad
- 🎓 **Escuela de Artes** — Talleres de actuación, clown, voz, dramaturgia, murga, tango, acrobacia aérea, danza, canto y guitarra
- 🎪 **Compañía Teatral** — Producciones originales uruguayas (nominadas a los Premios Florencio), modelo cooperativo
- 🎬 **Cine Viajero** — Festival de cine itinerante anual
- 🏘️ **Comunidad** — Espacio para eventos, talleres, convenios institucionales (SUNCA, FUCVAM, Atrapasueños)

### URLs

| Entorno | URL |
|---------|-----|
| **Producción (Vercel)** | `https://deploy-phi-wheat.vercel.app` |
| **GitHub Pages** | `https://mauric75.github.io/mandragora-web/` |
| **Repositorio** | `https://github.com/mauric75/mandragora-web` |
| **Local** | `C:\Users\HP\Documents\Mandragora\deploy\` |

### Contacto

- **Dirección:** Javier Barrios Amorín 1312, Montevideo
- **Teléfono:** 097 052 948
- **WhatsApp:** +598 97 052 948
- **Email:** info@mandragora.uy
- **Instagram:** @teatromandragora_uy
- **Facebook:** mandragoracasacultural

---

## 2. Stack Técnico

| Capa | Tecnología | Detalles |
|------|-----------|----------|
| **Frontend** | HTML/CSS/JS vanilla | Sin framework, sin build step, sin TypeScript. CSS y JS inline en cada `.html` |
| **Hosting** | Vercel (Hobby plan) | Auto-deploy desde `main` en GitHub. Límite: 12 serverless functions |
| **Backend** | Vercel Serverless Functions (Node.js) | 8 endpoints en `api/`, sin middleware, sin rutas Next.js |
| **Base de datos** | Supabase PostgreSQL | Proyecto `qreponqhjjqfzsqjweza`. Free tier (pausa tras 7 días de inactividad) |
| **Storage** | Supabase Storage | Bucket `imagenes` para uploads (fotos de docentes, imágenes de noticias) |
| **CMS** | GitHub API | Contenido (docentes, obras, agenda, noticias) almacenado como JSON en `data/` del repo |
| **Pagos** | MercadoPago | Pago único (`/checkout/preferences`) + Suscripción (`/preapproval`). Moneda: UYU |
| **IA** | DeepSeek (`deepseek-chat`) | 19 function-calling tools para automatización del panel admin |
| **Push** | Web Push API + `web-push` | VAPID keys. Service Worker maneja eventos `push` y `notificationclick` |
| **PWA** | Service Worker (`sw.js`) | Network-first para HTML, stale-while-revalidate para assets. 11 páginas pre-cacheadas |
| **Fuentes** | Schrifted Round (local) + Google Fonts | Cormorant Garamond (display), Cinzel (marcas), Jost (cuerpo) |
| **Dependencias npm** | `@supabase/supabase-js` ^2.45.0, `web-push` ^3.6.7 | Solo 2 dependencias |
| **Package manager** | npm | `package.json` en `deploy/` |

---

## 3. Estructura de Directorios

```
deploy/
├── index.html                  # Landing page (hero, 5 salas, agenda preview)
├── escuela.html                # Escuela de Artes (docentes, disciplinas, talleres)
├── sala.html                   # Sala & Eventos (equipamiento, specs, alquiler)
├── compania.html               # Compañía Teatral (obras, elenco, manifiesto)
├── cine-viajero.html           # Cine Viajero (festival itinerante)
├── agenda.html                 # Cartelera / Calendario de eventos
├── comunidad.html              # Comunidad + valores
├── contacto.html               # Contacto (tel, email, dirección, mapa)
├── reservar.html               # Sistema de reservas (wizard multi-paso + calendario)
├── pagar.html                  # Checkout MercadoPago (pago único + suscripción)
├── noticias.html               # Página pública de noticias
├── galeria.html                # Galería de fotos (masonry + lightbox)
├── convenios.html              # Alianzas institucionales
├── convenio-sunca.html         # Detalle convenio SUNCA
├── atrapasuenos.html           # Detalle alianza Atrapasueños Recreación
├── nosotros.html               # Sobre Nosotros (historia, timeline, filosofía)
├── reels.html                  # Reels/Instagram v1 (8 cards)
├── reels-v2.html               # Reels/Instagram v2 (contenido alternativo)
├── admin.html                  # Panel de administración (login + 7 tabs)
├── noticias-admin.html         # Admin de noticias standalone (Bearer token)
├── push-admin.html             # Envío de notificaciones push standalone
├── 404.html                    # Página 404 personalizada
├── exito.html                  # Post-pago exitoso
├── error.html                  # Post-pago fallido
├── sw.js                       # Service Worker (PWA + push)
├── manifest.json               # PWA manifest
├── robots.txt                  # SEO
├── sitemap.xml                 # Sitemap
├── netlify.toml                # Config Netlify (legacy)
├── package.json                # Dependencias Node
├── .env.example                # Template de variables de entorno
├── .env.local                  # Variables de entorno locales
├── .env.vercel                 # Variables exportadas a Vercel
│
├── api/
│   ├── admin-auth.js           # Login/logout/sesión (HMAC cookies)
│   ├── reservas.js             # CRUD reservas (Supabase)
│   ├── agenda.js               # CRUD eventos (GitHub API)
│   ├── docentes.js             # CRUD docentes + obras + upload imágenes (GitHub API + Supabase Storage)
│   ├── noticias-save.js        # CRUD noticias (GitHub API, session o Bearer)
│   ├── mercadopago.js          # MercadoPago (preferencia + suscripción)
│   ├── push.js                 # Push notifications (subscribe + send)
│   ├── ai-admin/
│   │   └── chat.js             # Chat IA con DeepSeek + 19 tools
│   └── lib/
│       ├── admin-auth.js       # HMAC-SHA256, 3 roles, timing-safe comparison
│       ├── supabase.js         # Cliente Supabase admin (service role)
│       ├── audit.js            # Logging a tabla admin_logs
│       └── rate-limit.js       # Rate limiter en memoria (10 req/min)
│
├── data/
│   ├── agenda.json             # Eventos (5 eventos actualmente)
│   ├── docentes.json           # Docentes (15 docentes)
│   ├── noticias.json           # Noticias (5 artículos)
│   └── obras.json              # Obras teatrales (4 obras)
│
├── assets/
│   ├── brand-logos/            # Logos (blanco, negro, iso, favicon)
│   ├── fonts/                  # Schrifted Round (Regular, Medium, Bold)
│   ├── images/                 # Fotos del sitio (docentes, elenco, teatro, obras, reels)
│   ├── js/
│   │   └── push.js             # Cliente push (botón de campanita flotante)
│   └── videos/                 # Videos (reel-presentacion.mp4, etc.)
│
├── supabase/
│   └── migrations/
│       ├── 20260715230300_create_reservas.sql
│       ├── 20260716_create_admin_logs.sql
│       └── 20260718_create_imagenes_bucket.sql
│
└── docs/                       # Documentación (bitácoras, diagnósticos, transcripciones)
```

---

## 4. Sistema de Diseño

### 4.1 CSS Custom Properties

#### Tema Claro (default)

| Token | Valor | Rol |
|-------|-------|-----|
| `--c-bg` | `#FFFFFF` (index) / `#f8f4ed` (internas) | Fondo de página |
| `--c-bg-soft` | `#f2f4f8` (index) / `#f0ebe0` (internas) | Fondo de cards/secciones |
| `--c-blue` | `#1D3D91` | Acento azul (badges de noticias) |
| `--c-green` | `#8ABE28` | Acento verde |
| `--c-gold` | `#CE9A47` | Acento principal, botones, destacados |
| `--c-gold-bright` | `#D4A84B` | Hover de botones |
| `--c-gold-dim` | `rgba(206,154,71,0.25)` | Bordes dorados sutiles |
| `--c-gold-faint` | `rgba(206,154,71,0.10)` | Fondos dorados muy sutiles |
| `--c-cream` | `#1a1512` (index) / `#000` (internas) | Texto principal |
| `--c-cream-dim` | `rgba(26,21,18,0.65)` | Texto secundario |
| `--c-cream-faint` | `rgba(26,21,18,0.18)` | Texto terciario |
| `--c-border` | `rgba(26,21,18,0.07)` | Líneas divisorias |

#### Tema Oscuro (`[data-theme="dark"]`)

| Token | Valor |
|-------|-------|
| `--c-bg` | `#0a0e1a` |
| `--c-bg-soft` | `#111624` |
| `--c-cream` | `#FFFFFF` |
| `--c-cream-dim` | `rgba(243,236,224,0.65)` |
| `--c-cream-faint` | `rgba(243,236,224,0.22)` |
| `--c-border` | `rgba(243,236,224,0.07)` |

> **Nota:** Los tokens dorados permanecen igual en ambos temas. Existe una ligera inconsistencia: `index.html` usa `#FFFFFF`/`#f2f4f8` y las páginas internas usan `#f8f4ed`/`#f0ebe0`.

#### Layout

| Token | Valor |
|-------|-------|
| `--gutter` | `clamp(1.5rem, 5vw, 5rem)` |
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)` |

### 4.2 Tipografías

| Token | Font Stack | Rol |
|-------|-----------|-----|
| `--f-display` | `'Cormorant Garamond', Georgia, 'Times New Roman', serif` | Títulos, texto decorativo |
| `--f-mark` | `'Schrifted', 'Cinzel', Georgia, serif` | Kickers, labels, navegación |
| `--f-body` | `'Schrifted', 'Jost', system-ui, sans-serif` | Cuerpo, botones |

**Schrifted** se carga localmente desde `assets/fonts/SFTSchriftedRoundTRIAL-{Regular,Medium,Bold}.ttf`.

### 4.3 Componentes CSS Compartidos

| Clase | Descripción |
|-------|-------------|
| `.grain` | Overlay de ruido SVG full-screen (opacidad 0.04-0.05, `mix-blend-mode: multiply/overlay`) |
| `.btn`, `.btn--gold`, `.btn--ghost` | Sistema de botones (fill dorado o outline ghost) |
| `.site-nav` | Barra de navegación fija superior. `.is-scrolled` añade blur backdrop |
| `.theme-toggle` | Botón circular 34px para toggle dark/light |
| `.hamburger` / `.mobile-menu` | Menú hamburguesa móvil (visible < 881px) |
| `.site-footer` | Footer con logo, redes sociales, links, copyright, link admin |
| `.back-to-top` | Botón fijo abajo-derecha (visible tras 400px scroll) |
| `.whatsapp-float` | Botón flotante verde (#25D366) de WhatsApp, abajo-izquierda |
| `.lightbox` | Overlay full-screen para imágenes |
| `.reveal` / `.is-visible` | Animación fade-up al hacer scroll (IntersectionObserver) |
| `.page-header` / `.page-header__kicker` / `.page-header__ornament` | Header de página con arabesco opcional |
| `.section-hero` | Imagen full-width con gradiente inferior |
| `.nav-item` / `.nav-item__trigger` / `.nav-item__dropdown` | Dropdowns de navegación (hover/focus) |

### 4.4 Animaciones Clave

| Animación | Descripción |
|-----------|-------------|
| `fade-in` | Entrada del body |
| `kenburns` | Pan lento en foto del hero |
| `float` | Bob vertical sutil en escena hero |
| `door-pulse` | Pulso de luz dorada |
| `drift-a/b/c` | Capas de humo flotando |
| `cue-line` | Indicador de scroll |
| `rise-in` | Entrada escalonada de texto hero |
| `rise` | Partículas doradas subiendo |
| `curtain` | Easter egg: triple-click en logo → cierre/apertura de telón (2s) |

---

## 5. Páginas Públicas

### 5.1 `index.html` — Landing Page (58 KB)

**Secciones:**
1. **Nav** — Fixed top, logo dual (claro/oscuro), 5 dropdowns + 3 links directos
2. **Hero** — Full viewport (100vh, min 640px): título, subtítulo, 3 CTAs (Reservar, Agenda, Sala), foto con gradiente, glow dorado, 3 capas de humo, 10 partículas doradas, viñeta
3. **Cartelera** — Card tipo papel rotado, cargada desde `data/noticias.json` (última noticia publicada)
4. **Threshold** — Transición 22vh con luz radial dorada: "Atraviesas la puerta."
5. **Inside Intro** — Texto centrado con arabesco: "Lo que vive dentro de Mandrágora"
6. **5 Salas (Rooms)** — Grid 2-columnas alternado: Escuela, Sala, Compañía, Cine Viajero, Comunidad
7. **Ubicación** — Dirección + teléfono + link Google Maps
8. **La Casa** — Foto de fachada + texto descriptivo
9. **Agenda Preview** — 3 cards estáticos hardcodeados
10. **Footer** — Logo, redes (Instagram, Facebook, YouTube), links, copyright

**JavaScript:**
- Theme toggle (`localStorage 'mandragora-theme'`)
- Hamburger menu
- Scroll effects: nav blur (50px), back-to-top (400px), parallax hero (Y 3%, scale 0.005%/px)
- IntersectionObserver (threshold 0.18) para `.reveal`, `.threshold`, `.inside-intro`, `[data-room]`, `.agenda-card`
- Lazy image blur-up (`img[loading="lazy"]` → blur 8px → `.loaded` remove blur)
- Lightbox
- Easter egg: triple-click logo → curtain call
- Cookie banner (`localStorage 'cookies-ok'`)
- PWA registration (`/sw.js`)
- **Data fetch:** `data/noticias.json?t={timestamp}` para cartelera

### 5.2 `escuela.html` — Escuela de Artes (36 KB)

**Secciones:** Nav, Section Hero, Page Header, Intro Block, Disciplinas (6 cards: Actuación, Clown, Match de Impro, Acrobacia Aérea, Danza, Canto y Guitarra), **Docentes** (grid dinámico desde API), Video card, CTA Block ("Querés formarte con nosotros?"), Footer

**API calls:** `POST /api/docentes {action:'list'}` — filtra `activo !== false`

**Teacher card:** Foto circular 120px con borde dorado, nombre, rol, frase, toggle "+ Más info" (trayectoria, Instagram, WhatsApp)

### 5.3 `sala.html` — Sala & Eventos (34 KB)

**Secciones:** Nav, Section Hero, Page Header, Gallery (3 fotos), Intro Block, Tech Specs (6 cards: Proyección HD, Sonido, Micrófonos, Iluminación, Conectividad UTP blindado, Espacio 500 personas), Usos (6 tipos de eventos), Why Us (4 diferenciales), Video card, CTA Block ("Querés reservar la sala?"), Footer

**Sin API calls** — contenido estático.

### 5.4 `compania.html` — Compañía Teatral (34 KB)

**Secciones:** Nav, Page Header, Section Hero, Intro Block (modelo cooperativo, nominaciones Florencio), **Obras** (grid desde `data/obras.json`), **Elenco** (grid desde `/api/docentes`), Manifiesto, Footer

**API calls:** `GET data/obras.json`, `POST /api/docentes {action:'list'}`

**Obra card:** Imagen, tag estado ("En cartel"/"Próximamente"/"Histórica"), título, descripción, toggle info (sinopsis, elenco, dirección), fecha_texto

### 5.5 `cine-viajero.html` — Cine Viajero (26 KB)

Página informativa sobre el festival de cine itinerante anual. Contenido estático.

### 5.6 `agenda.html` — Cartelera (27 KB)

**API calls:** `POST /api/agenda {action:'list'}` — filtra `publicado !== false`, ordena por fecha ascendente, agrupa por mes

**Event card:** Columna fecha (día grande + nombre día), columna info (título, tipo/categoría, descripción), columna acción (botón a `link_tickets`). Fondos alternados por mes.

### 5.7 `comunidad.html` — Comunidad (24 KB)

Página estática: descripción de autogestión, 3 valores (Compromiso social, Profesionalismo, Encuentro), CTA.

### 5.8 `contacto.html` — Contacto (23 KB)

Grid 2-columnas: Teléfono, Email, Dirección + Google Maps embed (iframe), Redes sociales.

### 5.9 `reservar.html` — Sistema de Reservas (33 KB)

**Wizard multi-paso:**
1. **Paso 1: Tipo de servicio** — Sala/Evento, Inscripción a taller, Entrada a función ($400), Otra consulta
2. **Paso 1.5a: Subtipo sala** — Teatro ($5.000), Congreso ($8.000), Corporativo ($10.000), Otro (a convenir)
3. **Paso 1.5b: Taller** — Docentes cargados dinámicamente desde `/api/docentes`, cada uno con nombre, rol, precio. Fallback: "Consultar por otro taller"
4. **Paso 2: Calendario** — Navegación mes a mes, días pasados deshabilitados, selección visual
5. **Paso 3: Formulario** — Nombre, WhatsApp, Email (opcional), Mensaje (opcional)
6. **Paso 4: Éxito** — Checkmark, "Reserva enviada!", link a index

**Integración WhatsApp:** Al enviar, abre `wa.me/{número docente o fallback}` con mensaje formateado + simultáneamente POST a `/api/reservas`. Éxito se muestra siempre (incluso si API falla).

**API calls:** `POST /api/docentes {action:'list'}`, `POST /api/reservas`

### 5.10 `pagar.html` — Checkout (5 KB)

**Form:** Select con 5 opciones (Inscripción $2.500, Reserva sala $5.000, Entrada $400, Membresía mensual $500/mes, Donación $500) + Email + Botón "Pagar con MercadoPago"

**API calls:** `POST /api/mercadopago {action:'preferencia'|'suscripcion'}`. SDK MercadoPago cargado desde CDN. Pago único: Brick inline. Suscripción: redirect a `init_point`.

> ⚠️ **Usa test public key** `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 5.11 `noticias.html` — Noticias (24 KB)

**API calls:** `GET data/noticias.json` — filtra `publicada === true`, ordena por fecha descendente

**Card:** Imagen (16:7 primera, 200px siguientes), badge (anuncio azul / prensa verde), fecha, título, texto (300 chars + toggle expandir), link externo opcional

### 5.12 `galeria.html` — Galería (25 KB)

**API calls:** `GET data/obras.json` — agrupa por estado (presente/futura/pasada), renderiza masonry con imágenes de cada obra + 8 fotos estáticas de "La Casa"

**Lightbox mejorado:** Navegación prev/next con contador. Soporte teclado.

### 5.13-5.18 Otras Páginas

| Página | Tamaño | Contenido |
|--------|--------|-----------|
| `convenios.html` | 27 KB | Alianzas: SUNCA, Atrapasueños, Cine Viajero. CTA para organizaciones |
| `convenio-sunca.html` | 16 KB | Detalle SUNCA: 3 pilares, quote de Pablo Bentancur en Canal 5 |
| `atrapasuenos.html` | 24 KB | Detalle Atrapasueños Recreación, sección "coming soon" |
| `nosotros.html` | 16 KB | Historia (Ciudad Vieja → Cordón), timeline, YouTube embed, filosofía |
| `reels.html` | 14 KB | 8 cards de Instagram reels con filtros (Todos, Sala, Escuela, Compañía) |
| `reels-v2.html` | 14 KB | Misma estructura, contenido alternativo |

### 5.19 Mapa de Navegación

```
                          index.html (Landing)
                               |
         +----------+----------+----------+----------+
         |          |          |          |          |
    escuela    sala.html  compania   cine-      agenda.html
    .html                 .html      viajero    .html
         |          |          |          |          |
    [Docentes]  [Cartelera] [Elenco]   [Festival]  [Eventos]
         |          |          |          |
         +----+-----+----+-----+         galeria.html
              |          |                    |
         comunidad   noticias.html      [Fotos obras]
         .html            |
              |       [Artículos]
         contacto.html
              |
         reservar.html ──── pagar.html ──── exito.html / error.html
              |
         nosotros.html ──── convenios.html ──── convenio-sunca.html
                                 |            ──── atrapasuenos.html
                            reels.html / reels-v2.html
```

---

## 6. Panel de Administración (`admin.html`)

**Archivo:** `C:\Users\HP\Documents\Mandragora\deploy\admin.html` (1497 líneas)

### 6.1 Sistema de Login

- **UI:** Caja centrada con logo, input password, botón "Entrar", mensaje de error
- **Flujo:**
  1. `checkSession()` → `GET /api/admin-auth` (verifica cookie de sesión)
  2. `login()` → `POST /api/admin-auth?action=login` con `{password}`
  3. `logout()` → `POST /api/admin-auth?action=logout` → limpia cookie
- **Sesión:** Cookie `mandragora_admin_session`, HTTP-only, SameSite=Strict, 30 min expiry
- **3 roles:** `admin` (full CRUD + delete), `editor` (CRUD sin delete), `consulta` (solo lectura)
- **Rate limiting:** 10 intentos/min por IP en endpoint login
- **Sin CSRF:** Solo `credentials: 'same-origin'`

### 6.2 Stats Dashboard

4 cards de métricas:

| Métrica | Fuente |
|---------|--------|
| Reservas totales | `reservas.length` |
| Pendientes | `reservas.filter(r => r.estado === 'pendiente').length` |
| Noticias publicadas | `noticiasData.filter(n => n.publicada).length` |
| Docentes activos | `docentesData.filter(d => d.activo !== false).length` |

### 6.3 Tabs

| # | Tab | Icono | Funciones |
|---|-----|-------|-----------|
| 1 | **Reservas** | 📅 | Tabla con filtros (Todas, Sala, Talleres, Entradas, Consultas). Columnas: Fecha, Tipo, Detalle, Nombre, WhatsApp, Email, Mensaje, Estado. Badges de color por estado: pendiente (amarillo), contactada (azul), confirmada (verde), cancelada (rojo). **Solo lectura** — no hay UI para cambiar estado. |
| 2 | **Noticias** | 📄 | CRUD completo. 8 campos: título, texto, tipo (Anuncio/Prensa), link externo, imagen (URL o upload), publicada (checkbox), push al guardar. Cards con badges (Publicada/Borrador, Anuncio/Prensa). Auto-push si "Avisar por push" está checked. Soporta `?edit=<id>` en URL. |
| 3 | **Docentes** | 👥 | CRUD completo. 10 campos: nombre, rol, foto (URL o upload a Supabase Storage), frase, trayectoria, Instagram, WhatsApp, precio, activo. Cards con badge Activo/Inactivo y frase en itálica. |
| 4 | **Agenda** | 📅 | CRUD completo. 10 campos: título, fecha (YYYY-MM-DD), hora, tipo, categoría, descripción, link tickets, texto botón, publicado. Cards ordenadas por fecha con badge Publicado/Borrador. |
| 5 | **Obras** | 🖥️ | CRUD de obras teatrales. 7 campos: título, descripción, sinopsis, elenco, dirección, estado (presente/futura/pasada), fecha/temporada. **Sistema de imágenes:** staging (URL o upload → array pendientes → thumbnails con "Quitar"). Cards con badge de estado y contador de fotos. |
| 6 | **Push** | 🔔 | Interfaz de envío: título (60 chars), mensaje (200 chars), link opcional. Botón "Enviar a todos los suscriptos". Response: "Enviado a X de Y suscriptos." |
| 7 | **Chat IA** | 💬 | Chat con DeepSeek. Log 350px scrollable, input + botón enviar + adjuntar imagen. Soporta Ctrl+V pegar imágenes y drag & drop. Historial: últimos 20 mensajes. Formateo markdown-like (`**bold**`, `### heading`, `- list`). |

### 6.4 Funciones JavaScript del Admin

| Función | Línea | Propósito |
|---------|-------|-----------|
| `showLogin(msg)` | 621 | Muestra login, oculta dashboard |
| `checkSession()` | 628 | GET /api/admin-auth |
| `login()` | 635 | POST login |
| `logout()` | 654 | POST logout |
| `switchTab(name)` | 665 | Cambia tab activo, carga datos |
| `api(url, opts)` | 684 | Wrapper fetch (credentials, JSON parse) |
| `loadReservas()` | 699 | GET /api/reservas |
| `renderReservas(filter)` | 715 | Filtra cliente-side, renderiza tabla |
| `loadNoticias()` | 799 | POST /api/noticias-save list |
| `renderNoticias()` | 814 | Renderiza cards noticias |
| `loadDocentes()` | 901 | POST /api/docentes list |
| `renderDocentes()` | 911 | Renderiza cards docentes |
| `loadAgenda()` | 1006 | POST /api/agenda list |
| `renderAgenda()` | 1015 | Renderiza cards eventos |
| `loadObras()` | 1141 | POST /api/docentes resource:obra list |
| `renderObras()` | 1152 | Renderiza cards obras |
| `formatText(text)` | 1261 | Convierte markdown → HTML para chat |
| `addMsg(text, who)` | 1275 | Añade burbuja al chat |
| `doSend()` | 1310 | Envía mensaje al chat IA |
| `handleImageFile(file)` | 1337 | Upload de imagen en chat |
| `window._uploadFileCore(file, cb)` | 1383 | POST multipart a /api/docentes (compartido) |
| `window.uploadFile(input, textId, previewId)` | 1400 | Handler de input file con preview |

### 6.5 Bugs Conocidos

1. **Tab Obras duplicado:** Dos `id="tab-obras"` (líneas 516-545 y 547-576). El primero tiene upload de imágenes; el segundo tiene sinopsis/elenco/dirección. `getElementById` retorna el primero. Campos `obra-sinopsis`, `obra-elenco`, `obra-direccion` son null → error al editar/crear obras.
2. **LoadObras duplicado:** `switchTab()` llama `loadObras()` dos veces para tab 'obras' (línea 676).
3. **Reservas solo lectura:** No hay UI para cambiar estado (pendiente → contactada → confirmada → cancelada).
4. **Sin paginación:** Todos los datos se cargan de una vez. Problema de performance con muchos registros.
5. **Push desde noticias:** Usa endpoint `/api/push-send` (distinto a `/api/push`) sin verificar respuesta.
6. **Upload en chat:** Usa `/api/docentes` para subir imágenes del chat, semánticamente incorrecto pero funcional.
7. **`confirm()` nativo:** Para confirmar deletes, sin estilo y bloqueante.

---

## 7. API Endpoints

### 7.1 Resumen

| Endpoint | Métodos | Auth | Origen de Datos | Acciones |
|----------|---------|------|----------------|----------|
| `/api/admin-auth` | GET, POST | Login: password, GET: session | Cookie session | check, login, logout |
| `/api/reservas` | GET, POST | GET: admin, POST: público | Supabase `reservas` | create, list |
| `/api/agenda` | POST | list: público, save/delete: admin | GitHub `data/agenda.json` | list, save, delete |
| `/api/docentes` | POST | list: público, save/delete/upload: admin | GitHub `data/docentes.json` + `data/obras.json` + Supabase Storage | list, save (docente/obra), delete (docente/obra), upload |
| `/api/noticias-save` | POST | Session o Bearer token | GitHub `data/noticias.json` | list, save, delete |
| `/api/mercadopago` | POST | Público | MercadoPago API | preferencia, suscripcion |
| `/api/push` | POST | subscribe: público, send: admin | Supabase `push_subscriptions` + web-push | subscribe, send |
| `/api/ai-admin/chat` | POST | Session + rate-limit | DeepSeek API + GitHub JSON + Supabase | 19 tools vía LLM |

### 7.2 `/api/admin-auth` — Autenticación

**GET (Check Session):**
- Retorna `204 No Content` si sesión válida, `401 {error: 'Sin sesion'}` si no
- Si env vars no configuradas: `503 {error: 'No configurado'}`

**POST (Login):**
- Body: `{password: string}`
- Rate-limited por IP: 10 intentos/min
- Compara contra `ADMIN_PASSWORD`, `ADMIN_PASSWORD_EDITOR`, `ADMIN_PASSWORD_CONSULTA`
- Retorna `204 No Content` (éxito) o `401 {error: 'Credenciales incorrectas'}`
- Setea cookie `mandragora_admin_session={issuedAt}.{random16hex}.{role}.{HMAC}`

**POST ?action=logout:**
- Limpia cookie (Max-Age=0)
- Retorna `204 No Content`

### 7.3 `/api/reservas` — Reservas

**POST (crear — público):**
```json
// Request
{
  "servicio": "sala" | "taller" | "entrada" | "otro",
  "detalle": "string (max 120, opcional)",
  "fecha": "YYYY-MM-DD",
  "nombre": "string (min 2, max 120)",
  "whatsapp": "string (min 6 dígitos, max 30)",
  "email": "string (opcional, validación email)",
  "mensaje": "string (max 2000, opcional)"
}
// Response: 201 {ok: true, id: "uuid"}
```

**GET (listar — admin):**
- Requiere sesión válida
- Ordenado por `fecha DESC, creado DESC`
- Límite: 200 registros
- Response: `200 {data: [...]}`

### 7.4 `/api/agenda` — Eventos (GitHub API)

**Pattern GitHub API:**
```
GET /repos/mauric75/mandragora-web/contents/data/agenda.json?ref={branch}
Authorization: token {GITHUB_TOKEN}

PUT /repos/mauric75/mandragora-web/contents/data/agenda.json
Body: {message, content: base64, sha, branch}
```

**Acciones:**
- `list` (público): Lee archivo, retorna eventos
- `save` (admin/editor): Valida título (2-120 chars) y fecha (YYYY-MM-DD). Si tiene ID → update. Si no → crea con `id: 'evento-{timestamp}'`, `publicado: true`
- `delete` (solo admin): Filtra por ID, reescribe archivo

### 7.5 `/api/docentes` — Docentes + Obras (GitHub API + Supabase Storage)

**Recursos:**
- `resource: "docente"` (default) → `data/docentes.json`
- `resource: "obra"` → `data/obras.json`

**Docente fields:** `id`, `nombre` (2-80 chars), `rol` (min 2 chars), `foto` (URL), `frase` (max 200), `trayectoria` (max 300), `instagram`, `whatsapp`, `precio` (≥0), `activo` (boolean)

**Obra fields:** `id`, `titulo` (2-100 chars), `estado` (pasada|presente|futura), `descripcion` (max 500), `imagenes` (array), `sinopsis`, `elenco`, `direccion`, `fecha_texto`

**Upload imágenes (multipart):**
- Auth requerida (cualquier rol)
- Límite: 5 MB
- Sube a Supabase Storage bucket `imagenes` → `public/{timestamp}-{filename}`
- Retorna `{ok: true, url: publicUrl, path: filePath}`

### 7.6 `/api/noticias-save` — Noticias (GitHub API)

**Auth dual:** Session cookie O Bearer token (`Authorization: Bearer {NOTICIAS_ADMIN_SECRET}`)

**Noticia fields:** `id`, `titulo`, `texto`, `fecha` (default hoy), `tipo` (anuncio|prensa), `imagen`, `link`, `publicada`

**Acciones:**
- `list`: Lee `data/noticias.json`
- `save`: Si tiene ID → merge completo. Si nuevo → `id: 'noticia-{timestamp}'`, `unshift` al array
- `delete`: Filtra por ID

### 7.7 `/api/mercadopago` — Pagos

**Pago único (`action: "preferencia"`):**
- `POST https://api.mercadopago.com/checkout/preferences`
- Items: `[{title, quantity: 1, currency_id: "UYU", unit_price}]`
- Back URLs: `{origin}/exito.html` (éxito), `{origin}/error.html` (fallo)
- `auto_return: "approved"`

**Suscripción (`action: "suscripcion"`):**
- `POST https://api.mercadopago.com/preapproval`
- `auto_recurring: {frequency: 1, frequency_type: "months", transaction_amount, currency_id: "UYU"}`
- `back_url: {origin}/exito.html`, `status: "pending"`

### 7.8 `/api/push` — Notificaciones Push

**Subscribe (público):**
```json
// Request
{"action":"subscribe", "subscription":{"endpoint":"...", "keys":{"p256dh":"...", "auth":"..."}}}
// Upsert en mandragora_push_subscriptions (onConflict: 'endpoint')
// Response: 200 {ok: true}
```

**Send (admin):**
```json
// Request
{"action":"send", "title":"...", "body":"...", "url":"..."}
// webpush.setVapidDetails(subject, publicKey, privateKey)
// Promise.allSettled a todos los subscriptions
// Cleanup automático: delete subscriptions con error 404/410
// Response: 200 {ok: true, total: N, sent: N, failed: N}
```

### 7.9 `/api/ai-admin/chat` — Chat IA

**Modelo:** `deepseek-chat` | **Temp:** 0.3 | **Max tokens:** 600

**Rate limit:** 10 req/min por IP

**System prompt:** Asistente IA del panel admin de Mandrágora. Usa tools para operaciones de datos. Formato JSON tool-call: ` ```json {"tool": "...", "args": {...}} ``` `. Responde en español con markdown. Auto-redacta texto informal como noticia formal. Si el mensaje incluye `Imagen: https://...`, usa esa URL como campo `foto`.

**19 Tools:**

| # | Tool | Auth | Descripción |
|---|------|------|-------------|
| 1 | `listar_reservas` | — | Lista reservas con filtros opcionales (servicio, estado) |
| 2 | `resumir_reservas` | — | Resumen numérico: totales por estado y tipo de servicio |
| 3 | `listar_docentes` | — | Lista todos los docentes |
| 4 | `listar_eventos` | — | Lista eventos con filtro opcional por mes (1-12) |
| 5 | `crear_evento` | admin/editor | Crea evento (título, fecha requeridos) |
| 6 | `actualizar_evento` | admin/editor | Busca por título parcial, aplica cambios |
| 7 | `proximo_evento` | — | Devuelve el próximo evento |
| 8 | `actualizar_docente` | admin/editor | Busca por nombre o ID, aplica cambios |
| 9 | `crear_docente` | admin/editor | Crea docente (nombre, rol requeridos) |
| 10 | `listar_noticias` | — | Lista noticias, filtro por estado |
| 11 | `crear_noticia` | admin/editor | Crea noticia (título, texto requeridos) |
| 12 | `actualizar_noticia` | admin/editor | Busca por título parcial, aplica cambios |
| 13 | `borrar_noticia` | admin only | Borra por título (sin confirmación) |
| 14 | `borrar_evento` | admin only | Borra por título (sin confirmación) |
| 15 | `cruzar_evento_reservas` | — | Busca reservas que mencionan un evento |
| 16 | `listar_obras` | — | Lista todas las obras |
| 17 | `crear_obra` | admin/editor | Crea obra (título requerido) |
| 18 | `actualizar_obra` | admin/editor | Busca por título parcial, aplica cambios |
| 19 | `borrar_obra` | admin only | Borra por título (sin confirmación) |

**Flujo:** User message → DeepSeek con tools → detecta `tool_calls` nativos o JSON blocks → ejecuta `executeTool()` → re-llama DeepSeek con resultados → loop hasta 3 veces → respuesta final.

---

## 8. Librerías del Backend (`api/lib/`)

### 8.1 `admin-auth.js` — Autenticación

- **HMAC:** SHA-256, clave `ADMIN_SESSION_SECRET`, encoding base64url
- **Password hashing:** SHA-256 simple (⚠️ no bcrypt/argon2)
- **Comparación:** `crypto.timingSafeEqual` (protege contra timing attacks)
- **Cookie:** `mandragora_admin_session={issuedAt}.{random16hex}.{role}.{HMAC}`
  - `issuedAt`: Unix epoch seconds
  - `random16hex`: `crypto.randomBytes(16).toString('hex')`
  - Path: `/`, HttpOnly, SameSite: Strict, Max-Age: 1800s, Secure (solo HTTPS)
- **Validación:** Verifica firma HMAC, extrae `issuedAt`, comprueba `age >= -60 && age <= 1800`
- **3 roles con env vars separadas:** `ADMIN_PASSWORD` (admin), `ADMIN_PASSWORD_EDITOR` (editor), `ADMIN_PASSWORD_CONSULTA` (consulta)

### 8.2 `supabase.js` — Cliente DB

```js
getSupabaseAdmin() → createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false }
})
```
Retorna `null` si env vars faltan. Usa service role key (acceso total).

### 8.3 `audit.js` — Auditoría

`logAdminAction(role, action, resource, details, req)` → inserta en `admin_logs`:
- `user_role`, `action`, `resource`, `details` (JSONB), `ip_address` (`x-forwarded-for` o `remoteAddress`)
- Silently fails si Supabase no disponible

### 8.4 `rate-limit.js` — Rate Limiting

- **En memoria** (Map) — se resetea en cada deploy
- **Ventana:** 60s, **máx:** 10 requests
- Limpieza cada 5 min de entradas expiradas
- Usado en: `admin-auth` (login:{ip}), `ai-admin/chat` (ai-chat:{ip})

---

## 9. Base de Datos (Supabase)

**Proyecto:** `qreponqhjjqfzsqjweza`

### 9.1 Tabla `reservas`

```sql
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio VARCHAR(20) NOT NULL CHECK (servicio IN ('sala','taller','entrada','otro')),
  detalle VARCHAR(120),
  fecha DATE NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  whatsapp VARCHAR(30) NOT NULL,
  email VARCHAR(254),
  mensaje TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente','contactada','confirmada','cancelada')),
  creado TIMESTAMPTZ DEFAULT now(),
  actualizado TIMESTAMPTZ DEFAULT now()
);
-- Índices: fecha, estado
-- RLS: solo service_role
```

### 9.2 Tabla `admin_logs`

```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role VARCHAR(20),
  action VARCHAR(50),
  resource VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Índice: created_at, action
-- RLS: solo service_role
```

### 9.3 Tabla `mandragora_push_subscriptions`

```sql
CREATE TABLE mandragora_push_subscriptions (
  id SERIAL PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT now()
);
```

### 9.4 Bucket `imagenes`

- **Público** (lectura pública, escritura solo service_role)
- Path de upload: `public/{timestamp}-{filename}`

---

## 10. Datos (GitHub API como CMS)

### 10.1 `data/agenda.json` — Eventos (5 eventos)

```typescript
type Evento = {
  id: string;            // "evento-{timestamp}"
  titulo: string;        // max 120 chars
  fecha: string;         // "YYYY-MM-DD"
  hora?: string;         // "20:00"
  tipo?: string;         // "Teatro · Evento especial"
  categoria?: string;    // "Compañía Mandrágora"
  descripcion?: string;  // max 500 chars
  link_tickets?: string;
  texto_boton?: string;  // "Entradas", "Estreno"
  publicado: boolean;
}
```

**Eventos actuales:** Noches Criminales (28/8), Taller de prueba (10/8), Bodas de Sangre (1/8), Atrapada en la Pantalla (27/6/25), La Sed (15/8)

### 10.2 `data/docentes.json` — Docentes (15 docentes)

```typescript
type Docente = {
  id: string;            // "docente-{timestamp}"
  nombre: string;        // max 80 chars
  rol: string;           // max 120 chars, ej: "Actuación · Clown"
  foto?: string;         // URL
  frase?: string;        // max 200 chars
  trayectoria?: string;  // max 300 chars
  instagram?: string;    // "@usuario"
  whatsapp?: string;     // "598XXXXXXXXX"
  precio?: number;       // ≥0, default 2500
  activo: boolean;
}
```

**Docentes actuales:** Pancho, Fefa Galipolo, Freddy González, Pablo Bentancur, Camilo Abella, Edu "Pitufo" Lombardo, Katia Zacarian, Gustavo Carapuchet, Iván Solarich, Florencia De Armas, Agustín Camacho, Lucía Caballero, Jonás de León, Javiera Torres, Carlos Vesperoni

### 10.3 `data/noticias.json` — Noticias (5 artículos)

```typescript
type Noticia = {
  id: string;            // "noticia-{timestamp}"
  titulo: string;
  texto: string;
  fecha?: string;        // default: hoy
  tipo?: string;         // "anuncio" | "prensa"
  imagen?: string;       // URL
  link?: string;         // URL externa
  publicada: boolean;
}
```

### 10.4 `data/obras.json` — Obras (4 obras)

```typescript
type Obra = {
  id: string;            // "obra-{timestamp}"
  titulo: string;        // max 100 chars
  descripcion?: string;  // max 500 chars
  sinopsis?: string;     // max 300 chars
  elenco?: string;
  direccion?: string;
  estado: "presente" | "futura" | "pasada";
  fecha_texto?: string;  // "Julio 2026"
  imagenes: string[];    // URLs
}
```

**Obras actuales:** Atrapada en la pantalla (presente, 3 nom. Florencio), Con las manos atadas (futura, ago 2026), La inevitable crisis del actor (futura, sep 2026), La Sed (futura, estreno 15/8, thriller psicológico)

---

## 11. Flujo de Datos

### 11.1 Diagrama General

```
┌─────────────────────────────────────────────────────────────┐
│                    PANEL ADMIN (admin.html)                  │
│  Login → 7 tabs → CRUD por entidad                          │
└──────────┬──────────────────────────────────────────────────┘
           │ POST /api/*
           ▼
┌─────────────────────────────────────────────────────────────┐
│               VERCEL SERVERLESS FUNCTIONS                    │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ agenda   │  │ docentes │  │ noticias │  │ reservas   │  │
│  │ .js      │  │ .js      │  │ -save.js │  │ .js        │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬─────┘  │
│       │              │              │               │        │
│       ▼              ▼              ▼               ▼        │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐    ┌──────────┐   │
│  │ GitHub  │   │ GitHub  │   │ GitHub  │    │ Supabase │   │
│  │ API     │   │ API +   │   │ API     │    │ PostgreSQL│   │
│  │ (JSON)  │   │ Storage │   │ (JSON)  │    │          │   │
│  └─────────┘   └─────────┘   └─────────┘    └──────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │ mercadopago  │  │ push.js  │  │ ai-admin/chat.js     │   │
│  │ .js          │  │          │  │ (DeepSeek + 19 tools)│   │
│  └──────┬───────┘  └────┬─────┘  └──────────┬───────────┘   │
│         │               │                    │               │
│         ▼               ▼                    ▼               │
│    MercadoPago    Supabase +           DeepSeek API          │
│    API            Web Push API                               │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                  PÁGINAS PÚBLICAS                             │
│                                                             │
│  fetch('data/*.json')  ←──  GitHub Pages / Vercel (static)  │
│  POST /api/docentes    ←──  Vercel Function (list público)  │
│  POST /api/agenda      ←──  Vercel Function (list público)  │
│  POST /api/reservas    ←──  Vercel Function (crear público) │
│  POST /api/mercadopago ←──  Vercel Function (pago público)  │
│  POST /api/push        ←──  Vercel Function (subscribe)     │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 Flujo de Reservas

```
reservar.html → Wizard (servicio → calendario → formulario)
  → Abre WhatsApp con mensaje formateado
  → POST /api/reservas {servicio, fecha, nombre, whatsapp, ...}
  → Supabase INSERT → reservas table
  → admin.html → GET /api/reservas → tabla con filtros
```

### 11.3 Flujo de Pagos

```
pagar.html → Select tipo + email
  → POST /api/mercadopago {action, title, price, email}
  → MercadoPago API
  → Pago único: Brick inline en la página
  → Suscripción: redirect a init_point
  → Éxito/Fallo: redirect a exito.html / error.html
```

### 11.4 Flujo de IA (Chat Admin)

```
admin.html (tab Chat IA) → POST /api/ai-admin/chat {message, history}
  → Auth check (session cookie)
  → Rate limit check (10/min)
  → DeepSeek API (deepseek-chat) con 19 tools + system prompt
  → Detecta tool_calls (nativos o JSON blocks)
  → executeTool() → GitHub API / Supabase
  → Re-llama DeepSeek con resultados (loop 3 veces)
  → Respuesta formateada → admin.html
```

### 11.5 Flujo de Push Notifications

```
Registro:
  assets/js/push.js (botón campanita) → Notification.requestPermission()
  → PushManager.subscribe({userVisibleOnly: true, applicationServerKey})
  → POST /api/push {action:'subscribe', subscription}
  → Supabase upsert → mandragora_push_subscriptions

Envío:
  admin.html (tab Push) → POST /api/push {action:'send', title, body, url}
  → Auth check → webpush.setVapidDetails()
  → SELECT * FROM mandragora_push_subscriptions
  → Promise.allSettled → webpush.sendNotification() a cada uno
  → Cleanup: delete subscriptions con error 404/410

Auto-push (noticias):
  admin.html → POST /api/noticias-save (con push marcado)
  → POST /api/push-send {title, body} (fire-and-forget)
```

---

## 12. Service Worker y PWA

**Archivo:** `sw.js` (v5)

### 12.1 Estrategia de Caché

| Tipo | Estrategia | Descripción |
|------|-----------|-------------|
| HTML (navigation) | **Network-first** | Intenta red, guarda en caché, fallback a caché si offline |
| Assets (GET, no-nav) | **Stale-while-revalidate** | Sirve caché inmediatamente, actualiza en background |
| POST /api/* | **Network-only** | Pasa directo a red, sin caché |

### 12.2 Páginas Pre-cacheadas

`/`, `/index.html`, `/escuela.html`, `/sala.html`, `/compania.html`, `/cine-viajero.html`, `/agenda.html`, `/comunidad.html`, `/contacto.html`, `/reservar.html`, `/galeria.html`

### 12.3 Push Events

- **`push`:** Parsea JSON `{title, body, url}`, muestra notificación con icono Mandrágora
- **`notificationclick`:** Navega a `data.url` (o `/`), re-enfoca ventana existente si ya está abierta

### 12.4 Manifest

```json
{
  "name": "Mandrágora — Teatro & Escuela de Artes",
  "short_name": "Mandrágora",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f8f4ed",
  "theme_color": "#CE9A47",
  "orientation": "portrait-primary"
}
```

---

## 13. Despliegue

### 13.1 Vercel (Producción Principal)

- **Plan:** Hobby (12 funciones máx)
- **URL:** `https://deploy-phi-wheat.vercel.app`
- **Auto-deploy:** desde `main` en GitHub
- **Dominio futuro:** `mandragora.uy`
- **Consolidación de funciones:** Debido al límite de 12, varios endpoints consolidan múltiples operaciones (ej: `docentes.js` maneja docentes + obras + upload)

### 13.2 GitHub Pages (Alternativo Estático)

- **URL:** `https://mauric75.github.io/mandragora-web/`
- Solo sirve archivos estáticos (sin serverless functions)
- MercadoPago y APIs no funcionan aquí

### 13.3 Netlify (Legacy)

- Config en `netlify.toml`
- Función alternativa en `netlify/functions/crear-preferencia.js`

### 13.4 Comandos

```bash
# Desarrollo local
cd C:\Users\HP\Documents\Mandragora\deploy

# Deploy
git add -A
git commit -m "descripción del cambio"
git push  # Vercel y GitHub Pages se actualizan solos

# Vercel CLI (opcional)
vercel --prod
```

### 13.5 Variables de Entorno

| Variable | Propósito |
|----------|-----------|
| `ADMIN_PASSWORD` | Contraseña hash rol admin |
| `ADMIN_PASSWORD_EDITOR` | Contraseña hash rol editor |
| `ADMIN_PASSWORD_CONSULTA` | Contraseña hash rol consulta |
| `ADMIN_SESSION_SECRET` | Clave HMAC para firmar cookies de sesión |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (acceso total DB) |
| `GITHUB_TOKEN` | Personal access token para GitHub API |
| `GITHUB_BRANCH` | Rama target (default: `main`) |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acceso MercadoPago |
| `DEEPSEEK_API_KEY` | API key de DeepSeek |
| `VAPID_PUBLIC_KEY` | Clave pública Web Push VAPID |
| `VAPID_PRIVATE_KEY` | Clave privada Web Push VAPID |
| `VAPID_SUBJECT` | `mailto:info@mandragora.uy` |
| `NOTICIAS_ADMIN_SECRET` | Bearer token para `/api/noticias-save` |
| `INGEST_API_KEY` | API key para webhook de ingesta |

> ⚠️ **Archivos sensibles:** `.env.local` y `.env.vercel` contienen valores reales (incluyendo `SUPABASE_SERVICE_ROLE_KEY`). Están en `.gitignore` pero `.env.local` existe en el repo local.

---

## 14. Seguridad y Deuda Técnica

### 14.1 Issues de Seguridad

| Issue | Severidad | Detalle |
|-------|-----------|---------|
| **Password hashing débil** | 🔴 Alta | SHA-256 simple en lugar de bcrypt/argon2. Aunque usa `timingSafeEqual`, un hash simple es vulnerable a rainbow tables si las env vars se filtran |
| **SUPABASE_SERVICE_ROLE_KEY en .env.local** | 🔴 Alta | La clave de servicio está en un archivo local. Si se commitea accidentalmente, acceso total a la DB |
| **MercadoPago test key** | 🟡 Media | `pagar.html` usa `TEST-xxxxxxxx...` — no procesa pagos reales |
| **Sin CSRF protection** | 🟡 Media | Auth solo por cookies. Sin tokens CSRF en POST requests |
| **Sin CSP headers** | 🟡 Media | Sin Content-Security-Policy, vulnerable a XSS |
| **CORS permisivo** | 🟡 Media | Algunos endpoints permiten orígenes amplios |
| **Admin password visible** | 🟡 Media | `admin.html` tiene `placeholder="mandragora2026"` en el input, revelando la contraseña en el HTML |
| **Rate limiting en memoria** | 🟢 Baja | Se resetea en cada deploy. Sin persistencia |
| **Sin HTTPS enforcement** | 🟢 Baja | Vercel lo maneja, pero no hay HSTS |
| **`confirm()` nativo para delete** | 🟢 Baja | Sin estilo, bloqueante, mala UX |

### 14.2 Bugs

| Bug | Impacto |
|-----|---------|
| **Tab Obras duplicado** | El CRUD de obras está roto: `obra-sinopsis`, `obra-elenco`, `obra-direccion` son null. No se pueden crear/editar obras correctamente |
| **Reservas solo lectura** | No hay UI para cambiar el estado de una reserva (pendiente → contactada → confirmada → cancelada) |
| **Sin paginación** | Todos los listados cargan datos completos. Con 100+ registros habrá problemas de performance |
| **Push desde noticias sin verificación** | Auto-push al guardar noticia no verifica respuesta del endpoint |

### 14.3 Mejoras Pendientes

- [ ] Migrar password hashing a bcrypt/argon2
- [ ] Implementar CSRF tokens
- [ ] Agregar CSP headers
- [ ] Cambiar MercadoPago a producción (token real)
- [ ] Arreglar tab Obras duplicado
- [ ] Agregar UI de cambio de estado en Reservas
- [ ] Implementar paginación en listados
- [ ] Agregar validación de webhook de MercadoPago
- [ ] Persistir rate limiting (Redis o Supabase)
- [ ] Eliminar placeholder de contraseña en admin.html
- [ ] Mover lógica de upload en chat a su propio endpoint
- [ ] Unificar paletas de color (index vs páginas internas)
- [ ] Agregar editor de texto rico para noticias

---

## 15. Referencia Rápida

### 15.1 Comandos Comunes

```bash
# Navegar al proyecto
cd C:\Users\HP\Documents\Mandragora\deploy

# Deploy (git push auto-deploya a Vercel + GitHub Pages)
git add -A && git commit -m "cambio" && git push

# Ver estado del repo
git status

# Instalar dependencias (solo si cambió package.json)
npm install

# Testear función localmente (requiere Vercel CLI)
vercel dev
```

### 15.2 Rutas de Archivos Clave

| Archivo | Ruta Absoluta |
|---------|---------------|
| Landing page | `C:\Users\HP\Documents\Mandragora\deploy\index.html` |
| Admin panel | `C:\Users\HP\Documents\Mandragora\deploy\admin.html` |
| Auth library | `C:\Users\HP\Documents\Mandragora\deploy\api\lib\admin-auth.js` |
| Supabase client | `C:\Users\HP\Documents\Mandragora\deploy\api\lib\supabase.js` |
| AI Chat endpoint | `C:\Users\HP\Documents\Mandragora\deploy\api\ai-admin\chat.js` |
| Service Worker | `C:\Users\HP\Documents\Mandragora\deploy\sw.js` |
| Push client | `C:\Users\HP\Documents\Mandragora\deploy\assets\js\push.js` |
| Eventos data | `C:\Users\HP\Documents\Mandragora\deploy\data\agenda.json` |
| Docentes data | `C:\Users\HP\Documents\Mandragora\deploy\data\docentes.json` |
| Noticias data | `C:\Users\HP\Documents\Mandragora\deploy\data\noticias.json` |
| Obras data | `C:\Users\HP\Documents\Mandragora\deploy\data\obras.json` |
| Variables entorno | `C:\Users\HP\Documents\Mandragora\deploy\.env.local` |
| Schema SQL | `C:\Users\HP\Documents\Mandragora\deploy\supabase\migrations\` |

### 15.3 URLs Importantes

| Servicio | URL |
|----------|-----|
| Producción | `https://deploy-phi-wheat.vercel.app` |
| Admin panel | `https://deploy-phi-wheat.vercel.app/admin.html` |
| GitHub repo | `https://github.com/mauric75/mandragora-web` |
| Supabase dashboard | `https://supabase.com/dashboard/project/qreponqhjjqfzsqjweza` |
| Vercel dashboard | `https://vercel.com/mauric75/mandragora-web` |
| MercadoPago dashboard | `https://www.mercadopago.com.uy/developers/panel` |
| DeepSeek platform | `https://platform.deepseek.com` |

### 15.4 Contactos del Proyecto

| Rol | Nombre | Contacto |
|-----|--------|----------|
| Dueño/Cliente | Pablo Bentancur | WhatsApp +598 97 052 948 |
| Desarrollador | Mauricio | GitHub: mauric75 |
| Email del proyecto | — | info@mandragora.uy |

---

> **Nota para IAs y desarrolladores:** Este documento debe actualizarse cuando se realicen cambios significativos en la arquitectura, nuevos endpoints, nuevas páginas, o cambios en el flujo de datos. La fecha de última actualización está al inicio del documento.
