import { checkAdminPassword, createSessionCookie, isAdminConfigured, hasValidAdminSession, clearSessionCookie } from './lib/admin-auth.js';
import { logAdminAction } from './lib/audit.js';
import { checkRateLimit } from './lib/rate-limit.js';

// Ruta unificada: /api/admin-auth
// POST con ?action=login → login
// POST con ?action=logout → logout
// GET → verificar sesión

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // GET = check session
  if (req.method === 'GET') {
    if (!isAdminConfigured()) return res.status(503).json({ error: 'No configurado' });
    if (hasValidAdminSession(req)) return res.status(204).end();
    return res.status(401).json({ error: 'Sin sesión' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const url = new URL(req.url, `http://${req.headers.host}`);
  const action = url.searchParams.get('action') || 'login';

  // LOGOUT
  if (action === 'logout') {
    res.setHeader('Set-Cookie', clearSessionCookie(req));
    return res.status(204).end();
  }

  // LOGIN
  if (!isAdminConfigured()) return res.status(503).json({ error: 'No configurado' });

  const ip = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(`login:${ip}`)) {
    return res.status(429).json({ error: 'Demasiados intentos. Esperá un minuto.' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Solicitud inválida' }); }
  }

  const role = checkAdminPassword(body.password);
  if (!role) return res.status(401).json({ error: 'Credenciales incorrectas' });

  res.setHeader('Set-Cookie', createSessionCookie(req, role));
  logAdminAction(role, 'login', 'admin', null, req);
  return res.status(204).end();
}
