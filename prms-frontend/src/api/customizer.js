import { apiClient } from './ApiClient';

export const customizerApi = {
  async getConfig() {
    return apiClient.get('/customizer/config').then(r => r.data);
  },

  async updateConfig(payload) {
    return apiClient.put('/customizer/config', payload).then(r => r.data);
  },

  async uploadLogo(formData) {
    return apiClient.post('/customizer/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  async removeLogo() {
    return apiClient.delete('/customizer/logo').then(r => r.data);
  },

  getPreviewUrl(theme = 'light') {
    const base = typeof window !== 'undefined'
      ? (window.location.origin === 'http://localhost:5173' ? 'http://localhost:3500' : window.location.origin)
      : 'http://localhost:3500';
    return `${base}/customizer/preview?theme=${theme}`;
  },
};
