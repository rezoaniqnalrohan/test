/**
 * Product Manager UI Controller
 * Manages DOM updates, modals, rendering, formatting, and toasts
 */
const UI = {
  // DOM Elements cache
  elements: {
    tableBody: document.getElementById('productsTableBody'),
    tableLoading: document.getElementById('tableLoading'),
    tableEmpty: document.getElementById('tableEmpty'),
    emptyTitle: document.getElementById('emptyTitle'),
    emptySubtitle: document.getElementById('emptySubtitle'),
    
    // Stats
    statTotalProducts: document.getElementById('statTotalProducts'),
    statTotalUnits: document.getElementById('statTotalUnits'),
    statTotalValue: document.getElementById('statTotalValue'),
    statLowStock: document.getElementById('statLowStock'),
    
    // Product Modal
    productModal: document.getElementById('productModal'),
    modalTitle: document.getElementById('modalTitle'),
    productForm: document.getElementById('productForm'),
    productId: document.getElementById('productId'),
    productName: document.getElementById('productName'),
    productPrice: document.getElementById('productPrice'),
    productQuantity: document.getElementById('productQuantity'),
    btnSaveProduct: document.getElementById('btnSaveProduct'),
    errorName: document.getElementById('errorName'),
    errorPrice: document.getElementById('errorPrice'),
    errorQuantity: document.getElementById('errorQuantity'),

    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteProductName: document.getElementById('deleteProductName'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete'),

    // Search & Filter
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    sortBySelect: document.getElementById('sortBySelect'),
    toastContainer: document.getElementById('toastContainer')
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Format number as currency USD
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  },

  /**
   * Render products into the table
   */
  renderProducts(products) {
    const { tableBody } = this.elements;
    tableBody.innerHTML = '';

    if (!products || products.length === 0) {
      return;
    }

    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
      const tr = document.createElement('tr');
      tr.dataset.id = product.id;

      // Stock status badge
      let badgeHtml = '';
      if (product.quantity === 0) {
        badgeHtml = `<span class="badge badge-out-of-stock">Out of Stock</span>`;
      } else if (product.quantity <= 5) {
        badgeHtml = `<span class="badge badge-low-stock">Low: ${product.quantity}</span>`;
      } else {
        badgeHtml = `<span class="badge badge-in-stock">${product.quantity} in stock</span>`;
      }

      const totalValue = (product.price * product.quantity);

      tr.innerHTML = `
        <td class="col-id">#${product.id}</td>
        <td class="col-name">${this.escapeHtml(product.name)}</td>
        <td class="col-price">${this.formatCurrency(product.price)}</td>
        <td class="col-qty">${badgeHtml}</td>
        <td class="col-value">${this.formatCurrency(totalValue)}</td>
        <td class="col-actions">
          <div class="actions-cell">
            <button class="btn-action edit-action" data-id="${product.id}" title="Edit product">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-action delete-action" data-id="${product.id}" title="Delete product">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      `;

      fragment.appendChild(tr);
    });

    tableBody.appendChild(fragment);
  },

  /**
   * Render statistics cards
   */
  renderStats(stats) {
    if (!stats) return;
    this.elements.statTotalProducts.textContent = (stats.totalProducts || 0).toLocaleString();
    this.elements.statTotalUnits.textContent = (stats.totalQuantity || 0).toLocaleString();
    this.elements.statTotalValue.textContent = this.formatCurrency(stats.totalValue || 0);
    this.elements.statLowStock.textContent = (stats.lowStockCount || 0).toLocaleString();
  },

  /**
   * Toggle loading spinner on table
   */
  setLoading(isLoading) {
    if (isLoading) {
      this.elements.tableLoading.classList.remove('hidden');
      this.elements.tableEmpty.classList.add('hidden');
      this.elements.tableBody.innerHTML = '';
    } else {
      this.elements.tableLoading.classList.add('hidden');
    }
  },

  /**
   * Toggle empty state
   */
  setEmpty(isEmpty, search = '') {
    if (isEmpty) {
      this.elements.tableEmpty.classList.remove('hidden');
      if (search) {
        this.elements.emptyTitle.textContent = `No products matching "${search}"`;
        this.elements.emptySubtitle.textContent = 'Try adjusting your search terms or clearing the filter.';
      } else {
        this.elements.emptyTitle.textContent = 'No products found';
        this.elements.emptySubtitle.textContent = 'Get started by creating your first product.';
      }
    } else {
      this.elements.tableEmpty.classList.add('hidden');
    }
  },

  /**
   * Clear all form validation error messages
   */
  clearFormErrors() {
    this.elements.errorName.textContent = '';
    this.elements.errorPrice.textContent = '';
    this.elements.errorQuantity.textContent = '';
    this.elements.productName.classList.remove('input-error');
    this.elements.productPrice.classList.remove('input-error');
    this.elements.productQuantity.classList.remove('input-error');
  },

  /**
   * Show field errors returned from validator
   */
  showFormErrors(errors = []) {
    this.clearFormErrors();
    errors.forEach(err => {
      if (err.field === 'name') {
        this.elements.errorName.textContent = err.message;
        this.elements.productName.classList.add('input-error');
      } else if (err.field === 'price') {
        this.elements.errorPrice.textContent = err.message;
        this.elements.productPrice.classList.add('input-error');
      } else if (err.field === 'quantity') {
        this.elements.errorQuantity.textContent = err.message;
        this.elements.productQuantity.classList.add('input-error');
      }
    });
  },

  /**
   * Open Product Modal (Add or Edit)
   */
  openProductModal(mode = 'add', product = null) {
    this.clearFormErrors();
    this.elements.productForm.reset();

    if (mode === 'edit' && product) {
      this.elements.modalTitle.textContent = 'Edit Product';
      this.elements.productId.value = product.id;
      this.elements.productName.value = product.name;
      this.elements.productPrice.value = product.price;
      this.elements.productQuantity.value = product.quantity;
      this.elements.btnSaveProduct.querySelector('.btn-text').textContent = 'Update Product';
    } else {
      this.elements.modalTitle.textContent = 'Add New Product';
      this.elements.productId.value = '';
      this.elements.btnSaveProduct.querySelector('.btn-text').textContent = 'Save Product';
    }

    this.elements.productModal.classList.remove('hidden');
    setTimeout(() => this.elements.productName.focus(), 50);
  },

  /**
   * Close Product Modal
   */
  closeProductModal() {
    this.elements.productModal.classList.add('hidden');
    this.clearFormErrors();
    this.elements.productForm.reset();
  },

  /**
   * Open Delete Confirmation Modal
   */
  openDeleteModal(product) {
    this.elements.deleteProductName.textContent = `"${product.name}" (ID #${product.id})`;
    this.elements.btnConfirmDelete.dataset.id = product.id;
    this.elements.deleteModal.classList.remove('hidden');
  },

  /**
   * Close Delete Confirmation Modal
   */
  closeDeleteModal() {
    this.elements.deleteModal.classList.add('hidden');
    this.elements.btnConfirmDelete.dataset.id = '';
  },

  /**
   * Display modern toast notification
   */
  showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-message">${this.escapeHtml(message)}</div>
    `;

    this.elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};
