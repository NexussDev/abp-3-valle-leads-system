import { client } from './leadsApi';

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
  origin: string;
}

export const getLeads = async (): Promise<LeadFromAPI[]> => {
  const { data } = await client.get<LeadFromAPI[]>('/leads');
  return data;
};

export const getLeadById = async (id: string): Promise<LeadFromAPI> => {
  const { data } = await client.get<LeadFromAPI>(`/leads/${id}`);
  return data;
};

export const getLeadSources = async (): Promise<LeadSource[]> => {
  const { data } = await client.get<LeadSource[]>('/lead-sources');
  return data;
};

// userId, teamId e storeId são resolvidos pelo backend a partir do token JWT.
// O frontend envia apenas os dados do lead em si.
export const createLead = async (lead: CreateLeadInput): Promise<LeadFromAPI> => {
  const { data } = await client.post<LeadFromAPI>('/leads', {
    name:   lead.name,
    phone:  lead.phone,
    origin: lead.origin,
  });
  return data;
};

export async function updateLead(id: string, updateData: Record<string, unknown>) {
  const { data } = await client.put(`/leads/${id}`, updateData);
  return data;
}
