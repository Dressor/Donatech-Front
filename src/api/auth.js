import api from './axios';

export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (data) => api.post('/api/auth/register', data),
  registerBeneficiary: (data) => api.post('/api/auth/register/beneficiary', data),
  registerOrganization: (data) => api.post('/api/auth/register/organization', data),
  refresh: () => api.post('/api/auth/refresh'),
  validate: () => api.get('/api/auth/validate'),
  changePassword: (data) => api.post('/api/auth/change-password', data),
};
