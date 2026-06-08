import axios from 'axios';

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3000/api';

const TOKEN_KEYS = ['token', '@LeadsCar:token'];

function getStoredToken(): string | null {
  for (const key of TOKEN_KEYS) {
    const token = localStorage.getItem(key);
    if (token) return token;
  }

  return null;
}

function clearSessionAndRedirect() {
  localStorage.removeItem('token');
  localStorage.removeItem('@LeadsCar:token');
  localStorage.removeItem('@LeadsCar:user');
  localStorage.removeItem('@LeadsCar:role');

  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export const client = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

client.interceptors.request.use(config => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';
    const isLoginRequest = requestUrl.includes('/auth/login');

    if (status === 401 && !isLoginRequest) {
      clearSessionAndRedirect();
    }

    return Promise.reject(error);
  },
);

export interface ApiLead {
  id: string;
  name: string | null;
  phone: string | null;
  status: string | null;
  origin?: string;
  createdAt: string | null;
  client?: { id: string; name: string } | null;
  user?:  { id: string; name: string; email: string; role: string } | null;
  team?:  { id: string; name: string } | null;
  store?: { id: string; name: string } | null;
}

export async function fetchLeads(): Promise<ApiLead[]> {
  const { data } = await client.get<ApiLead[]>('/leads');
  return data;
}