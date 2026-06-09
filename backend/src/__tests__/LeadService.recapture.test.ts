import { Role, AuthUser } from '../shared/types';

jest.mock('../infrastructure/repositories/LeadRepository', () => ({
  __esModule: true,
  default: {
    findForRecapture: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
  },
}));

import leadRepository from '../infrastructure/repositories/LeadRepository';
import LeadServiceModule from '../application/services/LeadService';
import { LeadService } from '../application/services/LeadService';
import { AppError } from '../shared/errors/AppError';

const u = (role: Role, id = 'u1', teamId: string | null = 't1'): AuthUser => ({
  id, role, teamId, storeId: 's1',
});

describe('LeadService — cutoffDateFromDays', () => {
  it('30 dias antes de hoje retorna timestamp corretamente', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    const cutoff = LeadService.cutoffDateFromDays(30, now);
    expect(cutoff.toISOString()).toBe('2026-05-16T12:00:00.000Z');
  });

  it('rejeita days fora do intervalo (0)', () => {
    expect(() => LeadService.cutoffDateFromDays(0)).toThrow(AppError);
  });

  it('rejeita days fora do intervalo (366)', () => {
    expect(() => LeadService.cutoffDateFromDays(366)).toThrow(AppError);
  });

  it('rejeita NaN', () => {
    expect(() => LeadService.cutoffDateFromDays(NaN)).toThrow(AppError);
  });
});

describe('LeadService — findForRecapture (RBAC)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ATENDENTE filtra por userId', async () => {
    await LeadServiceModule.findForRecapture(u(Role.ATENDENTE, 'user-abc'), 30);
    const call = (leadRepository.findForRecapture as jest.Mock).mock.calls[0][0];
    expect(call.userId).toBe('user-abc');
    expect(call.teamId).toBeUndefined();
  });

  it('LIDER_EQUIPE filtra por teamId', async () => {
    await LeadServiceModule.findForRecapture(u(Role.LIDER_EQUIPE, 'u', 'team-xyz'), 30);
    const call = (leadRepository.findForRecapture as jest.Mock).mock.calls[0][0];
    expect(call.teamId).toBe('team-xyz');
    expect(call.userId).toBeUndefined();
  });

  it('GERENTE filtra por teamId (consistente com LeadService.findAll)', async () => {
    await LeadServiceModule.findForRecapture(u(Role.GERENTE, 'u', 'team-xyz'), 30);
    const call = (leadRepository.findForRecapture as jest.Mock).mock.calls[0][0];
    expect(call.teamId).toBe('team-xyz');
  });

  it('ADMIN não filtra por escopo', async () => {
    await LeadServiceModule.findForRecapture(u(Role.ADMIN, 'u', null), 30);
    const call = (leadRepository.findForRecapture as jest.Mock).mock.calls[0][0];
    expect(call.userId).toBeUndefined();
    expect(call.teamId).toBeUndefined();
  });

  it('GERENTE_GERAL não filtra por escopo', async () => {
    await LeadServiceModule.findForRecapture(u(Role.GERENTE_GERAL, 'u', null), 30);
    const call = (leadRepository.findForRecapture as jest.Mock).mock.calls[0][0];
    expect(call.userId).toBeUndefined();
    expect(call.teamId).toBeUndefined();
  });

  it('passa cutoffDate calculado para o repository', async () => {
    const before = new Date();
    await LeadServiceModule.findForRecapture(u(Role.ADMIN), 60);
    const after = new Date();
    const call = (leadRepository.findForRecapture as jest.Mock).mock.calls[0][0];
    const expected = new Date(before.getTime() - 60 * 24 * 60 * 60 * 1000);
    const got = call.cutoffDate as Date;
    expect(got.getTime()).toBeLessThanOrEqual(after.getTime() - 60 * 24 * 60 * 60 * 1000 + 1000);
    expect(got.getTime()).toBeGreaterThanOrEqual(expected.getTime() - 1000);
  });

  it('propaga erro se days inválido', async () => {
    await expect(
      LeadServiceModule.findForRecapture(u(Role.ADMIN), 0),
    ).rejects.toThrow(AppError);
  });
});

describe('LeadService — markContacted', () => {
  beforeEach(() => jest.clearAllMocks());

  it('atualiza lastContactedAt para agora', async () => {
    (leadRepository.findById as jest.Mock).mockResolvedValue({
      id: 'lead-1',
      userId: 'user-abc',
      teamId: 't1',
      storeId: 's1',
      status: 'contato',
    });
    (leadRepository.update as jest.Mock).mockResolvedValue({ id: 'lead-1' });

    const before = Date.now();
    await LeadServiceModule.markContacted('lead-1', u(Role.ATENDENTE, 'user-abc'));
    const after = Date.now();

    const call = (leadRepository.update as jest.Mock).mock.calls[0];
    expect(call[0]).toBe('lead-1');
    const updateData = call[1] as { lastContactedAt: Date };
    expect(updateData.lastContactedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(updateData.lastContactedAt.getTime()).toBeLessThanOrEqual(after);
  });

  it('ATENDENTE de outro usuário recebe 403', async () => {
    (leadRepository.findById as jest.Mock).mockResolvedValue({
      id: 'lead-1',
      userId: 'outro-user',
      teamId: 't1',
      storeId: 's1',
      status: 'contato',
    });

    await expect(
      LeadServiceModule.markContacted('lead-1', u(Role.ATENDENTE, 'user-abc')),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('lead fechado bloqueia registro de contato', async () => {
    (leadRepository.findById as jest.Mock).mockResolvedValue({
      id: 'lead-1',
      userId: 'user-abc',
      teamId: 't1',
      storeId: 's1',
      status: 'fechado',
    });

    await expect(
      LeadServiceModule.markContacted('lead-1', u(Role.ATENDENTE, 'user-abc')),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('lead inexistente retorna 404', async () => {
    (leadRepository.findById as jest.Mock).mockResolvedValue(null);
    await expect(
      LeadServiceModule.markContacted('inexistente', u(Role.ADMIN)),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
