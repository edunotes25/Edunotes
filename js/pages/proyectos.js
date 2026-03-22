document.addEventListener('DOMContentLoaded', () => {
    inicializarNavegacionProyectos();
    inicializarEfectosHover();
});

function inicializarNavegacionProyectos() {
    const tipoBtns = document.querySelectorAll('.tipo-btn');
    const proyectos = document.querySelectorAll('.proyecto-card');
    
    // Si no hay botones o proyectos, salir
    if (!tipoBtns.length || !proyectos.length) return;
    
    // Función para filtrar proyectos
    function filtrarProyectos(categoria) {
        console.log('Filtrando por:', categoria);
        
        proyectos.forEach(proyecto => {
            const proyectoCategoria = proyecto.dataset.categoria;
            
            if (categoria === 'todos' || proyectoCategoria === categoria) {
                proyecto.classList.remove('hidden');
                // Animación de entrada
                proyecto.style.opacity = '0';
                proyecto.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    proyecto.style.transition = 'all 0.5s ease';
                    proyecto.style.opacity = '1';
                    proyecto.style.transform = 'translateY(0)';
                }, 50);
            } else {
                proyecto.classList.add('hidden');
            }
        });
    }
    
    // Añadir evento click a cada botón
    tipoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Quitar clase active de todos los botones
            tipoBtns.forEach(b => b.classList.remove('active'));
            
            // Añadir clase active al botón clickeado
            btn.classList.add('active');
            
            // Obtener categoría del botón
            const categoria = btn.dataset.categoria;
            
            // Filtrar proyectos
            filtrarProyectos(categoria);
        });
    });
    
    // Mostrar todos los proyectos al inicio
    filtrarProyectos('todos');
}

function inicializarEfectosHover() {
    const proyectos = document.querySelectorAll('.proyecto-card');
    
    proyectos.forEach(proyecto => {
        const overlay = proyecto.querySelector('.proyecto-overlay');
        const links = proyecto.querySelectorAll('.btn-icon');
        
        proyecto.addEventListener('mouseenter', () => {
            if (overlay) {
                overlay.style.opacity = '1';
            }
            
            links.forEach((link, index) => {
                setTimeout(() => {
                    link.style.transform = 'translateY(0)';
                }, index * 100);
            });
        });
        
        proyecto.addEventListener('mouseleave', () => {
            if (overlay) {
                overlay.style.opacity = '0';
            }
            
            links.forEach(link => {
                link.style.transform = 'translateY(20px)';
            });
        });
    });
}

// Animación de entrada para las tarjetas
function animarEntradaProyectos() {
    const proyectos = document.querySelectorAll('.proyecto-card');
    
    proyectos.forEach((proyecto, index) => {
        proyecto.style.opacity = '0';
        proyecto.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            proyecto.style.transition = 'all 0.5s ease';
            proyecto.style.opacity = '1';
            proyecto.style.transform = 'translateY(0)';
        }, 100 + (index * 150));
    });
}

// Llamar a la animación cuando se cargue la página
window.addEventListener('load', animarEntradaProyectos);