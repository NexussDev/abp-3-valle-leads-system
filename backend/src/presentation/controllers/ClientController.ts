import { Request, Response, NextFunction } from 'express';
import clientService from '../../application/services/ClientService';

class ClientController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clients = await clientService.findAll();
      res.status(200).json(clients);
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientService.findById(req.params['id'] as string);
      res.status(200).json(client);
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientService.create(req.body);
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientService.update(req.params['id'] as string, req.body);
      res.status(200).json(client);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await clientService.delete(req.params['id'] as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ClientController();
