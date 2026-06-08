import axios from 'axios';

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3000/api';

export const client = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  console.log('Token no interceptor:', token);
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
  closingReason?: string | null;   // linha nova
  converted?: boolean | null;      // linha nova
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

export interface UpdateLeadPayload {
  status?: string;
  closingReason?: string;
  converted?: boolean;
}

export async function updateLead(id: string, payload: UpdateLeadPayload): Promise<ApiLead> {
  const { data } = await client.put<ApiLead>(`/leads/${id}`, payload);
  return data;
}