# Bitácora — 7 de agosto 2026

## Cambios realizados

### 1. Integración de la variación A · Elegante en index.html
- CSS del menú móvil reescrito completamente con diseño elegante centrado:
  - Overlay: `rgba(255,255,255,.96)` claro / `rgba(9,16,34,.97)` oscuro
  - Toggles: `--f-display` (Cormorant Garamond) 1.55rem, centrados, `color: var(--c-ink)`
  - Subítems: `--f-display` 1.15rem, itálica, `color: var(--c-ink-dim)`, opacidad 0.75
  - Arrow `▾`: rota 180° al abrir, opacidad 0.35→0.8
- HTML reestructurado: ✕ cierre, logo dual claro/oscuro, `.menu-group` wrappers, divider, links uppercase (`.menu-link`), CTA dorado "Reservar" → `contacto.html`, `.menu-bottom` con ☾ toggle tema + ☏ teléfono (`+59897052948`)
- JS: scroll lock inicial (`body.menu-open`), `closeMenu()` unificada para ✕ y links, sincronización bidireccional del toggle de tema (header ↔ menú)
- Logo dual: `logo-negro.png` (claro) / `logo-blanco.png` (oscuro), visible según `[data-theme]`
- **Commit:** `0b872a0`

### 2. Extensión a las 14 páginas restantes
- 9 páginas estándar (agenda, escuela, sala, compania, comunidad, contacto, noticias, galeria, cine-viajero) actualizadas con el mismo CSS/HTML/JS
- 5 páginas no-estándar (atrapasuenos, convenios, nosotros, convenio-sunca, admin) adaptadas a sus formatos (minificado, single-line, etc.)
- Admin: se agregaron variables `--c-ink`, `--c-ink-dim`, `--f-display`, `--f-mark` faltantes
- Templates de prototipos: `menu-prototype.html`, `menu-variations.html` agregados al repo
- **Commit:** `fdc939a`

### 3. Fix: z-index insuficiente (menú tapado por header y grain)
- `.mobile-menu`: `z-index: 99` → `1000` (por encima de `.site-nav` en 100 y `.grain` en 999)
- `.hamburger`: `z-index: 101` → `1001` (siempre cliqueable)
- Afectaba a todas las páginas; corregido con sed en lote (17 archivos)
- **Commit:** `9bbe296`

### 4. Fix: scroll lock robusto (iOS Safari)
- `body.menu-open` ahora incluye `position: fixed; width: 100%` además de `overflow: hidden`
- JS: guarda `window.scrollY` antes de abrir el menú, aplica `body.style.top = '-Xpx'`, restaura al cerrar con `window.scrollTo(0, _menuScrollY)`
- Aplicado a 15 páginas (todas las que usan scroll lock)
- **Commit:** pendiente (agente en ejecución)

## Estructura final del menú móvil (Variación A · Elegante)

```
┌─────────────────────────────┐
│  ✕ (38px círculo c/borde)  │
│                             │
│     [logo Mandrágora]       │
│                             │
│     Escuela ▾               │
│       Talleres              │
│       Docentes              │
│     Sala ▾                  │
│       Cartelera             │
│       Alquiler              │
│     Compañía ▾              │
│       Elenco                │
│       Obras                 │
│     Convenios ▾             │
│       Convenios             │
│       Cine Viajero          │
│       Atrapasueños          │
│       SUNCA                 │
│     Nosotros ▾              │
│       Historia              │
│       Comunidad             │
│       Contacto              │
│     ────────────            │
│     AGENDA                  │
│     NOTICIAS                │
│     GALERÍA                 │
│     ┌──────────┐            │
│     │ RESERVAR │ (dorado)   │
│     └──────────┘            │
│                             │
│      ☾        ☏             │
└─────────────────────────────┘
```

## Características técnicas

- Overlay `position: fixed; inset: 0; z-index: 1000`
- `backdrop-filter: blur(24px)` en overlay
- Toggles y subitems: `--f-display` (Cormorant Garamond), centrados
- Links directos: `--f-mark` (Schrifted), uppercase, letter-spacing 0.16em
- CTA: fondo `--c-gold`, texto `--c-bg`, padding 0.65em×2em, border-radius 2px
- Iconos circulares: 38px, borde `--c-border`, hover `--c-gold`
- Logo dual: `logo-negro.png` (tema claro), `logo-blanco.png` (tema oscuro)
- Acordeón: `max-height 0→280px`, `opacity 0→1`, transición `--ease`
- Scroll lock: `position: fixed` + save/restore `window.scrollY`
- Tema: sincronización bidireccional entre toggle del header y toggle del menú
- `<button>` para toggles con `aria-expanded`

## Archivos modificados

- `index.html`, `agenda.html`, `escuela.html`, `sala.html`, `compania.html`
- `nosotros.html`, `comunidad.html`, `contacto.html`, `noticias.html`, `galeria.html`
- `convenios.html`, `cine-viajero.html`, `atrapasuenos.html`, `convenio-sunca.html`
- `admin.html`, `guia-rapida.html`, `manual.html`, `reservar.html`

## Rama

- Desarrollo: `test/mobile-menu-v2`
- Producción: mergeado a `main` (desplegado en Vercel)
