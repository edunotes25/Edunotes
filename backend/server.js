const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Importar rutas
const contactRoutes = require('./routes/contact');
const paymentRoutes = require('./routes/payments');
const newsletterRoutes = require('./routes/newsletter');

const app = express();

// Middlewares
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Servir archivos estáticos desde la carpeta raíz
app.use(express.static('../')); 
// Rutas
app.use('/api', contactRoutes);
app.use('/api', newsletterRoutes);
app.use('/api/payments', paymentRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        message: 'Servidor funcionando correctamente'
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
});