// Sistema de cookies - VERSIÓN CORREGIDA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍪 Inicializando sistema de cookies...');
    
    const cookieBanner = document.getElementById('cookie-banner');
    
    // Si no hay banner en esta página, salir
    if (!cookieBanner) {
        console.log('No hay banner de cookies en esta página');
        return;
    }
    
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    const configBtn = document.getElementById('config-cookies');
    const cookieModal = document.getElementById('cookie-modal');
    const saveBtn = document.getElementById('save-cookies');
    const closeModal = document.getElementById('close-modal');
    
    // Comprobar si ya ha aceptado antes
    const cookiesAccepted = localStorage.getItem('cookies_accepted');
    
    console.log('Estado cookies guardado:', cookiesAccepted);
    
    // SI NO HA ACEPTADO/RECHAZADO ANTES, MOSTRAR EL BANNER
    if (!cookiesAccepted) {
        console.log('✅ Mostrando banner de cookies (primera visita)');
        cookieBanner.style.display = 'block';
    } else {
        console.log('ℹ️ Cookies ya configuradas, banner oculto');
        cookieBanner.style.display = 'none';
    }
    
    // Aceptar cookies
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            console.log('👍 Aceptando cookies');
            localStorage.setItem('cookies_accepted', 'accepted');
            cookieBanner.style.display = 'none';
            
            // Mostrar notificación si existe la función
            if (typeof mostrarNotificacion === 'function') {
                mostrarNotificacion('Cookies aceptadas', 'success');
            } else {
                alert('Cookies aceptadas'); // Fallback
            }
        });
    }
    
    // Rechazar cookies
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            console.log('👎 Rechazando cookies');
            localStorage.setItem('cookies_accepted', 'rejected');
            cookieBanner.style.display = 'none';
            
            if (typeof mostrarNotificacion === 'function') {
                mostrarNotificacion('Cookies rechazadas', 'info');
            } else {
                alert('Cookies rechazadas');
            }
        });
    }
    
    // Abrir configuración
    if (configBtn) {
        configBtn.addEventListener('click', function() {
            console.log('⚙️ Abriendo configuración');
            if (cookieModal) {
                cookieModal.style.display = 'flex';
            }
        });
    }
    
    // Guardar configuración
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            console.log('💾 Guardando configuración');
            
            const analisis = document.getElementById('cookies-analisis');
            const publicitarias = document.getElementById('cookies-publicitarias');
            
            // Guardar preferencias
            localStorage.setItem('cookies_accepted', 'configured');
            if (analisis) localStorage.setItem('cookies_analisis', analisis.checked);
            if (publicitarias) localStorage.setItem('cookies_publicitarias', publicitarias.checked);
            
            // Cerrar modal y banner
            if (cookieModal) {
                cookieModal.style.display = 'none';
            }
            cookieBanner.style.display = 'none';
            
            if (typeof mostrarNotificacion === 'function') {
                mostrarNotificacion('Configuración guardada', 'success');
            } else {
                alert('Configuración guardada');
            }
        });
    }
    
    // Cerrar modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (cookieModal) {
                cookieModal.style.display = 'none';
            }
        });
    }
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === cookieModal) {
            cookieModal.style.display = 'none';
        }
    });
});

// Función para resetear cookies (útil para pruebas)
window.resetearCookies = function() {
    localStorage.removeItem('cookies_accepted');
    localStorage.removeItem('cookies_analisis');
    localStorage.removeItem('cookies_publicitarias');
    location.reload();
    console.log('🔄 Cookies reseteadas');
};