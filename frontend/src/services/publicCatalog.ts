import axios from 'axios';
import type { PublicVehicle } from '../types/VehicleListing';

const PUBLIC_BASE =
  (import.meta.env.VITE_PUBLIC_API_URL as string | undefined) ??
  'http://localhost:3000/public';

const publicClient = axios.create({
  baseURL: PUBLIC_BASE,
  timeout: 5000,
});

export async function getPublicCatalog(): Promise<PublicVehicle[]> {
  const { data } = await publicClient.get<PublicVehicle[]>('/catalog');
  return data;
}

export async function getPublicVehicle(id: string): Promise<PublicVehicle> {
  const { data } = await publicClient.get<PublicVehicle>(`/catalog/${id}`);
  return data;
}
