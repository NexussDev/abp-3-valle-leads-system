import prisma from '../database/prisma';
import { Prisma } from '@prisma/client';

export interface LogFilter {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}

class LogRepository {
  async create(data: { userId: string; action: string; entity: string; entityId?: string }) {
    return prisma.systemLog.create({ data });
  }

  async findAll(options: { limit?: number; offset?: number; filter?: LogFilter } = {}) {
    return prisma.systemLog.findMany({
      where: buildWhere(options.filter),
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit ?? 100,
      skip: options.offset ?? 0,
    });
  }

  async count(filter?: LogFilter) {
    return prisma.systemLog.count({ where: buildWhere(filter) });
  }
}

function buildWhere(filter?: LogFilter): Prisma.SystemLogWhereInput {
  const where: Prisma.SystemLogWhereInput = {};
  if (!filter) return where;

  if (filter.userId)   where.userId   = filter.userId;
  if (filter.action)   where.action   = filter.action;
  if (filter.entity)   where.entity   = filter.entity;
  if (filter.entityId) where.entityId = filter.entityId;

  if (filter.startDate || filter.endDate) {
    where.createdAt = {
      ...(filter.startDate && { gte: filter.startDate }),
      ...(filter.endDate && { lte: filter.endDate }),
    };
  }

  return where;
}

export default new LogRepository();
