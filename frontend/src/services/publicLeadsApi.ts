import axios from 'axios';

const PUBLIC_API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, '/public') ??
  'http://localhost:3000/public';

export const publicClient = axios.create({
  baseURL: PUBLIC_API_URL,
  timeout: 5000,
});

export interface PublicLeadInput {
  nome: string;
  whatsapp: string;
  cidade?: string;
  veiculo?: string;
  origem?: string;
}

export interface PublicLeadResponse {
  message: string;
  lead: {
    id: string;
    name: string | null;
    status: string | null;
  };
}

export async function submitPublicLead(
  input: PublicLeadInput,
): Promise<PublicLeadResponse> {
  const { data } = await publicClient.post<PublicLeadResponse>('/leads', input);
  return data;
}
