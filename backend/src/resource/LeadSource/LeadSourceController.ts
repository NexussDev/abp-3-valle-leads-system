import { Request, Response, NextFunction } from 'express';
import leadSourceService from './LeadSourceService';

class LeadSourceController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sources = await leadSourceService.findAll();
      res.status(200).json(sources);
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const source = await leadSourceService.findById(id);
      res.status(200).json(source);
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const source = await leadSourceService.create(req.body);
      res.status(201).json(source);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const source = await leadSourceService.update(id, req.body);
      res.status(200).json(source);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await leadSourceService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new LeadSourceController();