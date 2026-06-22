import api from './api';

export const productService = {
  getAll: (params) => api.get('/products', { params }).then((res) => res.data),
  getOne: (id) => api.get(`/products/${id}`).then((res) => res.data),
  getCategories: () => api.get('/products/categories').then((res) => res.data),
  create: (data) => api.post('/products', data).then((res) => res.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/products/${id}`).then((res) => res.data),
};
