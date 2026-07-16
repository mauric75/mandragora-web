import { hasValidAdminSession } from '../lib/admin-auth.js';
import { logAdminAction } from '../lib/audit.js';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

// Herramientas disponibles para DeepSeek
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'listar_reservas',
      description: 'Lista las reservas de la base de datos',
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
      description: 'Devuelve un resumen numérico de las reservas',
      parameters: { type: 'object', properties: {} },
    },
  },
];

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

    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Sos un asistente del panel admin de Mandrágora (teatro y escuela de artes en Montevideo). Respondé en español, con precisión. Solo tenés acceso a consultar reservas. No podés modificar datos. Si te preguntan algo que no podés responder, decilo claramente.' },
          { role: 'user', content: message },
        ],
        tools: TOOLS,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No pude procesar tu consulta.';

    logAdminAction('admin', 'ai-chat', 'ai-admin', { message: message.slice(0, 200), reply: reply.slice(0, 200) }, req);

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno' });
  }
}
