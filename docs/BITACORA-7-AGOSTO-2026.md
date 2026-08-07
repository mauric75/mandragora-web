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
- Aplicado a 15 páginas
- **Commit:** `9bbe296`

### 5. Fix: z-index incorrecto en nosotros.html y convenio-sunca.html
- `.mobile-menu`: `z-index: 99` → `1000` (debajo del header `.site-nav` en 100 y `.grain` en 999)
- `.hamburger`: `z-index: 101` → `1001`
- Las otras 13 páginas ya tenían los valores correctos
- **Commit:** `c211f46`

### 6. Feat: links directos a página principal en cada submenú
- Cada submenú ahora incluye un link a la página principal como primer ítem (estilo normal, sin itálica)
- Escuela → `escuela.html`, Sala → `sala.html`, Compañía → `compania.html`, Nosotros → `nosotros.html`
- Convenios ya tenía su link principal (`convenios.html`)
- **Commit:** `0eb0fb7`

### 7. Fix: link de Historia ahora apunta a `nosotros.html#historia`
- Agregado `id="historia"` en `<section class="content">` de `nosotros.html`
- Links "Historia" en menú móvil y nav desktop cambiados de `nosotros.html` a `nosotros.html#historia`
- Agregado link "Nosotros" como primer ítem del submenú (commit anterior)
- **Commits:** `bb961c5`, `5688a29`

## Estructura final del menú móvil (Variación A · Elegante)

```
┌─────────────────────────────┐
│  ✕ (38px círculo c/borde)  │
│                             │
│     [logo Mandrágora]       │
│                             │
│     Escuela ▾               │
│       Escuela               │  ← link directo (normal)
│       Talleres              │
│       Docentes              │
│     Sala ▾                  │
│       Sala                  │  ← link directo (normal)
│       Cartelera             │
│       Alquiler              │
│     Compañía ▾              │
│       Compañía              │  ← link directo (normal)
│       Elenco                │
│       Obras                 │
│     Convenios ▾             │
│       Convenios             │
│       Cine Viajero          │
│       Atrapasueños          │
│       SUNCA                 │
│     Nosotros ▾              │
│       Nosotros              │  ← link directo (normal)
│       Historia              │  → nosotros.html#historia
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

## Commits en main

| Commit | Descripción |
|--------|-------------|
| `0b872a0` | Integración Variación A · Elegante en index.html |
| `fdc939a` | Extensión a las 14 páginas restantes |
| `9bbe296` | Fix: z-index mobile-menu 1000, hamburger 1001 (15 páginas) |
| `c211f46` | Fix: z-index en nosotros.html y convenio-sunca.html (estaban con 99/101) |
| `0eb0fb7` | Feat: link directo a página principal en cada submenú (Escuela, Sala, Compañía) |
| `bb961c5` | Fix: link Nosotros como primer ítem del submenú Nosotros |
| `5688a29` | Fix: Historia → nosotros.html#historia con ancla en la página |
| `a3d5156` | Docs: actualizar bitácora con cambios del 7 de agosto |
| `f8fe789` | Fix: aumentar font-size de .menu-link de 0.7rem a 0.9rem |
| `abd8fb7` | Fix: cartelera z-index 15→1000 (no funcionó) |
| `9bb2ff4` | Debug: cartelera is-visible hardcodeado + console.log + z-index !important |
| `c43e67f` | Fix: cartelera position:absolute→fixed |
| `a604000` | Fix: agregar isolation:isolate a cartelera |
| `646963b` | Debug: estilos inline agresivos + z-index 10000 + borde rojo (confirmó visibilidad) |
| `7d662e5` | Fix: restaurar cartelera limpia — position:fixed + isolation + z-index:1000 |
| `ac272cc` | Fix: eliminar display:none de .cartelera |
| `7062c49` | Fix: mover cartelera fuera de hero → hijo directo de body |
| `4f2c4c6` | Fix: cartelera móvil position:fixed anclada abajo (revertido por horrible) |
| `18c30b8` | Fix: cartelera móvil fixed pequeña esquina superior derecha |
| `c2b18a1` | Fix: cartelera de vuelta en hero con position:absolute (desapareció) |
| `eeb65f4` | Fix: cartelera position:fixed + scroll handler (no desaparecía al scrollear) |
| `d06883c` | Fix: usar getBoundingClientRect para scroll handler |

## 🐛 Bug: Cartelera de noticias desaparecida

### Síntoma
El sticker de "Recién pegado" en el hero de `index.html` dejó de ser visible después de la integración del menú móvil.

### Investigación
- **Rama de prueba:** `test/cartelera-fix` (commit `9db1564`)
- Se restauró la cartelera exactamente a su estado pre-menú-móvil (`8b56264`) con único cambio `z-index: 15 → 1002`
- **Resultado:** sigue sin verse

### Hipótesis probadas (todas fallaron)

| Hipótesis | Qué se hizo | Resultado |
|-----------|------------|-----------|
| Grain la tapa (z-index 999) | Subir cartelera a z-index 1000+ | ❌ No se ve |
| `position: absolute` compite con `fixed` | Cambiar a `position: fixed` | ✅ Se ve pero no scrollea |
| `mix-blend-mode: overlay` del grain | `isolation: isolate` | ❌ No ayudó |
| `display: none` no se sobreescribe | Hardcodear `is-visible`, quitar `display:none` | ❌ No ayudó |
| Hero interfiere (overflow/stacking) | Mover fuera del hero, hijo directo de body | ✅ Se ve pero no scrollea |
| CSS cascade | Estilos inline con `!important` y borde rojo | ✅ Único caso donde funcionó |

### Conclusión
El problema está en la interacción entre `position: absolute` dentro del hero y los nuevos elementos del menú móvil (`position: fixed; z-index: 1000; backdrop-filter`). Con `position: fixed` la cartelera se ve pero pierde el scroll natural. **No se encontró solución que preserve ambas cosas.** Queda pendiente para otra sesión.

### Estado actual en producción (main)
La cartelera usa `position: fixed` + `isolation: isolate` + `z-index: 1000` + `getBoundingClientRect` scroll handler. Se ve pero el scroll handler no está funcionando correctamente (no desaparece al scrollear).

## Rama

- Desarrollo: `test/mobile-menu-v2`
- Debug cartelera: `test/cartelera-fix` (NO mergear)
- Producción: `main` (desplegado en Vercel)
