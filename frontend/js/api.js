const API_BASE = '/api';

let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

function setTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

function isAuthenticated() {
  return !!accessToken;
}

async function refreshAccessToken() {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, params, formData } = options;

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

  let bodyData = body;
  if (body && !formData) {
    bodyData = JSON.stringify(body);
  } else if (formData) {
    bodyData = formData;
  }

  let res = await fetch(url, {
    method,
    headers,
    body: bodyData,
  });

  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(url, {
        method,
        headers,
        body: bodyData,
      });
    } else {
      clearTokens();
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

function login(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

function logout() {
  return apiRequest('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  });
}

function getMe() {
  return apiRequest('/auth/me');
}

async function redirectToDashboard() {
  try {
    const user = await getMe();
    const role = user.role;
    if (role === 'student') window.location.href = '/pages/student/dashboard.html';
    else if (role === 'teacher') window.location.href = '/pages/teacher/dashboard.html';
    else if (role === 'administrator') window.location.href = '/pages/admin/dashboard.html';
  } catch {
    clearTokens();
    window.location.href = '/';
  }
}
