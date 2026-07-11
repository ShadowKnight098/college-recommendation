const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Simple helper to make fetch/axios requests with authorization
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const token = localStorage.getItem('adminToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };
  
  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }
  
  const response = await fetch(url, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
}

export const api = {
  auth: {
    login: (username, password) => request('/auth/login', {
      method: 'POST',
      body: { username, password }
    }),
    getStats: () => request('/auth/stats')
  },
  
  colleges: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
      ).toString();
      return request(`/colleges?${query}`);
    },
    getFilters: () => request('/colleges/filters'),
    getById: (id) => request(`/colleges/${id}`),
    create: (data) => request('/colleges', {
      method: 'POST',
      body: data
    }),
    update: (id, data) => request(`/colleges/${id}`, {
      method: 'PUT',
      body: data
    }),
    delete: (id) => request(`/colleges/${id}`, {
      method: 'DELETE'
    }),
    importCSV: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('adminToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/colleges/import`, {
        method: 'POST',
        headers,
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'CSV import failed');
      }
      return data;
    }
  },
  
  feedback: {
    submit: (data) => request('/feedback', {
      method: 'POST',
      body: data
    }),
    getAll: () => request('/feedback'),
    delete: (id) => request(`/feedback/${id}`, {
      method: 'DELETE'
    })
  }
};
