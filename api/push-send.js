// Vercel Serverless Function — envía una notificación push a todos los suscriptos
// Auth: cookie mandragora_admin_session (admin/editor) o Bearer token (transición)
// POST body: { title, body, url }

import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { hasValidAdminSession } from './lib/admin-auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // Auth: cookie session (admin unificado) o Bearer token (compatibilidad)
  const sessionRole = hasValidAdminSession(req);
  const adminSecret = process.env.PUSH_ADMIN_SECRET;
  const authHeader = req.headers['authorization'] || '';

  if (!sessionRole && (!adminSecret || authHeader !== `Bearer ${adminSecret}`)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:info@mandragora.uy';

  if (!supabaseUrl || !serviceKey || !vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: 'Faltan variables de entorno (Supabase o VAPID)' });
  }

  try {
    const { title, body, url } = req.body || {};
    if (!title || !body) return res.status(400).json({ error: 'Falta title o body' });

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: subs, error } = await supabase
      .from('mandragora_push_subscriptions')
      .select('id, endpoint, p256dh, auth');

    if (error) throw error;

    const payload = JSON.stringify({ title, body, url: url || '/' });

    const results = await Promise.allSettled(
      (subs || []).map((sub) =>
        webpush
          .sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
          .catch(async (err) => {
            // Si la suscripción ya no es válida (el visitante desinstaló, bloqueó, etc.), la borramos
            if (err.statusCode === 404 || err.statusCode === 410) {
              await supabase.from('mandragora_push_subscriptions').delete().eq('id', sub.id);
            }
            throw err;
          })
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return res.status(200).json({ ok: true, total: subs?.length || 0, sent, failed });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
