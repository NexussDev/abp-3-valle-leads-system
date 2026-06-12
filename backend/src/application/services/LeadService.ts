import leadRepository, { LeadFilter, RecaptureFilter } from '../../infrastructure/repositories/LeadRepository';
import { AppError } from '../../shared/errors/AppError';
import { validateStageTransition } from '../../domain/entities/LeadStage';
import { AuthUser, Role } from '../../shared/types';
import { Lead } from '@prisma/client';
import prisma from '../../infrastructure/database/prisma';

export interface LeadHistoryEntry {
  id: string;
  field: 'create' | 'stage' | 'status' | 'update';
  oldValue?: string;
  newValue: string;
  updatedAt: string;
  responsibleName: string;
}

const ACTION_LABEL: Record<string, string> = {
  CREATE:  'Criou o lead',
  UPDATE:  'Atualizou o lead',
  APPROVE: 'Aprovou',
  REJECT:  'Rejeitou',
  SOLD:    'Marcou como vendido',
  DELETE:  'Excluiu',
  CONTACT: 'Registrou contato',
  LOGIN:   'Fez login',
};

const MIN_RECAPTURE_DAYS = 1;
const MAX_RECAPTURE_DAYS = 365;
export const DEFAULT_RECAPTURE_DAYS = 30;

export class LeadService {
  async findAll(user: AuthUser, startDate?: Date, endDate?: Date): Promise<Lead[]> {
    const filter: LeadFilter = {};
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;

    if (user.role === Role.ATENDENTE) {
      filter.userId = user.id;
    } else if (user.role === Role.LIDER_EQUIPE && user.teamId) {
      filter.teamId = user.teamId;
    } else if (user.role === Role.GERENTE && user.teamId) {
      filter.teamId = user.teamId;
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

  /**
   * Timeline unificada do lead, combinando duas fontes:
   *  - SystemLog (CREATE/UPDATE/APPROVE/...) — traz quem fez via relation user
   *  - NegotiationHistory (transições de stage/status) — não tem usuário no schema,
   *    rotulamos como "Sistema" ou correlacionamos por timestamp aproximado.
   *
   * Ordenação descendente por timestamp.
   */
  async findHistory(id: string, user: AuthUser): Promise<LeadHistoryEntry[]> {
    // Valida acesso primeiro
    await this.findById(id, user);

    const [systemLogs, negotiationHistory] = await Promise.all([
      prisma.systemLog.findMany({
        where: { entity: 'Lead', entityId: id },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.negotiationHistory.findMany({
        where: { negotiation: { leadId: id } },
        orderBy: { changedAt: 'desc' },
      }),
    ]);

    const entries: LeadHistoryEntry[] = [];

    for (const log of systemLogs) {
      const label = ACTION_LABEL[log.action] ?? log.action;
      entries.push({
        id: `log-${log.id}`,
        field: log.action === 'CREATE' ? 'create' : 'update',
        newValue: label,
        updatedAt: log.createdAt.toISOString(),
        responsibleName: log.user?.name ?? 'Sistema',
      });
    }

    for (const h of negotiationHistory) {
      const when = (h.changedAt ?? new Date()).toISOString();
      // Tenta achar um SystemLog próximo (~5s) para creditar o usuário.
      // Como NegotiationHistory não tem userId, fazemos esse "best-effort match".
      const nearby = systemLogs.find(
        l => Math.abs(l.createdAt.getTime() - (h.changedAt?.getTime() ?? 0)) < 5_000,
      );
      const responsibleName = nearby?.user?.name ?? 'Sistema';

      if (h.newStage && h.newStage !== h.oldStage) {
        entries.push({
          id: `stage-${h.id}`,
          field: 'stage',
          oldValue: h.oldStage ?? undefined,
          newValue: h.newStage,
          updatedAt: when,
          responsibleName,
        });
      }
      if (h.newStatus && h.newStatus !== h.oldStatus) {
        entries.push({
          id: `status-${h.id}`,
          field: 'status',
          oldValue: h.oldStatus ?? undefined,
          newValue: h.newStatus,
          updatedAt: when,
          responsibleName,
        });
      }
    }

    return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
  importance?: string;  // linha nova
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
    // Cria a Negotiation junto com o lead
    negotiation: {
      create: {
        importance: data.importance ?? 'morno',
        status: 'aberta',
        active: true,
      }
    },
  });
}

  async update(
    id: string,
    user: AuthUser,
    data: {
      status?: string;
      closingReason?: string;
      converted?: boolean;
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
    if (data.converted !== undefined) updateData.converted = data.converted;
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
   * Calcula data de corte para repescagem.
   * @throws AppError se days estiver fora dos limites [1, 365].
   */
  static cutoffDateFromDays(days: number, now: Date = new Date()): Date {
    if (!Number.isFinite(days) || days < MIN_RECAPTURE_DAYS || days > MAX_RECAPTURE_DAYS) {
      throw new AppError(
        `days deve estar entre ${MIN_RECAPTURE_DAYS} e ${MAX_RECAPTURE_DAYS}.`,
        400,
      );
    }
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    return cutoff;
  }

  /**
   * Lista leads "frios" — sem contato (ou criados, na ausência de contato)
   * há mais de N dias. Respeita o mesmo scope de RBAC de findAll.
   */
  async findForRecapture(user: AuthUser, days: number): Promise<Lead[]> {
    const cutoffDate = LeadService.cutoffDateFromDays(days);
    const filter: RecaptureFilter = { cutoffDate };

    if (user.role === Role.ATENDENTE) {
      filter.userId = user.id;
    } else if (
      (user.role === Role.LIDER_EQUIPE || user.role === Role.GERENTE) &&
      user.teamId
    ) {
      filter.teamId = user.teamId;
    }
    // GERENTE_GERAL e ADMIN: sem filtro adicional

    return leadRepository.findForRecapture(filter);
  }

  /**
   * Registra que o atendente entrou em contato com o lead.
   * Atualiza lastContactedAt = agora; respeita scope (mesmo de findById).
   */
  async markContacted(id: string, user: AuthUser): Promise<Lead> {
    const existing = await this.findById(id, user);
    if (existing.status === 'fechado') {
      throw new AppError('Não é possível registrar contato em lead fechado.', 400);
    }
    return leadRepository.update(id, { lastContactedAt: new Date() });
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

    if (user.role === Role.LIDER_EQUIPE || user.role === Role.GERENTE) {
      if (!user.teamId || lead.teamId !== user.teamId) {
        throw new AppError('Acesso negado a este lead', 403);
      }
      return;
    }

    throw new AppError('Acesso negado a este lead', 403);
  }
}

export default new LeadService();
