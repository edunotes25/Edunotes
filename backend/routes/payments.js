// routes/payments.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Servicios necesarios
const firebaseService = require('../../services/firebaseService');
const emailService = require('../../services/emailService');

// Configuración de PayPal
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // sandbox o live
const PAYPAL_API_URL = PAYPAL_MODE === 'live' 
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

/**
 * Obtener token de acceso de PayPal
 */
async function getPayPalAccessToken() {
    try {
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
        
        const response = await axios({
            url: `${PAYPAL_API_URL}/v1/oauth2/token`,
            method: 'post',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: 'grant_type=client_credentials'
        });
        
        return response.data.access_token;
    } catch (error) {
        console.error('❌ Error obteniendo token PayPal:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Crear orden en PayPal
 */
router.post('/create-order', async (req, res) => {
    try {
        const { items, total, cliente, schoolName, subscriptionMonths } = req.body;
        
        console.log('📝 Creando orden PayPal:', { 
            email: cliente?.email, 
            schoolName, 
            total 
        });
        
        // Validar datos requeridos
        if (!cliente?.email || !schoolName) {
            return res.status(400).json({ 
                error: 'Faltan datos requeridos: email y nombre del colegio' 
            });
        }
        
        // Obtener token de PayPal
        const accessToken = await getPayPalAccessToken();
        
        // Crear orden en PayPal
        const response = await axios({
            url: `${PAYPAL_API_URL}/v2/checkout/orders`,
            method: 'post',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                intent: 'CAPTURE',
                purchase_units: [{
                    description: `Suscripción Tutorías - ${schoolName}`,
                    custom_id: JSON.stringify({
                        schoolName: schoolName,
                        adminEmail: cliente.email,
                        adminName: cliente.nombre,
                        subscriptionMonths: subscriptionMonths || 12
                    }),
                    amount: {
                        currency_code: 'EUR',
                        value: total.toString(),
                        breakdown: {
                            item_total: {
                                currency_code: 'EUR',
                                value: total.toString()
                            }
                        }
                    },
                    items: items.map(item => ({
                        name: item.name,
                        description: item.description || 'Suscripción Tutorías',
                        unit_amount: {
                            currency_code: 'EUR',
                            value: item.price.toString()
                        },
                        quantity: item.quantity || 1
                    }))
                }],
                application_context: {
                    brand_name: 'Edunotes',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW',
                    return_url: `${process.env.BASE_URL}/payment/success`,
                    cancel_url: `${process.env.BASE_URL}/payment/cancel`
                }
            }
        });
        
        console.log('✅ Orden PayPal creada:', response.data.id);
        
        res.json({
            success: true,
            orderId: response.data.id,
            links: response.data.links
        });
        
    } catch (error) {
        console.error('❌ Error creando orden PayPal:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Error al crear la orden de pago',
            details: error.response?.data?.message || error.message
        });
    }
});

/**
 * Capturar pago de PayPal y crear organización
 */
router.post('/capture-order', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        console.log('💰 Capturando pago PayPal:', orderId);
        
        // Obtener token de PayPal
        const accessToken = await getPayPalAccessToken();
        
        // Capturar el pago
        const captureResponse = await axios({
            url: `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
            method: 'post',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const capture = captureResponse.data;
        
        if (capture.status !== 'COMPLETED') {
            throw new Error(`Pago no completado: ${capture.status}`);
        }
        
        // Extraer datos del pago
        const purchaseUnit = capture.purchase_units[0];
        const customData = JSON.parse(purchaseUnit.custom_id || '{}');
        const payer = capture.payer;
        
        const paymentData = {
            email: payer.email_address,
            customerName: payer.name?.given_name + ' ' + (payer.name?.surname || ''),
            schoolName: customData.schoolName,
            paymentId: capture.id,
            amount: purchaseUnit.amount.value,
            subscriptionMonths: customData.subscriptionMonths || 12,
            paymentDetails: {
                orderId: orderId,
                captureId: capture.id,
                status: capture.status,
                payerId: payer.payer_id,
                paymentMethod: 'paypal'
            }
        };
        
        console.log('📦 Datos de pago:', paymentData);
        
        // ============================================
        // CREAR ORGANIZACIÓN EN FIREBASE
        // ============================================
        
        // 1. Generar código único de acceso
        const accessCode = await firebaseService.generateUniqueAccessCode();
        
        // 2. Calcular fecha de expiración
        const subscriptionEnds = new Date();
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + paymentData.subscriptionMonths);
        
        // 3. Crear organización en Firestore
        const organizationResult = await firebaseService.createOrganization({
            schoolName: paymentData.schoolName,
            adminEmail: paymentData.email,
            adminName: paymentData.customerName,
            accessCode: accessCode,
            subscriptionEnds: subscriptionEnds.toISOString(),
            paymentDetails: {
                ...paymentData.paymentDetails,
                amount: paymentData.amount,
                paidAt: new Date().toISOString(),
                subscriptionMonths: paymentData.subscriptionMonths
            }
        });
        
        if (!organizationResult.success) {
            throw new Error(organizationResult.error);
        }
        
        // 4. Enviar email de bienvenida con código
        await emailService.sendWelcomeEmail({
            email: paymentData.email,
            name: paymentData.customerName,
            accessCode: accessCode,
            schoolName: paymentData.schoolName,
            organizationId: organizationResult.organizationId,
            tempPassword: organizationResult.tempPassword
        });
        
        // 5. Registrar venta en Firestore (para estadísticas)
        try {
            const admin = require('firebase-admin');
            const db = admin.firestore();
            await db.collection('ventas').add({
                organizationId: organizationResult.organizationId,
                accessCode: accessCode,
                email: paymentData.email,
                schoolName: paymentData.schoolName,
                amount: paymentData.amount,
                paymentId: paymentData.paymentId,
                subscriptionMonths: paymentData.subscriptionMonths,
                createdAt: new Date().toISOString()
            });
            console.log('✅ Venta registrada en estadísticas');
        } catch (statsError) {
            console.error('Error registrando venta:', statsError);
        }
        
        console.log('✅ Proceso completado exitosamente');
        
        res.json({
            success: true,
            message: 'Pago completado y organización creada exitosamente',
            accessCode: accessCode,
            organizationId: organizationResult.organizationId,
            saasUrl: process.env.SAAS_URL || 'https://tutories.com'
        });
        
    } catch (error) {
        console.error('❌ Error capturando pago:', error);
        res.status(500).json({ 
            error: 'Error al procesar el pago',
            details: error.message 
        });
    }
});

/**
 * Webhook de PayPal (para notificaciones automáticas)
 */
router.post('/paypal-webhook', async (req, res) => {
    console.log('📦 Webhook PayPal recibido:', req.body.event_type);
    
    // Verificar firma de PayPal (en producción)
    // TODO: Implementar verificación de firma
    
    const event = req.body;
    
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        try {
            const capture = event.resource;
            const purchaseUnit = capture.purchase_units[0];
            const customData = JSON.parse(purchaseUnit.custom_id || '{}');
            
            const paymentData = {
                email: capture.payer.email_address,
                customerName: capture.payer.name?.given_name + ' ' + (capture.payer.name?.surname || ''),
                schoolName: customData.schoolName,
                paymentId: capture.id,
                amount: purchaseUnit.amount.value,
                subscriptionMonths: customData.subscriptionMonths || 12,
                paymentDetails: {
                    orderId: capture.supplementary_data?.related_ids?.order_id,
                    captureId: capture.id,
                    status: capture.status,
                    payerId: capture.payer.payer_id
                }
            };
            
            // Generar código único
            const accessCode = await firebaseService.generateUniqueAccessCode();
            
            // Crear organización
            const result = await firebaseService.createOrganization({
                schoolName: paymentData.schoolName,
                adminEmail: paymentData.email,
                adminName: paymentData.customerName,
                accessCode: accessCode,
                subscriptionEnds: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                paymentDetails: paymentData.paymentDetails
            });
            
            if (result.success) {
                // Enviar email
                await emailService.sendWelcomeEmail({
                    email: paymentData.email,
                    name: paymentData.customerName,
                    accessCode: accessCode,
                    schoolName: paymentData.schoolName,
                    organizationId: result.organizationId,
                    tempPassword: result.tempPassword
                });
                
                console.log('✅ Webhook procesado exitosamente');
            }
            
            res.status(200).send('Webhook procesado');
            
        } catch (error) {
            console.error('❌ Error procesando webhook:', error);
            res.status(500).send('Error procesando webhook');
        }
    } else {
        res.status(200).send('Evento ignorado');
    }
});

/**
 * Verificar estado de un pedido
 */
router.get('/order-status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const accessToken = await getPayPalAccessToken();
        
        const response = await axios({
            url: `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`,
            method: 'get',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        res.json({
            success: true,
            status: response.data.status,
            order: response.data
        });
        
    } catch (error) {
        console.error('Error verificando orden:', error);
        res.status(500).json({ 
            error: 'Error al verificar el pedido',
            details: error.message
        });
    }
});

/**
 * Obtener productos disponibles para la tienda
 */
router.get('/products', (req, res) => {
    const products = [
        {
            id: 'tutorias_basic',
            name: 'Tutorías - Plan Básico',
            description: 'Suscripción anual para colegios hasta 100 usuarios',
            price: 99.00,
            subscriptionMonths: 12,
            maxUsers: 100
        },
        {
            id: 'tutorias_pro',
            name: 'Tutorías - Plan Pro',
            description: 'Suscripción anual para colegios hasta 500 usuarios',
            price: 199.00,
            subscriptionMonths: 12,
            maxUsers: 500
        },
        {
            id: 'tutorias_premium',
            name: 'Tutorías - Plan Premium',
            description: 'Suscripción anual para colegios sin límite de usuarios',
            price: 299.00,
            subscriptionMonths: 12,
            maxUsers: -1
        }
    ];
    
    res.json({ success: true, products });
});

module.exports = router;