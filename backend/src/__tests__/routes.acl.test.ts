import { Request, Response, NextFunction, RequestHandler, Router } from 'express';
import { Role, AuthUser } from '../shared/types';

import teamRoutes from '../presentation/routes/teamRoutes';
import clientRoutes from '../presentation/routes/clientRoutes';

interface RouteLayer {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: { name: string; handle: RequestHandler }[];
  };
}

function findRouteMiddlewares(
  router: Router,
  method: string,
  path: string,
): RequestHandler[] {
  const stack = (router as unknown as { stack: RouteLayer[] }).stack;
  const layer = stack.find(
    (l) => l.route?.path === path && l.route?.methods[method] === true,
  );
  if (!layer?.route) throw new Error(`Rota ${method.toUpperCase()} ${path} não encontrada`);
  return layer.route.stack.map((s) => s.handle);
}

function runMiddleware(handler: RequestHandler, user: AuthUser | undefined) {
  const req = { user } as unknown as Request;
  let statusCode = 200;
  let nextCalled = false;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json: () => undefined,
  } as unknown as Response;
  const next: NextFunction = () => {
    nextCalled = true;
  };
  handler(req, res, next);
  return { nextCalled, statusCode };
}

function makeUser(role: Role): AuthUser {
  return { id: 'u', role, teamId: 't', storeId: 's' };
}

/**
 * Executa todos os middlewares da rota (menos o último, que é o
 * controller) e devolve o resultado do primeiro que bloqueia ou
 * `{ nextCalled: true }` se todos passaram.
 */
function runRouteGuards(router: Router, method: string, path: string, user: AuthUser) {
  const handlers = findRouteMiddlewares(router, method, path);
  const guards = handlers.slice(0, -1);
  for (const guard of guards) {
    const result = runMiddleware(guard, user);
    if (!result.nextCalled) return result;
  }
  return { nextCalled: true, statusCode: 200 };
}

describe('ACL das rotas — permissões indevidas do GERENTE_GERAL removidas', () => {
  describe('POST /teams (criação de equipe)', () => {
    it('ADMIN passa pelos guards', () => {
      const r = runRouteGuards(teamRoutes, 'post', '/', makeUser(Role.ADMIN));
      expect(r.nextCalled).toBe(true);
    });

    it('GERENTE_GERAL é bloqueado com 403', () => {
      const r = runRouteGuards(teamRoutes, 'post', '/', makeUser(Role.GERENTE_GERAL));
      expect(r.nextCalled).toBe(false);
      expect(r.statusCode).toBe(403);
    });

    it('GERENTE é bloqueado com 403', () => {
      const r = runRouteGuards(teamRoutes, 'post', '/', makeUser(Role.GERENTE));
      expect(r.nextCalled).toBe(false);
      expect(r.statusCode).toBe(403);
    });
  });

  describe('PUT /teams/:id (atualização de equipe)', () => {
    it('ADMIN passa pelos guards', () => {
      const r = runRouteGuards(teamRoutes, 'put', '/:id', makeUser(Role.ADMIN));
      expect(r.nextCalled).toBe(true);
    });

    it('GERENTE_GERAL é bloqueado com 403', () => {
      const r = runRouteGuards(teamRoutes, 'put', '/:id', makeUser(Role.GERENTE_GERAL));
      expect(r.nextCalled).toBe(false);
      expect(r.statusCode).toBe(403);
    });
  });

  describe('DELETE /teams/:id (exclusão de equipe)', () => {
    it('só ADMIN passa', () => {
      expect(runRouteGuards(teamRoutes, 'delete', '/:id', makeUser(Role.ADMIN)).nextCalled).toBe(true);
      expect(runRouteGuards(teamRoutes, 'delete', '/:id', makeUser(Role.GERENTE_GERAL)).nextCalled).toBe(false);
    });
  });

  describe('DELETE /clients/:id (exclusão de cliente)', () => {
    it('ADMIN passa pelos guards', () => {
      const r = runRouteGuards(clientRoutes, 'delete', '/:id', makeUser(Role.ADMIN));
      expect(r.nextCalled).toBe(true);
    });

    it('GERENTE_GERAL é bloqueado com 403', () => {
      const r = runRouteGuards(clientRoutes, 'delete', '/:id', makeUser(Role.GERENTE_GERAL));
      expect(r.nextCalled).toBe(false);
      expect(r.statusCode).toBe(403);
    });
  });
});
