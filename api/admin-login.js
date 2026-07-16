import { checkAdminPassword, createSessionCookie, isAdminConfigured } from './lib/admin-auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!isAdminConfigured()) {
    return res.status(503).json({ error: 'Panel admin no configurado' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Solicitud inválida' });
    }
  }

  if (!checkAdminPassword(body.password)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  res.setHeader('Set-Cookie', createSessionCookie(req));
  return res.status(204).end();
}
