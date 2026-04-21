import { Request, Response } from 'express';
import { LoginService } from '../../resource/Login/LoginService';
import UserRepository from '../../infrastructure/repositories/UserRepository';
export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const loginService = new LoginService(UserRepository);

    const result = await loginService.execute(email, password);

    return res.status(200).json(result);
  }
}