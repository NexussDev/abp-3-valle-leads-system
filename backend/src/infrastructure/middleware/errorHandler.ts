import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
    return;
  }

  console.error('[ERROR]', error);
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}
