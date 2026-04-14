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
  created_at?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateLeadInput {
  name: string;
  phone?: string;
  status: string;
  origin: string;
}

// IDs fixos do banco
const DEFAULT_USER_ID   = '1ccc58b9-5fc4-4e81-aeef-125dbc269ede';
const DEFAULT_TEAM_ID   = 'd3338390-d6f9-4c1e-9a83-bef0b49476de';
const DEFAULT_STORE_ID  = 'e2730bb2-8adf-4a90-a0d4-c2afabc18efe';
const DEFAULT_CLIENT_ID = '7f3fccc4-2192-488b-8fa2-1f72798fe9a4';

// Busca todos os leads
export const getLeads = async (): Promise<LeadFromAPI[]> => {
  const data = await api.get('/api/leads');
  return data;
};

// Busca lead por ID
export const getLeadById = async (id: string): Promise<LeadFromAPI> => {
  const data = await api.get(`/api/leads/${id}`);
  return data;
};

// Cria novo lead
export const createLead = async (lead: CreateLeadInput): Promise<LeadFromAPI> => {
    const data = await api.post('/api/leads', {
      name: lead.name,
      phone: lead.phone,
      status: lead.status,
      origin: lead.origin,
      clientId: DEFAULT_CLIENT_ID,
      userId: DEFAULT_USER_ID,
      teamId: DEFAULT_TEAM_ID,
      storeId: DEFAULT_STORE_ID,
    });
    return data;
  };