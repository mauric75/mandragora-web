// Vercel Serverless Function — sube una imagen a Supabase Storage
// POST multipart/form-data con campo "file"
// Auth: cookie mandragora_admin_session
// Devuelve { url: "https://..." }

import { hasValidAdminSession } from './lib/admin-auth.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  if (!hasValidAdminSession(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Supabase no configurado' });
  }

  try {
    // Leer el archivo del body (Vercel parsea multipart automáticamente)
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers);

    // Parsear multipart manualmente (simple, busca el boundary)
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) return res.status(400).json({ error: 'Content-Type multipart requerido' });

    const boundary = boundaryMatch[1].trim();
    const parts = rawBody.toString('binary').split('--' + boundary);

    let fileBuffer = null;
    let fileName = 'imagen-' + Date.now() + '.jpg';
    let fileType = 'image/jpeg';

    for (const part of parts) {
      if (!part.includes('Content-Disposition') || !part.includes('filename=')) continue;

      // Extraer filename
      const fnMatch = part.match(/filename="([^"]+)"/);
      if (fnMatch) fileName = fnMatch[1];

      // Extraer content type
      const ctMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
      if (ctMatch) fileType = ctMatch[1].trim();

      // Extraer datos binarios (después del doble salto de línea)
      const headerEnd = part.indexOf('\r\n\r\n');
      if (headerEnd === -1) continue;
      const binaryStr = part.substring(headerEnd + 4);
      // Quitar el \r\n final si existe
      const cleanEnd = binaryStr.endsWith('\r\n') ? binaryStr.length - 2 : binaryStr.length;
      fileBuffer = Buffer.from(binaryStr.substring(0, cleanEnd), 'binary');
      break;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: 'No se encontró archivo en el body' });
    }

    // Limitar tamaño (5 MB)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Archivo demasiado grande (máx 5 MB)' });
    }

    // Subir a Supabase Storage
    const supabase = createClient(supabaseUrl, serviceKey);
    const filePath = 'public/' + Date.now() + '-' + fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    const { error } = await supabase.storage
      .from('imagenes')
      .upload(filePath, fileBuffer, {
        contentType: fileType,
        upsert: true,
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('imagenes')
      .getPublicUrl(filePath);

    return res.status(200).json({
      ok: true,
      url: urlData?.publicUrl || '',
      path: filePath,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
