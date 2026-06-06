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

import { LoginService } from '../application/services/LoginService';
import { AppError } from '../shared/errors/AppError';
import { comparePassword } from '../shared/utils/hash';
import { generateToken } from '../shared/utils/jwt';
import logService from '../application/services/LogService';
import { IUserRepository } from '../domain/interfaces/IUserRepository';
import { Role } from '../shared/types';

const compareMock = comparePassword as jest.MockedFunction<typeof comparePassword>;
const generateTokenMock = generateToken as jest.MockedFunction<typeof generateToken>;
const logMock = logService.log as jest.MockedFunction<typeof logService.log>;

function makeRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  } as unknown as IUserRepository;
}

const validUser = {
  id: 'user-1',
  name: 'Teodoro',
  email: 'teo@valle.com',
  password: 'hashed-pwd',
  role: Role.ATENDENTE,
  teamId: 'team-1',
  storeId: 'store-1',
};

describe('LoginService.execute', () => {
  beforeEach(() => jest.clearAllMocks());

  async function expectInvalidCredentials(promise: Promise<unknown>) {
    let caught: unknown;
    try {
      await promise;
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(AppError);
    expect((caught as AppError).statusCode).toBe(401);
    expect((caught as AppError).message).toBe('E-mail ou senha inválidos');
  }

  describe('credenciais inválidas devem lançar AppError com status 401', () => {
    it('quando email é vazio', async () => {
      const repo = makeRepo();
      const service = new LoginService(repo);

      await expectInvalidCredentials(service.execute('', 'qualquer'));
      expect(repo.findByEmail).not.toHaveBeenCalled();
    });

    it('quando password é vazio', async () => {
      const repo = makeRepo();
      const service = new LoginService(repo);

      await expectInvalidCredentials(service.execute('teo@valle.com', ''));
      expect(repo.findByEmail).not.toHaveBeenCalled();
    });

    it('quando usuário não existe', async () => {
      const repo = makeRepo({
        findByEmail: jest.fn().mockResolvedValue(null),
      });
      const service = new LoginService(repo);

      await expectInvalidCredentials(service.execute('inexistente@valle.com', 'qualquer'));
      expect(compareMock).not.toHaveBeenCalled();
    });

    it('quando senha não confere', async () => {
      const repo = makeRepo({
        findByEmail: jest.fn().mockResolvedValue(validUser as any),
      });
      compareMock.mockResolvedValue(false);
      const service = new LoginService(repo);

      await expectInvalidCredentials(service.execute(validUser.email, 'errada'));
      expect(generateTokenMock).not.toHaveBeenCalled();
      expect(logMock).not.toHaveBeenCalled();
    });
  });

  describe('credenciais válidas', () => {
    it('deve retornar token e dados do usuário sem expor a senha', async () => {
      const repo = makeRepo({
        findByEmail: jest.fn().mockResolvedValue(validUser as any),
      });
      compareMock.mockResolvedValue(true);
      const service = new LoginService(repo);

      const result = await service.execute(validUser.email, 'senha-correta');

      expect(result.token).toBe('signed.jwt.token');
      expect(result.user).toEqual({
        id: validUser.id,
        name: validUser.name,
        email: validUser.email,
        role: validUser.role,
        teamId: validUser.teamId,
        storeId: validUser.storeId,
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('deve registrar log de LOGIN com o id do usuário', async () => {
      const repo = makeRepo({
        findByEmail: jest.fn().mockResolvedValue(validUser as any),
      });
      compareMock.mockResolvedValue(true);
      const service = new LoginService(repo);

      await service.execute(validUser.email, 'senha-correta');

      expect(logMock).toHaveBeenCalledWith(validUser.id, 'LOGIN', 'User', validUser.id);
    });

    it('deve gerar token com payload contendo sub, role, teamId e storeId', async () => {
      const repo = makeRepo({
        findByEmail: jest.fn().mockResolvedValue(validUser as any),
      });
      compareMock.mockResolvedValue(true);
      const service = new LoginService(repo);

      await service.execute(validUser.email, 'senha-correta');

      expect(generateTokenMock).toHaveBeenCalledWith({
        sub: validUser.id,
        role: validUser.role,
        teamId: validUser.teamId,
        storeId: validUser.storeId,
      });
    });

    it('deve mandar teamId e storeId como null quando o usuário não tem (ex.: ADMIN)', async () => {
      const adminUser = { ...validUser, role: Role.ADMIN, teamId: null, storeId: null };
      const repo = makeRepo({
        findByEmail: jest.fn().mockResolvedValue(adminUser as any),
      });
      compareMock.mockResolvedValue(true);
      const service = new LoginService(repo);

      await service.execute(adminUser.email, 'senha-correta');

      expect(generateTokenMock).toHaveBeenCalledWith(
        expect.objectContaining({ teamId: null, storeId: null }),
      );
    });
  });
});
