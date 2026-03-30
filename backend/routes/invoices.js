const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

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

// Generar número de factura automático
async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const invoicesRef = db.collection('facturas');
  const snapshot = await invoicesRef
    .where('year', '==', year)
    .orderBy('sequentialNumber', 'desc')
    .limit(1)
    .get();

  let sequentialNumber = 1;
  if (!snapshot.empty) {
    sequentialNumber = snapshot.docs[0].data().sequentialNumber + 1;
  }

  return {
    number: `F-${year}-${String(sequentialNumber).padStart(4, '0')}`,
    sequentialNumber: sequentialNumber,
    year: year
  };
}

// Generar PDF de factura
async function generateInvoicePDF(invoice) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let y = 800;

  // Logo y título
  page.drawText('EDUNOTES', { x: 50, y, size: 24, font: boldFont, color: rgb(0.4, 0.5, 0.9) });
  y -= 20;
  page.drawText('Plataforma de recursos educativos', { x: 50, y, size: 10, font });
  y -= 40;

  // Datos de la empresa
  page.drawText('CIF: 12345678A', { x: 50, y, size: 10, font });
  y -= 15;
  page.drawText('C/ Ejemplo 123, Madrid', { x: 50, y, size: 10, font });
  y -= 15;
  page.drawText('contacto@edunotes.com', { x: 50, y, size: 10, font });
  y -= 30;

  // Título FACTURA
  page.drawText('FACTURA', { x: 400, y: 820, size: 20, font: boldFont });
  page.drawText(`Nº: ${invoice.number}`, { x: 400, y: 800, size: 10, font });
  page.drawText(`Fecha: ${invoice.date}`, { x: 400, y: 785, size: 10, font });
  page.drawText(`Vencimiento: ${invoice.dueDate}`, { x: 400, y: 770, size: 10, font });
  y -= 20;

  // Datos del cliente
  page.drawText('DATOS DEL CLIENTE', { x: 50, y, size: 14, font: boldFont });
  y -= 20;
  page.drawText(`Nombre: ${invoice.clientName}`, { x: 50, y, size: 10, font });
  y -= 15;
  page.drawText(`Email: ${invoice.clientEmail}`, { x: 50, y, size: 10, font });
  y -= 15;
  page.drawText(`NIF: ${invoice.clientNif || 'No especificado'}`, { x: 50, y, size: 10, font });
  y -= 30;

  // Tabla de conceptos
  const tableTop = y;
  const tableHeaders = ['Concepto', 'Base Imponible', 'IVA', 'Total'];
  const tableData = [[
    invoice.concept,
    `${invoice.base.toFixed(2)}€`,
    `${invoice.iva.toFixed(2)}€`,
    `${invoice.total.toFixed(2)}€`
  ]];

  // Dibujar tabla
  let currentY = tableTop;
  page.drawText(tableHeaders[0], { x: 50, y: currentY, size: 10, font: boldFont });
  page.drawText(tableHeaders[1], { x: 250, y: currentY, size: 10, font: boldFont });
  page.drawText(tableHeaders[2], { x: 400, y: currentY, size: 10, font: boldFont });
  page.drawText(tableHeaders[3], { x: 500, y: currentY, size: 10, font: boldFont });
  
  currentY -= 20;
  page.drawText(tableData[0][0], { x: 50, y: currentY, size: 10, font });
  page.drawText(tableData[0][1], { x: 250, y: currentY, size: 10, font });
  page.drawText(tableData[0][2], { x: 400, y: currentY, size: 10, font });
  page.drawText(tableData[0][3], { x: 500, y: currentY, size: 10, font });
  
  currentY -= 30;
  page.drawText(`TOTAL: ${invoice.total.toFixed(2)}€`, { x: 450, y: currentY, size: 14, font: boldFont, color: rgb(0.4, 0.5, 0.9) });
  currentY -= 40;

  // Información de pago
  page.drawText('Formas de pago:', { x: 50, y: currentY, size: 10, font: boldFont });
  currentY -= 15;
  page.drawText('- Transferencia bancaria: ES00 0000 0000 0000 0000 0000', { x: 50, y: currentY, size: 8, font });
  currentY -= 12;
  page.drawText('- PayPal: pagos@edunotes.com', { x: 50, y: currentY, size: 8, font });
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Crear nueva factura
router.post('/create', async (req, res) => {
  try {
    const { clientName, clientEmail, clientNif, clientAddress, concept, base, ivaPercentage, dueDate } = req.body;
    
    if (!clientName || !clientEmail || !concept || !base) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const iva = base * (ivaPercentage / 100);
    const total = base + iva;
    const date = new Date().toISOString().split('T')[0];
    
    const { number, sequentialNumber, year } = await generateInvoiceNumber();
    
    const invoiceData = {
      number,
      sequentialNumber,
      year,
      date,
      dueDate: dueDate || date,
      clientName,
      clientEmail,
      clientNif,
      clientAddress,
      concept,
      base,
      iva,
      ivaPercentage,
      total,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentMethod: null,
      paymentDate: null
    };
    
    const docRef = await db.collection('facturas').add(invoiceData);
    const invoice = { id: docRef.id, ...invoiceData };
    
    // Generar PDF
    const pdfBuffer = await generateInvoicePDF(invoice);
    
    res.status(201).json({
      success: true,
      invoice: invoice,
      message: `Factura ${number} creada`
    });
  } catch (error) {
    console.error('Error creando factura:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las facturas
router.get('/', async (req, res) => {
  try {
    const { status, clientEmail } = req.query;
    let query = db.collection('facturas').orderBy('date', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    const invoices = [];
    snapshot.forEach(doc => {
      invoices.push({ id: doc.id, ...doc.data() });
    });
    
    let filteredInvoices = invoices;
    if (clientEmail) {
      filteredInvoices = invoices.filter(inv => inv.clientEmail === clientEmail);
    }
    
    res.json({ success: true, invoices: filteredInvoices });
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener factura por ID
router.get('/:id', async (req, res) => {
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

// Descargar PDF de factura
router.get('/:id/pdf', async (req, res) => {
  try {
    const docRef = db.collection('facturas').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    const invoice = { id: doc.id, ...doc.data() };
    const pdfBuffer = await generateInvoicePDF(invoice);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura_${invoice.number}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;