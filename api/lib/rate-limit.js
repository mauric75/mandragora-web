// Rate limiter simple — en memoria (se reinicia con cada deploy frío)
// Para producción, migrar a Supabase o Redis

const store = new Map();

const DEFAULT_WINDOW_MS = 60_000; // 1 minuto
const DEFAULT_MAX_REQUESTS = 10;   // máximo 10 por ventana

export function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const entry = store.get(key);
  const window = windowMs || DEFAULT_WINDOW_MS;
  const max = maxRequests || DEFAULT_MAX_REQUESTS;

  if (!entry || now - entry.windowStart > window) {
    store.set(key, { windowStart: now, count: 1 });
    return true;
  }

  entry.count++;
  if (entry.count > max) {
    return false;
  }

  return true;
}

// Limpieza cada 5 minutos para evitar fugas de memoria
setInterval(() => {
  const cutoff = Date.now() - DEFAULT_WINDOW_MS * 2;
  for (const [key, entry] of store) {
    if (entry.windowStart < cutoff) store.delete(key);
  }
}, 300_000);
