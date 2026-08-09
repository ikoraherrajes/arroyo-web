# Arroyo Suite House — sitio web

Sitio institucional de Arroyo Suite House (suites para parejas en Traslasierra, Córdoba).
Sitio estático servido por un server Node mínimo, pensado para Railway/Render.

## Local
```
npm start        # http://localhost:3000  (sirve /public)
```

## Deploy

> **El sitio en vivo lo sirve GitHub Pages, no Railway.** Pushear a `master` NO
> actualiza `arroyosuitehouse.com`. Hay que publicar el contenido de `/public`
> en la raíz de la rama `gh-pages`:
>
> ```
> git worktree add --detach /tmp/ghp origin/gh-pages
> cp -r public/. /tmp/ghp/
> cd /tmp/ghp && git add -A && git commit -m "Deploy: ..." && git push origin HEAD:gh-pages
> cd - && git worktree remove --force /tmp/ghp
> ```
>
> Ojo: la rama `gh-pages` local está divergida de `origin/gh-pages` (historias
> distintas). Siempre partir de `origin/gh-pages`, nunca de la local.

- **GitHub Pages (producción):** rama `gh-pages`, `/public` en la raíz, con
  `CNAME` → `arroyosuitehouse.com` y `.nojekyll`.
- **Railway / Render (alternativa, no en uso):** conectar el repo. Build:
  ninguno. Start: `node server.js`.

## Dominio
`arroyosuitehouse.com` y `www` apuntan a GitHub Pages
(`ikoraherrajes.github.io`, A a 185.199.108-111.153).

## Estructura
- `server.js` — server estático sin dependencias.
- `public/index.html` — el sitio (una sola página).
- `public/img/` — fotos optimizadas.
