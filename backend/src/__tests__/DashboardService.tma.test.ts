// Garante que o cálculo de TMA pelo DashboardService:
//   1. ignora leads sem mudança de status (vão pra "leadsSemAtendimento")
//   2. retorna null quando nenhum lead foi atendido
//   3. media corretamente quando há mistura

jest.mock('../infrastructure/database/prisma', () => ({
  __esModule: true,
  default: {
    lead: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn(),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    negotiation: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    store: { findMany: jest.fn().mockResolvedValue([]) },
    user:  { findMany: jest.fn().mockResolvedValue([]) },
    team:  { findMany: jest.fn().mockResolvedValue([]) },
  },
}));

import prisma from '../infrastructure/database/prisma';
import dashboardService from '../application/services/DashboardService';
import { Role, AuthUser } from '../shared/types';

const admin: AuthUser = { id: 'a', role: Role.ADMIN, teamId: null, storeId: null };
const range = {
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
};

describe('DashboardService — tempoMedioAtendimentoHoras', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna null quando nenhum lead foi atendido', async () => {
    (prisma.lead.findMany as jest.Mock).mockResolvedValue([]);
    const result = await dashboardService.getOperacional(admin, range);
    expect(result.tempoMedioAtendimentoHoras).toBeNull();
    expect(result.leadsSemAtendimento).toBe(0);
  });

  it('calcula média correta com dois leads atendidos (2h e 4h)', async () => {
    const createdA = new Date('2026-06-01T10:00:00Z');
    const createdB = new Date('2026-06-01T10:00:00Z');
    (prisma.lead.findMany as jest.Mock).mockResolvedValue([
      {
        id: '1',
        createdAt: createdA,
        negotiation: {
          history: [{ changedAt: new Date(createdA.getTime() + 2 * 3600_000) }],
        },
      },
      {
        id: '2',
        createdAt: createdB,
        negotiation: {
          history: [{ changedAt: new Date(createdB.getTime() + 4 * 3600_000) }],
        },
      },
    ]);
    const result = await dashboardService.getOperacional(admin, range);
    expect(result.tempoMedioAtendimentoHoras).toBe('3.0');
    expect(result.leadsSemAtendimento).toBe(0);
  });

  it('leads sem histórico vão para leadsSemAtendimento e não contam no TMA', async () => {
    const created = new Date('2026-06-01T10:00:00Z');
    (prisma.lead.findMany as jest.Mock).mockResolvedValue([
      {
        id: '1',
        createdAt: created,
        negotiation: { history: [{ changedAt: new Date(created.getTime() + 6 * 3600_000) }] },
      },
      { id: '2', createdAt: created, negotiation: null },
      { id: '3', createdAt: created, negotiation: { history: [] } },
    ]);
    const result = await dashboardService.getOperacional(admin, range);
    expect(result.tempoMedioAtendimentoHoras).toBe('6.0');
    expect(result.leadsSemAtendimento).toBe(2);
  });

  it('inclui count de leadsParaRepescar e repescagemDias=30', async () => {
    (prisma.lead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.lead.count as jest.Mock).mockResolvedValue(7);
    const result = await dashboardService.getOperacional(admin, range);
    expect(result.repescagemDias).toBe(30);
    expect(result.leadsParaRepescar).toBe(7);
  });
});
