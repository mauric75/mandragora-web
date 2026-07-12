# Mandrágora — Sitio Web

**TEATRO · ESCUELA DE ARTES · CENTRO CULTURAL**
Montevideo, Uruguay

- **Producción:** https://deploy-phi-wheat.vercel.app
- **Repo:** https://github.com/mauric75/mandragora-web
- **Local:** `C:\Users\HP\Documents\Mandragora\deploy\`

---

## 🧱 Estructura

```
deploy/
├── index.html              Landing (toggle dark/light)
├── escuela.html            Escuela de Artes (docentes, disciplinas)
├── sala.html               Sala & Eventos (equipamiento, 500 personas)
├── compania.html           Compañía Teatral (obras reales, elenco)
├── cine-viajero.html       Cine Viajero (festival + itinerancia)
├── agenda.html             Cartelera (Jul–Sep 2026)
├── comunidad.html          Comunidad + valores
├── contacto.html           Teléfono, mail, dirección, redes
├── reservar.html           Sistema de reservas con calendario
├── pagar.html              Checkout MercadoPago (pagos + suscripción)
├── admin.html              Panel admin de reservas (contraseña: mandragora2026)
├── exito.html / error.html Páginas post-pago
├── sitemap.xml             Sitemap para Google
├── api/
│   ├── crear-preferencia.js   Vercel Function — pago único MP
│   └── crear-suscripcion.js   Vercel Function — suscripción MP
├── netlify/
│   └── functions/             Versión Netlify (alternativa)
├── assets/
│   ├── brand-logos/       Logo oficial (blanco, negro, iso)
│   └── images/            Fotos del sitio + obras + elenco
```

---

## 🎨 Diseño

- **Paleta oficial** (`Branding Mandragora - uso interno.pdf`):
  - Azul Francia `#1D3D91` | Negro `#000000` | Blanco `#FFFFFF`
  - Verde ojos `#8ABE28` | Dorado `#CE9A47` (ornamentación)
- **Tipografía:** Cormorant Garamond (display) + Cinzel (marcas) + Jost (cuerpo)
- **Toggle dark/light** con persistencia en localStorage
- **Efectos:** partículas doradas, humo, glow, Ken Burns, parallax, fade-in

---

## 🚀 Deploy

### GitHub Pages (estático)
```bash
git push origin main
# https://mauric75.github.io/mandragora-web/
```

### Vercel (con backend MP)
```bash
git push origin main   # auto-deploy
# https://deploy-phi-wheat.vercel.app
# Requiere: MERCADOPAGO_ACCESS_TOKEN en Environment Variables
```

---

## ⏳ Pendiente de Pablo

| Qué | Dónde |
|---|---|
| Fotos y nombres de docentes | `escuela.html` → sección Docentes |
| Números de WhatsApp por docente | `reservar.html` → data-wa en cada card |
| Token de MercadoPago | Vercel → `MERCADOPAGO_ACCESS_TOKEN` |
| Mandrágora definitiva | `index.html` → hero image |
| Fotos HD de la sala | `sala.html` → feature-image |

---

## 🔧 Mantenimiento

```bash
cd C:\Users\HP\Documents\Mandragora\deploy

# Hacer cambios en los .html...

git add -A
git commit -m "descripción del cambio"
git push
```

Vercel y GitHub Pages se actualizan solos.

---

## 📞 Contacto

- **Dirección:** Javier Barrios Amorín 1312, Montevideo
- **Teléfono:** 097 052 948
- **WhatsApp:** 598 97 052 948
- **Email:** info@mandragora.uy
- **Instagram:** @mandragoracasa
- **Facebook:** mandragoracasacultural
- **Google Maps:** https://maps.app.goo.gl/pZUTAHcNrtp7gPkEA
