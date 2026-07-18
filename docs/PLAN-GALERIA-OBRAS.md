# Plan técnico — Transformar galería en espacio de obras

**Fecha:** 2026-07-18  
**Estado:** Planificación — a implementar por Claude  
**Rama:** main

---

## 1. Diagnóstico

### 1.1 Lo que ya existe (hecho por Claude)

| Recurso | Estado |
|---------|--------|
| `data/obras.json` | ✅ Creado con 3 obras (Atrapada en la pantalla, Con las manos atadas, La inevitable crisis del actor) |
| `api/docentes.js` | ✅ Extendido para manejar `resource: "obra"` (list público, save/delete con auth, upload de imágenes) |
| Schema de obra | ✅ `id, titulo, descripcion, estado (pasada/presente/futura), fecha_texto, imagenes (array)` |

### 1.2 Lo que falta

| Recurso | Estado |
|---------|--------|
| `galeria.html` | ❌ Estático: 11 imágenes hardcodeadas en masonry |
| `compania.html` | ❌ Sección "Nuestras obras" con 3 `.obra-card` hardcodeadas |
| `admin.html` | ❌ Sin pestaña para gestionar obras |
| Chat IA | ❌ Sin herramientas para obras |

### 1.3 Endpoint disponible

```
POST /api/docentes
Body: { resource: "obra", action: "list" | "save" | "delete", obra?: {...}, id?: "..." }

list → público, devuelve { ok: true, obras: [...] }
save → requiere cookie de sesión (admin/editor)
delete → solo admin
```

---

## 2. Plan de implementación

### 2.1 `galeria.html` → galería dinámica de obras

**Objetivo:** Reemplazar las 11 imágenes estáticas por contenido cargado desde la API.

**Cambios HTML:**
Reemplazar `<section class="masonry reveal">` + 11 `<img>` por:
```html
<section class="masonry reveal" id="galeria-grid"></section>
```

**JavaScript (insertar antes de `</body>`):**
```javascript
fetch('/api/docentes', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({resource: 'obra', action: 'list'})
})
.then(r => r.json())
.then(data => {
  var obras = data.obras || [];
  var grid = document.getElementById('galeria-grid');
  
  obras.forEach(function(obra) {
    var imagenes = obra.imagenes || [];
    if (!imagenes.length) return;
    
    imagenes.forEach(function(img, i) {
      var el = document.createElement('img');
      el.src = img;
      el.alt = obra.titulo + (imagenes.length > 1 ? ' (' + (i+1) + ')' : '');
      el.loading = 'lazy';
      grid.appendChild(el);
    });
  });
  
  // Actualizar contador de fotos
  var total = grid.querySelectorAll('img').length;
  document.querySelector('.page-header p').textContent = total + ' fotos';
  
  // Re-conectar lightbox y animaciones reveal
  // (reutilizar código existente en galeria.html)
})
```

**CSS:** Sin cambios. Masonry grid y lightbox se mantienen idénticos.

**Imágenes generales** (compania.jpg, fachada.jpg, etc.): Se eliminan. La galería se dedica exclusivamente a obras.

---

### 2.2 `compania.html` → sección "Nuestras obras" dinámica

**Objetivo:** Que las cards de obras se carguen desde la API.

**Cambios HTML:**
Reemplazar las 3 `<article class="obra-card reveal">` por:
```html
<div class="obras__grid" id="obras-grid"></div>
```

**JavaScript:**
```javascript
fetch('/api/docentes', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({resource: 'obra', action: 'list'})
})
.then(r => r.json())
.then(data => {
  var obras = data.obras || [];
  var grid = document.getElementById('obras-grid');
  
  obras.forEach(function(obra) {
    var img = obra.imagenes && obra.imagenes[0] 
      ? '<img src="' + escAttr(obra.imagenes[0]) + '" alt="' + escAttr(obra.titulo) + '" loading="lazy">'
      : '';
    
    grid.innerHTML += 
      '<article class="obra-card reveal">' +
        '<div class="obra-card__image">' + img + '</div>' +
        '<div class="obra-card__body">' +
          '<span class="obra-card__tag">' + escHtml(obra.estado) + '</span>' +
          '<h3>' + escHtml(obra.titulo) + '</h3>' +
          '<p>' + escHtml(obra.descripcion || '') + '</p>' +
          '<span class="obra-card__meta">' + escHtml(obra.fecha_texto || '') + '</span>' +
        '</div>' +
      '</article>';
  });
})
```

**CSS:** Sin cambios. Mismas clases `.obra-card`, `.obra-card__image`, `.obra-card__tag`.

---

### 2.3 `admin.html` → pestaña "Obras"

**Objetivo:** Agregar gestión CRUD de obras al panel admin.

**Tab button** (insertar después de Agenda, antes de Push):
```html
<button data-tab="obras">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
  <span>Obras</span>
</button>
```

**Tab panel** (insertar antes de Push):
```html
<section class="tab-panel" id="tab-obras">
  <h2>Nueva obra</h2>
  <label>Título</label>
  <input type="text" id="obra-titulo" maxlength="100">
  <label>Descripción</label>
  <textarea id="obra-descripcion" maxlength="500"></textarea>
  <label>Estado</label>
  <select id="obra-estado">
    <option value="presente">En cartel</option>
    <option value="futura">Próximo estreno</option>
    <option value="pasada">Histórica</option>
  </select>
  <label>Fecha / Temporada</label>
  <input type="text" id="obra-fecha" placeholder="Julio 2026 . Sábados 16hs">
  <label>Imágenes (URLs, una por línea)</label>
  <textarea id="obra-imagenes" placeholder="assets/images/obra-foto1.jpg&#10;assets/images/obra-foto2.jpg"></textarea>
  <input type="hidden" id="obra-id">
  <div style="display:flex;gap:0.5rem">
    <button class="primary" id="obra-save">Guardar obra</button>
    <button class="secondary" id="obra-cancel" style="display:none">Cancelar</button>
  </div>
  <div class="msg" id="obra-msg"></div>
  <h2 style="margin-top:2rem">Obras existentes</h2>
  <div id="obras-list"></div>
</section>
```

**JavaScript:** Mismo patrón que docentes/agenda — `loadObras()`, `renderObras()`, `resetObraForm()`.  
Clave: todas las llamadas incluyen `resource: "obra"`.

```javascript
api('/api/docentes', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({resource: 'obra', action: 'list'})
})
```

---

### 2.4 Chat IA — herramientas para obras

Agregar a `api/ai-admin/chat.js`:

**Tools:**
- `listar_obras` — "qué obras hay en cartel?"
- `crear_obra` — admin/editor
- `actualizar_obra` — admin/editor
- `borrar_obra` — solo admin

**ExecuteTool:** Leer/escribir `data/obras.json` via GitHub API (mismo patrón que docentes/agenda).

---

## 3. Resumen de archivos

| Archivo | Cambio |
|---------|--------|
| `galeria.html` | Dinámico: carga obras desde API, masonry con imágenes de cada obra |
| `compania.html` | Dinámico: cards de obras desde API |
| `admin.html` | Nueva pestaña "Obras" con CRUD |
| `api/ai-admin/chat.js` | Herramientas IA para obras |

---

## 4. Lo que NO se toca

- `data/obras.json` — ya existe
- `api/docentes.js` — ya soporta obras
- CSS de `.obra-card`, `.masonry`, lightbox — sin cambios
- Las otras pestañas del admin — sin cambios
