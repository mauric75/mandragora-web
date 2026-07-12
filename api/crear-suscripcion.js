// Vercel Serverless Function — MercadoPago Suscripción
// POST body: { title, price, email, reason }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!mpToken) return res.status(500).json({ error: 'Token no configurado' });

  try {
    const { title, price, email, reason } = req.body || {};

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
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
