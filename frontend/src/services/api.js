const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Simple helper to make fetch/axios requests with authorization
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const adminToken = localStorage.getItem('adminToken');
  const studentToken = localStorage.getItem('studentToken');
  let token = adminToken;
  if (endpoint.startsWith('/students') || endpoint.startsWith('/reviews')) {
    token = studentToken || adminToken;
  }
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
    getFilters: async () => {
      const cached = localStorage.getItem('college_filters');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          // fallback to fetch if json invalid
        }
      }
      const data = await request('/colleges/filters');
      localStorage.setItem('college_filters', JSON.stringify(data));
      return data;
    },
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
    },
    importBranches: (collegesBranches) => request('/colleges/import-branches', {
      method: 'POST',
      body: { collegesBranches }
    })
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
  },
  
  students: {
    signup: (data) => request('/students/signup', {
      method: 'POST',
      body: data
    }),
    login: (data) => request('/students/login', {
      method: 'POST',
      body: data
    }),
    getMe: () => request('/students/me')
  },

  reviews: {
    submit: (data) => request('/reviews', {
      method: 'POST',
      body: data
    }),
    getByCollege: (collegeId) => request(`/reviews/college/${collegeId}`),
    getPending: () => request('/reviews/pending'),
    approve: (id) => request(`/reviews/${id}/approve`, {
      method: 'PUT'
    }),
    reject: (id) => request(`/reviews/${id}`, {
      method: 'DELETE'
    })
  }
};
