import { Request, Response, NextFunction } from 'express';
import logService, { FindLogsOptions } from '../../application/services/LogService';
import { AppError } from '../../shared/errors/AppError';

class LogController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, action, entity, entityId, startDate, endDate, limit, offset } =
        req.query as Record<string, string | undefined>;

      const options: FindLogsOptions = {};

      if (userId)   options.userId   = userId;
      if (action)   options.action   = action;
      if (entity)   options.entity   = entity;
      if (entityId) options.entityId = entityId;

      if (startDate) options.startDate = parseDate(startDate, 'startDate');
      if (endDate) options.endDate = parseDate(endDate, 'endDate');

      if (limit !== undefined) options.limit = parseIntOrThrow(limit, 'limit');
      if (offset !== undefined) options.offset = parseIntOrThrow(offset, 'offset');

      const result = await logService.findAll(options);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

function parseDate(value: string, field: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${field} inválido (esperado ISO 8601)`, 400);
  }
  return date;
}

function parseIntOrThrow(value: string, field: string): number {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) {
    throw new AppError(`${field} inválido (esperado inteiro não-negativo)`, 400);
  }
  return n;
}

export default new LogController();
