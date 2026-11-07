/**
 * Nexus Inventory — Animated Frontend Application Engine
 * 100% Client-Side State, Persistence, Animations & Auth
 */
(() => {
  const STORAGE_KEYS = {
    PRODUCTS: 'nexus_inventory_products_v1',
    USER: 'nexus_inventory_user_v1',
    USERS_DB: 'nexus_inventory_users_db_v1',
    THEME: 'nexus_inventory_theme_v1'
  };

  const CATEGORY_COLORS = {
    Peripherals: '#6366f1',
    Displays: '#06b6d4',
    Audio: '#8b5cf6',
    Accessories: '#10b981',
    Workspace: '#f59e0b'
  };

  const DEFAULT_PRODUCTS = [
    { id: 101, sku: 'NX-KB90', name: 'Chronos Wireless Mechanical Keyboard', category: 'Peripherals', price: 169.00, quantity: 28 },
    { id: 102, sku: 'NX-MS42', name: 'Aether Pro 8K Magnesium Mouse', category: 'Peripherals', price: 119.50, quantity: 42 },
    { id: 103, sku: 'NX-DP38', name: 'Studio UltraWide 38" Mini-LED Monitor', category: 'Displays', price: 899.00, quantity: 9 },
    { id: 104, sku: 'NX-AU77', name: 'Vortex Planar Magnetic Headphones', category: 'Audio', price: 349.00, quantity: 16 },
    { id: 105, sku: 'NX-AC15', name: 'Thunderbolt 5 Aluminum Dock 14-in-1', category: 'Accessories', price: 219.99, quantity: 4 },
    { id: 106, sku: 'NX-WS20', name: 'Motorized Dual-Stage Standing Desk', category: 'Workspace', price: 649.00, quantity: 11 },
    { id: 107, sku: 'NX-AU19', name: 'Cardioid Studio Condenser Microphone', category: 'Audio', price: 149.95, quantity: 3 },
    { id: 108, sku: 'NX-WS08', name: 'Articulated Pneumatic Monitor Arm', category: 'Workspace', price: 89.00, quantity: 35 }
  ];

  const state = {
    products: [],
    user: null,
    search: '',
    category: 'All',
    sortBy: 'newest',
    viewMode: 'table', // 'table' | 'grid'
    authTab: 'login',
    deleteTargetId: null
  };

  // DOM Cache
  const el = {
    themeToggle: document.getElementById('themeToggle'),
    userStatusArea: document.getElementById('userStatusArea'),
    statTotalProducts: document.getElementById('statTotalProducts'),
    statTotalUnits: document.getElementById('statTotalUnits'),
    statTotalValue: document.getElementById('statTotalValue'),
    statLowStock: document.getElementById('statLowStock'),
    distributionBar: document.getElementById('distributionBar'),
    categoryLegend: document.getElementById('categoryLegend'),
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    sortSelect: document.getElementById('sortSelect'),
    categoryFilterPills: document.getElementById('categoryFilterPills'),
    btnViewTable: document.getElementById('btnViewTable'),
    btnViewGrid: document.getElementById('btnViewGrid'),
    tableViewContainer: document.getElementById('tableViewContainer'),
    gridViewContainer: document.getElementById('gridViewContainer'),
    productTableBody: document.getElementById('productTableBody'),
    emptyState: document.getElementById('emptyState'),
    productModal: document.getElementById('productModal'),
    productModalTitle: document.getElementById('productModalTitle'),
    productForm: document.getElementById('productForm'),
    productId: document.getElementById('productId'),
    productName: document.getElementById('productName'),
    productCategory: document.getElementById('productCategory'),
    productSku: document.getElementById('productSku'),
    productPrice: document.getElementById('productPrice'),
    productQuantity: document.getElementById('productQuantity'),
    errName: document.getElementById('errName'),
    errPrice: document.getElementById('errPrice'),
    errQty: document.getElementById('errQty'),
    deleteModal: document.getElementById('deleteModal'),
    deleteProductName: document.getElementById('deleteProductName'),
    authModal: document.getElementById('authModal'),
    authModalTitle: document.getElementById('authModalTitle'),
    authForm: document.getElementById('authForm'),
    authNameGroup: document.getElementById('authNameGroup'),
    authName: document.getElementById('authName'),
    authEmail: document.getElementById('authEmail'),
    authPassword: document.getElementById('authPassword'),
    errAuth: document.getElementById('errAuth'),
    btnAuthSubmit: document.getElementById('btnAuthSubmit'),
    toastStack: document.getElementById('toastStack')
  };

  /* ==========================================================================
     Utilities & Formatting
     ========================================================================== */

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val || 0);
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.textContent = message;
    el.toastStack.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(25px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /* ==========================================================================
     Storage & Initialization
     ========================================================================== */

  function loadStorage() {
    // Theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Products
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      state.products = raw ? JSON.parse(raw) : [...DEFAULT_PRODUCTS];
      if (!raw) saveProducts();
    } catch {
      state.products = [...DEFAULT_PRODUCTS];
    }

    // User
    try {
      const userRaw = localStorage.getItem(STORAGE_KEYS.USER);
      state.user = userRaw ? JSON.parse(userRaw) : { name: 'Demo Designer', email: 'demo@nexus.io' };
    } catch {
      state.user = { name: 'Demo Designer', email: 'demo@nexus.io' };
    }
  }

  function saveProducts() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(state.products));
  }

  /* ==========================================================================
     Render Analytics, Distribution & KPI Counters
     ========================================================================== */

  function renderAnalytics() {
    const totalProducts = state.products.length;
    const totalUnits = state.products.reduce((acc, p) => acc + Number(p.quantity), 0);
    const totalValue = state.products.reduce((acc, p) => acc + (Number(p.price) * Number(p.quantity)), 0);
    const lowStock = state.products.filter(p => Number(p.quantity) <= 5).length;

    el.statTotalProducts.textContent = totalProducts.toLocaleString();
    el.statTotalUnits.textContent = totalUnits.toLocaleString();
    el.statTotalValue.textContent = formatCurrency(totalValue);
    el.statLowStock.textContent = lowStock.toLocaleString();

    // Category Breakdown Bar
    const catTotals = {};
    state.products.forEach(p => {
      const val = Number(p.price) * Number(p.quantity);
      catTotals[p.category] = (catTotals[p.category] || 0) + val;
    });

    el.distributionBar.innerHTML = '';
    el.categoryLegend.innerHTML = '';

    const entries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0 || totalValue === 0) {
      el.distributionBar.innerHTML = `<div class="dist-segment" style="width:100%; background: var(--border-subtle)"></div>`;
      return;
    }

    entries.forEach(([cat, val]) => {
      const pct = Math.max(4, Math.round((val / totalValue) * 100));
      const color = CATEGORY_COLORS[cat] || '#6366f1';

      const seg = document.createElement('div');
      seg.className = 'dist-segment';
      seg.style.width = `${pct}%`;
      seg.style.backgroundColor = color;
      seg.title = `${cat}: ${formatCurrency(val)} (${pct}%)`;
      el.distributionBar.appendChild(seg);

      const leg = document.createElement('span');
      leg.className = 'legend-item';
      leg.innerHTML = `<span class="legend-color" style="background:${color}"></span>${escapeHtml(cat)} (${pct}%)`;
      el.categoryLegend.appendChild(leg);
    });
  }

  /* ==========================================================================
     Filter, Sort & Render Products
     ========================================================================== */

  function getFilteredProducts() {
    let list = [...state.products];

    if (state.category !== 'All') {
      list = list.filter(p => p.category === state.category);
    }

    if (state.search.trim() !== '') {
      const q = state.search.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      switch (state.sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-desc': return b.price - a.price;
        case 'price-asc': return a.price - b.price;
        case 'qty-desc': return b.quantity - a.quantity;
        case 'qty-asc': return a.quantity - b.quantity;
        default: return b.id - a.id;
      }
    });

    return list;
  }

  function getStockBadge(qty) {
    if (qty === 0) {
      return `<span class="stock-badge stock-out">Out of Stock</span>`;
    }
    if (qty <= 5) {
      return `<span class="stock-badge stock-low">Low: ${qty} units</span>`;
    }
    return `<span class="stock-badge stock-in">${qty} in stock</span>`;
  }

  function renderWorkspace() {
    renderAnalytics();
    const filtered = getFilteredProducts();

    if (filtered.length === 0) {
      el.tableViewContainer.classList.add('hidden');
      el.gridViewContainer.classList.add('hidden');
      el.emptyState.classList.remove('hidden');
      return;
    }

    el.emptyState.classList.add('hidden');

    if (state.viewMode === 'table') {
      el.tableViewContainer.classList.remove('hidden');
      el.gridViewContainer.classList.add('hidden');
      renderTable(filtered);
    } else {
      el.tableViewContainer.classList.add('hidden');
      el.gridViewContainer.classList.remove('hidden');
      renderGrid(filtered);
    }
  }

  function renderTable(items) {
    el.productTableBody.innerHTML = '';
    items.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = `${Math.min(idx * 0.035, 0.35)}s`;
      const color = CATEGORY_COLORS[p.category] || '#6366f1';
      const totalVal = p.price * p.quantity;

      tr.innerHTML = `
        <td><span class="sku-code">${escapeHtml(p.sku || `#${p.id}`)}</span></td>
        <td>
          <div class="product-cell">
            <span class="product-dot" style="background:${color}; box-shadow: 0 0 8px ${color}"></span>
            <span class="product-name-text">${escapeHtml(p.name)}</span>
          </div>
        </td>
        <td><span class="category-tag">${escapeHtml(p.category)}</span></td>
        <td class="mono-num">${formatCurrency(p.price)}</td>
        <td>${getStockBadge(p.quantity)}</td>
        <td class="mono-num">${formatCurrency(totalVal)}</td>
        <td class="text-right">
          <div class="action-group">
            <button class="action-btn edit" data-id="${p.id}" title="Edit Product">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete" data-id="${p.id}" title="Delete Product">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      `;
      el.productTableBody.appendChild(tr);
    });
  }

  function renderGrid(items) {
    el.gridViewContainer.innerHTML = '';
    items.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style.animationDelay = `${Math.min(idx * 0.04, 0.35)}s`;
      const totalVal = p.price * p.quantity;

      card.innerHTML = `
        <div>
          <div class="card-top">
            <span class="sku-code">${escapeHtml(p.sku || `#${p.id}`)}</span>
            <span class="category-tag">${escapeHtml(p.category)}</span>
          </div>
          <h4 class="card-title">${escapeHtml(p.name)}</h4>
          ${getStockBadge(p.quantity)}
        </div>

        <div class="card-metrics">
          <div>
            <span class="card-metric-label">Unit Price</span>
            <span class="card-metric-val">${formatCurrency(p.price)}</span>
          </div>
          <div>
            <span class="card-metric-label">Total Value</span>
            <span class="card-metric-val">${formatCurrency(totalVal)}</span>
          </div>
        </div>

        <div class="card-bottom">
          <span class="text-subtle">ID #${p.id}</span>
          <div class="action-group">
            <button class="action-btn edit" data-id="${p.id}" title="Edit Product">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete" data-id="${p.id}" title="Delete Product">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      el.gridViewContainer.appendChild(card);
    });
  }

  /* ==========================================================================
     User Profile & Auth Rendering
     ========================================================================== */

  function renderUserStatus() {
    if (state.user) {
      const initial = state.user.name ? state.user.name.charAt(0).toUpperCase() : 'U';
      el.userStatusArea.innerHTML = `
        <div class="user-pill">
          <span class="user-avatar-sm">${escapeHtml(initial)}</span>
          <span class="user-label">${escapeHtml(state.user.name)}</span>
          <button id="btnSignOut" class="btn-logout-mini" title="Switch or Sign Out">Sign Out</button>
        </div>
      `;
      document.getElementById('btnSignOut').addEventListener('click', () => {
        state.user = null;
        localStorage.removeItem(STORAGE_KEYS.USER);
        renderUserStatus();
        showToast('Signed out of session.', 'info');
      });
    } else {
      el.userStatusArea.innerHTML = `
        <button id="btnOpenAuth" class="btn btn-glow btn-sm">Sign In</button>
      `;
      document.getElementById('btnOpenAuth').addEventListener('click', () => {
        openAuthModal('login');
      });
    }
  }

  function openAuthModal(tab = 'login') {
    state.authTab = tab;
    el.errAuth.textContent = '';
    el.authForm.reset();

    document.querySelectorAll('.auth-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'register') {
      el.authModalTitle.textContent = 'Create Studio Account';
      el.authNameGroup.classList.remove('hidden');
      el.btnAuthSubmit.textContent = 'Create Account';
    } else {
      el.authModalTitle.textContent = 'Welcome Back';
      el.authNameGroup.classList.add('hidden');
      el.btnAuthSubmit.textContent = 'Sign In to Workspace';
    }

    el.authModal.classList.remove('hidden');
  }

  /* ==========================================================================
     Product Modals (Add, Edit, Delete)
     ========================================================================== */

  function openProductModal(product = null) {
    el.errName.textContent = '';
    el.errPrice.textContent = '';
    el.errQty.textContent = '';
    el.productForm.reset();

    if (product) {
      el.productModalTitle.textContent = 'Edit Product';
      el.productId.value = product.id;
      el.productName.value = product.name;
      el.productCategory.value = product.category || 'Peripherals';
      el.productSku.value = product.sku || '';
      el.productPrice.value = product.price;
      el.productQuantity.value = product.quantity;
    } else {
      el.productModalTitle.textContent = 'Add New Product';
      el.productId.value = '';
    }

    el.productModal.classList.remove('hidden');
    setTimeout(() => el.productName.focus(), 50);
  }

  function closeProductModal() {
    el.productModal.classList.add('hidden');
  }

  function openDeleteModal(product) {
    state.deleteTargetId = product.id;
    el.deleteProductName.textContent = `"${product.name}"`;
    el.deleteModal.classList.remove('hidden');
  }

  function closeDeleteModal() {
    state.deleteTargetId = null;
    el.deleteModal.classList.add('hidden');
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */

  function bindEvents() {
    // Theme Toggle
    el.themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEYS.THEME, next);
    });

    // Open Add Modal buttons
    document.getElementById('btnOpenAddModal').addEventListener('click', () => openProductModal());
    document.getElementById('btnHeroAdd').addEventListener('click', () => openProductModal());
    document.getElementById('btnEmptyAdd').addEventListener('click', () => openProductModal());

    // Close Product Modal
    document.getElementById('btnCloseProductModal').addEventListener('click', closeProductModal);
    document.getElementById('btnCancelProduct').addEventListener('click', closeProductModal);

    // Save Product Submit
    el.productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      el.errName.textContent = '';
      el.errPrice.textContent = '';
      el.errQty.textContent = '';

      const name = el.productName.value.trim();
      const category = el.productCategory.value;
      const skuInput = el.productSku.value.trim();
      const price = parseFloat(el.productPrice.value);
      const quantity = parseInt(el.productQuantity.value, 10);

      let valid = true;
      if (!name) {
        el.errName.textContent = 'Product name is required.';
        valid = false;
      }
      if (isNaN(price) || price < 0) {
        el.errPrice.textContent = 'Enter a valid price (≥ 0).';
        valid = false;
      }
      if (isNaN(quantity) || quantity < 0) {
        el.errQty.textContent = 'Enter a valid stock integer (≥ 0).';
        valid = false;
      }
      if (!valid) return;

      const existingId = el.productId.value ? Number(el.productId.value) : null;

      if (existingId) {
        const idx = state.products.findIndex(p => p.id === existingId);
        if (idx !== -1) {
          state.products[idx] = {
            ...state.products[idx],
            name,
            category,
            sku: skuInput || state.products[idx].sku,
            price: Number(price.toFixed(2)),
            quantity
          };
          showToast(`Updated "${name}"`, 'success');
        }
      } else {
        const newId = state.products.reduce((max, p) => Math.max(max, p.id), 100) + 1;
        const autoSku = skuInput || `NX-${category.slice(0, 2).toUpperCase()}${newId}`;
        state.products.unshift({
          id: newId,
          sku: autoSku,
          name,
          category,
          price: Number(price.toFixed(2)),
          quantity
        });
        showToast(`Added "${name}" to catalog`, 'success');
      }

      saveProducts();
      renderWorkspace();
      closeProductModal();
    });

    // Delegated Edit / Delete clicks for Table and Grid
    const handleItemAction = (e) => {
      const editBtn = e.target.closest('.action-btn.edit');
      const delBtn = e.target.closest('.action-btn.delete');

      if (editBtn) {
        const prod = state.products.find(p => p.id === Number(editBtn.dataset.id));
        if (prod) openProductModal(prod);
      } else if (delBtn) {
        const prod = state.products.find(p => p.id === Number(delBtn.dataset.id));
        if (prod) openDeleteModal(prod);
      }
    };

    el.productTableBody.addEventListener('click', handleItemAction);
    el.gridViewContainer.addEventListener('click', handleItemAction);

    // Delete Modal Actions
    document.getElementById('btnCloseDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('btnCancelDelete').addEventListener('click', closeDeleteModal);
    document.getElementById('btnConfirmDelete').addEventListener('click', () => {
      if (state.deleteTargetId !== null) {
        const target = state.products.find(p => p.id === state.deleteTargetId);
        state.products = state.products.filter(p => p.id !== state.deleteTargetId);
        saveProducts();
        renderWorkspace();
        closeDeleteModal();
        showToast(`Removed "${target?.name || 'item'}"`, 'info');
      }
    });

    // Search Input
    el.searchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      el.btnClearSearch.classList.toggle('hidden', !state.search.trim());
      renderWorkspace();
    });

    el.btnClearSearch.addEventListener('click', () => {
      state.search = '';
      el.searchInput.value = '';
      el.btnClearSearch.classList.add('hidden');
      renderWorkspace();
    });

    // Sort Select
    el.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderWorkspace();
    });

    // Category Pills
    el.categoryFilterPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      state.category = pill.dataset.category;
      document.querySelectorAll('#categoryFilterPills .pill').forEach(p => {
        p.classList.toggle('active', p === pill);
      });
      renderWorkspace();
    });

    // View Mode Switcher
    el.btnViewTable.addEventListener('click', () => {
      state.viewMode = 'table';
      el.btnViewTable.classList.add('active');
      el.btnViewGrid.classList.remove('active');
      renderWorkspace();
    });

    el.btnViewGrid.addEventListener('click', () => {
      state.viewMode = 'grid';
      el.btnViewGrid.classList.add('active');
      el.btnViewTable.classList.remove('active');
      renderWorkspace();
    });

    // Reset Demo Data
    document.getElementById('btnResetDemo').addEventListener('click', () => {
      state.products = [...DEFAULT_PRODUCTS];
      saveProducts();
      renderWorkspace();
      showToast('Restored default studio catalog!', 'success');
    });

    // Export CSV
    document.getElementById('btnExportCsv').addEventListener('click', () => {
      if (state.products.length === 0) {
        showToast('No products to export.', 'error');
        return;
      }
      const headers = ['ID', 'SKU', 'Name', 'Category', 'Price', 'Quantity', 'Total Value'];
      const rows = state.products.map(p => [
        p.id,
        `"${(p.sku || '').replace(/"/g, '""')}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        p.price.toFixed(2),
        p.quantity,
        (p.price * p.quantity).toFixed(2)
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported CSV spreadsheet!', 'success');
    });

    // Auth Modal Events
    document.getElementById('btnCloseAuthModal').addEventListener('click', () => {
      el.authModal.classList.add('hidden');
    });

    document.querySelectorAll('.auth-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => openAuthModal(tabBtn.dataset.tab));
    });

    document.getElementById('btnQuickDemo').addEventListener('click', () => {
      openAuthModal('login');
      el.authEmail.value = 'demo@nexus.io';
      el.authPassword.value = 'Password123!';
    });

    el.authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = el.authEmail.value.trim();
      const password = el.authPassword.value;
      const name = el.authName.value.trim();

      if (!email || !password) {
        el.errAuth.textContent = 'Please enter both email and password.';
        return;
      }

      const displayName = state.authTab === 'register' && name
        ? name
        : email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      state.user = { name: displayName, email };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      renderUserStatus();
      el.authModal.classList.add('hidden');
      showToast(`Welcome, ${displayName}!`, 'success');
    });

    // Escape key closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProductModal();
        closeDeleteModal();
        el.authModal.classList.add('hidden');
      }
    });
  }

  /* ==========================================================================
     Boot
     ========================================================================== */

  function init() {
    loadStorage();
    renderUserStatus();
    bindEvents();
    renderWorkspace();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
