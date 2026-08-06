# Bitácora — 5 de agosto 2026

## Cambios realizados

### 1. Rediseño visual del menú móvil (fase 1)
- Touch targets de 44px en hamburguesa, botones toggle y subitems
- Botones toggle: `background:none`, `border:none`, `color:var(--c-cream)`, `font-family:var(--f-display)`, `font-size:1.6rem`, `padding:0`
- **Commit:** `fdc6b8f`

### 2. Restauración visual + overflow + colores explícitos (fase 2)
- Revertidos excesos de la fase 1: gap 1.8rem, fuente 1.6rem, líneas 24px×1.5px, sin padding extra
- `color: var(--c-cream)` explícito en `.mobile-subitem` y `.mobile-submenu-toggle`
- `color: var(--c-ink)` explícito en `.nav-item__dropdown` y `.nav-item__dropdown a`
- `overflow: visible` en `.mobile-submenu.is-open`
- **Commit:** `d311dc5`

### 3. Aplicar colores y overflow a todas las páginas (fase 3)
- 14 páginas con color explícito + overflow visible
- `admin.html` restaurado (menú distinto)
- **Commit:** `0a21b93`

### 4. Sincronizar CSS del menú móvil en páginas viejas (fase 4)
- 6 páginas: `atrapasuenos.html`, `convenios.html`, `convenio-sunca.html`, `guia-rapida.html`, `manual.html`, `nosotros.html`
- `.site-nav` padding 0.9rem, logo 32px, hamburger 44px, theme toggle 44px
- Dark mode `.mobile-menu` agregado donde faltaba
- **Commit:** `888c79e`

### 5. Limpiar CSS duplicado (fase 5)
- `nosotros.html` y `convenio-sunca.html`: eliminado bloque CSS de menú móvil duplicado
- `guia-rapida.html` y `manual.html`: corregido `.nav-item__trigger` roto
- **Commit:** `f0735ce`

### 6. Arreglar animación hamburguesa en páginas rotas (fase 6)
- `convenio-sunca.html`: agregada animación `.hamburger.is-open` (rotate 45deg) + `color: var(--c-ink)`
- `nosotros.html`: agregada animación `.hamburger.is-open`
- **Commits:** `1a5e7ca`, `2a16199`

### 7. Bug crítico: menú móvil invisible (fase 7)
- `convenio-sunca.html` y `nosotros.html`: faltaba `.mobile-menu.is-open { opacity:1; pointer-events:auto }`
- Sin esta regla el menú nunca se mostraba aunque el JS funcionara correctamente
- **Commit:** `eca3d6a`

### 8. Menú móvil en convenios.html
- `convenios.html` tenía menú móvil plano (links sueltos) en vez de acordeón con submenús
- Agregado CSS completo: `backdrop-blur`, `max-height` animation, touch targets 48px, flecha estilizada, separadores
- Agregado HTML: botones toggle + submenús colapsables para Escuela, Sala, Compañía, Convenios, Nosotros
- Agregado JS: handler de acordeón para `.mobile-submenu-toggle`
- **Commit:** `ff60295`, `8b6fba1`

## Estructura final del menú móvil

```
☰ Hamburguesa
├── Escuela ▾
│   ├── Talleres
│   └── Docentes
├── Sala ▾
│   ├── Cartelera
│   └── Alquiler
├── Compañía ▾
│   ├── Elenco
│   └── Obras
├── Convenios ▾
│   ├── Convenios
│   ├── Cine Viajero
│   ├── Atrapasueños Recreación
│   └── SUNCA
├── Nosotros ▾
│   ├── Historia
│   ├── Comunidad
│   └── Contacto
├── Agenda
├── Noticias
└── Galería
```

## Características técnicas
- `<button>` para toggles (accesibilidad: `aria-expanded`)
- Animación `max-height` + `opacity` en submenús
- `backdrop-filter: blur(24px)` con fondo semitransparente
- Touch targets de 48px en links principales y 44px en hamburguesa
- Flecha `▾` con rotación 180° al expandir
- Color dorado en toggle activo

## Archivos modificados
- `index.html`, `escuela.html`, `sala.html`, `compania.html`, `nosotros.html`
- `comunidad.html`, `cine-viajero.html`, `agenda.html`, `noticias.html`, `galeria.html`
- `contacto.html`, `reservar.html`, `convenios.html`, `atrapasuenos.html`, `convenio-sunca.html`
- `admin.html` (restaurado)

## Commits del día
1. `fdc6b8f` — Touch targets 44px + estilos base
2. `d311dc5` — Restauración visual + colores explícitos + overflow
3. `0a21b93` — Aplicar colores y overflow a 14 páginas
4. `888c79e` — Sincronizar CSS en 6 páginas viejas
5. `f0735ce` — Limpiar CSS duplicado y nav-item__trigger roto
6. `1a5e7ca` — Animación hamburguesa en convenio-sunca.html
7. `2a16199` — Animación hamburguesa en nosotros.html
8. `eca3d6a` — Bug menú invisible (.mobile-menu.is-open faltante)
9. `ff60295` — Menú móvil acordeón en convenios.html (HTML + CSS)
10. `8b6fba1` — JS del acordeón en convenios.html

## Rama
- `test/mobile-menu-redesign` — todos los cambios desarrollados y mergeados a `main`

## Producción
🔗 https://deploy-phi-wheat.vercel.app
