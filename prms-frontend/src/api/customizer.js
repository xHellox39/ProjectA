import { apiClient } from './ApiClient';

export const customizerApi = {
  async getConfig() {
    return apiClient.get('/customizer/config');
  },

  async updateConfig(payload) {
    return apiClient.put('/customizer/config', payload);
  },

  async uploadLogo(formData) {
    return apiClient.post('/customizer/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async removeLogo() {
    return apiClient.delete('/customizer/logo');
  },

  getPreviewUrl(theme = 'light') {
    const base = typeof window !== 'undefined'
      ? (window.location.origin === 'http://localhost:5173' ? 'http://localhost:3500' : window.location.origin)
      : 'http://localhost:3500';
    return `${base}/customizer/preview?theme=${theme}`;
  },
};
