import { Request, Response, NextFunction } from 'express';

export function roleMiddleware(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não autenticado',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso negado',
      });
    }

    next();
  };
}