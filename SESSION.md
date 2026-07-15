# Mandrágora — Sesión 14-15 Julio 2026

## Proyecto
Sitio web de Mandrágora (teatro y escuela de artes, Montevideo)
- **Vercel:** https://deploy-phi-wheat.vercel.app
- **GitHub Pages:** https://mauric75.github.io/mandragora-web/
- **Repo:** https://github.com/mauric75/mandragora-web
- **Local:** `C:\Users\HP\Documents\Mandragora\deploy\`

## Diseño
- **Paleta:** #CE9A47 (dorado), #1D3D91 (azul), #8ABE28 (verde ojos), #05070a (fondo oscuro), #f8f4ed (fondo claro)
- **Tipografía:** Cormorant Garamond + Cinzel + Jost
- **Toggle dark/light** con localStorage
- **Grain overlay** cinematográfico

## Reels (/reels.html)
- 8 reels con miniaturas, filtros por categoría (Sala/Escuela/Compañía)
- Diseño dark con overlay, cards 9:16, hover con zoom y glow
- Dos cuentas IG: @mandragoracasa (cultural) + @teatromandragora_uy (teatro)
- Links guardados en `REELS.md`

## Bugs resueltos
- `mix-blend-mode` en nav → reemplazado por `backdrop-filter: blur`
- `color-mix()` CSS → `rgba()` para compatibilidad universal
- Service worker eliminado (causaba caché agresivo)
- Fuentes TTF Schrifted eliminadas (layout shift) → Google Fonts

## Reglas de trabajo
- Cambios grandes en ramas de prueba antes de main
- No acumular muchos cambios sin testear
- Git commits sin caracteres especiales (tilde, comillas)
- El diseño visual es prioridad
- Usar `Edit` tool (funciona mejor que scripts batch)
