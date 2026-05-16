require('dotenv').config();
const express = require('express');
const https = require('https');
const { enviarCorreo } = require('./src/emailSender');

const app = express();
// SNS envía el body como text/plain o application/json; parseamos ambos
app.use(express.json({ type: ['application/json', 'text/plain'] }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notificaciones-service',
    environment: process.env.NODE_ENV || 'local'
  });
});

// Endpoint receptor de mensajes SNS
app.post('/notify', async (req, res) => {
  const messageType = req.headers['x-amz-sns-message-type'];
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // SNS requiere confirmar la suscripción la primera vez
  if (messageType === 'SubscriptionConfirmation') {
    console.log('[notificaciones-service] Confirmando suscripción SNS...');
    https.get(body.SubscribeURL, (response) => {
      console.log(`[notificaciones-service] Suscripción confirmada. Status: ${response.statusCode}`);
    });
    return res.status(200).send('Confirmed');
  }

  if (messageType === 'Notification') {
    try {
      const datosNota = JSON.parse(body.Message);
      console.log(`[notificaciones-service] Notificación recibida para nota ${datosNota.notaId}`);
      await enviarCorreo(datosNota);
      return res.status(200).json({ message: 'Correo enviado exitosamente' });
    } catch (err) {
      console.error('[notificaciones-service] Error al procesar notificación:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(400).json({ error: 'Tipo de mensaje SNS no reconocido' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () =>
  console.log(`[notificaciones-service] Corriendo en puerto ${PORT} — ambiente: ${process.env.NODE_ENV || 'local'}`)
);
