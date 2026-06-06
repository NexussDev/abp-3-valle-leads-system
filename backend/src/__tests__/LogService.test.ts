jest.mock('../infrastructure/repositories/LogRepository', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue({}),
    findAll: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  },
}));

import logRepository from '../infrastructure/repositories/LogRepository';
import logService from '../application/services/LogService';
import { AppError } from '../shared/errors/AppError';

const repoMock = logRepository as jest.Mocked<typeof logRepository>;

async function captureError(promise: Promise<unknown>): Promise<AppError | undefined> {
  try {
    await promise;
  } catch (err) {
    return err as AppError;
  }
  return undefined;
}

describe('LogService.log', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cria o registro no repositório', async () => {
    await logService.log('user-1', 'LOGIN', 'User', 'user-1');
    expect(repoMock.create).toHaveBeenCalledWith({
      userId: 'user-1',
      action: 'LOGIN',
      entity: 'User',
      entityId: 'user-1',
    });
  });

  it('não propaga erro do repositório (operação principal nunca pode quebrar)', async () => {
    repoMock.create.mockRejectedValueOnce(new Error('db offline'));
    await expect(logService.log('u', 'CREATE', 'Lead', 'l')).resolves.toBeUndefined();
  });
});

describe('LogService.findAll', () => {
  beforeEach(() => jest.clearAllMocks());

  it('aplica defaults de limit=100 e offset=0 quando nada é informado', async () => {
    await logService.findAll();
    expect(repoMock.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100, offset: 0, filter: {} }),
    );
    expect(repoMock.count).toHaveBeenCalledWith({});
  });

  it('propaga filtros (userId, action, startDate, endDate) para o repositório', async () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-12-31T23:59:59Z');

    await logService.findAll({
      userId: 'user-1',
      action: 'LOGIN',
      startDate: start,
      endDate: end,
      limit: 50,
      offset: 10,
    });

    expect(repoMock.findAll).toHaveBeenCalledWith({
      limit: 50,
      offset: 10,
      filter: { userId: 'user-1', action: 'LOGIN', startDate: start, endDate: end },
    });
    expect(repoMock.count).toHaveBeenCalledWith({
      userId: 'user-1',
      action: 'LOGIN',
      startDate: start,
      endDate: end,
    });
  });

  it('limita o limit ao máximo (500)', async () => {
    await logService.findAll({ limit: 9999 });
    expect(repoMock.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 500 }),
    );
  });

  it('limit < 1 cai para 1', async () => {
    await logService.findAll({ limit: 0 });
    expect(repoMock.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 1 }),
    );
  });

  it('offset negativo cai para 0', async () => {
    await logService.findAll({ offset: -5 });
    expect(repoMock.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 0 }),
    );
  });

  it('rejeita startDate > endDate com AppError 400', async () => {
    const err = await captureError(
      logService.findAll({
        startDate: new Date('2026-12-31'),
        endDate: new Date('2026-01-01'),
      }),
    );
    expect(err).toBeInstanceOf(AppError);
    expect(err?.statusCode).toBe(400);
  });

  it('retorna logs, total, limit e offset', async () => {
    repoMock.findAll.mockResolvedValueOnce([{ id: 'l1' }] as any);
    repoMock.count.mockResolvedValueOnce(1);

    const result = await logService.findAll({ limit: 10, offset: 0 });
    expect(result).toEqual({
      logs: [{ id: 'l1' }],
      total: 1,
      limit: 10,
      offset: 0,
    });
  });
});
