import { hasValidAdminSession, getAdminSessionRole } from '../lib/admin-auth.js';
import { logAdminAction } from '../lib/audit.js';
import { checkRateLimit } from '../lib/rate-limit.js';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const GITHUB_OWNER = 'mauric75';
const GITHUB_REPO = 'mandragora-web';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const DOCENTES_PATH = 'data/docentes.json';

// Solo estos orígenes pueden hacer pedidos con credenciales (cookie de sesión) a este endpoint.
// Sin esto, reflejar cualquier origen + Allow-Credentials permite que un sitio de terceros
// use la sesión del admin sin que se dé cuenta.
function isAllowedOrigin(origin) {
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'deploy-phi-wheat.vercel.app') return true;
    if (hostname.endsWith('-mauricio-s-projects1.vercel.app')) return true;
    return false;
  } catch {
    return false;
  }
}

// ── Helpers para leer/escribir docentes.json en GitHub ──────

async function readDocentesJSON() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN no configurado');
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DOCENTES_PATH}?ref=${GITHUB_BRANCH}`, {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error('No se pudo leer docentes.json');
  const json = await res.json();
  const content = Buffer.from(json.content, 'base64').toString('utf-8');
  return { docentes: JSON.parse(content), sha: json.sha };
}

async function writeDocentesJSON(docentes, sha, message) {
  const token = process.env.GITHUB_TOKEN;
  const encoded = Buffer.from(JSON.stringify(docentes, null, 2) + '\n', 'utf-8').toString('base64');
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DOCENTES_PATH}`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: encoded, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) throw new Error('No se pudo escribir docentes.json');
  return 'OK';
}

// ── Helpers para agenda.json ─────────────────────────────────

const AGENDA_PATH = 'data/agenda.json';

async function readAgendaJSON() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN no configurado');
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${AGENDA_PATH}?ref=${GITHUB_BRANCH}`, {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) return { eventos: [], sha: null };
  const json = await res.json();
  const content = Buffer.from(json.content, 'base64').toString('utf-8');
  return { eventos: JSON.parse(content), sha: json.sha };
}

async function writeAgendaJSON(eventos, sha, message) {
  const token = process.env.GITHUB_TOKEN;
  const encoded = Buffer.from(JSON.stringify(eventos, null, 2) + '\n', 'utf-8').toString('base64');
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${AGENDA_PATH}`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: encoded, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) throw new Error('No se pudo escribir agenda.json');
  return 'OK';
}

// ── Helpers para noticias.json ────────────────────────────────

const NOTICIAS_PATH = 'data/noticias.json';

async function readNoticiasJSON() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN no configurado');
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${NOTICIAS_PATH}?ref=${GITHUB_BRANCH}`, {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) return { noticias: [], sha: null };
  const json = await res.json();
  const content = Buffer.from(json.content, 'base64').toString('utf-8');
  return { noticias: JSON.parse(content), sha: json.sha };
}

async function writeNoticiasJSON(noticias, sha, message) {
  const token = process.env.GITHUB_TOKEN;
  const encoded = Buffer.from(JSON.stringify(noticias, null, 2) + '\n', 'utf-8').toString('base64');
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${NOTICIAS_PATH}`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: encoded, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) throw new Error('No se pudo escribir noticias.json');
  return 'OK';
}

// ── Helper genérico para GitHub API ─────────────────────────

async function githubRequest(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
    ...options,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `GitHub API error (${res.status})`);
  }
  return res;
}

// Herramientas disponibles para DeepSeek
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'listar_reservas',
      description: 'Lista las reservas de la base de datos. Podés filtrar por tipo de servicio y estado.',
      parameters: {
        type: 'object',
        properties: {
          servicio: { type: 'string', enum: ['sala', 'taller', 'entrada', 'otro'], description: 'Filtrar por tipo de servicio' },
          estado: { type: 'string', enum: ['pendiente', 'contactada', 'confirmada', 'cancelada'], description: 'Filtrar por estado' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'resumir_reservas',
      description: 'Devuelve un resumen numérico: total de reservas y cuántas hay por estado y por tipo de servicio.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listar_docentes',
      description: 'Lista los docentes de la escuela. Muestra nombre, rol, precio y si están activos.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listar_eventos',
      description: 'Lista los eventos de la agenda. Devuelve todos o filtrados por mes.',
      parameters: {
        type: 'object',
        properties: {
          mes: { type: 'number', description: 'Número de mes (1-12) para filtrar, opcional' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'crear_evento',
      description: 'Crea un nuevo evento en la agenda. Requiere título y fecha (YYYY-MM-DD). Solo admin y editor.',
      parameters: {
        type: 'object',
        properties: {
          titulo: { type: 'string', description: 'Título del evento' },
          fecha: { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
          hora: { type: 'string', description: 'Hora opcional (ej: 20:00)' },
          tipo: { type: 'string', description: 'Tipo de evento (ej: Teatro, Evento especial)' },
          categoria: { type: 'string', description: 'Categoría (ej: Compañía Mandrágora)' },
          descripcion: { type: 'string', description: 'Descripción del evento' },
          link_tickets: { type: 'string', description: 'URL de tickets' },
          texto_boton: { type: 'string', description: 'Texto del botón (ej: Entradas, Estreno)' },
        },
        required: ['titulo', 'fecha'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'actualizar_evento',
      description: 'Actualiza un evento existente. Buscalo por título. Solo admin y editor.',
      parameters: {
        type: 'object',
        properties: {
          titulo: { type: 'string', description: 'Título del evento a buscar' },
          cambios: { type: 'object', description: 'Campos a cambiar: titulo, fecha, hora, tipo, categoria, descripcion, link_tickets, texto_boton, publicado' },
        },
        required: ['titulo', 'cambios'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'proximo_evento',
      description: 'Devuelve el próximo evento en la agenda (el más cercano a hoy).',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'actualizar_docente',
      description: 'Actualiza los datos de un docente existente. Buscalo por nombre (o parte del nombre). Solo admin y editor pueden usar esta herramienta.',
      parameters: {
        type: 'object',
        properties: {
          nombre: { type: 'string', description: 'Nombre del docente a actualizar (o parte)' },
          cambios: {
            type: 'object',
            description: 'Campos a cambiar: nombre, rol, foto, frase, trayectoria, instagram, whatsapp, precio, activo',
            properties: {
              nombre: { type: 'string' },
              rol: { type: 'string' },
              foto: { type: 'string', description: 'URL o path de la imagen' },
              frase: { type: 'string' },
              trayectoria: { type: 'string' },
              instagram: { type: 'string' },
              whatsapp: { type: 'string' },
              precio: { type: 'number' },
              activo: { type: 'boolean' },
            },
          },
        },
        required: ['nombre', 'cambios'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'crear_docente',
      description: 'Crea un nuevo docente en la escuela. Solo admin y editor pueden usar esta herramienta.',
      parameters: {
        type: 'object',
        properties: {
          nombre: { type: 'string', description: 'Nombre del docente' },
          rol: { type: 'string', description: 'Disciplinas que enseña' },
          foto: { type: 'string', description: 'URL o path de la imagen' },
          frase: { type: 'string' },
          trayectoria: { type: 'string' },
          instagram: { type: 'string' },
          whatsapp: { type: 'string' },
          precio: { type: 'number' },
          activo: { type: 'boolean' },
        },
        required: ['nombre', 'rol'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listar_noticias',
      description: 'Lista las noticias. Se puede filtrar por publicadas o borrador.',
      parameters: {
        type: 'object',
        properties: {
          estado: { type: 'string', enum: ['publicada', 'borrador'], description: 'Filtrar por estado' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'crear_noticia',
      description: 'Crea una nueva noticia. Solo admin y editor. Si el usuario te da un texto informal, redactalo como noticia formal antes de crearla. Elegí un buen título.',
      parameters: {
        type: 'object',
        properties: {
          titulo: { type: 'string', description: 'Título de la noticia' },
          texto: { type: 'string', description: 'Cuerpo de la noticia' },
          tipo: { type: 'string', enum: ['anuncio', 'prensa'], description: 'anuncio (propio) o prensa (nota externa)' },
          imagen: { type: 'string', description: 'URL de imagen opcional' },
          link: { type: 'string', description: 'Link externo opcional' },
        },
        required: ['titulo', 'texto'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'actualizar_noticia',
      description: 'Actualiza una noticia existente. Buscala por título. Solo admin y editor.',
      parameters: {
        type: 'object',
        properties: {
          titulo: { type: 'string', description: 'Título de la noticia a buscar' },
          cambios: { type: 'object', description: 'Campos a cambiar: titulo, texto, tipo, imagen, link, publicada' },
        },
        required: ['titulo', 'cambios'],
      },
    },
  },
];

// ── Ejecutar herramienta contra datos reales ──────────────────

async function executeTool(name, args) {
  if (name === 'listar_reservas') {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    let query = supabase.from('reservas').select('*').order('fecha', { ascending: false }).limit(50);
    if (args?.servicio) query = query.eq('servicio', args.servicio);
    if (args?.estado) query = query.eq('estado', args.estado);
    const { data, error } = await query;
    if (error) return 'Error al consultar reservas: ' + error.message;
    if (!data || !data.length) return 'No hay reservas con esos filtros.';
    return JSON.stringify(data.map(r => ({
      fecha: r.fecha, servicio: r.servicio, detalle: r.detalle,
      nombre: r.nombre, whatsapp: r.whatsapp, email: r.email, estado: r.estado
    })));
  }

  if (name === 'resumir_reservas') {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from('reservas').select('servicio, estado');
    if (error) return 'Error: ' + error.message;
    if (!data || !data.length) return 'No hay reservas todavía.';

    const total = data.length;
    const porEstado = {};
    const porServicio = {};
    data.forEach(r => {
      porEstado[r.estado] = (porEstado[r.estado] || 0) + 1;
      porServicio[r.servicio] = (porServicio[r.servicio] || 0) + 1;
    });

    return JSON.stringify({ total, porEstado, porServicio });
  }

  if (name === 'listar_docentes') {
    try {
      const { docentes } = await readDocentesJSON();
      if (!docentes.length) return 'No hay docentes cargados todavía.';
      return JSON.stringify(docentes.map(d => ({
        nombre: d.nombre, rol: d.rol, precio: d.precio, activo: d.activo,
        instagram: d.instagram, whatsapp: d.whatsapp, id: d.id
      })));
    } catch (e) {
      return 'Error al consultar docentes: ' + e.message;
    }
  }

  // ── Agenda ──────────────────────────

  if (name === 'listar_eventos') {
    try {
      const { eventos } = await readAgendaJSON();
      let evs = eventos || [];
      if (args?.mes) evs = evs.filter(e => e.fecha && parseInt(e.fecha.split('-')[1]) === args.mes);
      if (!evs.length) return 'No hay eventos' + (args?.mes ? ' en ese mes' : '') + '.';
      evs.sort((a,b) => a.fecha.localeCompare(b.fecha));
      return JSON.stringify(evs.map(e => ({
        titulo: e.titulo, fecha: e.fecha, hora: e.hora, tipo: e.tipo,
        categoria: e.categoria, link_tickets: e.link_tickets, publicado: e.publicado, id: e.id
      })));
    } catch (e) {
      return 'Error al consultar agenda: ' + e.message;
    }
  }

  if (name === 'crear_evento') {
    const role = args?._role;
    if (role !== 'admin' && role !== 'editor') return 'Solo admin y editor pueden crear eventos.';
    if (!args?.titulo || !args?.fecha) return 'Falta título o fecha.';
    try {
      const { eventos, sha } = await readAgendaJSON();
      const nuevo = {
        id: 'evento-' + Date.now(),
        titulo: args.titulo, fecha: args.fecha,
        hora: args.hora || '', tipo: args.tipo || '', categoria: args.categoria || '',
        descripcion: args.descripcion || '', link_tickets: args.link_tickets || '',
        texto_boton: args.texto_boton || 'Ver más', publicado: true,
      };
      eventos.push(nuevo);
      const msg = `IA: crear evento "${nuevo.titulo}"`;
      if (sha) {
        await writeAgendaJSON(eventos, sha, msg);
      } else {
        const encoded = Buffer.from(JSON.stringify(eventos, null, 2) + '\n', 'utf-8').toString('base64');
        await githubRequest(`contents/data/agenda.json`, {
          method: 'PUT',
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, content: encoded, branch: GITHUB_BRANCH }),
        });
      }
      return 'Evento "' + nuevo.titulo + '" creado el ' + nuevo.fecha + '.';
    } catch (e) {
      return 'Error al crear evento: ' + e.message;
    }
  }

  if (name === 'actualizar_evento') {
    const role = args?._role;
    if (role !== 'admin' && role !== 'editor') return 'Solo admin y editor pueden modificar eventos.';
    try {
      const { eventos, sha } = await readAgendaJSON();
      const tituloBuscado = (args?.titulo || '').toLowerCase();
      const idx = eventos.findIndex(e => e.titulo.toLowerCase().includes(tituloBuscado));
      if (idx === -1) return 'No encontré un evento que coincida con "' + (args?.titulo || '') + '".';
      const cambios = args?.cambios || {};
      Object.keys(cambios).forEach(k => {
        if (cambios[k] !== undefined) eventos[idx][k] = cambios[k];
      });
      await writeAgendaJSON(eventos, sha, `IA: actualizar evento "${eventos[idx].titulo}"`);
      return 'Evento "' + eventos[idx].titulo + '" actualizado.';
    } catch (e) {
      return 'Error al actualizar evento: ' + e.message;
    }
  }

  if (name === 'proximo_evento') {
    try {
      const { eventos } = await readAgendaJSON();
      const hoy = new Date().toISOString().slice(0,10);
      const futuros = (eventos||[]).filter(e => e.fecha >= hoy && e.publicado !== false).sort((a,b) => a.fecha.localeCompare(b.fecha));
      if (!futuros.length) return 'No hay eventos próximos.';
      const e = futuros[0];
      return JSON.stringify({ titulo: e.titulo, fecha: e.fecha, hora: e.hora, tipo: e.tipo, descripcion: e.descripcion });
    } catch (e) {
      return 'Error: ' + e.message;
    }
  }

  // ── Noticias ─────────────────────────

  if (name === 'listar_noticias') {
    try {
      const { noticias } = await readNoticiasJSON();
      let items = noticias || [];
      if (args?.estado === 'publicada') items = items.filter(n => n.publicada !== false);
      if (args?.estado === 'borrador') items = items.filter(n => !n.publicada);
      if (!items.length) return 'No hay noticias' + (args?.estado ? ' en estado ' + args.estado : '') + '.';
      return JSON.stringify(items.map(n => ({
        titulo: n.titulo, texto: n.texto, tipo: n.tipo, fecha: n.fecha,
        publicada: n.publicada, imagen: n.imagen, link: n.link, id: n.id
      })));
    } catch (e) {
      return 'Error al consultar noticias: ' + e.message;
    }
  }

  if (name === 'crear_noticia') {
    const role = args?._role;
    if (role !== 'admin' && role !== 'editor') return 'Solo admin y editor pueden crear noticias.';
    if (!args?.titulo || !args?.texto) return 'Falta título o texto.';
    try {
      const { noticias, sha } = await readNoticiasJSON();
      const nueva = {
        id: 'noticia-' + Date.now(),
        titulo: args.titulo, texto: args.texto,
        tipo: args.tipo || 'anuncio', imagen: args.imagen || '', link: args.link || '',
        fecha: new Date().toISOString().slice(0,10), publicada: true,
      };
      noticias.unshift(nueva);
      const msg = `IA: crear noticia "${nueva.titulo}"`;
      if (sha) {
        await writeNoticiasJSON(noticias, sha, msg);
      } else {
        const encoded = Buffer.from(JSON.stringify(noticias, null, 2) + '\n', 'utf-8').toString('base64');
        await githubRequest(`contents/data/noticias.json`, {
          method: 'PUT',
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, content: encoded, branch: GITHUB_BRANCH }),
        });
      }
      return 'Noticia "' + nueva.titulo + '" creada.';
    } catch (e) {
      return 'Error al crear noticia: ' + e.message;
    }
  }

  if (name === 'actualizar_noticia') {
    const role = args?._role;
    if (role !== 'admin' && role !== 'editor') return 'Solo admin y editor pueden modificar noticias.';
    try {
      const { noticias, sha } = await readNoticiasJSON();
      const tituloBuscado = (args?.titulo || '').toLowerCase();
      const idx = noticias.findIndex(n => n.titulo.toLowerCase().includes(tituloBuscado));
      if (idx === -1) return 'No encontré una noticia que coincida con "' + (args?.titulo || '') + '".';
      const cambios = args?.cambios || {};
      // También aceptar campos directos como cambios
      const camposDirectos = ['titulo','texto','tipo','imagen','link','publicada','fecha'];
      camposDirectos.forEach(k => {
        if (args[k] !== undefined) cambios[k] = args[k];
      });
      Object.keys(cambios).forEach(k => {
        if (cambios[k] !== undefined) noticias[idx][k] = cambios[k];
      });
      await writeNoticiasJSON(noticias, sha, `IA: actualizar noticia "${noticias[idx].titulo}"`);
      return 'Noticia "' + noticias[idx].titulo + '" actualizada.';
    } catch (e) {
      return 'Error al actualizar: ' + e.message;
    }
  }

  if (name === 'actualizar_docente') {
    const role = args?._role;
    if (role !== 'admin' && role !== 'editor') return 'Solo admin y editor pueden modificar docentes.';
    try {
      const { docentes, sha } = await readDocentesJSON();
      let idx = -1;
      // Buscar por id o por nombre
      if (args?.id) {
        idx = docentes.findIndex(d => d.id === args.id);
      } else if (args?.nombre) {
        const nombreBuscado = (args.nombre || '').toLowerCase();
        idx = docentes.findIndex(d => d.nombre.toLowerCase().includes(nombreBuscado));
      }
      if (idx === -1) return 'No encontré un docente que coincida con "' + (args?.nombre || args?.id || '') + '".';

      // args directos (frase, foto, etc.) van como cambios
      const cambios = args?.cambios || {};
      // También aceptar campos directos como cambios
      const camposDirectos = ['nombre','rol','foto','frase','trayectoria','instagram','whatsapp','precio','activo'];
      camposDirectos.forEach(k => {
        if (args[k] !== undefined) cambios[k] = args[k];
      });

      Object.keys(cambios).forEach(k => {
        if (cambios[k] !== undefined) docentes[idx][k] = cambios[k];
      });

      await writeDocentesJSON(docentes, sha, `IA: actualizar docente "${docentes[idx].nombre}"`);
      return 'Docente "' + docentes[idx].nombre + '" actualizado correctamente.';
    } catch (e) {
      return 'Error al actualizar: ' + e.message;
    }
  }

  if (name === 'crear_docente') {
    const role = args?._role;
    if (role !== 'admin' && role !== 'editor') return 'Solo admin y editor pueden crear docentes.';
    if (!args?.nombre || !args?.rol) return 'Falta nombre o rol para crear el docente.';
    try {
      const { docentes, sha } = await readDocentesJSON();
      const nuevo = {
        id: 'docente-' + Date.now(),
        nombre: args.nombre,
        rol: args.rol,
        foto: args.foto || '',
        frase: args.frase || '',
        trayectoria: args.trayectoria || '',
        instagram: args.instagram || '',
        whatsapp: args.whatsapp || '',
        precio: args.precio || 2500,
        activo: args.activo !== false,
      };
      docentes.push(nuevo);
      await writeDocentesJSON(docentes, sha, `IA: crear docente "${nuevo.nombre}"`);
      return 'Docente "' + nuevo.nombre + '" creado correctamente con id ' + nuevo.id + '.';
    } catch (e) {
      return 'Error al crear: ' + e.message;
    }
  }

  return 'Herramienta desconocida: ' + name;
}

// ── Handler principal ────────────────────────────────────────

export default async function handler(req, res) {
  const origin = req.headers?.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  if (!hasValidAdminSession(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const ip = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(`ai-chat:${ip}`)) {
    return res.status(429).json({ error: 'Demasiados mensajes. Esperá un minuto.' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'IA no configurada' });

  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    const role = getAdminSessionRole(req);

    // Construir mensajes para DeepSeek
    const messages = [
      {
        role: 'system',
        content: `Sos el asistente IA del panel admin de Mandrágora, una casa de teatro y escuela de artes en Montevideo, Uruguay.
El usuario que te habla tiene rol "${role}".
Podés consultar y modificar datos reales usando las herramientas disponibles:
- listar_reservas: lista reservas con filtros opcionales
- resumir_reservas: resumen numérico de reservas
- listar_docentes: lista los docentes de la escuela
- listar_eventos: lista los eventos de la agenda (opcional: filtrar por mes)
- crear_evento: crea un nuevo evento (requiere título y fecha YYYY-MM-DD)
- actualizar_evento: modifica un evento existente
- proximo_evento: muestra el próximo evento
- listar_noticias: lista las noticias (filtrar por publicada/borrador)
- crear_noticia: crea una noticia. Si te pasan texto informal, redactalo como noticia formal con buen título
- actualizar_noticia: modifica una noticia existente
Si el usuario te pide hacer algo, respondé ÚNICAMENTE con un bloque JSON así:
\`\`\`json
{"tool": "nombre_de_herramienta", "args": {"campo1": "valor1", ...}}
\`\`\`
Para actualizar_docente y actualizar_noticia usá el id o nombre y los campos a cambiar directamente en args (sin wrapper cambios).
Para crear_noticia, si el usuario te da un texto crudo (ej: "este finde hay función"), convertilo en una noticia bien redactada con un título atractivo.
No agregues texto antes ni después del bloque JSON cuando uses una herramienta.
Respondé siempre en español, con claridad y precisión.`
      },
      { role: 'user', content: message },
    ];

    // Llamar a DeepSeek con tools
    let response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        tools: TOOLS,
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    let data = await response.json();
    let choice = data.choices?.[0];
    let reply = choice?.message?.content || '';

    // Function calling loop (máx 3 rondas)
    for (let loop = 0; loop < 3; loop++) {
      const nativeCalls = choice?.message?.tool_calls;
      let jsonTool = null;
      if (!nativeCalls && reply) {
        const clean = reply.replace(/```json\s*|\s*```/g, '').trim();
        const m = clean.match(/\{\s*"tool"\s*:\s*"([^"]+)"\s*,\s*"args"\s*:\s*(\{[\s\S]*?\})\s*\}/);
        if (m) jsonTool = { name: m[1], args: m[2] };
      }

      if (!nativeCalls?.length && !jsonTool) break;

      if (nativeCalls) {
        messages.push(choice.message);
        for (const tc of nativeCalls) {
          const fnName = tc.function?.name;
          let fnArgs = {};
          try { fnArgs = JSON.parse(tc.function?.arguments || '{}'); } catch(e) {}
          fnArgs._role = role;
          const result = await executeTool(fnName, fnArgs);
          messages.push({ role: 'tool', tool_call_id: tc.id, content: result });
        }
      } else if (jsonTool) {
        messages.push({ role: 'assistant', content: reply });
        let fnArgs = {};
        try { fnArgs = JSON.parse(jsonTool.args); } catch(e) {}
        fnArgs._role = role;
        const result = await executeTool(jsonTool.name, fnArgs);
        messages.push({ role: 'tool', tool_call_id: jsonTool.name, content: result });
      }

      // Llamar a DeepSeek con los resultados
      response = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'deepseek-chat', messages, temperature: 0.3, max_tokens: 600 }),
      });

      data = await response.json();
      choice = data.choices?.[0];
      reply = choice?.message?.content || '';
    }

    // Si no hay reply pero se ejecutaron herramientas, dar confirmación
    if (reply && reply.trim().length > 5) {
      // La IA respondió con texto, todo bien
    } else if (messages.length > 2) {
      reply = '¡Listo! La acción se completó correctamente.';
    } else {
      reply = 'No pude ejecutar esa acción. ¿Podés intentarlo de otra forma?';
    }

    logAdminAction(role, 'ai-chat', 'ai-admin', { message: message.slice(0, 200), reply: reply.slice(0, 200) }, req);

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno' });
  }
}
