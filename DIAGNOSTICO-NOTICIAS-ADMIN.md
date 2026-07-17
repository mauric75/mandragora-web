# Diagnóstico y corrección — Sistema de noticias + Menú

**Fecha:** 2026-07-16 / 2026-07-17  
**Rama final:** `main`  
**Commit:** `59ef670` — "agregar Noticias al menu y footer de todas las paginas"  
**URL producción:** https://deploy-phi-wheat.vercel.app  
**Panel noticias:** https://deploy-phi-wheat.vercel.app/noticias-admin.html  
**Página pública:** https://deploy-phi-wheat.vercel.app/noticias.html

---

## 1. Arquitectura del sistema de noticias

### Archivos

| Archivo | Rama | Función |
|---------|------|---------|
| `noticias-admin.html` | `main` | Panel de administración de noticias con login + CRUD |
| `api/noticias-save.js` | `main` | Endpoint serverless que lee/escribe `data/noticias.json` via GitHub API |
| `data/noticias.json` | `main` | Archivo JSON con el array de noticias (fuente de datos única) |
| `noticias.html` | `main` | Página pública que muestra las noticias |

### Flujo de autenticación

```
Usuario → noticias-admin.html → POST /api/noticias-save
                                    ↓
                              Authorization: Bearer <contraseña>
                                    ↓
                              Compara contra NOTICIAS_ADMIN_SECRET
```

- **Mecanismo:** Bearer token en header `Authorization`
- **Validación:** Comparación directa de strings
- **Variable de entorno:** `NOTICIAS_ADMIN_SECRET`
- **Error:** 401 `{"error":"No autorizado"}` si no coincide

### Flujo de datos

```
noticias-admin.html → POST /api/noticias-save { action: "save", noticia: {...} }
                           ↓
                      Lee data/noticias.json via GitHub API (GET)
                           ↓
                      Modifica el array en memoria
                           ↓
                      Escribe data/noticias.json via GitHub API (PUT)
                           ↓
                      noticias.html lee data/noticias.json (fetch público)
```

---

## 2. Dos sistemas de autenticación coexistentes

| Característica | Panel principal (`admin.html`) | Panel noticias (`noticias-admin.html`) |
|---|---|---|
| **Endpoint auth** | `POST /api/admin-auth?action=login` | No valida al login — valida cada request |
| **Mecanismo** | Cookies firmadas con HMAC | Header Bearer token |
| **Variables** | `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | `NOTICIAS_ADMIN_SECRET` |
| **Comparación** | `crypto.timingSafeEqual` | Comparación directa de strings |
| **Duración sesión** | 30 minutos (cookie) | Solo mientras la página está abierta |
| **Roles** | admin, editor, consulta | Ninguno |
| **Rate limiting** | 10 intentos/min por IP | No tiene |
| **Auditoría** | Sí (Supabase `admin_logs`) | No |
| **Maneja** | Reservas, Chat IA | Solo noticias |
| **Rama** | `codex/ia-admin-pruebas` (Preview) | `main` (Production) |

### Variables de entorno en Vercel

| Variable | Entornos | Estado |
|----------|----------|--------|
| `NOTICIAS_ADMIN_SECRET` | Preview, Production | ✅ |
| `GITHUB_TOKEN` | Production | ✅ (corregido) |
| `ADMIN_PASSWORD` | Preview (`codex/ia-admin-pruebas`) | Solo Preview |
| `ADMIN_SESSION_SECRET` | Preview (`codex/ia-admin-pruebas`) | Solo Preview |
| `DEEPSEEK_API_KEY` | Preview (`codex/ia-admin-pruebas`) | Solo Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Preview (`codex/ia-admin-pruebas`) | Solo Preview |

---

## 3. Problemas encontrados y soluciones

### Problema 1: Error al guardar noticias

**Síntoma:** Login funcionaba, lista de noticias cargaba, pero al guardar mostraba error.

**Causa:** `GITHUB_TOKEN` existía en Vercel Production pero no tenía permiso de escritura (solo lectura). `writeNoticias()` hace un `PUT` a la GitHub API que requiere scope `repo` (token clásico) o `Contents: Read and write` (token fine-grained).

**Solución:** Se generó un nuevo token fine-grained en GitHub con acceso al repositorio `mauric75/mandragora-web` y permiso `Contents: Read and write`. Se reemplazó en Vercel Production.

### Problema 2: Vercel Authentication bloqueando el acceso

**Síntoma:** Después de actualizar `GITHUB_TOKEN` y hacer redeploy, la página redirigía a login de Vercel.

**Causa:** El deployment de producción tenía **Vercel Authentication** activado (Deployment Protection).

**Solución:** Se desactivó en Settings → Deployment Protection.

### Problema 3: Contraseña incorrecta

**Síntoma:** El login mostraba "Clave incorrecta".

**Causa:** El valor de `NOTICIAS_ADMIN_SECRET` en Vercel no coincidía con la contraseña ingresada.

**Solución:** Se reemplazó `NOTICIAS_ADMIN_SECRET` por un valor nuevo conocido, y se hizo redeploy.

### Problema 4: URL confundida entre Preview y Production

**Contexto:**
- `deploy-phi-wheat.vercel.app` → alias de producción
- `deploy-hbr90lwvy-mauricio-s-projects1.vercel.app` → URL canónica de producción
- `deploy-git-main-mauricio-s-projects1.vercel.app` → alias que indica rama `main`

Las tres URLs apuntan al mismo deployment de producción.

### Problema 5: Noticias ausente del menú de navegación

**Síntoma:** `noticias.html` existía y funcionaba, pero ninguna página del sitio tenía el link en su menú ni footer.

**Solución:** Se agregó `<a href="noticias.html">Noticias</a>` en las 3 secciones de navegación (menú desktop, menú mobile, footer) de las 13 páginas principales:

| Página | Secciones modificadas |
|--------|----------------------|
| `index.html` | nav desktop, mobile menu, footer |
| `escuela.html` | nav desktop, mobile menu, footer |
| `sala.html` | nav desktop, mobile menu, footer |
| `compania.html` | nav desktop, mobile menu, footer |
| `cine-viajero.html` | nav desktop, mobile menu, footer |
| `comunidad.html` | nav desktop, mobile menu, footer |
| `galeria.html` | nav desktop, mobile menu, footer |
| `contacto.html` | nav desktop, mobile menu, footer |
| `agenda.html` | nav desktop, mobile menu, footer |
| `nosotros.html` | nav desktop, mobile menu, footer |
| `reservar.html` | nav desktop, mobile menu, footer |
| `reels.html` | nav desktop (footer es mínimo) |
| `reels-v2.html` | nav desktop (footer es mínimo) |

**No modificadas:** `404.html`, `admin.html`, `error.html`, `exito.html`, `pagar.html`, `push-admin.html` (no son páginas de navegación pública).

---

## 4. Deployment de producción

```
Proyecto Vercel: mauricio-s-projects1/deploy
Rama:            main
Target:          production
URL:             https://deploy-hbr90lwvy-mauricio-s-projects1.vercel.app
Alias:           https://deploy-phi-wheat.vercel.app
Alias:           https://deploy-mauricio-s-projects1.vercel.app
Alias:           https://deploy-git-main-mauricio-s-projects1.vercel.app

Serverless functions desplegadas:
  - api/noticias-save (4.63 KB)
  - api/crear-preferencia (3 KB)
  - api/crear-suscripcion (2.96 KB)
  - api/push-send (350.79 KB)
  - api/push-subscribe (268.16 KB)
```

---

## 5. Código del endpoint `api/noticias-save.js`

```javascript
// Acciones: list, save, delete
// Auth: Authorization: Bearer <NOTICIAS_ADMIN_SECRET>
// Datos: lee/escribe data/noticias.json via GitHub API
// Branch: GITHUB_BRANCH || 'main'

async function githubRequest(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  // GET/PUT a api.github.com/repos/mauric75/mandragora-web/...
}

async function readNoticias(branch) { /* GET contents/data/noticias.json */ }
async function writeNoticias(branch, noticias, sha, message) { /* PUT contents/data/noticias.json */ }
```

---

## 6. Limitaciones conocidas

1. **Autenticación por texto plano** — comparación directa de strings, sin `timingSafeEqual`.
2. **Sin roles** — una sola contraseña para acceso total.
3. **Sin rate limiting** en el endpoint de noticias.
4. **Sin auditoría** — no hay registro de quién creó/editó/borró.
5. **Dos sistemas de auth** — `admin.html` (cookies + roles) y `noticias-admin.html` (Bearer token) son independientes.
6. **GitHub API como backend** — latencia adicional, dependencia externa.
7. **Sin paginación** — el array de noticias crece sin límite.

---

## 7. Comandos útiles

```bash
# Variables de entorno en Vercel
npx vercel env ls

# Deployments de producción
npx vercel ls --prod

# Inspeccionar un deployment
npx vercel inspect https://deploy-phi-wheat.vercel.app

# Probar endpoint sin auth (debe devolver 401)
curl -s -X POST https://deploy-phi-wheat.vercel.app/api/noticias-save \
  -H "Content-Type: application/json" \
  -d '{"action":"list"}'

# Probar con auth incorrecta
curl -s -X POST https://deploy-phi-wheat.vercel.app/api/noticias-save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer contraseña_incorrecta" \
  -d '{"action":"list"}'
```
