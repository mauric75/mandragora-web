// Vercel Serverless Function — MercadoPago unificado
// POST body: { action: "preferencia" | "suscripcion", title, price, ... }
//   preferencia: { title, price, quantity, email }
//   suscripcion: { title, price, email, reason }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!mpToken) return res.status(500).json({ error: 'MERCADOPAGO_ACCESS_TOKEN no configurado' });

  try {
    const { action, title, price, quantity, email, reason } = req.body || {};

    if (action === 'preferencia') {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${mpToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ title: title || 'Mandrágora', quantity: quantity || 1, currency_id: 'UYU', unit_price: Number(price) || 1 }],
          payer: email ? { email } : undefined,
          back_urls: {
            success: `${req.headers.origin}/exito.html`,
            failure: `${req.headers.origin}/error.html`,
          },
          auto_return: 'approved',
        }),
      });
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (action === 'suscripcion') {
      const response = await fetch('https://api.mercadopago.com/preapproval', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${mpToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason || title || 'Membresía Mandrágora',
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: Number(price) || 500,
            currency_id: 'UYU',
          },
          payer_email: email,
          back_url: `${req.headers.origin}/exito.html`,
          status: 'pending',
        }),
      });
      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Acción inválida. Usá action: "preferencia" o "suscripcion"' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
