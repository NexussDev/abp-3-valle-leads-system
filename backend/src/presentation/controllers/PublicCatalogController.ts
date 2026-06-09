import { Request, Response, NextFunction } from 'express';
import vehicleListingRepository from '../../infrastructure/repositories/VehicleListingRepository';
import { Car } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';

const PUBLIC_CACHE_SECONDS = 60;

interface PublicListingDTO {
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
  badge: string | null;
}

function toPublicDTO(car: Car): PublicListingDTO {
  return {
    id: car.id,
    brand: car.brand,
    model: car.model,
    year: car.year,
    price: car.price ? car.price.toString() : null,
    km: car.km,
    fuel: car.fuel,
    transmission: car.transmission,
    category: car.category,
    color: car.color,
    description: car.description,
    photoUrl: car.photoUrl,
    badge: car.badge,
  };
}

class PublicCatalogController {
  async index(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cars = await vehicleListingRepository.findPublicCatalog();
      res.set('Cache-Control', `public, max-age=${PUBLIC_CACHE_SECONDS}`);
      res.status(200).json(cars.map(toPublicDTO));
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const car = await vehicleListingRepository.findPublicById(req.params['id'] as string);
      if (!car) throw new AppError('Veículo não encontrado.', 404);
      res.set('Cache-Control', `public, max-age=${PUBLIC_CACHE_SECONDS}`);
      res.status(200).json(toPublicDTO(car));
    } catch (error) {
      next(error);
    }
  }
}

export default new PublicCatalogController();
