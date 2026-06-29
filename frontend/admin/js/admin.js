/**
 * Admin Panel - Main JavaScript
 * Sistema de Inventario - Calzados Hermanos Solis
 */

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://kiro-shoes-backend.vercel.app/api';

// ============================================================
// STATE MANAGEMENT
// ============================================================

const state = {
  token: localStorage.getItem('admin_token') || null,
  user: JSON.parse(localStorage.getItem('admin_user') || 'null'),
  currentView: 'dashboard',
  products: [],
  categories: [],
  audiences: [],
  orders: [],
  inventory: [],
  alerts: {
    lowStock: [],
    outOfStock: []
  }
};

// ============================================================
// API UTILITIES
// ============================================================

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (state.token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================================
// AUTHENTICATION
// ============================================================

async function login(email, password) {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, password })
    });

    state.token = data.accessToken;
    state.user = data.user;

    localStorage.setItem('admin_token', data.accessToken);
    localStorage.setItem('admin_user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    throw error;
  }
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  showLoginScreen();
}

function checkAuth() {
  if (!state.token || !state.user) {
    showLoginScreen();
    return false;
  }
  showDashboard();
  return true;
}

// ============================================================
// UI MANAGEMENT
// ============================================================

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'flex';
  
  // Update user info
  if (state.user) {
    document.getElementById('user-name').textContent = state.user.name || 'Admin';
    document.getElementById('user-email').textContent = state.user.email || '';
    document.getElementById('header-user-name').textContent = state.user.name || 'Admin';
  }
  
  // Load initial data
  loadDashboardData();
}

function switchView(viewName) {
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(`view-${viewName}`)?.classList.add('active');

  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    products: 'Productos',
    inventory: 'Inventario',
    orders: 'Pedidos',
    alerts: 'Alertas de Stock',
    catalog: 'Catálogo Público'
  };
  document.getElementById('page-title').textContent = titles[viewName] || viewName;

  state.currentView = viewName;

  // Load view data
  loadViewData(viewName);
}

async function loadViewData(viewName) {
  switch (viewName) {
    case 'dashboard':
      await loadDashboardData();
      break;
    case 'products':
      await loadProducts();
      break;
    case 'inventory':
      await loadInventory();
      break;
    case 'orders':
      await loadOrders();
      break;
    case 'alerts':
      await loadAlerts();
      break;
    case 'catalog':
      await loadCatalog();
      break;
  }
}

// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboardData() {
  try {
    // Load dashboard stats
    const [dashboardData, lowStockData, ordersData] = await Promise.all([
      apiRequest('/admin/dashboard'),
      apiRequest('/inventory/low-stock?threshold=5'),
      apiRequest('/orders?status=pending&limit=5')
    ]);

    // Update stats - Acceder al objeto stats correctamente
    const stats = dashboardData.stats || {};
    document.getElementById('stat-products').textContent = stats.totalProducts || 0;
    document.getElementById('stat-stock').textContent = calculateTotalStock() || 0;
    document.getElementById('stat-orders').textContent = stats.totalOrders || 0;
    document.getElementById('stat-alerts').textContent = stats.lowStockProducts || 0;

    // Update alerts badge
    const alertsCount = stats.lowStockProducts || 0;
    document.getElementById('alerts-badge').textContent = alertsCount;

    // Render low stock list
    renderLowStockList(lowStockData.lowStockVariants || []);

    // Render recent orders
    renderRecentOrders(ordersData.orders || []);

  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError('Error al cargar el dashboard');
  }
}

// Función auxiliar para calcular stock total
async function calculateTotalStock() {
  try {
    const data = await apiRequest('/products');
    const products = data.products || [];
    let totalStock = 0;
    products.forEach(product => {
      product.variants?.forEach(variant => {
        totalStock += (variant.stockQty - variant.reservedQty);
      });
    });
    return totalStock;
  } catch (error) {
    console.error('Error calculating total stock:', error);
    return 0;
  }
}

function renderLowStockList(variants) {
  const container = document.getElementById('low-stock-list');
  
  if (!variants.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">No hay productos con stock bajo</div></div>';
    return;
  }

  container.innerHTML = variants.slice(0, 5).map(variant => `
    <div class="list-item">
      <div class="list-item-content">
        <div class="list-item-title">${variant.product?.name || 'Producto'} - Talla ${variant.size?.code || 'N/A'}</div>
        <div class="list-item-subtitle">Stock disponible: ${variant.stockQty} unidades</div>
      </div>
      <span class="list-item-badge badge-warning">${variant.stockQty} unidades</span>
    </div>
  `).join('');
}

function renderRecentOrders(orders) {
  const container = document.getElementById('recent-orders-list');
  
  if (!orders.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-text">No hay pedidos recientes</div></div>';
    return;
  }

  const statusLabels = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const statusClasses = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-danger'
  };

  container.innerHTML = orders.map(order => `
    <div class="list-item">
      <div class="list-item-content">
        <div class="list-item-title">${order.customer?.name || 'Cliente'} - ${order.customer?.phone || ''}</div>
        <div class="list-item-subtitle">Total: C$${order.totalAmount || 0}</div>
      </div>
      <span class="list-item-badge ${statusClasses[order.status]}">${statusLabels[order.status]}</span>
    </div>
  `).join('');
}

// ============================================================
// PRODUCTS
// ============================================================

async function loadProducts() {
  try {
    showLoading('products-tbody');
    
    const data = await apiRequest('/products');
    console.log('Productos recibidos:', data);
    state.products = data.products || [];

    renderProductsTable(state.products);
  } catch (error) {
    console.error('Error loading products:', error);
    showError('Error al cargar productos');
  }
}

function filterProducts(searchTerm) {
  if (!searchTerm) {
    // Si no hay término de búsqueda, mostrar todos los productos
    renderProductsTable(state.products);
    return;
  }

  // Filtrar productos por nombre, SKU, categoría o audiencia
  const filtered = state.products.filter(product => {
    const name = (product.name || '').toLowerCase();
    const sku = (product.sku || '').toLowerCase();
    const category = (product.category?.label || '').toLowerCase();
    const audience = (product.audience?.label || '').toLowerCase();
    
    return name.includes(searchTerm) || 
           sku.includes(searchTerm) || 
           category.includes(searchTerm) || 
           audience.includes(searchTerm);
  });

  renderProductsTable(filtered);
  
  // Mostrar mensaje si no hay resultados
  if (filtered.length === 0) {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center">
          <div style="padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
            <div style="font-size: 1.1rem; color: var(--text-secondary);">
              No se encontraron productos que coincidan con "<strong>${searchTerm}</strong>"
            </div>
          </div>
        </td>
      </tr>
    `;
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById('products-tbody');
  
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">No hay productos disponibles</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(product => {
    const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockQty - v.reservedQty), 0) || 0;
    const statusClass = product.isActive ? 'badge-success' : 'badge-secondary';
    const statusText = product.isActive ? 'Activo' : 'Inactivo';
    
    // Preparar ruta de imagen con prefijo ../
    let imageSrc = '';
    if (product.images?.[0]?.imageUrl) {
      const rawUrl = product.images[0].imageUrl;
      // Si ya tiene prefijo ../, http://, https:// o /, usarlo tal cual
      if (rawUrl.startsWith('../') || rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('/')) {
        imageSrc = rawUrl;
      } else {
        // Agregar prefijo ../
        imageSrc = `../${rawUrl}`;
      }
    }

    return `
      <tr>
        <td>${product.id}</td>
        <td>
          ${imageSrc ? `
            <img src="${imageSrc}" 
                 alt="${product.name}" 
                 class="table-image"
                 onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='📦'">
          ` : '📦'}
        </td>
        <td><strong>${product.name}</strong></td>
        <td>${product.category?.label || '-'}</td>
        <td>${product.audience?.label || '-'}</td>
        <td>C$${product.basePrice || 0}</td>
        <td>${totalStock}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-secondary" onclick="viewProduct(${product.id})">Ver</button>
            <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id}, '${product.name.replace(/'/g, "\\'")}')">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadCategoriesAndAudiences() {
  try {
    const [categories, audiences] = await Promise.all([
      apiRequest('/catalog/categories', { skipAuth: true }),
      apiRequest('/catalog/audiences', { skipAuth: true })
    ]);

    state.categories = categories.categories || [];
    state.audiences = audiences.audiences || [];

    // Populate selects
    const categorySelect = document.getElementById('product-category');
    const audienceSelect = document.getElementById('product-audience');

    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>' +
        state.categories.map(cat => `<option value="${cat.id}">${cat.label}</option>`).join('');
    }

    if (audienceSelect) {
      audienceSelect.innerHTML = '<option value="">Seleccionar audiencia</option>' +
        state.audiences.map(aud => `<option value="${aud.id}">${aud.label}</option>`).join('');
    }
  } catch (error) {
    console.error('Error loading categories/audiences:', error);
  }
}

// ============================================================
// INVENTORY
// ============================================================

async function loadInventory() {
  try {
    showLoading('inventory-tbody');
    
    const filterType = document.getElementById('inventory-filter-type')?.value || '';
    const params = filterType ? `?type=${filterType}` : '';
    
    const data = await apiRequest(`/inventory/movements${params}`);
    state.inventory = data.movements || [];

    renderInventoryTable(state.inventory);
  } catch (error) {
    console.error('Error loading inventory:', error);
    showError('Error al cargar inventario');
  }
}

function renderInventoryTable(movements) {
  const tbody = document.getElementById('inventory-tbody');
  
  if (!movements.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay movimientos de inventario</td></tr>';
    return;
  }

  const typeLabels = {
    entry: 'Entrada',
    exit: 'Salida',
    adjustment: 'Ajuste'
  };

  tbody.innerHTML = movements.map(mov => `
    <tr>
      <td>${new Date(mov.createdAt).toLocaleDateString('es-NI')}</td>
      <td>${mov.variant?.product?.name || '-'}</td>
      <td>${mov.variant?.size?.code || '-'}</td>
      <td><span class="badge badge-info">${typeLabels[mov.type] || mov.type}</span></td>
      <td>${mov.quantity > 0 ? '+' : ''}${mov.quantity}</td>
      <td>${mov.reason || '-'}</td>
      <td>${mov.user?.name || 'Sistema'}</td>
    </tr>
  `).join('');
}

// ============================================================
// ORDERS
// ============================================================

async function loadOrders() {
  try {
    showLoading('orders-tbody');
    
    const filterStatus = document.getElementById('orders-filter-status')?.value || '';
    const params = filterStatus ? `?status=${filterStatus}` : '';
    
    const data = await apiRequest(`/orders${params}`);
    state.orders = data.orders || [];

    renderOrdersTable(state.orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    showError('Error al cargar pedidos');
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-tbody');
  
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay pedidos disponibles</td></tr>';
    return;
  }

  const statusLabels = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const statusClasses = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-danger'
  };

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>#${order.id}</td>
      <td>${order.customer?.name || '-'}</td>
      <td>${order.customer?.phone || '-'}</td>
      <td>C$${order.totalAmount || 0}</td>
      <td><span class="badge ${statusClasses[order.status]}">${statusLabels[order.status]}</span></td>
      <td>${new Date(order.createdAt).toLocaleDateString('es-NI')}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-secondary" onclick="viewOrder(${order.id})">Ver</button>
          ${order.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="confirmOrder(${order.id})">Confirmar</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

async function viewOrder(orderId) {
  try {
    const order = await apiRequest(`/orders/${orderId}`);
    
    const statusLabels = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };

    const modalBody = document.getElementById('order-modal-body');
    modalBody.innerHTML = `
      <div class="order-details">
        <div class="form-group">
          <label>Cliente</label>
          <p><strong>${order.customer?.name || '-'}</strong></p>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Teléfono</label>
            <p>${order.customer?.phone || '-'}</p>
          </div>
          <div class="form-group">
            <label>Email</label>
            <p>${order.customer?.email || '-'}</p>
          </div>
        </div>
        <div class="form-group">
          <label>Dirección</label>
          <p>${order.customer?.address || '-'}</p>
        </div>
        <div class="form-group">
          <label>Estado</label>
          <p><span class="badge badge-info">${statusLabels[order.status]}</span></p>
        </div>
        <div class="form-group">
          <label>Productos</label>
          <table class="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Talla</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>${item.variant?.product?.name || '-'}</td>
                  <td>${item.variant?.size?.code || '-'}</td>
                  <td>${item.quantity}</td>
                  <td>C$${item.unitPrice}</td>
                  <td>C$${item.subtotal}</td>
                </tr>
              `).join('') || '<tr><td colspan="5">No hay items</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="form-group">
          <label>Total</label>
          <p class="text-right"><strong style="font-size: 1.5rem; color: var(--secondary);">C$${order.totalAmount || 0}</strong></p>
        </div>
        ${order.status === 'pending' ? `
          <div class="form-actions">
            <button class="btn btn-success" onclick="confirmOrder(${order.id})">Confirmar Pedido</button>
            <button class="btn btn-danger" onclick="cancelOrder(${order.id})">Cancelar Pedido</button>
          </div>
        ` : ''}
      </div>
    `;

    showModal('order-modal');
  } catch (error) {
    console.error('Error loading order:', error);
    showError('Error al cargar el pedido');
  }
}

async function confirmOrder(orderId) {
  if (!confirm('¿Confirmar este pedido? Se descontará el stock permanentemente.')) {
    return;
  }

  try {
    await apiRequest(`/orders/${orderId}/confirm`, {
      method: 'POST'
    });

    showSuccess('Pedido confirmado exitosamente');
    closeModal('order-modal');
    loadOrders();
    loadDashboardData();
  } catch (error) {
    console.error('Error confirming order:', error);
    showError(error.message || 'Error al confirmar el pedido');
  }
}

async function cancelOrder(orderId) {
  if (!confirm('¿Cancelar este pedido? Se liberará el stock reservado.')) {
    return;
  }

  try {
    await apiRequest(`/orders/${orderId}/cancel`, {
      method: 'POST'
    });

    showSuccess('Pedido cancelado exitosamente');
    closeModal('order-modal');
    loadOrders();
    loadDashboardData();
  } catch (error) {
    console.error('Error cancelling order:', error);
    showError(error.message || 'Error al cancelar el pedido');
  }
}

// ============================================================
// ALERTS
// ============================================================

async function loadAlerts() {
  try {
    const [lowStock, outOfStock] = await Promise.all([
      apiRequest('/inventory/low-stock?threshold=5'),
      apiRequest('/inventory/out-of-stock')
    ]);

    state.alerts.lowStock = lowStock.products || [];
    state.alerts.outOfStock = outOfStock.products || [];

    renderAlerts();
  } catch (error) {
    console.error('Error loading alerts:', error);
    showError('Error al cargar alertas');
  }
}

function renderAlerts() {
  // Low stock alerts
  const lowStockContainer = document.getElementById('low-stock-alerts');
  if (state.alerts.lowStock.length === 0) {
    lowStockContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">No hay productos con stock bajo</div></div>';
  } else {
    lowStockContainer.innerHTML = state.alerts.lowStock.map(product => `
      <div class="alert-item">
        <div class="alert-item-content">
          <div class="alert-item-title">${product.name}</div>
          <div class="alert-item-subtitle">Stock disponible: ${product.availableStock} unidades</div>
        </div>
        <span class="badge badge-warning">${product.availableStock}</span>
      </div>
    `).join('');
  }

  // Out of stock alerts
  const outOfStockContainer = document.getElementById('out-of-stock-alerts');
  if (state.alerts.outOfStock.length === 0) {
    outOfStockContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">No hay productos sin stock</div></div>';
  } else {
    outOfStockContainer.innerHTML = state.alerts.outOfStock.map(product => `
      <div class="alert-item critical">
        <div class="alert-item-content">
          <div class="alert-item-title">${product.name}</div>
          <div class="alert-item-subtitle">Sin stock disponible</div>
        </div>
        <span class="badge badge-danger">0</span>
      </div>
    `).join('');
  }
}

// ============================================================
// CATALOG
// ============================================================

async function loadCatalog() {
  try {
    const persona = document.getElementById('catalog-filter-persona')?.value || '';
    const tipo = document.getElementById('catalog-filter-tipo')?.value || '';
    
    let params = [];
    if (persona) params.push(`persona=${persona}`);
    if (tipo) params.push(`tipo=${tipo}`);
    
    const queryString = params.length ? `?${params.join('&')}` : '';
    
    const data = await apiRequest(`/catalog/products${queryString}`, { skipAuth: true });
    renderCatalog(data.products || []);
  } catch (error) {
    console.error('Error loading catalog:', error);
    showError('Error al cargar catálogo');
  }
}

function renderCatalog(products) {
  const grid = document.getElementById('catalog-grid');
  
  if (!products.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-text">No hay productos en el catálogo</div></div>';
    return;
  }

  grid.innerHTML = products.map(product => `
    <div class="catalog-card">
      <img src="${product.img || '../imagenes/placeholder.svg'}" 
           alt="${product.name}" 
           class="catalog-card-image"
           onerror="this.src='../imagenes/placeholder.svg'">
      <div class="catalog-card-body">
        <div class="catalog-card-title">${product.name}</div>
        <div class="catalog-card-meta">${product.persona} - ${product.tipo}</div>
        <div class="catalog-card-meta">Tallas: ${product.sizes || 'N/A'}</div>
        <div class="catalog-card-price">${product.price}</div>
        ${product.badge ? `<span class="badge badge-info mt-1">${product.badge}</span>` : ''}
      </div>
    </div>
  `).join('');
}

// ============================================================
// MODALS
// ============================================================

function showModal(modalId) {
  // Primero cerrar todos los modales abiertos
  const allModals = document.querySelectorAll('.modal');
  allModals.forEach(modal => {
    modal.style.display = 'none';
  });
  
  // Ahora abrir el modal solicitado
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById('modal-overlay').style.display = 'none';
  if (modalId) {
    document.getElementById(modalId).style.display = 'none';
  }
  // Cerrar todos los modales por si acaso
  const allModals = document.querySelectorAll('.modal');
  allModals.forEach(modal => {
    modal.style.display = 'none';
  });
}

// ============================================================
// UTILITIES
// ============================================================

function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '<tr><td colspan="10" class="text-center"><div class="loading"></div></td></tr>';
  }
}

function showError(message) {
  // You can implement a toast notification here
  alert(message);
}

function showSuccess(message) {
  // You can implement a toast notification here
  alert(message);
}

// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (checkAuth()) {
    loadCategoriesAndAudiences();
  }

  // Login form
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').style.display = 'none';
      submitBtn.querySelector('.btn-loader').style.display = 'inline';
      errorDiv.style.display = 'none';
      
      await login(email, password);
      showDashboard();
      loadCategoriesAndAudiences();
    } catch (error) {
      errorDiv.textContent = error.message || 'Error al iniciar sesión';
      errorDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').style.display = 'inline';
      submitBtn.querySelector('.btn-loader').style.display = 'none';
    }
  });

  // Logout button
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      if (view) {
        switchView(view);
      }
    });
  });

  // Refresh button
  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    loadViewData(state.currentView);
  });

  // Add product button
  document.getElementById('add-product-btn')?.addEventListener('click', () => {
    // Limpiar el formulario
    document.getElementById('product-form')?.reset();
    // Abrir el modal
    showModal('product-modal');
  });

  // Create product form submission
  document.getElementById('product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await createNewProduct();
  });

  // Filters
  document.getElementById('inventory-filter-type')?.addEventListener('change', loadInventory);
  document.getElementById('orders-filter-status')?.addEventListener('change', loadOrders);
  document.getElementById('catalog-filter-persona')?.addEventListener('change', loadCatalog);
  document.getElementById('catalog-filter-tipo')?.addEventListener('change', loadCatalog);

  // Products search
  document.getElementById('products-search')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    filterProducts(searchTerm);
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = btn.dataset.modal;
      if (modalId) {
        closeModal(modalId);
      }
    });
  });

  // Close modal on overlay click
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') {
      document.getElementById('modal-overlay').style.display = 'none';
      // Cerrar todos los modales
      const allModals = document.querySelectorAll('.modal');
      allModals.forEach(modal => {
        modal.style.display = 'none';
      });
    }
  });
});

// ============================================================
// GLOBAL FUNCTIONS (for onclick handlers)
// ============================================================

window.viewProduct = async (productId) => {
  try {
    // Cargar datos del producto
    const data = await apiRequest(`/admin/products/${productId}`);
    const product = data.product;
    
    if (!product) {
      showError('Producto no encontrado');
      return;
    }
    
    // Calcular stock total
    const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockQty - v.reservedQty), 0) || 0;
    const totalReserved = product.variants?.reduce((sum, v) => sum + v.reservedQty, 0) || 0;
    
    // Generar HTML para las variantes
    const variantsHtml = product.variants?.length > 0 ? `
      <table class="data-table">
        <thead>
          <tr>
            <th>Talla</th>
            <th>Stock</th>
            <th>Reservado</th>
            <th>Disponible</th>
          </tr>
        </thead>
        <tbody>
          ${product.variants.map(v => `
            <tr>
              <td>${v.size?.code || '-'}</td>
              <td>${v.stockQty}</td>
              <td>${v.reservedQty}</td>
              <td><strong>${v.stockQty - v.reservedQty}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p>No hay variantes disponibles</p>';
    
    // Preparar la ruta de la imagen
    let imageUrl = null;
    let imageSrc = '';
    
    if (product.images?.[0]?.imageUrl) {
      const rawUrl = product.images[0].imageUrl;
      // Si la URL ya empieza con http:// o https://, usarla tal cual
      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        imageSrc = rawUrl;
      }
      // Si empieza con ../, usarla tal cual
      else if (rawUrl.startsWith('../')) {
        imageSrc = rawUrl;
      }
      // Si empieza con /, es absoluta desde la raíz
      else if (rawUrl.startsWith('/')) {
        imageSrc = rawUrl;
      }
      // Si no tiene prefijo, agregar ../
      else {
        imageSrc = `../${rawUrl}`;
      }
      imageUrl = true;
    }
    
    // Generar HTML del modal
    const modalBody = document.getElementById('view-product-modal-body');
    modalBody.innerHTML = `
      <div class="product-details">
        <div class="product-details-header">
          ${imageUrl ? `
            <img src="${imageSrc}" 
                 alt="${product.name}" 
                 class="product-details-image"
                 onerror="this.style.display='none'">
          ` : `
            <div class="product-details-image" style="background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
              📦
            </div>
          `}
          <div class="product-details-info">
            <h3>${product.name}</h3>
            ${product.sku ? `<p class="text-muted">SKU: ${product.sku}</p>` : ''}
            <p class="product-price">C$${product.basePrice || 0}</p>
            ${product.badge ? `<span class="badge badge-info">${product.badge}</span>` : ''}
            <span class="badge ${product.isActive ? 'badge-success' : 'badge-secondary'}">
              ${product.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
        
        ${product.description ? `
          <div class="form-group">
            <label>Descripción</label>
            <p>${product.description}</p>
          </div>
        ` : ''}
        
        <div class="form-row">
          <div class="form-group">
            <label>Categoría</label>
            <p><strong>${product.category?.label || '-'}</strong></p>
          </div>
          <div class="form-group">
            <label>Audiencia</label>
            <p><strong>${product.audience?.label || '-'}</strong></p>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Stock Total</label>
            <p class="text-primary"><strong>${totalStock}</strong> unidades</p>
          </div>
          <div class="form-group">
            <label>Stock Reservado</label>
            <p class="text-warning"><strong>${totalReserved}</strong> unidades</p>
          </div>
        </div>
        
        <div class="form-group">
          <label>Variantes por Talla</label>
          ${variantsHtml}
        </div>
        
        <div class="form-actions">
          <button class="btn btn-secondary" data-modal="view-product-modal">Cerrar</button>
          <button class="btn btn-primary" onclick="closeModal('view-product-modal'); editProduct(${product.id})">Editar Producto</button>
        </div>
      </div>
    `;
    
    // Mostrar el modal
    showModal('view-product-modal');
    
  } catch (error) {
    console.error('Error loading product details:', error);
    showError('Error al cargar los detalles del producto: ' + error.message);
  }
};

// ============================================================
// CREATE NEW PRODUCT FUNCTIONALITY
// ============================================================

async function createNewProduct() {
  try {
    const submitBtn = document.querySelector('#product-form button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';
    
    const name = document.getElementById('product-name').value.trim();
    const sku = document.getElementById('product-sku').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const categoryId = parseInt(document.getElementById('product-category').value);
    const audienceId = parseInt(document.getElementById('product-audience').value);
    const basePrice = parseFloat(document.getElementById('product-price').value);
    const badge = document.getElementById('product-badge').value.trim();
    const imageUrl = document.getElementById('product-image').value.trim();
    
    // Validaciones
    if (!name) {
      showError('El nombre es requerido');
      return;
    }
    
    if (!categoryId || !audienceId) {
      showError('Categoría y audiencia son requeridas');
      return;
    }
    
    if (!basePrice || basePrice <= 0) {
      showError('El precio debe ser mayor a 0');
      return;
    }
    
    // Preparar datos
    const productData = {
      name,
      description,
      categoryId,
      audienceId,
      basePrice,
      isActive: true
    };
    
    if (sku) productData.sku = sku;
    if (badge) productData.badge = badge;
    
    // Agregar imagen - Soporta número directo o ruta completa
    if (imageUrl) {
      // Si es solo un número, enviarlo como imageId
      if (/^\d+$/.test(imageUrl.trim())) {
        productData.imageId = imageUrl.trim();
      } else {
        // Si es una ruta completa, enviarla como array de imágenes
        productData.images = [{
          imageUrl: imageUrl,
          altText: name,
          sortOrder: 0
        }];
      }
    }
    
    // Enviar al backend
    const response = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    
    // Éxito
    showSuccess('Producto creado exitosamente');
    closeModal('product-modal');
    
    // Recargar lista de productos
    await loadProducts();
    
  } catch (error) {
    console.error('Error creating product:', error);
    showError(error.message || 'Error al crear producto');
  } finally {
    // Restaurar botón
    const submitBtn = document.querySelector('#product-form button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar Producto';
    }
  }
}

// ============================================================
// EDIT PRODUCT FUNCTIONALITY
// ============================================================

window.editProduct = async (productId) => {
  try {
    // Cargar datos del producto
    const data = await apiRequest(`/products/${productId}`);
    const product = data.product;
    
    if (!product) {
      showError('Producto no encontrado');
      return;
    }
    
    // Cargar categorías y audiencias en los selects de edición
    await loadEditModalSelects();
    
    // Llenar el formulario con los datos actuales
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name || '';
    document.getElementById('edit-product-sku').value = product.sku || '';
    document.getElementById('edit-product-description').value = product.description || '';
    document.getElementById('edit-product-category').value = product.categoryId || '';
    document.getElementById('edit-product-audience').value = product.audienceId || '';
    document.getElementById('edit-product-price').value = product.basePrice || 0;
    document.getElementById('edit-product-badge').value = product.badge || '';
    document.getElementById('edit-product-active').checked = product.isActive;
    
    // Mostrar el modal
    showModal('edit-product-modal');
    
  } catch (error) {
    console.error('Error loading product for edit:', error);
    showError('Error al cargar producto para edición: ' + error.message);
  }
};

async function loadEditModalSelects() {
  try {
    // Si ya están cargadas, no hacer nada
    if (state.categories.length === 0 || state.audiences.length === 0) {
      const [categoriesData, audiencesData] = await Promise.all([
        apiRequest('/catalog/categories', { skipAuth: true }),
        apiRequest('/catalog/audiences', { skipAuth: true })
      ]);
      
      state.categories = categoriesData.categories || [];
      state.audiences = audiencesData.audiences || [];
    }
    
    // Poblar los selects del modal de edición
    const categorySelect = document.getElementById('edit-product-category');
    const audienceSelect = document.getElementById('edit-product-audience');
    
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Seleccionar...</option>' +
        state.categories.map(cat => `<option value="${cat.id}">${cat.label}</option>`).join('');
    }
    
    if (audienceSelect) {
      audienceSelect.innerHTML = '<option value="">Seleccionar...</option>' +
        state.audiences.map(aud => `<option value="${aud.id}">${aud.label}</option>`).join('');
    }
  } catch (error) {
    console.error('Error loading selects:', error);
  }
}

// Event listener para el formulario de edición
document.addEventListener('DOMContentLoaded', () => {
  const editForm = document.getElementById('edit-product-form');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveProductChanges();
    });
  }
});

async function saveProductChanges() {
  try {
    const submitBtn = document.querySelector('#edit-product-form button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Mostrar loading
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    submitBtn.disabled = true;
    
    const productId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-product-name').value.trim();
    const sku = document.getElementById('edit-product-sku').value.trim();
    const description = document.getElementById('edit-product-description').value.trim();
    const categoryId = parseInt(document.getElementById('edit-product-category').value);
    const audienceId = parseInt(document.getElementById('edit-product-audience').value);
    const basePrice = parseFloat(document.getElementById('edit-product-price').value);
    const badge = document.getElementById('edit-product-badge').value.trim();
    const isActive = document.getElementById('edit-product-active').checked;
    
    // Validaciones
    if (!name) {
      showError('El nombre es requerido');
      return;
    }
    
    if (!categoryId || !audienceId) {
      showError('Categoría y audiencia son requeridas');
      return;
    }
    
    if (!basePrice || basePrice <= 0) {
      showError('El precio debe ser mayor a 0');
      return;
    }
    
    // Preparar datos
    const updateData = {
      name,
      description,
      categoryId,
      audienceId,
      basePrice,
      isActive
    };
    
    if (sku) updateData.sku = sku;
    if (badge) updateData.badge = badge;
    
    // Enviar al backend
    const response = await apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    
    // Éxito
    showSuccess('Producto actualizado exitosamente');
    closeModal('edit-product-modal');
    
    // Recargar lista de productos
    await loadProducts();
    
  } catch (error) {
    console.error('Error saving product:', error);
    showError(error.message || 'Error al guardar cambios');
  } finally {
    // Ocultar loading
    const submitBtn = document.querySelector('#edit-product-form button[type="submit"]');
    if (submitBtn) {
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoader = submitBtn.querySelector('.btn-loader');
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      submitBtn.disabled = false;
    }
  }
}

window.viewOrder = viewOrder;
window.confirmOrder = confirmOrder;
window.cancelOrder = cancelOrder;

/**
 * Función para eliminar un producto
 */
window.deleteProduct = async (productId, productName) => {
  // Mostrar modal de confirmación
  const confirmDelete = confirm(
    `¿Estás seguro de que deseas ELIMINAR el producto "${productName}"?\n\n` +
    `⚠️ ATENCIÓN: Esta acción NO se puede deshacer.\n\n` +
    `Opciones:\n` +
    `- Haz clic en CANCELAR si prefieres DESACTIVAR el producto (recomendado)\n` +
    `- Haz clic en ACEPTAR para ELIMINAR PERMANENTEMENTE`
  );

  if (!confirmDelete) {
    // El usuario canceló
    return;
  }

  // Preguntar si quiere eliminación permanente o solo desactivar
  const hardDelete = confirm(
    `¿Deseas ELIMINAR PERMANENTEMENTE este producto?\n\n` +
    `- ACEPTAR = Eliminar permanentemente (no se puede recuperar)\n` +
    `- CANCELAR = Solo desactivar (se puede reactivar después)`
  );

  try {
    // Construir la URL con el parámetro hardDelete
    const endpoint = hardDelete 
      ? `/admin/products/${productId}?hardDelete=true`
      : `/admin/products/${productId}`;

    const result = await apiRequest(endpoint, {
      method: 'DELETE'
    });

    if (result.hasOrders) {
      // El producto tiene pedidos asociados
      showError(result.message);
      
      // Preguntar si quiere desactivarlo en su lugar
      const deactivate = confirm(
        'Este producto tiene pedidos asociados y no puede ser eliminado.\n\n' +
        '¿Deseas DESACTIVARLO en su lugar?'
      );
      
      if (deactivate) {
        await apiRequest(`/admin/products/${productId}`, {
          method: 'DELETE'
        });
        
        showSuccess('Producto desactivado exitosamente');
        await loadProducts();
      }
      return;
    }

    // Mostrar mensaje de éxito
    if (result.deleted) {
      showSuccess(`Producto "${productName}" eliminado permanentemente`);
    } else if (result.deactivated) {
      showSuccess(`Producto "${productName}" desactivado exitosamente`);
    }

    // Recargar la lista de productos
    await loadProducts();

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    showError(error.message || 'Error al eliminar el producto');
  }
};
