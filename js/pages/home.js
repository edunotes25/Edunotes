document.addEventListener('DOMContentLoaded', () => {
    inicializarAnimaciones();
});

function inicializarAnimaciones() {
    // Animación para las tarjetas de servicios
    const servicioCards = document.querySelectorAll('.servicio-card');
    servicioCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
    
    // Animación para proyectos destacados
    const proyectoCards = document.querySelectorAll('.proyecto-mini-card');
    proyectoCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
    });
}