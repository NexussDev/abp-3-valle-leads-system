jest.mock('../infrastructure/repositories/UserRepository', () => ({
  __esModule: true,
  default: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../shared/utils/hash', () => ({
  comparePassword: jest.fn(),
}));

jest.mock('../shared/utils/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('signed.jwt.token'),
}));

jest.mock('../application/services/LogService', () => ({
  __esModule: true,
  default: {
    log: jest.fn().mockResolvedValue(undefined),
    findAll: jest.fn(),
  },
}));

import { AuthController } from '../presentation/controllers/AuthController';
import { AppError } from '../shared/errors/AppError';
import UserRepository from '../infrastructure/repositories/UserRepository';
import { comparePassword } from '../shared/utils/hash';
import { Role } from '../shared/types';

const findByEmailMock = UserRepository.findByEmail as jest.MockedFunction<
  typeof UserRepository.findByEmail
>;
const compareMock = comparePassword as jest.MockedFunction<typeof comparePassword>;

function makeRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('AuthController.login → contrato com errorHandler', () => {
  let controller: AuthController;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController();
    next = jest.fn();
  });

  it('credenciais inválidas devem chamar next() com AppError(401) — não 500', async () => {
    findByEmailMock.mockResolvedValue(null);
    const req = { body: { email: 'nope@valle.com', password: 'errada' } } as any;
    const res = makeRes();

    await controller.login(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const forwarded = next.mock.calls[0][0];
    expect(forwarded).toBeInstanceOf(AppError);
    expect(forwarded.statusCode).toBe(401);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('body ausente (undefined) deve chamar next() com AppError(401)', async () => {
    const req = { body: undefined } as any;
    const res = makeRes();

    await controller.login(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
    expect(findByEmailMock).not.toHaveBeenCalled();
  });

  it('credenciais válidas devem responder 200 com token e não chamar next', async () => {
    findByEmailMock.mockResolvedValue({
      id: 'user-1',
      name: 'Teodoro',
      email: 'teo@valle.com',
      password: 'hash',
      role: Role.ATENDENTE,
      teamId: 'team-1',
      storeId: 'store-1',
    } as any);
    compareMock.mockResolvedValue(true);
    const req = { body: { email: 'teo@valle.com', password: 'senha-ok' } } as any;
    const res = makeRes();

    await controller.login(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'signed.jwt.token',
        user: expect.objectContaining({ id: 'user-1', email: 'teo@valle.com' }),
      }),
    );
  });
});
