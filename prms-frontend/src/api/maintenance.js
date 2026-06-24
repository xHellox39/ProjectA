import { apiClient } from './ApiClient';

export const maintenanceApi = {
  list(params) {
    return apiClient.get('/maintenance', { params });
  },
  getById(id) {
    return apiClient.get(`/maintenance/${id}`);
  },
  create(data) {
    return apiClient.post('/maintenance', data);
  },
  update(id, data) {
    return apiClient.put(`/maintenance/${id}`, data);
  },
  resolve(id) {
    return apiClient.patch(`/maintenance/${id}/resolve`);
  },
};
