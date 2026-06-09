import { client } from './leadsApi';

export interface RecaptureLead {
  id: string;
  name: string | null;
  phone: string | null;
  status: string | null;
  origin: string | null;
  createdAt: string | null;
  lastContactedAt: string | null;
  client?: { id: string; name: string; email?: string | null } | null;
  user?:   { id: string; name: string; email: string; role: string } | null;
  team?:   { id: string; name: string } | null;
}

export interface RecaptureResponse {
  days: number;
  count: number;
  leads: RecaptureLead[];
}

export async function fetchRecapture(days = 30): Promise<RecaptureResponse> {
  const { data } = await client.get<RecaptureResponse>('/leads/recapture', {
    params: { days },
  });
  return data;
}

export async function markLeadContacted(id: string): Promise<RecaptureLead> {
  const { data } = await client.patch<RecaptureLead>(`/leads/${id}/contact`);
  return data;
}

/**
 * Calcula dias desde último contato (ou criação, se nunca houve contato).
 * Retorna 0 se ambos forem null/inválidos.
 */
export function daysSinceContact(lead: RecaptureLead, now: Date = new Date()): number {
  const reference = lead.lastContactedAt ?? lead.createdAt;
  if (!reference) return 0;
  const refMs = new Date(reference).getTime();
  if (!Number.isFinite(refMs)) return 0;
  return Math.floor((now.getTime() - refMs) / (24 * 60 * 60 * 1000));
}

/**
 * Monta deep link wa.me com mensagem template.
 * Aceita phones com ou sem DDD/símbolos. Garante prefixo 55 (Brasil).
 */
export function buildWhatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function renderTemplate(
  template: string,
  vars: { nome?: string | null; atendente?: string | null; dias?: number | null },
): string {
  return template
    .replace(/\{nome\}/g, vars.nome ?? 'cliente')
    .replace(/\{atendente\}/g, vars.atendente ?? 'nossa equipe')
    .replace(/\{dias\}/g, String(vars.dias ?? 0));
}
