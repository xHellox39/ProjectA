import { apiClient } from './ApiClient';

export const paymentApi = {
  list(params) {
    return apiClient.get('/payments', { params });
  },
  getById(id) {
    return apiClient.get(`/payments/${id}`);
  },
  create(data) {
    return apiClient.post('/payments', data);
  },
  markPaid(id) {
    return apiClient.patch(`/payments/${id}/mark-paid`);
  },
};
