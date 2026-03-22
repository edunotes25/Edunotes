// js/components.js
// Función para cargar componentes HTML
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        
        // Reinicializar el carrito después de cargar el header
        if (elementId === 'header') {
            initCart();
        }
    } catch (error) {
        console.error(`Error loading ${componentPath}:`, error);
    }
}

// Inicializar carrito
function initCart() {
    let carrito = [];
    
    function actualizarCarrito() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) cartCount.textContent = carrito.length;
    }
    
    window.agregarAlCarrito = function(nombre, precio) {
        carrito.push({ nombre, precio });
        actualizarCarrito();
        alert(`✅ ${nombre} agregado al carrito por ${precio}€`);
    };
    
    window.verCarrito = function() {
        if (carrito.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        let mensaje = '🛒 Carrito:\n';
        carrito.forEach((item, i) => {
            mensaje += `${i + 1}. ${item.nombre} - ${item.precio}€\n`;
        });
        mensaje += `\nTotal: ${carrito.reduce((sum, item) => sum + item.precio, 0).toFixed(2)}€`;
        alert(mensaje);
    };
    
    document.addEventListener('DOMContentLoaded', () => {
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                verCarrito();
            });
        }
        actualizarCarrito();
    });
}

// Cargar componentes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Cargar header y footer
    if (document.getElementById('header')) {
        loadComponent('header', '../components/header.html');
    }
    if (document.getElementById('footer')) {
        loadComponent('footer', '../components/footer.html');
    }
});