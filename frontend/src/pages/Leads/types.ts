import { LeadStage } from './utils/leadStageValidator';

export type LeadStatus =
  | 'Novo Lead'
  | 'Contato'
  | 'Proposta'
  | 'Negociação'
  | 'Fechado';

export interface Lead {
  id: string;
  leadNumber?: string;
  name: string;
  avatar: string;
  car: string;
  carImage: string;
  price: number;

  stage: LeadStage;
  status: LeadStatus;

  timeAgo: string;
  statusUpdatedAt: string;

  origin?: string;
  phone?: string;
  city?: string;
  isVerified?: boolean;
  hasAlert?: boolean;

  storeId?: string;
  storeName?: string;
  teamId?: string;
  teamName?: string;
  userId?: string;
  userName?: string;
}

export interface KanbanCol {
  id: LeadStage;
  title: string;
  totalValue: number;
  headerColor: string;
  leads: Lead[];
}
