import prisma from '../database/prisma';
import { Car, Prisma } from '@prisma/client';
import { ListingStatus } from '../../domain/entities/VehicleListingStatus';

const LISTING_INCLUDE = {
  publishedBy:   { select: { id: true, name: true, email: true, role: true } },
  approvedBy:    { select: { id: true, name: true, email: true } },
  publishedTeam: { select: { id: true, name: true } },
};

export interface ListingFilter {
  status?: ListingStatus | ListingStatus[];
  publishedById?: string;
  publishedTeamId?: string;
  brand?: string;
  category?: string;
  excludeNullStatus?: boolean;
}

class VehicleListingRepository {
  async findAll(filter: ListingFilter = {}): Promise<Car[]> {
    const where: Prisma.CarWhereInput = {};

    if (filter.status) {
      where.listingStatus = Array.isArray(filter.status)
        ? { in: filter.status }
        : filter.status;
    } else if (filter.excludeNullStatus) {
      where.listingStatus = { not: null };
    }

    if (filter.publishedById)   where.publishedById   = filter.publishedById;
    if (filter.publishedTeamId) where.publishedTeamId = filter.publishedTeamId;
    if (filter.brand)           where.brand           = { equals: filter.brand, mode: 'insensitive' };
    if (filter.category)        where.category        = filter.category;

    return prisma.car.findMany({
      where,
      include: LISTING_INCLUDE,
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Car | null> {
    return prisma.car.findUnique({ where: { id }, include: LISTING_INCLUDE });
  }

  async findPublicCatalog(): Promise<Car[]> {
    return prisma.car.findMany({
      where: { listingStatus: 'APPROVED' },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    });
  }

  async findPublicById(id: string): Promise<Car | null> {
    return prisma.car.findFirst({
      where: { id, listingStatus: 'APPROVED' },
    });
  }

  async countPendingByUser(userId: string): Promise<number> {
    return prisma.car.count({
      where: { publishedById: userId, listingStatus: 'PENDING' },
    });
  }

  async create(data: Prisma.CarCreateInput): Promise<Car> {
    return prisma.car.create({ data, include: LISTING_INCLUDE });
  }

  async transitionStatus(
    id: string,
    expectedStatus: ListingStatus | null,
    data: Prisma.CarUncheckedUpdateManyInput,
  ): Promise<Car | null> {
    const result = await prisma.car.updateMany({
      where: { id, listingStatus: expectedStatus },
      data,
    });
    if (result.count === 0) return null;
    return this.findById(id);
  }

  async update(id: string, data: Prisma.CarUpdateInput): Promise<Car> {
    return prisma.car.update({ where: { id }, data, include: LISTING_INCLUDE });
  }

  async delete(id: string): Promise<Car> {
    return prisma.car.delete({ where: { id } });
  }
}

export default new VehicleListingRepository();
