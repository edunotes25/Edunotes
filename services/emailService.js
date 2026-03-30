// services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        
        console.log('✅ Email service configurado');
    }

    /**
     * Enviar email de bienvenida con código de acceso
     */
    async sendWelcomeEmail(data) {
        const { email, name, accessCode, schoolName, organizationId, tempPassword } = data;
        
        const saasUrl = process.env.SAAS_URL || 'https://tutories.com';
        
        const mailOptions = {
            from: `"Edunotes" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: `🎉 ¡Bienvenido a Tutorías! Tu colegio ${schoolName} ha sido registrado`,
            html: this.generateWelcomeEmailHTML(name, schoolName, accessCode, saasUrl, tempPassword)
        };
        
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`📧 Email de bienvenida enviado a: ${email}`);
            console.log(`📧 Message ID: ${info.messageId}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error enviando email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generar HTML del email
     */
    generateWelcomeEmailHTML(name, schoolName, accessCode, saasUrl, tempPassword) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { padding: 30px; background-color: #f9f9f9; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef; margin-top: 20px; }
                    .codigo-box { background-color: #e7f3ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
                    .codigo { font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #4a90e2; font-family: monospace; }
                    .boton { background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px; }
                    .credenciales { background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎓 ¡Bienvenido a Tutorías!</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${name}</strong>,</p>
                        <p>Tu colegio <strong>${schoolName}</strong> ha sido registrado exitosamente en nuestro sistema de tutorías.</p>
                        
                        <div class="codigo-box">
                            <h3>📋 Código de acceso de tu colegio</h3>
                            <div class="codigo">${accessCode}</div>
                            <p style="margin-top: 10px;">Comparte este código con todos los profesores y padres del colegio</p>
                        </div>
                        
                        ${tempPassword ? `
                        <div class="credenciales">
                            <p><strong>🔑 Tus credenciales como administrador:</strong></p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Contraseña temporal:</strong> <code>${tempPassword}</code></p>
                            <p style="font-size: 0.85rem; margin-top: 10px;">⚠️ Te recomendamos cambiar esta contraseña en tu primer inicio de sesión.</p>
                        </div>
                        ` : ''}
                        
                        <h3>📝 Instrucciones:</h3>
                        <ul>
                            <li><strong>Para profesores:</strong> <a href="${saasUrl}/login?tipo=profesor">Inicia sesión</a> y regístrate con este código</li>
                            <li><strong>Para padres:</strong> <a href="${saasUrl}/registro-padre">Regístrate</a> con este código para reservar tutorías</li>
                            <li>Una vez registrados, podrán acceder con su email y contraseña</li>
                        </ul>
                        
                        <p style="text-align: center; margin-top: 20px;">
                            <a href="${saasUrl}" class="boton">🚀 Ir a la plataforma</a>
                        </p>
                        
                        <p>Para cualquier duda, contacta a <a href="mailto:soporte@edunotes.com">soporte@edunotes.com</a></p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Edunotes - Sistema de Tutorías</p>
                        <p>Este es un mensaje automático, por favor no responda a este correo.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = new EmailService();