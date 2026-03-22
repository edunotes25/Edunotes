document.addEventListener('DOMContentLoaded', () => {
    inicializarFormularioContacto();
});

function inicializarFormularioContacto() {
    const form = document.getElementById('contact-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Validar formulario
            if (!validarFormulario(data)) {
                return;
            }
            
            // Mostrar estado de carga
            const submitBtn = form.querySelector('button[type="submit"]');
            const btnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;
            
            try {
                // Simular envío (aquí iría la llamada a la API)
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                mostrarNotificacion('¡Mensaje enviado con éxito! Te responderemos en 24h.', 'success');
                form.reset();
                
            } catch (error) {
                mostrarNotificacion('Error al enviar el mensaje. Intenta de nuevo.', 'error');
            } finally {
                submitBtn.innerHTML = btnText;
                submitBtn.disabled = false;
            }
        });
    }
}

function validarFormulario(data) {
    // Validar nombre
    if (!data.nombre || data.nombre.length < 3) {
        mostrarNotificacion('El nombre debe tener al menos 3 caracteres', 'error');
        return false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        mostrarNotificacion('Email no válido', 'error');
        return false;
    }
    
    // Validar tipo de proyecto
    if (!data.tipoProyecto) {
        mostrarNotificacion('Selecciona un tipo de proyecto', 'error');
        return false;
    }
    
    // Validar mensaje
    if (!data.mensaje || data.mensaje.length < 10) {
        mostrarNotificacion('El mensaje debe tener al menos 10 caracteres', 'error');
        return false;
    }
    
    // Validar privacidad
    if (!data.privacidad) {
        mostrarNotificacion('Debes aceptar la política de privacidad', 'error');
        return false;
    }
    
    return true;
}