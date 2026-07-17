// Vercel Serverless Function — gestiona data/noticias.json escribiendo directo al repo de GitHub.
// No usa base de datos externa: el propio archivo JSON en el repo es la fuente de datos.
// Auth: cookie mandragora_admin_session (admin/editor/consulta) o Bearer token (transición)
//
// POST body: { action: "list" | "save" | "delete", noticia?: {...}, id?: "..." }

import { hasValidAdminSession } from './lib/admin-auth.js';

const GITHUB_OWNER = 'mauric75';
const GITHUB_REPO = 'mandragora-web';
const FILE_PATH = 'data/noticias.json';

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

async function readNoticias(branch) {
  const data = await githubRequest(`contents/${FILE_PATH}?ref=${branch}`);
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { noticias: JSON.parse(content), sha: data.sha };
}

async function writeNoticias(branch, noticias, sha, message) {
  const encoded = Buffer.from(JSON.stringify(noticias, null, 2) + '\n', 'utf-8').toString('base64');
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

  // Auth: cookie session (admin unificado) o Bearer token (compatibilidad)
  const sessionRole = hasValidAdminSession(req);
  const adminSecret = process.env.NOTICIAS_ADMIN_SECRET;
  const authHeader = req.headers['authorization'] || '';

  if (!sessionRole && (!adminSecret || authHeader !== `Bearer ${adminSecret}`)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Falta la variable de entorno GITHUB_TOKEN' });
  }

  try {
    const { action, noticia, id } = req.body || {};

    if (action === 'list') {
      const { noticias } = await readNoticias(branch);
      return res.status(200).json({ ok: true, noticias, branch });
    }

    if (action === 'save') {
      if (!noticia || !noticia.titulo || !noticia.texto) {
        return res.status(400).json({ error: 'Falta título o texto' });
      }
      const { noticias, sha } = await readNoticias(branch);

      if (noticia.id) {
        const idx = noticias.findIndex((n) => n.id === noticia.id);
        if (idx === -1) return res.status(404).json({ error: 'Noticia no encontrada' });
        noticias[idx] = { ...noticias[idx], ...noticia };
      } else {
        noticia.id = 'noticia-' + Date.now();
        noticia.fecha = noticia.fecha || new Date().toISOString().slice(0, 10);
        noticias.unshift(noticia);
      }

      await writeNoticias(branch, noticias, sha, `noticias: guardar "${noticia.titulo}"`);
      return res.status(200).json({ ok: true, id: noticia.id });
    }

    if (action === 'delete') {
      if (!id) return res.status(400).json({ error: 'Falta id' });
      const { noticias, sha } = await readNoticias(branch);
      const filtered = noticias.filter((n) => n.id !== id);
      if (filtered.length === noticias.length) {
        return res.status(404).json({ error: 'Noticia no encontrada' });
      }
      await writeNoticias(branch, filtered, sha, `noticias: borrar ${id}`);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Acción inválida' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
