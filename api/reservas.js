import { getSupabaseAdmin } from './lib/supabase.js';
import { hasValidAdminSession } from './lib/admin-auth.js';

const allowedServices = new Set(['sala', 'taller', 'entrada', 'otro']);

function sendJson(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 12000) reject(new Error('payload_too_large'));
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('invalid_json'));
      }
    });
    req.on('error', reject);
  });
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function validateReservation(body) {
  const servicio = cleanText(body.servicio, 20);
  const detalle = cleanText(body.detalle, 120);
  const fecha = cleanText(body.fecha, 10);
  const nombre = cleanText(body.nombre, 120);
  const whatsapp = cleanText(body.whatsapp, 30);
  const email = cleanText(body.email, 254);
  const mensaje = cleanText(body.mensaje, 2000);

  if (!allowedServices.has(servicio)) return { error: 'Servicio inválido.' };
  if (!isValidDate(fecha)) return { error: 'Fecha inválida.' };
  if (nombre.length < 2) return { error: 'El nombre es obligatorio.' };
  if (whatsapp.replace(/\D/g, '').length < 6 || !/^[0-9+() -]+$/.test(whatsapp)) {
    return { error: 'WhatsApp inválido.' };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Email inválido.' };

  return { value: { servicio, detalle: detalle || null, fecha, nombre, whatsapp, email: email || null, mensaje: mensaje || null } };
}

async function createReservation(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Solicitud inválida.' });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return sendJson(res, 400, { error: 'Solicitud inválida.' });
  }

  const validation = validateReservation(body);
  if (validation.error) return sendJson(res, 400, { error: validation.error });

  const supabase = getSupabaseAdmin();
  if (!supabase) return sendJson(res, 503, { error: 'Reservas no configuradas.' });

  const { data, error } = await supabase
    .from('reservas')
    .insert(validation.value)
    .select('id')
    .single();

  if (error) {
    console.error('Reservation insert failed:', error.message);
    return sendJson(res, 503, { error: 'No se pudo guardar la reserva.' });
  }

  return sendJson(res, 201, { ok: true, id: data.id });
}

async function listReservations(req, res) {
  if (!hasValidAdminSession(req)) return sendJson(res, 401, { error: 'No autorizado.' });

  const supabase = getSupabaseAdmin();
  if (!supabase) return sendJson(res, 503, { error: 'Reservas no configuradas.' });

  const { data, error } = await supabase
    .from('reservas')
    .select('id, servicio, detalle, fecha, nombre, whatsapp, email, mensaje, estado, creado, actualizado')
    .order('fecha', { ascending: false })
    .order('creado', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Reservation list failed:', error.message);
    return sendJson(res, 503, { error: 'No se pudieron cargar las reservas.' });
  }

  return sendJson(res, 200, { data: data || [] });
}

export default async function handler(req, res) {
  if (req.method === 'POST') return createReservation(req, res);
  if (req.method === 'GET') return listReservations(req, res);
  res.setHeader('Allow', 'GET, POST');
  return sendJson(res, 405, { error: 'Método no permitido.' });
}
