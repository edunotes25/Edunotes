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

// Obtener suscripciones
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('suscripciones')
      .orderBy('createdAt', 'desc')
      .get();
    
    const subscriptions = [];
    snapshot.forEach(doc => {
      subscriptions.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, subscriptions });
  } catch (error) {
    console.error('Error obteniendo suscripciones:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;