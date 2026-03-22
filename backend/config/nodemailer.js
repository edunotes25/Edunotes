const nodemailer = require('nodemailer');

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true para 465, false para otros puertos
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false // Solo para desarrollo
    }
});

// Verificar conexión
transporter.verify((error, success) => {
    if (error) {
        console.error('Error conectando con el servidor SMTP:', error);
    } else {
        console.log('Servidor SMTP listo para enviar emails');
    }
});

// Plantillas de emails
const emailTemplates = {
    contactConfirmation: (nombre) => ({
        subject: 'Hemos recibido tu mensaje - Edunotes',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #264653, #2A9D8F); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { background: #2A9D8F; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Gracias por contactarnos!</h1>
                    </div>
                    <div class="content">
                        <h2>Hola ${nombre},</h2>
                        <p>Hemos recibido tu mensaje correctamente. Te responderemos a la mayor brevedad posible (normalmente en menos de 24-48 horas).</p>
                        <p>Mientras tanto, puedes:</p>
                        <ul>
                            <li>Visitar nuestro <a href="${process.env.SITE_URL}/blog">blog</a> para ver tutoriales y consejos</li>
                            <li>Explorar nuestros <a href="${process.env.SITE_URL}/recursos">recursos educativos</a></li>
                            <li>Ver más <a href="${process.env.SITE_URL}/proyectos">proyectos</a> en nuestro portfolio</li>
                        </ul>
                        <a href="${process.env.SITE_URL}" class="button">Visitar Edunotes</a>
                    </div>
                    <div class="footer">
                        <p>© 2024 Edunotes. Todos los derechos reservados.</p>
                        <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),
    
    newContactNotification: (data) => ({
        subject: 'Nueva solicitud de contacto - Edunotes',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #264653; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .field { margin-bottom: 15px; }
                    .label { font-weight: bold; color: #2A9D8F; }
                    .value { margin-top: 5px; padding: 10px; background: white; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Nueva solicitud de contacto</h1>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">Nombre:</div>
                            <div class="value">${data.nombre}</div>
                        </div>
                        <div class="field">
                            <div class="label">Email:</div>
                            <div class="value">${data.email}</div>
                        </div>
                        <div class="field">
                            <div class="label">Teléfono:</div>
                            <div class="value">${data.telefono || 'No proporcionado'}</div>
                        </div>
                        <div class="field">
                            <div class="label">Tipo de proyecto:</div>
                            <div class="value">${data.tipoProyecto}</div>
                        </div>
                        <div class="field">
                            <div class="label">Mensaje:</div>
                            <div class="value">${data.mensaje}</div>
                        </div>
                        <div class="field">
                            <div class="label">Fecha:</div>
                            <div class="value">${new Date().toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    }),
    
    newsletterConfirmation: (nombre) => ({
        subject: '¡Bienvenido a la newsletter de Edunotes!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #2A9D8F, #264653); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { background: #2A9D8F; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido a Edunotes!</h1>
                    </div>
                    <div class="content">
                        <h2>Hola ${nombre},</h2>
                        <p>¡Gracias por suscribirte a nuestra newsletter!</p>
                        <p>Cada mes recibirás:</p>
                        <ul>
                            <li>📚 Recursos educativos exclusivos</li>
                            <li>💡 Tutoriales y consejos de desarrollo</li>
                            <li>🎁 Plantillas y mockups gratuitos</li>
                            <li>📊 Tendencias en educación y tecnología</li>
                        </ul>
                        <p>Para asegurarte de que recibes nuestros emails, añade nuestra dirección a tus contactos.</p>
                        <a href="${process.env.SITE_URL}/recursos" class="button">Ver recursos gratuitos</a>
                    </div>
                    <div class="footer">
                        <p>Puedes darte de baja en cualquier momento haciendo clic en el enlace al final de nuestros emails.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),
    
    orderConfirmation: (orderData) => ({
        subject: `Confirmación de pedido #${orderData.orderId} - Edunotes`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2A9D8F; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    .total { font-size: 18px; font-weight: bold; color: #2A9D8F; text-align: right; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Pedido confirmado!</h1>
                    </div>
                    <div class="content">
                        <h2>Hola,</h2>
                        <p>Tu pedido #${orderData.orderId} ha sido confirmado y está siendo procesado.</p>
                        
                        <div class="order-details">
                            <h3>Detalles del pedido:</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${orderData.items.map(item => `
                                        <tr>
                                            <td>${item.nombre}</td>
                                            <td>${item.cantidad}</td>
                                            <td>${item.precio}€</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            <div class="total">
                                Total: ${orderData.total}€
                            </div>
                        </div>
                        
                        <p>En breve recibirás un email con las instrucciones para descargar tus recursos.</p>
                        <p>Si tienes alguna pregunta, no dudes en responder a este email.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    })
};

module.exports = { transporter, emailTemplates };