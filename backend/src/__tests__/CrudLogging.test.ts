jest.mock('../application/services/LogService', () => ({
  __esModule: true,
  default: { log: jest.fn().mockResolvedValue(undefined), findAll: jest.fn() },
}));

jest.mock('../application/services/UserService', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMe: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../application/services/TeamService', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../application/services/ClientService', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import logService from '../application/services/LogService';
import userService from '../application/services/UserService';
import teamService from '../application/services/TeamService';
import clientService from '../application/services/ClientService';

import userController from '../presentation/controllers/UserController';
import teamController from '../presentation/controllers/TeamController';
import clientController from '../presentation/controllers/ClientController';
import { AuthController } from '../presentation/controllers/AuthController';

import { Request, Response } from 'express';
import { Role, AuthUser } from '../shared/types';

const logMock = logService.log as jest.MockedFunction<typeof logService.log>;
const userServiceMock = userService as jest.Mocked<typeof userService>;
const teamServiceMock = teamService as jest.Mocked<typeof teamService>;
const clientServiceMock = clientService as jest.Mocked<typeof clientService>;

const actor: AuthUser = { id: 'actor-1', role: Role.ADMIN, teamId: null, storeId: null };

function makeReq(overrides: Partial<{ body: any; params: any; user: AuthUser }> = {}): Request {
  return {
    body: overrides.body ?? {},
    params: overrides.params ?? {},
    user: overrides.user ?? actor,
    query: {},
  } as unknown as Request;
}

function makeRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('Logging — side-effects nos CRUDs', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('UserController', () => {
    it('store registra CREATE User', async () => {
      userServiceMock.create.mockResolvedValue({ id: 'new-user' } as any);
      const res = makeRes();
      await userController.store(makeReq({ body: { name: 'x' } }), res, jest.fn());
      expect(logMock).toHaveBeenCalledWith('actor-1', 'CREATE', 'User', 'new-user');
    });

    it('update registra UPDATE User com o id do path', async () => {
      userServiceMock.update.mockResolvedValue({ id: 'target' } as any);
      const res = makeRes();
      await userController.update(makeReq({ params: { id: 'target' } }), res, jest.fn());
      expect(logMock).toHaveBeenCalledWith('actor-1', 'UPDATE', 'User', 'target');
    });

    it('destroy registra DELETE User com o id do path', async () => {
      userServiceMock.delete.mockResolvedValue(undefined as any);
      const res = makeRes();
      await userController.destroy(makeReq({ params: { id: 'target' } }), res, jest.fn());
      expect(logMock).toHaveBeenCalledWith('actor-1', 'DELETE', 'User', 'target');
    });

    it('me registra UPDATE User com o próprio id', async () => {
      userServiceMock.updateMe.mockResolvedValue({ id: 'actor-1' } as any);
      const res = makeRes();
      await userController.me(makeReq(), res, jest.fn());
      expect(logMock).toHaveBeenCalledWith('actor-1', 'UPDATE', 'User', 'actor-1');
    });
  });

  describe('TeamController', () => {
    it('store registra CREATE Team', async () => {
      teamServiceMock.create.mockResolvedValue({ id: 'team-new' } as any);
      const res = makeRes();
      await teamController.store(makeReq({ body: { name: 'x' } }), res, jest.fn());
      expect(logMock).toHaveBeenCalledWith('actor-1', 'CREATE', 'Team', 'team-new');
    });

    it('update registra UPDATE Team', async () => {
      teamServiceMock.update.mockResolvedValue({ id: 'team-1' } as any);
      const res = makeRes();
      await teamController.update(makeReq({ params: { id: 'team-1' } }), res, jest.fn());
      expect(logMock).toHaveBeenCalledWith('actor-1', 'UPDATE', 'Team', 'team-1');
    });

    it('destroy registra DELETE Team', async () => {
      teamServiceMock.delete.mockResolvedValue({} as any);
      const res = makeRes();
      await teamController.destroy(makeReq({ params: { id: 'team-1' } }), res, jest.fn());
      expect(logMock).toHaveBeenCalledWith('actor-1', 'DELETE', 'Team', 'team-1');
    });
  });

  describe('ClientController', () => {
    it('store registra CREATE Client', async () => {
      clientServiceMock.create.mockResolvedValue({ id: 'client-new' } as any);
      const res = makeRes();
      await clientController.store(makeReq({ body: { name: 'x' } }), res, jest.fn());
      expect(logMock).toHaveBeenCalledWith('actor-1', 'CREATE', 'Client', 'client-new');
    });

    it('update registra UPDATE Client', async () => {
      clientServiceMock.update.mockResolvedValue({ id: 'client-1' } as any);
      const res = makeRes();
      await clientController.update(makeReq({ params: { id: 'client-1' } }), res, jest.fn());
      expect(logMock).toHaveBeenCalledWith('actor-1', 'UPDATE', 'Client', 'client-1');
    });

    it('destroy registra DELETE Client', async () => {
      clientServiceMock.delete.mockResolvedValue({} as any);
      const res = makeRes();
      await clientController.destroy(makeReq({ params: { id: 'client-1' } }), res, jest.fn());
      expect(logMock).toHaveBeenCalledWith('actor-1', 'DELETE', 'Client', 'client-1');
    });
  });

  describe('AuthController.logout', () => {
    it('registra LOGOUT no audit log e responde 204', async () => {
      const controller = new AuthController();
      const res = makeRes();
      await controller.logout(makeReq(), res, jest.fn());

      expect(logMock).toHaveBeenCalledWith('actor-1', 'LOGOUT', 'User', 'actor-1');
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });
});
