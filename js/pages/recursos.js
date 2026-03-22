document.addEventListener('DOMContentLoaded', () => {
    inicializarGaleriaMockups();
    inicializarBotonesCarrito();
    inicializarEfectosHover();
    
    // Asegurar que el carrito se inicializa
    if (typeof inicializarCarrito === 'function') {
        // Ya se inicializa en main.js
    }
});

function inicializarGaleriaMockups() {
    const galerias = document.querySelectorAll('.paquete-galeria');
    
    galerias.forEach(galeria => {
        const principal = galeria.querySelector('.galeria-principal img');
        const miniaturas = galeria.querySelectorAll('.galeria-mini img');
        
        if (principal && miniaturas.length) {
            miniaturas.forEach(miniatura => {
                miniatura.addEventListener('click', () => {
                    // Cambiar imagen principal
                    principal.src = miniatura.src;
                    
                    // Actualizar clase activa
                    miniaturas.forEach(m => m.classList.remove('activo'));
                    miniatura.classList.add('activo');
                });
            });
        }
    });
}

function inicializarBotonesCarrito() {
    const botones = document.querySelectorAll('.btn-add-cart');
    
    botones.forEach(boton => {
        // Eliminar listeners anteriores
        const nuevoBoton = boton.cloneNode(true);
        boton.parentNode.replaceChild(nuevoBoton, boton);
        
        nuevoBoton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const paqueteCard = nuevoBoton.closest('.paquete-card');
            
            if (paqueteCard) {
                // Obtener datos del producto
                const nombre = paqueteCard.querySelector('h3')?.textContent || 'Producto';
                const precioTexto = paqueteCard.querySelector('.precio')?.textContent || '0€';
                const precio = parseFloat(precioTexto.replace('€', '').replace(',', '.'));
                const imagen = paqueteCard.querySelector('.galeria-principal img')?.src || '';
                
                const producto = {
                    id: paqueteCard.dataset.id || Date.now().toString(),
                    nombre: nombre,
                    precio: precio,
                    imagen: imagen
                };
                
                console.log('Añadiendo producto:', producto);
                
                // Llamar a función global del carrito
                if (typeof window.agregarAlCarrito === 'function') {
                    window.agregarAlCarrito(producto);
                } else {
                    console.error('La función agregarAlCarrito no está disponible');
                    // Fallback: mostrar notificación manual
                    alert('Producto añadido al carrito: ' + nombre);
                }
            }
        });
    });
}

function inicializarEfectosHover() {
    const paquetes = document.querySelectorAll('.paquete-card');
    
    paquetes.forEach(paquete => {
        paquete.addEventListener('mouseenter', () => {
            if (!paquete.classList.contains('featured')) {
                paquete.style.transform = 'translateY(-5px)';
            }
        });
        
        paquete.addEventListener('mouseleave', () => {
            if (!paquete.classList.contains('featured')) {
                paquete.style.transform = 'translateY(0)';
            }
        });
    });
}