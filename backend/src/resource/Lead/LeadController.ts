import { Request, Response, NextFunction } from 'express';
import leadService from './LeadService';

class LeadController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const leads = await leadService.findAll();
      res.status(200).json(leads);
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const lead = await leadService.findById(id);
      res.status(200).json(lead);
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await leadService.create(req.body);
      res.status(201).json(lead);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const lead = await leadService.update(id, req.body);
      res.status(200).json(lead);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await leadService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async updateStage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { stage } = req.body ?? {};
      const lead = await leadService.updateStage(id, stage);
      res.status(200).json(lead);
    } catch (error) {
      next(error);
    }
  }
}

export default new LeadController();
