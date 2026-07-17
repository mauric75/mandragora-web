// Vercel Serverless Function — Push unificado
// POST body: { action: "subscribe" | "send", subscription?, title?, body?, url? }
// subscribe: público. send: requiere cookie de sesión.

import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { hasValidAdminSession } from './lib/admin-auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Supabase no configurado' });
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { action } = req.body || {};

    // ── SUBSCRIBE (público) ──
    if (action === 'subscribe') {
      const { subscription } = req.body || {};
      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return res.status(400).json({ error: 'Suscripción inválida' });
      }
      const { error } = await supabase
        .from('mandragora_push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: req.headers['user-agent'] || null,
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'endpoint' });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    // ── SEND (requiere auth) ──
    if (action === 'send') {
      if (!hasValidAdminSession(req)) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const vapidPublic = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
      const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:info@mandragora.uy';
      if (!vapidPublic || !vapidPrivate) {
        return res.status(500).json({ error: 'Faltan variables VAPID' });
      }

      const { title, body, url } = req.body || {};
      if (!title || !body) return res.status(400).json({ error: 'Falta title o body' });

      webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

      const { data: subs, error } = await supabase
        .from('mandragora_push_subscriptions')
        .select('id, endpoint, p256dh, auth');
      if (error) throw error;

      const payload = JSON.stringify({ title, body, url: url || '/' });

      const results = await Promise.allSettled(
        (subs || []).map((sub) =>
          webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          ).catch(async (err) => {
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
    }

    return res.status(400).json({ error: 'Acción inválida. Usá action: "subscribe" o "send"' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
