import prisma from '../../infrastructure/database/prisma';
import { AuthUser, Role } from '../../shared/types';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

function buildLeadWhere(user: AuthUser, range: DateRange) {
  const where: Record<string, unknown> = {
    createdAt: { gte: range.startDate, lte: range.endDate },
  };
  if (user.role === Role.ATENDENTE) {
    where.userId = user.id;
  } else if (user.role === Role.LIDER_EQUIPE && user.teamId) {
    where.teamId = user.teamId;
  } else if (user.role === Role.GERENTE && user.storeId) {
    where.storeId = user.storeId;
  }
  return where;
}

class DashboardService {
  async getOperacional(user: AuthUser, range: DateRange) {
    const where = buildLeadWhere(user, range);

    const [total, byStageRaw, byOriginRaw, byStoreRaw, negotiations] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.groupBy({ by: ['status'], where, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['origin'], where, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['storeId'], where, _count: { _all: true } }),
      prisma.negotiation.findMany({
        where: { lead: where },
        select: { importance: true },
      }),
    ]);

    const storeIds = byStoreRaw.map(r => r.storeId).filter(Boolean) as string[];
    const stores = await prisma.store.findMany({ where: { id: { in: storeIds } } });

    const fechados = byStageRaw.find(s => s.status === 'fechado')?._count._all ?? 0;
    const conversao = total > 0 ? ((fechados / total) * 100).toFixed(1) : '0';

    const byImportance = negotiations.reduce((acc, n) => {
      const key = n.importance ?? 'indefinido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      fechados,
      conversao: `${conversao}%`,
      byStage: Object.fromEntries(byStageRaw.map(s => [s.status ?? 'indefinido', s._count._all])),
      byOrigin: Object.fromEntries(byOriginRaw.map(o => [o.origin, o._count._all])),
      byStore: byStoreRaw.map(r => ({
        store: stores.find(s => s.id === r.storeId)?.name ?? r.storeId,
        count: r._count._all,
      })),
      byImportance,
    };
  }

  async getAnalytico(user: AuthUser, range: DateRange) {
    const where = buildLeadWhere(user, range);

    const [
      total,
      fechados,
      byAtendenteRaw,
      byEquipeRaw,
      negotiations,
      closingReasonsRaw,
      leadsWithHistory,
    ] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.count({ where: { ...where, status: 'fechado' } }),
      prisma.lead.groupBy({ by: ['userId'], where, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['teamId'], where, _count: { _all: true } }),
      prisma.negotiation.findMany({ where: { lead: where }, select: { importance: true } }),
      prisma.lead.groupBy({
        by: ['closingReason'],
        where: { ...where, status: 'fechado' },
        _count: { _all: true },
      }),
      prisma.lead.findMany({
        where,
        include: {
          negotiation: {
            include: {
              history: { orderBy: { changedAt: 'asc' }, take: 1 },
            },
          },
        },
      }),
    ]);

    const userIds = byAtendenteRaw.map(r => r.userId);
    const teamIds = byEquipeRaw.map(r => r.teamId);
    const [users, teams] = await Promise.all([
      prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } }),
      prisma.team.findMany({ where: { id: { in: teamIds } } }),
    ]);

    const byImportance = negotiations.reduce((acc, n) => {
      const key = n.importance ?? 'indefinido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timesMs = leadsWithHistory
      .filter((l: any) => l.createdAt && l.negotiation?.history?.[0]?.changedAt)
      .map((l: any) => (l.negotiation.history[0].changedAt as Date).getTime() - (l.createdAt as Date).getTime());

    const tempoMedioAtendimentoHoras =
      timesMs.length > 0
        ? (timesMs.reduce((a: number, b: number) => a + b, 0) / timesMs.length / 3_600_000).toFixed(1)
        : null;

    return {
      total,
      fechados,
      naoConvertidos: total - fechados,
      taxaConversao: total > 0 ? `${((fechados / total) * 100).toFixed(1)}%` : '0%',
      byAtendente: byAtendenteRaw.map(r => ({
        atendente: users.find(u => u.id === r.userId)?.name ?? r.userId,
        count: r._count._all,
      })),
      byEquipe: byEquipeRaw.map(r => ({
        equipe: teams.find(t => t.id === r.teamId)?.name ?? r.teamId,
        count: r._count._all,
      })),
      byImportance,
      closingReasons: closingReasonsRaw.map(r => ({
        motivo: r.closingReason ?? 'Sem motivo',
        count: r._count._all,
      })),
      tempoMedioAtendimentoHoras,
    };
  }
}

export default new DashboardService();
