// js/load-components.js
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading ${componentPath}:`, error);
        // Fallback si no se carga el componente
        document.getElementById(elementId).innerHTML = '<div style="text-align:center;padding:1rem;">Error al cargar el componente</div>';
    }
}

// Cargar componentes
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('header')) {
        loadComponent('header', 'components/header.html');
    }
    if (document.getElementById('footer')) {
        loadComponent('footer', 'components/footer.html');
    }
});