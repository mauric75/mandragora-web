// Netlify Function — MercadoPago preference generator
// Requires env var: MERCADOPAGO_ACCESS_TOKEN
// POST body: { title, price, quantity, email }

const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

exports.handler = async (event) => {
  // CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' };
  }

  if (!mpToken) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'MERCADOPAGO_ACCESS_TOKEN no configurado' }) };
  }

  try {
    const { title, price, quantity, email } = JSON.parse(event.body || '{}');

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{
          title: title || 'Mandrágora',
          quantity: quantity || 1,
          currency_id: 'UYU',
          unit_price: Number(price) || 1,
        }],
        payer: email ? { email } : undefined,
        back_urls: {
          success: `${event.headers.origin || 'https://mauric75.github.io/mandragora-web'}/exito.html`,
          failure: `${event.headers.origin || 'https://mauric75.github.io/mandragora-web'}/error.html`,
          pending: `${event.headers.origin || 'https://mauric75.github.io/mandragora-web'}/pendiente.html`,
        },
        auto_return: 'approved',
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
