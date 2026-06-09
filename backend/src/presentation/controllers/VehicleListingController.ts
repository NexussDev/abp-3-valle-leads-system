import { Request, Response, NextFunction } from 'express';
import vehicleListingService, {
  CreateListingInput,
  UpdateListingInput,
  ListFilterInput,
} from '../../application/services/VehicleListingService';
import { ListingStatus, LISTING_STATUSES } from '../../domain/entities/VehicleListingStatus';
import { AppError } from '../../shared/errors/AppError';

class VehicleListingController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, mine, brand, category } = req.query as Record<string, string | undefined>;

      const filter: ListFilterInput = {};

      if (status) {
        if (!(LISTING_STATUSES as readonly string[]).includes(status)) {
          throw new AppError(`status inválido. Valores: ${LISTING_STATUSES.join(', ')}.`, 400);
        }
        filter.status = status as ListingStatus;
      }
      if (mine === 'true') filter.mine = true;
      if (brand)           filter.brand = brand;
      if (category)        filter.category = category;

      const listings = await vehicleListingService.findAll(req.user!, filter);
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const listing = await vehicleListingService.findById(req.params['id'] as string, req.user!);
      res.status(200).json(listing);
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateListingInput = {
        brand: req.body.brand,
        model: req.body.model,
        year: Number(req.body.year),
        price: Number(req.body.price),
        km: Number(req.body.km),
        category: req.body.category,
        fuel: req.body.fuel,
        transmission: req.body.transmission,
        color: req.body.color,
        description: req.body.description,
        photoUrl: req.body.photoUrl,
        badge: req.body.badge,
      };

      const listing = await vehicleListingService.create(req.user!, input);
      res.status(201).json(listing);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: UpdateListingInput = {};
      const fields = [
        'brand', 'model', 'year', 'price', 'km',
        'category', 'fuel', 'transmission', 'color',
        'description', 'photoUrl', 'badge',
      ] as const;

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          if (field === 'year' || field === 'price' || field === 'km') {
            (input as Record<string, unknown>)[field] = Number(req.body[field]);
          } else {
            (input as Record<string, unknown>)[field] = req.body[field];
          }
        }
      }

      const listing = await vehicleListingService.update(
        req.params['id'] as string,
        req.user!,
        input,
      );
      res.status(200).json(listing);
    } catch (error) {
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const listing = await vehicleListingService.approve(req.params['id'] as string, req.user!);
      res.status(200).json(listing);
    } catch (error) {
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reason = (req.body?.reason ?? '') as string;
      const listing = await vehicleListingService.reject(
        req.params['id'] as string,
        req.user!,
        reason,
      );
      res.status(200).json(listing);
    } catch (error) {
      next(error);
    }
  }

  async markSold(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const listing = await vehicleListingService.markSold(req.params['id'] as string, req.user!);
      res.status(200).json(listing);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await vehicleListingService.delete(req.params['id'] as string, req.user!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new VehicleListingController();
