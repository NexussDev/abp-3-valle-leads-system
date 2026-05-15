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
  status: string;
  origin: string;
  sourceId?: string;
}

const DEFAULT_USER_ID   = 'c4711469-a44f-4bdf-8c30-23a47865bb27';
const DEFAULT_TEAM_ID   = '06d1ca8c-40b3-42cb-bb13-e7d05fb8cb1d';
const DEFAULT_STORE_ID  = '10f3b81a-6cf7-48ec-8fcd-ea0268fbfc22';
const DEFAULT_CLIENT_ID = '58c0cf8e-9462-4637-99d3-68e237ab6696';

export const getLeads = async (): Promise<LeadFromAPI[]> => {
  const { data } = await client.get<LeadFromAPI[]>('/leads'); // ← .data
  return data;
};

export const getLeadById = async (id: string): Promise<LeadFromAPI> => {
  const { data } = await client.get<LeadFromAPI>(`/leads/${id}`); // ← .data
  return data;
};

export const getLeadSources = async (): Promise<LeadSource[]> => {
  const { data } = await client.get<LeadSource[]>('/lead-sources'); // ← .data
  return data;
};

export const createLead = async (lead: CreateLeadInput): Promise<LeadFromAPI> => {
  const { data } = await client.post<LeadFromAPI>('/leads', {
    name: lead.name,
    phone: lead.phone,
    status: lead.status,
    origin: lead.origin,
    sourceId: lead.sourceId ?? undefined,
    clientId: DEFAULT_CLIENT_ID,
    userId: DEFAULT_USER_ID,
    teamId: DEFAULT_TEAM_ID,
    storeId: DEFAULT_STORE_ID,
  });
  return data;
};

export async function updateLead(id: string, updateData: Record<string, unknown>) {
  const { data } = await client.put(`/leads/${id}`, updateData); // ← usa Axios
  return data;
}