jest.mock('../application/services/LogService', () => ({
  __esModule: true,
  default: {
    log: jest.fn().mockResolvedValue(undefined),
    findAll: jest.fn().mockResolvedValue({ logs: [], total: 0, limit: 100, offset: 0 }),
  },
}));

import { Request, Response } from 'express';
import logController from '../presentation/controllers/LogController';
import logService from '../application/services/LogService';
import { AppError } from '../shared/errors/AppError';

const findAllMock = logService.findAll as jest.MockedFunction<typeof logService.findAll>;

function makeReq(query: Record<string, string> = {}): Request {
  return { query } as unknown as Request;
}

function makeRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('LogController.index — parsing dos filtros', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sem query, chama service com {} e responde 200', async () => {
    const res = makeRes();
    const next = jest.fn();

    await logController.index(makeReq(), res, next);

    expect(findAllMock).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('repassa userId, action, limit e offset', async () => {
    const res = makeRes();
    const next = jest.fn();

    await logController.index(
      makeReq({ userId: 'u-1', action: 'LOGIN', limit: '25', offset: '5' }),
      res,
      next,
    );

    expect(findAllMock).toHaveBeenCalledWith({
      userId: 'u-1',
      action: 'LOGIN',
      limit: 25,
      offset: 5,
    });
  });

  it('converte startDate e endDate em Date', async () => {
    const res = makeRes();
    const next = jest.fn();

    await logController.index(
      makeReq({ startDate: '2026-01-01', endDate: '2026-12-31' }),
      res,
      next,
    );

    const call = findAllMock.mock.calls[0][0]!;
    expect(call.startDate).toBeInstanceOf(Date);
    expect(call.endDate).toBeInstanceOf(Date);
    expect(call.startDate?.toISOString()).toContain('2026-01-01');
    expect(call.endDate?.toISOString()).toContain('2026-12-31');
  });

  it('startDate inválido → next() com AppError 400', async () => {
    const res = makeRes();
    const next = jest.fn();

    await logController.index(makeReq({ startDate: 'banana' }), res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(findAllMock).not.toHaveBeenCalled();
  });

  it('limit não-numérico → next() com AppError 400', async () => {
    const res = makeRes();
    const next = jest.fn();

    await logController.index(makeReq({ limit: 'abc' }), res, next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('offset negativo → next() com AppError 400', async () => {
    const res = makeRes();
    const next = jest.fn();

    await logController.index(makeReq({ offset: '-1' }), res, next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});
