import { apiClient } from './ApiClient';

export const adminApi = {
  /* Settings */
  getSettings() {
    return apiClient.get('/admin/settings');
  },
  getSettingsByCategory(category) {
    return apiClient.get(`/admin/settings/category/${category}`);
  },
  getPublicSettings() {
    return apiClient.get('/admin/settings/public');
  },
  updateSetting(data) {
    return apiClient.put('/admin/settings', data);
  },
  bulkUpdateSettings(dataArray) {
    return apiClient.put('/admin/settings/bulk', { settings: dataArray });
  },
  addSetting(data) {
    return apiClient.post('/admin/settings', data);
  },

  /* Audit logs */
  getAuditLogs(params) {
    return apiClient.get('/admin/audit-logs', { params });
  },

  /* Notifications */
  getNotifications(params) {
    return apiClient.get('/admin/notifications', { params });
  },
  markAsRead(id) {
    return apiClient.patch(`/admin/notifications/${id}/read`);
  },
  markAllAsRead() {
    return apiClient.post('/admin/notifications/read-all');
  },
  dismiss(id) {
    return apiClient.delete(`/admin/notifications/${id}`);
  },
};
