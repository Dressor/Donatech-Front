import api from './axios';

// shipping ms expuesto vía gateway (/api/shipments, /api/routes). Las respuestas usan
// el wrapper MessageResponse { statusCode, message, data }.
export const shippingApi = {
  getPendingShipments: () => api.get('/api/shipments', { params: { deliveryStatus: 'PENDING' } }),
  getShipments: (deliveryStatus) =>
    api.get('/api/shipments', { params: deliveryStatus ? { deliveryStatus } : {} }),
  getRoutes: (status) => api.get('/api/routes', { params: status ? { status } : {} }),
  createRoute: (data) => api.post('/api/routes', data),
  setRouteStatus: (id, status) => api.patch(`/api/routes/${id}/status`, status, {
    headers: { 'Content-Type': 'application/json' },
  }),
};
