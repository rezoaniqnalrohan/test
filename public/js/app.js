/**
 * Product Manager Application Core
 * Connects User Events, UI, and API
 */
(() => {
  // Application State
  const state = {
    products: [],
    searchQuery: '',
    sortBy: 'id',
    sortOrder: 'DESC',
    isSubmitting: false
  };

  /**
   * Debounce helper for live search
   */
  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * Fetch and reload products & stats
   */
  async function loadData() {
    UI.setLoading(true);
    try {
      const [productsRes, statsRes] = await Promise.all([
        API.getProducts({
          search: state.searchQuery,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder
        }),
        API.getStats()
      ]);

      state.products = productsRes.data || [];
      UI.renderProducts(state.products);
      UI.renderStats(statsRes.data);

      UI.setEmpty(state.products.length === 0, state.searchQuery);
    } catch (error) {
      console.error('[Load Error]', error);
      UI.showToast(error.message || 'Failed to load products.', 'error');
      UI.setEmpty(true, state.searchQuery);
    } finally {
      UI.setLoading(false);
    }
  }

  /**
   * Handle Add / Edit Form Submission
   */
  async function handleProductFormSubmit(e) {
    e.preventDefault();

    if (state.isSubmitting) return;

    const id = UI.elements.productId.value;
    const name = UI.elements.productName.value.trim();
    const priceStr = UI.elements.productPrice.value;
    const quantityStr = UI.elements.productQuantity.value;

    // Client-side quick validation
    const clientErrors = [];
    if (!name) {
      clientErrors.push({ field: 'name', message: 'Product name is required.' });
    }
    if (priceStr === '' || isNaN(Number(priceStr)) || Number(priceStr) < 0) {
      clientErrors.push({ field: 'price', message: 'Enter a valid non-negative price.' });
    }
    if (quantityStr === '' || isNaN(Number(quantityStr)) || !Number.isInteger(Number(quantityStr)) || Number(quantityStr) < 0) {
      clientErrors.push({ field: 'quantity', message: 'Enter a valid non-negative integer quantity.' });
    }

    if (clientErrors.length > 0) {
      UI.showFormErrors(clientErrors);
      return;
    }

    const payload = {
      name,
      price: parseFloat(Number(priceStr).toFixed(2)),
      quantity: parseInt(quantityStr, 10)
    };

    const submitBtn = UI.elements.btnSaveProduct;
    const originalText = submitBtn.querySelector('.btn-text').textContent;

    try {
      state.isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Saving...';

      if (id) {
        // Edit existing product
        await API.updateProduct(id, payload);
        UI.showToast(`Product "${name}" updated successfully.`, 'success');
      } else {
        // Create new product
        await API.createProduct(payload);
        UI.showToast(`Product "${name}" added successfully.`, 'success');
      }

      UI.closeProductModal();
      await loadData();
    } catch (error) {
      if (error.errors && error.errors.length > 0) {
        UI.showFormErrors(error.errors);
      } else {
        UI.showToast(error.message || 'Failed to save product.', 'error');
      }
    } finally {
      state.isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = originalText;
    }
  }

  /**
   * Handle Delete Confirmation
   */
  async function handleConfirmDelete() {
    const id = UI.elements.btnConfirmDelete.dataset.id;
    if (!id || state.isSubmitting) return;

    const confirmBtn = UI.elements.btnConfirmDelete;
    const originalText = confirmBtn.querySelector('.btn-text').textContent;

    try {
      state.isSubmitting = true;
      confirmBtn.disabled = true;
      confirmBtn.querySelector('.btn-text').textContent = 'Deleting...';

      await API.deleteProduct(id);
      UI.showToast('Product deleted successfully.', 'success');
      UI.closeDeleteModal();
      await loadData();
    } catch (error) {
      UI.showToast(error.message || 'Failed to delete product.', 'error');
    } finally {
      state.isSubmitting = false;
      confirmBtn.disabled = false;
      confirmBtn.querySelector('.btn-text').textContent = originalText;
    }
  }

  /**
   * Export product list as CSV
   */
  function exportToCSV() {
    if (!state.products || state.products.length === 0) {
      UI.showToast('No products available to export.', 'error');
      return;
    }

    const headers = ['ID', 'Name', 'Price', 'Quantity', 'Total Value', 'Created At'];
    const rows = state.products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.price.toFixed(2),
      p.quantity,
      (p.price * p.quantity).toFixed(2),
      p.created_at || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    UI.showToast('Products exported to CSV successfully.', 'info');
  }

  /**
   * Bind all DOM Event Listeners
   */
  function bindEvents() {
    // Open Add Modal
    document.getElementById('btnOpenAddModal').addEventListener('click', () => {
      UI.openProductModal('add');
    });

    // Empty state Add button
    document.getElementById('btnEmptyAdd').addEventListener('click', () => {
      UI.openProductModal('add');
    });

    // Close Modals
    document.getElementById('btnCloseModal').addEventListener('click', () => UI.closeProductModal());
    document.getElementById('btnCancelModal').addEventListener('click', () => UI.closeProductModal());
    document.getElementById('btnCloseDeleteModal').addEventListener('click', () => UI.closeDeleteModal());
    document.getElementById('btnCancelDelete').addEventListener('click', () => UI.closeDeleteModal());

    // Close on backdrop click
    UI.elements.productModal.addEventListener('click', (e) => {
      if (e.target === UI.elements.productModal) UI.closeProductModal();
    });
    UI.elements.deleteModal.addEventListener('click', (e) => {
      if (e.target === UI.elements.deleteModal) UI.closeDeleteModal();
    });

    // Keyboard ESC key to close modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!UI.elements.productModal.classList.contains('hidden')) UI.closeProductModal();
        if (!UI.elements.deleteModal.classList.contains('hidden')) UI.closeDeleteModal();
      }
    });

    // Form Submit
    UI.elements.productForm.addEventListener('submit', handleProductFormSubmit);

    // Delete Confirm
    UI.elements.btnConfirmDelete.addEventListener('click', handleConfirmDelete);

    // Table Actions (Edit & Delete delegation)
    UI.elements.tableBody.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.edit-action');
      const deleteBtn = e.target.closest('.delete-action');

      if (editBtn) {
        const id = editBtn.dataset.id;
        const product = state.products.find(p => p.id == id);
        if (product) {
          UI.openProductModal('edit', product);
        } else {
          try {
            const res = await API.getProduct(id);
            UI.openProductModal('edit', res.data);
          } catch (err) {
            UI.showToast('Failed to fetch product details.', 'error');
          }
        }
      } else if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const product = state.products.find(p => p.id == id);
        if (product) {
          UI.openDeleteModal(product);
        }
      }
    });

    // Live Search with Debounce
    const handleSearch = debounce((query) => {
      state.searchQuery = query.trim();
      loadData();
    }, 300);

    UI.elements.searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.trim()) {
        UI.elements.btnClearSearch.classList.remove('hidden');
      } else {
        UI.elements.btnClearSearch.classList.add('hidden');
      }
      handleSearch(val);
    });

    // Clear Search Button
    UI.elements.btnClearSearch.addEventListener('click', () => {
      UI.elements.searchInput.value = '';
      UI.elements.btnClearSearch.classList.add('hidden');
      state.searchQuery = '';
      loadData();
      UI.elements.searchInput.focus();
    });

    // Sorting Dropdown
    UI.elements.sortBySelect.addEventListener('change', (e) => {
      const [field, order] = e.target.value.split('-');
      state.sortBy = field;
      state.sortOrder = order.toUpperCase();
      loadData();
    });

    // Export CSV
    document.getElementById('btnExportCsv').addEventListener('click', exportToCSV);

    // Refresh Button
    document.getElementById('btnRefresh').addEventListener('click', () => {
      loadData();
      UI.showToast('Data refreshed.', 'info', 2000);
    });

    // Logout Button
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        API.logout();
      });
    }
  }

  /**
   * Display User Details
   */
  async function initUser() {
    let user = API.getUser();
    if (!user) {
      try {
        const res = await API.getMe();
        user = res.user;
        localStorage.setItem('user', JSON.stringify(user));
      } catch {
        API.logout();
        return;
      }
    }

    if (user) {
      const userNameEl = document.getElementById('userName');
      const userEmailEl = document.getElementById('userEmail');
      const userAvatarEl = document.getElementById('userAvatar');
      if (userNameEl) userNameEl.textContent = user.name;
      if (userEmailEl) userEmailEl.textContent = user.email;
      if (userAvatarEl) userAvatarEl.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    }
  }

  /**
   * Application Initialization
   */
  async function init() {
    await initUser();
    bindEvents();
    loadData();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
