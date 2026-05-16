// El email se envía directamente vía suscripción Email en el topic de SNS.
// Este módulo procesa y registra la notificación recibida (trazabilidad).
async function enviarCorreo(datosNota) {
  const { emailCliente, notaId, total, productos, fecha } = datosNota;

  const resumen = productos
    .map(p => `  - ${p.nombre} x${p.cantidad} @ $${p.precioUnitario}`)
    .join('\n');

  console.log('=== NOTIFICACIÓN PROCESADA ===');
  console.log(`Nota ID:  ${notaId}`);
  console.log(`Cliente:  ${emailCliente}`);
  console.log(`Total:    $${total}`);
  console.log(`Fecha:    ${new Date(fecha).toLocaleString('es-MX')}`);
  console.log(`Productos:\n${resumen}`);
  console.log('El correo fue enviado directamente por SNS al suscriptor de email.');
  console.log('==============================');
}

module.exports = { enviarCorreo };
