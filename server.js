// server.js — Servidor estático mínimo para el sitio de Arroyo Suite House.
// Sin dependencias. Sirve la carpeta /public. Pensado para Railway/Render.
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    // Evitar path traversal
    const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    let file = path.join(ROOT, safe);
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }

    fs.stat(file, (err, stat) => {
      if (err || !stat.isFile()) {
        // Fallback a index.html (sitio de una sola página)
        file = path.join(ROOT, 'index.html');
      }
      const ext = path.extname(file).toLowerCase();
      const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
      // HTML/CSS/JS cambian en el lugar: revalidar siempre para que los cambios se vean al instante.
      // Imágenes/fuentes tienen nombre estable: caché largo.
      if (ext === '.css' || ext === '.js') headers['Cache-Control'] = 'no-cache';
      else if (ext !== '.html') headers['Cache-Control'] = 'public, max-age=604800';
      res.writeHead(200, headers);
      fs.createReadStream(file).pipe(res);
    });
  } catch (e) {
    res.writeHead(500); res.end('Error');
  }
});

server.listen(PORT, () => console.log(`🌄 Arroyo Suite House web en http://localhost:${PORT}`));
