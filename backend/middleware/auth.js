const { admin } = require('../config/firebase');

// Middleware para verificar token de administrador
async function verifyAdminToken(req, res, next) {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        // Verificar token con Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Verificar si el usuario es administrador
        const userDoc = await admin.firestore()
            .collection('usuarios')
            .doc(decodedToken.uid)
            .get();

        if (!userDoc.exists || !userDoc.data().admin) {
            return res.status(403).json({ error: 'Acceso no autorizado' });
        }

        // Añadir datos del usuario a la request
        req.user = decodedToken;
        req.userData = userDoc.data();
        
        next();

    } catch (error) {
        console.error('Error verificando token:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
}

// Middleware para verificar API key (para servicios externos)
function verifyApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'API key inválida' });
    }

    next();
}

// Middleware para limitar rate de requests
const rateLimit = require('express-rate-limit');

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 solicitudes por IP
    message: { error: 'Demasiadas solicitudes, intenta más tarde' },
    standardHeaders: true,
    legacyHeaders: false
});

const newsletterLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 suscripciones por IP
    message: { error: 'Demasiadas suscripciones, intenta más tarde' }
});

module.exports = { 
    verifyAdminToken, 
    verifyApiKey,
    contactLimiter,
    newsletterLimiter 
};