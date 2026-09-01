import { propertyApi } from '../api';
import { getApiBaseUrl } from '../config/apiBaseUrl';

const API_BASE = getApiBaseUrl();

export function getImageUrl(url) {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url}`;
}

export async function loadFirstImageUrl(propertyId) {
  try {
    const res = await propertyApi.getById(propertyId);
    if (res?.data?.images?.[0]?.url) {
      return `${API_BASE}${res.data.images[0].url}`;
    }
  } catch { /* ignore */ }
  return '';
}
