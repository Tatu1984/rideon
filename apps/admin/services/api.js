const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

const api = {
  async request(
    endpoint,
    method = 'GET',
    body = null,
    customHeaders = {}
  ) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rideon_token') : null;
    const isFormData = body instanceof FormData;
    
    const headers = {
      ...(!isFormData && { 'Content-Type': 'application/json' }), // Only set JSON content-type if not FormData
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
          error: data.message || 'Something went wrong',
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
};

export default api;