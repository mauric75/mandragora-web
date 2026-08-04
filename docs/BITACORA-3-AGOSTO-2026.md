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

### 14. Fix: teléfono e Instagram intrusos en el header
- El `<p>` con 📞 091 508455 y @teatromandragora_uy se había colado dentro del `<header>` en 10 páginas, deformando la navegación
- Corregido en: agenda, cine-viajero, compania, comunidad, contacto, escuela, galeria, noticias, reservar, sala
- `index.html` ya estaba corregido previamente
- También se corrigió el Instagram en el footer de `nosotros.html` (@mandragoracasa → @teatromandragora_uy)
- **Commits:** `6971519`, `20226ef`

### 15. Fix: texto duplicado y HTML roto en hero de portada
- "Donde la magia ocurre" aparecía repetido (ya está en el eyebrow "DONDE LA MAGIA OCURRE")
- Además el HTML del hero tenía etiquetas mal cerradas (texto suelto fuera del `<p>`)
- **Commit:** `d426bbe`

### 16. Fotos y biografías de docentes
- **Pitufo Lombardo** (Edú Lombardo): foto de Wikipedia Commons + biografía enriquecida con trayectoria, premios, Instagram (@pitufolombardouy)
- **Camilo Abellá**: foto aportada por el usuario (`camilo-abella.jpg`)
- **Katia Zacarían**: foto aportada por el usuario (`Katia Zacarían.png`)
- **Iván Solarich**: foto aportada por el usuario (`Ivan-Solarich.jpg`)
- **Agustín Camacho**: foto + rol "Director de Infernum" (`agustin-camacho-id.jpg`)
- **Lucía Caballero**: foto aportada por el usuario (`Lucía Caballero.jpg`)
- **Javiera Torres**: foto aportada por el usuario (`Javiera-Torres.png`)
- **Carlos Vesperoni**: foto aportada por el usuario (`Carlos-Vesperoni.jpg`)
- **Florencia De Armas**: foto + corrección de nombre completo (`Florencia-De-Armas.png`)
- Quedan pendientes: Gustavo Carapuchet y Jonás de León (Mandrágora enviará el material)
- **Commits:** `c0360d7`, `595e68c`, `48c6d96`, `a9aadef`, `fa0dde3`, `f357cc3`, `3e24886`

### 17. Hero images en páginas que no tenían
- Agregado `<section class="section-hero">` con imagen + degradado inferior a 5 páginas:
  - `agenda.html` → `festival.jpg` (también ajustado padding del page-header)
  - `noticias.html` → `comunidad.jpg` (también agregado CSS faltante)
  - `galeria.html` → `escuela.jpg` (también agregado CSS faltante)
  - `reservar.html` → `sala.jpg` (también agregado CSS faltante)
  - `nosotros.html` → `nosotros-hero.jpg` (migrado de `<img class="hero-img">` a section-hero estándar)
- **Rama:** `feature/hero-images` → main
- **Commit merge:** `d1b3008`
## Archivos modificados
- `index.html` — dropdown Convenios, SUNCA, fix blank line, fix alt text, fix teléfono/IG header, fix texto duplicado hero
- `escuela.html` — dropdown, SUNCA, nav effects, fix blank line, fix alt text, título del reel, fix teléfono/IG header
- `sala.html` — dropdown, SUNCA, fix blank line, fix alt text, fix logo link, fix teléfono/IG header
- `compania.html` — dropdown, SUNCA, fix blank line, fix alt text, fix teléfono/IG header
- `nosotros.html` — dropdown, SUNCA, nav effects, fix IG footer, hero image estándar
- `comunidad.html` — dropdown, SUNCA, fix blank line, fix alt text, fix teléfono/IG header
- `cine-viajero.html` — dropdown, SUNCA, fix blank line, fix alt text, fix teléfono/IG header
- `agenda.html` — dropdown, SUNCA, fix blank line, fix alt text, fix teléfono/IG header, hero image + spacing
- `noticias.html` — dropdown, SUNCA, fix blank line, fix teléfono/IG header, hero image
- `galeria.html` — dropdown, SUNCA, fix blank line, fix teléfono/IG header, hero image
- `contacto.html` — dropdown, SUNCA, fix blank line, fix alt text, fix teléfono/IG header
- `reservar.html` — dropdown, SUNCA, fix teléfono/IG header, hero image
- `convenio-sunca.html` — creado (nueva página)
- `data/docentes.json` — fotos y biografías de 9 docentes
- `assets/images/docentes/` — 10 imágenes nuevas de docentes
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
14. `6971519` — Quita teléfono e IG intrusos del header de index.html
15. `c0360d7` — Foto y biografía enriquecida de Pitufo Lombardo
16. `595e68c` — Agrega foto de Camilo Abellá
17. `48c6d96` — Agrega foto de Katia Zacarían
18. `258ae57` — Agrega foto de Iván Solarich
19. `a9aadef` — Agrega foto de Agustín Camacho (Director de Infernum)
20. `20226ef` — Quita teléfono e IG intrusos del header en 10 páginas + corrige IG en footer de nosotros
21. `fa0dde3` — Agrega fotos de Lucía Caballero y Javiera Torres
22. `f357cc3` — Agrega foto de Carlos Vesperoni
23. `3e24886` — Agrega foto de Florencia De Armas
24. `d426bbe` — Quita texto duplicado y HTML roto en hero de portada
25. `d1b3008` — Hero images en 5 páginas (agenda, noticias, galeria, reservar, nosotros)

## Ramas temporales
- `fix/blank-line-after-body` — fixes 10 y 11, mergeada a main
- `feature/hero-images` — heroes en 5 páginas, mergeada a main

## Producción
🔗 https://mauric75.github.io/mandragora-web
🔗 https://deploy-phi-wheat.vercel.app
