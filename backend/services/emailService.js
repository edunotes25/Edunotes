const nodemailer = require('nodemailer');

// Configurar transporte SMTP con Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

class EmailService {
  // Enviar factura por email
  static async sendInvoice(email, factura, pdfBuffer) {
    const mailOptions = {
      from: `"Edunotes" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Factura ${factura.numero} - Edunotes`,
      html: this.getInvoiceEmailHTML(factura),
      attachments: [
        {
          filename: `factura_${factura.numero}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error enviando email:', error);
      return { success: false, error: error.message };
    }
  }

  // Enviar recordatorio de pago
  static async sendPaymentReminder(email, factura) {
    const mailOptions = {
      from: `"Edunotes" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Recordatorio de pago - Factura ${factura.numero}`,
      html: this.getReminderEmailHTML(factura)
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error enviando recordatorio:', error);
      return { success: false, error: error.message };
    }
  }

  // Enviar confirmación de pago
  static async sendPaymentConfirmation(email, factura) {
    const mailOptions = {
      from: `"Edunotes" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Confirmación de pago - Factura ${factura.numero}`,
      html: this.getConfirmationEmailHTML(factura)
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error enviando confirmación:', error);
      return { success: false, error: error.message };
    }
  }

  // Enviar factura recurrente (suscripción)
  static async sendRecurringInvoice(email, factura, pdfBuffer) {
    const mailOptions = {
      from: `"Edunotes" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Factura recurrente ${factura.numero} - Edunotes`,
      html: this.getRecurringInvoiceHTML(factura),
      attachments: [
        {
          filename: `factura_${factura.numero}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error enviando factura recurrente:', error);
      return { success: false, error: error.message };
    }
  }

  // Plantillas HTML
  static getInvoiceEmailHTML(factura) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: #f9fafb; border-radius: 0 0 10px 10px; }
          .invoice-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e5e7eb; }
          .amount { font-size: 24px; font-weight: bold; color: #667eea; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Edunotes</h2>
            <p>Factura de servicios educativos</p>
          </div>
          <div class="content">
            <h3>Hola ${factura.cliente},</h3>
            <p>Adjunto encontrarás tu factura <strong>${factura.numero}</strong> por el siguiente concepto:</p>
            
            <div class="invoice-details">
              <p><strong>Concepto:</strong> ${factura.concepto}</p>
              <p><strong>Fecha:</strong> ${factura.fecha}</p>
              <p><strong>Vencimiento:</strong> ${factura.vencimiento}</p>
              <p><strong>Importe total:</strong> <span class="amount">${factura.total.toFixed(2)}€</span></p>
            </div>
            
            <p>Puedes realizar el pago a través de PayPal haciendo clic en el siguiente botón:</p>
            <a href="${process.env.FRONTEND_URL}/pay?invoice=${factura.id}" class="button">Pagar ahora con PayPal</a>
            
            <p>Si tienes alguna duda, no dudes en contactarnos.</p>
            <p>Saludos,<br><strong>Equipo Edunotes</strong></p>
          </div>
          <div class="footer">
            <p>Edunotes - Plataforma de recursos educativos</p>
            <p>CIF: 12345678A | contacto@edunotes.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getReminderEmailHTML(factura) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: #f9fafb; border-radius: 0 0 10px 10px; }
          .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚠️ Recordatorio de pago</h2>
          </div>
          <div class="content">
            <h3>Hola ${factura.cliente},</h3>
            <div class="warning">
              <p><strong>Factura ${factura.numero}</strong> está próxima a vencer.</p>
              <p><strong>Fecha de vencimiento:</strong> ${factura.vencimiento}</p>
              <p><strong>Importe pendiente:</strong> ${factura.total.toFixed(2)}€</p>
            </div>
            
            <p>Por favor, realiza el pago lo antes posible para evitar retrasos.</p>
            <a href="${process.env.FRONTEND_URL}/pay?invoice=${factura.id}" class="button">Pagar ahora</a>
            
            <p>Saludos,<br><strong>Equipo Edunotes</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getConfirmationEmailHTML(factura) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: #f9fafb; border-radius: 0 0 10px 10px; }
          .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Pago confirmado</h2>
          </div>
          <div class="content">
            <h3>Hola ${factura.cliente},</h3>
            <div class="success">
              <p>Hemos recibido tu pago de <strong>${factura.total.toFixed(2)}€</strong> correspondiente a la factura <strong>${factura.numero}</strong>.</p>
            </div>
            <p>¡Gracias por confiar en Edunotes!</p>
            <p>Saludos,<br><strong>Equipo Edunotes</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getRecurringInvoiceHTML(factura) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: #f9fafb; border-radius: 0 0 10px 10px; }
          .recurring-badge { background: #dbeafe; padding: 10px; border-radius: 6px; margin: 15px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔄 Factura recurrente</h2>
          </div>
          <div class="content">
            <h3>Hola ${factura.cliente},</h3>
            <div class="recurring-badge">
              <p>📅 Esta es una factura recurrente de tu suscripción mensual</p>
            </div>
            <p>Adjunto encontrarás tu factura <strong>${factura.numero}</strong> por importe de <strong>${factura.total.toFixed(2)}€</strong>.</p>
            <p>El pago se realizará automáticamente a través de tu suscripción de PayPal.</p>
            <p>Saludos,<br><strong>Equipo Edunotes</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = EmailService;