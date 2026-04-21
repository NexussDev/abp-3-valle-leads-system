import { Request, Response, NextFunction } from 'express';
import userService from './UserService';

class UserController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.findAll();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await userService.findById(id);
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await userService.update(id, req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await userService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
