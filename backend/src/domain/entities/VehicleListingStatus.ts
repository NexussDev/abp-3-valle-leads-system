import { AppError } from '../../shared/errors/AppError';

export const LISTING_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'SOLD'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

const VALID_TRANSITIONS: Record<ListingStatus, ListingStatus[]> = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['SOLD'],
  REJECTED: ['PENDING'],
  SOLD: [],
};

export function isValidListingStatus(value: unknown): value is ListingStatus {
  return typeof value === 'string' && (LISTING_STATUSES as readonly string[]).includes(value);
}

export function assertCanTransition(from: string | null, to: ListingStatus): void {
  if (!isValidListingStatus(from)) {
    throw new AppError('Publicação em estado inválido para transição.', 400);
  }
  if (!VALID_TRANSITIONS[from].includes(to)) {
    throw new AppError(
      `Transição ${from} -> ${to} não é permitida.`,
      400,
    );
  }
}

export const FUELS = ['Flex', 'Gasolina', 'Diesel', 'Híbrido', 'Elétrico'] as const;
export type Fuel = (typeof FUELS)[number];

export const TRANSMISSIONS = ['Automático', 'Manual', 'CVT'] as const;
export type Transmission = (typeof TRANSMISSIONS)[number];

export const CATEGORIES = ['suv', 'sedan', 'hatch', 'pickup'] as const;
export type Category = (typeof CATEGORIES)[number];

export const BADGES = ['novo', 'destaque', 'oferta'] as const;
export type Badge = (typeof BADGES)[number];
