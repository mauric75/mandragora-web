# Bitácora — 4 de agosto 2026

## Cambios realizados

### 1. Investigación de Atrapasueños Recreación
- Búsqueda de imágenes del proyecto Atrapasueños Recreación en internet
- Identificado el perfil de Facebook [@atraparecreacion](https://www.facebook.com/atraparecreacion) (3,4 mil seguidores)
- Datos recolectados: WhatsApp +598 94 665 604, email atrapasue.eventos@gmail.com, categoría "Arte y entretenimiento", Montevideo
- Obra destacada: "ATRAPADA EN LA PANTALLA"
- Documentado en `docs/INVESTIGACION-ATRAPASUENOS.md`
- **Commit:** `a4e6892`

### 2. Extracción de imágenes de la galería de Facebook
- Extraídas 22 URLs de fotos desde la sección de fotos del perfil usando automatización de navegador
- Captura de pantalla del perfil guardada como `assets/images/Convenios/atrapasuenos-perfil-facebook.png` (260 KB)
- Foto a tamaño completo de la obra guardada como `assets/images/Convenios/atrapasuenos-foto-ejemplo.jpg` (518 KB)
- **Commit:** `a4e6892`

## Archivos modificados
- `docs/INVESTIGACION-ATRAPASUENOS.md` — nuevo documento con la investigación completa
- `docs/BITACORA-4-AGOSTO-2026.md` — este archivo
- `assets/images/Convenios/atrapasuenos-perfil-facebook.png` — captura del perfil de Facebook
- `assets/images/Convenios/atrapasuenos-foto-ejemplo.jpg` — foto a tamaño completo de la obra

### 3. Menú móvil con todos los dropdowns del desktop
- Reemplazado el menú móvil en los 14 archivos HTML (13 del sitio + atrapasuenos.html) para reflejar exactamente la estructura del desktop
- Agregados 5 dropdowns colapsables: Escuela ▾ (Talleres, Docentes), Sala ▾ (Cartelera, Alquiler), Compañía ▾ (Elenco, Obras), Convenios ▾ (Convenios, Cine Viajero, Atrapasueños Recreación, SUNCA), Nosotros ▾ (Historia, Comunidad, Contacto)
- Eliminado link "Inicio" del menú móvil (el logo ya cumple esa función, igual que en desktop)
- Mejora visual CSS: padding y transición en `.mobile-subitem`, `margin-bottom` en `.mobile-submenu`
- Corregido atrapasuenos.html que no tenía dropdown móvil, CSS de submenú ni JS accordion
- Los 3 links planos finales (Agenda, Noticias, Galería) mantienen el orden del desktop
- Rama: `fix/mobile-menu-convenios`

### 4. Verificación grep -c
- **14/14 archivos**: 5 toggles, 5 submenus, 13 subitems cada uno
- Guard JS: 1 por archivo (14/14)
- "Inicio" eliminado del menú móvil en todos los archivos
- CSS submenu: presente en minificados (nosotros.html, convenio-sunca.html)
- **Commit:** `db6eff6` (rama `fix/mobile-menu-convenios`)

## Commits del día
1. `a4e6892` — Agrega investigacion de Atrapasuenos Recreacion con imagenes y datos del perfil de Facebook
2. `41188eb` — Completa bitacora 4 de agosto
3. `6bd71ca` — Agrega Atrapasuenos y SUNCA al menu movil en los 13 archivos HTML
4. `deabdce` — Convierte menu movil de Convenios en dropdown colapsable como en desktop
5. `e5d37a8` — Corrige error de sintaxis CSS y conflicto JS en dropdown movil de Convenios
6. `db6eff6` — Agrega todos los dropdowns del desktop al menu movil + mejora visual + fix atrapasuenos.html

## Producción
🔗 https://mauric75.github.io/mandragora-web
🔗 https://deploy-phi-wheat.vercel.app
🔗 https://deploy-lrjdlerl1-mauricio-s-projects1.vercel.app (rama `fix/mobile-menu-convenios`)
