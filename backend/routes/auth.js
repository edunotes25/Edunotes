const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Middleware de autenticación para rutas protegidas
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

// Ruta de login (Firebase ya maneja la autenticación)
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Token no proporcionado' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(401).json({ error: 'Autenticación fallida' });
  }
});

// Ruta para verificar token
router.post('/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;