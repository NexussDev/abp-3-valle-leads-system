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
  } else if (
    (user.role === Role.LIDER_EQUIPE || user.role === Role.GERENTE) &&
    user.teamId
  ) {
    where.teamId = user.teamId;
  }
  // GERENTE_GERAL e ADMIN: sem filtro adicional
  return where;
}

/**
 * Tempo médio entre criação do lead e a primeira mudança de status.
 * Retorna null se nenhum lead teve mudança registrada.
 *
 * Considera apenas leads com pelo menos uma entrada em negotiation.history.
 * Leads sem atendimento não entram no cálculo (são reportados separadamente
 * via stat "Leads para repescar").
 */
async function computeTempoMedioAtendimento(
  where: Record<string, unknown>,
): Promise<{ horas: string | null; amostra: number; semAtendimento: number }> {
  const leads = await prisma.lead.findMany({
    where,
    include: {
      negotiation: {
        include: {
          history: { orderBy: { changedAt: 'asc' }, take: 1 },
        },
      },
    },
  });

  const diffsMs: number[] = [];
  let semAtendimento = 0;
  for (const l of leads as any[]) {
    const firstChange = l.negotiation?.history?.[0]?.changedAt as Date | undefined;
    if (firstChange && l.createdAt) {
      diffsMs.push(firstChange.getTime() - (l.createdAt as Date).getTime());
    } else {
      semAtendimento++;
    }
  }

  return {
    horas:
      diffsMs.length > 0
        ? (diffsMs.reduce((a, b) => a + b, 0) / diffsMs.length / 3_600_000).toFixed(1)
        : null,
    amostra: diffsMs.length,
    semAtendimento,
  };
}

/**
 * Conta leads "frios" no escopo atual — sem contato (ou criados, na ausência
 * de contato) há mais de `days` dias e ainda não fechados.
 */
async function countLeadsFrios(
  scope: Record<string, unknown>,
  days: number,
): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const baseScope: Record<string, unknown> = { ...scope };
  delete baseScope.createdAt; // repescagem ignora range; sempre olha "tempo desde último contato"

  return prisma.lead.count({
    where: {
      ...baseScope,
      status: { not: 'fechado' },
      OR: [
        { lastContactedAt: { lt: cutoff } },
        { AND: [{ lastContactedAt: null }, { createdAt: { lt: cutoff } }] },
      ],
    },
  });
}

const REPESCAGEM_DAYS = 30;

class DashboardService {
  async getOperacional(user: AuthUser, range: DateRange) {
    const where = buildLeadWhere(user, range);

    const [
      total,
      byStageRaw,
      byOriginRaw,
      byStoreRaw,
      negotiations,
      tma,
      leadsFrios,
    ] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.groupBy({ by: ['status'], where, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['origin'], where, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['storeId'], where, _count: { _all: true } }),
      prisma.negotiation.findMany({
        where: { lead: where },
        select: { importance: true },
      }),
      computeTempoMedioAtendimento(where),
      countLeadsFrios(where, REPESCAGEM_DAYS),
    ]);

    const storeIds = byStoreRaw.map(r => r.storeId).filter(Boolean) as string[];
    const stores = await prisma.store.findMany({ where: { id: { in: storeIds } } });

    const fechados = byStageRaw.find(s => s.status === 'fechado')?._count._all ?? 0;
    const convertidos = await prisma.lead.count({ where: { ...where, status: 'fechado', converted: true } });
    const conversao = fechados > 0 ? ((convertidos / fechados) * 100).toFixed(1) : '0';

    const byImportance = negotiations.reduce((acc, n) => {
      const key = n.importance ?? 'indefinido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      fechados,
      convertidos,
      conversao: `${conversao}%`,
      byStage: Object.fromEntries(byStageRaw.map(s => [s.status ?? 'indefinido', s._count._all])),
      byOrigin: Object.fromEntries(byOriginRaw.map(o => [o.origin, o._count._all])),
      byStore: byStoreRaw.map(r => ({
        store: stores.find(s => s.id === r.storeId)?.name ?? r.storeId,
        count: r._count._all,
      })),
      byImportance,
      tempoMedioAtendimentoHoras: tma.horas,
      leadsSemAtendimento: tma.semAtendimento,
      leadsParaRepescar: leadsFrios,
      repescagemDias: REPESCAGEM_DAYS,
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

    const convertidos = await prisma.lead.count({ where: { ...where, status: 'fechado', converted: true } });

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

    const tma = (() => {
      const diffsMs = (leadsWithHistory as any[])
        .filter(l => l.createdAt && l.negotiation?.history?.[0]?.changedAt)
        .map(
          l =>
            (l.negotiation.history[0].changedAt as Date).getTime() -
            (l.createdAt as Date).getTime(),
        );
      return diffsMs.length > 0
        ? (diffsMs.reduce((a, b) => a + b, 0) / diffsMs.length / 3_600_000).toFixed(1)
        : null;
    })();

    const semAtendimento = (leadsWithHistory as any[]).filter(
      l => !l.negotiation?.history?.[0]?.changedAt,
    ).length;

    const leadsParaRepescar = await countLeadsFrios(where, REPESCAGEM_DAYS);

    return {
      total,
      fechados,
      convertidos,
      naoConvertidos: fechados - convertidos,
      taxaConversao: fechados > 0 ? `${((convertidos / fechados) * 100).toFixed(1)}%` : '0%',
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
      tempoMedioAtendimentoHoras: tma,
      leadsSemAtendimento: semAtendimento,
      leadsParaRepescar,
      repescagemDias: REPESCAGEM_DAYS,
    };
  }
}

export default new DashboardService();