import { useAuthStore } from '@/store/auth';

const API_BASE = '/api';

async function refreshAccessToken() {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      useAuthStore.getState().logout();
      return false;
    }

    const data = await res.json();
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    useAuthStore.getState().logout();
    return false;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, params, formData } = options;
  const { accessToken } = useAuthStore.getState();

  let url = `${API_BASE}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = {};
  if (!formData) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let bodyData = body && !formData ? JSON.stringify(body) : formData;

  let res = await fetch(url, { method, headers, body: bodyData });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${useAuthStore.getState().accessToken}`;
      res = await fetch(url, { method, headers, body: bodyData });
    } else {
      window.location.href = '/';
      throw new Error('Session expired');
    }
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.details?.[0]?.message || 'Request failed');
  }

  return data;
}

export function login(email, password) {
  return apiRequest('/auth/login', { method: 'POST', body: { email, password } });
}

export function logout() {
  const { refreshToken } = useAuthStore.getState();
  return apiRequest('/auth/logout', { method: 'POST', body: { refreshToken } });
}

export function getMe() {
  return apiRequest('/auth/me');
}
