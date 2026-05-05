import axios from 'axios';

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiLead {
  id: string;
  name: string | null;
  phone: string | null;
  status: string | null;
  origin?: string;
  createdAt: string | null;
  client?: { id: string; name: string } | null;
  user?: { id: string; name: string; email: string; role: string };
}

export async function fetchLeads(): Promise<ApiLead[]> {
  const { data } = await client.get<ApiLead[]>('/leads');
  return data;
}
