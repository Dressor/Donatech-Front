import api from './axios';

export const usersApi = {
  // Users
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  getByEmail: (email) => api.get('/api/users/by-email', { params: { email } }),
  getCollaborators: () => api.get('/api/users/collaborators'),

  // Perfil propio
  getMyProfile: () => api.get('/api/users/me'),
  updateMyProfile: (data) => api.put('/api/users/me', data),
  uploadMyAvatar: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/api/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
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

  // Validación de empresas (Patente Municipal) → usa /api/beneficiaries
  getAllCompanies: () => api.get('/api/beneficiaries'),
  getCompaniesByStatus: (estado) => api.get('/api/beneficiaries/by-estado', { params: { estado } }),
  verifyCompany: (id, data) => api.patch(`/api/beneficiaries/${id}/verify`, data),

  // Avatar
  uploadAvatar: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/api/users/${id}/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAvatar: (id) => api.get(`/api/users/${id}/avatar`, { responseType: 'blob' }),
};
