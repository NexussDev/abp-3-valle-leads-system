import { Role, AuthUser } from '../shared/types';
import { AppError } from '../shared/errors/AppError';

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
import leadService from '../application/services/LeadService';

const makeUser = (
  role: Role,
  id = 'user-1',
  teamId: string | null = 'team-1',
  storeId: string | null = 'store-1',
): AuthUser => ({ id, role, teamId, storeId });

function leadOwnedBy(overrides: Record<string, unknown> = {}) {
  return {
    id: 'lead-1',
    name: null,
    phone: null,
    status: 'novo_lead',
    origin: 'Site',
    closingReason: null,
    userId: 'owner-user',
    teamId: 'owner-team',
    storeId: 'owner-store',
    clientId: null,
    sourceId: null,
    carId: null,
    createdAt: new Date(),
    ...overrides,
  } as any;
}

const repoMock = leadRepository as jest.Mocked<typeof leadRepository>;

async function captureError(promise: Promise<unknown>): Promise<AppError> {
  try {
    await promise;
  } catch (err) {
    return err as AppError;
  }
  throw new Error('Expected promise to reject but it resolved');
}

describe('LeadService — escopo em acesso por ID', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('findById', () => {
    it('lança 404 quando o lead não existe', async () => {
      repoMock.findById.mockResolvedValue(null);
      const err = await captureError(
        leadService.findById('inexistente', makeUser(Role.ATENDENTE)),
      );
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(404);
    });

    it('ATENDENTE acessa o próprio lead', async () => {
      repoMock.findById.mockResolvedValue(
        leadOwnedBy({ userId: 'user-1' }),
      );
      const lead = await leadService.findById('lead-1', makeUser(Role.ATENDENTE, 'user-1'));
      expect(lead.id).toBe('lead-1');
    });

    it('ATENDENTE recebe 403 ao acessar lead de outro atendente', async () => {
      repoMock.findById.mockResolvedValue(
        leadOwnedBy({ userId: 'outro-user' }),
      );
      const err = await captureError(
        leadService.findById('lead-1', makeUser(Role.ATENDENTE, 'user-1')),
      );
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(403);
    });

    it('LIDER_EQUIPE acessa lead da própria equipe', async () => {
      repoMock.findById.mockResolvedValue(
        leadOwnedBy({ teamId: 'team-A' }),
      );
      const lead = await leadService.findById(
        'lead-1',
        makeUser(Role.LIDER_EQUIPE, 'user-ldr', 'team-A'),
      );
      expect(lead.id).toBe('lead-1');
    });

    it('LIDER_EQUIPE recebe 403 ao acessar lead de outra equipe', async () => {
      repoMock.findById.mockResolvedValue(
        leadOwnedBy({ teamId: 'team-B' }),
      );
      const err = await captureError(
        leadService.findById('lead-1', makeUser(Role.LIDER_EQUIPE, 'user-ldr', 'team-A')),
      );
      expect(err.statusCode).toBe(403);
    });

    it('LIDER_EQUIPE com teamId null recebe 403', async () => {
      repoMock.findById.mockResolvedValue(leadOwnedBy({ teamId: 'team-A' }));
      const err = await captureError(
        leadService.findById('lead-1', makeUser(Role.LIDER_EQUIPE, 'user-ldr', null)),
      );
      expect(err.statusCode).toBe(403);
    });

    it('GERENTE acessa lead da própria loja', async () => {
      repoMock.findById.mockResolvedValue(leadOwnedBy({ storeId: 'store-A' }));
      const lead = await leadService.findById(
        'lead-1',
        makeUser(Role.GERENTE, 'user-mgr', 'team-1', 'store-A'),
      );
      expect(lead.id).toBe('lead-1');
    });

    it('GERENTE recebe 403 ao acessar lead de outra loja', async () => {
      repoMock.findById.mockResolvedValue(leadOwnedBy({ storeId: 'store-B' }));
      const err = await captureError(
        leadService.findById('lead-1', makeUser(Role.GERENTE, 'user-mgr', 'team-1', 'store-A')),
      );
      expect(err.statusCode).toBe(403);
    });

    it('GERENTE_GERAL acessa qualquer lead', async () => {
      repoMock.findById.mockResolvedValue(
        leadOwnedBy({ userId: 'qualquer', teamId: 'qualquer', storeId: 'qualquer' }),
      );
      const lead = await leadService.findById(
        'lead-1',
        makeUser(Role.GERENTE_GERAL, 'user-gg', null, null),
      );
      expect(lead.id).toBe('lead-1');
    });

    it('ADMIN acessa qualquer lead', async () => {
      repoMock.findById.mockResolvedValue(
        leadOwnedBy({ userId: 'qualquer', teamId: 'qualquer', storeId: 'qualquer' }),
      );
      const lead = await leadService.findById(
        'lead-1',
        makeUser(Role.ADMIN, 'user-adm', null, null),
      );
      expect(lead.id).toBe('lead-1');
    });
  });

  describe('update', () => {
    it('ATENDENTE recebe 403 ao atualizar lead de outro atendente — repository.update não é chamado', async () => {
      repoMock.findById.mockResolvedValue(leadOwnedBy({ userId: 'outro-user' }));

      const err = await captureError(
        leadService.update('lead-1', makeUser(Role.ATENDENTE, 'user-1'), { name: 'novo nome' }),
      );

      expect(err.statusCode).toBe(403);
      expect(repoMock.update).not.toHaveBeenCalled();
    });

    it('ATENDENTE atualiza o próprio lead', async () => {
      repoMock.findById.mockResolvedValue(leadOwnedBy({ userId: 'user-1' }));
      repoMock.update.mockResolvedValue(leadOwnedBy({ userId: 'user-1', name: 'novo' }));

      const updated = await leadService.update(
        'lead-1',
        makeUser(Role.ATENDENTE, 'user-1'),
        { name: 'novo' },
      );

      expect(repoMock.update).toHaveBeenCalledTimes(1);
      expect(updated.id).toBe('lead-1');
    });

    it('LIDER_EQUIPE recebe 403 ao atualizar lead de outra equipe', async () => {
      repoMock.findById.mockResolvedValue(leadOwnedBy({ teamId: 'team-B' }));
      const err = await captureError(
        leadService.update(
          'lead-1',
          makeUser(Role.LIDER_EQUIPE, 'user-ldr', 'team-A'),
          { name: 'x' },
        ),
      );
      expect(err.statusCode).toBe(403);
      expect(repoMock.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('ATENDENTE recebe 403 ao deletar lead de outro atendente — repository.delete não é chamado', async () => {
      repoMock.findById.mockResolvedValue(leadOwnedBy({ userId: 'outro-user' }));

      const err = await captureError(
        leadService.delete('lead-1', makeUser(Role.ATENDENTE, 'user-1')),
      );

      expect(err.statusCode).toBe(403);
      expect(repoMock.delete).not.toHaveBeenCalled();
    });

    it('GERENTE_GERAL deleta qualquer lead', async () => {
      repoMock.findById.mockResolvedValue(leadOwnedBy());
      repoMock.delete.mockResolvedValue(leadOwnedBy());
      await leadService.delete('lead-1', makeUser(Role.GERENTE_GERAL, 'user-gg', null, null));
      expect(repoMock.delete).toHaveBeenCalledWith('lead-1');
    });
  });
});
