/**
 * Product Manager API Client
 * Automatically attaches JWT Authorization token and handles authentication errors
 */
const API = {
  baseUrl: '/api',

  /**
   * Retrieve stored auth token
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Retrieve stored user info
   */
  getUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Set auth session
   */
  setSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Clear session and log out
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('/login.html');
  },

  /**
   * Core request wrapper
   */
  async request(endpoint = '', options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        // If unauthorized and not on login/register page, clear session and redirect
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
          this.logout();
        }
      }

      if (!response.ok) {
        const error = new Error(data?.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.errors = data?.errors || [];
        throw error;
      }

      return data;
    } catch (err) {
      if (!err.status) {
        console.error('[API Network Error]', err);
        const networkError = new Error('Network error. Unable to connect to server.');
        networkError.status = 0;
        throw networkError;
      }
      throw err;
    }
  },

  /* ================= Auth Endpoints ================= */

  async register({ name, email, password }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  async login({ email, password }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async getMe() {
    return this.request('/auth/me');
  },

  /* ================= Product Endpoints ================= */

  async getProducts({ search = '', sortBy = 'id', sortOrder = 'DESC' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/products${queryString}`);
  },

  async getProduct(id) {
    return this.request(`/products/${id}`);
  },

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  async getStats() {
    return this.request('/products/stats');
  }
};
