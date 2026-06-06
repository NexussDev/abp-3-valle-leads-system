import { Request, Response, NextFunction } from 'express';
import { LoginService } from '../../application/services/LoginService';
import UserRepository from '../../infrastructure/repositories/UserRepository';
import logService from '../../application/services/LogService';

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const loginService = new LoginService(UserRepository);

    const result = await loginService.execute(email, password);

    return res.status(200).json(result);
  }

  /**
   * O JWT é stateless — não há lista de tokens revogados.
   * Este endpoint serve apenas para registrar a intenção de logout
   * no audit log. O cliente deve descartar o token localmente.
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await logService.log(userId, 'LOGOUT', 'User', userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
