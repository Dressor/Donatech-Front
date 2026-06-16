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
  getKits: (tipo) => api.get('/api/kits', tipo ? { params: { tipo } } : undefined),
  getKitById: (id) => api.get(`/api/kits/${id}`),
  createKit: (data) => api.post('/api/kits', data),
  createPersonalizedKit: (data) => api.post('/api/kits/personalized', data),
  updateKit: (id, data) => api.put(`/api/kits/${id}`, data),
  deleteKit: (id) => api.delete(`/api/kits/${id}`),
  uploadKitImage: (id, formData) => api.post(`/api/kits/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadProductImage: (id, formData) => api.post(`/api/products/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Campaigns
  getCampaigns: () => api.get('/api/campaigns'),
  getActiveCampaigns: () => api.get('/api/campaigns/active'),
  getCampaignById: (id) => api.get(`/api/campaigns/${id}`),
  getCampaignsByBeneficiary: (id) => api.get(`/api/campaigns/by-beneficiary/${id}`),
  createCampaign: (data) => api.post('/api/campaigns', data),
  closeCampaign: (id) => api.patch(`/api/campaigns/${id}/close`),
  updateCampaignLogistica: (id, monto) => api.patch(`/api/campaigns/${id}/logistica`, { monto }),
  addKitToCampaign: (campaignId, data) => api.post(`/api/campaigns/${campaignId}/kits`, data),
  updateCampaignKit: (campaignId, kitId, cantidadNecesaria) =>
    api.patch(`/api/campaigns/${campaignId}/kits/${kitId}`, { cantidadNecesaria }),
  removeKitFromCampaign: (campaignId, kitId) => api.delete(`/api/campaigns/${campaignId}/kits/${kitId}`),

  // Campaign images
  getCampaignImages: (campaignId) => api.get(`/api/campaigns/${campaignId}/images`),
  uploadCampaignImage: (campaignId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/api/campaigns/${campaignId}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteCampaignImage: (campaignId, imageId) => api.delete(`/api/campaigns/${campaignId}/images/${imageId}`),
  getCampaignImageUrl: (campaignId, imageId) => `/api/campaigns/${campaignId}/images/${imageId}`,
};
