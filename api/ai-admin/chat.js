import { hasValidAdminSession, getAdminSessionRole } from '../lib/admin-auth.js';
import { logAdminAction } from '../lib/audit.js';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const GITHUB_OWNER = 'mauric75';
const GITHUB_REPO = 'mandragora-web';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const DOCENTES_PATH = 'data/docentes.json';

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
  res.setHeader('Access-Control-Allow-Origin', req.headers?.origin || '');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  if (!hasValidAdminSession(req)) {
    return res.status(401).json({ error: 'No autorizado' });
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
- actualizar_docente: modifica datos de un docente (nombre, rol, foto, frase, trayectoria, etc.)
- crear_docente: crea un nuevo docente (requiere nombre y rol)
Si el usuario te pide hacer algo, respondé ÚNICAMENTE con un bloque JSON así:
\`\`\`json
{"tool": "nombre_de_herramienta", "args": {"campo1": "valor1", ...}}
\`\`\`
Para actualizar_docente usá el id o nombre del docente y los campos a cambiar directamente en args (sin wrapper cambios).
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
    console.error('[CHAT] content:', JSON.stringify(reply?.substring(0,200)));
    console.error('[CHAT] finish_reason:', choice?.finish_reason);

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
      console.error('[CHAT] loop', loop, 'native:', nativeCalls?.length, 'json:', !!jsonTool);

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
      console.error('[CHAT] loop', loop, 'reply:', JSON.stringify(reply?.substring(0,100)));
    }

    // Si no hay reply pero se ejecutaron herramientas, dar confirmación
    if ((!reply || !reply.trim() || reply.trim().length < 5) && messages.length > 2) {
      reply = '¡Listo! La acción se completó correctamente.';
    } else if (!reply || !reply.trim()) {
      reply = 'Lo siento, no pude procesar esa acción. Intentá decirlo de otra forma.';
    }

    logAdminAction(role, 'ai-chat', 'ai-admin', { message: message.slice(0, 200), reply: reply.slice(0, 200) }, req);

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno' });
  }
}
