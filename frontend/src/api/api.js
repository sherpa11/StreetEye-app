import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('streeteye_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('streeteye_token');
      localStorage.removeItem('streeteye_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  citizenRegister: (data) => api.post('/auth/citizen/register', data),
  citizenLogin: (data) => api.post('/auth/citizen/login', data),
  contractorRegister: (data) => api.post('/auth/contractor/register', data),
  contractorLogin: (data) => api.post('/auth/contractor/login', data),
  authorityLogin: (data) => api.post('/auth/authority/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Complaints ───────────────────────────────────────────────────────────────
export const complaintsAPI = {
  create: (formData) => api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMy: () => api.get('/complaints/my'),
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  verify: (id, data) => api.post(`/complaints/${id}/verify`, data),
  reject: (id, data) => api.post(`/complaints/${id}/reject`, data),
  assign: (id, data) => api.post(`/complaints/${id}/assign`, data),
  startRepair: (id, formData) => api.post(`/complaints/${id}/start-repair`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  submitRectification: (id, formData) => api.post(`/complaints/${id}/submit-rectification`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  approveRectification: (id, data) => api.post(`/complaints/${id}/approve-rectification`, data),
  rejectRectification: (id, data) => api.post(`/complaints/${id}/reject-rectification`, data),
};

// ─── Contractors ──────────────────────────────────────────────────────────────
export const contractorsAPI = {
  getAll: () => api.get('/contractors'),
  getById: (id) => api.get(`/contractors/${id}`),
  getScore: (id) => api.get(`/contractors/${id}/score`),
  getAssignments: () => api.get('/contractors/assignments'),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsAPI = {
  create: (data) => api.post('/projects', data),
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  getBudget: (id) => api.get(`/projects/${id}/budget`),
  updateBudget: (id, data) => api.patch(`/projects/${id}/budget`, data),
};

// ─── Tenders ──────────────────────────────────────────────────────────────────
export const tendersAPI = {
  create: (data) => api.post('/tenders', data),
  getAll: () => api.get('/tenders'),
  getById: (id) => api.get(`/tenders/${id}`),
  addBid: (id, data) => api.post(`/tenders/${id}/bids`, data),
  getRankings: (id) => api.get(`/tenders/${id}/rankings`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  citizen: () => api.get('/dashboard/citizen'),
  contractor: () => api.get('/dashboard/contractor'),
  authority: () => api.get('/dashboard/authority'),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  analyzeRoad: (formData) => api.post('/ai/analyze-road', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export default api;
