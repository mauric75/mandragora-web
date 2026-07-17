// Vercel Serverless Function — gestiona data/agenda.json via GitHub API.
// Auth: cookie mandragora_admin_session
// Solo admin puede hacer delete.
//
// POST body: { action: "list" | "save" | "delete", evento?: {...}, id?: "..." }

import { hasValidAdminSession, getAdminSessionRole } from './lib/admin-auth.js';
import { logAdminAction } from './lib/audit.js';

const GITHUB_OWNER = 'mauric75';
const GITHUB_REPO = 'mandragora-web';
const FILE_PATH = 'data/agenda.json';

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

async function readAgenda(branch) {
  try {
    const data = await githubRequest(`contents/${FILE_PATH}?ref=${branch}`);
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { eventos: JSON.parse(content), sha: data.sha };
  } catch (e) {
    if (e.message && e.message.includes('Not Found')) {
      return { eventos: [], sha: null };
    }
    throw e;
  }
}

async function writeAgenda(branch, eventos, sha, message) {
  const encoded = Buffer.from(JSON.stringify(eventos, null, 2) + '\n', 'utf-8').toString('base64');
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
    const { action, evento, id } = req.body || {};

    // list es público — lo usan las páginas del sitio
    if (action === 'list') {
      const { eventos } = await readAgenda(branch);
      return res.status(200).json({ ok: true, eventos, branch });
    }

    // save y delete requieren auth
    const role = hasValidAdminSession(req);
    if (!role) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (action === 'save') {
      if (!evento || !evento.titulo || !evento.fecha) {
        return res.status(400).json({ error: 'Falta título o fecha' });
      }

      if (typeof evento.titulo !== 'string' || evento.titulo.trim().length < 2 || evento.titulo.length > 120) {
        return res.status(400).json({ error: 'Título: 2 a 120 caracteres' });
      }
      if (typeof evento.fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(evento.fecha)) {
        return res.status(400).json({ error: 'Fecha inválida (YYYY-MM-DD)' });
      }

      const { eventos, sha } = await readAgenda(branch);

      if (evento.id) {
        const idx = eventos.findIndex((e) => e.id === evento.id);
        if (idx === -1) return res.status(404).json({ error: 'Evento no encontrado' });
        eventos[idx] = { ...eventos[idx], ...evento, id: eventos[idx].id };
      } else {
        evento.id = 'evento-' + Date.now();
        evento.publicado = evento.publicado !== false;
        eventos.push(evento);
      }

      const commitMsg = `agenda: guardar "${evento.titulo}"`;
      if (sha) {
        await writeAgenda(branch, eventos, sha, commitMsg);
      } else {
        const encoded = Buffer.from(JSON.stringify(eventos, null, 2) + '\n', 'utf-8').toString('base64');
        await githubRequest(`contents/${FILE_PATH}`, {
          method: 'PUT',
          body: JSON.stringify({ message: commitMsg, content: encoded, branch }),
        });
      }

      logAdminAction(getAdminSessionRole(req), 'agenda-save', 'agenda', { id: evento.id, titulo: evento.titulo }, req);
      return res.status(200).json({ ok: true, id: evento.id });
    }

    if (action === 'delete') {
      if (getAdminSessionRole(req) !== 'admin') {
        return res.status(403).json({ error: 'Solo el admin puede borrar' });
      }
      if (!id) return res.status(400).json({ error: 'Falta id' });

      const { eventos, sha } = await readAgenda(branch);
      if (!sha) return res.status(404).json({ error: 'No hay eventos para borrar' });
      const ev = eventos.find((e) => e.id === id);
      if (!ev) return res.status(404).json({ error: 'Evento no encontrado' });

      const filtered = eventos.filter((e) => e.id !== id);
      await writeAgenda(branch, filtered, sha, `agenda: borrar "${ev.titulo}"`);
      logAdminAction('admin', 'agenda-delete', 'agenda', { id, titulo: ev.titulo }, req);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Acción inválida' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
