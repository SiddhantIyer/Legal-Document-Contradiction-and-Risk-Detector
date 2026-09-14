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

// ==========================================
// Contract API calls
// ==========================================

export const getContracts = async () => {
  const data = await apiFetch('/contracts');
  return data;
};

export const getContractById = async (id) => {
  const data = await apiFetch(`/contracts/${id}`);
  return data;
};

export const createContract = async (contractData) => {
  const data = await apiFetch('/contracts', {
    method: 'POST',
    body: JSON.stringify(contractData),
  });
  return data;
};

export const deleteContract = async (id) => {
  const data = await apiFetch(`/contracts/${id}`, {
    method: 'DELETE',
  });
  return data;
};

// ==========================================
// Contract Upload (real file extraction)
// ==========================================

export const uploadContract = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/contracts/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do NOT set Content-Type — browser sets it with boundary for FormData
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Upload failed');
  }

  return data;
};
