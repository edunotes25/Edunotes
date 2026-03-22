const express = require('express');
const router = express.Router();

// Ruta para contacto
router.post('/contact', async (req, res) => {
    try {
        const { nombre, email, telefono, tipoProyecto, mensaje } = req.body;

        console.log('Datos recibidos:', { nombre, email, telefono, tipoProyecto, mensaje });

        // Simular guardado exitoso (sin Firebase por ahora)
        res.status(200).json({ 
            success: true, 
            message: 'Mensaje enviado correctamente' 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

module.exports = router;