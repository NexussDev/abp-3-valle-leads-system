import { Lead } from '../types';

const STORAGE_KEY = 'mock_kanban_leads';

export interface ClientLeadFormData {
  name: string;
  phone: string;
  city?: string;
  car: string;
  origin: string;
}

function getNextLeadNumber(): string {
  const leads = getStoredLeads();
  const nextNumber = leads.length + 1;

  return `LD-${String(nextNumber).padStart(3, '0')}`;
}

export function getStoredLeads(): Lead[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

export function saveClientLead(data: ClientLeadFormData): Lead {
  const leads = getStoredLeads();
  const leadNumber = getNextLeadNumber();

  const newLead: Lead = {
    id: crypto.randomUUID(),
    leadNumber,
    name: data.name,
    avatar: `https://i.pravatar.cc/40?u=${leadNumber}`,
    car: data.car,
    carImage: '',
    price: 0,
    stage: 'novo_lead',
    status: 'Novo Lead',
    timeAgo: 'agora',
    statusUpdatedAt: new Date().toISOString(),
    origin: data.origin,
    phone: data.phone,
    city: data.city,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...leads, newLead]));

  window.dispatchEvent(new Event('mock-leads-updated'));

  return newLead;
}

export function updateStoredLeadStage(leadId: string, stage: Lead['stage']) {
  const leads = getStoredLeads();

  const updatedLeads = leads.map(lead =>
    lead.id === leadId
      ? {
          ...lead,
          stage,
          status:
            stage === 'novo_lead' ? 'Novo Lead' :
            stage === 'contato_realizado' ? 'Contato Realizado' :
            stage === 'agendamento_visita' ? 'Visita Agendada' :
            stage === 'proposta_enviada' ? 'Proposta Enviada' :
            stage === 'em_negociacao' ? 'Em Negociação' :
            'Vendido',
          statusUpdatedAt: new Date().toISOString(),
        }
      : lead
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
  window.dispatchEvent(new Event('mock-leads-updated'));
}