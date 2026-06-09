import { Car, Prisma } from '@prisma/client';
import vehicleListingRepository, {
  ListingFilter,
} from '../../infrastructure/repositories/VehicleListingRepository';
import logService from './LogService';
import { AppError } from '../../shared/errors/AppError';
import { AuthUser, Role } from '../../shared/types';
import {
  assertCanTransition,
  Badge,
  BADGES,
  CATEGORIES,
  FUELS,
  ListingStatus,
  TRANSMISSIONS,
} from '../../domain/entities/VehicleListingStatus';

const MAX_PENDING_PER_USER = 10;
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1990;
const MAX_PRICE = 9_999_999.99;
const MAX_KM = 999_999;

export interface CreateListingInput {
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  category: string;
  fuel?: string;
  transmission?: string;
  color?: string;
  description?: string;
  photoUrl?: string | null;
  badge?: string | null;
}

export interface UpdateListingInput {
  brand?: string;
  model?: string;
  year?: number;
  price?: number;
  km?: number;
  category?: string;
  fuel?: string;
  transmission?: string;
  color?: string;
  description?: string | null;
  photoUrl?: string | null;
  badge?: string | null;
}

export interface ListFilterInput {
  status?: ListingStatus;
  mine?: boolean;
  brand?: string;
  category?: string;
}

class VehicleListingService {
  async findAll(user: AuthUser, input: ListFilterInput = {}): Promise<Car[]> {
    const filter: ListingFilter = { excludeNullStatus: true };

    if (input.status)   filter.status   = input.status;
    if (input.brand)    filter.brand    = input.brand;
    if (input.category) filter.category = input.category;

    if (input.mine) {
      filter.publishedById = user.id;
    } else {
      this.applyScope(user, filter);
    }

    return vehicleListingRepository.findAll(filter);
  }

  async findById(id: string, user: AuthUser): Promise<Car> {
    const listing = await vehicleListingRepository.findById(id);
    if (!listing || !listing.listingStatus) {
      throw new AppError('Publicação não encontrada', 404);
    }
    this.assertCanAccess(user, listing);
    return listing;
  }

  async create(user: AuthUser, input: CreateListingInput): Promise<Car> {
    if (!user.teamId) {
      throw new AppError('Usuário sem equipe não pode publicar veículos.', 400);
    }

    this.validateCommonFields(input);

    const pending = await vehicleListingRepository.countPendingByUser(user.id);
    if (pending >= MAX_PENDING_PER_USER) {
      throw new AppError(
        `Limite de ${MAX_PENDING_PER_USER} publicações pendentes atingido.`,
        429,
      );
    }

    const created = await vehicleListingRepository.create({
      brand: input.brand,
      model: input.model,
      year: input.year,
      price: new Prisma.Decimal(input.price),
      km: input.km,
      category: input.category,
      fuel: input.fuel ?? null,
      transmission: input.transmission ?? null,
      color: input.color ?? null,
      description: input.description ?? null,
      photoUrl: input.photoUrl ?? null,
      badge: (input.badge as Badge | null | undefined) ?? null,
      listingStatus: 'PENDING',
      publishedAt: new Date(),
      publishedBy:   { connect: { id: user.id } },
      publishedTeam: { connect: { id: user.teamId } },
    });

    await logService.log(user.id, 'CREATE', 'VEHICLE_LISTING', created.id);
    return created;
  }

  async update(id: string, user: AuthUser, input: UpdateListingInput): Promise<Car> {
    const existing = await this.findById(id, user);

    this.assertCanEdit(user, existing);
    this.validateCommonFields(input, true);

    const data: Prisma.CarUpdateInput = {};
    if (input.brand        !== undefined) data.brand        = input.brand;
    if (input.model        !== undefined) data.model        = input.model;
    if (input.year         !== undefined) data.year         = input.year;
    if (input.price        !== undefined) data.price        = new Prisma.Decimal(input.price);
    if (input.km           !== undefined) data.km           = input.km;
    if (input.category     !== undefined) data.category     = input.category;
    if (input.fuel         !== undefined) data.fuel         = input.fuel;
    if (input.transmission !== undefined) data.transmission = input.transmission;
    if (input.color        !== undefined) data.color        = input.color;
    if (input.description  !== undefined) data.description  = input.description;
    if (input.photoUrl     !== undefined) data.photoUrl     = input.photoUrl;
    if (input.badge        !== undefined) data.badge        = input.badge;

    if (existing.listingStatus === 'REJECTED') {
      data.listingStatus   = 'PENDING';
      data.rejectionReason = null;
    }

    const updated = await vehicleListingRepository.update(id, data);
    await logService.log(user.id, 'UPDATE', 'VEHICLE_LISTING', id);
    return updated;
  }

  async approve(id: string, user: AuthUser): Promise<Car> {
    this.assertModerator(user);
    const existing = await this.findById(id, user);
    assertCanTransition(existing.listingStatus, 'APPROVED');

    const updated = await vehicleListingRepository.transitionStatus(id, 'PENDING', {
      listingStatus: 'APPROVED',
      approvedAt: new Date(),
      approvedById: user.id,
    });

    if (!updated) {
      throw new AppError('Publicação já foi moderada por outro usuário.', 409);
    }

    await logService.log(user.id, 'APPROVE', 'VEHICLE_LISTING', id);
    return updated;
  }

  async reject(id: string, user: AuthUser, reason: string): Promise<Car> {
    this.assertModerator(user);
    if (!reason || !reason.trim() || reason.length > 255) {
      throw new AppError('Motivo da rejeição é obrigatório (até 255 caracteres).', 400);
    }
    const existing = await this.findById(id, user);
    assertCanTransition(existing.listingStatus, 'REJECTED');

    const updated = await vehicleListingRepository.transitionStatus(id, 'PENDING', {
      listingStatus: 'REJECTED',
      rejectionReason: reason.trim(),
    });

    if (!updated) {
      throw new AppError('Publicação já foi moderada por outro usuário.', 409);
    }

    await logService.log(user.id, 'REJECT', 'VEHICLE_LISTING', id);
    return updated;
  }

  async markSold(id: string, user: AuthUser): Promise<Car> {
    this.assertModerator(user);
    const existing = await this.findById(id, user);
    assertCanTransition(existing.listingStatus, 'SOLD');

    const updated = await vehicleListingRepository.transitionStatus(id, 'APPROVED', {
      listingStatus: 'SOLD',
    });

    if (!updated) {
      throw new AppError('Estado da publicação mudou antes da operação.', 409);
    }

    await logService.log(user.id, 'SOLD', 'VEHICLE_LISTING', id);
    return updated;
  }

  async delete(id: string, user: AuthUser): Promise<void> {
    const existing = await this.findById(id, user);
    this.assertCanEdit(user, existing);

    if (existing.listingStatus === 'PENDING' || existing.listingStatus === 'REJECTED') {
      await vehicleListingRepository.delete(id);
    } else {
      throw new AppError(
        'Publicações aprovadas ou vendidas não podem ser excluídas — use "Marcar como vendido".',
        400,
      );
    }

    await logService.log(user.id, 'DELETE', 'VEHICLE_LISTING', id);
  }

  // ── Scoping & permissões ──────────────────────────────────────────────────

  private applyScope(user: AuthUser, filter: ListingFilter): void {
    if (user.role === Role.ADMIN || user.role === Role.GERENTE_GERAL) return;

    if (user.role === Role.ATENDENTE) {
      filter.publishedById = user.id;
      return;
    }

    if (user.role === Role.LIDER_EQUIPE || user.role === Role.GERENTE) {
      if (!user.teamId) {
        throw new AppError('Usuário sem equipe.', 403);
      }
      filter.publishedTeamId = user.teamId;
    }
  }

  private assertCanAccess(
    user: AuthUser,
    listing: { publishedById: string | null; publishedTeamId: string | null },
  ): void {
    if (user.role === Role.ADMIN || user.role === Role.GERENTE_GERAL) return;

    if (user.role === Role.ATENDENTE) {
      if (listing.publishedById !== user.id) {
        throw new AppError('Acesso negado a esta publicação.', 403);
      }
      return;
    }

    if (user.role === Role.LIDER_EQUIPE || user.role === Role.GERENTE) {
      if (!user.teamId || listing.publishedTeamId !== user.teamId) {
        throw new AppError('Acesso negado a esta publicação.', 403);
      }
      return;
    }

    throw new AppError('Acesso negado a esta publicação.', 403);
  }

  private assertCanEdit(
    user: AuthUser,
    listing: Car,
  ): void {
    const isModerator =
      user.role === Role.GERENTE ||
      user.role === Role.GERENTE_GERAL ||
      user.role === Role.ADMIN;

    const isOwner = listing.publishedById === user.id;

    if (!isOwner && !isModerator) {
      throw new AppError('Sem permissão para editar esta publicação.', 403);
    }

    if (
      isOwner &&
      !isModerator &&
      listing.listingStatus !== 'PENDING' &&
      listing.listingStatus !== 'REJECTED'
    ) {
      throw new AppError(
        'Publicações aprovadas só podem ser editadas pelo gerente.',
        403,
      );
    }
  }

  private assertModerator(user: AuthUser): void {
    if (
      user.role !== Role.GERENTE &&
      user.role !== Role.GERENTE_GERAL &&
      user.role !== Role.ADMIN
    ) {
      throw new AppError('Apenas gerentes podem moderar publicações.', 403);
    }
  }

  // ── Validação ─────────────────────────────────────────────────────────────

  private validateCommonFields(
    input: Partial<CreateListingInput> | UpdateListingInput,
    partial = false,
  ): void {
    const required = ['brand', 'model', 'year', 'price', 'km', 'category'] as const;
    if (!partial) {
      for (const field of required) {
        if (input[field] === undefined || input[field] === null || input[field] === '') {
          throw new AppError(`Campo "${field}" é obrigatório.`, 400);
        }
      }
    }

    if (input.brand !== undefined && (input.brand.length < 1 || input.brand.length > 50)) {
      throw new AppError('brand deve ter entre 1 e 50 caracteres.', 400);
    }
    if (input.model !== undefined && (input.model.length < 1 || input.model.length > 50)) {
      throw new AppError('model deve ter entre 1 e 50 caracteres.', 400);
    }
    if (input.year !== undefined && (input.year < MIN_YEAR || input.year > CURRENT_YEAR + 1)) {
      throw new AppError(`year deve estar entre ${MIN_YEAR} e ${CURRENT_YEAR + 1}.`, 400);
    }
    if (input.price !== undefined && (input.price <= 0 || input.price > MAX_PRICE)) {
      throw new AppError(`price deve ser > 0 e <= ${MAX_PRICE}.`, 400);
    }
    if (input.km !== undefined && (input.km < 0 || input.km > MAX_KM)) {
      throw new AppError(`km deve estar entre 0 e ${MAX_KM}.`, 400);
    }
    if (input.category !== undefined && !(CATEGORIES as readonly string[]).includes(input.category)) {
      throw new AppError(`category inválido. Valores: ${CATEGORIES.join(', ')}.`, 400);
    }
    if (input.fuel !== undefined && input.fuel !== null && !(FUELS as readonly string[]).includes(input.fuel)) {
      throw new AppError(`fuel inválido. Valores: ${FUELS.join(', ')}.`, 400);
    }
    if (
      input.transmission !== undefined &&
      input.transmission !== null &&
      !(TRANSMISSIONS as readonly string[]).includes(input.transmission)
    ) {
      throw new AppError(`transmission inválido. Valores: ${TRANSMISSIONS.join(', ')}.`, 400);
    }
    if (input.badge !== undefined && input.badge !== null && !(BADGES as readonly string[]).includes(input.badge)) {
      throw new AppError(`badge inválido. Valores: ${BADGES.join(', ')}.`, 400);
    }
    if (input.description !== undefined && input.description !== null && input.description.length > 500) {
      throw new AppError('description deve ter no máximo 500 caracteres.', 400);
    }
    if (input.photoUrl !== undefined && input.photoUrl !== null && !/^https:\/\//.test(input.photoUrl)) {
      throw new AppError('photoUrl deve começar com https://.', 400);
    }
  }
}

export default new VehicleListingService();
