const express = require('express');
const router = express.Router();

// Ruta para suscripción a newsletter
router.post('/subscribe', async (req, res) => {
    try {
        const { nombre, email } = req.body;

        console.log('Suscripción recibida:', { nombre, email });

        res.status(200).json({ 
            success: true, 
            message: 'Suscripción realizada correctamente' 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al procesar la suscripción' });
    }
});

module.exports = router;