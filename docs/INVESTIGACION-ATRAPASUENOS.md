# Investigación — Atrapasueños Recreación

**Fecha:** 4 de agosto de 2026  
**Objetivo:** Buscar imágenes del proyecto Atrapasueños Recreación en internet para documentar el convenio con Mandrágora.

---

## Perfil de Facebook

| Dato | Detalle |
|------|---------|
| **URL** | [facebook.com/atraparecreacion](https://www.facebook.com/atraparecreacion) |
| **Handle** | @atraparecreacion |
| **Seguidores** | 3,4 mil |
| **Categoría** | Arte y entretenimiento |
| **WhatsApp** | +598 94 665 604 |
| **Email** | atrapasue.eventos@gmail.com |
| **Ubicación** | Montevideo, Uruguay |
| **Descripción** | Empresa creada por estudiantes de arte dramático y otras disciplinas |

## Obra destacada

**"ATRAPADA EN LA PANTALLA"** — obra teatral con fotos en la galería del perfil.

## Imágenes obtenidas

### Galería de Facebook

Se extrajeron **22 URLs** de fotos desde la sección de fotos del perfil (thumbnails 206×206 px, formato WebP alojados en CDN de Facebook). Las fotos muestran escenas teatrales, utilería, vestuario y actividades del grupo.

### Archivos guardados en el proyecto

| Archivo | Ubicación | Tamaño | Descripción |
|---------|-----------|--------|-------------|
| `atrapasuenos-perfil-facebook.png` | `assets/images/Convenios/` | 260 KB | Captura de pantalla del perfil completo de Facebook |
| `atrapasuenos-foto-ejemplo.jpg` | `assets/images/Convenios/` | 518 KB | Foto a tamaño completo (949×960 px) de la obra "ATRAPADA EN LA PANTALLA" |

### Imágenes preexistentes en el proyecto

La carpeta `assets/images/atrapadaenlapantalla/` ya contenía **7 imágenes** (WhatsApp Images del 14/06/2026) relacionadas con la obra, más `assets/images/Convenios/atrapa.jpg` y `assets/images/obra-atrapada.jpg`.

## Método

Se utilizó automatización de navegador (ZCode In-app Browser + Playwright) para:

1. Navegar a Google Images con la consulta "atrapasueños recreación"
2. Identificar el perfil de Facebook como fuente principal de imágenes
3. Abrir el perfil y extraer datos mediante `domSnapshot()` (árbol ARIA)
4. Navegar a la sección de fotos y extraer 22 URLs de imágenes con `playwright.evaluate()`
5. Ingresar a una foto individual para obtener la versión a tamaño completo
6. Guardar capturas en disco para referencia visual

## Datos de contacto para el sitio

El perfil de Facebook proporciona datos verificables que pueden incorporarse a la página de convenios:

- **WhatsApp:** [+598 94 665 604](https://api.whatsapp.com/send?phone=%2B59894665604)
- **Email:** atrapasue.eventos@gmail.com
- **Facebook:** [@atraparecreacion](https://www.facebook.com/atraparecreacion)
- **Categoría:** Arte y entretenimiento
- **Ubicación:** Montevideo
