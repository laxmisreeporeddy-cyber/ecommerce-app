import api from './api';

export const orderService = {
  create: (data) => api.post('/orders', data).then((res) => res.data),
  getMyOrders: (params) => api.get('/orders/my', { params }).then((res) => res.data),
  getOne: (id) => api.get(`/orders/${id}`).then((res) => res.data),
  cancel: (id) => api.put(`/orders/${id}/cancel`).then((res) => res.data),
  // admin
  getAll: (params) => api.get('/orders', { params }).then((res) => res.data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }).then((res) => res.data),
  getStats: () => api.get('/orders/stats').then((res) => res.data),
};
