import { Role, AuthUser } from '../shared/types';

jest.mock('../infrastructure/repositories/LeadRepository', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByUserId: jest.fn().mockResolvedValue([]),
    findByTeamId: jest.fn().mockResolvedValue([]),
  },
}));

import leadRepository from '../infrastructure/repositories/LeadRepository';
import LeadServiceModule from '../application/services/LeadService';

const makeUser = (
  role: Role,
  id = 'user-1',
  teamId: string | null = 'team-1',
  storeId: string | null = 'store-1',
): AuthUser => ({ id, role, teamId, storeId });

describe('LeadService RBAC — findAll', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ATENDENTE deve filtrar por userId', async () => {
    await LeadServiceModule.findAll(makeUser(Role.ATENDENTE, 'user-abc', 'team-1', 'store-1'));
    expect(leadRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-abc' })
    );
  });

  it('LIDER_EQUIPE deve filtrar por teamId', async () => {
    await LeadServiceModule.findAll(makeUser(Role.LIDER_EQUIPE, 'user-ldr', 'team-xyz', 'store-1'));
    expect(leadRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ teamId: 'team-xyz' })
    );
  });

  it('GERENTE deve filtrar por storeId', async () => {
    await LeadServiceModule.findAll(makeUser(Role.GERENTE, 'user-mgr', 'team-xyz', 'store-abc'));
    expect(leadRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ storeId: 'store-abc' })
    );
  });

  it('ADMIN não deve ter filtro de scope', async () => {
    await LeadServiceModule.findAll(makeUser(Role.ADMIN, 'user-adm', null, null));
    const call = (leadRepository.findAll as jest.Mock).mock.calls[0][0];
    expect(call.userId).toBeUndefined();
    expect(call.teamId).toBeUndefined();
    expect(call.storeId).toBeUndefined();
  });

  it('GERENTE_GERAL não deve ter filtro de scope', async () => {
    await LeadServiceModule.findAll(makeUser(Role.GERENTE_GERAL, 'user-gg', null, null));
    const call = (leadRepository.findAll as jest.Mock).mock.calls[0][0];
    expect(call.userId).toBeUndefined();
    expect(call.teamId).toBeUndefined();
    expect(call.storeId).toBeUndefined();
  });

  it('GERENTE com storeId null não deve ter filtro de scope', async () => {
    await LeadServiceModule.findAll(makeUser(Role.GERENTE, 'user-mgr', 'team-1', null));
    const call = (leadRepository.findAll as jest.Mock).mock.calls[0][0];
    expect(call.userId).toBeUndefined();
    expect(call.teamId).toBeUndefined();
    expect(call.storeId).toBeUndefined();
  });

  it('LIDER_EQUIPE com teamId null não deve ter filtro de scope', async () => {
    await LeadServiceModule.findAll(makeUser(Role.LIDER_EQUIPE, 'user-ldr', null, 'store-1'));
    const call = (leadRepository.findAll as jest.Mock).mock.calls[0][0];
    expect(call.userId).toBeUndefined();
    expect(call.teamId).toBeUndefined();
    expect(call.storeId).toBeUndefined();
  });
});
