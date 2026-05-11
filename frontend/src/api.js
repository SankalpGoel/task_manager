const API_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch(e) {}
    throw new Error(errorMsg);
  }
  
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    
    if (!response.ok) {
      let errorMsg = 'Login failed';
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
      } catch(e) {}
      throw new Error(errorMsg);
    }
    return response.json();
  },
  
  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getMe: () => request('/auth/me'),
  
  getDashboard: () => request('/dashboard'),
  
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProject: (id, data) => request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  addProjectMember: (projectId, userId) => request(`/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId })
  }),
  
  getTasks: (projectId = null) => {
    const query = projectId ? `?project_id=${projectId}` : '';
    return request(`/tasks${query}`);
  },
  createTask: (data) => request('/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTask: (id, data) => request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTask: (id) => request(`/tasks/${id}`, {
    method: 'DELETE'
  }),
  
  getUsers: () => request('/users'),
};
