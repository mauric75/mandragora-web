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
7. `0999b3c` — Agrega manual de administracion, guia rapida, context text y dev-server

---

## Segunda sesión — Documentación y herramientas de administración

### 5. Documentación del proyecto

#### 5.1 `CONTEXT.md` — Documento técnico completo (51 KB, 1089 líneas)
Documentación exhaustiva de todo el proyecto: arquitectura, stack, 21 páginas, 8 APIs, BD, sistema de diseño, flujos de datos, bugs, deuda técnica, despliegue. También almacenado en Cerebro (ID: `883aeebb`).

#### 5.2 `MANUAL.md` — Manual de uso para el cliente (~300 líneas)
Manual en Markdown con 11 secciones: primeros pasos, dashboard, noticias, agenda, docentes, obras, reservas, push, chat IA, FAQ, referencia rápida.

### 6. Páginas web nuevas

#### 6.1 `manual.html` — Manual protegido con login
- Misma autenticación que el admin (cookie HMAC, 30 min)
- Tema oscuro consistente, tabla de contenidos navegable
- Botón **📖 Manual** en header del admin y links en footer de 14 páginas públicas

#### 6.2 `guia-rapida.html` — Guía rápida imprimible
- Versión compacta optimizada para imprimir (tema claro automático en `@media print`)
- Tema oscuro en pantalla, diseño consistente con el admin
- Botón **⚡ Guía Rápida** en header del admin

### 7. Entorno de desarrollo local

#### 7.1 `dev-server.js` — Servidor local
Creado porque `vercel dev` no leía las variables de entorno locales. Carga `.env.vercel`, sirve estáticos y funciones API. Uso: `node dev-server.js`.

#### 7.2 Contraseña de admin
- **Correcta:** `Mndrgr4Admin2026!!`
- **Archivo:** `.env.vercel` (NO `.env.local`)
- **Issue:** `vercel env pull` no desencripta variables sensibles. El `.env.vercel` tenía un valor viejo (`MandragoraAdmin2026!`). Se actualizó.

### 8. Cambios en archivos existentes

#### 8.1 `admin.html`
- Agregado `<div class="header__actions">` con botones 📖 Manual y ⚡ Guía Rápida
- CSS para `.header__actions` y `.header__manual`

#### 8.2 Footer de páginas públicas (14 archivos)
Agregado link `· Manual` junto al link `Admin`: index, escuela, sala, compania, agenda, comunidad, contacto, reservar, noticias, convenios, convenio-sunca, cine-viajero, nosotros, atrapasuenos.

#### 8.3 `.env.vercel`
- `ADMIN_PASSWORD` actualizada a `Mndrgr4Admin2026!!`

### 9. Archivos creados (resumen)

| Archivo | Propósito |
|---------|-----------|
| `CONTEXT.md` | Documentación técnica completa |
| `MANUAL.md` | Manual de uso para el cliente |
| `manual.html` | Manual web protegido |
| `guia-rapida.html` | Guía rápida imprimible |
| `dev-server.js` | Servidor local de desarrollo |

### 10. Lecciones aprendidas

1. `vercel dev` no lee `.env.local` ni `.env.vercel` cuando las variables están en el proyecto remoto. Solución: `dev-server.js`.
2. `vercel env pull` no desencripta variables sensibles — bajan vacías.
3. El caracter `!!` en bash se expande como último comando. Usar comillas simples.
4. La contraseña de Cerebro era correcta. El error era variables no cargadas.
5. El archivo de config correcto es `.env.vercel`, no `.env.local`.

### 11. Pendientes

- [ ] Migrar password hashing de SHA-256 a bcrypt/argon2
- [ ] Arreglar bug tab Obras duplicado en admin.html
- [ ] UI para cambiar estado de reservas
- [ ] Paginación en listados del admin
- [ ] MercadoPago: cambiar test key a producción
- [ ] CSP headers y CSRF protection

## Producción
🔗 https://mauric75.github.io/mandragora-web
🔗 https://deploy-phi-wheat.vercel.app
🔗 https://deploy-lrjdlerl1-mauricio-s-projects1.vercel.app (rama `fix/mobile-menu-convenios`)
