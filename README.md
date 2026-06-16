# Arroyo Suite House — sitio web

Sitio institucional de Arroyo Suite House (suites para parejas en Traslasierra, Córdoba).
Sitio estático servido por un server Node mínimo, pensado para Railway/Render.

## Local
```
npm start        # http://localhost:3000  (sirve /public)
```

## Deploy
- **Railway / Render:** conectar el repo. Build: ninguno. Start: `node server.js`.
- **Link de prueba (GitHub Pages):** rama `gh-pages` (contenido de `/public` en la raíz).
  URL: https://ikoraherrajes.github.io/arroyo-web/

## Dominio
Apuntar `arroyosuitehouse.com` al servicio cuando esté en Railway (DNS).

## Estructura
- `server.js` — server estático sin dependencias.
- `public/index.html` — el sitio (una sola página).
- `public/img/` — fotos optimizadas.
