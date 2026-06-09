import logRepository, { LogFilter } from '../../infrastructure/repositories/LogRepository';
import { AppError } from '../../shared/errors/AppError';

export interface FindLogsOptions {
  limit?: number;
  offset?: number;
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  storeId?: string;
}

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 100;

class LogService {
  async log(userId: string, action: string, entity: string, entityId?: string): Promise<void> {
    try {
      await logRepository.create({ userId, action, entity, entityId });
    } catch {
      // Silent — log failure must never break the main operation
    }
  }

  async findAll(options: FindLogsOptions = {}) {
    const filter: LogFilter = {};
    if (options.userId)    filter.userId    = options.userId;
    if (options.action)    filter.action    = options.action;
    if (options.entity)    filter.entity    = options.entity;
    if (options.entityId)  filter.entityId  = options.entityId;
    if (options.startDate) filter.startDate = options.startDate;
    if (options.endDate)   filter.endDate   = options.endDate;
    if (options.storeId) filter.storeId = options.storeId;

    if (filter.startDate && filter.endDate && filter.startDate > filter.endDate) {
      throw new AppError('startDate não pode ser maior que endDate', 400);
    }

    const limit = clamp(options.limit ?? DEFAULT_LIMIT, 1, MAX_LIMIT);
    const offset = Math.max(options.offset ?? 0, 0);

    const [logs, total] = await Promise.all([
      logRepository.findAll({ limit, offset, filter }),
      logRepository.count(filter),
    ]);

    return { logs, total, limit, offset };
  }
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export default new LogService();
