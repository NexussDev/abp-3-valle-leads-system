import axios, { AxiosError } from 'axios';

const API_URL =
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL as string | undefined : undefined) ??
  'http://localhost:3000/api';

export const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor: attach JWT
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: global error handling
client.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('@LeadsCar:role');
      if (typeof window !== 'undefined' && !('vitest' in globalThis)) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      console.warn('[API] Acesso negado (403): sem permissão para este recurso.');
    } else if (status === 404) {
      console.warn('[API] Recurso não encontrado (404).');
    } else if (status && status >= 500) {
      console.error('[API] Erro interno do servidor (5xx):', error.message);
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
  importance?: string;
  temperatura?: string;  // linha nova
  closingReason?: string | null;
  converted?: boolean | null;
  createdAt: string | null;
  client?: { id: string; name: string } | null;
  user?: { id: string; name: string; email: string; role: string } | null;
  team?: { id: string; name: string } | null;
  store?: { id: string; name: string } | null;
}

export interface FetchLeadsParams {
  status?: string;
  userId?: string;
  teamId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function fetchLeads(params: FetchLeadsParams = {}): Promise<ApiLead[]> {
  const query: Record<string, string> = {};
  if (params.status) query.status = params.status;
  if (params.userId) query.userId = params.userId;
  if (params.teamId) query.teamId = params.teamId;
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;
  if (params.page) query.page = String(params.page);
  if (params.limit) query.limit = String(params.limit);

  const { data } = await client.get<ApiLead[]>('/leads', { params: query });
  return data;
}

export interface UpdateLeadPayload {
  status?: string;
  closingReason?: string;
  converted?: boolean;
  name?: string;
  phone?: string;
  origin?: string;
  importance?: string;   // linha nova
  temperatura?: string;  // linha nova
}

export async function updateLead(id: string, payload: UpdateLeadPayload): Promise<ApiLead> {
  const { data } = await client.put<ApiLead>(`/leads/${id}`, payload);
  return data;
}

export async function createLeadApi(payload: {
  name: string;
  phone?: string;
  origin: string;
}): Promise<ApiLead> {
  const { data } = await client.post<ApiLead>('/leads', payload);
  return data;
}