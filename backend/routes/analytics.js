const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const db = admin.firestore();

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

router.use(authenticateToken);

// Obtener métricas de conversión
router.get('/conversion-funnel', async (req, res) => {
  try {
    const snapshot = await db.collection('conversiones')
      .orderBy('date', 'desc')
      .limit(1000)
      .get();
    
    const events = [];
    snapshot.forEach(doc => {
      events.push(doc.data());
    });
    
    const metrics = {
      visits: events.filter(e => e.event === 'page_view').length,
      registrations: events.filter(e => e.event === 'registro').length,
      invoicesCreated: events.filter(e => e.event === 'factura_creada').length,
      invoicesPaid: events.filter(e => e.event === 'pago_completado').length,
      subscriptions: events.filter(e => e.event === 'suscripcion_creada').length
    };
    
    const conversionRates = {
      visitToRegistration: metrics.visits > 0 ? (metrics.registrations / metrics.visits * 100).toFixed(2) : 0,
      registrationToInvoice: metrics.registrations > 0 ? (metrics.invoicesCreated / metrics.registrations * 100).toFixed(2) : 0,
      invoiceToPayment: metrics.invoicesCreated > 0 ? (metrics.invoicesPaid / metrics.invoicesCreated * 100).toFixed(2) : 0
    };
    
    // Ingresos totales
    const invoicesPaid = await db.collection('facturas')
      .where('status', '==', 'paid')
      .get();
    
    let totalRevenue = 0;
    invoicesPaid.forEach(doc => {
      totalRevenue += doc.data().total || 0;
    });
    
    res.json({
      success: true,
      metrics,
      conversionRates,
      totalRevenue,
      events: events.slice(0, 100)
    });
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;