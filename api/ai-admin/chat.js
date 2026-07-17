import { hasValidAdminSession, getAdminSessionRole } from '../lib/admin-auth.js';
import { logAdminAction } from '../lib/audit.js';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const GITHUB_OWNER = 'mauric75';
const GITHUB_REPO = 'mandragora-web';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

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
    const token = process.env.GITHUB_TOKEN;
    if (!token) return 'Error: GITHUB_TOKEN no configurado.';
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/docentes.json?ref=${GITHUB_BRANCH}`, {
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' },
      });
      if (!res.ok) return 'No se pudo leer docentes.json (quizás no existe aún).';
      const json = await res.json();
      const content = Buffer.from(json.content, 'base64').toString('utf-8');
      const docentes = JSON.parse(content);
      if (!docentes.length) return 'No hay docentes cargados todavía.';
      return JSON.stringify(docentes.map(d => ({
        nombre: d.nombre, rol: d.rol, precio: d.precio, activo: d.activo,
        instagram: d.instagram, whatsapp: d.whatsapp
      })));
    } catch (e) {
      return 'Error al consultar docentes: ' + e.message;
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
Podés consultar datos reales usando las herramientas disponibles:
- listar_reservas: lista reservas con filtros opcionales (servicio, estado)
- resumir_reservas: resumen numérico de reservas por estado y tipo
- listar_docentes: lista los docentes de la escuela
Si el usuario pide modificar algo (borrar, cambiar estado, crear), decile que por ahora solo podés consultar.
Respondé siempre en español, con claridad y precisión. Si no entendés algo, preguntá.`
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

    // Function calling loop
    let loops = 0;
    while (choice?.message?.tool_calls && loops < 3) {
      loops++;
      const toolResults = [];

      for (const tc of choice.message.tool_calls) {
        const fnName = tc.function?.name;
        let fnArgs = {};
        try { fnArgs = JSON.parse(tc.function?.arguments || '{}'); } catch (e) { /* empty */ }
        const result = await executeTool(fnName, fnArgs);
        toolResults.push({ tool_call_id: tc.id, role: 'tool', content: result });
      }

      // Agregar assistant message + tool results al historial
      messages.push(choice.message);
      messages.push(...toolResults);

      // Segunda llamada a DeepSeek con los resultados
      response = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.3,
          max_tokens: 600,
        }),
      });

      data = await response.json();
      choice = data.choices?.[0];
    }

    const reply = choice?.message?.content || 'No pude procesar tu consulta.';

    logAdminAction(role, 'ai-chat', 'ai-admin', { message: message.slice(0, 200), reply: reply.slice(0, 200) }, req);

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno' });
  }
}
