import { Request, Response, NextFunction } from 'express';
import teamService from '../../application/services/TeamService';

class TeamController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teams = await teamService.findAll();
      res.status(200).json(teams);
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const team = await teamService.findById(req.params['id'] as string);
      res.status(200).json(team);
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const team = await teamService.create(req.body);
      res.status(201).json(team);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const team = await teamService.update(req.params['id'] as string, req.body);
      res.status(200).json(team);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await teamService.delete(req.params['id'] as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new TeamController();
