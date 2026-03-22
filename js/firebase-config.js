// Configuración de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// Configuración - REEMPLAZAR CON TUS DATOS
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };

// Funciones de utilidad para Firebase
async function guardarContacto(data) {
    try {
        const docRef = await addDoc(collection(db, "contactos"), {
            ...data,
            fecha: new Date(),
            estado: "pendiente"
        });
        console.log("Contacto guardado con ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error guardando contacto: ", error);
        throw error;
    }
}

async function guardarPedido(pedido) {
    try {
        const docRef = await addDoc(collection(db, "pedidos"), {
            ...pedido,
            fecha: new Date(),
            estado: "procesando"
        });
        return docRef.id;
    } catch (error) {
        console.error("Error guardando pedido: ", error);
        throw error;
    }
}

async function guardarSuscripcion(email, nombre) {
    try {
        const docRef = await addDoc(collection(db, "suscriptores"), {
            email,
            nombre,
            fecha: new Date(),
            activo: true
        });
        return docRef.id;
    } catch (error) {
        console.error("Error guardando suscripción: ", error);
        throw error;
    }
}

export { guardarContacto, guardarPedido, guardarSuscripcion };