import { clearSessionCookie } from './lib/admin-auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  res.setHeader('Set-Cookie', clearSessionCookie(req));
  return res.status(204).end();
}
