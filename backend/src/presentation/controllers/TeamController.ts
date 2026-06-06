import { Request, Response, NextFunction } from 'express';
import teamService from '../../application/services/TeamService';
import logService from '../../application/services/LogService';

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
      await logService.log(req.user!.id, 'CREATE', 'Team', team.id);
      res.status(201).json(team);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const team = await teamService.update(id, req.body);
      await logService.log(req.user!.id, 'UPDATE', 'Team', id);
      res.status(200).json(team);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      await teamService.delete(id);
      await logService.log(req.user!.id, 'DELETE', 'Team', id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new TeamController();
