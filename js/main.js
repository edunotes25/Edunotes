// Variables globales
let carrito = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado');
    inicializarCarrito();
    inicializarHeader();
    inicializarScroll();
    inicializarOverlay();
    
    // Inicializar botones de carrito en todas las páginas
    setTimeout(() => {
        inicializarBotonesCarritoGlobal();
    }, 500);
});

// Inicializar overlay
function inicializarOverlay() {
    const overlay = document.getElementById('cart-overlay');
    if (overlay) {
        overlay.addEventListener('click', cerrarCarrito);
    }
}

// Header con efecto scroll
function inicializarScroll() {
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });
    }
}

// Inicializar header - marcar enlace activo
function inicializarHeader() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ===== FUNCIONES DEL CARRITO =====
function inicializarCarrito() {
    console.log('Inicializando carrito');
    
    // Cargar carrito guardado
    try {
        const carritoGuardado = localStorage.getItem('edunotes_carrito');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
            // Filtrar items inválidos
            carrito = carrito.filter(item => item && item.id && item.nombre && typeof item.precio === 'number');
        } else {
            carrito = [];
        }
    } catch (e) {
        console.error('Error cargando carrito:', e);
        carrito = [];
        localStorage.removeItem('edunotes_carrito');
    }
    
    actualizarContadorCarrito();
    configurarEventListenersCarrito();
    
    // Cerrar carrito con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarCarrito();
        }
    });
}

function configurarEventListenersCarrito() {
    const cartIcon = document.getElementById('cartIcon');
    const closeCart = document.querySelector('.close-cart');
    
    if (cartIcon) {
        // Eliminar listeners anteriores
        const newCartIcon = cartIcon.cloneNode(true);
        cartIcon.parentNode.replaceChild(newCartIcon, cartIcon);
        
        newCartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Abriendo carrito');
            abrirCarrito();
        });
    }
    
    if (closeCart) {
        const newCloseCart = closeCart.cloneNode(true);
        closeCart.parentNode.replaceChild(newCloseCart, closeCart);
        
        newCloseCart.addEventListener('click', (e) => {
            e.preventDefault();
            cerrarCarrito();
        });
    }
}

function abrirCarrito() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (cartSidebar) {
        cartSidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        mostrarCarrito();
    }
}

function cerrarCarrito() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (cartSidebar) {
        cartSidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }
}

function agregarAlCarrito(producto) {
    console.log('Agregando producto:', producto);
    
    // Validar producto
    if (!producto || !producto.id || !producto.nombre || !producto.precio || producto.precio <= 0) {
        console.error('Producto inválido:', producto);
        mostrarNotificacion('Error al añadir el producto', 'error');
        return;
    }
    
    // Buscar si el producto ya existe
    const itemExistente = carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen || 'assets/images/placeholder.jpg',
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarContadorCarrito();
    mostrarCarrito();
    mostrarNotificacion('Producto añadido al carrito', 'success');
}

function guardarCarrito() {
    localStorage.setItem('edunotes_carrito', JSON.stringify(carrito));
    console.log('Carrito guardado:', carrito);
}

function actualizarContadorCarrito() {
    const contador = document.querySelector('.cart-count');
    if (contador) {
        const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
        contador.textContent = totalItems;
        
        if (totalItems === 0) {
            contador.style.display = 'none';
        } else {
            contador.style.display = 'flex';
        }
    }
}

function mostrarCarrito() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;

    if (!carrito || carrito.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
        if (cartTotal) cartTotal.textContent = '0,00€';
        return;
    }

    cartItems.innerHTML = carrito.map(item => `
        <div class="cart-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #e5e7eb;">
            <div class="cart-item-info" style="flex: 1;">
                <h4 style="margin: 0 0 0.3rem 0; color: #1f2937;">${item.nombre}</h4>
                <p style="margin: 0; color: #6b7280;">${formatearPrecio(item.precio)} x ${item.cantidad}</p>
            </div>
            <div class="cart-item-actions" style="display: flex; align-items: center; gap: 0.5rem;">
                <button onclick="window.actualizarCantidad('${item.id}', ${item.cantidad - 1})" style="width: 25px; height: 25px; border: 1px solid #d1d5db; background: white; border-radius: 5px; cursor: pointer;">-</button>
                <span style="min-width: 20px; text-align: center;">${item.cantidad}</span>
                <button onclick="window.actualizarCantidad('${item.id}', ${item.cantidad + 1})" style="width: 25px; height: 25px; border: 1px solid #d1d5db; background: white; border-radius: 5px; cursor: pointer;">+</button>
                <button onclick="window.eliminarDelCarrito('${item.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer;" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    const total = carrito.reduce((sum, item) => sum + ((item.precio || 0) * (item.cantidad || 0)), 0);
    if (cartTotal) cartTotal.textContent = formatearPrecio(total);
}

// Formatear precio con 2 decimales
function formatearPrecio(precio) {
    return precio.toFixed(2).replace('.', ',') + '€';
}

// Funciones globales para los botones del carrito
window.actualizarCantidad = function(id, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(id);
        return;
    }

    const item = carrito.find(i => i.id === id);
    if (item) {
        item.cantidad = nuevaCantidad;
        guardarCarrito();
        mostrarCarrito();
        actualizarContadorCarrito();
    }
};

window.eliminarDelCarrito = function(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito();
    mostrarCarrito();
    actualizarContadorCarrito();
    mostrarNotificacion('Producto eliminado del carrito', 'info');
};

window.procederPago = function() {
    if (!carrito || carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'warning');
        return;
    }
    
    mostrarNotificacion('Redirigiendo a PayPal...', 'info');
    // Aquí iría la integración con PayPal
};

window.limpiarCarritoCompleto = function() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        carrito = [];
        guardarCarrito();
        mostrarCarrito();
        actualizarContadorCarrito();
        cerrarCarrito();
        mostrarNotificacion('Carrito vaciado', 'success');
    }
};

// Inicializar botones de carrito en todas las páginas
function inicializarBotonesCarritoGlobal() {
    console.log('Buscando botones de carrito...');
    const botones = document.querySelectorAll('.btn-add-cart');
    
    if (botones.length === 0) {
        console.log('No hay botones de carrito en esta página');
        return;
    }
    
    console.log(`Encontrados ${botones.length} botones de carrito`);
    
    botones.forEach((boton, index) => {
        const nuevoBoton = boton.cloneNode(true);
        boton.parentNode.replaceChild(nuevoBoton, boton);
        
        nuevoBoton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const paqueteCard = nuevoBoton.closest('.paquete-card');
            if (!paqueteCard) return;
            
            // Extraer datos del producto
            const nombreElement = paqueteCard.querySelector('h3');
            const precioElement = paqueteCard.querySelector('.precio');
            const imgElement = paqueteCard.querySelector('.galeria-principal img') || paqueteCard.querySelector('.paquete-img img') || paqueteCard.querySelector('img');
            
            const producto = {
                id: paqueteCard.dataset.id || `prod_${Date.now()}_${index}`,
                nombre: nombreElement ? nombreElement.textContent.trim() : 'Producto',
                precio: extraerPrecio(precioElement),
                imagen: imgElement ? imgElement.src : 'assets/images/placeholder.jpg'
            };
            
            console.log('Producto a añadir:', producto);
            
            if (producto.precio > 0) {
                agregarAlCarrito(producto);
            } else {
                mostrarNotificacion('Error con el precio del producto', 'error');
            }
        });
    });
}

function extraerPrecio(elemento) {
    if (!elemento) return 0;
    const texto = elemento.textContent.replace('€', '').trim();
    // Reemplazar coma por punto para parsear correctamente
    return parseFloat(texto.replace(',', '.'));
}

// Sistema de notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacionesAnteriores = document.querySelectorAll('.notificacion');
    notificacionesAnteriores.forEach(notif => notif.remove());
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

// Función para depuración
window.verCarrito = function() {
    console.log('Carrito actual:', carrito);
    console.log('LocalStorage:', localStorage.getItem('edunotes_carrito'));
};