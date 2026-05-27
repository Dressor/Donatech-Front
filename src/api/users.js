import api from './axios';

export const usersApi = {
  // Users
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  getByEmail: (email) => api.get('/api/users/by-email', { params: { email } }),
  create: (data) => api.post('/api/users/add', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
  updateStatus: (id, status) => api.patch(`/api/users/${id}/status`, null, { params: { status } }),

  // Beneficiaries
  getBeneficiaries: () => api.get('/api/beneficiaries'),
  getBeneficiaryById: (id) => api.get(`/api/beneficiaries/${id}`),
  getBeneficiaryByUserId: (userId) => api.get(`/api/beneficiaries/by-user/${userId}`),
  getBeneficiariesByStatus: (estado) => api.get('/api/beneficiaries/by-estado', { params: { estado } }),
  verifyBeneficiary: (id, data) => api.patch(`/api/beneficiaries/${id}/verify`, data),

  // Locations
  getRegions: () => api.get('/api/regions'),
  getComunasByRegion: (regionId) => api.get(`/api/comunas/by-region/${regionId}`),

  // Roles
  getRoles: () => api.get('/api/users/roles'),

  // Company
  createCompany: (data) => api.post('/api/users/company', data),
  getCompanyByUser: (userId) => api.get(`/api/users/company/${userId}`),

  // Validación de empresas (Patente Municipal)
  getAllCompanies: () => api.get('/api/companies'),
  getCompaniesByStatus: (status) => api.get('/api/companies/by-status', { params: { status } }),
  verifyCompany: (id, data) => api.patch(`/api/companies/${id}/verify`, data),
};
