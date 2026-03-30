const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
const fs = require('fs');

// Verificar que existe el archivo de credenciales
const credPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(credPath)) {
  console.error('❌ No se encuentra el archivo serviceAccountKey.json');
  console.log('Por favor, coloca el archivo de credenciales en:', credPath);
  process.exit(1);
}

// Inicializar Firebase Admin con el archivo de credenciales
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const app = express();

// Middleware CORS
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Servir archivos estáticos desde la raíz del proyecto (donde está admin.html)
app.use(express.static(path.join(__dirname, '..')));

// También servir desde la carpeta actual por si acaso
app.use(express.static(__dirname));

// Ruta para login
app.post('/api/auth/login', async (req, res) => {
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
        name: decodedToken.name || decodedToken.email
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Crear factura
app.post('/api/invoices/create', async (req, res) => {
  try {
    const { clientName, clientEmail, concept, base, ivaPercentage, dueDate } = req.body;
    
    if (!clientName || !clientEmail || !concept || !base) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const iva = base * (ivaPercentage / 100);
    const total = base + iva;
    const date = new Date().toISOString().split('T')[0];
    
    const year = new Date().getFullYear();
    const facturasSnapshot = await db.collection('facturas')
      .where('year', '==', year)
      .orderBy('sequentialNumber', 'desc')
      .limit(1)
      .get();
    
    let sequentialNumber = 1;
    if (!facturasSnapshot.empty) {
      sequentialNumber = facturasSnapshot.docs[0].data().sequentialNumber + 1;
    }
    
    const numeroFactura = `F-${year}-${String(sequentialNumber).padStart(4, '0')}`;
    
    const nuevaFactura = {
      numero: numeroFactura,
      sequentialNumber: sequentialNumber,
      year: year,
      fecha: date,
      vencimiento: dueDate || date,
      cliente: clientName,
      email: clientEmail,
      concepto: concept,
      base: base,
      iva: iva,
      ivaPorcentaje: ivaPercentage,
      total: total,
      estado: 'pendiente',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('facturas').add(nuevaFactura);
    
    res.status(201).json({
      success: true,
      invoice: { id: docRef.id, ...nuevaFactura },
      message: `Factura ${numeroFactura} creada`
    });
  } catch (error) {
    console.error('Error creando factura:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener facturas
app.get('/api/invoices', async (req, res) => {
  try {
    const snapshot = await db.collection('facturas')
      .orderBy('fecha', 'desc')
      .limit(100)
      .get();
    
    const invoices = [];
    snapshot.forEach(doc => {
      invoices.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, invoices });
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener factura por ID
app.get('/api/invoices/:id', async (req, res) => {
  try {
    const docRef = db.collection('facturas').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    res.json({ success: true, invoice: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Error obteniendo factura:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    firebase: 'connected'
  });
});

// Servir admin.html desde la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`📄 API Facturas: http://localhost:${PORT}/api/invoices`);
  console.log(`📁 Serviendo archivos desde: ${path.join(__dirname, '..')}\n`);
});
