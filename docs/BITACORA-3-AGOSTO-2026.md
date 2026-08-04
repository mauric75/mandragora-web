# Bitácora — 3 de agosto 2026

## Cambios realizados

### 1. Dropdown "Convenios" en el menú principal
- Nuevo dropdown entre Compañía y Nosotros con dos items:
  - Cine Viajero
  - Atrapasueños Recreación
- "Cine Viajero" removido del dropdown de Nosotros (ahora: Historia, Comunidad, Contacto)
- Aplicado en 12 páginas: index, escuela, sala, compania, nosotros, comunidad, cine-viajero, agenda, noticias, galeria, contacto, reservar
- **Commit:** `1fbeb36`

### 2. Página y link del Convenio SUNCA
- Nueva página `convenio-sunca.html` con el contenido completo del convenio Mandrágora – Fondo Social de la Construcción (SUNCA)
- Tres pilares: talleres compartidos, muestras artísticas, democratización cultural
- Agregado "SUNCA" al dropdown Convenios en los 13 archivos
- **Commit:** `2e81f56`

### 3. Imagen hero del convenio SUNCA
- Cambiada `fachada.jpg` por `assets/images/Convenios/sunca-mandragora.jpg`
- **Commit:** `f041920`

### 4. Subida de la imagen SUNCA al repo
- La imagen existía localmente pero no estaba trackeada en git → no se veía en producción
- **Commit:** `797bc55`

### 5. Efecto section-hero en convenio-sunca.html
- Contenedor `.section-hero` con altura fija (40vh), `object-fit: cover` y degradado inferior que se funde con el fondo
- Igual al efecto de `contacto.html`
- **Commit:** `8efd5ff`

### 6. Efecto scroll blur en nav de convenio-sunca.html
- Nav transparente al inicio, se activa blur + borde inferior al hacer scroll (>50px)
- Clase `.is-scrolled` toggleada por JS
- **Commit:** `d540040`

### 7. Fondo sutil inicial en nav para contraste
- Agregado `background: rgba(255,255,255,0.25)` en light y `rgba(0,0,0,0.3)` en dark
- Soluciona que el texto del nav no se leía sobre la imagen hero sin scrollear
- **Commit:** `bdecc21`

### 8. Mismos efectos de nav en escuela.html
- Fondo sutil inicial + scroll blur aplicados a `escuela.html`
- **Commit:** `1e4b782`

### 9. Mismos efectos de nav en nosotros.html
- `nosotros.html` tenía el nav viejo con fondo sólido fijo → migrado al nuevo sistema con `.is-scrolled`
- **Commit:** `6f33377`

### 10. Fix: línea en blanco después de `<body>`
- 10 archivos tenían un salto de línea extra después de `<body>` que generaba espacio visible arriba
- Corregido en: index, escuela, sala, compania, comunidad, cine-viajero, agenda, noticias, galeria, contacto
- **Rama:** `fix/blank-line-after-body` → main
- **Commit:** `5b6df18`

### 11. Fix: alt text visible al cargar imágenes hero
- Las imágenes `.section-hero` mostraban su `alt` por unos segundos mientras cargaban
- Solución: `color: transparent` en el CSS de `.section-hero img`
- Aplicado en 8 archivos: agenda, cine-viajero, compania, comunidad, contacto, convenio-sunca, escuela, sala
- **Commit:** `565908b`

### 12. Fix: link del logo en sala.html
- El logo de Mandrágora en `sala.html` apuntaba a `#hero` en vez de `index.html`
- Corregido a `href="index.html"`
- **Commit:** `c0d32ae`

### 13. Título del reel de presentación en escuela.html
- Escuchado el reel `assets/videos/reel-presentacion.mp4` (59,5s) vía transcripción Vosk (el modelo no puede ver imágenes)
- Qué dice el reel: "Cuando era niña soñaba con ser actriz y así llegué al teatro. En Mandrágora tenemos todas las herramientas a tu disposición para hacer realidad tu sueño de actuar. Los lunes y miércoles 18:30 horas acá en Escuela Teatro"
- El título anterior ("Taller de actuación en acción") era heredado del viejo link de Instagram y no coincidía con el contenido
- Nuevo título: "Hacé realidad tu sueño de actuar" / subtítulo "Clases de teatro: lunes y miércoles 18:30 hs"
- Elegido por el usuario (Opción A entre 3 propuestas basadas en el contenido del reel)
- Aplicado en `escuela.html` líneas 691-692
- **Commit:** `b00dd2c`
## Archivos modificados
- `index.html` — dropdown Convenios, SUNCA, fix blank line, fix alt text
- `escuela.html` — dropdown, SUNCA, nav effects, fix blank line, fix alt text, título del reel
- `sala.html` — dropdown, SUNCA, fix blank line, fix alt text, fix logo link
- `compania.html` — dropdown, SUNCA, fix blank line, fix alt text
- `nosotros.html` — dropdown, SUNCA, nav effects
- `comunidad.html` — dropdown, SUNCA, fix blank line, fix alt text
- `cine-viajero.html` — dropdown, SUNCA, fix blank line, fix alt text
- `agenda.html` — dropdown, SUNCA, fix blank line, fix alt text
- `noticias.html` — dropdown, SUNCA, fix blank line
- `galeria.html` — dropdown, SUNCA, fix blank line
- `contacto.html` — dropdown, SUNCA, fix blank line, fix alt text
- `reservar.html` — dropdown, SUNCA
- `convenio-sunca.html` — creado (nueva página)
- `assets/images/Convenios/sunca-mandragora.jpg` — subida al repo

## Commits del día (main)
1. `1fbeb36` — Agrega dropdown Convenios al nav y saca Cine Viajero de Nosotros
2. `2e81f56` — Agrega pagina y link de Convenio SUNCA al dropdown Convenios
3. `f041920` — Cambia hero image de convenio-sunca por sunca-mandragora.jpg
4. `797bc55` — Sube imagen sunca-mandragora.jpg para pagina de convenio
5. `8efd5ff` — Agrega efecto section-hero con degradado a pagina convenio SUNCA
6. `d540040` — Agrega efecto scroll blur al nav de convenio SUNCA
7. `bdecc21` — Agrega fondo sutil inicial al nav para mejorar contraste
8. `1e4b782` — Agrega fondo sutil inicial al nav de escuela para mejorar contraste
9. `6f33377` — Agrega efectos de nav (fondo sutil inicial + scroll blur) a nosotros
10. `5b6df18` — Elimina linea en blanco despues de body en 10 archivos
11. `565908b` — Oculta alt text en section-hero img mientras carga la imagen
12. `c0d32ae` — Corrige link del logo en sala.html: index.html en vez de #hero
13. `b00dd2c` — Actualiza título y subtítulo del reel de presentación

## Rama temporal
- `fix/blank-line-after-body` — fixes 10 y 11, mergeada a main

## Producción
🔗 https://mauric75.github.io/mandragora-web
🔗 https://deploy-phi-wheat.vercel.app
