import api from './axios';

export const ordersApi = {
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  getCart: (userEmail) => api.get('/api/orders/cart', { params: { userEmail } }),
  create: (data) => api.post('/api/orders', data),
  update: (id, data) => api.put(`/api/orders/${id}`, data),
  delete: (id) => api.delete(`/api/orders/${id}`),
  addToCart: (data) => api.post('/api/orders/cart/items', data),
  updateStatus: (id, status, changedById) =>
    api.patch(`/api/orders/${id}/status`, null, { params: { status, changedById } }),
  getHistory: (id) => api.get(`/api/orders/${id}/history`),
  getDashboard: () => api.get('/api/orders/dashboard/summary'),

  // Transfer proof upload
  uploadTransferProof: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/api/orders/${id}/transfer-proof`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Download proof files (blob for authenticated endpoints)
  getTransferProof: (id) => api.get(`/api/orders/${id}/transfer-proof`, { responseType: 'blob' }),
  getDeliveryPhoto: (id) => api.get(`/api/orders/${id}/delivery-photo`, { responseType: 'blob' }),
  getDeliveryDocument: (id) => api.get(`/api/orders/${id}/delivery-document`, { responseType: 'blob' }),

  // Asignar transportista (EN_PREPARACION → ASIGNADA_ENVIO)
  assignCourier: (id, data, changedById) =>
    api.patch(`/api/orders/${id}/assign-courier`, data, { params: { changedById } }),

  // Marcar en camino (ASIGNADA_ENVIO → EN_CAMINO)
  markInTransit: (id, changedById) =>
    api.patch(`/api/orders/${id}/in-transit`, null, { params: { changedById } }),

  // Delivery proof upload (EN_CAMINO → PENDIENTE_CONFIRMACION)
  uploadDeliveryProof: (id, photo, document) => {
    const form = new FormData();
    form.append('photo', photo);
    if (document) form.append('document', document);
    return api.post(`/api/orders/${id}/delivery-proof`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  confirmDelivery: (id, confirmedById) =>
    api.patch(`/api/orders/${id}/confirm-delivery`, null, { params: { confirmedById } }),

  // Donations (alias)
  getDonations: () => api.get('/api/donations'),
  getDonationById: (id) => api.get(`/api/donations/${id}`),
  getDonationsByDonor: (email) => api.get('/api/donations/by-donor', { params: { email } }),
  getDonationsByCampaign: (campaignId, visibleOnly = false) =>
    api.get(`/api/donations/by-campaign/${campaignId}`, { params: { visibleOnly } }),
  // Agradecimiento del beneficiario al donante (orden ENTREGADA)
  sendThankYou: (id, message, images = []) => {
    const form = new FormData();
    form.append('message', message);
    images.forEach((img) => form.append('images', img));
    return api.post(`/api/orders/${id}/thank-you`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  createDonation: (data) => api.post('/api/donations', data),
  updateDonationStatus: (id, status, changedById) =>
    api.patch(`/api/donations/${id}/status`, null, { params: { status, changedById } }),
  cancelDonation: (id, motivo, changedById) =>
    api.patch(`/api/donations/${id}/cancel`, null, { params: { motivo, changedById } }),

  // Transfer config
  getTransferConfig: () => api.get('/api/config/transfer'),
  saveTransferConfig: (data) => api.put('/api/config/transfer', data),

  // Coupons
  getCoupons: () => api.get('/api/orders/coupons'),
  getCouponByCode: (code) => api.get(`/api/orders/coupons/by-code/${code}`),
  createCoupon: (discountAmount) =>
    api.post('/api/orders/coupons/add', null, { params: { discountAmount } }),
};
