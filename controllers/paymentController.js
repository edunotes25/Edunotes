// controllers/paymentController.js
const firebaseService = require('../services/firebaseService');
const emailService = require('../services/emailService');

class PaymentController {
    /**
     * Procesar pago exitoso (webhook de PayPal o callback)
     */
    async processSuccessfulPayment(req, res) {
        try {
            // Obtener datos del pago (esto varía según PayPal)
            const { 
                email,           // Email del cliente
                customerName,    // Nombre del cliente
                schoolName,      // Nombre del colegio
                paymentId,       // ID del pago
                amount,          // Monto pagado
                subscriptionMonths = 12  // Meses de suscripción
            } = req.body;
            
            console.log('💰 Procesando pago exitoso:', { email, schoolName });
            
            // 1. Crear organización en Firebase
            const result = await firebaseService.createOrganization({
                schoolName: schoolName,
                adminEmail: email,
                adminName: customerName,
                paymentDetails: {
                    paymentId: paymentId,
                    amount: amount,
                    method: 'paypal'
                },
                subscriptionMonths: subscriptionMonths
            });
            
            if (!result.success) {
                console.error('❌ Error creando organización:', result.error);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Error al crear la organización' 
                });
            }
            
            // 2. Enviar email de bienvenida con código
            await emailService.sendWelcomeEmail({
                email: email,
                name: customerName,
                accessCode: result.accessCode,
                schoolName: schoolName,
                organizationId: result.organizationId,
                tempPassword: result.tempPassword
            });
            
            // 3. Registrar la venta (opcional, para estadísticas)
            await this.recordSale({
                organizationId: result.organizationId,
                accessCode: result.accessCode,
                email: email,
                schoolName: schoolName,
                amount: amount,
                paymentId: paymentId
            });
            
            console.log('✅ Proceso completado exitosamente');
            
            return res.json({
                success: true,
                message: 'Organización creada exitosamente',
                accessCode: result.accessCode,
                organizationId: result.organizationId
            });
            
        } catch (error) {
            console.error('❌ Error procesando pago:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    /**
     * Registrar venta para estadísticas (opcional)
     */
    async recordSale(data) {
        try {
            const admin = require('firebase-admin');
            const db = admin.firestore();
            
            await db.collection('ventas').add({
                ...data,
                createdAt: new Date().toISOString()
            });
            
            console.log('✅ Venta registrada:', data.organizationId);
        } catch (error) {
            console.error('Error registrando venta:', error);
        }
    }
}

module.exports = new PaymentController();