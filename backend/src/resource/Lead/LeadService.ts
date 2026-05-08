import leadRepository from '../../infrastructure/repositories/LeadRepository';
import { AppError } from '../../shared/errors/AppError';
import { Lead } from '@prisma/client';

const FLOW_ORDER = [
  'Novo Lead',
  'Contato Realizado',
  'Proposta Enviada',
  'Em Negociação',
  'Vendido'
];

function getStageIndex(status: string): number {
  return FLOW_ORDER.indexOf(status);
}

class LeadService {
  async findAll(): Promise<Lead[]> {
    return leadRepository.findAll();
  }

  async findById(id: string): Promise<Lead> {
    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new AppError('Lead não encontrado', 404);
    }
    return lead;
  }

  async findByUserId(userId: string): Promise<Lead[]> {
    return leadRepository.findByUserId(userId);
  }

  async findByTeamId(teamId: string): Promise<Lead[]> {
    return leadRepository.findByTeamId(teamId);
  }

  async create(data: {
    origin: string;
    name?: string;
    phone?: string;
    status?: string;
    clientId?: string;
    sourceId?: string;
    userId: string;
    teamId: string;
    storeId?: string; 
}): Promise<Lead> {
    return leadRepository.create({
      origin: data.origin as any,
      name: data.name,
      phone: data.phone,
      status: data.status || 'Novo Lead',
      ...(data.clientId ? { client: { connect: { id: data.clientId } } } : {}),
      ...(data.sourceId ? { source: { connect: { id: data.sourceId } } } : {}),
      user: { connect: { id: data.userId } },
      team: { connect: { id: data.teamId } },
      store: { connect: { id: data.storeId } },
    });
  }

  async update(id: string, data: {
    origin?: string;
    name?: string;
    phone?: string;
    status?: string;
    justification?: string; 
    clientId?: string;
    sourceId?: string;
    userId?: string;
    teamId?: string;
    storeId?: string;
  }): Promise<Lead> {


    const lead = await this.findById(id);

  const currentStatus = lead.status || 'Novo Lead';
  const newStatus = data.status;

  // ================================
  //  VALIDAÇÃO DE FLUXO
  // ================================
  if (newStatus && newStatus !== currentStatus) {

    const currentIndex = getStageIndex(currentStatus);
    const newIndex = getStageIndex(newStatus);

    //  status inválido
    if (newIndex === -1) {
      throw new AppError('Status inválido', 400);
    }

    //  pular etapas
    if (newIndex > currentIndex + 1) {
      if (!data.justification) {
        throw new AppError(
          'Não é permitido pular etapas sem justificativa',
          400
        );
      }
    }

    //  voltar etapa
    if (newIndex < currentIndex) {
      throw new AppError(
        'Não é permitido retroceder etapas',
        400
      );
    }

    // fechar sem completar fluxo
    if (newStatus === 'Vendido' && currentIndex < FLOW_ORDER.length - 2) {
      throw new AppError(
        'Lead não pode ser fechado sem passar por todas as etapas',
        400
      );
    }
  }



    const updateData: any = {};
    if (data.origin)   updateData.origin = data.origin;
    if (data.name)     updateData.name = data.name;
    if (data.phone)    updateData.phone = data.phone;
    if (data.status)   updateData.status = data.status;
    if (data.clientId) updateData.client = { connect: { id: data.clientId } };
    if (data.sourceId) updateData.source = { connect: { id: data.sourceId } };
    if (data.userId)   updateData.user   = { connect: { id: data.userId } };
    if (data.teamId)   updateData.team   = { connect: { id: data.teamId } };
    if (data.storeId)  updateData.store  = { connect: { id: data.storeId } };
    return leadRepository.update(id, updateData);
  }

  async delete(id: string): Promise<Lead> {
    await this.findById(id);
    return leadRepository.delete(id);
  }
}

export default new LeadService();