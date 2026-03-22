// Verificar autenticación
function verificarAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login.html';
    }
}

// Cargar sección inicial
document.addEventListener('DOMContentLoaded', () => {
    verificarAuth();
    cargarSeccion('dashboard');
});

// Cargar diferentes secciones
async function cargarSeccion(seccion) {
    const contentArea = document.getElementById('content-area');
    
    // Actualizar navegación activa
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(seccion)) {
            link.classList.add('active');
        }
    });

    switch(seccion) {
        case 'dashboard':
            contentArea.innerHTML = await cargarDashboard();
            inicializarDashboard();
            break;
        case 'proyectos':
            contentArea.innerHTML = await cargarProyectos();
            inicializarProyectos();
            break;
        case 'recursos':
            contentArea.innerHTML = await cargarRecursos();
            inicializarRecursos();
            break;
        case 'pedidos':
            contentArea.innerHTML = await cargarPedidos();
            break;
        case 'contactos':
            contentArea.innerHTML = await cargarContactos();
            break;
        case 'suscriptores':
            contentArea.innerHTML = await cargarSuscriptores();
            break;
        case 'configuracion':
            contentArea.innerHTML = cargarConfiguracion();
            break;
    }
}

// Cargar dashboard
async function cargarDashboard() {
    try {
        const response = await fetch('/api/dashboard/metrics');
        const metrics = await response.json();
        
        return `
            <div class="metrics-grid">
                <div class="metric-card">
                    <h3>Total Contactos</h3>
                    <div class="metric-value">${metrics.totalContactos}</div>
                    <div class="metric-change positive">
                        <i class="fas fa-arrow-up"></i> ${metrics.contactosPendientes} pendientes
                    </div>
                </div>
                <div class="metric-card">
                    <h3>Total Pedidos</h3>
                    <div class="metric-value">${metrics.totalPedidos}</div>
                    <div class="metric-change positive">+12% este mes</div>
                </div>
                <div class="metric-card">
                    <h3>Suscriptores</h3>
                    <div class="metric-value">${metrics.totalSuscriptores}</div>
                    <div class="metric-change positive">+5% este mes</div>
                </div>
                <div class="metric-card">
                    <h3>Ingresos</h3>
                    <div class="metric-value">${metrics.totalIngresos || 0}€</div>
                    <div class="metric-change positive">+8% este mes</div>
                </div>
            </div>

            <div class="charts-row">
                <div class="chart-container">
                    <h3>Ventas mensuales</h3>
                    <canvas id="ventasChart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Tipos de proyecto</h3>
                    <canvas id="proyectosChart"></canvas>
                </div>
            </div>

            <div class="table-container">
                <h3>Pedidos recientes</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID Pedido</th>
                            <th>Cliente</th>
                            <th>Producto</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generarFilasPedidos(metrics.pedidosRecientes)}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        return '<p>Error cargando métricas</p>';
    }
}

function generarFilasPedidos(pedidos) {
    if (!pedidos || pedidos.length === 0) {
        return '<tr><td colspan="6" class="text-center">No hay pedidos recientes</td></tr>';
    }
    
    return pedidos.map(pedido => `
        <tr>
            <td>#${pedido.id.slice(0, 8)}</td>
            <td>${pedido.cliente || 'Anónimo'}</td>
            <td>${pedido.producto || 'Recurso educativo'}</td>
            <td>${pedido.total || 0}€</td>
            <td><span class="status-badge ${pedido.estado}">${pedido.estado}</span></td>
            <td>${new Date(pedido.fecha?.toDate()).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

function inicializarDashboard() {
    // Inicializar gráficos si existen
    if (document.getElementById('ventasChart')) {
        new Chart(document.getElementById('ventasChart'), {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Ventas 2024',
                    data: [65, 59, 80, 81, 56, 85],
                    borderColor: '#2A9D8F',
                    tension: 0.1
                }]
            }
        });
    }
    
    if (document.getElementById('proyectosChart')) {
        new Chart(document.getElementById('proyectosChart'), {
            type: 'doughnut',
            data: {
                labels: ['Educativos', 'Corporativos', 'Recursos'],
                datasets: [{
                    data: [300, 150, 100],
                    backgroundColor: ['#2A9D8F', '#264653', '#E9C46A']
                }]
            }
        });
    }
}

// Cargar gestión de proyectos
async function cargarProyectos() {
    return `
        <div class="content-header">
            <h2>Gestión de Proyectos</h2>
            <button class="btn-primary" onclick="mostrarFormProyecto()">
                <i class="fas fa-plus"></i> Nuevo Proyecto
            </button>
        </div>
        
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Categoría</th>
                        <th>Tecnologías</th>
                        <th>Demo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="proyectos-table-body">
                    <!-- Proyectos cargados dinámicamente -->
                </tbody>
            </table>
        </div>

        <!-- Modal para nuevo/editar proyecto -->
        <div id="proyectoModal" class="modal" style="display: none;">
            <div class="modal-content">
                <h3>Nuevo Proyecto</h3>
                <form id="proyectoForm" class="admin-form">
                    <div class="form-group">
                        <label>Título</label>
                        <input type="text" name="titulo" required>
                    </div>
                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea name="descripcion" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Categoría</label>
                        <select name="categoria" required>
                            <option value="educativo">Educativo</option>
                            <option value="corporativo">Corporativo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tecnologías (separadas por coma)</label>
                        <input type="text" name="tecnologias" placeholder="React, Node.js, MongoDB">
                    </div>
                    <div class="form-group">
                        <label>URL Demo</label>
                        <input type="url" name="demo">
                    </div>
                    <div class="form-group">
                        <label>Imagen</label>
                        <input type="file" name="imagen" accept="image/*">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Guardar</button>
                        <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function inicializarProyectos() {
    cargarProyectosTabla();
    
    document.getElementById('proyectoForm')?.addEventListener('submit', guardarProyecto);
}

async function cargarProyectosTabla() {
    // Simulación - En producción vendría de Firebase
    const proyectos = [
        { id: 1, titulo: 'Web educativa', categoria: 'Educativo', tecnologias: ['React', 'Node.js'], demo: '#' },
        { id: 2, titulo: 'Portal corporativo', categoria: 'Corporativo', tecnologias: ['Vue.js', 'Firebase'], demo: '#' }
    ];
    
    const tbody = document.getElementById('proyectos-table-body');
    if (tbody) {
        tbody.innerHTML = proyectos.map(p => `
            <tr>
                <td>${p.titulo}</td>
                <td>${p.categoria}</td>
                <td>${p.tecnologias.join(', ')}</td>
                <td><a href="${p.demo}" target="_blank">Ver demo</a></td>
                <td>
                    <button class="btn-secondary btn-sm" onclick="editarProyecto(${p.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger btn-sm" onclick="eliminarProyecto(${p.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function mostrarFormProyecto() {
    document.getElementById('proyectoModal').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('proyectoModal').style.display = 'none';
}

function guardarProyecto(e) {
    e.preventDefault();
    // Lógica para guardar proyecto
    cerrarModal();
    mostrarNotificacion('Proyecto guardado correctamente', 'success');
}

// Cargar pedidos
async function cargarPedidos() {
    return `
        <h2>Gestión de Pedidos</h2>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID Pedido</th>
                        <th>Cliente</th>
                        <th>Productos</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="pedidos-table-body">
                    <!-- Pedidos cargados dinámicamente -->
                </tbody>
            </table>
        </div>
    `;
}

// Cargar contactos
async function cargarContactos() {
    return `
        <h2>Mensajes de Contacto</h2>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Tipo Proyecto</th>
                        <th>Mensaje</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="contactos-table-body">
                    <!-- Contactos cargados dinámicamente -->
                </tbody>
            </table>
        </div>
    `;
}

// Cargar suscriptores
async function cargarSuscriptores() {
    return `
        <h2>Suscriptores Newsletter</h2>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Fecha Suscripción</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="suscriptores-table-body">
                    <!-- Suscriptores cargados dinámicamente -->
                </tbody>
            </table>
        </div>
    `;
}

// Configuración
function cargarConfiguracion() {
    return `
        <h2>Configuración</h2>
        <form class="admin-form">
            <h3>Configuración General</h3>
            <div class="form-group">
                <label>Email de notificaciones</label>
                <input type="email" value="admin@edunotes.com">
            </div>
            
            <h3>Integraciones</h3>
            <div class="form-group">
                <label>Firebase Config</label>
                <textarea rows="5">{
    "apiKey": "configurado",
    "authDomain": "configurado"
}</textarea>
            </div>
            
            <div class="form-group">
                <label>PayPal Client ID</label>
                <input type="text" value="configurado">
            </div>
            
            <div class="form-group">
                <label>SMTP Config</label>
                <input type="text" value="configurado">
            </div>
            
            <button type="submit" class="btn-primary">Guardar Configuración</button>
        </form>
    `;
}

// Utilidades
function mostrarNotificacion(mensaje, tipo) {
    // Similar a la función en main.js
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    
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

function cerrarSesion() {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login.html';
}