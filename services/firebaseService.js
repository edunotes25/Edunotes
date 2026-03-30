// services/firebaseService.js
const admin = require('firebase-admin');
const crypto = require('crypto');
require('dotenv').config();

class FirebaseService {
    constructor() {
        // Verificar variables de entorno
        if (!process.env.FIREBASE_PRIVATE_KEY) {
            console.error('❌ ERROR: FIREBASE_PRIVATE_KEY no está definida en .env');
            throw new Error('FIREBASE_PRIVATE_KEY no configurada');
        }
        
        // Inicializar solo si no está ya inicializado
        if (!admin.apps.length) {
            const serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            };
            
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: process.env.FIREBASE_PROJECT_ID
            });
            
            console.log('✅ Firebase Admin inicializado en portfolio');
        }
        
        this.db = admin.firestore();
        this.auth = admin.auth();
    }

    generateAccessCode() {
        return crypto.randomBytes(4).toString('hex').toUpperCase();
    }

    async isAccessCodeUnique(accessCode) {
        const snapshot = await this.db.collection('organizaciones')
            .where('accessCode', '==', accessCode)
            .limit(1)
            .get();
        return snapshot.empty;
    }

    async generateUniqueAccessCode(maxAttempts = 10) {
        for (let i = 0; i < maxAttempts; i++) {
            const code = this.generateAccessCode();
            if (await this.isAccessCodeUnique(code)) {
                return code;
            }
        }
        throw new Error('No se pudo generar un código único');
    }

    generateTempPassword() {
        return crypto.randomBytes(6).toString('hex');
    }

    async createOrganization(data) {
        const { schoolName, adminEmail, adminName, accessCode, subscriptionEnds, paymentDetails } = data;
        
        try {
            // Crear organización
            const orgRef = this.db.collection('organizaciones').doc();
            const organizationId = orgRef.id;
            
            await orgRef.set({
                name: schoolName,
                accessCode: accessCode,
                subscriptionActive: true,
                subscriptionEnds: subscriptionEnds || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
                adminEmail: adminEmail,
                adminName: adminName,
                paymentDetails: paymentDetails
            });
            
            // Crear usuario admin
            const tempPassword = this.generateTempPassword();
            const userRecord = await this.auth.createUser({
                email: adminEmail,
                password: tempPassword,
                displayName: adminName
            });
            
            // Guardar en Firestore
            await this.db.collection('usuarios').doc(userRecord.uid).set({
                uid: userRecord.uid,
                nombre: adminName,
                email: adminEmail,
                tipo: 'admin',
                role: 'org_admin',
                organizationId: organizationId,
                activo: true,
                needsPasswordReset: true,
                createdAt: new Date().toISOString()
            });
            
            // Asignar claims
            await this.auth.setCustomUserClaims(userRecord.uid, {
                organizationId: organizationId,
                role: 'org_admin'
            });
            
            return {
                success: true,
                organizationId: organizationId,
                accessCode: accessCode,
                adminUid: userRecord.uid,
                tempPassword: tempPassword
            };
            
        } catch (error) {
            console.error('Error creando organización:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new FirebaseService();