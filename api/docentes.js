// Vercel Serverless Function — gestiona data/docentes.json y data/obras.json escribiendo directo al repo de GitHub.
// Auth: cookie mandragora_admin_session (admin/editor/consulta)
// Solo admin puede hacer delete.
//
// POST body: { action: "list" | "save" | "delete" | "upload", resource?: "docente" | "obra", docente?: {...}, obra?: {...}, id?: "..." }
// resource por defecto es "docente" (compatibilidad con llamadas existentes)
// upload: multipart/form-data con campo "file"

import { hasValidAdminSession, getAdminSessionRole } from './lib/admin-auth.js';
import { logAdminAction } from './lib/audit.js';
import { createClient } from '@supabase/supabase-js';

const GITHUB_OWNER = 'mauric75';
const GITHUB_REPO = 'mandragora-web';

function getFilePath(resource) {
  return resource === 'obra' ? 'data/obras.json' : 'data/docentes.json';
}

async function githubRequest(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/${path}`, {
    ...options,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `GitHub API error (${res.status})`);
  return data;
}

async function readItems(branch, filePath) {
  try {
    const data = await githubRequest(`contents/${filePath}?ref=${branch}`);
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { items: JSON.parse(content), sha: data.sha };
  } catch (e) {
    if (e.message && e.message.includes('Not Found')) {
      return { items: [], sha: null };
    }
    throw e;
  }
}

async function writeItems(branch, items, sha, message, filePath) {
  const encoded = Buffer.from(JSON.stringify(items, null, 2) + '\n', 'utf-8').toString('base64');
  return githubRequest(`contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: encoded, sha, branch }),
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // upload — detectado por Content-Type multipart
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    const role = hasValidAdminSession(req);
    if (!role) return res.status(401).json({ error: 'No autorizado' });

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Supabase no configurado' });

    try {
      const buffers = [];
      for await (const chunk of req) { buffers.push(chunk); }
      const rawBody = Buffer.concat(buffers);
      const bm = contentType.match(/boundary=(.+)/);
      if (!bm) return res.status(400).json({ error: 'multipart requerido' });

      const boundary = bm[1].trim();
      const parts = rawBody.toString('binary').split('--' + boundary);
      let fileBuffer = null, fileName = 'img-' + Date.now() + '.jpg', fileType = 'image/jpeg';
      for (const part of parts) {
        if (!part.includes('filename=')) continue;
        const fnMatch = part.match(/filename="([^"]+)"/);
        if (fnMatch) fileName = fnMatch[1];
        const ctMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
        if (ctMatch) fileType = ctMatch[1].trim();
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;
        const bin = part.substring(headerEnd + 4);
        const cleanEnd = bin.endsWith('\r\n') ? bin.length - 2 : bin.length;
        fileBuffer = Buffer.from(bin.substring(0, cleanEnd), 'binary');
        break;
      }
      if (!fileBuffer || fileBuffer.length === 0) return res.status(400).json({ error: 'Archivo no encontrado' });
      if (fileBuffer.length > 5 * 1024 * 1024) return res.status(400).json({ error: 'Máximo 5 MB' });

      const supabase = createClient(supabaseUrl, serviceKey);
      const filePath = 'public/' + Date.now() + '-' + fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const { error } = await supabase.storage.from('imagenes').upload(filePath, fileBuffer, { contentType: fileType, upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('imagenes').getPublicUrl(filePath);

      logAdminAction(getAdminSessionRole(req), 'upload', 'imagen', { path: filePath }, req);
      return res.status(200).json({ ok: true, url: urlData?.publicUrl || '', path: filePath });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Falta la variable de entorno GITHUB_TOKEN' });
  }

  try {
    const { action, resource, docente, obra, id } = req.body || {};
    const isObra = resource === 'obra';
    const filePath = getFilePath(resource);

    // list es público — lo usan las páginas del sitio
    if (action === 'list') {
      const { items } = await readItems(branch, filePath);
      return res.status(200).json(
        isObra ? { ok: true, obras: items, branch } : { ok: true, docentes: items, branch }
      );
    }

    // save y delete requieren auth
    const role = hasValidAdminSession(req);
    if (!role) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (action === 'save' && isObra) {
      if (!obra || !obra.titulo || !obra.estado) {
        return res.status(400).json({ error: 'Falta título o estado' });
      }
      if (typeof obra.titulo !== 'string' || obra.titulo.trim().length < 2 || obra.titulo.length > 100) {
        return res.status(400).json({ error: 'Título: 2 a 100 caracteres' });
      }
      if (['pasada', 'presente', 'futura'].indexOf(obra.estado) === -1) {
        return res.status(400).json({ error: 'Estado inválido (pasada / presente / futura)' });
      }
      if (obra.descripcion && obra.descripcion.length > 500) {
        return res.status(400).json({ error: 'Descripción: máximo 500 caracteres' });
      }
      if (obra.imagenes && !Array.isArray(obra.imagenes)) {
        return res.status(400).json({ error: 'Imágenes debe ser una lista' });
      }

      const { items: obras, sha } = await readItems(branch, filePath);

      if (obra.id) {
        const idx = obras.findIndex((o) => o.id === obra.id);
        if (idx === -1) return res.status(404).json({ error: 'Obra no encontrada' });
        obras[idx] = { ...obras[idx], ...obra, id: obras[idx].id };
      } else {
        obra.id = 'obra-' + Date.now();
        obra.imagenes = obra.imagenes || [];
        obras.push(obra);
      }

      const commitMsg = `obras: guardar "${obra.titulo}"`;
      if (sha) {
        await writeItems(branch, obras, sha, commitMsg, filePath);
      } else {
        const encoded = Buffer.from(JSON.stringify(obras, null, 2) + '\n', 'utf-8').toString('base64');
        await githubRequest(`contents/${filePath}`, {
          method: 'PUT',
          body: JSON.stringify({ message: commitMsg, content: encoded, branch }),
        });
      }
      logAdminAction(getAdminSessionRole(req), 'obras-save', 'obras', { id: obra.id, titulo: obra.titulo }, req);
      return res.status(200).json({ ok: true, id: obra.id });
    }

    if (action === 'delete' && isObra) {
      if (getAdminSessionRole(req) !== 'admin') {
        return res.status(403).json({ error: 'Solo el admin puede borrar' });
      }
      if (!id) return res.status(400).json({ error: 'Falta id' });

      const { items: obras, sha } = await readItems(branch, filePath);
      if (!sha) return res.status(404).json({ error: 'No hay obras para borrar' });
      const obraEncontrada = obras.find((o) => o.id === id);
      if (!obraEncontrada) return res.status(404).json({ error: 'Obra no encontrada' });

      const filtered = obras.filter((o) => o.id !== id);
      await writeItems(branch, filtered, sha, `obras: borrar "${obraEncontrada.titulo}"`, filePath);
      logAdminAction('admin', 'obras-delete', 'obras', { id, titulo: obraEncontrada.titulo }, req);
      return res.status(200).json({ ok: true });
    }

    if (action === 'save') {
      if (!docente || !docente.nombre || !docente.rol) {
        return res.status(400).json({ error: 'Falta nombre o rol' });
      }

      // Validaciones
      if (typeof docente.nombre !== 'string' || docente.nombre.trim().length < 2 || docente.nombre.length > 80) {
        return res.status(400).json({ error: 'Nombre: 2 a 80 caracteres' });
      }
      if (typeof docente.rol !== 'string' || docente.rol.trim().length < 2) {
        return res.status(400).json({ error: 'Rol requerido' });
      }
      if (docente.frase && docente.frase.length > 200) {
        return res.status(400).json({ error: 'Frase: máximo 200 caracteres' });
      }
      if (docente.trayectoria && docente.trayectoria.length > 300) {
        return res.status(400).json({ error: 'Trayectoria: máximo 300 caracteres' });
      }
      if (docente.precio != null && (typeof docente.precio !== 'number' || docente.precio < 0)) {
        return res.status(400).json({ error: 'Precio inválido' });
      }

      const { items: docentes, sha } = await readItems(branch, filePath);

      if (docente.id) {
        const idx = docentes.findIndex((d) => d.id === docente.id);
        if (idx === -1) return res.status(404).json({ error: 'Docente no encontrado' });
        docentes[idx] = { ...docentes[idx], ...docente, id: docentes[idx].id };
      } else {
        docente.id = 'docente-' + Date.now();
        docente.activo = docente.activo !== false;
        docentes.push(docente);
      }

      const commitMsg = `docentes: guardar "${docente.nombre}"`;
      if (sha) {
        await writeItems(branch, docentes, sha, commitMsg, filePath);
      } else {
        const encoded = Buffer.from(JSON.stringify(docentes, null, 2) + '\n', 'utf-8').toString('base64');
        await githubRequest(`contents/${filePath}`, {
          method: 'PUT',
          body: JSON.stringify({ message: commitMsg, content: encoded, branch }),
        });
      }
      logAdminAction(getAdminSessionRole(req), 'docentes-save', 'docentes', { id: docente.id, nombre: docente.nombre }, req);
      return res.status(200).json({ ok: true, id: docente.id });
    }

    if (action === 'delete') {
      if (getAdminSessionRole(req) !== 'admin') {
        return res.status(403).json({ error: 'Solo el admin puede borrar' });
      }
      if (!id) return res.status(400).json({ error: 'Falta id' });

      const { items: docentes, sha } = await readItems(branch, filePath);
      if (!sha) return res.status(404).json({ error: 'No hay docentes para borrar' });
      const docente = docentes.find((d) => d.id === id);
      if (!docente) return res.status(404).json({ error: 'Docente no encontrado' });

      const filtered = docentes.filter((d) => d.id !== id);
      await writeItems(branch, filtered, sha, `docentes: borrar "${docente.nombre}"`, filePath);
      logAdminAction('admin', 'docentes-delete', 'docentes', { id, nombre: docente.nombre }, req);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Acción inválida' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
