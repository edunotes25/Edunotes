const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const db = admin.firestore();

// Webhook de PayPal (sin autenticación porque viene de PayPal)
router.post('/paypal', async (req, res) => {
  try {
    const event = req.body;
    console.log('📨 Webhook PayPal recibido:', event.event_type);
    
    // Aquí puedes procesar los eventos de PayPal
    // Por ahora solo respondemos OK
    
    res.json({ success: true, message: 'Webhook recibido' });
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;