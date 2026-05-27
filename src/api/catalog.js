import api from './axios';

export const catalogApi = {
  // Products
  getProducts: (params) => api.get('/api/products', { params }),
  getProductById: (id) => api.get(`/api/products/${id}`),
  getLowStock: () => api.get('/api/products/low-stock'),
  createProduct: (data) => api.post('/api/products', data),
  updateProduct: (id, data) => api.put(`/api/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),

  // Categories
  getCategories: () => api.get('/api/products/categories'),
  createCategory: (data) => api.post('/api/products/categories/add', data),
  updateCategory: (id, data) => api.put(`/api/products/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/api/products/categories/${id}`),

  // Units
  getUnits: () => api.get('/api/products/units'),

  // Kits
  getKits: () => api.get('/api/kits'),
  getKitById: (id) => api.get(`/api/kits/${id}`),
  createKit: (data) => api.post('/api/kits', data),
  updateKit: (id, data) => api.put(`/api/kits/${id}`, data),
  deleteKit: (id) => api.delete(`/api/kits/${id}`),

  // Campaigns
  getCampaigns: () => api.get('/api/campaigns'),
  getActiveCampaigns: () => api.get('/api/campaigns/active'),
  getCampaignById: (id) => api.get(`/api/campaigns/${id}`),
  getCampaignsByBeneficiary: (id) => api.get(`/api/campaigns/by-beneficiary/${id}`),
  createCampaign: (data) => api.post('/api/campaigns', data),
  closeCampaign: (id) => api.patch(`/api/campaigns/${id}/close`),
  addKitToCampaign: (campaignId, data) => api.post(`/api/campaigns/${campaignId}/kits`, data),
  removeKitFromCampaign: (campaignId, kitId) => api.delete(`/api/campaigns/${campaignId}/kits/${kitId}`),
};
