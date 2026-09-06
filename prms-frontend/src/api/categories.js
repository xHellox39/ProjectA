/* Category API endpoints (T-02.4) */
import { apiClient } from '../api';

export const categoryApi = {
  // Generic list (filtered by query params)
  list: (params) => apiClient.get('/categories/list', { params }),

  // Admin: list all categories (auto-seeds if empty)
  adminList: () => apiClient.get('/categories'),
  adminCreate: (data) => apiClient.post('/categories', data),
  adminUpdate: (id, data) => apiClient.put(`/categories/${id}`, data),
  adminRemove: (id) => apiClient.delete(`/categories/${id}`),
  adminToggle: (id) => apiClient.patch(`/categories/${id}/toggle`),
  adminRestore: (id) => apiClient.patch(`/categories/${id}/restore`),
  seedDefaults: () => apiClient.post('/categories/seed'),

  // Shared (read-only for all users)
  shared: () => apiClient.get('/categories/shared'),

  // By ID
  getById: (id) => apiClient.get(`/categories/${id}`),

  // Personal (non-admin) endpoints
  personalList: () => apiClient.get('/categories/personal'),
  createPersonal: (data) => apiClient.post('/categories/personal', data),
  updatePersonal: (id, data) => apiClient.put(`/categories/personal/${id}`, data),
  removePersonal: (id) => apiClient.delete(`/categories/personal/${id}`),
  togglePersonal: (id) => apiClient.patch(`/categories/personal/${id}/toggle`),
};
