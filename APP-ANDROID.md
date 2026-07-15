# Mandrágora — App Android (Plan Técnico)

## Objetivo
Convertir el sitio web en una app Android instalable y publicable en Play Store, sin reescribir código.

---

## Estrategia: PWA → APK vía Bubblewrap

El sitio ya funciona como PWA con `manifest.json`. Bubblewrap (Google) convierte la PWA en APK firmado.

---

## Paso 1 — Verificar PWA

### 1.1 Manifest (`manifest.json`)
```json
{
  "name": "Mandrágora — Teatro & Escuela de Artes",
  "short_name": "Mandrágora",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#05070a",
  "theme_color": "#CE9A47",
  "icons": [
    { "src": "assets/brand-logos/iso.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/brand-logos/iso.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 1.2 Service Worker (`sw.js`)
Network-first para HTML, cache para assets offline:
```js
const CACHE = 'mandragora-v1';
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/']))));
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
    .catch(() => caches.match(e.request))
  );
});
```

### 1.3 Verificación
- Chrome Android → Add to Home Screen
- Lighthouse → PWA score ≥ 90

---

## Paso 2 — Generar APK con Bubblewrap

### 2.1 Instalar
```bash
npm install -g @bubblewrap/cli
```

### 2.2 Inicializar
```bash
bubblewrap init --manifest https://deploy-phi-wheat.vercel.app/manifest.json
```
Genera `twa-manifest.json`.

### 2.3 Construir
```bash
bubblewrap build
```
Genera `app-release-signed.apk`.

### 2.4 Personalización
- Package: `uy.mandragora.app`
- Icono: ISO ojos de gato
- Splash: fondo oscuro + logo dorado

---

## Paso 3 — Play Store ($25 USD)

1. Google Developer Account (pago único)
2. Subir APK firmado
3. Ficha: nombre, descripción, capturas
4. Publicar

---

## Archivos necesarios

```
deploy/
├── manifest.json
├── sw.js
├── .well-known/
│   └── assetlinks.json
└── app/
    ├── twa-manifest.json
    └── app-release-signed.apk
```

---

## Alternativas

| Opción | Pro | Contra |
|--------|-----|--------|
| PWA + Bubblewrap | Sin reescribir, gratis, rápido | Sin APIs nativas avanzadas |
| React Native | Nativo completo | Rehacer todo el frontend |
| WebView wrapper | Fácil | Mala UX |
