// Vercel Serverless Function — gestiona comentarios de espectadores via Supabase.
// Auth: cookie mandragora_admin_session para save/delete/toggle-destacado.
// list es público (con rate limiting para save público).
//
// POST body: { action: "list" | "save" | "delete" | "toggle-destacado", ... }

import { getSupabaseAdmin } from './lib/supabase.js';
import { hasValidAdminSession, getAdminSessionRole } from './lib/admin-auth.js';
import { logAdminAction } from './lib/audit.js';
import { checkRateLimit } from './lib/rate-limit.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase no configurado' });
  }

  try {
    const { action, obra_id, destacados, nombre, texto, estrellas, fuente, id, offset, limit } = req.body || {};

    // ─── LIST (público) ───────────────────────────────────────────
    if (action === 'list') {
      let query = supabase
        .from('comentarios')
        .select('*')
        .order('creado', { ascending: false });

      if (destacados) {
        query = query.eq('destacado', true);
      } else if (obra_id) {
        query = query.eq('obra_id', obra_id);
      }

      // Paginación
      const from = offset || 0;
      const pageSize = limit || 20;
      query = query.range(from, from + pageSize - 1);

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ ok: true, comentarios: data || [] });
    }

    // ─── SAVE (público con rate limit, o admin) ──────────────────
    if (action === 'save') {
      const isAdmin = hasValidAdminSession(req);
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      const rateKey = `comentarios-save:${ip}`;

      // Rate limit para usuarios públicos (5 por hora)
      if (!isAdmin && !checkRateLimit(rateKey, 5, 3600_000)) {
        return res.status(429).json({ error: 'Demasiados comentarios. Intentá más tarde.' });
      }

      // Validaciones
      if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 80) {
        return res.status(400).json({ error: 'Nombre: 2 a 80 caracteres' });
      }
      if (!texto || typeof texto !== 'string' || texto.trim().length < 3 || texto.trim().length > 1000) {
        return res.status(400).json({ error: 'Texto: 3 a 1000 caracteres' });
      }
      if (estrellas !== undefined && estrellas !== null) {
        const s = Number(estrellas);
        if (!Number.isInteger(s) || s < 1 || s > 5) {
          return res.status(400).json({ error: 'Estrellas: 1 a 5' });
        }
      }

      const comentario = {
        nombre: nombre.trim(),
        texto: texto.trim(),
        obra_id: obra_id || null,
        estrellas: estrellas ? Number(estrellas) : null,
        fuente: isAdmin ? (fuente || 'admin') : 'usuario',
        destacado: isAdmin ? (destacado === true) : false,
      };

      const { data, error } = await supabase
        .from('comentarios')
        .insert(comentario)
        .select()
        .single();

      if (error) throw error;

      logAdminAction(isAdmin ? getAdminSessionRole(req) : 'publico', 'comentario-save', 'comentarios', { id: data.id, obra_id }, req);
      return res.status(200).json({ ok: true, comentario: data });
    }

    // ─── DELETE (solo admin) ─────────────────────────────────────
    if (action === 'delete') {
      const role = hasValidAdminSession(req);
      if (!role) return res.status(401).json({ error: 'No autorizado' });
      if (role !== 'admin') return res.status(403).json({ error: 'Solo el admin puede borrar' });
      if (!id) return res.status(400).json({ error: 'Falta id' });

      const { error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      logAdminAction('admin', 'comentario-delete', 'comentarios', { id }, req);
      return res.status(200).json({ ok: true });
    }

    // ─── TOGGLE DESTACADO (solo admin) ──────────────────────────
    if (action === 'toggle-destacado') {
      const role = hasValidAdminSession(req);
      if (!role) return res.status(401).json({ error: 'No autorizado' });
      if (!id) return res.status(400).json({ error: 'Falta id' });

      // Obtener estado actual
      const { data: current, error: fetchError } = await supabase
        .from('comentarios')
        .select('destacado')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!current) return res.status(404).json({ error: 'Comentario no encontrado' });

      const { data, error } = await supabase
        .from('comentarios')
        .update({ destacado: !current.destacado })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      logAdminAction(getAdminSessionRole(req), 'comentario-toggle-destacado', 'comentarios', { id, destacado: data.destacado }, req);
      return res.status(200).json({ ok: true, comentario: data });
    }

    return res.status(400).json({ error: 'Acción inválida' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
