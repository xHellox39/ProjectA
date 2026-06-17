import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3500';

/* ------------------------------------------------------------------ */
/*  Core Axios instance                                                */
/* ------------------------------------------------------------------ */

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/* ------------------------------------------------------------------ */
/*  Request interceptor — attach JWT automatically                    */
/* ------------------------------------------------------------------ */

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ------------------------------------------------------------------ */
/*  Token-refresh helper                                               */
/* ------------------------------------------------------------------ */

let isRefreshing = false;
let failedQueue = [];

/* Hydration flag set by AuthContext — shared via window __prmsHydrating */

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

async function refreshToken() {
  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
    refreshToken: localStorage.getItem('refreshToken'),
  });
  return data;
}

/* ------------------------------------------------------------------ */
/*  Response interceptor — auto-refresh token on 401                  */
/* ------------------------------------------------------------------ */

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // 401 — try to refresh token once
    if (error.response?.status === 401 && !original._retry) {
      // During hydration, skip interceptor logout — let AuthContext handle it
      if (window.__prmsHydrating && original.url === '/auth/me') {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return apiClient(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const data = await refreshToken();
        // Backend wraps in successResponse: { success, message, data: { tokens } }
        const tokens = data?.data?.tokens || data?.tokens;
        const newToken = tokens?.accessToken;
        if (!newToken) {
          throw new Error('No access token in refresh response');
        }
        localStorage.setItem('accessToken', newToken);
        if (tokens?.refreshToken) {
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (err) {
        processQueue(err);
        logoutUser();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 — forbidden
    if (error.response?.status === 403) {
      // Resource access denied — stay on page, show message
    }

    return Promise.reject(error);
  }
);

/* ------------------------------------------------------------------ */
/*  Convenience helpers                                                */
/* ------------------------------------------------------------------ */

function logoutUser() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.replace('/login');
}

/* Unified error extraction so callers get a string message */
function getApiError(res) {
  if (!res.response) return res.message || 'Network error';
  const body = res.response.data;
  return (
    body?.message || body?.error?.message || body?.error || 'Server error'
  );
}

export { apiClient, BASE_URL, logoutUser, getApiError };
