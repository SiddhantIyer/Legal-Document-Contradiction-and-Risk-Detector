const API_URL = 'http://localhost:5000/api';

const TOKEN_KEY = 'machine-counsel-token';

// Helper to get stored token
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Helper to store token
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

// Helper to remove token
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Generic fetch wrapper with auth header
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth API calls
export const loginUser = async (email, password) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  setToken(data.token);
  return data;
};

export const registerUser = async (name, email, password) => {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  setToken(data.token);
  return data;
};

export const getMe = async () => {
  const data = await apiFetch('/auth/me');
  return data;
};
