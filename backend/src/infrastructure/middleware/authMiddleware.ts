import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../../shared/types';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ status: 'error', message: 'Token não informado' });
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ status: 'error', message: 'Token inválido' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ status: 'error', message: 'Configuração de servidor inválida' });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === 'string' || !decoded.sub || !decoded.role) {
      return res.status(401).json({ status: 'error', message: 'Token inválido' });
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role as Role,
      teamId: (decoded.teamId as string | null) ?? null,
    };

    next();
  } catch {
    return res.status(401).json({ status: 'error', message: 'Token inválido ou expirado' });
  }
}
