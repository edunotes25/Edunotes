// scripts/test-create-organization.js
require('dotenv').config({ path: './.env' });

console.log('🔍 Verificando variables de entorno...');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✓' : '✗');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✓' : '✗');
console.log('');

const firebaseService = require('../services/firebaseService');

async function test() {
    console.log('🚀 Creando organización de prueba...\n');
    
    try {
        // 1. Generar código único
        console.log('1️⃣ Generando código de acceso...');
        const accessCode = await firebaseService.generateUniqueAccessCode();
        console.log(`   ✅ Código generado: ${accessCode}\n`);
        
        // 2. Crear organización
        console.log('2️⃣ Creando organización en Firebase...');
        const subscriptionEnds = new Date();
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 12);
        
        const result = await firebaseService.createOrganization({
            schoolName: 'Colegio de Prueba',
            adminEmail: 'test@ejemplo.com',
            adminName: 'Admin Test',
            accessCode: accessCode,
            subscriptionEnds: subscriptionEnds.toISOString(),
            paymentDetails: {
                paymentId: 'TEST_' + Date.now(),
                amount: '99.00',
                method: 'test'
            }
        });
        
        if (result.success) {
            console.log(`   ✅ Organización creada: ${result.organizationId}`);
            console.log(`   🔑 Código: ${result.accessCode}`);
            console.log(`   👤 Admin UID: ${result.adminUid}`);
            console.log(`   🔐 Contraseña temporal: ${result.tempPassword}\n`);
            
            console.log('3️⃣ Verificando en Firebase...');
            console.log('   📋 Revisa en Firebase Console:');
            console.log('   https://console.firebase.google.com/project/edunotes-61652/firestore/data');
            console.log('\n✨ PRUEBA COMPLETADA EXITOSAMENTE ✨');
            console.log('\n📋 Resumen:');
            console.log(`   Código para compartir: ${result.accessCode}`);
            console.log(`   Email admin: test@ejemplo.com`);
            console.log(`   Contraseña temporal: ${result.tempPassword}`);
        } else {
            console.error('\n❌ Error:', result.error);
        }
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    }
}

test();
