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

const makeUser = (role: Role, id = 'user-1', teamId: string | null = 'team-1'): AuthUser =>
  ({ id, role, teamId });

describe('LeadService RBAC — findAll', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ATENDENTE deve filtrar por userId', async () => {
    await LeadServiceModule.findAll(makeUser(Role.ATENDENTE, 'user-abc', 'team-1'));
    expect(leadRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-abc' })
    );
  });

  it('GERENTE deve filtrar por teamId', async () => {
    await LeadServiceModule.findAll(makeUser(Role.GERENTE, 'user-mgr', 'team-xyz'));
    expect(leadRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ teamId: 'team-xyz' })
    );
  });

  it('ADMIN não deve ter filtro de scope', async () => {
    await LeadServiceModule.findAll(makeUser(Role.ADMIN, 'user-adm', null));
    const call = (leadRepository.findAll as jest.Mock).mock.calls[0][0];
    expect(call.userId).toBeUndefined();
    expect(call.teamId).toBeUndefined();
  });

  it('GERENTE_GERAL não deve ter filtro de scope', async () => {
    await LeadServiceModule.findAll(makeUser(Role.GERENTE_GERAL, 'user-gg', null));
    const call = (leadRepository.findAll as jest.Mock).mock.calls[0][0];
    expect(call.userId).toBeUndefined();
    expect(call.teamId).toBeUndefined();
  });

  it('GERENTE com teamId null não deve ter filtro de scope', async () => {
    await LeadServiceModule.findAll(makeUser(Role.GERENTE, 'user-mgr', null));
    const call = (leadRepository.findAll as jest.Mock).mock.calls[0][0];
    expect(call.userId).toBeUndefined();
    expect(call.teamId).toBeUndefined();
  });
});
