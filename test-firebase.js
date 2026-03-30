require('dotenv').config();

console.log('1️⃣ Verificando variables de entorno...');
console.log('   FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('   FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'PRESENTE' : 'FALTANTE');
console.log('   FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('');

if (!process.env.FIREBASE_PRIVATE_KEY) {
    console.error('❌ FIREBASE_PRIVATE_KEY no está configurada');
    process.exit(1);
}

console.log('2️⃣ Inicializando Firebase...');
const admin = require('firebase-admin');

try {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    };
    
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('   ✅ Firebase inicializado');
    }
    
    console.log('3️⃣ Probando conexión a Firestore...');
    const db = admin.firestore();
    
    // Probar escritura
    await db.collection('_test_').doc('test').set({ timestamp: new Date().toISOString() });
    console.log('   ✅ Escritura exitosa');
    
    // Probar lectura
    const doc = await db.collection('_test_').doc('test').get();
    console.log('   ✅ Lectura exitosa');
    
    // Limpiar
    await db.collection('_test_').doc('test').delete();
    console.log('   ✅ Limpieza exitosa');
    
    console.log('\n✨ CONEXIÓN EXITOSA A FIREBASE ✨');
    
} catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('   Verifica que las credenciales sean correctas');
}
