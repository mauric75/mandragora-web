---
marp: true
theme: uncover
class:
  - lead
paginate: true
backgroundColor: '#111624'
color: '#e6ded5'
headingColor: '#CE9A47'
style: |
  :root {
    --color-background: #111624;
    --color-foreground: #e6ded5;
    --color-highlight: #CE9A47;
    --color-dim: rgba(230,222,213,0.65);
    font-family: 'Segoe UI', system-ui, sans-serif;
  }
  h1 { color: #CE9A47; }
  h2 { color: #CE9A47; }
  strong { color: #e6ded5; }
  code { color: #e0b85a; background: #1a1f23; padding: 0.1em 0.3em; border-radius: 3px; }
  table { font-size: 0.7em; margin: 0 auto; }
  th { color: #CE9A47; border-bottom: 1px solid rgba(206,154,71,0.3); }
  td { color: rgba(230,222,213,0.7); }
  a { color: #CE9A47; }
  ul, ol { text-align: left; }
  li { margin: 0.3em 0; }
  .emoji { font-size: 1.5em; }
  .small { font-size: 0.6em; color: rgba(230,222,213,0.4); }
---

# 🎭 Administración de Mandrágora
## Guía del Panel de Control

*Sistema de gestión de contenido para el sitio web*

---

## ¿Qué es Mandrágora?

- 🎭 **Teatro** — Sala caja negra, 500 personas
- 🎓 **Escuela de Artes** — 15+ talleres y disciplinas
- 🎪 **Compañía Teatral** — Producciones originales
- 🎬 **Cine Viajero** — Festival itinerante

**Montevideo, Uruguay**
Javier Barrios Amorín 1312

---

## Acceso al Panel

| Dato | Valor |
|------|-------|
| **URL** | `admin.html` |
| **Sesión** | 30 minutos |
| **Roles** | Admin · Editor · Consulta |

1. Entrar a `admin.html`
2. Ingresar contraseña
3. Cerrar sesión al terminar

> 📖 Manual completo en `manual.html`
> ⚡ Guía rápida en `guia-rapida.html`

---

## Vista General — Dashboard

Al entrar ves **4 indicadores**:

| Indicador | ¿Qué mide? |
|-----------|-------------|
| **Reservas totales** | Todas las recibidas |
| **Pendientes** | Sin contactar aún |
| **Noticias publicadas** | Visibles al público |
| **Docentes activos** | Marcados como activos |

Cada número te lleva a la pestaña correspondiente para ver el detalle.

---

## Las 7 Pestañas

| # | Pestaña | ¿Para qué? |
|---|---------|------------|
| 1 | 📅 **Reservas** | Ver reservas recibidas |
| 2 | 📄 **Noticias** | Publicar noticias |
| 3 | 👥 **Docentes** | Gestionar profesores |
| 4 | 📅 **Agenda** | Cartelera de eventos |
| 5 | 🎭 **Obras** | Obras de la compañía |
| 6 | 🔔 **Push** | Notificaciones |
| 7 | 🤖 **Chat IA** | Asistente inteligente |

---

## 📄 Noticias

**Campos importantes:**

- **Título** (requerido, máx. 200)
- **Texto** (requerido)
- **Tipo** — Anuncio o Prensa
- **Imagen** — URL o archivo
- **Publicada ✅** — ⚠️ Sin marcar no se ve
- **Avisar por push** — Notificar seguidores

> Las noticias aparecen en `/noticias.html` y en la cartelera del inicio.

---

## 📅 Agenda (Eventos)

**Campos importantes:**

- **Título** (requerido)
- **Fecha** (requerido) — Formato: `2026-08-15`
- **Hora**, Tipo, Categoría, Descripción
- **Link de tickets** — URL o `pagar.html`
- **Publicado ✅** — ⚠️ Sin marcar no se ve

> 💡 Eventos pasados no se borran solos. Eliminalos manualmente.

---

## 👥 Docentes

**Campos importantes:**

- **Nombre** (requerido, máx. 80)
- **Rol / Disciplinas** (requerido)
- **Foto** — URL o archivo
- **WhatsApp** — `59898914088`
- **Precio ($)** — Pesos uruguayos
- **Activo ✅** — ⚠️ Sin marcar no aparece

> 💡 Para ocultar sin borrar: desmarcá Activo.

---

## 🎭 Obras

**Campos importantes:**

- **Título** (requerido)
- **Estado** — En cartel · Próximo estreno · Histórica
- Sinopsis, Elenco, Dirección
- **Imágenes** — ⚠️ Distinto: URL → clic **"+ Agregar"**

| Estado | Se muestra como |
|--------|-----------------|
| Presente | 🟢 En cartel |
| Futura | 🔵 Próximamente |
| Pasada | ⚪ Histórica |

---

## 📋 Reservas

**Filtros:**
`Todas | Sala | Talleres | Entradas | Consultas`

**Estados:**

| Estado | Color |
|--------|-------|
| Pendiente | 🟡 Amarillo |
| Contactada | 🔵 Azul |
| Confirmada | 🟢 Verde |
| Cancelada | 🔴 Rojo |

> 💡 Contactá por WhatsApp (el número está en la tabla).

---

## 🔔 Notificaciones Push

Llegan al celular de seguidores que instalaron la web.

**Campos:**
- **Título** — Máx. 60 caracteres
- **Mensaje** — Máx. 200 caracteres  
- **Link** — Opcional (ej: `/agenda.html`)

> 💡 **Más fácil:** al crear una noticia, marcá "Avisar por push" y se envía automáticamente.

---

## 🤖 Chat IA — Tu asistente

**Consultas:**
- *"¿Cuántas reservas pendientes hay?"*
- *"¿Cuál es el próximo evento?"*
- *"¿Qué obras están en cartel?"*

**Acciones:**
- *"Creá un evento para el sábado a las 21hs"*
- *"Redactá una noticia sobre el estreno"*
- *"Cambiá La Sed a Histórica"*

> 💡 Sé específico. Adjuntá imágenes con 📎 o Ctrl+V.

---

## ⚡ Referencia Rápida

| Tarea | ¿Con qué? |
|-------|-----------|
| Noticia simple | Formulario |
| Noticia larga/formal | **Chat IA** |
| Agregar evento | Formulario |
| Ver resumen de reservas | **Chat IA** |
| Cambiar precio taller | **Chat IA** |
| Cruzar datos | **Solo Chat IA** |
| Enviar push | Formulario |
| Subir fotos | Formulario |

---

## 🚫 Importante

- ⚠️ **Borrar no se deshace** — sin papelera
- ⚠️ **Publicada/Activo ✅** — siempre marcar para que se vea
- ⚠️ **Sesión caduca** — 30 minutos, solo volver a entrar
- ⚠️ **Fecha siempre:** `AAAA-MM-DD` con guiones

---

## 📞 Contacto

- **Desarrollador:** Mauricio
- **Manual completo:** `manual.html`
- **Guía rápida:** `guia-rapida.html`
- **Email:** info@mandragora.uy

<br>

## 🎭 Mandrágora
*Teatro · Escuela de Artes · Centro Cultural*
