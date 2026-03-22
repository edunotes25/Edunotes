const express = require('express');
const router = express.Router();

// Ruta para crear orden
router.post('/create-order', async (req, res) => {
    try {
        const { items, total, cliente } = req.body;

        console.log('Orden recibida:', { items, total, cliente });

        // Simular respuesta exitosa
        res.status(200).json({
            success: true,
            orderId: 'ORDER_' + Date.now(),
            message: 'Orden creada correctamente'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al crear la orden' });
    }
});

// Ruta para capturar pago
router.post('/capture-order', async (req, res) => {
    try {
        const { orderId } = req.body;

        console.log('Pago capturado:', orderId);

        res.status(200).json({ 
            success: true, 
            message: 'Pago completado correctamente' 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al procesar el pago' });
    }
});

module.exports = router;