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
  // robots.txt y sitemap.xml: sin su tipo real salen como octet-stream y los
  // buscadores no los leen.
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

// --- Admin auth (cookie-based) ---
const crypto = require('crypto');
const ADMIN_USER = process.env.ADMIN_USER || 'ADMIN';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Arroyo2026';
const TOKEN_SECRET = crypto.randomBytes(32).toString('hex');

function makeToken() {
  const payload = Date.now().toString();
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return payload + '.' + hmac;
}
function verifyToken(tok) {
  if (!tok) return false;
  const [payload, sig] = tok.split('.');
  if (!payload || !sig) return false;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
function getCookie(req, name) {
  const h = req.headers.cookie || '';
  const m = h.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : null;
}
function parseBody(req) {
  return new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => r(b)); });
}

const LOGIN_PAGE = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin — Arroyo Suite House</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=Hanken+Grotesk:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Hanken Grotesk',system-ui,sans-serif;font-weight:300;background:#f6efe3;color:#15110d;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#fff;border:1px solid #e7dac4;border-radius:16px;padding:48px 40px;width:360px;text-align:center;box-shadow:0 4px 24px rgba(21,17,13,.06)}
.logo{font-family:'Fraunces',Georgia,serif;font-size:28px;font-weight:500;letter-spacing:-.02em;color:#15110d;margin-bottom:4px}
.logo-sub{font-size:12px;color:#a59a89;text-transform:uppercase;letter-spacing:2px;margin-bottom:32px}
input{width:100%;padding:12px 16px;border:1px solid #e7dac4;border-radius:10px;font-size:14px;font-family:inherit;margin-bottom:12px;background:#f6efe3}
input:focus{outline:2px solid #bb6b43;border-color:transparent;background:#fff}
button{width:100%;padding:14px;background:#bb6b43;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:500;font-family:inherit;cursor:pointer;letter-spacing:.02em;transition:background .15s}
button:hover{background:#9a5430}.err{color:#c44b3b;font-size:13px;margin-bottom:12px;display:none}</style></head>
<body><div class="card"><img src="/assets/img/logo-negro.png" alt="Arroyo Suite House" style="width:200px;margin:0 auto 8px"><div class="logo-sub">Admin</div>
<div class="err" id="err">Usuario o contraseña incorrectos</div>
<form method="POST" action="/admin/login">
<input name="user" placeholder="Usuario" autocomplete="username" required>
<input name="pass" type="password" placeholder="Contraseña" autocomplete="current-password" required>
<button type="submit">Entrar</button></form></div>
<script>if(location.search.includes('fail'))document.getElementById('err').style.display='block'</script></body></html>`;

const server = http.createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

    // --- Admin routes ---
    if (urlPath.startsWith('/admin')) {
      if (urlPath === '/admin/login' && req.method === 'POST') {
        const body = await parseBody(req);
        const params = new URLSearchParams(body);
        if (params.get('user') === ADMIN_USER && params.get('pass') === ADMIN_PASS) {
          const token = makeToken();
          res.writeHead(302, { 'Set-Cookie': `arroyo_admin=${token}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=86400`, 'Location': '/admin/' });
          return res.end();
        }
        res.writeHead(302, { 'Location': '/admin/login?fail=1' });
        return res.end();
      }

      if (urlPath === '/admin/login' || urlPath === '/admin/login/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(LOGIN_PAGE);
      }

      const token = getCookie(req, 'arroyo_admin');
      if (!verifyToken(token)) {
        if (urlPath.startsWith('/admin/api/')) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end('{"error":"unauthorized"}');
        }
        res.writeHead(302, { 'Location': '/admin/login' });
        return res.end();
      }

      // --- Reservas API ---
      const RESERVAS_FILE = path.join(__dirname, 'data', 'reservas.json');
      function readReservas() {
        try { return JSON.parse(fs.readFileSync(RESERVAS_FILE, 'utf8')); } catch { return []; }
      }
      function writeReservas(data) {
        const dir = path.dirname(RESERVAS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(RESERVAS_FILE, JSON.stringify(data, null, 2), 'utf8');
      }

      if (urlPath === '/admin/api/reservas' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(readReservas()));
      }

      if (urlPath === '/admin/api/reservas' && req.method === 'POST') {
        const body = JSON.parse(await parseBody(req));
        const reservas = readReservas();
        body.id = 'res_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        body.creada = new Date().toISOString();
        reservas.push(body);
        writeReservas(reservas);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(body));
      }

      if (urlPath.startsWith('/admin/api/reservas/') && req.method === 'PUT') {
        const id = urlPath.split('/').pop();
        const body = JSON.parse(await parseBody(req));
        const reservas = readReservas();
        const idx = reservas.findIndex(r => r.id === id);
        if (idx === -1) { res.writeHead(404); return res.end('{"error":"not found"}'); }
        Object.assign(reservas[idx], body);
        writeReservas(reservas);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(reservas[idx]));
      }

      if (urlPath.startsWith('/admin/api/reservas/') && req.method === 'DELETE') {
        const id = urlPath.split('/').pop();
        let reservas = readReservas();
        reservas = reservas.filter(r => r.id !== id);
        writeReservas(reservas);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end('{"ok":true}');
      }

      // --- Static admin files ---
      let adminPath = urlPath.replace(/^\/admin\/?/, '') || 'index.html';
      const adminRoot = path.join(ROOT, 'admin');
      const safe = path.normalize(adminPath).replace(/^(\.\.[/\\])+/, '');
      let file = path.join(adminRoot, safe);
      if (!file.startsWith(adminRoot)) { res.writeHead(403); return res.end('Forbidden'); }

      fs.stat(file, (err, stat) => {
        if (err || !stat.isFile()) {
          file = path.join(adminRoot, 'index.html');
        }
        const ext = path.extname(file).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        fs.createReadStream(file).pipe(res);
      });
      return;
    }

    // --- Public site ---
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
