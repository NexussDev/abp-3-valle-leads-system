import { api } from './api';

export interface LeadFromAPI {
  id: string;
  name: string;
  phone?: string;
  status: string;
  origin: string;
  car?: string;
  price?: number;
  stage?: string;
  createdAt?: string;
  client?: { name?: string };
  source?: { id: string; name: string };
  [key: string]: unknown;
}

export interface LeadSource {
  id: string;
  name: string;
}

export interface CreateLeadInput {
  name: string;
  phone?: string;
  status: string;
  origin: string;
  sourceId?: string;
}

// ⚠️ Atualize esses IDs após o setup do banco
const DEFAULT_USER_ID   = 'COLE_O_USER_ID_AQUI';
const DEFAULT_TEAM_ID   = 'COLE_O_TEAM_ID_AQUI';
const DEFAULT_STORE_ID  = 'COLE_O_STORE_ID_AQUI';
const DEFAULT_CLIENT_ID = 'COLE_O_CLIENT_ID_AQUI';

export const getLeads = async (): Promise<LeadFromAPI[]> => {
  const data = await api.get('/api/leads');
  return data;
};

export const getLeadById = async (id: string): Promise<LeadFromAPI> => {
  const data = await api.get(`/api/leads/${id}`);
  return data;
};

// Busca origens de leads da API
export const getLeadSources = async (): Promise<LeadSource[]> => {
  const data = await api.get('/api/lead-sources');
  return data;
};

export const createLead = async (lead: CreateLeadInput): Promise<LeadFromAPI> => {
  const data = await api.post('/api/leads', {
    name: lead.name,
    phone: lead.phone,
    status: lead.status,
    origin: lead.origin,
    sourceId: lead.sourceId,
    clientId: DEFAULT_CLIENT_ID,
    userId: DEFAULT_USER_ID,
    teamId: DEFAULT_TEAM_ID,
    storeId: DEFAULT_STORE_ID,
  });
  return data;
};