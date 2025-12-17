const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

const api = {
  async request(
    endpoint,
    method = 'GET',
    body = null,
    customHeaders = {}
  ) {
    // Try admin token first, then regular token
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('rideon_admin_token') || localStorage.getItem('rideon_token'))
      : null;
    const isFormData = body instanceof FormData;

    const headers = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...customHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
      credentials: 'include',
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || data.message || 'Something went wrong',
          status: response.status,
        };
      }

      return { success: true, data, message: data.message };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  // Helper methods for common HTTP methods
  get(endpoint, headers) {
    return this.request(endpoint, 'GET', null, headers);
  },

  post(endpoint, body, headers) {
    return this.request(endpoint, 'POST', body, headers);
  },

  put(endpoint, body, headers) {
    return this.request(endpoint, 'PUT', body, headers);
  },

  delete(endpoint, body, headers) {
    return this.request(endpoint, 'DELETE', body, headers);
  },

  patch(endpoint, body, headers) {
    return this.request(endpoint, 'PATCH', body, headers);
  },

  // Admin-specific API endpoints
  admin: {
    // Dashboard
    getDashboard() {
      return api.get('/api/admin/dashboard');
    },

    // Users
    getUsers(params = {}) {
      const query = new URLSearchParams(params).toString();
      return api.get(`/api/admin/users${query ? `?${query}` : ''}`);
    },
    toggleUserStatus(userId) {
      return api.put(`/api/admin/users/${userId}/toggle-status`);
    },

    // Drivers
    getDrivers(params = {}) {
      const query = new URLSearchParams(params).toString();
      return api.get(`/api/admin/drivers${query ? `?${query}` : ''}`);
    },
    getPendingDrivers() {
      return api.get('/api/admin/drivers/pending');
    },
    getDriver(driverId) {
      return api.get(`/api/admin/drivers/${driverId}`);
    },
    verifyDriver(driverId, data) {
      return api.put(`/api/admin/drivers/${driverId}/verify`, data);
    },
    updateDriverStatus(driverId, data) {
      return api.put(`/api/admin/drivers/${driverId}/status`, data);
    },

    // Riders
    getRiders(params = {}) {
      const query = new URLSearchParams(params).toString();
      return api.get(`/api/admin/riders${query ? `?${query}` : ''}`);
    },
    getRider(riderId) {
      return api.get(`/api/admin/riders/${riderId}`);
    },

    // Trips
    getTrips(params = {}) {
      const query = new URLSearchParams(params).toString();
      return api.get(`/api/admin/trips${query ? `?${query}` : ''}`);
    },

    // Promo Codes
    getPromoCodes() {
      return api.get('/api/admin/promo-codes');
    },
    createPromoCode(data) {
      return api.post('/api/admin/promo-codes', data);
    },
    updatePromoCode(promoId, data) {
      return api.put(`/api/admin/promo-codes/${promoId}`, data);
    },
    deletePromoCode(promoId) {
      return api.delete(`/api/admin/promo-codes/${promoId}`);
    },

    // Support Tickets
    getSupportTickets(params = {}) {
      const query = new URLSearchParams(params).toString();
      return api.get(`/api/admin/support-tickets${query ? `?${query}` : ''}`);
    },
    updateSupportTicket(ticketId, data) {
      return api.put(`/api/admin/support-tickets/${ticketId}`, data);
    },

    // Analytics
    getRevenueAnalytics(params = {}) {
      const query = new URLSearchParams(params).toString();
      return api.get(`/api/admin/analytics/revenue${query ? `?${query}` : ''}`);
    },
    getTripAnalytics(params = {}) {
      const query = new URLSearchParams(params).toString();
      return api.get(`/api/admin/analytics/trips${query ? `?${query}` : ''}`);
    },
  },
};

export default api;