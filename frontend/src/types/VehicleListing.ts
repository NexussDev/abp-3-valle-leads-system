export type ListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD';
export type Category = 'suv' | 'sedan' | 'hatch' | 'pickup';
export type Fuel = 'Flex' | 'Gasolina' | 'Diesel' | 'Híbrido' | 'Elétrico';
export type Transmission = 'Automático' | 'Manual' | 'CVT';
export type Badge = 'novo' | 'destaque' | 'oferta';

export const CATEGORIES: Category[] = ['suv', 'sedan', 'hatch', 'pickup'];
export const FUELS: Fuel[] = ['Flex', 'Gasolina', 'Diesel', 'Híbrido', 'Elétrico'];
export const TRANSMISSIONS: Transmission[] = ['Automático', 'Manual', 'CVT'];
export const BADGES: Badge[] = ['novo', 'destaque', 'oferta'];

export interface VehicleListing {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  price: string | number | null;
  km: number | null;
  fuel: Fuel | null;
  transmission: Transmission | null;
  category: Category | null;
  color: string | null;
  description: string | null;
  photoUrl: string | null;
  badge: Badge | null;
  listingStatus: ListingStatus | null;
  publishedAt: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  publishedBy?: { id: string; name: string; email: string; role: string } | null;
  approvedBy?: { id: string; name: string; email: string } | null;
  publishedTeam?: { id: string; name: string } | null;
}

export interface PublicVehicle {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  price: string | null;
  km: number | null;
  fuel: string | null;
  transmission: string | null;
  category: string | null;
  color: string | null;
  description: string | null;
  photoUrl: string | null;
  badge: Badge | null;
}

export interface CreateVehicleListingInput {
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  category: Category;
  fuel?: Fuel;
  transmission?: Transmission;
  color?: string;
  description?: string;
  photoUrl?: string | null;
  badge?: Badge | null;
}

export type UpdateVehicleListingInput = Partial<CreateVehicleListingInput>;
