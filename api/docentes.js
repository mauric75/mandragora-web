// Vercel Serverless Function — gestiona data/docentes.json escribiendo directo al repo de GitHub.
// Auth: cookie mandragora_admin_session (admin/editor/consulta)
// Solo admin puede hacer delete.
//
// POST body: { action: "list" | "save" | "delete", docente?: {...}, id?: "..." }

import { hasValidAdminSession, getAdminSessionRole } from './lib/admin-auth.js';
import { logAdminAction } from './lib/audit.js';

const GITHUB_OWNER = 'mauric75';
const GITHUB_REPO = 'mandragora-web';
const FILE_PATH = 'data/docentes.json';

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

async function readDocentes(branch) {
  try {
    const data = await githubRequest(`contents/${FILE_PATH}?ref=${branch}`);
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { docentes: JSON.parse(content), sha: data.sha };
  } catch (e) {
    if (e.message && e.message.includes('Not Found')) {
      return { docentes: [], sha: null };
    }
    throw e;
  }
}

async function writeDocentes(branch, docentes, sha, message) {
  const encoded = Buffer.from(JSON.stringify(docentes, null, 2) + '\n', 'utf-8').toString('base64');
  return githubRequest(`contents/${FILE_PATH}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: encoded, sha, branch }),
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Falta la variable de entorno GITHUB_TOKEN' });
  }

  try {
    const { action, docente, id } = req.body || {};

    // list es público — lo usan las páginas del sitio
    if (action === 'list') {
      const { docentes } = await readDocentes(branch);
      return res.status(200).json({ ok: true, docentes, branch });
    }

    // save y delete requieren auth
    const role = hasValidAdminSession(req);
    if (!role) {
      return res.status(401).json({ error: 'No autorizado' });
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

      const { docentes, sha } = await readDocentes(branch);

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
        await writeDocentes(branch, docentes, sha, commitMsg);
      } else {
        const encoded = Buffer.from(JSON.stringify(docentes, null, 2) + '\n', 'utf-8').toString('base64');
        await githubRequest(`contents/${FILE_PATH}`, {
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

      const { docentes, sha } = await readDocentes(branch);
      if (!sha) return res.status(404).json({ error: 'No hay docentes para borrar' });
      const docente = docentes.find((d) => d.id === id);
      if (!docente) return res.status(404).json({ error: 'Docente no encontrado' });

      const filtered = docentes.filter((d) => d.id !== id);
      await writeDocentes(branch, filtered, sha, `docentes: borrar "${docente.nombre}"`);
      logAdminAction('admin', 'docentes-delete', 'docentes', { id, nombre: docente.nombre }, req);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Acción inválida' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
