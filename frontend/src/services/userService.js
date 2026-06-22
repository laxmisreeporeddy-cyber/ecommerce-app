import api from './api';

export const userService = {
  getAll: () => api.get('/users').then((res) => res.data),
  getOne: (id) => api.get(`/users/${id}`).then((res) => res.data),
  update: (id, data) => api.put(`/users/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/users/${id}`).then((res) => res.data),
};
