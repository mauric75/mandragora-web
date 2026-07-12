// Vercel Serverless Function — MercadoPago
// POST body: { title, price, quantity, email }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!mpToken) return res.status(500).json({ error: 'MERCADOPAGO_ACCESS_TOKEN no configurado' });

  try {
    const { title, price, quantity, email } = req.body || {};

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
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
