import api from './axios';

export const supportsApi = {
  getAll: () => api.get('/api/supports'),
  getById: (id) => api.get(`/api/supports/${id}`),
  getByStatus: (estado) => api.get('/api/supports/by-estado', { params: { estado } }),
  getByType: (tipo) => api.get('/api/supports/by-tipo', { params: { tipo } }),
  getByUser: (userId) => api.get(`/api/supports/by-usuario/${userId}`),
  create: (data) => api.post('/api/supports', data),
  updateStatus: (id, estado) => api.patch(`/api/supports/${id}/status`, { estado }),
  assign: (id, voluntarioId) =>
    api.patch(`/api/supports/${id}/assign`, null, { params: { voluntarioId } }),
  respond: (id, data) => api.patch(`/api/supports/${id}/respond`, data),
  validateCampaign: (id, approved, motivo) =>
    api.patch(`/api/supports/${id}/validate-campaign`, null, { params: { approved, motivo } }),
  validateTransfer: (id, approved, motivo) =>
    api.patch(`/api/supports/${id}/validate-transfer`, null, { params: { approved, motivo } }),
  delete: (id) => api.delete(`/api/supports/${id}`),
};
