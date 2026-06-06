import { Request, Response, NextFunction } from 'express';
import { LoginService } from '../../application/services/LoginService';
import UserRepository from '../../infrastructure/repositories/UserRepository';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body ?? {};

      const loginService = new LoginService(UserRepository);
      const result = await loginService.execute(email, password);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
