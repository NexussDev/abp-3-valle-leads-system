import { client } from './leadsApi';
import type {
  VehicleListing,
  CreateVehicleListingInput,
  UpdateVehicleListingInput,
  ListingStatus,
} from '../types/VehicleListing';

export interface ListVehicleListingsParams {
  status?: ListingStatus;
  mine?: boolean;
  brand?: string;
  category?: string;
}

export async function listVehicleListings(
  params: ListVehicleListingsParams = {},
): Promise<VehicleListing[]> {
  const query: Record<string, string> = {};
  if (params.status)   query.status   = params.status;
  if (params.mine)     query.mine     = 'true';
  if (params.brand)    query.brand    = params.brand;
  if (params.category) query.category = params.category;

  const { data } = await client.get<VehicleListing[]>('/vehicle-listings', { params: query });
  return data;
}

export async function getVehicleListing(id: string): Promise<VehicleListing> {
  const { data } = await client.get<VehicleListing>(`/vehicle-listings/${id}`);
  return data;
}

export async function createVehicleListing(
  input: CreateVehicleListingInput,
): Promise<VehicleListing> {
  const { data } = await client.post<VehicleListing>('/vehicle-listings', input);
  return data;
}

export async function updateVehicleListing(
  id: string,
  input: UpdateVehicleListingInput,
): Promise<VehicleListing> {
  const { data } = await client.patch<VehicleListing>(`/vehicle-listings/${id}`, input);
  return data;
}

export async function approveVehicleListing(id: string): Promise<VehicleListing> {
  const { data } = await client.patch<VehicleListing>(`/vehicle-listings/${id}/approve`);
  return data;
}

export async function rejectVehicleListing(
  id: string,
  reason: string,
): Promise<VehicleListing> {
  const { data } = await client.patch<VehicleListing>(
    `/vehicle-listings/${id}/reject`,
    { reason },
  );
  return data;
}

export async function markVehicleListingSold(id: string): Promise<VehicleListing> {
  const { data } = await client.patch<VehicleListing>(`/vehicle-listings/${id}/sold`);
  return data;
}

export async function deleteVehicleListing(id: string): Promise<void> {
  await client.delete(`/vehicle-listings/${id}`);
}
