import leadRepository, { LeadFilter } from '../../infrastructure/repositories/LeadRepository';
import { AppError } from '../../shared/errors/AppError';
import { validateStageTransition } from '../../domain/entities/LeadStage';
import { AuthUser, Role } from '../../shared/types';
import { Lead } from '@prisma/client';

class LeadService {
  async findAll(user: AuthUser, startDate?: Date, endDate?: Date): Promise<Lead[]> {
    const filter: LeadFilter = {};
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;

    if (user.role === Role.ATENDENTE) {
      filter.userId = user.id;
    } else if (user.role === Role.LIDER_EQUIPE && user.teamId) {
      filter.teamId = user.teamId;
    } else if (user.role === Role.GERENTE && user.storeId) {
      filter.storeId = user.storeId;
    }
    // GERENTE_GERAL e ADMIN: sem filtro de scope

    return leadRepository.findAll(filter);
  }

  async findById(id: string, user: AuthUser): Promise<Lead> {
    const lead = await leadRepository.findById(id);
    if (!lead) throw new AppError('Lead não encontrado', 404);
    this.assertCanAccessLead(user, lead);
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
    userId: string;
    teamId: string;
    storeId: string;
    name?: string;
    phone?: string;
    clientId?: string;
  }): Promise<Lead> {
    return leadRepository.create({
      status: 'novo_lead',
      origin: data.origin as any,
      ...(data.name  && { name: data.name }),
      ...(data.phone && { phone: data.phone }),
      user:  { connect: { id: data.userId } },
      team:  { connect: { id: data.teamId } },
      store: { connect: { id: data.storeId } },
      ...(data.clientId && { client: { connect: { id: data.clientId } } }),
    });
  }

  async update(
    id: string,
    user: AuthUser,
    data: {
      status?: string;
      closingReason?: string;
      name?: string;
      phone?: string;
      origin?: string;
      clientId?: string;
      userId?: string;
      teamId?: string;
      storeId?: string;
    },
  ): Promise<Lead> {
    const existing = await this.findById(id, user);

    if (data.status && data.status !== (existing as any).status) {
      validateStageTransition(
        (existing as any).status,
        data.status,
        data.closingReason,
      );
    }

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.closingReason !== undefined) updateData.closingReason = data.closingReason;
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.origin) updateData.origin = data.origin;
    if (data.clientId) updateData.client = { connect: { id: data.clientId } };
    if (data.userId) updateData.user = { connect: { id: data.userId } };
    if (data.teamId) updateData.team = { connect: { id: data.teamId } };
    if (data.storeId) updateData.store = { connect: { id: data.storeId } };

    return leadRepository.update(id, updateData);
  }

  async delete(id: string, user: AuthUser): Promise<Lead> {
    await this.findById(id, user);
    return leadRepository.delete(id);
  }

  /**
   * Bloqueia acesso a leads fora do escopo do usuário.
   * Espelha exatamente o filtro aplicado em findAll para manter
   * a regra de RBAC consistente entre listagem e acesso por ID.
   */
  private assertCanAccessLead(user: AuthUser, lead: Lead): void {
    if (user.role === Role.ADMIN || user.role === Role.GERENTE_GERAL) return;

    if (user.role === Role.ATENDENTE) {
      if (lead.userId !== user.id) throw new AppError('Acesso negado a este lead', 403);
      return;
    }

    if (user.role === Role.LIDER_EQUIPE) {
      if (!user.teamId || lead.teamId !== user.teamId) {
        throw new AppError('Acesso negado a este lead', 403);
      }
      return;
    }

    if (user.role === Role.GERENTE) {
      if (!user.storeId || lead.storeId !== user.storeId) {
        throw new AppError('Acesso negado a este lead', 403);
      }
      return;
    }

    throw new AppError('Acesso negado a este lead', 403);
  }
}

export default new LeadService();
