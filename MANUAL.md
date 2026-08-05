# Manual de Uso — Panel de Administración Mandrágora

> **Para:** Pablo y equipo de Mandrágora
> **Versión:** 1.0 — Agosto 2026
> **Acceso:** https://deploy-phi-wheat.vercel.app/admin.html

---

## Índice

1. [Primeros pasos](#1-primeros-pasos)
2. [Vista general — Dashboard](#2-vista-general--dashboard)
3. [Noticias](#3-noticias)
4. [Agenda (Eventos)](#4-agenda-eventos)
5. [Docentes](#5-docentes)
6. [Obras](#6-obras)
7. [Reservas](#7-reservas)
8. [Notificaciones Push](#8-notificaciones-push)
9. [Chat con Inteligencia Artificial](#9-chat-con-inteligencia-artificial)
10. [Preguntas Frecuentes](#10-preguntas-frecuentes)
11. [Referencia rápida](#11-referencia-rápida)

---

## 1. Primeros Pasos

### 1.1 Cómo entrar al panel

1. Abrí tu navegador (Chrome, Edge, Firefox)
2. Entrá a: **https://deploy-phi-wheat.vercel.app/admin.html**
3. Ingresá tu contraseña y hacé clic en **Entrar**
4. Si es la primera vez que entrás desde ese navegador, guardá la página en favoritos ⭐

> 💡 **Tip:** También podés entrar desde cualquier página del sitio haciendo clic en "Admin" al final del footer.

### 1.2 La sesión

- La sesión dura **30 minutos**. Después de ese tiempo se cierra automáticamente.
- Si ves el mensaje "Sesión expirada", simplemente volvé a ingresar tu contraseña.
- Para cerrar sesión manualmente, hacé clic en **Cerrar sesión** (arriba a la derecha).

### 1.3 Navegación del panel

El panel tiene **7 pestañas** (tabs) en la parte superior. Hacé clic en cada una para cambiar de sección:

| Pestaña | Ícono | ¿Para qué sirve? |
|---------|-------|------------------|
| **Reservas** | 📅 | Ver todas las reservas recibidas |
| **Noticias** | 📄 | Publicar y gestionar noticias |
| **Docentes** | 👥 | Gestionar los profesores y talleres |
| **Agenda** | 📅 | Administrar la cartelera de eventos |
| **Obras** | 🎭 | Gestionar las obras de la compañía |
| **Push** | 🔔 | Enviar notificaciones a los seguidores |
| **Chat IA** | 🤖 | Asistente inteligente para ayudarte |

---

## 2. Vista General — Dashboard

Al entrar al panel, lo primero que ves son **4 números** grandes:

| Indicador | ¿Qué mide? |
|-----------|-------------|
| **Reservas totales** | Cuántas reservas se recibieron en total |
| **Pendientes** | Cuántas reservas todavía no fueron contactadas |
| **Noticias publicadas** | Cuántas noticias están visibles al público |
| **Docentes activos** | Cuántos profesores están marcados como activos |

Estos números te dan un pantallazo rápido de cómo está todo. Para ver el detalle, andá a la pestaña correspondiente.

---

## 3. Noticias

### 3.1 ¿Dónde se ven las noticias?

Las noticias que publiques aparecen en:
- La **página de Noticias** del sitio (`/noticias.html`)
- La **cartelera** de la página principal (la última noticia publicada, ese cartelito inclinado en el hero)

### 3.2 Crear una noticia nueva

1. Andá a la pestaña **Noticias**
2. Completá el formulario:
   - **Título** (obligatorio, máximo 200 caracteres)
   - **Texto** (obligatorio, podés escribir todo lo necesario)
   - **Tipo**: Elegí entre "Anuncio" o "Prensa"
   - **Link externo**: Si la noticia está en otro lado (ej: un medio), pegá la URL acá
   - **Imagen**: Podés pegar una URL de internet o subir un archivo desde tu computadora
   - **Publicada**: ✅ Marcá esta casilla para que se vea en el sitio. Si la dejás sin marcar, queda como borrador
   - **Avisar por push**: Si la marcás, se envía una notificación a todos los seguidores
3. Hacé clic en **Guardar noticia**

> ⚠️ **Importante:** Para que una noticia aparezca en el sitio, la casilla **Publicada** DEBE estar marcada.

### 3.3 Editar una noticia

1. En la lista de noticias, hacé clic en **Editar** sobre la noticia que quieras modificar
2. El formulario se llena con los datos actuales
3. Hacé los cambios que necesites
4. Hacé clic en **Guardar cambios**
5. Para cancelar, hacé clic en **Cancelar**

### 3.4 Borrar una noticia

1. Hacé clic en **Borrar** sobre la noticia
2. Confirmá en la ventana que aparece
3. ⚠️ Esta acción no se puede deshacer

### 3.5 Notificaciones push automáticas

Cuando creás o editás una noticia con las casillas **Publicada** ✅ y **Avisar por push** ✅ marcadas, el sistema envía automáticamente una notificación a todos los que tienen la app/web instalada en su celular. El título será el de la noticia y el texto los primeros 120 caracteres.

---

## 4. Agenda (Eventos)

### 4.1 ¿Dónde se ven los eventos?

Los eventos que crees aparecen en la **página Agenda** del sitio (`/agenda.html`), ordenados por fecha y agrupados por mes.

### 4.2 Crear un evento

1. Andá a la pestaña **Agenda**
2. Completá el formulario:
   - **Título** (obligatorio) — Ej: "La Sed — Estreno"
   - **Fecha** (obligatorio) — Formato: AAAA-MM-DD. Ej: `2026-08-15`
   - **Hora** (opcional) — Ej: `21:00`
   - **Tipo** — Ej: "Teatro · Evento especial"
   - **Categoría** — Ej: "Compañía Mandrágora"
   - **Descripción** — Texto descriptivo del evento
   - **Link de tickets** — URL donde se compran entradas, o `pagar.html`
   - **Texto del botón** — Lo que dice el botón. Ej: "Entradas", "Estreno"
   - **Publicado** — ✅ Marcá para que se vea en el sitio
3. Hacé clic en **Guardar evento**

> 💡 **Tip para la fecha:** Siempre escribila como `2026-08-15` (año-mes-día con guiones). Así: primero el año, después el mes, después el día.

### 4.3 Editar un evento

1. En la lista de eventos, hacé clic en **Editar**
2. Modificá lo que necesites
3. Hacé clic en **Guardar cambios**

### 4.4 Borrar un evento

1. Hacé clic en **Borrar**
2. Confirmá la acción
3. ⚠️ No se puede deshacer

### 4.5 Ojo con la fecha

Los eventos se ordenan automáticamente por fecha (del más cercano al más lejano). Los eventos con fecha pasada no desaparecen solos — si ya ocurrieron, **borralos manualmente** para mantener la agenda limpia.

---

## 5. Docentes

### 5.1 ¿Dónde se ven los docentes?

Los docentes aparecen en:
- La **página Escuela** (`/escuela.html`) — grid de cards con foto, nombre, rol y trayectoria
- La **página Compañía** (`/compania.html`) — sección Elenco
- El **sistema de reservas** (`/reservar.html`) — como opciones al elegir "Inscripción a taller"

### 5.2 Agregar un docente nuevo

1. Andá a la pestaña **Docentes**
2. Completá:
   - **Nombre** (obligatorio, máximo 80 caracteres)
   - **Rol / Disciplinas** (obligatorio) — Ej: "Actuación · Clown"
   - **Foto**: Dos opciones:
     - Pegar una URL de internet en el campo de texto
     - O usar el botón de archivo para subir una foto desde tu computadora (se guarda automáticamente)
   - **Frase** — Una cita o frase corta del docente (máximo 200 caracteres)
   - **Trayectoria** — Texto más largo con su experiencia (máximo 300 caracteres)
   - **Instagram** — Ej: `@usuario`
   - **WhatsApp** — Ej: `59898914088` (sin espacios ni guiones)
   - **Precio del taller ($)** — En pesos uruguayos
   - **Activo** — ✅ Marcá para que aparezca en el sitio
3. Hacé clic en **Guardar docente**

> 🖼️ **Para la foto:** Si subís un archivo, se muestra una vista previa antes de guardar. Si preferís usar una URL, asegurate de que la imagen esté disponible (ej: alojada en el mismo sitio en `assets/images/`).

### 5.3 Editar un docente

Mismo proceso que noticias y agenda: clic en **Editar**, modificá, **Guardar cambios**.

### 5.4 Ocultar un docente (sin borrarlo)

Si un docente deja de dar clases temporalmente, editá su ficha y **desmarcá la casilla Activo**. El docente no se mostrará en el sitio pero sus datos se conservan. Cuando vuelva, solo tenés que volver a marcar la casilla.

### 5.5 Borrar un docente

Clic en **Borrar** → confirmar. ⚠️ No se puede deshacer.

---

## 6. Obras

### 6.1 ¿Dónde se ven las obras?

En la **página Compañía** (`/compania.html`) y en la **Galería** (`/galeria.html`).

### 6.2 Estados de una obra

Cada obra tiene un **estado** que determina cómo se muestra:

| Estado | Significado | Se muestra como |
|--------|-------------|-----------------|
| **En cartel** (presente) | Se está presentando ahora | Badge verde "En cartel" |
| **Próximo estreno** (futura) | Se va a estrenar pronto | Badge azul "Próximamente" |
| **Histórica** (pasada) | Ya no está en cartel | Badge gris "Histórica" |

### 6.3 Agregar una obra

1. Andá a la pestaña **Obras**
2. Completá:
   - **Título** (obligatorio)
   - **Descripción** — Texto breve (máximo 500 caracteres)
   - **Sinopsis** — Resumen más detallado (máximo 300 caracteres)
   - **Elenco** — Lista de actores
   - **Dirección** — Nombre del director/a
   - **Estado** — Elegí entre "En cartel", "Próximo estreno" o "Histórica"
   - **Fecha / Temporada** — Ej: "Julio 2026"
   - **Imágenes**: Podés agregar varias. Escribí o subí una URL, luego clic en **"+ Agregar imagen a la obra"**. La imagen aparece abajo como miniatura. Repetí para agregar más.
3. Hacé clic en **Guardar obra**

> ⚠️ **Importante sobre imágenes:** Las imágenes de obras se manejan distinto a las de docentes. Tenés que escribir/pegar la URL, hacer clic en "+ Agregar imagen a la obra", y recién ahí se suma a la lista. Podés agregar varias. Para quitar una, clic en "Quitar" debajo de la miniatura.

### 6.4 Cuando una obra deja de estar en cartel

Editá la obra y cambiá el estado de "En cartel" a **"Histórica"**. La obra se moverá a la sección de obras pasadas automáticamente.

---

## 7. Reservas

### 7.1 ¿Cómo llegan las reservas?

Las reservas las hacen los visitantes desde la página `/reservar.html`. Completan un formulario con:
- Tipo de servicio (sala, taller, entrada, consulta)
- Fecha
- Nombre, WhatsApp, email y mensaje

Al enviar, el sistema:
1. Abre WhatsApp con un mensaje pre-armado
2. Guarda la reserva en la base de datos

### 7.2 Revisar reservas

1. Andá a la pestaña **Reservas**
2. Ves una tabla con todas las reservas recibidas
3. Podés filtrar por tipo usando los botones de arriba:
   - **Todas** — Sin filtro
   - **Sala** — Solo reservas de sala
   - **Talleres** — Solo inscripciones a talleres
   - **Entradas** — Solo compra de entradas
   - **Consultas** — Solo consultas generales

### 7.3 Estados de una reserva

Cada reserva tiene un **estado** que se muestra con un color:

| Estado | Color | Significado |
|--------|-------|-------------|
| **Pendiente** | 🟡 Amarillo | Recibida, todavía no se contactó a la persona |
| **Contactada** | 🔵 Azul | Ya se habló con la persona |
| **Confirmada** | 🟢 Verde | La reserva está confirmada |
| **Cancelada** | 🔴 Rojo | La reserva fue cancelada |

### 7.4 ¿Qué hacer con una reserva nueva?

Actualmente el panel muestra las reservas pero **no permite cambiar el estado directamente desde la web**. El flujo recomendado es:

1. Revisá las reservas en el panel
2. Contactá a la persona por WhatsApp (el número aparece en la tabla)
3. Coordiná directamente
4. Para llevar registro de qué reservas ya fueron contactadas, usá el chat de IA (ver sección 9) o llevá un registro aparte

> 💡 **Consejo:** El Chat IA puede darte un resumen rápido. Probá preguntarle: *"¿Cuántas reservas pendientes hay?"* o *"Dame un resumen de las reservas de esta semana."*

---

## 8. Notificaciones Push

### 8.1 ¿Qué son?

Son notificaciones que llegan al celular de las personas que tienen instalada la web de Mandrágora como aplicación (PWA). Aparecen como una notificación normal del teléfono, incluso si no tienen el navegador abierto.

### 8.2 ¿Cómo se suscriben los visitantes?

En la mayoría de las páginas del sitio aparece un **botón de campanita** 🛎️ abajo a la derecha. Cuando un visitante hace clic y acepta, queda suscripto.

### 8.3 Enviar una notificación

1. Andá a la pestaña **Push**
2. Completá:
   - **Título** (máximo 60 caracteres) — Ej: "Este sábado: estreno de La Sed"
   - **Mensaje** (máximo 200 caracteres) — Ej: "No te pierdas el thriller psicológico de la Compañía Mandrágora. Entradas en mandragora.uy"
   - **Link** (opcional) — Ej: `/agenda.html` (la página a la que va cuando tocan la notificación)
3. Hacé clic en **Enviar a todos los suscriptos**
4. El sistema te dice cuántas notificaciones se enviaron

### 8.4 También desde Noticias

Como se explicó en la sección 3, al crear una noticia nueva podés marcar **"Avisar por push"** y se envía automáticamente. Es la forma más práctica para anunciar novedades.

### 8.5 ¿Cuántos suscriptores hay?

Actualmente el sistema no muestra un contador público de suscriptores. El Chat IA puede consultarlo si le pedís.

---

## 9. Chat con Inteligencia Artificial

### 9.1 ¿Qué es?

El panel tiene un asistente con inteligencia artificial integrado en la pestaña **Chat IA**. Podés hablarle como si fuera un asistente personal y te ayuda a hacer de todo.

### 9.2 ¿Qué le puedo pedir?

La IA puede leer y modificar **todo** el contenido del sitio. Estos son ejemplos reales de cosas que le podés pedir:

#### Consultas (solo leer)

| Le decís... | La IA hace... |
|-------------|---------------|
| *"¿Cuántas reservas hay esta semana?"* | Te dice el número y el detalle |
| *"¿Cuántas reservas pendientes hay?"* | Te da el total de pendientes |
| *"¿Qué docentes están activos?"* | Te lista los docentes activos |
| *"¿Cuál es el próximo evento?"* | Te dice fecha y título |
| *"¿Qué noticias están publicadas?"* | Te lista las noticias visibles |
| *"¿Qué obras están en cartel?"* | Te dice las obras presentes |
| *"Buscá reservas que mencionen La Sed"* | Cruza reservas con el nombre del evento |

#### Acciones (crear, modificar, borrar)

| Le decís... | La IA hace... |
|-------------|---------------|
| *"Creá un evento para el sábado 22 de agosto a las 21hs, obra Bodas de Sangre"* | Crea el evento en la agenda |
| *"Redactá una noticia anunciando las nuevas funciones de Atrapada en la Pantalla"* | Escribe y publica una noticia formal |
| *"Actualizá el precio del taller de Pancho a $3000"* | Cambia el precio |
| *"Cambiá el estado de La Sed a Histórica"* | Modifica la obra |
| *"BORRÁ el evento Taller de prueba"* | Elimina el evento (⚠️ te pide confirmación) |

### 9.3 ¿Cómo escribo bien los pedidos?

- **Sé específico:** En lugar de "agregá algo", decí "Creá un evento llamado X para el día Y a las 21hs"
- **Dale contexto:** Si le pedís que redacte una noticia, contale de qué se trata
- **Corregí si se equivoca:** Si algo no quedó bien, decile "Cambiá el título por X" o "Borrá lo que creaste"

### 9.4 Adjuntar imágenes al chat

Si necesitás que la IA use una imagen para una noticia, docente u obra:

1. Hacé clic en el ícono 📎 (clip) abajo en el chat
2. Elegí la imagen de tu computadora
3. La imagen se sube y la IA la usa automáticamente

También podés **pegar una imagen** directamente con Ctrl+V o **arrastrarla** al chat.

### 9.5 Limitaciones

- La IA no procesa pagos ni modifica reservas directamente
- Si le pedís algo muy complejo, puede necesitar que lo dividas en pasos
- A veces tarda unos segundos en responder (está "pensando")
- Si te pasás de 10 mensajes por minuto, te frena un minuto (es normal)

---

## 10. Preguntas Frecuentes

### "Publiqué una noticia pero no se ve en el sitio"

Verificá dos cosas:
1. ¿La casilla **Publicada** ✅ está marcada?
2. ¿Guardaste los cambios?

Si ambas son sí, esperá unos segundos y refrescá la página del sitio.

### "Subí una foto pero no se ve"

Las fotos de docentes y noticias pueden tardar unos segundos en aparecer. Si después de un minuto sigue sin verse:
- Verificá que la URL de la foto sea correcta
- Probá subir el archivo de nuevo
- Si usaste una URL externa, fijate que la imagen siga disponible

### "Me equivoqué y borré algo"

⚠️ **No hay papelera de reciclaje.** Lo borrado no se recupera. Si fue un error grave, el desarrollador puede recuperar versiones anteriores desde GitHub.

### "La sesión se me cierra muy seguido"

La sesión dura 30 minutos por seguridad. Si estás trabajando mucho tiempo, es normal que te pida la contraseña de nuevo. Simplemente volvé a ingresar.

### "¿Puedo entrar desde el celular?"

Sí, el panel funciona desde el celular. Algunas cosas son más cómodas desde la computadora, pero para consultas rápidas funciona bien.

### "No me acuerdo la contraseña"

Contactá al desarrollador (Mauricio) para restablecerla.

### "Quiero que aparezca un docente en la página de la Compañía también"

Un docente aparece en la Compañía si está marcado como **Activo**. No hay una categoría separada para "elenco" — todos los docentes activos se muestran en ambas páginas.

### "¿Puedo cambiar el orden de los eventos?"

Los eventos se ordenan automáticamente por fecha. Para que un evento aparezca primero, poné la fecha más cercana.

---

## 11. Referencia Rápida

### 11.1 ¿Qué hago si quiero...?

| Quiero... | Voy a la pestaña... | Y hago clic en... |
|-----------|---------------------|--------------------|
| Publicar una noticia | Noticias | Completar formulario → Guardar |
| Agregar un evento a la cartelera | Agenda | Completar formulario → Guardar |
| Agregar un profesor nuevo | Docentes | Completar formulario → Guardar |
| Cambiar el precio de un taller | Docentes | Editar → cambiar precio → Guardar |
| Subir fotos de una obra | Obras | Cargar URL → "+ Agregar imagen" → Guardar |
| Ver las reservas de esta semana | Reservas | Revisar tabla con filtro |
| Avisar a todos de un estreno | Noticias | Crear noticia → marcar "Avisar por push" → Guardar |
| Mandar un aviso rápido sin noticia | Push | Completar título y mensaje → Enviar |
| Preguntar algo a la IA | Chat IA | Escribir mensaje → Enviar |

### 11.2 Atajos útiles

| Atajo | ¿Qué hace? |
|-------|------------|
| **Enter** en el chat | Enviar mensaje a la IA |
| **Enter** en cualquier formulario | A veces guarda (depende del campo) |
| **Ctrl+V** en el chat | Pegar imagen del portapapeles |
| **Click en el logo** (×3) | Easter egg: animación de telón 😄 |

### 11.3 Cuándo usar el Chat IA vs hacerlo manual

| Tarea | ¿Manual o IA? | Recomendación |
|-------|---------------|---------------|
| Crear una noticia simple | Manual | Más rápido, formulario directo |
| Redactar una noticia larga o formal | **IA** | La IA redacta mejor textos largos |
| Ver cuántas reservas hay | **IA** | Más rápido que revisar la tabla |
| Agregar un evento | Manual | Formulario simple, 30 segundos |
| Subir fotos de una obra | Manual | Necesitás elegir archivos |
| Buscar información cruzada | **IA** | Solo la IA puede cruzar datos |
| Enviar notificación push | Manual | Formulario directo en tab Push |

---

> 📞 **¿Algo no funciona o tenés una duda?** Contactá a Mauricio.
>
> 📝 **¿Querés sugerir una mejora?** Anotá tu idea y coordinamos para implementarla.
>
> 🔄 **Última actualización de este manual:** Agosto 2026. Versión 1.0.
