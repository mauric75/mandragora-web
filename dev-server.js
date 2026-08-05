// Servidor local de desarrollo para Mandrágora
// Carga .env.vercel, sirve archivos estáticos y funciones API
// Uso: node dev-server.js

const { createServer } = require('http');
const { readFile, stat } = require('fs/promises');
const { createReadStream, readFileSync } = require('fs');
const path = require('path');
const { parse } = require('url');

// Cargar variables de entorno desde .env.vercel
const envPath = path.join(__dirname, '.env.vercel');
const envContent = readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
});

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.mp4':  'video/mp4',
  '.webp': 'image/webp',
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve(body); }
    });
  });
}

const server = createServer(async (req, res) => {
  const parsed = parse(req.url, true);
  const pathname = parsed.pathname;

  // API routes
  if (pathname.startsWith('/api/')) {
    const apiName = pathname.replace('/api/', '').split('?')[0].split('/')[0];
    
    let handlerModule;
    try {
      if (pathname.includes('ai-admin/chat')) {
        handlerModule = require('./api/ai-admin/chat.js');
      } else {
        handlerModule = require('./api/' + apiName + '.js');
      }
    } catch(e) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API not found' }));
      return;
    }

    try {
      const body = await parseBody(req);
      
      const fakeReq = {
        method: req.method,
        body,
        headers: req.headers,
        url: req.url,
      };

      let statusCode = 200;
      let responseHeaders = {};
      let responseBody = null;

      const fakeRes = {
        status(code) { statusCode = code; return this; },
        json(data) { responseBody = data; },
        setHeader(k, v) { responseHeaders[k.toLowerCase()] = v; },
        getHeader(k) { return responseHeaders[k.toLowerCase()]; },
        send(data) { responseBody = data; },
        end(data) { if (data !== undefined) responseBody = data; },
        writeHead(code, headers) {
          statusCode = code;
          if (headers) Object.assign(responseHeaders, headers);
        },
      };

      const fn = handlerModule.default || handlerModule;
      
      if (typeof fn === 'function' && fn.length >= 2) {
        await fn(fakeReq, fakeRes);
      } else if (typeof fn === 'function') {
        const result = await fn(fakeReq);
        if (result) {
          statusCode = result.status || 200;
          responseBody = result.body !== undefined ? result.body : result;
        }
      }

      // Send response
      const resHeaders = { 'Content-Type': 'application/json' };
      
      // Check for set-cookie
      if (fakeRes._headers) {
        Object.entries(fakeRes._headers).forEach(([k, v]) => {
          resHeaders[k] = v;
        });
      }
      if (responseHeaders['set-cookie']) {
        resHeaders['Set-Cookie'] = responseHeaders['set-cookie'];
      }

      res.writeHead(statusCode, resHeaders);
      
      if (statusCode === 204) {
        res.end();
      } else {
        res.end(typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody || ''));
      }
    } catch(e) {
      console.error('API Error:', apiName, e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(ROOT, filePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  try {
    const stats = await stat(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      await stat(filePath);
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    createReadStream(filePath).pipe(res);
  } catch {
    try {
      const notFound = path.join(ROOT, '404.html');
      await stat(notFound);
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      createReadStream(notFound).pipe(res);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404');
    }
  }
});

server.listen(PORT, () => {
  console.log(`\n  🎭 Mandrágora — Servidor local`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Admin:  http://localhost:${PORT}/admin.html`);
  console.log(`  Manual: http://localhost:${PORT}/manual.html`);
  console.log(`  Password: ${process.env.ADMIN_PASSWORD ? '✅ ' + process.env.ADMIN_PASSWORD : '❌ No cargada'}\n`);
});
